# UR: Scope Classification Card Contract Hardening

Status: approved
Gate: UR
Gate approval: approved on 2026-08-19 with exact `Approval: UR`
Date: 2026-08-19
Owner: agent

## 1. Problem

The delivered Scope Classification Card uses a clean single-owner renderer, but current code and
tests do not fully match the approved product and solution contract. The renderer accepts
`verified_change` although the card is defined for fresh ungated Quick Tasks, accepts unbounded
Markdown-bearing dynamic fields although the Solution Design requires bounded plain text, and
returns `null` for an incomplete locale registry while the approved PRD describes an English
fallback. The parent run is therefore not cleanly closeable without resolving the contract drift.

## 2. Goal

Make the Scope Classification Card contract internally consistent, fail-closed and testable while
preserving its existing single presentation owner, non-authorizing behavior and proportional UX.

## 3. Scope

- Clarify locale behavior so an unsupported requested locale uses the complete English pack, while
  a present but incomplete or invalid registry fails closed without rendering a card.
- Restrict the fresh ungated Scope Classification Card to `quick_task`; reject
  `verified_change` and all unknown modes.
- Define and enforce bounded plain-text dynamic fields, including escalation-trigger count and
  per-field length constraints; invalid input returns `null`.
- Add focused negative tests for mode, Markdown-bearing input, excessive length, invalid trigger
  collections and locale behavior.
- Preserve generated-surface parity and runtime integrity through the canonical synchronization
  and packaging owners.
- Reconcile QA/OR and lifecycle state only after the corrected behavior is reviewed and accepted.

## 4. Non-Goals

- No redesign of the card or new presentation owner.
- No CLI-owned scope-classification engine, persistence layer or machine-readable classification
  schema.
- No new gate, approval value or change to the Gate Transition Model.
- No change to Run Status Card or approval presentation behavior.
- No commit, push, pull request, release, publication or plugin reinstall.

## 5. Acceptance Signals

1. Valid `quick_task` inputs render byte-identically in complete English and German packs.
2. `verified_change`, unknown modes and gated outcomes return `null`.
3. Unsupported locale tags fall back to the complete English pack.
4. Incomplete or invalid locale registries return `null` without mixed-language output.
5. Markdown-bearing, multiline, over-length or structurally invalid dynamic fields return `null`.
6. Escalation triggers have an explicit maximum count and per-item bound.
7. `authorizes: false`, consume-verbatim ownership and the absence of a skill-local template remain
   enforced.
8. Focused tests, Runtime Integrity, generated-surface parity and relevant evals pass.
9. Updated review and QA evidence no longer claims behavior contradicted by the implementation.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/interaction.md`
- `plugin/meta/contracts/modes.md`
- `create-agdf/lib/interaction-presentation.js`
- `plugin/meta/agdf-interaction-locales.json`
- `.agdf/control/artefacts/agdf-scope-classification-card/PRD.md`
- `.agdf/control/artefacts/agdf-scope-classification-card/SD.md`
- `.agdf/control/artefacts/agdf-scope-classification-card/TP.md`
- `.agdf/control/artefacts/agdf-scope-classification-card/QA_REPORT.md`
- `.agdf/control/artefacts/agdf-scope-classification-card/OR.md`

## 7. Risks And Unknowns

- Brownfield Review must determine whether the locale clarification is a narrow correction to the
  existing PRD or requires a bounded PRD revision in this child.
- Length limits must reuse or extend one canonical budget owner rather than introduce magic numbers
  in the renderer.
- Plain-text validation must prevent Markdown/control injection without rejecting legitimate
  localized punctuation.
- Existing generated runtimes and eval fixtures may encode the current permissive behavior and must
  be inventoried before implementation.
- Live-host exactly-once rendering remains a separate evidence boundary unless the approved path
  explicitly includes authenticated host observation.

## 8. Next Step

The UR is approved. Brownfield Review and proportional routing are the next internal steps; the
approval does not authorize implementation.
