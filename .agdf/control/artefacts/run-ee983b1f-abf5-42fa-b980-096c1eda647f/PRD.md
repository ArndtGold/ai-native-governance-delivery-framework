# PRD: One Run Folder And One Current Control Data Model

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-01
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved pre-live clean cut: independent UR-only planning and exactly one supported current control/Run model. Each started Run keeps its state, documents, necessary historical versions and evidence below `.agdf/control/runs/{run_id}/`. Remove Masterbacklog support, its legacy Cockpit mode, the parallel top-level per-Run artefact tree and historical-format compatibility/migration paths.

Each current authoritative fact has one documented owner. Overviews are derived; separately persisted requests, reviews or snapshots survive only for a concrete independent decision, history or recovery purpose. A unified folder must contain all Run-specific material, not a separate copy of the entire framework or project-wide configuration.

This is an intentional compatibility break while AGDF is not live. The product does not migrate old development stores. It diagnoses unsupported data without modifying it, and supports deliberate fresh setup at a safe location. The governing Run and affected development fixtures require an explicit finite handling boundary before implementation; this exception must not become product compatibility code.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: UX_INTENT_DEFINITION.md, ready, sha256:29f648399da58eb6e4569d3bfffc464cd0a651010c3947855dc7875fb317406d
- primary_user_intent: Locate a planned requirement or started Run, understand its current documents/state and identify the next permissible action without choosing a historical storage model.
- success_signal: The same item, current state and source paths agree across CLI/MCP and passive Cockpit; one Run folder contains its own material; old or unavailable state is clearly distinguished from a fresh empty inventory.
- primary_decision_or_action: Inspect an exact item/material version, then deliberately perform the existing authorized handoff, recording or gate decision. Viewing creates no approval or mutation.

The source-based UX walkthrough covers planning, explicit handoff, Run inspection/decision, unsupported old stores and transient failed/stale reads. No interactive preview was requested or created; no observed human UX behavior is claimed. Adopted proposed behavior is specified by the criteria below; this PRD is the sole product acceptance source after approval.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| planning | Independent UR and current clarification/handoff readiness; no started Run or approval | Planned UR, incomplete/ready handoff, unavailable observation | Existing planning validation and explicit command result | Selected CLI/MCP result or passive Cockpit planned view |
| current_run | Current identity, lifecycle, gate, revision, bound documents and exact decision status | Active, completed/ended, pending decision, recoverable pending operation | Existing Run evaluator and canonical command receipts; deliberate user decision for approval | Selected CLI/MCP result or passive Cockpit Run/document view |
| unsupported_store | Existing data has a non-supported layout/format; no inferred current state | Explicit unsupported-store diagnostic, not empty inventory | Current-format validation | Same diagnostic on CLI/MCP and Cockpit |
| unavailable_observation | No freshly confirmed result because data changed or the read failed | Stale/unavailable with explicit retry or next action | Current read validation; stored approval is not fresh observation | Current surface shows the limitation visibly |

Technical representations and component ownership remain SD decisions. No presentation becomes a second status authority.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Explicitly open a confirmed project and select a planned UR or exact Run. Refresh deliberately. A handoff starts an unapproved Run only after its existing explicit confirmation; a document read or view switch never does. No legacy-view selection or implicit format fallback remains.
- blockers_and_visible_next_actions: Unsupported old data reports unsupported model and leaves bytes unchanged. Missing/damaged current data reports its actual failure and does not masquerade as old data or an empty project. Stale revision/material requires refresh and renewed presentation. An uncertain mutation directs the caller to its original operation before replay.
- recovery_paths: Transient reads offer explicit retry/refresh. Unsupported stores offer guidance for deliberate fresh initialization at a separate safe location, without automatic conversion, deletion or reset. Current pending operations retain exact original UUID/payload binding and supported recovery. Changed decision material requires a new presentation and response.
- relevant_state_transitions: Planned UR -> explicit handoff -> unapproved current Run, with its origin identifiable. Current Run -> exact presentation -> deliberate gate response -> next existing step, with no inferred approval. Fresh read -> failed/stale -> explicit refresh -> current observation. Unsupported data stays unchanged and blocked; a separate explicit safe setup can create a fresh store. Interrupted mutation -> pending/unknown -> exact inspection/recovery -> confirmed result, with no duplicate effect.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - requirement: Fresh initialization creates exactly one explicitly identified supported model and the planning/Run containers needed by that model. It creates no Masterbacklog or parallel top-level per-Run artefact store.
  - observable_success: From an absent project-control state, explicit initialization yields a usable current store. Unsupported versions, malformed configuration and partial/conflicting setup are diagnosed without implicit fallback or overwrite.
  - required_evidence: Fresh setup and negative setup/format tests; actual generated-package initialization.
  - working_mode: setup
  - source_state: absent control
  - trigger: explicit fresh initialization
  - expected_effective_state: one valid current store
  - visible_feedback: created current model or accurate refusal
  - blocker_failure_behavior: partial/conflicting/unsupported data refuses without overwrite
  - recovery_next_action: inspect the diagnosed conflict or choose a separate safe fresh location

- criterion_id: AC-002
  - requirement: UR-only planning remains independent. Explicit source-bound handoff creates exactly one unapproved Run in the current format and retains required origin evidence inside that Run.
  - observable_success: In planning mode, viewing/editing a UR does not start a Run or grant approval. Deliberate eligible handoff changes planned -> unapproved Run and visibly identifies the new Run. Stale/changed sources fail without an unintended Run; exact replay has one effect.
  - required_evidence: Planning/handoff lifecycle, stale-source, replay and concurrent-handoff scenarios through current owners.
  - working_mode: planning
  - source_state: unhanded planned UR
  - trigger: deliberate source-bound handoff
  - expected_effective_state: one unapproved Run with retained origin
  - visible_feedback: new Run identity and unapproved status
  - blocker_failure_behavior: changed/stale source refuses without unintended creation
  - recovery_next_action: refresh source or inspect/replay the original operation

- criterion_id: AC-003
  - requirement: All Run-specific current documents, state, required presentations/history and evidence are contained below that Run's single directory; supported consumers do not require the former per-Run artefact tree or aliases to it.
  - observable_success: In current_run mode, selecting a Run resolves its documents, historical decision material and evidence consistently. Missing/escaped paths are reported, not repaired by a legacy lookup. A Run archive captures its Run-specific material from that folder while project/framework dependencies remain explicit.
  - required_evidence: Create/inspect/document/history/closeout path tests, containment negatives and package-consumer checks.
  - working_mode: current_run
  - source_state: selected current Run
  - trigger: read its documents/history or capture its archive
  - expected_effective_state: same contained Run-specific material
  - visible_feedback: actual document/state paths or accurate missing-path diagnosis
  - blocker_failure_behavior: missing/escaped paths do not use old aliases
  - recovery_next_action: refresh or resolve the current contained source failure

- criterion_id: AC-004
  - requirement: Each current authoritative fact has one documented canonical owner; status/overview projections are derived. Repeated persisted data requires a named independent historical, review or recovery purpose.
  - observable_success: Recording changes the intended owner atomically and produces consistent derived status. Source/destination/digest facts are not maintained independently merely for multiple views. Distinct review assertions and necessary historical bytes retain their meaning.
  - required_evidence: SD ownership/retention mapping; recording and reader consistency tests; solution/code review against that mapping.
  - working_mode: current_run
  - source_state: valid canonical metadata
  - trigger: record a permitted update
  - expected_effective_state: atomic canonical fact with consistent projections
  - visible_feedback: same current state across readers
  - blocker_failure_behavior: an independent projection cannot supply competing authority
  - recovery_next_action: inspect/recover the original recording operation

- criterion_id: AC-005
  - requirement: The shipped runtime supports only the selected current layout and format generation per persisted record family. It has no Masterbacklog reader/writer/lock, historical-format fallback, conversion or migration execution path.
  - observable_success: In unsupported_store mode, inspection/operations explain the unsupported data and safe fresh-setup next action; bytes remain unchanged. No success-shaped empty inventory, automatic reset or implicit conversion. Missing/corrupt current data has a distinct accurate diagnosis.
  - required_evidence: Static dependency/command-surface review plus representative old-format and corrupt-current negative cases proving no mutation; no historical compatibility matrix.
  - working_mode: unsupported_store
  - source_state: old or unsupported persisted model
  - trigger: inspect or request an operation
  - expected_effective_state: unsupported state with unchanged bytes
  - visible_feedback: unsupported-model diagnosis and safe fresh-setup guidance
  - blocker_failure_behavior: no conversion, reset, mutation or success-shaped empty inventory
  - recovery_next_action: explicit separate safe initialization; corrupt current data follows its distinct diagnosis

- criterion_id: AC-006
  - requirement: CLI/MCP and passive Cockpit expose the same current planned/Run inventory and current paths; the legacy Cockpit view is removed.
  - observable_success: In planning/current_run mode, selecting and reading an item shows its actual state and allowed next action with no historical-mode switch. Unsupported/unavailable state is visible; recoverable transient reads offer refresh/retry. Cockpit remains read-only and no persistent replacement index is introduced.
  - required_evidence: Core projection, UI behavior and actual MCP document/inspection cases; visible current/error/refresh states.
  - working_mode: planning/current_run/unavailable_observation
  - source_state: selected item or failed/stale observation
  - trigger: inspect/select or explicitly refresh
  - expected_effective_state: same canonical item/state or honest unavailable result
  - visible_feedback: current inventory and actionable failure/retry; no legacy mode
  - blocker_failure_behavior: unavailable/unsupported state never becomes an empty successful inventory
  - recovery_next_action: visible deliberate retry/refresh or safe fresh-setup guidance

- criterion_id: AC-007
  - requirement: Existing deliberate approval and exact-document binding semantics survive the new paths/formats.
  - observable_success: In current_run mode, only a response to the exact valid presented material advances the existing gate. Reading, preparing or stale/replayed responses do not invent approval; changed material requires a new presentation/response. Necessary historical decision versions remain inspectable without current authority.
  - required_evidence: Positive and negative presentation/approval/version tests with unchanged human authority and protected-source assertions.
  - working_mode: current_run decision
  - source_state: valid current presented material
  - trigger: deliberate exact gate response
  - expected_effective_state: only the existing eligible gate advances
  - visible_feedback: recorded decision and next permissible step
  - blocker_failure_behavior: stale/read/prepared-only material grants no approval
  - recovery_next_action: refresh/re-present changed material and obtain a new deliberate response

- criterion_id: AC-008
  - requirement: Current-format operations retain idempotent original-UUID handling, consistent seals/bindings, bounded interruption recovery and independent Run concurrency. Historical recovery branches are absent.
  - observable_success: After a current operation is interrupted or times out, original-operation inspection/recovery yields one confirmed effect or an explicit unresolved state. Invalid/foreign journals fail without unsafe mutation. Independent Runs do not contend on a shared backlog/index lock.
  - required_evidence: Real process interruption/recovery, original-UUID replay and concurrent-Run tests, with integrity and foreign-file negatives.
  - working_mode: current_run recovery
  - source_state: pending or uncertain current operation
  - trigger: inspect/recover or replay the original UUID
  - expected_effective_state: one confirmed effect or explicit unresolved state
  - visible_feedback: current outcome and precise next action
  - blocker_failure_behavior: foreign/invalid journal refuses unsafe mutation; no shared backlog lock
  - recovery_next_action: continue exact supported recovery; retain uncertainty when unconfirmed

- criterion_id: AC-009
  - requirement: Templates, contracts, command help, optional planning integration, generated profiles/packages and affected automated tests describe/use only the supported model.
  - observable_success: A normally generated candidate works from a fresh store without source-checkout-only dependencies. Removed legacy commands/views are unavailable with clear guidance. Existing host scope remains; fresh native acceptance is bounded to Codex CLI and its exact candidate/client/platform.
  - required_evidence: Existing generation/integrity/package/compatibility checks, complete required exact-head CI and focused Codex CLI qualification; other adapter tests are not claimed as native host acceptance.
  - working_mode: delivery qualification
  - source_state: normally generated candidate and fresh store
  - trigger: run planned package/CI/native checks
  - expected_effective_state: evidenced current-model behavior within the tested boundary
  - visible_feedback: actual test results and candidate/client/platform limitations
  - blocker_failure_behavior: fixture/source success does not claim untested native hosts
  - recovery_next_action: resolve observed failures and rerun affected original conditions

- criterion_id: AC-010
  - requirement: A finite plan handles this governing Run and the affected development fixtures before persistence changes begin. No old-data migration or blanket cleanup is delivered.
  - observable_success: This Run's approved bytes, decisions and evidence remain attributable under its explicitly selected writer until closeout/retention is complete; new-model tests use fresh isolated stores. Unrelated data/worktrees remain unchanged. Any archival/reset operation is scoped and explicit, never a hidden product fallback.
  - required_evidence: Approved SD/TP self-hosting boundary; scoped preservation/retention evidence and fresh-fixture proof. No rewritten old approval history or permanent legacy runtime path.
  - working_mode: governing_run
  - source_state: approved old-writer governing context before storage changes
  - trigger: apply the SD/TP-defined finite closeout/retention boundary
  - expected_effective_state: attributable current Run evidence and isolated fresh candidate tests
  - visible_feedback: explicit scoped preservation/retention results
  - blocker_failure_behavior: no implicit resealing, blanket cleanup or permanent compatibility path
  - recovery_next_action: stop at an unproven boundary and resolve through its existing owner

## 6. Non-Goals

- Migration, automatic repair, continued validation or compatibility support for historical development layouts, old Run generations or old transaction journals.
- A new central backlog/index, planning product, gate sequence, permission or independent human identity proof.
- Deleting every apparent duplicate regardless of history/recovery meaning, or weakening current integrity and recovery to simplify storage.
- Unrelated code cleanup, new hosts, broad performance changes, global installation, release/publication or blanket removal of old worktrees/evidence/Git history.
- An interactive preview or fresh native testing of every supported adapter. Existing required CI and unchanged host scope still apply.

## 7. Users And Roles

Arndt Gold is PRD Owner and makes deliberate user-gate decisions. Contributors and agents operate the existing canonical control owners. Codex authors/reviews cooperatively; automated recording is not proof of independent human review. Core determines effective state; CLI/MCP and Cockpit present it, and Cockpit remains passive.

## 8. Constraints

- Preserve approved UR intent and current human gate semantics. PRD approval permits SD only; implementation still requires SD/TP approval and preparation.
- Exactly one supported current representation per record family may carry an explicit version marker. Version numbers need not be reset; supporting old and new variants in parallel is prohibited.
- Reuse current Core, command, inventory, transaction, presentation and package owners. Reject unsafe containment, symlinks, foreign writes and unverifiable effects under their existing safety boundaries.
- The normal generated payloads are the installable result. Preserve existing schema/payload budgets and the current 2500 ms cold / 1000 ms warm timing limits unless a separate explicit change is approved.
- Old stores may remain as development history but are not required to work with the new runtime. Any finite governing-Run writer exception is isolated from shipped/current-format support and has a defined exit.
- No irreversible cleanup, real project reset, global plugin installation or publication follows implicitly from this PRD.

## 9. Evidence Requirements

Plan current-format lifecycle and relevant negative cases from these criteria, with focused local checks first and complete mandatory exact-head CI before merge. Update affected existing fixtures rather than maintaining two layout suites. Reuse unchanged applicable evidence with its exact source/environment identity; do not relabel old results as new execution.

Prioritize real interruption/replay/concurrency tests for the changed persistence boundary and normal package-consumer tests for generated paths. Demonstrate the supported native path with Codex CLI only, naming the exact candidate, CLI version and OS. Core/adapter/CI observations on other platforms remain automated compatibility evidence, not fresh native host qualification. For passive Cockpit, planned visible-state and retry checks must support its behavioral claims; do not infer visual human acceptance from source inspection.

Current evidence is approved UR, source-based Brownfield Review and ready UX analysis only. No implementation, native session, preview or delivered performance improvement is claimed by this PRD. QA and UAT later state actual result, missing evidence and remaining risk separately.

## 10. Risks And Open Questions

- Path changes affect operation digests, seals, approved material and archive readers together. SD must choose one authority/retention scheme before code changes.
- The serving installed plugin still writes the governing Run under the old model. Keep that finite governance context separate from new-candidate qualification and define its exit; do not install/switch implicitly or invent migration support.
- Some repeated data is independent decision/recovery evidence. SD must distinguish required retention from current-state duplication, and TP must test original failure conditions.
- Recreating development fixtures can conceal regressions unless behavioral expectations and required negative cases are retained. Test selection follows claims, not file count reduction.
- Required Context Graph ownership reconciliation is tracked in the existing review and must complete before clean closeout; no new registry or memory-folder update.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Legacy support and old-data migration | before_prd | resolved | Approved UR adopts one current model, removes Masterbacklog and superseded-format support, and excludes old-store migration. Unsupported data is diagnosed without automatic mutation. | Arndt Gold, PRD Owner |
| Run folder and planning boundary | before_prd | resolved | All Run-specific material belongs to one runs/run-id folder; independent UR-only planning stays under planned. Exact subfolders remain design-owned. | Arndt Gold, PRD Owner |
| Native acceptance scope | before_prd | resolved | Proposed acceptance in this PRD is Codex CLI only for fresh native qualification; preserve existing host scope and required automated compatibility/CI without claiming other native tests. Acceptance of this row awaits this PRD's deliberate approval. | Arndt Gold, PRD Owner |
| Safe handling of unsupported stores | before_prd | resolved | Clear unsupported diagnostic; no conversion/reset/legacy view. Guidance permits separately and deliberately initialized fresh control at a safe location. | Arndt Gold, PRD Owner |
| Exact schema/path and metadata-retention design | later_sd | open | SD must identify one canonical owner per fact and required history/recovery records; no permanent alias/fallback path. | Solution Design owner |
| Governing-Run self-hosting and finite exit | later_sd | open | SD must define how the pinned governing writer finishes/retains this Run while new code operates only on fresh isolated stores, before implementation begins. | Solution Design owner |
| Scenario/fixture replacement and qualification sequence | later_tp | open | TP maps every criterion and SD decision to current-format scenarios, original failure conditions, package/CI checks and focused Codex CLI evidence. | Task/Test Plan owner |

## 11. Next Step

Present this PRD through the canonical prepare/deliver owner after recording/readiness. Approve only with `Approval: PRD`. Approval adopts these product criteria and native acceptance boundary, and permits SD drafting; it grants no implementation, cleanup, installation or release authority.

## AGDF Approval Summary (de; source=en)

- Ziel: Ein aktuelles Datenmodell und ein gemeinsamer Ordner je Run; Masterbacklog und dauerhafte Altformat-Unterstützung entfallen vollständig.
- Umfang: Core, CLI/MCP, Cockpit, Initialisierung, Planungshandoff, Persistenz, Pakete, Verträge und betroffene Tests; unabhängige geplante URs bleiben erhalten.
- AC-001: Neue Projekte erhalten genau das aktuelle Modell ohne Masterbacklog und parallelen Artefaktbaum; Konflikte werden nicht überschrieben.
- AC-002: UR-Planung startet keinen Run. Erst die ausdrückliche quellgebundene Übergabe erzeugt genau einen unfreigegebenen Run.
- AC-003: Alle Run-eigenen Dokumente, Zustände, nötigen Fassungen und Nachweise liegen im gemeinsamen Run-Ordner; keine alten Alias-Pfade.
- AC-004: Jede aktuelle Information hat einen kanonischen Owner; zusätzliche gespeicherte Daten brauchen einen eigenen Review-, Historien- oder Recovery-Zweck.
- AC-005: Nur aktuelle Formate werden unterstützt; alte Bestände werden klar und ohne automatische Änderung, Migration oder Reset abgewiesen.
- AC-006: CLI/MCP und lesendes Cockpit zeigen denselben aktuellen Bestand; keine Legacy-Ansicht, klare Fehlerzustände und ausdrückliches Aktualisieren.
- AC-007: Freigaben bleiben an die genaue vorgelegte Dokumentfassung gebunden; notwendige historische Entscheidungen bleiben nachvollziehbar.
- AC-008: Wiederholungen mit ursprünglicher UUID, Integrität, Recovery nach Unterbrechung und unabhängige Run-Schreibzugriffe bleiben erhalten.
- AC-009: Dokumentation, Pakete und Tests nutzen das aktuelle Modell. Frische native Qualifikation wird auf Codex CLI begrenzt; Pflicht-CI und automatisierte Kompatibilitätsprüfungen bleiben erforderlich.
- AC-010: Vor Umsetzung wird festgelegt, wie dieser steuernde Run abgeschlossen/aufbewahrt und betroffene Entwicklungsfixtures ersetzt werden; keine pauschale Datenlöschung.
- Entscheidungen: Der Schnitt ohne Altbestand-Migration ist durch UR vorgegeben. Dieses PRD legt zusätzlich die klare Diagnose bei alten Beständen und Codex CLI als frischen nativen Abnahmeumfang fest. Schema, Unterordner, Metadatenhaltung und der endliche Übergang dieses Runs werden im SD entschieden; konkrete Tests im TP.
- Grenzen und Risiken: Neue Implementierung und Hostnachweise stehen noch aus. Pfade sind Teil der Integritäts- und Freigabebindungen; die eigene Run-Ablage darf nicht still umgeschrieben werden. Kein globales Plugin-Update, Reset, Merge oder Release ist hiermit beauftragt.
- Nächster Schritt: Approval: PRD erlaubt das Solution Design; Umsetzung bleibt bis zu den weiteren Freigaben und Voraussetzungen gesperrt.
