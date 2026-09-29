# Brownfield Analysis: Klare nächste Schritte in AGDF-Karten

Status: complete
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Based on: approved TP revision 13
Date: 2026-09-28
Reviewer: Codex

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_ANALYSIS.md`
- scope: Six approved TP tasks, eight PRD criteria and four SD decisions; implementation preparation only. No code or tests were changed or run during this analysis.
- evidence: Current source confirms the existing canonical owners listed below. The planned implementation/test source paths are clean in the current worktree. `plugin/meta/contracts/interaction.md` requires exact Markdown pass-through. Existing `run-presentation.js` already binds the artefact and summary digests and revalidates the run/gate/revision/presentation. The gate-check after TP approval returned `doctor_status: pass` and allowed this analysis.
- transparency: This establishes a repository implementation path, not loaded-host behavior. The current TP approval presentation (`43799fda-14f6-42cc-a697-8ebc2564368f`) itself shows the task summary clipped with an ellipsis. This is a concrete regression case for the approved complete-summary outcome; the linked TP remains the full review source. No native host session was inspected here.
- missing_evidence: Four fresh host sessions using the implementation revision remain required by AC-006. The Brownfield dispatcher reported a separate installed runtime (`0.14.5`, digest `0840e2757c47fd5e479f2a4bdcc7b825e5123e81e483418a0a221bfea60682b0`); no evidence yet shows that any fresh host session consumes this worktree revision. The PRD excludes host-plugin installation/update/restart, so a stale host remains an explicit evidence gap, never a passing result.
- current_coverage: Target/setup/status/approval renderers and locale catalogue exist; state ownership and verbatim adapters exist; implementation behavior remains incomplete. Existing localization and control-state tests reproduce or assert portions of the current undesired behavior. No test result is claimed.
- reuse_strategy: Extend `gate-check.js`, `interaction-presentation.js`, `run-presentation-render.js`, the existing locale catalogue and their current contract/test owners. Keep target/run/gate state authoritative, keep summary content in the exact gate artefact, and reuse the existing digest binding and package synchronization. Add no parallel card renderer, blocker store, adapter or approval authority.
- risks: Structured blocker/readiness details must reach the renderer without changing the public card schema or persisting a second state. Unknown actor/action and invalid summaries must fail closed. The generated package can drift from source. Human translation fidelity and direct host visibility need separate evidence. Do not weaken old assertions without replacing them with approved behavior.
- context_graph_impact: `none`; the review confirms existing owners and run-local risks without changing durable ownership or architecture records.
- required_next_step: Implement only the approved TP tasks, beginning with canonical target/setup/status projections and localized action recovery; then implement complete digest-bound summaries, update the existing regressions, synchronize package assets, run the planned repository checks, and keep the four direct host observations separate.

## Existing Owners And Evidence

| Concern | Existing owner | Observed behavior and evidence | Planned reuse |
|---|---|---|---|
| Target authority and resolution | `create-agdf/lib/task-target-resolution.js`; `plugin/meta/contracts/task-target-resolution.md` | Normalized result carries resolution state, reason code, target and next action. `renderTaskTargetOrientation` has fixed reason-code copy and returns no card when required copy is absent (`create-agdf/lib/interaction-presentation.js`). | Preserve resolver and target authority; improve the existing localized orientation and safe missing-detail response only. |
| Setup state | Existing doctor/control-setup evaluation; `renderControlSetupOrientation` in `create-agdf/lib/interaction-presentation.js` | Setup response projection carries explicit scope, effect, excluded authority and authorize/cancel choice. | Retain explicit setup decision and its separation from UR/gate approval. |
| Run actor, blocker and next action | `create-agdf/lib/control-evaluation/gate-check.js`; selected `RUN_STATE.md`; `create-agdf/lib/interaction-presentation.js` | `buildStatusCard` already receives `user_action_required`, `internal_next_step`, `blocking_condition`, `allowed_now` and `next_step`. PRD readiness details remain in `prd_readiness.open_decisions`. For unrenderable free-text actions, gate-check selects the transition fallback at lines 287–292 and 383–395; the card renderer emits allowed/forbidden/blocker/missing/step rows at lines 493–509 but has no distinct visible wait/actor row. | Project canonical actor/wait/blocker details into the existing non-authorizing Markdown renderer; do not infer from prose or persist a new blocker state. |
| Approval summary and authority | `create-agdf/lib/control-state/run-presentation-render.js`; `create-agdf/lib/control-state/run-presentation.js` | The current summarizer heuristically detects language, limits each summary item to 280 characters, caps PRD acceptance extracts at two and TP task extracts at three, and clips with an ellipsis. The current TP presentation visibly ends its task summary with an ellipsis. The existing presentation binding stores artefact/summary/presentation digests and revalidates the exact run, gate and revision. | Use an authored summary in the same canonical artefact, validate stable-ID coverage and bind the exact selected summary through the existing `summary_digest` path. Add a regression for the observed TP-card truncation under the approved complete-summary behavior. |
| Locale and host projection | `plugin/meta/agdf-interaction-locales.json`; `plugin/meta/contracts/interaction.md`; existing surface adapters | The contract assigns status Markdown to `interaction-presentation.js` and requires verbatim host pass-through. `create-agdf/scripts/sync-package-assets.js` copies the locale/runtime material to generated surfaces. | Add fixed localized labels/recovery copy to the shared registry; do not add host-local templates or translation in adapters. |
| Regression and package integrity | `create-agdf/scripts/interaction-presentation-test.js`; `operational-localization-test.js`; `control-state-test.js`; `gate-check-missing-control-test.js`; package-build and runtime-integrity test scripts | `operational-localization-test.js` currently expects German to omit the free-text action. `control-state-test.js` expects the German PRD summary to disclose original English excerpts. These assertions encode the behavior the approved PRD changes. The existing package scripts expose focused renderer, localization, state, package and integrity checks. | Replace those expectations with criteria/action/blocker coverage, digest and authority assertions; run asset synchronization before package/runtime-integrity validation. Tests were not run during this analysis. |

## Reuse And Parallel-Structure Risk

| Classification | Finding | Evidence | Required control |
|---|---|---|---|
| `problem` | An unrenderable action can be replaced by a generic transition action, while structured readiness detail is not yet represented in the visible card. | `gate-check.js` action fallback and separate `prd_readiness.open_decisions`; current renderer rows in `interaction-presentation.js`. | Use a fixed locale catalogue for known values and a localized focused clarification for unknown values; pass structured findings through the existing evaluation path. |
| `problem` | Approval summaries can expose foreign-language excerpts and truncate decision-relevant lists. | `run-presentation-render.js` language heuristic, per-item clipping and gate-specific list caps; direct TP presentation `43799fda-14f6-42cc-a697-8ebc2564368f`. | Select a complete authored locale section from the digest-bound artefact, validate stable-ID coverage, reject incomplete input, and bind the exact summary digest. |
| `trade-off` | Fresh host sessions may load an installed runtime that is not the worktree revision. | Rationale: the PRD excludes host-plugin installation/update/restart, while generated assets and installed host runtime have separate owners; the dispatcher returned a distinct installed-runtime digest. | Owner: Arndt Gold for AC-006 acceptance evidence. Mitigation: record host, runtime version and revision for each direct session; never substitute CLI output. Exit condition: resolve before requesting QA approval; if a host cannot load this revision, leave AC-006 open and do not claim QA pass. |
| `none` | No competing state or presentation owner is required. | Existing interaction contract assigns one canonical status renderer, one approval renderer and verbatim adapters. | Keep the two renderer responsibilities distinct and share only the locale source and existing approval binding. |

## Minimal Implementation Path

1. Extend the existing gate-check-to-status projection and `interaction-presentation.js` to render the acting party, named wait, true blocker details and exact safe next action from canonical state.
2. Extend `run-presentation-render.js` to select and validate complete locale-specific summaries from the current artefact, including the approved stable criterion/decision coverage, and retain exact artefact/revision/summary digest binding in `run-presentation.js`.
3. Update the existing locale and interaction-contract owners; leave host adapters and public machine schemas unchanged.
4. Replace the behavior-locking assertions in the existing renderer/state regression suites, add boundary cases for unknown actions, blocker-versus-wait and invalid summaries, and specifically prevent recurrence of the observed ellipsis on the TP task summary.
5. Run the existing generation path, focused regression suites and package/runtime-integrity checks. Then collect separate fresh-session evidence for each requested host; repository tests alone cannot close AC-006.

## Completion Boundary

This analysis passes the reuse, ownership and local regression-path review and permits the next control step `CD+Tests`. It does not claim implementation, test success, package freshness, host-native rendering, QA readiness or release readiness. The direct host observations remain a named post-implementation evidence obligation.
