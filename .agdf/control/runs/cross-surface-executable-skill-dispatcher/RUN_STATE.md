# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cross-surface-executable-skill-dispatcher
- lifecycle: active
- revision: 13
- revision_id: 22165494-7FAA-4853-B950-0F594F0E8E8E
- started_at: 2026-09-04
- mode: `structured_delivery`
- current_gate: QA
- decision: revise
- owner: Arndt Gold

## Objective

Einen versionsgleichen ausführbaren AGDF-Skill-Dispatcher bereitstellen, der auf Copilot, Codex,
Claude Code und OpenCode die gemeinsame Preflight-Logik deterministisch ausführt und dem Modell nur
einen terminalen Ausgang oder eine begrenzte nächste Aktion übergibt.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | CSED-HOST-04 lief bytegleich: Target-/Approval-Fragen und Text vor dem Dispatcher sind beseitigt; Copilot erwähnt AGDF aber noch ungefragt und zieht `Feld`/`Wert` zusammen. SessionStart ist jetzt für normale Unterhaltung still, Runtime-Erwähnung erfordert AGDF-Intent und exakter Terminaltext liegt direkt in `host_action.text`. |
| What is approved? | UR, PRD, SD und TP Revision 1 durch exakte, jeweils revalidierte Freigaben. |
| What is missing? | Frischer Copilot-Retest der Nicht-Aktivierungs-Korrektur sowie übrige Copilot-, Codex-, Claude-Code-, OpenCode- und native Windows-Nachweise aus TP-09. |
| What is the next allowed action? | Neueste Pluginfassung installieren, Copilot neu starten und eine reine Sprachpräferenz ohne AGDF-Aufruf wiederholen. |
| What is explicitly forbidden right now? | Hostinstallation oder Neustart ohne separate Autorisierung, QA-Pass, UAT, Commit, Push, PR und Release. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: Explicit user request to implement the separately scoped executable dispatcher after the Windows-fix closeout.
- competing_scope_lines: `cross-surface-skill-target-preflight` remains independently at UAT and is not reopened; completed `windows-release-bump-symlink-fixture` supplies latency evidence only.
- branch_workspace_evidence: HEAD `c83d4e1b22b714c4f206dc3cc58b9aae65b94d2f`; only unrelated untracked `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png` existed before this run.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: Copilot three-minute observation; prior Copilot QA invocation trace; existing skill, target contract and installed runtime owners
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: new cross-surface runtime and adapter capability
- excluded_mutation_targets: prior runs; Windows fixture; unrelated image asset; approvals and repository content outside later approved scope

## Run Status Card

| Run status | Value |
|---|---|
| Status | QA Revision 6: revise; weitere Hostverbesserung belegt, letzter Retest offen |
| Current gate | QA |
| Allowed now | Nicht-Aktivierungs-Korrektur installieren und TP-09-Nachweise vervollständigen |
| Blocked by | Sichtbare Tabellenfidelity, Nicht-Aktivierungs-Retest sowie übrige Loaded-Host- und native Windows-Nachweise fehlen |
| Missing approval | none |
| Next gate after approval | none |
| Allowed after approval | none |
| Next step | Copilot mit einer reinen Sprachpräferenz erneut prüfen; AGDF darf dabei nicht ungefragt starten |
| Quality outlook | Dispatcher besteht; Hostbefolgung und restliche Plattformmatrix bleiben getrennte Evidenzebenen |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` nach Revalidierung von Ziel, Run, Gate und Revision 1. |
| PRD | approved | Exaktes `Approval: PRD` nach Revalidierung von Ziel, Run, Gate und Revision 3. |
| SD | approved | Exaktes `Approval: SD` nach Revalidierung von Ziel, Run, Gate und Revision 4. |
| TP | approved | Exaktes `Approval: TP` nach Revalidierung von Ziel, Run, Gate und Revision 5. |
| QA | blocked | QA Revision 6 entscheidet `revise`; CSED-QA-02 bis CSED-QA-04 sind im Repository gelöst, CSED-QA-01 bleibt für direkte Hostevidenz offen. |
| UAT | blocked | QA fehlt. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UR.md` | approved | Revision 1 definiert den gemeinsamen ausführbaren Preflight, Hostgrenzen und getrennte Latenzevidenz. |
| Brownfield Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_REVIEW.md` | done | Bestehende Owner werden erweitert; Structured Delivery ist wegen Runtime-, Public-Contract- und Cross-Host-Release-Tiefe erforderlich. |
| UX Intent Definition | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UX_INTENT_DEFINITION.md` | ready | Sichtbare Start-, Terminal-, Continuation-, Fehler-, Recovery- und Capability-Zustände sind als PRD-Input vollständig. |
| PRD | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/PRD.md` | approved | Revision 1 definiert Dispatcher-Grenze, Registry, typed outcomes, Timing, Hostparität, Authority und Release-Evidenz. |
| SD | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/SD.md` | approved | Revision 1 definiert einen lokalen Dispatcher-Service, CLI-Schema, Outcome-Vertrag, Bindings, Tests, Rollout und Rollback. |
| TP | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP.md` | approved | Revision 1 ordnet 18 Anforderungen zehn ausführbaren Arbeitspaketen, Tests, Stopbedingungen sowie Windows- und Hostevidenz zu. |
| Brownfield Analysis | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_ANALYSIS.md` | done | Revision 1 bestätigt Erweiterung und Wiederverwendung der bestehenden Owner; TP-01 bis TP-08 dürfen in CD+Tests beginnen. |
| CD+Tests | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CD_TESTS.md` | done | Revision 5 ergänzt stillen Kontext und exakten `host_action.text`; fokussierte und Release-Regressionen bestehen. TP-09 bleibt teilweise offen. |
| Loaded-host Evidence | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/HOST_EVIDENCE.md` | partial | Revision 4: Bytegleicher Retest beseitigt Targetfragen und Vorabtext; ungefragte Runtime-Erwähnung und sichtbarer Tabellenkopf bleiben für neueste Korrektur offen. |
| TP Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP_REVIEW.md` | revise | 8/10 vollständig; TP-09 und TP-10 teilweise. |
| Clean Implementation Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 5 bestätigt stillen Kontext und direkte Textübergabe ohne parallele Owner. |
| CR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CODE_REVIEW.md` | done | Revision 5 besteht nach `host_action.text` und Ordinary-Chat-Policy. |
| QA | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/QA_REPORT.md` | revise | Revision 6: CSED-QA-04 repository-seitig gelöst; CSED-QA-01 hält neuesten Retest und Restmatrix offen. |
| UAT |  | missing | QA fehlt. |

## Mode/Slice Decision

- decision: `structured_delivery`
- required_next_gate: PRD
- scope_reason: `architecture_runtime_depth`; ein neuer ausführbarer Orchestrierungsowner, ein typisierter öffentlicher Aufrufvertrag und koordinierte Projektion und Validierung über vier Hostprofile lösen zusätzlich `external_contract_depth` und `release_cross_host_depth` aus; `structured_slice` würde diese Tiefe unterschätzen.
- evidence: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_REVIEW.md`; bestehende Runtime-, Command-, Skill-, Generator- und Hostprofile

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | motivated_by | Copilot direct-skill latency | Korrekte repo-lose Target-Karte erschien erst nach ungefähr drei Minuten. |
| UR | approved_by | `Approval: UR` | Exakte Freigabe nach Revalidierung von Ziel, Run, Gate und Revision 1. |
| Brownfield Review | sizes | UR | `structured_delivery` wegen Runtime-, Public-Contract- und Cross-Host-Release-Tiefe. |
| UX Intent Definition | derived_from | UR and Brownfield Review | Ready; ausführbarer Preflight bleibt von Skill-Judgement und Hostchrome getrennt. |
| PRD | derived_from | UR | Revision 1 übernimmt freigegebenen Scope und alle ready UX-Kriterien. |
| PRD | approved_by | `Approval: PRD` | Exakte Freigabe nach Revalidierung von Ziel, Run, Gate und Revision 3. |
| SD | derived_from | PRD | Revision 1 ordnet Runtime, Registry, CLI, Bindings, Generierung, Tests und Rollback bestehenden Ownern zu. |
| SD | approved_by | `Approval: SD` | Exakte Freigabe nach Revalidierung von Ziel, Run, Gate und Revision 4. |
| TP | derived_from | SD | Revision 1 plant Dispatcher, Instruktionskürzung und Beweisführung vollständig gegen PRD und SD. |
| TP | approved_by | `Approval: TP` | Exakte Freigabe nach Revalidierung von Ziel, Run, Gate und Revision 5. |
| Brownfield Analysis | validates | TP | Revision 1 bestätigt den reuse-before-create Implementierungspfad ohne blockierenden SoT- oder Ownership-Konflikt. |
| CD+Tests | implements_and_tests | TP | Revision 5 ergänzt stillen Kontext und exakten `host_action.text`; vollständiger Smoke sowie fokussierte Release- und Runtime-Nachweise bestehen; TP-09 bleibt separat. |
| Loaded-host Evidence | validates | TP-09 | Revision 4: Targetfragen und Vorabtext beseitigt; stille normale Unterhaltung und exakte Tabellenfidelity bleiben zu retesten. |
| TP Review | verifies | TP | 8/10 vollständig; TP-09 und TP-10 teilweise. |
| Clean Implementation Review | reviews | CD+Tests | Revision 5 besteht; kein zusätzlicher Skill- oder Renderer-Owner. |
| Code Review | reviews | CD+Tests | Revision 5 besteht; keine offene Code-Lücke nach direkter Textübergabe. |
| QA Report | tests | TP | Revision 6 entscheidet `revise`; neueste Hostevidenz und Restmatrix fehlen. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Copilot loaded-host observation | Nutzerbericht 2026-09-04 | Drei Minuten bis zur korrekten Task-Target-Karte mit GPT-5.6 Sol | direct user-attested |
| Prior QA invocation trace | Copilot `/agdf-qa-gate` transcript | Modell sucht Verträge und CLI-Einstieg vor der Target-Karte | direct user-supplied |
| Current skill contract | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/task-target-resolution.md` | Modellgetriebene Preflight- und Ausführungsreihenfolge | direct |
| Existing executable runtime | generated and installed `runtime/agdf-local.js` | Versionsgleicher CLI-Einstieg vorhanden, Skill-Dispatch fehlt | direct |
| Brownfield owner inspection | `local-validator.js`; `validator-application.js`; `command-registry.js`; manifests; generator and package tests | Wiederverwendung, Hostgrenzen, Public Contract und Release-Tiefe | direct |
| UX Intent Definition | `UX_INTENT_DEFINITION.md` | Arbeitsmodi, sichtbare Zustände, Authority, Recovery, Timing und Hostklassifikation | direct |
| PRD Revision 1 | `PRD.md` | 18 Anforderungen und getrennte deterministische, Distribution- und Hostevidenz | direct |
| SD Revision 1 | `SD.md` | Einzelner Orchestrierungsservice, versionierter Vertrag, fail-closed outcomes und dünne Hostbindings | direct |
| TP Revision 1 | `TP.md` | Zehn Arbeitspakete mit vollständiger Anforderungs-, Test-, Windows-, Host- und Instruktionskürzungsabdeckung | direct |
| Brownfield Analysis Revision 1 | `BROWNFIELD_ANALYSIS.md` | Bestehende Owner, Erweiterungspunkte, Regressionen, Risiken und minimaler Implementierungspfad | direct |
| CD+Tests Revision 1 | `CD_TESTS.md` | Dispatcher, Bindings, Instruktionskürzung, Pakete, Laufzeiten und vollständiger Smoke-Test | direct |
| Instruction Compaction | `SKILL_INSTRUCTION_COMPACTION.md` | 921 Byte statische Reduktion und verzögertes Laden von 40.430 Byte Shared Contracts | direct |
| Mandatory Reviews | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | 8/10 TP-Aufgaben vollständig, saubere Primärlösung und Code Review pass | direct review |
| QA Report Revision 1 | `QA_REPORT.md` | QA `revise`; CSED-QA-01 für Loaded-Host- und native Windows-Evidenz | direct QA decision |
| Copilot fresh-session evidence | Nutzertranskript 2026-09-04; `HOST_EVIDENCE.md` | direkter Dispatcherstart nach ungefähr 10 Sekunden, sichtbarer terminaler Ausgang nach ungefähr 13 Sekunden, keine Vorsuche; abweichende Ausgabe; Locale mangels deutschen Nutzersatzes nicht verifizierbar | direct user-attested |
| Installed Copilot runtime replay | `/Users/arndtgold/.copilot/installed-plugins/agdf/agdf/runtime/agdf-local.js` | Version 0.14.5, `owned_version_matched`, terminaler `target_unresolved`-Ausgang, 6.013 ms Dispatcher- und 1578.764 ms Wrapper-Zeit | direct local replay |
| QA Report Revision 2 | `QA_REPORT.md` | QA `revise`; CSED-QA-01 und CSED-QA-02 offen | direct QA decision |
| Host-transfer correction | `service.js`; `sync-plugin-runtime.js`; `opencode-plugin.js` | maschinenlesbare terminale `host_action`, unveränderte Übertragung, Stopp sowie Verbot zusätzlicher Auswahl- und Runfragen | direct |
| Full regression after host-transfer correction | `npm_config_cache=/tmp/agdf-csed-npm-cache npm --prefix create-agdf run smoke-test` | vollständiger Smoke, Release, 83/83 Skill-Evals, Pakete, Runtime Integrity und Hostprojektionen bestehen | direct test |
| QA Report Revision 3 | `QA_REPORT.md` | QA `revise`; CSED-QA-02 gelöst, CSED-QA-01 für direkte Hostevidenz offen | direct QA decision |
| Copilot German QA retest | Nutzertranskript 2026-09-04; `HOST_EVIDENCE.md` Revision 2 | direkter Start, deutsches terminales Ergebnis nach ungefähr 11 Sekunden und genau eine Recovery-Aktion; sichtbarer Tabellenkopf zusammengezogen | direct user-attested |
| Installed Copilot replay after retest | installierter `agdf-local.js` | Version 0.14.5, Provenienz matched, `host_action` korrekt, 5.167 ms Dispatcher und 354.685 ms Wrapper | direct local replay |
| Non-activation correction | `sync-plugin-runtime.js`; `opencode-plugin.js` | Binding-Präsenz, normale Unterhaltung und Sprachpräferenz allein aktivieren oder verkünden AGDF nicht | direct |
| QA Report Revision 4 | `QA_REPORT.md` | QA `revise`; CSED-QA-02/CSED-QA-03 gelöst, CSED-QA-01 offen | direct QA decision |
| Copilot non-activation retest | Nutzertranskript 2026-09-04; `HOST_EVIDENCE.md` Revision 3 | Bytegleiche Installation überaktiviert AGDF, schreibt vor Dispatcher und verändert Tabellenkopf | direct user-attested plus local digest |
| Binding root-cause correction | `sync-plugin-runtime.js`; `opencode-plugin.js`; `session-start.sh` | neutraler Runtime-Status und maschinenlesbare Aktivierungs-, Vorabtext- und Terminalausgabe-Policies | direct |
| QA Report Revision 5 | `QA_REPORT.md` | QA `revise`; Root Cause repository-seitig korrigiert, Host-Retest offen | direct QA decision |
| Copilot silent-context retest | Nutzertranskript 2026-09-04; `HOST_EVIDENCE.md` Revision 4 | Targetfragen und Vorabtext beseitigt; Runtime-Erwähnung und Header-Fidelity offen | direct user-attested plus local digest |
| Direct terminal text correction | `service.js`; `sync-plugin-runtime.js`; `opencode-plugin.js` | stiller Ordinary-Chat-Kontext und bytegenaue Ausgabe aus `host_action.text` | direct |
| QA Report Revision 6 | `QA_REPORT.md` | QA `revise`; CSED-QA-04 gelöst, CSED-QA-01 offen | direct QA decision |

## Missing Evidence

- Restliche Direct-command-Fälle und erste sichtbare Ausgabe pro unterstütztem Host.
- Native Windows Dispatcher-, Installations- und Pfadevidenz.
- Sichtbare unveränderte Tabellenüberschrift und Nicht-Aktivierung bei einer reinen Sprachpräferenz mit der neuesten Copilot-Bindung.
- Modell- und Host-Tool-Latenzgrenzen der übrigen Fälle sowie QA.

## Risks

- Host-Plugin-APIs können direkte ausführbare Skill-Aufrufe unterschiedlich oder gar nicht unterstützen.
- SessionStart-Kontext kann AGDF in normaler Unterhaltung überaktivieren; die zentrale Korrektur ist
  noch nicht in einer frischen Hostsession verifiziert.
- Windows-Pfade und tatsächliche Host-Latenz bleiben bis TP-09 unbewiesen.

## Context Graph Impact

- context_graph_impact: `updated`
- context_graph_refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Der neue Dispatcher-Owner und seine begrenzten Beziehungen zu Target- und Interaction-Autorität sind nach der SD-Freigabe im Context Graph verankert.

## Knowledge Persistence Decision

- decision: `context_graph`
- rationale: Die wiederverwendbare Dispatcher-Orchestrierungsgrenze ist nach genehmigtem Design mit unveränderten semantischen Ownern kuratiert.
- refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`

## Closeout

- next_allowed_action: record implementation and test evidence
- quality_outlook: Keep the presentation contract, evidence and gate authority aligned.
