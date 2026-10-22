// Isolated regressions of the packed control-command suite, grouped into the parts CI runs
// separately. "core" also owns the snapshot modularization and packed-consumer checks.
export const CONTROL_COMMAND_PACKAGE_PARTS = Object.freeze({
  core: Object.freeze(["package-build", "copilot-profile", "release-version-coherence", "package-contents", "local-validator"]),
  "plugin-mcp-runtime": Object.freeze(["plugin-mcp-runtime"]),
  "runtime-integrity": Object.freeze(["runtime-integrity-layout", "runtime-integrity-negative"]),
});
