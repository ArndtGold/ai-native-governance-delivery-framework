import { spawnSync } from "node:child_process";
import { assertMaintenanceResult } from "#agdf-core/control-maintenance/contract.js";

// Read through the fixed, identity-checked validator. Never execute report/diagnostic text.
export function inspectStartupCompatibility({ target, executable, validator, env, deadline, run = spawnSync, now = Date.now }) {
  const unavailable = { target, inspection_state: "unavailable", status: "unavailable", counts: null, authorizes: false };
  const timeout = deadline - now();
  if (timeout <= 0) return unavailable;
  try {
    const child = run(executable, [validator, "control-maintenance", "--dir", target, "--json"], {
      cwd: target, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
      timeout, maxBuffer: 1024 * 1024,
    });
    if (child.error || ![0, 2].includes(child.status)) return unavailable;
    const report = assertMaintenanceResult(JSON.parse(child.stdout), target);
    if (report.operation !== "inspect" || report.inspection_state !== "complete"
        || report.maintenance_outcome !== "not_started" || report.compatibility.changes.length || report.compatibility.repair) return unavailable;
    return { target, inspection_state: "complete", status: report.compatibility.status, counts: report.counts, authorizes: false };
  } catch { return unavailable; }
}

export function startupMaintenanceInvocation(facts, { executable, validator, language = "en" }) {
  if (!["migration_required", "repair_required", "unavailable"].includes(facts.status)) return null;
  return { executable, argv: [validator, "control-maintenance", "--dir", facts.target, "--guided", "--language", language], authorizes: false };
}
