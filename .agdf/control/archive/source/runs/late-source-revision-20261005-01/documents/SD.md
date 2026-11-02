# SD: Controlled source revision after approved TP

Status: draft
Gate: SD
Gate approval: open
Date: 2026-10-05
Owner: Codex (design author); Arndt Gold (SD approval)
Run: late-source-revision-20261005-01
Based on: exact approved PRD.md
Traceability contract: criteria-chain-v1
Decision readiness contract: sd-decisions-v1

## 1. Solution And Authority

Extend the existing Core source-revision owner rather than add a delivery workflow or a
new author skill. A late revision is a controlled lifecycle transition for one valid active
structured run at CD+Tests after approved TP. It revokes affected current authority, preserves
exact prior evidence and returns to the earliest changed source. It does not edit source
documents, approve their replacement, repair integrity or perform implementation work.

The approved PRD remains the only product acceptance source. This design references its IDs;
the history manifest and revision receipts below describe lifecycle evidence, not a second
requirements, decisions or acceptance registry. No production revision is applied to the
existing sd-definition-separation run by drafting or approving this design.

## 2. Existing Owners And Reuse

| Responsibility | Authoritative owner / affected source | Design treatment |
|---|---|---|
| Revision eligibility, impact and application | packages/core/lib/control-state/run-revision.js | Keep the early PRD boundary entry; add the bounded late operation and one shared impact model. |
| Exact writes, revisions and locks | run-state-writer.js, run-step-transaction.js, contained-file.js | Extend explicit writer validation and the existing pending transaction protocol; retain lock order and one Run commit point. |
| Approval provenance | approval-operations.js, run-presentation.js, run-seal.js | Preserve append-only receipts and presentation records; remove affected current approval rows only through validated revision. |
| Derivation history and current proof | artefact-bindings.js, artefact-binding-proof.js, delivery relationship evaluation | Preserve receipt chains; add a shared effective-binding projection informed by validated revision receipts. |
| Current gate, prerequisites and analytical routing | gate-policy.js, gate-check.js, existing dispatcher owners | Evaluate the revised Run, not file presence or historical success. Route invalidated analyses to their existing owners. |
| Source authoring and renewal | UR/PRD/SD/TP current-gate routes, run-artefact-recording.js | Fresh drafts, reviewed bindings and deliberate presentations/approvals; no source rewrite inside reopening. |
| Delivery evidence | existing Brownfield Analysis, CD+Tests, CR, QA owners | Retained work requires current-plan assessment, fresh preparation and relevant observed checks/reviews. |
| Consumer boundary | packages/cli/lib/cli/command-registry.js, parse-args.js, validation-handlers.js; shared dispatcher/inspection and MCP consumers | CLI invokes Core; other consumers show the same current state and history references. No new MCP write tool. |
| Distribution | existing plugin definitions, runtime/projection builders and package guards | Derive all host payloads from canonical sources; measure any unavoidable growth before an exact later baseline decision. |

The current run-step journal covers Run/Backlog/OR; it does not archive arbitrary source
bytes. The current binding reader selects the latest receipt, and its proof validator reads
the live canonical files. Neither behavior alone is sufficient for late revision. The design
extends these owners explicitly instead of treating old receipts as reconstructible archives.

## Architecture Decisions

- SDD-001: Keep one Core late-source-revision operation with a pure reviewed-impact preview and explicit apply; rationale: all consumers must share one eligibility and authority model; consequence: late application requires additive CLI input and cannot be inferred from status or gate approval.
- SDD-002: Store append-only source-revision receipts inside the canonical RUN_STATE and exact-byte evidence snapshots under its contained revision history; rationale: old approved content and provenance must survive canonical source replacement without a parallel authority store; consequence: history validation becomes an explicit shared seal/proof obligation.
- SDD-003: Derive effective approvals, relationships, artifacts and step evidence from validated invalidation plus subsequent current recording; rationale: an intact historical receipt must not satisfy current readiness; consequence: every current proof consumer must use the same projection rather than independently select the latest historical receipt.
- SDD-004: Extend the existing transaction journal with a versioned source-revision variant, staged immutable history and Run as commit point; rationale: exact evidence must exist before authority is revoked and recovery must identify one committed result; consequence: failure, durability, concurrency and replay paths require actual fault evidence and cannot use generic run-update as a substitute.
- SDD-005: Reassess analytical applicability using exact approved upstream sources and explicit reviewed change facts, with fresh post-UR routing and post-TP preparation where required; rationale: obsolete assumptions must not survive while valid bounded analysis can be reused; consequence: missing or changed assumptions route to existing analytical owners before downstream readiness.
- SDD-006: Keep source authoring, presentation and approval separate from reopening and retain implementation files without completion carryover; rationale: the transition grants no replacement acceptance or implementation permission; consequence: renewed gates and current-plan evidence remain mandatory.
- SDD-007: Preserve the old no-options PRD-at-SD behavior and expose late lifecycle through additive run-revise modes only; rationale: compatibility and the existing MCP read/control boundary must remain visible; consequence: old installed runtimes honestly reject unsupported late arguments and no new protocol write capability is claimed.
- SDD-008: Qualify the assembled candidate with exact source derivation, negative and recovery scenarios, protected-work hashes and measured package evidence; rationale: structural readiness and synthetic replies cannot establish actual behavior or independent human/native-host proof; consequence: full validation and any exact distribution baseline decision belong to the approved TP and existing review/QA route.

## 3. Reviewed Proposal And Consumer Contract

The late CLI surface extends run-revise with mutually exclusive preview, apply, inspect and
recover modes. Invocation without a late mode preserves the existing early PRD path and its
existing refusals. New inputs are validated before dispatch; do not overload the existing
approval --gate or --response flags.

| Mode | Required late inputs beyond existing dir/run/revision | Effect |
|---|---|---|
| --preview | --source-gate UR/PRD/SD/TP, --evidence contained proposal JSON, --operation UUID | Read-only impact plus preview digest; no presentation, Run revision, archive or pending journal write. |
| --apply | Same source gate, evidence and operation, plus --preview-digest | Recompute and verify exactly the reviewed preview; perform one validated transition. |
| --inspect | --operation UUID | Read-only operation/current/history result; never recover, approve or silently revise. |
| --recover | --operation UUID | Explicit bounded reconciliation of this existing pending revision operation; never a new revision proposal or integrity repair. |

Inspect/recover use revision as the expected observed state; inspect may return a stale
observation and the actual current identity without mutation. Recovery accepts only the
journal's old or committed revision, not an arbitrary current revision. Terminal outcomes
from the existing dispatcher keep their existing stop rule.

Proposal schema version 1 contains target_id, run_id, expected_revision_id, operation_id,
source_gate, concrete reason, intended_change, exact current source references, and one
impact_assessment. The assessment names the reviewer, earliest changed source, each
unchanged upstream source with exact digest and semantic reuse rationale, affected analyses
with retain/reassess disposition and reason, implementation/evidence impact, and resolved
versus unresolved source-owner questions. It is cooperative reasoning, not independent human
proof. Unknown, contradictory, empty or unsupported fields make the proposal inapplicable.

All identities must match CLI binding. Core owns the four-source dependency matrix and
computes preserved/superseded approvals, invalidated relationships, artifact/step dispositions,
and required next action. A caller cannot choose a smaller invalidation list. Preview binds
the proposal's canonical JSON digest, operation identity, actual approved sources, complete
current Run/seal, current relevant proof/presentation closure, computed impact and versioned
contract. Changing any of these facts requires a new preview. The digest is not a human
approval token and does not establish semantic completeness.

An unambiguous explicit maintainer request authorizes applying this reviewed proposal. A
preview, source selection, file discovery or old Approval reply does not. The agent shows
the concrete impact first; where intent is already explicit it proceeds without adding a
new ritual approval gate. Unclear material scope goes to the earliest source owner.

The localized result shows selected run/current revision, proposed or committed status,
changed source, retained/superseded approvals, historical evidence, required analysis/work
revalidation, missing decision and next allowed step. Refusals include concrete reason and
correction. Unknown commit outcome shows recovery required, never an approval prompt or
success. Cancellation before apply performs no lifecycle call; cancellation after commit
cannot restore old approvals.

## 4. Exact History And Effective Evidence

Use a strict version-1 Source Revisions section in RUN_STATE with append-only typed receipts.
An absent section means existing semantics, preserving old runs. A malformed present section
blocks evaluation and writing. Each receipt contains operation/target/run identity, request
and preview digests, old/resulting revision, source gate, computed invalidation, retained
upstream bindings, analytical dispositions and a contained archive-manifest reference/digest.
Writers assert the exact prior receipt prefix; only validated late apply may append one.
Ordinary update, approval, source recording or recovery cannot fabricate or rewrite this list.

Evidence resides under .agdf/control/runs/this selected run/revisions/operation UUID/, with
paths constructed from the bound actual run and operation, never caller-controlled roots.
The manifest records original relative path, logical role, byte length, raw-byte SHA-256,
existing canonical-content digest where applicable, and contained snapshot path. Preserve:

- the exact pre-transition RUN_STATE, complete approval and artefact receipt history;
- all current approved source artifacts and their transitive mapping/source proof closure;
- referenced prepared presentation envelopes, including the exact records proving approvals;
- current analytical/evidence artifacts that the transition invalidates, and the reviewed proposal.

Retained upstream source copies are evidence redundancy for historical verification only.
Existing historical closures remain pinned by their earlier receipts; validate them rather
than recursively duplicate prior archive trees. Referenced required files must be present,
regular, contained and nonsymlink; unresolvable, unsafe, oversized according to existing
control-input limits, or inconsistent proof blocks before application. No placeholder history
or just a stored digest substitutes for actual bytes. Archive creation uses exclusive files,
buffer-preserving writes and durability checks; existing same-operation content must match
exactly or be rejected, never overwritten.

The manifest and receipt are covered by the current Run seal, and shared history validation
checks raw files against the pinned manifest. This is local integrity detection, not a
cryptographic signature or tamper-resistant independent audit. A historical resolver may
verify an original receipt/presentation against its exact archived original-path bytes, but
cannot make it current. Historical records are displayed with original revision and explicit
superseded/evidence-only labels.

Application preserves Approval Operations and Artefact Bindings verbatim and append-only.
It clears affected current approval/Gate Checklist rows and current artifact/chain pointers;
old canonical files remain on disk, but are unlinked from current readiness. UR's approved_by
relationship is cleared when UR changes. Incoming affected PRD/SD/TP relationships and their
binding IDs are invalidated, including the earliest changed destination. Unaffected upstream
proof remains exact and effective. Old mapping files remain immutable historical evidence.

The shared effective-binding projection excludes IDs invalidated by a validated revision
receipt. A later reviewed binding at a renewed gate remains append-only and supersedes the
last historical receipt of that relationship, but becomes effective only with valid current
source/destination proof. Historical order and current eligibility are separate predicates.
Seal checking, relationship readiness/correction, exactApprovedArtefacts, artefact recording,
presentation, approval, dispatcher and inspection consume this same projection. No remaining
latest-receipt reader may implicitly authorize a superseded relationship. For an unlinked
reopened artifact the new draft is recorded as new current work, not as an arbitrary change
to a still-approved old destination.

## 5. Transition, Analysis And Work Preservation

Late eligibility requires a valid sealed active structured_slice or structured_delivery Run
whose evaluated current step is CD+Tests, with exact approved durable UR/PRD/SD/TP and valid
current derivation, routing and required preparation. CD+Tests may be pending or in progress;
a completed implementation state waiting for CR, QA/UAT/OR authority, closed/historical
state, existing pending transaction, unsealed/damaged provenance or unsupported mode is
outside this first path. Refuse before archive or authority mutation; do not normalize a
damaged state into eligibility. The early path retains its original narrower boundary.

Core applies the PRD source matrix exactly. All affected source pointers become missing and
their approvals cease to be current; authoring can subsequently replace the canonical file
because its exact previous bytes have been archived. The evaluated next source gate is UR,
PRD, SD or TP. The result must agree with Run meta, control card, missing approval and allowed
actions; validated current upstream proofs remain required at every downstream recording.

For UR changes, invalidate old Brownfield Review, Mode/Slice and required UX state. After a
new UR approval, existing post-UR analytical routing runs afresh before PRD. For later sources,
the reviewed assessment either retains exact-source analytical applicability or marks the
affected analysis as pending. Reuse is not a free-text bypass: bind each retained input and
unchanged upstream source, require a concrete rationale and no conflicting known facts.
Changed need, product behavior or acceptance returns to UR/PRD, never an SD/TP-only shortcut.
Changed analytical context/authority/ownership/UX or unknown applicability invalidates the
affected analytical result and routes to its existing owner before authoring/readiness that
depends on it. A UX reassessment remains an internal analysis under approved UR; no new user
gate or product authority is added. Required incomplete analysis blocks the dependent gate.

Every late source revision invalidates current pre-implementation Brownfield Analysis,
CD+Tests and CR fulfillment. Their old files/observations remain historical. After renewed
TP approval, perform fresh preparation. The Task Plan fulfillment assessment identifies
retained code/tests that still satisfy renewed tasks and records relevant fresh test/review
evidence for the actual candidate. Reopening does not delete, reset Git, mark tasks complete,
approve QA or promise that prior green checks remain sufficient. Existing mandatory CR and
sole final QA decision remain unchanged. No generic automatic task conversion is added.

## 6. Atomicity, Recovery And Replay

Extend RUN_STEP_PENDING with a strictly discriminated version-2 source_revision journal;
version-1 Run/Backlog/OR behavior remains supported unchanged. Do not create a second journal
or recover without an explicit mutating command. The sequence under existing Run lock then
shared Backlog lock is:

1. Re-read exact Run/revision/seal, source/proof closure, proposal and recomputed preview.
   Reject identity, lifecycle, semantic-assessment or concurrent change before staging.
2. Prepare deterministic new Run content/receipt, next revision and Backlog projection.
   Persist intent with old/new identities, proposal digest, intended manifest and owned
   staging/final archive locations. Journal paths are derived and validated, not trusted input.
3. Stage and sync exact immutable closure; verify all raw/canonical digests and old current
   source facts again. Publish the verified history directory before Run authority changes.
   Uncommitted archive content grants no authority and is not shown as effective history.
4. Atomically write/seal the new Run through the explicit validated revision writer. Its
   rename is the commit point. Sources/code remain unchanged. Update Backlog from old to
   exact intended projection and finish the journal only after reconciliation checks.
5. Return reopened/current gate and missing approval only after one valid committed outcome
   is proven; a post-rename error returns recovery required even if a revision is discoverable.

The writer accepts an appended source-revision receipt only from this validated operation,
with matching old/new revision, preserved approval/artefact operation prefixes, permitted
approval reset and exact archive/proof integrity. An unrestricted allowApprovalChange flag
is not a substitute for validation. All other writers reject a pending revision journal.
Read-only evaluation detects pending/unknown state and closes readiness; it does not repair.

Recovery proves either the exact old Run/Backlog plus unchanged original sources, or the
exact committed next Run/receipt, valid archive closure and old-or-intended Backlog. Before
commit, remove only provably operation-owned staged/uncommitted history and retire intent;
effective authority remains old. After commit, preserve history and finish the exact pending
Backlog projection without another Run revision. Unexpected file/Run/Backlog contents stay
recovery required and go to the existing integrity owner. Never fabricate missing archive
content after sources might have changed. A durability failure after rename is reconciled
by reading the commit point; no claimed rollback based only on a thrown exception.

Operation UUID plus canonical request digest is the replay identity. A completed matching
operation is resolved from the sealed receipt, returning its original effect and separately
the now-current state, without committing again. Reusing an ID with different facts is
refused. Replay recognition precedes ordinary stale-revision rejection, but never claims
that the historical resulting revision is still current or authorized. Concurrent different
operations based on the same revision yield at most one commit. Recovery retry cannot act
as a new apply or overwrite a competing valid change.

## 7. Compatibility, Distribution And Evidence

CLI owns invocation; Core owns the operation and shared projections. gate-check and existing
MCP dispatch/inspect surfaces observe revised effective state, pending recovery and supported
next routes using existing services. They do not gain a new write tool or late apply argument.
Human/agent operation remains a trusted local CLI invocation; the protocol-only consumer
states that limitation explicitly. Existing supported bound continuation still follows its
normal current-gate writer rules. Equivalent observation means matching current gate,
approvals, missing prerequisites and history status, not identical textual presentation.

No bulk migration is required: absent source-revision records use legacy behavior. Generated
surfaces consume canonical definitions and runtime sources. Already pending version-1 steps,
early PRD revisions and adjacent lifecycles require regression coverage. Do not silently run
new files through an old installed runtime or repair its cache; installation is separately
authorized. The in-progress SD authoring implementation may share source files but its run,
approved artifacts and independent CI work remain protected, with baseline hashes verified.

The design chooses existing locks/writers and a subordinate exact-byte archive despite the
additional proof and payload cost: avoiding archives would violate the approved historical
content requirement. Avoid repeated history replication, eager archive reads on ordinary
unrelated status, duplicate instruction prose, new broad MCP schemas or a new runtime store.
Performance qualification measures impacted reads/writes, repeat history and contention;
existing performance/instruction/context/integrity guard assertions stay enabled.

No numeric package baseline is changed in this design or invented before the candidate exists.
TP must specify exact candidate assembly and file/byte inventory review. If necessary growth
remains after reuse/size review, propose its exact measured baseline, without reserve, for an
explicit maintainer decision before application. Otherwise retain the prior baseline. The
original SD run's strict approved constraint is not superseded by this run's approval.

Evidence must include actual four-source application/renewal, exact historical reconstruction
after source replacement, refusal/no-mutation, early compatibility, analytic reuse/reassessment,
current work revalidation, faults before/after commit, concurrent apply and replay. Test the
actual assembled CLI and applicable MCP/dispatcher consumers; source assertions alone are
insufficient. TP owns concrete tasks/scenarios and evidence files; existing code/architecture/
task fulfillment review and sole QA determine delivery quality. Synthetic gate replies are
fixture evidence only; cooperative mapping/review is not independent human approval. Fresh
native host/model observations require actual separately recorded observation.

## Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Pure bound proposal/impact preview and cancel, recomputed digest before apply. | Core run-revision impact service; approved PRD and reviewed proposal | SDD-001, SDD-007 | Preview does not mutate; explicit intent and exact identity remain required. |
| AC-002 | Shared earliest-source matrix and validated approval/pointer reset with known semantic-conflict refusal. | Core revision owner and current gate policy | SDD-001, SDD-003 | Cooperative earliest-owner assessment cannot prove universal semantic completeness. |
| AC-003 | Raw-byte archive closure, immutable pinned manifest and original-path historical proof resolver. | Sealed Run Source Revisions and subordinate exact evidence archive | SDD-002, SDD-004 | Current canonical digests alone do not preserve bytes; missing archive blocks commit/recovery. |
| AC-004 | Effective-binding projection excludes invalidated receipts and requires renewed current proof. | Shared Core binding/seal/readiness/approval services | SDD-002, SDD-003 | Every active-proof consumer must adopt the projection; historical chains remain inspectable. |
| AC-005 | Fresh UR routing, reviewed exact-source later analysis reuse or reassessment, fresh post-TP preparation. | Existing Brownfield/UX owners and bound analytical dispositions | SDD-005 | Unknown or materially changed assumptions cannot retain stale analytical authority. |
| AC-006 | Existing current-gate author/record/present/approve flow with no approval transfer or new gate. | Existing authoring, presentation and human approval owners | SDD-003, SDD-006 | Old replies, pointers and historical receipts cannot satisfy renewed readiness. |
| AC-007 | No implementation-file mutation; clear old completion and revalidate retained work against renewed TP. | TP fulfillment, Brownfield Analysis, CD+Tests, CR and sole QA owners | SDD-005, SDD-006 | Retained logs remain history and cannot imply current-plan completion. |
| AC-008 | Strict identity/lifecycle/proof/path eligibility and actionable localized refusal before mutation. | Core revision validation and existing integrity/recovery owners | SDD-001, SDD-004, SDD-007 | Damaged/unsupported states are refused; read-only inspect never repairs them. |
| AC-009 | Versioned existing journal, staged durable archive, one commit point, explicit recovery and idempotent request identity. | Run/Backlog transaction and source-revision receipt owner | SDD-002, SDD-004 | Durability/concurrency/replay correctness needs actual failure injection evidence. |
| AC-010 | Compatible early CLI, shared current observations, unchanged protocol write boundary and guarded exact package review. | Core lifecycle, CLI, dispatcher/inspection and canonical generators | SDD-007, SDD-008 | Old runtimes refuse late modes; exact growth and independent dirty work remain constrained. |
| AC-011 | Actual assembled consumer scenarios and reasoned derivation, with explicit cooperative/synthetic/native limits. | TP evidence plan and existing review/QA decision owners | SDD-008 | Structural readiness is not execution, independent approval or fresh native-host proof. |

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDQ-001: Current versus historical authority | before_sd | resolved | Append sealed revision receipts; pin exact evidence closure; shared effective projection invalidates affected current proofs without deleting history. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-002: Atomic application and interruption | before_sd | resolved | Extend existing pending protocol with versioned source_revision, immutable archive before Run commit, explicit old/committed recovery and request-bound replay. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-003: Analytical and retained-work treatment | before_sd | resolved | Fresh UR routing and TP preparation; exact-source reviewed later analysis reuse or owner reassessment; no inherited implementation/CR completion. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-004: Public operation and compatibility | before_sd | resolved | Add explicit preview/apply/inspect/recover CLI modes with distinct source-gate and evidence inputs; keep early default and no new MCP write surface. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-005: Delivery evidence and package constraints | before_sd | resolved | Actual candidate qualification and protected hashes; unchanged guard assertions; any necessary exact measured baseline proposal requires explicit later maintainer decision with no reserve. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-006: Concrete execution and qualification inventory | later_tp | open | Select bounded implementation tasks, exact fixture/fault/platform scenarios, evidence locations and package measurement procedure for these fixed design decisions. | Codex (TP author); Arndt Gold (TP approval) |

## 8. Risks And Next Step

No unresolved product or architectural choice is deferred past SD. The main delivery risks
are incomplete current-proof consumer propagation, archive closure/recovery corruption,
runtime version mismatch, package growth and unobserved platform durability. TP must assign
specific verification and evidence owners for them. This is a design proposal, not implemented
functionality or a successful build. Record the reviewed SD-derived_from-PRD relationship,
redispatch, present the fresh exact SD and wait for a new deliberate Approval: SD.

## AGDF Approval Summary (de; source=en)

- Lösung: Der bestehende Revisionsweg erhält eine unverändernde Auswirkungsvorschau und ein ausdrücklich gebundenes Anwenden für gültige aktive Umsetzungsläufe nach TP.
- Verantwortung: Core entscheidet Zulässigkeit, Quellenwirkung und wirksamen Zustand. Bestehende Autoren erstellen neue Artefakte; der Mensch erteilt jede erneut erforderliche Gate-Freigabe.
- Historie: Exakte alte Inhalte, Freigaben, Präsentationen und Quellenbelege werden vor dem Zustandswechsel gesichert. Sie bleiben prüfbar und werden ausdrücklich als historische Nachweise dargestellt.
- Quellenwirkung: Ein gemeinsamer Prüfschritt trennt historische von aktuell wirksamen Belegen. Betroffene Freigaben, Artefaktverweise und Erfüllungsnachweise werden abgelöst; gültige vorgelagerte Freigaben bleiben erhalten.
- Analyse und Arbeit: Geänderte UR erhält neue Brownfield-Routenwahl und erforderliche UX-Analyse. Spätere Änderungen brauchen belegte Analyse-Wiederverwendung oder erneute Prüfung. Code bleibt erhalten; nach neuem TP folgen frische Vorbereitung und aktuelle Test-/Reviewnachweise.
- Sicherheit des Zustandswechsels: Der bestehende Transaktionsweg wird erweitert. Die Historie liegt vor dem Run-Commit vollständig vor; Abbruch, Konkurrenz und Wiederholung werden über einen gebundenen Vorgang abgeglichen.
- Schnittstellen: Die CLI erhält ausdrückliche Vorschau-, Anwenden-, Inspektions- und Wiederherstellungsmodi. Frühe PRD-Revision bleibt kompatibel. Dispatcher und MCP sehen denselben wirksamen Zustand; es entsteht kein neues MCP-Schreibwerkzeug.
- Entscheidungen: SDD-001 bis SDD-008 legen Zuständigkeit, Vorschau, exakte Historie, wirksame Quellen, Transaktion, Analyse-/Arbeitsbehandlung, Kompatibilität und Nachweise fest. Konkrete Aufgaben, Szenarien und Plattformnachweise folgen im TP.
- Risiken: Quellenprüfungen müssen überall denselben wirksamen Stand nutzen. Archive und Wiederherstellung brauchen tatsächliche Fehlerfalltests. Paketwachstum wird exakt gemessen und vor einer Grenzänderung ausdrücklich entschieden, ohne Reserve.
- Grenzen: Noch keine Implementierung, kein erfolgreicher Build-Nachweis und keine Änderung der Paketgrenze oder des bestehenden Design-Laufs. Approval: SD erlaubt zunächst die Erstellung des Task-/Testplans.
