# TP: Canonical Scope Classification Card

Status: approved
Gate: TP
Gate approval: `Approval: TP` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: SD (approved 2026-07-21)
Date: 2026-07-21
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T1 | Add `renderScopeClassificationCard(classification, { registry, requestedLocale })` to `create-agdf/lib/interaction-presentation.js`: validated input contract (`outcome`, `mode`, `trivial_boundary`, `ur_trigger_evaluation`, `allowed_summary`, `forbidden_summary`, `escalation_triggers[]`, `challenge_path`); returns `{ semantic_block: "scope_classification_card", markdown, authorizes: false }` or `null` on invalid/missing/contradictory input; pure, no I/O. | SCC-1, SCC-2 | unit test: byte-identical repeat render; no approval-option vocabulary; `authorizes: false`; `null` on bad input |
| T2 | Add locale registry section `primary.scopeClassification.*` to `plugin/meta/agdf-interaction-locales.json` for `en` and `de`; reuse existing `validateLocaleRegistry` baseline parity. | SCC-6 | parity validation; forced-incomplete pack falls back to English as a unit |
| T3 | Add one owning section to `plugin/meta/contracts/interaction.md` for the scope classification block: activation boundary, fail-closed rules, `authorizes: false`, separation from read-only orientation and the two-card approval envelope. | (normative owner) | integrity assertion: section present |
| T4 | Add one consume-verbatim section to `plugin/skills/gate-check/SKILL.md` for ungated fresh scopes; reference `interaction.md` as owner; no local card template. | SCC-7 | integrity assertion: canonical reference present, no local template markers |
| T5 | Add Runtime Integrity assertions to `plugin/scripts/check-runtime-integrity.mjs`: renderer export exists; registry section parity; gate-check canonical reference without local template; contract section present. | SCC-7 | `check-runtime-integrity.mjs` green (source + installed layout) |
| T6 | Add renderer unit tests to `create-agdf/scripts/interaction-presentation-test.js`: SCC-1 byte-identical, SCC-2 no approval vocabulary + `authorizes: false`, SCC-5 challenge path present, SCC-6 locale fallback, fail-closed `null`. | SCC-1, SCC-2, SCC-5, SCC-6 | test run green |
| T7 | Add eval cases to `evals/cases/gate-check.json` + `evals/fixtures/catalog.json` + `evals/observations/deterministic-replay.json` + `evals/manifest.json`: ungated render (SCC-3), ambiguous boundary → no card (SCC-4), gated scope → no card (SCC-8); regenerate fingerprints; bump `corpus_version`. | SCC-3, SCC-4, SCC-8 | `eval:skills` pass; `skill-evals-test.js` pass |
| T8 | Propagate via `create-agdf/scripts/sync-package-assets.js` to generated surfaces (Copilot instructions, OpenCode skills); verify the additive export rides the existing plugin-runtime packaging (`runtime-manifest.json` digest updates); no hand-edits. | (compatibility) | sync idempotence + `smoke-test` + built-plugin integrity green |
| T9 | Check `pages/` for any hardcoded skill/case count or gate-check output wording that the change could stale; Pages derives eval counts via glob (verified 2026-07-21) — confirm no hardcoded string breaks. | (compatibility) | `npm --prefix pages run check` green |

### UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| SCC-1 | ungated-trivial / ungated-quick-task | T6 | byte-identical repeat render unit test | fulfilled | none |
| SCC-2 | ungated-trivial / ungated-quick-task | T6 | no approval vocabulary + `authorizes: false` assertion | fulfilled | none |
| SCC-3 | ungated-trivial / ungated-quick-task | T7 | eval case: ungated render expected action includes card | fulfilled | none |
| SCC-4 | gated-or-ambiguous | T7 | eval case: ambiguous boundary → no card, fail-closed | fulfilled | none |
| SCC-5 | ungated-trivial / ungated-quick-task | T6 | challenge path present in renderer output | fulfilled | none |
| SCC-6 | all | T2, T6 | parity validation + forced-incomplete fallback test | fulfilled | none |
| SCC-7 | ungated-trivial / ungated-quick-task | T4, T5 | integrity: canonical reference, no local template | fulfilled | none |
| SCC-8 | gated-or-ambiguous | T7 | eval case: gated scope → no card | fulfilled | none |

## 2. Test Plan

- Unit: `interaction-presentation-test.js` (T6) — deterministic render, no approval controls, challenge path, locale fallback, fail-closed.
- Integrity: `check-runtime-integrity.mjs` source + installed layout (T5).
- Eval: `eval:skills` + `skill-evals-test.js` (T7).
- Smoke: `create-agdf` smoke chain including `test:interaction-presentation`, `test:runtime-integrity-layout`, `test:skill-evals`, `eval:skills` (T8).
- Pages: `npm --prefix pages run check` (T9).
- Inspection: one reviewed example card per locale (`en`/`de`) at QA.

## 3. Brownfield Scope

Pre-implementation Brownfield Analysis (after `Approval: TP`) inspects: `interaction-presentation.js` export patterns (`renderOperationalStatusCard`); `validateLocaleRegistry` baseline mechanics; `gate-check/SKILL.md` output section; `check-runtime-integrity.mjs` assertion patterns; eval fixture/observation/manifest mechanics (already exercised 2026-07-21); `sync-package-assets.js` surface list; plugin runtime packaging (`runtime-manifest.json`, `agdf-local.js` subset).

## 4. Out Of Scope

- CLI-side run-less evaluation path (deferred per UR).
- Machine-readable JSON twin and any persistence (UR non-goal).
- Live host UI verification; VCS actions; release; reinstall.
- Changes to `status_presentation` / `approval_presentation` schemas or the Quick Task output shape.

## 5. Risks And Blockers

- Prose-adjacent integrity assertions: prefer presence-of-canonical-reference checks over broad forbidden-phrase lists (lesson from `activation-diagnosis-determinism`).
- Registry parity false positives: reuse the existing `validateLocaleRegistry` baseline rather than ad-hoc key checks.
- Agent-side input drift: mitigated by the validated input contract and fail-closed `null`; a future CLI-side evaluation may supersede it (deferred, UR-recorded).
- Runtime packaging must include the new export: verify in T8 via the digest update and built-plugin integrity.

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
