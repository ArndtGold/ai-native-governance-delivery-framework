# CD+Tests: Fachliche MCP-Schnittstellen als Zielbild

Status: done
Gate: CD+Tests
Based on: approved TP, revision 13
Brownfield Analysis: pass
Date: 2026-09-29
Owner: Arndt Gold (AGDF maintainer)

## Umsetzung

- T-001: Kanonische Dispatcher- und Inspect-Verträge, MCP-Weiterleitung, Gate-/Kontrollauswertung,
  Run-State-Owner, Architekturübersicht und `CG-MCP-DISPATCH-ADAPTER` geprüft.
- T-002: [`docs/architecture/mcp-target-architecture.md`](../../../../docs/architecture/mcp-target-architecture.md)
  ergänzt: Statuslegende, Ist-Grenze, Quelleigentümer, vier fachliche Kandidaten mit Bindung,
  Ergebnis, Nebenwirkungen und Fehlergrenzen, Autoritätsmodell, Tools/Resources/Prompts-Abwägung,
  Entwicklungspfad und offene Entscheidungen.
- T-003: [`docs/architecture/README.md`](../../../../docs/architecture/README.md) um einen relativen
  Link und den nicht-normativen Statushinweis ergänzt.
- T-004: Manuelle Kriterien-, Quellen-, Link- und Scope-Prüfung durchgeführt.

## Kriterien- und Nachweisübersicht

| Kriterium | Ergebnis | Beobachtung |
|---|---|---|
| AC-001 | pass | Die exakten Labels `implemented`, `decided`, `candidate` und `open` sind in der Statuslegende und den Abschnittsüberschriften sichtbar. |
| AC-002 | pass | `agdf_dispatch` und `agdf_inspect` sind als Repository-Quellverträge gekennzeichnet und mit ihren semantischen Ownern verlinkt. |
| AC-003 | pass | Alle vier Kandidatenfamilien zeigen Zweck, Bindung, Ergebnis, Nebenwirkung und Fehler-/Grenzverhalten. |
| AC-004 | pass | Mensch, Host, Adapter, Dispatcher/Services, Auswertung und Kontrollzustand haben getrennte Zuständigkeiten. |
| AC-005 | pass | Schreibende MCP-Aktionen bleiben bedingt; Ziel, Run, Gate, Revision, Digest und host-verifizierbare menschliche Aktion werden vorausgesetzt. Keine bestehende sichere Write-API wird behauptet. |
| AC-006 | pass | Tools, Resources und Prompts werden als vorläufige Optionen mit Grenzen beschrieben. |
| AC-007 | pass | Bestehende Interfaces bleiben bis zu einem separat genehmigten Vertrag und Kompatibilitätspfad maßgeblich. |
| AC-008 | pass | Der relative Link aus der Übersicht löst auf; die Beschreibung kennzeichnet den Vorschlag als nicht normativ. |
| AC-009 | pass | Produktänderungen sind auf `docs/architecture/README.md` und `docs/architecture/mcp-target-architecture.md` begrenzt; keine ausführbaren oder Runtime-Dateien wurden geändert. |

## Ausgeführte manuelle Prüfungen

- 15 in-scope relative Markdown-Links in der neuen Zielarchitektur und der neuen README-Verlinkung
  auf Existenz und – soweit angegeben – Zielüberschrift geprüft: **pass**.
- Statusbegriffe, vier Kandidatenfamilien, bestehende Tool-Owner, Primitive-Vergleich und
  Schreibgrenze manuell gegen PRD, SD, TP und Quellverträge abgeglichen: **pass**.
- `git diff --check` für die geänderte Architekturübersicht und Whitespace-Prüfung der neuen Datei:
  **pass**.
- Produktdiff auf die zwei genehmigten Dokumentationspfade begrenzt: **pass**.
- Keine automatisierten Runtime-, Protokoll- oder Host-Tests ausgeführt; sie sind für diesen
  Markdown-only-Scope nicht vorgesehen. Keine Live-Host- oder Release-Qualifikation behauptet.

## Ergebnis und Grenzen

Die genehmigten Dokumentationsaufgaben sind umgesetzt. Repository-Quellen belegen die beschriebenen
Verträge; Release-Verfügbarkeit und tatsächliche Host-Discovery bleiben davon getrennte Nachweise.
Die vorhandenen Run-/Backlog-Arbeitsdateien außerhalb der beiden Produktdokumente wurden nicht
verändert.
