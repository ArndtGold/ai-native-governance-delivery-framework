# Brownfield Analysis: Cross-Surface Skill Target Preflight

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/cross-surface-skill-target-preflight/BROWNFIELD_ANALYSIS.md`
- scope: Approved TP Revision 1, CSTP-T02 through CSTP-T10 implementation and tests; T11 reviews
  and T12 host evidence remain downstream evidence work.
- transparency: Existing target, presentation, quality, generation and integrity owners are reused.
  No new resolver, renderer, public schema, gate or host-specific semantic owner is required.
- missing_evidence: Implementation diff, generated-profile parity, regression results, mandatory
  reviews and fresh-session host observations do not exist yet.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- required_next_step: Extend the shared target contract and its ten canonical skill consumers, then
  run the approved deterministic test plan before mandatory reviews.

## Current Coverage

| Area | Coverage | Evidence |
|---|---|---|
| Target semantics and fail-closed result | `fully_done` | `plugin/meta/contracts/task-target-resolution.md`; `create-agdf/lib/task-target-resolution.js` |
| Localized target orientation | `fully_done` | `plugin/meta/contracts/interaction.md`; `create-agdf/lib/interaction-presentation.js`; locale registry |
| gate-check direct preflight | `partially_done` | `plugin/skills/gate-check/SKILL.md` has a local operational preflight and terminal early return |
| Other nine canonical skills | `not_done` | Their Runtime Contract sections do not consume target and interaction contracts |
| QA repository self-discovery | `not_done` | `plugin/skills/qa-gate/SKILL.md` lists inputs but no resolved-target run-selection and durable-evidence workflow |
| Cross-surface generation | `fully_done` | `create-agdf/scripts/sync-package-assets.js` projects canonical skills and contracts to all four profiles |
| Integrity enforcement | `partially_done` | `plugin/scripts/check-runtime-integrity.mjs` asserts gate-check boundaries but not the complete skill set |
| Behavioral evals | `partially_done` | Gate-check has target cases; the other skills lack direct unresolved invocation cases |

## Existing Owners And Reuse Strategy

| Concern | Existing owner | Strategy | Compatibility boundary |
|---|---|---|---|
| Direct invocation order | `task-target-resolution.md` | `extend` | Preserve result schema, reason codes and CLI forms |
| Target rendering and locale | Interaction contract, renderer and locale registry | `extend` only if tests expose a direct-path gap | No skill-local card or locale table |
| Skill behavior | ten canonical `plugin/skills/*/SKILL.md` files | `refactor` gate-check; `extend` nine consumers | Skill-specific outputs and authority remain unchanged |
| QA decision | Quality Contract and `qa-gate` | `extend` | Exactly one `pass | revise | block`; no status-card ownership |
| Cross-host profiles | `sync-package-assets.js` | `reuse` | Generated files only; no manual host forks |
| Drift checks | Runtime Integrity and negative fixture | `extend` | Enumerate canonical definition rather than hard-code a second skill catalogue |
| Skill evals | `evals/cases`, manifest and deterministic replay | `extend` | Preserve 100 percent thresholds and non-live evidence label |

## Change Impact

- Files and modules: target contract, ten canonical Skill files, Runtime Integrity, negative integrity
  tests, skill-eval cases/observations/manifest and generated profiles.
- Interfaces: no public CLI, JSON schema, Reason Code, approval value or gate transition change.
- Data and migration: none.
- Backwards compatibility: resolved invocations continue into the existing skill workflow;
  unresolved invocations stop earlier and more consistently.
- Regression surface: skill routing, relative contract paths, generated payload size, Copilot profile
  inventory, Runtime Integrity, Agent Skills conformance and aggregate smoke.
- Side effects: generated source files change after sync; installed caches and loaded hosts do not.

## Parallel-Structure And Drift Check

- A skill-local resolver, task-target template, locale mapping, host-specific QA skill or second Run
  Status Card would be a blocking parallel structure.
- The current gate-check wording duplicates operational detail already suitable for the shared
  contract and should be reduced to consumption obligations.
- Repository source and installed 0.14.5 validator are distinct evidence planes. The installed
  validator may validate control state but does not prove the new source behavior.
- The known mixed-language operational status projection is visible but is not evidence that the
  direct-skill preflight is implemented. Directly touched locale behavior must pass the approved
  German and English tests; broader status-card localization stays with its existing owner.

## Risks And Mitigations

- Host routing may omit referenced contracts: verify generated skill content and record separate
  fresh-session evidence rather than adding host forks.
- Repeating semantics in ten skills may drift: keep only a short mandatory consumption boundary and
  enforce it by iterating the canonical `skillSet`.
- QA may confuse run ambiguity with a QA decision: require run clarification before QA evaluation.
- Generated payload may grow: measure and reject unjustified baseline changes.
- Foreign worktree changes may contaminate evidence: scope all reviews to this run and exclude the
  pre-existing image.

## Minimal Clean Implementation Path

1. Add one shared Direct Skill Invocation Preflight to the existing target contract.
2. Add a small, identical consumption boundary and the two contract references to each canonical
   skill; remove gate-check's duplicated operational algorithm.
3. Add qa-gate's resolved-target run and evidence-discovery workflow without changing decision or
   presentation ownership.
4. Extend Runtime Integrity and its negative tests across the definition-owned skill set.
5. Add deterministic direct-invocation and QA cases, regenerate all profiles and run focused plus
   aggregate validation.

No upstream requirement, design or plan conflict blocks this path.
