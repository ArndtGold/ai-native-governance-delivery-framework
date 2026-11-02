export { CONTROL_MIGRATION_STATUSES, uncheckedControl, inspectControlMigration, assertControlMigration } from "#agdf-core/control-maintenance/compatibility.js";
export { migrateInstallationControl } from "#agdf-core/control-maintenance/migration.js";

export function installationControlTarget(options) {
  if (options.controlDir) return { root: options.controlDir, writable: true };
  if (options.dirExplicit && (options.target !== "opencode" || options.setupRequest === "full")) {
    return { root: options.dir, writable: true };
  }
  return { root: options.workingDirectory ?? null, writable: false };
}
