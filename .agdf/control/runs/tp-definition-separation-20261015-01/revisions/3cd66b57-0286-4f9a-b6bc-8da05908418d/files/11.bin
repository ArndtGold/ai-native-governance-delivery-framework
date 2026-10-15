# UR: Separate Task Plan authoring from gate-check

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-15
Owner: AGDF maintainer

## 1. Problem

UR, PRD and Solution Design authoring have dedicated definition skills. Task/Test Plan authoring still belongs to gate-check and its shared gate-artifact-preparation contract. This mixes delivery control with semantic planning and leaves Task Plan creation without the equivalent focused authoring owner.

## 2. Goal

Introduce a canonical tp-definition skill, analogous to ur-definition, prd-definition and sd-definition, that owns drafting, clarification and permitted revision of an unapproved Task/Test Plan. The coding agent should receive a clear, bound planning continuation while existing control, recording and human approval mechanisms retain their authority.

## Affected Users

Coding agents preparing governed delivery plans and maintainers reviewing those plans and maintaining AGDF skills, contracts, dispatch and host projections.

## 3. Scope

- Give tp-definition exclusive semantic ownership of Task/Test Plan drafting, clarification and permitted unapproved revision, with a focused skill and runtime contract.
- Derive the plan from the exact approved PRD and SD: concrete tasks, dependencies, acceptance traceability, scenarios, observable expected results and evidence obligations. Resolve SD decisions explicitly deferred to Task Plan preparation; material product or architecture conflicts return to their existing source owner.
- Make test routes, environments, prerequisites, permissions, responsible owners and expected evidence explicit where applicable, including the handling of unavailable prerequisites.
- Route eligible Task Plan preparation to this skill through the canonical dispatcher. Integrate discovery, packaging and generated surfaces for the existing supported hosts through their existing owners.
- Keep gate-check responsible for prerequisites, control routing, readiness and approval presentation. Keep task-plan-review responsible for evaluating fulfilment after implementation. Reuse existing Core-owned templates, recording, traceability and revision mechanisms.
- Verify the ownership and routing change, rejection of invalid or approved bindings, recording and fresh approval behavior, and consistency of affected generated host/package assets.

## 4. Non-Goals

- No new gate, approval authority, alternative writer or parallel control state.
- No automatic Task Plan approval, implementation before TP approval, or changes to QA, UAT or release authority.
- No rewriting approved source artefacts or unrelated active runs.
- No expansion of supported hosts or claim of fresh native-host verification without actual evidence.

## 5. Acceptance Signals

- One canonical tp-definition owner prepares and clarifies an unapproved Task/Test Plan from bound approved sources; gate-check delegates semantic authoring.
- The resulting plan retains existing acceptance and SD-decision traceability and concrete tasks, tests and evidence obligations without inventing product scope.
- Missing planning facts remain visible and are clarified; product or architecture changes use the existing upstream revision owner.
- Initial recording and explicit permitted revision use the existing canonical mechanisms, preserve history, and require a fresh presentation and deliberate Approval: TP for changed content.
- Invalid, stale, foreign or approved bindings cannot become authoring or implementation authority.
- Existing supported host projections and packaged runtime expose the canonical skill consistently; targeted routing and regression evidence demonstrates the changed path and preserved boundaries.
- task-plan-review continues to evaluate implementation against the approved Task Plan, with no second drafting or approval owner.

## 6. Existing Source Of Truth

- plugins/agdf/skills/{ur-definition,prd-definition,sd-definition,gate-check,task-plan-review}/SKILL.md define existing role boundaries.
- plugins/agdf/meta/contracts/{sd-definition,gate-artifact-preparation,request-activation}.md define source decisions, TP semantics, shared recording and request applicability.
- packages/core/lib/skill-dispatch/ and packages/core/lib/control-evaluation/gate-check.js own existing dispatch and gate routing; the canonical plugin definition owns skill registration and generated host projections.
- Installed version-matched plugin templates remain the authoring authority. Core-owned registration, traceability, revision checks and approval presentation remain authoritative.

## 7. Risks And Unknowns

Brownfield Review and SD must identify every TP authoring/remediation route and generated registry, package and host projection affected by the separation. Avoid competing authoring owners, duplicated persistence logic or accidental revision/approval changes. Preserve existing approved Task Plans and run compatibility. Exact test and evidence scope will be defined from the affected owners; native-host proof must be distinguished from generated-asset and local runtime checks. These are implementation/design questions rather than open requirement decisions.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Die Taskplan-Erstellung liegt noch bei gate-check, während UR, PRD und SD eigene Definition-Skills besitzen. Dadurch sind Ablaufsteuerung und fachliche Planerstellung vermischt.

Ziel: Ein eigener tp-definition-Skill erstellt, klärt und überarbeitet unfreigegebene Task/Test Plans auf Basis des freigegebenen PRD und SD. Betroffen sind planende Coding-Agenten und prüfende beziehungsweise betreuende Maintainer.

Umfang: Eigener Skill und Vertrag, kanonische Dispatcher-Anbindung sowie konsistente Registrierung, Pakete und bestehende Hostprojektionen. Der Plan ordnet Aufgaben, Abhängigkeiten, Akzeptanzkriterien, SD-Entscheidungen, Tests und Nachweise zu. Testwege, Umgebungen, Voraussetzungen, Berechtigungen und Verantwortliche werden soweit anwendbar konkretisiert. Zum TP verschobene SD-Ausführungsentscheidungen werden geklärt; Produkt- und Architekturkonflikte gehen an ihren bisherigen Eigentümer zurück.

Grenzen: gate-check behält Voraussetzungen, Routing, Freigabereife und Freigabevorlage. task-plan-review prüft weiterhin nach der Umsetzung. Bestehende Core-Mechanismen für Vorlagen, Registrierung, Traceability, Revision und Freigaben werden wiederverwendet. Keine neuen Gates, parallelen Schreibwege, automatischen Freigaben oder Änderungen anderer Runs.

Erfolg: Genau ein fachlicher TP-Autor, nachvollziehbare Aufgaben und Nachweise, sichtbare offene Fragen und sichere gebundene Erstellung beziehungsweise Revision. Geänderte Pläne brauchen eine neue Vorlage und bewusste Approval: TP. Gezielte Prüfungen belegen Routing, geschützte Grenzen und betroffene Host-/Paketprojektionen.

Quellen und Risiken: Bestehende Definition-Skills, TP-Vertrag und Core-Dispatcher bleiben die Grundlage. Brownfield Review und SD müssen alle betroffenen Routen und Projektionen ermitteln und doppelte Zuständigkeiten verhindern. Bestehende freigegebene Pläne bleiben geschützt; lokale Prüfungen ersetzen keinen nativen Hostnachweis. Keine offene fachliche Anforderungsentscheidung.

Nächster Schritt: UR prüfen und freigeben; danach folgen Brownfield Review und die bestehende Mode-/Slice-Entscheidung.
