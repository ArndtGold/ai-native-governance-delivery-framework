# Produkt-Mocks für menschliche Gates

Diese v2-Serie setzt das gemeinsame Gate-Kartenmodell in lesbaren, produktnahen
Architektur-Mocks um. Sie wurde am 13. Oktober 2026 als handgeführte SVG-Serie erstellt.
Die Dateien sind keine Screenshots und keine Aussage über eine bereits ausgelieferte oder
nativ qualifizierte Host-Integration.

## 1 Kartenanatomie

Datei: `gate-card-anatomy-v2.svg`

![Anatomie einer menschlichen Gate-Karte](gate-card-anatomy-v2.svg)

Der gemeinsame Rahmen standardisiert Orientierung, Entscheidungswirkung, Hauptaktion und
technische Bindung. Der fachliche Mittelteil bleibt gate-spezifisch.

## 2 Gate-spezifische Karten

### UR und PRD

Datei: `gate-cards-ur-prd-v2.svg`

![Gate-Karten für UR und PRD](gate-cards-ur-prd-v2.svg)

UR verwendet Ziel und Scope. PRD verwendet Verhalten, Akzeptanzkriterien und offene
Produktentscheidungen.

### SD und TP

Datei: `gate-cards-sd-tp-v2.svg`

![Gate-Karten für SD und TP](gate-cards-sd-tp-v2.svg)

SD stellt gewählten Ansatz, Alternative, Risiko und Fallback gegenüber. TP zeigt messbare
Kriterien- und Designabdeckung, Aufgaben sowie Nachweisplanung.

### QA und UAT

Datei: `gate-cards-qa-uat-v2.svg`

![Gate-Karten für QA und UAT](gate-cards-qa-uat-v2.svg)

QA führt mit technischer Qualitätsentscheidung und Evidenz. UAT führt mit geliefertem und
bewusst nicht geliefertem Umfang sowie Restrisiken.

## 3 Darstellungs- und Hostzustände

Datei: `presentation-formats-responsive-v2.svg`

![Große MCP-App, kompakte MCP-App und Portable Markdown](presentation-formats-responsive-v2.svg)

Die exakte Chat-Antwort erscheint nur dort prominent, wo sie tatsächlich benötigt wird:
bei unqualifiziertem Klickweg oder Portable-Markdown-Fallback. Ein qualifizierter nativer
Klick verwendet dieselbe Bindung, ohne die technische Formel in die Hauptansicht zu ziehen.

## 4 QA-Abweichung und UAT

Datei: `qa-deviation-uat-v2.svg`

![Vertikaler QA-Abweichungsfluss bis UAT](qa-deviation-uat-v2.svg)

Der vertikale Aufbau bleibt in Dokumentation und schmalen Hostflächen lesbar. Technisches
`revise`, menschliche Abweichungsannahme und UAT-Abnahme behalten eigene Aussagen und Wirkungen.

## 5 Recovery

Datei: `recovery-states-v2.svg`

![Recovery-Zustände für menschliche Gate-Entscheidungen](recovery-states-v2.svg)

Die Serie zeigt geänderte Fassung, unklaren Speicherstatus und den sichtbaren Wechsel zu
Portable Markdown. Jeder Zustand besitzt genau eine sichere nächste Handlung und keine
Erfolgsgestalt.

## Darstellungsgrenzen

- Die SVGs zeigen Informationshierarchie, Zustände und fachliche Komponenten, nicht die
  endgültige Pixelumsetzung.
- Die Produktumsetzung verwendet vorhandene Tokens, Komponenten und Host-Adapter.
- Beispieldaten ersetzen keine gebundene Präsentation eines realen Runs.
- Buttons belegen weder Verfügbarkeit noch Qualifizierung eines nativen Entscheidungswegs.
- Die v1-SVGs bleiben als frühere semantische Systemübersicht erhalten und sind nicht die
  aktuelle visuelle Referenz.
