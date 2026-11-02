# Brownfield Review: UR-Erstellung von gate-check trennen

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Review decision: pass

## Run

- run_id: ur-definition-separation-20261004-01
- related_ur: .agdf/control/artefacts/ur-definition-separation-20261004-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex, kooperative Quellprüfung; keine unabhängige Review-Instanz
- reviewed_at: 2026-10-04

## Objective

Den freigegebenen ersten Schritt zur Trennung der fachlichen UR-Erstellung von gate-check bemessen. Eine eigene Erstellungskompetenz erhält den ursprünglichen Nutzerbedarf; Kontrollzustand, Run-Zuordnung und menschliche Freigabe behalten ihre bestehenden Eigentümer.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Ein eigener benannter Skill wird sichtbar und die Zuständigkeit für den Entwurf wird deutlicher. Bedarf, Entwurf, offene Klärung und Freigabe behalten ihre bestehende Bedeutung; keine neue Interaktionsoberfläche oder neue Freigabeentscheidung.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

Die freigegebene UR legt Nutzerziel und Zuständigkeiten eindeutig fest. Die PRD konkretisiert nur dieses begrenzte Verhalten. Mock oder zusätzliche UX-Analyse sind hierfür nicht erforderlich.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | UR-Gate, bestehende UR-Vorlage und menschliche Freigabe | docs/02-gates.md; plugins/agdf/control/templates/artefacts/UR.md; plugins/agdf/meta/contracts/gate-transition.md | low |
| Source of truth | Ein Skillkatalog mit daraus generierten Hostnamen und Anweisungen | plugins/agdf/meta/agdf-plugin.definition.json; scripts/sync-package-assets.js; scripts/sync-request-activation-projections.js | medium |
| Runtime path | Core liefert heute write_ur als Intake-Fortsetzung; gemeinsamer Dispatcher routet Skills | packages/core/lib/skill-dispatch/delivery-intake.js; service.js; contract.js | medium |
| UI / UX | Bestehende Status- und Freigabepräsentation | packages/core/lib/control-state/run-presentation-render.js; plugins/agdf/meta/contracts/interaction.md | low |
| Persistence / data | Kanonische Run-Operationen, Seal und Präsentationsbindung | packages/core/lib/control-state/run-steps.js; run-recording.js; run-presentation.js; run-state-writer.js | low |
| Tests / QA | Intake-, Skillnamen-, Projektions-, Konformitäts- und Aktivierungstests | packages/cli/scripts/intake-continuation-test.js; agent-skills-conformance-test.js; request-activation-evals-test.js; packages/core/test/skill-names-test.js; scripts/skill-name-projection-test.mjs | medium |
| Release / operations | Gemeinsame Projektion, exakte Payload- und Anweisungsbudgets, versionierte Kompatibilitätsevidenz | scripts/sync-package-assets.js; plugins/agdf/meta/copilot-payload-baseline.json; scripts/host-compatibility/; evals/ | medium |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Die fachliche Erstellung erhält einen eigenen Skill und die bestehende Intake-Fortsetzung muss den neuen Eigentümer eindeutig übergeben. Das betrifft den konsumierten Katalog sowie die Laufzeit- und Hostverträge, ohne Kontroll- oder Freigabeautorität zu übertragen.
- architecture_evidence: packages/core/lib/skill-dispatch/delivery-intake.js liefert write_ur, record_ur und dispatch_again; service.js setzt diese als Intake-Fortsetzung zusammen. Der kanonische Katalog projiziert Skillnamen für Codex, Claude, Copilot und OpenCode.
- architecture_missing_evidence: none für die Bemessung; konkrete Übergabesemantik und Überarbeitungsberechtigung werden vor Umsetzung im SD festgelegt.
- architecture_next_owner_and_action: SD-Eigentümer definiert die Zuständigkeit des UR-Skills und seine Rückkehr zum bestehenden Kontrollpfad; keine zweite Registrierung oder Freigabeimplementierung.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Erstellung und Steuerung sind vermischt | delivery-intake.js: write_ur wird zusammen mit Registrierung und erneuter Prüfung ausgegeben | warn | PRD definiert getrennte Ergebnisse; SD übergibt Erstellung an einen eigenen Skill und beseitigt den konkurrierenden Formulierungsweg. |
| problem: Ein neuer Skill könnte Run-Zuordnung oder Kontrollschreiben duplizieren | delivery-run-assignment.js; run-steps.js; run-recording.js | warn | Vorhandene Eigentümer wiederverwenden. Erstellung arbeitet nur im bestätigten Ziel/Run; Registrierung bleibt kanonisch. |
| problem: Bisherige Projektion setzt zehn Skills voraus | scripts/sync-request-activation-projections.js: validateSkillSet; definition.instructionFootprint; Konformitäts- und Aktivierungstests | warn | SD und TP legen katalogbasierte Projektion und vollständige Messung fest. Bestehende Budgetgrenzen nicht pauschal erhöhen oder Prüfungen abschalten. |
| problem: Änderung eines registrierten UR-Drafts benötigt die richtige Kontrolloperation | run-recording.js: recordRunRevision; run-steps.js: ur; run-presentation.js | warn | SD unterscheidet Erstregistrierung, spätere Entwurfsänderung und neue Präsentationsbindung. Keine Übertragung einer früheren Antwort. |
| problem: Quellprüfung könnte als Host-Verhaltensbeweis ausgegeben werden | Hostprojektionen, Kompatibilitäts- und Aktivierungsevaluationen haben verschiedene Evidenzebenen | warn | TP und QA benennen exakt, welche Quell-, Paket-, Protokoll- oder frische Hostevidenz vorliegt. |

Kein bewusst beibehaltener zusätzlicher Schuldenpfad wird beschlossen. Diese Risiken sind konkrete Design- und Nachweisauflagen, keine akzeptierte offene Zuständigkeitsentscheidung.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Ein neuer öffentlicher Skill und die konsumierte Intake-Übergabe ändern den gemeinsamen Skill-/Laufzeitvertrag auf den unterstützten Hosts. structured_slice scheidet wegen dieses belegten Vertragseffekts aus; die fachliche Arbeit bleibt trotzdem auf UR-Erstellung begrenzt.
- evidence: plugins/agdf/meta/agdf-plugin.definition.json; packages/core/lib/skill-dispatch/delivery-intake.js; service.js; scripts/skill-name-projection-test.mjs; scripts/sync-package-assets.js
- transparency_note: Quick Task und Verified Change sind wegen des neuen Skills und der Vertrags-/Zuständigkeitsänderung nicht geeignet. Reguläre PRD-, SD- und TP-Freigaben bleiben erforderlich. Keine neue Nutzerentscheidung zwischen Brownfield Review und PRD.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract: neuer katalogregistrierter Skill und geänderte konsumierte Intake-Fortsetzung mit gemeinsam projizierten Hostnamen.
- rejected_alternative: structured_slice; full_depth_impacts_absent ist wegen des extern konsumierten Skill-/Laufzeitvertrags nicht erfüllt. Datei- oder Hostanzahl entscheiden nicht über die Tiefe.
- missing_or_conflicting_facts: none für die Modusentscheidung
- depth_evidence_refs: plugins/agdf/meta/contracts/modes.md; plugins/agdf/meta/agdf-plugin.definition.json; packages/core/lib/skill-dispatch/delivery-intake.js; scripts/skill-name-projection-test.mjs

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Freigegebene UR: eindeutig getrennte UR-Erstellung als eigenständig akzeptierbarer erster Schritt. |
| authority_boundary | pass | Bestehende Ziel-, Run-, Kontroll- und Freigabeautorität bleibt maßgeblich; Gate-Transition-Vertrag und UR-Scope. |
| owner_consumer_coordination | pass | Katalog, Core-Router und bestehende Hostprojektoren sind identifiziert; keine externe Datenmigration oder gemeinsame Umschaltung vorausgesetzt. |
| full_depth_impacts_absent | fail | Neuer öffentlicher Skill und konsumierte Intake-Übergabe wirken auf den externen Laufzeit-/Hostvertrag. |
| migration_propagation_bounded | pass | Gemeinsame Generatoren projizieren aus kanonischen Quellen. Bestehende Runs sollen laut UR nicht migriert werden; Paket-/Projektionsnachweise vor Übergabe. |
| failure_recovery_local | pass | Bestehende kanonische Revisions-, Seal-, Präsentations- und Fehlerpfade bleiben Eigentümer; keine neue Persistenz oder irreversible Zustandsänderung verlangt. |
| independently_acceptable | pass | UR-Erstellung kann getrennt geprüft werden, ohne zuvor PRD-, SD- oder TP-Erstellung sowie Review-Gates umzubauen. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Wie werden neue, unvollständige und überarbeitete URs für den Nutzer eindeutig behandelt? | PRD | warn |
| Welcher Skillname und welche gebundene Übergabe werden verwendet, einschließlich direktem Aufruf und Entwurfsänderung? | SD | warn |
| Wie wird die Zehn-Skills-Annahme katalogbasiert ersetzt und der gemessene Aufwand begrenzt? | SD | warn |
| Welche Regression-, Projektions- und tatsächlichen Hostnachweise werden vor QA erbracht? | TP | warn |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Dieses Review verweist auf die bestehende Dispatch- und SoT-Autorität. Es erzeugt keinen zweiten Policy-Eigentümer oder automatisch einen neuen Knoten. Nach Umsetzung ist vor Closeout erneut zu prüfen, ob der bestehende Knoten gezielt aktualisiert werden muss.

## Next Permissible Step

- next_allowed_action: PRD aus der freigegebenen UR und diesem abgeschlossenen Review erstellen und revisionsgebunden zur Freigabe präsentieren.
- forbidden_until_then: SD, TP, Implementierung und Bereitschaftsbehauptungen vor den jeweiligen Freigaben.

## Quality Outlook

- quality_outlook: Quellprüfung belegt Eigentümer und Umfang; Implementierung, Tests und frische Hostbeobachtungen stehen noch aus. Die PRD muss die getrennten fachlichen Ergebnisse und Kontrollgrenzen als beobachtbare Kriterien festhalten.
