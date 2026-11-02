# CD+Tests: Adaptive Codex-CLI-Aktivierungsmatrix

- run_id: `codex-activation-matrix-adaptive-runs`
- status: `done`
- date: 2026-09-29
- approved_tp: `TP.md`, Freigabe `Approval: TP` zu Revision `a0d99fb8-ab40-4166-8a6f-bd02614a0534`

## Umsetzung

| Task | Ergebnis | Quelle |
|---|---|---|
| T-001 | Zehn frische Erstläufe im adaptiven Standard; nur abweichende oder vorab markierte Fälle erhalten Läufe 2/3; explizites `--runs` bleibt fest | `scripts/native-probes/codex-activation-matrix.mjs` |
| T-002 | A4 liest die konkrete `meta/contracts/modes.md` der isolierten AGDF-Kopie; fehlende Datei stoppt vor dem Test | `scripts/native-probes/codex-activation-matrix.mjs`; Live-Rohtrace A4-1 |
| T-003 | Parser sichert Gesamt-, Cache- und nicht gecachten Input, Output, Laufzeit sowie abgeschlossene Such-/Leseaufrufe pro Sitzung; unbekannte Werte bleiben `null` | `scripts/native-probes/codex-activation-matrix.mjs`; `scripts/native-probes/codex-activation-matrix-test.mjs` |
| T-004 | Ergebnisdateien und README zeigen Modus, tatsächliche Laufzahl, Auslöser, A4-Quellbindung und Messgrenzen | `scripts/native-probes/README.md`; `scripts/native-probes/evidence/codex-activation-matrix-20260929.*` |
| T-005 | Gezielte Tests und frischer Live-Lauf ausgeführt; Abbruch-Cleanup nach beobachtetem Sandbox-Fehler ergänzt | Test- und Live-Nachweise unten |

## Prüfungen

- `node --check scripts/native-probes/codex-activation-matrix.mjs`: pass.
- `npm run test:maintenance-contracts`: pass. Nach dem Code Review wurde der produktive Scheduler als testbare Funktion extrahiert und ein sechster Node-Test ergänzt; der gezielte `node --test scripts/native-probes/codex-activation-matrix-test.mjs`-Lauf besteht mit 6/6. Der neue Test prüft zehn Erstläufe vor Wiederholungen, 14 Sitzungen bei zwei ausgelösten Fällen und 30 Sitzungen im expliziten festen Modus.
- `git diff --check`: pass.
- Repräsentativer archivierter A4-Rohtrace vom 2026-09-28 mit neuem Parser: 119.404 Input, 101.504 Cache, 17.900 nicht gecacht, 1.296 Output; drei Shell-Suchen und fünf Dateileseaufrufe. Kein Modelltext wurde für Aktivierung gezählt.
- Frischer Codex-CLI-Lauf am 2026-09-29 mit `--scope-run codex-activation-matrix-adaptive-runs --concurrency 2`: 10/10 abgeschlossene und erwartungsgemäße Erstläufe, 0 Wiederholungen, 0 Fixture-Änderungen. Fünf Fälle blieben ohne Dispatcher, fünf aktivierten ihn. Versionen, Pro-Sitzung-Daten und Messgrenzen: `scripts/native-probes/evidence/codex-activation-matrix-20260929.md` und `.json`.
- A4-Live-Rohtrace: ein Dateileseaufruf auf die isolierte `meta/contracts/modes.md`, keine beobachtete Shell-Suche.

## Grenzen und Risiko

- Der Live-Lauf belegt diese zehn Sitzungen mit Codex CLI `0.157.1` und der isolierten AGDF-Kopie `0.14.5+codex.local-18841fddd654`. Er belegt keine Wiederholbarkeit der neun anderen unauffälligen Fälle. Die anschließende Extraktion des produktiven Schedulers wurde durch den neuen kontrollierten Test, nicht durch einen zweiten Live-Lauf, geprüft.
- Ein eingeschränkter Vorversuch scheiterte an `workspace routing discovery failed`; er wurde abgebrochen und nicht als Aktivierungsevidenz gezählt. Die zurückgelassene temporäre Authentifizierungskopie wurde entfernt. Der Harness räumt sie nun auch bei `SIGINT`/`SIGTERM` auf; dieser neue Signalpfad ist noch nicht live durch einen zweiten Abbruch geprüft.
- Die CLI lieferte keinen eigenen `file_search`-Item-Typ. Dateisuch-Zähler bleiben `null`; Shell-Suche und Dateilesen sind beobachtete abgeschlossene Toolaufrufe, keine Datei- oder Tokenmengen.
- 624.034 Brutto-Input-Tokens im neuen Live-Lauf, davon 510.592 gecacht. Daraus wird kein exakter Geldkostenwert abgeleitet.

## Nächster Schritt

Verbindlichen Code Review des tatsächlichen Diffs durchführen, bevor QA-Bereitschaft beurteilt wird.
