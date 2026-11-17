# Brownfield Review: Companion shows planned URs instead of an empty state

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- related_ur: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/UR.md (sha256:67e75fd8b880fb459316771ff360857bac45d43a26426a3ef569b56a1686b2f8, approved)
- current_gate: Brownfield Review
- reviewer: Claude (agent), on behalf of owner Arndt Gold
- reviewed_at: 2026-11-16

## Objective

Size and route the approved UR: the Claude companion pane shows a planned UR (title, goal, coverage, next step) instead of an empty-state message when no Run is assigned, with matching figure, status line and refresh.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The companion pane gains a new visible state type ("UR planning, no run yet") that replaces the existing empty states "All runs across the line" / "Starting grid empty" for the affected situation, with its own who-is-next guidance, gate bar, figure pose and status line. This materially changes the visible state type of one bounded capability (the companion pane); it introduces no competing authority and no cross-surface activation, so it is not high.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: pending; UX Intent Definition runs before PRD readiness. Input: owner-reviewed mock images of the planned-UR pane (draft working, draft resting, ready for handover) from 2026-11-16 in the chat.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Planned UR semantics: `projectPlannedInventory` / `readWorkInventory` (coverage draft, ready, transferred, recovery_required, unconfirmed, unavailable) | packages/core planned inventory, used read-only | `low` (consumed, not changed) |
| Source of truth | `.agdf/control/planned/plan-<uuid>/UR.md`; Run records under `.agdf/control/runs/` | planned store and run store unchanged; companion stays read-only | `none` |
| Runtime path | Core run view `packages/core/lib/companion/run-view.js` (`readRunView`, `projectRunView`), CLI read command `run-view` (`packages/cli/lib/cli/project-read-command.js`, `command-registry.js`), consumed only by the Claude companion host template (`plugins/agdf/host-templates/claude/companion/run-state.mjs`) | grep for readRunView/run-view: consumers are the Claude companion, its parity/integrity tests and run-view-command-test; the Codex companion and cockpit do not read `run-view` | `low` (additive field `planned`) |
| UI / UX | Companion pane: `view.mjs`, `register.mjs`, `notice.mjs`, `assignment.mjs`, `figure.mjs`; catalog `plugins/agdf/meta/agdf-interaction-locales.json` | layout and figure rules from PRs #73/#75 | `medium` |
| Persistence / data | none written | companion and run view are read-only | `none` |
| Tests / QA | `packages/core/test/companion-run-view-test.js`, `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `run-view-command-test.js`, `interaction-catalog-test.js` | existing suites cover run view, view model, drawn pane and terminal | `low` |
| Release / operations | Catalog change chain: `npm run build:mcp`, `scripts/sync-package-assets.js`, exact `copilot-payload-baseline.json`, `scripts/host-compatibility/run.mjs record` | derived artefacts regenerate deterministically; no version bump | `low` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `low`
- architecture_reason: The change extends existing owners only. Core keeps owning planned-UR readiness and titles; the run view adds one additive read-only field inside its existing captured snapshot; the Claude host template keeps importing only its own modules and still launches one read-only `run-view` process. No module ownership, data/SoT ownership, security/policy authority, migration or host contract changes. The `run-view/1` output gains an optional additive field; existing consumers ignore unknown fields.
- architecture_evidence: packages/core/lib/companion/run-view.js; plugins/agdf/host-templates/claude/companion/run-state.mjs (snapshot mapping); packages/core/lib/interaction-catalog-validation.js (exact key sets for companion statusStates)
- architecture_missing_evidence: none
- architecture_next_owner_and_action: none beyond SD confirming the additive `planned` field shape and the selection rule.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse planned inventory instead of re-parsing planned URs in the host template | `projectPlannedInventory` already derives title and coverage | `none` | SD: run view must call the Core inventory; host template must not read `.agdf/control/planned/` itself except for change detection (file timestamps) |
| Goal extraction must share the run-naming path | `readRunNaming` already reads the localized UR summary goal | `warn` | SD: one shared UR-facts reader for runs and planned URs; no second goal parser |
| Uncommitted candidate implementation written without a Run | branch `feat/companion-planned-ur`, 15 changed files (git diff --stat) | `warn` | Treat as candidate only; Brownfield Analysis after TP checks it against the approved TP; nothing in it counts as approved |
| Catalog key sets are validated exactly | `interaction-catalog-validation.js` lists companion statusStates keys | `none` | TP: extend validation together with catalog |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One coherent user-visible outcome in one host surface (Claude companion pane) built on existing Core owners. Quick Task/Compact Delivery is ineligible because the change adds new user-visible behavior and product semantics (a new pane state with its own guidance), touches plugins/agdf/meta and executable code across Core and host template. Verified Change is ineligible because the candidate paths are already dirty at baseline (uncommitted candidate), more than one owner is involved (Core run view, host template, catalog) and the `run-view` CLI output changes additively. No full-depth trigger applies (see Structured Depth Evidence), so structured_delivery is rejected.
- evidence: this review; approved UR; git diff --stat on feat/companion-planned-ur; consumer search for readRunView/run-view.
- transparency_note: PRD, SD and TP are kept at slice depth: PRD covers the pane states and acceptance criteria; SD covers the additive run-view field, the selection rule, change detection and catalog chain; TP maps criteria to tasks and tests and treats the existing candidate as implementation input to be checked, not as done work. UX Intent Definition precedes PRD readiness because ui_ux_impact is medium.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: structured_delivery (no authority, runtime-architecture, persistence, external-contract, release or unbounded-coordination trigger); quick_task and verified_change (ineligible as stated in scope_reason)
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review (Existing-System View, Architecture Impact); UR sections 3, 4, 6, 7

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: the companion pane shows a planned UR instead of an empty state; acceptance signals in UR section 5 bound it. |
| authority_boundary | `pass` | Core stays the authority for planned-UR readiness and titles; the companion stays read-only; no permission or policy change. |
| owner_consumer_coordination | `pass` | Owners are Core run view, Claude companion host template and interaction catalog, all in this repository; the only `run-view` consumer is the Claude companion. No shared external cutover. |
| full_depth_impacts_absent | `pass` | No architecture/runtime boundary change, no persistence, no external API; `run-view/1` gets an optional additive field; no release plan; single host (Claude). |
| migration_propagation_bounded | `pass` | No migration. Propagation is the deterministic catalog chain (build:mcp, sync-package-assets, payload baseline, compatibility record). |
| failure_recovery_local | `pass` | An unreadable planning store yields an empty planned list; rollback is reverting the slice. |
| independently_acceptable | `pass` | Acceptance is observable in the pane and in tests without other pending work. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which planned UR is shown when several exist and Runs are open (selection rule, session-change preference)? | PRD | `revise` |
| What does the pane say for coverage recovery_required / unconfirmed / unavailable? | PRD | `warn` |
| Should readiness follow the display language (missing localized summary keeps it draft) or the artefact language? Current Core rule follows the display language. | PRD | `warn` |
| Exact shape of the additive `planned` field in `run-view/1` and its snapshot handling | SD | `warn` |
| Change detection for planned URs in the refresh fingerprint without extra process starts | SD | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The change extends existing companion and run-view nodes without new SoT, owner or contract nodes.

## Next Permissible Step

- next_allowed_action: UX Intent Definition for the planned-UR pane state, then PRD drafting at slice depth.
- forbidden_until_then: SD, TP, implementation-preparation Brownfield Analysis, implementation, QA, release; treating the uncommitted candidate as approved work.

## Quality Outlook

- quality_outlook: Good. Scope is bounded and an implementation candidate with passing local tests exists; main risks are wording/selection semantics (PRD) and the unverified live Claude pane.

## Decision

- decision: pass
