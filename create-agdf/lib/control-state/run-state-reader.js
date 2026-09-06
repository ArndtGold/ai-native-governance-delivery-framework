import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseRunState, RUN_ID_PATTERN } from "./run-state-parser.js";

function invalidRun(runId, path) {
  return {
    run_id: runId,
    path,
    valid: false,
    findings: [{ code: "AGDF_RUN_PATH_INVALID", path }],
  };
}

export function runPath(root, id) {
  if (!RUN_ID_PATTERN.test(id)) throw Error(`invalid run_id: ${id}`);
  return join(root, ".agdf", "control", "runs", id, "RUN_STATE.md");
}

export function discoverRuns(root) {
  const dir = join(root, ".agdf", "control", "runs");
  if (!existsSync(dir)) return [];
  const rootStats = lstatSync(dir);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    return [invalidRun("<repository>", dir)];
  }
  return readdirSync(dir)
    .filter((entry) => !entry.startsWith("."))
    .sort()
    .map((id) => {
      const directory = join(dir, id);
      const path = join(directory, "RUN_STATE.md");
      const directoryStats = lstatSync(directory);
      if (!RUN_ID_PATTERN.test(id)
          || directoryStats.isSymbolicLink()
          || !directoryStats.isDirectory()
          || !existsSync(path)) {
        return invalidRun(id, path);
      }

      const stateStats = lstatSync(path);
      if (stateStats.isSymbolicLink() || !stateStats.isFile()) return invalidRun(id, path);
      return {
        run_id: id,
        path,
        ...parseRunState(readFileSync(path, "utf8"), id),
      };
    });
}
