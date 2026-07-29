# Task And Test Plan: Structured Depth Positioning auf AGDF Pages

## Plan Meta

- work item: `agdf-pages-structured-depth-positioning`
- derived_from: `PRD.md`, `SD.md`
- mode: `structured_slice`
- gate: TP
- gate approval: `Approval: TP`
- approval date: 2026-07-29
- date: 2026-07-29

## 1. Implementation Tasks

| Task ID | Task | Acceptance mapping | Evidence |
|---|---|---|---|
| SDP-01 | Ersetze in `pages/src/data/site.ts` die nicht-kanonischen Labels in `gateModeMatrix` durch kanonische Modewerte (`Quick Task / Compact Delivery`, `Narrow Bug Track`, `Structured Slice`, `Structured Delivery`, `Blocked / Depth Unresolved`); füge einen `Verified Change`-Eintrag hinzu; aktualisiere `decision`-Texte auf wirkungsbasierte Semantik, Proxy-Verbot und `depth_unresolved`. | PRD-01, PRD-02, PRD-03, PRD-07, PRD-08; AC-01, AC-02, AC-03, AC-07, AC-08 | Data diff and content review |
| SDP-02 | Füge in `pages/src/data/site.ts` die neue `depthChoice`-Datenstruktur hinzu: `modesContractOwner`, `projection`, `compactPaths`, `structuredPaths` (mit `sharedGateChain`, `sliceVsDelivery`, `structuredSlice.boundedChecks`, `structuredDelivery.fullDepthFamilies`), `depthUnresolved`, `proxyProhibition`. | PRD-01, PRD-04, PRD-05, PRD-06, PRD-07, PRD-08, PRD-09; AC-01, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09 | Data diff and structure review |
| SDP-03 | Ersetze in `pages/src/data/site.ts` `requirementPaths[2]` „Controlled Delivery" durch zwei kanonische Einträge (`Structured Slice`, `Structured Delivery`) oder ergänze Verified Change als sichtbare fünfte Karte; stelle sicher, dass Verified Change als separater maschinenvalidierter Pfad sichtbar ist. | PRD-02, PRD-03; AC-02, AC-03 | Data diff and rendered inspection |
| SDP-04 | Erweitere in `pages/src/data/site.ts` `gateMapPaths.structured` um `depthHint`-Text, der erklärt, dass Structured Slice und Structured Delivery dieselbe Gate-Kette mit unterschiedlicher Artefakttiefe verwenden. | PRD-04; AC-04 | Data diff and rendered inspection |
| SDP-05 | Aktualisiere in `pages/src/data/site.ts` `workflowSteps[2].desc` und `gateFlow[2].desc`, um `verified_change` und `depth_unresolved` zu nennen. | PRD-02; AC-02 | Data diff |
| SDP-06 | Rendere in `pages/src/pages/index.astro` die neue Section `#depth-choice` „How AGDF chooses depth" zwischen `#intake` und `#workflow` mit `depthChoice`-Daten: Compact-vs-Structured-Vergleich, Shared-Gate-Chain-Hinweis, sechs Wirkungsfamilien als Badge-Liste, sieben Bounded-Slice-Checks als nummerierte Liste, Depth-Unresolved-Block, Proxy-Verbot-Block, Modes-Contract-Abgrenzung-Footer. Wiederverwendung vorhandener `.surface`/Grid/`data-reveal`-Patterns. | PRD-01, PRD-05, PRD-06, PRD-07, PRD-08, PRD-09, PRD-11, PRD-12; AC-01, AC-05, AC-06, AC-07, AC-08, AC-09, AC-11, AC-12 | Template diff and rendered inspection |
| SDP-07 | Präzisiere in `pages/src/pages/index.astro` die Gate-Map-Section (`#gate-flow`): füge unter `gateMapPaths.structured` den `depthHint`-Text als Hinweis-Block hinzu. | PRD-04; AC-04 | Template diff and rendered inspection |
| SDP-08 | Stelle sicher, dass `gateModeMatrix` nicht als separate parallele Struktur gerendert wird; kanonische Werte fließen in `depthChoice` und `requirementPaths` ein. | PRD-09; AC-09 | Template and data diff review |

## 2. Verification Tasks

| Task ID | Verification | Acceptance mapping | Evidence |
|---|---|---|---|
| SDP-09 | Inspect rendered `#depth-choice`-Section: kanonische Modewerte, sechs Wirkungsfamilien, sieben Bounded-Slice-Checks, `depth_unresolved` als `block`, Proxy-Verbot, Modes-Contract-Abgrenzung sichtbar. | PRD-01, PRD-05, PRD-06, PRD-07, PRD-08; AC-01, AC-05, AC-06, AC-07, AC-08 | Rendered Pages inspection |
| SDP-10 | Inspect rendered Gate-Map: `depthHint`-Hinweis sichtbar; Structured Slice und Structured Delivery zeigen gleiche Gate-Kette mit Tiefenunterschied. | PRD-04; AC-04 | Rendered Pages inspection |
| SDP-11 | Inspect rendered `requirementPaths`: Verified Change sichtbar, „Controlled Delivery" ersetzt. | PRD-02, PRD-03; AC-02, AC-03 | Rendered Pages inspection |
| SDP-12 | Review data diff: `gateModeMatrix` kanonisch oder durch `depthChoice` ersetzt, keine parallele Struktur. | PRD-09; AC-09 | Data diff review |
| SDP-13 | Responsive Browserprüfung: Desktop, Tablet, mobile viewport; Vergleichsfläche auf kleinen Screens lesbar (Spalten stapeln unter `sm`, Badge-Listen `flex-wrap`). | PRD-11; AC-11 | Visible browser evidence (multiple viewports) |
| SDP-14 | Accessibility-Prüfung: Tastatur-Tab-Reihenfolge, Kontrast (bestehende Dark-Theme-Palette), semantisches HTML (`<section>`, `<h2>`/`<h3>`, `<ul>`/`<ol>`, `<span>`). | PRD-11; AC-11 | Accessibility inspection |
| SDP-15 | Run `npm --prefix pages run check` (astro check). | PRD-12; AC-12 | Command result |
| SDP-16 | Run `npm --prefix pages run build` (astro build). | PRD-10, PRD-12; AC-10, AC-12 | Command result and build output |
| SDP-17 | Verify `evaluationEvidence.ts` bleibt repository-derived; keine Live-Host-Evidenz behauptet; Build-Zeit-Validierung erhalten. | PRD-10; AC-10 | `evaluationEvidence.ts` and build output |
| SDP-18 | Run `git diff --check`. | PRD-12; AC-12 | Clean diff-check |
| SDP-19 | Run `node ~/.config/opencode/agdf/bin/agdf-local.js doctor --json`. | PRD-12; AC-12 | JSON result |

## 3. Implementation Order

1. SDP-01: `gateModeMatrix` kanonisch ersetzen und `Verified Change`-Eintrag hinzufügen.
2. SDP-02: `depthChoice`-Datenstruktur hinzufügen.
3. SDP-03: `requirementPaths` kanonisch erweitern.
4. SDP-04: `gateMapPaths.structured` mit `depthHint` erweitern.
5. SDP-05: `workflowSteps` und `gateFlow` aktualisieren.
6. SDP-06: Neue Section `#depth-choice` in `index.astro` rendern.
7. SDP-07: Gate-Map-Section mit `depthHint`-Hinweis präzisieren.
8. SDP-08: Sicherstellen, dass keine parallele `gateModeMatrix`-Struktur gerendert wird.
9. SDP-09 through SDP-19: Verification (Render-Inspection, Responsive, Accessibility, Build, Doctor, Diff).

## 4. Test Plan

1. Assert `gateModeMatrix` enthält kanonische Modewerte und `Verified Change`-Eintrag.
2. Assert `depthChoice` enthält `compactPaths` (2), `structuredPaths` mit `sharedGateChain`, `structuredSlice.boundedChecks` (7), `structuredDelivery.fullDepthFamilies` (6), `depthUnresolved`, `proxyProhibition`.
3. Assert `requirementPaths` enthält Verified Change sichtbar; „Controlled Delivery" ist nicht mehr vorhanden.
4. Assert `gateMapPaths.structured` enthält `depthHint`.
5. Assert `workflowSteps[2].desc` und `gateFlow[2].desc` nennen `verified_change` und `depth_unresolved`.
6. Assert `#depth-choice`-Section rendert: Modes-Contract-Abgrenzung, Compact-vs-Structured-Vergleich, Wirkungsfamilien, Bounded-Slice-Checks, Depth-Unresolved, Proxy-Verbot.
7. Assert Gate-Map rendert `depthHint`-Hinweis.
8. Assert keine parallele `gateModeMatrix`-Tabelle gerendert wird.
9. Run `npm --prefix pages run check` und `npm --prefix pages run build`.
10. Run `node ~/.config/opencode/agdf/bin/agdf-local.js doctor --json` und `git diff --check`.

## 5. Risk Coverage

| Risk | Covered by |
|---|---|
| `depthChoice` und `gateModeMatrix` duplizieren sich | SDP-02, SDP-08, SDP-12 |
| Vergleichsfläche wird zu detailliert für Marketingseite | SDP-02, SDP-06, SDP-09 |
| Responsive Darstellung auf kleinen Screens unleserlich | SDP-06, SDP-13 |
| `requirementPaths` mit fünf Karten bricht bestehendes Layout | SDP-03, SDP-11, SDP-13 |
| Kanonische Modewerte fehlen oder sind inkonsistent | SDP-01, SDP-02, SDP-09, SDP-12 |
| Modes-Contract-Abgrenzung fehlt | SDP-02, SDP-06, SDP-09 |
| `depth_unresolved` nicht als `block` erklärt | SDP-01, SDP-02, SDP-09 |
| Proxy-Verbot nicht sichtbar | SDP-02, SDP-06, SDP-09 |
| Eval-Zahlen inkonsistent nach Corpus-Erweiterung | SDP-16, SDP-17 |
| Accessibility-Mängel (Kontrast, Tastatur, semantisches HTML) | SDP-06, SDP-14 |
| Build oder doctor schlägt fehl | SDP-15, SDP-16, SDP-19 |
| Unintended Files/Scope ändern sich | SDP-18, SDP-19 |

## 6. Guardrails

- Keine Änderung an `plugin/**`, `create-agdf/**`, `evals/**`, Runtime-Contracts, Skills oder ausführbarem Code.
- Keine neue Route, kein neues Komponentensystem, kein neuer Runtime-Entscheidungspunkt.
- Keine zweite Produktpolicy in Pages; Modes Contract bleibt alleiniger Owner.
- Keine Behauptung garantierter semantischer Modellbefolgung auf Live-Hosts.
- Kein VCS, Deploy, Release oder Reinstall.
- Jede fehlschlagende Build/Visual/Doctor/Diff-Prüfung erfordert `revise`/`block`, keine silent acceptance.
- `evaluationEvidence.ts` nur Konsistenzprüfung, keine semantische Änderung.

## 7. Completion Evidence

Die Slice ist vollständig nur, wenn SDP-01 through SDP-19 traceable Evidence haben, die gerenderte `#depth-choice`-Section lesbar und kohärent ist, die Gate-Map präzisiert ist, `requirementPaths` Verified Change sichtbar macht, keine parallele Struktur existiert, Responsive- und Accessibility-Signale erfüllt sind und der finale Diff auf die genehmigte Pages-Content-/Kompositionsgrenze beschränkt bleibt.

## 8. Required Next Step

Diesen Task/Test Plan prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: TP`

Danach folgt pre-implementation Brownfield Analysis (interner Schritt), dann CD+Tests. Es ist noch keine Implementierung erlaubt.
