# UR: Make Installer Results Consistent and Claude Failures Actionable

Status: draft
Gate: UR
Date: 2026-07-16
Owner: agent

## 1. Problem

The AGDF surface installers do not present a consistent result. OpenCode emits a structured status
summary with configuration state, installed and expected versions, version transition, visible
entrypoint and next step. Codex and Claude Code mainly inherit host command output and finish with a
single version sentence.

Claude installation also collapses every failure into the claim that the Claude Code CLI may be
missing. This is misleading when Claude is present but its marketplace refresh rejects Git on native
Windows as missing or unsafe. The upstream error is preserved only as trailing text and the user is
not given the relevant Git for Windows, Git Bash or Claude diagnostic steps.

## 2. User Need

As an AGDF user installing any supported agent surface, I need one recognizable result summary and
failure guidance that identifies the failing dependency and next recovery action, so that successful
installs are comparable and Windows Claude failures do not point me at the wrong prerequisite.

## 3. Scope

- Introduce one shared human-readable installation-result shape for Codex, Claude Code and OpenCode.
- Preserve host-native command output, then finish with the consistent AGDF summary.
- Report at least surface, result status, installed version, expected version, version transition or
  verification limitation, and exactly one next step where the host exposes enough evidence.
- Keep OpenCode's established status output compatible while using it as the presentation baseline.
- Classify Claude bootstrap failures at the narrowest reliable level, including Claude CLI missing,
  Git missing or rejected as unsafe, marketplace refresh failure, plugin install/update failure and
  version mismatch.
- For the observed native-Windows Git rejection, retain the original Claude error and provide focused
  recovery using `where.exe git`, `where.exe bash`, `claude doctor` and
  `CLAUDE_CODE_GIT_BASH_PATH` without changing the user's environment automatically.
- Add deterministic regression coverage for successful first install, unchanged/update transitions,
  version-unavailable output and classified failure guidance.

## 4. Non-Goals

- No change to Claude Code, Codex or OpenCode host command semantics.
- No automatic PATH, environment-variable, Git configuration or marketplace deletion.
- No retry loop or fallback installation transport.
- No change to plugin identity, marketplace source, package version or release workflow.
- No claim that Claude's exact Windows error is controlled by AGDF.
- No redesign of `opencode-status --json` or existing machine-readable schemas unless Brownfield
  Review proves a minimal compatible extension is required.

## 5. Acceptance Criteria

1. Successful Codex, Claude Code and OpenCode installation commands end with the same recognizable
   ordered AGDF summary fields.
2. Each summary distinguishes installed, updated, unchanged and unknown/unverified transitions where
   the surface exposes enough evidence.
3. Installed and expected AGDF versions remain visible and version mismatch stays fail-closed.
4. Existing host-native command output remains available before the final AGDF summary.
5. A missing Claude executable reports a Claude CLI prerequisite problem without Git recovery noise.
6. The observed Claude marketplace error containing `Command 'git' not found or is in an unsafe
   location` reports a Git/Git-Bash discovery problem, preserves the upstream detail and gives the
   Windows checks `where.exe git`, `where.exe bash`, `claude doctor` and
   `CLAUDE_CODE_GIT_BASH_PATH`.
7. Other marketplace and plugin operation failures name the failed phase and do not claim that the
   Claude CLI is absent.
8. Recovery output performs no automatic system mutation and recommends exactly one immediate next
   diagnostic or retry step.
9. Focused installer smoke tests cover all new success and failure classifications on deterministic
   fixtures without requiring live Codex, Claude or OpenCode installations.
10. Release-bootstrap smoke, package smoke, runtime integrity, selected-run doctor and whitespace
    validation pass without weakening existing assertions.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js` owns surface installation, status evaluation and user-facing CLI output.
- `create-agdf/scripts/smoke-test.js` owns deterministic installer behavior coverage.
- `create-agdf/scripts/release-bootstrap-smoke-test.js` owns release-bootstrap output invariants.
- Anthropic's native-Windows setup guidance owns the meaning of Git for Windows and
  `CLAUDE_CODE_GIT_BASH_PATH`; AGDF should link or summarize it without inventing host behavior.

## 7. Risks And Open Questions

- Brownfield Review must determine whether a shared summary formatter can reuse OpenCode's transition
  model without forcing surface-specific data into a false common schema.
- Claude's `plugin list` may omit version data; the consistent summary must keep that limitation visible.
- Error classification must use stable phase and executable evidence, with message matching limited to
  the narrow Windows recovery case.
- Codex terminology uses marketplace `upgrade` while Claude uses `update`; the summary must normalize
  the user result without changing host commands.

## 8. Next Step

After exact UR approval, run Brownfield Review and select the smallest safe delivery path before implementation.
