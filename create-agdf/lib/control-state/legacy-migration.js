import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmdirSync, unlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { renderRunState } from "./run-state-repository.js";
import { runPath } from "./run-state-reader.js";
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
export function renderLegacyProjection(path, root = process.cwd()) {
  const content = readFileSync(path, "utf8"),
    parsed = parseRunState(content),
    digest = createHash("sha256").update(content).digest("hex");
  if (!parsed.valid) throw Error("AGDF_RUN_NOT_SELECTABLE");
  const canonicalSource = relative(resolve(root), resolve(path)).replaceAll("\\", "/");
  return `<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->\n<!-- canonical_source: ${canonicalSource} -->\n<!-- run_id: ${parsed.meta.run_id} -->\n<!-- revision_id: ${parsed.meta.revision_id} -->\n<!-- sha256: ${digest} -->\n${content}`;
}
export function writeLegacyProjection(path, canonical) {
  atomicWrite(path, renderLegacyProjection(canonical, resolve(dirname(path), "../..")));
}
export { verifyLegacyProjection } from "./legacy-projection-reader.js";
