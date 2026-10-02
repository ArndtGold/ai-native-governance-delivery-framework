# Architekturbewertung: ai-native-governance-delivery-framework (AGDF 0.14.5), Lauf 4

Stand: 2026-10-02 · Branch `main` · HEAD `0898310` · rein lesend.
Prüfer: Claude Code auf Opus 5.5, mit zwei parallelen Teilprüfungen und eigener Gegenprobe. Lauf 3 (`REVIEW_…_v3_Architektur.md`, HEAD `25c8cd5`) ging als Eingabe ein; seine Befunde wurden gegen den aktuellen Stand erneut geprüft. Seit Lauf 3 kamen 27 Commits hinzu, darunter die Aufteilung in die Pakete `packages/core`, `packages/cli` und `packages/mcp-server` (`89e87cb`). Bewertet ist der Commit-Stand. Sechs nicht committete Änderungen unter `packages/` (Artefaktsprache, Recovery-Details im Dispatch) ändern an keinem Urteil etwas.

Das Dokument ist keine QA-Entscheidung und keine manuelle Verifikation. Laufzeitverhalten ist in keinem Punkt belegt: Es liefen kein Build, kein Test und kein Start eines Hosts. Ausgeführt wurden nur eine statische Analyse des Importgraphen und eine Linkprüfung der Architekturdokumentation, beide außerhalb des Repositorys.

Urteilsskala: `suitable` · `conditionally_suitable` · `critical` · `not_assessable`.

## Ergebnis

Die Architektur hat sich seit Lauf 3 deutlich verbessert. Zwei der drei strukturellen Schwächen sind im Kern behoben:

1. **Integritätsrückgrat:** Der Run-Store hat jetzt eine Unit of Work mit Journal, und ein Run ohne Siegel wird beim Schreiben abgelehnt.
2. **Architekturdokumentation:** Sie nennt beide Werkzeuge, beschreibt die Paketaufteilung, alle Links lösen auf, und ein Test bindet die Werkzeugliste an `tools/list`.

Die neue Paketaufteilung ist im Kern sauber: Der Core ist frei von Fremdabhängigkeiten und Prozessaufrufen, und ein AST-Test sichert das. Sie hat aber eine Abhängigkeit in beide Richtungen zwischen `mcp-server` und `cli` und vervielfacht die Kopien des Cores.

Offen bleiben vier Punkte:

- Für jede Regel gibt es weiter zwei Fassungen, Vertragstext und Code, ohne inhaltlichen Abgleich.
- Das Ergebnis von `verified_change` hängt davon ab, ob über CLI oder MCP aufgerufen wird.
- Der Plugin-MCP lädt beim ersten Start Pakete von npm, ohne Lockfile und ohne Sollwert für die Prüfsumme.
- Kein Host ist nativ verifiziert.

| Baustein oder Entscheidung | Lauf 3 | Lauf 4 | Tendenz |
|---|---|---|---|
| A1 Control State Store | `critical` | `conditionally_suitable` | ↑ |
| A2 Control Evaluation | `conditionally_suitable` | `conditionally_suitable` | ↑ |
| A3 Dispatch-Oberflächen | `suitable` mit Auflage | `suitable` mit Auflage | = |
| A4 Installer und Lifecycle | `conditionally_suitable` | `conditionally_suitable` | ↑ |
| A5 Normatives Modell | `conditionally_suitable` | `conditionally_suitable` | = |
| A6 Muster Quelle → Kopie → Integritätsprüfung | `conditionally_suitable`, Aufwandstreiber | wie Lauf 3, verschärft | ↓ |
| A7 Strategie für mehrere Hosts | `conditionally_suitable` | `conditionally_suitable` | = |
| A8 Evals und Probes | `conditionally_suitable` | `conditionally_suitable` | = |
| A9 Architekturdokumentation | `critical` für den Abgleich | `conditionally_suitable` | ↑ |
| P1 Paketschnitt (neu) | – | `conditionally_suitable` | neu |
| L1 Lieferkette Plugin-MCP (bisher Teil von A9) | – | `conditionally_suitable`, Priorität hoch | eigenständig |

## 1. Ist-Architektur

### Pakete

| Paket | Aufgabe | Umfang (versioniert) |
|---|---|---|
| `packages/core` (`@agdf/core`, `private`) | Semantischer Kern: Run-Store, Gate-Policy, Dispatch, Inspect, Präsentation, Provenienz | 73 Dateien, rund 11.600 Zeilen |
| `packages/cli` (`create-agdf`) | Befehle, Installer, Host-Adapter, MCP-Lifecycle, Provider für Git und Prozesse, `mcp-dispatch-runtime.js` | 108 Dateien, rund 13.300 Zeilen in `lib/`; 84 Testskripte, rund 23.100 Zeilen |
| `packages/mcp-server` (`@agdf/mcp-server`) | stdio-Transport, ein `worker_thread` je Aufruf | 4 Dateien, 224 Zeilen |
| `scripts/` | Build, Projektion, Release, Probes | 55 Dateien, rund 7.400 Zeilen |
| `plugins/agdf/` | Verträge, Skills, Hooks, Integritätsprüfer | – |

### Abhängigkeitsrichtung

- **Core:** importiert nur relativ und `node:`. `scripts/check-package-boundaries.mjs` verbietet per AST Rückimporte, Fremdimporte, `child_process`, `net` und `http` und prüft Zyklen auf Dateiebene sowie die isolierte Ladbarkeit.
- **CLI → Core:** ausschließlich über das Import-Alias `#agdf-core` (84 Importe in `lib/`). Gleichnamige Ordner in `cli/lib` (`control-evaluation`, `control-state`, `skill-dispatch`, `runtime`, `control-maintenance`, `delivery-path-search`) sind Provider, die Git- und Prozesszugriffe in reine Core-Funktionen hineinreichen, etwa `control-maintenance/repair.js` mit `readGitOriginals`.
- **MCP-Server → CLI:** `src/main.js` und `src/worker-entry.js` importieren `create-agdf/mcp-dispatch-runtime`, nicht den Core.
- **CLI → MCP-Server (Layoutwissen):** `cli/lib/mcp-dispatch-runtime.js:25-40` kennt `node_modules/@agdf/mcp-server` und das SDK-Layout für die Provenienzprüfung.
- **Auslieferung des Cores:** `scripts/core-projection.mjs` kopiert `core/lib` nach `runtime/core` jedes Pakets und jeder Plugin-Runtime und schreibt dabei `resources/binding.js` neu.
- **Zyklen auf Verzeichnisebene im Core:** `control-evaluation ↔ control-state` (15 zu 8 Importe, schon in Lauf 3), neu `control-state ↔ interaction-presentation` (2 zu 1).
- **Tests:** `packages/core/test` importiert 19-mal aus `packages/cli/lib`, die MCP-Tests importieren aus `cli/lib` und `cli/scripts`.

### Sicherheitsgrenzen und Datenflüsse

Unverändert gegenüber Lauf 3, mit zwei Ergänzungen:

- **Schreibpfad Run-Store:** Journal `RUN_STEP_PENDING.json`, Run-Sperre und Backlog-Sperre; Siegelpflicht beim normalen Schreiben.
- **Netz beim ersten Start:** Der Plugin-MCP-Launcher installiert `@modelcontextprotocol/server@2.0.0` aus der npm-Registry in ein Stage-Verzeichnis (siehe L1).

## 2. Bausteinbewertungen

### A1 Control State Store: `conditionally_suitable`

**Behoben seit Lauf 3.**
- **Transaktion über mehrere Dateien:** Ein Journal ordnet Journal → `OR.md` → Run → Backlog; beide Sperren sind gehalten. Der Run-Write ist der Commitpunkt. Vorher rollt die Recovery zurück, danach vollendet sie (`core/lib/control-state/run-step-transaction.js:38-75,86-150`, `run-steps.js:255-260,282-292`). `writeRunLocked` sperrt bei offenem Journal (`run-state-writer.js:188-190`).
- **Siegel:** `unsealed` und `invalid` werfen `AGDF_RUN_SEAL_INVALID` (`run-state-writer.js:199`). Einzige Ausnahme ist `writeRunRecoveryLocked` (`:285-322`); er setzt alle Freigaben auf `missing` zurück (`:310`). `doctor` rät jetzt ausdrücklich davon ab, Siegelzeilen zu entfernen (`control-evaluation/doctor.js:27-33`). Damit ist die abgeleitete Umgehung aus Lauf 3 geschlossen.

**Teilweise behoben.**
- **Sperre:** Sie trägt jetzt `pid`, `token` und `started_at` (`run-state-writer.js:155-160`). Eine verwaiste Sperre wird zurückgeholt, wenn `process.kill(pid, 0)` den Prozess als beendet meldet (`:95-138`). Es gibt keinen zeitlichen Ablauf. Bei `unknown` (etwa `EPERM` unter fremdem Benutzer, defektes JSON, Abbruch vor dem Schreiben des Besitzereintrags) bleibt die Sperre dauerhaft bestehen. PID-Wiederverwendung und andere Rechner werden nicht erkannt. Gesperrte Schreibversuche scheitern sofort mit `AGDF_RUN_WRITE_LOCKED`, ohne Warten.
- **Schemaentwicklung:** Der Parser akzeptiert weiter nur `control_state_version: 2` (`run-state-parser.js:37-38`). Neu sind eine Kompatibilitätsprüfung mit `migration_required` und `repair_required` (`control-maintenance/compatibility.js`) und eine Migration aus `AGDF_RUN.md` (`legacy-migration.js`). Eine Kette von Upcastern für eine künftige Version 3 gibt es nicht.

**Weiter vorhanden, verschärft.**
- **Tabellenformat:** Mindestens 8 eigenständige Zeilenzerleger ohne Escape-Regel: `run-state-parser.js:90-100`, `run-state-writer.js:239,267`, `control-evaluation/shared.js:27,37`, `prd-readiness.js:14`, `traceability-readiness.js:64,71`, `run-presentation-render.js:118,173` und ein regulärer Ausdruck in `approval-operations.js:44`. Ein `|` im Zelltext wird stillschweigend zu `/` (`run-state-edits.js:59-66`).

**Neu.**
- **Globale Journalsperre:** Ein offenes Journal eines Runs blockiert `run-step` für alle anderen Runs (`run-steps.js:283-284`). Inferred: Zusammen mit einer Sperre im Zustand `unknown` kann das ganze Repository stehen bleiben, bis jemand von Hand eingreift.

**Urteil, hergeleitet.** Die drei tragenden Eigenschaften aus Lauf 3 liegen jetzt vor: Atomik über mehrere Dateien, eine Sperre mit Besitzer und ein Schreibpfad mit Siegelpflicht. Damit entfällt `critical`. `suitable` scheidet aus, weil die Sperre im Zustand `unknown` nicht von selbst freigegeben wird, die Journalsperre unnötig global wirkt und das Tabellenformat an vielen Stellen ohne gemeinsame Regel zerlegt wird. Diese Mängel sind lokal behebbar. Daraus folgt `conditionally_suitable`.

**Empfehlung.**
- **Zielzustand:** Eine Sperre mit Ablauf und Herzschlag; `unknown` führt zu einer Diagnose mit Recovery-Befehl statt zu einer Dauersperre. Die Journalsperre gilt je Run. Ein gemeinsamer Tabellencodec mit Escape-Regel ersetzt die Einzelzerleger.
- **Vorgelagerte Entscheidung (Maintainer):** Bleibt Markdown das führende Format? Davon hängt ab, ob ein Codec genügt oder ob JSON als Quelle mit erzeugtem Markdown sinnvoller ist.
- **Erster umkehrbarer Schritt:** `pendingRunStepIds` nur für den eigenen Run auswerten; Sperren älter als ein fester Grenzwert als `stale` melden.
- **Validierung:** Test mit Sperre im Zustand `unknown`, Test mit offenem Journal in Run A und Schreibversuch in Run B, Rundlauftest für Zellinhalte mit `|`.

### A2 Control Evaluation: `conditionally_suitable`

**Behoben.** Die Pfadbegrenzung ist innerhalb der Control Evaluation vereinheitlicht: `run-seal.js:7,56`, `control-evaluation/run-state.js:10,20` und `verified-change.js:2,27` nutzen `containedRegularFile` (`control-state/contained-file.js:6-56`).

**Weiter vorhanden.**
- **Eigene Pfadprüfungen außerhalb der Evaluation:** in `core/lib/repository-context-reader.js`, `task-target-resolution.js`, `runtime/plugin-provenance.js`, `legacy-projection-reader.js`, `run-presentation-render.js` sowie in `cli/lib/installers/{copilot-settings,local-marketplace,opencode}.js`, `cli/lib/mcp-lifecycle/adapters/codex.js`, `cli/lib/repository-context.js` und `cli/lib/runtime/local-validator.js`. Ob die Varianten gleichwertig sind, wurde nicht geprüft.
- **Gespeicherte Werte übersteuern berechnete:** `next_allowed_action` aus dem Run gewinnt, außer bei `verified_change` oder einem Platzhalter (`gate-check.js:326-330`). Blockierende Zweige überschreiben ihn (`:333-414`), und `run-step` schreibt den berechneten Wert zurück (`run-steps.js:236-244`). Freitext über `run-update` gelangt aber weiter in die Statuskarte. `doctor` prüft nur auf Platzhalter (`doctor.js:135,149`).

**Empfehlung.** Abgeleitete Felder nur berechnen, nie als Eingabe lesen. Erster Schritt: `doctor` meldet eine Abweichung zwischen gespeichertem und berechnetem `next_allowed_action`. Danach `containedRegularFile` in die übrigen Leser übernehmen.

### A3 Dispatch-Oberflächen: `suitable` mit Auflage

**Befund.** CLI und MCP nutzen dieselben Core-Services. Der Server ist reiner Transport mit dreifacher Provenienzprüfung.

**Auflagen, unverändert.**
- **Paritätsbruch bei `verified_change`:** Die CLI übergibt `cliGitObservation` (`cli/lib/cli/validation-handlers.js:31-45`), MCP nur `runtimeEvidence` und die Leseschranke (`cli/lib/mcp-dispatch-runtime.js:137-140`). Ohne Beobachter liefert `gitPathList` null (`core/lib/skill-dispatch/service.js:175,179`, `verified-change.js:36,110-113`). Inferred: Derselbe Lauf endet über MCP mit `AGDF_VERIFIED_CHANGE_GIT_BASELINE_UNAVAILABLE` (`block`), über die CLI mit einer echten Prüfung des Umfangs. Die Abweichung fällt sicher aus, ist aber weder dokumentiert noch getestet.
- **Worker-Ausgabe:** `new Worker` ohne `stdout: true` und `stderr: true` (`mcp-server/src/worker.js:34-36`). Die Ausgabe des Workers landet nach Node-Standard im stdout des Elternprozesses und damit im JSON-RPC-Kanal. Derzeit latent, weil `core/lib` nicht direkt auf `console` oder `process.stdout` schreibt.

**Empfehlung.** Je Oberfläche eine benannte Beobachterkonfiguration als Vertrag festlegen. Entweder bekommt MCP einen lesenden Git-Beobachter, oder das Verhalten wird dokumentiert. Erster Schritt: Worker mit `stdout: true, stderr: true` starten. Validierung: Paritätstest CLI gegen MCP auf den Fixtures für `verified_change`.

### A4 Installer und Lifecycle: `conditionally_suitable`

**Behoben.** `remove_tree` trägt die erwartete Identität im Plan (`cli/lib/lifecycle/operations.js:83`) und prüft dev:ino und Besitz unmittelbar vor `rmSync` (`:117-120`, `owned-mutation.js:52-64`). Rest: ein kleines Fenster zwischen Prüfung und Löschen; `.stage-*`-Unterordner gelten ungeprüft als eigen (`mcp-lifecycle/plugin-runtime.js:189`).

**Weiter vorhanden.** Atomares Schreiben ist 6-mal eigenständig gebaut:

| Stelle | Eigenschaft |
|---|---|
| `core/lib/control-state/run-state-writer.js:40-84` | `wx`, `fsync`, Symlink-Ablehnung |
| `cli/lib/installers/copilot-settings.js:40-64` | Windows: Ziel wird zuerst umbenannt |
| `cli/lib/runtime-check-consent/claude-settings.js:25-42` | Windows: Ziel wird zuerst umbenannt |
| `cli/lib/runtime-check-consent/state.js:55-75` | Windows: Ziel wird zuerst umbenannt |
| `cli/lib/mcp-lifecycle/adapters/file-utils.js:6-14` | Temp-Name über `Date.now()`, ohne `wx` |
| `cli/lib/mcp-lifecycle/package.js:244-252` | Temp-Name über `Date.now()`, ohne `wx` |

`opencode`, `local-marketplace` und `lifecycle` nutzen bereits die Variante im Core.

**Empfehlung.** Die Variante aus dem Core als einziges `atomicWrite` exportieren und in den übrigen fünf Stellen verwenden. Validierung: Test, der während des Schreibens abbricht und danach ein vollständiges altes oder neues Ziel erwartet.

### A5 Normatives Modell: `conditionally_suitable`

Unverändert:

- **Gate-Tabelle:** `plugins/agdf/meta/contracts/gate-transition.md:147-167`. Kein Test parst sie. `check-runtime-integrity.mjs:2017` und `request-activation-test.js:241` prüfen nur den Tabellenkopf.
- **Trivial Change Boundary:** `modes.md:144-157` sagt „fully outside all of the following paths“, `closeout.md:17` sagt „fully inside the Non-Normative Trivial Change Boundary above“. „above“ verweist ins Leere. Die Pfadliste nennt `packages/cli/lib/**` und `packages/cli/bin/**`, aber nicht `packages/core/**`; der Core ist nur über „any other executable code file“ erfasst.
- **Konsensphrasen:** 4 abweichende Listen in `agdf-constitution.md:202` (mit „go“), `agdf-agent-router.md:77`, `gate-transition.md:54` (mit „looks good“) und `control/templates/MASTER_BACKLOG.md:12`. Die Skills wurden nicht vollständig durchsucht.

**Empfehlung.** Wie Lauf 3: zuerst ein Äquivalenztest zwischen Tabelle und `transitionDecisionForRunState`, mittelfristig die Tabelle aus `gate-policy.js` erzeugen. Trivial Boundary und Konsensphrasen in je genau einer Datei führen und `packages/core/**` ausdrücklich aufnehmen.

### A6 Muster Quelle → Kopie → Integritätsprüfung: `conditionally_suitable`, Aufwandstreiber, verschärft

- `plugins/agdf/scripts/check-runtime-integrity.mjs`: 2.336 Zeilen, 170 `includes()`-Prüfungen (Lauf 3: 168).
- Generierte Bäume, alle gitignored: `packages/cli/generated*/` (471 Dateien), `packages/cli/runtime/` (73), `packages/core/generated/` (12), `dist/` (441).
- **Neue Kopieebene:** `core/lib` liegt nach einem Build 6-mal auf der Platte: Quelle, `packages/cli/runtime/core`, die Plugin-Runtimes für Claude und Copilot unter `packages/cli/generated/plugins/…/runtime/create-agdf/runtime/core` und zwei Kopien unter `dist/local/claude/npm/create-agdf/`.
- Rollen: `scripts/sync-package-assets.js` (670 Zeilen) erzeugt Profile und Manifeste, `sync-plugin-runtime.js` (389 Zeilen) die Plugin-Runtime, `assemble-npm.mjs` (55 Zeilen) setzt die npm-Pakete atomar zusammen und ruft `projectCore` auf.

**Urteil.** Die Kopien sind über Provenienzdigests abgesichert, der Zweck wird erreicht. Jede Änderung im Core vervielfacht sich jetzt aber über eine weitere Ebene, und die Satzprüfungen wachsen weiter. Die Tendenz zu `critical` aus Lauf 3 hat sich verstärkt.

**Empfehlung.** Wie Lauf 3: strukturierte Regelquelle mit Regel-IDs statt Satzprüfungen. Zusätzlich prüfen, ob die Plugin-Runtimes den Core aus einer gemeinsamen Paketkopie beziehen können, statt ihn je Profil erneut zu kopieren.

### A7 Strategie für mehrere Hosts: `conditionally_suitable`

- `docs/compatibility/HOST_COMPATIBILITY.md:31-42`: 12 von 12 Kombinationen aus Host und Betriebssystem stehen auf `unverified`. „demonstrated“ (`:18-21`, `:63ff`) bezeichnet laut Matrix nur einen simulierten Host.
- Budgets in `agdf-plugin.definition.json`: Ein Body-Budget hat nur `selectedGateCheckSkill` (6.900). Daneben gibt es Budgets für Beschreibungen (420 je Skill, 3.000 gesamt), SessionStart und OpenCode. `scripts/payload-budget.js` begrenzt nur Dateien und Bytes des Inventars.

**Empfehlung.** Wie Lauf 3: zuerst einen Host nativ auf `verified` bringen, Budgets für alle Skills einführen.

### A8 Evals und Probes: `conditionally_suitable`

- `evals/` ruft `evaluateGateCheck` nicht auf und importiert nichts aus Core oder `create-agdf`. Die Replays bleiben kuratiert.
- Native E2E in der CI: nur Codex (`.github/workflows/codex-release-e2e.yml`, eingebunden in `publish-agdf.yml:12-13,111`). `host-compatibility-evidence.yml` startet nur manuell und läuft auf Fixtures.

**Empfehlung.** Wie Lauf 3: Beobachtungsfelder aus echten Aufrufen von `evaluateGateCheck` erzeugen; Validierung über eine absichtlich eingebaute Regression in der Policy.

### A9 Architekturdokumentation: `conditionally_suitable`

**Behoben.**
- `docs/architecture/README.md:20-23` behauptet nicht mehr, 0.14.5 habe keine MCP-Unterstützung.
- Beide Werkzeuge stehen im Text (`README.md:53,98,195`, `dispatcher.md:35-36`) und namentlich in `03-dispatch.dot`.
- `package-structure.md` beschreibt die drei Pakete mit Baum und Eigentümern; `README.md:122-133` und `dispatcher.md:135-140` verlinken `packages/*`.
- Alle 124 relativen Links in `docs/architecture/*.md` lösen am Stand auf.
- `packages/mcp-server/test/protocol.test.js:18-29` vergleicht die Werkzeugliste in vier Dokumenten mit `tools/list`.
- `.agdf/control/SOT_REGISTRY.md` und `CONTEXT_GRAPH.md` sind auf die neuen Pakete nachgezogen.

**Weiter abweichend.**

| Dokumentiert | Stand |
|---|---|
| `README.md:310-311`: Die `mcp`-Befehle „gehören nicht zu AGDF 0.14.5“ | **weicht ab:** `mcp` ist in `packages/cli/lib/cli/command-registry.js:28` und `application.js:211` vorhanden; `@agdf/cli` trägt 0.14.5 |
| `README.md:132`: Plugin-Installation „bleibt vom MCP-Lebenszyklus getrennt“; Notiz in `04-distribution.dot`: Plugin-Installation aktiviert MCP nicht | **weicht ab:** Die erzeugten Profile für Claude (`mcp/claude.mcp.json`) und Codex (`mcp.json`) bündeln MCP; `host-adapters/claude/plugin-mcp.js:7-27` meldet `deferred_to_first_start` |
| npm-Bezug beim ersten Start | **fehlt** in der Architekturdokumentation; nur `INSTALL.md:130,344` |
| zweiter Laufzeitort `CLAUDE_PLUGIN_DATA` | **fehlt**; nur `INSTALL.md:342` |
| Bausteintabelle | **lückenhaft:** Es fehlen in `core/lib` `control-maintenance`, `delivery-path-search`, `control-read-boundary.js`, `interaction-catalog*.js`, `repository-context-reader.js`, `task-target-resolution.js`, `fs-swap.js`; in `cli/lib` `live-agent`, `scaffold`, `runtime-check-consent`, `control-command.js`, `host-command.js`, `npm-invocation.js`; außerdem die Worker-Isolation |
| Diagramme 01 bis 06 | stellen den Kern richtig dar, nennen aber keine Pakete; 01 nennt die Werkzeuge nur generisch; 04 bildet den Plugin-MCP-Pfad nicht ab |

**Urteil.** Für Einarbeitung und den Kern ist die Dokumentation jetzt verlässlich. Für sichere Änderungen an Distribution und MCP führen die drei Widersprüche weiter in die Irre. Deshalb `conditionally_suitable` statt `critical`.

**Empfehlung.** `README.md:132` und `:310-311` sowie Diagramm 04 berichtigen, Plugin-MCP-Pfad samt npm-Bezug und `CLAUDE_PLUGIN_DATA` eintragen, die Bausteintabelle ergänzen.

### P1 Paketschnitt: `conditionally_suitable` (neu)

**Aufgabe.** Die Aufteilung trennt den semantischen Kern von Installation, Host-Adaptern und Transport.

**Belegte Stärken.**
- Der Core hat keine Fremdabhängigkeiten und keine Prozess- oder Netzaufrufe; `scripts/check-package-boundaries.mjs` sichert das per AST, zusammen mit Rückimporten, Zyklen auf Dateiebene und isolierter Ladbarkeit.
- Die CLI hängt nur über `#agdf-core` am Core. Seiteneffekte wie Git und `child_process` liegen in Providern der CLI und werden in reine Core-Funktionen hineingereicht (Ports and Adapters).
- `createCoreServices` ist ein gemeinsamer Einstieg für CLI und MCP.

**Belegte Schwächen.**
1. **Abhängigkeit in beide Richtungen zwischen `mcp-server` und `cli`.** `@agdf/mcp-server` bezieht seine Dispatch-Laufzeit aus `create-agdf/mcp-dispatch-runtime` (`mcp-server/src/main.js:1`, `worker-entry.js`). Diese Laufzeit kennt das Installationslayout von `@agdf/mcp-server` und des SDK (`cli/lib/mcp-dispatch-runtime.js:25-40`). Der MCP-Adapter hängt damit am Installationspaket statt am Core.
2. **Der Core wird kopiert statt referenziert.** `@agdf/core` ist `private`; `projectCore` kopiert `core/lib` in jedes Paket und jede Plugin-Runtime und schreibt `resources/binding.js` neu (`scripts/core-projection.mjs`). Das verstärkt A6.
3. **Die Core-Tests hängen an der CLI.** `packages/core/test` importiert 19-mal aus `packages/cli/lib`, etwa `scaffold/canonical-init.js`. Der Core ist nicht eigenständig testbar.
4. **Zyklen auf Verzeichnisebene.** `control-evaluation ↔ control-state` besteht weiter, `control-state ↔ interaction-presentation` ist neu. Der Grenztest prüft nur die Dateiebene.
5. **Gleiche Ordnernamen in CLI und Core** machen die Grenze schwer lesbar, obwohl die CLI-Ordner nur Provider enthalten (inferred).

**Urteil, hergeleitet.** Der Schnitt erfüllt seinen Hauptzweck: Der Kern ist isoliert und geschützt. `suitable` scheidet aus, weil der MCP-Adapter über die CLI statt über den Core angebunden ist und der Core als Kopie ausgeliefert wird. Beides ist ohne Neuentwurf behebbar. Daraus folgt `conditionally_suitable`.

**Empfehlung.**
- **Zielzustand:** `mcp-server` hängt nur vom Core ab. Ein schmaler Port im Core nimmt Provenienz und Beobachter von außen entgegen; das Layoutwissen bleibt in der CLI.
- **Optionen:** (1) Laufzeitteil ohne Layoutwissen in den Core verschieben, Aufwand gering bis mittel, empfohlen. (2) Core als eigenes öffentliches Paket veröffentlichen statt kopieren, Aufwand mittel, beseitigt zusätzlich die Kopieebene, verlangt aber eine Versionierungsentscheidung. (3) Status quo, die Kopplung bleibt.
- **Bleibt unverändert:** `#agdf-core`, Provider-Muster, Grenztest.
- **Erster umkehrbarer Schritt:** Option (1) für `createMcpDispatchRuntime`.
- **Validierung:** Der Grenztest prüft zusätzlich, dass `mcp-server` nur `@agdf/core` importiert, und meldet Zyklen auf Verzeichnisebene; Core-Tests laufen ohne `packages/cli`.

### L1 Lieferkette Plugin-MCP: `conditionally_suitable`, Priorität hoch

**Befund.**
- Beim ersten Start installiert der Launcher `@modelcontextprotocol/server@2.0.0` per `npm install --ignore-scripts --save-exact` in ein Stage-Verzeichnis mit `{private:true}` (`cli/lib/mcp-lifecycle/plugin-runtime.js:11-12,95-97`, `package.js:165-171`).
- Das vorhandene `packages/mcp-server/package-lock.json` (15 Einträge) wird dabei nicht verwendet. Transitive Abhängigkeiten werden bei jeder Erstinstallation frisch aufgelöst (inferred).
- Geprüft werden Name und Version von `server` und `core` sowie das Fehlen von `client` und SDK v1 (`package.js:192-215`). Die Prüfsumme des SDK wird erst nach dem Download gebildet und nicht gegen einen ausgelieferten Sollwert verglichen (trust on first use).
- `PRIVACY.md:28-30` nennt nur `npx` und sagt, eine lokale Laufzeit brauche keinen Paketbezug. Für den Plugin-Weg ist das irreführend.

**Wirkung.** Umgebungen mit Proxy, Offline-Betrieb oder Compliance-Auflagen erfahren erst beim ersten Start von einem Netzbezug. Eine kompromittierte transitive Abhängigkeit würde ohne Abweichung von einem Sollwert übernommen.

**Empfehlung.** Lockfile in den Stage-Install übernehmen (`npm ci` gegen ein ausgeliefertes Lockfile), Sollprüfsummen des SDK im Plugin mitliefern und vor der Übernahme vergleichen, `PRIVACY.md` und Architekturdokumentation berichtigen. Validierung: Test mit manipuliertem SDK-Tarball, der abgelehnt werden muss.

## 3. Gemeinsame Ursachen

Einschätzung der Prüfung, fortgeschrieben aus Lauf 3:

| Ursache | Stand Lauf 4 | Maßnahme |
|---|---|---|
| U1 Keine Unit of Work über mehrere Dateien | weitgehend behoben; Rest: Sperre ohne Ablauf, globale Journalsperre | A1 |
| U2 Kein gemeinsames Schreib-Primitiv | offen, 6 Implementierungen | A4 |
| U3 Kein gemeinsames Primitiv für die Pfadbegrenzung | in der Evaluation behoben, außerhalb offen | A2 |
| U4 Keine erneute Prüfung zwischen Planen und Ausführen | behoben | – |
| U5 Zwei Wahrheiten für Regeln, Prosa-Pins statt Regel-IDs | offen | A5, A6 |
| U6 Hostunterschiede im Vertragstext | offen | A7 |
| U7 Dokumentation und Evals nicht an den Code gebunden | Dokumentation teilweise gebunden (Werkzeugtest), Evals offen | A8, A9 |
| U8 (neu) Auslieferung durch Kopie statt Referenz | neu verschärft durch die Core-Projektion | P1, A6 |
| U9 (neu) Beobachter je Oberfläche nicht als Vertrag festgelegt | offen | A3 |

## 4. Empfohlene Reihenfolge

1. **Sofort:**
   - Lieferkette L1: Lockfile und Sollprüfsummen, `PRIVACY.md` berichtigen.
   - Paritätsbruch A3: Git-Beobachter für MCP oder dokumentierter Vertrag mit Paritätstest.
   - Die drei Widersprüche der Dokumentation (A9).
2. **Vor dem nächsten Release:**
   - Sperre mit Ablauf und Behandlung von `unknown`, Journalsperre je Run (A1).
   - Worker mit `stdout: true` (A3).
   - Äquivalenztest für die Gate-Tabelle, Trivial Boundary vereinheitlichen (A5).
3. **Konservieren:**
   - Gemeinsamer Tabellencodec (A1).
   - Ein `atomicWrite` (A4).
   - `mcp-server` direkt vom Core abhängig, Core-Tests ohne CLI (P1).
   - Abgeleitete Felder nur berechnen (A2).
4. **Modernisieren:**
   - Regelquelle mit IDs statt Satzprüfungen (A6).
   - Hostprofile und erster nativ verifizierter Host (A7).
   - Replays aus echten Aufrufen (A8).

## Gegenprobe

Am Quelltext von mir nachgeprüft:
- die Siegelablehnung (`run-state-writer.js:199`),
- die globale Journalsperre (`run-steps.js:283-284`),
- das gespeicherte `next_allowed_action` (`gate-check.js:326-330`),
- der fehlende Git-Beobachter unter MCP (`mcp-dispatch-runtime.js:137-140`),
- der Worker ohne `stdout: true` (`worker.js:34`),
- der Importgraph mit den Zyklen auf Verzeichnisebene, der Kopplung `mcp-server` → `cli` und den Core-Tests, die aus `cli/lib` importieren (eigenes Analyseskript),
- `README.md:132` und `:310-311`, `closeout.md:17`.

Nicht ausgeführt und damit offen:
- der dauerhafte Stillstand durch Sperre und Journal,
- das unterschiedliche Ergebnis von `verified_change` über MCP und CLI,
- die Auflösung transitiver Abhängigkeiten beim Stage-Install,
- die Gleichwertigkeit der übrigen Pfadprüfungen.

Die übrigen Zahlen (Zeilen, Dateien, Prüfungen, Kopien) stammen aus den Teilprüfungen und sind nicht nachgezählt.

Nebenbefund: Versioniert sind Finder-Duplikate, nämlich `packages/cli/LICENSE 2`, `docs/reviews/REVIEW_…_v2 2.md` und `docs/reviews/REVIEW_…_v3_Architektur 2.md`.
