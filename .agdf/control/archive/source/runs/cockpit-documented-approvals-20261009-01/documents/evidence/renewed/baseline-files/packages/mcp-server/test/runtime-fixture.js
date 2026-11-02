import { createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";

export function createTestRuntime(surface = "codex") {
  const sourceRuntime = createMcpDispatchRuntime({ surface });
  return createMcpDispatchRuntime({
    surface,
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
