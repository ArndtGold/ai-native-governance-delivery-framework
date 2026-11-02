# Brownfield Analysis: Gemeinsame Skillnamen-Auflösung

Mode: pre_implementation_analysis
Status: done
decision: pass
Run: copilot-skill-name-normalization-20261002-01
Based on: genehmigte PRD.md, SD.md und TP.md

## Existing fit and baseline

Baseline commit: 4184dbdb9aa0a049a6add75d0775235800b3945c
Tracked dirty: .agdf/control/MASTER_BACKLOG.md (dieser Intake).
Untracked: artefacts/ und runs/ dieses Runs sowie plugins/agdf/hooks/ (fremder vorheriger Stand).
Keine vorgesehenen Codepfade sind vor Implementierung verändert. Fremde Hooks bleiben unberührt.

Gemeinsamer Core-Service bindet schon Resource Context. Der Dispatcher besitzt bereits die Registry und eine Normalisierung vor Target-/Controlevaluierung. Wiederverwendung statt zweitem Dispatcher. Definition besitzt id, skillSet und Hostpräfixe; Pluginrouter dokumentiert Codex-/Claude-Namensraum. OpenCode-globaler Adapter projiziert derzeit lokal nach global mit pauschalem Substringersatz. Beide Generatoren ersetzen Backticks/Pfade zu breit.

## Implementation boundaries

Reiner Namensableiter im vorhandenen Corebereich; Definition als feste Service-Abhängigkeit; exakt bekannte aktive Hostnamen auf denselben bestehenden Registryeintrag. Testinstanzen ohne Definition behalten kanonisches Verhalten. Technische IDs werden nicht projiziert. Sichtbare Identität/UI-Verweise sind explizit; bestehende relative Contractpfadprojektionen bleiben spezifisch.

Recovery: vorhandene Localevorlage, bounded Erweiterung nur für skill_id-Werte. Keine neue Gate-, Target-, Run-, Hook- oder Approvalautorität. Cli/MCP-Ausgabeform bleibt unverändert. Pflichtprüfungen und negative Fixtures stehen im TP.

## Control correction

Die bisherige TP-Chain verwendete implements_and_verifies statt des kanonisch erforderlichen derived_from. Diese reine Kontrollbeziehung wird vor Implementierung korrigiert; TP-Inhalt und Freigabe bleiben unverändert.

## Evidence and risks

Evidence: contract.js, service.js, index.js, interaction-presentation.js, sync-package-assets.js, installers/opencode.js; git status und HEAD vor Codeedit.
missing_evidence: Implementierungs-, Regressionstest- und Paketnachweise folgen unter CD+Tests.
risks: Mehrdeutige Backtickreferenzen, globale Projektion und Instruktionsbudgets erfordern die geplanten Fixtures. Keine offene Designfrage; bei zusätzlichem Produkt-/Aktivierungsbedarf vor Umsetzung eskalieren.
context_graph_impact: none
context_graph_reconciliation: not_applicable
memory_target: scope_artifact
required_next_step: CD+Tests ausschließlich im genehmigten TP-Scope.
