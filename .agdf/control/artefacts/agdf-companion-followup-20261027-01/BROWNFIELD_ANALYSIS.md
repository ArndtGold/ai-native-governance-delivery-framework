# Brownfield Analysis: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Decision: pass
Mode: `pre_implementation_analysis`
Status: `pass`

## Run

- run_id: `agdf-companion-followup-20261027-01`
- related_sd: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/SD.md` (approved, revision 9)
- related_tp: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/TP.md` (approved, revision 11)
- current_gate: Brownfield Analysis
- reviewer: Claude
- reviewed_at: 2026-10-27

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- scope: Approved TP tasks T-001 to T-009 for the companion follow-up (SDD-01 to SDD-12).
- evidence: Companion modules under `plugins/agdf/host-templates/claude/companion/` (`register.mjs:51-71` refresh and stale handling, `:201-234` turn and close hooks where `ui.close` with origin person stops the refresh, `:105-164` panel body with the actions row; `run-state.mjs:53-81` parser without the Mode/Slice Decision section; `gate-bar.mjs:8-15` fixed `GATES`; `state.mjs:21-36` four moods and the turn overlay; `figure.mjs:7-16` figure box, 48 px accessory region and per-mood bounds; `persistence.mjs:17-34` state file with defaults for missing fields; `localization.mjs:28-35` config-only chat locale; `locales.json` titles "AGDF Companion" / "AGDF-Begleiter"). Core owners to mirror, read-only: `packages/core/lib/control-evaluation/gate-check.js:141-181` (`BREADCRUMB_PATH_TEMPLATES`, `buildBreadcrumbPath`) and `:229` (`breadcrumb` in the evaluation result), `run-state-policy.js:45-51` (`modeSliceDecision`), `packages/core/lib/control-state/run-state-document.js:125-182` (Mode/Slice section and fields, backtick cleaning), `shared.js:297-328` (`isPlaceholderValue`, `filled`), `decision-content-readiness.js:7-13` (`isDecisionContentPlaceholder`). Fixtures: `packages/core/lib/control-state/run-steps.js:59` (`RUN_STEP_ROUTES` covers all five routes) and `:310-335` (`route` step needs an approved UR and a `BROWNFIELD_REVIEW.md` in the run's artefact folder); `packages/core/test/control-cockpit-fixtures.js` (`fixture`, `approvalFixture`). Generation and checks: `scripts/sync-package-assets.js:620` copies the whole companion folder into the runtime plugin; `scripts/public-plugin/validator.js:134-140` checks only the modules declared in `hooks.json` (still `register.mjs`); `plugins/agdf/scripts/check-runtime-integrity.mjs:1638-1639` lists every companion file explicitly; `scripts/public-plugin/copilot-profile.js:107-110` excludes `companion/` by prefix; `packages/cli/scripts/package-contents-test.js:39-41,84-86` requires three companion files and keeps the companion under the runtime plugin only. Tests: `packages/cli/scripts/claude-companion-test.js:283` asserts the old title "AGDF-Begleiter"; the adapter suite's fake host (`claude-companion-adapter-test.js:27-60`) has no `ui.toast`, `ui.status`, `audio` or `settings`. Host API: Claude Code 2.1.308 declaration of `$.ui.toast`, `$.ui.status`, `$.audio.play` (base64 clips; Linux and Windows terminals play nothing) and `$.settings.read`.
- missing_evidence: Desktop behaviour of toast, status line and audio on Windows (T-001 probe, before adapter work); whether `plugins/agdf/scripts/check-runtime-integrity.mjs` is part of the Copilot payload, which decides whether adding `notice.mjs` to its file list moves the Copilot baseline (T-007 measures it through `npm run build:prepare`).
- current_coverage: partial — the delivered companion covers the four moods, the fixed seven-gate bar, panel, assignment, persistence of three choices and failure isolation with tests; build mood, mode paths, notices, status line, the two switches, brand unification, placeholder handling and the language fallback are not present.
- reuse_strategy: extend — reuse the parser's `section`/`field` helpers for the Mode/Slice section, the existing gate-bar renderer and condensed form, the figure's accessory-region pattern and bounds tests, the adapter's catch paths and `persist` write path, the state file's default handling, the locale-set parity test, the canonical-writer fixtures and the fake host. One new logic module, `notice.mjs`, holds the detector, texts and chime; no new host wiring.
- risks: (1) The core marks OR as done only when the run's completion is fulfilled; a fixture completed by editing the lifecycle without closeout would make the status card show OR open, so parity fixtures for completed runs must come from canonical closeout or the existing completed fixture. (2) The core's `section` regex stops at `## ` and `# ` headings while the companion's stops at `## `; the parity test uses canonical RUN_STATE documents, which contain no level-one heading after the first line. (3) A decision value written as the template alternative list (backticked `quick_task | …`) is not undecided in the core but maps to no path template, which yields `UR`; the companion must reproduce the same visible result. (4) Hidden-pane reads change the delivered SDD-07 behaviour; the adapter tests that asserted the timer stop on a person's close must change accordingly. (5) The validator requires every host call spelled `$.noun.method(...)` at its call site; helper indirections for the new calls would fail `claude plugin validate`. (6) Adding `notice.mjs` to the integrity list changes a file under `plugins/agdf/scripts/`; if it ships in the Copilot payload, the Copilot baseline must be re-recorded with a reason and, as recorded for the predecessor, the measurement differs between Windows and Linux.
- context_graph_impact: unchanged from the Brownfield Review (update `CG-RUN-STATUS-CARD` companion_projection after implementation evidence, before closeout).
- required_next_step: CD+Tests, beginning with the T-001 host probe.

## Minimal Clean Implementation Path

1. T-001: scratch mod in this session's dev-mods folder with an after-turn probe of toast, status line, audio clip and `settings.read`; record observations and screenshots; remove the scratch mod.
2. T-002: `run-state.mjs` `route` and placeholder-free `objective`; `gate-bar.mjs` `PATHS`, mark rules and the `CD+Tests` insertion; keep `gateBar`, `fullGateBar` and `condensedGateBar` signatures.
3. T-003: `state.mjs` mood `baut` and turn rule; `figure.mjs` palette, motion, accessory, bounds and `FIGURE_TEXT.baut`.
4. T-004: `notice.mjs` with `observeNotice`, `noticeText`, `statusText` and `chimeClip`.
5. T-005: `register.mjs` lifecycle, toast, sound, status line, settings language, second button row and catch paths; `persistence.mjs` fields; `localization.mjs` fallback; `locales.json` texts; `view.mjs` objective and build state; integrity file list.
6. T-006: extend the three suites; replace the old-title assertion; add parity fixtures for every route through `recordRunStep` `route`.
7. T-007 to T-009: generators and targeted lanes, `INSTALL.md`, native checks and the live session.

## Findings

No finding blocks or revises the approved TP; the risks above are implementation obligations inside T-002 to T-007.

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP, beginning with T-001.
- forbidden_until_then: none beyond the TP order; a T-001 probe that breaks the session or AGDF returns the run to SD.
