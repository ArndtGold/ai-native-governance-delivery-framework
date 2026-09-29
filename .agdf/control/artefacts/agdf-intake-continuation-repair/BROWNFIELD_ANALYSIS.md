# Brownfield Analysis: Implementation preparation

Mode: pre_implementation_analysis
Decision: pass
Date: 2026-09-27
Run: agdf-intake-continuation-repair
Baseline: 36fd67e571f2f62f9bf94e92448c00ecbd4e4a3b

TP Fassung 1 wurde auf Revision f641a86b-783e-474b-9f0d-4f1081306da9 freigegeben. Arbeitsbaum vor Umsetzung: nur Run-/Artefaktdaten dieser Reparatur und MASTER_BACKLOG. Keine fremden Codeänderungen vorhanden.

Reuse: createRun und dessen canonical-scaffold/Pfadprüfungen gemeinsam verwenden; run-state-writer erhält atomare Revisionen und Locks. Präsentationsbeleg referenziert vorhandenen content_seal (alle gelisteten Artefakte, einschließlich UAT-relevanter Evidenz) sowie exakte Darstellung. run-approve prüft nochmals unter Schreiblock, damit Inhaltsänderungen zwischen Prüfung und Persistenz nicht ungeprüft versiegelt werden. Neue Belege sind vorgelagerte Nachweise, historische Approval-Zeilen werden nicht verändert.

Owner: skill-dispatch contract/service/intake; CLI parser/registry/handlers; control-state recording/writer; gate-check/interaction-presentation; bestehende Paketgeneratoren. Keine parallele Runtime. Geprüfte Quellstellen sind die im SD benannten Dateien. Der lokale Validator hat bisher keinen run-create-Handler; volle CLI enthält den wiederverwendbaren Handler.

Tests: vorhandene npm-Suites laut TP bestätigt. control-state-test verwendet direkte approveRunGate-Aufrufe; gültige Testantworten brauchen künftig vorher erstellte Präsentationsbelege. Negative Prüfungen bleiben erhalten und werden um fehlende Bindung ergänzt. Ein neuer zusammenhängender Test prüft die tatsächlich generierte Runtime. Neue Module müssen über den existierenden Import-Closure-Generator in beide Runtime-Payloads gelangen.

Risiken: Host-Sichtbarkeit nicht maschinell ableitbar; Live-Mehrturn-Nachweis bleibt separat erforderlich. Mutierende CLI-Befehle bleiben außerhalb des lesenden MCP-Dispatchers. Zusätzliche Dateipfade nur unter ausgewähltem Run; keine Änderung fremder Runs oder Caches.

Next: T02 bis T09 umsetzen; Tests und Review-Nachweise dokumentieren. Dieser Befund erteilt keine QA-/UAT-Freigabe.
