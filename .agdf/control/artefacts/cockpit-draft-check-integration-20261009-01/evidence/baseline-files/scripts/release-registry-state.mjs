import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RELEASE_PACKAGES, classifyRegistryResult, releaseRegistryDecision } from "./release/registry-state.js";

const mode = process.argv[2];
if (!["--preflight", "--complete", "--report"].includes(mode)) {
  console.error("Usage: node release-registry-state.mjs --preflight|--complete|--report");
  process.exit(2);
}
const repoRoot = join(import.meta.dirname, "..");
const version = JSON.parse(readFileSync(join(repoRoot, "packages", "cli", "package.json"), "utf8")).version;
const entries = RELEASE_PACKAGES.map((name) => {
  const queried = spawnSync("npm", ["view", `${name}@${version}`, "version", "--json"], {
    encoding: "utf8", timeout: 30000, env: { ...process.env, NODE_AUTH_TOKEN: "" },
  });
  return classifyRegistryResult(name, version, {
    status: queried.status,
    stdout: queried.stdout ?? "",
    stderr: queried.stderr ?? (queried.error?.message ?? ""),
  });
});
const report = releaseRegistryDecision(entries);
console.log(JSON.stringify(report, null, 2));
if (mode === "--preflight" && !report.safe_to_start) {
  console.error("AGDF_REGISTRY_STATE_REQUIRES_OPERATOR_DECISION: inspect exact versions before resuming or choosing a new version.");
  process.exitCode = 2;
}
if (mode === "--complete" && !report.complete) {
  console.error("AGDF_REGISTRY_STATE_INCOMPLETE: exact package versions are absent or unknown.");
  process.exitCode = 2;
}
