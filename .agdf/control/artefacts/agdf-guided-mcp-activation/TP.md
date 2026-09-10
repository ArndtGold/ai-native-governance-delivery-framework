# TP: Geführte MCP-Aktivierung während der AGDF-Installation

Status: approved
Gate: TP
Gate approval: Exact `Approval: TP` accepted on 2026-09-09 after same-target, same-run, same-gate
and run revision `E40A4773-D868-46B2-BFCD-35E295A40FBC` revalidation. Revision 1 approval remains
historical.
Revision: 2
Date: 2026-09-09
Owner: Arndt Gold / Codex
Run: agdf-guided-mcp-activation
Based on: approved PRD Revision 2, approved SD Revision 2, approved UR Revision 1 and completed Brownfield Review
Delivery depth: Structured Delivery

## 1. Umsetzungsziel und Grenzen

Die Umsetzung erweitert die bestehenden Installationsbefehle für Codex, Claude Code, GitHub
Copilot und OpenCode um eine gemeinsame, bewusste Setup-Auswahl. Die vollständige Einrichtung
verwendet nach erfolgreicher Plugin-Verifikation ausschließlich den vorhandenen MCP-Lifecycle.
Plugin-only und bestehende nichtinteraktive Aufrufe bleiben MCP-nichtmutierend.

Revision 2 ergänzt den früheren Plan um zwei direkt beobachtete Lücken: Die interaktive
Vollinstallation benötigt eine eigene bewusste Auswahl zwischen Projekt- und Benutzerscope, und
der lokale npm-Wrapper muss das ursprüngliche Aufrufverzeichnis statt seines technischen
`create-agdf`-Unterverzeichnisses an den CLI-Parser binden. Die bestehende Umsetzung aus Revision 1
bleibt Regressionsbasis. Sie gilt nicht als Nachweis für die neuen Aufgaben.

Die Arbeit führt keinen zweiten Installer, MCP-Server, Dispatcher, Host-Adapter, Consent-Store,
Locale-Owner, Lifecycle-Status oder Gate-Owner ein. Repositorytests verwenden ausschließlich
temporäre Verzeichnisse und injizierte Hostoperationen. Eine TP-Freigabe autorisiert keine
Installation in realen Benutzerprofilen, keine Hostregistrierung, Veröffentlichung, Freigabe,
Commit-, Push- oder Pull-Request-Aktion.

## 2. Aufgabenplan

| task_id | Aufgabe | Anforderungsbezug | Erforderlicher Nachweis |
|---|---|---|---|
| GMA-01 | Vor der Implementierung den aktuellen Branch-, Datei- und Generierungsstand erfassen, den Run erneut prüfen und eine fokussierte Brownfield Analysis der tatsächlichen CLI-, Installer-, Consent-, Lifecycle-, MCP-, Locale- und Entfernungspfade durchführen. | GMCP-05, GMCP-16, GMCP-20 | Baseline mit getrennten vorhandenen Änderungen; Brownfield Analysis `pass`; kein ungeklärter Owner oder Pfad. |
| GMA-02 | `parse-args.js`, `command-registry.js` und Usage um `--with-mcp`, `--plugin-only`, absolute Eingabebindung, Installations-Scope und `--mcp-scope` für gekoppelte Entfernung erweitern. | GMCP-02 bis GMCP-04, GMCP-17 | Vollständige positive und negative CLI-Matrix; jeder ungültige Fall stoppt vor Handler und Mutation. |
| GMA-03 | Die bestehende OpenCode-`--dir`-Bedeutung schützen und die neue vollständige Kombination exakt nach SD AD-02 auflösen. | GMCP-04, GMCP-08, GMCP-16 | Regression für bestehendes `opencode --dir <config>`; neue `--with-mcp --dir <projekt>`-Fälle; beide Pfade zeigen getrennte Ziele. |
| GMA-04 | `create-agdf/lib/install-setup/contract.js` mit geschlossenem Preflight-, Ergebnis-, Zustands-, Fehler- und Next-Action-Vertrag sowie `authorizes: false` implementieren. | GMCP-01 bis GMCP-04, GMCP-12, GMCP-19 | Contract-Tests lehnen unbekannte Codes, ungültige Teilzustände, mehrere nächste Aktionen und Autorisierung ab. |
| GMA-05 | `install-setup/interaction.js` als mutierungsfreie, injizierbare Auswahl für `full`, `plugin_only` und `cancel` implementieren. Empfehlung darf kein Defaultwert sein. | GMCP-01, GMCP-02, GMCP-18 | Tests für Auswahl, leere und ungültige Eingabe, EOF, Abbruch und gesperrtes Full-Setup; Aufrufzählung belegt Nullmutation. |
| GMA-06 | Einen read-only Setup-Preflight über bestehende Plugin-Inspektion und MCP `status` implementieren. Zielquelle, Scope, OpenCode-Konfigurationspfad, lokale Ausführung, Paketbezug und Entfernungspfad vollständig ausgeben. | GMCP-01, GMCP-04, GMCP-05, GMCP-11 | Preflight-Fixtures je Oberfläche; kein Paketmanager, Verzeichnis, Login oder Konfigurationsschreiben. |
| GMA-07 | `install-setup/service.js` mit der freigegebenen Reihenfolge aus SD AD-06 implementieren und die vier vorhandenen Plugin-Operationen als injizierte bestehende Owner anbinden. | GMCP-05 bis GMCP-07, GMCP-14 | Sequenztests für Preflight, Setup-Auswahl, Runtime-Check-Auswahl, Plugin, Consent-Finalisierung, MCP und Ergebnis. |
| GMA-08 | Plugin-only, Abbruch und Nicht-TTY-Verhalten implementieren. Ein beobachteter MCP-Zustand muss byte- beziehungsweise strukturidentisch erhalten bleiben. | GMCP-02, GMCP-03, GMCP-09 | Vorher-/Nachher-Vergleich aller vier Adapter-Fixtures; kein MCP-Enable, -Disable oder Paketbezug. |
| GMA-09 | Vollständige Einrichtung über den bestehenden MCP-`enable`-Owner integrieren. MCP darf nur nach verifiziertem Plugin und gebundenem Ziel beginnen. | GMCP-04 bis GMCP-06, GMCP-10, GMCP-13 | Aufrufreihenfolge, Scope, Ziel, Idempotenz, Update, Pending-Restart und fehlende Discovery sind exakt belegt. |
| GMA-10 | Teilfehler und Recovery umsetzen: Plugin-Fehler stoppt MCP, Runtime-Check-Fehler bleibt getrennt, MCP-Fehler bewahrt Plugin und übernimmt nur MCP-eigenen Rollback. | GMCP-07, GMCP-08, GMCP-11, GMCP-12 | Fehler je Phase; erreichte und erhaltene Zustände; genau eine nächste Aktion; kein falscher Gesamterfolg. |
| GMA-11 | `install-setup/presentation.js` und den Bereich `installSetup` in der kanonischen Locale-Registry ergänzen. Text und JSON müssen aus demselben validierten Ergebnis entstehen. | GMCP-12, GMCP-18, GMCP-19 | Vollständige Englisch-/Deutsch-Pakete, unsupported-language-Fallback, unbekannter-Code-Fehler und Text-/JSON-Parität. |
| GMA-12 | Den allgemeinen Status bei ausdrücklichem Ziel read-only um MCP ergänzen und gekoppelte Repository-Deaktivierung über bestehendes MCP-Disable und Plugin-Disable komponieren. | GMCP-09, GMCP-11, GMCP-17 | Status-Nullmutation; sichere Reihenfolge; Fremdzustand stoppt; Teilfehler bleibt sichtbar. |
| GMA-13 | Gekoppelte globale Entfernung mit Preview, Revalidierung, ausdrücklichem `--with-mcp`, `--mcp-scope`, MCP-Disable und anschließendem bestehendem Plugin-Uninstall implementieren. | GMCP-10, GMCP-11, GMCP-17 | Preview-/Confirm-Test, Herkunfts- und Referenztests, Fremdzustand bleibt erhalten, gemeinsame Runtime erst bei letzter Referenz entfernt. |
| GMA-14 | `install-local-plugin.js` auf unveränderte Argumentweitergabe nach `release:prepare` umstellen und für alle vier Oberflächen dieselben Adapter- und Interaktionsseams verwenden. | GMCP-16 | Tests für Argumentreihenfolge, frischen Checkout, OpenCode-Paketquelle und fehlende Wrapper-Semantik. |
| GMA-15 | Installations-, Architektur- und MCP-Dokumentation für Einsteiger aktualisieren. Auswahl, Ziel, Scope, OpenCode-Sonderfall, Teilzustände, Neustart, sichere Entfernung und Evidenzgrenzen müssen anhand vollständiger Beispiele erklärt sein. | GMCP-01 bis GMCP-04, GMCP-13, GMCP-15 bis GMCP-20 | `INSTALL.md`, `create-agdf/README.md`, `docs/architecture/README.md` und bei Bedarf `agdf-mcp-server/README.md`; Beispiele werden gegen Usage- und Parsertests geprüft. |
| GMA-16 | Neue fokussierte Suiten in `create-agdf/package.json`, `release:prepare` und `smoke-test` integrieren, generierte Assets nur über den kanonischen Sync aktualisieren und Runtime-/Paketintegrität prüfen. | alle Anforderungen | Fokus- und Gesamtsuiten bestehen ohne gelockerte Assertions; generierter Diff ist erklärbar und versionsgleich. |
| GMA-17 | Bestehende Kontextgraph-Knoten erst nach implementierter und geprüfter Beziehung aktualisieren. | GMCP-05, GMCP-19, GMCP-20 | `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-MCP-DISPATCH-ADAPTER` und `CG-NATIVE-INTERACTION-AUTHORITY` nennen Owner, Grenzen und Evidenz. |
| GMA-18 | `CD_TESTS.md` mit Aufgaben-, Kriterien- und Risikomatrix erstellen und Repository, Paket, installierten Host, frische Sitzung, Betriebssystem und UAT getrennt halten. | alle Anforderungen und AC-01 bis AC-12 | Vollständige GMA-01-bis-GMA-17- und AC-Matrix; fehlende direkte Evidenz bleibt offen und wird nicht übertragen. |
| GMA-19 | Den Setup-Vertrag um getrennte scopespezifische Preflights, Scope-Verfügbarkeit, wirksame native Quelle, Registrierungspfad, Blocker, Entfernungspfad und Quelle des Aufrufverzeichnisses erweitern. | GMCP-01, GMCP-04, GMCP-05, GMCP-11, GMCP-12, AC-13 | Contract-Tests für `mcp_by_scope.project` und `mcp_by_scope.user`; unbekannte oder widersprüchliche Zustände scheitern geschlossen. |
| GMA-20 | Die Interaktion nach `full` um die separate Auswahl `project | user | back` ohne Default ergänzen. `back` kehrt ohne Mutation zur Setup-Auswahl zurück; leer, ungültig und EOF binden keinen Scope. | GMCP-01, GMCP-02, GMCP-04, GMCP-18, AC-13 | Interaktionstests belegen zwei getrennte Entscheidungen, Wiederholung, Rückkehr und Nullmutation. |
| GMA-21 | Im Setup-Service beide Scopes vor der Auswahl read-only inspizieren und ausschließlich den bewusst gewählten Scope an den bestehenden MCP-`enable`-Owner übergeben. Die native Priorität bleibt Host-Adapter-Semantik. | GMCP-04 bis GMCP-08, GMCP-10, AC-13 | Sequenz- und Aufrufzählungstests für vier Oberflächen, beide Scopes, Konflikt, Priorität und unveränderte nichtinteraktive Aufrufe. |
| GMA-22 | Darstellung und Locale-Paket um Scope-Karte, Projektziel, benutzerweiten Hoststandard, native Konfigurationsquelle, wirksame Priorität, Entfernungskommandos und eindeutige Ergebnisfelder erweitern. | GMCP-01, GMCP-11 bis GMCP-13, GMCP-18, GMCP-19, AC-11, AC-13 | Deutsch-/Englisch-Parität; fehlende oder nicht unterstützte Sprache fällt vollständig auf Englisch zurück; keine gemischte Karte. |
| GMA-23 | Den lokalen Entwicklungswrapper so ändern, dass er vor Vorbereitung und Mutation ein vorhandenes `INIT_CWD` als absolutes existierendes Verzeichnis validiert, per `realpath` normalisiert und als Parser-cwd injiziert. Fehlt `INIT_CWD`, wird `process.cwd()` verwendet. | GMCP-04, GMCP-16, AC-13 | Tests für gültiges, fehlendes, relatives, nicht existentes und dateibasiertes `INIT_CWD`; ungültige Werte stoppen vor `release:prepare`. |
| GMA-24 | Parser- und Application-Integration so verdrahten, dass der Wrapper nur den validierten cwd-Kontext transportiert und keine Setup-Optionen selbst interpretiert. OpenCode-`--dir` und explizite nichtinteraktive Optionen bleiben kompatibel. | GMCP-03, GMCP-04, GMCP-16, AC-13 | CLI- und Wrappertests belegen unveränderte Argumente, richtige Zielquelle und keine doppelte Semantik. |
| GMA-25 | Die vollständige Testmatrix um Projekt- und Benutzerscope, native Priorität, `back`, Nullmutation, falsches Wrapper-cwd und Ergebnisprojektion erweitern. | alle Anforderungen, AC-01 bis AC-13 | Fokus-Suiten sowie Gesamtsuite bestehen; jede neue Anforderung besitzt positive, negative und Nichtmutations-Evidenz. |
| GMA-26 | Einsteigerdokumentation und Architektur um Reichweite, Priorität, Zielautorität, ursprüngliches Aufrufverzeichnis, lokale Installation und die Versionsgrenze ergänzen. Version 0.14.5 bleibt ausdrücklich MCP-frei; die Änderung gilt für die unveröffentlichte Folgeversion. | GMCP-13, GMCP-15, GMCP-16, GMCP-20, AC-13 | Beispiele in `INSTALL.md`, `create-agdf/README.md` und `docs/architecture/README.md` stimmen mit Parser, Ausgabe und Versionsvertrag überein. |
| GMA-27 | Nach der Implementierung die drei bestehenden Kontextgraph-Knoten aktualisieren und Task Plan Review, Clean Implementation Review sowie Code Review für Revision 2 neu ausführen. | GMCP-05, GMCP-19, GMCP-20, AC-13 | Kontextgraph reconciled; Reviews beziehen GMA-19 bis GMA-26 und AC-13 ein und enthalten keine übertragene frühere Freigabe. |
| GMA-28 | `CD_TESTS.md`, QA-Bericht und UAT-Vorbereitung für Revision 2 neu erstellen. Repository-, Paket-, installierte Host-, frische Sitzungs-, Betriebssystem- und menschliche Evidenz bleiben getrennt. | alle Anforderungen und AC-01 bis AC-13 | Neue vollständige Matrix; QA entscheidet aus aktueller Evidenz; direkte Host- und UAT-Lücken bleiben explizit unverified. |

## 3. Zulässige Implementierungspfade

Die Umsetzung darf nur diese Owner und ihre direkten Test-, Dokumentations- und Generierungsfolgen
ändern:

- neu: `create-agdf/lib/install-setup/{contract,interaction,presentation,service}.js`;
- `create-agdf/lib/cli/{parse-args,command-registry,application}.js`;
- bestehende Installer unter `create-agdf/lib/installers/` nur für dünne Rückgabe- oder
  Integrationsseams, nicht für neue parallele Orchestrierung;
- `create-agdf/lib/runtime-check-consent/` nur wenn die bestehende injizierbare Entscheidung oder
  Ergebnisübergabe eine kleine kompatible Erweiterung benötigt;
- `create-agdf/lib/lifecycle/{result,presentation,status,operations}.js` nur für die vereinbarte
  Komposition oder stabile Ergebnisprojektion;
- `create-agdf/lib/mcp-lifecycle/` nur für nachgewiesene kompatible Seams. Adapter-, Runtime-,
  Herkunfts-, Referenz- und Rollback-Semantik bleiben dort alleiniger Owner;
- `create-agdf/lib/interaction-presentation.js` und
  `plugin/meta/agdf-interaction-locales.json`;
- `create-agdf/scripts/install-local-plugin.js`;
- `create-agdf/scripts/{install-setup-contract-test,install-setup-interaction-test,install-setup-service-test,local-development-install-test,cli-modularization-test,interaction-presentation-test,lifecycle-test}.js`;
- neue fokussierte Tests unter `create-agdf/scripts/` sowie direkt betroffene bestehende Suiten;
- `create-agdf/package.json` für fokussierte und aggregierte Testregistrierung;
- kanonische Sync-Skripte nur wenn neue veröffentlichte Locale- oder Runtime-Inhalte projiziert
  werden müssen;
- `create-agdf/generated/**` ausschließlich durch kanonische Generierung;
- `INSTALL.md`, `create-agdf/README.md`, `docs/architecture/README.md` und bei direkter
  MCP-Erklärung `agdf-mcp-server/README.md`;
- `.agdf/control/CONTEXT_GRAPH.md`, dieser Run und seine Artefakte.

Wenn eine zweite Host-Registry, ein zweiter MCP- oder Plugin-Lifecycle, eine neue Gate-Semantik,
allgemeine Prozessausführung, breitere Permission, Telemetrie, ein entfernter Dienst oder ein Pfad
außerhalb dieser Grenze erforderlich wird, stoppt die Umsetzung und kehrt zu SD oder TP zurück.

## 4. Stabile Zustände und Fehlerphasen

Setup-Absichten:

```text
plugin_only
full
cancel
```

Gesamtzustände:

```text
cancelled
plugin_ready_mcp_absent
plugin_ready_mcp_unchanged
configured_pending_restart
configured_unverified
discovered_ready
partial
degraded_or_foreign
failed
```

Fehlerphasen:

```text
input_validation
setup_preflight
setup_selection
runtime_check_permission
plugin_operation
plugin_verification
mcp_preflight
mcp_enable
mcp_disable
plugin_disable
plugin_uninstall
result_validation
presentation
```

`discovered_ready` darf kein Installationstest oder Repositorytest erzeugen. Jede Ausgabe bleibt
`authorizes: false` und enthält höchstens eine nächste Aktion.

## 5. Testplan

| test_id | Testbereich | Verbindliche Aussage |
|---|---|---|
| GMA-T01 | Parser: Setup-Optionen | `--with-mcp` und `--plugin-only` sind exklusiv; unbekannte oder fehlende Werte stoppen vor Handler. |
| GMA-T02 | Parser: Zielbindung | Nichtinteraktives Full-Setup verlangt eingegebenes absolutes `--dir`; Auflösung eines relativen Werts genügt nicht. |
| GMA-T03 | Parser: Scope | Installation akzeptiert `project|user` nur mit Full-Setup; gekoppelte globale Entfernung trennt `global` und `mcp-scope`. |
| GMA-T04 | OpenCode-Kompatibilität | Alle bisherigen Plugin-only-`--dir`-Aufrufe behalten ihre Konfigurationsbedeutung; der neue Full-Aufruf bindet das Projektziel. |
| GMA-T05 | Preflight-Vertrag | Alle Felder, Zielquelle und `authorizes: false` sind vollständig; unbekannte oder inkonsistente Werte scheitern. |
| GMA-T06 | Read-only Preflight | Kein Paketbezug, Verzeichnis, Login, Plugin- oder MCP-Schreibzugriff findet statt. |
| GMA-T07 | Interaktive Auswahl | Full ist empfohlen und nicht vorselektiert; ungültig/leer wiederholt; EOF/Cancel mutiert nichts. |
| GMA-T08 | Nichtinteraktiv und JSON | Ohne ausdrückliche Option stets Plugin-only; keine Prompts; CI- oder Umgebungswerte erzeugen keine Zustimmung. |
| GMA-T09 | Getrennte Runtime-Check-Entscheidung | Setup und automatische Checks besitzen getrennte Auswahl, Felder, Persistenz und Wirkung. |
| GMA-T10 | Plugin-only | MCP-Ausgangszustand bleibt für alle Adapter exakt unverändert; vorhandene Versionsabweichung bleibt sichtbar. |
| GMA-T11 | Full-Setup-Reihenfolge | MCP-Enable beginnt nur nach Plugin-Verifikation und erhält exakt Oberfläche, Ziel und Scope. |
| GMA-T12 | Plugin-Fehler | Kein MCP-Enable, Paketbezug oder Registrierung; Fehlerphase und Plugin-Recovery sind eindeutig. |
| GMA-T13 | Runtime-Check-Teilfehler | Plugin und mögliche MCP-Einrichtung bleiben getrennt; Gesamtergebnis ist `partial`. |
| GMA-T14 | MCP-Teilfehler | Plugin bleibt; ausschließlich MCP-eigener Rollback läuft; Gesamtzustand und Retry sind korrekt. |
| GMA-T15 | Idempotenz und Update | Wiederholung erzeugt keine Duplikate; Full gleicht eigene Runtime an; Plugin-only bewahrt MCP. |
| GMA-T16 | Fremde und priorisierte Registrierung | Full stoppt vor Mutation; interaktiv bleiben Plugin-only/Cancel; bestehende fremde Bytes bleiben gleich. |
| GMA-T17 | Ergebnisvertrag | Jede erlaubte Teilkombination mappt deterministisch; unbekannte Kombination und mehrere Next Actions scheitern. |
| GMA-T18 | Sprache | Deutsch und Englisch sind vollständig; regionale Tags wählen das Primärpaket; nicht unterstützte Sprache fällt vollständig auf Englisch zurück. |
| GMA-T19 | Text-/JSON-Parität | Beide Projektionen enthalten dieselben Absichten, Teilzustände, Fehler, Scope, Restart und Autoritätsgrenze. |
| GMA-T20 | Status | Mit gebundenem Ziel wird MCP read-only ergänzt; ohne Ziel bleibt MCP `not_checked`; kein Setup-Consent entsteht. |
| GMA-T21 | Gekoppeltes Disable | MCP-Projekt-Disable läuft zuerst; Konflikt stoppt; nachfolgender Plugin-Fehler ergibt einen wahrheitsgemäßen Teilzustand. |
| GMA-T22 | Gekoppelter Uninstall | Preview vor Confirm, erneute Herkunftsprüfung, getrennte Scopes, Referenzerhalt und sichere Teilfehler. |
| GMA-T23 | Lokaler Wrapper | `release:prepare` läuft vor dynamischem Import; alle weiteren Argumente und Adapter werden unverändert weitergereicht. |
| GMA-T24 | Marketplace-Grenze | Installation ohne CLI-Mutationscallback bleibt Plugin-only und nennt nur den exakten späteren CLI-Weg. |
| GMA-T25 | Paket und Runtime | Quelle, generierte Assets, npm-Payload und installierte Runtime sind versions- und digestgleich. |
| GMA-T26 | Autorität | Setup, Runtime-Checks, Registrierung, Discovery und Dispatch bleiben technisch und `authorizes: false`. |
| GMA-T27 | Gesamte Regression | Bestehende CLI-, Installer-, Consent-, Lifecycle-, MCP-, Locale-, Paket- und Skill-Suiten bleiben unverändert streng. |
| GMA-T28 | Getrennte Scope-Auswahl | `full` führt immer zu `project | user | back`; es existiert kein interaktiver Default und keine Ableitung aus einem früheren Zustand. |
| GMA-T29 | Rückkehr und Abbruch | `back`, leere oder ungültige Eingabe und EOF starten weder Vorbereitung noch Plugin-, Paket- oder MCP-Mutation. |
| GMA-T30 | Scopespezifischer Preflight | Projekt- und Benutzerscope werden getrennt und read-only inspiziert; Pfad, Quelle, Status, Verfügbarkeit und Blocker sind vollständig. |
| GMA-T31 | Native Priorität | Ein Projektoverride kann den Benutzerstandard übersteuern und wird sichtbar; die Setup-Komposition erfindet keine eigene Prioritätsregel. |
| GMA-T32 | Gewählter Scope | Nur der bewusst gewählte Scope erreicht MCP `enable`; ein vorhandener anderer Scope wird weder geändert noch entfernt. |
| GMA-T33 | Ursprüngliches npm-Verzeichnis | Gültiges `INIT_CWD` wird normalisiert und als Parser-cwd verwendet; `create-agdf` erscheint nicht als stiller Projektvorschlag. |
| GMA-T34 | Ungültiges npm-Verzeichnis | Relatives, nicht existentes oder nicht verzeichnisförmiges `INIT_CWD` stoppt vor `release:prepare` und jeder Mutation. |
| GMA-T35 | Wrapper-Grenze | Der Wrapper reicht CLI-Argumente unverändert weiter und transportiert nur den validierten cwd-Kontext. |
| GMA-T36 | Scope-Darstellung | Text und JSON unterscheiden Projektziel, Benutzerstandard, Invocation-Kontext, native Quelle und tatsächlichen Registrierungspfad. |
| GMA-T37 | Versionsgrenze | Installations- und Architekturdokumentation behauptet keine MCP-Unterstützung für AGDF 0.14.5. |

## 6. Geplante Verifikationsbefehle

Neue fokussierte Skripte werden über sprechende npm-Ziele registriert. Die endgültigen Namen werden
in der Brownfield Analysis gegen die vorhandene Namenskonvention geprüft. Erwartete Befehle:

```text
npm --prefix create-agdf run test:install-setup-contract
npm --prefix create-agdf run test:install-setup-interaction
npm --prefix create-agdf run test:install-setup-service
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:runtime-check-consent
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:mcp-lifecycle
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run test:opencode-hardening
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
```

Kanonische und aggregierte Prüfung:

```text
npm --prefix create-agdf run release:prepare
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix agdf-mcp-server test
npm --prefix create-agdf run smoke-test
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js doctor --run agdf-guided-mcp-activation --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js gate-check --run agdf-guided-mcp-activation --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js delivery-map --run agdf-guided-mcp-activation --json
npm --prefix create-agdf audit
git diff --check
```

Repositorytests setzen temporäre HOME-, Konfigurations- und Datenwurzeln sowie injizierte
Command-Executors. Sie dürfen keine realen Codex-, Claude-Code-, Copilot- oder OpenCode-Profile,
Caches, Registrierungen oder Plugins verändern.

## 7. Direkte Host-Evidenz

Direkte Evidenz wird erst nach bestandener Repository- und Paketprüfung und nur unter der dafür
geltenden Benutzerautorisierung erhoben.

| evidence_id | Oberfläche | Erforderliche direkte Beobachtung |
|---|---|---|
| GMA-H01 | Codex | Plugin-only sowie Full-Setup getrennt für Projekt- und Benutzerscope, ursprüngliches Aufrufverzeichnis, native Registrierung, Priorität, Neustart, neue Sitzung, Discovery, Dispatch und Cleanup auf dem exakten lokalen Tupel. |
| GMA-H02 | Claude Code | Dieselbe Matrix einschließlich nativer Projekt-/User-Scope-Rücklesung, Priorität, Authentifizierungsgrenze und Cleanup. |
| GMA-H03 | OpenCode | Bestehendes `--dir`-Verhalten, getrennte Scope-Auswahl, ursprüngliches Aufrufverzeichnis, Registrierung, Priorität, Discovery, Dispatch, Terminaltransfer, Fortsetzung und Cleanup. |
| GMA-H04 | GitHub Copilot | Installationsweg, beide verfügbaren nativen Scopes, ursprüngliches Aufrufverzeichnis, Priorität, vollständiger Neustart, Skill-/Tool-Discovery, begrenzter Dispatch und Entfernung. |
| GMA-H05 | native Windows | Pfade, Node, Konfigurationsquellen, atomare Operationen, Restart, Discovery und Cleanup pro tatsächlich ausgeführter Oberfläche. |

Jeder Datensatz enthält mindestens Hostversion, Clientvariante, Betriebssystem, Architektur,
Node-Version, AGDF-Version, Scope, Ziel, effektive Konfigurationsquelle, Runtime-Identität und
Sitzungsart. Ein fehlender Host, Login, Trust, Desktop-Schritt oder OS-Nachweis bleibt `unverified`.
Eine Oberfläche oder Plattform wird nicht aus einer anderen abgeleitet.

## 8. Menschliche UAT-Fälle

| uat_id | Nutzerfall | Beobachtbares Erfolgssignal |
|---|---|---|
| GMA-U01 | Interaktive Neuinstallation | Der Einsteiger versteht Empfehlung, aktive Auswahl, Projektziel, Scope und lokale Ausführung vor Mutation. |
| GMA-U02 | Plugin-only | Der Nutzer erkennt, dass AGDF installiert ist, MCP aber fehlt oder bewusst unverändert blieb. |
| GMA-U03 | Full-Setup | Plugin, Runtime-Checks, MCP-Registrierung, Discovery und Restart sind als getrennte Zustände verständlich. |
| GMA-U04 | Teilfehler | Der Nutzer erkennt den erreichten Zustand und kann genau eine passende Recovery-Aktion ausführen. |
| GMA-U05 | Update | Vorhandene Auswahl ist Kontext, keine Vorbelegung; Versionsabweichung wird nicht versteckt. |
| GMA-U06 | Entfernung | Preview macht verständlich, was entfernt und was wegen Herkunft oder Referenzen erhalten wird. |
| GMA-U07 | Sprache | Die vollständige Karte bleibt Deutsch oder fällt bei nicht unterstützter Sprache vollständig auf Englisch zurück. |
| GMA-U08 | Scope-Wahl | Der Nutzer versteht den Unterschied zwischen aktuellem Projekt und benutzerweitem Hoststandard und erkennt eine höher priorisierte Projektkonfiguration. |
| GMA-U09 | Lokale Installation | Der sichtbare Projektvorschlag ist das ursprüngliche Aufrufverzeichnis; das technische `create-agdf`-Unterverzeichnis wird nicht als Ziel angeboten. |

## 9. Brownfield Analysis vor Implementierung

Nach TP-Freigabe prüft die verpflichtende Brownfield Analysis erneut:

- aktuellen Git- und Generierungsstand sowie alle unversionierten Dateien;
- tatsächliche Installationshandler in `application.js` und ihre injizierbaren Seams;
- Parser- und OpenCode-`--dir`-Vertrag einschließlich vorhandener Dokumentation und Tests;
- bestehende Runtime-Check-Reihenfolge, Persistenz und Teilfehler;
- Lifecycle- und MCP-Ergebnisschemas, Präsentationsowner und Locale-Invariante;
- Plugin-Disable, Uninstall-Preview, MCP-Disable, Herkunft und Referenzbereinigung;
- lokalen Entwicklungswrapper, frischen Checkout und Generierungsreihenfolge;
- Paket-, Runtime-Integrity-, Smoke- und direkte Hostgrenzen; und
- ob ein vorgeschlagener neuer Helper bereits vorhanden ist und wiederverwendet werden kann.

Ein nicht kompatibler öffentlicher Vertrag, eine zusätzliche persistente Autorität, ein notwendiger
neuer Host-Adapter, fehlende sichere Entfernung oder ein Pfad außerhalb Abschnitt 3 führt zurück zu
SD oder TP.

## 10. Review- und QA-Folge

Nach Implementierung und CD+Tests:

1. Task Plan Review ordnet GMA-01 bis GMA-28 sowie AC-01 bis AC-13 konkreter Evidenz zu.
2. Clean Implementation Review prüft Owner, Modulschnitt, Zustandsableitung, fehlende Duplikate und
   Dokumentationskonsistenz.
3. Code Review prüft insbesondere Eingabevalidierung, Shell-/Pfadgrenzen, Reihenfolge,
   Nichtmutation, Rollback, Fremdzustand und Entfernung.
4. QA Gate entscheidet ausschließlich aus den getrennten Evidenzspuren über `pass | revise | block`.
5. Menschliche UAT folgt erst nach freigegebenem QA-Bericht.

Fehlende direkte Host-Evidenz blockiert nur die entsprechende Host- oder Supportaussage, sofern
Produkt- und Akzeptanzvertrag keinen vollständigen Hostnachweis als allgemeine Lieferbedingung
festlegen. Sie bleibt sichtbar und darf nicht durch Fixtures ersetzt werden.

## 11. Blockierende Bedingungen

- Implizite MCP-Aktivierung aus fehlender Eingabe, TTY-, CI-, Umgebungs- oder Altzustand blockiert.
- Jede MCP-Mutation bei Plugin-only oder Cancel blockiert.
- Eine interaktive Scope-Vorbelegung oder Scope-Ableitung aus Altzustand blockiert.
- Ein Scope-`back`, leere, ungültige oder abgebrochene Auswahl mit nachfolgender Mutation blockiert.
- Ein lokaler Projektvorschlag aus dem technischen `create-agdf`-Unterverzeichnis blockiert.
- Ein ungültiges vorhandenes `INIT_CWD`, das ignoriert oder nach `release:prepare` geprüft wird, blockiert.
- MCP-Paketbezug vor bewusster Full-Auswahl und Plugin-Verifikation blockiert.
- Umdeutung eines bestehenden OpenCode-Plugin-only-`--dir`-Aufrufs blockiert.
- Fremde, ungültige oder höher priorisierte MCP-Konfiguration darf nicht übernommen oder entfernt
  werden.
- Ein zweiter Installer-, Lifecycle-, Locale-, Result-, Dispatcher- oder Host-Adapter-Owner
  blockiert.
- Falscher Gesamterfolg, verlorener Teilzustand, mehrere nächste Aktionen oder fehlender
  `authorizes: false` blockiert.
- Discovery aus Konfiguration, Paket oder Repositorytest blockiert.
- Gekoppelte Entfernung ohne Preview, Revalidierung, Herkunft und Referenzschutz blockiert.
- Reale Hostmutation aus Repositorytests blockiert.
- Übertragene Host-, Betriebssystem- oder Sitzungsbehauptung blockiert QA.
- Ungeklärter generierter Diff, fehlgeschlagene Gesamtsuite oder veränderte fremde Nutzerarbeit
  blockiert QA.

## 12. Nicht im Umfang

- Änderung der `agdf_dispatch`-Beschreibung, Eingabe, Ausgabe oder Gate-Semantik.
- Neuer MCP-Server, Host-Adapter, Remote-Dienst, Konto, Telemetrie oder universelles
  Konfigurationsformat.
- Allgemeine Shell-, Node-, Datei-, Edit-, Netzwerk-, Trust- oder Permission-Erweiterung.
- Stille Marketplace-, Skill-, Hook- oder Chat-basierte MCP-Registrierung.
- Adoption oder Reparatur fremder Hostkonfiguration.
- Allgemeine Supportaussage ohne exakte direkte Evidenz.
- Veröffentlichung, Release, Commit, Push oder Pull Request.

## 13. Nächster Schritt

Task und Test Plan Revision 2 ist freigegeben. Er ergänzt die bestehende Regressionsbasis um die
getrennte Scope-Auswahl, scopespezifische Preflights, native Priorität, die validierte
`INIT_CWD`-Übergabe und AC-13. Die aktualisierte Brownfield Analysis entscheidet, ob die
Implementierung innerhalb der zulässigen Pfade beginnen darf. Direkte Hostmutationen und VCS- oder
Release-Aktionen bleiben getrennte Schritte.
