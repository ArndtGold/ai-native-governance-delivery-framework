# AGDF mit Coding-Agenten nutzen

Dieses Handbuch erklärt die praktische Zusammenarbeit mit AGDF aus Nutzersicht. Es richtet sich an
Menschen, die mit einem Coding-Agenten arbeiten möchten, ohne zuerst die CLI oder interne
Runtime-Regeln studieren zu müssen.

AGDF ist kein zusätzlicher Formularprozess. Es macht sichtbar, welches Vorhaben bearbeitet wird, was
der Agent gerade tun darf, welche Entscheidung beim Menschen liegt und welche Evidenz den nächsten
Schritt trägt.

## AGDF in fünf Minuten

Für den Einstieg brauchst du weder die AGDF CLI noch Kenntnisse der internen Runtime-Regeln. Fünf
Begriffe reichen zunächst aus:

1. **Auftrag:** Du beschreibst, was du erreichen möchtest und was unverändert bleiben muss.
2. **Run:** AGDF hält den Kontrollzustand dieses Vorhabens fest. Ein Run ist kein Git-Branch und kein
   Worktree.
3. **Gate:** Vor einer wichtigen Entscheidung hält der Agent an. Du entscheidest bewusst, ob der
   nächste Schritt freigegeben wird.
4. **Evidenz:** Tests, Reviews und Beobachtungen zeigen, ob ein Ergebnis belastbar ist.
5. **Auslieferung:** Commit, Push, Pull Request, Release oder Veröffentlichung erfolgen nur auf
   ausdrücklichen Auftrag.

Ein einfaches Gespräch kann so aussehen:

> **Du:** Ergänze eine Exportfunktion. Die bestehende API darf sich nicht ändern.  
> **Agent:** Ich habe die User Requirement vorbereitet. Die Implementierung ist noch nicht erlaubt.  
> **Du:** `Approval: UR`  
> **Agent:** Ich prüfe jetzt das bestehende System und wähle den kleinsten sicheren Delivery-Pfad.

Du musst dabei nicht selbst entscheiden, ob ein Quick Task, Compact Delivery oder strukturierter
Pfad erforderlich ist. Der Agent untersucht zuerst den bestehenden Kontext, begründet den passenden
Weg und zeigt dir genau die nächste benötigte Entscheidung.

Merke dir für den Anfang nur: **Du beschreibst das Ziel, AGDF macht den erlaubten nächsten Schritt
sichtbar, und wichtige Übergänge benötigen deine bewusste Freigabe.**

## Einstieg

Beginne mit dem [Schnellstart](01-schnellstart.md). Er zeigt den Weg von einem ersten Wunsch über die
Auswahl des passenden Delivery-Pfads bis zu Qualitätssicherung, Abnahme und Abschluss.

Das [Banking-Beispiel](../../../examples/sample-banking-flow.md) veranschaulicht einen fachlich
kritischen Brownfield-Fall. Es ist ein Domänenbeispiel und kein vollständiges Protokoll aller
Approval-Interaktionen oder Abschlussaktionen.

Danach kannst du gezielt weiterlesen:

1. [Schnellstart](01-schnellstart.md) – erster Auftrag, User Requirement und Delivery-Pfad
2. [Gates und Freigaben](02-gates-und-freigaben.md) – genaue Wirkung einer Freigabe
3. [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md) – Quick Task, Compact Delivery,
   Verified Change und strukturierte Wege
4. [Mehrere Runs](04-mehrere-runs.md) – parallele Vorhaben, Auswahl und tatsächliche Isolation
5. [Abschluss und Auslieferung](05-abschluss-und-auslieferung.md) – Reviews, QA, UAT sowie Git- und
   Release-Grenzen
6. [Fehlerbehebung](06-fehlerbehebung.md) – Aktivierung, Ambiguität, fehlende Freigaben und Drift

## Was dieses Handbuch nicht ersetzt

Das Handbuch erklärt die Anwendung. Verbindlich bleiben die jeweils aktuellen Quellen:

- der [Runtime Contract](../../../plugin/meta/agdf-runtime-contract.md) für normative Gate-, Mode- und
  Autoritätsregeln;
- der live ausgewählte Run unter `.agdf/control/runs/<run_id>/RUN_STATE.md` für den aktuellen
  Arbeitsstand;
- [Installation](../../../INSTALL.md) für Codex, Claude Code, GitHub Copilot und OpenCode;
- der [Control-Scaffold](../../../plugin/control/README.md) für technische Run-State-Details;
- die [AGDF CLI README](../../../agdf/README.md) für die Befehlsreferenz;
- [Framework-Überblick](../../01-framework-ueberblick.md) und [Gates](../../02-gates.md) für ergänzende
  Erläuterungen.

Wenn eine vereinfachte Erklärung abweicht, gelten Runtime Contract, live ausgewählter Run und
freigegebene Artefakte in dieser Reihenfolge. Das Handbuch selbst erteilt keine Freigabe.
