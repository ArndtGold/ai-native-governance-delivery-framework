# SD: Pre-Decision Status Card Visibility

Status: approved
Gate: SD
Gate approval: revision 1 approved with exact `Approval: SD` on 2026-09-01 after same-run, same-gate and revision revalidation
Revision: 1
Based on: `.agdf/control/artefacts/pre-decision-status-card-visibility/PRD.md` (approved revision 1)
Date: 2026-09-01
Owner: agent

## 1. Solution Overview

1. `printApprovalEnvelope` (`create-agdf/lib/control-evaluation/gate-check.js`) receives the full
   report it already gets today and, in the rendered branch, prints in PDV-02 order:
   `approval_presentation.blocks.run_status_card.markdown` (compact, carries the decision title as
   its first line — rule unchanged), then `report.status_presentation.markdown` (full card, verbatim,
   exactly once), then `blocks.gate_transition_card.markdown`, then the exact-text fallback line.
   Blank lines separate blocks as today; no new locale key (PRD §7 resolved: plain separator).
2. If `status_presentation` is missing at a ready gate, the envelope prints the existing localized
   `statusPresentationFailure` line with the `presentation_diagnostics.status_presentation_errors`
   codes at the full-card position and continues with the remaining blocks — visible degradation,
   never silent omission (PDV-04/AC-05; reuses the identity-parity diagnostics delivered on
   2026-09-01).
3. The snapshot pipeline (`buildApprovalOrientationSnapshot`, `APPROVAL_SEQUENCE`,
   `validateApprovalOrientationSnapshot`, `renderApprovalOrientationSnapshot`) is untouched: the full
   card renders from the report, outside the validated three-block snapshot, keeping AC-03 by
   construction and avoiding any second `run_status_card` semantic id inside the snapshot (PDV-03).
4. Contract amendment (`plugin/meta/contracts/interaction.md`): the sentence "remains available for
   complete detail outside the approval-time compact view" (lines 157-158) is replaced by the
   normative PDV-02 sequence including the full card, plus one sentence scoping the approval-value
   once-only rule to the snapshot blocks and explicitly permitting the full card's missing-approval
   row as audit data.
5. Skill amendment (`plugin/skills/gate-check/SKILL.md` §Output): the "render its five-field compact
   approval-time projection first, then the Gate Transition Card" sentence gains the full card step
   in PDV-02 order; the skill continues to defer to the contract as sequence owner.
6. Runtime Integrity: `plugin/scripts/check-runtime-integrity.mjs` required-phrase list is updated
   where it pins the replaced wording, and gains one assertion for the new sequence sentence so
   future drift fails deterministically.
7. Generated surfaces propagate only via `sync-package-assets.js` / `sync-plugin-runtime.js`.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design use |
|---|---|---|
| Approval-time sequence (normative) | `plugin/meta/contracts/interaction.md` | Amended once; skill and code follow it |
| Envelope rendering | `gate-check.js#printApprovalEnvelope` | Only code change; consumes existing report fields |
| Full card content | `status_presentation.markdown` (existing) | Rendered verbatim; no second renderer, no field change |
| Snapshot authority presentation | `APPROVAL_SEQUENCE` + validators | Untouched (AC-03) |
| Failure diagnostics | `presentation_diagnostics` (existing) | Reused at the full-card position |
| Wording drift guard | `check-runtime-integrity.mjs` | Phrase list updated with the amendment |

## 3. Architecture Decisions

1. **Full card outside the snapshot.** Rendering from `status_presentation` keeps the frozen,
   validated snapshot byte-identical and needs no sequence/validator change; the envelope is the
   single composition point. Rejected alternative: extending `APPROVAL_SEQUENCE` to four blocks —
   would touch build/validate/render, every envelope test and the contract's block semantics for no
   additional guarantee.
4. **Fallback-first at the card position.** A ready gate must never lose the card silently; the
   diagnostics mechanism from `doctor-presentation-identity-parity` already carries the codes, so the
   envelope reuses it instead of adding a second failure path.
3. **JSON unchanged.** Consumers already receive both `status_presentation` and
   `approval_presentation`; composition order is contract-owned prose, not a schema concern (AC-09).

## 4. Integration Points

| Caller | Change |
|---|---|
| `gate-check.js#printApprovalEnvelope` rendered branch | Insert full-card (or diagnostic fallback) block between compact card and transition card |
| `plugin/meta/contracts/interaction.md:151-158` | Replace outside-the-compact-view sentence with PDV-02 sequence + once-only scope sentence |
| `plugin/skills/gate-check/SKILL.md:210-215` | Sequence sentence gains the full-card step |
| `plugin/scripts/check-runtime-integrity.mjs` phrase list | Swap pinned wording; add new-sequence assertion |
| `interaction-presentation-test.js` envelope cases (387, 404, 423) | Extend fixtures with `status_presentation`; assert order, verbatim content, exactly-once and fallback-with-codes |

## 5. Constraints And Compatibility

- No JSON schema change; no locale key change; no card field change; approval values and gate order
  untouched (AC-09).
- Non-ready interactions and status-only reporting unchanged (AC-07).
- Exactly-once: the envelope renders each block once per invocation; tests assert no duplicate
  full-card markdown in one output (AC-01/AC-02).
- Native Windows: wording assertions in `check-runtime-integrity.mjs` remain `\n`-sensitive; the
  amendment must not worsen the known CRLF host limitation (no new multi-line pinned phrases).

## 6. Test And Evidence Strategy

1. Envelope order test: rendered branch output contains compact card, full card, transition card,
   fallback line in exactly that order, full card verbatim from the fixture `status_presentation`.
2. Exactly-once test: full-card markdown occurs once even when `reEvaluate` refreshes the report.
3. Degradation test: ready gate with `status_presentation: null` renders the localized failure line
   with diagnostic codes at the card position and still requests the decision.
4. Snapshot regression: all existing snapshot/validator tests pass unmodified (AC-03).
5. Wording tests: Runtime Integrity passes with the amended contract on an LF checkout; the old
   sentence is asserted absent.
6. Sync determinism and `git diff --check` per AC-08.

## 7. Risks And Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Longer envelope output at every gate | accepted by PRD §2 (bounded, once per decision) | — |
| Runtime Integrity phrase update collides with CRLF host limitation | low | Single-line phrases only; verified on LF content |
| Consumers relying on envelope line offsets | low | No known consumer parses envelope text; JSON consumers unaffected |

No open design questions; TP details the task/test breakdown.

## 8. Next Step

Review this Solution Design and approve only with:

`Approval: SD`
