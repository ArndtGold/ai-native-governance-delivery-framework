# UR: One Run Folder And One Current Control Data Model

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-01
Owner: Arndt Gold

## 1. Problem

AGDF is not yet live. Its development implementation nevertheless maintains parallel Masterbacklog/planned-UR layouts, multiple historical Run and transaction formats, and compatibility/migration paths. A single Run is split between `.agdf/control/runs/{run_id}/` and `.agdf/control/artefacts/{run_id}/`. Recording requests, review records and state bindings repeat some of the same metadata. This makes ownership, navigation, testing and maintenance harder than the current product stage requires.

PR #50 introduced planned URs while retaining old layouts and formats. The maintainer now explicitly requests a clean cut rather than supporting those development-era variants indefinitely.

## 2. Goal

Support one current, explicitly identified control data model: independent planned URs before Run creation and one self-contained folder per started Run. Each authoritative fact has one canonical owner; human-readable overviews are derived from those owners. Remove the Masterbacklog and historical-format support rather than adding another compatibility layer.

## Affected Users

- Maintainers and contributors who locate, understand, review, test and archive a Run.
- AGDF users operating through Core/CLI, MCP and Cockpit who need the same current state and documents across those surfaces.
- Agents and integrations that create Runs, present exact document versions, record deliberate decisions and recover interrupted current-format operations.

## 3. Scope

- Consolidate each started Run's current documents, state, required decision/version history and evidence into one folder below `.agdf/control/runs/{run_id}/`. Retain independent UR-only planning under `.agdf/control/planned/`; a central backlog or maintained replacement index is not introduced.
- Eliminate Masterbacklog reading, writing, locking, Cockpit legacy views, implicit fallback selection, migration commands and associated obsolete contracts/fixtures. Remove the parallel top-level per-Run artefact tree from the supported model.
- Support only the selected current Run, binding and transaction formats. Remove historical-format parsers, conversion branches and recovery paths whose only purpose is supporting superseded formats. Keep an explicit schema identity; the exact version number is a later design decision.
- Review repeated RECORD/REVIEW/state metadata and remove redundant persistence where one canonical owner and derived projections suffice. Retain distinct information genuinely required for exact-version decisions, historical inspection or crash recovery; do not treat every snapshot as an unnecessary duplicate.
- Align Core, CLI/MCP, Cockpit, initialization, templates, contracts, optional planning integration, generated distributions and affected tests with the same model. Preserve existing host scope and deliberate gate semantics.
- Do not build migration or backwards compatibility for old development control stores. Recreate or replace affected development fixtures deliberately. Plan a controlled way to finish/retain the governing Run and its current evidence while changing the mechanism that stores Runs; do not silently reapprove or reseal old records.
- Use the isolated worktree `agdf/run-model-clean-cut`, based on main commit `c204ab67f3ab212238bfd9ad81de4ddbecacece8` after PR #50. No implementation is authorized by this UR draft.

## 4. Non-Goals

- Migration, continued operation or automatic repair of historical development Runs, old Masterbacklogs or old persisted format generations.
- A new planning product, extra gate, changed approval meaning, changed human authority or a second source of truth for current Run status.
- Removing current-format integrity checks, idempotent operation handling, interrupted-write recovery or necessary historical document versions merely to reduce file counts.
- Blanket deletion of foreign work, other worktrees, unrelated evidence or Git history; global plugin installation, release and publication are separate actions.
- New host support, broad performance redesign or a mandatory interactive preview.

## 5. Acceptance Signals

1. A fresh project has one supported control layout. Planning, explicit handoff, Run execution and closure work without a Masterbacklog or top-level per-Run artefact tree.
2. One started Run can be located, inspected and archived through its single folder. Core, CLI/MCP and Cockpit resolve the same canonical state and document paths.
3. Each persisted current fact has a documented owner. Any retained duplication has a concrete historical or recovery purpose; overviews do not require separately maintained duplicate facts.
4. Superseded layouts/formats are not silently accepted, converted or selected through fallbacks. Unsupported existing data produces a clear diagnostic without automatic mutation.
5. Exact document-version approvals, operation identity/replay, current-format interruption recovery and independent Run writes retain their required behavior. Removing legacy support creates no shared backlog/index lock.
6. Affected templates, documentation, generated assets and tests describe/exercise only the supported model. The test plan separates focused local checks, required current-head CI and actual host evidence; repository fixtures alone do not establish native qualification.
7. No migration subsystem or legacy compatibility path is required for acceptance. The handling of this governing Run and affected development fixtures is explicit before implementation.

## 6. Existing Source Of Truth

- The maintainer's decisions in this conversation: AGDF is not live; combine each Run's files, avoid duplicate authoritative facts, remove Masterbacklog and parallel historical-format support, and do not plan old-data migration.
- Current main `c204ab67f3ab212238bfd9ad81de4ddbecacece8`, including PR #50's planned-UR/handoff capability and Run-only writes.
- `packages/core/lib/control-state/` and `packages/core/lib/control-maintenance/` own current persistence, layout, transaction, revision and migration behavior. In particular, `control-layout.js`, `run-step-transaction.js`, `run-artefact-recording.js` and `artefact-bindings.js` expose the parallel paths and repeated metadata to assess.
- `packages/cli/`, `packages/mcp-server/` and `packages/control-ui/` own their existing consumer surfaces. `plugins/agdf/` and `plugins/agdf-planning/` own canonical contracts, templates and skills; existing build owners generate distributions.
- CONTRIBUTING.md and GOVERNANCE.md retain their contribution, verification and human decision boundaries.

## 7. Risks And Unknowns

- Brownfield Review and design must identify every persisted-format owner, path consumer and invariant before removing legacy code. The exact subfolder names and whether current state stays Markdown are design decisions, not new user requirements.
- The framework is changing its own control storage. Establish a bounded self-hosting transition for this Run without introducing permanent migration support or weakening recorded decisions.
- Historical bytes and recovery records can look redundant while carrying different responsibilities. Removal must follow demonstrated ownership and consumer analysis, not just matching field names.
- Rebuilding development fixtures must remain scoped and must not delete unrelated work or imply historical approvals. Old stored data may be intentionally unsupported after the cut.
- Existing host support remains in scope, but fresh native evidence must name the actual tested candidate/client/platform; host qualification scope will be made proportionate during planning.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. After approval, perform the existing Brownfield Review and Mode/Slice selection, then prepare PRD, SD and TP through their normal owners. Resolve the self-hosting boundary and verification scope before implementation. No product changes, migration or destructive cleanup are authorized by Run creation alone.

## AGDF Approval Summary (de; source=en)

- Problem: Zwei Ablagestrukturen, Masterbacklog-Kompatibilität und mehrere alte Datenformate machen AGDF bereits vor dem Livebetrieb unnötig komplex; einzelne Metadaten werden mehrfach gespeichert.
- Ziel: Ein aktuelles Datenmodell, ein gemeinsamer Ordner je gestartetem Run und genau eine kanonische Zuständigkeit je Information.
- Betroffene Nutzer: Maintainer, Beitragende, AGDF-Nutzer sowie Agenten und Integrationen über Core/CLI, MCP und Cockpit.
- Umfang: Masterbacklog und Altformat-Unterstützung vollständig entfernen; geplante URs unter planned behalten; Dokumente, Zustand, notwendige Historie und Nachweise je Run zusammenführen; Leser, Schreiber, Initialisierung, Verträge, Pakete und Tests angleichen.
- Nicht-Ziele: Keine Migration oder Weiterunterstützung alter Entwicklungsbestände, keine neue zentrale Liste, keine neuen Gates oder Hostversprechen, keine pauschale Löschung fremder Daten, keine Installation oder Veröffentlichung.
- Erfolgssignale: Neue Projekte und alle betroffenen Oberflächen nutzen dieselbe Struktur; jeder Run ist vollständig auffindbar; alte Daten werden klar und ohne automatische Änderung abgewiesen; aktuelle Freigaben, Wiederholbarkeit und Recovery bleiben erhalten.
- Quellen: Die besprochenen Maintainer-Entscheidungen und main c204ab67 nach PR #50; vorhandene Core-Persistenz-, CLI/MCP-, Cockpit- und Plugin-Owner bleiben die Ausgangspunkte.
- Risiken und offene Details: Der Run verändert seine eigene Ablage; dieser Übergang und der Ersatz betroffener Testbestände müssen vor Umsetzung geklärt werden. Erforderliche historische Nachweise dürfen nicht als vermeintliche Dubletten entfallen. Unterordner und genaue Schema-Kennung werden erst im Design festgelegt.
- Arbeitskopie: Eigener Worktree run-model-clean-cut auf Branch agdf/run-model-clean-cut; bisherige Arbeitskopien bleiben getrennt.
- Nächster Schritt: Diese konkrete UR-Fassung prüfen. Erst Approval: UR erlaubt Brownfield Review und weitere Planung; Umsetzung und spätere Gates bleiben separat.
