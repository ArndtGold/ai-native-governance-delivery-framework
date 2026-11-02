# Code Review: Harden the Claude installer against stale and shadowed installations (re-review)

Gate: CR
Type: Code Review
Status: done
Decision: pass
Reviewer: Claude Code (claude-opus-5-5) with an independent review subagent
Date: 2026-10-15

## Scope

Rework of the first review (`CODE_REVIEW.md`, decision `revise`, CR-001 to CR-007) plus one new
finding from the re-review, on the uncommitted diff of `feat/claude-install-fix` and commit `42c42850`.
The reviewer re-ran isolated probes (temp `CLAUDE_CONFIG_DIR` and `LOCALAPPDATA`) and the read-only
host-compatibility comparison.

## Code Review

- decision: pass
- findings: none open
- missing_evidence: native Windows confirmation (AC-014), including CR-006 (package-store contents) and
  whether Claude Code reuses an old cache directory after `uninstall --keep-data`.
- risks:
  - text-only Claude Code hosts (no `--json`) reinstall on every run as before; health then rests on the
    marketplace root and the record, visible as `plugin_list:text_fallback`;
  - a marker-less package-store overlay is still classified `foreign` (CR-006, native check);
  - Claude runtime facts are not covered by the `sessionStartBase` footprint budget (pre-existing for Codex);
  - Codex rollback evidence after a post-commit failure now reads `not_applicable_committed` instead of a
    false `restored`.
- required_next_step: QA.

## Resolution Of Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | `plugin.js` reinstalls when the listed cache copy lacks the committed digests or cannot be inspected; verification checks the listed cache; reviewer probe: update reinstalls, stale-cache check `true`, injected failure surfaces; host-compatibility comparison 56/0 | none |
| CR-002 | implementation_gap | CD+Tests | resolved | host-compatibility fixture isolates `CLAUDE_CONFIG_DIR` and preflight; no record in the real Claude data root after all runs | none |
| CR-003 | implementation_gap | CD+Tests | resolved | `plugin_enabled:false` plus enable command, never healthy, no enable or install issued | none |
| CR-004 | implementation_gap | CD+Tests | resolved | stale record removed after a failed write (`stale_removed`); drift remedy names reinstalling AGDF for Claude | none |
| CR-005 | evidence_gap | evidence_obligation | resolved | `scripts/fixtures/claude-plugin-list-json.json` (real anonymized 2.1.268 output) used by the tests | none |
| CR-006 | evidence_gap | evidence_obligation | open | marker-less package-store overlays remain `foreign`; carried into native qualification (AC-014, SCN-018) | Inspect package-store contents during native qualification. |
| CR-007 | implementation_gap | CD+Tests | resolved | evidence ends in `:cleanup_pending=<path>` | none |
| CR-008 | implementation_gap | CD+Tests | resolved | re-review: a plugin listed only at local or project scope was taken as installed; now only a user-scope entry counts when entries carry a scope; test `project-only` installs at user scope | none |

CR-006 is an evidence obligation assigned to native qualification, not an implementation defect in the
reviewed scope; it is carried forward to QA as a qualification limit.

## Copilot Projection

The generated Copilot session check is byte-identical to the base template (all four `copilot=true`
interpolations resolve to the original source); `host-installation.js` stays excluded from the Copilot payload.
