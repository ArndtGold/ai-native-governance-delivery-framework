# UR: Delivery Path Search Control Input Integrity

Status: approved
Gate: UR
Gate approval: approved on 2026-08-30 with exact user response
Date: 2026-08-30
Owner: user / agent

## 1. Problem

Delivery Path Search can read an empty `allowed_actions` list from a valid canonical run when the
run does not persist a `Run Status Card`. It then creates zero candidates and reports
`no_safe_recommendation` with `candidate_queue_exhausted`, even though no candidate was evaluated.
This result can be mistaken for an evidence-backed product recommendation.

The command also receives only the selected run's current gate actions. It cannot safely answer a
new product question whose objective and candidate paths are not represented by that run.

## 2. Goal

Make Delivery Path Search consume canonical evaluated gate actions, distinguish unavailable or
empty search input from a genuine evaluated `no_safe_recommendation`, and make scope mismatch visible
before evaluation.

## 3. Scope

- Reuse the canonical gate-evaluation owner for `current_gate`, allowed actions and forbidden actions
  instead of depending on a persisted presentation section.
- Fail closed with a typed, non-recommendation outcome when canonical actions cannot be derived or
  when the candidate space is empty before evaluation.
- Report candidate counts, evaluation counts and the reason why evaluation did not start.
- Preserve exact gate legality, read-only enforcement and the rule that search never grants
  implementation or approval authority.
- Add integration coverage using a real canonical `RUN_STATE.md` without a persisted Run Status Card.
- Add a scope-mismatch regression proving that a selected run cannot answer an unrelated new
  product question.

## 4. Non-Goals

- No broader search algorithm, scoring-policy or budget redesign.
- No new AGDF gate or approval value.
- No persisted Run Status Card and no second gate-policy owner.
- No automatic creation of product candidates outside the selected run's current authority.
- No change to the Product Maturity Roadmap or its blocked PMR-6 evidence protocol.

## 5. Acceptance Signals

- A valid run without a persisted Run Status Card receives the same allowed and forbidden actions as
  canonical `gate-check` for the same run and revision.
- A missing canonical action set cannot return `no_safe_recommendation`.
- An empty pre-evaluation candidate space returns a typed input/candidate outcome with zero
  evaluations and an explicit recovery action.
- `no_safe_recommendation` is reserved for a non-empty legal candidate set that was actually
  evaluated and produced no safe leader.
- Fixture, unit, integration and CLI regression tests cover the distinctions above.
- Existing Delivery Path Search enforcement, budgets and gate revalidation remain intact.

## 6. Existing Source Of Truth

- `create-agdf/lib/control-evaluation/gate-check.js` and its shared gate-policy path own canonical
  evaluated actions.
- `create-agdf/lib/delivery-path-search/state-adapter.js` adapts control state into search input.
- `create-agdf/lib/delivery-path-search/candidate-policy.js` creates and filters candidates.
- `create-agdf/lib/delivery-path-search/search-engine.js` owns search outcomes and stopping reasons.
- `plugin/meta/contracts/control-scaffold.md` and `gate-transition.md` own the authority boundary.

## 7. Risks And Unknowns

- Brownfield Review must identify the narrowest reusable gate-evaluation API and avoid a circular
  dependency between CLI evaluation and Delivery Path Search.
- PRD or SD must decide the stable machine-readable outcome names and compatibility behavior if the
  public JSON contract changes.
- Tests must distinguish an unavailable input, an empty legal candidate set, rejected candidates and
  an evaluated but unsafe set without weakening fail-closed behavior.
- Source, generated plugin bundle and installed runtime remain separate evidence planes.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
