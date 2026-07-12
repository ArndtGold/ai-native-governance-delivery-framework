import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmdirSync, unlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
  discoverRuns,
  renderRunState,
  runPath,
} from "./run-state-repository.js";
import {
  parseRunState,
  RUN_ID_PATTERN,
  scalarFields,
  semanticBody,
  semanticFingerprint,
} from "./run-state-parser.js";
import { atomicWrite } from "./run-state-writer.js";
export function migrateLegacy(root, requested, io = {}) {
  const writeCanonical = io.atomicWrite ?? atomicWrite;
  const readCanonical = io.readFile ?? readFileSync;
  const lp = join(root, ".agdf", "control", "AGDF_RUN.md");
  if (!existsSync(lp)) throw Error("AGDF_LEGACY_RUN_MISSING");
  const legacy = readFileSync(lp, "utf8");
  if (legacy.startsWith("<!-- AGDF LEGACY PROJECTION"))
    throw Error("AGDF_LEGACY_ALREADY_PROJECTED");
  if (!legacy.startsWith("# AGDF Run State") || !semanticBody(legacy))
    throw Error("AGDF_LEGACY_RUN_INVALID");
  const id = requested || scalarFields(legacy).values.get("run_id");
  if (!RUN_ID_PATTERN.test(id ?? "")) throw Error("AGDF_RUN_ID_INVALID");
  const legacyMeta = Object.fromEntries(scalarFields(legacy).values);
  const dest = runPath(root, id),
    next = renderRunState(id, semanticBody(legacy), legacyMeta);
  if (existsSync(dest)) {
    if (
      semanticFingerprint(readFileSync(dest, "utf8")) ===
      semanticFingerprint(next)
    )
      return { status: "already_migrated", path: dest };
    throw Error("AGDF_RUN_COLLISION");
  }
  mkdirSync(dirname(dest), { recursive: true });
  try {
    writeCanonical(dest, next);
    const persisted = readCanonical(dest, "utf8"),
      parsed = parseRunState(persisted, id);
    if (
      !parsed.valid ||
      semanticFingerprint(persisted) !== semanticFingerprint(next)
    ) throw Error("AGDF_MIGRATION_VERIFICATION_FAILED");
  } catch (error) {
    if (existsSync(dest)) unlinkSync(dest);
    try {
      rmdirSync(dirname(dest));
    } catch (cleanupError) {
      if (!["ENOENT", "ENOTEMPTY"].includes(cleanupError.code)) throw cleanupError;
    }
    throw error;
  }
  return { status: "migrated", path: dest };
}
export function renderLegacyProjection(path) {
  const content = readFileSync(path, "utf8"),
    parsed = parseRunState(content),
    digest = createHash("sha256").update(content).digest("hex");
  if (!parsed.valid) throw Error("AGDF_RUN_NOT_SELECTABLE");
  return `<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->\n<!-- canonical_source: ${path} -->\n<!-- run_id: ${parsed.meta.run_id} -->\n<!-- revision_id: ${parsed.meta.revision_id} -->\n<!-- sha256: ${digest} -->\n${content}`;
}
export function writeLegacyProjection(path, canonical) {
  atomicWrite(path, renderLegacyProjection(canonical));
}
export function verifyLegacyProjection(root) {
  const path = join(root, ".agdf", "control", "AGDF_RUN.md");
  if (!existsSync(path)) return { status: "absent" };
  const p = readFileSync(path, "utf8"),
    source = p.match(/canonical_source:\s*(.*?)\s*-->/)?.[1],
    runId = p.match(/<!-- run_id:\s*(.*?)\s*-->/)?.[1],
    digest = p.match(/sha256:\s*([0-9a-f]{64})/)?.[1],
    projectedStart = p.indexOf("# AGDF Run State"),
    projected = projectedStart >= 0 ? p.slice(projectedStart) : undefined;
  if (!source || !runId || !digest || projected === undefined)
    return { status: discoverRuns(root).length ? "mixed_authority" : "legacy" };
  const target = resolve(source),
    rel = relative(resolve(root), target),
    expected = relative(resolve(root), resolve(runPath(root, runId)));
  if (rel.startsWith("..") || !rel || rel !== expected || !existsSync(target))
    return { status: "projection_source_invalid" };
  const canonical = readFileSync(target, "utf8"),
    canonicalDigest = createHash("sha256").update(canonical).digest("hex");
  return {
    status:
      canonicalDigest === digest && projected === canonical
        ? "valid"
        : "legacy_projection_drift",
  };
}
