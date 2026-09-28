# Wartungsverträge und Release-Nachweise

## Node-Versionen und GitHub Actions

CLI und MCP benötigen Node.js 22 oder neuer. Die Pflichtmatrix prüft Linux/Node 22,
Windows/Node 22 und Linux/Node 24; Veröffentlichungen und native Codex-E2E nutzen Node 22.
Die JavaScript-Laufzeit der Actions ist davon unabhängig: Checkout und Setup Node verwenden
Version 7, Upload Artifact Version 7 und Download Artifact Version 8, jeweils mit Node 24.
`scripts/node-support-test.mjs` prüft die Paketgrenzen, Workflow-Versionen und die Ablehnung
von Node 18/20/21. Die simulierte Versionsprüfung ersetzt keinen echten Node-24-CI-Lauf.
Historische Nachweise behalten ihre damals tatsächlich verwendeten Node-Versionen.

## Gemeinsamer Katalog

`create-agdf/lib/interaction-catalog.js` definiert Setup-Zustände, zulässige Aktionen,
Fehlercodes und Codex-Hook-Routing. Ergebnisvalidierung, Recovery-Renderer und CLI-E2E nutzen
diesen Katalog. Die Runtime-Provenienz schützt ihn mit. Texte bleiben ausschließlich in
`plugin/meta/agdf-interaction-locales.json`. Fehlende, zusätzliche oder leere Übersetzungen
stoppen den Paketbau vor der Projektion. Test: `npm run test:maintenance-contracts`.
Der Umfang ist Installation und Dispatcher-Recovery, nicht sämtliche Governance-Domänen.

## Verpflichtender nativer CLI-Release-Test

Beide Publish-Workflows benötigen zusätzlich den wiederverwendbaren Job
`.github/workflows/codex-release-e2e.yml`. Er prüft Linux und Windows auf nativen Runnern
mit exakt der CLI-Version und dem Modell aus `scripts/native-probes/codex-release-policy.json`.
Das Einrichten des Workflows beweist noch keinen erfolgreichen Windows-Lauf.

Einmalige Einrichtung in GitHub:

1. Umgebung `codex-release` und vertrauenswürdige Release-Tags/Refs schützen.
2. Secret `CODEX_API_KEY` mit Zugriff auf das festgelegte Modell `gpt-6-luna` bereitstellen.
3. **Codex native release gate** auf einem geprüften Ref manuell starten.

Fehlender Schlüssel, nicht verfügbares Modell, fehlende Plattform oder fehlgeschlagener Job
blockieren die Veröffentlichung. Kein stiller Modellwechsel, kein übersprungener Erfolg.
In CI wird keine persönliche `auth.json` verwendet. Der Schlüssel gilt nur im Testschritt;
der Harness reicht ihn ausschließlich an `codex exec` weiter, nicht an Installation, Build
oder Entfernung. Dieser Workflow darf nur vertrauenswürdigen Release-/manuellen Code ausführen,
nie PR-Code. Siehe [OpenAI-Authentifizierung](https://learn.chatgpt.com/docs/non-interactive-mode#use-api-key-auth).

Geprüft werden Installation/Freigabe, Discovery, Dispatch, ungültige Eingabe, Skill-Fortsetzung
mit Vertragsprüfsummen und Entfernung. Ausstehendes Hook-Vertrauen bleibt sichtbar;
Hook-Ausführung und Desktop-Aktivierung sind nicht Bestandteil dieses MCP-Nachweises.

## Nachweise ohne manuelle Kopien

Jeder Lauf erzeugt `observation.json` und daraus `summary.txt` unter `probe-results/`.
Die Beobachtung enthält Commit, Dirty-Flag, Paket-/Hostversion, Plattform und Modell.
CI lädt nur diese beiden begrenzten Dateien hoch, nie Transkripte, Zugangsdaten oder das
isolierte Hostverzeichnis. Die Abschlussprüfung verwirft falsche Commits/Versionen/Modelle,
Dirty-Läufe, doppelte/fehlende Plattformen sowie fehlende oder fehlgeschlagene Prüfschritte.
Artefakte bleiben 30 Tage verfügbar; für längere Aufbewahrung herunterladen.
Historische eingecheckte Nachweise bleiben erhalten, autorisieren aber keinen neuen Release.

Kompatibilitätsbeobachtungen unter `evals/host-compatibility/observations/` bleiben unverändert
unter ihrem Inhalts-Hash erhalten. Nur die in `docs/compatibility/evidence/snapshot.json`
referenzierte Beobachtung gehört zum aktiven Vergleich. Frühere Fixture-Läufe und protokollierte
Fehlversuche sind Historie, keine aktuelle Freigabe. Native Belege werden über `public_evidence`
im Kompatibilitätsmanifest beim Neuerzeugen erhalten; das allein macht sie nicht zu nativen
Vergleichszeilen und ersetzt keine explizite Zuordnung über `native_sources`.

Lokaler Diagnoseaufruf: `npm run native:codex-e2e -- --model gpt-6-luna`.
Außerhalb CI wird bei Bedarf eine temporäre lokale Auth-Kopie verwendet und danach entfernt.
Ein erfolgreicher Dirty-Lauf ist Diagnoseevidenz, erfüllt aber nicht die Release-Freigabe.

## Live-Evaluierung der Request Activation

Das Verhalten des Modells bei der Aktivierung wird zusätzlich live gemessen (`npm run native:claude-activation-matrix`,
siehe [native Prüfungen](../../scripts/native-probes/README.md)). Der deterministische Korpus unter
`evals/request-activation/` prüft nur die erwartete Klassifikation, nicht das Modell.
Letzter Nachweis mit Vorher/Nachher der größenunabhängigen Aktivierung:
[claude-activation-matrix-20260928.md](../../scripts/native-probes/evidence/claude-activation-matrix-20260928.md).

## Explizite Paketbudget-Pflege

```sh
npm --prefix create-agdf run sync-package-assets
npm --prefix create-agdf run payload:budget
```

Bei Größenüberschreitung bleibt das neue Inventar für den Bericht verfügbar. Dieser prüft
weiterhin Digests, Quellzuordnung, Skillbestand und Version und zeigt Komponentensummen,
größte Dateien und verbleibenden Platz. Unerwartetes Wachstum zuerst untersuchen.
Erst nach Prüfung explizite Grenzen und eine kurze aktuelle Begründung übernehmen:

```sh
npm --prefix create-agdf run payload:budget -- --accept --files 104 --bytes 965362 --reason "Geprüfter Interaktionskatalog, Recovery-Texte und Claude-Sitzungshinweis"
npm --prefix create-agdf run sync-package-assets
```

Diese Zahlen beschreiben den aktuellen Stand, keinen Freibrief für spätere Änderungen.
Der Bericht ändert nichts; Übernahme verlangt Zahlen und Begründung. Builds und Releases
prüfen weiterhin das Budget. Nur der Bericht setzt die Größenprüfung aus, niemals Integrität.
Ungültige numerische Grenzen werden abgelehnt. Die Baseline enthält nur die aktuelle Begründung;
die bisherige Historie liegt in [payload-budget-history.md](payload-budget-history.md).
Künftige Änderungen bleiben im Git-Diff nachvollziehbar.

Hostbezogene lokale Vorbereitung bleibt hostbezogen; der All-Profiles-Release-Schutz bleibt erhalten.
