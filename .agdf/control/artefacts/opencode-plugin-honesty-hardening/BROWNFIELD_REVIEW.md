# Brownfield Review: OpenCode Plugin Honesty Hardening

Status: done
Mode: post_ur_review
Run: opencode-plugin-honesty-hardening
Date: 2026-07-23
Owner: agent

## Decision

- mode_slice_decision: verified_change
- decision: pass
- required_next_gate: none (verified_change path skips PRD/SD/TP/QA/UAT when eligibility is proven; escalates to structured_slice if a record condition fails)
- artefact: .agdf/control/artefacts/opencode-plugin-honesty-hardening/BROWNFIELD_REVIEW.md

## Scope

Three bounded honesty-hardening changes to the OpenCode plugin surface, all additive, all failure-tolerant:

1. Subagent enforcement-bypass disclosure in `AGDF.md` source and `plugin/skills/gate-check/SKILL.md`.
2. `client.tui.showToast` on inactive repository in `create-agdf/opencode-plugin.js` `session.created`, in addition to existing `app.log`.
3. Version-drift check in `session.created` comparing loaded plugin `packageJson.version` to `agdf/bin/agdf-local.js` expectedVersion.

## UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: TUI toast is a transient non-blocking notification; no UI surface, no state, no interaction model change.
- ux_intent_definition_required: false (not_applicable — no user-visible behaviour change beyond a transient toast; no product semantics)

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| `opencode-plugin.js` source | `create-agdf/opencode-plugin.js:1-84` | session.created/shell.env/transform hooks; `client` and `directory` in factory args; no existing TUI usage | direct |
| gate-check skill source | `plugin/skills/gate-check/SKILL.md:1-216` | No subagent disclosure exists; canonical skill text to amend | direct |
| Subagent bypass | anomalyco/opencode issue #5894, PR #36238 open | `tool.execute.before` does not fire for subagent tool calls; host limitation | direct |
| TUI toast API | OpenCode SDK docs `client.tui.showToast({ body: { message, variant } })` | API exists, documented, same client object as existing `client.app.log` | direct |
| Existing test surface | `create-agdf/scripts/opencode-hardening-test.js:1-407` | Canonical test file for OpenCode plugin hardening; tests SDK alignment, evaluator preflight, enforcement classification | direct |
| Generated-surface sync | `create-agdf/scripts/sync-package-assets.js` | Canonical owner for propagating plugin/skill source to generated surfaces | direct |
| Worktree baseline | `git status --porcelain` 2026-07-23 | Only 2 untracked entries, both this run's own scaffold; all candidate paths clean | direct |
| Validator version pin | `agdf/bin/agdf-local.js` expectedVersion 0.11.4 | Version-drift check source | direct |
| Plugin version source | `create-agdf/package.json` version 0.11.4 | Loaded plugin version | direct |

## Current Coverage

- fully_done: none of the three changes exist today.
- partially_done: `session.created` already logs active/inactive to `app.log` (change 2 extends this with TUI toast); `evaluateOpenCodeRepositoryActivation` already returns the activation state used by both changes 2 and 3.
- not_done: subagent-bypass disclosure (change 1); TUI toast on inactive (change 2 new behaviour); version-drift check (change 3 new behaviour).

## Reuse Strategy

- extend: `session.created` hook in `opencode-plugin.js` (add toast + drift check to existing hook body).
- extend: `plugin/skills/gate-check/SKILL.md` (add disclosed-boundary section).
- extend: `AGDF.md` instructions source (add disclosed-boundary note).
- extend: `create-agdf/scripts/opencode-hardening-test.js` (add toast-fallback and drift-detection tests).
- new: none. No new modules, no new files, no parallel structures.

## Change Impact

- files/modules: `create-agdf/opencode-plugin.js`, `plugin/skills/gate-check/SKILL.md`, `AGDF.md` source, `create-agdf/scripts/opencode-hardening-test.js`, generated surfaces via sync.
- interfaces: no public interface change. `session.created` hook contract unchanged; toast and drift check are internal additions.
- data model/migrations: none.
- backwards compatibility: fully preserved. Toast and drift check degrade to `app.log` on any client/API failure; disclosure is additive text.
- regression tests: extend `opencode-hardening-test.js` with toast-fallback and drift-detection cases; existing assertions unchanged.
- side effects: none beyond a transient TUI toast on inactive/drift, which is the intended behaviour.

## Parallel-Structure Risk

None. All three changes extend existing files and existing hooks. No second disclosure system, no second notification path, no second version-check system. TUI toast runs alongside the existing `app.log` entry, not replacing it.

## SoT/Runtime/Product-Semantics Drift

None. No gate, approval value, schema field, or product semantics is added, removed, or changed. The disclosure documents an existing host limitation; it does not redefine AGDF enforcement authority.

## Visible State Ownership

Not applicable. No chat/render/scroll/recovery state introduced. TUI toast is transient and fire-and-forget; no state is persisted by the toast or drift check beyond the existing `app.log` entry.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: existing `opencode-surface-hardening-parity` and `opencode-single-install-activation` nodes (this run extends the OpenCode surface honesty theme, does not duplicate).
- context_graph_reconciliation: to be performed at closeout.
- context_graph_gate_effect: none.

## Verified Change Eligibility

| Criterion | Status | Evidence |
|---|---|---|
| Exactly one canonical owner and bounded source/derived paths | met | Owner: `create-agdf` plugin surface. Source paths: `create-agdf/opencode-plugin.js`, `plugin/skills/gate-check/SKILL.md`, `AGDF.md` source, `create-agdf/scripts/opencode-hardening-test.js`. Derived: generated surfaces via `sync-package-assets.js`. |
| No gate/permission/security/persistence/architecture/external API/CLI/release behavior impact | met | Disclosure is text; toast extends existing `client` usage (same object as `client.app.log`), degrades gracefully; drift check is read-only comparison. No gate/schema/policy change. |
| Deterministic propagation when derived paths exist, plus at least one deterministic validation command | met | `sync-package-assets.js` propagates generated surfaces; `opencode-hardening-test.js` + `node agdf/bin/agdf-local.js doctor --json` validate. |
| Full baseline commit plus tracked and untracked worktree baseline paths, no candidate path already dirty | met | `git status --porcelain` 2026-07-23: only 2 untracked entries, both this run's own scaffold under `.agdf/control/`; all candidate paths clean. |
| Explicit structured_slice or structured_delivery escalation target | met | Escalate to `structured_slice` if: (a) `client.tui.showToast` unavailable in installed OpenCode and graceful degradation is insufficient; (b) generated-surface sync reveals cross-surface disclosure needs surface-specific wording for Codex/Claude/Copilot; (c) worktree baseline cannot be cleanly captured at implementation time due to other active runs. |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| `client.tui.showToast` live invocation in installed OpenCode version | low; API documented, degrades gracefully | Verify at implementation; fallback to app.log documented |
| Whether disclosure belongs in additional skills beyond gate-check | low; gate-check is primary | Optional add to clean-implementation-review/code-review if Brownfield Analysis finds need |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Disclosure reduces user confidence in AGDF on OpenCode | medium | Honesty gain outweighs false-confidence risk; disclosure is a boundary note, not a warning |
| TUI toast API unavailable in some OpenCode versions | medium | Graceful degradation to app.log; tested in opencode-hardening-test.js |
| Version-drift check reads validator file that may be absent | low | Fail open to existing path; warn in log; do not block session |
| Cross-surface disclosure gap (Codex/Claude/Copilot) | low | Out of scope; noted for separate run if needed |

## Required Next Step

Proceed to Verified Change execution under the compact record. Implementation of the three scoped changes is now the next allowed action, governed by the VERIFIED_CHANGE.md record and its baseline, execution, and mini-closeout evidence. No PRD/SD/TP required unless the record escalates.

- next_allowed_action: Create VERIFIED_CHANGE.md record with baseline snapshot, then implement the three scoped changes, then run deterministic validation, then mini-closeout.
