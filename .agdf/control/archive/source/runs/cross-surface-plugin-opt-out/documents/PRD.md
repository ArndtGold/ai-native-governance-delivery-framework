# PRD: Plugin-Lifecycle über alle Oberflächen klar und sicher steuern

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Revision: 1
Based on: UR revision 2
Date: 2026-09-02
Owner: Arndt Gold

## 1. Product Scope

AGDF liefert eine eindeutige Lifecycle-Matrix für Codex, Claude Code, GitHub Copilot und OpenCode.
Sie trennt Installation, Status, persönliche Projektdeaktivierung, gemeinsame Projektdeaktivierung,
Repository-Aktivierung und globale Entfernung.

Für GitHub Copilot erweitert der bestehende Befehl
`disable --surface copilot --scope repository` das öffentliche Verhalten:

- Ohne zusätzliche gemeinsame Auswahl deaktiviert er AGDF persönlich für das aktuelle Projekt.
- Mit einer expliziten gemeinsamen Auswahl deaktiviert er AGDF für das Repository und macht die
  Wirkung für Mitarbeitende sowie unterstützte Copilot-Repository-Consumer sichtbar.
- Beide Modi verändern nur den exakten AGDF-Plugin-Eintrag und erhalten andere Einstellungen sowie
  `.agdf/control`.

Die konkrete Bezeichnung der gemeinsamen CLI-Option und die atomare Dateistrategie werden im
Solution Design festgelegt. Die Produktaussage ist verbindlich: persönlich ist der sichere Standard,
gemeinsam ist immer explizit.

## 2. UX Intent And Success

- ui_ux_impact: `none`
- ux_intent_definition: `not_applicable`, weil keine Anwendungsoberfläche, kein visueller Zustand und kein interaktiver Arbeitsmodus geändert wird
- primary_user_intent: AGDF in einem bestimmten Projekt deaktivieren, ohne andere Projekte oder unbeabsichtigt das ganze Team zu beeinflussen
- success_signal: Der Lifecycle-Bericht nennt Oberfläche, Wirkungskreis, geänderte Konfiguration, erhaltene Daten, Verifikationsgrenze und genau einen nächsten Schritt
- primary_decision_or_action: Persönliche Deaktivierung direkt ausführen oder eine gemeinsame Repository-Deaktivierung ausdrücklich auswählen

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Status prüfen | Installation, Repository-Aktivierung und Delivery-Zustand bleiben getrennt | Lifecycle-Bericht mit Installation, Aktivierung und Delivery | Host-Zustand plus AGDF-Validator | bestehende Lifecycle-Präsentation |
| Persönlich in Copilot deaktivieren | AGDF-Plugin ist für den aktuellen Nutzer in diesem Projekt deaktiviert | persönlicher Wirkungskreis, Konfigurationspfad, Neustart und Prüfschritt | effektive Copilot-Konfigurationsauflösung | bestehende `disable`-Ausgabe |
| Gemeinsam in Copilot deaktivieren | AGDF-Plugin ist durch Repository-Konfiguration für die betroffenen Consumer deaktiviert | gemeinsame Wirkung, Commit-Relevanz, Cloud-Agent-Grenze und Prüfschritt | effektive Copilot-Konfigurationsauflösung | bestehende `disable`-Ausgabe |
| Codex projektbezogen deaktivieren | bestehender Codex-Plugin-Eintrag bleibt repository-lokal deaktiviert | unveränderte Codex-Lifecycle-Ausgabe | `.codex/config.toml` plus Host-Neustart | bestehende `disable`-Ausgabe |
| Claude Code und OpenCode einordnen | nur tatsächlich unterstützte Deaktivierungs- oder Aktivierungsmechanismen werden ausgewiesen | explizit unterstützt, Aktivierungsmarker oder nicht unterstützt | jeweiliger Host und bestehende AGDF-Adapter | Support-Matrix und Lifecycle-Fehlerausgabe |
| Global entfernen | ausgewählte Oberfläche wird nach Vorschau und Bestätigung entfernt | Vorschau, bestätigte Änderungen, erhaltene Daten und Neustart | jeweiliger Host oder AGDF-eigene globale Konfiguration | bestehende `uninstall`-Ausgabe |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Persönlicher Copilot-Opt-out ist der Standard. Gemeinsame Wirkung benötigt eine explizite CLI-Auswahl. Codex behält seinen bestehenden Repository-Pfad. Claude Code und OpenCode erhalten keine erfundene symmetrische Deaktivierung.
- blockers_and_visible_next_actions: Ungültige JSON-Struktur, symbolische oder unbesitzbare Pfade, mehrdeutige AGDF-Einträge, nicht sicher ausschließbare lokale Dateien und verwaltete Host-Richtlinien müssen ohne Teiländerung stoppen und einen konkreten nächsten Schritt nennen.
- recovery_paths: Wiederholung nach Korrektur der gemeldeten Konfiguration. Host-Neustart und getrennte Prüfung von Plugin- sowie Instruktionszustand. Globale Deinstallation bleibt ein eigener bestätigungspflichtiger Vorgang.
- relevant_state_transitions: Aktiv zu persönlich deaktiviert, aktiv zu gemeinsam deaktiviert und installiert zu global entfernt. Jeder Übergang zeigt Quelle, Ziel, Wirkungskreis, Änderung, erhaltene Daten, Verifikationsstatus und Recovery. Fehlschlag oder unklare Host-Wirkung darf nicht als erfolgreich deaktiviert erscheinen.

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success | required evidence |
|---|---|---|---|---|---|---|---|---|---|
| PRD-01 | Status prüfen | beliebiger unterstützter Host-Zustand | Support-Matrix oder Statushilfe öffnen | alle vier Oberflächen sind vollständig und widerspruchsfrei eingeordnet | Matrix zeigt Status, lokalen Opt-out, Aktivierung und globale Entfernung | unbekannte Fähigkeiten werden als nicht verifiziert oder nicht unterstützt gezeigt | passenden Host- oder Dokumentationsnachweis erbringen | keine Oberfläche fehlt und keine Symmetrie wird erfunden | Dokumentationstest und CLI-Hilfe-Test |
| PRD-02 | Persönlich in Copilot deaktivieren | AGDF global verfügbar | `disable` für Copilot und Repository-Scope ohne gemeinsame Auswahl | exakter AGDF-Eintrag ist in der persönlichen lokalen Projektkonfiguration `false` | Bericht nennt persönlichen Wirkungskreis, Pfad, erhaltene Daten und Neustart | nicht sicher vor Commit geschützte oder ungültige Konfiguration stoppt ohne Teiländerung | Schutz herstellen oder gemeinsame Auswahl bewusst verwenden | andere Copilot-Werte bleiben byte-semantisch erhalten und globale Verfügbarkeit bleibt bestehen | Erstellungs-, Merge-, Idempotenz-, Ignore- und Rollback-Tests |
| PRD-03 | Gemeinsam in Copilot deaktivieren | AGDF global oder repository-seitig verfügbar | explizite gemeinsame CLI-Auswahl | exakter AGDF-Eintrag ist in der gemeinsamen Repository-Konfiguration `false` | Bericht warnt vor Team- und unterstützter Cloud-Agent-Wirkung | fehlende explizite Auswahl oder ungültige Konfiguration stoppt ohne Mutation | Auswahl bewusst wiederholen oder Konfiguration korrigieren | gemeinsamer Pfad ist commit-fähig und fremde Werte bleiben erhalten | CLI-, Merge-, Idempotenz- und Retention-Tests |
| PRD-04 | Copilot deaktivieren | fremde Einstellungen vorhanden | persönlicher oder gemeinsamer Opt-out | nur `enabledPlugins["agdf@agdf"]` ändert sich | Änderung und Retention sind sichtbar | symbolischer Pfad, falscher Typ oder mehrdeutiger Eintrag schlägt fail-closed fehl | Datei kontrolliert reparieren und erneut ausführen | kein fremder Schlüssel wird entfernt oder verändert | negative Pfad-, Schema- und Ownership-Fixtures |
| PRD-05 | Effektiven Zustand prüfen | verwaltete Richtlinie oder unbekannter Host-Zustand | Deaktivierung ausführen und verifizieren | Erfolg wird nur bei belegtem Postzustand gemeldet | `managed`, `pending_restart`, `degraded` oder gleichwertiger ehrlicher Zustand bleibt sichtbar | Befehlsannahme allein gilt nicht als effektive Deaktivierung | Host neu starten und Plugin-Status separat prüfen | Lifecycle-Ausgabe übertreibt keine Repository- oder Fixture-Evidenz | Policy-, Status- und Fresh-Session-Evidence |
| PRD-06 | Instruktionen prüfen | Plugin ist deaktiviert | `/instructions` und `/plugin list` getrennt prüfen | Plugin-Komponenten sind deaktiviert, anwendbare Repository-Instruktionen bleiben unabhängig | Dokumentation nennt `AGENTS.md`, Copilot-Instruktionen und die getrennten Prüfflächen | Plugin-Ausgabe darf nicht behaupten, alle Instruktionen seien deaktiviert | Instruktionsdateien separat deaktivieren oder entfernen | Plugin- und Instruktionszustand werden nicht vermischt | Dokumentationsassertion und Host-UAT |
| PRD-07 | Codex projektbezogen deaktivieren | bestehende Codex-Konfiguration | bestehender Codex-Befehl | Verhalten und Retention bleiben unverändert | vorhandener Lifecycle-Bericht bleibt kompatibel | mehrdeutige Konfiguration stoppt weiterhin fail-closed | Konfiguration reparieren und erneut ausführen | bestehende Codex-Tests bleiben unverändert grün | Lifecycle-Regressionstest |
| PRD-08 | Claude Code und OpenCode einordnen | globale AGDF-Installation | Matrix oder nicht unterstützten lokalen Opt-out verwenden | Claude zeigt keinen unbelegten lokalen Disable-Pfad. OpenCode trennt Repository-Aktivierung von Plugin-Deaktivierung | klare unterstützte und nicht unterstützte Zustände | nicht unterstützte Kombination verändert keine Dateien | unterstützten globalen oder Aktivierungsweg verwenden | Retention bleibt vollständig und Fehlermeldung ist handlungsfähig | negative Surface-Fixtures und Dokumentationstest |
| PRD-09 | Global entfernen | AGDF installiert | `uninstall` mit Oberfläche, globalem Scope und optionaler Bestätigung | Vorschau mutiert nichts. Bestätigung entfernt nur AGDF-eigene globale Einträge | alle vier Oberflächen haben exakte Beispiele und Retention-Hinweise | ohne Bestätigung keine Mutation. Unklare Ownership stoppt | Vorschau prüfen und bewusst bestätigen | bestehende globale Uninstall-Tests bleiben grün | Lifecycle- und Dokumentationsregression |

## 6. Non-Goals

- Keine projektbezogene Claude-Code-Deaktivierung ohne verifizierten offiziellen Host-Mechanismus.
- Keine neue OpenCode-Deaktivierungssemantik. Der bestehende Repository-Aktivierungsmarker bleibt
  davon getrennt.
- Kein automatisches Löschen oder Ändern von `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `.github/copilot-instructions.md` oder pfadspezifischen Instruktionen.
- Keine Änderung der AGDF-Gates, Freigabeformeln oder dauerhaften Run-Historie.
- Keine globale Deinstallation als Nebenwirkung eines Repository-Opt-outs.
- Keine Behauptung, dass deterministische Tests einen frisch gestarteten Host beweisen.

## 7. Users And Roles

- Einzelne Entwickelnde wählen den persönlichen Standard-Opt-out.
- Repository-Verantwortliche wählen bewusst den gemeinsamen Opt-out und prüfen die commit-relevante
  Änderung.
- Organisationen oder Geräteverwaltung können Plugin-Werte vorgeben. AGDF meldet diese Grenze, kann
  sie aber nicht überstimmen.
- AGDF-Maintainer verantworten CLI-, Lifecycle-, Settings-, Dokumentations- und Testkonsistenz.

## 8. Constraints

- Vorhandene, fremde Konfiguration und `.agdf/control` bleiben erhalten.
- Lokale persönliche Einstellungen dürfen nicht versehentlich eingecheckt werden.
- Gemeinsame Einstellungen dürfen nur nach expliziter Auswahl verändert werden.
- Schreiben muss fail-closed, pfadsicher und als zusammenhängender Lifecycle-Vorgang erfolgen.
- JSONC-Unterstützung des Hosts darf nicht stillschweigend als verlustfrei schreibbares JSON behandelt
  werden. SD muss festlegen, ob Kommentare sicher erhalten werden können oder der Vorgang ablehnt.
- Plugin-Deaktivierung, Instruktionsladen, Host-Berechtigungen und AGDF-Gate-Autorität bleiben getrennt.
- Repository-, Paket-, installierter Host- und Fresh-Session-Nachweise bleiben getrennte Evidence Planes.

## 9. Evidence Requirements

- Positive Tests für neue persönliche und gemeinsame Copilot-Konfiguration.
- Negative Tests für ungültige Typen, JSONC oder Kommentare, Symlinks, unbesitzbare Pfade,
  mehrdeutige Einträge und nicht sicher ausschließbare lokale Dateien.
- Idempotenz-, Fremdwert-Retention-, Teilfehler- und Rollback-Nachweise.
- Unveränderte Codex-Disable- und globale Uninstall-Regressionen für alle unterstützten Oberflächen.
- CLI-Hilfe- und Dokumentationsassertionen für die vollständige Support-Matrix.
- Bounded Host-UAT in einer frischen Copilot-Sitzung für Plugin-Status und getrennte Instruktionssicht.
- Keine Claude- oder OpenCode-Paritätsaussage ohne direkten separaten Nachweis.

## 10. Risks And Open Questions

- SD muss den genauen CLI-Schalter für gemeinsame Wirkung und dessen Ablehnung auf anderen
  Oberflächen festlegen.
- SD muss einen einzigen atomaren Settings-Owner für Nutzer-, lokale und gemeinsame Pfade bestimmen.
- SD muss den persönlichen Git-Ignore-Schutz ohne überraschende gemeinsame Repository-Mutation lösen.
- SD muss JSONC und Kommentare explizit behandeln, da der bestehende Reader nur JSON verlustfrei
  round-trippen kann.
- TP muss festlegen, wie verwaltete Richtlinien und effektiver Host-Zustand ohne falsche
  Erfolgsbehauptung geprüft werden.

## 11. Next Step

PRD revision 1 was approved with exact approval after same-run, same-gate and revision revalidation.
The next artefact is Solution Design revision 1.

Review the Solution Design and approve only with `Approval: SD`.
