# UR: Close Active Runs as Superseded or Abandoned

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-28
Owner: Arndt Gold
Run: run-lifecycle-close-20261028-01
Language: en

## 1. Problem

AGDF has no supported way to end an active run that will not be completed. The only lifecycle
transition the canonical writers support is `active` to `completed` through OR closeout
(`packages/core/lib/control-state/run-steps.js`). The run-state parser, the backlog summary shape
and the companion already know `superseded` and `abandoned`, and the Master Backlog lifecycle rules
require `superseded` when another scope replaces an item, but no command writes either value. A hand
edit breaks the run seal, and run recovery restores a run rather than ending it.

On 2026-10-28 this repository holds 56 active runs. 23 of them stand at UR because their earlier
approvals were deliberately reset for missing provenance, and the last change of every active run is
either older than seven days or came from a bulk commit. The active-run lists of the companion,
`doctor --all-active`, the cockpit and the planned hub are therefore dominated by runs nobody intends
to continue. When the owner decides that a run ends, that decision leaves no attributable record.

## 2. Goal

A human owner can end one or several active runs as `superseded`, naming a successor, or as
`abandoned`, giving a reason, through one reviewed decision. Each ended run keeps all of its
artefacts and history, carries the decision as a sealed and attributable receipt, disappears from the
active lists of every AGDF reader and stays readable as history with its outcome and reason. The
closure is final.

## Affected Users

- The repository owner or delivery lead who decides which runs end; in this repository Arndt Gold.
- Coding agents on Claude Code, Codex, Copilot and OpenCode that prepare a closure and must stop
  treating ended runs as continuable.
- Readers of active-run lists: the companion, `doctor --all-active`, the cockpit and planned hub,
  delivery-map and status presentation.
- Reviewers and auditors who need to trace why and by whom a run was ended.

## 3. Scope

1. A closure operation for active runs with two outcomes: `superseded` requires a successor reference
   and a reason; `abandoned` requires a reason.
2. Preview, then apply. The preview lists every selected run with its current gate, open approvals,
   registered artefacts and the intended outcome, successor and reason. One explicit human
   confirmation of that exact preview applies the whole list. A list of one run is the single-run
   case.
3. Each ended run receives its own receipt with creation time, operation identity, outcome, reason,
   successor where applicable, the confirming person and the digest of the confirmed preview.
4. The change is written through the canonical run writer, so lock, seal, revision and `updated_at`
   stay valid. Registered artefacts and existing receipts remain unchanged.
5. An ended run accepts no further gate step, approval, revision, recovery or delivery continuation;
   each such attempt is rejected with a reason that names the closure.
6. A run that changed after its preview, a completed run and an already ended run are not closed, and
   the result states this per run.
7. The run's Active Backlog row, where one exists, moves to Completed / Superseded Pointers with the
   final status and the successor or reason, following the backlog lifecycle rules. A backlog that
   cannot be updated does not block the closure, as for approvals today.
8. `doctor --all-active`, the companion's open-run list, delivery-map, the cockpit and status
   presentation no longer show ended runs as active and show them as history with outcome and reason.
9. The operation is reachable through the CLI and through MCP. Agents may prepare the preview on
   either path; applying it always requires the deliberate human confirmation of that preview.
10. Contract, CLI and handbook text describes the two outcomes, the preview and confirmation and the
    finality of a closure.

## 4. Non-Goals

- Reopening an ended run. Continuing the work requires a new run, which may reference the ended one.
- Automatic closure, and automatic candidate selection by age, gate or inactivity. Agents may only
  propose candidates; existing read-only listings such as `doctor --all-active` remain the way to
  find them.
- Deleting runs or artefacts, or editing approved artefacts.
- Retroactively recording the reset approvals of the 23 legacy runs.
- Any change to the existing OR closeout path to `completed`.
- The shared run inventory, hub supplement 3 and the change of the backlog's role; these are
  follow-up runs.
- Deciding which of the current active runs to end; that is an owner decision after delivery.

## 5. Acceptance Signals

- One preview listing several active runs, each with its outcome and reason or successor, plus one
  explicit human confirmation, ends every listed run; each run carries its own sealed receipt naming
  the confirming person, time, outcome, reason and successor.
- A `superseded` closure without a successor, and any closure without a reason, is rejected before
  anything is written.
- A run changed after the preview, a completed run and an already ended run are not ended, and the
  result names each one with its reason.
- After closure the run's seal is valid, its registered artefacts are byte-identical, and gate steps,
  approvals, revisions, recovery and continuations on it are rejected with a reason naming the
  closure.
- `doctor --all-active`, the companion and the cockpit no longer list the run as active, and its
  history shows outcome and reason.
- The run's Active Backlog row has moved to Completed / Superseded Pointers with the final status.
- The same flow works through the CLI and through MCP, and on both paths the apply happens only after
  the human confirmation of the exact preview.

## 6. Existing Source Of Truth

- `packages/core/lib/control-state/run-state-parser.js`: lifecycle values `active`, `completed`,
  `superseded`, `abandoned`.
- `packages/core/lib/control-state/run-steps.js`: the only writer transition, `active` to `completed`
  through OR closeout.
- `packages/core/lib/control-state/run-state-writer.js`: locked, sealed, atomic run writes with the
  `updated_at` stamp.
- `packages/core/lib/control-state/approval-operations.js` and `run-operations.js`: append-only
  receipts with `created_at`.
- `packages/core/lib/control-state/run-recovery.js`: owner preview and apply bound to a preview
  digest.
- `packages/core/lib/control-state/run-backlog.js`, `run-backlog-writer.js` and
  `backlog-summary-shape.js`: backlog projection, which already accepts `superseded` and `abandoned`.
- `.agdf/control/MASTER_BACKLOG.md`, section Lifecycle Rules.
- `plugins/agdf/meta/contracts/control-scaffold.md`, `gate-transition.md` and `interaction.md`:
  `RUN_STATE.md` and the artefact chain as durable authority.
- `docs/architecture/07-ui-konzept.md`, section 2: the hub separates active, completed and superseded
  or abandoned runs by their stored lifecycle.
- `plugins/agdf/host-templates/claude/companion/assignment.mjs`: open runs are runs with lifecycle
  `active`.

## 7. Risks And Unknowns

- Whether one confirmation applies all listed runs together or each run separately with a clear
  per-run result, given that runs are separate sealed files and share the backlog file and its lock.
- How the human confirmation is bound and recorded on the MCP path so that an agent cannot confirm its
  own preview; reuse of the existing approval and presentation binding is the expected direction.
- The form of a successor reference: an existing run id only, or also another named scope or
  artefact, and how its existence is checked.
- Runs that are stuck in a dead end at a gate must be closable; whether runs with an invalid seal or a
  pending run-step journal may be closed, and how, is open. All active runs currently have a valid
  seal.
- Readers that treat every non-active lifecycle as completed may label ended runs wrongly; Brownfield
  Review must list the readers that need a change.
- Contract text under `plugins/agdf` triggers the known change chain: Copilot payload baseline, eval
  fingerprints and compatibility records.
- Closing many runs at once writes the shared backlog file under its lock.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

Afterwards Brownfield Review sets the Mode/Slice decision.

## AGDF Approval Summary (de; source=en)

- Problem: AGDF kann einen aktiven Run, der nicht abgeschlossen wird, nicht ordentlich beenden. Der einzige Übergang der Writer ist `active` zu `completed` über den OR-Abschluss. Parser, Backlog-Zusammenfassung und Begleiter kennen `superseded` und `abandoned`, und die Lifecycle-Regeln des Backlogs verlangen `superseded`, aber kein Befehl schreibt diese Werte. Handänderungen brechen das Seal. Am 2026-10-28 sind 56 Runs aktiv, 23 davon stehen nach bewusst zurückgesetzten Freigaben auf UR, und keiner wurde in den letzten sieben Tagen wirklich bearbeitet. Die Listen offener Runs in Begleiter, Doctor, Cockpit und geplantem Hub sind dadurch voller Runs, die niemand fortsetzen will, und die Entscheidung, einen Run zu beenden, hinterlässt keinen Beleg.
- Ziel: Du kannst einen oder mehrere aktive Runs mit einer geprüften Entscheidung als `superseded` mit Nachfolger oder als `abandoned` mit Grund beenden. Jeder beendete Run behält alle Artefakte und seine Geschichte, trägt die Entscheidung als versiegelten, zuordenbaren Beleg, verschwindet aus allen Listen aktiver Runs und bleibt als Historie mit Ergebnis und Grund lesbar. Der Abschluss ist endgültig.
- Betroffene: du als Owner, der entscheidet, welche Runs enden; Coding-Agenten auf Claude Code, Codex, Copilot und OpenCode, die den Abschluss vorbereiten und beendete Runs nicht mehr fortsetzen dürfen; alle Leser von Run-Listen (Begleiter, `doctor --all-active`, Cockpit und Hub, Delivery-Map, Statuskarte); Prüfer, die nachvollziehen müssen, warum und durch wen ein Run endete.
- Umfang: (1) Abschluss aktiver Runs mit zwei Ergebnissen: `superseded` mit Nachfolger und Grund, `abandoned` mit Grund. (2) Erst Vorschau, dann Anwenden: Die Vorschau listet jeden gewählten Run mit Gate, offenen Freigaben, Artefakten, Ergebnis und Grund; eine ausdrückliche Bestätigung genau dieser Vorschau wendet die ganze Liste an. (3) Jeder Run erhält einen eigenen Beleg mit Zeitpunkt, Vorgang, Ergebnis, Grund, Nachfolger, bestätigender Person und Vorschau-Digest. (4) Schreiben über den kanonischen Run-Writer, Artefakte und bestehende Belege bleiben unverändert. (5) Beendete Runs lehnen weitere Gate-Schritte, Freigaben, Revisionen, Recovery und Fortsetzung mit Hinweis auf den Abschluss ab. (6) Geänderte, abgeschlossene oder schon beendete Runs werden nicht beendet, das Ergebnis nennt das je Run. (7) Die Backlog-Zeile wandert nach Completed / Superseded Pointers; ein nicht aktualisierbares Backlog blockiert den Abschluss nicht. (8) Doctor, Begleiter, Delivery-Map, Cockpit und Statuskarte zeigen beendete Runs als Historie. (9) Zugang über CLI und MCP, die Bestätigung bleibt immer deine. (10) Vertrags-, CLI- und Handbuchtext.
- Nicht enthalten: kein Wiederöffnen, weitergehende Arbeit braucht einen neuen Run mit Verweis; kein automatischer Abschluss und keine automatische Kandidatenauswahl, Agenten dürfen nur vorschlagen; kein Löschen von Runs oder Artefakten und keine Änderung freigegebener Artefakte; kein nachträgliches Belegen der zurückgesetzten Freigaben; keine Änderung am OR-Abschluss; kein gemeinsames Run-Inventar, keine Hub-Ergänzung 3 und keine neue Rolle des Backlogs, das sind Folge-Runs; keine Entscheidung, welche der heutigen Runs enden.
- Abnahmesignale: Eine Vorschau mit mehreren Runs und eine Bestätigung beenden alle gelisteten Runs, jeder mit eigenem versiegeltem Beleg; `superseded` ohne Nachfolger und jeder Abschluss ohne Grund werden vor jedem Schreiben abgelehnt; geänderte, abgeschlossene und schon beendete Runs werden mit Grund benannt und nicht beendet; nach dem Abschluss ist das Seal gültig, die Artefakte sind bytegleich, und weitere Schritte am Run werden mit Hinweis auf den Abschluss abgelehnt; Doctor, Begleiter und Cockpit zeigen den Run nicht mehr als aktiv, sondern als Historie mit Ergebnis und Grund; die Backlog-Zeile steht unter Completed / Superseded Pointers; der Ablauf funktioniert über CLI und MCP, jeweils erst nach deiner Bestätigung der genauen Vorschau.
- Quellen: `run-state-parser.js` (Lifecycle-Werte), `run-steps.js` (einziger Übergang nach `completed`), `run-state-writer.js` (gesperrtes, versiegeltes Schreiben), `approval-operations.js` und `run-operations.js` (Belege mit `created_at`), `run-recovery.js` (Vorschau und Anwenden mit Digest), `run-backlog.js`, `run-backlog-writer.js` und `backlog-summary-shape.js`, die Lifecycle-Regeln in `MASTER_BACKLOG.md`, die Verträge `control-scaffold.md`, `gate-transition.md` und `interaction.md`, `07-ui-konzept.md` Abschnitt 2 und `assignment.mjs` des Begleiters.
- Risiken und offene Punkte: ob eine Bestätigung alle Runs gemeinsam oder jeden einzeln mit klarem Ergebnis anwendet, da Runs getrennte versiegelte Dateien sind und sich Backlog und Sperre teilen; wie die menschliche Bestätigung über MCP gebunden wird, damit ein Agent seine eigene Vorschau nicht bestätigen kann; die Form des Nachfolger-Verweises und seine Prüfung; Runs in einer Sackgasse müssen beendbar sein, offen ist der Umgang mit ungültigem Seal oder hängendem Schritt-Journal; Leser, die jeden nicht aktiven Run als abgeschlossen deuten; die bekannte Änderungskette bei Vertragstext unter `plugins/agdf`; viele Abschlüsse auf einmal schreiben das gemeinsame Backlog unter seiner Sperre.
- Nächster Schritt: UR prüfen und nur mit `Approval: UR` freigeben; danach legt die Brownfield Review die Mode/Slice-Entscheidung fest.
