# PRD: Delivery Path Search Control Input Integrity

Status: approved
Gate: PRD
Gate approval: approved on 2026-08-30 with exact user response
Based on: approved UR and completed Brownfield Review
Date: 2026-08-30
Owner: user / agent

## 1. Product Scope

Delivery Path Search must consume one canonical evaluated control snapshot for the exactly selected
run. It must distinguish failures before evaluation from evaluated search conclusions in its JSON,
terminal and optional persisted projections.

The product change covers canonical action parity, input/candidate/evaluation provenance, typed
terminal outcomes, visible recovery and real-run regression coverage. It does not change gate
authority, scoring, generator budgets or provider fallback policy.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: `.agdf/control/artefacts/delivery-path-search-control-input-integrity/UX_INTENT_DEFINITION.md` (`ready`)
- primary_user_intent: Compare only currently legal delivery actions for one selected run and understand whether evaluation actually occurred.
- success_signal: Zero-candidate or zero-evaluation input failures are visibly classified as unavailable/error states, never as an evidence-backed recommendation conclusion.
- primary_decision_or_action: Follow an advisory path only after checking the visible selected scope, evaluation provenance and canonical next gate action.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| input resolution | ready or unavailable | run, revision, objective, gate, action counts, reason | canonical selected-run gate evaluation | Delivery Path Search CLI projection |
| candidate preparation | candidates ready or no legal candidates | baseline/generated/rejected counts and reason | candidate policy | Delivery Path Search CLI projection |
| evaluation | running, completed, unavailable or failed | enforcement, evaluator, evaluation count, budgets, failure | search core plus transport evidence | Delivery Path Search CLI projection |
| terminal decision | recommendation, no safe recommendation, unavailable or error | status, rationale/reason and one next action | search core; gate-check remains execution authority | CLI/JSON and optional persisted projection from the same result |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Activate only after exactly one run is selected and canonical gate evaluation succeeds for its current revision. Stop before evaluator invocation when input is unavailable or no legal candidates exist.
- blockers_and_visible_next_actions: Ambiguous/stale run routes to fresh gate-check; missing canonical actions routes to control-state repair; unrelated product intent routes to a separate governed scope; evaluator failure routes to capability repair without weaker fallback.
- recovery_paths: Every recoverable pre-evaluation or transport outcome exposes exactly one corrective next action. Retrying requires a fresh canonical snapshot; mutation detection requires investigation before any retry.
- relevant_state_transitions: `selected → input_ready | input_unavailable`; `input_ready → candidates_ready | no_legal_candidates`; `candidates_ready → evaluating`; `evaluating → recommendation | no_safe_recommendation | evaluator_error | budget_stop`. The visible result includes source and target evidence through counts and reason codes.

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success | required evidence |
|---|---|---|---|---|---|---|---|---|---|
| DPSI-01 | input resolution | selected canonical run | invoke search | current gate, allowed and forbidden actions equal canonical gate-check for the same run/revision | selected identity and non-zero action count when actions exist | parity mismatch stops before evaluation | rerun/repair canonical gate evaluation | no Markdown/presentation parsing decides authority | integration test against a real run without Run Status Card |
| DPSI-02 | input resolution | canonical snapshot unavailable | invoke search | `input_unavailable` terminal state | zero evaluations, typed reason and recovery | no candidate or evaluator call | run canonical gate-check or repair state | no recommendation field is presented | negative CLI and library tests |
| DPSI-03 | candidate preparation | valid input | all candidates removed or none legal | `no_legal_candidates` terminal state | baseline, rejected and legal counts plus reason | evaluator is not called | inspect gate/scope and rerun with valid governed scope | no recommendation conclusion at zero legal candidates | candidate-policy and CLI tests |
| DPSI-04 | evaluation | one or more legal candidates | evaluator returns contract-valid results | recommendation or contract-valid evaluated no-safe outcome | evaluation count is greater than zero with budgets and rationale | invalid results cannot become recommendation | repair evaluator and retry from fresh snapshot | recommendation provenance is visible | search-engine tests |
| DPSI-05 | terminal decision | zero valid evaluations | search terminates | status is not `recommendation` and not an evaluated `no_safe_recommendation` | typed unavailable/error outcome with stopping reason | `candidate_queue_exhausted` alone is insufficient product meaning | follow the typed recovery action | zero-evaluation ambiguity is impossible | regression for reproduced defect |
| DPSI-06 | scope integrity | selected run objective | caller considers result | result exposes selected run, revision/objective and states that it applies only to that scope | scope identity appears in JSON and human output | search never claims relevance to an unrelated question | create/select the correct governed scope | agent cannot cite the result as comparison evidence for another objective | skill/eval regression plus projection test |
| DPSI-07 | authority | any terminal state | search completes | search remains advisory and gate-check remains authoritative | next gate action is visible | no status grants implementation or approval | run canonical gate-check | existing authority invariants remain unchanged | existing and new negative tests |
| DPSI-08 | transport | evaluator unavailable/error | evaluator preflight or call fails | typed evaluator outcome, original enforcement level and zero/partial evaluation provenance | adapter/failure evidence and one recovery | no automatic weaker/provider fallback | repair declared evaluator or use documented instruction-only workflow | failure is honest and bounded | adapter and CLI tests |
| DPSI-09 | projection | any terminal state | request JSON, terminal or persistence | all projections preserve the same status, counts, reason and next action | no projection reclassifies the result | invalid/non-terminal input is not persisted as a decision | repair input and rerun | JSON/text/persistence parity | focused persistence and CLI tests |
| DPSI-10 | distribution | source behavior passes | build generated assets/packages | canonical contract and skill wording propagate without drift | versioned source/generated/package identity remains separate | source tests do not claim installed-host behavior | run release preparation and package tests | all generated validators carry the same semantics | release and package regression evidence |

## 6. Non-Goals

- New search algorithms, score dimensions, thresholds or budget defaults.
- New agent provider, automatic fallback or wider external context.
- Persisting the Run Status Card or creating a second gate/scope evaluator.
- Using Delivery Path Search for an ungoverned question unrelated to the selected run.
- Changing Product Maturity Roadmap evidence or approvals.

## 7. Users And Roles

- Operator/user: sees scope, provenance, result and recovery; decides whether to follow advice.
- Calling agent: invokes search only for the selected governed objective and re-runs gate-check afterward.
- Canonical gate evaluator: owns selected-run authority and legal actions.
- Search core: owns advisory candidate/evaluation outcomes only.
- Surface adapters: own transport and enforcement evidence, not policy.

## 8. Constraints

- Existing exact gate legality and read-only mutation guards remain fail closed.
- The public JSON contract uses additive typed outcomes with a documented compatibility decision in SD.
- Canonical run selection and revision identity must remain shared with doctor/gate-check/delivery-map.
- Generated bundle, package, installed runtime and fresh-host behavior remain separate evidence planes.
- No recommendation may be persisted when canonical input was unavailable.

## 9. Evidence Requirements

- Unit tests for canonical input validation and candidate/outcome distinctions.
- Integration fixture using a canonical run without a persisted Run Status Card.
- CLI JSON and terminal projection tests for every new terminal outcome.
- Negative evaluator-call assertions for pre-evaluation stops.
- Existing Delivery Path Search, control-state, CLI modularization, package and release-projection tests.
- Diff and mutation-guard evidence; installed-host evidence only if later explicitly claimed.

## 10. Risks And Open Questions

- SD must select a reusable canonical snapshot API without importing presentation or creating a cycle.
- SD must define exact compatibility behavior for existing `status` consumers and persisted summaries.
- TP must prove that `no_safe_recommendation` cannot occur at zero valid evaluations.
- Scope relevance beyond the selected run remains an invocation contract; the tool must expose scope
  identity and the skill must not overstate relevance.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
