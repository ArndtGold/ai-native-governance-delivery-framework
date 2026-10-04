# UR: Separate PRD authoring from gate-check

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-04
Owner: Arndt Gold

## 1. Problem

AGDF now delegates UR drafting and clarification to ur-definition. PRD authoring still belongs to the gate-check route: the gate-artifact-preparation contract tells that control skill to derive product requirements, define acceptance criteria and gather product decisions. Requirement creation and the assessment of its prerequisites and approval readiness therefore remain coupled for PRD.

The user explicitly selected a new UR for separating PRD authoring from gate-check. This is a separate scope from the completed UR-authoring change; approvals from that change do not authorize this work.

## 2. Goal

Give PRD authoring a named, bounded professional responsibility. That responsibility derives and clarifies product requirements from the approved UR and applicable existing analyses. Gate-check evaluates canonical prerequisites and readiness; the dispatcher routes the responsible work; the human approves the resulting PRD.

Agents and users can identify who creates the PRD, who checks its readiness and who approves it. There remains one canonical PRD for the selected run.

## 3. Affected Users

- AGDF users who need a product specification that preserves their approved need and makes observable acceptance criteria and unresolved product decisions clear.
- Coding agents that need an explicit PRD authoring assignment, its approved inputs, clarification boundaries and expected result.
- Maintainers of the shared Core, CLI/MCP contracts, canonical skill catalog and host projections who need one consistent ownership boundary.

These roles follow the existing AGDF workflow; no new user group is assumed.

## 4. Scope

- Define and register a dedicated PRD authoring responsibility with explicit inputs, result and boundaries in the existing skill catalog.
- Delegate semantic PRD drafting and clarification from gate-check to that responsibility, removing the competing authoring instructions from the control route.
- Derive the PRD from the approved UR, completed Brownfield Review and applicable UX Intent Definition. Preserve approved intent, scope, non-goals and the existing acceptance-criteria traceability.
- Define observable, individually identified product acceptance criteria and the product decisions needed before PRD approval. Distinguish confirmed requirements, assumptions and unresolved questions; ask only for material missing product information and preserve already answered context.
- Support new PRD drafts and explicitly requested revisions of an unapproved PRD. Material conflicts with the approved UR return to the existing UR revision path rather than changing approved intent silently.
- Bind the assignment and result to the confirmed target, run, current revision, canonical PRD path and approved sources. Use the existing canonical recording, source-relationship, presentation and approval operations.
- Return the recorded result to gate-check for fresh readiness evaluation. Material unresolved product questions must remain visible and prevent an approval request; the authoring responsibility never grants approval or implementation permission.
- Keep the affected contracts, documentation, generated host projections and evidence consistent with this ownership change.

## 5. Non-Goals

- Rework the already introduced ur-definition responsibility.
- Separate Solution Design or Task Plan authoring in this slice.
- Move Brownfield Analysis to Task 0, move final reviews into the Task Plan, or change implementation, QA, UAT, audit closeout or release responsibilities.
- Introduce new gates, additional approvals, parallel PRDs, a second control store or another artifact writer.
- Invent product scope, users or acceptance promises not supported by the approved need and clarified context.
- Change approved PRDs or transfer approvals from another run or revision.
- Migrate existing runs, publish, release, install a plugin or execute Git actions automatically.

## 6. Acceptance Signals

The need is sufficiently clear for analysis and planning when the resulting delivery can demonstrate that:

1. PRD creation, control evaluation, routing and human approval have distinct, explicit responsibilities.
2. A permitted, bound PRD authoring request produces one canonical draft derived from the approved UR and applicable existing analyses, with observable criteria and product decisions.
3. A material missing product answer causes focused clarification and withholds approval presentation; previously answered questions are not repeated without a changed need.
4. A requested unapproved-draft revision returns through the existing revision-bound recording and fresh presentation flow. Wrong, stale, foreign or approved bindings cannot be used to overwrite approved intent.
5. Gate-check evaluates actual prerequisites and readiness after authoring. Approval: PRD remains a deliberate human decision and permits only the existing next stage.
6. Shared CLI/MCP routing, supported host projections and documentation identify the same authoring responsibility, without duplicate drafting procedures or weakened instruction, payload or runtime limits.
7. Later artifact authoring and gate order retain their existing behavior outside this slice.

The subsequent PRD and Task Plan should turn these signals into concrete checks for new drafting, clarification, draft revision, approved-source conflicts, invalid bindings and the return to approval presentation. Source, package and protocol checks must be distinguished from fresh native-host observations.

## 7. Existing Source Of Truth

- plugins/agdf/meta/agdf-plugin.definition.json: canonical catalog and host projection definitions.
- plugins/agdf/skills/gate-check/SKILL.md and plugins/agdf/skills/ur-definition/SKILL.md: established control and semantic-authoring boundaries.
- plugins/agdf/meta/contracts/gate-artifact-preparation.md: current PRD derivation and shared recording procedure.
- plugins/agdf/meta/contracts/gate-transition.md and task-target-resolution.md: gate and target prerequisites.
- plugins/agdf/skills/ux-intent-definition/SKILL.md: applicable analytical product input, subordinate to approved intent.
- packages/core/lib/control-evaluation/gate-check.js and packages/core/lib/skill-dispatch/service.js: current PRD preparation evaluation and continuation routing.
- Existing canonical run state, approved source bindings, criteria chain, recording writers, revision checks and approval presentation: authoritative control and artifact records.

These existing sources establish ownership evidence; the precise affected files and reusable seams remain a Brownfield Review and design question.

## 8. Risks And Unknowns

- The authoring responsibility must preserve approved UR intent while distinguishing material product clarification from downstream design or planning questions.
- Structural completeness does not prove semantic adequacy. Planning must specify both readiness checks and proportionate evidence of actual drafting and clarification behavior.
- Removing PRD-specific drafting instructions must preserve the shared recording procedure and the current SD/TP routes.
- An additional catalog entry can affect generated host payloads, instruction budgets and installed integrity. Its cost and necessary updates must be explicit without reserving unused headroom or weakening limits.
- The concrete skill name, handoff schema and minimal implementation design are deferred to PRD and SD. The professional ownership separation is the requested outcome.
- The prior UR-separation run remains separately bound and has an open UAT decision. This new scope must preserve that run and unrelated repository changes.

No material question about the requested need remains open. The listed unknowns concern analysis, specification and design, not permission to expand scope.

## 9. Next Step

Review this bound UR and make a new deliberate Approval: UR decision. After approval, follow the existing Brownfield Review and Mode/Slice Decision before preparing the PRD for this change. This UR does not authorize implementation.

## AGDF Approval Summary (de; source=en)

- Problem: Die PRD-Erstellung liegt weiterhin bei gate-check und verbindet fachliche Produktarbeit mit der Kontrolle ihrer Voraussetzungen und Freigabereife.
- Ziel: Ein eigener fachlicher Auftrag erstellt und klärt das PRD. gate-check prüft den kanonischen Zustand; der Dispatcher routet; der Mensch gibt frei.
- Betroffene: AGDF-Nutzer, Coding-Agenten und Maintainer der gemeinsamen Verträge, des Katalogs und der Hostprojektionen.
- Umfang: Das PRD aus der freigegebenen UR, Brownfield Review und gegebenenfalls UX Intent Definition ableiten; beobachtbare Akzeptanzkriterien und Produktentscheidungen formulieren; wesentliche Fragen bündeln; neue und ausdrücklich angeforderte unfreigegebene Entwürfe bearbeiten.
- Grenzen: Genau ein kanonisches PRD; bestehende Ziel-, Run-, Revisions-, Quellen- und Freigabebindung verwenden. Offene wesentliche Produktfragen verhindern die Freigabepräsentation. Konflikte mit freigegebenem Bedarf führen in den bestehenden Revisionsweg.
- Erfolg: Erstellung, Prüfung, Routing und menschliche Entscheidung sind getrennt. Neue Entwürfe, Klärung, Überarbeitung, ungültige Bindungen und der Rückweg zur bestehenden Approval: PRD werden prüfbar. Gemeinsame Verträge und Hostprojektionen bleiben konsistent.
- Nicht-Ziele: UR, SD, TP, Task 0, Reviews, Umsetzung, QA, UAT, Abschluss und Release in diesem Schritt nicht neu ordnen. Keine zusätzlichen Gates, parallelen Quellen, neuen Writer oder automatischen Installations-, Git- und Veröffentlichungsaktionen.
- Risiken und spätere Entscheidungen: Semantische Qualität, Erhalt der gemeinsamen Registrierung sowie Auswirkungen auf Katalog und Budgets prüfen. Skillname, Übergabeformat und Umsetzung werden erst in PRD und Design festgelegt. Der vorige UR-Umbau bleibt ein separater Run mit offener UAT.
- Entscheidung: Freigegeben wird der begrenzte Bedarf zur Trennung der PRD-Erstellung. Danach folgen Brownfield Review und Mode/Slice Decision; die UR-Freigabe allein erlaubt keine Implementierung.
