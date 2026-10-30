import { existsSync } from "../control-read/fs.js";
import { join } from "node:path";
import { discoverRuns } from "./run-state-reader.js";
import { buildRunInventory } from "./run-inventory.js";

// Feeds the pure inventory from the run discovery of the current read view: each run's parsed text
// and, when the full parser rejected it, its findings. No run state is read a second time.
export function readRunInventory(root, { language = "en" } = {}) {
  if (!existsSync(join(root, ".agdf", "control", "runs"))) return buildRunInventory(null, { language });
  const discovered = discoverRuns(root);
  // Discovery reports a runs path that is no directory as one repository-level sentinel entry.
  const store = discovered.filter((run) => run.run_id === "<repository>");
  const sources = discovered.filter((run) => run.run_id !== "<repository>").map((run) => ({
    run_id: run.run_id,
    ...(typeof run.content === "string" ? { text: run.content } : {}),
    findings: run.valid ? [] : run.findings,
  }));
  return buildRunInventory(sources, { language, findings: store.flatMap((run) => run.findings) });
}
