import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { isSafeControlRelativePath } from "../control-state/contained-file.js";
import { directoryIdentity, regularFileSnapshot } from "../control-state/run-store-inspection.js";
import { parseRunState } from "../control-state/run-state-parser.js";
import { approvalSeal, artefactFileDigest, canonicalRunText, listedArtefactPaths, runSealState } from "../control-state/run-seal.js";
import { inspectSelfReferenceRecovery } from "../control-state/run-recovery.js";
import { atomicWrite, unapproveRecoveryApprovals, withRunLock, writeRunLocked, writeRunRecoveryLocked } from "../control-state/run-state-writer.js";
import { inspectControlMigration } from "./compatibility.js";

const digest = (content) => `sha256:${createHash("sha256").update(content).digest("hex")}`;
const textDigest = (content) => digest(canonicalRunText(content));
const pathError = (path) => Object.assign(new Error("AGDF_REPAIR_PATH_INVALID"), { code: "AGDF_REPAIR_PATH_INVALID", path });

function checkedPath(root, relative, { createParents = false } = {}) {
  if (!isSafeControlRelativePath(relative)) throw pathError(relative);
  try { directoryIdentity(root); } catch { throw pathError(relative); }
  let cursor = root;
  const segments = relative.split("/");
  for (const segment of segments.slice(0, -1)) {
    cursor = join(cursor, segment);
    try { directoryIdentity(cursor); } catch (error) {
      if (error.code !== "ENOENT") throw pathError(relative);
      if (!createParents) return null;
      mkdirSync(cursor, { mode: 0o700 });
      directoryIdentity(cursor);
    }
  }
  const path = join(root, relative);
  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile()) throw pathError(relative);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  return path;
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "ignore"], timeout: 3000, maxBuffer: 2 * 1024 * 1024 });
}

// Search only this checkout's current history and the exact referenced path. Git is a source
// of original bytes, never proof of a historical approval. Symlink/tree objects are not sources.
function gitOriginals(root, path) {
  if (!isSafeControlRelativePath(path)) return [];
  try {
    const top = directoryIdentity(git(root, ["rev-parse", "--show-toplevel"]).toString().trim()).realpath;
    const prefix = relative(top, directoryIdentity(root).realpath).replaceAll("\\", "/");
    const objectPath = prefix ? `${prefix}/${path}` : path;
    if (!isSafeControlRelativePath(objectPath)) return [];
    const commits = [...new Set([git(root, ["rev-parse", "HEAD"]).toString().trim(),
      ...git(root, ["log", "-8", "--format=%H", "--", path]).toString().trim().split(/\r?\n/u)])]
      .filter((commit) => /^[0-9a-f]{40,64}$/u.test(commit));
    const originals = [];
    for (const commit of commits) {
      try {
        const tree = git(root, ["ls-tree", "--full-tree", "-z", commit, "--", objectPath]).toString();
        if (!/^100(?:644|755) blob [0-9a-f]+\t/u.test(tree) || tree.slice(tree.indexOf("\t") + 1, -1) !== objectPath) continue;
        const bytes = git(root, ["show", `${commit}:${objectPath}`]);
        originals.push({ path, git_path: objectPath, source: "git", commit, digest: textDigest(bytes.toString("utf8")), bytes: bytes.toString("base64") });
      } catch { /* Missing or oversized objects require manual recovery. */ }
    }
    return originals;
  } catch { return []; }
}

function proposal(root, item, fields) {
  const proposed = { ...item, ...fields };
  proposed.artefacts = [...new Set([...item.artefacts.map((artifact) => artifact.path), ...listedArtefactPaths(proposed.candidate_content)])]
    .map((path) => { checkedPath(root, path); return { path, digest: artefactFileDigest(root, path) }; });
  return proposed;
}

function inspectRunRepair(root, run) {
  const relative = `.agdf/control/runs/${run.run_id}/RUN_STATE.md`;
  const path = checkedPath(root, relative);
  const content = regularFileSnapshot(path).content.toString("utf8");
  const parsed = parseRunState(content, run.run_id);
  const item = { run_id: run.run_id, kind: "manual", available: false, required: [], sources: [],
    source_content: content, source_digest: digest(content), source_revision_id: parsed.meta.revision_id,
    candidate_content: null, files: [], artefacts: listedArtefactPaths(content).map((path) => {
      checkedPath(root, path);
      return { path, digest: artefactFileDigest(root, path) };
    }) };
  if (!parsed.valid || parsed.meta.lifecycle !== "active" || run.pending_recoveries?.length) {
    item.required = run.diagnostics.length ? run.diagnostics : [{ code: "AGDF_REPAIR_MANUAL_REQUIRED", path: relative }];
    return item;
  }
  const seal = runSealState(root, content);
  const checkpoint = inspectSelfReferenceRecovery(root, run.run_id);
  if (checkpoint) {
    return proposal(root, item, { kind: "self_reference", available: true, candidate_content: checkpoint.content,
      sources: [{ path: relative, source: "recovery_journal", journal: checkpoint.source }] });
  }
  if (seal.status === "content_changed") {
    const original = gitOriginals(root, relative).find((candidate) => {
      const text = Buffer.from(candidate.bytes, "base64").toString("utf8");
      const state = parseRunState(text, run.run_id);
      return state.valid && state.meta.lifecycle === "active" && state.meta.revision_id === parsed.meta.revision_id
        && runSealState(root, text).status === "valid" && approvalSeal(text) === seal.recorded.approval_seal
        && listedArtefactPaths(text).every((path) => artefactFileDigest(root, path).startsWith("sha256:"));
    });
    if (original) return proposal(root, item, { kind: "run_snapshot", available: true,
      candidate_content: Buffer.from(original.bytes, "base64").toString("utf8"), sources: [original] });
  }
  if (seal.status === "unsealed") {
    for (const artifact of listedArtefactPaths(content)) {
      const target = checkedPath(root, artifact);
      const status = artefactFileDigest(root, artifact);
      if (!["missing", "unresolved"].includes(status)) continue;
      // A descriptive placeholder is not a filename; repair never invents paths or evidence.
      if (!artifact.startsWith(`.agdf/control/artefacts/${run.run_id}/`) || !isSafeControlRelativePath(artifact)) {
        item.required.push({ code: "AGDF_REPAIR_REFERENCE_REQUIRED", path: artifact });
        continue;
      }
      if (target) {
        try { lstatSync(target); item.required.push({ code: "AGDF_REPAIR_MANUAL_REQUIRED", path: artifact }); continue; }
        catch (error) { if (error.code !== "ENOENT") throw error; }
      }
      const original = gitOriginals(root, artifact)[0];
      if (original) { item.files.push(original); item.sources.push(original); }
      else item.required.push({ code: "AGDF_REPAIR_ORIGINAL_REQUIRED", path: artifact });
    }
    if (item.files.length && !item.required.length) {
      item.kind = "missing_artefacts";
      item.available = true;
      item.candidate_content = unapproveRecoveryApprovals(content);
      item.approval_reset = true;
      return proposal(root, item, {});
    }
  }
  if (!item.required.length) item.required = run.diagnostics.length ? run.diagnostics : [{ code: "AGDF_REPAIR_MANUAL_REQUIRED", path: relative }];
  return item;
}

export function inspectControlRepair(root) {
  const control = inspectControlMigration(root);
  const items = [];
  const diagnostics = [...control.diagnostics];
  // An incomplete inventory or unsafe scaffold cannot authorize repair writes.
  if (!diagnostics.length) for (const run of control.runs.filter((entry) => entry.status === "repair_required")) {
    try { items.push(inspectRunRepair(root, run)); } catch (error) {
      items.push({ run_id: run.run_id, kind: "manual", available: false, files: [], sources: [],
        required: [{ code: String(error.code ?? error.message), ...(error.path ? { path: error.path } : {}) }] });
    }
  }
  return { target: root, control, items, diagnostics, authorizes: false };
}

function publicRepair(plan, status) {
  return { status, target: plan.target, authorizes: false, diagnostics: plan.diagnostics,
    items: plan.items.map(({ run_id, kind, available, required, sources, outcome, backup }) => ({
      run_id, kind, available, required,
      sources: sources.map(({ bytes, ...source }) => source), ...(outcome ? { outcome, backup } : {}),
    })) };
}

function applyRunRepair(root, item, hooks = {}) {
  const relative = `.agdf/control/runs/${item.run_id}/RUN_STATE.md`;
  const path = checkedPath(root, relative);
  return withRunLock(path, () => {
    if (regularFileSnapshot(path).content.toString("utf8") !== item.source_content) throw new Error("AGDF_STALE_RUN_REVISION");
    // Re-read the selected source under the lock; callback mutation and source changes cannot
    // replace the displayed restoration with another snapshot or a newly found original.
    const run = inspectControlMigration(root).runs.find((entry) => entry.run_id === item.run_id);
    if (!run || run.status !== "repair_required") throw new Error("AGDF_STALE_RUN_REVISION");
    const current = inspectRunRepair(root, run);
    if (JSON.stringify(current) !== JSON.stringify(item)) throw new Error("AGDF_STALE_RUN_REVISION");
    const directory = join(dirname(path), "repair-previews");
    try { mkdirSync(directory, { mode: 0o700 }); } catch (error) { if (error.code !== "EEXIST") throw error; }
    directoryIdentity(directory);
    if (process.platform !== "win32" && (lstatSync(directory).mode & 0o077)) throw new Error("AGDF_RECOVERY_JOURNAL_PERMISSIONS_INVALID");
    const id = randomUUID();
    const journalPath = join(directory, `${id}.json`);
    const updatedAt = new Date().toISOString();
    const nextRevisionId = randomUUID();
    const journal = { schema_version: 1, phase: "prepared", created_at: updatedAt, run_id: item.run_id,
      source_content: item.source_content, source_digest: item.source_digest, sources: item.sources,
      files: item.files, candidate_content: item.candidate_content, next_revision_id: nextRevisionId };
    atomicWrite(journalPath, `${JSON.stringify(journal, null, 2)}\n`);
    const restored = [];
    try {
      for (const file of item.files) {
        const target = checkedPath(root, file.path, { createParents: true });
        try { lstatSync(target); throw new Error("AGDF_STALE_RUN_REVISION"); }
        catch (error) { if (error.code !== "ENOENT") throw error; }
        atomicWrite(target, Buffer.from(file.bytes, "base64"));
        restored.push({ ...file, snapshot: regularFileSnapshot(target) });
      }
      hooks.beforeRunWrite?.();
      const options = { expectedContent: item.source_content, expectedRevisionId: item.source_revision_id,
        nextRevisionId, updatedAt, validateBeforeWrite: () => {
          checkedPath(root, relative);
          for (const artifact of item.artefacts) {
            checkedPath(root, artifact.path);
            const expected = item.files.find((file) => file.path === artifact.path)?.digest ?? artifact.digest;
            if (artefactFileDigest(root, artifact.path) !== expected) throw new Error("AGDF_STALE_RUN_REVISION");
          }
        } };
      if (item.kind === "missing_artefacts") writeRunRecoveryLocked(path, item.candidate_content, options);
      else writeRunLocked(path, item.candidate_content, item.source_revision_id, { ...options, allowContentChange: true });
      hooks.afterRunWrite?.();
      const result = regularFileSnapshot(path).content.toString("utf8");
      if (runSealState(root, result).status !== "valid") throw new Error("AGDF_CONTROL_REPAIR_VERIFICATION_FAILED");
      atomicWrite(journalPath, `${JSON.stringify({ ...journal, phase: "committed", result_digest: digest(result) }, null, 2)}\n`);
      return { outcome: "repaired", backup: journalPath.slice(root.length + 1) };
    } catch (error) {
      // Roll back only files we created and still own, only while the run was not replaced.
      // A post-rename interruption retains the complete original snapshot and avoids a second write.
      if (regularFileSnapshot(path).content.toString("utf8") === item.source_content) for (const file of restored) {
        const target = checkedPath(root, file.path);
        if (target) {
          const current = regularFileSnapshot(target);
          if (current.dev === file.snapshot.dev && current.ino === file.snapshot.ino
              && current.content.equals(file.snapshot.content)) unlinkSync(target);
        }
      }
      throw error;
    }
  });
}

export async function repairInstallationControl(control, { chooseRepair, confirmRepair, hooks } = {}) {
  if (control.status !== "repair_required" || typeof chooseRepair !== "function") return control;
  if (await chooseRepair(structuredClone(control)) !== "start") return control;
  const plan = inspectControlRepair(control.target);
  const candidates = plan.items.filter((item) => item.available);
  let decision = "skip";
  if (typeof confirmRepair === "function") decision = await confirmRepair(structuredClone(plan));
  if (decision === "repair") for (const item of candidates) {
    try { Object.assign(item, applyRunRepair(control.target, item, hooks)); }
    catch (error) { plan.diagnostics.push({ run_id: item.run_id, code: String(error.code ?? error.message) }); }
  }
  const after = inspectControlMigration(control.target);
  after.changes = control.changes;
  after.repair = publicRepair(plan, !candidates.length ? "needs_input" : decision !== "repair" ? "deferred"
    : plan.diagnostics.length || after.status !== "current" ? "partial" : "applied");
  if (plan.diagnostics.length) {
    after.diagnostics.push(...plan.diagnostics);
    after.status = "repair_required";
  }
  return after;
}
