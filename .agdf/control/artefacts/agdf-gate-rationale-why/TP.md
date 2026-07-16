# TP: Gate-Rationale-Registry and On-Demand "Why?" Task and Test Plan (Slice B)

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` provided on 2026-07-16 after same-run, same-gate and revision revalidation
Revision: 1
Derived from: `.agdf/control/artefacts/agdf-gate-rationale-why/SD.md`
Date: 2026-07-16
Owner: AGDF

## 1. Tasks

| Task ID | Description | Files | Acceptance |
|---|---|---|---|
| GRW-01 | Add `gateRationale` section to `agdf-interaction-locales.json` for both `en` and `de` with 12 keys each (6 gates + 6 internal steps) using the curated content from SD §3.4 and §3.5 | `plugin/meta/agdf-interaction-locales.json` | All 12 keys present in both locales; all strings non-empty; all within 160 chars |
| GRW-02 | Add `interaction.why` sub-key to both `en` and `de` locale packs with `label`, `fulfilledPrefix`, `protectsPrefix` | `plugin/meta/agdf-interaction-locales.json` | `why` block present in both locales; all 3 fields non-empty; within budget |
| GRW-03 | Add `gateRationale()` exported function to `interaction-presentation.js` | `create-agdf/lib/interaction-presentation.js` | `gateRationale(registry, "de", "UR")` returns the German UR rationale; `gateRationale(registry, "en", "UR")` returns the English UR rationale; same inputs → same output |
| GRW-04 | Update `validateLocaleRegistry` budget condition to include `gateRationale.` and `interaction.why.` keys in the `description` budget category | `create-agdf/lib/interaction-presentation.js` | `validateLocaleRegistry` returns `{ valid: true }` with new keys; removing `gateRationale` from one locale returns `{ valid: false }` |
| GRW-05 | Add Gate-Rationale-Registry clause and On-Demand "Why?" Interaction clause to `agdf-runtime-contract.md` as new subsections in §Native Interaction Contract | `plugin/meta/agdf-runtime-contract.md` | Two new subsections present; contract states deterministic, non-authorizing, status kind, no new interaction_kind |
| GRW-06 | Add "On-Demand 'Why?' Response" guidance block to `gate-check/SKILL.md` after existing Native Interaction Path guidance | `plugin/skills/gate-check/SKILL.md` | Guidance block present; states status interaction, no approval controls, deterministic, pull from `gateRationale()` |
| GRW-07 | Add regression tests to `interaction-presentation-test.js` covering rationale presence, budget, determinism, fallback, parity failure, `why` key presence, approval options unchanged, snapshot validation unchanged | `create-agdf/scripts/interaction-presentation-test.js` | All new assertions pass; existing assertions still pass |
| GRW-08 | Sync generated surfaces via `sync-package-assets.js` and verify runtime integrity | `create-agdf/scripts/sync-package-assets.js` (run); `plugin/scripts/check-runtime-integrity.mjs` (run) | Generated locale file matches source; runtime integrity passes |

## 2. Tests

| Test ID | What it asserts | Task coverage |
|---|---|---|
| GRW-T01 | Both `en` and `de` packs contain `gateRationale` with all 12 keys (UR, PRD, SD, TP, QA, UAT, Brownfield Review, Mode/Slice Decision, Brownfield Analysis, CD+Tests, CR, OR) | GRW-01 |
| GRW-T02 | All rationale strings in both locales are within `lengthBudgets.description` (160 chars) | GRW-01, GRW-04 |
| GRW-T03 | `gateRationale(registry, "de", "UR")` returns the same string across multiple calls (determinism) | GRW-03 |
| GRW-T04 | `gateRationale(registry, "fr", "UR")` returns the English fallback (unsupported locale → en) | GRW-03 |
| GRW-T05 | Removing `gateRationale` from the `de` pack causes `validateLocaleRegistry` to return `{ valid: false }` with an `incomplete_locale` error | GRW-04 |
| GRW-T06 | Both `en` and `de` packs contain `interaction.why` with `label`, `fulfilledPrefix`, `protectsPrefix` | GRW-02 |
| GRW-T07 | `why` label, `fulfilledPrefix` and `protectsPrefix` strings are within budget | GRW-02, GRW-04 |
| GRW-T08 | `gateOptions(registry, "de", "UR")` still returns exactly `approve`, `revise`, `decline` (no "why" option) | GRW-03 (non-interference) |
| GRW-T09 | `validateApprovalOrientationSnapshot` still passes for all 6 user gates (UR, PRD, SD, TP, QA, UAT) with the updated locale registry | GRW-04 (non-interference) |
| GRW-T10 | `npm --prefix create-agdf run test:interaction-presentation` exits 0 | GRW-01 through GRW-07 |

## 3. Acceptance Matrix

| Acceptance Criterion (PRD §4) | Tasks | Tests |
|---|---|---|
| AC-1: `gateRationale` in both `en` and `de` with 12 keys | GRW-01 | GRW-T01 |
| AC-2: Each rationale within 160 chars | GRW-01, GRW-04 | GRW-T02 |
| AC-3: `validateLocaleRegistry` returns valid with new keys | GRW-04 | GRW-T02, GRW-T09 |
| AC-4: Removing `gateRationale` from one locale → invalid | GRW-04 | GRW-T05 |
| AC-5: `gateRationale(registry, "de", "UR")` deterministic | GRW-03 | GRW-T03 |
| AC-6: `gateRationale(registry, "en", "UR")` deterministic | GRW-03 | GRW-T03 |
| AC-7: `gateOptions` unchanged (no "why" option) | GRW-03 | GRW-T08 |
| AC-8: `validateApprovalOrientationSnapshot` unchanged | GRW-04 | GRW-T09 |
| AC-9: `npm run test:interaction-presentation` passes | GRW-01 through GRW-07 | GRW-T10 |
| AC-10: Generated surfaces propagated, runtime integrity passes | GRW-08 | (manual/CI) |

## 4. Verification Sequence

1. Implement GRW-01 through GRW-07.
2. Run `npm --prefix create-agdf run sync-package-assets` (GRW-08 sync).
3. Run `npm --prefix create-agdf run test:interaction-presentation` (GRW-T10).
4. Run `node plugin/scripts/check-runtime-integrity.mjs` (GRW-08 integrity).
5. Verify `git diff --check` passes (whitespace).

## 5. Required Next Step

Review this TP and approve it only with:

`Approval: TP`
