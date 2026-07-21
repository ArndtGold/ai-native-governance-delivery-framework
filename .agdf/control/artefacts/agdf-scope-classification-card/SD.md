# SD: Canonical Scope Classification Card

Status: approved
Gate: SD
Gate approval: `Approval: SD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: PRD (approved 2026-07-21)
Date: 2026-07-21
Owner: agent

## 1. Solution Overview

Add one additive, code-owned renderer `renderScopeClassificationCard` to the existing presentation owner `create-agdf/lib/interaction-presentation.js`. `gate-check` builds a small validated classification input from its own evaluation of a fresh ungated scope and consumes the returned Markdown verbatim. Locale copy lives in the canonical locale registry; the interaction contract gains one short owning section; Runtime Integrity and evals guard drift and behavior. No CLI evaluation-path change: the classification decision remains agent-side (gate-check against the Runtime Contract); only the rendering becomes code-owned. This is the small-slice answer to the UR's evaluation-location question — a CLI-side run-less evaluation is explicitly deferred.

## 2. Ownership And Source Of Truth

- `create-agdf/lib/interaction-presentation.js` — sole renderer owner (pattern: `renderOperationalStatusCard`).
- `plugin/meta/agdf-interaction-locales.json` — sole copy owner; new section `primary.scopeClassification.*` in `en` and `de`; parity enforced by the existing `validateLocaleRegistry` baseline comparison.
- `plugin/meta/contracts/interaction.md` — sole normative owner of the new presentation block (activation boundary, fail-closed rules, `authorizes: false`).
- `plugin/skills/gate-check/SKILL.md` — consumer only; references the contract, owns no template.
- `create-agdf/scripts/interaction-presentation-test.js` — renderer unit tests.
- `plugin/scripts/check-runtime-integrity.mjs` — ownership/non-duplication assertions.
- `evals/` — behavioral cases via existing corpus infrastructure.

## 3. Architecture Decisions

1. **Renderer signature**: `renderScopeClassificationCard(classification, { registry, requestedLocale })` returns `{ semantic_block: "scope_classification_card", markdown, authorizes: false }` or `null` on any invalid input.
2. **Classification input contract** (agent-built, renderer-validated): `{ outcome: "ungated", mode: "quick_task", trivial_boundary: "inside | outside", ur_trigger_evaluation, allowed_summary, forbidden_summary, escalation_triggers: string[], challenge_path }`. All fields required; enums exact; free-text fields bounded (plain text only, no Markdown, length-budgeted per registry `lengthBudgets`). Missing, unknown or contradictory input → `null` (fail closed; agent then uses the existing ceremony, never a model-reconstructed card).
3. **Card composition** (compact per PRD depth decision, fixed order): localized neutral title; classification line (mode + boundary); grounds line (UR-trigger evaluation); one "currently allowed" line; one "remains forbidden" line; escalation triggers line; challenge-path line. No tables, no approval vocabulary, no raw snake_case keys.
4. **Locale fallback**: resolve via existing `resolvePresentationLocale`; incomplete pack fails to English as a unit; canonical values (`quick_task`, paths) untranslated.
5. **Activation boundary** (pinned in `interaction.md`): the card renders only for fresh-scope ungated classifications. Read-only requests keep the single read-only orientation sentence; gated scopes and selected-run internal steps keep existing presentations. Never both for the same request.
6. **Duplication guards**: `gate-check` gets one additive consume-verbatim section; integrity assertions check the canonical reference exists and no local card template markers exist in the skill; registry parity reuses `validateLocaleRegistry`.

## 4. Integration Points

- `plugin/skills/gate-check/SKILL.md` — consume-verbatim section for ungated fresh scopes.
- `plugin/meta/contracts/interaction.md` — new short section owning the block; cross-reference from `modes.md` not required (no mode change).
- `create-agdf/scripts/sync-package-assets.js` — generated surfaces (Copilot instructions, OpenCode skills) receive skill/contract propagation through the canonical sync owner; no hand-edits.
- Plugin runtime packaging: `interaction-presentation.js` is already shipped in the surface-local validator runtime; the additive export rides the existing distribution (verify in TP).
- `evals/cases/gate-check.json` + fixtures/observations/manifest — three new cases (ungated render; ambiguous → no card; gated → no card).

## 5. Constraints And Compatibility

- No schema change to `status_card`, `status_presentation` or `approval_presentation`; purely additive.
- No new gate vocabulary beyond the two working-mode labels from the approved PRD.
- Card must stay cheaper than today's ad-hoc classification: one renderer call, one compact block, no extra user step (PRD proportionality constraint).
- Renderer stays pure: no I/O, no state, no timestamps — byte-identical output for identical input (SCC-1).
- Chat Output Discipline unchanged; the card is the classification's visible surface, reports stay in durable files.

## 6. Test And Evidence Strategy

- Unit tests in `create-agdf/scripts/interaction-presentation-test.js`: byte-identical repeat render (SCC-1); output contains no approval-option vocabulary and `authorizes: false` (SCC-2); challenge path present (SCC-5); `de` pack renders, forced-incomplete pack falls back to English as a unit (SCC-6); invalid/missing/contradictory input returns `null` (fail closed).
- Runtime Integrity assertions: renderer export exists; registry section parity; gate-check canonical reference without local template; contract section present (SCC-7).
- Eval cases in `evals/cases/gate-check.json` with fixtures: ungated classification expected action includes rendering the card (SCC-3); ambiguous boundary expects no card and fail-closed ceremony (SCC-4); gated scope expects no card (SCC-8). Fingerprints regenerated via the canonical library; corpus_version bump.
- QA evidence: unit test output, integrity run, eval report, one reviewed example card per locale (`en`/`de`).

## 7. Risks And Open Questions

- Prose-adjacent integrity assertions (skill template markers) must be chosen to avoid false positives — prefer presence-of-canonical-reference checks over broad forbidden-phrase lists (lesson from `activation-diagnosis-determinism`).
- Agent-side classification input construction could drift from the contract over time; mitigated by the bounded input contract and renderer validation, but a future CLI-side evaluation may supersede it (deferred, UR-recorded).
- Exact copy wording per locale — TP-level detail within registry budgets.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
