# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cross-surface-executable-skill-dispatcher
- lifecycle: active
- revision: 17
- revision_id: AB264203-1E6B-4885-AF28-AD5061BB1DAB
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
| What is known? | Copilot bleibt teilweise offen. CSED-HOST-07 beweist, dass der statische globale OpenCode-Skill trotz fehlender Plugin-Bindung einen Paketpfad rekonstruierte. Der Generator verlangt nun aktive Deklaration plus exakte Bindung und verbietet Suche, Ableitung und Shell-Recovery. Release, Smoke und Runtime Integrity bestehen. |
| What is approved? | UR, PRD, SD und TP Revision 1 durch exakte, jeweils revalidierte Freigaben. |
| What is missing? | Sauber abgeschlossener OpenCode-Installations-Retest, frischer Nachweis für den korrigierten Early Return, danach Ausführungsnachweis in einem explizit aktivierten Repository sowie übrige Hostevidenz. |
| What is the next allowed action? | Den korrigierten OpenCode-Installer erneut ausführen und dessen Abschlusskarte erfassen. |
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
| Status | QA Revision 10: revise; OpenCode-Aktivierung, Skill-Rekonstruktion und Installationswartezeit repository-seitig gelöst, Hostnachweis offen |
| Current gate | QA |
| Allowed now | Korrigierte OpenCode-Fassung installieren und TP-09-Nachweise vervollständigen |
| Blocked by | CSED-QA-01: Loaded-Host- und native Windows-Nachweise fehlen |
| Missing approval | none |
| Next gate after approval | none |
| Allowed after approval | none |
| Next step | Korrigierte Installation erneut ausführen; danach in derselben inaktiven Repo-Session ohne Shell-Anforderung retesten |
| Quality outlook | Dispatcher besteht; Hostbefolgung und restliche Plattformmatrix bleiben getrennte Evidenzebenen |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` nach Revalidierung von Ziel, Run, Gate und Revision 1. |
| PRD | approved | Exaktes `Approval: PRD` nach Revalidierung von Ziel, Run, Gate und Revision 3. |
| SD | approved | Exaktes `Approval: SD` nach Revalidierung von Ziel, Run, Gate und Revision 4. |
| TP | approved | Exaktes `Approval: TP` nach Revalidierung von Ziel, Run, Gate und Revision 5. |
| QA | blocked | QA Revision 10 entscheidet `revise`; CSED-QA-05 und CSED-QA-06 sind repository-seitig gelöst, CSED-QA-01 bleibt offen. |
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
| CD+Tests | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CD_TESTS.md` | done | Revision 8 ergänzt die globale OpenCode-Skill-Grenze; Release, Smoke und Runtime Integrity bestehen. TP-09 bleibt teilweise offen. |
| Loaded-host Evidence | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/HOST_EVIDENCE.md` | partial | Revision 7 ergänzt den rekonstruierten Paket-Runtimepfad trotz inaktivem Repository. |
| TP Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP_REVIEW.md` | revise | 8/10 vollständig; TP-09 und TP-10 teilweise. |
| Clean Implementation Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 8 bestätigt die zentrale globale Skill-Grenze ohne parallelen Owner. |
| CR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CODE_REVIEW.md` | done | Revision 8 besteht nach globalem Skill-, Binding- und npm-Audit-Fix. |
| QA | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/QA_REPORT.md` | revise | Revision 10: CSED-QA-05/CSED-QA-06 repository-seitig gelöst; frischer Hostnachweis bleibt in CSED-QA-01 offen. |
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
| CD+Tests | implements_and_tests | TP | Revision 8 ergänzt die globale OpenCode-Skill-Grenze; vollständiger Smoke besteht; TP-09 bleibt separat. |
| Loaded-host Evidence | validates | TP-09 | Revision 7: OpenCode Ordinary Chat, Permission-Grenze, npm-Audit-Wartezustand und rekonstruierter Runtimepfad belegt; korrigierter Retest offen. |
| TP Review | verifies | TP | 8/10 vollständig; TP-09 und TP-10 teilweise. |
| Clean Implementation Review | reviews | CD+Tests | Revision 8 besteht; Generator, Adapter und Installer bleiben vorhandene Owner. |
| Code Review | reviews | CD+Tests | Revision 8 besteht; inaktive Bindung, statische Pfadrekonstruktion und npm-Audit-Wartezeit sind korrigiert. |
| QA Report | tests | TP | Revision 10 entscheidet `revise`; CSED-QA-05 und CSED-QA-06 sind gelöst, die Hostmatrix bleibt offen. |

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
| OpenCode Desktop pre-execution | Nutzer-Screenshot 2026-09-04; `HOST_EVIDENCE.md` Revision 5 | Ordinary-Chat-Isolation und `bash: ask` bestehen; lokale Prüfung belegt fehlende durable Repository-Aktivierung vor unerlaubtem Dispatch-Versuch | direct user-attested plus installed-config and repository inspection |
| QA Report Revision 7 | `QA_REPORT.md` | QA `revise`; CSED-QA-05 und Restmatrix offen | direct QA decision |
| OpenCode inactive-binding correction | `opencode-plugin.js`; `opencode-hardening-test.js` | Inaktive Guidance enthält keine ausführbare Bindung und fordert keine Shell-Permission; aktive Guidance bleibt ausführbar | direct repository test |
| QA Report Revision 8 | `QA_REPORT.md` | QA `revise`; CSED-QA-05 repository-seitig gelöst, CSED-QA-01 offen | direct QA decision |
| OpenCode installer wait diagnosis | Prozessliste und npm-Debuglog 2026-09-04; `HOST_EVIDENCE.md` Revision 6 | stiller lokaler npm-Install wartete in `audit bulk request` mit offener HTTPS-Verbindung | direct local observation |
| OpenCode audit-free installer correction | `opencode.js`; `smoke-test.js`; vollständiger `smoke-test` | lokales Paketupdate ohne Scripts, Audit oder Funding; Regression fail-closed | direct repository test |
| QA Report Revision 9 | `QA_REPORT.md` | QA `revise`; CSED-QA-05/CSED-QA-06 gelöst, CSED-QA-01 offen | direct QA decision |
| OpenCode inactive-skill retest | Nutzer-Screenshot 2026-09-04; `HOST_EVIDENCE.md` Revision 7 | globaler Skill rekonstruierte einen Paket-Runtimepfad und forderte Shell-Permission trotz inaktivem Repository | direct user-attested plus installed-content inspection |
| Global OpenCode skill guard correction | `opencode.js`; `smoke-test.js`; Release, OpenCode, Smoke und Runtime Integrity | aktive Deklaration plus exakte Plugin-Bindung zwingend; keine Suche, Pfadableitung oder Shell-Recovery | direct repository test |
| QA Report Revision 10 | `QA_REPORT.md` | QA `revise`; CSED-QA-05/CSED-QA-06 repository-seitig gelöst, CSED-QA-01 offen | direct QA decision |

## Missing Evidence

- Restliche Direct-command-Fälle und erste sichtbare Ausgabe pro unterstütztem Host.
- Native Windows Dispatcher-, Installations- und Pfadevidenz.
- Sichtbare unveränderte Tabellenüberschrift und Nicht-Aktivierung bei einer reinen Sprachpräferenz mit der neuesten Copilot-Bindung.
- Modell- und Host-Tool-Latenzgrenzen der übrigen Fälle sowie QA.

## Risks

- Host-Plugin-APIs können direkte ausführbare Skill-Aufrufe unterschiedlich oder gar nicht unterstützen.
- SessionStart- und OpenCode-Aktivierungsgrenzen sind repository-seitig korrigiert, aber noch nicht
  vollständig in frischen Hostsessions verifiziert.
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
