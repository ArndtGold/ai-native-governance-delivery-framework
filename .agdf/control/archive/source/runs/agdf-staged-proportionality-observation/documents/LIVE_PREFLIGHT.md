# Live-Preflight: Stufengerechte Proportionalitätsbeobachtung

Status: `pass`
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Task: `SPT-T20`

## Fixe Serienkonfiguration

- Profil: `staged-v2`
- Serie: `codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3`
- Surface: `codex`
- Modell: `gpt-5.6-sol`
- Runtime: `codex-cli 0.145.0`
- AGDF/Package: `0.11.4`
- Adapter: `2.1.0`
- Corpus-/Fixture-Version: `2.0.0` / `2.0.0`
- Scenarios: `72`
- Wiederholungen: `3`
- Pflichtobservationen: `216`
- Timeout je Versuch: `120000 ms`
- Attempt-Limit: `230`
- Ausführung: sequentiell
- Persistenz: neue Serie, kein Replacement

## Prüfergebnis

| Prüfung | Ergebnis | Evidenz |
|---|---|---|
| AGDF Doctor | pass | 0 Findings |
| vollständiger Package-Smoke | pass | Package-, Runtime-Integrity-, Lifecycle-, Routing- und Evaltests grün |
| fokussierte v1/v2-Tests | pass | 40 Fälle, 72 Scenarios, synthetische 216er Serie und Negativmatrizen grün |
| authentifizierter Host | pass | nicht persistierter read-only Smoke mit drei strukturierten Codex-Antworten |
| Mutationsschutz | pass | alle drei Smoke-Observationen `mutation_status=pass` |
| Schema/Redaction | pass | alle drei Smoke-Observationen schema-valide und `redaction_status=pass` |
| Serienziel | pass | Zielverzeichnis existiert nicht |
| historische Integrität | pass | Report-, QA- und Attempts-Hashes stimmen mit der fixierten Provenienz überein |
| Budgetgrenze | pass | höchstens 230 Versuche für 216 gültige Observationen |

## Smoke-Befund und Korrektur

Der nicht persistierte Smoke zeigte, dass die pauschale synthetische Formulierung „missing state
fail-closed“ die kanonische ungated Ausnahme der ersten acht Scenarios überdeckte. Vor der
eigentlichen Serie wurde nur diese Zustandsbeschreibung präzisiert: Eine kanonische ungated
Diagnose- oder Non-Normative-Ausnahme darf anhand ihrer eigenen Kriterien greifen; andernfalls
bleibt fehlender State fail-closed. Sollwerte, Routingowner und historische Evidenz wurden nicht
geändert.

Die erste persistierte Serie ohne explizite requested-axis-Invariante wurde bei 21 gültigen und
fünf ungültigen Observationversuchen kontrolliert beendet. Der Transportgap wurde exakt nach AD-5
geschlossen: Jede angeforderte Achse muss `evaluated` plus einen Nicht-Null-Wert liefern. Nach
erneutem vollständigem Package-Smoke erfüllte `PB-008` den Contract in 3/3 nicht persistierten
Versuchen. Die inhaltliche Varianz dieser gültigen Versuche wird nicht optimiert. Die abgebrochene
Serie bleibt unverändert erhalten; die Vollserie verwendet die neue `r2`-ID.

Nach dem r2-Review wurden CR-SPT-01 bis CR-SPT-03 umgesetzt: Observationen führen Corpus- und
Fixture-Version explizit, staged Pfadklassen verwenden das AD-10-Vokabular und der Stage-Grader
deckt die vollständige 13×13-Matrix einschließlich Soll-`blocked` ab. Adversariale Leakage- und
CLI-Negativtests wurden ergänzt. Fokussierte Tests, vollständiger Package-Smoke und ein
nicht persistierter 3/3-Adapter-Smoke sind grün. Der r2-Bericht bleibt als
`STAGED_PROPORTIONALITY_REPORT_R2.*` unverändert erhalten; die neue Vollserie verwendet `r3`.

## Freigabegrenze

Die vollständige Live-Aufnahme ist innerhalb des genehmigten TP zulässig. Sofortiger Stop gilt bei
Mutation, Redaction-Fehler, Provenienzdrift, Attempt-Limit oder Nutzerunterbrechung.
