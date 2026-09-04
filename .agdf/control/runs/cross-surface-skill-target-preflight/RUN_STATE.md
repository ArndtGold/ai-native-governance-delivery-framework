# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cross-surface-skill-target-preflight
- lifecycle: active
- revision: 7
- revision_id: 6AA58D3E-DA76-405E-8C01-E053E6E9B0C8
- started_at: 2026-09-03
- mode: `structured_slice`
- current_gate: UAT
- decision: pass
- owner: Arndt Gold

## Objective

Direkte evidenzabhängige AGDF-Skill-Aufrufe auf allen unterstützten Hosts zuerst an das kanonisch
aufgelöste Arbeitsziel binden und danach ausschließlich vorhandene Governance-Evidenz sowie den
skill-spezifischen Output verwenden.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Source, Profile und Paket bestehen; die geladene Copilot-Beobachtung bestätigt den sicheren Target-Stopp, aber nicht deutsche Locale-, Verbatim- und kompakte Recovery-Konformität. |
| What is approved? | UR, PRD, SD, TP und QA Revision 1 durch exakte Freigaben; QA wurde am 2026-09-04 gegen Run, Gate und Revision 6 revalidiert. |
| What is missing? | Exakte UAT-Entscheidung über den Instruction-Layer-Slice mit offengelegten Hostgrenzen; andere Hosts und der resolved-repository QA-Fall bleiben unbeobachtet. |
| What is the next allowed action? | UAT Report Revision 1 prüfen und exakt freigeben, Überarbeitung anfordern oder ablehnen. |
| What is explicitly forbidden right now? | Release, automatische Commit-, Push-, PR- oder Hostaktionen sowie das stillschweigende Hinzufügen eines ausführbaren Dispatchers. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Exact `Approval: UR` for the visible cross-surface scope, completed Brownfield Review and ready UX Intent Definition.
- competing_scope_lines: The active Copilot integration run remains independent at QA revise; this run changes the canonical cross-surface direct-skill contract and does not inherit Copilot host acceptance.
- branch_workspace_evidence: Baseline commit `5047db2`; only the explicitly excluded image was untracked before this run.
- branch_workspace_scope_effect: `supports`
- primary_target: evidenzabhängige kanonische AGDF-Skills und ihre generierten Hostprofile
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: beobachteter Copilot-`qa-gate`-Fehlpfad; abgeschlossene Runs
  `task-target-resolution-boundary` und `quality-readiness-surface`; aktuelle Skill-, Contract-,
  Renderer-, Generator- und Eval-Owner
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: aktueller Turn erweitert den QA-Preflight ausdrücklich auf Codex, Claude und
  weitere unterstützte Hosts
- excluded_mutation_targets: Host-Caches und Installationen vor genehmigtem TP; unversionierte
  Datei `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png`; fremde Runs

## Run Status Card

| Run status | Value |
|---|---|
| Status | UAT bereit mit offengelegter Copilot-Teilkonformität und klarer Instruction-Layer-Grenze |
| Current gate | UAT |
| Allowed now | UAT Report prüfen und `Approval: UAT` anfordern |
| Blocked by | Fehlende UAT-Entscheidung |
| Missing approval | `Approval: UAT` |
| Next step | UAT Revision 1 freigeben, Überarbeitung anfordern oder ablehnen |
| Quality outlook | Der sichere Stopp ist live belegt; technische Ausführungserzwingung und vollständige Hostparität bleiben getrennte Folgearbeit |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` am 2026-09-03 nach sichtbarem Scope-Entwurf. |
| PRD | approved | Exaktes `Approval: PRD` am 2026-09-03 nach Revalidierung von Run, Gate und Revision. |
| SD | approved | Exaktes `Approval: SD` am 2026-09-03 nach Revalidierung von Run, Gate und Revision. |
| TP | approved | Exaktes `Approval: TP` am 2026-09-03 nach Revalidierung von Run, Gate und Revision. |
| QA | approved | Exaktes `Approval: QA` am 2026-09-04 nach Revalidierung von Run, Gate und Revision 6. |
| UAT | missing | UAT Revision 1 ist mit offengelegten Loaded-Host-Grenzen bereit zur Entscheidung. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cross-surface-skill-target-preflight/UR.md` | approved | Revision 1 mit exakter Freigabeevidenz. |
| Brownfield Review | `.agdf/control/artefacts/cross-surface-skill-target-preflight/BROWNFIELD_REVIEW.md` | done | `structured_slice`, UI/UX Impact `medium`, bestehende Owner werden wiederverwendet. |
| UX Intent Definition | `.agdf/control/artefacts/cross-surface-skill-target-preflight/UX_INTENT_DEFINITION.md` | ready | Nicht-autorisierende PRD-Eingabe für Zielklärung, Zustände, Recovery und Ownertrennung. |
| PRD | `.agdf/control/artefacts/cross-surface-skill-target-preflight/PRD.md` | approved | Revision 1 mit CSTP-01 bis CSTP-08; exakt freigegeben. |
| SD | `.agdf/control/artefacts/cross-surface-skill-target-preflight/SD.md` | approved | Revision 1 mit einem Target-Owner, direkten Skill-Preflights und vorhandener Cross-Surface-Projektion; exakt freigegeben. |
| TP | `.agdf/control/artefacts/cross-surface-skill-target-preflight/TP.md` | approved | Revision 1 mit zwölf Tasks, vollständiger Akzeptanzabdeckung und QA-Blockbedingungen; exakt freigegeben. |
| Brownfield Analysis | `.agdf/control/artefacts/cross-surface-skill-target-preflight/BROWNFIELD_ANALYSIS.md` | done | Bestehende Target-, Interaction-, Quality-, Generator- und Testowner sind wiederverwendbar; kein Upstream-Konflikt. |
| CD+Tests | `.agdf/control/artefacts/cross-surface-skill-target-preflight/CD_TESTS.md` | done | Shared Preflight, zehn Skill-Consumer, QA-Selbsterhebung, Integrity, 83 Evals und komplette Suite bestehen. |
| Task Plan Review | `.agdf/control/artefacts/cross-surface-skill-target-preflight/TASK_PLAN_REVIEW.md` | done | Pass; 12/12 Tasks und CSTP-01 bis CSTP-08 erfüllt. |
| Clean Implementation Review | `.agdf/control/artefacts/cross-surface-skill-target-preflight/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Pass; ein Contract-Owner, keine parallelen Resolver, Renderer oder Host-Forks. |
| CR | `.agdf/control/artefacts/cross-surface-skill-target-preflight/CODE_REVIEW.md` | done | Pass; keine offene Code-, Sicherheits-, Kompatibilitäts- oder Wartbarkeitsfeststellung. |
| Host Evidence | `.agdf/control/artefacts/cross-surface-skill-target-preflight/HOST_EVIDENCE.md` | done | Vier Oberflächen und vier Evidenzebenen getrennt; geladene Hosts bleiben unbestätigt. |
| QA | `.agdf/control/artefacts/cross-surface-skill-target-preflight/QA_REPORT.md` | pass | Revision 1; Source-, Profil- und Paketentscheidung pass, exakt freigegeben. |
| UAT | `.agdf/control/artefacts/cross-surface-skill-target-preflight/UAT_REPORT.md` | ready | Revision 1; Copilot-Sicherheitsstopp bestanden, Locale-, Verbatim- und Recovery-Grenzen offengelegt. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: `bounded_structured_slice`; direkte evidenzabhängige Skill-Interaktion und vorhandene Cross-Surface-Projektionen ändern sich begrenzt, während Gate-, Approval-, CLI-, Runtime- und Persistenzautorität unverändert bleiben.
- evidence: `.agdf/control/artefacts/cross-surface-skill-target-preflight/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exakte Freigabe am 2026-09-03. |
| UR | motivated_by | Copilot direct `qa-gate` observation | Freie Fragenliste statt Zielklärung oder QA-Entscheidung. |
| Brownfield Review | sizes | UR | `structured_slice` mit vollständiger Structured Depth Evidence. |
| Brownfield Review | reuses | existing target, interaction, quality and sync owners | Keine parallele Struktur erforderlich. |
| UX Intent Definition | informs | PRD | `ready`; Modi, Authority, Blocker, Recovery und Übergänge definiert. |
| PRD | derived_from | UR | CSTP-01 bis CSTP-08 konkretisieren den freigegebenen Scope. |
| PRD | approved_by | `Approval: PRD` | Exakte Freigabe am 2026-09-03 nach Revalidierung von Run, Gate und Revision 2. |
| SD | derived_from | PRD | Ein gemeinsamer Preflight-Contract, skill-spezifische Fortsetzung und vorhandene Profilgeneratoren. |
| SD | approved_by | `Approval: SD` | Exakte Freigabe am 2026-09-03 nach Revalidierung von Run, Gate und Revision 3. |
| TP | derived_from | SD | Zwölf Tasks bilden CSTP-01 bis CSTP-08 auf Implementierung, Tests, Pflichtreviews und getrennte Hostevidenz ab. |
| TP | approved_by | `Approval: TP` | Exakte Freigabe am 2026-09-03 nach Revalidierung von Run, Gate und Revision 4. |
| Brownfield Analysis | validates | TP | Bestehende Owner und der minimale saubere Pfad sind bestätigt; kein paralleler Owner ist nötig. |
| CD+Tests | implements | TP | Shared Preflight, QA-Selbsterhebung, Integrity und 83-Fall-Corpus umgesetzt und vollständig getestet. |
| Task Plan Review | verifies | TP | 12/12 Tasks und acht PRD-Kriterien erfüllt; Hostgrenzen bleiben sichtbar. |
| Clean Implementation Review | verifies | CD+Tests | Ein Contract-Owner und vorhandene Generatoren; keine Workarounds oder parallelen Strukturen. |
| CR | reviews | CD+Tests | Tatsächlicher Diff ohne offene Feststellung; vollständige Regression besteht. |
| QA_REPORT | tests | TP | Revision 1 entscheidet pass aus Brownfield-, Plan-, Review-, Test- und Hostgrenzen-Evidenz. |
| QA | approved_by | `Approval: QA` | Exakte Freigabe am 2026-09-04 nach Revalidierung von Run, Gate und Revision 6. |
| UAT | evaluates | QA | Loaded Copilot bestätigt sicheren Target-Stopp und zeigt offengelegte Instruction-Following-Grenzen. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Direkte Copilot-Antwort | Nutzerbeobachtung am 2026-09-03 | fehlender Target-Preflight und falsche QA-Erklärung | direct |
| Target contract and resolver | `plugin/meta/contracts/task-target-resolution.md`; `create-agdf/lib/task-target-resolution.js` | bestehende Zielautorität | direct |
| Quality contract and QA skill | `plugin/meta/contracts/quality.md`; `plugin/skills/qa-gate/SKILL.md` | QA-Entscheidung und Outputgrenze | direct |
| Cross-Surface generation | `create-agdf/scripts/sync-package-assets.js`; `plugin/meta/agdf-plugin.definition.json` | gemeinsame Profile | direct |
| Repository baseline | Commit `5047db2`; nur ausgeschlossene Bilddatei unversioniert | sauberer Scope-Baselinezustand | direct |
| Implementierungs- und Testevidenz | `CD_TESTS.md`; finaler vollständiger Smoke-Lauf | Source, Profile, Paket und Regression | direct |
| Pflichtreviews | `TASK_PLAN_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | 12/12 Tasks, Integrität und Diffqualität | direct |
| Host-Evidenzmatrix | `HOST_EVIDENCE.md` | keine Ableitung installierter oder geladener Hostparität | direct |
| Geladene Copilot-Beobachtung | Nutzerbeobachtung am 2026-09-04; installierter 0.14.5-Provenienzcheck | Target-Stopp pass; Locale, Verbatim und kompakte Recovery nicht konform | direct |

## Missing Evidence

- UAT-Entscheidung.
- Resolved-repository QA-Beobachtung in Copilot sowie direkte Codex-, Claude-Code- und OpenCode-Beobachtungen.

## Risks

- Doppelte Target-Regeln driften zwischen Skills.
- Ein Host-cwd wird erneut als Zielautorität interpretiert.
- QA-Entscheidung und Run Status Card werden vermischt.
- Generierte Profile werden mit geladener Hostwirkung verwechselt.
- Ein schwächeres Modell befolgt den terminalen Stopp, aber nicht Locale-, Renderer- oder Recovery-Details.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: none
- context_graph_gate_effect: `none`
- context_graph_evidence: Direct-skill and QA ownership extensions in `.agdf/control/CONTEXT_GRAPH.md`.

## Knowledge Persistence Decision

- decision: `context_graph`
- rationale: Die QA-bestandene Direct-Skill- und QA-Ownergrenze ist als dauerhafte
  Cross-Surface-Invariante in bestehenden Nodes ergänzt.
- refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`

## Closeout

- next_allowed_action: UAT Report Revision 1 prüfen und `Approval: UAT` anfordern.
- quality_outlook: Der sichere Target-Stopp ist live belegt; technische Dispatcher-Erzwingung und vollständige Hostparität bleiben separat.
