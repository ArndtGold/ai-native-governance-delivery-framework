import { inspectControlRepair as inspect, repairInstallationControl as repair } from "#agdf-core/control-maintenance/repair.js";
import { readGitOriginals } from "../runtime/git-originals.js";
export const inspectControlRepair = (root, options = {}) => inspect(root, { readGitOriginals, ...options });
export const repairInstallationControl = (control, options = {}) => repair(control, { readGitOriginals, ...options });
