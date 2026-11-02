# Brownfield Analysis: Reduce Documentation Ceremony For Trivial, Non-Normative Changes

Mode: `pre_implementation_analysis`
Status: passed
Decision: `pass`
Reviewed at: 2026-07-10
Approved scope: T1-T7
Based on: `.agdf/control/artefacts/agdf-micro-tier-below-quick-task/TP.md`

## 1. Existing Owners

| Concern | Existing owner | Required implementation fit |
|---|---|---|
| Quick Task ceremony rules | `plugin/meta/agdf-runtime-contract.md` ("Quick Task Output", "Relevant Run") | Sole normative owner; extend in place, do not fork a second rule location |
| Skill references to these rules | `plugin/skills/gate-check/SKILL.md`, `plugin/skills/release-or/SKILL.md`, `plugin/skills/brownfield-analysis/SKILL.md` | Confirmed via grep: none duplicate the rule text, all reference the contract — no edit needed |
| `AGDF_RUN.md` structural parsing | `create-agdf/bin/create-agdf.js` (`liveControlFiles`, `readRunState`, doctor finding codes) | Confirmed it parses only structural fields of the live file (`current_gate`, `next_allowed_action`, evidence rows) — it does not read or depend on the Runtime Contract's own prose, so this change cannot trip a doctor finding |
| `Prior Run Pointers` section | `plugin/control/templates/AGDF_RUN.md` (template) and current live `.agdf/control/AGDF_RUN.md` | Already free-text and already used for exactly this purpose today — no template change needed |
| Cross-surface propagation | `create-agdf/scripts/sync-package-assets.js` | Reuse unchanged; same proven path as `agdf-backlog-vocabulary-visibility` |

## 2. Current Coverage

- `partially_done`
- The compact "Quick Task Output" shape and the "Relevant Run" definition already exist in the Runtime Contract.
- Missing: the explicit path-prefix boundary, the "must not rewrite `AGDF_RUN.md` core sections" statement, the "`MASTER_BACKLOG.md` only if relevant" statement, and the `Prior Run Pointers` one-line-append rule.
- No existing rule needs to be replaced or removed.

## 3. Reuse Strategy

- strategy: `extend`
- Add the boundary and rules as new sentences inside the two existing sections; do not create a new section, a new Mode/Slice Decision value, or a second copy of the rule elsewhere.
- Reuse the existing `Prior Run Pointers` free-text convention rather than adding a new field.

## 4. Change Impact

- Files/modules: exactly one file, `plugin/meta/agdf-runtime-contract.md`.
- Interfaces: none — no code, no CLI flags, no schema.
- Data model / migrations: none.
- Backwards compatibility: existing completed runs' `AGDF_RUN.md`/`MASTER_BACKLOG.md` content is untouched; this is a forward-looking behavior rule only.
- Regression tests: none of the existing checks (`check-runtime-integrity.mjs`, `test:delivery-path-search`, `test:delivery-path-search-unit`, `test-routing.js`) read this prose, so none can regress from the wording change; they are run per T3/T5 to confirm this expectation holds.

## 5. Parallel-Structure And Drift Risk

- No parallel structure: confirmed by SD decision to avoid a new Mode/Slice Decision value and by the grep confirming no skill duplicates the rule text.
- Drift risk: the path-prefix allow-list could miss a future normative location. Mitigated by the fail-closed default already specified in T1 (unlisted paths keep today's full ceremony).

## 6. Worked-Example Candidate (T6)

A genuine, currently-existing, non-manufactured non-normative gap was found: `README.md`'s "Projektstruktur" tree (lines ~125-155) does not list the `agdf/` directory, which is the published `@agdf/cli` package (`agdf/package.json`: `"name": "@agdf/cli"`, referenced throughout `README.md` and `INSTALL.md` via `npx --yes @agdf/cli@latest`). Adding this one missing entry:

- touches only `README.md` — fully outside all excluded prefixes (`plugin/skills/**`, `plugin/control/templates/**`, `plugin/meta/**`, `create-agdf/lib/**`, `create-agdf/bin/**`, any code file)
- introduces no new vocabulary, gate semantics, or behavior
- is real and pending, not staged for this demonstration

This is the T6 candidate; CD+Tests will apply the new rule to this exact change as the worked example.

## 7. Context Graph Impact

- context_graph_impact: `new_node_required`
- context_graph_refs: `plugin/meta/agdf-runtime-contract.md`, `plugin/control/templates/AGDF_RUN.md`, `create-agdf/bin/create-agdf.js`
- context_graph_required_action: `create` (T7, at CD+Tests/closeout)
- context_graph_gate_effect: none
- context_graph_evidence: Same finding carried from Brownfield Review; not yet created, tracked as T7.

## 8. Missing Evidence

- None blocking. All planned evidence (T3-T5 command output, T6 worked-example diff, T7 Context Graph node) is scheduled as TP tasks, not open Brownfield questions.

## 9. Decision

- decision: `pass`
- reuse_strategy: `extend`
- parallel_structure_risk: none identified; controlled by keeping the amendment inside the two existing sections
- required_next_step: Proceed to CD+Tests — execute T1-T7 in order, starting with T1/T2.
- forbidden: any edit to `plugin/skills/**`, `plugin/control/templates/**`, `create-agdf/lib/**`, `create-agdf/bin/**`, or `doctor` logic; commit, push, PR, release
