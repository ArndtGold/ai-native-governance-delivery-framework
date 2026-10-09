import { runControlMaintenance as run } from "#agdf-core/control-maintenance/service.js";
import { readGitOriginals } from "../runtime/git-originals.js";
export const runControlMaintenance = (target, options = {}) => run(target, { readGitOriginals, ...options });
