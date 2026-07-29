# Brownfield Analysis (Pre-Implementation): Structured Depth Positioning auf AGDF Pages

Status: done
Mode: pre_implementation_analysis
Run: `agdf-pages-structured-depth-positioning`
Date: 2026-07-29

## Decision

- decision: pass
- required_next_gate: CD+Tests
- artefact: .agdf/control/artefacts/agdf-pages-structured-depth-positioning/BROWNFIELD_ANALYSIS.md

## Scope

Pre-implementation Analyse für die genehmigten TP-Tasks SDP-01 bis SDP-19. Ziel: Reuse-Pfad, Owners, Regressionsrisiko, Test-Impact und minimalen clean Implementierungspfad verifizieren, bevor CD+Tests startet.

## Affected Tasks

| Task ID | Affected files | Existing coverage |
|---|---|---|
| SDP-01 | `pages/src/data/site.ts` (`gateModeMatrix`) | partially_done — bestehende Labels nicht-kanonisch; `Verified Change` fehlt |
| SDP-02 | `pages/src/data/site.ts` (`depthChoice` neu) | not_done — neue Datenstruktur |
| SDP-03 | `pages/src/data/site.ts` (`requirementPaths`) | partially_done — „Controlled Delivery" nicht-kanonisch; Verified Change fehlt |
| SDP-04 | `pages/src/data/site.ts` (`gateMapPaths.structured`) | partially_done — `depthHint` fehlt |
| SDP-05 | `pages/src/data/site.ts` (`workflowSteps`, `gateFlow`) | partially_done — `verified_change`/`depth_unresolved` fehlen |
| SDP-06 | `pages/src/pages/index.astro` (neue Section `#depth-choice`) | not_done — neue Section |
| SDP-07 | `pages/src/pages/index.astro` (`#gate-flow`) | partially_done — `depthHint`-Hinweis fehlt |
| SDP-08 | `pages/src/pages/index.astro`, `pages/src/data/site.ts` | not_done — sicherstellen, dass keine parallele `gateModeMatrix`-Struktur gerendert wird |

## Reuse Strategy

| Element | Strategy | Rationale |
|---|---|---|
| `gateModeMatrix` | `extend` — bestehende Objekt-Shape beibehalten, Labels und `decision`-Texte kanonisch ersetzen, `Verified Change`-Eintrag hinzufügen | Bestehende Datenstruktur ist objektkompatibel; keine neue Shape erforderlich |
| `depthChoice` | `new` — neue exportierte Konstante in `site.ts` | Keine bestehende Struktur deckt die Vergleichsfläche ab; `gateModeMatrix` allein reicht für die Render-Semantik nicht aus |
| `requirementPaths` | `extend` — bestehende Array-Shape, kanonische Einträge ersetzen/ergänzen | Bestehende drei Karten bleiben; „Controlled Delivery" wird durch kanonische Einträge ersetzt |
| `gateMapPaths.structured` | `extend` — `depthHint`-Feld hinzufügen | Bestehende Objekt-Shape um ein Feld erweitern |
| `workflowSteps`, `gateFlow` | `extend` — `desc`-Texte aktualisieren | Bestehende Objekte, nur Textänderung |
| `index.astro` `#depth-choice` | `new` — neue Section zwischen `#intake` und `#workflow` | Keine bestehende Section deckt die Vergleichsfläche ab |
| `index.astro` `#gate-flow` | `extend` — `depthHint`-Hinweis-Block hinzufügen | Bestehende Section um einen Hinweis-Block erweitern |
| Render-Patterns | `extend` — `.surface`, `.card-glow`, `.gate-node`, Grid-Patterns, `data-reveal` | SD-Section 6 definiert Wiederverwendung vorhandener Konventionen |

Keine parallelen Strukturen: `gateModeMatrix` wird nicht als separate Tabelle gerendert (SDP-08); kanonische Werte fließen in `depthChoice` und `requirementPaths` ein.

## Owners

| Owner | Responsibility | Change |
|---|---|---|
| `pages/src/data/site.ts` | Pages copy/data | `gateModeMatrix` kanonisch, `depthChoice` neu, `requirementPaths` erweitert, `gateMapPaths.structured` mit `depthHint`, `workflowSteps`/`gateFlow` aktualisiert |
| `pages/src/pages/index.astro` | Page composition | Neue Section `#depth-choice`, Gate-Map-Präzisierung |
| `pages/src/data/evaluationEvidence.ts` | Repository-derived eval evidence | Konsistenzprüfung (SDP-17); keine semantische Änderung |
| `plugin/meta/contracts/modes.md` | Canonical semantics | Read-only; keine Änderung |
| `pages/package.json` | Validation | `astro check`, `astro build` |

## Regression Risk

| Risk | Impact | Mitigation | Covered by |
|---|---|---|---|
| `gateModeMatrix`-Änderung bricht bestehende Render-Referenzen in `index.astro` | medium | `gateModeMatrix` wird nicht direkt in `index.astro` referenziert (grep bestätigt: nur Definition in `site.ts`, kein Import in `index.astro`); keine Render-Abhängigkeit | SDP-08, SDP-12 |
| `requirementPaths`-Erweiterung auf >3 Karten bricht `#intake`-Grid-Layout | medium | Bestehendes `lg:grid-cols-2`-Grid bleibt; fünfte Karte rutscht in nächste Reihe oder Verified Change wird als Hinweis in Narrow Bug Track integriert (TP SDP-03 lässt beides offen) | SDP-03, SDP-11, SDP-13 |
| Neue `#depth-choice`-Section verschiebt bestehende Anker/Navigation | low | Neue Section-ID `#depth-choice`; bestehende Anker (`#intake`, `#workflow`, `#gate-flow`) bleiben erhalten; Nav-Link optional | SDP-06, SDP-13 |
| `depthChoice`-Import bricht Type-Check | low | TypeScript-typed export; `astro check` fängt Type-Fehler | SDP-15 |
| Build schlägt fehl durch Syntax- oder Import-Fehler | low | `astro build` als Verification-Task | SDP-16 |
| `evaluationEvidence.ts`-Build-Zeit-Validierung schlägt fehl nach Corpus-Änderung | low | Keine Corpus-Änderung geplant; nur Konsistenzprüfung | SDP-17 |

## Test Impact

| Test | Impact | Evidence |
|---|---|---|
| `npm --prefix pages run check` (astro check) | muss nach Änderungen bestehen | SDP-15 |
| `npm --prefix pages run build` (astro build) | muss nach Änderungen bestehen | SDP-16 |
| `evaluationEvidence.ts` Build-Zeit-Validierung | muss unverändert bestehen; keine Corpus-Änderung | SDP-17 |
| `git diff --check` | muss clean sein | SDP-18 |
| `doctor --json` | muss pass sein | SDP-19 |
| Rendered-Pages-Inspection | neue Section und präzisierte Gate-Map sichtbar | SDP-09, SDP-10, SDP-11 |
| Responsive Browserprüfung | Vergleichsfläche auf kleinen Screens lesbar | SDP-13 |
| Accessibility-Prüfung | Tastatur, Kontrast, semantisches HTML | SDP-14 |

Keine bestehenden behavioral Tests vorhanden (Pages hat nur `astro check`/`build`); keine Test-Suite bricht.

## Parallel-Structure Risk

`gateModeMatrix` ist definiert aber wird nicht in `index.astro` gerendert (grep bestätigt: kein Import). `depthChoice` ist neu und rendert die Vergleichsfläche. Risiko der Duplikation besteht nur, wenn `gateModeMatrix` zusätzlich als Tabelle gerendert würde — SDP-08 stellt sicher, dass dies nicht passiert. Kanonische Werte fließen in `depthChoice` und `requirementPaths` ein; `gateModeMatrix` bleibt als Datenstruktur erhalten oder wird durch `depthChoice` ersetzt.

## SoT/Runtime/Product-Semantics Drift

Keine Drift-Risiken für diese Implementierung:
- `modes.md` bleibt read-only; Pages projiziert nur.
- Keine Runtime-, Contract- oder Skill-Änderung.
- Keine neue Produktpolicy in Pages.
- Drift wurde bereits in Brownfield Review inventarisiert; TP korrigiert die Public-Copy.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`, `CG-DELIVERY-PATH-SEARCH`, `CG-UX-INTENT-BEFORE-PRD`
- context_graph_required_action: none
- context_graph_gate_effect: none

## Minimal Clean Implementation Path

1. SDP-01: `gateModeMatrix` in `site.ts` kanonisch ersetzen (Labels, `decision`-Texte, `Verified Change`-Eintrag).
2. SDP-02: `depthChoice` in `site.ts` hinzufügen.
3. SDP-03: `requirementPaths` in `site.ts` kanonisch erweitern.
4. SDP-04: `gateMapPaths.structured` in `site.ts` mit `depthHint` erweitern.
5. SDP-05: `workflowSteps` und `gateFlow` in `site.ts` aktualisieren.
6. SDP-06: Neue Section `#depth-choice` in `index.astro` rendern.
7. SDP-07: Gate-Map-Section in `index.astro` mit `depthHint`-Hinweis präzisieren.
8. SDP-08: Sicherstellen, dass keine parallele `gateModeMatrix`-Struktur gerendert wird.
9. SDP-09 through SDP-19: Verification.

Keine Fallbacks, Guards, Defaults oder Shims erforderlich. Implementierung ist straightforward Daten- und Render-Änderung innerhalb des genehmigten Scopes.

## Missing Evidence

Keine. Alle Owners, Reuse-Pfade und Regressionsrisiken sind evidenced.

## Required Next Step

CD+Tests starten: SDP-01 bis SDP-08 implementieren, dann SDP-09 bis SDP-19 verifizieren. Keine Nutzeraktion erforderlich.
