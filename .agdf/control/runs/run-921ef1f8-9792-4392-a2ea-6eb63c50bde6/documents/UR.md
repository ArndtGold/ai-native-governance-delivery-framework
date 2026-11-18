# UR: Status card path marks only one current gate

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-11
Owner: Arndt Gold

## 1. Problem

The status card path of a run can mark two entries as current at once. In the companion pane of the test run `begleiter-ur-test` the gate bar reads `●UR ●Compact Delivery` while the run still waits for the UR approval. The cause is in `buildBreadcrumbPath` (`packages/core/lib/control-evaluation/gate-check.js`): the route entries `Compact Delivery`, `Verified Change` and `Block` are marked current whenever their route is selected, regardless of the current gate. With route `quick_task`, current gate `UR` and no UR approval the card yields `UR:current Compact Delivery:current`; this was reproduced with `buildStatusCard`.

## 2. Goal

The path of a status card never shows more than one current entry: while an earlier gate of the path is the current gate, the route entry after it is open.

## Affected Users

Everyone who reads the status card path: users of the Markdown status card in the chat, of the AGDF Companion gate bar in Claude, and of other consumers of the run view.

## 3. Scope

- `buildBreadcrumbPath`: a route entry (`Compact Delivery`, `Verified Change`, `Block`) is marked current by its route only when no earlier entry of the path is the current gate; otherwise it is open.
- A test for the three routes with current gate `UR` and an unapproved UR, and for the unchanged cases (route entry current after the UR approval, fulfilled at OR).
- Regenerated status card golden file and dependent baselines where the change requires it.

## 4. Non-Goals

- No change to gate rules, approvals, the current gate or the next step.
- No change to the companion gate bar code, which draws the card's path as is.
- No change to the two navigation buttons shown for a single open run.
- No investigation of how the test run `begleiter-ur-test` reached its state.

## 5. Acceptance Signals

- A test with route `quick_task`, current gate `UR` and an unapproved UR fails on the current code with two current entries and passes after the fix with `UR:current`, `Compact Delivery:open`; likewise for `verified_change` and `block`.
- Existing status card, run view and companion tests pass; the golden comparison passes.

## 6. Existing Source Of Truth

- `packages/core/lib/control-evaluation/gate-check.js` (`BREADCRUMB_PATH_TEMPLATES`, `buildBreadcrumbPath`, `buildStatusCard`).
- `packages/core/test/status-card-golden-test.js` with `packages/core/test/fixtures/companion/status-card-golden.json`.
- The companion gate bar `plugins/agdf/host-templates/claude/companion/gate-bar.mjs`, which maps the card's path states.

## 7. Risks And Unknowns

- In the normal flow the route is recorded after the UR approval, so the defect shows only when the UR is unapproved while a route is already stored (a fixture, or a UR reopened after routing). Which of these applies to `begleiter-ur-test` is unknown.
- A consumer could rely on the route entry being current while the UR is open; none is known.
- A change under `packages/core` ships in the Copilot payload, so the exact payload baseline and the compatibility evidence may need to be updated.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Der Pfad der Statuskarte kann zwei Einträge gleichzeitig als aktuell markieren. Im Companion-Pane des Testruns `begleiter-ur-test` steht `●UR ●Compact Delivery`, obwohl der Run noch auf die UR-Freigabe wartet. Ursache ist `buildBreadcrumbPath` in `packages/core/lib/control-evaluation/gate-check.js`: Die Routen-Einträge `Compact Delivery`, `Verified Change` und `Block` gelten als aktuell, sobald ihr Lieferweg gewählt ist, unabhängig vom aktuellen Gate. Das Verhalten ist mit `buildStatusCard` nachgestellt.

Ziel: Der Pfad einer Statuskarte zeigt nie mehr als einen aktuellen Eintrag. Solange ein früheres Gate des Pfads das aktuelle ist, bleibt der Routen-Eintrag dahinter offen.

Betroffene Nutzer: alle, die den Pfad der Statuskarte lesen, also Nutzer der Markdown-Statuskarte im Chat, der Gate-Leiste des AGDF Companion in Claude und anderer Abnehmer der Run-Ansicht.

Umfang: die Regel in `buildBreadcrumbPath` für die drei Routen-Einträge; ein Test für die drei Lieferwege mit aktuellem Gate `UR` und nicht freigegebenem UR sowie für die unveränderten Fälle; neu erzeugte Golden-Datei der Statuskarte und abhängige Baselines, soweit die Änderung sie erfordert.

Nicht-Ziele: keine Änderung an Gate-Regeln, Freigaben, aktuellem Gate oder nächstem Schritt; keine Änderung am Code der Companion-Gate-Leiste; keine Änderung an den beiden Navigationsschaltflächen bei nur einem offenen Run; keine Untersuchung, wie der Testrun `begleiter-ur-test` in seinen Zustand kam.

Akzeptanzsignale: Ein Test mit Lieferweg `quick_task`, aktuellem Gate `UR` und nicht freigegebenem UR schlägt auf dem heutigen Code mit zwei aktuellen Einträgen fehl und läuft nach der Korrektur mit `UR:current`, `Compact Delivery:open` durch, ebenso für `verified_change` und `block`. Die bestehenden Tests zu Statuskarte, Run-Ansicht und Companion sowie der Golden-Vergleich laufen durch.

Quellen: `packages/core/lib/control-evaluation/gate-check.js`, der Golden-Test `packages/core/test/status-card-golden-test.js` mit seiner Golden-Datei und die Companion-Gate-Leiste `gate-bar.mjs`.

Risiken und offene Punkte: Im normalen Ablauf wird der Lieferweg erst nach der UR-Freigabe erfasst; der Fehler zeigt sich nur bei offenem UR und bereits gespeichertem Lieferweg. Welcher Fall beim Testrun vorliegt, ist unbekannt. Ein Abnehmer könnte sich auf den aktuellen Routen-Eintrag bei offenem UR verlassen; bekannt ist keiner. Die Änderung im Core geht in die Copilot-Payload ein, sodass die exakte Payload-Baseline und die Kompatibilitätsbelege angepasst werden müssen.

Nächster Schritt: Dieses UR prüfen und nur mit `Approval: UR` freigeben.
