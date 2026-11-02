# PRD: Controlled source revision after approved TP

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR and completed Brownfield/UX analyses
Date: 2026-10-05
Owner: Arndt Gold
Run: late-source-revision-20261005-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver a reusable, explicit revision path for an active, valid sealed structured run at
CD+Tests after approved TP. A maintainer reviews the change's impact, requests application
against one exact current run revision, and returns the same run to the earliest approved
source gate whose meaning must change. Existing gates and their human approval authority
remain the only way to approve revised requirements, product, design and plan.

The preview must name the target/run/revision, concrete reason and intended change, changed
source gate, exact current sources, preserved/superseded approvals, affected artifacts,
analyses and implementation/test/review evidence, retained work, and next allowed action.
It is a proposal; status, preview, history inspection and cancellation before application
do not mutate effective state. No new approval gate is added for the reopening itself.

The maintainer's explicit revision work intent applies only to the reviewed identity and
impact. The workflow must assess the earliest source owner; it cannot pretend to infer
semantic intent from a free-text reason deterministically. A contradiction or missing
source-impact assessment stays unresolved rather than choosing a convenient later gate.
The application validates bound facts and the reviewed impact, not independent human
authorship or the completeness of model reasoning.

### Source impact matrix

| Changed source | Valid unchanged upstream approvals retained | Current approvals superseded | Required next user gate |
|---|---|---|---|
| UR | none | UR, PRD, SD, TP | UR |
| PRD | UR | PRD, SD, TP | PRD |
| SD | UR, PRD | SD, TP | SD |
| TP | UR, PRD, SD | TP | TP |

Only applicable recorded approvals can be retained, and only with exact content/provenance
checks. The first supported lifecycle excludes QA/UAT/OR authority. Unsupported, conflicting
or damaged states must not be normalized into this table to make them eligible.

### Analysis and existing-work impact

A changed UR requires a fresh post-UR Brownfield Review and Mode/Slice Decision after its
new approval. Required UX analysis follows that fresh impact route before PRD readiness.
The old Brownfield/UX analysis is retained as historical input, not current routing authority.

For a PRD, SD or TP change, the impact review must explicitly assess whether existing
Brownfield routing and UX inputs remain applicable to the unchanged upstream need. Retain
them only with a concrete reuse rationale tied to the exact unchanged source and the proposed
change. Changed context, authority, source ownership, UX semantics or unresolved applicability
requires the affected existing analytical owner to reassess before downstream readiness.
This product rule does not invent a new analysis gate or broaden any author skill's authority.

Affected downstream artifacts and their active source relationships cease to establish
current readiness. Historical observations remain inspectable. Existing code and test files
are not deleted or rolled back. Their conformance and the necessary test/review evidence
must be assessed against the revised approved TP; historical green logs alone cannot satisfy
renewed CD+Tests or CR. Changed TP requires fresh pre-implementation Brownfield Analysis,
current implementation/test evidence, mandatory CR and the existing sole QA decision route.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: UX_INTENT_DEFINITION.md, decision ready; supporting analysis only.
- primary_user_intent: Resolve a justified late source conflict without losing prior decisions or guessing what still permits work.
- success_signal: Review the exact impact, deliberately reopen the earliest affected source, inspect preserved history and follow the renewed approval path; no current permission comes from a superseded version.
- primary_decision_or_action: Request a reviewed revision for one exact current run; approve changed gate artifacts later through existing human decisions.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Current implementation | Existing approved TP and prerequisites permit its current bound scope | current, effective | Evaluated canonical run and exact approval/source proofs | Existing AGDF current-run control view |
| Revision preview | Current authority unchanged; reviewed change is proposed only | proposed, non-authorizing | Same current run; preview grants nothing | Selected-run revision-impact view |
| Requested application | No new authority until a validated complete transition commits | applying, refused, committed | Canonical lifecycle operation under exact bound conditions | Selected-run revision outcome |
| Reopened source work | Earliest source is unapproved; preserved upstream authority only | awaiting approval, affected downstream not current | Fresh canonical gate evaluation and exact upstream proof | Existing AGDF current-run control view |
| History inspection | Previous content and decisions remain evidence only | historical, superseded | Preserved exact previous evidence; no current permission | Historical evidence view linked to current run |
| Failure/recovery | Old valid state or proved committed state; unresolved outcome stays closed | refused, stale, recovery required | Validated current/recovery result, not a caller guess | Selected-run blocker/recovery outcome |

These are functional roles, not a prescribed component, endpoint, storage or UI technology.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Explicit reviewed revision intent for one bound current state; no application from discovery, status or preview. Cancel before application leaves state unchanged. Cancel after commit cannot reinstate prior approvals; any new change follows a fresh supported request.
- blockers_and_visible_next_actions: Unbound/wrong target or run -> correct selection; stale revision/preview -> inspect and regenerate; invalid sources/seal/provenance -> existing integrity owner; unsupported lifecycle -> bounded supported scope; contradictory impact -> earliest source owner; concurrent/pending unknown operation -> inspect/recover before retry. A gate approval is not an integrity repair.
- recovery_paths: Show known effective revision, reason and supported correction. For recoverable transient failure provide visible inspect/retry with fresh state. Unknown commit outcome requires operation/state reconciliation; never blindly replay to create another effective revision or report success from an acknowledgement.
- relevant_state_transitions: Current -> preview -> unchanged cancel OR exact validated application -> reopened earliest source -> new source approval -> required analysis and renewed dependent artifacts/approvals -> approved TP -> fresh implementation preparation/tests/CR -> existing QA. Refusals preserve old valid authority or the existing blocker. Interruptions expose recovery until the one effective result is proven.

## 5. Acceptance Criteria

### Bound read-only impact preview

- criterion_id: AC-001
- working_mode: Revision preview and cancellation.
- source_state: Valid active structured CD+Tests run after approved TP.
- trigger_action: Inspect a concrete revision proposal, then cancel or request application.
- expected_effective_state: Preview/cancel leave current state, approvals and implementation permission unchanged.
- visible_feedback: Exact identity, reason, source gate and content bindings; impact matrix, affected artifacts/analyses/evidence, retained work and next action.
- blocker_failure_behavior: Missing intent/impact/source facts cannot produce an apparently applicable preview.
- recovery_next_action: Complete the impact assessment or refresh the current binding.
- observable_success: The maintainer sees the complete bounded impact before any effective authority change; read-only operations leave persisted authority and revision unchanged.
- required_evidence: Actual consumer preview/cancel outputs and before/after state/file digests in isolated fixtures.

### Earliest-source application and approval impact

- criterion_id: AC-002
- working_mode: Requested application and reopened source work.
- source_state: Exact reviewed eligible current revision with approved source chain.
- trigger_action: Explicitly apply the bound source revision.
- expected_effective_state: Return to UR/PRD/SD/TP according to the impact matrix; affected approvals superseded and only exact valid upstream approvals retained.
- visible_feedback: Applied result names effective revision, earliest gate, retained/superseded approvals and forbidden current implementation.
- blocker_failure_behavior: Known contradiction or missing earliest-owner assessment stays closed; no claimed automatic semantic completeness.
- recovery_next_action: Resolve the source impact and regenerate the reviewed proposal.
- observable_success: Four source cases follow one current permission model; a changed UR requirement cannot be disguised as an SD-only update.
- required_evidence: Four actual application fixtures plus UR-first payload-conflict shape and contradicted/ambiguous impact refusal.

### Exact historical content and decision provenance

- criterion_id: AC-003
- working_mode: Historical inspection after application and later artifact replacement.
- source_state: Valid previous approved source/dependent versions with their proof and presentation evidence.
- trigger_action: Inspect preserved prior versions after revised drafts are recorded.
- expected_effective_state: History remains attributable; only current approved versions can authorize work.
- visible_feedback: Historical label, original run/revision/content digest, approval/presentation provenance and source relationships.
- blocker_failure_behavior: Missing exact prior bytes or corrupt provenance prevents the effective supersession; a digest alone cannot stand in for retained content.
- recovery_next_action: Restore/verify the exact evidence through the existing owner; never invent historical approval.
- observable_success: All superseded approved artifact bytes and their decision/source proofs remain inspectable and verify against their original bindings after replacement.
- required_evidence: Before/after exact-byte and proof verification, replacement/history inspection and corruption cases.

### Current derivation and control consistency

- criterion_id: AC-004
- working_mode: Reopened source work.
- source_state: Applied revision with retained historical downstream artifacts and proofs.
- trigger_action: Inspect current gate/readiness and attempt current source-bound recording or approval.
- expected_effective_state: Affected historical derivations and approvals cannot satisfy current readiness; valid unaffected upstream proofs still can.
- visible_feedback: Gate, active source relationships, artifact status, missing approval and next allowed action agree.
- blocker_failure_behavior: Stale proof or inconsistent authority blocks presentation/approval and implementation.
- recovery_next_action: Record the current source derivation and complete existing readiness, not manually reset status.
- observable_success: CLI/dispatcher/current control views agree; neither historical receipts nor old artifact presence silently reopen implementation.
- required_evidence: Current versus historical proof cases, source replacement checks and shared consumer state comparisons.

### Proportional analytical reassessment

- criterion_id: AC-005
- working_mode: Source reapproval and renewed downstream preparation.
- source_state: Reopened source with prior Brownfield/UX/routing and preparation evidence.
- trigger_action: Assess applicability after the proposed source change and new source approval.
- expected_effective_state: UR change repeats post-UR review/routing and required UX; later source changes retain analyses only with exact-source reuse assessment, otherwise reassess affected owners. New TP requires fresh preparation analysis.
- visible_feedback: Retained versus invalidated analyses, concrete reuse reason and required next owner/action.
- blocker_failure_behavior: Unknown/changed context or required blocked UX input prevents downstream readiness; old routing cannot silently survive a changed UR.
- recovery_next_action: Complete the affected existing analytical step under fresh approved inputs.
- observable_success: Analysis reuse is evidenced and proportional; materially changed assumptions are reconsidered before current downstream approval.
- required_evidence: UR-change fresh-route case, valid later-source reuse and changed-context/UX refusal/reassessment cases.

### Fresh affected approvals before resumed implementation

- criterion_id: AC-006
- working_mode: Renewed source and dependent gate approval path.
- source_state: Reopened gate with no effective approval for affected content.
- trigger_action: Draft/record revised sources, present them and supply new deliberate gate replies.
- expected_effective_state: Each affected existing gate becomes effective only after current readiness and exact new approval; implementation returns only through approved TP and required preparation.
- visible_feedback: Exact current artifact/revision and missing decision, followed by the newly permitted next step.
- blocker_failure_behavior: Old replies/presentations, later-gate shortcuts and merely reopening cannot approve revised content.
- recovery_next_action: Prepare and review the fresh bound presentation or correct its prerequisites.
- observable_success: The complete revised chain requires renewed existing human decisions with no added gate or inherited reply.
- required_evidence: End-to-end renewal plus stale reply/presentation and missing-source/readiness negative cases; synthetic fixture replies labeled.

### Retained work and renewed evidence

- criterion_id: AC-007
- working_mode: Reopened scope and renewed implementation/quality preparation.
- source_state: Existing code, test files, observations and review evidence from the old approved plan.
- trigger_action: Apply revision and later assess retained work against the revised approved TP.
- expected_effective_state: Files remain; historical completion is insufficient. Current CD+Tests, mandatory CR and QA require renewed applicable evidence.
- visible_feedback: What is retained, what needs revalidation and which evidence currently supports each obligation.
- blocker_failure_behavior: Old green logs or a prior complete status cannot establish current fulfillment of a changed plan.
- recovery_next_action: Map retained work to the revised TP, run applicable checks/reviews and record current candidate evidence.
- observable_success: Revision deletes no implementation work and carries no unsupported completion or QA claim into the renewed chain.
- required_evidence: File preservation, historical-evidence invalidation and actual renewed-scope fulfillment scenarios.

### Refusal and useful next actions

- criterion_id: AC-008
- working_mode: Refused/stale/ineligible request.
- source_state: Wrong target/run, stale binding, invalid/missing proof, unsupported lifecycle or contradictory impact.
- trigger_action: Preview/apply an invalid request.
- expected_effective_state: No partial authority reset or unrelated mutation; existing valid state or existing integrity blocker remains.
- visible_feedback: Concrete refusal reason and supported correction; no misleading new approval request or success.
- blocker_failure_behavior: QA/UAT/OR/closed/historical states, unapproved sources, unsafe paths and foreign identities remain outside the late path.
- recovery_next_action: Correct selected facts, refresh preview, or use the actual integrity/revision owner.
- observable_success: Negative cases leave protected bytes/authority unchanged and identify an executable next action.
- required_evidence: Identity, path, lifecycle, seal/proof, stale and contradiction matrix with mutation snapshots.

### Interruption, concurrency and retry

- criterion_id: AC-009
- working_mode: Applying and recovery/retry.
- source_state: Eligible request while another change or a defined interruption may occur.
- trigger_action: Competing application, interruption at transition boundaries, retry or replay.
- expected_effective_state: One valid recoverable effective result; no partial approval/history/source authority and no duplicate effective revision from replay.
- visible_feedback: Proven current outcome/revision or explicit unknown/recovery-required status with inspect/retry action.
- blocker_failure_behavior: Stale or conflicting operations cannot commit; unknown outcome cannot be reported as success or blindly retried.
- recovery_next_action: Reconcile through the supported operation/state recovery and regenerate changed bindings when needed.
- observable_success: Before-commit and after-commit failures plus competing/repeated requests recover coherently without lost historical content or inherited authority.
- required_evidence: Actual fault injection, concurrency/replay and shared consumer recovery outcomes for the candidate.

### Shared ownership, early compatibility and scoped guards

- criterion_id: AC-010
- working_mode: Supported lifecycle consumers and unchanged early revision.
- source_state: Existing early PRD-at-SD case, eligible late cases, unsupported adjacent routes and dirty independent work.
- trigger_action: Use supported canonical CLI/dispatcher/protocol paths and existing package projections.
- expected_effective_state: One existing lifecycle authority; early behavior compatible; no new MCP write authority, gate or parallel acceptance store implied.
- visible_feedback: Equivalent eligibility/impact/outcome meanings and honest capability limitations.
- blocker_failure_behavior: No relaxed instruction/context, integrity or performance guard; measured distribution growth needs explicit exact review in later design/plan before baseline application.
- recovery_next_action: Correct canonical ownership/contract or return a measured constraint conflict to its source owner.
- observable_success: Early and adjacent routes retain their authority, supported consumers agree, and the design-author run and independent dirty files remain unchanged by this capability delivery.
- required_evidence: Early/adjacent regression, package and consumer conformance, guard results and protected-path hashes; exact reviewed inventory if distribution growth is necessary.

### Candidate-bound evidence and independent decision limits

- criterion_id: AC-011
- working_mode: Delivery validation and final existing QA assessment.
- source_state: Actual assembled candidate and retained approved-source/analysis inputs.
- trigger_action: Assess criteria/design/task coverage and actual observed behavior.
- expected_effective_state: QA uses verified current evidence; cooperative self-attestation and synthetic replies remain distinguishable from independent approval/native observation.
- visible_feedback: Candidate/consumer identity, source derivation reasoning, observed results, missing proof and claim limits.
- blocker_failure_behavior: Structural tables, historical test logs or source/package checks alone cannot establish semantic completeness or installed/native behavior.
- recovery_next_action: Obtain the missing actual evidence or limit the supported claim; sole qa-gate decides quality readiness.
- observable_success: Four-source and UR-first fixtures prove the supported mechanism without revising the production trigger run, and final claims do not exceed their evidence lane.
- required_evidence: Derivation review, actual behavior records, task/code/architecture reviews and current QA report; installed/native evidence separate when obtained.

## 6. Non-Goals

Preserve all approved UR exclusions: no production revision application, payload change in the
trigger run, borrowed approvals, unrelated run/CI edits, seal repair, automatic code rollback,
QA/UAT/OR/closed-run extension, new gates/control store/workflow engine, implicit approvals,
installation, Git action or publication/release. No React/mock/prototype or new host adapter
is required for this shared lifecycle behavior. A new MCP write tool is not in this scope.

## 7. Users And Roles

Arndt Gold owns product scope and PRD approval. The maintainer requesting a concrete revision
owns its intent and reviewed earliest-source assessment. The existing human gate decision
owner approves each changed artifact later. Core lifecycle/evaluation and recording owners
maintain one authority; existing authors produce allowed revised artifacts; analytical owners
assess applicable Brownfield/UX inputs. Reviews contribute evidence; qa-gate alone decides
final quality readiness. A local caller-forwarded reply is cooperative provenance, not an
independent authenticated proof of human authorship.

## 8. Constraints

Apply only to active structured CD+Tests after approved durable TP with exact current source
and approval/proof integrity. Keep one selected run, shared canonical writers and current
source authority. Use supported contained non-symlink files and existing identity/lock rules.
Unsupported external source ownership cannot be imported or overwritten silently; SD must
define supported representation and honest refusal within this bounded capability.

Maintain criteria-chain-v1: this PRD is the sole product acceptance source; SD and TP map its
stable IDs without copying acceptance into another register. Keep existing instruction/context,
runtime integrity and performance guards. Necessary distribution cost must be measured,
reviewed and explicitly decided in SD/TP as an exact candidate baseline with no reserve;
this is not advance authorization for an unspecified increase or permission to weaken checks.

Do not change the approved UR or the trigger run to fit an implementation. Preserve adjacent
dirty work; capture the actual pre-implementation baseline at the appropriate later step.

## 9. Evidence Requirements

Retain exact approved UR, completed Brownfield and ready UX input digests, the actual draft,
and a reasoned semantic derivation review. The typed reviewed source mapping records
PRD-derived_from-UR cooperatively; it does not independently prove human review.

Later TP must cover all criteria and SD decisions with actual scenarios. Retain source/impact
preview and application results, exact history and renewed proof/approval chain, read-only
and cancellation mutation checks, protected-path snapshots, fault/concurrency/replay evidence,
early/adjacent regression, assembled package/runtime/protocol checks and rendered supported
locale behavior. Demonstrate meaningful visible control outcomes in the actual tested consumer.
Deterministic render/protocol tests are not fresh native-host/model observations.

No independent human proof, installed fix, native platform support or release is claimed by
this PRD. Final task-plan, clean-implementation, code review and sole QA remain required.

## 10. Risks And Open Questions

Exact source history and active-proof invalidation are coupled: preserving receipts alone is
insufficient, while erasing them destroys provenance. SD owns their representation and commit
boundary. A transaction that protects only Run/Backlog/OR does not automatically protect source
archives. TP must prove the chosen interruptions and replay outcomes instead of relying on
old transaction tests. Effective state must stay consistent across status and source readers.

The earliest source assessment is cooperative semantic work, not a universal deterministic
classifier. The product specifies visible reviewed intent and bound consistency, with explicit
blocked contradictions, rather than claiming the model cannot miss a source conflict.

Distribution cost, shared dirty work and installed/candidate drift remain explicit obligations.
There is no unresolved product-scope, acceptance or accountable-owner choice before PRD;
technical and test details are assigned below without pre-approving a solution.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Scope and earliest source | before_prd | resolved | Active valid structured CD+Tests after TP only; UR/PRD/SD/TP impact matrix; explicit reviewed source assessment; no QA/UAT/OR extension | Arndt Gold (product owner and PRD approval) |
| Effective approvals and history | before_prd | resolved | Supersede changed/dependent approvals, preserve exact old versions/provenance; retain only exact unaffected upstream authority; renewed existing gates required | Arndt Gold (product owner and PRD approval) |
| Analysis and existing-work reuse | before_prd | resolved | Changed UR repeats post-UR route/required UX; later changes need explicit applicability review; renewed TP requires preparation and current work/test/review evidence; preserve files | Arndt Gold (product owner and PRD approval) |
| Impact preview and recovery | before_prd | resolved | Read-only preview/cancel, exact explicit apply intent, concrete refusal and visible inspect/retry/recovery; reopening grants no approval | Arndt Gold (product owner and PRD approval) |
| Delivery evidence and distribution constraints | before_prd | resolved | Isolated actual candidate evidence; no production trigger change or install; guards retained; any necessary exact distribution baseline is a later explicit decision with no reserve | Arndt Gold (product owner and PRD approval) |
| History, active proof and atomic operation representation | later_sd | open | Decide archive/current-binding representation, eligibility mechanism, commit/recovery/replay and shared public contract while satisfying all approved product outcomes | Codex (design author); Arndt Gold (SD approval) |
| Candidate scenarios, platform and consumer evidence | later_tp | open | Map every criterion and design decision to actual boundary/fault/consumer evidence and explicit remaining native limitations | Codex (TP author); Arndt Gold (TP approval) |

These are proposed product resolutions derived from approved UR and ready analyses. They
become authoritative only upon this exact PRD's deliberate approval; no prior answer is reused
as approval and no later technical choice is silently settled here.

## 11. Next Step

Record this exact draft and reviewed PRD-derived_from-UR mapping through the shared writer.
After fresh readiness, present the bound draft and wait for a new Approval: PRD. Only that
decision permits Solution Design; no TP, implementation or payload adjustment is yet allowed.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Einen begründeten späten Änderungsbedarf im selben Lauf bearbeiten und dabei klar erkennen, welche alten Entscheidungen noch gelten und welche neu freigegeben werden müssen.
- Umfang: Unterstützter Revisionsweg während Umsetzung und Tests nach TP; Rückkehr zu UR, PRD, SD oder TP je nach frühester geänderter Quelle. Historie und vorhandener Code bleiben erhalten.
- AC-001: Die Vorschau zeigt Identität, Änderungsgrund und vollständige Auswirkungen; Lesen und Abbrechen ändern keine Freigabe oder Revision.
- AC-002: Anwenden führt zum frühesten betroffenen Gate, löst dessen abhängige Freigaben ab und bewahrt nur exakt gültige vorgelagerte Freigaben.
- AC-003: Frühere freigegebene Inhalte, Entscheidungen und Quellenbelege bleiben exakt prüfbar, verleihen aber keine aktuelle Umsetzungsbefugnis.
- AC-004: Aktueller Zustand, Gate, Quellenbeziehungen und erlaubte Schritte stimmen überein; historische Belege erfüllen keine aktuelle Freigabereife.
- AC-005: Geänderte UR erfordert neue Brownfield-Routenwahl und gegebenenfalls UX-Analyse; spätere Änderungen brauchen belegte Analyse-Anwendbarkeit. Nach neuem TP folgt frische Vorbereitung.
- AC-006: Geänderte und abhängige Artefakte benötigen neue Prüfung, Präsentation und menschliche Freigabe; alte Antworten werden nicht übertragen.
- AC-007: Code und Testdateien bleiben erhalten. Erfüllung, Test- und Reviewnachweise werden gegen den neuen freigegebenen Plan neu bewertet.
- AC-008: Falsche, veraltete, widersprüchliche oder nicht unterstützte Anfragen werden ohne Teiländerung abgelehnt und nennen einen konkreten nächsten Schritt.
- AC-009: Abbruch, Konkurrenz und Wiederholung ergeben einen nachvollziehbaren wiederherstellbaren Stand; unklarer Ausgang erlaubt keine Erfolgsmeldung oder blinde Wiederholung.
- AC-010: Bestehende frühe Revision, gemeinsame Zuständigkeiten, angrenzende Abläufe und Schutzprüfungen bleiben erhalten; fremde laufende Arbeiten werden nicht verändert.
- AC-011: Tatsächliche Kandidaten- und Verhaltensnachweise bleiben von synthetischen Freigaben, unabhängiger Prüfung und frischer Host-Beobachtung unterscheidbar.
- Entscheidungen: Produktumfang, Freigabewirkung, Historie, Analyse-/Arbeitswiederverwendung und sichtbare Erholung sind im Entwurf geklärt. Speicherung, Quelleninvalidierung und atomarer Ablauf entscheidet das Design; konkrete Tests und Plattformnachweise der Taskplan.
- Grenzen: Keine Änderung der Paketgrenze oder des Design-Laufs, keine Erweiterung auf QA/UAT/Abschluss, keine Installation oder Veröffentlichung. Diese PRD-Freigabe erlaubt zunächst nur das Design.
