# Brownfield Review: Copilot-Skillnamen und kanonische AGDF-IDs

## Follow-up: Benutzerkorrektur auf alle Hosts

Die ursprüngliche Analyse bleibt als Evidenz des Copilot-Symptoms erhalten. SCOPE_CHANGE.md erweitert die technische und produktseitige Grenze vor dem SD auf alle unterstützten Hostprojektionen. Codex und Claude Code haben bestehende Plugin-Namensräume und unveränderte kanonische Quelldateinamen. Copilot nutzt `copilot.skillPrefix`; OpenCode nutzt `opencode.skillPrefix` und `opencode.globalSkillPrefix`. `toOpenCodeSkillContent` enthält dieselbe pauschale Backtick-/Pfadersetzung wie `toCopilotSkillContent`; die allgemeine Lösung muss beide und die globalen Adapter prüfen.

Existing evidence: plugins/agdf/meta/agdf-plugin.definition.json (id, codex/claude/copilot/opencode, skillSet); scripts/sync-package-assets.js (sourceSkillName, toCopilotSkillContent, toOpenCodeSkillContent); packages/cli/lib/installers/opencode.js (lokale/globale Namen).

Routing bleibt `structured_delivery` mit `external_contract_depth`; Architektur- und UX-Auswirkung bleiben low. Ein gemeinsamer bestehender Katalog und eine gemeinsame Core-Normalisierung bleiben die Owner. SD klärt die exakte Ableitung aller bestehenden Namen einschließlich Plugin-Namensräumen; TP prüft alle Hostprojektionen. Keine zweite Mappingliste und keine Änderung der Host-Aktivierung. Der erweiterte Scope wird durch eine neue PRD-Revision und Freigabe gebunden.

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: copilot-skill-name-normalization-20261002-01
- related_ur: UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-02

## Objective

Den genehmigten UR-Scope auf die bestehende Eingabevalidierung und Copilot-Projektion begrenzen: kanonische ID stabil erhalten, deklarierte sichtbare Namen eindeutig zuordnen, unbekannte und mehrdeutige Eingaben ablehnen.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Bestehende Skillaufrufe und Fehlerkorrektur werden verlässlicher; keine neue Benutzerentscheidung, Aktivierung, Gatefreigabe oder Arbeitsweise.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | UR.md; Benutzerklarstellung im Chat | gate-check bleibt stabil; sichtbarer Name wird auf die ID aufgelöst | low |
| Source of truth | plugins/agdf/meta/agdf-plugin.definition.json | skillSet.slug und copilot.skillPrefix sind gemeinsam vorhanden | low |
| Runtime path | packages/core/lib/skill-dispatch/contract.js und service.js | Registry verwendet ausschließlich Slugs; gemeinsame Normalisierung vor Target-/Kontrollevaluierung | medium |
| Host transport | packages/cli/lib/mcp-dispatch-runtime.js; packages/cli/lib/cli/validation-handlers.js | MCP bindet surface aus trustedContext; CLI reicht deklarierte surface und skillSet weiter | low |
| UI / UX | scripts/sync-package-assets.js: toCopilotSkillContent | Pauschaler Ersatz einzelner Backticknamen; skill_id: gate-check bleibt erhalten, andere technische Erwähnungen werden umbenannt | low |
| Persistence / data | Keine fachlichen Änderungen | Die Namensauflösung ist ein Eingabeschritt; bestehender Run-/Approval-Zustand bleibt maßgeblich | none |
| Tests / QA | packages/cli/scripts/skill-dispatch-function-contract-test.js; skill-dispatch-test.js; copilot-profile-test.js; packages/mcp-server/test | Bereits vorhandene Core-, Transport-, Sicherheits- und Paketprüfungen erweitern | low |
| Release / operations | Bestehende Generierung und Paketprüfungen | Repository-/Paketnachweis ist scoped; Installation und Veröffentlichung ausgeschlossen | low |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: Akzeptierte Dispatcher-Eingaben und Hostprojektion sind ein extern konsumierter Vertrag. Die gemeinsame Core-Normalisierung kann erweitert werden; kein neuer Dispatcher oder Katalog erforderlich.
- architecture_evidence: contract.js: buildSkillDispatchRegistry/normalizeSkillDispatchInput; service.js: gemeinsamer Eintritt; mcp-dispatch-runtime.js: trustedContext; sync-package-assets.js: copilotSkillName/toCopilotSkillContent.
- architecture_missing_evidence: none für Routing; konkreter Metadatentransport und Aliasvalidierung werden im SD festgelegt.
- architecture_next_owner_and_action: Bestehender Core-Dispatcher-Owner; SD beschreibt Ableitung und Hostbindung aus der Plugin-Definition sowie Kollisionsbehandlung.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Hostname wird nicht auf den bestehenden Katalogeintrag abgebildet | Registry.get(input.skillId) in contract.js | revise | Core-Owner ergänzt im SD exakte katalogbasierte Normalisierung und kanonische Ausgabe |
| problem: Textprojektion vermischt Hostnamen und technische IDs | Pauschale Backtick-Ersetzung in toCopilotSkillContent | revise | Projektionsowner präzisiert im SD den Ersetzungsbereich; kanonische technische Referenzen erhalten |
| problem: Parallele Mappingliste würde driften | Plugin-Definition enthält bereits Slugs und Präfix | warn | Bestehende Definition wiederverwenden; keine manuell gepflegte zweite Liste |

Die Probleme sind geplante Gegenstände des genehmigten UR; es wird keine bestehende oder neue Schuld als akzeptierter Trade-off beibehalten. Die konkreten Lösungen gehören zum SD.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Der Dispatcher akzeptiert zusätzliche öffentlich nutzbare Eingaben in MCP und CLI. Quick Task scheidet wegen Vertragsänderung aus; Verified Change wegen externer API-/CLI-Auswirkung und mehrerer kanonischer Verantwortungsbereiche. Structured Slice scheidet nach dem External/Public-Contract-Trigger der modes.md aus, obwohl der fachliche Fix eng begrenzt ist.
- evidence: plugins/agdf/meta/contracts/modes.md, Structured Depth Decision, Trigger 4; oben belegte Eintrittspfade und Projektion.
- transparency_note: Das ist die verbindliche gespeicherte Route; Umfang und Artefakttiefe bleiben auf diesen Namensfehler begrenzt. Keine Hostinstallation oder Veröffentlichung.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract: zusätzliche akzeptierte Skill-Eingaben am öffentlichen Dispatcher-/CLI-Eintritt.
- rejected_alternative: structured_slice; der belegte externe Eingabevertrag ist nach modes.md ein entscheidender Full-Depth-Trigger.
- missing_or_conflicting_facts: none
- depth_evidence_refs: packages/core/lib/skill-dispatch/contract.js; packages/cli/lib/cli/validation-handlers.js; packages/cli/lib/mcp-dispatch-runtime.js; scripts/sync-package-assets.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Zuverlässige Normalisierung registrierter Copilot-Namen auf unveränderte IDs |
| authority_boundary | pass | Skillnamen gewähren keine Ziel-, Run- oder Freigabeautorität; MCP-surface stammt aus trustedContext |
| owner_consumer_coordination | pass | Core, Transport und Generator im selben Repository; keine externe Umstellung erforderlich |
| full_depth_impacts_absent | fail | Akzeptierte externe Dispatcher-/CLI-Eingaben werden erweitert |
| migration_propagation_bounded | pass | Bestehende IDs bleiben gültig; Generierung ist deterministisch; kein Datenmigrationsbedarf |
| failure_recovery_local | pass | Bestehendes invalid_input vor Target-/Governance-Evaluierung; Rücknahme des lokalen Diffs möglich |
| independently_acceptable | pass | Core-/Transport-/Projektionsprüfungen beweisen scoped Verhalten; Installation explizit ausgeschlossen |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Wie werden bestehende Hostmetadaten ohne neue Mappingliste bis zur gemeinsamen Normalisierung gereicht? | SD | revise |
| Wie werden Alias-/ID-Kollisionen vor einem operativen Aufruf erkannt? | SD | revise |
| Welche Textreferenzen müssen sichtbare Hostnamen und welche stabile IDs enthalten? | SD | revise |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-spezifische Analyse; bestehende Katalog-/Core-/Generatorowner bleiben erhalten.
- memory_target: scope_artifact
- memory_reason: Fehlerursache und Abnahmegrenzen gehören zu diesem Run.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: PRD des genehmigten Scopes ausarbeiten und exakte Approval: PRD anfordern.
- forbidden_until_then: SD/TP vor den jeweiligen Freigaben, Implementierung, QA-/Host-/Release-Erfolgsbehauptungen.

## Quality Outlook

- quality_outlook: Bestehende Owner und Routing sind belegt. Produktverhalten wird im PRD festgelegt; Designfragen werden vor Umsetzung im SD gelöst.
