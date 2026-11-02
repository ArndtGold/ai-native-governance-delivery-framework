# PRD: Shared Core Run Inventory from Stored Run State

Status: draft
Gate: PRD
Gate approval: open
Based on: UR (`.agdf/control/artefacts/run-inventory-core-20261029-01/UR.md`, approved revision 3)
Date: 2026-10-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one shared run inventory for a repository, derived only from the stored `RUN_STATE.md` of
every run under `.agdf/control/runs/`. Each run appears once with:

- run ID and a readable title with its source;
- stored lifecycle (`active`, `completed`, `superseded`, `abandoned`) and, for an ended run, its
  outcome, reason and successor where the closure recorded them;
- current gate and stored decision;
- an attention class with the note that it rests on the stored state at the given revision;
- last activity with its source and precision;
- revision number and revision ID, the stored "What is missing?" and next allowed action, and the
  run state path.

The inventory is computed by one pure Core module that receives run state texts or a caller's read
function and has no `node:` import, so a later bundled copy can serve the companion. It reads no
other artefact and evaluates no gate live.

Two consumers use it in this slice:

1. `doctor --all-active --json` carries the inventory of all runs, active first and history after,
   with counts per lifecycle and attention class. Its existing fields keep their meaning.
2. A new read-only inventory operation of `agdf_inspect`, also available on the CLI, returns the same
   inventory without per-run gate evaluation. The request-activation route for "show the active AGDF
   runs" moves from `doctor` with `all_active: true` to this operation.

CLI reference, handbook, routing contract and architecture documentation describe the inventory and
its planned consumers.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: not_applicable — Brownfield Review (`.agdf/control/artefacts/run-inventory-core-20261029-01/BROWNFIELD_REVIEW.md`) found low impact without ambiguous UX semantics.
- primary_user_intent: As the owner, and as an agent working for the owner, I want one trustworthy list of all runs in this repository that shows first where a decision or a clarification is waiting, then what is blocked, then what was worked on last, so that I can resume the right run without opening every run state.
- success_signal: Asked to show the active runs, an agent answers within a few seconds with every active run once, its readable title, gate and attention class marked as stored state, in the defined order; `doctor --all-active --json` lists the same runs in the same order.
- primary_decision_or_action: Read the inventory and choose a run to continue; the inventory itself takes no decision.

No preview was required by the UR.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Inventory read (agent, MCP) | Unchanged; nothing is written | Ordered entries with attention class, last activity and completeness; invalid entries with findings | Each run's stored `RUN_STATE.md` | Agent's rendering of the `agdf_inspect` inventory result |
| Inventory read (CLI) | Unchanged | The same entries as JSON | Each run's stored `RUN_STATE.md` | CLI JSON output |
| Doctor all-active | Unchanged | Existing per-run doctor reports plus the inventory and its counts | Live doctor evaluation for the per-run reports; stored run state for the inventory | `doctor --all-active --json` |
| History | Unchanged | Completed, superseded and abandoned runs after the active ones, without attention, ended runs with outcome, reason and successor | Stored lifecycle and closure receipt | Same outputs as above |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The inventory is computed only on an explicit read: `doctor --all-active`, the inventory operation on CLI or MCP, or an agent request routed to it. It never runs on its own and never writes.
- blockers_and_visible_next_actions: No `.agdf/control/runs/` folder (inventory state `absent`, no entries); an unreadable, oversized or malformed run state (entry marked invalid with a finding, inventory state `incomplete`; next action: inspect that run with `doctor --run <run_id>`); a missing target selection on MCP (the existing target recovery of `agdf_inspect`).
- recovery_paths: Inventory results are recomputed on every read; repairing a run state and reading again shows the corrected entry. The live state of one run remains available through `gate-check` for that run.
- relevant_state_transitions: none; the inventory reflects stored state and changes no run.

## 5. Acceptance Criteria

### Inventory content

- criterion_id: AC-001
- working_mode: Inventory read
- source_state: Fixture run states covering every lifecycle, including a run closed as `superseded` with a successor and one closed as `abandoned` with a reason.
- action: Compute the inventory.
- expected_effective_state: Unchanged.
- visible_feedback: Every run appears once with run ID, title and title source, lifecycle, current gate, stored decision, attention class, last activity with source and precision, revision and revision ID, stored "What is missing?", stored next allowed action and run state path; the ended runs also show outcome, reason and successor.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: Each entry equals the expected fixture result field by field.
- required_evidence: Automated Core tests with fixtures.

- criterion_id: AC-002
- working_mode: Inventory read
- source_state: Runs whose Objective is a sentence, the template text "Describe the trustworthy outcome.", another template prompt, or empty.
- action: Compute the inventory.
- expected_effective_state: Unchanged.
- visible_feedback: The first case shows the first meaningful Objective line as title with source `objective`; the others show a title derived from the run ID with source `run_id`.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: No template text appears as a title.
- required_evidence: Automated Core tests.

- criterion_id: AC-003
- working_mode: Inventory read
- source_state: Active fixture runs with stored decisions and results covering every rule below, plus completed and ended runs.
- action: Compute the inventory.
- expected_effective_state: Unchanged.
- visible_feedback: The first matching rule sets the class: (1) completed, superseded or abandoned: no attention (history); (2) invalid run state: `blocked` with its finding; (3) stored decision `block` or `blocked`, or the current gate's recorded result `block` or `blocked`: `blocked`; (4) stored decision `revise` or `decline`, the current gate's recorded result `revise`, or a recorded `reject` or `request_change` on the current gate's presented material: `clarification_required`; (5) "What is missing?" names an exact `Approval: <gate>`, or the stored decision is `pending` or `awaiting_uat`: `decision_required`; (6) stored decision `in_progress`, `pass`, `qa_approved` or `completed`: `in_progress`; (7) otherwise `unclear`. Backticks around stored values are ignored.
- blocker_failure_behavior: A run matching no rule is `unclear`, never guessed.
- recovery_next_action: none
- observable_success: Each fixture gets exactly its expected class.
- required_evidence: Automated Core tests, one per rule and one for precedence.

- criterion_id: AC-004
- working_mode: Inventory read
- source_state: Runs with run or approval receipts carrying `created_at`, runs with dated approval evidence only, runs with neither, runs with the shared migration `updated_at`, and runs without `updated_at`.
- action: Compute the inventory.
- expected_effective_state: Unchanged.
- visible_feedback: Last activity is the newest receipt `created_at` (source `receipt`, precision time); else the newest approval evidence date (source `approval`, precision day); else unknown (source `none`). `updated_at` never appears as last activity.
- blocker_failure_behavior: An unparsable receipt or date is ignored for last activity and does not invalidate the entry.
- recovery_next_action: none
- observable_success: Every fixture shows the expected value, source and precision.
- required_evidence: Automated Core tests.

- criterion_id: AC-005
- working_mode: Inventory read
- source_state: A mixed fixture set.
- action: Compute the inventory twice, with the run states supplied in different orders.
- expected_effective_state: Unchanged.
- visible_feedback: Active runs come first, grouped `decision_required`, `clarification_required`, `blocked`, `in_progress`, `unclear`; within a group by last activity, newest first, day-precision dates counting as the start of that day, unknown last, then by run ID. History follows: completed, then superseded, then abandoned, each by last activity and run ID.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: Both computations return the identical ordered list.
- required_evidence: Automated Core tests.

- criterion_id: AC-006
- working_mode: Inventory read
- source_state: A run folder without `RUN_STATE.md`, an unreadable file, an oversized file and a file with a malformed Run Meta, beside valid runs; separately a repository without `.agdf/control/runs/`.
- action: Compute the inventory.
- expected_effective_state: Unchanged.
- visible_feedback: Each faulty run appears as one invalid entry with run ID, class `blocked` and a finding naming the problem and `doctor --run <run_id>` as next step; the inventory state is `incomplete` and the counts include the invalid entries; without a runs folder the state is `absent` with no entries; otherwise `complete`.
- blocker_failure_behavior: A faulty run never aborts the inventory.
- recovery_next_action: Inspect the named run with `doctor --run <run_id>`.
- observable_success: Valid entries are unaffected and every faulty run is named.
- required_evidence: Automated Core tests.

- criterion_id: AC-007
- working_mode: not_applicable (module property)
- source_state: The inventory module and every module it imports.
- action: Inspect the imports and run the module with injected inputs only.
- expected_effective_state: Unchanged.
- visible_feedback: No `node:` import in the module or its import chain; no file system, clock, network or process access; the same input yields the same output.
- blocker_failure_behavior: A new `node:` import fails the check.
- recovery_next_action: none
- observable_success: The static check passes and repeated runs give equal results.
- required_evidence: Automated static import check and determinism test.

- criterion_id: AC-008
- working_mode: Inventory read
- source_state: Any inventory.
- action: Read it with presentation language `de` and `en`.
- expected_effective_state: Unchanged.
- visible_feedback: Each entry carries a stable class code and a localized label (de: „Entscheidung erforderlich“, „Klärung erforderlich“, „blockiert“, „in Arbeit“, „unklar“; en: "Decision required", "Clarification required", "Blocked", "In progress", "Unclear") and the basis "stored state at revision N, not a live evaluation". No label names a person.
- blocker_failure_behavior: An unsupported language falls back to English.
- recovery_next_action: none
- observable_success: Codes, labels and basis appear in both languages.
- required_evidence: Automated Core and MCP tests.

### Consumers

- criterion_id: AC-009
- working_mode: Doctor all-active
- source_state: A repository fixture with active, completed and ended runs and one invalid run.
- action: Run `doctor --all-active --json`.
- expected_effective_state: Unchanged.
- visible_feedback: The report carries the inventory of all runs in the order of AC-005, its state and counts per lifecycle and attention class; `status`, `findings`, `summary`, `runs`, `inventory.state` and `inventory.active_count` keep their current meaning and values; the active run IDs of the inventory equal those of `runs`.
- blocker_failure_behavior: An inventory problem never changes the existing doctor status.
- recovery_next_action: none
- observable_success: Existing doctor tests pass unchanged and the new fields match the fixture.
- required_evidence: Automated CLI and Core tests.

- criterion_id: AC-010
- working_mode: Inventory read (agent, MCP) and (CLI)
- source_state: The same repository fixture.
- action: Call the new inventory operation through `agdf_inspect` and through the CLI.
- expected_effective_state: Unchanged; no per-run gate evaluation runs.
- visible_feedback: Both return the same entries, order, state and counts as the doctor inventory, in the requested presentation language.
- blocker_failure_behavior: Without a resolved target the existing `agdf_inspect` target recovery applies.
- recovery_next_action: Pass `target_source` and `primary_target` as for other inspect operations.
- observable_success: CLI, MCP and doctor inventories are identical for the same state.
- required_evidence: Automated MCP protocol and CLI tests.

- criterion_id: AC-011
- working_mode: Inventory read (agent, MCP)
- source_state: The `agdf_inspect` tool definition.
- action: List the MCP tools and check budgets and payloads.
- expected_effective_state: Unchanged.
- visible_feedback: The new operation is listed; the tool definition stays within its 5000-byte discovery budget; package, payload baseline and compatibility checks pass.
- blocker_failure_behavior: An exceeded budget fails the build.
- recovery_next_action: Shorten the definition text.
- observable_success: Budget and package checks are green.
- required_evidence: Existing budget, payload and package checks.

- criterion_id: AC-012
- working_mode: Inventory read (agent, MCP)
- source_state: The request-activation contract and its evaluation corpus.
- action: Route the requests "Zeige die aktiven AGDF-Runs in diesem Projekt" and "Show the active AGDF runs in this project".
- expected_effective_state: Unchanged.
- visible_feedback: Both route to the inventory operation with `target_source: current_repository`; `doctor` with `all_active: true` remains available as a health check.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: The request-activation evaluations and the active-run test pass with the new route.
- required_evidence: Updated deterministic request-activation evaluations and `active-run-inventory-test.js`.

### Real repository and documentation

- criterion_id: AC-013
- working_mode: Inventory read
- source_state: This repository on the day of delivery.
- action: Call the inventory operation through MCP and run `doctor --all-active --json`.
- expected_effective_state: Unchanged.
- visible_feedback: Every run folder appears once; counts per lifecycle match the run states; no template text appears as a title; no last activity equals an `updated_at`; the MCP inventory returns in under 3 s; the inventory adds at most 1 s to `doctor --all-active`.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: A recorded measurement and comparison show all of the above.
- required_evidence: Recorded command output and timing in the CD+Tests evidence.

- criterion_id: AC-014
- working_mode: not_applicable (documentation)
- source_state: CLI reference, handbook, request-activation contract and architecture documentation.
- action: Read the updated texts.
- expected_effective_state: Unchanged.
- visible_feedback: They describe the inventory, its fields and classes, the stored-state basis, the new operation, the changed route and the planned consumers (companion, hub, intake list).
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: Texts are present; payload baseline, eval fingerprints and compatibility records are refreshed and green.
- required_evidence: Documentation diff plus green payload, eval and compatibility checks.

## 6. Non-Goals

- Switching the companion to a bundled copy of the module (slice 2).
- Hub supplement 3 and any cockpit change (slice 3).
- Switching the intake candidate list (`buildRunCandidates`) to the inventory titles and order; this is named follow-up work.
- Changing the Master Backlog's role or contents.
- Live gate evaluation inside the inventory, or a status policy that overrides gate evaluation.
- Any write to control state: no receipts filled in, no objectives replaced, no runs closed.
- Attributing a decision to a person, cross-repository inventories, search or filter options.
- A native host observation of the changed route; deterministic evaluations and protocol tests cover it in this slice.

## 7. Users And Roles

- Owner (Arndt Gold in this repository): reads the inventory to decide where to continue.
- Coding agents on Claude Code, Codex, Copilot and OpenCode: read the inventory through `agdf_inspect` to orient and to answer "show the runs".
- Maintainers of the follow-up runs: consume the module for the companion, the hub and the intake list.

## 8. Constraints

- Read-only; the canonical run state stays the only source of truth.
- The module has no `node:` import in its import chain.
- The `agdf_inspect` definition stays within 5000 bytes; text added under `plugins/agdf/` refreshes the Copilot payload baseline, eval fingerprints and compatibility records.
- Existing `doctor --all-active` fields and the SessionStart session check keep working.
- Must work on Windows, macOS and Linux and on the four MCP hosts.

## 9. Evidence Requirements

- Automated Core tests for AC-001 to AC-008.
- Automated CLI and MCP protocol tests for AC-009, AC-010 and AC-012; existing budget, payload and package checks for AC-011.
- Recorded measurement on this repository for AC-013.
- Documentation diff and green payload, eval and compatibility checks for AC-014.

## 10. Risks And Open Questions

- Stored state can lag behind a live evaluation; the basis note and the unchanged `gate-check` path keep this visible.
- Most legacy runs have no receipt, so their last activity is day precision or unknown and sorts late.
- The route change touches the request-activation contract and its evaluation corpus; the contract text change chain applies.
- Reading about 150 run states through the MCP read worker must stay within its deadline; SD and TP verify it.
- Module placement, input shape, how node-side validity findings reach the inventory and the operation name belong to SD.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Meaning of stored `revise` | before_prd | resolved | `revise`, `decline` and a change request on presented material mean "clarification required"; only `block`/`blocked` and invalid run states mean "blocked" (owner answer of 2026-10-29) | Arndt Gold, PRD Owner |
| Route for "show the active runs" | before_prd | resolved | Moves to the new inventory operation; `doctor` all-active stays as health check (owner answer of 2026-10-29) | Arndt Gold, PRD Owner |
| Scope of the doctor inventory | before_prd | resolved | All runs with history, active first, with counts (owner answer of 2026-10-29) | Arndt Gold, PRD Owner |
| Intake candidate list | before_prd | resolved | Not in this slice; named follow-up work (owner answer of 2026-10-29) | Arndt Gold, PRD Owner |
| Last activity source | before_prd | resolved | Newest receipt `created_at`, else approval date at day precision, else unknown; never `updated_at` (approved UR) | Arndt Gold, PRD Owner |
| Attention basis | before_prd | resolved | Classes rest on stored state and say so; neutral wording without a person (approved UR) | Arndt Gold, PRD Owner |
| Module placement and input shape | later_sd | open | Texts or read function; how validity findings from the full parser are passed in | SD author through gate-check |
| Operation name and MCP schema | later_sd | open | Name and fields of the inventory operation within the definition budget | SD author through gate-check |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

The approval confirms the specified behavior, scope and criteria and permits the SD step.

## AGDF Approval Summary (de; source=en)

- Ziel: Eine verlässliche Liste aller Runs dieses Repositorys, die zuerst zeigt, wo eine Entscheidung oder Klärung wartet, dann was blockiert ist und dann was zuletzt bearbeitet wurde, damit du und Agenten den richtigen Run wieder aufnehmen, ohne jeden Run-Stand zu öffnen.
- Umfang: Ein reines Core-Modul ohne `node:`-Importe leitet das Inventar nur aus den gespeicherten `RUN_STATE.md` ab, ohne Live-Gate-Prüfung. Jeder Run einmal mit Titel und Titelquelle, Lebenszyklus (bei beendeten Runs mit Ergebnis, Grund und Nachfolger), Gate, gespeicherter Entscheidung, Aufmerksamkeitsklasse mit Hinweis auf den gespeicherten Stand, letzter Aktivität mit Quelle und Genauigkeit, Revision, „Was fehlt?“, nächster Aktion und Pfad. `doctor --all-active --json` trägt das Inventar aller Runs mit Zählungen; eine neue lesende Inventar-Operation von `agdf_inspect`, auch per CLI, liefert dasselbe ohne Gate-Prüfung; die Route für „Zeige die aktiven AGDF-Runs“ wechselt dorthin. Doku, Routing-Vertrag und Payload-Nachweise werden nachgezogen.
- AC-001: Jeder Run erscheint genau einmal mit allen Feldern; beendete Runs zusätzlich mit Ergebnis, Grund und Nachfolger.
- AC-002: Titel ist die erste sinnvolle Zeile des Ziels; Platzhalter wie „Describe the trustworthy outcome.“ oder leeres Ziel ergeben einen Titel aus der Run-ID, die Titelquelle steht dabei.
- AC-003: Klassen nach fester Regelfolge: Historie ohne Aufmerksamkeit; ungültiger Stand und `block`/`blocked` ergeben „blockiert“; `revise`, `decline`, Ablehnung oder Änderungswunsch ergeben „Klärung erforderlich“; ausstehende `Approval: <Gate>`, `pending` oder `awaiting_uat` ergeben „Entscheidung erforderlich“; `in_progress`, `pass`, `qa_approved`, `completed` ergeben „in Arbeit“; sonst „unklar“, nie geraten.
- AC-004: Letzte Aktivität ist das jüngste Beleg-`created_at`, sonst das jüngste Freigabedatum (tagesgenau), sonst unbekannt; `updated_at` nie.
- AC-005: Reihenfolge: aktive Runs nach Klasse (Entscheidung, Klärung, blockiert, in Arbeit, unklar), darin neueste Aktivität zuerst, unbekannt zuletzt, dann Run-ID; danach Historie (abgeschlossen, abgelöst, abgebrochen); unabhängig von der Eingabereihenfolge.
- AC-006: Fehlender, unlesbarer, zu großer oder fehlerhafter Run-Stand bricht nichts ab: ungültiger Eintrag mit Befund und Hinweis auf `doctor --run <run_id>`, Inventar „incomplete“; ohne Runs-Ordner „absent“.
- AC-007: Kein `node:`-Import im Modul und seiner Importkette, kein Datei-, Uhr-, Netz- oder Prozesszugriff, gleiche Eingabe ergibt gleiche Ausgabe.
- AC-008: Jeder Eintrag hat einen stabilen Klassencode, deutsche und englische Bezeichnung und den Hinweis „gespeicherter Stand der Revision N, keine Live-Bewertung“; keine Personenzuordnung.
- AC-009: `doctor --all-active --json` trägt das Inventar aller Runs mit Zählungen; bestehende Felder und der doctor-Status bleiben unverändert; aktive Run-IDs stimmen überein.
- AC-010: Die neue Inventar-Operation liefert über MCP und CLI dieselben Einträge, Reihenfolge und Zählungen wie doctor, ohne Gate-Prüfung pro Run.
- AC-011: Die Operation ist gelistet, die Tool-Definition bleibt unter 5000 Byte, Paket-, Payload- und Kompatibilitätsprüfungen sind grün.
- AC-012: „Zeige die aktiven AGDF-Runs in diesem Projekt“ und die englische Fassung führen zur Inventar-Operation; doctor all-active bleibt als Gesundheitsprüfung; Evaluationen und Test grün.
- AC-013: Auf diesem Repository: jeder Run-Ordner einmal, Zählungen stimmen, kein Platzhalter-Titel, keine Aktivität aus `updated_at`, MCP-Inventar unter 3 s, doctor höchstens 1 s langsamer; Messung dokumentiert.
- AC-014: CLI-Referenz, Handbuch, Routing-Vertrag und Architektur-Doku beschreiben Inventar, Klassen, Grundlage, Operation, Route und geplante Nutzer; Payload-, Eval- und Kompatibilitätsnachweise erneuert.
- Entscheidungen: Mit dir am 2026-10-29 festgelegt: `revise`, `decline` und Änderungswunsch gelten als „Klärung erforderlich“, nur `block`/`blocked` und ungültige Stände als „blockiert“; die Route für aktive Runs wechselt auf die neue Inventar-Operation; doctor zeigt alle Runs mit Historie; die Intake-Kandidatenliste stellt ein späterer Run um. Aus der UR: Aktivität nie aus `updated_at`, Klassen als gespeicherter Stand gekennzeichnet. Keine native Host-Beobachtung der neuen Route in diesem Schnitt. Offen für das SD: Ablage und Eingabeform des Moduls, Übergabe der Gültigkeitsbefunde, Name und Schema der Operation.
