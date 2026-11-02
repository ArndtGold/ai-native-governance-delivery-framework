# UR: Migration und Reparatur pro Repository anbieten

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-30
Owner: Arndt Gold

## 1. Problem

Das AGDF-Plugin wird für den Host installiert. Die dauerhaften Kontrollbestände gehören dagegen
zum einzelnen Repository. Eine Prüfung nur während der Installation übersieht später geöffnete
Repositories und zwingt Nutzer für Migration oder Reparatur erneut in den Installationsablauf.
Der bestehende SessionStart-Befund nennt aggregierte Doctor-Findings, aber keinen gezielten
Kompatibilitätshinweis mit einer direkt ausführbaren Repository-Aktion.

## 2. Goal

Beim Arbeiten in einem Repository dessen eigenen Migrations- und Reparaturbedarf erkennen,
verständlich anzeigen und innerhalb dieses Repositorys beheben können. Die installierte Runtime
stellt die Werkzeuge bereit; eine erneute Plugin-Installation ist für die Aktion nicht erforderlich.

## 3. Scope

- Eine schreibgeschützte Kompatibilitätsprüfung beim unterstützten Laufzeitstart bzw. ersten
  Repository-Zugriff innerhalb der bestehenden technischen Check-Berechtigung.
- Ein Hinweis mit dem konkreten Repository-Pfad sowie getrenntem Migrations- und Reparaturbedarf.
- Die Auswahl `1. Migration und Reparatur starten`, `2. Später`, `3. Details anzeigen`.
- Ein direkt nutzbarer, an das angezeigte Repository gebundener Wartungsaufruf der installierten
  Runtime, der bestehende Prüf-, Migrations-, Reparatur-, Sicherungs- und Schreibregeln wiederverwendet.
- Konkrete Reparaturvorschläge vor ihrer Anwendung; ungeklärte Originalbelege bleiben sichtbar.
- Der Installer behält seine ergänzende Prüfung des dort ausgewählten Repositorys.
- Gleiche fachliche Zustände für unterstützte Hosts; tatsächliche Host-Ausführung wird getrennt
  von Quellcode-, Paket- und Fixture-Nachweisen bewertet.

## 4. Non-Goals

- Nach benachbarten Repositories suchen, sie ändern oder aus globaler Plugin-Installation eine
  Repository-Bindung ableiten.
- Eine Prüfung als Zustimmung zur Migration, Reparatur oder zu einem Delivery-Gate behandeln.
- Belege oder historische Freigaben erzeugen; ausstehende Host-Beobachtungen als erledigt markieren.
- Plugin-, MCP-, Host-Berechtigungs-, Veröffentlichungs- oder VCS-Änderungen durch Repository-Wartung.
- Technische Berechtigungen umgehen oder die Prüf- und Schreibregeln in einem zweiten Owner duplizieren.

## 5. Acceptance Signals

1. Zwei Repositories mit unterschiedlichen Kontrollbeständen erhalten jeweils ihren eigenen Befund.
2. Ein Repository ohne `.agdf` sowie ein kompatibler Bestand erhalten keine unnötige Reparaturaufforderung.
3. Die automatische Prüfung schreibt weder Run States noch Journale und zeigt keine blockierende
   Terminalfrage im Host-Hook.
4. Der Bedarf unterscheidet Format-/Integritätsprobleme von Delivery-Readiness und offenen Belegen.
5. Auswahl und Wartungsaufruf bleiben an den angezeigten Repository-Pfad gebunden; ein Zielwechsel
   verlangt eine neue Prüfung.
6. `Später`, Details, leere Eingabe und EOF schreiben nichts. Eine Migration und jede Reparatur
   verwenden die bestehenden konkret gebundenen Vorschläge, Sicherungen und Konfliktprüfungen.
7. Die Aktion funktioniert ohne Neuinstallation; nichtinteraktive/JSON-Abfragen bleiben lesend,
   soweit keine ausdrücklich unterstützte Mutation ausgewählt wurde.
8. Deutsche und englische Hinweise und die Ausführung über das erzeugte Runtime-Paket sind geprüft.

## 6. Existing Source Of Truth

- `create-agdf/lib/control-state/` für Pfade, Revisionen, Siegel, Recovery, Locks und atomare Writes.
- `create-agdf/lib/install-setup/control-migration.js` und `control-repair.js` als bereits bestehende
  Prüf- und Wartungslogik; Brownfield Review klärt deren Wiederverwendung und gemeinsamen Owner.
- `create-agdf/scripts/sync-plugin-runtime.js` für SessionStart und das gebündelte Runtime-Paket.
- Die bestehende Runtime-Check-Berechtigung und Repository-Kontextauflösung.
- `plugin/meta/agdf-interaction-locales.json` und die vorhandenen Interaktions- und Präsentationsowner.
- Nutzerentscheidung in diesem Gespräch: Bedarf pro Repository prüfen, dort Migration/Reparatur
  anbieten und die globale Plugin-Installation davon trennen.

## 7. Risks And Unknowns

- Der heutige Reparaturassistent ist installergebunden und nicht Teil des kleinen Validator-Payloads.
  Die Integration muss einen gemeinsamen Owner und einen überprüften Paketumfang behalten.
- Nicht jeder Host unterstützt dieselbe automatische Ausführung oder Auswahloberfläche; fehlende
  technische Berechtigung muss einen benutzbaren manuellen Weg erhalten.
- Ein Hinweis muss sich bei Repository-Wechsel auf den neuen Bestand beziehen und darf keine
  Bestätigung oder Run-Auswahl aus einem anderen Repository übernehmen.
- Die separate historische Run-Recovery betrifft vorhandene Bestände; diese neue UR betrifft den
  produktiven, wiederholbaren Repository-Einstieg. Bestehende Run-Freigaben werden nicht übertragen.

## 8. Next Step

Diese UR prüfen und ausschließlich mit `Approval: UR` für diesen Run freigeben. Danach folgen
Brownfield Review und die passende Planung über die vorhandenen Gate-Owner.
