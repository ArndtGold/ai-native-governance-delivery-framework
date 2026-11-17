# UR: Companion shows planned URs instead of an empty state

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-16
Owner: Arndt Gold

## 1. Problem

The Claude companion pane only knows Runs. When a project has a planned UR under `.agdf/control/planned/` that has not yet been handed over to a Run, the pane shows an empty-state message such as "All runs across the line" or "Starting grid empty". The owner saw exactly this in the project `C:\Workspace\voice` on 2026-11-16: a UR was being drafted in the chat while the pane claimed that all work was done. The pane and the chat contradict each other, and the user cannot see from the pane that a need is being prepared or that a handover into a Run is the next step.

## 2. Goal

While no open Run exists, or while a planned UR changes during the current session, the companion pane names the planned UR by its title, shows its goal, says that it is in UR planning and not yet a Run, and tells the user what comes next (finish the draft, or hand it over into a Run). The figure and the status line match that state. Completed Runs and further planned URs stay visible as a short note.

## Affected Users

- People who use AGDF in Claude Code with the companion pane open and capture needs as planned URs before starting delivery.
- The owner, who reviews the pane during runs and judged the current empty state as contradicting the chat.

## 3. Scope

- The read-only Core run view used by the companion (`run-view/1`) additionally lists planned URs that are not yet transferred, with plan id, title, coverage (`draft`, `ready`, `recovery_required`, `unconfirmed`, `unavailable`), goal in the display language where available, and last change time. Reading planned URs must not break the run view: an unreadable planning store yields an empty list.
- The companion picks one planned UR to show when no Run is assigned: the newest one that changed in this session, or the newest one when no Run is open.
- The pane shows for that planned UR: title, route line "UR planning, no run yet", goal, a "who is next" block (draft: Claude drafts during a turn, otherwise the next step; ready: hand it over into a Run in the chat; unclear coverage: clarify), a gate bar with only the UR planning step, a details entry, a note with the number of completed Runs and of further planned URs, and the plan id as reference line.
- The figure holds the UR clipboard, writes during a main-loop turn and rests otherwise, consistent with the existing rule for the UR gate.
- The status line reads "AGDF · UR planning" (German: "AGDF · UR-Planung").
- The pane reads the run view again when a planned UR appears or changes.
- All new texts exist in the interaction catalog in `de` and `en`; the terminal view shows the same information.
- Tests for the Core view, the companion view model, the drawn pane and the terminal, in `de` and `en`.

## 4. Non-Goals

- No writing from the companion: it does not create, edit, prioritise or hand over planned URs and starts no Run.
- No change to planning semantics, readiness rules or `run.create_from_planned`.
- No selection UI for choosing between several planned URs.
- No change to the cockpit or other hosts (Codex, Copilot) beyond the shared Core read.
- No translation of UR titles; the title stays in the artefact language.

## 5. Acceptance Signals

- In a project with a drafted planned UR and no open Run, the pane shows the UR title and "UR planning" instead of any "all done" or "empty" message.
- A complete planned UR is shown as ready for handover with a hint to start it in the chat.
- Once the planned UR is handed over into a Run, it leaves the planned list and the pane shows the Run as before.
- An unreadable planning store does not break the pane; Runs are still shown.
- Status line and figure match the shown state; texts appear in the chat language (`de`/`en`) without mixed languages.
- Existing companion behaviour for Runs and for projects without AGDF is unchanged.

## 6. Existing Source Of Truth

- Core run view: `packages/core/lib/companion/run-view.js` (`readRunView`, `projectRunView`, `readRunNaming`).
- Planned UR inventory: `projectPlannedInventory` / `readWorkInventory` and the planned UR store under `.agdf/control/planned/plan-<uuid>/UR.md`.
- Shared title rule `runIdentity` in `packages/core/lib/control-state/run-title.js`.
- Companion host template: `plugins/agdf/host-templates/claude/companion/` (`assignment.mjs`, `run-state.mjs`, `view.mjs`, `register.mjs`, `notice.mjs`, `figure.mjs`).
- Interaction catalog `plugins/agdf/meta/agdf-interaction-locales.json` and its validation `packages/core/lib/interaction-catalog-validation.js`.
- Change chain for catalog edits: MCP UI build, `scripts/sync-package-assets.js`, exact Copilot payload baseline, host compatibility record.
- PRs #73 and #75 (merged) define the current pane layout, the figure rules and the activity lines.

## 7. Risks And Unknowns

- A candidate implementation already exists uncommitted on branch `feat/companion-planned-ur`. It was written without a Run; it must be checked against the approved PRD/SD/TP and is not approved by this UR.
- Readiness of a planned UR depends on the display language (a missing localized approval summary keeps it in `draft`); the pane may therefore show "draft" for a UR that is complete in the artefact language.
- Reading the planning store adds work to every pane refresh; the read must stay bounded and inside the same captured snapshot.
- The companion cannot see chat questions, so "Claude drafts" is shown for any main-loop turn.
- Not verified in the live Claude pane; the owner's original example in `voice` has since been handed over and no longer reproduces the state.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

No preview is required before PRD; the owner already reviewed mock images of the pane in the chat.

## AGDF Approval Summary (de; source=en)

- Ziel: Solange kein Run offen ist oder sich eine geplante UR in dieser Sitzung ändert, zeigt der Begleiter die geplante UR mit Titel, Ziel und dem Hinweis „UR-Planung · noch kein Run“ statt „Alle Runs im Ziel“, und sagt, was als Nächstes kommt.
- Problem: Der Begleiter kennt nur Runs. Im Projekt voice meldete er „Alle Runs im Ziel“, während im Chat eine UR entworfen wurde. Panel und Chat widersprechen sich.
- Betroffene: Nutzer von AGDF in Claude Code mit offenem Begleiter, die Bedarfe als geplante UR erfassen; der Owner bei der Durchsicht.
- Umfang: Die lesende Run-Ansicht des Core listet nicht übergebene geplante URs (Titel, Abdeckung, Ziel, letzte Änderung); der Begleiter wählt die neueste passende, zeigt Titel, Ziel, „Wer ist dran“, Gate-Leiste mit UR-Planung, Details, einen Hinweis auf abgeschlossene Runs und weitere URs sowie die Plan-ID; Figur mit Klemmbrett (schreibt während eines Turns, ruht sonst); Statuszeile „AGDF · UR-Planung“; neues Lesen bei neuer oder geänderter UR; Texte in de und en; Tests.
- Nicht enthalten: Kein Schreiben aus dem Begleiter, keine Änderung an Planungsregeln oder an der Übergabe in einen Run, keine Auswahl zwischen mehreren URs, keine Änderung an Cockpit oder anderen Hosts, keine Übersetzung von UR-Titeln.
- Abnahmesignale: Entworfene UR ohne offenen Run erscheint mit Titel und „UR-Planung“; eine vollständige UR erscheint als bereit zur Übergabe; nach der Übergabe zeigt der Begleiter den Run; ein unlesbarer Planungsordner bricht die Anzeige nicht; Statuszeile und Figur passen; bestehendes Verhalten für Runs und Projekte ohne AGDF bleibt gleich.
- Maßgebliche Quellen: Core-Run-Ansicht `run-view.js`, Planungsinventur `projectPlannedInventory`, Titelregel `runIdentity`, Begleiter-Vorlage unter `plugins/agdf/host-templates/claude/companion/`, Interaktionskatalog mit Validierung, Kette für Katalogänderungen, PR #73 und #75.
- Risiken: Ein ohne Run geschriebener Umsetzungskandidat liegt uncommittet auf `feat/companion-planned-ur` und muss gegen PRD/SD/TP geprüft werden; Bereitschaft hängt von der Anzeigesprache ab; zusätzlicher Lesezugriff bei jeder Aktualisierung; „Claude entwirft“ gilt für jeden Turn; keine Prüfung im echten Claude-Panel.
- Nächster Schritt: UR prüfen und mit `Approval: UR` freigeben. Eine Vorschau vor dem PRD ist nicht nötig, die Mocks hat der Owner bereits gesehen.
