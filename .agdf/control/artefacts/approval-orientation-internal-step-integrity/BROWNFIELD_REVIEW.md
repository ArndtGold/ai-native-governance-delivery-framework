# Brownfield Review: Approval Orientation Internal-Step Integrity

Status: `done`
Mode: `post_ur_review`
Decision: `pass`
Run: `approval-orientation-internal-step-integrity`
Date: 2026-08-21

## Scope And Routing

- mode_slice_decision: `quick_task`
- required_next_gate: `none`
- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The change corrects one bounded approval-transition sentence so existing
  internal-step and user-decision semantics are presented accurately; it introduces no new action,
  state, activation or recovery behaviour.
- ux_intent_definition_required: `no`
- scope_reason: The approved defect has one canonical presentation owner, clear existing contract
  semantics, no new product or public-schema behaviour, no architecture/policy/persistence/release
  effect, and deterministic focused regression coverage. The production change can remain confined
  to the necessarily coupled approval-orientation builder and validator in one source file; the
  required regression test is the criterion's explicit test obligation.

## Existing-System Coverage

| Area | Coverage | Evidence | Reuse decision |
|---|---|---|---|
| Canonical post-approval fields | `fully_done` | `create-agdf/lib/control-evaluation/gate-check.js` already distinguishes immediate step, next user gate and user-action requirement | reuse unchanged |
| Normative interaction semantics | `fully_done` | `plugin/meta/contracts/interaction.md` already requires no-action narration for internal steps | reuse unchanged |
| Localized copy | `fully_done` | `plugin/meta/agdf-interaction-locales.json` already owns suitable no-action and next-decision strings | reuse unchanged |
| Approval snapshot builder | `partially_done` | Immediate step is correct, but user-decision narration uses `next_gate_after_approval` | correct locally |
| Approval snapshot validator | `partially_done` | Validation reconstructs the same faulty rule | correct necessarily coupled validation |
| Regression tests | `partially_done` | Structure and canonical approval are covered; UR/TP internal-step narration is not | extend focused suite |

## Affected Owners And Paths

- canonical source owner: `create-agdf/lib/interaction-presentation.js`
- direct regression owner: `create-agdf/scripts/interaction-presentation-test.js`
- unchanged semantic owners: `plugin/meta/contracts/interaction.md`,
  `plugin/meta/contracts/gate-transition.md`, `plugin/meta/agdf-interaction-locales.json`
- unchanged status-field owner: `create-agdf/lib/control-evaluation/gate-check.js`
- excluded unrelated paths: Harness-run files and `.github/workflows/publish-create-agdf.yml`

## Reuse Strategy

- strategy: `refactor`
- preserve `next_gate_after_approval` as the immediate process-step source and the existing
  `gate_transition_card.next_gate` field;
- derive builder narration from canonical `next_user_gate` and `user_action_required` with explicit
  consistency checks;
- make validation distinguish recognized user gates from internal steps instead of treating every
  non-`none` next step as a user decision;
- reuse the existing locale strings; create no second renderer, transition map or locale owner.

## Narrow Code-Fix Criterion

| Criterion | Result | Evidence |
|---|---|---|
| Production diff confined to one function plus its necessarily coupled validator in one file | `pass` | Candidate owner is `create-agdf/lib/interaction-presentation.js`; both functions construct/validate one snapshot contract. |
| Automated regression exercises the fixed behaviour | `pass` | Required change is limited to the existing interaction-presentation test suite; execution remains an implementation obligation. |
| No PRD/SD/TP, gate, approval formula, CLI flag or output-schema change | `pass` | Existing fields and localized copy are sufficient; UR forbids schema expansion. |
| Doctor and directly affected tests retain their shape | `pass` | Commands and suites already exist; no skip or weakening is planned. Post-fix passing output remains required evidence. |

If implementation requires any additional production file, locale/contract mutation or schema
change, this eligibility fails and the run must escalate before continuing.

## Impact And Risk

- interfaces: serialized schema remains unchanged;
- persistence/migration: none;
- backwards compatibility: corrected text only; field names and values remain stable;
- security/permission/authority: no authority change; misleading narration is removed;
- side effects: approval envelopes for internal post-approval steps change their localized sentence;
- parallel-structure risk: low when existing renderer, validator and locale registry remain sole owners;
- SoT drift: none; current implementation, not the normative contract, is inconsistent;
- visible-state owner: approval orientation remains owned by the existing canonical renderer;
- UI monolith risk: not applicable.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The fix restores existing owner boundaries and introduces no reusable new
  architecture decision.

## Evidence And Missing Evidence

- evidence: approved UR; exact-version gate check; existing interaction and transition contracts;
  current renderer/validator source; existing locale registry and focused test suite.
- missing_evidence: passing post-fix focused tests, doctor, package smoke/runtime integrity and
  mandatory Code Review.
- transparency: PRD, SD and TP are skipped because the approved behaviour and owner are already
  unambiguous and the Narrow Code-Fix Criterion is satisfied. This does not waive implementation,
  regression, Code Review or OR evidence.

## Required Next Step

Execute only the bounded Quick Task implementation, add the required regression assertions, run the
declared checks, then perform mandatory Code Review and OR-lite closeout.
