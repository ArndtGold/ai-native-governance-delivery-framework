# UR: Separate Solution Design authoring from gate-check

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-04
Owner: Arndt Gold
Run: sd-definition-separation-20261004-01

## 1. Problem

UR and PRD authoring now have dedicated professional responsibilities. Solution Design
authoring still belongs to the gate-check preparation route: its shared contract instructs
the control skill to derive architecture, boundaries, flows, design decisions and trade-offs.
Design creation and assessment of its prerequisites and approval readiness remain coupled.

The user requested Design as the next ownership separation after UR and PRD. The existing
PRD-separation UR explicitly excludes Solution Design authoring; this is a new scope and does
not inherit approvals from that run. The separately prepared CI changes remain independent.

## 2. Goal

Give Solution Design authoring a named, bounded professional responsibility. It derives and
clarifies one canonical Solution Design from the approved PRD and applicable existing
analyses. Gate-check evaluates prerequisites and readiness; the dispatcher routes the work;
the human approves the resulting design.

The design makes the smallest justified architecture, ownership boundaries, flows and
trade-offs reviewable without changing approved product intent or authorizing implementation.

## 3. Affected Users

- AGDF users who need to review how the approved product requirements will be realized.
- Coding agents that need an explicit design assignment, approved inputs, clarification
  boundaries and expected result.
- Maintainers of shared Core, CLI/MCP contracts, the canonical skill catalog and host
  projections who need one consistent design ownership boundary.

These are existing workflow roles; this change introduces no new user group.

## 4. Scope

- Define and register a dedicated Solution Design authoring responsibility in the existing
  skill catalog, with explicit approved inputs, result and boundaries.
- Delegate semantic design drafting and clarification from gate-check to that responsibility;
  remove competing design-authoring instructions from the control route while retaining the
  existing shared recording procedure.
- Derive the design from the approved PRD, resolved Approval Decisions and applicable existing
  Brownfield and UX analyses. Preserve approved requirements, scope and non-goals.
- Preserve the existing criteria-chain-v1 traceability: each PRD criterion has its design
  response, authoritative source/owner, stable design decision ID or reasoned none, and
  compatibility/risk treatment. Define architecture, boundaries, flows, reuse and trade-offs
  at the smallest justified depth.
- Distinguish confirmed design decisions, assumptions and unresolved questions. Ask only for
  material missing design information and retain previously answered context. Conflicts with
  approved product requirements return to the existing PRD revision path; design authoring
  cannot silently change approved UR or PRD intent.
- Support new design drafts and explicitly requested revisions of an unapproved design.
  Bind the assignment and result to the confirmed target, run, current revision, canonical
  SD path and approved sources, using existing recording, relationship and approval operations.
- Return the recorded result to gate-check for fresh readiness evaluation. Material unresolved
  design decisions remain visible and prevent an approval request; the authoring responsibility
  grants neither approval nor implementation permission.
- Keep affected contracts, documentation, generated host projections and evidence consistent
  with the ownership change, retaining existing instruction, payload and runtime limits.

## 5. Non-Goals

- Rework the already separated UR or PRD authoring responsibilities.
- Separate Task Plan authoring, implementation, UAT, audit closeout or release responsibilities.
- Move Brownfield Analysis to Task 0 or change code/architecture review placement.
- Add a mockup/prototype creation workflow or a new UX review owner in this slice. Applicable
  existing UX analyses remain design inputs.
- Introduce new gates, additional approvals, parallel designs, a second control store or a new
  artifact writer.
- Change approved designs or transfer approvals between runs, revisions or artifacts.
- Migrate existing runs, install plugins, publish, release or perform Git actions automatically.
- Incorporate or modify the independent CI-absicherung changes.

## 6. Acceptance Signals

The resulting delivery should demonstrate that:

1. Design creation, control evaluation, routing and human approval have distinct responsibilities.
2. A permitted bound authoring request produces one canonical design derived from the approved
   PRD and applicable analyses, retaining criteria traceability and explicit decision ownership.
3. A material missing design answer produces focused clarification and withholds approval
   presentation. Answered questions are not repeated without a changed design need.
4. A requested unapproved-draft revision uses existing revision-bound recording and fresh
   presentation. Wrong, stale, foreign or approved bindings cannot overwrite approved intent.
5. A product-scope conflict returns to the existing PRD revision route rather than changing
   approved requirements inside the design.
6. Gate-check evaluates actual prerequisites and readiness after authoring. Approval: SD remains
   a deliberate human decision and permits only the existing next stage.
7. Shared CLI/MCP routing, supported host projections and documentation identify the same design
   authoring responsibility, without duplicate semantic instructions or weakened limits. UR,
   PRD, TP and later gate behavior retain their existing ownership outside this slice.

The subsequent PRD and Task Plan should define concrete evidence for drafting, clarification,
revision, source conflicts, invalid bindings and the return to approval presentation. Structural
completeness does not establish semantic design quality; source/package/protocol evidence must
remain distinct from a fresh native-host observation.

## 7. Existing Source Of Truth

- plugins/agdf/meta/agdf-plugin.definition.json: canonical skill catalog and host projections.
- plugins/agdf/skills/gate-check/SKILL.md, ur-definition/SKILL.md and prd-definition/SKILL.md:
  existing control and semantic-authoring boundaries.
- plugins/agdf/meta/contracts/gate-artifact-preparation.md: current SD derivation and shared
  recording procedure.
- plugins/agdf/meta/contracts/gate-transition.md and task-target-resolution.md: gate and target
  prerequisites.
- packages/core/lib/control-evaluation/gate-check.js and packages/core/lib/skill-dispatch/service.js:
  current design preparation evaluation and continuation routing.
- Existing canonical run state, approved source bindings, criteria chain, artifact recording,
  revision checks and approval presentation: authoritative control and artifact records.

The exact affected files, reusable seams and implementation design remain Brownfield Review,
PRD and Solution Design questions for this run.

## 8. Risks And Unknowns

- Design clarification must distinguish a technical choice from a material product-scope change.
- Removing SD drafting instructions must preserve shared recording and the existing TP route.
- A new catalog entry affects generated host payloads and runtime integrity; its necessary cost
  and updates must be explicit without reserving unused headroom or weakening limits.
- Semantic quality needs proportionate evidence beyond structural readiness checks.
- The concrete skill name, handoff schema and implementation design are deferred to PRD and SD.
- Existing runs and the independent CI changes must retain their own scope and approval state.

No material requirement clarification remains open. These unknowns concern analysis and design,
not permission to expand the requested ownership separation.

## 9. Next Step

Present this bound UR for a new deliberate Approval: UR decision. After approval, follow existing
Brownfield Review and Mode/Slice Decision before preparing the PRD. This UR does not authorize
implementation.

## AGDF Approval Summary (de; source=en)

- Problem: Die Design-Erstellung liegt weiterhin in der gate-check-Route und vermischt fachliche
  Architekturarbeit mit der Prüfung ihrer Voraussetzungen und Freigabereife.
- Ziel: Ein eigener fachlicher Auftrag erstellt und klärt das Solution Design aus dem freigegebenen
  PRD. gate-check prüft, der Dispatcher routet und der Mensch gibt frei.
- Betroffene: AGDF-Nutzer, Coding-Agenten und Maintainer der gemeinsamen Verträge und Hostprojektionen.
- Umfang: Design-Erstellung und unfreigegebene Überarbeitung abtrennen; Architektur, Grenzen,
  Abläufe, Wiederverwendung, Entscheidungen und Abwägungen begründen; Kriterienbezug und bestehende
  Ziel-, Run-, Revisions-, Quellen-, Registrierungs- und Freigabebindung erhalten.
- Grenzen: Genau ein kanonisches SD. Offene wesentliche Designfragen verhindern die
  Freigabepräsentation. Produktkonflikte führen in die bestehende PRD-Revision.
- Erfolg: Erstellung, Prüfung, Routing und Freigabe sind getrennt; Entwurf, Klärung, Revision,
  Quellenkonflikte, ungültige Bindungen und Rückgabe an gate-check werden prüfbar.
- Nicht-Ziele: TP, Task 0, Reviews, Umsetzung, neue UX-Aufträge, UAT, Abschluss und Release werden
  hier nicht neu geordnet. Keine neuen Gates, parallelen Quellen, Writer oder automatischen Git-,
  Installations- und Veröffentlichungsaktionen. Die CI-Absicherung bleibt ein separater Umfang.
- Risiken und spätere Entscheidungen: Semantische Designqualität, Erhalt der gemeinsamen
  Registrierung und Auswirkungen auf Hostbudgets prüfen. Skillname und Übergabeformat werden
  erst in PRD und SD festgelegt.
- Entscheidung: Freigegeben wird der Bedarf zur Trennung der Design-Erstellung. Danach folgen
  Brownfield Review und Mode/Slice Decision; die UR-Freigabe erlaubt keine Umsetzung.
