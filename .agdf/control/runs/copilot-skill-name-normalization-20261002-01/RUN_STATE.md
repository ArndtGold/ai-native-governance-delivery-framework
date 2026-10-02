# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: copilot-skill-name-normalization-20261002-01
- lifecycle: active
- revision: 24
- revision_id: 73914ac3-e45f-415e-8716-78a6f77b7778
- content_seal: sha256:dd9605ba48984a73ffd0dc62713a3f96f17b25aeee1722321948ec6d8ca8de55
- approval_seal: sha256:1bc19b54457afb37427d423da50c94ea12622ad5e4623962dbcf75400a994773
- updated_at: 2026-10-02T17:04:01.934Z
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Registrierte Skillnamen auf Codex, Claude Code, Copilot und OpenCode aus dem bestehenden Katalog auf stabile kanonische AGDF-IDs abbilden; Dispatcher-Eingaben, allgemeine Hostprojektion und Nachweise konsistent halten.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for QA; current gate is UAT. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP, Approval: QA |
| What is missing? | Exact Approval: UAT. |
| What is the next allowed action? | Request exact approval: Approval: UAT before delivery handoff. |
| What is explicitly forbidden right now? | release; push; open PR; commit without explicit user instruction and required approval |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/UR.md` sha256:819a5143ec79ce70 · presentation ac0053aa-d659-431a-89da-402d0b439389 sha256:96eec59b46c9884a267b4fa7838cc3672ac0daeb2a8ef18c7c573b5dbf7b71ef |
| PRD | approved | `Approval: PRD` · 2026-10-02 · revision 11 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/PRD.md` sha256:9f62ba40e321ccf7 · presentation 9c21648d-979f-4bd1-9809-83b600065127 sha256:a42f3f5f00b773c77abe47db73656b9749e6e66c0ca4edd7a9a0f99750df12a1 |
| SD | approved | `Approval: SD` · 2026-10-02 · revision 13 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/SD.md` sha256:5988b5d7b05e9c6d · presentation 5a797b48-43ff-42d2-bf67-7d4aa7e952fb sha256:b12c13fa00ce4afbe950c86dab5a5de512a2bb203c2d0617fb5a910342b09e98 |
| TP | approved | `Approval: TP` · 2026-10-02 · revision 15 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/TP.md` sha256:6aa662dbbb366a5e · presentation 2d6a178d-1cfa-4720-a587-a33090a091cd sha256:349f867861e6be368f603b2f986d09f69c0d6dc2d6db446dd961e46035e48759 |
| QA | approved | `Approval: QA` · 2026-10-02 · revision 21 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/QA_REPORT.md` sha256:6f5dc9806b80c76f · presentation 89608d4b-91ec-411c-bf43-43b426310b8a sha256:7eb25800e0b238b353ac71241c53757dcfe7846c7003a37b720473d52af3112d |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/BROWNFIELD_REVIEW.md` | done |  |
| Scope clarification | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/SCOPE_CHANGE.md` | done | Direkte Benutzerkorrektur auf alle unterstützten Hosts; erneute PRD-Freigabe erforderlich |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/PRD.md` | approved | criteria-chain-v1; AC-001 bis AC-006; Produktentscheidungen gelöst |
| SD | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/SD.md` | approved | criteria-chain-v1; SDD-001 bis SDD-006; alle PRD-Kriterien genau einmal zugeordnet |
| TP | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/TP.md` | approved | criteria-chain-v1; T-001 bis T-006; SCN-001 bis SCN-016 |
| Brownfield Analysis | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis; pass; Baseline und Owner geprüft |
| CD+Tests | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/CD_TESTS.md` | done | SCN-001 through SCN-016 pass; isolated build boundary documented |
| CR | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/CR.md` | done | Code Review pass |
| TP Review | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/TASK_PLAN_REVIEW.md` | done | pass; six tasks and all scenarios evidenced |
| Clean Implementation Review | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | pass; shared owner and no production workaround |
| QA | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/QA_REPORT.md` | pass | qa-gate pass; source/package/protocol evidence; Approval: QA recorded |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: Zusätzliche akzeptierte Skillnamen ändern den externen Dispatcher-/CLI-Eingabevertrag; begrenzter Scope, aber Structured Slice ist nach modes.md Trigger 4 ausgeschlossen.
- evidence: .agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/UR.md` sha256:819a5143ec79ce70 · presentation ac0053aa-d659-431a-89da-402d0b439389 sha256:96eec59b46c9884a267b4fa7838cc3672ac0daeb2a8ef18c7c573b5dbf7b71ef |
| PRD | derived_from | UR | Genehmigter Scope; Benutzerklarstellung zur stabilen ID und Dispatcher-Mapping |
| PRD | informed_by | Brownfield Review | Gemeinsame Core-/CLI-/MCP-Eintrittspfade und allgemeine Hostprojektion |
| PRD | revised_by | Scope clarification | Direkte Benutzerkorrektur; frühere PRD-Freigabe durch run-revise superseded |
| SD | derived_from | PRD | Genehmigte allgemeine Hostfassung; stabile IDs und gemeinsamer Namenskatalog |
| TP | derived_from | SD | Sechs Aufgaben und sechzehn Szenarien decken alle PRD-/SD-IDs ab |
| CD+Tests | implements_and_verifies | TP | SCN-001 through SCN-016; CD_TESTS.md and evidence/ |
| QA_REPORT | tests | TP | QA_REPORT.md evaluates TASK_PLAN_REVIEW.md and CD_TESTS.md SCN-001 through SCN-016 against approved TP T-001 through T-006 |

## Preparation Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| PRD draft | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/PRD.md` | AC-001 bis AC-006; Produktentscheidungen gelöst; technische Fragen SD/TP zugeordnet | direct |
| General host scope | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/SCOPE_CHANGE.md` | Benutzerkorrektur auf alle unterstützten Hosts; bestehende lokale/globale Formen und Plugin-Namensräume | direct |
| SD draft | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/SD.md` | Gemeinsame Katalogableitung, vertrauenswürdige Produktionsdefinition, exakte Normalisierung und präzise Hostprojektion | direct |
| TP draft | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/TP.md` | Vollständige Criterion-/Decision-/Task-/Scenario-Zuordnung; konkrete Prüfkommandos und geschützte Grenzen | direct |
| Brownfield Analysis | `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/BROWNFIELD_ANALYSIS.md` | pass; Baseline 4184dbdb9aa0a049a6add75d0775235800b3945c; Codepfade sauber und fremde Hooks isoliert | direct |
| Superseded PRD approval | `Approval: PRD` · 2026-10-02 · revision 8 · `.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/PRD.md` sha256:211508a919e9cc4a · presentation 34eecefd-b1de-4087-954f-4d0e8450f01d sha256:95f6f712a757cd4839eb2b5e83d1ee515ca45cb9fe7daa424d714f9281408922 | Prior PRD revision only; renewed Approval: PRD required | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/CR.md | direct |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Implementierung und Tests | [CD_TESTS.md](</Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/CD_TESTS.md>) | Gemeinsames Mapping aller vier Hosts; stabile gate-check-ID; sechs Aufgaben und 16 Szenarien bestanden | direct |
| QA freigegeben | [QA_REPORT.md](</Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/QA_REPORT.md>) | QA pass und Approval: QA; CLI/MCP-, Profil-, Paket- und Integritätsprüfungen bestanden | direct |
| Review abgeschlossen | [TASK_PLAN_REVIEW.md](</Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/TASK_PLAN_REVIEW.md>) | Planabdeckung, Strukturreview und Code Review pass; kein offener Scope-Befund | direct |
| Abnahmegrenze | [QA_REPORT.md](</Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/copilot-skill-name-normalization-20261002-01/QA_REPORT.md>) | Keine Hostinstallation oder frische Modellsitzung geprüft; Nutzerabnahme gilt dem vorliegenden Implementierungsumfang | direct |

## Closeout

- next_allowed_action: Request exact approval: Approval: UAT before delivery handoff.
- quality_outlook: Plan coverage, solution integrity and code quality pass; qa-gate pass; live-host UAT not claimed.
- memory_target: scope_artifact
- memory_reason: Run evidence and existing dispatcher documentation retain the evidenced naming semantics.
- memory_refs: docs/architecture/02-dispatcher.md; QA_REPORT.md
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none

- previous_quality_outlook:
