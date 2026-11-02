# Code Review: Adaptive Codex-CLI-Aktivierungsmatrix

- run_id: `codex-activation-matrix-adaptive-runs`
- decision: `pass`
- reviewed_at: 2026-09-29
- reviewed_scope: `scripts/native-probes/codex-activation-matrix.mjs`, `scripts/native-probes/codex-activation-matrix-test.mjs`, `scripts/native-probes/README.md`, `scripts/native-probes/evidence/codex-activation-matrix-20260929.*`, `package.json` und direkter AGDF-Run-Nachweis.

## Ergebnis

Keine offene Korrektheits-, Sicherheits- oder Regressionserkenntnis im geprüften Diff. Die Fallbewertung bleibt bei `grade`; adaptive Auswahl nutzt deren Erstlaufresultat und startet nach der abgeschlossenen ersten Phase nur ausgelöste Läufe 2/3. Der explizite `--runs`-Pfad bleibt fest. A4 liest im beobachteten Live-Lauf die konkrete isolierte Quelle und durchsuchte dabei keine weiteren Shell-Dateien. Fehlende Cache- oder Suchereignisse werden als unbekannt, nicht als Nullkosten, ausgegeben.

## Geprüfte Risiken und Nachweise

- Ein zunächst fehlender Test für die tatsächlich verwendete zweiphasige Queue wurde vor Abschluss des Reviews behoben: Der produktive Scheduler ist jetzt injizierbar; der kontrollierte Test prüft zehn Erstläufe, bedingte 14 Sitzungen und den festen 30er-Modus.
- Ein abgebrochener eingeschränkter Versuch ließ eine temporäre Authentifizierungskopie zurück. Diese wurde entfernt; der neue Signalpfad beendet aktive Child-Prozesse und räumt die Kopie bei `SIGINT`/`SIGTERM` synchron auf. Ein zweiter Live-Abbruchtest wurde nicht durchgeführt.
- `npm run test:maintenance-contracts` mit sechs neuen Matrix-Tests, `node --check` und `git diff --check` bestehen. Der frische Live-Lauf vor der Test-Seam-Extraktion hatte 10/10 erwartungsgemäße Erstläufe und keine Wiederholungen; die Extraktion wurde gezielt automatisch geprüft.
- Pro-Sitzung-Evidenz und die Grenzen der Suchaufrufzählung stehen in `scripts/native-probes/evidence/codex-activation-matrix-20260929.json` und `.md`.

## Findings

Keine offenen normalisierten Findings. Die ungetestete Signal-Abbruchvariante und das Fehlen eines `file_search`-Ereignistyps sind begrenzte Nachweisrisiken für QA, kein im Diff sichtbarer Defekt.

## Nächster Schritt

QA-Entscheidung anhand des freigegebenen TP, des tatsächlichen Diffs, der gezielten Tests und des Live-Nachweises vorbereiten. Code Review ersetzt keine QA-Freigabe.
