# PRD: Geführte MCP-Aktivierung während der AGDF-Installation

Status: approved
Gate: PRD
Gate approval: Exact `Approval: PRD` accepted on 2026-09-09 after same-target, same-run, same-gate
and run revision `6B78B39F-4844-4823-B9A9-B134316D2C59` revalidation. Revision 1 approval remains
historical.
Revision: 2
Date: 2026-09-09
Owner: Arndt Gold
Based on: approved UR Revision 1, completed Brownfield Review and ready UX Intent Definition

## 1. Produktziel

AGDF erhält für Codex, Claude Code, OpenCode und GitHub Copilot einen zusammenhängenden
Installationsablauf. Der Nutzer entscheidet vor der Mutation, ob nur das Plugin oder zusätzlich der
lokale MCP-Server eingerichtet wird. Bei vollständiger Einrichtung wählt er anschließend bewusst,
ob die Registrierung nur für das aktuelle Projekt oder als benutzerweiter Standard gelten soll.
Der Abschluss zeigt Plugin, Hook,
Runtime-Checks, MCP-Registrierung, Discovery und Neustartbedarf als getrennte effektive Zustände.

Die vollständige Einrichtung wird interaktiv als empfohlene Option angeboten. Sie ist niemals
vorselektiert und wird weder aus fehlender Eingabe noch aus einer früheren technischen Entscheidung
abgeleitet. Nichtinteraktive Installationen bleiben ohne `--with-mcp` beim kompatiblen Plugin-only-
Verhalten.

Der neue Ablauf komponiert die vorhandenen Plugin-Installer und den vorhandenen MCP-Lifecycle. Er
führt keinen zweiten Server, Dispatcher, Host-Adapter, Consent-Store, Statusauswerter oder
Darstellungsowner ein.

## 2. Nutzer und Aufgaben

- **Erstnutzer:** AGDF mit einer verständlichen Auswahl vollständig oder als Plugin-only
  installieren und danach den tatsächlichen Betriebszustand erkennen.
- **Bestehender Nutzer:** Plugin und AGDF-eigene MCP-Runtime versionsgleich aktualisieren oder den
  vorhandenen MCP-Zustand bewusst unverändert lassen.
- **Sicherheitsbewusster Nutzer:** Vor jeder MCP-Mutation Host, Ziel, Scope, lokale Ausführung,
  Paketbezug und Entfernungspfad sehen; fremde und verwaltete Hostzustände behalten.
- **Automatisierter Operator:** Die gewünschte Einrichtung vollständig über Optionen ausdrücken,
  ohne dass fehlendes TTY oder fehlende Eingabe als Zustimmung gilt.
- **Maintainer:** Einen gemeinsamen Produktvertrag über bestehende Owner testen, ohne Host-Parität
  aus Fixtures oder einer anderen Oberfläche abzuleiten.

## 3. Öffentlicher Bedienvertrag

Die vorhandenen Oberflächenbefehle bleiben die primären Installationsbefehle:

```text
npx --yes @agdf/cli@<version> <codex|claude|copilot|opencode>
```

Sie unterstützen zusätzlich:

```text
--with-mcp
--plugin-only
--dir <absolutes-ziel>
--scope <project|user>
```

Regeln:

1. `--with-mcp` und `--plugin-only` schließen sich gegenseitig aus.
2. `--scope` ist bei einem Installationsbefehl nur zusammen mit `--with-mcp` zulässig.
3. Nichtinteraktives `--with-mcp` erfordert ein ausdrückliches absolutes `--dir`.
4. Nichtinteraktiv verwendet MCP ohne `--scope` weiterhin `project`.
5. Interaktiv besitzt MCP keinen stillen Scope. Nach der bewussten Auswahl der vollständigen
   Einrichtung folgt eine eigene Scope-Auswahl.
6. `user` ist eine ausdrückliche breitere Wahl und darf nie als Fallback dienen.
7. Interaktiv darf das ursprüngliche Aufrufverzeichnis als vollständig sichtbarer Zielvorschlag
   erscheinen.
   Erst die bewusste Auswahl der vollständigen Einrichtung bindet diesen Vorschlag.
8. Ein lokaler Wrapper darf sein eigenes Unterverzeichnis nicht anstelle des ursprünglichen
   Aufrufverzeichnisses als Ziel vorschlagen.
9. `--plugin-only` erstellt, verändert oder entfernt keine MCP-Registrierung.
10. Ohne TTY, JSON-Interaktion oder ausdrückliche Setup-Option bleibt der Ablauf Plugin-only.

Die getrennten Expertenbefehle bleiben verfügbar:

```text
agdf mcp status  --surface <surface> --dir <ziel> [--scope <project|user>]
agdf mcp enable  --surface <surface> --dir <ziel> [--scope <project|user>]
agdf mcp disable --surface <surface> --dir <ziel> [--scope <project|user>]
```

## 4. Interaktive Entscheidung

### 4.1 Neuinstallation ohne passende AGDF-MCP-Registrierung

Vor der Mutation werden angezeigt:

- AGDF-Version und Host;
- erkannter Plugin-Ausgangszustand;
- vollständig ausgeschriebenes ursprüngliches Aufrufverzeichnis als Projektvorschlag;
- verfügbare MCP-Scopes und bestehende wirksame Registrierungen;
- lokale `stdio`-Ausführung mit den Rechten des Hosts;
- erforderlicher Paketbezug für die exakte MCP-Runtime;
- Neustart- und Entfernungspfad;
- Hinweis, dass Installation und Tool-Nutzung keine AGDF-Freigabe erteilen.

Anschließend erscheinen genau diese Produktentscheidungen:

1. **Vollständig einrichten (empfohlen)**
2. **Nur Plugin installieren**
3. **Abbrechen**

Die erste Option ist visuell empfohlen, aber nicht ausgewählt. Leere, ungültige oder mehrdeutige
Eingabe führt zu einer sichtbaren erneuten Auswahl oder zu einem Abbruch vor Mutation. Sie aktiviert
MCP niemals automatisch.

### 4.1.1 Scope-Auswahl nach vollständiger Einrichtung

Erst nach der bewussten Auswahl von **Vollständig einrichten** folgt eine zweite Entscheidung:

1. **Für dieses Projekt einrichten (empfohlen)**
2. **Benutzerweit einrichten**
3. **Zurück**

Auch diese Auswahl ist nicht vorselektiert. Vor der Bestätigung zeigt der Dialog für `project` das
vollständige Zielprojekt und für `user` den Host, die benutzerweite Reichweite, die native
Konfigurationsquelle und bekannte höher priorisierte Projektkonfigurationen. `user` bedeutet, dass
der Host den AGDF-MCP-Server einmal als benutzerweiten Standard kennt. Eine projektspezifische
Konfiguration kann diesen Standard nach den nativen Prioritätsregeln übersteuern. Jeder spätere
Dispatch muss weiterhin sein tatsächliches Governance-Ziel auflösen. Die benutzerweite
Registrierung erteilt dem aktuellen Verzeichnis keine Ziel- oder Gate-Autorität.

`Zurück` führt ohne Mutation zur ersten Entscheidung. Leere, ungültige oder abgebrochene Eingabe
bindet keinen Scope und startet weder Paketbezug noch Plugin- oder MCP-Mutation.

### 4.2 Update mit passender AGDF-eigener MCP-Registrierung

Die zustandsbezogenen Entscheidungen lauten sinngemäß:

1. **Plugin und MCP aktualisieren (empfohlen)**
2. **Plugin aktualisieren, MCP unverändert lassen**
3. **Abbrechen**

Die zweite Option deaktiviert oder entfernt MCP nicht. Eine mögliche Versionsabweichung nach dem
Plugin-Update bleibt sichtbar.

Nach der ersten Option folgt dieselbe getrennte Scope-Auswahl wie bei der Neuinstallation. Der
aktuell passende Scope ist sichtbar gekennzeichnet, aber nicht vorselektiert. Ein Wechsel fügt nur
die bewusst ausgewählte AGDF-eigene Registrierung hinzu. Eine bestehende Registrierung in einem
anderen Scope wird nicht still entfernt. Konflikte und native Priorität werden vor der Mutation
angezeigt und nach dem bestehenden Konfliktvertrag behandelt.

### 4.3 Fremde, ungültige oder höher priorisierte MCP-Registrierung

Der Konflikt sperrt die MCP-Mutation vor Paketbezug oder Konfigurationsänderung. Der Nutzer kann die
Plugin-Installation fortsetzen oder den gesamten Aufruf abbrechen. Der Ablauf überschreibt,
normalisiert oder übernimmt die fremde Registrierung nicht.

### 4.4 Getrennte Zustimmung zu automatischen Runtime-Checks

Die bestehende Entscheidung `enable | manual | cancel` für automatische AGDF-Runtime-Checks bleibt
fachlich und dauerhaft getrennt. Der Ablauf zeigt zuerst den gewünschten Installationsumfang. Wenn
der Nutzer fortfährt, folgt die bestehende Runtime-Check-Entscheidung vor ihrer eigenen Mutation.

- MCP-Aktivierung setzt Runtime-Checks nicht auf `enable`.
- Runtime-Check-Zustimmung aktiviert MCP nicht.
- `cancel` in einer noch nicht mutierten interaktiven Entscheidung beendet den Aufruf ohne neue
  Plugin-, Runtime-Check- oder MCP-Mutation.
- Bereits vorhandene technische Zustände bleiben bei Abbruch erhalten.

## 5. Arbeitsmodi und effektive Zustände

| Modus | Effektiver Zustand | Erforderliche sichtbare Aussage |
|---|---|---|
| `decision_required` | Noch keine Auswahl; keine neue Mutation | Eingangsstatus, Ziel, Scope und drei Entscheidungen |
| `plugin_only_requested` | Nur Plugin-Operation beauftragt | Plugin-Ergebnis plus unveränderter beobachteter MCP-Zustand |
| `full_setup_requested` | Plugin und nachfolgende MCP-Aktivierung beauftragt | Fortschritt und Ergebnis je Teiloperation |
| `cancelled` | Zustand vor dem Aufruf bewahrt | Keine neue Mutation und nächster Schritt `none` |
| `plugin_ready_mcp_absent` | Plugin verifiziert, MCP nicht registriert | Erfolgreiches Plugin-only; optionale MCP-Aktivierung |
| `plugin_ready_mcp_unchanged` | Plugin verifiziert, vorhandener MCP-Zustand bewusst unverändert | Beobachtete Registrierung und mögliche Versionsabweichung |
| `configured_pending_restart` | Plugin verifiziert, MCP passend registriert, Host muss neu laden | Neustart und frische Sitzung erforderlich |
| `configured_unverified` | Runtime und Registrierung passen, Discovery ist nicht direkt beobachtet | Keine Ready- oder Supportaussage |
| `discovered_ready` | Frische Sitzung zeigt das exakte Werkzeug und einen begrenzten Aufruf | Exaktes Host-Tupel und `authorizes: false` |
| `partial` | Mindestens eine Teiloperation erfolgreich und eine fehlgeschlagen | Erreichte Zustände, Fehlerphase, Rollback und genau eine Recovery-Aktion |
| `degraded_or_foreign` | MCP kann wegen Konflikt oder fehlender Verifikation nicht sicher mutiert werden | Keine MCP-Mutation; konkrete Quelle und Recovery |

### Erfolgsbegriff

`vollständig eingerichtet` beziehungsweise ein entsprechender maschinenlesbarer Gesamterfolg ist
nur zulässig, wenn:

- der Plugin-Installer seinen eigenen verifizierten Erfolg meldet;
- der MCP-Lifecycle für Host, Ziel und Scope eine passende AGDF-eigene Registrierung zurückliest;
- die exakte Runtime verifiziert ist; und
- die Ausgabe Discovery weiterhin als `pending_restart` oder `not_checked` getrennt führt, solange
  keine frische Host-Beobachtung vorliegt.

Die Installation darf `discovered_ready` nicht allein aus geschriebenen Dateien oder
Repositorytests ableiten.

## 6. Funktionale Anforderungen

### GMCP-01: Eine gemeinsame Setup-Entscheidung

Jeder interaktive Installations- und Update-Befehl der vier Oberflächen bietet vor Mutation den
passenden dreiteiligen Setup-Entscheidungsraum. Auswahltexte dürfen pro Ausgangszustand präzisiert
werden, ihre drei Bedeutungen bleiben vollständig einrichten, Plugin-only und Abbruch. Nach
vollständiger Einrichtung folgt eine getrennte, ebenfalls bewusste Scope-Auswahl mit den Bedeutungen
dieses Projekt, benutzerweiter Standard und zurück.

### GMCP-02: Empfohlen ohne implizite Zustimmung

Die vollständige Einrichtung ist als empfohlen gekennzeichnet. Sie ist nicht vorselektiert. Leere,
ungültige, abgebrochene oder nicht interaktive Eingabe gilt niemals als MCP-Zustimmung.

### GMCP-03: Expliziter nichtinteraktiver Vertrag

`--with-mcp` autorisiert die MCP-Aktivierung für genau den ausgewählten Host, das absolute Ziel und
den angegebenen beziehungsweise standardmäßigen Projekt-Scope. `--plugin-only` autorisiert nur die
Plugin-Operation. Widersprüche und fehlende Pflichtwerte stoppen vor Mutation.

### GMCP-04: Ziel- und Scope-Bindung

Eine MCP-Mutation besitzt immer ein kanonisch aufgelöstes absolutes Ziel. Interaktiv ist der
vollständig sichtbare Zielvorschlag erst durch die bewusste vollständige Auswahl und die
nachfolgende Scope-Auswahl gebunden. `project` bindet das sichtbare ursprüngliche
Aufrufverzeichnis. `user` bindet die native benutzerweite Konfigurationsquelle, behält das
ursprüngliche Aufrufverzeichnis nur als nicht autorisierenden Startkontext und darf nicht aus einem
Default entstehen. Nichtinteraktiv ist `--dir` verpflichtend; ohne `--scope` bleibt `project` der
Kompatibilitätsstandard.

### GMCP-05: Bestehende Owner wiederverwenden

Plugin-Installation wird ausschließlich durch die vorhandenen Installer und Host-Adapter
ausgeführt. MCP-Status, Runtime-Beschaffung, Registrierung, Herkunft, Referenzen, Rollback und
Entfernung werden ausschließlich durch den vorhandenen MCP-Lifecycle ausgeführt. Die
Setup-Komposition entscheidet keine nativen Zustände selbst.

### GMCP-06: Sichere Reihenfolge

Der Ablauf liest vor der Entscheidung Plugin- und MCP-Ausgangszustand ohne Mutation. Nach der
Auswahl wird zuerst die Plugin-Operation ausgeführt und verifiziert. Nur bei erfolgreicher
Plugin-Operation und vollständiger Einrichtung beginnt die bestehende MCP-Enable-Operation.

### GMCP-07: Plugin-Fehler stoppt MCP

Scheitert Plugin-Installation oder -Verifikation, findet kein MCP-Paketbezug und keine
MCP-Konfigurationsmutation statt. Der Abschluss benennt die Plugin-Fehlerphase und die bestehende
Plugin-Recovery.

### GMCP-08: MCP-Fehler bewahrt verifiziertes Plugin

Scheitert MCP nach erfolgreicher Plugin-Installation, bleibt das verifizierte Plugin installiert.
Der MCP-Lifecycle rollt nur seine eigene Operation zurück. Das Gesamtergebnis ist `partial` und
enthält einen exakten MCP-Retry oder die bewusste Plugin-only-Fortsetzung als nächste Aktion.

### GMCP-09: Plugin-only ist MCP-nichtmutierend

Plugin-only legt keine Registrierung an, aktualisiert keine MCP-Runtime, deaktiviert keinen Server
und entfernt keine Referenz. Der Ablauf darf read-only MCP-Status verwenden, um den unveränderten
Zustand wahrheitsgemäß auszugeben.

### GMCP-10: Idempotenz und Update

Eine bereits passende Plugin- und MCP-Konfiguration erzeugt keine Duplikate. Vollständige
Einrichtung gleicht eine exakte AGDF-eigene ältere Runtime über den vorhandenen Lifecycle an.
Plugin-only lässt eine vorhandene MCP-Version unverändert und weist eine beobachtete Abweichung aus.

### GMCP-11: Fremde und konfliktbehaftete Zustände

Fremde, ungültige, mehrdeutige oder höher priorisierte MCP-Registrierungen stoppen MCP vor Mutation.
Sie dürfen die sichere Plugin-only-Installation nicht blockieren, sofern der Plugin-Installer selbst
keinen Konflikt meldet.

### GMCP-12: Gemeinsames Ergebnis mit getrennten Teilzuständen

Menschliche und JSON-Ausgabe enthalten dieselben stabilen Bedeutungen für:

- angeforderte Einrichtung und Gesamtergebnis;
- Plugin-Installation und -Verifikation;
- Hook beziehungsweise automatische Runtime-Checks;
- MCP-Fähigkeit, Runtime, Registrierung und Discovery;
- Ziel, angeforderten und effektiven Scope;
- Änderungen, Fehlerphase und Rollback;
- Neustartbedarf und genau eine nächste Aktion;
- `authorizes: false`.

Das genaue Schema gehört ins Solution Design. Bestehende Lifecycle- und MCP-Codes werden nicht
umbenannt oder in konkurrierende Werte übersetzt.

### GMCP-13: Neustart und Discovery

Eine passende Registrierung führt höchstens zu `configured_pending_restart` beziehungsweise
`configured_unverified`. Der Abschluss verlangt den vollständigen Host-Neustart und eine frische
Sitzung. Wiederhergestellte Sitzungen gelten nicht als Discovery-Nachweis.

### GMCP-14: Runtime-Check-Consent bleibt getrennt

Setup-Auswahl und Runtime-Check-Zustimmung besitzen getrennte Felder, Begründungen und effektive
Owner. Keine Entscheidung wird in die andere umgerechnet, gespeichert oder als deren Wiederholung
verwendet.

### GMCP-15: Marketplace-Grenze

Ein Host- oder Marketplace-Pfad ohne AGDF-CLI-Mutationscallback installiert weiterhin nur das
zulässige Plugin-Payload. Die erste geeignete AGDF-Interaktion darf auf den fehlenden MCP-Zustand und
den genauen geführten CLI-Befehl hinweisen. Sie registriert MCP nicht aus einem Skill, Hook oder Chat.

### GMCP-16: Lokale Entwicklungsparität

`npm run install:<surface>` bleibt ein dünner Source-Checkout-Einstieg, führt weiterhin die
kanonische Vorbereitung aus und delegiert danach an denselben CLI-Setup-Vertrag. Er bewahrt das
ursprüngliche Aufrufverzeichnis als sichtbaren Projektvorschlag, auch wenn `npm --prefix` den
technischen Prozess im Unterverzeichnis `create-agdf` startet. Nur ein absolutes, vorhandenes
Aufrufverzeichnis darf übernommen werden; andernfalls stoppt oder verwendet der Einstieg einen
eindeutig sichtbaren sicheren Fallback. Argumente wie `--with-mcp`, `--plugin-only`, `--dir` und
`--scope` werden ohne eigene Produktsemantik weitergereicht.

### GMCP-17: Deaktivierung und Entfernung

Status und spätere Entfernung zeigen Plugin- und MCP-Zustand getrennt. Eine gekoppelte
Entfernungsreise ruft nur die vorhandenen herkunftsgeprüften Operationen auf. Fremde Registrierungen
bleiben erhalten; eine gemeinsame MCP-Runtime wird erst nach der letzten gültigen Referenz entfernt.

### GMCP-18: Sprache und Barrierefreiheit

Interaktive Texte und Ergebnisfelder verwenden den bestehenden vollständigen Locale-Owner. Eine
ausgewählte Sprache rendert die gesamte Setup-Interaktion aus einem Paket. Unbekannte stabile Codes
führen zu einem sichtbaren Fehler statt zu gemischter Sprache. Optionen sind auch ohne Farbe oder
Positionswissen eindeutig unterscheidbar.

### GMCP-19: Technische und Governance-Autorität

Jede Setup-, Registrierungs-, Trust-, Permission-, Discovery- und Tool-Aktion ist technisch und
nicht autorisierend. Sie enthält `authorizes: false` und kann kein `Approval: <GateName>` erzeugen,
ersetzen oder persistieren.

### GMCP-20: Evidenzgetrennte Host-Qualifikation

Repository- und Fixture-Tests, kontrollierte MCP-Protokolltests, installierte Paketprüfung, direkte
Host-Beobachtung und UAT bleiben getrennte Spuren. Eine Supportaussage gilt nur für das exakte direkt
beobachtete Host-, Version-, Client-, Betriebssystem-, Architektur-, Scope-, Konfigurationsquellen-,
Node-, Runtime- und Sitzungs-Tupel.

## 7. Akzeptanzkriterien

### AC-01: Interaktive Neuinstallation

- source_state: Plugin und AGDF-MCP fehlen oder sind nicht passend eingerichtet
- trigger_action: Installationsbefehl in einem interaktiven Terminal
- expected_effective_state: `decision_required`, keine neue Mutation
- visible_feedback: vollständiger Host-, Ziel-, Scope-, Ausführungs- und Entfernungskontext sowie
  drei Setup-Optionen; nach vollständiger Einrichtung eine getrennte Scope-Auswahl
- blocker_failure_behavior: fehlende oder ungültige Auswahl aktiviert MCP nicht
- required_evidence: Interaktions- und Mutation-Negativtests je Oberfläche; gerenderte UAT

### AC-02: Vollständige Einrichtung

- source_state: sichere Plugin- und MCP-Voraussetzungen, bewusste vollständige Auswahl
- trigger_action: vollständige Einrichtung und anschließend `project` oder `user` bewusst auswählen
- expected_effective_state: Plugin verifiziert; exakte Runtime und Registrierung passen;
  Discovery ist `pending_restart` oder `not_checked`
- visible_feedback: getrennte Teilzustände und Neustart als nächste Aktion
- blocker_failure_behavior: keine Ready-Aussage ohne passende Rücklesung
- required_evidence: Orchestrierungs-, Lifecycle-, JSON- und direkte Hosttests

### AC-03: Plugin-only

- source_state: MCP fehlt, passt oder weicht ab
- trigger_action: Plugin-only interaktiv oder nichtinteraktiv auswählen
- expected_effective_state: Plugin-Operation abgeschlossen; MCP vor und nach dem Aufruf identisch
- visible_feedback: Plugin-Erfolg und unveränderter MCP-Zustand
- blocker_failure_behavior: jede MCP-Mutation lässt den Test fehlschlagen
- required_evidence: exakter Vorher-/Nachher-Vergleich für alle vier Adapter-Fixtures

### AC-04: Abbruch

- source_state: Neuinstallation oder Update vor der ersten Mutation
- trigger_action: Abbrechen
- expected_effective_state: vollständiger Zustand unverändert
- visible_feedback: `cancelled`, keine weitere Aktion erforderlich
- blocker_failure_behavior: jeder Paketbezug oder Konfigurationsschreibzugriff lässt den Test
  fehlschlagen
- required_evidence: Interaktions- und No-Mutation-Tests

### AC-05: Nicht-TTY und Optionsvalidierung

- source_state: keine interaktive Eingabe
- trigger_action: Installationsbefehl mit keiner, einer gültigen oder widersprüchlichen Setup-Option
- expected_effective_state: ohne Option Plugin-only; mit vollständiger Option gebundene
  MCP-Aktivierung; Widerspruch oder fehlendes Ziel ohne Mutation
- visible_feedback: gewählter Modus beziehungsweise konkrete Nutzungsanforderung
- blocker_failure_behavior: kein implizites MCP durch Umgebung, CI oder fehlendes TTY
- required_evidence: Parser-, Command-Registry- und Prozess-fixtures

### AC-06: Plugin-Teilfehler

- source_state: vollständige Einrichtung ausgewählt
- trigger_action: Plugin-Operation oder Rücklesung schlägt fehl
- expected_effective_state: MCP-Lifecycle wurde nicht mutierend aufgerufen
- visible_feedback: Plugin-Fehlerphase und sichere Wiederholung
- blocker_failure_behavior: kein MCP-Paketbezug und keine Registrierung
- required_evidence: injizierter Handler-Fehler und Aufrufzählung

### AC-07: MCP-Teilfehler

- source_state: Plugin verifiziert, vollständige Einrichtung ausgewählt
- trigger_action: MCP-Enable scheitert oder degradiert
- expected_effective_state: Plugin bleibt verifiziert; MCP meldet seinen eigenen Rollback; Ergebnis
  `partial`
- visible_feedback: beide Teilzustände und genau ein Retry beziehungsweise Plugin-only-Hinweis
- blocker_failure_behavior: kein falscher Gesamterfolg und kein Plugin-Rollback ohne eigenen Fehler
- required_evidence: Transaktions-, Darstellungs- und JSON-Tests

### AC-08: Update und Idempotenz

- source_state: passende oder ältere AGDF-eigene Zustände
- trigger_action: vollständiges Update oder Plugin-only-Update
- expected_effective_state: keine Duplikate; vollständiges Update gleicht MCP an; Plugin-only erhält
  MCP exakt
- visible_feedback: `unchanged`, `updated` oder sichtbare Versionsabweichung
- blocker_failure_behavior: fremde Zustände werden nicht übernommen
- required_evidence: Wiederholungs-, Migrations- und Fremdzustandstests

### AC-09: Neustart und frische Discovery

- source_state: passende Registrierung nach vollständiger Einrichtung
- trigger_action: Abschluss und anschließender Host-Neustart
- expected_effective_state: zunächst pending/unverified; erst direkte neue Sitzung kann discovered
  liefern
- visible_feedback: klare Neustart- und Prüfanweisung
- blocker_failure_behavior: Paket- oder Konfigurationsnachweis zählt nicht als Discovery
- required_evidence: getrennte Repository- und direkte Host-Protokolle

### AC-10: Sichere Entfernung

- source_state: Plugin und MCP gemeinsam oder getrennt eingerichtet, eventuell geteilte Runtime
- trigger_action: geführte Deaktivierung beziehungsweise Entfernung
- expected_effective_state: nur ausgewählte AGDF-eigene Zustände entfernt; verbleibende Referenzen
  erhalten
- visible_feedback: entfernte und erhaltene Teilzustände sowie Neustartbedarf
- blocker_failure_behavior: fremde, mehrdeutige oder nicht belegte Herkunft stoppt vor Mutation
- required_evidence: Besitz-, Referenz-, Rollback- und Vorher-/Nachher-Tests

### AC-11: Sprach- und Schema-Parität

- source_state: unterstützte Sprache und jeder Setup-Ausgang
- trigger_action: Text- oder JSON-Ausgabe
- expected_effective_state: identische stabile Bedeutungen
- visible_feedback: vollständige einsprachige Darstellung ohne verlorene Teilzustände
- blocker_failure_behavior: unbekannter Code erzeugt einen sichtbaren fail-closed Fehler
- required_evidence: Locale-Registry-, Renderer- und JSON-Kontrakttests

### AC-12: Getrennte Host-Evidenz

- source_state: fertige Paket- und Repositorytests
- trigger_action: Qualifikation einer Host-Unterstützung
- expected_effective_state: nur vollständiges exaktes Tupel kann unterstützt heißen
- visible_feedback: fehlende Discovery, Fehler-, Cleanup- oder OS-Spur bleibt `unverified`
- blocker_failure_behavior: keine Übertragung zwischen Hosts oder Betriebssystemen
- required_evidence: direkte Matrix pro behauptetem Tupel und getrennte UAT

### AC-13: Benutzerscope und lokales Aufrufverzeichnis

- source_state: interaktiver Installationsaufruf aus einem Projektwurzelverzeichnis, dessen lokaler
  Wrapper intern über `npm --prefix create-agdf` delegiert
- trigger_action: vollständige Einrichtung wählen und danach `project`, `user`, zurück, leere oder
  ungültige Eingabe verwenden
- expected_effective_state: `project` registriert für die sichtbare Projektwurzel; `user`
  registriert einmal in der nativen Benutzerkonfiguration; zurück und ungültig mutieren nichts
- visible_feedback: Projektwurzel, benutzerweite Reichweite, native Konfigurationsquelle und
  fortbestehende Zielauflösung pro Dispatch
- blocker_failure_behavior: `create-agdf` darf nicht unbeabsichtigt zum Projektziel werden und
  `user` darf nicht durch Default, leere Eingabe oder frühere Wahl entstehen
- required_evidence: Wrapper-, Interaktions-, Konfigurationsquellen-, Vorher-/Nachher- und direkte
  Hosttests für alle vier Oberflächen

## 8. Kompatibilität und Migration

- Bestehende nichtinteraktive Befehle ohne neue Optionen bleiben Plugin-only und führen keine neue
  MCP-Mutation aus.
- Bestehende Nutzer können `agdf mcp enable` weiterhin unabhängig verwenden.
- Passende bestehende AGDF-MCP-Registrierungen werden read-only erkannt und bei Plugin-only nicht
  verändert.
- Vollständige Einrichtung darf nur durch den vorhandenen MCP-Lifecycle eine exakte ältere
  AGDF-eigene Runtime migrieren.
- Fremde oder historisch nicht belegbare Registrierungen werden nicht adoptiert.
- Ein Update darf eine frühere MCP-Auswahl anzeigen, aber nicht still als aktuelle Zustimmung
  wiederverwenden.
- Lokale Entwicklung und veröffentlichte CLI müssen denselben Setup-Vertrag ausführen.
- Eine vorhandene projektbezogene Registrierung wird bei einer späteren benutzerweiten Einrichtung
  nicht still entfernt oder überschrieben. Priorität und wirksame Quelle bleiben vor der Mutation
  sichtbar und unterliegen dem vorhandenen Konfliktvertrag.

## 9. Sicherheit, Datenschutz und Autorität

- Der MCP-Server läuft lokal über `stdio` und erbt die Betriebssystemrechte des Hosts.
- Paketbezug findet nur während der ausdrücklichen Lifecycle-Aktivierung statt. Der registrierte
  Host-Einstieg verwendet kein `npx` und keine Laufzeitsuche über `PATH`.
- Die Setup-Komposition erweitert keine allgemeinen Shell-, Datei-, Edit- oder Netzwerkrechte.
- Native Trust-, Permission- und Policy-Entscheidungen bleiben beim Host.
- Es entsteht keine Telemetrie, kein AGDF-Konto und kein entfernter AGDF-Dienst.
- Technische Einrichtung und Tool-Nutzung bleiben stets nicht autorisierend.

## 10. Mess- und Nachweisplan

| Spur | Muss zeigen | Darf nicht behaupten |
|---|---|---|
| Parser und Produktvertrag | Optionsmatrix, TTY-Regeln, Ziel- und Scope-Bindung | Host-Discovery |
| Orchestrierungs-fixtures | Aufrufreihenfolge, Nichtmutation, Teilfehler und Idempotenz | native Host-Ausführung |
| Bestehende Lifecycle-Suiten | Herkunft, Runtime, Adapter, Rollback und Referenzen | gemeinsame Setup-UX |
| Paket und Runtime Integrity | veröffentlichte und installierte Pfade sind vollständig und versionsgleich | geladene Sitzung |
| Direkte Host-Evidenz | Installation, Registrierung, Neustart, Discovery, begrenzter Call und Cleanup des exakten Tupels | andere Hosts, Clients oder OS |
| Menschliche UAT | Verständlichkeit von Auswahl, Ergebnis, Blocker und Recovery | technische Vertragsvollständigkeit |

## 11. Nicht-Ziele

- Automatische oder stille MCP-Registrierung allein durch Plugin-, Marketplace-, Skill- oder
  Hook-Installation.
- Ersatz oder Änderung der kanonischen `agdf_dispatch`-Semantik.
- Ein einheitliches physisches Konfigurationsformat für alle Hosts.
- Umgehen nativer Trust-, Permission- oder Organisationsrichtlinien.
- Automatische AGDF-Gate-Freigaben.
- Veröffentlichen, Releasen, Committen, Pushen oder Erstellen eines Pull Requests.
- Allgemeine Supportaussagen ohne vollständige direkte Host-Evidenz.

## 12. Abhängigkeiten und offene technische Entscheidungen

Die Produktabsicht ist vollständig. Folgende technische Entscheidungen gehören ins Solution Design:

- Position und Schnittstelle der gemeinsamen Setup-Orchestrierung;
- stabiles zusammengesetztes Ergebnis- und JSON-Schema;
- Aufrufreihenfolge zwischen Setup-Auswahl, Runtime-Check-Consent, Plugin und MCP;
- Zustandssnapshot und Wiederaufnahme bei Teilfehlern;
- Argumentweitergabe der lokalen Entwicklungsbefehle;
- sichere Übergabe des ursprünglichen Aufrufverzeichnisses durch lokale `npm --prefix`-Wrapper;
- zweiteilige Interaktion für Installationsumfang und Scope einschließlich Zurück-Navigation;
- native Darstellung, Priorität und Konfliktbehandlung bei benutzerweiter Registrierung;
- Komposition von Status, Disable und Uninstall ohne doppelte Lifecycle-Logik;
- genaue Test-fixtures und direkte Host-Evidenzformate.

## 13. Nächster Schritt

PRD Revision 2 ist freigegeben. Sie ergänzt die bewusste interaktive Scope-Auswahl und die korrekte
Herkunft des lokalen Projektvorschlags. Das bisherige SD und TP bleiben historische Nachweise für
Revision 1. Als Nächstes wird das Solution Design gezielt revidiert. Vor freigegebenem SD und TP
für Revision 2 bleibt jede weitere Implementierung gesperrt.
