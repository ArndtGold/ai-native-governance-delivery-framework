# TP: Human Decision Presentation Contract Implementation

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided through deliberate native selection on 2026-07-14
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/SD.md`
Date: 2026-07-14
Owner: AGDF

## 1. Task And Test Plan

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

## 2. Acceptance Matrix

| Dimension | Required cases |
|---|---|
| Locales | `en`, `de`, regional fallback, additional-pack fixture, unsupported and absent |
| Gates | `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT` |
| Interaction kinds | gate approval, clarification, blocked, status |
| Outcomes | approve, revise, decline, cancel, no response, timeout, empty, invalid, stale |
| Artefacts | all present, partially present, none present, invalid path |
| Surfaces | Codex, Claude, OpenCode, exact-text fallback, human CLI, JSON CLI |
| Accessibility | long translation, stable accessible name, no color/position-only meaning |

## 3. Scope Constraints

- Preserve all existing approval formulas and JSON field names.
- Do not create a second gate evaluator, approval store or custom UI renderer.
- Do not translate host-owned UI chrome.
- Do not claim a language is supported without a complete reviewed language pack.
- Do not infer artefact paths, run selection or approval from chat history or labels.
- Existing unrelated worktree changes remain isolated.

## 4. Verification Sequence

1. Reconfirm existing owners and exact touched paths in pre-implementation Brownfield Analysis.
2. Add locale schema/data and shared pure presentation helpers.
3. Add focused unit and negative tests before surface integration.
4. Integrate runtime guidance, CLI human output and adapter metadata.
5. Synchronize generated surfaces.
6. Run focused tests, full control-state/runtime integrity and package smoke checks.
7. Run TP Review, Clean Implementation Review and Code Review.
8. Run QA gate only after review evidence is complete.

## 5. Completion Criteria

- HDS-01 through HDS-15 have direct implementation and test evidence.
- Every acceptance-matrix row is covered or explicitly marked blocked with impact.
- Machine JSON remains compatible and exact approval authority remains fail-closed.
- No duplicate presentation or locale owner exists.
- QA receives complete review evidence and no hidden unsupported-language claim.

## 6. Next Step

Review this Task and Test Plan and approve only with:

`Approval: TP`
