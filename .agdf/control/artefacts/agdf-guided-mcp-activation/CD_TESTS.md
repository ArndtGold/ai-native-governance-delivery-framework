# CD+Tests: Geführte MCP-Aktivierung während der AGDF-Installation

- status: `done`
- revision: 5
- date: 2026-09-09
- based_on: approved TP Revision 2
- implementation_scope: GMA-01 bis GMA-28, AC-01 bis AC-13
- repository_baseline: `1d25e2db7e43a2d8534be152ce601c1f6f863c75`
- branch: `main`
- authorizes: `false`

## Ergebnis

Die Revision 2 der Produktreise ist umgesetzt. Der interaktive Installer zeigt zuerst den
Plugin-Zustand, den Zielvorschlag aus dem Aufrufverzeichnis und die getrennten nur lesenden
MCP-Zustände für Projekt- und Benutzerbereich. Nach `full` folgt eine zweite bewusste Auswahl
`project | user | back`. Beide Auswahlschritte besitzen keinen Default. `back`, Abbruch und EOF
mutieren nichts. Nur der ausgewählte verfügbare Scope erreicht den bestehenden MCP-`enable`-Owner.

Der Setup-Service übernimmt Status, native Priorität, Registrierungspfad, Herkunft und Blocker aus
dem vorhandenen MCP-Lifecycle. Ein höher priorisierter Projekteintrag kann den Benutzerbereich
sperren, ohne einen sicheren Projektbereich zu sperren. Der andere Scope wird weder geändert noch
entfernt. Plugin-Installation, Runtime-Check-Zustimmung, MCP-Registrierung, Rollback und
Governance-Freigaben behalten ihre bisherigen Owner.

Der lokale Wrapper validiert vor `release:prepare` ein vorhandenes `INIT_CWD` als nicht leeres,
absolutes und existierendes Verzeichnis, normalisiert es mit `realpath` und transportiert Pfad und
Quelle zum Parser. Fehlt `INIT_CWD`, wird `process.cwd()` nach denselben Regeln verwendet. Relative,
fehlende und dateibasierte Werte stoppen mit `AGDF_LOCAL_INVOCATION_DIRECTORY_INVALID` vor
Generierung und Hostmutation. Setup-Argumente werden unverändert weitergereicht.

Die Text- und JSON-Ausgabe unterscheidet Aufrufkontext, Aufrufquelle, ausgewählten Scope, nativen
Registrierungspfad und wirksame Konfigurationsquelle. Deutsch und Englisch bleiben vollständig; eine
gültige nicht unterstützte Sprache fällt vollständig auf Englisch zurück. AGDF 0.14.5 bleibt in
den Einstiegs- und Architekturdokumenten ausdrücklich MCP-frei. Die beschriebene Reise gehört zur
unveröffentlichten Folgeversion.

## Geänderte Owner

- `create-agdf/lib/install-setup/contract.js`: geschlossener Dual-Scope-Preflight und Herkunftsfelder.
- `create-agdf/lib/install-setup/interaction.js`: zweite Auswahl `project | user | back` ohne Default.
- `create-agdf/lib/install-setup/presentation.js`: Scope-Karte und getrennte Ergebnisfelder.
- `create-agdf/lib/install-setup/service.js`: Dual-Scope-Status und Mutation nur des gewählten Scopes.
- `create-agdf/lib/cli/parse-args.js` und `application.js`: cwd-Herkunft und injizierbare Scope-Auswahl.
- `create-agdf/scripts/install-local-plugin.js`: frühe `INIT_CWD`-Validierung und Parser-Injektion.
- `plugin/meta/agdf-interaction-locales.json`: kanonische deutsche und englische Begriffe.
- fokussierte Contract-, Interaction-, Service-, CLI- und Wrappertests.
- `INSTALL.md`, `create-agdf/README.md`, `CONTRIBUTING.md` und `docs/architecture/README.md`.
- `.agdf/control/CONTEXT_GRAPH.md`: drei bestehende Beziehungen auf Revision 2 aktualisiert.

## Aufgabenmatrix Revision 2

| Aufgabe | Status | Evidenz |
|---|---|---|
| GMA-19 | done | `contract.js` verlangt exakt `mcp_by_scope.project` und `.user` mit Status, Capability, selected status, effektiver Quelle, Registrierungspfad, Verfügbarkeit, Blocker und Entfernungskommando. Herkunftsfelder sind geschlossen validiert. |
| GMA-20 | done | `interaction.js` und Interaction-Tests belegen `project | user | back`, fehlenden Default, Wiederholung bei leer/ungültig und Cancel bei EOF. |
| GMA-21 | done | `service.js` ruft Status für beide Scopes auf. Sequenztests beweisen, dass ausschließlich der gewählte User- oder Project-Scope `enable` erreicht und Konflikte scopebezogen sperren. |
| GMA-22 | done | `presentation.js`, Locale-Registry und Darstellungstests belegen Scope-Karte, Invocation-Kontext, Registrierungspfad, Prioritätsquelle sowie vollständiges Deutsch/Englisch mit englischem Fallback. |
| GMA-23 | done | `resolveLocalInvocationDirectory` und Wrappertests prüfen vorhandenes, fehlendes, relatives, nicht existentes und dateibasiertes `INIT_CWD`; ungültige Werte stoppen vor `release:prepare`. |
| GMA-24 | done | Parser erhält `cwd` und `cwdSource`; Application bindet die Scope-Auswahl; Wrappertests belegen unveränderte Argumente und OpenCode-Kompatibilität. |
| GMA-25 | done | Fokus-Suiten und der kanonische serielle Gesamtsmoke bestehen. Positive, negative und Nichtmutationsfälle decken beide Scopes und die Wrappergrenze ab. |
| GMA-26 | done | Vier Einsteiger- und Architekturflächen erklären Reichweite, native Priorität, Zielautorität, Aufrufverzeichnis, lokale Installation und die Versionsgrenze. |
| GMA-27 | done | Context Graph ist reconciled. Task Plan Review Revision 4, Clean Implementation Review Revision 4 und Code Review Revision 5 prüfen ausdrücklich TP Revision 2. |
| GMA-28 | done | Dieses Artefakt, QA Report Revision 4 und UAT Preparation Revision 4 trennen Repository-, Paket-, Protokoll-, installierte Host-, frische Sitzungs-, Betriebssystem- und menschliche Evidenz. |

GMA-01 bis GMA-18 bleiben durch die Revision-4-Evidenz und den erneuten vollständigen Smoke
bestätigt. Die Revision-2-Änderung ersetzt keinen ihrer bisherigen Owner oder Sicherheitsgrenzen.

## Akzeptanzmatrix

| Kriterium | Ergebnis | Evidenzgrenze |
|---|---|---|
| AC-01 bis AC-10 | pass | Vorhandene Auswahl-, Reihenfolge-, Teilfehler-, Idempotenz-, Restart- und Entfernungsmatrizen bestehen erneut. |
| AC-11 | pass | Deutsch, Englisch, regionale Tags und vollständiger englischer Fallback bestehen ohne Mischsprache. |
| AC-12 | pass | Repository-, Paket- und Protokolltests werden nicht als geladene Host-Unterstützung ausgegeben. |
| AC-13 | pass im Repository-Scope | Projekt/User/Back, Dual-Scope-Preflight, native Priorität, ursprüngliches Aufrufverzeichnis und Nullmutation sind positiv und negativ getestet. Geladene Hostreise und menschliche Verständlichkeit bleiben eigene spätere Spuren. |

## Testevidenz

| Prüfung | Ergebnis | Aussage |
|---|---|---|
| `test:install-setup-contract` | pass | Geschlossener Dual-Scope-Vertrag, Herkunft, Blocker und `authorizes: false`. |
| `test:install-setup-interaction` | pass | Zwei getrennte Entscheidungen, kein Default, Back, Wiederholung, EOF, gesperrter Scope und Locale-Fallback. |
| `test:install-setup-service` | pass | Beide Statusaufrufe, User-Enable, Back-Schleife, Projektpriorität, Teilfehler und Nullmutation. |
| `test:cli-modularization` | pass | Parserquelle, zwei Statusaufrufe, ausgewähltes Enable und öffentliche CLI-Komposition. |
| `test:local-development-install` | pass | `INIT_CWD`, `process.cwd()`, `realpath`, vier ungültige Pfadklassen, Stopp vor Vorbereitung und unveränderte Argumente. |
| `test:mcp-lifecycle` | pass | Vier native Adapter, Scope-Priorität, Eigentum, Runtime, Referenzen und Rollback. |
| `test:interaction-presentation` | pass | Vollständige Locale-Registry und einsprachige Projektion. |
| `npm --prefix create-agdf run smoke-test` | pass | Vollständiger serieller Gesamtregressionslauf auf dem finalen Produktstand. |
| `release:prepare` und öffentliche Profile | pass | 39 Versionsflächen, acht Profile und 46 inventarisierte öffentliche Kandidatendateien konsistent. |
| Copilot-Payload-Grenze | pass | 95 Dateien und 818949 überprüfte Bytes; keine zusätzliche Datei. |
| Paketbau und Paketinhalt | pass | Byteidentischer vollständiger Bau; 471 erwartete Release-Dateien. |
| MCP-Server | pass | Vertrag, Protokolle 2025-11-25 und 2026-07-28, Sicherheit, Provenienz und Paket. |
| Runtime Integrity | pass | 10 Skills und 16 Control-Dateien. |
| `npm audit --json` | pass | 0 bekannte Schwachstellen im kanonischen Lockfile. |
| `git diff --check` | pass | Keine Whitespace-Fehler. |

Der zuerst parallel gestartete Paketlauf ist keine Evidenz, weil gemeinsam genutzte generierte
Verzeichnisse kollidierten. Nach isoliertem `sync-package-assets` bestanden die Dispatcher-Matrix
und der vollständige serielle Smoke. Ein vertippter manueller Dateiname war ebenfalls kein
Produkttest und wird nicht als Nachweis verwendet.

Das Code Review identifizierte zusätzlich GMA-CR-06: Ein fehlerhafter injizierter Scope-Adapter
konnte einen unbekannten oder falsy Wert liefern. Der Service validiert die Adapterantwort jetzt
gegen `project | user | back | cancel` und stoppt andernfalls vor Consent und Mutation. Der
fokussierte Test belegt die exakte Nullmutations-Aufruffolge; der danach erneut ausgeführte serielle
Gesamtsmoke besteht.

## Getrennte Evidenzspuren

| Spur | Status | Grenze |
|---|---|---|
| Quellrepository | pass | Implementierung, Dokumentation, Reviews und deterministische Tests im Arbeitsbaum. |
| Generierte Profile | pass | Kanonischer Sync, Inventar, Digests, Größenbudget und Runtime Integrity. |
| Release-built Paket | pass | Reproduzierbarer Bau und 471-Dateien-Inhalt. |
| MCP-Protokoll | pass | Kontrollierte Produktionsserver-Tests für zwei Protokollgenerationen. |
| Installierter Codex/Claude/OpenCode/Copilot Host | unverified | Keine Installation, Registrierung, Hostberechtigung oder frische Sitzung in dieser Implementierungsphase. |
| Native Windows-Ausführung | unverified | Kein Windows-Host stand zur Verfügung. |
| Menschliche UAT | unverified | GMA-U01 bis GMA-U09 folgen erst nach QA-Freigabe. |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Die Einträge `guided_activation_extension_2026_09_09`, `guided_mcp_setup_composition_2026_09_09` und `guided_mcp_setup_interaction_2026_09_09` nennen Dual-Scope-Preflight, zweite Auswahl, native Priorität und Invocation-Transport.

## Verbleibende Risiken

- Direkte Hostversionen können andere Berechtigungs-, Discovery- oder Darstellungszustände zeigen.
- Die native Windows-Pfad- und Prozessausführung bleibt ungetestet.
- Der User-Scope ändert nur Host-Discovery. Er erzeugt keine Governance-Ziel- oder Gate-Autorität.
- Die Versionsgrenze muss bei Veröffentlichung der ersten MCP-fähigen Folgeversion bewusst aktualisiert werden.

Diese Risiken begrenzen Support- und UAT-Aussagen. Sie widersprechen keinem Repository-Ergebnis und
bleiben in QA und UAT Preparation ausdrücklich sichtbar.
