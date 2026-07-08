# UR: AGDF Operating Model Sharpening

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-08
Owner: agent

## 1. Problem

AGDF already defines strong gates, artefacts, quality contracts and status projections. The MarzipanWeb governance model shows additional operational guardrails that reduce ambiguity in real brownfield work: source precedence, per-run persistence routing, ambiguous-scope handling, branch/workspace evidence limits, lightweight bug scopes and support-answer handoffs.

## 2. Goal

Generalize those patterns into AGDF so agents and teams can operate more safely without adding unnecessary ceremony.

## 3. Scope

- Add source-precedence, persistence-routing, multi-scope fail-closed, branch-not-proof, bug-lightweight track, support handoff and domain guardrail-pack concepts to AGDF runtime surfaces.
- Update Runtime Contract, Router, templates, quality contracts and validators where appropriate.
- Update documentation and the Pages site so the public explanation matches the strengthened operating model.

## 4. Non-Goals

- No change to AGDF gate order.
- No weakening of exact approval rules.
- No import of MarzipanWeb-specific domain rules, German Freigabe formula or repository layout.
- No new broad skill catalogue.

## 5. Acceptance Signals

- Runtime Contract names the new guardrails in reusable AGDF language.
- Control templates have a per-run persistence decision.
- Quality contracts include ambiguity/source/branch/persistence guardrails.
- Pages explains the operating-model sharpening clearly.
- Runtime integrity, smoke and pages checks pass.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-agent-router.md`
- `plugin/control/templates/`
- `plugin/control/templates/AGENT_QUALITY_CONTRACTS.json`
- `plugin/scripts/check-runtime-integrity.mjs`
- `pages/src/`

## 7. Risks And Unknowns

- Risk of too much rule density; mitigate by presenting these as ambiguity reducers and lightweight paths.
- Pages source may need only copy/data updates, not layout changes.

## 8. Next Step

Brownfield Review and Mode/Slice Decision are recorded in `BROWNFIELD_REVIEW.md`.
