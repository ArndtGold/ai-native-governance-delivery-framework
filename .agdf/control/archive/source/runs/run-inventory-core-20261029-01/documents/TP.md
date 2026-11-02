# TP: Shared Core Run Inventory from Stored Run State

Status: draft
Gate: TP
Gate approval: open
Based on: SD (`.agdf/control/artefacts/run-inventory-core-20261029-01/SD.md`, approved revision 8)
Date: 2026-10-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Move `isDecisionContentPlaceholder` and its prompt set into the pure module `packages/core/lib/control-evaluation/decision-content-placeholder.js`; re-export it from `decision-content-readiness.js` so existing callers stay unchanged | Claude Code implementing agent | none |
| T-002 | Pure module `packages/core/lib/control-state/run-inventory.js` with `buildRunInventory(sources, { language })`: structural reading of Run Meta, Objective, Current Control State, Approvals and Artefacts through `run-state-document.js`; title and title source; attention rules; display-only receipt reader for `Run Operations` and `Approval Operations` with `atob` and `TextDecoder`; Approvals date fallback; closure facts; total order; counts; state; German and English labels, basis note and history line | Claude Code implementing agent | T-001 |
| T-003 | Node-side reader `packages/core/lib/control-state/run-inventory-reader.js` `readRunInventory(root, { language })` over `discoverRuns`, mapping parsed content and findings to sources without a second file read | Claude Code implementing agent | T-002 |
| T-004 | Doctor all-active: add `inventory.runs` and `inventory.counts` from `readRunInventory` in `doctor.js`, leaving `state`, `active_count`, `status`, `summary`, `findings` and `runs` unchanged | Claude Code implementing agent | T-003 |
| T-005 | Inspect operation `inventory`: add it to `CONTROL_INSPECT_OPERATIONS` as unbound read, add the service case with report and `renderRunInventory` presentation in `interaction-presentation.js`, shorten the `gate` description to "Document gate." and the `all_active` description to "doctor/delivery-map only.", keep the definition at or below 5000 bytes | Claude Code implementing agent | T-003 |
| T-006 | CLI command `inventory` (`--dir`, `--json`, `--language`) in `validation-handlers.js`, `command-registry.js` and `parse-args.js`; `validateReadSelection` rejects `--run` and `--all-active` for it; help text | Claude Code implementing agent | T-005 |
| T-007 | Routing: catalog entry `control.inventory` and the "Active Run Inventory" section in `plugins/agdf/meta/contracts/request-activation.md`, router line in `plugins/agdf/meta/agdf-agent-router.md`, route boundary line in `plugins/agdf/skills/gate-check/SKILL.md`, evaluation cases `de-active-runs-current-project` and `en-active-runs-current-project`, `packages/cli/scripts/active-run-inventory-test.js` | Claude Code implementing agent | T-005, T-006 |
| T-008 | Documentation and evidence chain: `docs/handbook/de/04-mehrere-runs.md`, `docs/handbook/en/04-multiple-runs.md`, `docs/architecture/07-ui-konzept.md` section 9; refresh the Copilot payload baseline, eval fingerprints and the compatibility record | Claude Code implementing agent | T-007 |
| T-009 | Verification: new `packages/core/test/run-inventory-test.js` registered in `test:control-inspect`; extended `control-inspect-test.js` and `active-run-inventory-test.js`; MCP server tests after `sync-package-assets`, `assemble-npm` and `npm --prefix packages/mcp-server ci`; request-activation tests and evaluations; build preparation; recorded measurement on this repository | Claude Code implementing agent | T-001 to T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-01 | T-002 | SCN-001 | Fixture texts for an active, a completed, a superseded and an abandoned run yield one entry each with run ID, title, title source, lifecycle, gate, stored decision, attention code and label, last activity with source and precision, revision, revision ID, missing text, next action and path | Core test output (run-inventory suite) |
| AC-001 | SDD-06 | T-002 | SCN-002 | The superseded fixture shows outcome, reason and successor from its newest `lifecycle_close.record` receipt; the abandoned fixture shows outcome and reason | Core test output |
| AC-002 | SDD-04 | T-002 | SCN-003 | An Objective sentence becomes the title with source `objective`; "Describe the trustworthy outcome.", "What outcome should become possible?" and an empty Objective yield the run-ID title with source `run_id` | Core test output |
| AC-002 | SDD-05 | T-001 | SCN-004 | `isDecisionContentPlaceholder` imported from the new module and from `decision-content-readiness.js` returns the same results for template prompts, `todo`, angle-bracket text and real sentences; the existing decision-content tests pass unchanged | Core test output and existing suite |
| AC-003 | SDD-03 | T-002 | SCN-005 | One fixture per rule gets its class: history none; invalid `blocked`; decision `block` and Artefacts result `blocked` give `blocked`; decision `revise`, `decline`, Artefacts result `revise`, `reject` and `request_change` recorded for the current gate give `clarification_required`; "Exact Approval: QA." and decisions `pending` and `awaiting_uat` give `decision_required`; `in_progress`, `pass`, `qa_approved`, `completed` give `in_progress`; an unknown decision gives `unclear`; a run with decision `revise` and a pending approval is `clarification_required`; backticked values classify like plain ones | Core test output |
| AC-004 | SDD-06 | T-002 | SCN-006 | Newest receipt `created_at` wins with source `receipt` and precision `time`; without receipts the newest Approvals date wins with source `approval` and precision `day`; without both the value is null with source `none`; a migration `updated_at` and a missing `updated_at` never appear; an undecodable receipt cell is ignored | Core test output |
| AC-005 | SDD-07 | T-002 | SCN-007 | Shuffled input orders give the identical list: active by class order, then last activity descending with day dates at 00:00 UTC and unknown last, then run ID; then completed, superseded, abandoned; counts per lifecycle and class match | Core test output |
| AC-006 | SDD-02 | T-003 | SCN-008 | In a fixture repository a folder without `RUN_STATE.md`, a pending run-step journal and a malformed Run Meta appear as invalid `blocked` entries with the discovery finding codes and the `doctor --run` hint; state is `incomplete`; without `.agdf/control/runs` the state is `absent` with no entries; a clean repository is `complete` | Core test output |
| AC-007 | SDD-01 | T-002 | SCN-009 | A static walk of `run-inventory.js` and every module it imports finds no `node:` import and no `process`, `Date.now` or `new Date()` call without argument; two calls with equal input return deeply equal results | Core test output |
| AC-008 | SDD-12 | T-002 | SCN-010 | Language `de` gives „Entscheidung erforderlich“, „Klärung erforderlich“, „blockiert“, „in Arbeit“, „unklar“ and the German basis note with the revision number; `en` gives the English labels; `fr` falls back to English; no label names a person | Core test output |
| AC-009 | SDD-08 | T-004 | SCN-011 | `doctor --all-active --json` on the fixture repository keeps `status`, `summary`, `findings`, `runs`, `inventory.state` and `inventory.active_count` equal to a run without the change, adds `inventory.runs` in SCN-007 order and `inventory.counts`, and the active IDs of `inventory.runs` equal those of `runs` | CLI test output |
| AC-010 | SDD-09 | T-005 | SCN-012 | `agdf_inspect` with `operation: inventory`, target and language returns `inspect_result` with report state, counts and runs identical to the doctor inventory and a markdown presentation listing active runs with title, gate and label; `run_id` or `all_active: true` with `inventory` is rejected as invalid input; no gate evaluation function is called | MCP runtime test output with a spy on the evaluators |
| AC-010 | SDD-11 | T-006 | SCN-013 | `inventory --dir ROOT --json` prints the same report as SCN-012; without `--json` it prints the presentation; `--run` or `--all-active` is rejected | CLI test output |
| AC-011 | SDD-10 | T-005 | SCN-014 | The tool list contains `inventory` in the operation enum; `controlInspectDefinitionBytes()` and the protocol budget test report at most 5000 bytes; the `gate` and `all_active` schema guards still reject `gate` with `gate-check` and `all_active` with other operations | Core and MCP protocol test output |
| AC-012 | SDD-13 | T-007 | SCN-015 | Both evaluation cases expect `control.inventory`; the catalog lists `control.inventory` with command owner `inventory`; `active-run-inventory-test.js` lists runs through `operation: inventory`; request-activation tests and evaluations pass | Request-activation test and evaluation output |
| AC-013 | SDD-02 | T-009 | SCN-016 | On this repository the CLI inventory lists every run folder once, counts per lifecycle equal a direct count of Run Meta lifecycles, no title equals a template prompt, no last activity equals any `updated_at` value, and the MCP inventory call finishes in under 3 s | Recorded command output and timing in `evidence/` |
| AC-013 | SDD-08 | T-009 | SCN-017 | `doctor --all-active --json` on this repository takes at most 1 s longer than on the baseline commit in three alternating measurements, and its inventory equals the CLI inventory | Recorded timing in `evidence/` |
| AC-014 | SDD-14 | T-008 | SCN-018 | The handbook chapters and `07-ui-konzept.md` section 9 describe the command, operation, fields, classes, stored-state basis, changed route and follow-up consumers; `npm run build:prepare`, the compatibility check and the skill evaluations pass after the baseline, fingerprint and record refresh | Documentation diff and build output |

## 3. Test Plan

Reused proof: the control-state, lifecycle guard, run-close, control-inspect, decision-content, MCP protocol and request-activation suites run unchanged except where this plan names an extension; they cover discovery, selection, ended runs, target resolution and budgets. New proof covers only the inventory module, its reader, the two consumers and the route. All checks run in this run before QA; pull-request CI runs the full lanes afterwards.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing entry assertions | Fix before T-009 completes |
| AC-001 | SCN-002 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing closure assertions | Fix before T-009 completes |
| AC-002 | SCN-003 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing title assertions | Fix before T-009 completes |
| AC-002 | SCN-004 | `node packages/core/test/run-inventory-test.js` and the existing decision-content suite in `npm --prefix packages/cli run test:control-state` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing equality and unchanged suite | Fix before T-009 completes |
| AC-003 | SCN-005 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing class assertions per rule | Fix before T-009 completes |
| AC-004 | SCN-006 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing activity assertions | Fix before T-009 completes |
| AC-005 | SCN-007 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing order and count assertions | Fix before T-009 completes |
| AC-006 | SCN-008 | `node packages/core/test/run-inventory-test.js` with temporary fixture repositories | Local Node 22 on Windows and CI | Write access to the system temp folder | Claude Code implementing agent | Passing state and finding assertions | Fix before T-009 completes |
| AC-007 | SCN-009 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing import-graph and determinism assertions | Fix before T-009 completes |
| AC-008 | SCN-010 | `node packages/core/test/run-inventory-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing label assertions | Fix before T-009 completes |
| AC-009 | SCN-011 | `node packages/cli/scripts/control-inspect-test.js` | Local Node 22 on Windows and CI | Write access to the system temp folder | Claude Code implementing agent | Passing doctor report assertions | Fix before T-009 completes |
| AC-010 | SCN-012 | `node packages/cli/scripts/active-run-inventory-test.js` | Local Node 22 on Windows and CI | Write access to the system temp folder | Claude Code implementing agent | Passing MCP runtime assertions | Fix before T-009 completes |
| AC-010 | SCN-013 | `node packages/cli/scripts/control-inspect-test.js` | Local Node 22 on Windows and CI | Write access to the system temp folder | Claude Code implementing agent | Passing CLI assertions | Fix before T-009 completes |
| AC-011 | SCN-014 | `node packages/cli/scripts/control-inspect-test.js` and `npm --prefix packages/mcp-server test` after `npm run sync-package-assets`, `node scripts/assemble-npm.mjs` and `npm --prefix packages/mcp-server ci` | Local Node 22 on Windows and CI | Local npm cache; no publish | Claude Code implementing agent | Passing budget and schema assertions | If `npm ci` cannot reach the registry, record the gap and rely on the CI lane before QA |
| AC-012 | SCN-015 | `npm --prefix packages/cli run test:request-activation` and `npm --prefix packages/cli run eval:request-activation` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing tests and evaluation report | Fix before T-009 completes |
| AC-013 | SCN-016 | `node packages/cli/bin/create-agdf.js inventory --dir REPO --json` and one `agdf_inspect` call through the MCP dispatch runtime with timing | This repository on the implementing Windows machine | Read access to this repository | Claude Code implementing agent | Output and timing files under `.agdf/control/artefacts/run-inventory-core-20261029-01/evidence/` | If the timing target fails, record it and return to SD for the read path |
| AC-013 | SCN-017 | `doctor --all-active --json` three times each on this tree and on a temporary worktree of `main` at the run start, alternating | This repository on the implementing Windows machine | Read access; temporary worktree in the scratch area | Claude Code implementing agent | Timing table under `evidence/` | If the worktree cannot be created, compare against the 11.7 s baseline recorded in the UR and state the weaker method |
| AC-014 | SCN-018 | `npm run build:prepare`, `npm run compatibility:record`, `npm --prefix packages/cli run eval:skills` | Local Node 22 on Windows | none | Claude Code implementing agent | Green build preparation, refreshed records, passing skill evaluations | Fix before QA |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Fixture set and timing method | SD: Fixture set and timing method for AC-013 | resolved | Fixtures are built in temporary folders by the new Core test; the real-repository proof uses this repository's run store as it is on the delivery day; timing uses three alternating measurements against a temporary worktree of `main` at the run start (SCN-016, SCN-017) | Claude Code implementing agent, TP author |
| Test registration | TP | resolved | `run-inventory-test.js` is added to the existing `test:control-inspect` script, which is already part of the CI test domains; no new domain is needed | Claude Code implementing agent, TP author |

## 4. Brownfield Scope

Pre-implementation Brownfield Analysis confirms the reuse path for `discoverRuns`, `run-state-document.js` and the control-inspect service, lists every place that reads the moved placeholder rule, checks that no other consumer depends on the shortened descriptions, and confirms the contract text change chain before CD+Tests.

## 5. Out Of Scope

- Companion switch to a bundled copy (slice 2), hub supplement 3 (slice 3) and the intake candidate list.
- Any change to backlog content, run states or the locale registry.
- Native host observation of the changed route.

## 6. Risks And Blockers

- The definition budget leaves only a few bytes; if `inventory` does not fit after the two shortenings, CD stops and returns to SD instead of raising the budget.
- `npm ci` for the MCP server package needs registry access; a failure is recorded as an evidence gap before QA.
- Timing on Windows varies with load; SCN-017 alternates measurements to reduce noise.

## 7. Next Step

Review this TP and approve only with:

`Approval: TP`

The approval permits the pre-implementation Brownfield Analysis and then CD+Tests.

## AGDF Approval Summary (de; source=en)

- Ziel: Das freigegebene Lösungsdesign in neun Aufgaben umsetzen und jede Akzeptanzanforderung mit einem ausführbaren Nachweis belegen.
- Umfang: T-001 Platzhalterregel in ein reines Modul verschieben; T-002 reines Inventar-Modul mit Titel, Klassen, Aktivität, Abschlussangaben, Reihenfolge, Zählungen und Bezeichnungen; T-003 Leser über `discoverRuns`; T-004 doctor-Bericht erweitern; T-005 Inspect-Operation `inventory` mit Darstellung und gekürzten Beschreibungen im 5000-Byte-Budget; T-006 CLI-Befehl `inventory`; T-007 Route `control.inventory` mit Router, Skill-Zeile, Eval-Fällen und Test; T-008 Handbuch, UI-Konzept und Nachweiskette; T-009 Tests, Paketbau, MCP-Tests und Messung auf diesem Repository. 18 Szenarien SCN-001 bis SCN-018 decken jede Paarung aus Akzeptanzkriterium und Designentscheidung ab.
- Entscheidungen: Fixtures entstehen in temporären Ordnern; der Echtnachweis nutzt den Run-Bestand dieses Repositorys am Liefertag; die doctor-Zeit wird dreimal abwechselnd gegen einen temporären Worktree von `main` gemessen; der neue Test hängt am bestehenden Skript `test:control-inspect`. Passt `inventory` trotz Kürzungen nicht ins Budget, geht es zurück ins SD statt das Budget zu erhöhen.
- Risiken: Sehr wenig Restbudget in der Tool-Definition; `npm ci` braucht Registry-Zugriff, ein Ausfall wird als Nachweislücke vermerkt; Zeitmessungen unter Windows schwanken.
- Nächster Schritt: Nach `Approval: TP` folgen die Brownfield Analysis vor der Implementierung und dann CD+Tests.
