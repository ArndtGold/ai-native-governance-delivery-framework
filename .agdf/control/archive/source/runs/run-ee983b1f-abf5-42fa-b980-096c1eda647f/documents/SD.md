# SD: One Run Folder And One Current Control Data Model

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-01
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Implement the approved clean cut in the existing Core persistence/command owners. Retain Markdown Run state and the current domain/evaluation APIs; introduce neither an event-store subsystem nor a second JSON state authority. Replace the two supported layouts with `run-folders-v1`, support Run state version 4 only, and put every Run-owned durable output beneath its existing Run directory.

```text
.agdf/control/
  config.json
  planned/{plan_id}/UR.md
  runs/{run_id}/
    RUN_STATE.md
    documents/                 UR, PRD, SD, TP, reports and closeout
    evidence/                  bounded attached test/qualification evidence
    control/
      presentations/           exact envelope/document/optional preview snapshots
      RUN_STEP_PENDING.json    only while a current transaction is pending
    history/
      planning/UR.md           immutable original handoff UR, when applicable
      revisions/{operation_id}/manifest.json and files/
```

The project-wide configuration, templates/contracts and curated context remain project/framework dependencies, not duplicated inside every Run. No top-level per-Run `artefacts/` container, Masterbacklog, symlink alias, fallback path or migration executor is part of the supported model.

Extend the existing `run-state-reader.js` path boundary into a small pure Run-path API used by creation, recording, seals, history, contained reads, transactions and consumers. It returns the above contained paths from a validated Run ID and explicit relative role; it does not discover a layout or probe old paths. Keep low-level containment/non-symlink checks in the existing contained-file owner. No new path registry or dynamic storage plugin.

The authoritative Markdown keeps identity/objective/mode and existing typed decision/binding/operation history. Current gate, approval status, current document pointers, artefact chain, evidence summaries and inventory are projected from those canonical facts by the existing parser/evaluation boundary. Stop separately persisting those derived tables as competing writable current state. Do not write a second generated state file; CLI/MCP/Cockpit render the derived view when requested. The shared parsed control object remains the consumer interface, so gate logic need not independently reconstruct storage facts.

## 2. Ownership And Source Of Truth

| Information | Canonical owner / storage | Derived consumers and retention treatment |
|---|---|---|
| Run identity, objective, lifecycle/revision and recorded route | Existing Run state repository/parser/writer; RUN_STATE.md | Run inventory and current control view are derived. Operation effects retain original revision transitions for replay/history, not another editable current header. |
| Current document content | documents/type.md, written by the existing eligible artefact/internal writer | Readers resolve the canonical path through the shared Run-path API; missing content never falls back to old trees. |
| Source/destination version and reviewed derivation | Existing Artefact Bindings record in RUN_STATE.md | Store the exact source/destination references once in that record, together with reviewer and reviewed attestation. Current document pointers/relationships derive from active bindings. Remove generated RECORD/REVIEW JSON files and their external-proof dependency. |
| Internal report applicability | Existing Evidence Bindings owner | Keep its source-set/applicability facts once; internal operation effects reference the binding identity instead of duplicating the full report mapping. Review decisions remain their existing authored reports. |
| Exact human gate decision | Existing Approval Operations owner and exact presentation reference | Current approval table is projected. Preserve immutable material-version/source snapshots as historical facts needed to prove what that decision saw; never claim independent human identity proof. |
| Original request, normalized input choices and result effect | Existing operation-family receipt owners and input-resolution seam | Receipts reference binding/document identities where the mapping already exists. Keep original UUID, logical/effective digest and effective configuration snapshot because replay must reconstruct the original request, not today's defaults. No separate universal request ledger. |
| Presented decision document | Existing presentation owner, under control/presentations | Envelope plus exact document bytes remain: one binds provenance/version, the other freezes what was presented. Their different responsibilities justify retention; snapshot checks must agree. |
| Planning origin | Current run.create_from_planned operation record | Retain plan ID/source identity and immutable history/planning/UR.md reference in the creation record. Remove the separate PLANNED_ORIGIN.json copy. Initial editable documents/UR.md may later change; the origin snapshot must not follow it. |
| Approved-source revision history | Existing source-revision/history owners, under history/revisions | Exact old bytes and manifest are immutable evidence only. Current source authority comes from current bindings/decisions, not the archive. |
| Pending current write | Existing Run transaction owner, control/RUN_STEP_PENDING.json | The journal contains the old/next bytes and identity needed for atomic publish/recovery. Remove it only through confirmed commit/rollback; it is neither an approval nor a durable second current state. |
| Planned/Run overview and Cockpit state | Existing planned inventory, Run inventory and scoped Cockpit projection/session owners | Always derive from canonical entries; no maintained central index, local browser state authority or global backlog lock. |

Identity/context fields repeated to bind an immutable receipt to its Run are not separate editable authorities. Likewise original-version snapshots and pending old/next bytes have a specific historical/recovery purpose. The reduction targets redundant current metadata and redundant request/proof files, not indiscriminate byte deduplication or a content-addressed blob store.

### Current format boundary

Each affected family has exactly one allowed current representation. Define its constant/schema beside its existing owning codec and export it for writers/tests; do not introduce a parallel compatibility registry.

| Family | Supported representation after the cut |
|---|---|
| Project layout | Explicit control_layout run-folders-v1; missing/old/unknown selection is not a fallback |
| Run state | control_state_version 4 only; former versions 2/3 rejected |
| Pending Run transaction | Version 7 only; no backlog field or historical operation codec |
| Artefact binding | Version 3 only; embedded reviewed attestation and canonical document references |
| General Run operation | Version 4 only; operation kind selects the current payload shape, not a historical schema |
| Approval operation | Version 4 only; exact current material/presentation binding |
| Presentation record | Version 7 only; complete current fields, relocated contained paths and supported optional current preview/deviation payloads |
| Source-revision proposal/receipt | Proposal version 3 / receipt version 4, retaining current policy 2 semantics and supported initiating phases without older policy branches |
| Source archive manifest | Version 2 only, with current history paths and byte digests |
| Input resolution | Existing resolved/1 wrapper and resolution version 1, with complete current active layout/configuration; no unwrapped historical-record fallback |

Other unchanged record families use their sole existing current shape. Remove historical alternatives and legacy-default field omissions from their owners as they are inventoried; do not renumber unchanged current structures for appearance. Current capability variants such as QA deviation acceptance or a requested preview are discriminated optional current behavior, not legacy versions to delete. The wire command schema stays at its existing contract version unless a genuinely changed operation requires its documented current shape; persisted format versions are not MCP protocol versions.

The resolved wrapper is produced at the common command-input boundary for CLI and MCP, including explicitly completed CLI inputs with no defaulted fields. An active captured configuration must name the current layout. Replay restores that original complete normalization and verifies its digests; it does not accept older wrappers/records by interpreting missing fields.

## 3. Architecture Decisions

- SDD-001: Use run-folders-v1 and Run state v4 with one shared contained Run-path API rooted at runs/run-id; rationale: the changed persisted path meaning must be unmistakable and every consumer must resolve the same owner; consequence: old stores are rejected and no alias/migration path is provided.
- SDD-002: Retain RUN_STATE.md as canonical state and derive current approval/document/chain/summary views from its typed records instead of persisting parallel current tables; rationale: reuse the existing state/parser/evaluator seam while removing competing metadata owners; consequence: parser/writer projections must change together and no second JSON state or new event store is introduced.
- SDD-003: Put reviewed derivation in one current binding record, remove RECORD/REVIEW files, reference applicability bindings from operation effects and keep immutable presentations/source snapshots only for their distinct purposes; rationale: source/destination facts need one authority while review meaning and original versions remain inspectable; consequence: proof validation and receipts change, so current binding/history checks must be reverified rather than bypassed.
- SDD-004: Use the single current codec per family and preserve current Run-local atomic journal/replay/recovery and independent locks; rationale: removing historical branches must not remove crash safety or exact original-operation handling; consequence: all current writers/readers use the same new schemas and invalid/foreign pending state remains fail-closed.
- SDD-005: Keep UR-only planning and explicit handoff, with origin authority in the creation receipt plus one immutable Run-local handoff snapshot; rationale: the planning requirement may evolve independently after the recorded transfer; consequence: eliminate the separate origin JSON but preserve stale-source, replay and duplicate-handoff guards.
- SDD-006: Remove the legacy Cockpit selector and all Masterbacklog/migration commands while keeping the existing scoped read-only projection/session boundary and accurate unsupported/stale/current diagnostics; rationale: UI and command behavior must expose only the supported model; consequence: former modes/commands are unavailable and recoverable read failures still offer deliberate retry.
- SDD-007: Finish this governing Run under its already matched frozen runtime and test the new candidate only on fresh isolated stores, with the old-writer exception ending at OR; rationale: self-hosted planning/evidence must not be silently rewritten or turned into a permanent migration facility; consequence: this historical store is intentionally unsupported by the new runtime and any actual repository reset/installation requires separate explicit authorization.
- SDD-008: Propagate through existing build/profile/package owners and qualify the exact new candidate with focused current-format tests, mandatory head CI and Codex CLI native evidence; rationale: source-only changes cannot establish package/host behavior; consequence: regenerate only affected evidence and report other adapters as automated compatibility observations, not fresh native host acceptance.

No external framework, library, API, service or major dependency version is selected. Existing in-repository Node/Core/CLI/MCP/React/SDK and build owners are the evidence for reuse; no new dependency or external technology lookup is required for these design choices.

## 4. Integration Points

### Current creation, recording and inspection

1. Project-state/initialization validates explicit current configuration and creates only current containers. Existing or partial state is never reinitialized implicitly. The initializer does not create MASTER_BACKLOG.md, a top-level per-Run artefacts tree or old legacy projection.
2. The Run repository stages/publishes a sealed v4 state and current owned subdirectories. Creation remains original-UUID-bound and idempotent. Explicit planning handoff adds its current operation record and immutable handoff UR snapshot atomically with the unapproved Run.
3. Eligible recording normalizes current input, locks the selected Run using the existing owned-file-lock protocol, verifies exact source/revision, and prepares the current binding/receipt plus document output. It uses one v7 journal, publishes under existing transaction boundaries and derives the updated control view. No request/proof files or shared summary write are produced.
4. Discovery validates only the configured current layout and v4 entries. Selected-run parsing validates current records and resolves the derived control object. Inventory consumes that shared object; it is not a second replay engine and does not read all foreign histories to service one selected Run.
5. CLI/MCP authoring-inputs, record, inspect, prepare/deliver, approval, revision and closeout all consume the same path/record owners. Update their current help/schema descriptions and registered resources. Remove obsolete layout migration and legacy-render/synchronization operations and compatibility aliases rather than returning success from no-op shims.

### Current decisions, history and seals

Keep existing command eligibility, expected revision, original UUID, deliberate response and cooperative-local assurance rules. New presentation envelopes and frozen documents live under control/presentations. Approvals bind the exact presentation and material identities under the current path contract. Viewing/preparing remains non-authorizing; changed material cannot inherit an earlier reply.

Use a single new current content-seal domain agdf-run-seal/2 and approval-seal domain agdf-approval-seal/4. Compute them through the existing seal owner from canonical Run facts and required current document/history identities; do not hash derived presentation tables as independent authorities or keep old-domain verification fallbacks. Seals remain consistency digests, not signatures or independent proof against deliberate tampering.

The current source-revision owner preserves policy 2 eligibility, exact preview/apply confirmation, invalidation and required reassessment. Its archive writer resolves all paths under history/revisions, freezes the original affected bytes and validates their manifests and current receipt links. It must not gain arbitrary relocation permission, reinterpret old archives or widen revision phases.

### Current failure and concurrency boundary

Retain existing per-Run lock ownership/reclaim rules and original-operation admission identity. Remove layout-cutover maintenance markers, legacy Backlog locks, migration receipts and migration-only admission scaffolding. Preserve the current Run/planning admission/foreign-write protections actually needed for independent writes and original-operation recovery; simplify the existing owner rather than creating a global exclusive replacement.

Pending journals must be rejected before write if foreign, malformed, unsupported or outside the selected Run. Publish and recovery revalidate containment, exact old/next digests, captured normalized input, revision and owner identity. Supported original replay has one effect; uncertainty is explicit. One Run's valid independent pending operation does not globally block another Run merely because its journal exists. Planning handoff retains its existing per-plan/Run uniqueness and source-bound commit checks.

### Cockpit and safe unsupported-state behavior

Core cockpit-contract/projection/session and React Overview/RunOverview continue as existing owners. Remove view legacy and the legacy Backlog overview code/data shapes; project planned entries plus current Runs from the existing derived inventory. Detail/document navigation resolves current paths. A stale/failed observation remains visible with refresh; invalid/unsupported control is never rendered as an empty successful inventory.

Diagnostics distinguish unsupported model/version, damaged current data, stale material and unavailable observation. The first gives safe fresh-setup guidance and no automatic conversion/reset. Unsupported legacy command invocations fail with current guidance and no write; they are not supported aliases. Native registration/tool discovery must use the generated current command catalog.

### Finite governing-Run boundary

This Run is governed by the already matched installed 0.20.2 writer (dispatcher digest 486b2c484bd60f5ffa3545518374da00c7b75fdc3e70ad90faac06131e86cf0a). Continue its approvals, quality records and OR with that exact runtime and original target identity. Source changes must not replace the serving runtime, edit its cache, move/reseal the Run or rewrite approved sources. If that runtime becomes unavailable or its proof changes, stop governance recording and report the concrete binding gap; do not synthesize a recovery receipt.

Build and exercise the new candidate in disposable fresh repositories/control stores with separate target identities and package/data locations. They are technical qualification fixtures, not replacements for this governing Run. Existing recorded approvals are not copied into them as fresh human decisions. Use the existing local candidate/CLI/native qualification seams; no permanent global plugin update is implied.

At this Run's normal UAT/OR closeout, its retained old-format store remains historical evidence at its existing checkout/path or in its eventual explicitly authorized VCS snapshot. The pinned-writer exception ends then: do not continue new work under old support or ship an old reader for that evidence. The new candidate intentionally rejects that old store. The primary checkout, other worktrees and other authored stores are not reset or archived wholesale by this Run. Any later actual fresh initialization/reset or installation is a separate deliberate action. This is a finite workflow boundary, not product migration or an excuse to preserve dual-format code.

## 5. Constraints And Compatibility

- Approved PRD digest e9f707c1a102f73a2e8e2e0b09951d06b0fac316c8f57adf806ced0d4a759064 is acceptance authority. Brownfield/UX inputs explain routing, not extra scope or approval.
- Only the current model and current record variants are accepted. Missing/old layout, Run v2/v3, historical journal/receipt formats and old paths receive explicit unsupported or invalid diagnostics with no mutation. No source-data migration utility or automatic rewrite is delivered.
- New path API, codec constants and parse/projection seam extend existing owners. Do not add a second discovery service, event log, current-state file, compatibility feature flag, runtime switch or central index.
- Preserve current source/approval semantics, canonical line-ending versus raw snapshot digest distinctions, path containment, byte/record bounds, protected-source immutability and ownership-specific recovery. Reference reduction is not permission to drop applicability/configuration facts.
- Retain supported current QA-deviation and required-preview behavior. Remove only historical variants, not current user capabilities whose payload happens to be optional.
- Preserve existing host adapter scope, schema/command payload limits, packaged integrity and performance budgets (cold p95 2500 ms, warm 1000 ms, 20/20 samples). Dependency/toolchain versions remain unchanged. No installation or release authorization follows from SD approval.
- Every removed public command/view and current path change must be reflected in contracts, help, templates, diagnostics and applicable tests. Historical accepted documents remain historical and are not silently revised to look current.

## 6. Test And Evidence Strategy

Assess existing behavior and fixtures before adding cases. Reuse the intent/assertions of current planned handoff, Run-only writes, process interruption, source revision, approval, closeout, Cockpit and package suites. Replace old-format positive fixtures with fresh current-model fixtures and remove the obsolete cross-layout compatibility matrix. Preserve representative unsupported-old negatives and malformed-current negatives because they establish different claims. An old pass is not new-format execution evidence.

Risk-based local checks during CD+Tests cover: fresh setup/path containment, canonical record/projection consistency, exact approval/material immutability, source-revision invalidation/history, current journal interruption/recovery/replay and independent Run concurrency, planned handoff uniqueness and scoped Cockpit current/error/refresh states. Use real process interruption where the current suite already provides it; assess original failure conditions and relevant side effects. No tests are executed or claimed passed by authoring this SD.

Before QA, normal generation/assembly, integrity, affected actual package consumers and compatibility freshness must establish the selected candidate. Refresh recorder-owned observations only when changed inputs require it; no handwritten derived proofs. Existing immutable fixtures and retained native observations remain separately labeled. Use targeted local checks and full mandatory exact-head PR/merge CI rather than an automatic additional full local regression.

Fresh native qualification is Codex CLI only on an exact candidate/client/OS tuple and fresh store: discover current commands, create/inspect a current Run, explicit planning handoff, read exact decision material, exercise representative current write/replay/recovery and observe unsupported-store rejection without mutation in a disposable old fixture. Use the existing harness and normal transport, not source imports as a substitute. Authentication/session availability is a qualification boundary; do not obtain credentials or claim a session that did not run. Other hosts retain automated adapter/CI checks without native acceptance claims. Cockpit visible-state tests support UI behavior; source/DOM/transport checks do not establish human visual acceptance.

TP must map every approved criterion and each SDD to concrete tasks/scenarios/expected results and evidence, including the finite governing-runtime boundary. Required checks/reviews complete before QA; actual limitations and risks survive QA/UAT. Exact-head required CI is a merge condition. Nightly/full-local work is additional only for a concrete uncovered claim. No universal new benchmark, proof registry or repeated test ritual.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Current explicit initialization and one-folder creation through shared contained paths | Core initializer/configuration and run-state-repository/path owner | SDD-001, SDD-004 | Old/partial setup rejected without overwrite; no inferred migration |
| AC-002 | Existing explicit handoff with current creation record and immutable Run-local origin snapshot | planned-handoff, planned-origin validation refactored to current creation proof | SDD-001, SDD-005 | Source drift, duplicate handoff and replay remain guarded |
| AC-003 | documents/evidence/control/history all contained in the selected Run; no old tree lookup | run-state-reader/path API, contained-file, history/presentation owners | SDD-001, SDD-003 | Paths participate in proofs and seals; all consumers use current contracts |
| AC-004 | Canonical typed bindings/records plus derived control views; no RECORD/REVIEW copies | state parser/projection, artefact/evidence binding and operation owners | SDD-002, SDD-003 | Reference reduction must retain distinct review/applicability/history facts |
| AC-005 | Single current codecs and explicit diagnostic rejection; remove legacy/migration paths | control-layout, owning codecs, command registry and diagnostics | SDD-001, SDD-004, SDD-006 | Intentional compatibility break with no mutation or automatic reset |
| AC-006 | One current derived inventory and scoped passive Cockpit current/error/refresh flow | run/planned inventory, cockpit-contract/projection/session and React views | SDD-002, SDD-006 | Removed legacy view and accurate unavailable state across all surfaces |
| AC-007 | Current exact presentation/approval records, source snapshots and new seal domains | approval, decision-material, presentation, source-history and seal owners | SDD-003, SDD-004 | No stale reply transfer, weakened source proof or implied human identity |
| AC-008 | Run-local v7 journal, original normalized input replay and independent owned locks | run-step-transaction, run-mutation, owned-file-lock, input-resolution | SDD-002, SDD-004 | Real interruption/foreign-journal and concurrency checks required |
| AC-009 | Existing generators/packages and current-only contracts/fixtures; bounded native qualification | sync/assembly/profile/compatibility and actual CLI/MCP/UI test owners | SDD-006, SDD-008 | Required head CI and Codex CLI evidence do not qualify other native hosts |
| AC-010 | Frozen governing writer ends at OR; new candidate uses fresh isolated targets; no reset/migration | Existing governing Run receipts and qualification owners | SDD-007, SDD-008 | Historical governing store is intentionally unsupported by new code; later installation/reset remains separate |

## 8. Risks And Open Questions

- Canonical state projection changes are tightly coupled to evaluator/source-proof consumers. The implementation-preparation analysis must inventory direct raw-table reads and migrate those current consumers to the single projection seam; leaving one reader behind is an implementation gap, not a reason for a fallback.
- Root-relative references stored in old evidence remain historical. New code must never repair them. Newly created current receipts and manifests must all use the current contained path contract and original digest semantics.
- Metadata reduction can lose review or evidence applicability if treated as cosmetic deduplication. TP needs positive and negative validation of each retained attestation, source set and original-input replay binding.
- The old installed writer can continue to update its own old Backlog while governing this Run. That fact does not qualify the new source model. The exception is bounded to this Run until OR, and new code contains no corresponding support.
- Old repository control is not silently made current. A source candidate may be accepted on fresh supported stores while this governing store remains historical/unsupported; later actual reset/activation is explicit. No clean status claim for the new runtime against this old store is permitted.
- Required Context Graph ownership update belongs to the existing run-scoped-control node when verified. Preserve the existing record/closeout boundary; do not create a new context registry or write Codex memories.
- Detailed task order, fixture inventory, selected interruption checkpoints and exact native candidate/version are TP/execution facts. No material design choice is left open before SD approval.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Current layout and path contract | before_sd | resolved | run-folders-v1, Run v4, shared pure contained paths; documents/evidence/control/history inside one Run; no aliases or old tree | Arndt Gold, SD Owner |
| State representation and projections | before_sd | resolved | Retain canonical RUN_STATE.md and existing parser/evaluator seam; derive current approval/document/chain/summary views without a second persisted state owner | Arndt Gold, SD Owner |
| Redundant request/review metadata | before_sd | resolved | Embedded reviewed binding attestation; remove RECORD/REVIEW files and separate origin JSON; retain distinct immutable snapshots/applicability/configuration proof | Arndt Gold, SD Owner |
| Current codec and recovery boundary | before_sd | resolved | Exactly the current family representations specified above, journal v7, original complete normalization and independent owned locks; no old codecs or cutover executor | Arndt Gold, SD Owner |
| Governing Run without migration | before_sd | resolved | Finish this exact Run under matched frozen runtime until OR; exercise new candidate only in fresh isolated targets; retain old evidence as historical and do not reset/install implicitly | Arndt Gold, SD Owner |
| Runtime and host technology | before_sd | resolved | Reuse current repository dependencies/protocols/build owners; no new framework/library/API/version and no extra global runtime manager | Arndt Gold, SD Owner |
| Exact task/scenario inventory and execution sequence | later_tp | open | TP assigns tasks and scenarios for every criterion/SDD, including source-proof consumer inventory and self-hosting stop conditions | Task/Test Plan owner |
| Exact qualification candidate and observed tool versions | later_tp | deferred | Capture actual candidate hashes, Codex CLI version/OS and executed checks during the planned qualification; no runtime result is preclaimed | Task/Test Plan owner |

## 9. Next Step

Record this design against the exact approved PRD through the current governing writer, validate design decisions and traceability, then prepare/deliver its bound presentation. Only `Approval: SD` permits TP drafting. Implementation, actual project resets, global installation and publication remain outside this decision.

## AGDF Approval Summary (de; source=en)

- Ziel: Ein gemeinsamer Run-Ordner und genau ein aktuelles Datenmodell; keine Masterbacklog- oder Altformat-Unterstützung.
- Umfang: Die bestehenden Core-, CLI/MCP-, Cockpit-, Planungs- und Paket-Owner werden gemeinsam auf die neue Ablage umgestellt; kein neuer Event-Store und keine zweite Zustandsdatei.
- SDD-001: Layout run-folders-v1 und Run-Version 4. Unter jedem Run liegen RUN_STATE.md, documents, evidence, control und history. V2/V3 und alte Pfade werden abgewiesen.
- SDD-002: RUN_STATE.md bleibt kanonisch. Aktueller Gate-/Freigabestand, Dokumentzuordnung und Übersichten werden aus den bestehenden typisierten Datensätzen abgeleitet statt mehrfach als aktuelle Tabellen gepflegt.
- SDD-003: Review-Aussage und Quellenbindung werden zusammen gespeichert. RECORD-/REVIEW-Dateien und die separate Origin-JSON entfallen. Exakte Entscheidungsfassungen, Quellenhistorie und erforderliche Replay-/Recovery-Daten bleiben erhalten.
- SDD-004: Je Datensatzfamilie genau ein aktuelles Format, Transaktionsjournal Version 7. Ursprüngliche UUID, Eingabeauflösung, Integritätsprüfung, gezielte Wiederherstellung und unabhängige Run-Sperren bleiben verbindlich.
- SDD-005: Geplante URs bleiben getrennt. Erst ausdrücklicher Handoff erzeugt einen unfreigegebenen Run; seine Herkunft liegt im Erzeugungsdatensatz und einem unveränderlichen UR-Snapshot.
- SDD-006: Cockpit und CLI/MCP zeigen nur das aktuelle Modell. Legacy-Ansicht, Masterbacklog- und Migrationsbefehle entfallen; alte, beschädigte und vorübergehend nicht lesbare Bestände werden unterscheidbar gemeldet.
- SDD-007: Diesen steuernden Run führen wir mit der bereits gebundenen Laufzeit bis OR zu Ende. Das neue Paket wird an frischen isolierten Beständen geprüft. Danach bleibt dieser alte Bestand historisch und für die neue Laufzeit unsupported; keine Datenmigration, stille Neusiegelung oder automatische Neuinitialisierung.
- SDD-008: Vorhandene Generatoren und Paketprüfungen weiterverwenden. Gezielte Funktions-/Unterbrechungs-/Concurrency-Tests, Pflicht-CI und frische Codex-CLI-Qualifikation belegen den neuen Kandidaten; andere Hosts erhalten dadurch keine neue native Abnahme.
- Entscheidungen: Ordner, Zustandsrepräsentation, Metadatenhaltung, aktuelle Formate und der endliche Übergang dieses Runs sind entschieden. Im TP folgen konkrete Aufgaben, Szenarien und Prüfreihenfolge.
- Grenzen und Risiken: Die Umstellung betrifft Pfade innerhalb von Freigaben, Seals und Historie; alle Leser und Schreiber müssen gemeinsam folgen. Noch keine Implementierung oder Hostqualifikation. Alte echte Projektbestände werden nicht automatisch umgestellt, andere Arbeitskopien nicht bereinigt und kein Plugin global installiert.
- Nächster Schritt: Approval: SD erlaubt den Task-/Testplan; Umsetzung bleibt bis Approval: TP und Vorbereitung gesperrt.
