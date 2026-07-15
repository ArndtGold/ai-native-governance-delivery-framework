# CD+Tests: Human Decision Surface

Status: done
Decision: pass
Revision: 2
Date: 2026-07-15
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/TP.md`

## Delivered

### Revision 2 delta

- Added complete localized action-oriented headings for all six user gates and made the action title
  the single primary owner of the compact approval-time Run Status Card.
- Added semantic block identities and a pure sequence preflight for
  `run_status_card -> gate_transition_card -> approval_interaction`.
- Bound native attempt execution to a valid orientation snapshot; missing, merged, reversed,
  duplicated, generic-heading and decorated-approval variants fail before invocation.
- Declared canonical-value transport per adapter. Unproven host adapters remain presentation-only;
  exact text is the authorization path.
- Strengthened Runtime Contract, `gate-check`, generated assets and Runtime Integrity against card
  merging, generic primary headings and adapter-capability drift.

- Added one canonical, extensible interaction locale registry with complete initial `en` and `de` packs, exact/subtag/English fallback, stable option order and accessibility length budgets.
- Added one pure interaction-presentation helper for locale resolution, localized gate titles, deterministic human run titles, safe `UR · PRD · SD · TP` references, stable options and distinct outcomes.
- Refactored human CLI status output to use the shared locale contract, localized primary copy and verified artefact links while preserving JSON fields and values.
- Extended exact approval validation to distinguish revise, decline, cancel, no response, timeout, empty, invalid and stale outcomes; only exact deliberate revalidated approval authorizes.
- Extended Runtime Contract, `gate-check`, plugin adapter metadata, generated surfaces and runtime-integrity enforcement for primary status, blocked, clarification and approval interactions.
- Added generated locale registries for Codex, Copilot and OpenCode and byte-identity checks.

## TP Coverage

### Revision 3 tasks

| Task | Evidence | Result |
|---|---|---|
| HDS-16 | `buildApprovalOrientationSnapshot`; semantic blocks, action heading and all-gate fixtures | pass |
| HDS-17 | `validateApprovalOrientationSnapshot`; invalid/missing snapshot blocks `executeNativeApprovalAttempt` | pass |
| HDS-18 | Complete `gateActionTitles` for `en`/`de`; completeness and generic-title negatives | pass |
| HDS-19 | Existing immutable snapshot and attempt envelope retained; presentation remains non-authorizing | pass |
| HDS-20 | Existing one-fallback/no-retry contract plus preflight-before-invocation tests | pass |
| HDS-21 | Per-surface `canonicalValueTransport`; decorated approval negative | pass |
| HDS-22 | Generated sync, full smoke, Runtime Integrity, focused negatives and whitespace checks | pass |
| HDS-23 | Refreshed TP Review, Clean Implementation Review and Code Review revision 2 | pass |

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
| `npm run test:interaction-presentation` | pass: action headings, ordered blocks, preflight and canonical approval negatives |
| `npm run test:runtime-integrity-negative` | pass: ordering, heading and adapter-capability mutation checks |

## Compatibility Evidence

- Existing exact approval values and gate evaluation remain unchanged.
- `humanPresentation` is a non-enumerable runtime-only CLI projection; JSON serialization does not expose new presentation fields.
- Existing English and German status-card smoke assertions pass with localized titles and artefact rows.
- Missing or invalid paths render localized non-links; filesystem-missing paths do not become links.
- Generated plugin/package surfaces consume byte-identical locale data rather than per-surface translations.

## Remaining Required Work

Run the refreshed QA gate using revision-2 review evidence; live host visibility remains UAT-only.
