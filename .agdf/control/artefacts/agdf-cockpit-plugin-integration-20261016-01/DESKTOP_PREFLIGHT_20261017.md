# Desktop and legacy preflight — 2026-10-17

Run: `agdf-cockpit-plugin-integration-20261016-01`.
Approved delivery binding: revision 15, `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`.
This supplementary note does not replace the recorded CD+Tests report or grant qualification.

## Native execution blocker

After the user selected “Native App-Steuerung für diesen Chat bereitstellen”, a fresh `cua.getState()` still returned `apps: []`. The only available surfaces were Codex MCP Apps (no tabs) and the in-app browser (no tabs). The tool contract explicitly disables native computer APIs in this chat. The selection therefore did not provision native access. This agent cannot enable that host capability itself.

N-CLEAN, N-LEGACY, N-SAMEKEY and N-LIFECYCLE remain unexecuted. Existing CLI, SDK and browser evidence does not establish native Desktop rendering, interaction, isolation or teardown.

## Read-only legacy preparation

The built candidate's `mcp status --surface codex --scope project --dir <target> --json` identified the declared `agdf-cockpit-local` entry. Its runtime package matched version `0.14.5`; native session identity, rendering and interaction remained unobserved. The general status concerned the separate governance registration; its `not_configured` result does not mean the legacy Cockpit entry is absent.

The existing `createCodexCockpitTransition` adapter was invoked for preview only, using the current config/section digests and the candidate source identity. It accepted the bounded historical entry, original preparation/runtime identity and the checked project/user configuration inventory. Its `apply` method was never called. This was an adapter ownership/configuration preflight with partial preparatory input, **not** validated transition evidence or authorization to retire the entry. Any draft output digest from that preview must not be used as a qualified migration result.

Configuration digests remained:

- Project: `sha256:20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8`.
- User: `sha256:8d679c4eb79ea0cd8bc999ed9d955c387176481e63ed4d5dfa554ed5b34d0601`.

## Required continuation

Provide native app control in the host/chat configuration and establish the supported isolated native context required by the approved TP. Then observe the final installed plugin's discovery, provider attribution, UI initialization, visible render, interaction and teardown for the exact target and Run. Record fresh host/plugin/runtime/UI/config identities and references under this Run.

Only after that proof passes service validation, use the existing lifecycle command `mcp disable --surface codex --scope project --dir <target> --retire-cockpit agdf-cockpit-local --evidence <qualified-transition-evidence.json> --json`. This is a command template, not an executed migration. Reload the host and verify the final offering, preserved foreign configuration and retained rollback runtime. No standalone registration, plugin install, legacy disable, reload or native qualification was performed during this preflight.
