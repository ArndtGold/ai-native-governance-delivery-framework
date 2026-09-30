import { isAbsolute } from "node:path";
import { directoryIdentity } from "../control-state/run-store-inspection.js";
import { inspectControlMigration } from "./compatibility.js";
import { migrateInstallationControl } from "./migration.js";
import { repairInstallationControl } from "./repair.js";
import { maintenanceResult } from "./contract.js";

export async function runControlMaintenance(target, { guided = false, chooseMaintenance, confirmMigration, confirmRepair } = {}) {
  if (typeof target !== "string" || !isAbsolute(target)) throw new Error("AGDF_MAINTENANCE_TARGET_REQUIRED");
  const identity = directoryIdentity(target);
  const verifyTarget = () => {
    const current = directoryIdentity(target);
    if (current.realpath !== identity.realpath || current.dev !== identity.dev || current.ino !== identity.ino) {
      throw new Error("AGDF_MAINTENANCE_TARGET_CHANGED: inspect the target again before applying a new plan");
    }
  };
  const reviewed = (callback) => async (plan) => {
    verifyTarget();
    const decision = await callback(plan);
    verifyTarget();
    return decision;
  };
  const before = inspectControlMigration(target);
  if (!guided || ["absent", "current"].includes(before.status)) return maintenanceResult(target, before, { operation: guided ? "guided" : "inspect" });
  if (![chooseMaintenance, confirmMigration, confirmRepair].every((callback) => typeof callback === "function")) {
    throw new Error("AGDF_MAINTENANCE_INTERACTION_REQUIRED");
  }
  if (await reviewed(chooseMaintenance)(structuredClone(before)) !== "start") {
    return maintenanceResult(target, inspectControlMigration(target), { operation: "guided", outcome: "deferred" });
  }
  let after = await migrateInstallationControl(target, { mode: "safe", confirmMigration: reviewed(confirmMigration) });
  const diagnostics = [...after.diagnostics];
  after = await repairInstallationControl(after, { chooseRepair: () => "start", confirmRepair: reviewed(confirmRepair) });
  const changed = after.changes.length + (after.repair?.items.filter((item) => item.outcome === "repaired").length ?? 0);
  const outcome = changed ? (after.status === "current" ? "applied" : "partial")
    : diagnostics.length || after.repair?.status === "needs_input" ? "needs_input" : "deferred";
  return maintenanceResult(target, after, { operation: "guided", outcome, diagnostics });
}
