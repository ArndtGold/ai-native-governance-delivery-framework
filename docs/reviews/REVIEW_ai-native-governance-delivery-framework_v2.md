# Review: ai-native-governance-delivery-framework (AGDF 0.14.5), Lauf 2

Stand: 2026-09-29 · Branch `feat/mcp-inspect-slice-1` · HEAD `25c8cd5` · Prüfung rein lesend, keine Testläufe.
Prüfer: Claude Code, Wiederholung nach Modellwechsel. Die Teilprüfungen liefen zum Teil auf Fable 5.1, die abgebrochenen auf Opus 5.5 (Fable-Kontingent erschöpft); Gegenprobe und Bericht auf Opus 5.5. Kein Review nach EMIGA-Berichtslinie, keine QA-Entscheidung, keine manuelle Verifikation.

> **Vergleichbarkeit:** Lauf 1 prüfte HEAD `16f0b31`. Seitdem kam der Commit `25c8cd5` hinzu (neues MCP-Werkzeug `agdf_inspect`). Beide Läufe haben also nicht denselben Quellstand geprüft. Auch Aufruf und Modell waren nicht vollständig gleich. Der Abschnitt „Vergleich mit Lauf 1“ ist deshalb eine Gegenüberstellung, kein Methodenvergleich.

## Ergebnis

Eine ausnutzbare Schwachstelle wurde auch in Lauf 2 nicht gefunden. Der zweite Lauf ging tiefer, vor allem in `create-agdf/lib` (68 Dateien vollständig gelesen, Installer, Control-State), und hat dabei mehr Befunde gefunden. Neu und am Quelltext bestätigt sind:

- ein veraltetes Lockfile in `agdf/`,
- eine Doku, die seit HEAD nicht mehr zum MCP-Server passt,
- ein Guard-Pfad, der in jeder Auslieferung ins Leere zeigt,
- npm-Pakete ohne LICENSE,
- Schreibpfade im Control-State und in den Installern, die bei einem Abbruch Inhalte verlieren oder auseinanderlaufen lassen können.

Der Release-Pfad bleibt der wichtigste Handlungsbereich.

## Prüfumfang und Grenzen

- Gelesen:
  - `plugin/` vollständig (Skills, alle Verträge, Hooks, Manifeste, Locales)
  - MCP-Server
  - `create-agdf/lib`: Control-State, Evaluation, Dispatch, Lifecycle, Installer, Public-Plugin
  - Skripte, CI-Workflows, Top-Level-Dokumente, `docs/`, `evals/`, `.agdf/`
- Nicht vollständig gelesen: `create-agdf/scripts/**` (Testskripte), `scripts/check-runtime-integrity.mjs`, `instruction-footprint.mjs`, `INSTALL.md`.
- Nicht ausgeführt: Tests, Hooks, Installer, Publish-Workflow. Laufzeitverhalten ist in keinem Punkt belegt.

## Feststellungen

Spalte „Gegenprobe“: ✔ = von mir am Quelltext nachgeprüft; „–“ = Aussage der Teilprüfung, nicht nachgeprüft.

### Release, CI, Lieferkette

| ID | Schwere | Feststellung | Beleg | Gegenprobe |
|---|---|---|---|---|
| B1 | mittel | Der Legacy-Workflow `publish-create-agdf.yml` löst auf Tags `create-agdf-v*` aus und veröffentlicht `create-agdf` allein. `RELEASE.md` verbietet diese Tags. `codex-release-e2e.yml:33` lässt sie ausdrücklich zu. | `.github/workflows/publish-create-agdf.yml:3-6,65-69`, `RELEASE.md:95-103` | ✔ |
| B2 | mittel | `agdf/package-lock.json` steht auf 0.11.2, `agdf/package.json` auf 0.14.5. Ursache: `version-coherence.js` führt nur die Lockfiles von `agdf-mcp-server` und `pages`. `npm ci` in `agdf/` scheitert voraussichtlich. Die CI merkt es nicht. | `agdf/package-lock.json:3`, `agdf/package.json:3`, `create-agdf/lib/release/version-coherence.js:69-76` | ✔ |
| B3 | mittel (inferred) | Der Publish-Workflow führt an der Wurzel kein `npm ci` aus, die PR-CI schon. `operational-localization-test.js` lädt `acorn` über die Wurzel-`package.json` (devDependency). Kam nach `agdf-v0.14.5` hinzu. Der nächste Release scheitert damit voraussichtlich im Validierungsjob. | `create-agdf/scripts/operational-localization-test.js:100`, `agdf-guardrails.yml:49`, `publish-agdf.yml:16-86` | ✔ (Struktur), Lauf nicht ausgeführt |
| B4 | mittel | Die CI-Härtung ist schwach: Actions nur per Major-Tag gepinnt, `agdf-guardrails.yml` ohne `permissions:`, doppelte Auslösung durch `push: "**"` und `pull_request`, kein Audit, kein CodeQL, kein Dependabot. Publish nutzt `NPM_TOKEN` neben `id-token: write`. Der MCP-Server wird in CI mit `--package-lock=false` installiert, transitive Abhängigkeiten sind also nicht fixiert. | `agdf-guardrails.yml:3-8,35,40`, `publish-agdf.yml:17,22,77,130` | ✔ |
| B5 | mittel | Die npm-Pakete `create-agdf`, `@agdf/cli` und `@agdf/mcp-server` enthalten keine LICENSE. Apache-2.0 §4(a) verlangt, dass eine Kopie mitgeliefert wird. Die NOTICE-Fassungen der Pakete lassen den Markenhinweis weg. | Paketverzeichnisse, `NOTICE:9-14` | ✔ (LICENSE fehlt) |
| B6 | niedrig | Release-Voraussetzungen unvollständig: `CODEX_API_KEY` und das Environment `codex-release` fehlen in `RELEASE.md`. Eine Rücknahmeregel bei einem Teilpublish fehlt. | `publish-agdf.yml:9-12,100`, `RELEASE.md:86-87` | ✔ (Lauf 1) |
| B7 | niedrig | `create-agdf/scripts/codex-hook-observation-test.js` wird von keinem Skript und keinem Workflow aufgerufen. Die Pakete haben kein `test`-Skript. | `create-agdf/package.json`, `package.json` | – |

### Dokumentation, Evals, Hygiene

| ID | Schwere | Feststellung | Beleg | Gegenprobe |
|---|---|---|---|---|
| D1 | hoch | Die Doku sagt „genau das Werkzeug `agdf_dispatch`“. Der Server liefert seit HEAD zwei Werkzeuge (`agdf_dispatch`, `agdf_inspect`). Hosts, die Werkzeuge freigeben, rechnen damit falsch. | `README.md:36`, `INSTALL.md:108`, `docs/architecture/README.md:87,181`, `agdf-mcp-server/test/protocol.test.js:17` | ✔ |
| D2 | hoch | Die Offline-Evals prüfen handgeschriebene Sollwerte: Die Beobachtungen spiegeln die `expected`-Felder. Der Runner setzt den Fingerprint aus `manifest.json` statt aus der Beobachtung und legt keine Arbeitsbereiche an. `INSTALL.md` verspricht „disposable repository fixtures … measured mutation limits“. Die Stichprobe ist klein: 4 Fälle für jeden von 4 der 10 Skills. Die Website zeigt „Eval cases“ als Kennzahl. | `evals/observations/deterministic-replay.json`, `create-agdf/lib/skill-evals/index.js:98-99`, `INSTALL.md:1081-1087`, `pages/src/pages/index.astro:231-232` | – (in Lauf 1 als mittel) |
| D3 | mittel | Live-Evidenz ist schmal: sieben Codex-Beobachtungen zu brownfield-analysis. Der Proportionalitäts-Benchmark stammt von 0.11.4, mit einem Modell und drei Wiederholungen. | `evals/observations/live/codex/`, `evals/proportionality/` | – |
| D4 | mittel | `PRIVACY.md` und `TERMS.md` (Stand 2026-08-17) beschreiben nur die Distribution ohne MCP-Server. Hooks, MCP, CLI-Schreibpfade und der Abruf per `npx @latest` sind nicht erwähnt. | `PRIVACY.md:3,7-10` | – |
| D5 | mittel | Hygiene: `.agdf/control/` enthält 1.351 versionierte Dateien mit Rohtranskripten, davon 29 Runs mit `lifecycle: active`. Dazu kommen rund 50 MB Binärdateien (eine unverwiesene Keynote-Datei mit 6 MB, PNGs); `.git` hat 81 MB. `.agdf/control/README.md` beschreibt ein Verzeichnis `templates/`, das es nicht gibt. | `.agdf/control/README.md:11-25`, `docs/presentation/*.key` | – |
| D6 | niedrig | Der neue Slice `agdf_inspect` ist committet, obwohl sein Run bei `QA / in_progress` steht und kein `QA_REPORT.md` vorliegt. Das verstößt gegen die eigene Delivery-Regel. | `.agdf/control/runs/agdf-mcp-inspect-slice1-20260929-01/RUN_STATE.md:13-14,27` | – |
| D7 | niedrig | Die Konzeptdoku (`docs/00-07*.md`, `examples/`) kennt Verified Change, Mode/Slice, UAT und OR nicht. Die README führt Einsteiger zuerst dorthin. Die README nennt „fünf Diagramme“, der Ordner enthält sechs. | `README.md:141-143,232-233` | – |

### Plugin, Verträge, Hooks

| ID | Schwere | Feststellung | Beleg | Gegenprobe |
|---|---|---|---|---|
| P1 | hoch | Der Guard-Block nennt `path: plugin/meta/contracts/request-activation.md`. Das installierte Plugin hat kein Präfix `plugin/`. Der Vertrag verbietet jede Änderung am Block, und der Fingerprint erzwingt das. Jeder der 10 Skills trägt damit einen Pfad, der sich im Plugin nicht auflösen lässt. | `plugin/meta/contracts/request-activation.md:180-193`, `create-agdf/generated/plugins/agdf/skills/gate-check/SKILL.md:17` | ✔ |
| P2 | mittel | Generische Verträge und Templates nennen Pfade des AGDF-Repositorys (`create-agdf/lib/**`, `plugin/skills/**`). Sie werden in fremde Zielrepositories ausgeliefert, wo diese Pfade nichts bedeuten. | `plugin/meta/contracts/modes.md:152-158`, `plugin/control/templates/MASTER_BACKLOG.md:18,21`, `task-target-resolution.md:151` | – |
| P3 | mittel | Hängender Querverweis: `closeout.md` verweist auf die Trivial Change Boundary „above“. Der Abschnitt steht aber in `modes.md:144`. `delivery-closeout` lädt `closeout.md` ohne `modes.md`. | `plugin/meta/contracts/closeout.md:17` | ✔ |
| P4 | mittel | Die Liste der Konsensphrasen steht an vier Stellen und driftet bereits: „go“ nur in der Constitution, „looks good“ nur in `gate-transition.md`, im Router keins von beiden. Dasselbe Muster zeigen die Gate-Kette und die Felder des Quality Contract. Kein Check meldet diese Drift, und die Router-Regel „no second complete rule“ ist verletzt. | `agdf-constitution.md:202-203`, `gate-transition.md:54`, `agdf-agent-router.md:77,130` | – |
| P5 | mittel | Hooks im Quellbaum zeigen auf `runtime/agdf-session-check.js`, das dort fehlt. Wird der Quellbaum direkt als Plugin geladen, wirft jede Sitzung `MODULE_NOT_FOUND`. Der Fallback `session-start.sh` meldet Exit 0, ohne etwas zu prüfen. `commandWindows` trägt PowerShell-Logik im JSON und greift laut Code-Kommentar nur bei Codex. | `plugin/hooks/hooks.json:8-9`, `session-start.sh:7-11`, `create-agdf/lib/host-adapters/codex/session-command.js:3-4` | ✔ (Lauf 1) |
| P6 | mittel | Der Fingerprint ist korrekt und reproduzierbar (in allen 12 Vorkommen nachgerechnet), aber selbstbezüglich: Er schützt vor Drift, nicht vor Manipulation. Die Vorschrift lässt offen, ob Marker und abschließender Zeilenumbruch mitgerechnet werden. `policy_version` ist nicht an den Fingerprint gekoppelt. | `request-activation.md:184-187`, `instruction-footprint.mjs:139-147` | – |
| P7 | niedrig | Payload: Das Copilot-Budget wird je Slice passgenau angehoben (1,1 MB, 114 Dateien). Locales (129 KB) sind von keinem Budget erfasst. Der Dispatch-Absatz steht in jedem Skill (etwa 1,5 KB). | `plugin/meta/copilot-payload-baseline.json:4-6` | – |
| P8 | niedrig | Kleinere Uneinheitlichkeiten: Die Constitution schreibt „Agentic …“, die Manifeste „AI Governance & Delivery Framework“. Der Statuskarte fehlt der Modus `structured_slice`. Die Manifeste verweisen auf `mcp/` und `copilot-skills/`, die nur im generierten Baum existieren. | `agdf-constitution.md:6`, `interaction.md:8` | – |

### Laufzeit- und Installer-Code

| ID | Schwere | Feststellung | Beleg | Gegenprobe |
|---|---|---|---|---|
| C1 | mittel | Der Closeout schreibt `OR.md` per `writeFileSync`, bevor die versiegelte Run-Revision geschrieben ist. Scheitert der Run-Write (`stale_revision`, Lock), ist ein vorhandenes `OR.md` schon ersetzt. Inhalt und Seal laufen dann auseinander. | `create-agdf/lib/control-state/run-steps.js:104-107,226-227,252-256` | – |
| C2 | mittel | `MASTER_BACKLOG.md` wird ohne Sperre und ohne Erwartungswert gelesen und geschrieben, und zwar nach dem Run-Write. Parallele `run-step`-Aufrufe können eine Zeile verlieren. | `run-steps.js:73-102,257-259` | – |
| C3 | mittel | Die Schreibsperre `RUN_STATE.md.lock` hat weder PID noch Zeitstempel. Nach einem Absturz bleibt jeder weitere Schreibvorgang dauerhaft mit `AGDF_RUN_WRITE_LOCKED` blockiert, und die Meldung nennt die Datei nicht. | `run-state-writer.js:70-77,108-111` | – |
| C4 | mittel (inferred) | Laufwerksrelative Pfade unter Windows (`D:foo`) passieren die Wurzelprüfung in `run-state.js` und `verified-change.js`. `run-seal.js` prüft das korrekt. Die Datei würde gelesen und in der Freigabepräsentation angezeigt. | `control-evaluation/run-state.js:18-23`, `verified-change.js:19-23`, `run-seal.js:16` | – |
| C5 | mittel | Installer schreiben Benutzerkonfigurationen nicht atomar und ohne `lstat` (`opencode.json`, Lifecycle-Mutation `write`). Ein Abbruch hinterlässt eine abgeschnittene Datei; über einen Symlink wird in fremde Dateien geschrieben. | `installers/opencode.js:161,265,365`, `lifecycle/operations.js:104-105` | – |
| C6 | mittel | `applyLifecyclePlan` löscht rekursiv, ohne die Ownership nach der Bestätigung durch die Person erneut zu prüfen (TOCTOU). | `lifecycle/operations.js:78-81,111-114` | – |
| C7 | mittel (inferred) | Scheitert im `commit()` das Löschen des Backups (Windows `EBUSY`), stellt der nächste Lauf dieses Backup als „unterbrochene Transaktion“ über den bereits übernommenen Stand zurück. | `installers/local-marketplace.js:409-419,612-616` | – |
| C8 | niedrig | Das Claude-Probe startet `claude` unter Windows mit `shell: true`, obwohl es den sicheren Auflöser `resolveHostCommand` gibt. | `scripts/native-probes/claude-activation-matrix.mjs:81,132` | ✔ |
| C9 | niedrig (inferred) | Der Worker wird ohne `stdout: true` gestartet. Seine Ausgabe landet auf dem JSON-RPC-Kanal des Elternprozesses, jede `console.log` im Dispatch würde das Protokoll zerstören. Diagnosedetails werden durchgehend verworfen. | `agdf-mcp-server/src/worker.js:34-36,72`, `server.js:48-50,62,68` | ✔ (keine stdout-Option) |
| C10 | niedrig | Weitere Einzelpunkte: Der SOT-Parser verschiebt Spalten bei leeren Zellen. `doctor.js` trennt Pfade mit `/` statt `basename`. `git`-Aufrufe laufen ohne Timeout. Es gibt toten Code, doppelte Windows-npm-Logik und einen ungeprüften `marker.filename`. Der CRLF-Parser in `mcp-lifecycle/adapters/claude.js` versagt vermutlich. Die Shell-Probes laufen ohne `pipefail`. | `shared.js:22-29`, `doctor.js:89`, `local-development.js:131-137`, `adapters/claude.js:11-13` | – |

## Verworfene Aussage

Eine Teilprüfung in Lauf 2 meldete „kein `shell: true` im gesamten Quellbestand“. Das ist falsch: `claude-activation-matrix.mjs:81,132` setzt `shell: process.platform === "win32"`. Die Aussage aus Lauf 1 (hier C8) bleibt bestehen.

## Vergleich mit Lauf 1

- **In beiden Läufen:** Legacy-Publish-Workflow, CI-Pinning und `permissions`, schwache Eval-Aussagekraft, schmale Live-Evidenz, fehlendes `runtime/` hinter den Hooks, Fingerprint nur als Drift-Schutz, dupliziertes Regelgut, Payload-Ratsche, veraltete `PRIVACY.md`, Repository-Hygiene, Diagrammzahl.
- **Nur in Lauf 2:**
  - B2 (Lockfile), B3 (fehlendes `npm ci` im Publish), B5 (LICENSE)
  - D1 (Doku zu `agdf_inspect`; entstand erst mit `25c8cd5`), D6 (Slice ohne QA)
  - P1 (Guard-Pfad), P2, P3, P4 (Drift konkret belegt)
  - C1 bis C7, C9
- **Nur in Lauf 1:** Signal-Handler des MCP-Servers ohne `exit` (R14) und `SECURITY.md` ohne Meldefrist. In Lauf 2 nicht erneut gemeldet, aber auch nicht widerlegt.
- **Abweichende Einstufung:** Die Eval-Aussagekraft (D2) steht in Lauf 2 als „hoch“, in Lauf 1 als „mittel“. Ich übernehme „hoch“, weil `INSTALL.md` eine Leistung verspricht, die der Runner nicht erbringt; das ist eine falsche öffentliche Aussage, nicht nur eine schwache Stichprobe.

## Stärken (in beiden Läufen bestätigt)

1. Fail-closed durchgängig; eine Freigabe gilt nur mit exakter Formel. Der Aktivierungsvertrag hat einen Abstain-Pfad.
2. Der MCP-Server ist per Test auf Read-only verpflichtet und isoliert Aufrufe in Workern mit Timeout, Abbruch und Busy-Guard.
3. Die Schreibvorgänge für den Run-State sind sorgfältig gebaut: Temp-Datei, `fsync`, Rename, Revision und Seal als Gatter. Die Installer prüfen Ownership mit Marker, Digest und `lstat`; Verzeichnisse werden transaktional über Stage und Rename getauscht.
4. Windows-Behandlung von `.cmd`-Shims ohne `cmd.exe`; eine Symlink-Leseschranke für `.agdf/control`.
5. Der Release ist gekoppelt: Versionsabgleich aller Pakete, feste Reihenfolge, Provenance, `--ignore-scripts`, Clean-Bootstrap-Test. Die PR-CI läuft auf Linux und Windows mit Node 22 und 24.
6. Ehrliche Nachweisgrenzen: Replay ist kein Live-Nachweis, Host-Kombinationen stehen auf `unverified`. Die Generat-Kopien sind synchron (`diff -rq` ohne Abweichung).

## Empfehlungen nach Priorität

1. **hoch, vor Merge von `feat/mcp-inspect-slice-1`:**
   - Doku zu `agdf_inspect` nachziehen (D1) und einen Test Doku gegen `listTools` ergänzen.
   - QA des Slices abschließen (D6).
2. **hoch, vor dem nächsten Release:**
   - `npm ci` im Publish-Workflow ergänzen (B3).
   - `agdf/package-lock.json` in die Versionsflächen aufnehmen (B2).
   - Legacy-Workflow entfernen (B1).
   - LICENSE in die Pakete aufnehmen und in `test:package-contents` prüfen (B5).
   - Actions per SHA pinnen, `permissions: contents: read` setzen, Trusted Publishing (B4).
3. **hoch:**
   - Die Eval-Aussage in `INSTALL.md` korrigieren und den Fingerprint je Beobachtung speichern (D2).
   - Den Guard-Pfad plugin-relativ machen und den Fingerprint einmal neu berechnen (P1).
4. **mittel:**
   - `OR.md` erst nach dem Run-Write schreiben und das Backlog unter denselben Lock stellen (C1, C2).
   - Verfallsregel für die Sperre (C3).
   - Gemeinsame Wurzelprüfung nach dem Muster von `run-seal.js` (C4).
   - Atomare Konfigurationsschreibvorgänge und erneute Ownership-Prüfung vor dem Löschen (C5, C6, C7).
   - Repo-Pfade aus den generischen Verträgen entfernen und einen Eigentümer für die Konsensphrasen festlegen (P2, P4).
   - Datenschutzerklärung erweitern (D4).
5. **niedrig:** alle übrigen Punkte.
