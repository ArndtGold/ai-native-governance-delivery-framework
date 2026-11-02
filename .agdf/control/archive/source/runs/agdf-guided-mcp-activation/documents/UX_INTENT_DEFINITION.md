# UX Intent Definition: Geführte MCP-Aktivierung

Status: `ready`
Decision: `ready`
Date: 2026-09-08
Run: `agdf-guided-mcp-activation`
Input: freigegebene UR Revision 1 und abgeschlossener Brownfield Review

## Entscheidungsgrundlage

- blocking_reason: `none`
- primary_user_intent: AGDF mit einer verständlichen Entscheidung so einrichten, dass Plugin und
  optionaler lokaler MCP-Zugang im selben Ablauf behandelt werden und der tatsächliche Zustand
  danach eindeutig ist.
- success_signal: Der Nutzer kann vor der Mutation zwischen vollständiger Einrichtung, Plugin-only
  und Abbruch wählen. Das Ergebnis zeigt getrennt, was installiert, registriert, entdeckt oder noch
  neu zu laden ist, und nennt genau eine passende nächste Aktion.
- primary_decision_or_action: Den gewünschten Einrichtungsumfang für den sichtbaren Host und das
  sichtbare Zielprojekt auswählen.

## Grundsätze der Interaktion

1. Die Auswahl erscheint vor der ersten neuen Plugin- oder MCP-Mutation.
2. **Vollständig einrichten (empfohlen)** ist die erste und als empfohlen gekennzeichnete Option.
   Die Kennzeichnung ist keine Vorbelegung. Erst die bewusste Auswahl autorisiert MCP-Aktivierung.
3. **Nur Plugin installieren** installiert oder aktualisiert das Plugin, ohne eine fehlende
   MCP-Registrierung anzulegen. Ein bereits vorhandener MCP-Zustand bleibt unverändert und wird
   ausdrücklich angezeigt.
4. **Abbrechen** bewahrt den Zustand vor diesem Aufruf. Bei einer Aktualisierung bleiben vorhandene
   Plugin- und MCP-Zustände bestehen.
5. Nichtinteraktive Ausführung ohne MCP-Option bleibt Plugin-only. `--with-mcp` wählt die vollständige
   Einrichtung ausdrücklich; `--plugin-only` macht dieselbe Absicht explizit.
6. `project` ist der MCP-Standard. `user` muss ausdrücklich gewählt werden. Ein nicht darstellbarer
   Scope wird niemals erweitert.
7. Bei einer interaktiven Installation ohne `--dir` wird das aktuelle Verzeichnis als vorgeschlagenes
   Projekt vollständig angezeigt. Erst die Auswahl der vollständigen Einrichtung bindet dieses
   Ziel. Nichtinteraktives `--with-mcp` erfordert ein ausdrückliches `--dir`.

## Arbeitsmodi und effektive Zustände

| Arbeitsmodus | Effektiver Zustand | Sichtbare Folge |
|---|---|---|
| `decision_required` | Noch keine Auswahl; keine neue Mutation | Host, Version, Ziel, Scope, lokale Ausführung und drei Optionen anzeigen. |
| `full_setup_requested` | Plugin-Installation und anschließende MCP-Aktivierung sind beauftragt | Fortschritt je Teiloperation anzeigen; noch keinen Gesamterfolg behaupten. |
| `plugin_only_requested` | Plugin wird installiert oder aktualisiert; MCP bleibt unverändert | Plugin-Ergebnis und beobachteten MCP-Zustand getrennt ausgeben. |
| `cancelled` | Zustand vor dem Aufruf bleibt erhalten | Abbruch und fehlende Mutation bestätigen. |
| `configured_pending_restart` | Plugin ist verifiziert und MCP ist registriert; Discovery steht aus | Neustart und frische Sitzung als nächste Aktion nennen. |
| `configured_unverified` | Registrierung und Runtime stimmen, ein frischer Tool-Nachweis fehlt | Tool-Erkennung prüfen; keine Ready- oder Supportaussage. |
| `discovered_ready` | Eine frische Host-Sitzung hat den exakten Tool-Aufruf direkt gezeigt | Exaktes Host-Tupel und weiterhin nicht autorisierende Wirkung ausgeben. |
| `plugin_ready_mcp_absent` | Plugin ist verifiziert; MCP ist nicht registriert | Ergebnis als Plugin-only benennen und MCP-Aktivierung als optionale nächste Aktion anbieten. |
| `plugin_ready_mcp_unchanged` | Plugin wurde aktualisiert; vorhandener MCP-Zustand wurde bewusst nicht verändert | Alten beobachteten MCP-Zustand und mögliche Versionsabweichung sichtbar halten. |
| `partial` | Eine Teiloperation ist erfolgreich, eine andere gescheitert oder blockiert | Erreichte Teilzustände, fehlgeschlagene Phase und genau eine Recovery-Aktion zeigen. |
| `degraded_or_foreign` | Fremde, ungültige, höher priorisierte oder nicht verifizierbare MCP-Konfiguration | Keine MCP-Mutation; Plugin-only oder Abbruch bleibt möglich. |

## Sichtbare Zustandstypen

- ausgewählter Host und AGDF-Version;
- Installationsart: Neuinstallation, Update oder unverändert;
- gewählte Einrichtung: vollständig, Plugin-only oder abgebrochen;
- Zielprojekt, gewünschter und effektiver MCP-Scope;
- Plugin-, Hook- und Runtime-Check-Zustand aus den bestehenden Ownern;
- MCP-Fähigkeit, Runtime, Registrierung und Discovery als getrennte Zustände;
- Neustartbedarf;
- Teilfehlerphase, Rollback-Ergebnis und genau eine nächste Aktion;
- `authorizes: false` für technische Einrichtung und Tool-Nutzung.

## Autorität und Darstellung

| Zustand | Wirksame Autorität | Primärer Darstellungsowner |
|---|---|---|
| Nutzerwahl | aktuelle explizite CLI-Auswahl oder ausdrückliche nichtinteraktive Option | gemeinsame Installationsinteraktion |
| Plugin installiert | native Host-Rücklesung und AGDF-Herkunftsprüfung | bestehendes Lifecycle-Ergebnis |
| Hook aktiv oder geprüft | native Host-Trust- beziehungsweise Hook-Beobachtung | bestehendes Runtime-Check-/Lifecycle-Ergebnis |
| MCP registriert | native Host-Konfiguration plus bestehende MCP-Herkunftsprüfung | bestehendes MCP-Lifecycle-Ergebnis im Installationsabschluss |
| MCP entdeckt | direkte frische Host-Sitzung | Host und separater Evidenznachweis |
| AGDF-Gate freigegeben | ausschließlich exaktes `Approval: <GateName>` im passenden Run | AGDF-Gate- und Interaktionsowner |

Die gemeinsame Installationsausgabe stellt vorhandene Ergebnisse zusammen. Sie entscheidet keinen
dieser Zustände selbst und ersetzt keine native Rücklesung.

## Aktivierungspfade

### Interaktive Neuinstallation

1. Host und Ausgangszustand lesen.
2. Ziel und Scope für die mögliche MCP-Aktivierung anzeigen.
3. Vollständige Einrichtung, Plugin-only oder Abbruch auswählen.
4. Nur die ausgewählten bestehenden Lifecycle-Operationen ausführen.
5. Teilzustände und nächste Aktion anzeigen.

### Interaktives Update

- Bei passender AGDF-MCP-Registrierung lautet die empfohlene Auswahl sinngemäß **Plugin und MCP
  aktualisieren**.
- Die zweite Auswahl lautet **Plugin aktualisieren, MCP unverändert lassen**. Sie deaktiviert oder
  entfernt MCP nicht.
- Fremde oder konfliktbehaftete MCP-Zustände sperren nur die MCP-Mutation. Plugin-only bleibt
  verfügbar, sofern der Plugin-Installer selbst sicher fortfahren kann.

### Nichtinteraktiv

- ohne ausdrückliche MCP-Option: Plugin-only;
- mit `--with-mcp --dir <absolutes-ziel>`: vollständige Einrichtung im Standard-Scope `project`;
- mit `--with-mcp --scope user --dir <absolutes-ziel>`: ausdrücklicher Benutzer-Scope;
- widersprüchliche Optionen oder fehlendes `--dir`: Abbruch vor Mutation mit Nutzungsfehler.

### Marketplace oder Host-UI

Wenn der Host nur das Plugin installiert und keinen AGDF-CLI-Callback erlaubt, zeigt die erste
geeignete AGDF-Interaktion den Zustand `MCP nicht eingerichtet` und genau den geführten CLI-Befehl.
Sie führt keine MCP-Mutation aus dem Chat oder Plugin-Hook heraus aus.

## Blocker und sichtbare nächste Aktionen

| Blocker | Sichtbare Folge | Nächste Aktion |
|---|---|---|
| Node-Version oder MCP-Paket nicht verfügbar | Plugin-Ergebnis behalten; MCP als nicht eingerichtet oder fehlgeschlagen ausgeben | Genannte Voraussetzung korrigieren und MCP-Aktivierung erneut ausführen. |
| Fremde oder höher priorisierte Registrierung | Vor MCP-Mutation stoppen; Quelle und Scope nennen | Fremde Quelle bewusst klären; danach denselben Setup-Pfad wiederholen. |
| Plugin-Installation schlägt fehl | MCP nicht beginnen | Plugin-Fehler beheben und Installation wiederholen. |
| MCP-Aktivierung schlägt nach Plugin-Erfolg fehl | Plugin behalten; MCP-Transaktion verwendet ihren eigenen Rollback | Angezeigten MCP-Retry ausführen oder Plugin-only beibehalten. |
| MCP-Version bleibt bei Plugin-only abweichend | Abweichung nicht verstecken | Vollständige Einrichtung später bewusst auswählen. |
| Neustart oder Trust fehlt | Registrierung nicht als Discovery ausgeben | Host neu starten beziehungsweise native Trust-Entscheidung treffen und frische Sitzung prüfen. |
| Deaktivierung oder Entfernung kann Herkunft nicht beweisen | Nichts entfernen | Benannte Quelle beziehungsweise Referenz klären und erneut prüfen. |

## Recovery-Grundsätze

- Ein Plugin-Erfolg wird bei anschließendem MCP-Fehler nicht automatisch zurückgerollt. Das Plugin
  ist ein nutzbarer, eigenständig verifizierter Zustand. Die Ausgabe lautet `partial`.
- Der MCP-Lifecycle rollt ausschließlich seine eigene fehlgeschlagene Transaktion auf den vorherigen
  MCP-Zustand zurück.
- Ein Retry beginnt mit erneuter Status- und Herkunftsprüfung und setzt keine frühere Auswahl still
  voraus.
- Plugin-only entfernt keine vorhandene MCP-Registrierung.
- Gekoppelte Entfernung bietet vor Mutation getrennte, aktuelle Plugin- und MCP-Zustände. Eine
  MCP-Entfernung wird nur über den vorhandenen ownership- und referenzgeprüften Lifecycle ausgeführt.

## Relevante Zustandsübergänge

```text
decision_required -> cancelled
decision_required -> plugin_only_requested -> plugin_ready_mcp_absent|plugin_ready_mcp_unchanged
decision_required -> full_setup_requested
full_setup_requested -> configured_pending_restart|partial|degraded_or_foreign
configured_pending_restart -> configured_unverified -> discovered_ready
partial -> decision_required        (bewusster Retry)
plugin_ready_mcp_absent -> decision_required   (spätere Aktivierung)
plugin_ready_mcp_unchanged -> decision_required (spätere Angleichung)
```

## Vorgeschlagene PRD-Akzeptanzkriterien

1. Jede interaktive Neuinstallation und jedes Update zeigt vor Mutation die drei erlaubten
   Entscheidungen in zustandsangemessener Sprache.
2. Die empfohlene vollständige Einrichtung ist sichtbar, aber nie vorselektiert oder aus fehlender
   Eingabe abgeleitet.
3. Nicht-TTY-Ausführung bleibt ohne `--with-mcp` Plugin-only; `--with-mcp` erfordert ein absolutes
   Ziel und lehnt widersprüchliche Optionen vor Mutation ab.
4. Plugin-only legt keine MCP-Registrierung an und entfernt oder verändert keine vorhandene.
5. Vollständige Einrichtung verwendet nur die bestehenden Plugin- und MCP-Lifecycle-Owner.
6. Gemeinsamer Erfolg erfordert verifizierte Plugin-Installation und passende MCP-Registrierung;
   Discovery bleibt bis zur frischen Host-Beobachtung separat.
7. Jeder Teilfehler zeigt Phase, erreichten Zustand, Rollback und genau eine sichere nächste Aktion.
8. Update, Retry und Entfernung bewahren fremde Einstellungen und gemeinsam genutzte Runtimes.
9. JSON und menschliche Ausgabe transportieren dieselben stabilen Teilzustände und immer
   `authorizes: false`.
10. Direkte Evidenz qualifiziert nur das exakte beobachtete Host-Tupel.

## Offene Produktfragen

- open_product_questions: `none`
- clarification: Technische Schemata, Funktionsaufteilung und Transaktionskomposition gehören in
  das Solution Design. Sie verändern die hier festgelegte Nutzerwirkung nicht.

## Betroffene Ausgaben

- interaktive Installations- und Update-Abfrage;
- nichtinteraktive CLI-Hilfe und Fehler;
- kompakter und JSON-basierter Installationsabschluss;
- Status-, Retry-, Restart-, Disable- und Uninstall-Hinweise;
- Dokumentation und direkte Host-Testprotokolle.

## Evidenz und Grenzen

- evidence: freigegebene UR Revision 1; Brownfield Review; bestehende Plugin-Installer,
  Runtime-Check-Interaktion, MCP-Lifecycle-, Lifecycle-Result- und Host-Adapter-Owner; direkte
  Beobachtung, dass Codex-Plugin aktiv und AGDF-MCP nicht registriert ist.
- missing_evidence: Die vorgeschlagenen Kriterien sind noch nicht Teil eines freigegebenen PRD;
  technische Umsetzung, gerenderte Host-Interaktion und Cross-Host-Verhalten sind unbewiesen.
- required_next_step: Die Kriterien in PRD Revision 1 übernehmen, dort fachlich verbindlich machen
  und `Approval: PRD` anfordern.

