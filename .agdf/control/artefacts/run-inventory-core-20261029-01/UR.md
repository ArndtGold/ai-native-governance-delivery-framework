# UR: Shared Core Run Inventory from Stored Run State

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-29
Owner: Arndt Gold
Run: run-inventory-core-20261029-01
Language: en

## 1. Problem

AGDF has no shared answer to the question "which runs exist in this repository, where does each
stand and which need attention". Every reader builds its own list from different sources:

- `doctor --all-active` selects active runs through `resolveRuns` and runs a full doctor
  evaluation per run. On 2026-10-29 it took 11.7 s for the 57 active runs of this repository and
  returns neither a title, an attention class nor a last activity. Completed, superseded and
  abandoned runs do not appear at all.
- The intake candidate list (`buildRunCandidates` in `packages/core/lib/interaction-presentation.js`)
  takes titles from artefact headings, sorts by title and reports `updated_at` as last update.
- The AGDF companion sorts open runs by `updated_at`; the cockpit overview reads only the Master
  Backlog, whose status is stale for 44 of 53 rows.

`updated_at` is not a usable activity signal: 16 active runs carry the same migration stamp
2026-09-30T08:31 and 8 have none. Of the 57 active runs only 4 carry a receipt with `created_at`
in their run state, 23 have dated approval evidence only and 30 have neither. 16 active runs still
carry the template objective "Describe the trustworthy outcome.", which some readers show as title.
Agents have no cheap MCP path to a run list: `agdf_inspect` offers only the per-run doctor and
delivery-map evaluations for all active runs.

`docs/architecture/07-ui-konzept.md` (section 2 Hub, section 9 supplement 3) requires a hub that
finds all runs from the run store, prioritises "decision required", "clarification required" and
blocked runs before recently worked runs, and adds no second inventory or status service in the
frontend. The owner's agreed order is: run-close (done in run `run-lifecycle-close-20261028-01`),
then this shared inventory, then the companion's bundled copy and hub supplement 3, then the
backlog role "planning and archive".

## 2. Goal

One pure Core module derives a run inventory from the `RUN_STATE.md` files under
`.agdf/control/runs/`. Every run appears once with a readable title, its stored lifecycle
including `superseded` and `abandoned`, current gate, an attention class with its stored basis,
last activity with its source, and revision. `doctor --all-active` and `agdf_inspect` are its
first consumers, so humans on the CLI and agents on MCP read the same list. Later the companion
and the hub can use the same module instead of their own list rules.

## Affected Users

- The repository owner, in this repository Arndt Gold, who needs to see where a decision or a
  clarification is waiting and which runs were last worked on.
- Coding agents on Claude Code, Codex, Copilot and OpenCode that orient themselves through
  `agdf_inspect` or the CLI before choosing or proposing a run.
- Maintainers of the follow-up runs: the companion (slice 2) and hub supplement 3 (slice 3), which
  will consume this module.

## 3. Scope

1. A pure Core module without `node:` imports. It receives the text of each `RUN_STATE.md`, or a
   read function supplied by the caller (compare `packages/core/lib/control-read/`), and performs
   no file system, clock, network or process access of its own. The same input always yields the
   same inventory.
2. It uses the run state alone: Run Meta, Objective, the stored Current Control State ("What is
   missing?", "What is the next allowed action?"), Approvals, receipts and, for ended runs, the
   recorded closure. It reads no other artefact and performs no live gate evaluation per run.
3. Each inventory entry carries: run ID; title; lifecycle (`active`, `completed`, `superseded`,
   `abandoned`) and, for an ended run, outcome, reason and successor where recorded; current gate;
   stored decision; attention class; last activity with its source; revision number and
   revision ID; the stored next allowed action and what is missing; the run state path.
4. Title: the first meaningful line of the Objective. A template placeholder such as "Describe the
   trustworthy outcome." or an empty Objective falls back to a title derived from the run ID. The
   entry states which source the title came from.
5. Attention class, derived only from stored control state: "decision required" when the stored
   state names a pending exact human approval; "clarification required" when the stored state asks
   for a revision or an open question before work can continue; "blocked" when the stored decision
   or state is blocked, or the run state is invalid; "in progress" for remaining active work; no
   attention for completed and ended runs. Fields that allow no confident class yield an explicit
   "unclear" class instead of a guess. Each entry states that its class rests on the stored state at
   its revision and is not a live gate evaluation. The neutral wording is "decision required"; the
   inventory makes no claim about which person must decide.
6. Last activity: the newest `created_at` among the receipts recorded in the run state, such as
   Run Operations and Approval Operations. Without a receipt, the newest dated approval evidence is
   used and marked as day precision. Without either, last activity is unknown. `updated_at` is never
   used as activity.
7. Order: "decision required", then "clarification required", then "blocked", then the remaining
   active runs; within each group by last activity, newest first, unknown last, then by run ID.
   Completed and ended runs follow as history.
8. A missing, unreadable, unsealed or malformed run state does not abort the inventory. It appears
   as an entry with an invalid state and a finding, and the inventory states whether it is complete.
9. `doctor --all-active` uses the inventory: its report carries the inventory entries and counts per
   lifecycle and attention class, and its active-run selection agrees with the inventory. Its
   existing per-run evaluation, status and findings remain unchanged.
10. `agdf_inspect` lets an agent obtain the inventory without per-run gate evaluation, on the same
    data and in the same order as the CLI. The MCP tool contract stays within its existing budget.
11. CLI reference, handbook and the architecture documentation name the module as the shared run
    inventory and state which consumers use it and which follow-up consumers are planned.

## 4. Non-Goals

- Switching the companion to a bundled copy of the module (slice 2, follow-up run).
- Hub supplement 3 in the cockpit (slice 3, follow-up run) and any cockpit UI change.
- Changing the Master Backlog's role or contents, and repairing stale backlog rows.
- Live gate evaluation per run inside the inventory, or a new status policy that overrides gate
  evaluation; the inventory reports stored state.
- Any write to control state, including filling missing receipts, replacing placeholder
  objectives or closing runs.
- Attribution of a decision to a specific person ("my decision"), cross-repository inventories and
  search or filter UI.

## 5. Acceptance Signals

- Unit tests with fixture run states cover every lifecycle including `superseded` and `abandoned`,
  placeholder and empty objectives, missing `updated_at`, the shared migration stamp, receipts with
  and without `created_at`, dated approvals only, and invalid run states; each yields exactly the
  specified title, attention class, last activity and order.
- A static check proves the module has no `node:` import and no file system access of its own.
- On this repository the inventory lists every run directory once; the counts per lifecycle match
  the run states; no placeholder objective appears as a title; no run gets the migration stamp or
  any `updated_at` as last activity.
- `doctor --all-active --json` carries the inventory, while its existing fields, status and findings
  stay as before; existing doctor tests pass.
- Through `agdf_inspect` an agent receives the same inventory for this repository without per-run
  gate evaluation and clearly faster than `doctor --all-active` (target below 3 s for this
  repository); MCP tool budget, payload baseline and package checks pass.
- CLI and MCP return identical entries and order for the same repository state.

## 6. Existing Source Of Truth

- The `RUN_STATE.md` of each run under `.agdf/control/runs/`: canonical run state; parsed by
  `packages/core/lib/control-state/run-state-parser.js` and `run-state-document.js`, discovered by
  `run-state-reader.js` and selected by `run-state-resolver.js`.
- `packages/core/lib/control-state/run-operations.js` and `approval-operations.js`: receipts with
  `created_at`; `run-steps.js` and the run-close receipt `lifecycle_close.record` for ended runs.
- `packages/core/lib/control-read/`: read-view pattern that hands file access to a caller.
- `packages/core/lib/control-evaluation/doctor.js`: `doctor --all-active` report.
- `packages/core/lib/control-inspect/` (`contract.js`, `selection.js`, `service.js`): CLI and MCP
  read operations behind `agdf_inspect`.
- `packages/core/lib/interaction-presentation.js`: existing title rules (`resolveHumanRunTitle`,
  `normalizedRunTitle`) and the intake candidate list.
- `packages/core/lib/control-evaluation/backlog-vocabulary.js`: existing German/English status labels.
- `docs/architecture/07-ui-konzept.md`, sections 2, 8 and 9: hub requirements and the rule that a
  stored open state must not be presented as a current decision without evaluation.
- `plugins/agdf/meta/contracts/control-scaffold.md`: `RUN_STATE.md` as durable authority.

## 7. Risks And Unknowns

- "Clarification required" has few direct signals in the run state alone. PRD must fix the exact
  mapping from stored decision and missing text to each class, and SD must keep it testable; the
  "unclear" class prevents guessing.
- Stored state can lag behind a live evaluation. The inventory must label its basis so readers do
  not present it as a current decision; consumers that need certainty still call gate evaluation.
- Most legacy runs have no receipt, so their last activity is day precision or unknown. This is
  truthful but places many runs at the end of their group.
- Text added under `plugins/agdf/` pulls the Copilot payload baseline, eval fingerprints and the
  compatibility record; the MCP tool description has only about 100 bytes of headroom.
- MCP server tests run against `dist/npm/create-agdf` and need `sync-package-assets`,
  `assemble-npm` and `npm --prefix packages/mcp-server ci` after Core changes.
- Reading about 150 run states through the MCP read worker must stay inside its deadline.
- Brownfield Review must confirm reuse of the existing title rules and run discovery and decide
  whether the intake candidate list should consume the module now or later.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, Brownfield Review and the Mode/Slice decision follow. This does not authorize
implementation.

## AGDF Approval Summary (de; source=en)

- Problem: AGDF hat kein gemeinsames Run-Inventar. `doctor --all-active` bewertet jeden aktiven Run vollständig (11,7 s für 57 Runs), liefert weder Titel, Aufmerksamkeitsklasse noch letzte Aktivität und kennt keine abgeschlossenen oder beendeten Runs. Intake-Kandidaten, Begleiter und Cockpit nutzen eigene Regeln, `updated_at` oder das veraltete Backlog. 16 aktive Runs tragen denselben Migrations-Zeitstempel, 8 keinen; nur 4 haben einen Beleg mit `created_at`; 16 zeigen das Platzhalter-Ziel. Agenten fehlt ein schneller MCP-Zugang.
- Ziel: Ein reines Core-Modul leitet aus den `RUN_STATE.md`-Dateien ein Inventar ab: jeder Run einmal mit Titel, Lebenszyklus inklusive `superseded`/`abandoned`, Gate, Aufmerksamkeitsklasse mit gespeicherter Grundlage, letzter Aktivität mit Quelle und Revision. Erste Nutzer sind `doctor --all-active` und `agdf_inspect`.
- Betroffene: Repository-Owner, Agenten auf Claude Code, Codex, Copilot und OpenCode, die Folge-Runs für Begleiter und Hub.
- Umfang: Modul ohne `node:`-Importe, bekommt Dateitext oder eine Lesefunktion. Nur RUN_STATE, keine Live-Gate-Prüfung pro Run. Titel aus dem Ziel, Platzhalter fallen auf die Run-ID zurück. Klassen „Entscheidung erforderlich“, „Klärung erforderlich“, „blockiert“, „in Arbeit“, „unklar“, als gespeicherter Stand gekennzeichnet. Letzte Aktivität aus dem jüngsten Beleg-`created_at`, sonst datierte Freigabe (Tagesgenauigkeit), sonst unbekannt, nie `updated_at`. Feste Reihenfolge. Ungültige Run-Stände als Eintrag mit Befund. doctor-Bericht trägt das Inventar, `agdf_inspect` liefert es ohne Gate-Prüfung. Doku.
- Nicht-Ziele: Begleiter-Umstieg (Schnitt 2), Hub-Ergänzung 3 (Schnitt 3), Backlog-Rolle, Live-Bewertung im Inventar, Schreiben von Kontrollstand, Personenzuordnung, Suche oder UI.
- Abnahmesignale: Unit-Tests mit Fixtures für alle Lebenszyklen, Platzhalter, fehlende Zeitstempel, Belege und ungültige Stände; statischer Nachweis ohne `node:`-Import; auf diesem Repository jeder Run einmal, Zählungen stimmen, kein Platzhalter-Titel, nie `updated_at` als Aktivität; doctor-Felder unverändert; `agdf_inspect` liefert dasselbe Inventar unter 3 s; CLI und MCP identisch; Budget- und Paketprüfungen grün.
- Quellen: `RUN_STATE.md`, Run-State-Parser, Reader und Resolver, Run- und Approval-Operations, `control-read`, `doctor.js`, `control-inspect`, Titelregeln in `interaction-presentation.js`, `docs/architecture/07-ui-konzept.md` Abschnitte 2, 8 und 9.
- Risiken: Wenige direkte Signale für „Klärung erforderlich“ (Zuordnung legt die PRD fest); gespeicherter Stand kann hinter der Live-Bewertung liegen; viele Altläufe ohne Beleg; Textänderungen unter `plugins/agdf` ziehen Payload-Baseline, Eval-Fingerprints und Kompatibilitätsnachweis nach; MCP-Tool-Budget hat etwa 100 Byte Luft; MCP-Lesefrist für etwa 150 Run-Stände.
- Nächster Schritt: Nach `Approval: UR` folgen Brownfield Review und Mode/Slice-Entscheidung; keine Implementierungsfreigabe.
