# TP: Physische Core-/CLI-/MCP-Paketstruktur

Status: draft
Gate: TP
Gate approval: open
Based on: PRD.md; SD.md
Date: 2026-10-01
Owner: Codex; Planabnahme Arndt Gold
Run: agdf-physical-package-boundaries-20261001-01
Language: de
Traceability contract: criteria-chain-v1

## 1. Task List

13 Aufgaben führen von gebundener Implementierungsvorbereitung über Core-/Providerextraktion und Verbraucher-Cutover bis zu echten Paketnachweisen und Quality-Readiness-Prüfung.

Die genehmigten Produktkriterien bleiben ausschließlich im PRD. Dieser Plan bindet
alle 15 Kriterien und die je Kriterium zugeordneten 12 SD-Entscheidungen an konkrete
Aufgaben, Szenarien und Nachweise. Noch wurde keine Migration umgesetzt.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Nach TP-Freigabe verpflichtende pre_implementation_analysis durchführen; aktuelle Quellen, Freigaben, Workspace/Index, Versions-/Datenpaths und gemeinsame Owner gegen Plan binden; scoped Sicherung und Eingriffsgrenze festhalten | brownfield-analysis; Core-/CLI-/Build-Owner | Neue Approval: TP für diesen Run; positiver gebundener Dispatcher |
| T-002 | Privates packages/core mit internen Exports erstellen; Kontroll-/Evaluations-/Dispatch-/Inspektions-/Maintenance-/Provenance-/reiner Search-Logik nach SD-Inventur verschieben; eine kanonische Implementierung und kontrollierte endliche Delegationsbrücken erhalten | Core-Owner | T-001 pass |
| T-003 | Resource-Context/Contract-Reader und CLI-Git-/Runtimeprovider extrahieren; Metadata-/Reader-Rückkanten, Recovery-Gitaufrufe, Runtime-Probes und Startup-Prozessstart aus Core lösen; Default-Komposition sowie fehlende Provider prüfen | Core-/CLI-Owner | T-002 |
| T-004 | CLI/Befehle/Installer/Setup/Hostkomposition nach packages/cli verschieben; create-agdf-Exports und @agdf/cli-Manifest/Wrapper als kompatible delegierende Fassaden erhalten; #agdf-core-Quellbindung und Development-Locks herstellen | CLI-/Paket-Owner | T-003 |
| T-005 | MCP-Quellen/Tests nach packages/mcp-server verschieben; Worker/SDK/stdio getrennt halten und bestehenden create-agdf/mcp-dispatch-runtime-Export über gemeinsame Core-Services komponieren | MCP-/CLI-/Core-Owner | T-004 |
| T-006 | Übergreifende Generatoren, Profil-/Assembly-/Releasehelpers und gemeinsame Checks nach Root scripts verschieben; drei dist/npm-Outputs, Alias-/Ressourcenprojektion, Versionen und Paketdelegatoren herstellen | Build-/Release-Owner | T-004, T-005 |
| T-007 | Offline-Validatorclosure und profilgebundene Plugin-/Hook-/MCP-Outputs aus neuen Quellen erzeugen; Ressourcen, Copilot-Inventur/Budget und Source-/Bundle-/Installprovenance prüfen | Build-/Core-/CLI-/Profil-Owner | T-006 |
| T-008 | Evaluationswerkzeuge nach evals ziehen; alle aktiven Tests, Workflows, Docs, SoT und bestehende Context-Graph-Nodes zu neuen Ownern kuratieren; historische Tag-/Paketpfade explizit auflösen | Eval-/Release-/Dokumentowner | T-006, T-007 |
| T-009 | Drei normale npm-Archive erzeugen und Inhalte, Abhängigkeiten, öffentliche Exports/bins sowie Consumer außerhalb Checkout und Workspace-Verknüpfungen prüfen | Paket-/CLI-/MCP-Owner | T-006, T-007, T-008 |
| T-010 | Bestehende Install-/Update-/Repair-/Disable-/Recovery-/Consent-/Trust-/Ownershipfälle in isolierten Zielen ausführen; kompatible Datenpaths und Rückweg in Fehlerfixtures belegen | CLI-/Lifecycle-/Core-Owner | T-009 |
| T-011 | Endliche Delegationsbrücken und alte aktive Quellroots entfernen; sauberen Fixture-Checkout aus vollständigem aktuellem Quellstand prüfen; endgültige Graph-/Owner-/Build-/Archiv-/Regressionsevidenz sammeln | Core-/CLI-/MCP-/Build-Owner | T-008, T-009, T-010 |
| T-012 | CD+Tests gegen jeden Task und jedes Szenario dokumentieren; task-plan-review und clean-implementation-review sammeln; verpflichtende code-review des tatsächlichen Diffs und Defektkorrekturen mit betroffenen Checks durchführen | Implementierungsowner; Review-Skills | T-011; alle erforderlichen Szenarien belegt |
| T-013 | qa-gate mit aktuellen Qualitätsdimensionen und Zielbaum-/Profil-/Kriterienbericht durchführen; neue QA-/UAT-Entscheidungen respektieren und OR/Closeout erst im erlaubten Zustand erstellen | qa-gate; release-or; delivery-closeout | T-012; für nachfolgende Gates jeweils neue gebundene Freigabe |

T-002 bis T-011 schließen bei Änderungen ihrer Inputs betroffene frühere Nachweise
erneut. Die aufgeführten Owner sind Zuständigkeiten, keine Freigabe zur autonomen
Delegation an zusätzliche Agenten. Source-/Controlmutationen erfolgen sequenziell;
unabhängige Leseprüfungen können gebündelt werden.

### Konsistente Stufen und Rückweg

| Stufe | Zugeordnete Aufgaben | Konsistenter Stand und Stop-Kriterium | Rückweg |
|---|---|---|---|
| C-00 | T-001 | Genehmigte PRD/SD/TP-Hashes, heutiger Quellstand, vollständige Diff-/Indexbindung und owned-path-Sicherung; keine Umsetzung vor positivem Brownfield | Keine Quellmutation; widersprüchliche Owner/Scope zuerst klären |
| C-01 | T-002, T-003 | Core ist kanonischer Implementierungsowner; ältere Consumer nutzen nur explizit inventarisierte Delegationsbrücken; Resource-/Provider- und Kontrollchecks müssen bestehen | Nur eigene Änderungen seit C-00 auf die gesicherten aktuellen Bytes zurückführen; Quellen und daraus erzeugte Outputs gemeinsam konsistent herstellen |
| C-02 | T-004 bis T-008 | Alle drei neuen Source-Owner und Root-Orchestrierung funktionieren; aktuelle Assembly/Profile haben dieselbe Quell-/Versionsbindung | Nur bei unveränderten eigenen Post-Hashes nach C-01 zurückführen; fremde überlappende Änderungen stoppen Rückführung |
| C-03 | T-009, T-010 | Echte Archive, Offline-/MCP-/CLI-Verbraucher und isolierte Lifecycle-/Fehlerfälle belegt; Altroot-Brücken noch als temporär inventarisiert | C-02-Quellen und konsistent regenerierte Outputs wiederherstellen; keine echten Nutzerdaten/Installationen zurücksetzen |
| C-04 | T-011 bis T-013 | Keine aktiven Altquellen/Brücken; finaler Source-/Assembly-/Archivstand und Pflichtchecks vollständig; Freigaben separat | Bei finalem Cutoverfehler gezielt C-03 herstellen; kein abgeschlossener Zielbaum behauptet, bis der Defekt behoben und der Cutover neu belegt ist |

Vor jeder Stufe hält `evidence/checkpoints/C-xx.json` owned paths, Input-/Outputhashes,
Runrevision und vorherige Sicherungsorte fest. Temporäre Sicherungen liegen in
einem runbezogenen Arbeitsverzeichnis außerhalb aktiver Quellen; Evidenz referenziert
sie mit Manifest/Digest. Wiederherstellung vergleicht vorher eigene Post-Hashes
und schreibt nur die eigenen aufgezeichneten Änderungen zurück. Kein pauschales
`git reset`, Indexreset, Bereinigen fremder Dateien oder Überschreiben geänderter
gemeinsamer Quellen. Sicherungen enthalten den tatsächlichen Anfangsstand samt
bereits vorhandener MCP-Reparatur, nicht bloß HEAD.

Brücken erzeugen weder eine zweite Implementierung noch einen zweiten Policyowner.
Ihr Inventar benennt Consumer, Zielowner und spätestes Entfernen in T-011. Eine
noch erforderliche Brücke oder ein weiter aktiver Altroot verhindert C-04.

## 2. Verification Traceability

42 Szenarien decken alle Kriterien und die zugehörigen SD-Entscheidungen ab; die Nachweise unterscheiden Quellgrenze, Build, Archiv, isolierte Verbraucher und echte Hosts.

Alle Evidenzpfade dieser Tabelle sind relativ zum Artefaktverzeichnis dieses Runs.
Logs erhalten Befehl, Zeitpunkt, Plattform, Node-/Paketversion, Inputbindung und
Exitcode. Ein geplanter Evidenzpfad ist kein bereits bestandener Test.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Gehashte Modulkarte weist verschobene Kontrollimplementierungen genau einem Core-Sourceowner zu; temporäre Delegationsbrücken sind vollständig erklärt | evidence/stages/C-01_MODULES.json; evidence/stages/C-01_OWNER_CHECK.log |
| AC-001 | SDD-001 | T-011 | SCN-002 | Tatsächlicher Endbaum besitzt core/cli/mcp-server; alte aktive Quellroots und sämtliche C-01/C-03-Brücken fehlen | evidence/FINAL_TREE.txt; evidence/FINAL_OWNER_MAP.json; evidence/ACTIVE_PATH_AUDIT.json |
| AC-002 | SDD-001 | T-002 | SCN-003 | Gate-, Approval-, Revision-, Seal-, Lock-/Transaktions- und Recoveryfälle verwenden denselben kanonischen Core-Writer; ungebundene/alte Replies werden abgelehnt | evidence/tests/G-CORE.log; evidence/CONTROL_OWNER_CHECK.json |
| AC-002 | SDD-005 | T-005 | SCN-004 | CLI und MCP ergeben für identische zulässige Target-/Run-/Observerfixtures identische Kontrollreports; Adapterentscheidung bleibt authorizes:false | evidence/tests/G-PARITY.log; evidence/ADAPTER_PARITY.json |
| AC-003 | SDD-002 | T-003 | SCN-005 | Isolierter privater Core lädt seine abgeleiteten Ressourcen außerhalb Checkout ohne CLI/MCP/Installer und liefert korrekte Contract-/Locale-/Gateergebnisse | evidence/tests/core-isolated-resources.log; evidence/CORE_ISOLATION.json |
| AC-003 | SDD-002 | T-003 | SCN-006 | Fehlender Contract, unzulässiges Modul, ungültige Locale-/Versionsressource oder MCP-Clientpfad führt zur vorhandenen Recovery; kein Checkout-/Env-Fallback | evidence/tests/core-resource-negative.log |
| AC-003 | SDD-003 | T-003 | SCN-007 | Graph und Modulprüfung zeigen keine direkte/transitive Core→CLI/MCP/SDK/Build/Eval-Kante, Paketzyklen oder Prozessstarter; dynamische Auflösung ist erklärt | evidence/FINAL_DEPENDENCIES.json; evidence/tests/core-boundaries.log |
| AC-003 | SDD-003 | T-003 | SCN-008 | Fehlende/manipulierte Git-/Runtimeproviderdaten verleihen keine positive Eligibility/Approval; Recoverykandidaten bleiben im Core pfad-/snapshotgebunden | evidence/tests/provider-boundaries.log; evidence/tests/G-RECOVERY.log |
| AC-004 | SDD-003 | T-004 | SCN-009 | CLI-Gitbeobachtung, Systemlocale, Runtime-Probe und isolierte Setup-/Hostprovider sind korrekt komponiert; Core enthält deren Prozessimplementierungen nicht | evidence/PROVIDER_MAP.json; evidence/tests/G-CLI-PROVIDERS.log |
| AC-004 | SDD-005 | T-004 | SCN-010 | Alle unterstützten CLI-Befehle, Flags, Exit-/Fehler-/JSON-/EN-/DE-Interaktionsverträge bestehen aus neuer Source-Komposition | evidence/tests/G-CLI.log; evidence/CLI_CONTRACT_DIFF.json |
| AC-004 | SDD-005 | T-009 | SCN-011 | create-agdf- und agdf-bins führen Versions-, Hilfe-, Kontroll- und Setupfixtures aus echten Archiven außerhalb Checkout mit erwarteten Ausgaben aus | evidence/consumers/CLI_ARCHIVE.json; evidence/consumers/cli.log |
| AC-005 | SDD-001 | T-005 | SCN-012 | MCP-Worker/stdio/SDK liegen nur im MCP-Paket; Dispatcher/Inspektion delegieren an Core ohne Rückimport der CLI auf den Adapter | evidence/MCP_OWNER_MAP.json; evidence/tests/G-MCP.log |
| AC-005 | SDD-005 | T-005 | SCN-013 | initialize/tools-list und reale Toolcalls erhalten Namen/Schemas; falsche Version/Provenance, unsicherer Target und unzulässiger Input werden fail-closed beantwortet | evidence/mcp/PROTOCOL.json; evidence/tests/mcp-contract-protocol-safety-provenance.log |
| AC-005 | SDD-005 | T-009 | SCN-014 | Installierter archivbasierter MCP-Consumer führt dispatch/inspect mit matched provenance aus; Busy-/Cancel-/Timeout-/Workerfehler behalten ihr vorhandenes Verhalten | evidence/consumers/MCP_ARCHIVE.json; evidence/tests/mcp-worker-failures.log |
| AC-006 | SDD-004 | T-006 | SCN-015 | Core-Source ist private:true; Archiveassembly enthält dieselben Core-Bytes und korrekte interne Aliasauflösung, keine vierte öffentliche Runtimeabhängigkeit | evidence/ASSEMBLY_MAP.json; evidence/tests/assembly-aliases.log |
| AC-006 | SDD-004 | T-009 | SCN-016 | Drei echte Archive tragen die bestehenden npm-Namen, Node >=22, exakte gemeinsame Versionen und Dependencies; kein file:/Workspace-/Core-Registrybezug | evidence/PACKED_OUTPUTS.json; evidence/PACKED_MANIFESTS.json |
| AC-006 | SDD-005 | T-009 | SCN-017 | Alle bisherigen öffentlichen Exports einschließlich synchronem control-command und mcp-dispatch-runtime sind im externen Consumer importierbar; Import beobachtet kein Ziel/Git | evidence/consumers/PUBLIC_EXPORTS.json; evidence/tests/public-import-boundaries.log |
| AC-007 | SDD-002 | T-007 | SCN-018 | Jeder Offline-Consumer besitzt alle benötigten Locale-/Definition-/Contractressourcen aus gebundener Quelle; fehlende oder doppelte Ressource wird erkannt | evidence/profiles/RESOURCE_CLOSURE.json; evidence/tests/offline-resource-negative.log |
| AC-007 | SDD-006 | T-007 | SCN-019 | Erzeugte lokale Validatoren führen ihre unterstützten Commands außerhalb Checkout mit blockiertem Netz und ohne npm aus | evidence/consumers/OFFLINE_VALIDATORS.json; evidence/consumers/offline.log |
| AC-007 | SDD-006 | T-007 | SCN-020 | Copilot-Inventur/Digests und Byte-/Dateibudget stimmen mit tatsächlichen Outputs überein; Installer, SDK und unzulässige doppelte Daten fehlen | evidence/profiles/COPILOT_INVENTORY.json; evidence/profiles/PAYLOAD_DELTA.json; evidence/tests/G-PROFILES.log |
| AC-007 | SDD-006 | T-007 | SCN-021 | Hinzugefügte Installer-/SDK-Datei, falscher Runtimehash oder Überschreitung des unveränderten Guards wird negativ erkannt | evidence/tests/runtime-integrity-negative.log; evidence/tests/copilot-exclusion-negative.log |
| AC-008 | SDD-008 | T-006 | SCN-022 | Vollständige Source→Outputkarte führt Definition, Skills, Contracts, Templates und Assets auf plugins/agdf zurück; Wiederholungsbuild ist semantisch identisch | evidence/ASSEMBLY_MAP.json; evidence/REPEAT_BUILD_DIFF.json |
| AC-008 | SDD-009 | T-007 | SCN-023 | Profil-/Bundle-/Installidentität unterscheidet Source- und Runtimehashes korrekt und bleibt zur gemeinsamen Version gebunden | evidence/profiles/PROVENANCE.json; evidence/tests/G-PROVENANCE.log |
| AC-008 | SDD-009 | T-007 | SCN-024 | Veränderter Contract/Skill, geänderter MCP-command/type/env, falsche Root-/Fallbackversion und Marker-/Bundleabweichung werden abgelehnt; historische eigene Normalisierung bleibt kompatibel | evidence/tests/provenance-tamper.log; evidence/tests/codex-plugin-mcp.log |
| AC-009 | SDD-007 | T-007 | SCN-025 | Aktuelle Codex-Runtime enthält Root mcp.json mit stdio und installergebundenen Pfaden; alter aktueller mcp/codex.mcp.json fehlt | evidence/profiles/PROFILE_MATRIX.json; evidence/tests/codex-discovery-profile.log |
| AC-009 | SDD-007 | T-007 | SCN-026 | Source/public bleiben ohne aktive MCP/Hooks; Claude verwendet seinen deklarierten Pfad; Copilot/OpenCode entsprechen genau der genehmigten SD-Profilmatrix | evidence/profiles/PROFILE_MATRIX.json; evidence/tests/portable-claude-copilot-opencode.log |
| AC-009 | SDD-007 | T-007 | SCN-027 | Fehlende deklarierte MCP-/Hookdatei, hinzugefügter MCP-Server oder unzulässige public-Runtime wird erkannt; keine dritte Softwaregrenze entfällt als Ausnahme | evidence/tests/profile-negative.log; evidence/FINAL_TREE.txt |
| AC-010 | SDD-008 | T-006 | SCN-028 | Root/Paketbefehle und CI delegieren an genau einen Build-/Releaseowner mit expliziten Roots; Manifestdelegatoren führen keine zweite Logik | evidence/BUILD_ENTRYPOINTS.json; evidence/tests/G-BUILD.log |
| AC-010 | SDD-008 | T-011 | SCN-029 | Frisches Quellfixture ohne generated/dist/node_modules erzeugt in dokumentierter Reihenfolge Profile und Archive; negative Voraussetzungen werden erklärt abgelehnt | evidence/CLEAN_CHECKOUT.json; evidence/tests/clean-checkout.log |
| AC-011 | SDD-009 | T-010 | SCN-030 | Isolierter Install/Update/Repair/Disable-/Cachelauf erhält bisherige Datenroots, Ownership, genaue Versionen und idempotente Rückmeldungen | evidence/lifecycle/LIFECYCLE.json; evidence/tests/G-LIFECYCLE.log |
| AC-011 | SDD-009 | T-010 | SCN-031 | Consent/Trust bleiben eigenständige Fakten; fehlende Zustimmung/Ownership oder fremde Marker werden nicht durch Sourceumzug aufgehoben | evidence/tests/consent-ownership-negative.log |
| AC-011 | SDD-009 | T-010 | SCN-032 | Bestehende Run-/Approval-/Sealformate und Recoverylocks bleiben kompatibel; keine automatische Zustands-/Benutzerdateimigration | evidence/lifecycle/STATE_COMPATIBILITY.json; evidence/tests/G-RECOVERY.log |
| AC-012 | SDD-010 | T-008 | SCN-033 | Aktuelle Version-/Releasechecks lesen neue Manifeste, historische Tags ihre damaligen eindeutigen Pfade; frühere Artefakte bleiben unverändert | evidence/HISTORY_RESOLUTION.json; evidence/tests/G-HISTORY.log |
| AC-012 | SDD-010 | T-008 | SCN-034 | Fehlender oder mehrfacher historischer Owner und widersprüchliche gemeinsame Version blockieren; kein aktueller Altroot-Fallback kaschiert den Fehler | evidence/tests/history-version-negative.log |
| AC-013 | SDD-008 | T-008 | SCN-035 | Aktive Docs/SoT/Graph/CI/Tests/Evals verweisen auf neue Code-/Buildowner; Pflicht-Evaluationsfälle und Locale-Karten bleiben gültig | evidence/ACTIVE_REFERENCE_AUDIT.json; evidence/tests/G-EVALS-DOCS.log |
| AC-013 | SDD-010 | T-008 | SCN-036 | Jeder verbleibende Altpfad ist als immutable Geschichte, öffentlicher API-/Installartefaktpfad oder endlich befristete Brücke begründet; C-04 besitzt keine aktiven Ausnahmen | evidence/ACTIVE_REFERENCE_AUDIT.json; evidence/BRIDGE_INVENTORY.json |
| AC-014 | SDD-011 | T-001 | SCN-037 | Fresh pre_implementation_analysis bindet tatsächliche Quellen, Run und Genehmigungen; Fremd-/Indexänderungen samt MCP-Reparatur sind als Anfangsstand erhalten | BROWNFIELD_ANALYSIS.md; evidence/IMPLEMENTATION_BASELINE.json; evidence/UNRELATED_PRESERVATION.json |
| AC-014 | SDD-011 | T-010 | SCN-038 | Fehlerfixture beim Ressourcen-/Assembly-/Cutoverübergang kann auf seinen letzten konsistenten C-xx-Stand zurückgeführt werden; Quellen/Outputs stimmen gemeinsam | evidence/checkpoints/ROLLBACK_FIXTURE.json; evidence/tests/rollback-fixture.log |
| AC-014 | SDD-011 | T-011 | SCN-039 | Fremder überlappender Post-Hash oder geänderter Index verhindert pauschale Rückführung; finale Diffinventur enthält nur erklärte Taskänderungen | evidence/tests/checkpoint-conflict.log; evidence/FINAL_DIFF_INVENTORY.json |
| AC-015 | SDD-012 | T-012 | SCN-040 | CD+Tests sowie Plan-/Clean-/Code-Review führen jede Aufgabe und alle 42 Szenarien auf die aktuelle Inputbindung mit tatsächlichen Ergebnissen zurück | CD_TESTS.md; TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; evidence/TEST_EXECUTIONS.json |
| AC-015 | SDD-012 | T-013 | SCN-041 | qa-gate berichtet Zielbaum, Kriterien und Profilmatrix vollständig; pass nur bei ausreichenden aktuellen Nachweisen, sonst revise/block mit konkretem Routing | QA_REPORT.md; evidence/FINAL_CRITERIA_MATRIX.json |
| AC-015 | SDD-012 | T-013 | SCN-042 | Abschluss trennt Quellen/Build/Archive/isolierte Installation/echten Host/frische Session; unbeauftragte Hosts und Windows bleiben unverified und es wird keine reale Installation/Veröffentlichung behauptet | QA_REPORT.md; OR.md nach zulässigem Closeout; evidence/EVIDENCE_PLANES.json |

## 3. Test Plan

Bestehende Regressionen werden mit ihren Code-Ownern migriert und durch gezielte Paketgrenzen-, Ressourcen-, Archiv- und Rückwegprüfungen ergänzt; Ergebnisse müssen aus dem endgültigen Quellenstand stammen.

`evidence/TP_TEST_INVENTORY.json` hält die tatsächlichen bisherigen npm-Skripte
mit Manifesthashes fest. Die folgende Matrix ist eine Zuordnung dieser vorhandenen
Tests und der erforderlichen neuen Nachweise, keine Behauptung ihrer Ausführung.
Neue Root-Runner `scripts/check-package-boundaries.mjs`,
`scripts/test-package-consumers.mjs`, `scripts/test-clean-checkout.mjs` und
`scripts/test-migration-checkpoints.mjs` haben klar begrenzte Prüfaufgaben und
verwenden dieselben Produkt-/Buildowner; sie erteilen keine Freigabe.

| Gruppe | Vorhandene Prüfungen und neue gezielte Fälle | Zielentry und Evidenz |
|---|---|---|
| G-CORE / G-RECOVERY | control-state, run-revision, run-lock, run-step-transaction, run-recovery, control-command, control-command-process, cli-gates, prd-readiness, intake-continuation, parent-reconciliation, verified-change, canonical-init, gate-check-missing-control, control-maintenance | Codefälle unter packages/core/test; delegierende Testentries dort; G-CORE.log, G-RECOVERY.log |
| G-RESOURCE / G-BOUNDARIES | Bestehende Contract-/Locale-/Runtimekontexte plus isolierte Core-Ressourcen, fehlende/manipulierte Daten und AST-/Manifest-/Export-/Literal-/nichtliteral-Dynamikprüfung | Coretests und Root check-package-boundaries; core-isolated-resources.log, core-resource-negative.log, core-boundaries.log |
| G-CLI / G-CLI-PROVIDERS | cli-modularization, task-target-resolution, host-command, install-setup-contract/interaction/service, install-control-migration/repair, interaction-presentation, operational-localization, control-command-package; explizite Git-/Probe-/Observer-Negativfälle | packages/cli-Testdelegatoren, Corefälle nur einmal unter ihrem Owner; G-CLI.log, G-CLI-PROVIDERS.log |
| G-PARITY / G-MCP | skill-dispatch mit Binding/Runzuordnung, control-inspect, plugin-mcp-runtime; MCP contract/continuation/protocol/safety/provenance/performance/package; gemeinsame Adapterfixtures und Workerfehler | packages/core/test, packages/cli/test, packages/mcp-server/test; G-PARITY.log, G-MCP.log, mcp/PROTOCOL.json |
| G-PROFILES / G-PROVENANCE | public-plugin, portable-plugin, copilot-profile, local-validator, runtime-integrity-layout/negative, codex-plugin-mcp, claude-plugin-mcp, agent-skills-conformance, instruction-footprint; Offlineverbraucher, Resourceclosure und Ausschlussfälle | Root Profilchecks plus paketlokale Runtimefälle; PROFILE_MATRIX.json, PAYLOAD_DELTA.json, G-PROFILES.log, G-PROVENANCE.log |
| G-BUILD / G-HISTORY | package-build, package-contents, release-workflows, release-bump, release-version-coherence, distribution-profile-history, release-registry-state, release-bootstrap; Source-/Assemblykarten, Alias- und Versionsnegativfälle | Root scripts-Owner; G-BUILD.log, G-HISTORY.log, ASSEMBLY_MAP.json, HISTORY_RESOLUTION.json |
| G-ARCHIVES | Normales npm pack aller drei fertigen dist/npm-Outputs; vorhandene @agdf/cli- und MCP-Paketfälle; vollständige öffentliche Exports/bins und echte externe CLI-/MCP-Verbraucher | Root test-package-consumers; PACKED_OUTPUTS.json, PACKED_MANIFESTS.json, consumers/*.json/log |
| G-LIFECYCLE | lifecycle, local-marketplace, local-development-install, local-preparation, claude-cache-recovery, runtime-check-consent/Codex-consent, copilot-installer/repository-retention, mcp-lifecycle, opencode-hardening | packages/cli-Testdelegatoren; nur temporäre Daten-/Installationsroots; G-LIFECYCLE.log |
| G-EVALS-DOCS | skill-evals und eval:skills, request-activation samt Callbacks/Hostschema/Guard, proportionality-Fälle, delivery-path-search/unit/generator, routing, community-health, maintenance-contracts und host-compatibility | Rootdelegation in evals bzw. paketlokale Searchfälle; bestehende Liveobservations nicht neu als aktuelle Evidenz ausgeben; G-EVALS-DOCS.log |
| G-CLEAN / G-ROLLBACK | Endgültiger frischer Fixture-Checkout, Orchestrierungsvoraussetzungen, sauberer Endbaum, Übergangs-/Restoration-/Conflictfixtures | Root test-clean-checkout und test-migration-checkpoints; CLEAN_CHECKOUT.json, ROLLBACK_FIXTURE.json |

### Ausführungsfolge und Evidenzbindung

1. Nach T-001 werden nur die für C-01/C-02 betroffenen Gruppen ausgeführt, um
   Fehler in Core-/Resource-/Provider-/Adaptergrenzen früh zu lokalisieren.
2. T-006/007 erzeugen die vollständige Assembly in neuer Rootreihenfolge und
   erfassen Profil-/Payload-/Provenanceprüfungen. Ein Wiederholungsbuild vergleicht
   semantische Dateien/Digests und erklärt ausschließlich variable Metadaten.
3. T-009 nutzt echte normale npm-Archive, einschließlich ihrer produktiven
   Assembly-/Prepackvoraussetzungen. Archiv-/Installfixtures laufen außerhalb der
   Quellen und ohne Source-Symlinks. Build-only Hooks dürfen im veröffentlichten
   Consumer keinen Repositorycheckout voraussetzen. Staging/Pack-Logs und
   ausgepackte Dateiinventuren werden aufbewahrt; Fixtures ersetzen diese Archive
   nicht. CLI/MCP-Dependencies werden aus exakt gebundenen Archiven und dem
   vorhandenen SDK-Lock hergestellt, nicht durch eine zufällige Registryversion.
4. Offlinefixtures besitzen Node und nur die erzeugten Profil-Dateien. npm- und
   Netzwerkzugriff werden im Harness blockiert und beobachtet; ein erfolgreicher
   CLI-Aufruf ohne diese Sperre belegt den Offlinefall nicht.
5. T-010 läuft mit child-only `AGDF_DATA_DIR`, temporären HOME-/Config-/Cache-
   Testumgebungen und gebundenen Fixturetargets. Reale Nutzerroots werden nicht
   verändert; Umgebungsüberschreibungen bleiben im Testprozess. Rückweg- und
   Konfliktfälle sind temporäre Fixtures, keine absichtliche Beschädigung des
   echten Runs.
6. Nach T-011 bildet ein frisches Fixture den vollständigen finalen Quellstand
   einschließlich autorisierter, noch nicht committeter Dateien ab. Dazu dürfen
   Historie und Source-Dateien in eine isolierte Kopie übernommen werden; nur
   `git archive HEAD` wäre unzureichend. generated/dist/node_modules fehlen zu
   Beginn. Die reale Arbeitskopie und ihr Index werden nicht bereinigt.
7. Der finale Testindex bindet jede Gruppe an Quellen-/Versions-/Assemblyhashes.
   Noch gültige Nachweise werden verwendet, geänderte Closures erneut geprüft;
   fehlende Pflichtgruppen werden vor T-012 geschlossen. Eine abschließende
   vollständige relevante Regressionsmatrix ist nötig, weil der Cutover gemeinsame
   Ressourcen und Imports verändert. Nach ihrem Bestehen erfolgt keine pauschale
   Wiederholung ohne neue Änderung oder offenes Risiko.

Alle Szenarien erhalten eigene Ergebniseinträge in `TEST_EXECUTIONS.json`, auch
wenn ein sinnvoller Testlauf mehrere Szenarien belegt. Fehler-Exitcodes und
unverifizierte Umgebungsteile bleiben sichtbar; kein skip oder geschwächter
Assertion wird als Erfolg gewertet. Performancefälle prüfen ihre vorhandenen
Verträge, keine neu erfundene Zeit- oder Kostenakzeptanz.

## 4. Brownfield Scope

Vor Umsetzung werden die gemeinsamen Control-, Resource-, Provenance-, CLI-/MCP- und Buildowner samt vorhandenen Fremdänderungen erneut gebunden.

Der Dispatcher hat TP-Erstellung für Revision 11 /
`cb276846-da12-4aa0-9b22-b1742783bc2f` erlaubt. SD wurde mit der vorgelegten
Präsentation `de242a67-852e-4f31-a5d1-3d94c0f0dacd` genehmigt. Die Quellbindung
`evidence/TP_SOURCE_BINDING.json` bestätigt unveränderte genehmigte PRD-/SD-Hashes
und keine Drift der 203 in SD inventarisierten Softwaremodule. Dies ist
Planungsevidenz, kein Ersatz für T-001 nach TP-Freigabe.

T-001 prüft insbesondere:

- bestehende Kontrollwriter, Seals, Locks, Approval-/Run-/Targetbindung und
  Recovery-Journale; kein neuer Zustandswriter oder zweite Regelquelle;
- die Reader-/Metadaten- und Prozesskopplungen laut SD-Inventur, Default-Locale,
  Gitbeobachtung und eingeschränkte MCP-Git-/Readgrenze;
- die drei öffentlichen Manifest-/Export-/Dependency-/Nodeverträge, Offline-
  Validatorclosure, Copilot-Budget und Provenance-/Installationsmarker;
- aktuelle Generator-/Release-/History-/CI-/Eval-/SoT-Verbraucher und sichere
  Output-/Pruning-/Renamepfade einschließlich bestehender Windowsbehandlung;
- den vorherigen Pluginstruktur-Run und die bereits vorhandene MCP-Discovery-
  Reparatur als Ausgangsstand; deren Freigaben und QA-Evidenz werden nicht
  übernommen, Dateien dieses Runs werden nicht als Migrationsergebnis umgeschrieben;
- die fünf bereits im Index befindlichen, im Workspace entfernten Duplikate sowie
  sonstige nicht diesem Task gehörende Änderungen; kein automatisches Staging,
  Commit, Reset oder Säubern. Überschneidende Sourceowner werden aus ihrem
  tatsächlichen heutigen Stand weiterentwickelt.

Materiale Abweichung von PRD/SD, unbekannte Dependency-/Resourceclosure oder
Widerspruch zu fremder laufender Änderung stoppt die betroffene Umsetzung und
führt in das zuständige bestehende Gate/Review zurück. Sie wird nicht als
unverifizierte Restschuld akzeptiert.

## 5. Out Of Scope

Kein neues Produktverhalten, kein viertes öffentliches Paket, keine UI und keine automatische reale Installation, Veröffentlichung oder Gitaktion.

Keine neue Freigabe-/Trust-/Consentpolicy, Kontrollzustandsmigration oder
historische Artefaktumschreibung. Die genehmigte SD-Profilmatrix ist maßgeblich;
zusätzliche Abweichungen werden nicht durch TP-Detailentscheid eingeführt.
Keine Website-/Teamreorganisation und kein pauschales Aufräumen anderer Runs.

Bestehende reale Codex-/Claude-/Copilot-/OpenCode- und Windows-Lücken sind keine
implizite Abnahmebedingung dieser Quell-/Paketmigration. Echte Hostinstallationen,
Registry-Publikation, Live-Modelltests oder Releaseaktionen brauchen den konkreten
späteren Auftrag; isolierte deterministische Paket-/Protokoll-/Lifecyclefixtures
sind enthalten. Unbeauftragte native Prüfung wird als unverified ausgewiesen.

## 6. Risks And Blockers

Core-Rückkanten, fehlende Ressourcen, beschädigte Paketverträge, aktive Altquellen oder unvollständige Pflichtnachweise verhindern Quality Readiness.

| Befund | Wirkung und Routing |
|---|---|
| Core benötigt CLI/MCP/SDK/Build/Evals oder ruft selbst Git/Runtimeprozesse auf | implementation_gap; zurück zu T-002/003, keine Ausnahme oder bloße Fassade |
| Unklare kanonische Policy-/Resource-/Buildquelle oder dauerhafte Brücke | solution_integrity_gap; Core-/Buildowner in T-002/006/011 klären, QA nicht pass |
| Publiziertes Paket verlangt privaten Core/Checkout oder verliert Export/bin/Node-/Versionsvertrag | implementation_gap; T-004/005/006/009 korrigieren und betroffene externe Consumer erneut prüfen |
| Offline-/Profil-/Provenance-/Consent-/Datenpfadänderung ohne genehmigten Vertrag | implementation_gap; T-007/010; materiale Produktänderung in PRD zurückführen |
| Copilot-Budget passt nur nach unbegründeter Lockerung oder Installer-/SDK-Übernahme | solution_integrity_gap; Closure in T-007 korrigieren; kein bloßer Ceilinganstieg |
| Fehlender echter Archiv-/Clean-Checkout-/Rückwegbeleg oder veralteter Testinput | evidence_gap; zuständige Tasknachweise aktualisieren, Fixture-only Erfolg genügt nicht |
| Fremde Source-/Indexänderung, verlorene Sicherung oder Post-Hash-Konflikt | Stop an C-xx; T-001 und Ownerbindung erneut prüfen; keine automatische Rückführung |
| Context-Graph-Warnung aufgrund noch geplanter aktiver Pfadupdates | Bis Cutover erklärte Planwarnung; T-008/011 muss aktuelle SoT/Graph-Referenzen versöhnen |
| Nicht beauftragte native Host-/Windows-/Modellsession | Ausgewiesene Evidenzgrenze, keine Verifikation behaupten; kein neuer Produktentscheid durch diesen Plan |

### Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-NATIVE-INTERACTION-AUTHORITY, CG-TASK-TARGET-AUTHORITY; SOT_REGISTRY.md
- context_graph_reconciliation: planned
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: T-008/011; SCN-035/036; tatsächliche neue Owner und bestehende Discovery-/Zustandsautorität kuratiert versöhnen.
- memory_target: scope_artifact
- memory_reason: task-/szenariogebundene Planung und Sourcebindung verbleiben in diesem Run; wiederverwendbare tatsächliche Owner werden erst beim Cutover in bestehender SoT/Graphstruktur dokumentiert.
- memory_refs: dieses TP; evidence/TP_SOURCE_BINDING.json; evidence/TP_TEST_INVENTORY.json

## 7. Next Step

TP kanonisch verknüpfen, Revision aufzeichnen und anhand der frischen
Dispatcher-/Präsentationsbindung vorlegen. Eine neue `Approval: TP` erlaubt
T-001, danach bei positiver Implementierungsvorbereitung die geplante Umsetzung.
CD+Tests und Code Review ersetzen weder qa-gate noch die späteren QA-/UAT-
Entscheidungen. OR/Closeout folgen nur im dann erlaubten Zustand.
