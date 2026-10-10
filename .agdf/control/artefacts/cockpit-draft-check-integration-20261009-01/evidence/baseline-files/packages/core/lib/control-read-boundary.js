import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";

export function assertMcpControlReadBoundary(target) {
  const root = realpathSync(resolve(target));
  const agdfRoot = join(root, ".agdf");
  const controlRoot = join(agdfRoot, "control");
  if (!existsSync(controlRoot)) return;
  for (const directory of [agdfRoot, controlRoot]) {
    const stats = lstatSync(directory);
    if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("control_read_boundary_invalid");
  }
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) {
        throw new Error("control_read_boundary_invalid");
      }
      if (entry.isDirectory()) visit(join(directory, entry.name));
    }
  }
  visit(controlRoot);
}
