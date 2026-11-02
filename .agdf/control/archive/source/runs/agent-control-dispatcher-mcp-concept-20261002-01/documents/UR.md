# UR: Joint Coding-Agent Control Concept for Dispatcher and MCP

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-02
Owner: Arndt Gold
Run: agent-control-dispatcher-mcp-concept-20261002-01
Language: en

## 1. Problem

The user needs to control the coding agent and assess its actual work. Adding MCP capabilities or approval buttons separately would leave the relationships between agent permissions, Dispatcher routing, canonical control state, human decisions and work verification unresolved. The Dispatcher is still evolving; its current routing and MCP invocation do not by themselves prevent an agent from using other tools or modifying files outside the governed path.

There is no agreed integrated concept that states which controls are enforceable, which depend on agent cooperation, and how deviations become visible. Host-specific presentation must not create different approval meanings or parallel sources of authority.

## 2. Goal

Establish one reviewable overall concept for governing coding-agent actions and verifying their work, jointly covering the Dispatcher, canonical AGDF control services, MCP and host integration. A human should understand what the agent may do, which evidence supports its claimed results, when intervention is required, and which control guarantees the selected host actually provides.

This run delivers the concept and its validation and implementation roadmap. It does not authorize implementation of the proposed runtime changes. The complete conceptual model must precede separately governed implementation slices.

## 3. Scope

- Map the current end-to-end path and its owners, from request and target/run selection through scope, decisions, action execution, work verification and closeout. Cover direct filesystem, shell and other tool actions that bypass Dispatcher or MCP.
- Define the required control outcomes: actions bound to the correct target, run, scope and current revision; deliberate human approval of the presented artefact; evidence of actual work and result quality; and visible handling of violations, missing evidence and unsupported enforcement.
- Describe the target responsibilities and contracts between existing control evaluators, state writers, Dispatcher, skills, evidence/review services, MCP adapters and host interfaces. Preserve a single canonical owner for rules, state, decisions and presentation semantics.
- Classify each required control by actual enforcement mechanism and residual limits: tool or validator enforcement, host-dependent enforcement, instruction-only control, detection after execution, or no available enforcement. Identify who observes and blocks each action, and what happens when the agent ignores instructions. Distinguish governance permission from host tool permission.
- Specify the coherent MCP capability needs for inspection, routing, state transitions, presentation, decisions and evidence. Evaluate tools, resources, prompts, elicitation, UI extensions and events against these needs and verified protocol/host support; do not preselect every mechanism or assume events are authorization.
- Keep decision values, display labels and operational status separate. Describe a common semantic presentation model, a portable fallback and capability-based host rendering, including Codex and Claude. Assess other supported hosts where relevant. Native controls must preserve the exact run/gate/revision/artefact binding and explicit human authority.
- Cover stale or duplicate responses, revise/decline/cancel, interruption and recovery, concurrent changes, replay, missing capabilities and loss of connection. Identify required authentication, provenance, audit, idempotency and compatibility guarantees at each applicable boundary.
- Define how agent-produced evidence is checked against scope and actual changes, where independent review or external verification is required, and where self-reported completion remains insufficient. Include success and failure scenarios and the observable evidence needed to validate the concept.
- Produce a dependency-aware implementation roadmap derived from the complete concept. Reconcile existing Dispatcher, MCP and maturity scopes without transferring their approvals, rewriting their historical scope or silently treating unfinished work as complete.

## 4. Non-Goals

- No runtime, MCP schema, host adapter, gate model or implementation change in this concept scope.
- No replacement workflow engine, duplicate control state, separate approval authority or host-specific governance rules.
- No predetermined React application, custom panel, webhook infrastructure or remote service. Presentation technology is a later justified design decision.
- No claim of universal enforcement across hosts, adversarial tamper resistance or verified live-host behavior without evidence.
- No implementation, installation, publication or VCS action authorized solely by this UR.

## 5. Acceptance Signals

1. The concept explains the current and proposed control path with named owners, trust boundaries, canonical state and explicit bypass paths.
2. Every required control has a stated enforcement class, mechanism, responsible owner, failure behavior, residual limitation and validation scenario. Cooperative behavior is not presented as technical prevention.
3. Human decisions are bound to the exact presented target/run/gate/revision/artefact. Labels, transport acknowledgements and UI acceptance cannot independently grant gate authority.
4. Work verification connects approved scope, actual changes, tests/reviews and evidence; missing or contradictory evidence has a defined outcome.
5. MCP and host capability choices follow the common control model. Protocol support, installed capability and observed live behavior are distinguished; unsupported features have explicit fallback or blocking behavior.
6. Recovery and concurrency scenarios have explicit safe outcomes without inherited approvals, silent scope changes or duplicate state transitions.
7. One complete concept identifies existing reuse, unresolved decisions, dependencies and a separately approvable implementation roadmap. Unfinished existing work is visible and no isolated interface extension is substituted for that concept.

These signals become testable product requirements in the governed continuation. This UR does not settle the technical solutions to the identified questions.

## 6. Existing Source Of Truth

- The user's request in this chat: an overall concept jointly with the unfinished Dispatcher, primarily to control the coding agent and its work, starting with a UR.
- `docs/architecture/dispatcher.md`, `docs/architecture/mcp-target-architecture.md` and current implementation under `packages/core/` and `packages/mcp-server/`. The MCP target document is discussion input, not implementation authority.
- Canonical plugin contracts under `plugins/agdf/meta/contracts/`, control state under `.agdf/control/`, and the existing presentation and approval validation owners.
- Referenced URs of `cross-surface-executable-skill-dispatcher`, `mcp-zielarchitektur-doku-20260929-01`, `agdf-mcp-inspect-slice1-20260929-01`, `codex-harness-conformance-slice` and `agdf-product-maturity-roadmap`: related scope evidence only; their approvals do not authorize this run.
- Official MCP specifications and host documentation, supplemented by bounded installed/live capability checks before claims of operational support.

## 7. Risks And Unknowns

Brownfield Review must establish the actual reusable owners, unfinished dependencies and places where execution escapes governed services. PRD must specify the required level of prevention versus detection and acceptable residual limits. SD must decide how host/tool enforcement, MCP capabilities and presentation cooperate without duplicating authority. Protocol availability does not prove that a particular Codex or Claude installation exposes the capability. Filesystem integrity checks alone do not establish adversarial trust. Existing workspace changes and other runs require bounded inspection and must not be overwritten.

## 8. Next Step

Review this persisted UR and approve only with `Approval: UR`. Approval permits the existing Brownfield Review and Mode/Slice Decision for this run. It does not authorize runtime implementation or later gates.

## AGDF Approval Summary (de; source=en)

Ziel ist ein vollständiges Gesamtkonzept zur Kontrolle des Coding-Agenten und seiner Arbeit, gemeinsam für Dispatcher, AGDF-Kontrollkern, MCP und Host-Anbindung. Es beschreibt erlaubte Aktionen, menschliche Freigaben, überprüfbare Arbeitsergebnisse und die Grenzen der Durchsetzung.

Der Umfang umfasst Ist- und Zielablauf, eindeutige Verantwortlichkeiten, Umgehungswege über andere Werkzeuge, technische Kontrolle gegenüber Anweisungen und nachträglicher Erkennung, gemeinsame MCP-Anforderungen und eine Darstellung mit gleicher Bedeutung auf verschiedenen Hosts. Entscheidungswerte, Anzeigetexte und Status bleiben getrennt. Veraltete Antworten, Abbruch, Wiederaufnahme, parallele Änderungen und fehlende Host-Fähigkeiten erhalten definierte sichere Abläufe.

Abnahmefähig ist das Konzept, wenn jede Kontrolle einen Owner, Mechanismus, Grenzen und Prüfszenarien besitzt; Freigaben an Run, Gate, Revision und Artefakt gebunden bleiben; tatsächliche Änderungen und Nachweise gegen den Auftrag geprüft werden; und Protokollunterstützung, installierte Fähigkeit und beobachtetes Host-Verhalten auseinandergehalten werden. Ein vollständiger, abhängigkeitsbewusster Umsetzungsplan muss bestehende Arbeiten einordnen und offene Entscheidungen sichtbar machen.

Dieser Run erstellt das Konzept und seinen Prüf- und Umsetzungsplan. Er erweitert noch keine MCP-Schnittstelle und implementiert keine Laufzeitänderung. Eine React-Anwendung, eigene Panels oder Webhooks sind nicht vorgegeben. Bestehende Freigaben werden nicht übernommen. Die UR-Freigabe erlaubt zunächst Brownfield Review und Mode/Slice Decision; sie erlaubt noch keine Implementierung.
