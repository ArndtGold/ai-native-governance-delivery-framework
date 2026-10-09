# Architekturbewertung: ai-native-governance-delivery-framework (AGDF 0.14.5), Lauf 3

Stand: 2026-09-29 · Branch `feat/mcp-inspect-slice-1` · HEAD `25c8cd5`, derselbe Stand wie Lauf 2 · rein lesend.
Prüfer: Claude Code auf Opus 5.5, mit drei parallelen Teilprüfungen und eigener Gegenprobe. Die Befunde aus Lauf 2 (`REVIEW_…_v2.md`) gingen als Eingabe ein und wurden nicht neu erhoben. Das Dokument ist keine QA-Entscheidung und keine manuelle Verifikation. Laufzeitverhalten ist in keinem Punkt belegt: Es liefen kein Build, kein Test und kein Start eines Hosts. Nur zwei statische Analyseskripte (Zyklen und Erreichbarkeit der Importe) wurden im Temp-Verzeichnis ausgeführt.

Urteilsskala: `suitable` · `conditionally_suitable` · `critical` · `not_assessable`.

## Ergebnis

Der Schnitt im Großen ist tragfähig. Ein semantischer Kern (Gate-Policy, Run-Store, Dispatch) wird von CLI, MCP-Server und vier Host-Adaptern gemeinsam genutzt. Die Adapter sind dünn, der MCP-Pfad schreibt nicht und startet keine Prozesse. Die Architektur hat aber drei strukturelle Schwächen:

1. **Das Integritätsrückgrat hat Lücken.** Der Control State Store kennt keine Transaktion über mehrere Dateien. Seine Sperre verfällt nie. Ein Lauf ohne Siegel wird ohne Freigabeprüfung beschrieben.
2. **Für jede Regel gibt es zwei Wahrheiten.** Dieselben Regeln stehen als „kanonischer“ Vertragstext und als Code. Kein Test vergleicht beide inhaltlich. Eine Prüfmaschine von rund 5.000 Zeilen hält stattdessen Prosa wörtlich fest.
3. **Die Architekturdokumentation ist in drei wesentlichen Punkten veraltet.** Sie nennt ein MCP-Werkzeug statt zwei, sie beschreibt MCP als nicht gebündelt, und sie sagt, 0.14.5 habe keine MCP-Unterstützung.

| Baustein oder Entscheidung | Urteil |
|---|---|
| A1 Control State Store (`.agdf/control`, `control-state`) | `critical` |
| A2 Control Evaluation (gate-check, doctor, control-inspect) | `conditionally_suitable` |
| A3 Dispatch-Oberflächen (CLI, MCP-Server, `@agdf/cli`) | `suitable` mit Auflage |
| A4 Installer, Lifecycle, mcp-lifecycle | `conditionally_suitable` |
| A5 Normatives Modell (Verträge als Text, Code als Durchsetzung) | `conditionally_suitable` |
| A6 Muster Quelle → Kopie → Integritätsprüfung | `conditionally_suitable`, als Aufwandstreiber mit Tendenz zu `critical` |
| A7 Strategie für mehrere Hosts | `conditionally_suitable` |
| A8 Evals und Probes als Rückkopplung | `conditionally_suitable` |
| A9 Architekturdokumentation (`docs/architecture/`) | `critical` für den Abgleich mit dem Quellstand |

## 1. Ist-Architektur

### Bausteine

| Baustein | Aufgabe | Grenze | Umfang |
|---|---|---|---|
| `plugin/meta` mit Verträgen | normative Regeln, Plugin-Definition, MCP-Profil, Locales | Kontext des Agenten (Prosa) | rund 5.300 Zeilen |
| `plugin/skills` (10) | Anweisungen an den Agenten; rufen `agdf_dispatch`, sonst die CLI über das Binding | Kontext des Agenten | rund 1.300 Zeilen |
| `plugin/hooks` | SessionStart startet das generierte `runtime/agdf-session-check.js` | Host-Prozess | 2 Dateien |
| `cli/`, darin `runtime-context.js` | Befehle, globaler Konfigurationskern | OS-Prozess | 2.150 Zeilen |
| `control-state/` | Run-Store: Parser, Writer, Seal, Freigaben | schreibt `.agdf/control` | 2.190 Zeilen |
| `control-evaluation/` | Gate-Policy, doctor, Delivery-Map | lesend | 2.950 Zeilen |
| `skill-dispatch/`, `control-inspect/` | Werkzeugverträge `agdf_dispatch` und `agdf_inspect` | MCP-Worker oder CLI | 1.470 Zeilen |
| `agdf-mcp-server/` | stdio-Transport; jeder Aufruf in eigenem `worker_thread`, Timeout 10 s | eigener Prozess | 224 Zeilen |
| `mcp-lifecycle/`, `installers/`, `host-adapters/`, `lifecycle/`, `install-setup/` | Installation, Aktivierung, Konfiguration der Hosts, Besitzmarker | schreibt ins Nutzerverzeichnis und ins Zielrepo | rund 7.600 Zeilen |
| `runtime/`, `release/`, `public-plugin/` | Herkunftsdigests, Versionsabgleich, Payload-Bau | Build- und Installationszeit | 2.380 Zeilen |
| `delivery-path-search/`, `live-agent/`, Eval-Module | beratende Suche; startet Host-CLIs; Evaluationen | Kindprozesse, Entwicklungszeit | 3.600 Zeilen |
| `agdf/` (`@agdf/cli`) | Wrapper aus einer Zeile, `import "create-agdf/cli"` | – | 3 Zeilen |
| `create-agdf/generated/` | Payloads für die Hosts; enthält Kopien von `lib/` und dem Server | gitignored, nicht versioniert | 385 Dateien, 3,5 MB |
| `.agdf/control` im Zielrepo | kanonischer Zustand: Runs, Artefakte, Freigaben | Zielrepo | – |

Insgesamt hat `create-agdf/lib` 169 Dateien mit rund 28.000 Zeilen. Dazu kommen rund 26.000 Zeilen Skripte, überwiegend Tests.

### Abhängigkeitsrichtung und Schichtung

- **Der Code hängt zur Laufzeit an den generierten Vertragsdaten (✔ nachgeprüft).** `cli/runtime-context.js:15-19` liest beim Import die Plugin-Definition und die Locales aus `generated/plugins/agdf/meta/`, nicht aus `plugin/meta`. Ohne vorher erzeugtes `generated/` scheitert jeder Import über diesen Kern. `cli/contract-command.js:34-39` gibt Vertragstexte als `runtime_contracts` an den Agenten weiter. Die Verträge beschreiben den Code also nicht nur, sie sind Eingabe des Codes.
- **Die semantische Schicht ist sauber isoliert.** `control-evaluation`, `control-state` und `skill-dispatch` importieren nie Installer, Host-Adapter oder mcp-lifecycle. Ab `mcp-dispatch-runtime.js` sind 35 Dateien erreichbar, darunter kein Aufruf von `write*`, `rm*`, `spawn*` oder `exec*`.
- **Auf Dateiebene gibt es keine Zyklen, auf Verzeichnisebene schon:**
  - `control-state` ↔ `control-evaluation` (✔ nachgeprüft): Der Store ruft die Policy auf (`run-recording.js:6`), der Evaluator liest den Store (`doctor.js:3-4`).
  - `installers` ↔ `host-adapters`: 18 Importe in die eine Richtung, 9 in die andere.
  - `cli/runtime-context` wird von fast allen Modulen importiert. `runtime/validator-application.js` importiert zusätzlich CLI-Interna.
  - `defaultAgdfDataRoot` liegt in `installers/local-marketplace.js` und wird von `mcp-lifecycle` und `runtime-check-consent` importiert, liegt also am falschen Ort.

### Sicherheitsgrenzen und Datenflüsse

- **Kontext des Agenten:** Skills und Verträge sind Prosa. Wirksam durchgesetzt wird nur, was über Ergebnisse von Werkzeugen oder CLI zurückkommt. Das Binding trägt `authorizes: false`.
- **MCP-Prozess:** Er prüft Version und Herkunft (Marker, Digests von Server, SDK und Dispatcher, keine Symlinks). Der Worker wiederholt diese Prüfung. Der Pfad ist rein lesend.
- **CLI-Prozess:** Er schreibt ins Zielrepo (`.agdf/control`, Projektkonfiguration der Hosts) und ins Nutzerverzeichnis (`~/.claude`, `~/.copilot`, Codex-Konfiguration, Datenwurzel von AGDF). Er startet npm, git und die Host-CLIs.
- **Hook:** Jede Sitzung führt Node-Code aus dem Plugin-Cache aus.
- **Netz (✔ nachgeprüft):** Der Plugin-MCP-Launcher installiert beim ersten Start `@modelcontextprotocol/server@2.0.0` von npm (`mcp-lifecycle/plugin-runtime.js:11,95`). Die direkte Version ist fest. Ob dabei ein Lockfile die transitiven Abhängigkeiten fixiert, ist offen. `PRIVACY.md` erwähnt diesen Netzbezug nicht (vgl. Lauf 2, D4).
- **delivery-path-search:** Die Suche startet Agenten-CLIs mit einem Git-Status-Wächter. Der Wächter erkennt Mutationen, er verhindert sie nicht (`read-only-guard.js:33`).

## 2. Bausteinbewertungen

### A1 Control State Store: `critical`

**Aufgabe.** Der Baustein speichert den Laufzustand dauerhaft als Markdown-Tabellen in `.agdf/control/runs/<id>/RUN_STATE.md`. Dazu kommen Artefakte, `MASTER_BACKLOG.md` und die Übernahme des Altformats. Er ist das Integritätsrückgrat des Frameworks: Gates, Freigaben und Siegel hängen an ihm.

**Belegte Stärken.**
- Einzelne Dateien werden atomar geschrieben (Temp-Datei mit `wx`, `fsync`, Ablehnung von Symlinks, Rename; `run-state-writer.js:28-63`).
- Die Nebenläufigkeit ist optimistisch über `revision_id` und `expectedContent` gelöst.
- Runs werden in einem Stage-Verzeichnis mit dev/ino-Identität angelegt (`run-state-repository.js:169-200`).
- Der Siegelvertrag ist ehrlich formuliert: „not a signature“.

**Belegte Schwächen.** Sie gehen auf gemeinsame Ursachen zurück und erklären die Befunde C1 bis C3 aus Lauf 2:
- **Keine Transaktion über mehrere Dateien.** `recordRunStep` schreibt `OR.md` direkt, danach den Run und erst nach dessen Commit den Backlog, außerhalb des Locks (`run-steps.js:106-107,228,252-259`).
- **Die Sperre hat weder Besitzer noch Ablauf** (`run-state-writer.js:73`). Nach einem Absturz ist der Lauf dauerhaft gesperrt.
- **Schreiben ohne Siegel ist nicht abgesichert (✔ nachgeprüft).** Die Freigabeprüfung greift nur, wenn `seal.status !== "unsealed"` (`run-state-writer.js:89`). doctor empfiehlt selbst, bei Siegelproblemen „remove both“ (`doctor.js:27`).
  - Inferred, nicht ausgeführt: Ein Agent, der die beiden Siegelzeilen entfernt, kann danach Freigabezeilen über `run-update` ändern.
  - Die Tragweite ergibt sich aus dem Zweck des Frameworks. AGDF soll genau den Agenten begrenzen, der hier handeln würde.
- **Keine Schemaentwicklung.** Der Parser akzeptiert nur `control_state_version: 2` (`run-state-parser.js:37-38`).
- **Drei Tabellenparser für dasselbe Format.** Pipes in Zelltexten werden stillschweigend durch `/` ersetzt (`run-state-edits.js:49-51`).

**Wirkung.**
- Änderbarkeit: Jede neue Spalte berührt drei Parser und die regexbasierten Edits.
- Betrieb: Verwaiste Locks und Zustände, in denen Run, `OR.md` und Backlog auseinanderlaufen, müssen von Hand behoben werden. doctor erkennt einen Teil davon über das Siegel.
- Governance: Der Pfad ohne Siegel ist eine Lücke im Kernversprechen.

**Urteil, hergeleitet.** `suitable` scheidet aus, weil drei tragende Eigenschaften fehlen: Atomik über mehrere Dateien, Robustheit der Sperre und ein Schreibpfad, der ein Siegel verlangt. `conditionally_suitable` würde bedeuten, dass lokale Korrekturen genügen. Hier fehlt aber ein Konzept, nämlich eine Unit of Work. Zudem liegt die Lücke im Kernzweck. Daraus folgt `critical`.
- Einschränkung: Das Urteil stützt sich zum Teil auf die abgeleitete Umgehung über den Lauf ohne Siegel. Widerlegt ein Lauf diese Umgehung, etwa weil ein anderer Pfad `unsealed` abfängt, sinkt das Urteil auf `conditionally_suitable`.

**Empfehlung.**
- **Zielzustand:** Ein Repository-Service mit Unit of Work. Alle Dateien eines Schritts werden in einem Stage-Verzeichnis vorbereitet, ein Journal ermöglicht die Wiederaufnahme. Die Sperre trägt PID, Host und Zeit. Schreiben ohne Siegel ist nur für die Migration zulässig.
- **Vorgelagerte Entscheidung (Maintainer):** Bleibt Markdown das führende Format, weil Menschen es von Hand bearbeiten sollen?
- **Optionen:**
  - (1) Journal plus Stage-Swap auf Markdown. Aufwand mittel; eine Vorlage liefert `release/version-bump.js:415-529`.
  - (2) Zustand in JSON oder SQLite, Markdown daraus erzeugt. Aufwand hoch; das Format bricht, und die Bearbeitung von Hand entfällt.
  - (3) Nur Sperre und Siegelpflicht härten. Aufwand gering; die fehlende Atomik bleibt.
- **Empfohlen:** Option (1).
- **Bleibt unverändert:** Siegelalgorithmus und Revisionsvertrag.
- **Erster umkehrbarer Schritt:** `writeRun` lehnt `unsealed` ab, sofern kein Migrationsschalter gesetzt ist. doctor meldet `unsealed` als `revise` und empfiehlt nicht mehr, die Siegelzeilen zu entfernen.
- **Wirkung auf den Aufwand:** Die Reparaturen von Hand entfallen. Schätzsicherheit gering, weil keine Betriebsdaten vorliegen.
- **Validierung:** Fehlerinjektion je Schreibschritt, ein Test mit abgebrochenem Prozess und liegengebliebener Sperre, ein Test „Siegel entfernt, danach Freigabe geändert“, der mit Ablehnung enden muss.

### A2 Control Evaluation: `conditionally_suitable`

**Stärken.**
- Die Auswertung ist als reine Funktion mit injizierten Beobachtern gebaut, etwa für Git.
- Das Siegel wird im Lesemodell geprüft.
- Verified Change blockiert, wenn Git nicht verfügbar ist.

**Schwächen.**
- **Kein gemeinsames Primitiv für die Pfadbegrenzung.** `run-seal.js` löst es korrekt, `run-state.js` und `verified-change.js` weichen davon ab (Lauf 2, C4).
- **Abgeleitete Werte werden gespeichert und wieder eingelesen (✔ nachgeprüft).** Außerhalb von Verified Change überschreibt ein gespeichertes `next_allowed_action` die berechnete Entscheidung, sofern es kein Platzhalter ist (`gate-check.js:299-303`). Zusammen mit A1 (Lauf ohne Siegel) steuert dann gespeicherter Text die Anweisung an den Agenten.

**Urteil.** Das Lesemodell ist tragfähig. Die Mängel liegen auf dem Weg, über den eine Freigabe zustande kommt, sind aber lokal behebbar.

**Empfehlung.**
- Die Logik aus `run-seal.js` als `containedPath()` herausziehen und überall verwenden.
- Abgeleitete Felder nur berechnen, nie als Eingabe lesen.
- Erster Schritt: `containedPath()` mit Tests für `C:foo`, `\\?\` und UNC-Pfade.
- Validierung: ein Differenztest aus berechneter Entscheidung und gespeichertem Zustand.

### A3 Dispatch-Oberflächen: `suitable` mit Auflage

**Befund.** Es gibt einen Kern mit dünnen Adaptern und keine Parallelimplementierungen:
- `@agdf/cli` besteht aus einer Zeile.
- CLI und MCP-Laufzeit instanziieren dieselben Services (`validation-handlers.js:34-37`, `mcp-dispatch-runtime.js:137-146`).
- Der Server ist reiner Transport. Er prüft die Herkunft dreifach (im Hauptprozess, beim Aufbau des Servers, im Worker) und meldet Timeout, Abbruch und `dispatch_busy`.

**Auflagen.**
- **Die Adapter weichen in der Policy ab.** Die CLI reicht einen Git-Beobachter herein, MCP nicht, und nur MCP prüft die Leseschranke. Inferred: Derselbe Verified-Change-Lauf ergibt unter MCP `block`, unter der CLI `pass`. Die Abweichung fällt sicher aus, ergibt aber keine einheitliche Wahrheit.
- **Die Worker-Ausgabe teilt sich stdout mit JSON-RPC** (Lauf 2, C9). Das folgt aus der Entscheidung für einen Thread statt eines Prozesses.

**Empfehlung.**
- Eine benannte Beobachterkonfiguration je Oberfläche als Vertrag festlegen.
- Erster Schritt: `new Worker(..., { stdout: true, stderr: true })`.
- Validierung: ein Paritätstest CLI gegen MCP auf den Fixtures.

### A4 Installer und Lifecycle: `conditionally_suitable`

**Stärken.**
- `mcp-lifecycle` arbeitet mit echten Transaktionen samt Commit und Rollback und mit Snapshots samt Wiederherstellung.
- Der lokale Marketplace und `public-plugin` tauschen Stage, Backup und Ziel.
- Plan und Ausführung sind als Datenmodell getrennt.

**Schwächen.** Sie erklären die Befunde C5 bis C7 aus Lauf 2:
- **Atomares Schreiben ist vier- bis fünfmal einzeln gebaut**, mit und ohne `fsync`, teils als reines `writeFileSync` und mit einem Sonderweg für Windows.
- **Zwischen Planen und Ausführen wird nicht erneut geprüft.** `remove_tree` löscht mit `force`, ohne die Ownership noch einmal zu prüfen, und ohne Rollback (`lifecycle/operations.js:78-81,113-124`).
- **Drei Reifegrade stehen nebeneinander:** transaktional, best effort und direktes Schreiben. Jeder Installer hat sein eigenes Besitzmodell mit mehreren Marker-Schemata.

**Urteil.** Das Zielmuster existiert bereits in `mcp-lifecycle`, es ist nur nicht verallgemeinert. Deshalb `conditionally_suitable` und nicht `critical`.

**Empfehlung.**
- Ein Modul `host-fs` mit genau einem `atomicWrite`, einer Funktion `removeOwnedTree(path, marker)`, die den Besitz unmittelbar vor dem Löschen erneut prüft, und der Transaktionsschnittstelle aus mcp-lifecycle für alle Pläne.
- Optionen: das vorhandene Muster extrahieren (gering bis mittel, empfohlen) oder die Installer neu schreiben (hoch, ohne Mehrwert).
- Erster Schritt: Vor `rmSync` in `applyLifecyclePlan` den Besitz erneut prüfen.
- Validierung: ein Test mit Tausch des Besitzmarkers zwischen Planen und Ausführen und ein Test mit Abbruch mitten in der Deinstallation.

### A5 Normatives Modell: `conditionally_suitable`

**Aufgabe.** Die Regeln stehen als Markdown im Kontext des Agenten. `create-agdf/lib` erzwingt einen Teil davon.

**Herkunft zentraler Regeln:**

| Regel | Maßgeblich |
|---|---|
| Exakte Freigabeformel, Bindung an Run, Gate, Revision und Digest | Code (`run-recording.js:111-149`); der Alias `Freigabe:` existiert nur im Text |
| Gate-Reihenfolge, früheste Blockade gewinnt | doppelt: `gate-policy.js` und eine Tabelle in `gate-transition.md:145-167`, die sich „canonical“ nennt; die Integritätsprüfung testet nur die Überschrift |
| Konsensphrasen | nur Text, an fünf Stellen mit abweichenden Listen; für den Code folgenlos, weil er alles Nicht-Exakte ablehnt |
| Herkunft der Antwort („deliberate user input“) | nur Modell; der Code setzt den Wert fest (`run-recording.js:136`), die Vertrauensgrenze liegt beim Agenten |
| Trivial Change Boundary | nur Text, widersprüchlich: `modes.md:146` „outside“, `closeout.md:17` „inside“; überschrieben mit „Non-Normative“, aber normativ verwendet; Pfade des AGDF-Repos |
| Seal | nur Code; `content_seal` kommt in `plugin/` nicht vor |
| QA als einzige Entscheidung | Code prüft den Wert; wer ihn gesetzt hat, sagt nur der Text |

**Urteil.** Die sicherheitsrelevante Freigabelogik ist im Code belastbar, und im Normalfall delegiert `gate-check` an den deterministischen Dispatcher. Für die textgeführten Regeln fehlt ein eindeutiger Eigentümer, und die Widersprüche sind nachgewiesen. Sie wirken ungefiltert im Fallback `instruction_only`.
- Offen: Ob Constitution und Router bei Claude und Codex überhaupt in den Kontext geladen werden. Nur OpenCode lädt den Router ausdrücklich. Davon hängt ab, wie stark die Textdrift wirkt.

**Empfehlung.**
- Zielzustand: Jede Regel hat genau einen Eigentümer, entweder Code mit Textverweis oder Text ohne Duplikat.
- Optionen:
  - (a) Einen Äquivalenztest schreiben, der die Übergangstabelle parst und gegen `transitionDecisionForRunState` prüft. Aufwand gering.
  - (b) Die Tabelle aus `gate-policy.js` erzeugen. Aufwand mittel.
  - (c) Den Status quo beibehalten. Die Drift bleibt.
  - Empfohlen: (a) sofort, (b) mittelfristig.
- Erster Schritt: Konsensphrasen und Trivial Boundary jeweils in genau einer Datei führen und `inside`/`outside` angleichen.

### A6 Muster Quelle → Kopie → Integritätsprüfung: `conditionally_suitable`, Aufwandstreiber

**Kosten.**
- Generatoren rund 1.800 Zeilen, Prüfer und deren Tests rund 5.000 Zeilen.
- Zum Vergleich der normative Text: rund 3.900 Zeilen. Die Maschine ist etwa 1,7 Mal so groß wie das, was sie schützt.
- Aus 69 Quelldateien (0,67 MB) entstehen 385 generierte Dateien (3,5 MB).
- Der Guard-Block steht schon im Quellbaum in 12 Dateien.
- `check-runtime-integrity.mjs` enthält 168 `includes()`-Prüfungen, viele davon halten ganze Sätze fest.

**Was das Muster schützt und was nicht.**
- Es schützt die wörtliche Gleichheit der Kopien, die Budgets und das Vorhandensein von Sätzen.
- Eine Umformulierung ohne inhaltliche Änderung bricht die Prüfung.
- Eine inhaltlich falsche, aber wortgleich verankerte Regel besteht sie, etwa die Widersprüche aus A5.
- Der Fingerprint hat einen falschen Pfad eingefroren (Lauf 2, P1).

**Urteil.** Der Zweck wird erreicht, denn die Kopien sind synchron. Das Kosten-Nutzen-Verhältnis macht das Muster aber zum Aufwandstreiber, weil jede Textänderung Änderungen im Prüfer nach sich zieht. Bei weiterem Wachstum kippt das Urteil zu `critical`.

**Empfehlung.**
- Zielzustand: Eine strukturierte Quelle mit Regel-IDs, aus der Text, Code-Konstanten und Projektionen erzeugt werden. Geprüft werden IDs und Struktur, keine Sätze.
- Erster Schritt: Neue Pins nur noch als Marker-ID zulassen und die bestehenden nach Regel gruppieren.
- Validierung: Zeilen des Prüfers je Vertragszeile pro Release und die Zahl der Commits, die den Prüfer nur wegen Umformulierungen ändern.

### A7 Strategie für mehrere Hosts: `conditionally_suitable`

**Stärken.** Hostspezifischer Code macht nur rund 3.300 von 26.000 Zeilen aus (etwa 13 %). OpenCode ist mit rund 1.550 Zeilen am teuersten. Dispatch- und Gate-Logik existieren einmal.

**Schwächen.**
- **Hostunterschiede stehen in den Verträgen.** Hosts werden in Verträgen und Skills 31 Mal genannt, etwa in Router, `interaction.md`, `control-scaffold.md` und dem Toolnamen `mcp__agdf__agdf_dispatch`. Jeder Host trägt damit die Kontextlast der anderen.
- **Der Nachweis fehlt.** Alle 12 Kombinationen aus Host und Betriebssystem stehen auf `unverified` (`HOST_COMPATIBILITY.md:31-53`). Die Matrix beruht auf 0.11.4. Neuere Probe-Nachweise (`scripts/native-probes/evidence/*-2026092[89]`) sind nicht übernommen.

**Urteil.** Der Schnitt ist gut. Die öffentliche Aussage „vier Hosts“ ist nicht nachgewiesen.

**Empfehlung.**
- Hostspezifisches in Host-Profile verlagern, die nur auf ihrer Fläche ausgeliefert werden.
- Zuerst einen Host nativ auf `verified` bringen. Bis dahin Copilot und OpenCode öffentlich als experimentell kennzeichnen.

**Payload.**
- Nur `gate-check` (6,9 KB) und SessionStart haben ein Budget.
- Die übrigen Skills haben 7,6 bis 16 KB. Mit den referenzierten Verträgen ergeben sich 87 bis 124 KB, grob 22.000 bis 31.000 Tokens.
- Die Copilot-Payload ist um 57 % gewachsen (von 708 KB auf 1,11 MB), und die Grenze wurde je Slice mitgezogen.
- Empfehlung: Budgets für alle Skills und für die Summe im Fallback einführen und `interaction.md` (41 KB) in Teilverträge aufteilen.

### A8 Evals und Probes: `conditionally_suitable`

**Stärken.**
- Die Evals weisen ihre Grenze selbst aus („deterministic replay is not live host execution“).
- Der Proportionalitäts-Benchmark prüft die Herkunft je Beobachtung.
- Die nativen Probes werten `stream-json` aus und nicht den Modelltext.

**Schwächen.**
- Die Replays vergleichen handgeschriebene Beobachtungen mit handgeschriebenen Erwartungen (Lauf 2, D2). `evaluateGateCheck` wird in `skill-evals` nicht aufgerufen.
- In der CI läuft nur der Codex-E2E. Claude-E2E und die Aktivierungsmatrizen sind manuelle Befehle.

**Empfehlung.**
- Die Felder `current_gate`, `missing_approval` und `forbidden` der Beobachtungen aus einem echten Aufruf von `evaluateGateCheck` über die Fixture-Zustände erzeugen. Kuratiert bleibt nur der Anteil des Modellroutings.
- Validierung: Eine absichtlich eingebaute Regression in der Policy muss das Replay rot werden lassen.

### A9 Architekturdokumentation: `critical` für den Abgleich

**Soll-Ist-Abgleich gegen `docs/architecture/README.md` und die Diagramme 01 bis 06:**

| Dokumentiert | Stand |
|---|---|
| „AGDF 0.14.5 besitzt keine MCP-Unterstützung“ (`README.md:21`, ✔ nachgeprüft) | **veraltet**: 0.14.5 enthält MCP-Server, Lifecycle und Plugin-MCP |
| Der Server stellt genau ein Werkzeug `agdf_dispatch` bereit (README, Diagramme 01 bis 03) | **weicht ab**: zwei Werkzeuge; `control-inspect` fehlt in Text und Diagrammen |
| Plugin-Installation aktiviert MCP nicht; Plugin und MCP haben getrennte Lebenszyklen (Diagramm 04) | **weicht ab**: Die Plugins für Claude und Codex bündeln MCP (`mcpServers`), und der Launcher installiert beim ersten Start das SDK von npm |
| Diagramm 04: Plugin-Payload und MCP-Paket getrennt | **teilweise**: Das Payload enthält Laufzeit und Server als Kopie |
| Gemeinsame Laufzeit unter `<AGDF_DATA_ROOT>/mcp/...` mit Referenzzählung | stimmt; der zweite Laufzeitort `CLAUDE_PLUGIN_DATA` ist nicht dokumentiert |
| Diagramm 02: Server → Vertrag → Dispatcher; geschlossenes Adapterregister | stimmt; die Worker-Isolation ist nicht dokumentiert |
| Diagramm 01: Dispatcher liest `.agdf/control` | stimmt, lesend und mit Symlink-Sperre |
| Diagramme 03, 05, 06 | stimmen strukturell; die Laufzeitwirkung ist nicht geprüft |
| Bausteintabelle | **lückenhaft**: Es fehlen control-inspect, delivery-path-search, live-agent, lifecycle, scaffold, runtime-check-consent, release, public-plugin, die Eval-Module und `@agdf/cli` als Wrapper |
| Rolle von `cli/runtime-context` als Kern, Zyklen auf Verzeichnisebene, Abhängigkeit von `generated/` zur Laufzeit | **nicht dokumentiert** |

**Urteil.** Für den praktischen Nutzen ist die Dokumentation gut. Die sechs Diagramme stellen den Kern richtig dar, und die Richtung Server → Vertrag → Dispatcher stimmt. Für eine Einarbeitung taugt sie. Für sichere Änderungen an Distribution und MCP führt sie aber in die Irre: Wer ihr folgt, nimmt an, dass es keinen Netzbezug beim ersten Start gibt, dass Plugin und MCP getrennt sind und dass es nur ein Werkzeug gibt. Deshalb `critical` für den Abgleich, nicht für die Einarbeitung.

**Empfehlung.**
- Diagramme 01 bis 04 und README zusammen mit dem Slice `agdf_inspect` aktualisieren; das deckt sich mit Lauf 2, D1.
- Den Plugin-MCP-Pfad samt npm-Bezug als eigene Beziehung eintragen.
- Einen Test ergänzen, der die dokumentierte Werkzeugliste gegen `listTools` prüft.

## 3. Gemeinsame Ursachen der Einzelbefunde

Die Befunde aus Lauf 2 lassen sich auf wenige strukturelle Ursachen zurückführen. Das ist eine Einschätzung der Prüfung:

| Ursache | Erklärt aus Lauf 2 | Maßnahme |
|---|---|---|
| U1 Keine Unit of Work über mehrere Dateien | C1, C2 | A1, Option (1) |
| U2 Kein gemeinsames Schreib-Primitiv | C5, C7, Teile von C10 | A4, `host-fs` |
| U3 Kein gemeinsames Primitiv für die Pfadbegrenzung | C4, B-Teil von C10 | A2, `containedPath()` |
| U4 Keine erneute Prüfung zwischen Planen und Ausführen | C6 | A4 |
| U5 Zwei Wahrheiten für Regeln (Text und Code), Prosa-Pins statt Regel-IDs | P1, P3, P4, P6 | A5, A6 |
| U6 Hostunterschiede im Vertragstext | P5, P7 | A7 |
| U7 Dokumentation und Evals nicht an den Code gebunden | D1, D2, D7 | A8, A9 |

## 4. Empfohlene Reihenfolge

1. **Sofort, vor dem Merge des Slices:**
   - Architekturdokumentation und Diagramme 01 bis 04 aktualisieren (A9).
   - `writeRun` lehnt `unsealed` ab, und doctor empfiehlt nicht mehr, die Siegelzeilen zu entfernen (A1, erster Schritt).
2. **Vor dem nächsten Release:**
   - `containedPath()` herausziehen (A2).
   - Den Besitz vor dem Löschen erneut prüfen (A4).
   - Worker-stdout isolieren (A3).
   - Äquivalenztest für die Gate-Tabelle (A5).
3. **Konservieren:**
   - Unit of Work im Run-Store (A1).
   - Modul `host-fs` (A4).
   - Eine Wahrheit je Regel (A5).
   - Budgets für alle Skills (A7).
4. **Modernisieren:**
   - Strukturierte Regelquelle mit IDs statt Prosa-Pins (A6).
   - Host-Profile (A7).
   - Replays aus echten Aufrufen erzeugen (A8).

## Gegenprobe

Am Quelltext von mir nachgeprüft:
- die Freigabeprüfung, die bei `unsealed` entfällt (`run-state-writer.js:89`), und die doctor-Empfehlung „remove both“ (`doctor.js:27`),
- das Laden aus `generated/` in `runtime-context.js:15-19`,
- die npm-Installation des SDK beim ersten Start (`plugin-runtime.js:11,95`),
- das gespeicherte `next_allowed_action`, das die berechnete Entscheidung überschreibt (`gate-check.js:297-303`),
- „keine MCP-Unterstützung“ in `docs/architecture/README.md:21`,
- den Verzeichniszyklus `control-state` ↔ `control-evaluation`.

Nicht ausgeführt und damit offen:
- die Umgehung über den Lauf ohne Siegel,
- die Paritätsabweichung zwischen CLI und MCP,
- die stdout-Durchleitung aus dem Worker,
- ob Constitution und Router bei Claude und Codex im Kontext landen,
- ob der npm-Bezug des SDK transitive Abhängigkeiten fixiert.

Die übrigen Zahlen (Zeilen, Bytes, Zahl der Pins) stammen aus den Teilprüfungen und sind nicht nachgezählt.
