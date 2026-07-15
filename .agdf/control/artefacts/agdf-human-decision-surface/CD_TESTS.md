# CD+Tests: Human Decision Surface

Status: done
Decision: pass
Date: 2026-07-14
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/TP.md`

## Delivered

- Added one canonical, extensible interaction locale registry with complete initial `en` and `de` packs, exact/subtag/English fallback, stable option order and accessibility length budgets.
- Added one pure interaction-presentation helper for locale resolution, localized gate titles, deterministic human run titles, safe `UR · PRD · SD · TP` references, stable options and distinct outcomes.
- Refactored human CLI status output to use the shared locale contract, localized primary copy and verified artefact links while preserving JSON fields and values.
- Extended exact approval validation to distinguish revise, decline, cancel, no response, timeout, empty, invalid and stale outcomes; only exact deliberate revalidated approval authorizes.
- Extended Runtime Contract, `gate-check`, plugin adapter metadata, generated surfaces and runtime-integrity enforcement for primary status, blocked, clarification and approval interactions.
- Added generated locale registries for Codex, Copilot and OpenCode and byte-identity checks.

## TP Coverage

| Task | Evidence | Result |
|---|---|---|
| HDS-01 | `plugin/meta/agdf-interaction-locales.json`; schema/completeness tests | pass |
| HDS-02 | `resolvePresentationLocale`; exact, regional, additional-pack and unsupported tests | pass |
| HDS-03 | `interaction-presentation.js`; non-authoritative pure projection | pass |
| HDS-04 | `resolveHumanRunTitle`; four-level fallback tests | pass |
| HDS-05 | `buildArtefactRefs`; safe path, filesystem-existence and missing-label tests | pass |
| HDS-06 | Runtime Contract and `gate-check` Human Decision Presentation guidance | pass |
| HDS-07 | shared localized human CLI projection; unchanged enumerable JSON projection | pass |
| HDS-08 | canonical surface `explicitOutcomes`, dismissal mapping and stable order | pass |
| HDS-09 | distinct validator reasons for all non-approval outcomes | pass |
| HDS-10 | label/description/title budgets and long-locale fixture | pass |
| HDS-11 | UR, PRD, SD, TP, QA, UAT and internal-step presentation matrix | pass |
| HDS-12 | runtime-integrity mutations for raw primary fields, ordering, incomplete locales and broken-link policy | pass |
| HDS-13 | generated Codex/Copilot/OpenCode locale byte-identity and package inclusion | pass |
| HDS-14 | full verification bundle below | pass |
| HDS-15 | pending mandatory review chain; implementation is ready for review | pending |

## Verification Evidence

| Command | Result |
|---|---|
| `npm run smoke-test` in `create-agdf` | pass: control-state, presentation, Verified Change, integrity negative, Delivery Path Search, full package smoke and routing |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass: 9 skills and 15 control files |
| `npm pack --dry-run --json` in `create-agdf` | pass: generated locale registry included in package |
| explicit `fr-CA` configuration probe | pass: extensible BCP 47 tag persisted; presentation fallback remains registry-controlled |
| `git diff --check` | pass |

## Compatibility Evidence

- Existing exact approval values and gate evaluation remain unchanged.
- `humanPresentation` is a non-enumerable runtime-only CLI projection; JSON serialization does not expose new presentation fields.
- Existing English and German status-card smoke assertions pass with localized titles and artefact rows.
- Missing or invalid paths render localized non-links; filesystem-missing paths do not become links.
- Generated plugin/package surfaces consume byte-identical locale data rather than per-surface translations.

## Remaining Required Work

Complete Task Plan Review, Clean Implementation Review and mandatory Code Review before QA.
