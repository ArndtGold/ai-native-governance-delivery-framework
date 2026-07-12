# AGDF mit Coding-Agenten nutzen

Dieses Handbuch erklärt die praktische Zusammenarbeit mit AGDF aus Nutzersicht. Es richtet sich an
Menschen, die mit einem Coding-Agenten arbeiten möchten, ohne zuerst die CLI oder die internen
Runtime-Regeln studieren zu müssen.

AGDF ist kein Formularprozess neben der Entwicklung. Es macht sichtbar, was der Agent gerade tun darf,
welche Entscheidung beim Menschen liegt und welche Evidenz den nächsten Schritt trägt.

## Einstieg

Beginne mit dem [Schnellstart](01-schnellstart.md). Er führt durch einen vollständigen Weg vom ersten
Wunsch bis zur User Acceptance Testing (UAT).

Für einen vollständigen fachlich kritischen Brownfield-Fall dient das vorhandene
[Banking-Beispiel](../../examples/sample-banking-flow.md) als zentrale Referenz. Das Handbuch erklärt
dazu die Bedienperspektive – insbesondere exakte Freigaben, Runs und UAT – ohne den Fall zu kopieren.

Danach kannst du gezielt weiterlesen:

1. [Schnellstart](01-schnellstart.md) – erster Auftrag, User Requirement und normaler Gesprächsfluss
2. [Gates und Freigaben](02-gates-und-freigaben.md) – wann der Agent stoppt und wie Freigaben wirken
3. [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md) – Quick Task oder strukturierte Lieferung
4. [Mehrere Runs](04-mehrere-runs.md) – parallele Vorhaben, Auswahl und Lifecycle
5. [Abschluss und Auslieferung](05-abschluss-und-auslieferung.md) – Quality Assurance, User Acceptance Testing sowie Git-/Release-Grenzen
6. [Fehlerbehebung](06-fehlerbehebung.md) – Ambiguität, fehlende Freigaben und Drift einordnen

## Was dieses Handbuch nicht ersetzt

Das Handbuch erklärt die Anwendung. Die verbindlichen Details bleiben bei ihren bestehenden Quellen:

- [Framework-Überblick](../01-framework-ueberblick.md) und [Gates](../02-gates.md) für das Modell
- [Installation](../../INSTALL.md) für Codex, Claude Code, Copilot und OpenCode
- [Runtime Contract](../../plugin/meta/agdf-runtime-contract.md) für normative Gate-Regeln
- [Control-Scaffold](../../plugin/control/README.md) für technische Run-State-Details
- [AGDF CLI README](../../agdf/README.md) für die Befehlsreferenz

Wenn diese Quellen und ein vereinfachtes Beispiel unterschiedlich wirken, gelten die verlinkten
kanonischen Quellen.
