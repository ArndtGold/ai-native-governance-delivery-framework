# OR: OpenCode Plugin Honesty Hardening — Mini-Closeout

Status: pass
Run: opencode-plugin-honesty-hardening
Date: 2026-07-23
Owner: agent

## Delivered

1. **Subagent enforcement-bypass disclosure** — `plugin/skills/gate-check/SKILL.md` gained an "OpenCode Subagent Enforcement Boundary" section disclosing that `tool.execute.before` does not intercept subagent tool calls (issue #5894, PR #36238 open), that AGDF enforcement in the subagent path is auditing-only, and that work must not be routed to subagents to bypass primary-agent gates. Propagated to all 4 generated surfaces via `sync-package-assets.js`: `.opencode/skills/agdf-gate-check/SKILL.md`, `.github/skills/agdf-gate-check/SKILL.md`, `plugins/agdf/skills/gate-check/SKILL.md`, `.opencode/AGDF.md`.

2. **Inactive-repo TUI toast** — `create-agdf/opencode-plugin.js` `session.created` hook now calls `client.tui.showToast` with the bootstrap hint when `repositoryActivation.active === false`, in addition to the existing `app.log` entry. Wrapped in `safeToast` helper that degrades silently to `app.log` when `client.tui` is unavailable or `showToast` throws.

3. **Version-drift check** — `session.created` hook now reads `agdf/bin/agdf-local.js` expectedVersion via `readValidatorExpectedVersion` and compares to `packageJson.version`; on mismatch, emits `app.log` warn + TUI toast. Fails open (no output) when validator file is absent or unreadable.

4. **Test coverage** — `create-agdf/scripts/opencode-hardening-test.js` extended with 5 new test cases: inactive session toasts, active session does not toast, no-TUI degradation, throwing-showToast degradation, non-session.created events are no-ops. All tests pass.

5. **Generated-surface propagation** — `create-agdf/scripts/sync-package-assets.js` updated with AGDF.md disclosure line; `sync-package-assets.js` run successfully, all generated surfaces verified to contain the disclosure text.

## Intentionally Not Delivered

- `tool.execute.before` enforcement guard (deferred until platform stabilises).
- Claude Code / Codex adapter skins for the same improvements.
- Quick-task detection, core engine, multi-agent locks.
- Cross-surface subagent disclosure for Codex/Claude/Copilot (their subagent interception differs; separate run if needed).
- VCS actions (commit, push, PR, release) — require separate explicit user instruction.

## TP Coverage

Not applicable — Verified Change compact path skips PRD/SD/TP. The VERIFIED_CHANGE.md record serves as the compact TP equivalent: declared source/derived paths, prohibited-impact checklist, deterministic validation commands, baseline snapshot, execution evidence.

## Evidence

| Evidence | Source | Result |
|---|---|---|
| opencode-hardening-test.js | `node create-agdf/scripts/opencode-hardening-test.js` | pass (all tests including 5 new) |
| gate-check | `node agdf/bin/agdf-local.js gate-check --run opencode-plugin-honesty-hardening --json` | open, OR, vc_status: executed, 0 findings |
| git diff --check | `git diff --check` | exit 0 (no whitespace/conflict markers) |
| Generated surface verification | grep for disclosure text in 4 generated files | all 4 contain disclosure |
| Baseline integrity | `git status --porcelain` | only declared paths changed; no scope escape |

## Risks

- OpenCode `client.tui.showToast` API stability across versions — mitigated by `safeToast` graceful degradation.
- Concurrent-run baseline drift — `github-community-health-governance` run created new untracked files during this run; baseline updated to include them. Future verified_change runs in this repo should capture baselines immediately before execution.
- Cross-surface disclosure gap remains for Codex/Claude/Copilot — noted as separate-run candidate.

## Next Step

Delivery closeout is ready. VCS actions (commit, push, PR, release) and install-cache mutation require separate explicit user instruction.

- next_allowed_action: Offer delivery closeout; commit/push/PR/release only on separate explicit user instruction.
