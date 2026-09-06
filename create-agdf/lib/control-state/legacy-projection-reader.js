import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { discoverRuns, runPath } from "./run-state-reader.js";

export function verifyLegacyProjection(root) {
  const path = join(root, ".agdf", "control", "AGDF_RUN.md");
  if (!existsSync(path)) return { status: "absent" };
  const projection = readFileSync(path, "utf8");
  const source = projection.match(/canonical_source:\s*(.*?)\s*-->/)?.[1];
  const runId = projection.match(/<!-- run_id:\s*(.*?)\s*-->/)?.[1];
  const digest = projection.match(/sha256:\s*([0-9a-f]{64})/)?.[1];
  const projectedStart = projection.indexOf("# AGDF Run State");
  const projected = projectedStart >= 0 ? projection.slice(projectedStart) : undefined;
  if (!source || !runId || !digest || projected === undefined) {
    return { status: discoverRuns(root).length ? "mixed_authority" : "legacy" };
  }
  const target = resolve(root, source.replaceAll("\\", "/"));
  const targetRelative = relative(resolve(root), target);
  const expected = relative(resolve(root), resolve(runPath(root, runId)));
  if (targetRelative.startsWith("..") || !targetRelative || targetRelative !== expected || !existsSync(target)) {
    return { status: "projection_source_invalid" };
  }
  const canonical = readFileSync(target, "utf8");
  const canonicalDigest = createHash("sha256").update(canonical).digest("hex");
  return {
    status: canonicalDigest === digest && projected === canonical
      ? "valid"
      : "legacy_projection_drift",
  };
}
