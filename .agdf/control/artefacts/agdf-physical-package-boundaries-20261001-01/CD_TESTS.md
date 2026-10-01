# CD+Tests: Physische Core-/CLI-/MCP-Paketstruktur

Run: agdf-physical-package-boundaries-20261001-01
Based on: approved PRD.md, SD.md, TP.md; unchanged SHA256 in evidence/FINAL_SOURCE_BINDING.json
Status: implemented and tested; mandatory review/QA evidence recorded; QA revise; no release claim

## Ergebnis

Die aktiven Quellen liegen in plugins/agdf, packages/core, packages/cli, packages/mcp-server, docs, evals und scripts. Alle drei alten aktiven Software-Roots fehlen. Core besitzt 73 kanonische Module, keine externen Abhängigkeiten, Rückimporte, Paketzyklen oder Prozess-/Netzimplementierung. CLI komponiert die vorhandenen Git-/Runtime-/Hostprovider; MCP hält SDK, Worker und stdio am Adapter. Öffentliche Paketnamen, Exports und bins bleiben erhalten. Core wird privat entwickelt und unverändert in Consumer-Closures kopiert; nur resources/binding.js ist ein explizit abgeleiteter Ressourcendeskriptor.

Root-Build und normale npm-Archive bestehen. Die 82 bestehenden Checks sind nach sechs gezielten Wiederholungen grün (77/82 im vollständigen Lauf; fünf Defekte korrigiert, ein weiterer betroffener Check zusätzlich wiederholt). Frühe Fehlläufe sind in REGRESSION_MATRIX.json sichtbar; FINAL_REGRESSION_MATRIX.json bindet die Korrekturen. Zusätzlich bestehen neue Core-/Provider-/Rückweg-/Clean-Checkout-/Archivtests, CLI/Wrapper-Smoke, Maintenance, Community Health, Evaluations und Hostkompatibilitätsfixtures. Kein echter Host, Modelllauf, Windowslauf, Registry-Publish, neuer Installationslauf oder VCS-Schreibvorgang wird behauptet.

Copilot: 136 / 1.275.270 Bytes zuvor, 152 / 1.293.465 Bytes aktuell; exakt +16 Dateien und +18.195 Bytes aus der gebundenen Closure. Baseline ohne Reserve angeglichen, bestehender Guard bleibt aktiv. Keine Installer-/SDK- oder doppelte Contractclosure im fokussierten Profil. Wiederholungsbuild ist bytegleich; normale Archive werden außerhalb Checkout und Workspace-Verknüpfungen konsumiert. Beide MCP-Protokolle führen reale Toolcalls mit matched provenance aus; derselbe explizite Target-/Run-Doctorbericht ist zur CLI identisch.

## Nachweisgrenze und Abweichungen

Der tatsächliche C00-Quellstand mit bereits vorhandener MCP-Reparatur ist gesichert. Ältere Run-/Reviewartefakte bleiben bytegleich; eine mechanisch geänderte historische Generatorreferenz wurde auf ihre C00-Bytes zurückgeführt. Die ursprünglichen C01/C02/C03-Sicherungen samt stufenweisen Outputmanifesten fehlen. Eine neue isolierte C00→C04-Wiederholung beweist den heutigen Pfad und konkrete Rückweg-/Konfliktfixtures; sie ersetzt keinen historischen Zeitnachweis. Der binäre Indexhash änderte sich ohne Staging/Reset; fünf vorbestehende staged Pfade sind weiterhin dieselben, vier Blobs passen zur gesicherten kanonischen Datei, der fünfte war eine ältere Recoveryvariante. Ursprüngliche Einzel-OIDs wurden nicht erfasst. Deshalb wird keine vollständig bewiesene ursprüngliche Indexidentität behauptet. QA muss diese evidence_gap bewerten und darf keinen vollständigen Planpass daraus ableiten.

## Task- und Szenarienbindung

| Task | Umsetzung / Evidenz | Status vor Reviews |
|---|---|---|
| T-001 | Brownfield pass; C00, Freigaben, Owner und echte Quellen gebunden; ursprüngliche Index-Einzelbindung unvollständig | partially_done |
| T-002 | 73 kanonische Core-Module, Ownergraph, Control/Revision/Lock/Transaction-Regressions | fully_done |
| T-003 | explizite Ressourcen, unveränderliche Definition/Locales; negative Module/Version/Providerfixtures | fully_done |
| T-004 | CLI/Installer/Provider umgezogen; öffentliche Fassaden/Exports erhalten | fully_done |
| T-005 | SDK/Worker/stdio im MCP-Paket; gemeinsame Core-Komposition und reale Protokollcalls | fully_done |
| T-006 | Root-Orchestrierung, drei atomare Assemblyoutputs, private Alias-Closure, historische Versionresolver | fully_done |
| T-007 | Offlineprofile, deklarierte MCP-/Hookpfade, Ressourcen/Provenance und exakter Copilot-Delta | fully_done |
| T-008 | Evalowner, aktive Docs/SoT/Graph/CI und Community Health aktualisiert; ältere Artefakte unverändert | fully_done |
| T-009 | drei normale Archive, bins/Exports/Offline/MCP außerhalb Checkout | fully_done |
| T-010 | isolierte Lifecycle-/Repair-/Recovery-/Ownership-/Consentfälle und konkrete Fehlerfixtures | fully_done |
| T-011 | alte Roots/Brücken entfernt; Endbaum/Graph/Build grün; ursprüngliche stufenweise Sicherung nicht vollständig | partially_done |
| T-012 | 42 Szenarien dokumentiert; Plan/Clean/Code Review gebunden ausgeführt | fully_done |
| T-013 | qa-gate entscheidet revise; spätere QA/UAT-Approvals und OR bleiben bedingt | fully_done for current gate |

| Scenario | Criterion / Task | Ergebnis | Tatsächlicher Nachweis |
|---|---|---|---|
| SCN-001 | AC-001 / T-002 | done | evidence/stages/C-01_MODULES.json; evidence/FINAL_OWNER_MAP.json |
| SCN-002 | AC-001 / T-011 | done | evidence/FINAL_TREE.txt; evidence/FINAL_OWNER_MAP.json; evidence/BRIDGE_INVENTORY.json |
| SCN-003 | AC-002 / T-002 | done | evidence/CONTROL_OWNER_CHECK.json; evidence/tests/core-control-state-test.log; evidence/tests/core-run-revision-test.log; evidence/tests/core-run-step-transaction-test.log |
| SCN-004 | AC-002 / T-005 | done | evidence/ADAPTER_PARITY.json; evidence/tests/cli-control-inspect-test.log |
| SCN-005 | AC-003 / T-003 | done | evidence/tests/core-boundaries.log; evidence/profiles/RESOURCE_CLOSURE.json |
| SCN-006 | AC-003 / T-003 | done | evidence/tests/core-boundaries.log |
| SCN-007 | AC-003 / T-003 | done | evidence/FINAL_DEPENDENCIES.json; evidence/tests/core-boundaries.log |
| SCN-008 | AC-003 / T-003 | done | evidence/tests/provider-boundaries.log; evidence/tests/cli-control-maintenance-test.log |
| SCN-009 | AC-004 / T-004 | done | evidence/PROVIDER_MAP.json; evidence/tests/cli-control-maintenance-test.log; evidence/tests/cli-control-maintenance-test.log |
| SCN-010 | AC-004 / T-004 | done | evidence/CLI_CONTRACT_DIFF.json; evidence/tests/cli-cli-modularization-test.log; evidence/tests/core-interaction-presentation-test.log; evidence/tests/cli-cli-gate-scenarios-test.log |
| SCN-011 | AC-004 / T-009 | done | evidence/ARCHIVE_CONSUMERS.json; evidence/tests/archive-consumers.log; evidence/tests/cli-smoke.log; evidence/tests/wrapper-smoke.log |
| SCN-012 | AC-005 / T-005 | done | evidence/MCP_OWNER_MAP.json; evidence/tests/mcp-server-contract.test.log |
| SCN-013 | AC-005 / T-005 | done | evidence/ARCHIVE_CONSUMERS.json; evidence/tests/mcp-server-protocol.test.log; evidence/tests/mcp-server-safety.test.log; evidence/tests/mcp-server-provenance.test.log |
| SCN-014 | AC-005 / T-009 | done | evidence/ARCHIVE_CONSUMERS.json; evidence/tests/mcp-server-continuation.test.log; evidence/tests/mcp-server-performance.test.log |
| SCN-015 | AC-006 / T-006 | done | evidence/ASSEMBLY_MAP.json; evidence/tests/archive-consumers.log |
| SCN-016 | AC-006 / T-009 | done | evidence/PACKED_OUTPUTS.json; evidence/PACKED_MANIFESTS.json |
| SCN-017 | AC-006 / T-009 | done | evidence/ARCHIVE_CONSUMERS.json; evidence/tests/archive-consumers.log |
| SCN-018 | AC-007 / T-007 | done | evidence/profiles/RESOURCE_CLOSURE.json; evidence/tests/core-boundaries.log; evidence/tests/cli-instruction-footprint-test.log |
| SCN-019 | AC-007 / T-007 | done | evidence/ARCHIVE_CONSUMERS.json; evidence/tests/archive-consumers.log |
| SCN-020 | AC-007 / T-007 | done | evidence/profiles/COPILOT_INVENTORY.json; evidence/profiles/PAYLOAD_DELTA.json; evidence/tests/cli-instruction-footprint-test.log |
| SCN-021 | AC-007 / T-007 | done | evidence/tests/cli-payload-budget-test.log; evidence/tests/cli-portable-plugin-test.log; evidence/tests/cli-plugin-mcp-runtime-test.log |
| SCN-022 | AC-008 / T-006 | done | evidence/ASSEMBLY_MAP.json; evidence/REPEAT_BUILD_DIFF.json |
| SCN-023 | AC-008 / T-007 | done | evidence/profiles/PROVENANCE.json; evidence/tests/cli-plugin-mcp-runtime-test.log |
| SCN-024 | AC-008 / T-007 | done | evidence/tests/cli-plugin-mcp-runtime-test.log; evidence/tests/cli-codex-plugin-mcp-test.log; evidence/tests/mcp-server-provenance.test.log |
| SCN-025 | AC-009 / T-007 | done | evidence/profiles/PROFILE_MATRIX.json; evidence/tests/cli-codex-plugin-mcp-test.log |
| SCN-026 | AC-009 / T-007 | done | evidence/profiles/PROFILE_MATRIX.json; evidence/tests/cli-portable-plugin-test.log; evidence/tests/cli-opencode-hardening-test.log |
| SCN-027 | AC-009 / T-007 | done | evidence/tests/cli-portable-plugin-test.log; evidence/tests/cli-public-plugin-test.log |
| SCN-028 | AC-010 / T-006 | done | evidence/BUILD_ENTRYPOINTS.json; evidence/tests/root-maintenance.log; evidence/tests/cli-release-workflow-contract-test.log |
| SCN-029 | AC-010 / T-011 | done | evidence/CLEAN_CHECKOUT.json; evidence/tests/clean-checkout.log |
| SCN-030 | AC-011 / T-010 | done | evidence/tests/cli-lifecycle-test.log; evidence/tests/cli-local-development-install-test.log; evidence/tests/cli-local-marketplace-test.log; evidence/tests/cli-mcp-lifecycle-test.log |
| SCN-031 | AC-011 / T-010 | done | evidence/tests/cli-lifecycle-test.log; evidence/tests/cli-mcp-lifecycle-test.log; evidence/tests/mcp-server-provenance.test.log |
| SCN-032 | AC-011 / T-010 | done | evidence/tests/core-control-state-test.log; evidence/tests/core-run-lock-test.log; evidence/tests/core-run-step-transaction-test.log; evidence/tests/cli-control-maintenance-test.log |
| SCN-033 | AC-012 / T-008 | done | evidence/HISTORY_RESOLUTION.json; evidence/tests/cli-release-registry-state-test.log; evidence/tests/cli-release-version-coherence-test.log |
| SCN-034 | AC-012 / T-008 | done | evidence/tests/cli-release-bump-test.log; evidence/tests/cli-release-version-coherence-test.log; evidence/tests/cli-release-registry-state-test.log |
| SCN-035 | AC-013 / T-008 | done | evidence/ACTIVE_REFERENCE_AUDIT.json; evidence/REPLAY_REBINDING.json; evidence/tests/cli-skill-evals-test.log; evidence/tests/host-compatibility.log; evidence/tests/community-health.log; evidence/tests/core-interaction-presentation-test.log |
| SCN-036 | AC-013 / T-008 | done | evidence/ACTIVE_REFERENCE_AUDIT.json; evidence/BRIDGE_INVENTORY.json |
| SCN-037 | AC-014 / T-001 | partial | evidence/IMPLEMENTATION_BASELINE.json; evidence/UNRELATED_PRESERVATION.json; evidence/INDEX_PRESERVATION.json |
| SCN-038 | AC-014 / T-010 | done | evidence/checkpoints/ROLLBACK_FIXTURE.json; evidence/tests/rollback-fixture.log; evidence/tests/staged-rehearsal.log |
| SCN-039 | AC-014 / T-011 | partial | evidence/tests/rollback-fixture.log; evidence/FINAL_DIFF_INVENTORY.json; evidence/INDEX_PRESERVATION.json |
| SCN-040 | AC-015 / T-012 | done | evidence/FINAL_SOURCE_BINDING.json; evidence/FINAL_REGRESSION_MATRIX.json |
| SCN-041 | AC-015 / T-013 | done | evidence/FINAL_CRITERIA_MATRIX.json |
| SCN-042 | AC-015 / T-013 | done | evidence/EVIDENCE_PLANES.json |

## Dauerhafte Wissenspflege

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md; docs/architecture/package-structure.md
- memory_target: scope_artifact
- memory_reason: Current migration/test evidence is run-bound; source ownership is curated in existing SoT/Graph owners.
- required_next_step: Reconcile the two open evidence obligations using EVIDENCE_RECONCILIATION.md; QA remains revise.
