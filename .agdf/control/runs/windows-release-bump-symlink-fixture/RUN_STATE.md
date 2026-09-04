# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: windows-release-bump-symlink-fixture
- lifecycle: active
- revision: 3
- revision_id: 4E78606B-3456-49B5-BA95-5F2B14B24FC1
- started_at: 2026-09-04
- mode: `verified_change`
- current_gate: OR
- decision: pass
- owner: Arndt Gold

## Objective

Die negative Release-Bump-Symlink-Fixture auf Windows ohne Symlink-Privileg ausführbar machen, ohne
Produktionsschutz oder Fehlererkennung zu schwächen.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Der Capability-Guard ist im einen deklarierten Testpfad implementiert; fokussierter Test, vollständiges `release:prepare`, Diff-Prüfung und Code Review bestehen. |
| What is approved? | UR Revision 1 durch exaktes `Approval: UR` nach Revalidierung von Run, Gate und Revision 1. |
| What is missing? | Direkter nativer Windows-Nachtest von `npm run install:copilot`. |
| What is the next allowed action? | Den ausgeführten Verified Change kompakt übergeben und den nativen Windows-Nachtest durchführen. |
| What is explicitly forbidden right now? | Native-Windows-Erfolg ohne Nachtest behaupten; Scope-Vermischung, Commit, Push, PR und Release. |

## Source And Scope State

- normative_instruction_source: live `.agdf/control/` state and AGDF Runtime Contract
- multi_scope_state: `clear`
- active_scope_evidence: Direct Windows failure and exact failing file/line supplied on 2026-09-04.
- competing_scope_lines: `cross-surface-skill-target-preflight` remains independently at UAT; the executable dispatcher is a separate future scope.
- branch_workspace_evidence: baseline commit `2d3df45aa34cb67684f54b29b10062125ecb797e`; candidate digest `a50283076c8925fc10445437dd863e74cc7709eb`; candidate path is clean while unrelated control and image paths remain isolated.
- branch_workspace_scope_effect: `supports`
- primary_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/create-agdf/scripts/release-bump-test.js`
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: direct Windows PowerShell output; git blame for `a1dc166`; prior `b489c53` capability guard
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: one explicit test-fixture regression
- excluded_mutation_targets: production recovery logic; installer semantics; other active runs; executable dispatcher; unrelated image asset

## Run Status Card

| Run status | Value |
|---|---|
| Status | Verified Change lokal ausgeführt und geprüft; Windows-Nachweis offen |
| Current gate | OR |
| Allowed now | Mini-Closeout verwenden und nativen Windows-Nachtest erfassen |
| Blocked by | Kein interner Codeblocker; nur direkte native Windows-Evidenz fehlt |
| Missing approval | none |
| Next step | Unter Windows `npm run install:copilot` erneut ausführen und das Ergebnis zurückmelden |
| Quality outlook | Lokale Evidenz und Review bestehen; Hostclaim bleibt bis zum Windows-Nachtest begrenzt |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` nach Revalidierung von Run, Gate und Revision 1. |
| PRD | missing | Durch UR und Brownfield-Routing blockiert. |
| SD | missing | Durch frühere Gates blockiert. |
| TP | missing | Durch frühere Gates blockiert. |
| QA | missing | Durch frühere Gates blockiert. |
| UAT | missing | Durch frühere Gates blockiert. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/windows-release-bump-symlink-fixture/UR.md` | approved | Revision 1 begrenzt den Fix auf die nicht konstruierbare negative Testfixture. |
| Brownfield Review | `.agdf/control/artefacts/windows-release-bump-symlink-fixture/BROWNFIELD_REVIEW.md` | done | Pass; ein bestehender Owner und ein vorhandenes Guard-Muster erlauben Verified Change. |
| Verified Change | `.agdf/control/artefacts/windows-release-bump-symlink-fixture/VERIFIED_CHANGE.md` | executed | Scope exakt eingehalten; fokussierte und vollständige lokale Validierung bestanden. |
| Code Review | `.agdf/control/artefacts/windows-release-bump-symlink-fixture/CODE_REVIEW.md` | pass | Kein Diff-Befund; native Windows-Ausführung bleibt fehlende Host-Evidenz. |

## Mode/Slice Decision

- decision: `verified_change`
- required_next_gate: none
- scope_reason: Ein sauberer kanonischer Testowner, keine verbotenen Auswirkungen, keine Ableitungen und deterministische Prüfungen erlauben den kompakten Pfad; `structured_slice` bleibt das Eskalationsziel.
- evidence: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/windows-release-bump-symlink-fixture/VERIFIED_CHANGE.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | motivated_by | Native Windows `EPERM` | Direkte Nutzerbeobachtung an `release-bump-test.js:224`. |
| UR | approved_by | `Approval: UR` | Exakte Freigabe nach Revalidierung von Run, Gate und Revision 1. |
| Brownfield Review | sizes | UR | `verified_change`; ein sauberer Testowner und vorhandenes Guard-Muster. |
| Verified Change | derived_from | Brownfield Review | Eligibility vollständig mit Baseline, Pfaden, Prüfungen und Eskalationsziel. |
| Implementation | executes | Verified Change | Ein Capability-Guard in `release-bump-test.js`; keine Produktionsänderung. |
| Code Review | verifies | Implementation | Pass; `EPERM` ist eng begrenzt, andere Fehler bleiben hart und die Sicherheitsassertion bleibt erhalten. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Windows PowerShell failure | Nutzerbeobachtung 2026-09-04 | reproduzierbarer Installationsblocker und exakte Fehlerstelle | direct |
| Source inspection | `release-bump-test.js:215-234` | ungeprüfter `symlinkSync` vor Recovery-Assertion | direct |
| Change history | `a1dc166`; `b489c53` | spätere Fixture liegt außerhalb des früheren Windows-Fix | direct |
| Focused test | `node create-agdf/scripts/release-bump-test.js` | Release-Bump-Transaktion und Recovery einschließlich Symlink-Ablehnung | direct |
| Release preparation | `npm --prefix create-agdf run release:prepare` | Distribution, Bump, Versionskohärenz und Public Plugin | direct |
| Diff review | `CODE_REVIEW.md`; `git diff --check` | Fehlerpfade, Sicherheitsassertion und Scope | direct |

## Missing Evidence

- Native-Windows-Nachtest von `release:prepare` und `install:copilot` nach der Korrektur.

## Risks

- Ein macOS-Test kann den gemeldeten Windows-Privilegpfad nicht beweisen.
- Vermischung mit dem laufenden Target-Preflight- oder Dispatcher-Scope.

## Context Graph Impact

- context_graph_impact: `not_applicable`
- context_graph_refs: none
- context_graph_reconciliation: `resolved`
- context_graph_required_action: none
- context_graph_gate_effect: `none`
- context_graph_evidence: Der Befund ist zunächst run-lokal und enthält noch keine wiederverwendbare neue Architekturentscheidung.

## Knowledge Persistence Decision

- decision: `run_only`
- rationale: Die Änderung übernimmt ein bestehendes Capability-Guard-Muster und erzeugt keine neue frameworkweite Invariante.
- refs: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/VERIFIED_CHANGE.md`; `.agdf/control/artefacts/windows-release-bump-symlink-fixture/CODE_REVIEW.md`

## Closeout

- next_allowed_action: Mini-Closeout übergeben und `npm run install:copilot` auf dem gemeldeten nativen Windows-Host wiederholen.
- quality_outlook: Capability-Guard, lokale Release-Kette und Code Review bestehen; der Windows-Erfolg ist bis zum direkten Nachtest nicht beansprucht.
