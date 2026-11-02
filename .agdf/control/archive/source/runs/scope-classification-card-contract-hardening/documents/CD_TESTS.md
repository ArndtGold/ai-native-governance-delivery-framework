# CD+Tests: Scope Classification Card Contract Hardening

Status: done
Based on: approved TP Revision 1 and passing pre-implementation Brownfield Analysis
Date: 2026-08-19
Owner: agent

## Delivered Change

- Restricted the existing Scope Classification Card renderer to valid fresh `quick_task` input.
- Added one frozen module-local limits object and one shared fail-closed dynamic-text validator.
- Enforced string-only, trimmed non-empty, single-line, maximum-240-code-point plain text with the
  approved Markdown-control and line-leading structure exclusions.
- Enforced 1–3 valid distinct escalation triggers through the same validator.
- Preserved unsupported requested-locale fallback to complete English and invalid-registry failure to
  `null`; removed obsolete Verified Change vocabulary from both locale packs.
- Aligned the canonical Interaction Contract and reliable Runtime Integrity assertions.
- Added one Verified Change suppression eval and refreshed the versioned corpus fingerprints.
- Reconciled the delivered invariant into existing node `CG-NATIVE-INTERACTION-AUTHORITY`.

## Task Evidence

| task_id | implementation | test/evidence | status |
|---|---|---|---|
| SCH-T1 | Existing renderer accepts only `ungated` + `quick_task` + resolved inside/outside boundary | Positive Quick Task plus Verified Change, structured, gated, ambiguous and unknown negative assertions | done |
| SCH-T2 | Shared `scopeClassificationText` and frozen 240-code-point limit in the renderer owner | 1/240/241, astral, type, whitespace, CR/LF/U+2028/U+2029, Markdown matrix and valid punctuation/URL tests | done |
| SCH-T3 | Same validator plus 1–3 and distinct-normalized trigger checks | 0/1/3/4, non-array, duplicate, whitespace, non-string, Markdown and 240/241 tests | done |
| SCH-T4 | Existing resolver retained; invalid locale vocabulary removed symmetrically; contract corrected | English/German, `fr-CA` → English, incomplete and malformed registry → `null` | done |
| SCH-T5 | Interaction Contract and structural Runtime Integrity extended without local template | Source and negative Runtime Integrity plus full smoke pass | done |
| SCH-T6 | One Verified Change suppression case added to existing case/fixture/observation/manifest owners | Skill eval harness and 54/54 deterministic replay pass | done |
| SCH-T7 | Canonical synchronization, generated-layout validation and existing Context Graph reconciliation | Repeated sync hash stable; full smoke and routing render pass; Context Graph node updated | done |

## Verification Results

- `npm --prefix create-agdf run test:interaction-presentation`: pass.
- `npm --prefix create-agdf run test:skill-evals`: pass.
- `npm --prefix create-agdf run eval:skills`: pass, 54/54 cases across 10 skills.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass in source mode, 10 skills and 16 control
  files checked.
- repeated `npm --prefix create-agdf run sync-package-assets`: pass; second run produced the same
  repository diff hash `c3ffdcf8c6890d5984f1a2450a69d3cb4327ce0467a1fb63371fc7168812ef00`.
- `npm --prefix create-agdf run smoke-test`: pass after the final Unicode-line-separator correction;
  includes release preparation, byte-identical package build, package contents, lifecycle, control
  state, interaction, Verified Change, source/generated Runtime Integrity, evals, proportionality,
  Delivery Path Search, OpenCode hardening, aggregate smoke and routing render.
- Public plugin inventory: pass, 42 candidate files; digest
  `1cf0dd3bcf2071154ad5f44447663fd1923dc5f5107b50f92737b889d6926dec`.

## Scope And Evidence Boundary

- No renderer signature, output schema, gate, approval value, persistence or host adapter changed.
- Existing unrelated dirty control changes for `activation-diagnosis-determinism` were preserved and
  are not implementation evidence for this run.
- Repository tests, deterministic replay and generated-layout checks do not prove live-host
  exactly-once rendering. That approved non-goal remains explicit for QA/UAT.

## Result

All SCH-T1 through SCH-T7 implementation and test obligations are complete. Mandatory reviews are
the next step before QA.
