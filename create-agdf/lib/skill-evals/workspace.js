import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";

function schemaError(message) {
  return Object.assign(new Error(message), { code: "EVAL_SCHEMA_INVALID" });
}

export function resolveInside(root, candidate) {
  if (typeof candidate !== "string" || !candidate || candidate.startsWith("/")) throw schemaError(`unsafe eval path: ${candidate}`);
  const target = resolve(root, candidate);
  const rel = relative(resolve(root), target);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) throw schemaError(`unsafe eval path: ${candidate}`);
  return target;
}

function fixtureContent(path, description, controlState) {
  if (path.endsWith(".json")) return `${JSON.stringify({ fixture: description, control_state: controlState }, null, 2)}\n`;
  if (path.endsWith("RUN_STATE.md") && controlState === "ur-approved-structured") return `# AGDF Run State\n\n- schema_version: 1\n- run_id: example\n- lifecycle: active\n- mode: structured_delivery\n- current_gate: PRD\n- control_state: ${controlState}\n\n## Approvals\n\n| Gate | Status | Evidence |\n|---|---|---|\n| UR | approved | Approval: UR |\n| PRD | pending | none |\n`;
  if (path.endsWith("RUN_STATE.md")) return `# AGDF Run State\n\n- schema_version: 1\n- run_id: example\n- lifecycle: active\n- control_state: ${controlState}\n- evidence: ${description}\n`;
  if (path.endsWith("BROWNFIELD_REVIEW.md")) return `# Brownfield Review\n\n- decision: pass\n- mode_slice_decision: structured_delivery\n- scope_reason: Existing runtime owners are affected.\n- evidence: Canonical owners and regression surface inspected.\n- required_next_gate: PRD\n`;
  if (path.endsWith("TP.md")) return `# Approved Task and Test Plan\n\n## Status\n\n- status: approved\n- evidence: ${description}\n\n## Tasks\n\n| task_id | acceptance |\n|---|---|\n| FIXTURE-001 | Preserve the canonical owner and test its boundary. |\n`;
  if (path.endsWith("UR.md")) return `# Approved User Requirements\n\n- status: approved\n- objective: ${description}\n`;
  if (path.endsWith("QA_REPORT.md")) return `# QA Report\n\n- decision: pass\n- evidence: ${description}\n- missing_evidence: none\n`;
  if (path.endsWith("OR.md")) return `# Orchestration Report\n\n- decision: pass\n- delivered: ${description}\n- required_next_step: explicit delivery handoff\n`;
  if (path.endsWith(".md")) return `# Governed Fixture Artefact\n\n${description}\n\nControl state: ${controlState}\n`;
  if (path.includes("test") || path.endsWith(".spec.js")) return `// ${description}\nexport const fixtureTest = true;\n`;
  return `// ${description}\nexport const fixtureState = ${JSON.stringify(controlState)};\n`;
}

export function materializeFixture(catalog, testCase, options = {}) {
  const definition = catalog.repositories?.[testCase.repository_fixture];
  if (!definition || !catalog.control_states?.includes(testCase.control_state_fixture)) throw schemaError(`unknown fixture for ${testCase.case_id}`);
  const root = mkdtempSync(join(options.tmpRoot ?? tmpdir(), "agdf-skill-eval-"));
  try {
    for (const path of definition.files ?? []) {
      const target = resolveInside(root, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, fixtureContent(path, definition.description, testCase.control_state_fixture), "utf8");
    }
    const marker = resolveInside(root, ".agdf/control/EVAL_FIXTURE.md");
    mkdirSync(dirname(marker), { recursive: true });
    writeFileSync(marker, `# Evaluation Fixture\n\nRepository: ${testCase.repository_fixture}\nControl state: ${testCase.control_state_fixture}\n`, "utf8");
    return root;
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

export function snapshotWorkspace(root) {
  const canonicalRoot = realpathSync(root);
  const snapshot = new Map();
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const rel = relative(root, path).split(sep).join("/");
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        let target;
        try { target = realpathSync(path); } catch { throw schemaError(`broken fixture symlink: ${rel}`); }
        const targetRel = relative(canonicalRoot, target);
        if (targetRel === ".." || targetRel.startsWith(`..${sep}`)) throw schemaError(`fixture symlink escapes workspace: ${rel}`);
        snapshot.set(rel, `symlink:${targetRel.split(sep).join("/")}`);
      } else if (stat.isDirectory()) visit(path);
      else if (stat.isFile()) snapshot.set(rel, createHash("sha256").update(readFileSync(path)).digest("hex"));
    }
  }
  visit(root);
  return snapshot;
}

export function workspaceEvidence(root) {
  const snapshot = snapshotWorkspace(root);
  return [...snapshot.keys()].map((path) => {
    const target = resolveInside(root, path);
    const stat = lstatSync(target);
    return stat.isSymbolicLink() ? `--- ${path} (symlink) ---` : `--- ${path} ---\n${readFileSync(target, "utf8")}`;
  }).join("\n");
}

export function changedPaths(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path) !== after.get(path)).sort();
}

function pathAllowed(path, allowed) {
  return allowed.some((rule) => rule === path || (rule.endsWith("/**") && (path === rule.slice(0, -3) || path.startsWith(rule.slice(0, -2)))));
}

export function mutationViolations(changed, allowed = []) {
  return changed.filter((path) => !pathAllowed(path, allowed));
}

export function disposeFixture(root) {
  rmSync(root, { recursive: true, force: true });
}
