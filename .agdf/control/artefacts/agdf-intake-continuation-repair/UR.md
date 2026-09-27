# UR: Verlässlicher Delivery-Intake und Fortsetzung nach Freigaben

Status: draft
Gate: UR
Gate approval: open
Revision: 1
Date: 2026-09-27
Owner: user
Run: agdf-intake-continuation-repair
Target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework

## 1. Problem

Im Chat „Bewerte das MCP GitHub-Ökosystem“ endete ein neuer, abgegrenzter Auftrag trotz `intake: true` an der Mehrdeutigkeit bestehender Runs. Die Blockadekarte zeigte eine fehlende UR-Freigabe, obwohl noch kein passender Run zugeordnet war. Der installierte lokale Validator unterstützt den vom Intake verlangten Befehl `run-create` nicht. Nach gespeicherter UR-Freigabe erzwang der Dispatcher erneut einen Antwortstopp, obwohl Brownfield Review und Routenwahl ohne weitere Nutzerentscheidung anstanden. Der Agent band außerdem eine Freigabe an eine erst nach der Nutzerantwort erzeugte Run-Revision.

Diese Brüche zwingen Nutzer, interne Verwaltungs- und Fortsetzungsschritte selbst anzustoßen, und schwächen die Nachvollziehbarkeit der Freigabebindung.

## 2. Ziel

Ein beauftragter neuer Änderungsumfang gelangt zu einem eindeutig zugeordneten Run mit dauerhaft gespeicherter, revisionsgebundener UR. Der Nutzer entscheidet über genau diese präsentierte Fassung. Nach gültiger Freigabe werden bereits autorisierte interne Schritte ohne zusätzlichen Weiterarbeits-Prompt ausgeführt; an echten Nutzerentscheidungen oder Blockaden hält der Ablauf an.

## 3. Umfang

- Neuen Delivery-Intake von Fortsetzung und Auswahl bestehender Runs unterscheiden, auch bei mehreren aktiven Runs; fremde Runs und deren Freigaben erhalten.
- Blockaden und Freigabereife konsistent darstellen: keine UR-Freigabe als Lösung anbieten, solange Run-Zuordnung oder dauerhafte Fassung fehlen.
- Vorgeschriebene Intake-Lifecycle-Befehle über die unterstützte installierte Laufzeit ausführbar machen, ohne interne Modulimporte durch den Agenten.
- Fortsetzung nach Freigaben von reinen Statusabfragen unterscheiden. Für diesen Reparaturfall Brownfield Review und Routenwahl als begrenzte interne Fortsetzung ermöglichen.
- Nutzerantwort an den tatsächlich zuvor präsentierten Run, das Gate und die Revision binden. Nachträglich erzeugte, geänderte oder fremde Revisionen dürfen keine bestehende Antwort übernehmen.
- Kanonische Contracts, Skills, generierte Distributionen und relevante Regressionstests konsistent halten; Quellen- und Installationsnachweise getrennt ausweisen.

## 4. Nicht-Ziele

- Keine automatische Gate-Freigabe, keine Abschaffung der menschlichen Entscheidungsautorität.
- Keine Änderung des MGDF-Produkts oder rückwirkende Reparatur seiner Freigaben.
- Keine Übernahme eines bestehenden AGDF-Runs als pauschale Implementierungsfreigabe.
- Keine Veröffentlichung oder Behauptung eines installierten Fixes allein aufgrund bestandener Quelltests.

## 5. Abnahmesignale

1. Ein neuer Auftrag neben mehreren aktiven Runs gelangt zu einem eigenen, prüfbaren UR-Vorschlag; bestehende Runs bleiben unverändert. Unklare Fortsetzungsabsicht wählt keinen Run stillschweigend aus.
2. Bei ungeklärter Run-Zuordnung gibt die Darstellung einen passenden nächsten Schritt aus und fordert keine ungebundene `Approval: UR` an.
3. Der vom Intake ausgegebene Erstellungsweg funktioniert über die installierbare Runtime-Schnittstelle und benötigt keinen Import interner Funktionen.
4. Vor einer UR-Freigabe liegen Run, dauerhaftes Artefakt und präsentierte Revision vor. Gültige Antworten werden genau daran gebunden; veraltete, nachträglich erzeugte und fremde Bindungen werden zurückgewiesen.
5. Nach gültiger UR-Freigabe führt die aktive Delivery-Fortsetzung Brownfield Review und Routenwahl ohne weiteren Nutzerprompt aus und respektiert das daraus folgende Gate. Eine reine Statusabfrage bleibt lesend.
6. Ein zusammenhängender Regressionstest deckt neuen Auftrag, Run-Erstellung, UR-Präsentation, Freigabe und interne Fortsetzung ab. Negative Fälle sichern Blockaden und Freigabegrenzen ab.
7. Ein Nachweis über den installierten Ausführungspfad wird getrennt von Quelltests dokumentiert; offene Host-Nachweise werden ausdrücklich benannt.

## 6. Bestehende Quellen und Evidenz

- Referenzchat: 01a0e142-c838-76e1-842c-bc9da9758196, MCP-Aufrufe vom 2026-09-27: Intake mit `AGDF_ACTIVE_RUN_AMBIGUOUS`, später Brownfield Review mit `terminal: true`.
- `create-agdf/lib/skill-dispatch/delivery-intake.js` und `service.js`: Intake-Phasen und terminale Kontrollantworten.
- `create-agdf/lib/runtime/validator-application.js`: verfügbarer lokaler Befehlsumfang.
- `create-agdf/lib/control-state/run-recording.js`: Freigabepersistenz und Vertrauensgrenze zum aufrufenden Agenten.
- `plugin/meta/contracts/interaction.md`: vor Präsentation und Persistenz erforderliche Freigabebindung.
- Diagnose: installierte Intake-Funktion gibt bei mehreren Runs keine Fortsetzung zurück; installierter Validator lehnt `run-create` ab. Die relevanten Intake- und Validator-Dateien stimmen mit den untersuchten Quelldateien überein.

## 7. Risiken und offene Fragen

Brownfield Review und Design müssen die kanonischen Verantwortlichkeiten für neue Runs, Fortsetzung und Präsentationsbindung bestimmen. Die Änderung darf weder eine reine Statusabfrage mutierend machen noch die Auswahl eines fremden Runs erlauben. Die technische Nachweisbarkeit einer tatsächlich präsentierten Revision und die Grenzen hostübergreifender Garantien sind ausdrücklich zu klären.

## 8. Autorisierung und nächster Schritt

Der Nutzer hat in diesem Chat ausdrücklich erlaubt, die defekte Intake-/Stoppregel für das Anlegen dieses Reparaturlaufs und seiner UR zu umgehen. Diese Ausnahme ist keine UR- oder Implementierungsfreigabe. Bestehende Freigaben werden nicht übertragen.

Nach Präsentation der gebundenen UR-Revision ist die Nutzerentscheidung `Approval: UR`, Überarbeitung oder Ablehnung erforderlich. Eine gültige UR-Freigabe erlaubt anschließend Brownfield Review und Routenwahl, noch keine Implementierung.
