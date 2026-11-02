# Brownfield Review: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-companion-followup-20261027-01`
- related_ur: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/UR.md` (approved, revision 3)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-10-27

## Objective

Size and route the approved UR: extend the delivered, opt-in Claude companion with an implementation mark in the gate bar, a build variant of the figure, a gate bar per mode, a toast on "waiting"/"blocked", a status-line entry, one brand name, hiding of placeholder objectives and a language fallback without a control folder. The companion stays read-only, failure-isolated and Claude-only.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change adds visible state types to an existing capability (a build variant of the figure and possibly a fifth state label, a CD+Tests mark, per-mode paths), two new feedback channels outside the panel (toast and status line) with their own activation defaults and switches, and a renamed brand. It changes the delivered effective-state rule that a closed panel stops all companion activity. All of it stays inside the one companion capability and adds no authority.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

The inputs for UX intent definition are complete: the approved UR with the owner decisions of 2026-10-27 (brand name "AGDF Companion", toast on and sound off by default, observation only), the approved UX intent of run `agdf-begleiter-companion-20261025-01` (`UX_INTENT_DEFINITION.md`) and the live recheck `UAT_LIVE_RECHECK.md`. UX intent definition must settle: "builds" as label or variant and its precedence over the turn overlay; toast wording, trigger rule and no-repeat rule; the switches and their placement within 40 columns; the status-line wording per state; the per-mode bar; and the language fallback order.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; the approved PRD and UX intent of run `agdf-begleiter-companion-20261025-01`; `plugins/agdf/meta/contracts/interaction.md` | The companion is display-only; toast and status line must stay observation surfaces and must not imply that an approval can be given there. The brand name and the closed-panel rule change approved semantics of the previous run. | `medium` |
| Source of truth | `RUN_STATE.md` written by `packages/core/lib/control-state/`; status-card path `BREADCRUMB_PATH_TEMPLATES` and `buildBreadcrumbPath` in `packages/core/lib/control-evaluation/gate-check.js:141-181`; `modeSliceDecision` in `packages/core/lib/control-evaluation/run-state-policy.js:45-51`; `isDecisionContentPlaceholder` in `packages/core/lib/control-evaluation/decision-content-readiness.js:9` | The companion parser `run-state.mjs` reads Run Meta, Objective, Current Control State, Approvals and Artefacts but not the Mode/Slice Decision section. Repository runs carry the decision with and without backticks (`decision: quick_task` and ``decision: `quick_task` ``) and Approvals rows `not_applicable` or `missing` for skipped gates. Its lifecycle set is already bound to the core by a parity test; mode and placeholder rules need the same kind of binding. | `medium` |
| Runtime path | `plugins/agdf/host-templates/claude/companion/register.mjs` (hooks `session.start`, `command.run`, `turn.start`, `turn.complete`, `ui.close`, `ui.render`); generation by `scripts/sync-package-assets.js:620` into the runtime plugin; module list `plugins/agdf/scripts/check-runtime-integrity.mjs:1638-1639`; `scripts/public-plugin/validator.js:134-140`; Copilot exclusion by prefix `scripts/public-plugin/copilot-profile.js:110` | Toast, status line and sound are new calls inside the existing hooks; no new hook kind, manifest field or descriptor change is needed. A new module file must be added to the integrity file list. `ui.close` with origin `person` stops the refresh today (`register.mjs:226-234`), which conflicts with a status line that stays visible with the panel closed. | `low` |
| UI / UX | `view.mjs` (panel view and terminal text), `gate-bar.mjs` (fixed `GATES` from `run-state.mjs:5`), `figure.mjs` (`ACCESSORY_REGION` 48×48 px, `ACCESSORY_BOUNDS` per mood, `FIGURE_TEXT`), `state.mjs` (four moods, turn overlay), `locales.json` (titles "AGDF Companion" / "AGDF-Begleiter") | The gate bar, figure and terminal text derive from one view model; a new mark, variant and per-mode path extend the same owners. The desktop draws a Button's `label` while `claude plugin test` draws its children (`UAT_LIVE_RECHECK.md`), so new switches need live layout evidence at the default width. | `medium` |
| Persistence / data | `persistence.mjs` (`companion-state.json`, `schema_version: 1`, fields `enabled`, `still`, `selections`) in the AGDF plugin data directory | Two new persisted switches (toast, sound) extend the host-owned state file; `parseCompanionState` already turns missing or invalid fields into defaults, so the extension is additive and needs no migration. `.agdf/control` stays untouched. | `low` |
| Tests / QA | Suites `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-integrity-test.js` (`test:claude-companion` in `packages/cli/package.json:103`, CI domain in `scripts/ci-test-domains.mjs:15`); native `claude plugin validate` / `claude plugin test`; live desktop evidence | Logic, adapter and integrity suites exist with a fake host; new host calls (`$.ui.toast`, `$.ui.status`, `$.audio.play`, `$.settings.read`) must be added to the fake host. Toast, status line and sound are not yet observed live on Windows desktop. | `medium` |
| Release / operations | Runtime plugin payload shared by the Claude and Codex installations; compatibility records (`npm run compatibility:record`, `compatibility:check`); payload baseline `plugins/agdf/meta/copilot-payload-baseline.json`; native Claude evidence | Changed companion files change the runtime payload digest and require re-recorded compatibility evidence through the existing generators. Codex never loads the files and the Copilot payload excludes them, so no host activation or rollout changes. A sound asset would add a binary file to the runtime payload. | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The change stays inside the companion module boundary but consumes three further early-access host APIs (`$.ui.toast`, `$.ui.status`, `$.audio.play`) plus `$.settings.read`, extends the companion's own state file, adds a reader for the Mode/Slice Decision section and changes the companion's refresh lifecycle when the pane is hidden. No manifest, descriptor, shared definition, shared hook, Copilot inventory, core reader or `RUN_STATE.md` writer changes.
- architecture_evidence: `plugins/agdf/host-templates/claude/companion/register.mjs:73-84,201-246`; `run-state.mjs:5,53-81`; `persistence.mjs:5-34`; `scripts/public-plugin/manifest.js:83-107`; `scripts/public-plugin/validator.js:134-140`; `plugins/agdf/scripts/check-runtime-integrity.mjs:1635-1660`; `scripts/public-plugin/copilot-profile.js:110`; `packages/core/lib/control-evaluation/gate-check.js:141-181`; `packages/core/lib/control-evaluation/run-state-policy.js:45-51`; Claude Code 2.1.308 mod API declaration (`$.ui.toast`, `$.ui.status`, `$.audio.play`: "a Linux or Windows terminal, having no player, plays nothing", `$.settings.read`).
- architecture_missing_evidence: (1) Whether the Windows desktop app draws toasts, where it draws the plugin status line and whether it plays an audio clip — owner: TP host probe and live test. (2) The bounded refresh cost while the pane is hidden — owner: SD.
- architecture_next_owner_and_action: The SD author decides the mode reader and its parity tests against `modeSliceDecision` and `buildBreadcrumbPath`, the transition detector for toasts (run-derived state, no repeats), the hidden-pane refresh rule, the sound source and its payload effect, the language fallback order and the state-file extension; TP plans an early host probe for toast, status line and sound on the Windows desktop.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: second interpretation of the status-card path | The core owns the per-mode path in `BREADCRUMB_PATH_TEMPLATES` (`gate-check.js:141-148`) and the marks in `buildBreadcrumbPath` (`:158-181`); the companion cannot import core | warn | SD: mirror the path table and mark rules in the companion with a parity test against the core for fixtures of every mode, as `LIFECYCLES` is bound today |
| problem: second reading of the Mode/Slice Decision | `modeSliceDecision` returns `undecided` unless decision, scope reason and evidence are filled and no placeholder is present (`run-state-policy.js:45-51`); repository runs use values with and without backticks | warn | SD: read the decision with the same rule and bind it by a parity test against the core reader on canonical-writer fixtures |
| problem: placeholder rule outside the core | `isDecisionContentPlaceholder` (`decision-content-readiness.js:9`) defines placeholder text; the RUN_STATE template writes "Describe the trustworthy outcome." (`plugins/agdf/control/templates/RUN_STATE.md:18`) | warn | SD: mirror the rule for the objective with a parity test |
| unresolved: host behaviour of toast, status line and sound on Windows desktop | API declaration only; sound declared silent in Windows terminals | warn | TP: early host probe; PRD: acceptance wording that reports sound as observed |
| trade-off: refresh while the pane is hidden | `register.mjs:226-234` stops the refresh on a person's close; the status line needs current state | warn | UX intent / PRD: confirm the status line keeps reading while switched on; SD: bound the cadence and keep the stop on switch-off |
| problem: brand rename across texts and tests | `locales.json` titles and command texts; `INSTALL.md:1077-1143`; companion tests assert titles | none | CD+Tests: rename consistently; tests assert the single name in every locale |

No retained debt is accepted. All findings are design obligations with named owners; none prevents the sizing route.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice. One coherent companion outcome inside the existing Claude companion boundary: new visible states and feedback channels change user-facing semantics, so quick_task and verified_change are ineligible; no full-depth trigger applies because the manifest, descriptor, shared definition, shared hooks, Copilot inventory, core readers and the `RUN_STATE.md` format stay unchanged and propagation runs through the existing generators. Rejected alternative: structured_delivery, since release_cross_host_depth and architecture_runtime_depth were decisive for adding the companion but no host wiring, activation or cross-host contract changes now.
- evidence: This review (.agdf/control/artefacts/agdf-companion-followup-20261027-01/BROWNFIELD_REVIEW.md); approved UR revision 3; plugins/agdf/host-templates/claude/companion/register.mjs; scripts/public-plugin/manifest.js:83-107; scripts/public-plugin/validator.js:134-140; plugins/agdf/scripts/check-runtime-integrity.mjs:1635-1660; scripts/public-plugin/copilot-profile.js:110; packages/core/lib/control-evaluation/gate-check.js:141-181.
- transparency_note: The predecessor run was structured_delivery because it added a host runtime component to the shared payload. This follow-up changes only the contents of that component; the same gate sequence applies, with slice-depth artefacts limited to the companion, its state file, its tests and its documentation.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none. Authority: read-only, no approval surface (UR non-goals). Architecture/runtime: changes stay inside the companion module; the host isolation established by the predecessor (catch paths on every hook, T-001 failure variants) is reused. Persistence: additive fields in the companion's own state file with defaults. External contract: no public CLI, API, protocol or file format of AGDF changes. Release/cross-host: no manifest, descriptor, hook or Copilot change; compatibility evidence is re-recorded by existing generators. Coordination: all owners are in this repository.
- rejected_alternative: structured_delivery (no full-depth trigger evidenced); quick_task and verified_change (new user-visible semantics and feedback channels).
- missing_or_conflicting_facts: None for the depth decision. Toast, status-line and sound behaviour on the Windows desktop are later evidence obligations (TP host probe, live test) and affect presentation, not depth.
- depth_evidence_refs: Approved UR sections 3 to 5; register.mjs:73-84,201-246; persistence.mjs:5-34; scripts/public-plugin/manifest.js:83-107; scripts/public-plugin/validator.js:134-140; plugins/agdf/scripts/check-runtime-integrity.mjs:1635-1660; scripts/public-plugin/copilot-profile.js:110; .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/T-001_HOST_PROBE-02.md.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: the switched-on companion shows the build phase, the mode's path, waiting/blocked changes and a status line under one name (UR goal and acceptance signals 1 to 9) |
| authority_boundary | pass | Read-only display; toast and status line have no action; no approval, continuation or write (UR scope item 4 and non-goals) |
| owner_consumer_coordination | pass | Owners in this repository: companion modules, integrity file list, generators, compatibility records, `INSTALL.md`; the only consumer is the Claude companion host |
| full_depth_impacts_absent | pass | Manifest, descriptor, shared definition, shared hooks, Copilot inventory, core readers and `RUN_STATE.md` format unchanged (manifest.js:83-107, validator.js:134-140, copilot-profile.js:110) |
| migration_propagation_bounded | pass | Additive state-file fields with defaults (`parseCompanionState`); propagation by `build:prepare` and `compatibility:record`; revert is local |
| failure_recovery_local | pass | Every hook keeps its catch path (register.mjs:166-246); predecessor evidence T-001_HOST_PROBE-02.md shows AGDF dispatch, MCP and SessionStart unaffected by a failing companion |
| independently_acceptable | pass | Own acceptance signals; depends on no other run, release or publication |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| "builds" as fifth state label or variant of "working"; precedence over the active-turn overlay; wording in en and de | UX Intent / PRD | warn |
| Toast trigger and no-repeat rule (first read, run switching, several sessions, turn overlay), wording, timeout | UX Intent / PRD | warn |
| Switch placement for toast and sound within 40 columns, given that the desktop draws button labels | UX Intent / PRD | warn |
| Status-line wording per state and whether it stays while the panel is closed by the person | UX Intent / PRD | warn |
| Language fallback order without `.agdf/control` and mapping of Claude's free-text `language` setting | PRD / SD | warn |
| Mode reader, per-mode path and parity tests against `modeSliceDecision` and `buildBreadcrumbPath` | SD | warn |
| Sound source (asset file versus generated bytes), its payload effect and behaviour where no player exists | SD | warn |
| Hidden-pane refresh cadence and stop on switch-off | SD | warn |
| Early host probe for toast, status line and sound on Windows desktop and terminal | TP | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-STATUS-CARD
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: `companion_projection_20261027` lists the known limits this run removes (internal steps without a current mark, fixed seven-gate path, placeholder objective, English fallback). Curate the entry after implementation and host evidence, before clean closeout. No graph change was made by this review.

## Next Permissible Step

- next_allowed_action: Run UX intent definition for the new visible states and feedback channels, then draft the PRD.
- forbidden_until_then: SD, TP, implementation, payload changes and any approval request beyond the PRD sequence.

## Quality Outlook

- quality_outlook: Low to medium risk. The main quality levers are parity tests that bind the per-mode path, mode reader and placeholder rule to the core, a transition detector tested against noisy sequences (turn overlay, run switching), and an early host probe that settles what the Windows desktop actually shows and plays.
