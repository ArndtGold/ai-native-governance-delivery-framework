# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cross-surface-executable-skill-dispatcher
- lifecycle: active
- revision: 29
- revision_id: F83C9B73-9ACE-46E5-8EB6-205E71DD1BA9
- started_at: 2026-09-04
- mode: `structured_delivery`
- current_gate: QA
- decision: revise
- owner: Arndt Gold

## Objective

Einen versionsgleichen ausführbaren AGDF-Skill-Dispatcher bereitstellen, der auf Copilot, Codex,
Claude Code und OpenCode die gemeinsame Preflight-Logik deterministisch ausführt und dem Modell nur
einen terminalen Ausgang oder eine begrenzte nächste Aktion übergibt.

## Host-native Plugin-root Follow-up, 2026-09-08

- target: das bestätigte AGDF-Repository und derselbe aktive Dispatcher-Run.
- observed_gaps: Die installierte Codex-Laufzeit bevorzugte eine vorhandene Claude-Kompatibilitäts-
  variable vor der nativen Codex-Root. Der Windows-Hook addierte beide Root-Zeichenketten.
- corrected: Hostadapter erzeugen eine surface-spezifische Priorität. Der gemeinsame Runtime-
  Resolver verwendet dieselbe Regel, und Runtime Integrity prüft beide Codex-Hook-Befehle gegen den
  kanonischen Command Owner.
- evidence: CD+Tests, TP/Clean/Code Review und HOST_EVIDENCE Revision 15, QA Revision 17 und OR 7.
  Der vollständige Smoke-Test besteht. Die aktualisierte Installation
  `0.14.5+codex.local-880e88555405` besteht Runtime Integrity und den zuvor fehlschlagenden Replay mit
  absichtlich veralteter Claude-Root.
- boundary: Die PowerShell-Zeile ist statisch und im installierten Payload geprüft, aber nicht auf
  einem nativen Windows-Host ausgeführt. Der aktuelle Task kann die neue Skillfassung nicht laden.
- authority: Die Codex-Aktualisierung war separat autorisiert. QA bleibt revise; kein UAT-, Commit-,
  Push-, PR- oder Release-Recht entsteht daraus.

## Canonical QA Candidate And Terminal-response Follow-up, 2026-09-08

- target: das bestätigte AGDF-Repository und derselbe aktive Dispatcher-Run.
- observed_gap: Der alte geladene Codex-Task rekonstruierte nach der Zielbestätigung nur 11 von 13
  aktiven QA-Runs und ergänzte einen terminalen Ausgang um eigene Frage und Erklärung.
- root_cause: Der Dispatcher entfernte `candidate_runs` aus dem Judgement-Snapshot. Zusätzlich
  beschrieb der Funktionsvertrag die terminale Übertragung nicht als vollständige alleinige
  Assistant-Antwort.
- corrected: `qa-gate` erhält die vollständige unveränderliche Kandidatenprojektion des Evaluators.
  Der kanonische Funktionsvertrag und alle zehn Skillprojektionen verbieten Zweitscan, Auslassung,
  Begleittext, Übersetzung, Umformatierung und spätere Toolaufrufe.
- evidence: CD+Tests, TP/Clean/Code Review und HOST_EVIDENCE Revision 14, QA Revision 16 und OR 6.
  Source und installierte Laufzeit liefern 23 Kandidaten, exakt 13 QA-Runs und beide zuvor
  ausgelassenen IDs. Der installierte terminale Replay liefert exakt die deutsche Karte.
- installed_state: `agdf@agdf` ist als `0.14.5+codex.local-e464297ddcc5` installiert und aktiviert;
  Runtime-Validierung ist `owned_version_matched`, Provenienz `matched`.
- boundary: Der aktuelle Task hat die vorherige Skillfassung geladen. Ein neuer Codex-Task muss die
  sichtbare Modelltreue belegen. Native Windows/Linux und die übrige Hostmatrix bleiben offen.
- authority: Die Installation war separat autorisiert. Keine QA-Freigabe, UAT-, Commit-, Push-,
  PR- oder Release-Autorität entsteht daraus.

## Semantic Function-owner Follow-up, 2026-09-05

- target: das bestätigte AGDF-Repository und derselbe aktive Dispatcher-Run.
- observed_gap: Die drei Zielquellen waren als Enum sichtbar, aber am Modellaufruf nicht präzise
  nach Evidenz und Autoritätsgrenze beschrieben.
- corrected: `skill-dispatch/contract.js` besitzt jetzt die kanonische `agdf_dispatch`-Definition
  für Zweck, Nichtautorisierung, Terminalverhalten und Eingaben. CLI-Grammatik und alle zehn Skills
  verwenden geprüfte Projektionen dieses Owners.
- evidence: CD+Tests 13, TP/Clean/Code Review 13, QA 15, OR 5, HOST_EVIDENCE 13, 40 Adapterfälle,
  437-file package, Source/Installed Runtime Integrity und 83/83 deterministic replays.
- footprint: keine Grenze erhöht; Copilot 91 Dateien und 696479/696486 Byte, SessionStart und
  Selected-Skill-Budgets grün.
- boundary: keine Installation, kein Neustart, keine Hostberechtigung, kein Hook, keine Freigabe und
  keine VCS- oder Release-Aktion. QA bleibt wegen CSED-QA-01 revise.

## Typed Failure Follow-up, 2026-09-05

- target: das bestätigte AGDF-Repository und derselbe aktive Dispatcher-Run.
- observed_defects: target-check klassifizierte eine ungültige Zielquelle als fehlendes Arbeitsziel.
  Der Dispatcher fasste mehrere Auswertungs- und Darstellungsfehler in einer allgemeinen englischen
  Recovery zusammen.
- corrected: ein gemeinsamer Target-source-Validator, `target_source_invalid` mit typisiertem
  `input_error`, lokalisierte Allowed-values-Darstellung sowie stabile Fehlercodes und lokalisierte
  Recoveries für die einzelnen Dispatcher-Stufen.
- evidence: CD+Tests 12, TP/Clean/Code Review 12, QA 14, OR 4, 40 Adapterfälle, 437-file package,
  Runtime Integrity und 83/83 reviewed deterministic replays.
- boundary: keine Installation, kein Neustart, keine Hostberechtigung, kein Hook, keine Freigabe und
  keine VCS- oder Release-Aktion. QA bleibt wegen CSED-QA-01 revise.

## Target-source Follow-up, 2026-09-05

- target: das bestätigte AGDF-Repository und derselbe aktive Dispatcher-Run.
- observed_defect: Die Hostbindung veröffentlichte für `target_source` nur `<source>`. Ein dadurch
  verwendeter ungültiger Wert endete mit einer allgemeinen englischen Recovery ohne erlaubte Werte.
- corrected: Zielauflösung, Dispatcher-Vertrag, CLI-/Binding-Grammatik und Diagnose verwenden eine
  kanonische Werteliste. Die bestehende Interaktionsdarstellung rendert die Recovery auf Deutsch
  oder Englisch. Der ungültige Rohwert wird nicht sichtbar wiederholt.
- evidence: CD+Tests 11, TP/Clean/Code Review 11, QA 13 und OR 3. Der exakte Fehleraufruf, 40
  Adapterfälle, 83/83 Skill-Replays, Paket-, Lifecycle-, Runtime-Integritäts- und serielle
  Regressionstests bestehen.
- boundary: Keine installierte Hostfassung, kein Neustart, keine Berechtigung, kein Hook und keine
  Freigabe wurde geändert. QA bleibt wegen CSED-QA-01 revise.

## Codex Follow-up, 2026-09-05

- target: das vom Nutzer ausdrücklich benannte AGDF-Repository; keine erneute Zielrückfrage nötig.
- source: Task `Run AGDF QA gate`, `01a07112-556e-7383-88dd-81ab23a8ebfe`, und Nutzertranskript.
- corrected: fehlende deutsche Run-Auswahl-Recovery und falsche Claude-Zuordnung der Codex-Bindung.
- evidence: Brownfield 5, CD/Reviews/Host Evidence 10 und QA 12; vollständiger isolierter Smoke,
  83/83 Skill-Fälle und 40 Referenzfälle bestehen. 1088 Quelldateien sind bytegleich.
  Generierter lokaler Replay liefert control_result ohne Darstellungsdiagnostik.
- workspace_limit: zusätzliche generierte Copilot-Dateien tauchen im geteilten Checkout wieder auf;
  Paketierung dort bleibt ungeklärt. Der isolierte geprüfte Stand ist keine Hostinstallation.
- authority: vorhandene SD2/TP2-Freigaben gelten; keine neue Gatefreigabe, Installation oder
  Änderung von Hostberechtigungen. QA bleibt revise, frischer Host-Retest offen.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Die freigegebene Transportkorrektur, die semantische Funktionsdefinition sowie die Target-source-, Failure-Recovery-, QA-Kandidaten-, Terminalantwort- und Plugin-root-Korrektur sind implementiert. Source und installierte Codex-Laufzeit verwenden die native Root vor der Kompatibilitätsvariable. 40 Adapterfälle, 83 geprüfte Offline-Replays, Integrität, Pakete, serielle Regression und isolierter Rollback bestehen. |
| What is approved? | UR und PRD Revision 1, SD Revision 2 und TP Revision 2 durch die jeweiligen exakten Freigaben. |
| What is missing? | Frischer geladener Codex-Modellnachweis sowie übrige Host-, native Windows/Linux- und sichtbare Latenznachweise. QA Revision 17 entscheidet revise. |
| What is the next allowed action? | Neuen Codex-Task öffnen und beide gemeldeten QA-Pfade gegen die aktualisierte Installation beobachten. |
| What is explicitly forbidden right now? | Unbelegter QA-Pass, UAT, weitere Hostinstallation ohne eigene Autorisierung, externe Modellläufe, Commit, Push, PR und Release. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: Original dispatcher request plus explicit 2026-09-05 requests to fix the observed invocation defect and establish one semantic function owner across Codex, OpenCode, Claude Code and other supported surfaces; UR/PRD scope remains unchanged.
- competing_scope_lines: `cross-surface-skill-target-preflight` remains independently at UAT and is not reopened; completed `windows-release-bump-symlink-fixture` supplies latency evidence only.
- branch_workspace_evidence: Correction baseline HEAD `4d38db394d05bf2afb5280dc3af92dfee042a2bb`; current uncommitted paths are the bounded dispatcher, semantic projection, tests and this run's evidence. Generated ignored profiles were rebuilt serially. No commit was created.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: prior host observations; current user target-source critique; semantic function contract, skill projections, tests and existing target/runtime owners
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: approved cross-surface outcome unchanged; CSED-BA-08 resolved by approved SD2; TP2 maps the bounded correction without new product or authority scope
- excluded_mutation_targets: other runs including opencode-native-dispatch-tool and agdf-request-activation-boundary; iself.eu; non-Codex host settings and installations; Windows fixture; unrelated image asset; historical approvals

## Run Status Card

| Run status | Value |
|---|---|
| Status | TP2 einschließlich Plugin-root-, QA-Kandidaten- und Terminalantwortkorrektur implementiert, Codex aktualisiert, QA Revision 17 revise |
| Current gate | QA |
| Allowed now | Neuen Codex-Task gegen die bereits aktualisierte Installation prüfen und offene Evidenzpflicht bearbeiten |
| Blocked by | Frischer geladener Modellnachweis sowie übrige Host- und native Betriebssystemnachweise fehlen |
| Missing approval | none |
| Next step | Im neuen Codex-Task Target-Stop und vollständige 13-Run-QA-Auswahl sichtbar prüfen |
| Quality outlook | Kein Host-Pass aus lokalen Prozess- oder Replay-Tests ableiten |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` nach Revalidierung von Ziel, Run, Gate und Revision 1. |
| PRD | approved | Exaktes `Approval: PRD` nach Revalidierung von Ziel, Run, Gate und Revision 3. |
| SD | approved | Exaktes Approval: SD für SD Revision 2 nach Revalidierung von Ziel, Run und Gate SD bei Revision 18 / 3CA1DBAC-196A-4268-A103-F8B79045B18F. Frühere SD1-Freigabe bleibt historische Evidenz. |
| TP | approved | Exaktes Approval: TP für TP Revision 2 nach Revalidierung von Ziel, Run, Gate und Revision 19 / 38F9EC31-0A51-42DA-B60E-1EE409BCAB5D. |
| QA | blocked | Revision 17 entscheidet revise. CSED-QA-01 ist offen; CSED-DISPATCH-15 bis 18 sowie frühere Implementierungsbefunde sind repository- und installationsseitig gelöst. Kein Approval: QA angefordert. |
| UAT | blocked | QA fehlt. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UR.md` | approved | Revision 1 definiert den gemeinsamen ausführbaren Preflight, Hostgrenzen und getrennte Latenzevidenz. |
| Brownfield Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_REVIEW.md` | done | Bestehende Owner werden erweitert; Structured Delivery ist wegen Runtime-, Public-Contract- und Cross-Host-Release-Tiefe erforderlich. |
| UX Intent Definition | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UX_INTENT_DEFINITION.md` | ready | Sichtbare Start-, Terminal-, Continuation-, Fehler-, Recovery- und Capability-Zustände sind als PRD-Input vollständig. |
| PRD | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/PRD.md` | approved | Revision 1 definiert Dispatcher-Grenze, Registry, typed outcomes, Timing, Hostparität, Authority und Release-Evidenz. |
| SD | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/SD.md` | approved | Revision 2 wurde exakt freigegeben und definiert gemeinsamen Laufzeit-, Environment- und Argumenttransport ohne neue Ziel- oder Gateautorität. |
| TP | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP.md` | approved | Revision 2 exakt freigegeben; TP-11 bis TP-16 korrigieren Binding/Transport, TP-01 bis TP-10 bleiben Foundation und Regression. |
| Brownfield Analysis | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_ANALYSIS.md` | done | Revision 5, pass für die begrenzte Codex- und Locale-Korrektur im freigegebenen TP2-Scope. |
| CD+Tests | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CD_TESTS.md` | done | Revision 15 ergänzt die native Root-Priorität, den bedingten Windows-Fallback, installierten Codex-Replay und grüne Regression. |
| Loaded-host Evidence | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/HOST_EVIDENCE.md` | partial | Revision 15 belegt die aktualisierte Codex-Installation und direkte Root-Auflösung, aber noch keinen frisch geladenen Modellturn oder native Windows-Ausführung. |
| TP Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP_REVIEW.md` | revise | Revision 15: 12/16 vollständig, TP-09/10/14/16 wegen externer Evidenz teilweise. |
| Clean Implementation Review | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Revision 15, Root-Auflösung und Hook-Command behalten eindeutige Owner ohne Parallelpfad. |
| CR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/CODE_REVIEW.md` | done | Revision 15, direkte Prüfung der Plugin-root-Korrektur besteht. Keine unabhängige Agentenprüfung behauptet. |
| QA | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/QA_REPORT.md` | revise | Revision 17: CSED-DISPATCH-17/18 gelöst, CSED-QA-01 für frische Modell- und native Hostevidenz bleibt offen. |
| UAT |  | missing | QA pass fehlt. |
| OR | `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/OR.md` | done | Revision 7, OR-full mit aktualisierter Codex-Installation und weiterhin offenem Modell-/Hostnachweis, kein Release-Closeout. |

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
| SD | derived_from | PRD | Revision 2 konkretisiert gemeinsamen Runtime- und Argumenttransport unter unveränderter PRD1; SD1 bleibt Git-Historie. |
| SD | approved_by | `Approval: SD` | SD2: exakte Freigabe nach Ziel-, Run-, Gate- und Revisionsprüfung bei Run-Revision 18. SD1 wurde zuvor bei Revision 4 freigegeben. |
| TP | derived_from | SD | Revision 2 bildet SD2 auf TP-11 bis TP-16 ab und erhält TP-01 bis TP-10 als Foundation- und Regressionspflichten. |
| TP | approved_by | `Approval: TP` | TP2 wurde nach Revalidierung von Ziel, Run, Gate und Revision 19 exakt freigegeben. TP1 bleibt historische Evidenz. |
| Brownfield Analysis | validates | TP | Revision 4 bestätigt den bestehenden Owner-Pfad nach TP2-Freigabe. |
| CD+Tests | implements_and_tests | TP | Revision 15 belegt TP2-Implementierung, native Root-Priorität, bedingten Windows-Fallback und grüne Regression. |
| Loaded-host Evidence | validates | TP-09 | Revision 15 trennt installierte Codex-Root-Auflösung von der weiterhin offenen frischen Modell- und Hostmatrix. |
| TP Review | verifies | TP | Revision 15: 12/16 vollständig, vier Aufgaben teilweise wegen externer Evidenz. |
| Clean Implementation Review | reviews | CD+Tests | Revision 15 besteht für die gemeinsame Root-Auflösung und den kanonischen Command Owner. |
| Code Review | reviews | CD+Tests | Revision 15 besteht für den tatsächlich geprüften Plugin-root-Korrekturdiff. |
| QA_REPORT | tests | TP | Revision 17 entscheidet revise, aktuelle Code-/Clean-Reviews bestehen, frische Modellevidenz fehlt. |
| OR | summarizes | QA_REPORT | Revision 7 erhält QA revise, belegt die aktualisierte Codex-Laufzeit und trennt sie von frischer Modellevidenz. |
| Loaded-host Evidence | motivates | SD | CSED-HOST-08 und Brownfield Revision 2 begründen die neue Transportentscheidung in SD2; frühere SD1/TP1-Freigaben werden nicht übertragen. |

## Evidence

Die bisherigen datierten Zeilen dokumentieren die Historie. Der aktuelle Repository-Nachweis ist
CD_TESTS.md Revision 15 mit TP-, Clean- und Code Review Revision 15 sowie QA Revision 17.
HOST_EVIDENCE.md Revision 15 belegt die aktualisierte Codex-Installation und direkte Laufzeit. Es
belegt noch keinen frisch geladenen Modellturn.

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Copilot loaded-host observation | Nutzerbericht 2026-09-04 | Drei Minuten bis zur korrekten Task-Target-Karte mit GPT-5.6 Sol | direct user-attested |
| Prior QA invocation trace | Copilot `/agdf-qa-gate` transcript | Modell sucht Verträge und CLI-Einstieg vor der Target-Karte | direct user-supplied |
| Current skill contract | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/task-target-resolution.md` | Modellgetriebene Preflight- und Ausführungsreihenfolge | direct |
| Current Codex installed-runtime replay | `agdf@agdf` 0.14.5+codex.local-880e88555405; `HOST_EVIDENCE.md` CSED-HOST-14 | `owned_version_matched`, provenance matched, native Codex root retained in the presence of a stale Claude root, installed Runtime Integrity pass | direct installed-runtime replay, not loaded-model or native Windows evidence |
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
| OpenCode Electron invocation failure | `HOST_EVIDENCE.md` CSED-HOST-08 | Nutzerbericht durch lokale Tool-Aufzeichnungen und installierte Producer bestätigt; keine QA durchgeführt | direct user report and read-only host inspection |
| Shared transport design gap | `BROWNFIELD_ANALYSIS.md` Revision 2; `SD.md` Revision 2 | Gemeinsame fehlende Startumgebung und unvollständige Argumentübergabe, unveränderte UR/PRD-Ziele | direct source inspection and design, not implementation evidence |
| SD2 approval and TP2 preparation | Exakte Nutzereingabe Approval: SD; revalidierter Gate-Snapshot bei Run-Revision 18; `TP.md` Revision 2 | Designfreigabe angenommen, Korrekturplan und Evidenzzuordnung erstellt, kein Code implementiert | direct deliberate approval and planning |

## Missing Evidence

- Frischer Codex-Task gegen die bereits aktualisierte Installation für Target-Stop und vollständige QA-Kandidatenwahl.
- Frische Claude-Code-, Copilot- und OpenCode-Referenzfälle einschließlich Ordinary Chat und inaktivem OpenCode.
- Native Windows/Linux-Prozessnachweise, erste sichtbare Ausgabe und Modelltreue.
- Die vorhandenen Offline-Replays und CSED-RUNTIME-01 ersetzen diese Evidenz nicht.

## Risks

- Host-Plugin-APIs können direkte ausführbare Skill-Aufrufe unterschiedlich oder gar nicht unterstützen.
- SessionStart- und OpenCode-Aktivierungsgrenzen sind repository-seitig korrigiert, aber noch nicht
  vollständig in frischen Hostsessions verifiziert.
- Windows-Pfade und tatsächliche Host-Latenz bleiben bis TP-09 unbewiesen.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY trennt freigegebenes Design, implementierten Transport, CSED-RUNTIME-01 und die noch offene frische Hostmatrix.

## Knowledge Persistence Decision

- decision: `context_graph`
- rationale: Die wiederverwendbare Dispatcher-Orchestrierungsgrenze ist nach genehmigtem Design mit unveränderten semantischen Ownern kuratiert.
- refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`

## Closeout

- next_allowed_action: record evidence
- quality_outlook: Preserve the distinction between installed state and fresh-session loaded behavior.
- lifecycle_authorization_required: Codex installation was separately authorized and completed. Any other host installation or external model evaluation still requires its own authorization.
