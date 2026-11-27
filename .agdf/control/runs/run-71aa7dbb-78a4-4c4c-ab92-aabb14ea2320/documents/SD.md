# SD: Single Core reader for the companion event journal

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The Core journal reader becomes the only code that opens and parses the companion event journal. It is generalized from "events of one run" to "events of a project root, optionally one run" and renamed to reflect that. Two consumers use it:

- **Claude companion (push).** The plugin runtime's read-only `run-view` command gains an explicit companion data root input. With it, `run-view` reads the root's event history first and then the runs, and returns both in one `run-view/1` document. The Claude companion passes its plugin data directory on every run-view call, keeps the cheap change detection on the journal file (size and modification time from `$.fs.list`), and on a change simply reads the run view again. Cursor, toasts, confirmation of durable facts and sticky uncertain events stay in the companion and now work on the events of the same read. The companion's own journal parser, root normalization and read bound are removed.
- **Codex Cockpit (pull).** The Cockpit freshness observation calls the same reader for the selected run. The Codex companion card applies the Claude companion's confirmation and sticky rules through one shared selection function and shows dates with the shared time text function.

A contract test runs the reader and both consumers on shared journal fixtures.

## 2. Ownership And Source Of Truth

- Journal writer and line format `companion-event/1`: `packages/core/lib/companion/journal.js` and `packages/core/lib/companion/events.js` (`parseEventLines`, `validEvent`, `EVENT_KINDS`, `SOURCE_MATCHES`). Unchanged.
- Journal reader: `packages/core/lib/companion/read-companion-events.js` (renamed from `read-cockpit-events.js`), the single reader.
- Run view: `packages/core/lib/companion/run-view.js` (`readRunView`, `projectRunView`) behind the CLI command `run-view` (`packages/cli/lib/cli/project-read-command.js`, `parse-args.js`, `command-registry.js`).
- Cockpit: `packages/core/lib/control-inspect/cockpit-session.js` (observation) and `cockpit.js` (run detail).
- Run activity time: `packages/core/lib/control-state/run-inventory.js` (`lastActivity` over the run document's receipts), already the source of `last_activity` in the run view.
- Claude companion: `plugins/agdf/host-templates/claude/companion/register.mjs`, `run-state.mjs`, `events.mjs`, `view.mjs`.
- Codex card: `packages/control-ui/src/mcp/CompanionCard.tsx`, `packages/control-ui/src/types.ts`.
- Approvals and completion remain owned by the canonical run state; the journal remains a notification channel.
- Runtime projection: `scripts/core-projection.mjs` (which Core modules ship in which runtime profile).

## 3. Architecture Decisions

- SDD-001: Rename `packages/core/lib/companion/read-cockpit-events.js` to `read-companion-events.js` and export `readCompanionEvents(dataRoot, projectRoot, { runId = null, limit = COMPANION_EVENT_HISTORY_LIMIT, review = false })` returning `{ state: 'available' | 'unavailable', items }`, with `COMPANION_EVENTS_READ_LIMIT = 2 * JOURNAL_LIMIT_BYTES` and `COMPANION_EVENT_HISTORY_LIMIT = 32`. It keeps the reviewed read rules: the current file is read before the rotation file, a current file above the read bound or unreadable makes the result `unavailable`, an oversized or unreadable rotation file is skipped, each file is opened read-only without following links and its identity is checked after opening, and parsed lines are cached by path while dev, inode, size and modification time stay the same. Lines are parsed only by `parseEventLines`. Items are the valid events of the root in journal order (rotation file, then current file), each id once (first occurrence kept), the last `limit` of them, shaped `{ id, at, run_id, kind, gate, reason }` (`at` normalized to ISO or null, `gate` up to 64 characters else null, `reason` a bounded code `^[A-Za-z][A-Za-z0-9_]{0,127}$` else null, `run_id` up to 128 characters else null); with `review: true` an item of a staging or recording event also carries `review: [fact]`, the first review fact sanitized to the writer's field set (`slot`, `source`, `path`, `digest`, `bytes`, `preview` cut to 4096 characters, `truncated`, `source_match` from `SOURCE_MATCHES`). Root matching: the event root equals the given project root, or its realpath, or the event root's realpath has an empty `path.relative` to the project root's realpath (case-insensitive on Windows, so drive-letter case and alias spellings match); a project root that does not resolve matches only by exact spelling. A missing companion folder or journal is `available` with no items; a data root that is not an absolute directory is `unavailable`; rationale: one reader with the reviewed rules of PR #85 (commits 4bceb634, b10fec4a) removes the drift that caused the 256 KiB defect, and the realpath comparison is the one the MCP server's event roots are built for; consequence: Claude's former string normalization is replaced, so a root that no longer exists matches only by its exact spelling, and the module name changes for its two callers and tests.
- SDD-002: `scripts/core-projection.mjs` no longer removes the reader from the Copilot runtime projection; rationale: `run-view.js` ships in every runtime profile and now imports the reader, so excluding it would break `run-view` in the Copilot runtime; consequence: the Copilot payload grows by one small read-only module and its payload baseline changes.
- SDD-003: `run-view` gains the unique option `--companion-data`, whose value is the absolute plugin data root; a relative, missing or repeated value is a usage error. `readRunView(root, { language, runIds, companionDataRoot })` reads the event history with `readCompanionEvents(companionDataRoot, root, { review: true })` before it reads the inventory and evaluates any run, also on the early "no control" and "unavailable" paths, and `projectRunView` adds `events: { state, items }` only when the option was given. The schema stays `run-view/1`; rationale: an explicit argument is visible in the argv the adapter tests already check and needs no environment support from `$.process.run`; reading events first guarantees that every returned event refers to a write the following run read can already see, so confirmation against the same document is sound; the field is additive and existing callers ignore unknown fields; consequence: one schema version covers two output shapes (with and without `events`), and the worst-case output grows by 32 events with one bounded preview each.
- SDD-004: The Claude companion takes events only from the run view. `run-state.mjs` appends `--companion-data` with the plugin data directory when that directory is known and maps `view.events` to `snapshot.events` (`null` when absent; `{ state: 'unavailable', items: [] }` for a malformed history; otherwise the items whose `id` is a string and whose `kind` is in `EVENT_KINDS`). `register.mjs` `refresh` lists the journal directory before its run-view call (stamp `size:mtimeMs` of `events.jsonl`, `absent` when missing), and after a successful read with events stores that stamp, sets the events availability from `snapshot.events.state`, advances the cursor with `unseenEvents(items, { cursor })`, computes the quiet runs from fresh toast-kind events before announcing the run state, confirms durable facts with `isConfirmed` against the same snapshot (keeping the existing `unconfirmed` wait for a snapshot whose store is not `ok`), adds the shown events to the pane and raises their toasts. `pollEvents` only compares the current stamp with the stored one and calls `refresh` when it differs; it reads no journal content; rationale: one read yields run state and events, the stamp check keeps an unchanged journal free of process starts, and a refresh triggered by a run change already consumes the events so the following journal signal finds the stamp unchanged; consequence: a journal change from another project root now costs one run-view read (accepted by the owner on 2026-11-27), and a missing journal reads as "no events" instead of "events unavailable".
- SDD-005: Remove from `events.mjs` the journal parser `parseJournal`, `EVENT_SCHEMA`, `normalizeRoot`, `sameRoot`, `JOURNAL_READ_LIMIT` and `JOURNAL_ROTATED_FILE`, and drop the root filter from `unseenEvents`; keep `JOURNAL_FILE` and `journalDirectory` for the change detection and the kind lists and rules. Core `events.js` `sameRoot` stays (used only by the host-neutral test harness, not a reader); rationale: AC-001 requires that the templates hold no parser, root normalization or read bound; consequence: the mirror parity tests for parser and root comparison are replaced by the contract test, and the parity test keeps pinning `JOURNAL_FILE`, `journalDirectory` and the kind lists to Core.
- SDD-006: Add `historyEvents(events, runs, { limit = PANE_EVENTS })` to `events.mjs`: it drops `approval_recorded` and `run_completed` events that `isConfirmed` does not confirm, keeps every still-uncertain `effect_unknown`/`recovery_required` event (`isStillUncertain`) up to `limit`, fills the remaining places with the newest other events and returns them in input order (newest first). The Codex card calls it with one run built from the detail: `{ id: run_id, lifecycle, path: companion?.path ?? [], updatedAt: last_activity ?? '' }`. `cockpit.js` adds `last_activity` to the run detail from a new export `runLastActivity(text)` of `run-inventory.js` (the newest receipt time, the derivation behind the run view's `last_activity`). The Cockpit observation reads up to 32 events of the selected run without review facts, adds `run_id` to each item and keeps today's newest-first order by time; rationale: one rule implementation serves both companions, and the detail time comes from the same owner as the Claude companion's `updatedAt`; consequence: the observation grows from at most 5 to at most 32 small items (well inside `READ_LIMITS.response`), and the card selects the five lines itself.
- SDD-007: Add `eventTimeText(at, { locale, now })` to `view.mjs`: empty text for a missing or unreadable time; `HH:MM` for the local day of `now`; otherwise `DD.MM. HH:MM` (with `DD.MM.YYYY` for another year) for German and `YYYY-MM-DD HH:MM` for other locales. The Claude pane line becomes the time text followed by the event text (no leading space when the time text is empty), using the session locale and the view's `now`; the Codex card imports the same function with `de` instead of its local copy; rationale: one function gives both surfaces the agreed date text (PRD decision); consequence: the German output of the Codex card is unchanged, and the English Claude pane uses an ISO date that differs from the German day-month order.
- SDD-008: Add the contract test `packages/core/test/companion-journal-contract-test.js` with shared fixtures in `packages/core/test/fixtures/companion-journal-fixtures.js` and register it in `test:companion-run-view`. It writes real journal files (oversized current file, oversized rotation file, a rotation with lines in both files, cut and malformed lines, a foreign schema, a foreign root, an alias of the project root through a junction or symlink, and on Windows the drive letter in the other case), runs the reader, runs `readRunView` with the data root and maps it through the Claude template's `snapshotFromRunView`, runs the Cockpit session freshness observation for a run, compares the event identities of both consumers with the reader's result, and asserts that the Claude template sources no longer contain a journal parser, root normalization or read bound; rationale: one test pins the shared behaviour of both consumers to one fixture set; consequence: the test imports one Claude template module, as the host-neutral test already does.

## 4. Integration Points

- CLI `run-view --dir <root> --json --language <tag> [--run <id>]... [--companion-data ABSOLUTE_DATA_ROOT]` (documented interface, additive option and field).
- Claude companion: `$.process.run` argv of `run-view` (adds the option), `$.fs.list` of the `companion` folder below the plugin data directory (unchanged), the `companion-observe` stream signals `journal`, `run` and `journal-unavailable` (unchanged).
- MCP Cockpit freshness/snapshot response `companion_observation.events.items` (adds `run_id`, up to 32 items) and run detail `last_activity` (new field), consumed by `packages/control-ui`.
- Runtime projection for Copilot (`scripts/core-projection.mjs`) and the Copilot payload baseline.

## 5. Constraints And Compatibility

- The Claude template still imports no Core module and uses only `$.fs` and `$.process`.
- `run-view` without `--companion-data` produces exactly today's document and exit codes.
- No writer, journal format, bound, rotation or event kind changes.
- Old template with new runtime: the old template does not pass the option and keeps parsing the journal itself; new template with old runtime does not occur because both ship in one plugin build.
- The journal stays a notification channel; durable facts are only shown once the run state confirms them.
- Output bounds: run view at most 32 events of the root with at most one review fact each (preview at most 4096 characters); Cockpit at most 32 events of the run without review facts, still subject to the existing response-size check.
- Changes under `plugins/agdf` follow the contract text change chain: Copilot payload baseline, eval fingerprints, `npm run build:prepare`, then `npm run compatibility:record`; recorded native Claude evidence may become stale.

## 6. Test And Evidence Strategy

Reuse first, then targeted new proof:

- Reused and adapted suites: `packages/core/test/cockpit-session-test.js` (event observation, oversized files; adapted to the renamed module, `run_id` and 32 items), `packages/cli/scripts/claude-companion-test.js` (kind parity, `unseenEvents` without root filter, new `historyEvents`, `eventTimeText` and `snapshotFromRunView` event mapping; parser/root mirror checks removed), `packages/cli/scripts/claude-companion-adapter-test.js` (end-to-end poll flow through the real in-process `run-view`; adapted for one run-view read per journal change, a missing journal without hint, an oversized journal as "events unavailable", dated pane lines and the removed root filter), `claude-companion-parity-test.js` and `claude-companion-integrity-test.js` (argv), `scripts/run-view-command-test.js` (with and without `--companion-data`, usage errors), `packages/core/test/companion-run-view-test.js` and `companion-host-neutral-test.js` (unchanged behaviour without the option), control-ui vitest (`companion-reading.test.tsx`: confirmation, sticky events, dates).
- New proof: the contract test of SDD-008 for the reader and both consumers.
- Build and compatibility: `npm run build:prepare`, payload baseline and eval fingerprint updates, `npm run compatibility:record`, then `npm run compatibility:check`.
- All of these run locally in this run before QA; CI repeats them on the pull request. Native live-host checks of the Claude companion are not part of this run; the adapter test drives the real module against the real command in process, which is the existing evidence level for the companion.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Parser, root normalization and read bound removed from the Claude templates; only Core's reader parses the journal | `events.mjs`, `register.mjs`; `read-companion-events.js` | SDD-004, SDD-005 | Mirror tests replaced by the contract test assertion |
| AC-002 | Generalized reader with root/run scope, kept read rules, alias and drive-letter matching | `read-companion-events.js` | SDD-001 | Rename touches two callers and their tests; nonexistent roots match only exactly |
| AC-003 | `--companion-data` option, events read first, additive `events` field under `run-view/1` | `run-view.js`, CLI `run-view` | SDD-002, SDD-003 | Additive; old callers unchanged; Copilot projection must ship the reader |
| AC-004 | Stamp-gated refresh that consumes the events of the same run-view read | `register.mjs`, `run-state.mjs` | SDD-004 | One run-view read per journal change, also for other roots (accepted) |
| AC-005 | Shared time text with day/month (de) and ISO date (other locales) | `view.mjs` | SDD-007 | Pane line format changes for earlier days only |
| AC-006 | Card confirms durable kinds through `historyEvents`/`isConfirmed` against the detail's path and lifecycle | `events.mjs`, `CompanionCard.tsx` | SDD-006 | Unconfirmed events disappear from the card |
| AC-007 | Card keeps still-uncertain events through `historyEvents`/`isStillUncertain` with the detail's `last_activity` | `events.mjs`, `cockpit.js`, `run-inventory.js` | SDD-006 | New detail field; observation carries up to 32 items |
| AC-008 | Contract test runs reader, run view with the Claude mapping and the Cockpit observation on shared fixtures | contract test and fixtures | SDD-008 | Test imports one Claude template module |
| AC-009 | Regression suites, build preparation and compatibility record/check | existing suites and scripts | none — verification of the decisions above, no additional design decision | Native Claude evidence may need a later refresh |

## 8. Risks And Open Questions

- Process cost: each journal change, also from another project in the same data root, starts one run-view read (about 1.6 s on this repository); accepted by the owner. A run-change signal and a journal signal for the same write share one read through the stored stamp.
- Windows subst drives are not resolved by the JS `realpathSync` used by the reviewed reader; the writer keeps the caller's spelling for such roots, so an exact match remains. The contract test covers junction aliases and drive-letter case.
- Worst-case run-view output with 32 maximal previews is about 150 KB of JSON; typical output adds a few kilobytes.
- PR #85 conflicts with its base; this branch inherits that until PR #84/#85 are resolved.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| How `run-view` receives the companion data root | before_sd | resolved | Explicit unique option `--companion-data` with an absolute path value (SDD-003); no environment variable | Arndt Gold |
| Schema version of the extended run view | before_sd | resolved | Stays `run-view/1`; `events` is an additive optional field (SDD-003) | Arndt Gold |
| Event count and size bounds | before_sd | resolved | At most 32 events per read for run view and Cockpit; run view carries the first review fact with a preview of at most 4096 characters; Cockpit carries no review facts (SDD-001, SDD-003, SDD-006) | Arndt Gold |
| Read order inside `run-view` | before_sd | resolved | Events are read before the inventory and run evaluation (SDD-003) | Arndt Gold |
| Run-detail field for the Codex sticky rule | before_sd | resolved | New detail field `last_activity` from `runLastActivity` in `run-inventory.js` (SDD-006) | Arndt Gold |
| Reader module name and runtime profiles | before_sd | resolved | Renamed to `read-companion-events.js` and shipped in every profile including Copilot (SDD-001, SDD-002) | Arndt Gold |
| Claude behaviour for a missing journal | before_sd | resolved | No events and no "events unavailable" hint; the hint remains for an unreadable or oversized journal, an unknown data directory and the observer's `journal-unavailable` signal (SDD-004) | Arndt Gold |
| Exact fixture contents and test file split | later_tp | deferred | The TP lists the concrete fixture cases and which existing assertions move into the contract test; the cases themselves are fixed in SDD-008 | TP author (tp-definition) |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Das Journal wird nur noch vom Core-Leser gelesen; der Claude-Begleiter bekommt Run-Zustand und Ereignisse aus einem einzigen `run-view`-Lesevorgang, die Codex-Karte wendet dieselben Regeln für Bestätigung, haftende Ereignisse und Datumsanzeige an.
- Leser (SDD-001, SDD-002): `read-cockpit-events.js` wird zu `read-companion-events.js` mit `readCompanionEvents(dataRoot, projectRoot, { runId, limit, review })`; die geprüften Leseregeln (doppelte Writer-Grenze, aktuelle vor Rotationsdatei, übergroße Rotationsdatei übersprungen, Cache, Identitätsprüfung) bleiben; Root-Abgleich über Realpath und unter Windows ohne Groß-/Kleinschreibung; das Modul wird auch im Copilot-Profil ausgeliefert, weil `run-view` es braucht.
- `run-view` (SDD-003): neue eindeutige Option `--companion-data` mit absolutem Pfad; die Ereignisse werden vor den Runs gelesen, damit jede Bestätigung im selben Dokument trägt; zusätzliches Feld `events`, Schema bleibt `run-view/1`; ohne Option unverändert.
- Claude-Begleiter (SDD-004, SDD-005): `refresh` nimmt vor dem Lesevorgang den Journal-Stempel (Größe und Änderungszeit), verarbeitet Cursor, Toasts, Bestätigung und haftende Ereignisse auf den Ereignissen desselben Lesevorgangs; `pollEvents` vergleicht nur noch den Stempel; Parser, Root-Normalisierung, Lesegrenze und Rotationsdateiname entfallen aus `events.mjs`; ein fehlendes Journal bedeutet künftig „keine Ereignisse“ statt „Ereignisse nicht verfügbar“.
- Codex-Karte (SDD-006): gemeinsame Auswahlfunktion `historyEvents` blendet unbestätigte Freigaben und Abschlüsse aus und hält noch unsichere Ergebnisse sichtbar; die Run-Detailansicht erhält `last_activity` aus derselben Quelle wie der Claude-Begleiter; die Cockpit-Beobachtung liefert bis zu 32 Ereignisse mit `run_id`.
- Datumsanzeige (SDD-007): gemeinsame Funktion `eventTimeText` – heute nur Uhrzeit, sonst Deutsch „26.11. 14:05“ bzw. „26.11.2025 14:05“, Englisch „2026-11-26 14:05“.
- Nachweis (SDD-008): neuer Contract-Test mit gemeinsamen Journal-Fixtures (übergroße Dateien, Rotation, kaputte und fremde Zeilen, fremder Root, Alias, Laufwerksbuchstabe) für Leser, Claude-Abbildung über `run-view` und Cockpit-Beobachtung; dazu angepasste bestehende Suiten, `npm run build:prepare`, Payload-Baseline, Eval-Fingerprints, `npm run compatibility:record` und `npm run compatibility:check`.
- Entscheidungen: explizite Option statt Umgebungsvariable; Schema bleibt `run-view/1`; höchstens 32 Ereignisse je Lesevorgang, im `run-view` mit einer Prüfangabe (Vorschau höchstens 4096 Zeichen), im Cockpit ohne; Ereignisse vor Runs lesen; `last_activity` im Run-Detail; Umbenennung und Auslieferung in allen Profilen; fehlendes Journal ohne Hinweis. Die genaue Aufteilung der Testfälle legt der TP fest.
- Risiken: ein `run-view`-Lesevorgang je Journaländerung auch aus anderen Projekten (vom Owner akzeptiert); `subst`-Laufwerke werden vom JS-Realpath nicht aufgelöst, passen aber über die exakte Schreibweise; im ungünstigsten Fall etwa 150 KB zusätzliche JSON-Ausgabe.
