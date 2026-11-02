# TP: Human Decision Presentation Contract Implementation

Status: approved
Gate: TP
Revision: 3
Gate approval: exact `Approval: TP` provided on 2026-07-15 for revision 3 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/SD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Historical Baseline

HDS-01 through HDS-15 below describe the already delivered revision-1 baseline. They remain regression
scope but do not authorize reimplementation or count as evidence for the revision-2 delta.

| task_id | Task | Owner area | Required evidence |
|---|---|---|---|
| HDS-01 | Define the canonical locale-pack JSON schema, English fallback metadata and complete initial `en`/`de` packs. | `plugin/meta/agdf-interaction-locales.json`; plugin definition | Schema checks prove complete keys, stable semantic outcomes and unchanged approval tokens. |
| HDS-02 | Implement deterministic locale resolution: exact tag, language subtag, then English fallback. | shared control/presentation helper under `create-agdf/lib` | Unit fixtures cover exact, regional, unsupported, absent and malformed locale values. |
| HDS-03 | Implement the non-authoritative semantic interaction payload for approval, clarification, blocked and status interactions. | shared presentation helper; Runtime Contract | Tests prove payload derivation does not mutate state or grant approval. |
| HDS-04 | Implement deterministic human title resolution from current artefact, UR, Objective and normalized run ID. | shared presentation helper | Four-level fallback fixtures plus ambiguous-run negative cases. |
| HDS-05 | Implement canonical `UR · PRD · SD · TP` artefact references using only selected-run paths. | shared presentation helper; run-state parser inputs | Existing artefacts become links; missing artefacts remain localized non-links; guessed paths fail. |
| HDS-06 | Extend Runtime Contract and `gate-check` guidance to consume the shared presentation contract for approval, clarification, blocked and status paths. | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | Integrity assertions reject raw primary fields, mixed locale and direct text before eligible native attempt. |
| HDS-07 | Integrate localized primary/detail human output into the CLI while preserving all existing JSON fields and diagnostic codes. | `create-agdf/bin/create-agdf.js` | Snapshot/fixture tests prove human localization and byte-compatible JSON field shape. |
| HDS-08 | Align Codex, Claude and OpenCode adapter metadata with stable option order and explicit outcome mapping. | `plugin/meta/agdf-plugin.definition.json`; generated surfaces | Adapter fixtures prove approve, revise, decline and host-owned cancel semantics. |
| HDS-09 | Distinguish decline, cancel, no response, timeout, empty, invalid and stale results throughout validation. | interaction/result normalization and gate validator boundary | Negative tests prove only exact revalidated approval advances; every other outcome leaves authority unchanged. |
| HDS-10 | Add accessibility and long-translation constraints for labels, descriptions and titles. | locale schema and fixtures | Non-empty accessible names, configurable length budgets and long-locale fixtures pass without semantic collision. |
| HDS-11 | Add coverage for `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`, internal steps, blockers, clarifications and status-only interactions. | control-state, smoke and presentation tests | Matrix demonstrates correct question/no-question behavior and next-transition copy. |
| HDS-12 | Extend runtime-integrity negative tests for translated approval tokens, mixed languages, unstable ordering, skipped options, raw keys and broken links. | `plugin/scripts/check-runtime-integrity.mjs`; negative test suite | Each prohibited mutation fails deterministically. |
| HDS-13 | Synchronize generated plugin/package surfaces and verify no duplicate locale or presentation owner was introduced. | `create-agdf/scripts/sync-package-assets.js`; generated output | Canonical/generated comparison passes across supported surfaces. |
| HDS-14 | Run the complete verification bundle and record implementation evidence. | package and repository checks | Runtime integrity, focused unit tests, control-state tests, package smoke tests and `git diff --check` pass. |
| HDS-15 | Perform Task Plan Review, Clean Implementation Review and Code Review before QA. | AGDF review chain | Task-to-diff-to-test coverage, solution-integrity evidence and no unresolved blocking finding. |

## 2. Revision-3 Task And Test Plan

| task_id | Task | Owner area | Required evidence |
|---|---|---|---|
| HDS-16 | Extend the canonical orientation composer to return two ordered, separately recognizable semantic blocks: `run_status_card` then `gate_transition_card`; keep the localized action heading as the first visible field of the first card. | `create-agdf/lib/interaction-presentation.js` | Unit fixtures prove both complete cards derive from one immutable snapshot, remain distinct, are rendered exactly once and preserve the primary-heading invariant. |
| HDS-17 | Add a fail-closed sequence preflight that permits native invocation or fallback only after one complete Run Status Card followed by one complete Gate Transition Card. | shared presentation helper; Runtime Contract; `gate-check` workflow | Negative fixtures reject missing, merged, reversed, duplicated, hidden-context and button-first variants before adapter invocation. |
| HDS-18 | Encode complete localized action-title mappings for `UR`, `PRD`, `SD`, `TP`, `QA` and `UAT`, while keeping AGDF, gate and run metadata secondary. | `plugin/meta/agdf-interaction-locales.json`; locale integrity checks | German and English fixtures assert the required semantic title and stable heading level; raw identifiers never become the primary title. |
| HDS-19 | Extend the canonical native-attempt envelope to distinguish invocation, trustworthy presentation evidence, response origin, semantic outcome and exact canonical value. | adapter normalization boundary; Runtime Contract; `gate-check` skill | Fixtures independently prove `invoked`, `presented` and `deliberate_response`; repository-only tests never claim host-visible evidence. |
| HDS-20 | Make host-return-only, invisible or otherwise unproven native results non-authorizing and map them to one `attempted_not_applied` exact-text fallback without automatic retry of the same interaction snapshot. | gate-check interaction procedure; adapter result mapping | A structured tool return with no visible-control evidence persists nothing, reports the outcome honestly and emits exactly one fallback. |
| HDS-21 | Separate stable semantic option IDs and exact approval values from localized or host-decorated labels; declare and enforce `canonical_value_transport` per adapter. | plugin definition; Codex, Claude and OpenCode adapter metadata | `Approval: TP (Recommended)` and equivalent decorated labels cannot approve; adapters without separate canonical transport remain presentation-only. |
| HDS-22 | Synchronize the revised contract and skill into generated/package surfaces, then run focused and full regression verification. | sync script, integrity suite, control-state tests, package smoke | Canonical/generated parity, heading matrix, ordered-event matrix, attempt-evidence matrix, exact-value negatives, package smoke and `git diff --check` pass. |
| HDS-23 | Repeat Task Plan Review, Clean Implementation Review and Code Review for the revision-2 diff before refreshed QA. | AGDF review chain | HDS-16 through HDS-22 have direct diff/test evidence and no unresolved blocking or workaround finding. |

## 3. Acceptance Matrix

| Dimension | Required cases |
|---|---|
| Locales | `en`, `de`, regional fallback, additional-pack fixture, unsupported and absent |
| Gates | `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT` |
| Interaction kinds | gate approval, clarification, blocked, status |
| Outcomes | approve, revise, decline, cancel, no response, timeout, empty, invalid, stale |
| Artefacts | all present, partially present, none present, invalid path |
| Surfaces | Codex, Claude, OpenCode, exact-text fallback, human CLI, JSON CLI |
| Accessibility | long translation, stable accessible name, no color/position-only meaning |
| Primary heading | first visible line, semantic `##` equivalent, exactly once, localized action title, secondary run/gate context |
| Heading negatives | generic status/card title, raw gate ID, missing, misplaced and duplicated heading |
| Native evidence | not invoked, invoked only, visibly presented, deliberate response, host-return-only and stale revision |
| Canonical value | exact separate approval value, localized label, decorated recommendation label and unsupported canonical transport |
| Recovery | one exact-text fallback after `attempted_not_applied`; no automatic same-snapshot retry |
| Visible sequence | `run_status_card`, `gate_transition_card`, then native attempt or exact-text fallback |
| Sequence negatives | merged, missing, reversed, duplicated, hidden-context, button-first and repeated-on-fallback |

## 4. Scope Constraints

- Preserve all existing approval formulas and JSON field names.
- Do not create a second gate evaluator, approval store or custom UI renderer.
- Do not translate host-owned UI chrome.
- Do not claim a language is supported without a complete reviewed language pack.
- Do not infer artefact paths, run selection or approval from chat history or labels.
- Existing unrelated worktree changes remain isolated.
- Do not infer visible presentation or deliberate input from a successful adapter invocation or tool return.
- Do not add a second heading composer, adapter-specific authority rule or parallel approval value.
- Do not add a combined-card compatibility path or represent either required card only in tool context.

## 5. Verification Sequence

1. Reconfirm existing owners and exact touched paths in pre-implementation Brownfield Analysis.
2. Add failing first-line/exactly-once/generic-heading fixtures, ordered-event negatives and native-evidence/canonical-value fixtures.
3. Extend the existing presentation composer, sequence preflight and adapter result normalization; do not fork any owner.
4. Align Runtime Contract, gate-check guidance, locale data and adapter capability metadata.
5. Synchronize generated surfaces.
6. Run focused tests, the full control-state/runtime-integrity suite, package smoke and whitespace checks.
7. Run TP Review, Clean Implementation Review and Code Review for HDS-16 through HDS-23.
8. Run refreshed QA only after the revision-2 review evidence is complete.

## 6. Completion Criteria

- HDS-01 through HDS-15 remain passing regression evidence; HDS-16 through HDS-23 have direct revision-3 implementation and test evidence.
- Every acceptance-matrix row is covered or explicitly marked blocked with impact.
- Machine JSON remains compatible and exact approval authority remains fail-closed.
- No duplicate presentation or locale owner exists.
- Every primary interaction starts with one understandable action heading, while generic AGDF/card labels and raw gate IDs remain secondary or absent.
- Native invocation, visible presentation and deliberate response are evidenced separately; decorated labels and host-return-only values cannot approve.
- Every ready gate emits one complete Run Status Card, then one separate Gate Transition Card, then the control or fallback; all prohibited sequence variants fail before invocation.
- QA receives complete review evidence and no hidden unsupported-language claim.

## 7. Next Step

Revision 3 is approved. Run pre-implementation Brownfield Analysis before CD+Tests.
