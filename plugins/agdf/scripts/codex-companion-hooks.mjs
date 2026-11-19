// The Codex Companion activity observers, added to the shared hooks for the Codex runtime profile.
// This module is the only definition: the package build writes hooks/codex.json from it and the
// runtime integrity check, which ships beside it, compares the installed file against it.

// Node start, the bounded stdin read, a short wait for another session's write and one synced
// replacement must fit; a cold Windows start alone can take most of a second. Codex caps Interrupt at 3 s.
const OBSERVER_TIMEOUT_SECONDS = 3;
// The AGDF dispatch tool under any MCP server name. Core decides with the same pattern
// (`agdfDispatchToolPattern` in packages/core/lib/companion/activity.js); a Core test keeps both equal.
export const DISPATCH_TOOL_MATCHER = "^mcp__[A-Za-z0-9_-]+__agdf_dispatch$";

const observer = statusMessage => ({
  type: "command",
  command: 'node "${PLUGIN_ROOT}/hooks/companion-activity.mjs"',
  commandWindows: 'node "$env:PLUGIN_ROOT\\hooks\\companion-activity.mjs"',
  timeout: OBSERVER_TIMEOUT_SECONDS,
  statusMessage,
});

// Returns the complete Codex hooks configuration: the shared configuration with the observers added.
// Only session start, prompt submission, the AGDF dispatch result and the turn end run an observer;
// no hook runs on every tool call.
export function codexCompanionHooks(shared) {
  return {
    ...shared,
    hooks: {
      ...shared?.hooks,
      // The shared runtime check stays first; the Companion then records a sign of life.
      SessionStart: [...(shared?.hooks?.SessionStart ?? []), { hooks: [observer("AGDF Companion · Record Session Start")] }],
      UserPromptSubmit: [{ hooks: [observer("AGDF Companion · Record Turn Start")] }],
      PostToolUse: [{ matcher: DISPATCH_TOOL_MATCHER, hooks: [observer("AGDF Companion · Detect Run Activity")] }],
      Stop: [{ hooks: [observer("AGDF Companion · Record Turn End")] }],
      Interrupt: [{ hooks: [observer("AGDF Companion · Record Turn Interruption")] }],
    },
  };
}
