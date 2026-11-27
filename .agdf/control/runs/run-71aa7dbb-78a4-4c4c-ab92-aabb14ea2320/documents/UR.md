# UR: Single Core reader for the companion event journal

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-27
Owner: Arndt Gold

## 1. Problem

The companion event journal (`companion/events.jsonl` plus one rotation file `events.1.jsonl` below the plugin data root) has one writer, `packages/core/lib/companion/journal.js`, but two independent readers: the Claude companion host template (`plugins/agdf/host-templates/claude/companion/register.mjs` `pollEvents` with `parseJournal`, `normalizeRoot`/`sameRoot` and `JOURNAL_READ_LIMIT` in `events.mjs`) and the Codex Cockpit reader `packages/core/lib/companion/read-cockpit-events.js` (PR #85, branch `codex/companion-run-events`). The review of PR #85 found a defect caused by drift between them (the Codex reader rejected journals over 256 KiB while concurrent writers overshoot and the Claude reader allows 512 KiB). Further divergences remain: rotation handling, root matching (string normalization in Claude, realpath in Core), confirmation of durable facts against the run state and sticky uncertain kinds (only in Claude), and dates for events of an earlier day (only in Codex). Every future change of the journal format or its bounds has to be made twice and can drift again.

## 2. Goal

The Core journal reader is the only code that reads and parses the companion event journal. The Claude companion obtains the events of its project root from the plugin runtime's read-only `run-view` command, which it already calls, instead of parsing the journal itself. Both companions show the same events for the same journal, apart from the intended host differences.

## Affected Users

- Users of the AGDF companion in Claude (pane, toasts, status line) and of the Codex Cockpit companion card.
- Maintainers of the companion journal format, the `run-view` command and both host companions.

## 3. Scope

1. Generalize `packages/core/lib/companion/read-cockpit-events.js` from the events of one run to the events of one project root, optionally narrowed to one run. Keep the read bound of twice `JOURNAL_LIMIT_BYTES`, the current-before-rotated read order, skipping an oversized or unreadable rotation file, the cache keyed by the opened file's identity, size and modification time, and the identity check after opening on Windows.
2. Add the event history of the project root to the runtime's read-only `run-view` command that the Claude companion calls through `$.process` (`run-state.mjs` `readSnapshot`, `register.mjs` `refresh`), so run state and events come from one read.
3. In `register.mjs` `pollEvents`, keep only the cheap change detection (the `$.fs.list` size and modification-time stamp) and the UI logic (cursor and `unseenEvents`, toasts, `isConfirmed`, `isStillUncertain`); take the events from `run-view` instead of `parseJournal`. Remove the now unused duplication from `events.mjs` (`parseJournal`, `normalizeRoot`/`sameRoot`, `JOURNAL_READ_LIMIT`) where nothing else needs it.
4. Align deliberate semantics between the hosts: the Codex card (`packages/control-ui/src/mcp/CompanionCard.tsx`) shows `approval_recorded` and `run_completed` only when the run detail confirms them and keeps `effect_unknown` and `recovery_required` visible while they are still uncertain, like the Claude sticky kinds; the Claude pane dates events of an earlier day like the Codex card.
5. Add a contract test that runs the Core reader on shared journal fixtures (oversized current file, oversized rotation file, rotation, cut and foreign lines, foreign root, alias spelling of the root, drive-letter case) and covers both consumers (the Claude companion through `run-view`, the Codex Cockpit observation).

## 4. Non-Goals

- No change to the journal writer, its line format `companion-event/1`, its bound or its rotation.
- No change to the intended host differences: push (Claude toasts) versus pull (Codex freshness poll), and all runs of a root (Claude) versus the selected run (Codex).
- No build-time generated copy of the reader in the host templates (owner decision of 2026-11-27: the `run-view` route is preferred).
- No change to gate rules, the status card or the gate-check evaluator.
- No merge of PR #84 or PR #85; this work is stacked on branch `codex/companion-run-events` and delivered as its own pull request.

## 5. Acceptance Signals

- The journal format is parsed in exactly one place (Core); the Claude host templates contain no journal parser or root normalization of their own.
- The new contract test passes and shows that both consumers receive the same events for the same fixtures.
- `packages/core/test/cockpit-session-test.js`, `packages/cli/scripts/claude-companion-test.js`, the control-ui vitest suite and `npm run compatibility:check` pass.
- Where `plugins/agdf` changes, the contract text change chain is followed (Copilot payload baseline, eval fingerprints, `npm run build:prepare`, then `npm run compatibility:record`).

## 6. Existing Source Of Truth

- Writer and format: `packages/core/lib/companion/journal.js`, `packages/core/lib/companion/events.js` (`parseEventLines`, `validEvent`, `EVENT_KINDS`).
- Core reader: `packages/core/lib/companion/read-cockpit-events.js` and its use in `packages/core/lib/control-inspect/cockpit-session.js`, including the fixes of commits 4bceb634 and b10fec4a.
- Run view: `packages/core/lib/companion/run-view.js` (`run-view/1`), `packages/cli/lib/cli/project-read-command.js`, the CLI parser and command registry.
- Claude companion: `plugins/agdf/host-templates/claude/companion/register.mjs`, `events.mjs`, `run-state.mjs`, `view.mjs`; it imports no Core module and runs with `$.fs` and `$.process` only.
- Codex card: `packages/control-ui/src/mcp/CompanionCard.tsx`, which already imports `eventText`, `gateTitle` and `clockText` from the Claude templates.
- Existing tests: the event-kind parity test in `packages/cli/scripts/claude-companion-test.js`, `packages/core/test/cockpit-session-test.js`, control-ui companion tests.
- Earlier companion runs and their decisions: CR findings B3, B4, B6, B7, CIR-04 and delta review RV-1 cited in the code.

## 7. Risks And Unknowns

- Cost: every journal change, including writes of other project roots in the same plugin data root, now starts one `run-view` process (about 1.6 s on this repository, in the background) instead of a file read. The owner accepted this on 2026-11-27.
- Root matching changes for Claude from string normalization to the Core realpath comparison; a root that no longer exists then matches only by its exact spelling. The SD must confirm that drive-letter case and alias spellings still match.
- Output size: review facts (previews up to 4 KiB) in the `run-view` output and the Cockpit response bound need explicit limits.
- How `run-view` learns the companion data root (an explicit argument versus an environment variable) is a design decision for the SD.
- Whether the additive `events` field needs a `run-view` schema version change is a design decision for the SD.
- Changes under `plugins/agdf` trigger the contract text change chain; native Claude evidence may become stale.
- PR #85 currently conflicts with its base; the stacked branch inherits that until PR #84/#85 are resolved.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Problem: Das Companion-Ereignisjournal hat einen Schreiber in Core, wird aber von zwei unabhängigen Implementierungen gelesen (Claude-Companion-Template und Codex-Cockpit-Leser aus PR #85). Die Abweichung zwischen beiden hat bereits einen Fehler verursacht (256- statt 512-KiB-Grenze); weitere Unterschiede bestehen bei Rotation, Root-Vergleich, Bestätigung dauerhafter Ereignisse, haftenden unsicheren Ereignissen und der Datumsanzeige.
- Ziel: Der Core-Journal-Leser ist die einzige Implementierung, die das Journal liest; der Claude-Begleiter erhält die Ereignisse seines Projekt-Roots über den bereits genutzten read-only Befehl `run-view`, und beide Begleiter zeigen für dasselbe Journal dieselben Ereignisse.
- Betroffene Nutzer: Nutzer des AGDF-Begleiters in Claude und der Codex-Cockpit-Karte sowie Maintainer des Journalformats, von `run-view` und beider Begleiter.
- Umfang: (1) Core-Leser auf Ereignisse eines Projekt-Roots, optional eines Runs, verallgemeinern und dabei Lesegrenze, Lesereihenfolge, Überspringen übergroßer Rotationsdatei, Cache und Windows-Identitätsprüfung erhalten; (2) `run-view` liefert die Ereignishistorie des Roots mit; (3) Claude-`pollEvents` behält nur die günstige Änderungserkennung und die UI-Logik, der eigene Parser samt Root-Normalisierung entfällt; (4) Codex-Karte zeigt `approval_recorded`/`run_completed` nur bestätigt und hält `effect_unknown`/`recovery_required` sichtbar, Claude-Pane datiert Ereignisse früherer Tage; (5) Contract-Test auf gemeinsamen Journal-Fixtures für beide Verbraucher.
- Nicht-Ziele: keine Änderung an Schreiber, Zeilenformat, Grenze oder Rotation; Push vs. Pull und alle Runs vs. ausgewählter Run bleiben hostspezifisch; kein build-time generiertes Modul (Owner-Entscheid 2026-11-27); keine Änderung an Gate-Regeln oder Statuskarte; kein Merge von PR #84/#85, die Arbeit wird auf `codex/companion-run-events` gestapelt und als eigener PR geliefert.
- Akzeptanzsignale: Das Journalformat wird nur noch in Core geparst; der neue Contract-Test läuft und zeigt gleiche Ereignisse für beide Verbraucher; `cockpit-session-test.js`, `claude-companion-test.js`, control-ui-vitest und `npm run compatibility:check` laufen durch; bei Änderungen unter `plugins/agdf` wird die Änderungskette eingehalten.
- Quellen: `journal.js`, `events.js`, `read-cockpit-events.js`, `cockpit-session.js`, `run-view.js`, das CLI-Kommando `run-view`, die Claude-Templates `register.mjs`, `events.mjs`, `run-state.mjs`, `view.mjs`, `CompanionCard.tsx` sowie die bestehenden Tests und früheren CR-Befunde (B3, B4, B6, B7, CIR-04, RV-1).
- Risiken und offene Punkte: Jede Journal-Änderung, auch aus anderen Projekten, startet künftig einen `run-view` (hier etwa 1,6 s im Hintergrund), vom Owner akzeptiert; der Root-Vergleich wechselt bei Claude auf den Realpath-Vergleich von Core; Ausgabegrößen von Prüfangaben brauchen Grenzen; wie `run-view` die Datenwurzel erfährt und ob das neue Feld eine Schema-Version braucht, entscheidet das SD; Änderungen unter `plugins/agdf` ziehen die Änderungskette nach sich; PR #85 hat derzeit Konflikte mit seiner Basis.
- Nächster Schritt: Dieses UR prüfen und nur mit `Approval: UR` freigeben.
