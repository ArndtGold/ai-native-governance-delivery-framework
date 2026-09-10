# UR: Geführte MCP-Aktivierung während der AGDF-Installation

Status: approved
Gate: UR
Gate approval: Exact `Approval: UR` accepted on 2026-09-08 after same-target, same-run, same-gate
and run revision `d202cadb-bfed-40f0-8735-b2170a37adcc` revalidation.
Revision: 1
Date: 2026-09-08
Owner: Arndt Gold

## 1. Problem

Eine erfolgreiche AGDF-Plugin-Installation hinterlässt heute keinen einheitlichen betriebsbereiten
Zustand. Skills und Hooks können installiert und aktiv sein, während der optionale lokale
AGDF-MCP-Server weder in der nativen Host-Konfiguration registriert noch in einer frischen Sitzung
entdeckt wurde. Der Nutzer sieht deshalb "AGDF installiert", muss die getrennte MCP-Aktivierung aber
selbst kennen und mit einem weiteren Befehl ausführen.

Dieser Unterschied ist technisch korrekt, in der Installation jedoch zu wenig handlungsorientiert.
Er erzeugt vermeidbare Suchläufe, uneinheitliche Skill- und Shell-Aufrufe und die falsche Erwartung,
dass das installierte Plugin bereits den typisierten Aufruf `agdf_dispatch` bereitstellt.

## 2. Nutzerbedarf

Als Nutzer von Codex, Claude Code, OpenCode oder GitHub Copilot möchte ich AGDF in einem
zusammenhängenden, verständlichen Ablauf installieren und dabei bewusst entscheiden, ob der lokale
MCP-Server für das ausgewählte Projekt direkt mit eingerichtet wird. Nach dem Ablauf möchte ich den
tatsächlichen Zustand von Plugin, Hook, MCP-Registrierung und erforderlichem Neustart erkennen und
genau eine passende nächste Aktion erhalten.

Für interaktive lokale Installationen soll die vollständige Einrichtung als empfohlene Option
sichtbar sein. Die Auswahl muss vor der MCP-Mutation erfolgen. Für unbeaufsichtigte Installationen
darf MCP nur durch eine ausdrückliche Option aktiviert werden.

## 3. Ziel

Die bestehenden AGDF-Installationsbefehle führen durch eine gemeinsame Einrichtung, die:

- den bisherigen Plugin-Installationszustand und den passenden MCP-Zustand getrennt prüft;
- vor jeder MCP-Mutation Host, Zielprojekt, Scope, lokale Ausführung und Entfernungspfad zeigt;
- in einer interaktiven Installation die Optionen **vollständig einrichten**, **nur Plugin
  installieren** und **abbrechen** verständlich anbietet;
- die vollständige Einrichtung als empfohlene Wahl kennzeichnet, aber keine fehlende oder
  mehrdeutige Eingabe als Zustimmung wertet;
- im nichtinteraktiven Betrieb MCP nur mit einer ausdrücklichen Option wie `--with-mcp` aktiviert;
- ohne ausdrücklichen breiteren Scope den vorhandenen MCP-Standard `project` verwendet;
- Plugin- und MCP-Ergebnis gemeinsam, aber als getrennte effektive Zustände ausgibt;
- einen erforderlichen Host-Neustart und die noch ausstehende Discovery klar nennt; und
- Teilfehler, Wiederholung, Rollback und spätere Entfernung ohne falsche Erfolgsaussage behandelt.

## 4. Scope

Diese UR umfasst:

1. den interaktiven Installations- und Update-Ablauf der öffentlichen AGDF-CLI für die bereits
   unterstützten Oberflächen Codex, Claude Code, OpenCode und GitHub Copilot;
2. die lokalen Entwicklungsbefehle `npm run install:<surface>` als dünne Projektion desselben
   kanonischen Einrichtungsablaufs;
3. eine ausdrückliche nichtinteraktive MCP-Aktivierungsoption und eine ausdrückliche Plugin-only-
   Option;
4. die Wiederverwendung des bestehenden MCP-Lebenszyklus für Status, Aktivierung, Deaktivierung,
   exakte Runtime, Herkunftsprüfung, Referenzen und Rollback;
5. eine gemeinsame Installationsausgabe mit getrennten Zuständen für Plugin, Hook,
   MCP-Registrierung, Discovery und Neustartbedarf;
6. idempotente Wiederholung bei bereits passender Installation beziehungsweise Registrierung;
7. Update-Verhalten bei abweichender Plugin- und MCP-Version, ohne fremde Registrierung zu
   übernehmen oder still zu überschreiben;
8. einen kohärenten späteren Deaktivierungs- und Entfernungspfad, damit eine gekoppelte Einrichtung
   keine verwaiste AGDF-MCP-Registrierung hinterlässt; und
9. getrennte Repository-, Paket-, direkte Host- und menschliche UAT-Nachweise.

## 5. Akzeptanzsignale

Der Bedarf ist für die nächste Produktstufe ausreichend geklärt, wenn folgende beobachtbare
Ergebnisse verbindlich abgeleitet werden können:

1. Eine interaktive Neuinstallation zeigt vor Änderungen Host, Zielprojekt, effektiven Scope,
   lokale Prozessausführung, Paketbezug und Entfernungspfad sowie drei eindeutige Optionen.
2. **Vollständig einrichten** installiert das Plugin und verwendet anschließend ausschließlich den
   bestehenden MCP-Lebenszyklus zur projektbezogenen Registrierung.
3. **Nur Plugin installieren** verändert keine MCP-Konfiguration und meldet MCP ausdrücklich als
   nicht eingerichtet.
4. **Abbrechen** führt vor der beabsichtigten Installation zu keiner neuen Plugin- oder
   MCP-Mutation.
5. Eine nichtinteraktive Installation ohne ausdrückliche MCP-Option registriert keinen Server; eine
   dokumentierte `--with-mcp`-Option aktiviert genau den ausgewählten Host, das Ziel und den Scope.
6. Erfolgreiche Registrierung wird nicht als Discovery ausgegeben. Der Abschluss nennt den
   erforderlichen Neustart und verlangt eine frische Sitzung für den Tool-Nachweis.
7. Bereits passende Zustände bleiben unverändert und werden als solche ausgewiesen. Abweichende,
   fremde, ungültige oder höher priorisierte Registrierungen stoppen vor MCP-Mutation.
8. Scheitert MCP nach einer erfolgreichen Plugin-Installation, lautet das Ergebnis nicht
   "vollständig eingerichtet". Es zeigt den exakten Teilzustand und eine geprüfte Wiederholungs-
   oder Rücknahmeaktion.
9. Update und Entfernung erhalten fremde sowie nicht zu AGDF gehörende Host-Einstellungen. Eine
   gemeinsam genutzte MCP-Runtime wird erst nach ihrer letzten gültigen Referenz entfernt.
10. MCP-Registrierung, Host-Berechtigung, Tool-Discovery und erfolgreicher Dispatch enthalten
    `authorizes: false` und gelten niemals als `Approval: <GateName>`.
11. Für jede Oberfläche existiert eine getrennte Testspur für Auswahl, Plugin-only, vollständige
    Einrichtung, Nicht-TTY-Verhalten, Idempotenz, Konflikt, Teilfehler, Neustarthinweis, Entfernung
    und unveränderten Fremdzustand.
12. Eine Unterstützungszusage entsteht nur aus direkter Evidenz des exakten Host-, Versions-,
    Client-, Betriebssystem-, Scope- und Sitzungs-Tupels.

## 6. Nicht-Ziele

- MCP während einer Plugin- oder Marketplace-Installation still und ohne ausdrückliche
  Nutzerentscheidung registrieren.
- Einen zweiten MCP-Server, Dispatcher, Installer, Statusauswerter oder Host-unabhängiges
  Konfigurationsformat einführen.
- Das bestehende Werkzeug `agdf_dispatch`, seine fachliche Beschreibung, sein Schema oder seine
  Gate-Auswertung neu definieren.
- Host-Berechtigungen, Trust-Entscheidungen, verwaltete Richtlinien oder allgemeine Shell-, Datei-
  und Netzwerkrechte umgehen oder erweitern.
- Eine MCP-Registrierung, Installation oder Werkzeugberechtigung als AGDF-Gate-Freigabe behandeln.
- Discovery aus einer geschriebenen Konfigurationsdatei, einem Repositorytest oder einer anderen
  Oberfläche ableiten.
- Den öffentlichen OpenAI-Skills-only-Kandidaten heimlich um eine lokale ausführbare MCP-Runtime
  erweitern.
- Veröffentlichung, Release, Commit, Push oder Pull Request in diesem Run vorwegnehmen.

## 7. Bestehende Quellen und Grenzen

- `create-agdf/lib/installers/` und `create-agdf/lib/host-adapters/` besitzen die bestehende
  Plugin-Installation und die hostabhängigen Installationsmechanismen.
- `create-agdf/lib/mcp-lifecycle/` besitzt Status, Aktivierung, Deaktivierung, Host-Adapter,
  Transaktion, Rollback und Runtime-Referenzen des MCP-Pfads.
- `create-agdf/lib/skill-dispatch/contract.js` bleibt alleiniger semantischer Owner von
  `agdf_dispatch`.
- `plugin/meta/agdf-mcp-capability.json` besitzt das veröffentlichte MCP-Fähigkeitsprofil.
- `agdf-cross-host-mcp-integration` bleibt der abgeschlossene beziehungsweise qualitätsgeprüfte
  Ausgangsstand für Server, Lifecycle, Sprache und Evidenztrennung. Seine bereits freigegebenen
  Artefakte werden durch diese neue UR nicht rückwirkend erweitert.
- `installation-consent-runtime-checks` besitzt die getrennte Zustimmung zu automatischen
  Laufzeitprüfungen. Eine dort erteilte oder verweigerte Entscheidung ist keine Zustimmung zur
  MCP-Registrierung.
- `cross-surface-plugin-opt-out` besitzt bestehende Regeln zur Plugin-Deaktivierung und Entfernung;
  Brownfield Review muss die notwendige Lifecycle-Verknüpfung ohne doppelte Ownership bestimmen.
- Die native Host-Konfiguration bleibt wirksame Autorität für Registrierung, Trust, Berechtigungen
  und Discovery.

## 8. Risiken und offene Fragen

- Eine gemeinsame Einrichtung kann fälschlich wie eine atomare Transaktion wirken, obwohl Plugin-
  und MCP-Lebenszyklus verschiedene native Systeme verändern. PRD und SD müssen den sichtbaren und
  technischen Teilfehlervertrag festlegen.
- Der Begriff "empfohlen" darf nicht zu einer vorweggenommenen Zustimmung oder einem unsicheren
  Nicht-TTY-Standard werden.
- Projekt- und Benutzer-Scope werden von den Hosts unterschiedlich ausgedrückt. Kein Adapter darf
  einen nicht darstellbaren Scope still erweitern.
- Marketplace, Host-UI und CLI besitzen unterschiedliche Möglichkeiten für geführte
  Nachinstallationsschritte. Der Produktvertrag muss direkte und nachgelagerte Aktivierung
  unterscheidbar halten.
- Updates können Plugin und MCP-Runtime zeitweise auf verschiedene Versionen bringen. Die
  Reihenfolge, Wiederaufnahme und Rücknahme benötigen einen eindeutigen Owner.
- Eine gekoppelte Entfernung könnte gemeinsam genutzte MCP-Runtimes oder bewusst getrennt
  installierte Zustände beschädigen. Herkunft und Referenzen müssen vor jeder Entfernung geprüft
  werden.
- Direkte Hosttests können Authentifizierung, Neustart oder nicht automatisierbare Desktop-Clients
  erfordern. Fehlende Evidenz bleibt offen und wird nicht durch Fixture-Tests ersetzt.

## 9. Nächster Schritt

Nach der exakten Freigabe führt Brownfield Review die vorhandenen Installer-, MCP-Lifecycle-,
Consent-, Opt-out-, Status- und Evidenz-Owner zusammen. Anschließend wird der kleinste tragfähige
Delivery-Pfad bestimmt. Vorher sind PRD, SD, TP und Implementierung nicht erlaubt.

Exakte Freigabe:

`Approval: UR`
