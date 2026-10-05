# TP: Controlled source revision after approved TP

Status: draft
Gate: TP
Gate approval: open
Date: 2026-10-05
Owner: Codex (task/test author); Arndt Gold (TP approval)
Run: late-source-revision-20261005-01
Based on: exact approved PRD and SD
Traceability contract: criteria-chain-v1

## 1. Task List

All tasks and scenarios are planned, not completed. Codex executes them through existing
owners; this plan requests no subagents or cross-chat delegation. Arndt Gold retains human
gate and exact package-baseline decisions. Task 0 below is the existing post-TP Brownfield
Analysis, included in the execution plan without adding or moving a framework gate.

| task_id | task | owner | dependencies |
|---|---|---|---|
| T-000 | Perform post-TP implementation-preparation Brownfield Analysis; capture candidate/dirty-work baseline, protected hashes, exact approved inputs and all current-proof consumers before executable changes. | Codex, brownfield-analysis owner | Approval: TP |
| T-001 | Extend Core run-revision with strict bound proposal validation, shared earliest-source impact, pure preview and recomputation before late apply. Keep the old early entry compatible. | Codex, Core revision owner | T-000 |
| T-002 | Add append-only typed Source Revisions receipts, contained exact-byte archive closure and manifest/history validation within existing control-state ownership. | Codex, Core state/seal/proof owners | T-000, T-001 |
| T-003 | Propagate effective versus historical proof through all Core readers/writers/readiness and analytical routes; clear affected current authority and require renewed work evidence. | Codex, Core binding/gate/analytical owners | T-001, T-002 |
| T-004 | Extend the existing pending transaction with the versioned source_revision variant, archive-before-Run commit, bounded recovery and operation/request-bound replay. | Codex, transaction/writer owner | T-002, T-003 |
| T-005 | Add explicit CLI preview/apply/inspect/recover input and localized outcomes; expose consistent existing dispatcher/MCP observations without a new protocol write tool. | Codex, CLI/interaction/inspection owners | T-001, T-003, T-004 |
| T-006 | Build isolated source-chain fixtures and actual candidate Core/CLI/MCP behavior tests, including faults, competition, source replacement, renewal and no-mutation cases; register the new suites in existing verification. | Codex, Core/CLI/MCP test owners | T-001 through T-005 |
| T-007 | Update canonical contracts/docs, regenerate supported payloads, review exact file/byte growth and provenance, and prepare any necessary exact baseline proposal for a separate explicit maintainer decision. | Codex, contract/projection/distribution owners | T-006 |
| T-008 | Verify the actual complete candidate in an isolated checkout through focused tests and the existing shared repository/runtime plans; record candidate identity, package/runtime/performance results and platform limitations. | Codex, verification/evidence owners | T-006, T-007; any required exact baseline decision |
| T-009 | Review the actual diff for defects, architecture/clean implementation and Task Plan fulfillment; resolve findings and supply complete evidence to existing QA. Record mandatory CR only after actual review. | Codex, existing code-review/clean-implementation-review/task-plan-review owners | T-008; recorded CD+Tests before CR |

### Task boundaries and expected outputs

T-000 produces BROWNFIELD_ANALYSIS.md and IMPLEMENTATION_BASELINE.json under this run's
artifact directory. Recheck approved PRD/SD digests and selected run revision. Record HEAD,
branch, complete tracked/untracked dirty inventory, raw hashes of every candidate path before
change, original design run/artifact hashes and independent CI path hashes from
WORKSPACE_REVIEW_SNAPSHOT-01.json. Capture the current package baseline as evidence, not as
authority to change it. Inspect all binding/approval/source-revision/proof callers and pending
recovery reads. Dirty shared files from the SD-authoring implementation require an exact
starting-byte snapshot and isolated capability delta; independent CI edits must not be
incorporated or overwritten. Block before implementation if the approved design cannot be
realized within these owners or its exact input/protected hashes have changed unexpectedly.

T-001 targets packages/core/lib/control-state/run-revision.js and focused internal helpers
only where they keep the same owner. Define strict proposal/version/identity/impact validation
and deterministically computed source matrix. Preview must use read-only helpers and produce
the exact binding digest without archive, pending or Run writes. Apply validates concrete
reviewed intent and rechecks the same facts under locks; reason text alone is insufficient.
Keep the early PRD function's no-options contract and unsupported-boundary refusal.

T-002 extends existing control-state parsing, run-seal and writer guards for append-only
Source Revisions; a focused run-source-revisions.js helper may hold strict record/projection
logic. A focused run-revision-history.js helper may hold contained archive construction and
historical resolution. These are modules of the existing lifecycle owner, not new control
stores. Preserve raw Buffer bytes plus canonical text digests, original-path provenance,
required proof/presentation closure and exact pre-transition state. Pin manifest contents in
the sealed receipt; validate subordinate files against the manifest. Retain the exact prefix
of Approval Operations and Artefact Bindings. Reject missing/corrupt/unsafe/colliding evidence.
Do not recursively duplicate previous history; prior pinned closures remain verified.

T-003 targets artefact-bindings.js, artefact-binding-proof.js, run-artefact-recording.js,
run-relationship-correction.js, delivery-relationships.js, current gate/traceability/readiness,
presentation/approval and inspection/dispatcher services as identified by T-000. One shared
effective projection excludes invalidated binding IDs; the historical latest receipt still
defines append-only supersedes ordering. Reopened sources are unlinked/missing until freshly
recorded, even if old canonical files exist. Preserve exact valid upstream current proofs.
Invalidate affected analyses and current preparation/CD+Tests/CR evidence as designed; route
reassessment through existing owners and only retain analytical input with bound applicable
sources/reasoning. Test full source renewal so new binding append, fresh presentation and
new approval can work after canonical replacement. A necessary new authority rule, unsupported
gate transition or alternate acceptance owner requires source revision, not implementation
by interpretation. Do not revise the production design run in these tests.

T-004 targets run-step-pending.js, run-step-transaction.js, run-state-writer.js and the revision
operation. Retain version-1 transaction behavior; add a strict version-2 variant for this
operation using Run then Backlog lock order, contained intent and immutable owned history.
The Run atomic rename is the commit point. All writers/readiness must detect pending/unknown
state; read-only commands never reconcile it. Explicit recover proves old or committed state;
replay finds a matching sealed operation before ordinary stale checks without implying its
old result is still current. Fault checkpoints must exercise real writes/renames/fsync/error
paths, not a mock that merely returns a desired state. Recovered old/committed outcomes must
preserve source/code bytes, proof closure, receipt ordering and protected other-run state.

T-005 targets CLI command registry/parser/handlers, shared inspection/control results and the
existing interaction/locales owners. Implement only the approved additive run-revise modes,
source-gate/evidence/operation/preview-digest flags and strict exclusivity. CLI invokes the
shared Core owner; existing agdf_dispatch/agdf_inspect retain their write boundary and tool
inventory. Render proposed, committed, historical, refused/stale and recovery-required states
with identity, effective authority and next action. Test actual output for every registered
language, including supported fallback behavior; key presence alone is insufficient. No new
React UI or pixel/mock task is needed for this CLI/control change; actual output fixtures
provide its functional UX evidence. Preserve exact Approval formulas and terminal stop rules.

T-006 extends existing run-revision-test.js, run-step-transaction-test.js and
artefact-recording-test.js, with focused run-source-revisions-test.js and
run-revision-history-test.js where useful. Add packages/cli/scripts/late-source-revision-test.js
with a contained fixtures/late-source-revision.js helper and extend applicable existing
MCP continuation/inspection/protocol tests. Build valid approved source-chain fixtures through
actual canonical commands/services; mark all fixture approval replies synthetic. Do not
hand-forge approvals, revision receipts or seals to pretend an invalid state is valid.
Tampered fixtures are deliberate negative cases. Register meaningful suites in existing
package/smoke entrypoints; no test skip or weakened old assertion. Expected new test paths
are planned output paths, not claims that files already exist.

T-007 updates canonical gate-transition/interaction/revision documentation and affected CLI
help, state-format and architecture responsibility descriptions. Regenerate supported
Core/CLI/plugin/runtime/host/package projections with existing builders; do not manually edit
generated mirrors or installed caches. Produce PACKAGE_REVIEW.json and
PACKAGE_BASELINE_PROPOSAL.md only if actual inventory requires a decision: baseline digest,
candidate identity/input hashes, per-file canonical owner/generated origin, old/new file and
byte totals, original SD-authoring contribution, this capability's delta, duplicate/reuse
review and exact proposed totals with zero reserve. Generator refusal is recorded as failure;
its inventory may support review but is not successful guard evidence. No enforcement bypass.
Apply a package baseline change only after explicit approval of that exact candidate proposal;
then rerun all normal guards. TP approval alone does not approve an unknown numeric proposal.
The independent original design run remains unresolved under its own approved source rules;
this scope cannot claim its TP fulfilled or apply its source revision as a side effect.

T-008 records CANDIDATE.json, VALIDATION.md, BEHAVIOR_EVIDENCE.md, PERFORMANCE.json,
PROTECTED_PATHS.json and raw scenario/check logs. Candidate identity includes HEAD, canonical
changed-path/digest inventory, pre-existing shared/independent changes, generated inventory,
runtime/package digests, exact approved input digests, Node/platform and command outcomes.
Use a disposable copy/checkout of the complete current candidate with its required existing
SD-authoring changes; isolate its data directory. Include the already authorized independent
CI verifier bytes as baseline dependencies without attributing or editing them. Run the
shared verification plan there; do not confuse verify:commit's source Git-index snapshot
with uncommitted candidate evidence. No source-index staging or commit is authorized here.
Test packaged consumers from the candidate, not installed old runtime. If later explicitly
authorized staging creates a different index candidate, it requires its own exact verification.

T-009 produces CODE_REVIEW.md, ARCHITECTURE_REVIEW.md, TASK_PLAN_REVIEW.md and
DERIVATION_REVIEW.md in this run. Inspect actual complete capability diff against T-000
starting bytes, not just HEAD or test output. Verify current/historical proof separation,
one lifecycle owner, gate authority, contained archival and transaction/recovery correctness,
source traceability, scope and protected bytes. Identify missing scenarios/platform evidence
and unresolved failures. Resolve actual defects within approved scope and repeat only checks
affected by fixes. Code Review fulfills existing CR; architecture/clean implementation and
Task Plan fulfillment support existing QA without new approval gates. The existing QA owner
alone determines pass/revise/block; no QA/UAT/release outcome is claimed by this task list.

## 2. Verification Traceability

Scenario evidence below is planned under this run's artifact directory. Each log/result must
contain actual candidate identity, fixture operation/run/revision, observed outcome, before/after
digests and the command/service used. References map acceptance/design IDs without repeating
or renaming the approved product criteria.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-006 | SCN-001 | Valid preview returns complete computed impact; preview and cancellation leave Run, Backlog, approval, source and pending/history bytes unchanged. | logs/SCN-001-preview-cancel.json; late-source-revision CLI suite |
| AC-001 | SDD-007 | T-006 | SCN-002 | Actual CLI rejects missing/mixed late modes and never turns inspect or old early invocation into late apply. | logs/SCN-002-cli-mode-contract.json |
| AC-002 | SDD-001 | T-006 | SCN-003 | Four isolated valid source cases return UR/PRD/SD/TP respectively; known earlier impact contradiction and unknown assessment refuse. | logs/SCN-003-source-impact.json |
| AC-002 | SDD-003 | T-006 | SCN-004 | For all four cases only exact unchanged upstream approvals remain; affected approvals/pointers/chain are ineffective in fresh canonical evaluation. | logs/SCN-004-approval-matrix.json |
| AC-003 | SDD-002 | T-006 | SCN-005 | After actual renewed canonical source recording, historical raw bytes, canonical digests, mapping and presentation proofs verify against original identity; CRLF/BOM preservation is checked. | logs/SCN-005-history-after-replacement.json; history Core suite |
| AC-003 | SDD-004 | T-006 | SCN-006 | Missing required closure, symlink/traversal, foreign manifest, corruption or owned-name collision prevents commit with no effective authority change. | logs/SCN-006-archive-refusals.json |
| AC-004 | SDD-002 | T-006 | SCN-007 | Historical approval/binding receipts remain byte-identical and inspectable while malformed revision history prevents readiness and unauthorized writer edits are rejected. | logs/SCN-007-history-integrity.json |
| AC-004 | SDD-003 | T-006 | SCN-008 | Every enumerated current-proof consumer refuses invalidated/stale proof; new current recording can append a valid superseding binding and restore only its renewed source relation. | CURRENT_PROOF_CONSUMERS.json; logs/SCN-008-effective-proof.json |
| AC-005 | SDD-005 | T-006 | SCN-009 | UR reopening/new approval requires fresh post-UR Review/Mode and required UX before PRD readiness; old analysis cannot satisfy it. | logs/SCN-009-ur-analysis-renewal.json |
| AC-005 | SDD-005 | T-006 | SCN-010 | Exact unchanged later-source analytical inputs are retained with rationale; changed/unknown context or UX routes reassessment and blocks dependent readiness until ready. | logs/SCN-010-analysis-reuse-reassessment.json |
| AC-006 | SDD-003 | T-006 | SCN-011 | Old file presence, removed approval_by/derived_from, or old receipt cannot satisfy fresh approval readiness in any reopened source case. | logs/SCN-011-no-historical-authority.json |
| AC-006 | SDD-006 | T-006 | SCN-012 | Actual four-source renewal records the affected chain, new presentations and deliberate synthetic fixture replies; old reply/presentation and skipped gate attempts fail. | logs/SCN-012-renewal-e2e.json; synthetic-reply labels |
| AC-007 | SDD-005 | T-006 | SCN-013 | Newly approved TP routes to fresh preparation; previous CD+Tests/CR completion and green logs are insufficient for current fulfillment. | logs/SCN-013-preparation-evidence-renewal.json |
| AC-007 | SDD-006 | T-006 | SCN-014 | Revision/apply/recover leave code/test file hashes intact; retained work is mapped and checked under the renewed fixture TP before new completion/review evidence. | logs/SCN-014-retained-work.json |
| AC-008 | SDD-001 | T-006 | SCN-015 | Wrong target/run/revision/source, altered proposal/preview facts and contradictory earliest-source assessment refuse with concrete correction and no mutation. | logs/SCN-015-binding-refusals.json |
| AC-008 | SDD-004 | T-006 | SCN-016 | Pending/unknown transaction and damaged seal/archive/proof refuse ordinary writes/readiness; read-only inspection changes no files. | logs/SCN-016-pending-integrity-refusals.json |
| AC-008 | SDD-007 | T-006 | SCN-017 | Quick/verified/unapproved, awaiting CR, QA/UAT/OR, closed and historical states stay outside late eligibility; ordinary early behavior remains unchanged. | logs/SCN-017-lifecycle-boundaries.json |
| AC-009 | SDD-002 | T-006 | SCN-018 | Two successive reopened-and-renewed fixture revisions retain verifiable distinct archive closures without recursive byte duplication or receipt rewriting. | logs/SCN-018-successive-history.json |
| AC-009 | SDD-004 | T-006 | SCN-019 | Failure at intent, archive writes/sync, publication and pre-Run commit recovers exact old effective state, with only proven owned staging removed. | logs/SCN-019-before-commit-faults.json |
| AC-009 | SDD-004 | T-006 | SCN-020 | Failure after Run rename/directory sync, Backlog write and journal retirement reports unknown/recovery-required then proves one committed result without new Run revision. | logs/SCN-020-after-commit-faults.json |
| AC-009 | SDD-004 | T-006 | SCN-021 | Competing real processes commit at most once; identical operation replay is nonmutating, mismatched reuse refuses, and replay after later renewal distinguishes original result from current state. | logs/SCN-021-concurrency-replay.json |
| AC-010 | SDD-007 | T-006 | SCN-022 | No-options early PRD revision, existing version-1 pending recovery and adjacent lifecycle routes pass unchanged regression assertions. | logs/SCN-022-early-v1-compatibility.json; existing revision/transaction suites |
| AC-010 | SDD-007 | T-006 | SCN-023 | Assembled CLI/dispatcher and actual MCP dispatch/inspect agree on effective gate/missing authority/pending state; tool inventory remains agdf_dispatch/agdf_inspect with no new late write arguments. | logs/SCN-023-consumer-parity.json; MCP continuation/inspection tests |
| AC-010 | SDD-008 | T-007 | SCN-024 | Generated inventory has canonical owner/provenance; package/instruction/integrity checks enforce unchanged limits or the separately approved exact measured package baseline, with no reserve. | PACKAGE_REVIEW.json; any exact proposal/decision; logs/SCN-024-distribution.log |
| AC-010 | SDD-008 | T-008 | SCN-025 | Original design Run/artifacts and independent CI bytes remain identical to baseline; capability delta and known baseline contributions are attributable. | PROTECTED_PATHS.json; CANDIDATE.json |
| AC-011 | SDD-008 | T-008 | SCN-026 | Full actual candidate shared repository plan and packaged consumer verification pass, or exact failing stage and limitations block readiness; no staged-index or installed-runtime substitution. | VALIDATION.md; logs/SCN-026-shared-verification.log |
| AC-011 | SDD-008 | T-009 | SCN-027 | Actual diff/source derivation and all criteria/design/tasks/scenarios are reviewed with findings resolved or reported; cooperative/synthetic/native/independent claims are distinguished. | CODE_REVIEW.md; ARCHITECTURE_REVIEW.md; TASK_PLAN_REVIEW.md; DERIVATION_REVIEW.md |
| AC-010 | SDD-008 | T-008 | SCN-028 | Existing MCP cold/warm budgets pass unchanged; revision/history reads and lock contention are measured without relaxed thresholds or eager unrelated history work. | PERFORMANCE.json; logs/SCN-028-performance.log |
| AC-008 | SDD-007 | T-006 | SCN-029 | Rendered proposed/current/historical/refused/recovery outputs for every registered language show identity, effective authority and next action; unknown outcome has no success/approval invitation. | logs/SCN-029-localized-ux.json; actual CLI/card snapshots |

## 3. Test Plan And Candidate Qualification

First run focused Core tests with the existing Node 22 baseline: new revision/history suites
and affected existing run-revision, run-step-transaction, run-lock, artefact-recording,
control-state/traceability/approval and relationship tests identified by T-000. Run the
assembled CLI late-source suite and existing lifecycle, run-recovery, intake-continuation,
control-inspect, interaction-presentation, operational-localization and schema/transport
checks. Run applicable actual stdio MCP continuation/inspection/performance tests against
an owned candidate runtime fixture. A passing assertion against source text alone does not
satisfy a behavior scenario. Fixtures use contained disposable directories and independent
operation/run identities; no production run or historical native evidence is rewritten.

Do not run all checks repeatedly by default. Focused changes get meaningful focused checks;
once final assembled outputs and any exact package decision are settled, run the existing
shared plan once against the frozen complete candidate: node scripts/verify-ci.mjs in the
isolated repository lane on the available host, including preparation before MCP dependencies,
runtime checks, package contents/archives/consumers and smoke. Preserve its existing ordering
and enabled assertions; do not edit the protected verifier. Record any genuine baseline
failure separately without calling the new scope complete. A failed build is not waived by
passing new unit tests. Relevant fixes invalidate affected evidence and require reruns.

Platform qualification targets the existing agdf-guardrails matrix (read current matrix at
execution and record exact OS/Node lanes) and local macOS Node 22 for durable filesystem and
lock behavior. Candidate CI observations require the actual revision/digest; no push or CI
workflow launch is implicitly authorized by this TP. If a required remote lane cannot be
observed locally, record it unverified and let existing QA decide revise/block instead of
claiming cross-platform success. Newly needed CI/test wiring may use existing package/smoke
registration; changing verifier policy or independent CI files is outside this plan.

Performance includes existing cold tools/list p95 <=1500 ms and warm dispatch p95 <=1000 ms
with existing test sampling/output limits unchanged. In isolated revision fixtures also record
preview/apply/inspect/recover elapsed time and history file/byte/read counts for one and ten
successive valid revision cycles plus competing operations. Inspect unrelated active-run
status and confirm it does not read other runs' archived bytes; verify histories are not
recursively replicated. Additional diagnostic timings introduce no invented SLA or loosened
budget. Existing performance failure or unbounded/eager history growth blocks readiness and
goes back to the design owner if an architectural change is needed.

No live native-host/model claim is required or fabricated for protocol/source evidence.
If separately authorized native observation occurs, record exact installed candidate/version,
session/model/action and result independently. Otherwise native observation remains unverified.

## 4. Brownfield Scope And Protected Surfaces

Inspect the Core lifecycle modules and consumers named in approved SD before implementing;
extend reusable contained-file, digest, lock, journal, proof, localization and projection seams.
All added modules must stay inside those owners. Enumerate every latest-binding or historical
receipt reader in CURRENT_PROOF_CONSUMERS.json, with adoption/compatibility rationale and
observed scenario evidence; a missed writer/evaluator is a blocking authority defect.

Protect the original sd-definition-separation-20261004-01 UR/PRD/SD/TP and RUN_STATE, plus
docs/compatibility/HOST_COMPATIBILITY.md, docs/compatibility/evidence/facts.json,
docs/compatibility/evidence/snapshot.json, scripts/verification-test.mjs,
scripts/verify-commit.mjs and the pre-existing compatibility observation listed in the snapshot.
Check before and after capability work. Preserve pre-existing SD-authoring source edits when
shared files change and report each additional delta from its captured starting bytes.
The old payload-baseline bytes are retained until an exact later proposal is explicitly
approved. Neither a successful fixture revision nor Approval: TP changes production sources.

## 5. Out Of Scope

No application of the new revision capability to the production design run; no reapproval of
its UR/PRD/SD/TP or claimed fulfillment of its old package constraint. No expansion to late
QA/UAT/OR/closed/historical revision, general integrity repair, bulk migration, automatic
semantic classifier, new gate/approval formula, generic task conversion, new MCP write tool,
new frontend or alternate workflow/acceptance store. No changes to independent CI work,
instruction/context/performance assertions, installed caches, native evidence or release
versions. No commit, push, PR, installation or publication is authorized by this task plan.

## 6. Risks, Decision Points And Completion

An incomplete effective-proof migration, missing exact historical closure, unsafe archive,
partial authority change, stale/replay approval transfer, invalidated analysis bypass or
unrecoverable transaction is a blocking defect. A material source/design conflict returns
to its existing owner; it is not solved by weakening tests or broadening the late path.
Unknown package totals are not silently approved. Produce the concrete exact proposal and
finish all unaffected authorized work before requesting the required maintainer decision.

After TP approval and successful T-000, perform the approved execution and scenario work.
Record CD+Tests only with observed current candidate implementation/test evidence; it cannot
be not_applicable. Complete mandatory CR with actual review and provide architecture/task
fulfillment evidence before existing QA. QA alone decides pass/revise/block and its report
requires its own fresh human approval. This plan creates no review special gates.

Completion requires tasks and mapped scenarios evidenced, approved-source/protected bytes
preserved, actual assembled candidate checked, scope/derivation review complete and defects
resolved or truthfully blocking. Missing platform/native proof is identified explicitly.
At present this document is only a plan; none of these future behavior tests or reviews has
been performed by creating it. Record the exact TP-derived_from-SD binding, redispatch and
present the fresh current TP before requesting a new deliberate Approval: TP.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen Revisionsweg so umsetzen und prüfen, dass Quellenänderungen nach TP sichere neue Freigaben ermöglichen und alte Nachweise exakt erhalten bleiben.
- Aufgaben: T-000 ist die bestehende Brownfield-Vorbereitung. T-001 bis T-005 bauen Vorschau, Historie, wirksame Quellenprüfung, Transaktion und CLI-/Statusausgabe. T-006 erstellt tatsächliche Verhaltenstests; T-007 prüft Dokumentation und Pakete; T-008 verifiziert den Kandidaten; T-009 führt die Reviews vor QA durch.
- Abdeckung: Alle elf PRD-Kriterien und acht Designentscheidungen sind konkreten Aufgaben, 29 Prüfszenarien, erwarteten Ergebnissen und Nachweisdateien zugeordnet.
- Tests: Vier Quellenrücksprünge, alte gegenüber neuen Freigaben, Historie nach Überschreiben, Analyse-Wiederverwendung und erneute Prüfung, erhaltene Arbeit, ungültige Anfragen, Abbruch vor/nach Commit, Konkurrenz und Wiederholung werden tatsächlich ausgeführt.
- UX und Schnittstellen: Die tatsächlichen CLI-/Statusausgaben werden für jede registrierte Sprache geprüft. CLI, Dispatcher und bestehende MCP-Lesepfade müssen denselben wirksamen Zustand zeigen; ein neues MCP-Schreibwerkzeug entsteht nicht.
- Build und Nachweise: Der vollständige Kandidat wird isoliert mit dem bestehenden gemeinsamen Prüfplan und Paketverbrauchern geprüft. Alte Runtime, Git-Index und historische Logs ersetzen diesen Nachweis nicht. Plattform- und native Beobachtung bleiben ausdrücklich unterscheidbar.
- Paketgrenze: Erforderliches Wachstum wird mit Herkunft und exakten Datei-/Bytezahlen vorgelegt. Eine konkrete Grenzänderung braucht eine gesonderte ausdrückliche Entscheidung; TP-Freigabe genehmigt keine unbekannte Zahl und keine Reserve.
- Abschlussprüfungen: Code-Review, Architektur-/Clean-Implementation-Review und Taskplan-Erfüllungsprüfung stehen am Ende vor der bestehenden QA. Es entstehen keine zusätzlichen Freigabegates.
- Schutz und Grenzen: Bestehender Design-Lauf und unabhängige CI-Arbeiten bleiben unverändert. Keine automatische Revision dieses Laufs, keine Installation, kein Commit/Push und keine Veröffentlichung.
- Nächster Schritt: Approval: TP erlaubt zunächst Brownfield-Vorbereitung und danach die freigegebene Umsetzung mit Tests. Der Build und die neue Funktion sind derzeit noch nicht als erfolgreich nachgewiesen.
