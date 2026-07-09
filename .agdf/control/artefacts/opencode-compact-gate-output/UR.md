# UR: OpenCode Compact Gate Output

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

OpenCode shows shell and script output prominently in the conversation. AGDF commands such as `gate-check --json` produce complete machine-readable reports, including delivery maps, doctor reports, findings and evidence. This is useful for automation but noisy for interactive OpenCode use.

The result is that users can be flooded with full JSON output when the useful interactive information is usually only the compact status card, blockers, missing approval and next allowed action.

## 2. Goal

Make AGDF OpenCode usage favor compact, user-readable gate/status reporting while preserving full JSON output for automation and audit evidence.

## 3. Scope

- Clarify OpenCode instructions so agents summarize CLI checks instead of mirroring full JSON into chat.
- Add or expose a compact CLI mode for gate/status output if the current CLI does not already provide one.
- Update OpenCode hook/runtime reminders to distinguish machine evidence from user-facing summaries.
- Update relevant documentation and generated OpenCode assets.
- Add focused smoke coverage for the compact output behavior.

## 4. Non-Goals

- No removal of existing `--json` output.
- No weakening of AGDF evidence, gate checks or auditability.
- No change to Codex, Claude Code or GitHub Copilot behavior unless directly required by shared docs.
- No release, publish, tag, commit, push or PR.

## 5. Acceptance Signals

- OpenCode-facing instructions say full JSON is evidence/automation output and should be summarized interactively.
- A compact gate/status command or flag outputs only the status card essentials and next step.
- Existing `gate-check --json` remains available and machine-readable.
- Smoke tests cover the compact output path.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js`
- `create-agdf/opencode-plugin.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/smoke-test.js`
- `plugin/meta/agdf-runtime-contract.md`
- `README.md`
- `INSTALL.md`
- `create-agdf/README.md`

## 7. Next Step

Perform Brownfield Review before implementation because the change may affect CLI output behavior, OpenCode runtime reminders, generated assets and documentation.
