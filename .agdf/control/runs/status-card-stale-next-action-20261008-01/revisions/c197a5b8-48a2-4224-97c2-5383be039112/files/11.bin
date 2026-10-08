# UR: Stale next step after internal step recording

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: status-card-stale-next-action-20261008-01
Language: en

## 1. Problem

After an internal step such as Brownfield Analysis is recorded, the run keeps showing and acting on a next step that belongs to the previous gate. Observed on run `agdf-cockpit-claude-host-20261008-01`: its Artefacts table records `Brownfield Analysis | done | pre_implementation_analysis; decision pass`, and the gate evaluation correctly moves the run to `CD+Tests`. The persisted header still says `current_gate: Brownfield Analysis`, and `next_allowed_action` still reads "Run Brownfield Analysis for the approved TP scope before CD+Tests." This text dates from the TP approval (revision 13).

This has two consequences:

- **Inconsistent status card.** The card shows the gate and the allowed and forbidden lists for `CD+Tests`, but its "next step" asks for the Brownfield Analysis that is already done. This misled both the user and the agent in this conversation.
- **Stalled delivery.** `continue_delivery` stops at a terminal status card. The implementation continuation in `packages/core/lib/skill-dispatch/service.js:474-476` requires the evaluated `CD+Tests` text exactly. The stale persisted text fails that check, so the run cannot continue into implementation through the governed route.

Three code paths combine to cause this, all observed in the current code:

- **Write path.** `run-update` (`recordRunRevision`, `packages/core/lib/control-state/run-recording.js:84-114`) re-seals hand-edited content without recomputing `current_gate`, `next_allowed_action` or the Current Control State rows. No `run-step` kind exists for the internal steps Brownfield Analysis or CD+Tests (`RUN_STEPS` in `packages/core/lib/control-state/run-steps.js:28`), so these steps are recorded through `run-update`.
- **Read path.** `packages/core/lib/control-evaluation/delivery-map.js:228` prefers the persisted `next_allowed_action` over the freshly evaluated gate decision unless the persisted value is a placeholder.
- **Consumer.** The dispatcher compares that value against the exact evaluated text.

## 2. Goal

Every read and every routing decision uses a next step that belongs to the current evaluated gate. After an internal step is recorded through the canonical writer, the run state, the status card and the dispatcher agree, and `continue_delivery` routes to the next permitted step without manual repair.

## Affected Users

- The user who drives AGDF structured delivery runs in Claude Code or Codex and reads status cards to decide what happens next.
- The agent that follows `continue_delivery` continuations.
- Indirectly, readers of the cockpit read projection and of the master backlog, which take over `next_allowed_action`.
- Immediately affected is the active run `agdf-cockpit-claude-host-20261008-01`, which is stalled before CD+Tests.

## 3. Scope

- **Canonical recording.** Recording an internal step (Brownfield Analysis, CD+Tests) through the canonical writer leaves `current_gate`, `next_allowed_action` and the Current Control State rows consistent with the freshly evaluated gate decision.
- **Read surfaces.** The status card, the gate-check report, the dispatcher control snapshot and the cockpit read projection do not present a persisted next step that contradicts the evaluated current gate.
- **Routing.** `continue_delivery` for a structured run with a recorded Brownfield Analysis returns the implementation continuation. The same applies to an equivalent state reached through `run-update`.
- **Existing stalled runs.** Runs already persisted with a stale next step, such as `agdf-cockpit-claude-host-20261008-01`, become consistent without hand-editing `RUN_STATE.md` and without changing their approvals.
- **Tests.** Automated regression tests cover the stale case for the write path, the read path and the dispatcher continuation.
- **Copies.** Generated and plugin runtime copies are synchronized as the repository's existing sync scripts require.

## 4. Non-Goals

- No change to gate order, gate policy semantics, approval recording, approval validation or seal rules beyond what consistent derived fields require.
- No change to approved artefacts, approvals or evidence of `agdf-cockpit-claude-host-20261008-01` or any other run.
- No new user-visible gate or approval step. No automatic QA, UAT or release.
- No fix of the MCP launcher startup race (`AGDF_MCP_RUNTIME_UNOWNED` on concurrent session start) and no change to cockpit UI capability gating. Both stay separate topics.
- No plugin release, npm publication, Git commit or push in this scope.

## 5. Acceptance Signals

1. After Brownfield Analysis or CD+Tests is recorded through the canonical writer, the persisted `current_gate`, `next_allowed_action` and Current Control State rows equal the freshly evaluated gate decision. An automated test proves this.
2. No status card, gate-check report or cockpit read result shows a next step that belongs to a gate other than the displayed current gate. An automated test with a stale persisted value proves this.
3. `continue_delivery` on a structured run whose Brownfield Analysis is recorded and whose TP is approved returns the `implementation` continuation instead of a terminal status card. An automated test proves this.
4. For `agdf-cockpit-claude-host-20261008-01`, the status card shows the CD+Tests next step and `continue_delivery` returns the implementation continuation once the fixed runtime is active. No hand edit of its `RUN_STATE.md` is needed, and its approvals stay unchanged.
5. Existing core and CLI test suites pass. `doctor` stays `pass` for existing runs in this repository.

## 6. Existing Source Of Truth

- The user's request in this conversation: first fix the stale next step, before continuing the cockpit run.
- `packages/core/lib/control-evaluation/gate-policy.js:238-261`: the evaluated decisions for Brownfield Analysis and CD+Tests, including the authoritative next-step texts.
- `packages/core/lib/control-evaluation/delivery-map.js:228`: the preference for the persisted `next_allowed_action`.
- `packages/core/lib/control-state/run-recording.js:84-114`: `recordRunRevision` (`run-update`). Lines 170-192 of the same file show the approval writer, which already refreshes the derived fields.
- `packages/core/lib/control-state/run-steps.js:244-257`: the existing `run-step` refresh of the derived fields.
- `packages/core/lib/skill-dispatch/service.js:474-476` and `:490-512`: the exact-text implementation continuation and the pre-implementation analysis continuation.
- `packages/core/lib/control-evaluation/doctor.js:140` and `packages/core/lib/control-inspect/cockpit.js`: further readers of `next_allowed_action`.
- `.agdf/control/runs/agdf-cockpit-claude-host-20261008-01/RUN_STATE.md`: the observed stale state (revision 13).
- Normative contracts under `plugins/agdf/meta/contracts/` for run control, recording and continuation remain authoritative.

## 7. Risks And Unknowns

- **Intentional persisted text.** The persisted `next_allowed_action` may carry run-specific text for some states, such as closeout or blocked routes. The precedence in `delivery-map.js:228` may be intentional there. Brownfield Review must establish where a persisted value is legitimate.
- **Exact-text coupling.** Routing on exact next-step text is fragile. Other exact comparisons may exist and must be found.
- **Seals and doctor.** Refreshing derived fields inside `run-update` changes sealed content, so it must stay within the content-seal and approval-seal rules and must not create new doctor findings.
- **Installed runtime.** The installed plugin runtime (0.14.5) executes the dispatcher, so acceptance signal 4 needs the plugin reinstalled from the repository or the local CLI.
- **Recording path for internal steps.** Whether internal steps should get a dedicated canonical `run-step` kind, or `run-update` should refresh derived fields, is a solution decision for SD.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

**Problem.** Nach dem Eintragen eines internen Schritts wie der Brownfield-Analyse zeigt ein Run weiter einen nächsten Schritt aus dem vorherigen Gate an und handelt danach. Beim Run `agdf-cockpit-claude-host-20261008-01` ist die Brownfield-Analyse als erledigt eingetragen, und die Auswertung steht korrekt auf `CD+Tests`. Im Kopf des Runs stehen aber noch `current_gate: Brownfield Analysis` und der Text „Run Brownfield Analysis for the approved TP scope before CD+Tests.“ aus der TP-Freigabe. Das hat zwei Folgen:

- Die Statuskarte widerspricht sich selbst. Gate und Erlaubt/Verboten gehören zu CD+Tests, der nächste Schritt fordert die schon erledigte Analyse.
- `continue_delivery` bleibt stehen. Der Dispatcher startet die Implementierung nur, wenn der nächste Schritt genau dem ausgewerteten CD+Tests-Text entspricht (`service.js:474-476`). Der veraltete Text besteht diese Prüfung nicht.

**Ursache.** Drei Stellen wirken zusammen:

- `run-update` versiegelt hand-editierte Inhalte neu, ohne Gate, nächsten Schritt und die Tabelle „Current Control State“ neu zu berechnen (`run-recording.js:84-114`). Für die internen Schritte Brownfield-Analyse und CD+Tests gibt es keinen eigenen `run-step`, deshalb werden sie über `run-update` eingetragen.
- `delivery-map.js:228` bevorzugt den gespeicherten Text vor dem frisch ausgewerteten.
- Der Dispatcher vergleicht genau diesen Text.

**Ziel.** Jede Anzeige und jede Weiterleitung verwendet einen nächsten Schritt, der zum aktuell ausgewerteten Gate gehört. Nach dem Eintragen eines internen Schritts stimmen Run-Zustand, Statuskarte und Dispatcher überein, und `continue_delivery` geht ohne Handreparatur weiter.

**Betroffen** sind der Anwender, der AGDF-Runs in Claude Code oder Codex steuert und Statuskarten liest, und der Agent, der den Fortsetzungen folgt. Indirekt betroffen sind Cockpit und Master-Backlog, die den nächsten Schritt übernehmen. Unmittelbar betroffen ist der Cockpit-Run, der vor CD+Tests feststeckt.

**Umfang:**

- Interne Schritte, die über den kanonischen Schreibpfad eingetragen werden, hinterlassen Gate, nächsten Schritt und Kontrolltabelle passend zur frischen Auswertung.
- Statuskarte, Gate-Check-Bericht, Dispatcher und Cockpit zeigen keinen gespeicherten nächsten Schritt, der dem ausgewerteten Gate widerspricht.
- `continue_delivery` liefert nach eingetragener Brownfield-Analyse die Implementierungs-Fortsetzung.
- Bereits betroffene Runs wie der Cockpit-Run werden ohne Handbearbeitung von `RUN_STATE.md` und ohne Änderung ihrer Freigaben konsistent.
- Regressionstests decken Schreibpfad, Lesepfad und Dispatcher ab.
- Generierte und Plugin-Kopien werden mit den vorhandenen Sync-Skripten nachgezogen.

**Nicht enthalten:**

- keine Änderung an Gate-Reihenfolge, Gate-Regeln, Freigabe-Aufzeichnung, Freigabe-Prüfung oder Siegelregeln über konsistente abgeleitete Felder hinaus;
- keine Änderung an Freigaben, Artefakten oder Nachweisen bestehender Runs;
- kein neuer Freigabeschritt, kein automatisches QA, UAT oder Release;
- keine Behebung der Startup-Race im MCP-Launcher und keine Änderung an der UI-Sperre des Cockpits;
- kein Release, keine npm-Veröffentlichung, kein Commit und kein Push.

**Abnahmefähig** ist der Umfang unter fünf Bedingungen:

1. Nach dem Eintragen von Brownfield-Analyse oder CD+Tests entsprechen die gespeicherten Felder der frischen Auswertung. Ein automatischer Test belegt das.
2. Keine Statuskarte, kein Gate-Check-Bericht und kein Cockpit-Ergebnis zeigt einen nächsten Schritt aus einem anderen Gate als dem angezeigten. Ein Test mit veraltetem gespeichertem Wert belegt das.
3. `continue_delivery` liefert bei eingetragener Brownfield-Analyse und freigegebenem TP die Implementierungs-Fortsetzung statt einer abschließenden Statuskarte. Ein Test belegt das.
4. Für den Cockpit-Run zeigt die Statuskarte mit aktivem korrigiertem Laufzeitstand den CD+Tests-Schritt, und `continue_delivery` leitet zur Implementierung weiter. Dafür ist keine Handbearbeitung nötig, und die Freigaben bleiben unverändert.
5. Die bestehenden Core- und CLI-Testsuiten laufen durch, und `doctor` bleibt für die vorhandenen Runs auf `pass`.

**Maßgebliche Quellen:**

- dein Auftrag, zuerst den veralteten nächsten Schritt zu beheben;
- `gate-policy.js:238-261` mit den maßgeblichen Texten für den nächsten Schritt;
- `delivery-map.js:228`;
- `run-recording.js` mit `run-update` (Zeilen 84-114) und dem Freigabe-Schreiber, der die abgeleiteten Felder schon auffrischt (Zeilen 170-192);
- `run-steps.js:244-257`;
- `service.js:474-512`;
- die weiteren Leser in `doctor.js` und `cockpit.js`;
- der beobachtete Zustand des Cockpit-Runs;
- die Verträge unter `plugins/agdf/meta/contracts/`.

**Risiken und offene Punkte:**

- Der gespeicherte Text kann in manchen Zuständen bewusst run-spezifisch sein, etwa bei Closeout oder Blockaden. Das klärt der Brownfield Review.
- Die Weiterleitung über einen exakten Textvergleich ist fragil. Weitere solche Vergleiche müssen gefunden werden.
- Das Auffrischen in `run-update` ändert versiegelten Inhalt, muss also die Siegelregeln einhalten und darf keine neuen Doctor-Befunde erzeugen.
- Für Bedingung 4 muss das Plugin aus dem Repository neu installiert oder die lokale CLI genutzt werden.
- Ob die internen Schritte einen eigenen `run-step` bekommen oder `run-update` auffrischt, entscheidet das SD.

**Nächster Schritt.** Nach `Approval: UR` folgt der Brownfield Review mit Mode/Slice-Entscheidung.
