# TP: Pre-Decision Status Card Visibility

Status: approved
Gate: TP
Revision: 1
Gate approval: revision 1 approved with exact `Approval: TP` on 2026-09-01 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/pre-decision-status-card-visibility/SD.md` (approved revision 1)
Date: 2026-09-01
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| PDV-T1 | Run pre-implementation Brownfield Analysis: verify clean baseline, the exact envelope rendered-branch shape, every Runtime Integrity phrase pinning the wording to be replaced, envelope test fixtures and skill-eval fixtures that assert envelope output | AC-06, AC-08 | Brownfield Analysis with pass/revise/block decision and exact allowed paths |
| PDV-T2 | Extend `printApprovalEnvelope` rendered branch: print the full `status_presentation.markdown` verbatim, exactly once, between compact card and Gate Transition Card; on missing card render the localized `statusPresentationFailure` line with `presentation_diagnostics` codes at the same position and continue | AC-01, AC-02, AC-05 | Focused diff plus envelope order/degradation tests |
| PDV-T3 | Amend `plugin/meta/contracts/interaction.md`: replace the "outside the approval-time compact view" sentence with the normative PDV-02 sequence and add the once-only-scope sentence (snapshot blocks only; full-card missing-approval row permitted as audit data); single-line phrases only | AC-04, AC-06 | Contract diff; old sentence absent |
| PDV-T4 | Amend `plugin/skills/gate-check/SKILL.md` §Output to state the same sequence, deferring to the contract as owner | AC-06 | Skill diff consistent with contract wording |
| PDV-T5 | Update `plugin/scripts/check-runtime-integrity.mjs`: swap pinned phrases for the amendment and add one assertion for the new sequence sentence | AC-06 | Integrity check passes on LF content; old-phrase assertion removed, new one active |
| PDV-T6 | Add envelope tests: PDV-02 order with verbatim full card, exactly-once under `reEvaluate` refresh, degradation with codes at the card position, and unchanged behavior for non-ready reports; keep all snapshot/validator tests unmodified | AC-01, AC-02, AC-03, AC-05, AC-07 | New passing cases in `test:interaction-presentation`; unmodified snapshot suite green |
| PDV-T7 | Regenerate mirrors via canonical sync and run the regression set (`test:interaction-presentation`, `test:control-state`, `test:verified-change`, `test:local-marketplace`, `test:copilot-profile`, `test:routing`, `test:release-version-coherence`, `test:public-plugin`); `git diff --check` clean; disclose pre-existing native-Windows failures unchanged | AC-08, AC-09 | Passing command outputs and changed-path evidence |
| PDV-T8 | Complete Task Plan Review, Clean Implementation Review, Code Review and QA, resolving every blocking finding | all | Durable review and QA reports |

## 2. Test Plan

1. `npm --prefix create-agdf run test:interaction-presentation`
   - envelope order: compact card → full card (verbatim fixture markdown) → transition card →
     exact-text fallback;
   - exactly-once: full-card markdown occurs once per invocation, including the `reEvaluate` path;
   - degradation: `status_presentation: null` at a ready gate renders the localized failure line
     with diagnostic codes at the card position and still requests the decision;
   - non-ready reports render no envelope blocks (unchanged).
2. `npm --prefix create-agdf run test:control-state` — status-only reporting unchanged (AC-07).
3. `node plugin/scripts/check-runtime-integrity.mjs` — amended phrase list passes on LF content;
   evaluated against the known CRLF host limitation (evidence from an LF-normalized read if the
   working copy is CRLF).
4. `npm --prefix create-agdf run sync-package-assets` twice — idempotent; mirrors match (AC-08).
5. `npm --prefix create-agdf run test:local-marketplace && npm --prefix create-agdf run test:copilot-profile && npm --prefix create-agdf run test:routing && npm --prefix create-agdf run test:release-version-coherence && npm --prefix create-agdf run test:public-plugin` — surface regressions.
6. `git diff --check` — clean.

### Negative controls

- A report with an empty `presentation_diagnostics` array shape never renders `()` — codes suffix
  only when codes exist.
- Live check on this repository's own run: `gate-check --approval-envelope` shows the full card for
  the current ready gate.

## 3. Brownfield Scope

Allowed implementation paths:

- `create-agdf/lib/control-evaluation/gate-check.js` (envelope rendered branch only)
- `plugin/meta/contracts/interaction.md` (§ approval-time envelope wording)
- `plugin/skills/gate-check/SKILL.md` (§ Output sequence sentence)
- `plugin/scripts/check-runtime-integrity.mjs` (phrase list)
- `create-agdf/scripts/interaction-presentation-test.js` and, if envelope fixtures exist there,
  `create-agdf/lib/skill-evals/**` fixtures
- `create-agdf/generated/**` exclusively via the canonical sync owners

## 4. Out Of Scope

- `APPROVAL_SEQUENCE`, snapshot build/validate/render and all card field sets
- locale registry changes
- status-only reporting, non-ready interactions, JSON schema
- commit, push, PR, release, installed-host mutation

## 5. Risks And Blockers

| Risk | Impact | Handling |
|---|---|---|
| Integrity phrases span lines and break on CRLF hosts | medium | PDV-T3 mandates single-line phrases; PDV-T5 verifies on LF content |
| Skill-eval fixtures pin the old envelope output | medium | PDV-T1 inventories fixtures before edits |
| Envelope length considered noisy later | low | PRD §2 decision documented; revisiting requires a new UR |

## 6. Next Step

Review this Task/Test Plan and approve only with:

`Approval: TP`
