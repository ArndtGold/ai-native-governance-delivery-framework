# PRD: Pre-Decision Status Card Visibility

Status: approved
Gate: PRD
Gate approval: revision 1 approved with exact `Approval: PRD` on 2026-09-01 after same-run, same-gate and revision revalidation
Revision: 1
Date: 2026-09-01
Run: `pre-decision-status-card-visibility`
Derived from: approved UR revision 1 and Brownfield Review 2026-09-01 (structured_slice)

## 1. Product Outcome

Before every ready-gate decision, the user sees the complete operational Run Status Card — path,
allowed and forbidden actions, blocker, missing approval and quality outlook — inside the same
approval presentation, without weakening exactly-once card semantics, the neutral decision title or
the non-authorizing nature of all presentation blocks.

## 2. Decision: Always-Render (offer rejected)

The ready-gate presentation always renders the full card. Rationale: an on-demand path already
exists today (`gate-check --status-card`, "remains available … outside the approval-time compact
view") and demonstrably failed the user — the card appeared once in a complete six-gate run and the
user had to ask twice. An offer line would preserve exactly that round-trip failure mode. The cost
(one additional Markdown table per gate decision) is bounded: it occurs only at ready gates, at most
once per decision.

## 3. Functional Requirements

### PDV-01 Full card in every ready-gate presentation

When a ready user gate requests a decision, the presentation contains the complete operational Run
Status Card, consumed verbatim from the code-owned `status_presentation.markdown`, exactly once.

### PDV-02 Fixed sequence, decision title unchanged

The first visible line remains the localized neutral decision title (existing contract rule
unchanged). The visible order is: compact five-field approval projection → full operational Run
Status Card → Gate Transition Card → one native question or exact-text fallback. Each block appears
exactly once per decision presentation.

### PDV-03 Semantic ownership and once-only scope

No new semantic block id is introduced: the full card keeps its existing `run_status_card`
status-surface role outside the validated snapshot; the snapshot's three-block `APPROVAL_SEQUENCE`
and its validators remain the authorization-presentation owner. The existing
approval-value-occurrence validation stays scoped to the snapshot blocks (compact card + Gate
Transition Card); the full card's `missing approval` row is audit data and is explicitly permitted —
the contract wording is amended to state this scope.

### PDV-04 Code-owned rendering

`gate-check --approval-envelope` renders the full card at the PDV-02 position from the already
computed `status_presentation` of the same report (no second evaluation, no new data source). The
JSON report needs no new field; consumers compose `status_presentation` and `approval_presentation`
per the amended contract. If the full card is unavailable, the existing failure/fallback path with
its diagnostic codes applies unchanged — the envelope must not silently skip it.

### PDV-05 One sequence description everywhere

`plugin/meta/contracts/interaction.md` (normative owner), `plugin/skills/gate-check/SKILL.md`
(guidance) and the code-owned envelope rendering describe the identical PDV-02 sequence. The
contract's sentence positioning the full card only "outside the approval-time compact view" is
replaced by the new sequence.

### PDV-06 Tests and propagation

Envelope tests assert the PDV-02 order, exactly-once rendering, verbatim card content and unchanged
snapshot validation; Runtime Integrity assertions that pin contract wording are updated with it.
Generated surfaces update only through the canonical sync owners. No gate, approval value, schema
version, card field set or locale key changes; locale copy is reused as-is.

## 4. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | Every `--approval-envelope` rendering of a ready gate contains the full Run Status Card markdown verbatim, exactly once, between the compact projection and the Gate Transition Card. |
| AC-02 | The first visible line is still the localized neutral decision title; no block is duplicated, merged or reordered otherwise. |
| AC-03 | Snapshot build/validate/render (`APPROVAL_SEQUENCE`, three blocks) is byte-identical in behavior; all pre-existing snapshot tests pass unmodified. |
| AC-04 | The approval-value once-only validation remains scoped to the snapshot blocks and the amended contract states this scope explicitly. |
| AC-05 | A missing/undeliverable full card at a ready gate surfaces the existing diagnostic fallback (codes included) instead of being silently omitted. |
| AC-06 | Contract, skill text and code describe the identical sequence; the "outside the compact view" replacement wording is gone from the contract. |
| AC-07 | Status-only reporting behavior is unchanged; non-ready interactions render no approval envelope (unchanged). |
| AC-08 | Generated mirrors match a fresh canonical sync; no hand-edited generated file; `git diff --check` clean. |
| AC-09 | No gate, approval value, schema field, card field set, locale key or authorization semantic changes. |

## 5. Non-Functional Requirements

- Determinism: identical report input yields identical envelope output.
- Localization: the full card is already localized; no new copy.
- Auditability: the decision context shown to the user equals the audit projection (same markdown).
- Compatibility: JSON consumers see no removed or renamed fields.

## 6. Explicit Non-Goals

- Changing the Run Status Card's fields, layout or ownership.
- Changing the compact projection's five fields or the Gate Transition Card.
- An offer/on-demand mechanism (explicitly rejected in §2).
- Host-native UI beyond the envelope/JSON projections; VCS/release actions.

## 7. Open Design Questions

- Exact contract wording for the amended once-only scope (SD).
- Whether the envelope prints a blank-line separator or a localized transition line between the full
  card and the Gate Transition Card (SD; no new locale key — reuse or omit).

## 8. Next Step

Review this PRD and approve only with:

`Approval: PRD`
