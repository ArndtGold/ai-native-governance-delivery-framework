# UR: Run Status Card and Quality Outlook

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-08
Owner: agent

## 1. Problem

AGDF already has gate-check and delivery-map outputs, but the everyday operating surface for humans and agents is still spread across multiple fields. The next allowed process step is visible, while the next meaningful quality improvement is not consistently first-class in CLI status outputs.

## 2. Goal

Introduce an official AGDF Run Status Card projection and promote `quality_outlook` as the next meaningful quality-improvement signal beside the next permissible process step.

## 3. Scope

- Define Run Status Card fields in the Runtime Contract.
- Expose status-card data in `gate-check --json` and `delivery-map --json`.
- Include `quality_outlook` in relevant JSON and text output.
- Keep templates aligned where AGDF_RUN and OR already store closeout/status fields.
- Add or update smoke/runtime integrity checks for the new contract.

## 4. Non-Goals

- No change to gate order.
- No weakening of exact approval rules.
- No automatic QA/UAT/release claim.
- No second transition model separate from gate-check and delivery-map.

## 5. Acceptance Signals

- CLI JSON includes a compact status-card object.
- Text output names quality outlook where available.
- Runtime Contract explains `next_step` versus `quality_outlook`.
- Existing smoke/runtime integrity checks pass.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `create-agdf/bin/create-agdf.js`
- `plugin/control/templates/AGDF_RUN.md`
- `plugin/control/templates/artefacts/OR.md`
- `create-agdf/scripts/smoke-test.js`
- `plugin/scripts/check-runtime-integrity.mjs`

## 7. Risks And Unknowns

- The status card must not become a second gate model.
- `quality_outlook` must remain advisory/quality-oriented and must not unlock process work.

## 8. Next Step

Brownfield Review and Mode/Slice Decision are recorded in `BROWNFIELD_REVIEW.md`.
