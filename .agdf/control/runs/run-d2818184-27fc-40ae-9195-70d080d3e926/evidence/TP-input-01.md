# TP: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-11-05
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

The implementing agent (Claude) executes every task on a feature branch cut from main `53e8e900`; Arndt Gold is the accountable owner. Increment 1 is T-001 to T-006, increment 2 is T-007 to T-013 (PRD decision P3).

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Build the fixture set F01 to F12 from the existing factories, capture the golden status-card baseline (CLI and MCP, de and en, plus status-field JSON) on the unchanged code, and add the companion regression cases for the observed divergence (next step for an open UR without artefact, "No open runs" for a legacy-only store) that must fail on the unchanged companion | Arndt Gold | none |
| T-002 | Extract the status-field rules of `evaluateGateCheck` (artefact presence, UR/PRD/SD readiness, SD/TP traceability, approval-summary and decision-content readiness) into pure functions over captured contents; existing exported evaluators keep their signatures, read through `control-read/fs.js` and delegate (SDD-002) | Arndt Gold | T-001 |
| T-003 | Add `packages/core/lib/companion/run-view.js` (`projectRunView`) and `run-view-capture.js` (`captureRunViewFacts` with injected `exists`, `list`, `read`); the status card takes its status fields from the projection (SDD-001) | Arndt Gold | T-002 |
| T-004 | Add the project diagnosis to the run view: store status from `config.json` and per-run reasons `run_version_unsupported`, `run_state_invalid`, `too_large`, `missing` with counts, readable runs still listed (SDD-003) | Arndt Gold | T-003 |
| T-005 | Add `packages/core/lib/companion/figure-state.js` (`deriveFigureState`, moods laeuft, baut, wartet, blockiert, fertig, bereit) and move all companion texts from `companion/locales.json` into a `companion` section of `agdf-interaction-locales.json` with validator coverage (SDD-004) | Arndt Gold | T-003 |
| T-006 | Connect the Claude companion through the generated bridge (`scripts/sync-package-assets.js` extended to the new modules), shrink `state.mjs`, `run-state.mjs` and the text parts of `localization.mjs` to thin adapters, render the diagnosis, and extend the integrity test for pure import closure and no writes under `.agdf/control` (SDD-010) | Arndt Gold | T-004, T-005 |
| T-007 | Add `packages/core/lib/companion/events.js` with schema `companion-event/1` and the pure `deriveEvent(toolName, input, result)` for all eight kinds (SDD-005) | Arndt Gold | T-006 |
| T-008 | Append events in `postprocessToolResult` of the MCP dispatch runtime to `companion/events.jsonl` below the plugin data root for facade and generation, bounded to 256 KiB with one rotation file `events.1.jsonl`, write errors swallowed (SDD-006) | Arndt Gold | T-007 |
| T-009 | Compute review facts: preview (40 lines or 4 KiB, truncation flag), bytes and digest on seal with source_match not_determinable; source path, recorded digest and source_match match on path recordings; drift warning in the run view for declared run-local sources; pure SHA-256 in `packages/core/lib/companion/sha256.js` over `canonicalRunText` (SDD-008) | Arndt Gold | T-003, T-007 |
| T-010 | Let the companion read the journal every 2 seconds with a bounded read, filter by normalized project root, re-read the run view on new events, show notices per decision P1 and "events unavailable" for a missing or unreadable journal (SDD-007) | Arndt Gold | T-006, T-008, T-009 |
| T-011 | Add a host-neutral harness that renders run view, figure state and events from Core exports and the journal format only, without the Claude mod (SDD-001, SDD-004, SDD-009) | Arndt Gold | T-005, T-007, T-009 |
| T-012 | Rebuild generated assets and payload, check the Copilot payload budget, re-record the compatibility record, and run the full regression set including the golden comparison and MCP contract snapshots | Arndt Gold | T-010, T-011 |
| T-013 | Native check in the Claude desktop app on Windows 11 with screenshots as UAT input: current project, disposable legacy store, live events during a short run | Arndt Gold | T-012 |

## 2. Verification Traceability

Fixtures F01 to F12 are defined in Planning Decisions. Scenario IDs are unique across the plan.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-003 | SCN-001 | For F01 to F07 the run view from `captureRunViewFacts` with node file access yields the same status, current gate, gate path, missing approval, next step and blocking reason as the gate-check status card of the same run | `packages/core/test/companion-run-view-test.js` parity output |
| AC-001 | SDD-002 | T-002 | SCN-002 | For every fixture the extracted pure rules return the same readiness results and open items as the node evaluators, including one not-ready case per rule | `packages/core/test/companion-readiness-parity-test.js` output |
| AC-001 | SDD-001 | T-006 | SCN-003 | The companion regression case for F01 shows the status card's next step; it fails on the unchanged companion (recorded in T-001) and passes after T-006 | `claude-companion-test.js` output before and after, kept in the run evidence |
| AC-002 | SDD-003 | T-004 | SCN-004 | F08 names the unreadable count with `run_version_unsupported` and never "No open runs"; F09 yields `control_layout_unsupported`; F11 and F12 yield `run_state_invalid` and `too_large`; a run folder without RUN_STATE yields `missing` | `companion-run-view-test.js` diagnosis cases; companion regression case from T-001 failing before and passing after |
| AC-002 | SDD-003 | T-013 | SCN-005 | In the Claude desktop app the companion opened on a disposable copy of the archived legacy store shows count and reason instead of "Keine offenen Runs" | Screenshot and observation note in the UAT input |
| AC-003 | SDD-003 | T-004 | SCN-006 | F10 lists the readable current runs and keeps the unreadable-runs hint with its count; the companion rendering shows both | `companion-run-view-test.js` mixed case and `claude-companion-test.js` mixed rendering case |
| AC-004 | SDD-001 | T-011 | SCN-007 | A harness importing only `packages/core/lib/companion` exports renders the run view for F01 to F10 with the same fields as the companion rendering | `packages/core/test/companion-host-neutral-test.js` output |
| AC-004 | SDD-004 | T-011 | SCN-008 | The harness derives the same figure mood and reason as the companion for every fixture, and each of the six moods is reached at least once | `companion-host-neutral-test.js` output |
| AC-004 | SDD-009 | T-011 | SCN-009 | The harness parses events written by the real MCP tool path using only the Core event module and the versioned journal format; no MCP operation or schema was added for it | `companion-host-neutral-test.js` output and the MCP contract snapshot from SCN-019 |
| AC-005 | SDD-006 | T-008 | SCN-010 | Through facade (legacy and modern) and plugin generation, the journal line for an accepted `presentation.deliver` exists below the data root when the tool result returns, measured below 30 s; rotation at 256 KiB moves lines to `events.1.jsonl`; an unwritable data root leaves the tool result byte-identical | `packages/mcp-server/test/companion-journal.test.js` output with measured timing |
| AC-005 | SDD-007 | T-010 | SCN-011 | With an injected clock a new journal line for the current root triggers a run-view re-read and a notice within one 2-second tick; lines of other roots are ignored with win32 separator and case normalization; malformed lines are skipped; a missing journal shows "events unavailable" | `claude-companion-adapter-test.js` output |
| AC-006 | SDD-005 | T-007 | SCN-012 | Each kind (approval_requested, approval_recorded, write_rejected, effect_unknown, recovery_required, run_completed, material_staged, document_recorded) is derived exactly once with kind, run_id, gate and time from its MCP outcome; read-only inspect calls and rejections with dispatch unknown produce no write_rejected | `packages/core/test/companion-events-test.js` and `companion-journal.test.js` per-kind cases |
| AC-007 | SDD-008 | T-009 | SCN-013 | A UR recording from a run-local path carries preview, bytes, the recorded digest and source_match match; a document over 40 lines or 4 KiB gets a truncated preview with flag; exactly 40 lines and exactly 4096 bytes stay untruncated; sealed staged material carries source_match not_determinable | `companion-journal.test.js` review-fact cases |
| AC-008 | SDD-008 | T-009 | SCN-014 | After the declared source file of a recording is changed, the run view raises a drift warning naming the document, the recorded and the current digest, and the companion shows it as a toast per P1 | `companion-run-view-test.js` drift case and `claude-companion-adapter-test.js` toast case |
| AC-008 | SDD-008 | T-009 | SCN-015 | A reproduced 2026-11-05 base64 corruption (same length, changed bytes) shows the corrupted text in the preview with source_match not_determinable and no mismatch claim; the pure SHA-256 equals node crypto for empty, single-block, multi-block, non-ASCII and CRLF-canonicalized inputs | `packages/core/test/companion-sha256-test.js` and `companion-journal.test.js` corruption case |
| AC-009 | SDD-010 | T-006 | SCN-016 | The import closure of the companion and bridged Core modules contains no Node built-ins; the companion writes only `companion-state.json`; its hooks never block or change an MCP call; the digest of `.agdf/control` is unchanged across simulated companion activity including journal polling; an injected control write in a probe module makes the check fail | `claude-companion-integrity-test.js` output |
| AC-010 | SDD-004 | T-005 | SCN-017 | The `companion` catalog section is complete for de and en and passes the catalog validator; figure moods and all companion texts come from the catalog with no literal UI strings left in the companion modules; removing one key fails validation | `interaction-catalog-test.js` and `claude-companion-test.js` text cases |
| AC-011 | SDD-002 | T-012 | SCN-018 | The status card bytes (CLI and MCP, de and en) for F01 to F12 equal the T-001 baseline; existing companion, gate-check, status-card, CLI MCP and MCP server suites pass; the test diff removes or weakens no assertion | `packages/core/test/status-card-golden-test.js` output, suite outputs and PR CI run |
| AC-011 | SDD-009 | T-012 | SCN-019 | MCP tool list, input and result schemas and error codes equal main `53e8e900`; the payload stays within the Copilot baseline; the re-recorded compatibility record passes its check | `test:contract`, `test:mcp-ergonomics`, `test:payload-budget` and `compatibility:check` outputs |

## 3. Test Plan

Reuse first: the existing companion suites, gate-check and status-card tests, MCP server suites and CLI MCP suites cover unchanged behavior and are run unchanged. New collection is planned only for claims they do not cover: shared projection, diagnosis, events, journal, review facts, SHA-256 parity, purity and catalog completeness. One scenario run may support several criteria; nothing is repeated without a changed condition.

Placement: targeted run checks of increment 1 (SCN-001 to SCN-004, SCN-006, SCN-016, SCN-017 and the golden part of SCN-018) pass before T-007 starts. All targeted checks pass on the final revision before Code Review. PR CI (`npm run verify:ci`) is required before merge. No nightly result is relied on.

Defect proof: the divergence cases from T-001 (SCN-003, SCN-004 companion part) are run on the unchanged code first and must fail for the intended reason; their failing output is kept as evidence.

Sufficiency: verification is complete when SCN-001 to SCN-019 pass on the final revision, PR CI is green and SCN-005 has its screenshot. Re-checks need a trigger: changed code after the check, a failed or invalidated result, or a new contradiction.

Known limit: concurrent journal writers are covered by a bounded interleaving test, not a multi-process stress run (SD gap). If `effect_unknown` or `recovery_required` cannot be produced through the real tool path with the existing fault-injection seams of the MCP test harness, SCN-012 covers them with result objects validated against the published result schema, and this is recorded as an evidence limit for QA.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/core/test/companion-run-view-test.js` | local Windows 11 workstation, repository Node toolchain, feature branch | checkout, `npm run build:prepare` done | Claude agent, accountable Arndt Gold | all parity assertions pass for F01 to F07 | stop increment 1, fix the projection, re-run |
| AC-001 | SCN-002 | `node packages/core/test/companion-readiness-parity-test.js` | local Windows 11 workstation | T-001 fixtures present | Claude agent, accountable Arndt Gold | rule and evaluator results equal for every fixture | stop increment 1; no status card change until parity holds |
| AC-001 | SCN-003 | `npm --prefix packages/cli run test:claude-companion` before T-006 and after | local Windows 11 workstation | regression case added in T-001 | Claude agent, accountable Arndt Gold | failing output before, passing output after | if the case does not fail before, rewrite it until it reproduces the divergence |
| AC-002 | SCN-004 | `node packages/core/test/companion-run-view-test.js` | local Windows 11 workstation | frozen legacy archive `agdf-0.20.2-control-v2.json.gz` loads | Claude agent, accountable Arndt Gold | diagnosis assertions pass for F08, F09, F11, F12 and missing | stop; open an evidence gap for the missing reason code |
| AC-002 | SCN-005 | manual check in the Claude desktop app, screenshot | Claude desktop app on Windows 11 with the locally built AGDF plugin | companion enabled; disposable scratch Git project holding a copy of `.agdf/control/archive/source`; repository store untouched | Arndt Gold with Claude agent | screenshot with count and reason | record an evidence gap for UAT and name the missing access |
| AC-003 | SCN-006 | `node packages/core/test/companion-run-view-test.js` and `npm --prefix packages/cli run test:claude-companion` | local Windows 11 workstation | F10 fixture present | Claude agent, accountable Arndt Gold | mixed-store assertions pass | stop increment 1, fix, re-run |
| AC-004 | SCN-007 | `node packages/core/test/companion-host-neutral-test.js` | local Windows 11 workstation | T-005, T-007, T-009 done | Claude agent, accountable Arndt Gold | rendered fields equal companion fields | stop; record a design gap for SD if Core exports are insufficient |
| AC-004 | SCN-008 | `node packages/core/test/companion-host-neutral-test.js` | local Windows 11 workstation | as SCN-007 | Claude agent, accountable Arndt Gold | figure parity and six moods reached | as SCN-007 |
| AC-004 | SCN-009 | `node packages/core/test/companion-host-neutral-test.js` | local Windows 11 workstation | journal produced by SCN-010 setup | Claude agent, accountable Arndt Gold | events parsed with Core exports only | as SCN-007 |
| AC-005 | SCN-010 | `node packages/mcp-server/test/companion-journal.test.js` (registered in `test:protocol`) | local Windows 11 workstation; PR CI | `npm run build:prepare` for current generation; temporary data root | Claude agent, accountable Arndt Gold | journal, timing, rotation and unchanged-result assertions pass | stop increment 2; no companion polling work before the writer passes |
| AC-005 | SCN-011 | `npm --prefix packages/cli run test:claude-companion` | local Windows 11 workstation | fake `$` with injected clock and file access | Claude agent, accountable Arndt Gold | adapter assertions pass | stop, fix, re-run |
| AC-006 | SCN-012 | `node packages/core/test/companion-events-test.js` and `node packages/mcp-server/test/companion-journal.test.js` | local Windows 11 workstation; PR CI | as SCN-010 | Claude agent, accountable Arndt Gold | one event per kind, none for read-only calls | record the documented evidence limit for kinds not reachable through the tool path |
| AC-007 | SCN-013 | `node packages/mcp-server/test/companion-journal.test.js` | local Windows 11 workstation; PR CI | as SCN-010 | Claude agent, accountable Arndt Gold | review-fact and boundary assertions pass | stop increment 2, fix, re-run |
| AC-008 | SCN-014 | `node packages/core/test/companion-run-view-test.js` and `npm --prefix packages/cli run test:claude-companion` | local Windows 11 workstation | recorded fixture with declared source | Claude agent, accountable Arndt Gold | drift warning and toast assertions pass | stop increment 2, fix, re-run |
| AC-008 | SCN-015 | `node packages/core/test/companion-sha256-test.js` and `node packages/mcp-server/test/companion-journal.test.js` | local Windows 11 workstation | none beyond checkout | Claude agent, accountable Arndt Gold | SHA-256 parity and corruption case pass | stop; the mod must not use digests until parity holds |
| AC-009 | SCN-016 | `node packages/cli/scripts/claude-companion-integrity-test.js` | local Windows 11 workstation; PR CI | generated bridge rebuilt | Claude agent, accountable Arndt Gold | purity, write-scope, hook and digest assertions pass, probe write detected | block QA; observation-only guarantee is mandatory |
| AC-010 | SCN-017 | `npm --prefix packages/cli run test:interaction-catalog` and `npm --prefix packages/cli run test:claude-companion` | local Windows 11 workstation; PR CI | catalog and companion rebuilt | Claude agent, accountable Arndt Gold | completeness, validator and negative case pass | stop, complete the catalog, re-run |
| AC-011 | SCN-018 | `node packages/core/test/status-card-golden-test.js`, `npm --prefix packages/cli run test:claude-companion`, `npm --prefix packages/cli run test:cli-gates`, `npm --prefix packages/cli run test:control-inspect`, `npm --prefix packages/mcp-server test`, then PR CI `npm run verify:ci` | local Windows 11 workstation; GitHub Actions PR CI | T-001 baseline snapshots committed; CI access through the PR | Claude agent, accountable Arndt Gold | byte-identical goldens and green suites | any golden difference blocks QA until explained and removed |
| AC-011 | SCN-019 | `npm --prefix packages/mcp-server run test:contract`, `npm run test:mcp-ergonomics`, `npm --prefix packages/cli run test:payload-budget`, `npm run compatibility:record`, `npm run compatibility:check` | local Windows 11 workstation; PR CI | generated assets rebuilt | Claude agent, accountable Arndt Gold | unchanged contract, budget within baseline, compatibility check passes | over budget: stop and ask Arndt Gold for a reviewed budget decision |

## Planning Decisions

The SD deferred one decision to TP; it is resolved below together with the local execution choices.

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Fixture set and golden snapshot contents | SD: Fixture set and golden snapshot contents | resolved | Fixtures: F01 open UR without artefact, F02 ready UR draft awaiting approval, F03 PRD gate with draft, F04 pending structured internal step (Brownfield Review and UX Intent), F05 TP gate, F06 completed quick_task, F07 completed structured run, F08 legacy v2 only (frozen 0.20.2 archive), F09 unsupported layout, F10 mixed current and legacy, F11 invalid RUN_STATE, F12 oversized RUN_STATE; built from `current-run.js`, `current-structured-run.js`, `current-closeout.js` and the legacy archive loader; each snapshot holds the CLI and MCP status card text in de and en plus the status-field JSON, captured on main 53e8e900 before T-002 | Arndt Gold |
| Golden normalization | TP | resolved | Only volatile values known from each fixture (run_id, revision_id, operation ids, timestamps, absolute root) are replaced by exact-string tokens; no pattern masking, so any other byte difference fails | Arndt Gold |
| Increment checkpoint | TP | resolved | Increment 1 passes its targeted checks before T-007 starts; both increments stay in this run and one Code Review covers the complete diff | Arndt Gold |
| Native evidence scope | TP | resolved | Native proof is the Claude desktop app on Windows 11 with screenshots as UAT input; Codex and the Claude CLI are not re-qualified in this run | Arndt Gold |
| Legacy live check source | TP | resolved | A copy of `.agdf/control/archive/source` assembled as the control store of a disposable scratch Git project; the repository store is never modified | Arndt Gold |
| Event timing assertion | TP | resolved | The tool-path test asserts that the journal line exists when the MCP result returns and records the elapsed time; the companion test asserts a notice after at most one 2-second tick with an injected clock | Arndt Gold |

## 4. Brownfield Scope

The pre-implementation Brownfield Analysis inspects before any code change:

- every file read of `evaluateGateCheck` and `buildStatusCard` in `packages/core/lib/control-evaluation/gate-check.js`, and the readiness modules `ur-readiness.js`, `prd-readiness.js`, `sd-readiness.js`, `traceability-readiness.js`, `tp-planning.js`, `decision-content-readiness.js` and `run-state.js`;
- the read seam `packages/core/lib/control-read/fs.js` and the summary owner `run-presentation-render.js`;
- `postprocessToolResult` in `packages/cli/lib/mcp-dispatch-runtime.js`, the material store `packages/core/lib/control-state/run-material.js` and data-root resolution in `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`;
- the companion modules in `plugins/agdf/host-templates/claude/companion/` and `scripts/sync-package-assets.js`;
- `plugins/agdf/meta/agdf-interaction-locales.json` and `packages/core/lib/interaction-catalog-validation.js`;
- fixture factories in `packages/core/test/fixtures/` (determinism of IDs and timestamps), the legacy archive loader, the payload budget scripts and the compatibility record flow.

## 5. Out Of Scope

- Codex UI, Codex event consumption and event exposure through `agdf_inspect` (separate Codex run).
- Any new MCP operation, tool or schema change, and any change to error codes, gate rules or approval formulas.
- Approval, delegated approval, gating or blocking of MCP calls by the companion, and any companion write under `.agdf/control`.
- Migration or repair of legacy control stores.
- Redaction of previews, file watching, a multi-process stress run of the journal and nightly checks.

## 6. Risks And Blockers

- Block QA: any golden status-card difference, a failing purity or write-scope check (SCN-016), or an MCP contract difference (SCN-019).
- Revise: missing parity for a fixture, an event kind without tool-path evidence beyond the documented limit, or a payload over the Copilot baseline without a reviewed budget decision.
- Warn: fixture factories may create random IDs and timestamps; the golden normalization handles only known values, so non-deterministic output found in Brownfield Analysis becomes a TP correction, not a looser comparison.
- Warn: changes under `plugins/agdf` start the contract text change chain (payload baseline, eval fingerprints, compatibility record); native Claude CLI release evidence becomes stale and is renewed in the next release qualification, not in this run.
- Warn: rotation races between several MCP servers may drop events; accepted because the journal is a notification channel.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Ziel: Aufgaben- und Testplan für den Begleiter-Kern in zwei Schritten: erst die gemeinsame Run-Ansicht mit Diagnose, Figurzuständen und Katalogtexten, dann Ereignisse und Review-Fakten aus echten MCP-Ergebnissen.
- Aufgaben: Schritt 1: T-001 Fixtures F01 bis F12, Golden-Ausgangsstand der Statuskarte auf main 53e8e900 und Regressionsfälle für die beobachtete Abweichung; T-002 Statusregeln von evaluateGateCheck rein herauslösen; T-003 Run-Ansicht mit Lese-Teil, die Statuskarte nutzt sie; T-004 Diagnose unlesbarer Bestände; T-005 Figurzustände und Texte im zentralen Katalog; T-006 Begleiter über die Bridge anbinden, Integritätstest. Schritt 2: T-007 Ereignismodell; T-008 Protokoll im Plugin-Datenverzeichnis; T-009 Review-Fakten mit reinem SHA-256 und Abweichungswarnung; T-010 Begleiter liest das Protokoll alle 2 Sekunden; T-011 hostneutraler Prüfstand; T-012 Pakete, Nutzlast, Kompatibilität und volle Regression; T-013 Live-Prüfung im Claude-Desktop.
- Tests: 19 Szenarien decken AC-001 bis AC-011 und alle zugeordneten SDD ab. Kern sind der Golden-Vergleich der Statuskarte (CLI und MCP, de und en), der Paritätstest Begleiter gegen Statuskarte, Diagnose-, Ereignis- und Review-Fakten-Tests über den echten MCP-Pfad, SHA-256-Parität mit node crypto, der Integritätstest gegen Schreibzugriffe unter .agdf/control und die Katalogvollständigkeit. Die beobachtete Abweichung (nächster Schritt, „Keine offenen Runs“) wird zuerst am unveränderten Stand als Fehlschlag gezeigt. Vor dem Merge läuft die PR-CI.
- Entscheidungen: Der SD-Punkt Fixture-Satz ist geklärt: zwölf Zustände von offenem UR bis gemischtem Bestand, Golden-Inhalt sind Statuskartentexte und Statusfelder. Flüchtige Werte werden nur exakt ersetzt. Schritt 1 muss grün sein, bevor Schritt 2 beginnt. Die Live-Prüfung läuft nur im Claude-Desktop unter Windows, mit einer Kopie des archivierten Altbestands in einem Wegwerfprojekt.
- Abgrenzung: Keine Codex-Oberfläche, keine neue MCP-Operation oder Schemaänderung, keine Freigabe oder Blockade durch den Begleiter, keine Migration alter Bestände, kein Mehrprozess-Stresstest.
- Risiken: Jede Golden-Abweichung, ein Verstoß gegen Reinheit oder Schreibverbot und eine Vertragsänderung am MCP blockieren die QA. Nicht deterministische Fixtures führen zu einer TP-Korrektur statt einem lockereren Vergleich. Nutzlast und Kompatibilitätsaufzeichnung wachsen mit. Falls effect_unknown oder recovery_required über den echten Tool-Pfad nicht erreichbar sind, wird das als Nachweisgrenze vermerkt.
- Nächster Schritt: TP prüfen und nur mit `Approval: TP` freigeben; danach folgt die Brownfield-Analyse vor der Umsetzung.
