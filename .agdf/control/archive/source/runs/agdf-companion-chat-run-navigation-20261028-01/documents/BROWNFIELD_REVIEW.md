# Brownfield Review: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- related_ur: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/UR.md` (approved, revision 5)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-10-28

## Objective

Size and route the approved UR: let the opt-in Claude companion recognize the run the chat works on from the text of main-loop turns, return to it with the next turn or a control, allow browsing from it, show "waiting" ahead of the turn overlay, set the footer flush with the pane's bottom edge, and record the panel changes of commits `3444befe` and `2f54fbcc` with their evidence. The companion stays read-only, observation-only, failure-isolated and Claude-only.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change alters effective-state semantics of the existing companion capability: which run is shown (a new signal "named in the chat" beside "changed in this session" and the user's selection), when the shown run changes by itself (automatic return at the next main-loop turn), a new control "Zurück zum Chat-Run", browsing from the chat's run, and the precedence of "waiting" over the turn overlay. It stays inside the one companion capability and adds no authority.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

The inputs for UX intent definition are complete: the approved UR with the owner decisions and findings of 2026-10-28, the approved UX intent of runs `agdf-begleiter-companion-20261025-01` and `agdf-companion-followup-20261027-01`, and the live screenshots of 2026-10-28. UX intent definition must settle: the ranking of "named in the chat", "changed in this session" and the user's selection; how the origin of the shown run reads; when the return control shows and where; how long the chat's run is remembered; and whether "blocked" also wins over the turn overlay.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; the approved PRD/SD of `agdf-begleiter-companion-20261025-01` (run assignment SDD-06, AC-004: the run changed in this session first, then the remembered selection, never a guess) and of `agdf-companion-followup-20261027-01`; `INSTALL.md` "Which run it shows" | A third signal and an automatic return change the approved assignment rule; "never a guess" stays, since only an id the chat names counts | `medium` |
| Source of truth | `RUN_STATE.md` read through `run-state.mjs`; the assignment in `assignment.mjs:16-24` (`assignRun`: changed in session, then selection) and `stepSelection` (`:27-32`); the persisted selection in `companion-state.json` (`persistence.mjs`) | The companion reads run ids from the snapshot it already holds; the chat's run is session state, not a new persisted field unless UX/PRD decide otherwise | `low` |
| Runtime path | `register.mjs` hooks `turn.start` (`:344-352`) and `turn.complete` (`:354-366`, `const answered = await next(e)`); the stepping row is drawn only when `view.originKind !== 'session'` (`:255`); the desktop body uses `minHeight: rows - 1` (`:278`) | Both turn hooks exist; the prompt text is `e.text` at `turn.start`, the main-loop answer is `answered.text` from `next(e)` (Claude Code 2.1.308 declaration of `TurnCompleteResult`). No new hook kind is needed | `low` |
| UI / UX | `state.mjs:39-43` `displayState` lays "läuft" over every derived mood except `baut` while a turn is active; `view.mjs` origin labels ("In dieser Sitzung geändert", "Von dir ausgewählt"); footer, menu and run list from commits `3444befe` and `2f54fbcc` | "waiting" is overlaid during a turn today; a precedence change touches one rule. The footer gap of about two rows comes from the one-row reserve plus the pane margin (live screenshot of 2026-10-28) | `medium` |
| Persistence / data | `persistence.mjs` (`companion-state.json`, `selections` per project) | Browsing writes the selection today; a temporary browse that ends at the next turn may need an unpersisted override instead of a stored selection; decided in SD | `low` |
| Tests / QA | Suites `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-integrity-test.js`; native `claude plugin validate` and `claude plugin test` (scratch generator); live desktop probe via a dev-mod copy and window capture (2026-10-28) | The fake host already fires `turn.start` and `turn.complete`; tests can pass prompt and answer texts. The panel changes of `3444befe` and `2f54fbcc` are already covered by the adapter suite at those commits | `low` |
| Release / operations | Runtime plugin payload; compatibility records (`npm run compatibility:record`, `compatibility:check`); pull request #40 | Changed companion files change the payload digest and require re-recorded compatibility evidence through the existing generators; Codex and Copilot never load the companion | `low` |

## Architecture Impact

- architecture_relevance: `not_applicable`
- architecture-not-applicable: The change stays inside the companion module and its existing hooks: it reads text the existing `turn.start` and `turn.complete` hooks already receive, keeps its session state in memory, and changes drawing rules. No manifest, descriptor, shared definition, shared hook, Copilot inventory, core reader, `RUN_STATE.md` writer, public interface or host contract changes.
- architecture_evidence: `plugins/agdf/host-templates/claude/companion/register.mjs:255,278,344-366`; `assignment.mjs:16-32`; `state.mjs:39-43`; `persistence.mjs`; Claude Code 2.1.308 declaration of `TurnStartInput.text` and `TurnCompleteResult.text`.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: a second assignment rule beside `assignRun` | `assignment.mjs:16-24` owns which run is shown | warn | SD: extend `assignRun` with the chat signal and the temporary browse, keep one owner and extend its tests |
| problem: run-id recognition in free text | Answers can list several runs; ids can share prefixes (for example `...-01` inside a longer id) | warn | PRD/SD: whole-token matching against the snapshot's open ids, "last named wins", tests with lists and prefixes |
| unresolved: the answer text at `turn.complete` on the desktop | Declared by the API; not yet observed live | warn | TP: early host probe that the desktop hands the main-loop answer to `turn.complete` |
| trade-off: "waiting" ahead of the turn overlay | `state.mjs:41`; the recording turn shows "waiting" until the run state is written | none | UX intent / PRD: confirm; accepted in UR risks |
| unresolved: sub-row sizing of the desktop body | `register.mjs:278` (`rows - 1`); a full `rows` showed a scrollbar in the live probe | warn | TP: live probe of a finer reserve; CD+Tests: keep no scrollbar |
| problem: retroactive recording of commits `3444befe` and `2f54fbcc` | The completed run's artefacts describe buttons; the commits carry the footer, menu, About, sized list and gate bars | none | PRD/SD/TP: describe the delivered panel as the baseline of this run and cite the commits' tests and the live screenshots |

No retained debt is accepted. All findings are design or evidence obligations with named owners; none prevents the sizing route.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice. One coherent companion outcome inside the existing companion boundary: chat-run recognition, automatic return, a return control, browsing from the chat's run, "waiting" ahead of the turn overlay and a flush footer change user-facing effective-state semantics of an approved assignment rule, so quick_task and verified_change are ineligible; no full-depth trigger applies because no manifest, descriptor, shared hook, Copilot inventory, core reader, `RUN_STATE.md` format or host contract changes. Rejected alternative: structured_delivery, since no host wiring, activation or cross-host contract changes.
- evidence: This review (.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/BROWNFIELD_REVIEW.md); approved UR revision 5; plugins/agdf/host-templates/claude/companion/register.mjs:255,278,344-366; assignment.mjs:16-32; state.mjs:39-43; commits 3444befe and 2f54fbcc.
- transparency_note: The UR named a compact path as a possibility; the review finds new effective-state semantics with a medium UI/UX impact, which requires UX intent definition and the structured slice sequence.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none. Authority: read-only, no approval surface (UR non-goals). Architecture/runtime: inside the companion module and its existing hooks. Persistence: at most additive fields in the companion's own state file. External contract: no public CLI, API, protocol or file format of AGDF changes. Release/cross-host: no manifest, descriptor, hook or Copilot change; compatibility evidence is re-recorded by existing generators. Coordination: all owners are in this repository.
- rejected_alternative: structured_delivery (no full-depth trigger evidenced); quick_task and verified_change (new effective-state semantics with medium UI/UX impact).
- missing_or_conflicting_facts: None for the depth decision. The answer text at `turn.complete` and the sub-row sizing on the desktop are later evidence obligations (TP host probe, live check) and affect behavior details, not depth.
- depth_evidence_refs: Approved UR sections 3 to 5; register.mjs:255,278,344-366; assignment.mjs:16-32; state.mjs:39-43; persistence.mjs.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: the companion follows the chat's run, lets the user browse and return, shows waiting correctly and keeps its footer at the bottom edge (UR goal and acceptance signals 1 to 9) |
| authority_boundary | pass | Read-only display; the return control changes only what the panel shows; no approval, continuation or write (UR non-goals) |
| owner_consumer_coordination | pass | Owners in this repository: companion modules and suites, generators, compatibility records, `INSTALL.md`; the only consumer is the Claude companion host |
| full_depth_impacts_absent | pass | No manifest, descriptor, shared hook, Copilot inventory, core reader or `RUN_STATE.md` change; the turn hooks exist (`register.mjs:344-366`) |
| migration_propagation_bounded | pass | Session state in memory or additive state-file fields with defaults; propagation by `build:prepare` and `compatibility:record`; revert is local |
| failure_recovery_local | pass | Every hook keeps its catch path; the recognition reads text the hook already holds and fails silently |
| independently_acceptable | pass | Own acceptance signals; depends on no other run, release or publication |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Ranking of "named in the chat", "changed in this session" and the user's selection; origin wording | UX Intent / PRD | warn |
| When "Zurück zum Chat-Run" shows, its wording and place (panel and footer menu) | UX Intent / PRD | warn |
| How long the chat's run is remembered (session only or stored) | UX Intent / PRD | warn |
| Whether "blocked" also wins over the turn overlay | UX Intent / PRD | warn |
| Recognition rule: whole-token match, last named wins, prompt versus answer | PRD / SD | warn |
| Temporary browse versus stored selection; extension of `assignRun` and its tests | SD | warn |
| Footer sizing without the extra empty row and without a scrollbar | SD / TP | warn |
| Host probe that the desktop hands the main-loop answer to `turn.complete` | TP | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-STATUS-CARD
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The entry `companion_followup_20261028` describes the companion's assignment and panel; curate it after implementation and live evidence, before clean closeout. No graph change was made by this review.

## Next Permissible Step

- next_allowed_action: Run UX intent definition for the changed assignment and state semantics, then draft the PRD.
- forbidden_until_then: SD, TP, implementation, payload changes and any approval request beyond the PRD sequence.

## Quality Outlook

- quality_outlook: Low to medium risk. The main quality levers are one assignment owner with tests for every signal combination, recognition tests against lists and shared prefixes, an early host probe of the answer text on the desktop, and live screenshots of the footer without the extra row.
