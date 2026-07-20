# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: activation-diagnosis-determinism
- lifecycle: active
- revision: 4
- revision_id: 3dfc2775-e8ae-4f04-936e-957bc60660d6
- mode: verified_change
- current_gate: OR
- decision: ready_for_closeout
- owner: agent

## Objective

Make AGDF repository-activation diagnosis deterministic and tool-shell-safe so that an agent in any
context (interactive shell, tool shell, scripted CI, fresh session) can determine AGDF activation
through one canonical, code-owned probe, and skill/contract guidance does not silently rely on
shell-env propagation or relative-path resolution.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR approved; the plugin activation logic is correct, but AGDF skill/contract guidance treats `AGDF_*` env vars and relative globs as diagnostic truth. On Windows OpenCode Desktop App the plugin's `shell.env` hook does not propagate to LLM tool shells, so an agent fell back to relative glob and produced a false negative for an existing `.agdf/control/config.json`, recommending an action that would have re-scaffolded over valid control state. |
| What is approved? | `Approval: UR` provided on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation. |
| What is missing? | Brownfield Review and Mode/Slice Decision before any later artefact. |
| What is the next allowed action? | Run Brownfield Review as one internal operation; then record a visible Mode/Slice Decision with scope reason and evidence before drafting PRD. |
| What is explicitly forbidden right now? | PRD drafting, SD, TP, Brownfield Analysis, implementation, and any mutation of existing `.agdf/control/` content or generated surfaces until Brownfield Review and Mode/Slice Decision are recorded. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/activation-diagnosis-determinism/BROWNFIELD_REVIEW.md` 2026-07-20; UR premise refined (skills already point to `doctor --json`; gap is missing explicit forbidden-list + boundary). |
| Mode/Slice Decision | verified_change | Scope is single-owner additive guidance + Runtime Integrity assertions; bounded clean-at-baseline; no prohibited impact; deterministic validation; structured escalation target is PRD if pre-implementation Brownfield Analysis finds prose-assertion non-deterministic. |
| PRD | not_applicable | Verified Change path skips PRD/SD/TP/QA/UAT when eligibility is proven; escalates to PRD only if record becomes `escalated`. |
| SD | not_applicable | see PRD |
| TP | not_applicable | see PRD |
| QA | not_applicable | see PRD |
| UAT | not_applicable | see PRD |
| OR | done | `.agdf/control/artefacts/activation-diagnosis-determinism/OR.md` mini-closeout; verified_change record `executed`. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/activation-diagnosis-determinism/UR.md` | approved | Revision 1 approved on 2026-07-20; defines the deterministic-activation-diagnosis scope, non-goals and acceptance signals. UR premise refined in Brownfield Review. |
| Brownfield Review | `.agdf/control/artefacts/activation-diagnosis-determinism/BROWNFIELD_REVIEW.md` | done | 2026-07-20; refined UR premise (gap is missing prohibition, not wrong promotion); Mode/Slice Decision `verified_change`. |
| Verified Change | `.agdf/control/artefacts/activation-diagnosis-determinism/VERIFIED_CHANGE.md` | executed | 2026-07-20; four scoped changes implemented; Runtime Integrity, routing, lifecycle, negative tests, sync idempotence and git diff --check all pass. |
| OR | `.agdf/control/artefacts/activation-diagnosis-determinism/OR.md` | pass | Mini-closeout recorded; delivery closeout offered. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| `evaluateOpenCodeRepositoryActivation` source | `create-agdf/lib/installers/opencode-activation.js` | Activation logic correctness | direct |
| `shell.env` hook implementation | `create-agdf/opencode-plugin.js:48-55` | Env-var propagation contract | direct |
| Observed `<unset>` for `AGDF_CONTROL_DIR` and `AGDF_OPENCODE_REPOSITORY_ACTIVATION` in tool shell | Windows OpenCode Desktop App session, 2026-07-19 | Tool-shell env propagation gap | direct |
| False negative despite existing config.json | Observed glob miss vs absolute read success on Windows | Relative-glob unreliability in tool shells | direct |
| Existing skill references env vars as diagnostic anchors | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/control-scaffold.md` | Guidance drift to be corrected | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Windows OpenCode Desktop App tool-shell diagnosis gap | Observed env-var `<unset>` plus relative-glob false negative on 2026-07-19 documented in UR section 1. |
| UR | scoped_by | Non-Goals section of UR | Excludes `shell.env` host behavior, schema changes, and VCS/release; keeps scope to AGDF-owned guidance and Runtime Integrity. |
| Brownfield Review | sizes | UR | Refined UR premise: skills already point to `doctor --json`; gap is missing explicit forbidden-list + boundary, not a wrong promotion. |
| Brownfield Review | selects_mode | verified_change | Single-owner additive guidance + Runtime Integrity assertions; bounded clean-at-baseline; no prohibited impact; deterministic validation; structured escalation target PRD. |
| Brownfield Review | cites_prior | `opencode-global-install-visibility/OR.md` Limitations | Prior run already disclosed "Active OpenCode session detection can only be proven from a process that sees the hook-set environment variables." This run extends, does not duplicate. |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Inventory of all AGDF guidance referencing `AGDF_*` env or relative glob as proof | medium; determines final scope | Brownfield Review |
| Whether other surfaces (Codex, Claude Code, Copilot) have equivalent tool-shell env propagation gaps | medium; disclosed-boundary scope | Brownfield Review |
| Whether Pages currently surfaces env-based or glob-based diagnosis language | low; possible copy drift | Brownfield Review |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| AGDF tries to "fix" OpenCode host behavior | high; scope creep and unfalsifiable claim | Explicit non-goal: shell.env propagation is OpenCode-owned |
| Runtime Integrity assertions for guidance prose produce false positives | medium; blocks legitimate edits | Brownfield Analysis must validate assertion mechanism |
| Re-scaffolding risk remains for users who follow current guidance | high; data loss in valid `.agdf/control/` | This run's deliverable addresses root cause; disclosure not a fix for past risk |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: to be confirmed in Brownfield Review (candidate: existing control-state / interaction nodes)
- context_graph_reconciliation: not_applicable_yet
- context_graph_required_action: none yet
- context_graph_gate_effect: none

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The "shell-env propagation is not ground truth; canonical CLI probe is the only diagnosis" invariant is reusable across surfaces and future AGDF skills; if unstated, the same drift recurs.
- memory_refs: to be created or extended in Brownfield Review.

## Next Step

Delivery closeout is ready. VCS actions (commit, push, PR, release) and install-cache mutation
require separate explicit user instruction. The installed plugin 0.11.0 at `~/.config/opencode/`
remains unchanged until a separate release action.

- next_allowed_action: Offer delivery closeout; commit/push/PR/release only on separate explicit user instruction.

