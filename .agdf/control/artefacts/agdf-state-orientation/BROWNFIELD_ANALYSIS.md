# Brownfield Analysis: Pre-Implementation Verification (Slice A)

Status: pass
Mode: pre_implementation_analysis
Date: 2026-07-15
Owner: agent

## 1. Decision

- decision: pass
- required_next_step: CD+Tests

The implementation path is clear. Reuse paths are valid, no parallel-structure conflict
exists, and regression risk is low because all changes are additive.

## 2. Implementation Path Verification

### 2.1 Target functions and files

| SD task | File | Current state | Reuse path |
|---|---|---|---|
| SO-01 | `create-agdf/bin/create-agdf.js:2336` `buildStatusCard()` | Confirmed at line 2336; unchanged since post-UR review | `extend`: add `breadcrumb` derived field from `mode_slice_decision` + Approvals |
| SO-02 | `create-agdf/lib/interaction-presentation.js` | 19 exports; none are breadcrumb/narration/collapse | `extend`: add `buildBreadcrumb()` as new export |
| SO-03 | `create-agdf/lib/interaction-presentation.js` | `postApprovalTransition()` in CLI provides next-gate data; `afterApproval` locale copy exists | `extend`: add `buildTransitionNarration()` as new export |
| SO-04 | `create-agdf/lib/interaction-presentation.js` | No collapse function exists | `extend`: add `collapseInternalState()` as new export |
| SO-05 | `plugin/meta/agdf-interaction-locales.json` | `statusCard`, `primary`, `gateTitles` sections confirmed for `en`/`de` | `extend`: add new keys under existing sections |
| SO-06 | `plugin/meta/agdf-runtime-contract.md` | §Run Status Card, §Gate Transition Card confirmed; no breadcrumb/narration/collapse subsections | `extend`: add new subsections under §Run Status Card |
| SO-07 | `plugin/skills/gate-check/SKILL.md` | Card rendering steps 1-14 confirmed; TP narration pattern at line 69 | `extend`: add new guidance after step 14; generalize line 69 pattern |
| SO-08 | `create-agdf/scripts/sync-package-assets.js` | Existing propagation script | `extend`: no new propagation logic needed |
| SO-09 | `create-agdf/scripts/control-state-test.js` | Uses `node:assert/strict`; direct assertion pattern | `extend`: add BT-01–BT-14 assertion blocks |
| SO-10 | `plugin/scripts/check-runtime-integrity.mjs` | Validates locale registry at lines 262-264, 398-399 | `extend`: add locale-key completeness checks for new keys |

### 2.2 Non-overlap with agdf-human-decision-surface

- Git log confirms no new commits to shared implementation files since the post-UR
  Brownfield Review. The last relevant commit is `6de8daf` (UX reconciliation and approval
  interaction flow) and `f9746a5` (Verified Change control integrity).
- The non-overlapping boundary defined in the SD (§9) is still intact:
  - `buildApprovalOrientationSnapshot()` and `attachApprovalOrientationSnapshot()` (owned
    by human-decision-surface) are untouched.
  - `buildStatusCard()` existing fields are untouched; only a new derived `breadcrumb`
    field is added.
  - Existing locale keys (`statusCard.*`, `interaction.*`, `primary.afterApproval`) are
    untouched; only new keys are added.
  - gate-check steps 1-14 are untouched; only new steps 15-17 are added.

### 2.3 No existing breadcrumb/narration/collapse code

Confirmed: `rg` search for `breadcrumb`, `narration`, `collapse`, `internalState` across
`agdf-runtime-contract.md`, `agdf-interaction-locales.json`, `gate-check/SKILL.md`, and
`interaction-presentation.js` returns zero matches. The work is genuinely `not_done`.

## 3. Regression Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| `buildStatusCard()` modification breaks existing consumers | Low | `breadcrumb` is an additive derived field; existing JSON consumers ignore unknown fields |
| New `interaction-presentation.js` exports conflict with existing | Low | All three new functions are new exports; no existing function is modified |
| Locale-key additions break integrity check | Low | New keys are under existing sections; `check-runtime-integrity.mjs` is extended to validate them |
| Runtime Contract additions create a second gate model | Low | New subsections are explicitly derived-projection rules, not a second authority |
| Skill guidance additions break existing step ordering | Low | New steps are additive after step 14; existing steps 1-14 unchanged |
| `agdf-human-decision-surface` produces concurrent changes | Medium | Monitored; no new changes since post-UR review; non-overlapping boundary is explicit |

## 4. Test Impact

- `control-state-test.js`: 14 new assertion blocks (BT-01–BT-14) added as extensions;
  existing assertions remain unchanged.
- `check-runtime-integrity.mjs`: new locale-key completeness checks for `breadcrumb`,
  `narration`, `internalStateLabels` in `en` and `de`; existing checks remain unchanged.
- Package smoke test: no new test file; existing smoke test continues to pass with
  additive changes.

## 5. Missing Evidence

- No live CLI rendering evidence yet (expected at CD+Tests).
- No implementation evidence yet (expected at CD+Tests).

## 6. Required Next Step

Proceed to CD+Tests: implement SO-01 through SO-10, run BT-01 through BT-14, then run
the complete verification bundle (SO-11) and the review chain (SO-12).
