# SD: Shared Core Run Inventory from Stored Run State

Status: draft
Gate: SD
Gate approval: open
Based on: PRD (`.agdf/control/artefacts/run-inventory-core-20261029-01/PRD.md`, approved revision 6)
Date: 2026-10-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

One pure Core module, `packages/core/lib/control-state/run-inventory.js`, turns run state texts
into an ordered inventory. It owns title, attention class, last activity, closure facts, order,
counts and the localized class labels. It imports only `node:`-free modules and is called with
plain data.

A thin node-side reader, `run-inventory-reader.js`, feeds it from the existing `discoverRuns`
capture, which already reads and fully validates every `RUN_STATE.md`. No file is read twice and
no gate is evaluated per run.

Consumers in this slice:

1. `doctor --all-active` adds the inventory to its existing `inventory` object.
2. A new read operation `inventory` in the shared control-inspect service serves the MCP tool
   `agdf_inspect` and a new CLI command `inventory`. The request-activation route for "show the
   active AGDF runs" moves to it.

The flow is: discoverRuns (capture, parse, validity findings) → reader maps each run to
`{ run_id, text, findings }` → `buildRunInventory` → doctor report or inspect report plus a
markdown presentation.

## 2. Ownership And Source Of Truth

| Concern | Owner after this change | Note |
|---|---|---|
| Stored run facts | Each run's `RUN_STATE.md` | Unchanged; the inventory never writes |
| Run discovery and full validity | `run-state-reader.js` `discoverRuns` and `run-state-parser.js` | Unchanged; validity reaches the inventory as findings |
| Title, attention class, last activity, closure facts, order, counts, labels | `control-state/run-inventory.js` | New single owner for run lists |
| Template placeholder rule | New pure `control-evaluation/decision-content-placeholder.js` | Moved from `decision-content-readiness.js`, which re-exports it |
| Doctor all-active report | `control-evaluation/doctor.js` | Adds fields, keeps existing ones |
| Inspect operation and CLI command | `control-inspect/selection.js`, `contract.js`, `service.js`; CLI `validation-handlers.js`, `command-registry.js` | New operation `inventory` |
| Inventory presentation | `interaction-presentation.js` `renderRunInventory` | Reuses the existing `activeRunInventory` copy |
| Route for active-run listings | `plugins/agdf/meta/contracts/request-activation.md` | Catalog entry `control.inventory` |

The companion keeps its own parser until slice 2; the intake candidate list keeps
`buildRunCandidates` until its follow-up run.

## 3. Architecture Decisions

- SDD-01: Place the inventory in the pure module `packages/core/lib/control-state/run-inventory.js` with `buildRunInventory(sources, { language })`, where each source is `{ run_id, text, findings }` and `text` may be absent, and allow it to import only `run-state-document.js`, `run-identity.js` and `decision-content-placeholder.js`; rationale: plain data input keeps the module free of `node:` imports and file access, and these modules are already `node:`-free (`run-state-document.js` has no imports; `run-identity.js` only patterns); consequence: a later bundled copy for the companion can call the same function with texts it read itself.
- SDD-02: Feed the module through `control-state/run-inventory-reader.js` `readRunInventory(root, { language })`, which maps each `discoverRuns` result to a source with its parsed `content` as text and its findings when `valid` is false; rationale: `discoverRuns` already reads, parses and validates every run once per read view and is memoized (`run-state-reader.js:20-56`); consequence: doctor and inspect share one capture, and invalid runs (path problems, pending run-step journal, seal or receipt failures) appear as invalid entries with the existing finding codes.
- SDD-03: Implement the attention class in the module as the ordered PRD rules: history; invalid; stored decision `block` or `blocked` or the current gate's Artefacts result `block` or `blocked` (Quick Task Execution reads the CR row); stored decision `revise` or `decline`, Artefacts result `revise`, or "What is known?" stating a `reject` or `request_change` recorded for the current gate's material; "What is missing?" naming `Approval: UR|PRD|SD|TP|QA|UAT|OR` or stored decision `pending` or `awaiting_uat`; stored decision `in_progress`, `pass`, `qa_approved` or `completed`; otherwise `unclear`; rationale: these signals are what the companion already reads from the same sections (`state.mjs:8-35`, `run-state.mjs:43-56`), with the owner's choice that `revise` means clarification; consequence: results stay comparable with the companion, and slice 2 only needs to adopt the `revise` difference.
- SDD-04: Derive titles in the module from the first non-empty Objective line, stripped of Markdown, and fall back to the run-ID title (`normalizedRunTitle` rule: separators to spaces, words capitalized) when the placeholder rule matches; rationale: the Objective is the only title source inside the run state, and the placeholder rule already covers the template prompts; consequence: `title_source` is `objective` or `run_id`, and the 16 placeholder runs of this repository show readable ID titles.
- SDD-05: Move `isDecisionContentPlaceholder` and its prompt set into the pure module `control-evaluation/decision-content-placeholder.js` and re-export it from `decision-content-readiness.js`; rationale: one rule owner instead of a third copy, and the current owner imports file access (`decision-content-readiness.js` imports `control-read/fs.js`); consequence: existing callers are unchanged and the inventory can import the rule.
- SDD-06: Read last activity and closure facts with a display-only receipt reader inside the module that decodes the base64url receipt cells of `Run Operations` and `Approval Operations` with the global `atob` and `TextDecoder`, takes the newest `created_at`, and takes reason and successor from the newest `lifecycle_close.record`; dates of Approvals evidence cells (`· YYYY-MM-DD ·`) serve as day-precision fallback; undecodable cells are ignored; rationale: the validating readers depend on `node:` modules, while validity is already established by `parseRunState` in `discoverRuns` and passed in as findings; consequence: the inventory never decides receipt validity, and an invalid receipt makes the whole entry invalid through the caller's findings.
- SDD-07: Order entries in the module by lifecycle group (active, then completed, superseded, abandoned), attention group (`decision_required`, `clarification_required`, `blocked`, `in_progress`, `unclear`), last activity descending with day dates at 00:00 UTC and unknown last, then run ID, and count per lifecycle and per attention class; rationale: PRD AC-005 needs a total order that does not depend on input order; consequence: CLI, MCP and doctor return identical sequences for the same state.
- SDD-08: Extend the doctor all-active report with `inventory.runs` (the ordered entries) and `inventory.counts`, computed by `readRunInventory` from the same read view, while `inventory.state`, `inventory.active_count`, `status`, `summary`, `findings` and `runs` keep their current computation; rationale: PRD AC-009 requires unchanged existing fields and the SessionStart session check parses this report (`scripts/sync-plugin-runtime.js:350`); consequence: the addition costs only the in-memory classification, and the doctor status never depends on the inventory.
- SDD-09: Add the unbound read operation `inventory` to `CONTROL_INSPECT_OPERATIONS`, executed by the shared control-inspect service with report `{ schema_version, state, counts, runs, basis }` and a markdown presentation from `renderRunInventory`; rationale: the service already resolves the target, enforces read-only selection and serves both MCP and CLI (`service.js:200-305`); consequence: no run selection is accepted for it, `all_active` stays limited to doctor and delivery-map, and the result needs no per-run evaluation.
- SDD-10: Fit `inventory` into the 5000-byte `agdf_inspect` definition, measured at 4993 bytes on 2026-10-29, by shortening the `gate` description to "Document gate." and the `all_active` description to "doctor/delivery-map only."; rationale: both removed phrases restate rules the schema enforces (`dependentSchemas.gate`, the `all_active` guard), and the run-close SD set the precedent of shortening descriptions instead of raising the budget; consequence: the definition grows by the operation name in two enums and stays below 5000 bytes, verified by the existing budget tests.
- SDD-11: Add the CLI command `inventory` (`inventory --dir ROOT [--json] [--language TAG]`) through `validation-handlers.js` and `command-registry.js`, printing the report as JSON or the markdown presentation as text, and reject `--run` and `--all-active` for it through `validateReadSelection`; rationale: the request-activation catalog names command owners, and CLI and MCP must share selection rules; consequence: `control.inventory` has a real command owner and the fallback route works without MCP.
- SDD-12: Keep class labels, the basis note and the history line as German and English strings inside `run-inventory.js`, with English as fallback, and render the inventory with `renderRunInventory`, which reuses the existing `activeRunInventory` copy for count, empty, absent, incomplete and findings lines; rationale: the labels must travel with the pure module to the companion, as the backlog labels do in `backlog-vocabulary.js`; consequence: `agdf-interaction-locales.json` stays unchanged.
- SDD-13: Change the request-activation catalog and its "Active Run Inventory" section to route the listing to `control.inventory` (`agdf_inspect` operation `inventory`, fallback CLI `inventory --json`), update the router line in `agdf-agent-router.md` and the gate-check route boundary line, switch the de and en evaluation cases and `active-run-inventory-test.js`, and keep `doctor` all-active documented as health check; rationale: PRD AC-012 and the owner's routing decision; consequence: the contract text change chain applies: Copilot payload baseline, eval fingerprints and the compatibility record are refreshed.
- SDD-14: Document the inventory in the handbook chapters on several runs (`docs/handbook/de/04-mehrere-runs.md`, `docs/handbook/en/04-multiple-runs.md`) and in `docs/architecture/07-ui-konzept.md` section 9 as the provided inventory read scope with its planned consumers; rationale: these are the existing places for run lists and the hub's inventory gap; consequence: readers find the command, the fields, the stored-state basis and the follow-up runs.

## 4. Integration Points

- `discoverRuns` and `parseRunState`: unchanged; the reader consumes their results.
- Doctor all-active: `doctor.js:44-82` adds two fields in the existing report object.
- Control-inspect service and contract: new `inventory` case, operation list, shortened descriptions, help entry from `inspectContractHelp` follows automatically.
- MCP server: picks up the operation through the shared definition; `packages/mcp-server` tests run against `dist/npm/create-agdf` after `sync-package-assets`, `assemble-npm` and `npm --prefix packages/mcp-server ci`.
- CLI: new command entry, parse and selection rules, help text.
- Request activation: catalog JSON block, section text, router, gate-check skill line, evaluation cases.
- `decision-content-readiness.js`: re-export of the moved placeholder rule.

## 5. Constraints And Compatibility

- The pure module and its import chain contain no `node:` import; a static test enforces it.
- Existing doctor fields and values stay the same; the new fields are additive.
- `agdf_inspect` stays within 5000 bytes; older clients that never send `inventory` are unaffected.
- The changed route is a contract change for all four hosts; deterministic evaluations prove the route, no native observation is part of this slice (PRD non-goal).
- Windows, macOS and Linux: no path handling in the module; the reader uses existing path helpers.
- Contract text under `plugins/agdf/` refreshes the payload baseline, eval fingerprints and the compatibility record; native Claude CLI evidence tied to that text becomes stale.

## 6. Test And Evidence Strategy

Reusable coverage: `packages/core/test/control-state-test.js` and `run-lifecycle-guard-test.js` for discovery, lifecycle and selection; `packages/cli/scripts/control-inspect-test.js` and `active-run-inventory-test.js` for inspect and listing; `run-close-test.js` fixtures for ended runs; `packages/mcp-server/test/protocol.test.js` for definition budget and tool listing; the request-activation evaluation suite.

New proof by risk:

- Module rules (AC-001 to AC-008): a new `packages/core/test/run-inventory-test.js` with fixture texts for every lifecycle, closure, placeholder, attention rule and precedence, receipts and dates, invalid sources, input-order independence and both languages; a static import-graph check for `node:` imports.
- Doctor (AC-009): fixture repository with active, completed, ended and invalid runs; existing doctor assertions unchanged plus the new fields.
- Inspect and CLI (AC-010, AC-011): same fixture through MCP runtime and CLI command, identical output; budget and listing checks.
- Route (AC-012): updated evaluation cases and `active-run-inventory-test.js`.
- Real repository (AC-013): recorded run of the CLI command and the MCP operation with timing, plus `doctor --all-active --json` before and after.
- Documentation (AC-014): text diff; green payload, eval and compatibility checks.

Placement: all checks run in this run before QA with the existing `node --test` suites and CI test domains; no nightly result is relied on.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Module builds one entry per source with all fields and closure facts | `run-inventory.js` | SDD-01, SDD-06 | none — read-only |
| AC-002 | Objective title with placeholder fallback to the run-ID title | `run-inventory.js`, `decision-content-placeholder.js` | SDD-04, SDD-05 | Moved rule keeps its callers unchanged |
| AC-003 | Ordered attention rules over stored decision, Artefacts result, known and missing text | `run-inventory.js` | SDD-03 | Differs from the companion only for `revise` |
| AC-004 | Display-only receipt reader with day-precision approval fallback | `run-inventory.js` | SDD-06 | Validity comes from caller findings |
| AC-005 | Total order and counts independent of input order | `run-inventory.js` | SDD-07 | none |
| AC-006 | Invalid sources become entries with findings; state absent, incomplete or complete | `run-inventory.js`, `run-inventory-reader.js` | SDD-02 | Existing finding codes reused |
| AC-007 | Allowed imports only and plain-data input | `run-inventory.js` | SDD-01 | Static check guards later edits |
| AC-008 | Codes, de/en labels and basis note in the module | `run-inventory.js` | SDD-12 | Locale registry unchanged |
| AC-009 | Additive `inventory.runs` and `inventory.counts` in the doctor report | `doctor.js` | SDD-08 | Session check keeps parsing existing fields |
| AC-010 | Inspect operation and CLI command over the shared service | `control-inspect/service.js`, CLI handlers | SDD-09, SDD-11 | No run selection accepted |
| AC-011 | Operation listed within the 5000-byte definition | `control-inspect/contract.js` | SDD-10 | Two descriptions shortened |
| AC-012 | Catalog entry `control.inventory`, section, router, skill line and evaluation cases | `request-activation.md`, evaluation corpus | SDD-13 | Contract text change chain |
| AC-013 | Measured run on this repository through CLI and MCP | Reader and service on the live tree | SDD-02, SDD-08 | Timing depends on the machine |
| AC-014 | Handbook and architecture text plus refreshed payload and evidence records | Handbook, `07-ui-konzept.md`, payload records | SDD-14 | Native evidence becomes stale |

## 8. Risks And Open Questions

- The display-only receipt reader trusts decoded fields of receipts that `parseRunState` already accepted; a receipt rejected by the parser makes the entry invalid, so no wrong date is shown for an invalid run.
- The definition budget is left with only a few bytes; any later field needs factoring.
- Approvals evidence dates exist only in the newer evidence format; older rows yield unknown last activity, which is truthful.
- MCP read time for about 150 runs is dominated by `discoverRuns`; TP measures it against the 3 s target.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Module placement and input shape | before_sd | resolved | Pure `control-state/run-inventory.js` with plain `{ run_id, text, findings }` sources (SDD-01) | Arndt Gold, SD Owner |
| Validity of run states | before_sd | resolved | Taken from `discoverRuns` and `parseRunState` as findings; the module never validates receipts (SDD-02, SDD-06) | Arndt Gold, SD Owner |
| Operation name and schema | before_sd | resolved | Unbound inspect operation `inventory` and CLI command `inventory`; two descriptions shortened to stay within 5000 bytes (SDD-09, SDD-10, SDD-11) | Arndt Gold, SD Owner |
| Location of labels | before_sd | resolved | Inside the pure module, German and English (SDD-12) | Arndt Gold, SD Owner |
| Placeholder rule owner | before_sd | resolved | Moved to a pure module and re-exported (SDD-05) | Arndt Gold, SD Owner |
| Fixture set and timing method for AC-013 | later_tp | deferred | Execution detail of the measurement belongs to TP | TP author through gate-check |

## 9. Next Step

Review this SD and approve only with:

`Approval: SD`

The approval confirms the design and permits the TP step.

## AGDF Approval Summary (de; source=en)

- Ziel: Das freigegebene Run-Inventar als ein reines Core-Modul bauen, das `doctor --all-active` und eine neue Inspect-Operation gemeinsam nutzen, ohne zweiten Parser und ohne Gate-Prüfung pro Run.
- Umfang: Neues Modul `control-state/run-inventory.js` (nur `node:`-freie Importe, Eingabe als einfache Daten), ein dünner Leser auf Basis des vorhandenen `discoverRuns`, Erweiterung des doctor-Berichts um `inventory.runs` und `inventory.counts`, neue Operation `inventory` für `agdf_inspect` und als CLI-Befehl, Routenwechsel im Request-Activation-Vertrag mit Eval-Fällen, Handbuch- und Architekturtext.
- Entscheidungen: SDD-01 reines Modul mit Eingabe `{ run_id, text, findings }`; SDD-02 Gültigkeit kommt als Befund aus `discoverRuns`/`parseRunState`, keine doppelte Dateilesung; SDD-03 Klassenregeln wie in der PRD, gleiche Signale wie der Begleiter, nur `revise` als Klärung; SDD-04 Titel aus dem Ziel, Platzhalter fallen auf den Run-ID-Titel zurück; SDD-05 Platzhalterregel wandert in ein reines Modul und wird weiter exportiert; SDD-06 Aktivität und Abschlussgrund aus einem reinen Anzeige-Leser für `Run Operations` und `Approval Operations`, Freigabedatum als tagesgenauer Ersatz; SDD-07 feste Gesamtreihenfolge und Zählungen; SDD-08 doctor bekommt nur neue Felder, alles Bestehende bleibt; SDD-09 neue Operation `inventory` im gemeinsamen Inspect-Service; SDD-10 die Tool-Definition steht heute bei 4993 von 5000 Byte, daher werden zwei Beschreibungen gekürzt, deren Regel das Schema ohnehin erzwingt; SDD-11 CLI-Befehl `inventory`; SDD-12 Bezeichnungen Deutsch und Englisch im Modul, Locale-Datei unverändert; SDD-13 Route `control.inventory` mit Router, Skill-Zeile, Eval-Fällen und Nachweiskette; SDD-14 Handbuch Kapitel 4 und UI-Konzept Abschnitt 9.
- Risiken: Der Anzeige-Leser vertraut nur Belegen, die der Parser schon akzeptiert hat; das Definitionsbudget ist danach fast ausgeschöpft; ältere Freigabezeilen ohne Datum ergeben unbekannte Aktivität; die MCP-Lesezeit wird in TP gegen 3 s gemessen; die native Claude-CLI-Evidenz wird durch den Vertragstext veraltet.
- Nächster Schritt: Nach `Approval: SD` folgt der Aufgaben- und Testplan (TP); die Implementierung bleibt bis zur TP-Freigabe gesperrt.
