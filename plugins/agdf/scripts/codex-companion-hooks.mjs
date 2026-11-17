// The Codex Companion activity observers, added to the shared hooks for the Codex runtime profile.
// This module is the only definition: the package build writes hooks/codex.json from it and the
// runtime integrity check, which ships beside it, compares the installed file against it.

// Node start, the bounded stdin read, a short wait for another session's write and one synced
// replacement must fit; a cold Windows start alone can take most of a second.
const OBSERVER_TIMEOUT_SECONDS = 3;

const observer = statusMessage => ({
  type: "command",
  command: 'node "${PLUGIN_ROOT}/hooks/companion-activity.mjs"',
  commandWindows: 'node "$env:PLUGIN_ROOT\\hooks\\companion-activity.mjs"',
  timeout: OBSERVER_TIMEOUT_SECONDS,
  statusMessage,
});

// Returns the complete Codex hooks configuration: the shared configuration with the observers added.
export function codexCompanionHooks(shared) {
  return {
    ...shared,
    hooks: {
      ...shared?.hooks,
      PostToolUse: [{ matcher: "^mcp__agdf__agdf_dispatch$", hooks: [observer("AGDF Companion · Detect Run Activity")] }],
      Stop: [{ hooks: [observer("AGDF Companion · Record Turn End")] }],
      Interrupt: [{ hooks: [observer("AGDF Companion · Record Turn Interruption")] }],
    },
  };
}
