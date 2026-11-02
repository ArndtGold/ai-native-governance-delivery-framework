# SD: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-28
Owner: Arndt Gold
Run: agdf-companion-chat-run-navigation-20261028-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

All changes stay inside the delivered Claude companion (`plugins/agdf/host-templates/claude/companion/`), its suites, the companion section of `INSTALL.md` and the regenerated evidence. Manifest, descriptor, shared definition, shared hooks, Copilot payload, core readers and the `RUN_STATE.md` format stay unchanged, and no hook is added.

The design extends the one owner that decides which run is shown, `assignment.mjs`, with a chat signal and a temporary browse. The existing `turn.start` and `turn.complete` hooks feed the chat signal from the main-loop prompt and answer texts; a refresh feeds the existing "changed in this session" signal. The view gains an origin "named in the chat", the stepping buttons for the chat run and a return control; the status line and toasts observe the run the panel shows without browsing. The overlay rule in `state.mjs` lets "waiting" through during a turn, and the desktop body reserve shrinks to the smallest value that shows no scrollbar, chosen by a live probe.

## 2. Ownership And Source Of Truth

| Concern | Owner | Source of truth |
|---|---|---|
| Which run is shown, and the chat run | `assignment.mjs` (`assignRun`, new `namedRun`) | Snapshot runs from `RUN_STATE.md`; the session's chat signal; the remembered selection |
| Chat signal and browse state | `register.mjs` session memory (`chatMention`, `isBrowsing`) | Main-loop turn texts; user presses; session only, never persisted |
| Remembered selection | `persistence.mjs` (`companion-state.json`, unchanged schema) | User picks, as today |
| Display state during a turn | `state.mjs` (`displayState`) | Run-derived mood |
| Panel drawing, return control, footer sizing | `register.mjs` (`body`), `view.mjs` (origin text) | View model; pane props `bodyRows`, `bodyColumns` |
| Status line and toasts | `notice.mjs` with `register.mjs` (`announce`) | Run-derived state of the run shown without browsing |
| Texts | `locales.json` | Locale packs |

## 3. Architecture Decisions

- SDD-01: Recognize a named run as a whole token. `assignment.mjs` exports `namedRun(text, openIds)`: for every open run id it finds each occurrence in the text whose neighbours are not id characters (letters, digits, `.`, `_`, `-`), and returns the id whose occurrence ends last, or null; only active runs take part, so a completed, superseded or abandoned run never becomes the chat run by a mention; a text that is no string, or empty, yields null; the scan covers at most the last 65,536 characters of a text; rationale: AC-001 asks for whole tokens and "last named wins"; consequence: an id inside a longer id never matches, and a status card that names its run counts.
- SDD-02: Keep the chat signal in session memory and order it by time. `register.mjs` keeps `session.chatMention = { runId, at }`; a main-loop `turn.start` sets it from `e.text` and a main-loop `turn.complete` from the `text` that `next(e)` returns, each only when `namedRun` finds an open run, with `at` from `$.clock.now()`; subagent turns (`e.agentId` set) are ignored. The signal "changed in this session" stays as today (`updatedAt` of a run at or after the session start). `assignRun` compares the newest change time with `chatMention.at` and takes the later one as the chat run, origin `named` or `session`; rationale: AC-001 and the PRD ranking; consequence: the chat run lives for the session only and needs no state-file field.
- SDD-03: Extend `assignRun` as the single assignment owner. Its input gains `mention` and `isBrowsing`; its result gains `chatRunId`. Order: a chat run that is not overridden by browsing is shown with origin `named` or `session`; while browsing, or without a chat run, the remembered selection is shown with origin `selected`; otherwise none. `stepSelection` stays. `view.mjs` maps origin `named` to "Im Chat genannt" / "Named in the chat"; rationale: AC-002 and the Brownfield finding against a second rule; consequence: every existing assignment test keeps its meaning without a mention.
- SDD-04: Browse temporarily and return at the next main-loop turn. `session.isBrowsing` becomes true when the user steps or picks a run while a chat run is known; the pick is stored as the remembered selection as today. A main-loop `turn.start` sets `isBrowsing` false before it applies the prompt's mention; subagent turns leave it. The stepping row is drawn whenever a run is shown and open runs exist, no longer only outside origin `session`; rationale: AC-003 and AC-004; consequence: browsing never outlives a chat turn, and without a chat run browsing works exactly as today.
- SDD-05: Offer the return control only while it can act. When the view's `chatRunId` is known and differs from the shown run, `body` draws a plain Button with key `chat-return` and label "Zurück zum Chat-Run" / "Back to chat run" below the stepping row, and the footer menu gains the first entry `chat` with the same label; both set `isBrowsing` false and redraw; rationale: AC-005; consequence: neither appears while the chat run is shown or without a chat run.
- SDD-06: Let status line and toasts observe the run shown without browsing. `announce` calls `observedRun` with the same snapshot, selection and mention and with `isBrowsing` false, so browsing never changes the status line or raises a toast for a browsed run; without a chat run the result equals the shown run as today; rationale: AC-006; consequence: the transition detector keeps one observed run per session.
- SDD-07: Let "waiting" through the turn overlay. `displayState` keeps a derived `wartet` (approval or decision) and `baut` during an active main-loop turn and shows `laeuft` with reason `turnActive` for every other derived mood; `blockiert` keeps the overlay; rationale: AC-007 and the PRD precedence decision; consequence: panel and status line name the same state for a waiting run.
- SDD-08: Size the desktop body with the smallest reserve that shows no scrollbar. The root Box's `minHeight` becomes the pane's `bodyRows` less a reserve; the TP's early live probe tries reserves of 0, 0.25 and 0.5 rows in the narrow and the widened pane and selects the smallest without a scrollbar; if the desktop honors only whole rows, the reserve stays one row and the result is recorded as the observed limit. `listCapacity` uses the same reserve; rationale: AC-008; consequence: no new layout mechanism, one constant changes.
- SDD-09: Add the texts. `locales.json` gains `origin.named` and `actions.backToChat` in English and German; rationale: AC-002 and AC-005 name the origin and the control; consequence: no other text changes.
- SDD-10: Adopt the delivered panel unchanged. The footer, menu, About, sized list and gate bars of commits `3444befe` and `2f54fbcc` stay as committed; their adapter tests stay, and the live screenshots of 2026-10-28 move into this run's evidence folder; rationale: AC-009; consequence: no rework of delivered parts.
- SDD-11: Keep the companion observation-only and failure-isolated. Recognition runs inside the existing catch paths of the turn hooks and never delays `next(e)`; the turn hooks still pass their events on; the only write stays the companion state file; rationale: AC-010; consequence: a failing recognition leaves the chat run as it was.
- SDD-12: Prove and document. The companion suites grow per section 6; `INSTALL.md` describes the chat run, browsing, return, waiting rule and the panel of 2026-10-28 with separated evidence; the plugin and compatibility records are regenerated; rationale: AC-011 and AC-012; consequence: the evidence plan in section 6 and the documentation diff are reviewed in Code Review.

## 4. Integration Points

- Claude Code mod API 2.1.308: `turn.start` input `text` and `agentId`; `turn.complete` result `{ text }` from `next(e)` for the main loop; `$.clock.now()`; pane props `bodyRows` and `bodyColumns`. No new host call.
- Core: none; the companion keeps reading `RUN_STATE.md` through its parser.

## 5. Constraints And Compatibility

- The state file keeps schema 1 and its fields; older companion versions read it unchanged.
- Existing assignment behavior is the special case "no mention": tests that pass no mention keep their results.
- The answer text at `turn.complete` on the desktop is declared, not observed; without it, recognition works from prompts and changes only, which the TP probe reports.
- The early-access mod API may change between Claude Code releases; the native checks run on the final tree.

## 6. Test And Evidence Strategy

Risk sits in the assignment rule (many signal combinations), in text recognition (lists and prefixes) and in two unobserved host facts (answer text, sub-row sizing). Reuse first: the logic suite already builds canonical fixtures and tests `assignRun`; the adapter suite already fires `turn.start` and `turn.complete` on a fake host and renders every surface.

- Logic suite (`claude-companion-test.js`): `namedRun` for whole tokens, shared prefixes, lists (last named wins), completed and unknown ids, non-string and long texts; `assignRun` for every combination of mention, change, selection and browsing, with origins and `chatRunId`; `displayState` for every mood during a turn.
- Adapter suite (`claude-companion-adapter-test.js`): main-loop and subagent turns with prompt and answer texts; browsing from the chat run and automatic return; the return control in panel and menu, present and absent; status line and toasts while browsing; root `minHeight` with the chosen reserve; the delivered panel tests stay.
- Native: `claude plugin validate` and `claude plugin test` with a prompt that names a run.
- Run evidence: `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` and the companion suites.
- Live (TP probe first, final live check later): the answer text reaching `turn.complete`, the body reserve without a scrollbar, then recognition, return control, automatic return, waiting during an open approval question and the footer with dated screenshots.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Whole-token recognition in main-loop prompt and answer; the later of mention and change sets the chat run | `assignment.mjs` `namedRun`, session memory | SDD-01, SDD-02 | Answer text unobserved on the desktop until the probe |
| AC-002 | `assignRun` shows the chat run with origin named or session | `assignment.mjs`, `view.mjs`, `locales.json` | SDD-03, SDD-09 | none without a mention |
| AC-003 | Stepping row for every shown run; a pick sets browsing and stores the selection | `register.mjs`, `persistence.mjs` | SDD-04 | none |
| AC-004 | Main-loop `turn.start` ends browsing; subagent turns do not | `register.mjs` | SDD-04 | none |
| AC-005 | Return button below the stepping row and first menu entry while another run is shown | `register.mjs`, `locales.json` | SDD-05, SDD-09 | Menu entry count changes only while browsing |
| AC-006 | Status line and toasts observe the run shown without browsing | `notice.mjs`, `register.mjs` | SDD-06 | none |
| AC-007 | `displayState` keeps wartet and baut during a turn | `state.mjs` | SDD-07 | The recording turn shows wartet until written |
| AC-008 | Smallest body reserve without a scrollbar, chosen by live probe | `register.mjs` | SDD-08 | Whole-row fallback if fractions are ignored |
| AC-009 | Delivered panel kept; tests and screenshots adopted | Companion modules at `2f54fbcc` | SDD-10 | none |
| AC-010 | Recognition inside catch paths; single write site | `register.mjs` | SDD-11 | none |
| AC-011 | Suites, native checks, regeneration and live check | Test suites, generators | SDD-12 | Native evidence goes stale with Claude Code updates |
| AC-012 | `INSTALL.md` companion section | `INSTALL.md` | SDD-12 | none |

## 8. Risks And Open Questions

- The desktop may not hand the answer text to `turn.complete`; the TP probes it first, and the companion then still recognizes prompts and changes.
- Fractional body sizing may be ignored; the whole-row reserve remains and is reported.
- A mention in passing can select an unexpected chat run; browsing and the next mention correct it.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Recognition rule | before_sd | resolved | SDD-01: whole-token match against active run ids, last occurrence wins, scan of the last 65,536 characters | Arndt Gold, SD Owner |
| Chat signal and ordering | before_sd | resolved | SDD-02: session memory `chatMention` from main-loop prompt and answer; the later of mention and change wins | Arndt Gold, SD Owner |
| Assignment owner | before_sd | resolved | SDD-03: `assignRun` extended with `mention`, `isBrowsing` and `chatRunId`; no second rule | Arndt Gold, SD Owner |
| Browse and automatic return | before_sd | resolved | SDD-04: browsing in session memory, ended by a main-loop turn start; stepping row for every shown run | Arndt Gold, SD Owner |
| Return control | before_sd | resolved | SDD-05: plain button below the stepping row and first footer-menu entry, only while another run is shown | Arndt Gold, SD Owner |
| Status line and toasts | before_sd | resolved | SDD-06: observe the run shown without browsing | Arndt Gold, SD Owner |
| Overlay rule | before_sd | resolved | SDD-07: wartet and baut pass the turn overlay, blockiert does not | Arndt Gold, SD Owner |
| Body sizing | before_sd | resolved | SDD-08: smallest reserve of 0, 0.25 or 0.5 rows without a scrollbar, chosen by live probe, whole-row fallback | Arndt Gold, SD Owner |
| Delivered panel | before_sd | resolved | SDD-10: kept as committed, evidence adopted | Arndt Gold, SD Owner |
| Probe order and scenario mapping | later_tp | open | Probe the answer text and the body reserve before CD+Tests; map every criterion and SDD to tasks and scenarios | TP author through gate-check |

## 9. Next Step

Review this solution design and approve only with `Approval: SD`. Valid approval permits Task/Test Plan authoring; implementation still requires the approved TP and implementation-preparation Brownfield Analysis.

## Source and Derivation Evidence

- Approved PRD (`PRD.md`, sha256:6b164fb6d94eb9fc6834bd483132573e519da95faadbfb2b2128f882a9aed4f1), `BROWNFIELD_REVIEW.md` and `UX_INTENT_DEFINITION.md` of this run.
- Inspected code: `assignment.mjs:1-32`, `register.mjs:180-300,340-389`, `state.mjs:39-43`, `view.mjs:36-62`, `notice.mjs` (`observedRun`), `persistence.mjs`, `locales.json`.
- Claude Code 2.1.308 mod API declaration (bundled `claude-code.d.ts`, read 2026-10-28): `TurnStartInput.text`, `TurnCompleteResult.text`, `SiteScroll.bodyRows`, `BoxProps.minHeight` in cells.
- Live probe of 2026-10-28: a whole-row `minHeight` sizes the body, a percentage does not; `bodyRows` exactly overflowed by a few pixels.

## AGDF Approval Summary (de; source=en)

- Rahmen: Alles bleibt im gelieferten Claude-Begleiter, seinen Tests, `INSTALL.md` und den neu erzeugten Nachweisen; Manifest, Hooks, Copilot-Payload, Kern und `RUN_STATE.md`-Format bleiben unverändert, und es kommt kein Hook hinzu.
- Erkennung: Eine neue Funktion `namedRun` in `assignment.mjs` sucht in Prompt und Antwort der Haupt-Turns die IDs aktiver Runs als ganzes Wort (Nachbarzeichen keine ID-Zeichen) und nimmt die zuletzt genannte; abgeschlossene Runs zählen nicht, geprüft werden höchstens die letzten 65.536 Zeichen (SDD-01). Die Nennung liegt nur im Sitzungsspeicher, mit Uhrzeit; der jüngere Hinweis von Nennung und Änderung bestimmt den Chat-Run, Subagent-Turns zählen nicht (SDD-02).
- Zuordnung: `assignRun` bleibt der einzige Zuständige und bekommt Nennung, Blättern und die Chat-Run-ID; ohne Blättern zeigt er den Chat-Run mit Herkunft „Im Chat genannt“ oder „In dieser Sitzung geändert“, beim Blättern die gespeicherte Auswahl (SDD-03).
- Blättern und Rücksprung: Blättern gilt im Sitzungsspeicher und endet beim nächsten Haupt-Turn; die Auswahl wird wie heute gespeichert; die Blätter-Buttons erscheinen bei jedem gezeigten Run (SDD-04). „Zurück zum Chat-Run“ steht als schlichter Button unter den Blätter-Buttons und als erster Menüeintrag, nur solange ein anderer Run gezeigt wird (SDD-05).
- Statuszeile, Warten, Höhe: Statuszeile und Meldungen beobachten den Run ohne Blättern (SDD-06). Während eines Turns bleiben „wartet“ und „baut“ sichtbar, „blockiert“ zeigt weiter „läuft“ (SDD-07). Die Mindesthöhe des Inhalts wird mit der kleinsten Reserve ohne Scrollleiste bemessen, per Live-Probe aus 0, 0,25 und 0,5 Zeilen gewählt, sonst bleibt eine ganze Zeile (SDD-08).
- Texte, Grundlage, Isolation, Nachweise: neue Texte für die Herkunft und den Rücksprung (SDD-09); das gelieferte Panel bleibt wie committet, Tests und Screenshots werden übernommen (SDD-10); die Erkennung läuft in den Fangpfaden und verzögert nichts, einzige Schreibstelle bleibt die Zustandsdatei (SDD-11); Suiten, native Prüfungen, neu erzeugte Nachweise und `INSTALL.md` (SDD-12).
- Zuordnung zu den Kriterien: AC-001 bis AC-012 sind je genau einmal Designentscheidungen zugeordnet. Offen für den TP bleiben die Reihenfolge der Probe (Antworttext und Höhenreserve vor CD+Tests) und die Zuordnung von Aufgaben und Szenarien.
