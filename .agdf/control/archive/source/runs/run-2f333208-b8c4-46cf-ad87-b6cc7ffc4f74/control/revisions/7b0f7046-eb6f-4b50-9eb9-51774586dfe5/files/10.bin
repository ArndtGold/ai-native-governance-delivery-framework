# UR: Replace the master backlog with planned URs and an optional planning extension

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-31
Owner: Arndt Gold
Run: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74
Language: en

## 1. Problem

The shared MASTER_BACKLOG.md combines planned work with summaries of existing Runs. Independent changes repeatedly touch the same Markdown table, creating merge conflicts and a shared writing bottleneck. Core writers also synchronize Run state and backlog projections under shared locking and recovery rules. Moving only the planning rows would leave this coupling in place.

Planning currently lacks a clearly bounded home for a UR before an active Run exists. The user wants planning limited to the UR, with the Core able to understand a planned folder and an optional extension organizing how drafts enter it. A second UR author, parallel approval system or mandatory planning installation would introduce more competing ownership.

## 2. Goal

Replace the obligatory master backlog with independently stored planned URs and an overview derived from those entries and canonical Runs. Parallel work should no longer need a shared backlog write. Preserve useful planning information, history and control guarantees. Provide a planning mode for the existing ur-definition owner and a narrow optional planning-extension boundary; the Core continues to work without that extension.

## Affected Users

- Maintainers capturing and prioritizing prospective work and deliberately starting a Run.
- Agents preparing UR drafts or carrying out independent Runs in parallel worktrees.
- Users inspecting planned work and existing Runs through Core, CLI/MCP and Cockpit views.

## 3. Scope

1. Retire MASTER_BACKLOG.md as a required live file, mandatory Run-state projection and shared update target. Active Run state remains owned by each canonical RUN_STATE.md and its registered artefacts. A generated/exported overview must not become another writable status authority.
2. Establish a Core-understood planned area under .agdf/control/planned/, with one independently editable UR entry per undertaking. The discussed layout is planned/planning-id/UR.md. Keep identity, title and priority with the entry without a redundant mandatory second planning store; exact metadata syntax belongs to PRD/SD.
3. Bound planning to a UR draft and minimal steering metadata. No PRD, SD, TP or implementation plan is required in planned. A planned draft is not an active Run and grants no delivery authority or approval.
4. Extend the existing ur-definition owner with a planning mode using the canonical UR structure. It must support drafting and revising planned URs without first creating a Run or obtaining Run-only identifiers. Do not create a second UR specification or authoring workflow with divergent semantics.
5. Provide for an optional planning extension which organizes capture, clarification, refinement and prioritization using this shared authoring mode. Core owns the storage/validation and Run boundary; it recognizes planned entries without the extension. Decide the concrete extension delivery and initial supported surfaces in PRD/SD, without assuming a universal extension framework.
6. Provide an explicit, version-bound transition from a selected planned UR to a Core Run. Preserve its origin and selected content; normal Core UR review and approval remain required. Repeated or interrupted handoff must not silently create duplicate Runs or lose the source draft. After handoff, Core owns the active UR and lifecycle; any retained planning source is historical/reference material.
7. Derive an understandable overview from planned entries and canonical Run state, updating the existing Core/CLI/MCP/Cockpit consumers. Distinguish planned drafts, active and ended Runs, unavailable/partial input and failed transfers. Reading or selecting an item never approves a gate or starts delivery implicitly.
8. Migrate or preserve existing backlog planning information, priority, links and history without losing work. Reconcile rows with existing canonical Runs; missing/ambiguous associations must remain visible instead of being guessed. Keep existing Run/artefact paths and recorded approvals valid; do not rewrite historical decisions to manufacture consistency.
9. Trace and remove the shared backlog dependency from writers, locking, transactions, recovery, validation, scaffolding and documentation. Permit independent entries/Runs to progress without an artificial backlog-wide serialization point. Retain synchronization required for genuinely shared resources and preserve same-Run revision, idempotence and recovery protections.
10. Perform this delivery in the dedicated worktree on branch agdf/planned-urs-masterbacklog-replacement, based on 8e482d913289f0d2b466128d6d2a0d8b5815f0a3. Use existing control owners for this Run until the replacement is approved and implemented; the intended future model does not bypass current gates.

## 4. Non-Goals

- No new gate system, inferred human approval, automatic Run start or automatic implementation from a planned entry.
- No general project-management suite, calendar, remote planning service or mandatory PRD/SD/TP authoring in the planning area.
- No blanket removal of all project locks, movement of existing active/ended Run directories, or silent deletion of ambiguous legacy work.
- No unrelated installer repair, automatic installation, release/publication or VCS closeout authority from this UR.
- No mandatory interactive preview has been requested; any later clarification aid is distinct from an approved preview obligation.

## 5. Acceptance Signals

AC-01: A repository can use the new model without a live MASTER_BACKLOG.md; ordinary Run operations and required inspections no longer require or rewrite it.

AC-02: Multiple planned URs can be created/revised independently. One entry changes its own material, not a shared index or another undertaking. Stable identity, priority, empty/invalid states and useful source references remain inspectable.

AC-03: The same canonical ur-definition content rules apply to planning and active Runs. Planning mode needs no pre-existing Run and produces only an unapproved UR draft plus necessary metadata. Invalid input fails visibly without a fabricated approval.

AC-04: Core inventory and the applicable CLI/MCP/Cockpit views distinguish planned work from real Run lifecycle state and use the same read semantics. No consumer invents an independent saved status policy.

AC-05: The optional extension can organize planned UR authoring using the Core contract, while a Core installation without it can inspect planned entries and start Runs directly. Extension identity, packaging and initial host claims are explicit before implementation.

AC-06: Deliberately starting from a particular UR revision produces one traceable Core Run. Retrying the same handoff and recovering interruption preserve content/origin and avoid duplicate effects; a changed source requires deliberate handling rather than silent substitution. Gate approvals remain bound to Core's actual presented revision.

AC-07: Migration accounts for all existing backlog rows, preserving planning content, priority and references or reporting a concrete unresolved association. Existing canonical Runs, artefacts and recorded approval history are not silently rewritten or lost.

AC-08: Targeted concurrent-write and interrupted-operation checks show independent entries/Runs no longer contend on MASTER_BACKLOG.md. Same-Run conflicts and legitimate recovery exclusions still fail safely. The analysis identifies any remaining project-wide serialization and its actual invariant.

AC-09: Required repository checks cover affected owners and consumer contracts. Fresh host observations support any claimed extension/Cockpit behavior; repository tests alone do not establish installed-host support, human acceptance or measured contention improvements.

## 6. Existing Source Of Truth

- The user's decisions in this conversation: replace the shared backlog; planned URs live separately; planning depth ends at UR; Core recognizes planned; an optional extension organizes authoring through ur-definition; delivery uses a worktree.
- plugins/agdf/meta/contracts/ur-definition.md and the version-matched UR template own UR content. request-activation.md, gate-transition.md and existing Run/approval contracts retain authority.
- packages/core/lib/control-state/run-backlog.js, run-backlog-writer.js, run-step-transaction.js and run-command-service.js own current synchronization and transaction boundaries.
- packages/core/lib/control-evaluation/doctor.js, delivery-map.js and packages/core/lib/control-inspect/cockpit-backlog.js own current inspection/read projections; existing CLI/MCP/UI adapters consume those contracts.
- .agdf/control/MASTER_BACKLOG.md, canonical runs, registered artefacts and existing scaffold writers are migration input. Earlier backlog-status-flow-clarity and cockpit-active-backlog-core-ui URs describe bounded status/list work, not authorization for this broader replacement.
- CONTRIBUTING.md and GOVERNANCE.md own contribution, evidence and maintainer boundaries.

## 7. Risks And Unknowns

Brownfield Review must identify every live dependency and distinguish avoidable backlog coupling from actual transaction/recovery invariants. Removing a table alone cannot prove concurrent Run safety across worktrees. Migration must handle orphaned rows, legacy layouts and stale summaries without inventing missing evidence.

PRD/SD must define planned identity/metadata, draft lifecycle, handoff ownership and failure/retry behavior, extension packaging and supported initial surfaces. These are design decisions within the confirmed need, not open approval or implementation permission. UR template authority must also be available safely before a Run exists.

Planning and active Run navigation change user-facing semantics. Route the appropriate UX clarification through existing post-UR owners. Existing approvals and sealed history must survive migration or yield explicit incompatibility; no host compatibility, performance gain or human acceptance is assumed.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. Then perform the canonical Brownfield Review and Mode/Slice decision, followed by the required product/design/task-plan preparation and any routed UX clarification. No product implementation is authorized by creating this draft.

## AGDF Approval Summary (de; source=en)

- Problem: MASTER_BACKLOG.md bündelt Planung und abgeleitete Run-Zustände. Parallele Arbeiten ändern dieselbe Datei und treffen auf gemeinsame Schreib-/Recovery-Regeln. Eine reine Verschiebung der Planungszeilen löst diesen Engpass nicht.

- Ziel: Maintainer und Agenten sollen Vorhaben als einzelne UR-Entwürfe planen und unabhängige Runs in Worktrees bearbeiten können. Core, CLI/MCP und Cockpit liefern eine daraus abgeleitete Übersicht; bestehende Nachweise bleiben erhalten.

- Umfang: Die Pflicht zum Masterbacklog und zu seinen gemeinsamen Statusschreibvorgängen entfällt. Geplante Vorhaben liegen einzeln unter .agdf/control/planned/, vorgesehen als planning-id/UR.md, mit minimalen Angaben wie Identität und Priorität. Planung endet beim UR-Entwurf; PRD, SD, TP und Umsetzung gehören zum aktiven Run. Der vorhandene ur-definition-Owner erhält einen Planungsmodus ohne vorher angelegten Run. Eine optionale Planungserweiterung organisiert Erfassung, Klärung und Priorisierung über diesen gemeinsamen Autor. Der Core definiert und versteht die Ablage auch ohne die Erweiterung.

- Übergabe: Ein ausdrücklich ausgewählter UR-Stand wird nachvollziehbar in einen Core-Run übernommen. Wiederholungen und Unterbrechungen dürfen weder doppelte Runs noch verlorene Entwürfe verursachen. Core-Gates und revisionsgebundene Freigaben bleiben verbindlich. Aktive und abgeschlossene Runs behalten ihre bisherigen Pfade.

- Abnahme: Vorhandene Planung, Prioritäten, Links und Historie werden übernommen oder mit konkret benannten Unklarheiten erhalten. Die betroffenen Leser, Writer, Vorlagen und Regeln werden angepasst. Abnahmesignale umfassen Betrieb ohne Live-Masterbacklog, getrennte Dateischreibvorgänge, gemeinsame UR-Regeln, erkennbare Planungs-/Run-Zustände, optionale Erweiterung, sichere Übergabe und Migration sowie gezielte Parallelitäts-/Recovery-Prüfungen. Installation und Host-/UI-Verhalten brauchen eigene Nachweise.

- Risiken: Kanonische Run-/Artefaktzustände und bestehende Core-Owner bleiben maßgeblich. Brownfield muss unnötige globale Kopplung von erforderlichen Sperren unterscheiden; PRD/SD klären Metadaten, Übergabeprotokoll, Erweiterungspaket und anfängliche Host-Abdeckung. Keine automatische Umsetzung, neue Gate-Logik, pauschale Sperrenentfernung, Veröffentlichung oder Löschung unklarer Altdaten. Ein interaktiver Preview wurde nicht beauftragt.

- Nächster Schritt: Eigener Worktree, Branch agdf/planned-urs-masterbacklog-replacement, Basis 8e482d91. Jetzt ausschließlich UR prüfen und bei Zustimmung mit `Approval: UR` freigeben; danach folgen Brownfield, Mode/Slice und die erforderlichen Folgeschritte. Frühere Freigaben gelten nicht für diesen neuen Run.
