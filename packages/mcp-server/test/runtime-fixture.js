import { createMcpDispatchRuntime } from "../../cli/lib/mcp-dispatch-runtime.js";

export function createTestRuntime(surface = "codex", { commandGroups } = {}) {
  const sourceRuntime = createMcpDispatchRuntime({ surface });
  return createMcpDispatchRuntime({
    surface,
    ...(commandGroups === undefined ? {} : { commandGroups }),
    // Structural source-runtime tests do not claim an installed provenance
    // observation. Owned-runtime protocol tests exercise the real verifier.
    verifyRuntime: () => {},
    inspected: {
      expectedVersion: sourceRuntime.trustedContext.expectedVersion,
      skillSet: sourceRuntime.trustedContext.skillSet,
      interactionLocales: sourceRuntime.trustedContext.interactionLocales,
      provenanceStatus: "matched",
      runtimeEvidence: {
        machine_validation: "test_fixture",
        plugin_root: null,
        runtime_digest: null,
        provenance_status: "matched",
      },
    },
  });
}
