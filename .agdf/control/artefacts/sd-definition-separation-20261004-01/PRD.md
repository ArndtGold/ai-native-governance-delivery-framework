# PRD: Dedicated Solution Design authoring

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR
Date: 2026-10-04
Owner: Arndt Gold
Run: sd-definition-separation-20261004-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Provide one named professional responsibility for drafting and clarifying Solution Design.
It receives an eligible, explicitly bound assignment, derives one canonical unapproved SD from
the approved PRD and applicable analyses, and returns its recorded result to gate-check.

Gate-check controls prerequisites and readiness; the dispatcher routes evaluated work; existing
writers record artifacts and source relationships; the human decides Approval: SD. The authoring
responsibility owns the meaning of the design and focused clarification, not approval or execution.

The design describes architecture, boundaries, flows, reuse, accountable sources, decisions,
trade-offs and compatibility/risk treatment at the smallest justified depth. Approved product
intent, scope, non-goals and criteria remain authoritative. The change extends the established
UR/PRD authoring separation to SD only.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact semantics below, supported by the completed
  Brownfield Review. No graphical interface or new user decision mode is requested.
- primary_user_intent: Obtain a reviewable design explaining how approved requirements will be
  realized, with a clear distinction between design authorship, readiness and human approval.
- success_signal: An eligible assignment names the design author and exact approved inputs;
  a recorded design returns to the existing SD review/approval flow without altered product intent.
- primary_decision_or_action: Review the design and its unresolved decisions; answer necessary
  design questions or deliberately approve the current presented SD.

The author explains draft content and missing answers. Canonical control decides which stage and
actions are effective; existing AGDF presentations communicate readiness, blockers and next steps.
No author message, skill invocation or selection can create approval or implementation permission.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| SD drafting | Current SD stage permits creation of an unapproved design from approved PRD and required inputs. | Bound authoring assignment, draft reference, blocked prerequisites when applicable. | Canonical run, evaluated gate prerequisites and existing artifact writers. | Dispatcher for the assignment; existing AGDF presentation for control status. |
| SD clarification or requested draft revision | Current unapproved design has a material unanswered design question or explicit editing request; approved sources remain protected. | Focused question, retained draft, recorded revision, concrete source/integrity blocker. | Canonical eligibility/readiness and revision-bound recording; confirmed answers supply design facts. | Design author for questions/content; existing AGDF presentation for effective gate and blockers. |
| SD approval review | A recorded current design has required relationships, traceability and resolved material design questions; a fresh presentation is prepared. | Readiness, artifact reference, approval question, rejection or retry guidance. | Gate-check/readiness and presentation binding; deliberate human reply through the approval writer. | Existing code-owned AGDF approval presentation. |

These describe the existing SD workflow's effective states, not additional user gates.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Activate only for actual design drafting/revision intent or an
  authorized bound delivery continuation. Ordinary advice, status, skill discovery and ambient
  selectors do not authorize editing. An ordinary continuation of a ready registered draft
  presents that draft rather than silently rewriting it.
- blockers_and_visible_next_actions: Missing/unapproved inputs, wrong/stale/foreign bindings,
  source integrity failure and approved SD targets prevent authoring. Material unanswered design
  questions prevent SD approval presentation. Report the concrete blocked prerequisite and its
  existing owner; never use a clarification route to bypass unrelated control blockers.
- recovery_paths: Preserve the draft and prior proof/history. Retry recoverable recording through
  the existing transaction/recovery path with fresh canonical state; stale requests are rejected
  or returned to reassignment without applying their old intent to a different run. Changed
  designs require a fresh presentation and a new deliberate reply.
- relevant_state_transitions: Eligible SD -> named drafting assignment -> recorded SD -> fresh
  readiness evaluation -> prepared SD presentation -> deliberate Approval: SD -> existing TP stage.
  Material design question -> focused clarification, no approval presentation. Product-scope
  conflict -> existing earliest affected UR/PRD revision path, no silent source edit.

## 5. Acceptance Criteria

### AC-001: Explicit professional responsibility

- criterion_id: AC-001
- requirement: A registered dedicated design-authoring responsibility owns semantic SD creation
  and clarification. Gate-check retains control/readiness and contains no competing design-drafting
  procedure; shared recording guidance remains available to the author.
- working_mode: SD drafting
- source_state: SD stage is eligible and the design is missing or explicitly permitted for editing.
- action: Continue the bound delivery or invoke the registered author for the selected scope.
- expected_effective_state: A named, run/revision-bound authoring assignment; approval remains open.
- visible_feedback: Responsible skill, approved input references and current SD target are identifiable.
- blocker_failure_behavior: Missing eligibility or actual editing intent yields no authoring permission.
- recovery_next_action: Resolve the reported prerequisite through the existing owner and redispatch.
- observable_success: The evaluated route delegates content to the registered author; control and
  semantic contracts express one owner for each responsibility.
- required_evidence: Catalog/contract comparison and actual eligible/ineligible dispatch cases.

### AC-002: Approved-source design derivation

- criterion_id: AC-002
- requirement: The author derives one canonical unapproved SD from the exact approved PRD,
  resolved product decisions and required ready analyses. Analyses are subordinate inputs and
  do not replace PRD authority. The output addresses architecture, boundaries, flows, reuse,
  choices and compatibility/risk treatment without adding product scope or users.
- observable_success: The assignment and draft identify their exact sources; a reviewed derivation
  example preserves approved intent/non-goals and explains concrete design responses.
- required_evidence: Exact source bindings, contained-file/invalid-input cases and a reasoned
  source-to-design review; a completed template alone is insufficient semantic evidence.

### AC-003: Focused clarification with honest readiness

- criterion_id: AC-003
- requirement: Material missing design information produces one focused bundled clarification,
  preserving answered context and a useful draft. Recorded material unanswered design questions
  keep readiness closed. The author cannot manufacture answers or present unresolved design as ready.
- working_mode: SD clarification
- source_state: An eligible unapproved SD has a material missing design answer.
- action: Continue permitted clarification; subsequently provide the required confirmed answer.
- expected_effective_state: Draft remains unapproved while the question is open; only a recorded
  resolution permits fresh readiness evaluation.
- visible_feedback: The missing decision, accountable owner and concrete answer needed are visible.
- blocker_failure_behavior: No prepared SD approval presentation while a material declared question
  remains open; unrelated source/integrity blockers still prevent editing.
- recovery_next_action: Record confirmed answers without repeating unchanged answered questions,
  then return to gate-check.
- observable_success: Open/resolved question examples produce the corresponding readiness and
  clarification outcomes; no unanswered product question is deferred past its proper gate.
- required_evidence: Clarification examples, open/resolved readiness cases and negative blocker cases.

### AC-004: Explicit revision of an unapproved design

- criterion_id: AC-004
- requirement: A ready registered unapproved SD is changed only for actual explicit revision intent.
  Recording uses the current target/run/revision and existing replacement/history safeguards.
  Wrong, stale, foreign, malformed or approved bindings cannot overwrite the design or its sources.
- working_mode: Requested draft revision
- source_state: One registered unapproved SD exists with a current binding.
- action: Request a concrete design revision or continue without an editing request.
- expected_effective_state: Explicit valid revision creates a newly recorded draft and invalidates
  old presentation use; ordinary continuation presents the existing draft without mutation.
- visible_feedback: New draft/revision or the concrete rejection/recovery is identifiable.
- blocker_failure_behavior: Approved SD and invalid bindings refuse replacement; prior evidence survives.
- recovery_next_action: Use fresh canonical assignment/presentation; an old reply cannot approve a change.
- observable_success: Tests distinguish revision from ordinary continuation and preserve prior
  approved bytes, proof history and foreign runs.
- required_evidence: Revision, stale/foreign/approved protection and fresh-presentation cases.

### AC-005: Product conflicts return to their authority

- criterion_id: AC-005
- requirement: A design choice that materially conflicts with approved product scope, behavior or
  acceptance returns to the existing earliest affected UR/PRD revision owner. SD clarification
  never silently changes approved requirements or reopens settled product decisions without a
  changed need.
- observable_success: A product-conflict example identifies the proper revision path, preserves
  approved source bytes and withholds approval for the conflicting design.
- required_evidence: Source-preservation checks and reviewed conflict/routing examples.

### AC-006: One canonical design and criteria chain

- criterion_id: AC-006
- requirement: Preserve criteria-chain-v1. Each approved PRD criterion maps exactly once to its
  design response, source-of-truth owner, stable decision IDs or reasoned none, and compatibility/
  risk treatment. Record SD-derived_from-PRD using the existing shared artifact writer and reviewed
  source mapping. Do not create another acceptance register, design store or artifact writer.
- observable_success: A valid draft passes existing traceability/source checks; missing/duplicate
  mappings, incorrect decision references and invalid relationship proof cannot be presented as ready.
- required_evidence: Real recording/relationship and positive/negative SD traceability cases.

### AC-007: Fresh readiness and human approval

- criterion_id: AC-007
- requirement: After recording, the author returns to fresh gate-check evaluation. Only canonical
  readiness plus a fresh bound presentation can request Approval: SD. Neither author nor dispatcher
  approves the design. Valid human approval opens only the existing TP stage.
- working_mode: SD approval review
- source_state: A recorded design awaits fresh readiness evaluation.
- action: Evaluate and present the current design; then supply a new deliberate human response.
- expected_effective_state: Unready design remains blocked; ready design obtains a current
  presentation; exact valid approval transitions to TP.
- visible_feedback: Existing SD status, artifact, blockers and precise approval question.
- blocker_failure_behavior: Stale presentation, wrong response or missing readiness cannot approve.
- recovery_next_action: Correct the current draft/prerequisite and prepare a fresh presentation.
- observable_success: Recording, readiness, presentation and approval retain their separate effects.
- required_evidence: Positive/negative presentation and approval-boundary tests.

### AC-008: Shared CLI/MCP and host consistency

- criterion_id: AC-008
- requirement: Canonical catalog, shared CLI/MCP routing, contract delivery, supported generated
  host projections and documentation identify the same author and boundaries. Direct invocation
  respects the same prerequisite and target/run assignment rules as delivery continuation.
  Existing payload, instruction, runtime and performance limits are retained.
- observable_success: Source and packaged consumers expose matching identities/contracts; unknown
  identities and invalid inputs fail closed; registered host names normalize consistently.
- required_evidence: Source/generated/package integrity, CLI/MCP protocol and supported host-projection
  cases with the actual candidate; report fresh native-host observation separately.

### AC-009: Preserve adjacent delivery ownership

- criterion_id: AC-009
- requirement: UR/PRD authoring, TP preparation, implementation, QA/UAT, audit closeout, release
  and approval order retain their existing behavior outside this SD change. Existing runs are
  not migrated or rebound automatically; independent CI work is excluded.
- observable_success: Regression cases retain preceding UR/PRD routes and the downstream TP
  route; no new gate, approval formula or automatic external action appears.
- required_evidence: Adjacent-route, existing-run and protected-path regression checks.

### AC-010: Evidence states its actual scope

- criterion_id: AC-010
- requirement: Delivery evidence covers real authoring handoff, recording, clarification, revision,
  conflict handling and semantic derivation at proportionate depth. Documentation distinguishes
  source, package, deterministic protocol/generated-host checks and fresh native-host/model behavior.
  Structural conformance or synthetic replies cannot be claimed as independent human/host evidence.
- observable_success: Review/QA can identify which candidate and path were checked, what was observed,
  and what remains unverified; findings return to their existing owner rather than a new authority.
- required_evidence: Candidate-bound results and derivation/review records with explicit limitations.

## 6. Non-Goals

Do not rework UR/PRD authoring or separate TP, implementation, UAT, audit or release ownership.
Do not move Brownfield Analysis to Task 0, relocate reviews or add mock/prototype/UX-review work.
Do not add gates, approvals, writers, parallel SDs or acceptance stores. No approved-artifact editing,
run migration, approval transfer, automatic plugin installation, Git action, publication or release.
The independent CI changes remain outside this run.

## 7. Users And Roles

- Arndt Gold owns product scope and deliberate gate decisions.
- The registered design author drafts and clarifies only the eligible bound unapproved design.
- Gate-check and existing canonical operations decide effective readiness, recording and approval.
- Dispatcher and existing host presentations communicate the evaluated assignment and current state.
- Maintainers keep shared contracts and canonical/derived surfaces consistent; existing reviews/QA
  assess implementation and evidence without becoming a second product authority.

## 8. Constraints

Reuse existing source relationships, contained-file checks, run seals, revision guards, transaction/
recovery operations, traceability and presentation. Preserve approved input bytes and existing
proof history. Do not weaken guard assertions, instruction/payload ceilings, performance limits or
host security policy to accommodate another skill. Use the configured artifact language and
existing localized approval summary. Native-host support claims require corresponding observations.

## 9. Evidence Requirements

SD must map every criterion once to its design response, authority and compatibility treatment.
TP must map the approved criteria/design decisions to actual task IDs, boundary scenarios, expected
results and evidence. Include new drafting, material clarification, retained answers, explicit
revision, wrong/stale/foreign/approved bindings, product conflicts, exact source recording,
traceability, fresh approval and adjacent-route regressions.

Use actual version-bound packaged CLI/MCP consumers and generated supported host projections.
Review the reasoning of a design derivation, not just headings or serialized fields. Retain
candidate identity and distinguish deterministic checks from fresh host/model observations.

## 10. Risks And Open Questions

- A semantic contract alone cannot prove design adequacy; review evidence must inspect actual
  derivation and named source ownership.
- Clarification eligibility must not weaken integrity or approved-source protection.
- The shared registration procedure and TP route must survive removal of SD drafting instructions.
- A new catalog entry has real instruction/payload cost; address the content within existing limits.
- Specific skill identity, handoff shape, readiness representation and revision mechanics belong
  to the subsequent SD. Concrete test/host qualification detail belongs to TP.

No unresolved product-scope, acceptance, accountable-owner or release-acceptance decision remains
before PRD approval. The following table preserves the actual design/planning deferrals.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Professional and control responsibility | before_prd | resolved | Approved UR: dedicated SD semantic author, gate-check readiness, existing writers, human Approval: SD; one canonical SD. | Arndt Gold |
| Scope and adjacent work | before_prd | resolved | SD separation only; UR/PRD, TP, Task 0, reviews, implementation/UAT/closeout and independent CI work retain their own scope. | Arndt Gold |
| Product acceptance and evidence boundary | before_prd | resolved | The criteria above require bound drafting/clarification/revision, preserved product authority and real source/package/protocol evidence; native observations are separately identified. No automatic installation or publication is included. | Arndt Gold |
| Low-impact interaction semantics | before_prd | resolved | Preserve existing SD intent, effective-state authority and approval action; named assignment, questions and blockers use existing presentations. Brownfield Review finds no material unresolved UX intent. | Arndt Gold |
| Skill identity, handoff, readiness and revision design | later_sd | open | Decide the smallest focused design using existing catalog, evaluated routing and writer owners; no new approval or persistence authority. | Codex (SD author); Arndt Gold (SD approval) |
| Task scenarios and candidate/host evidence plan | later_tp | open | Map all approved criteria/design decisions to tasks, boundaries and specific evidence, retaining proof limitations and existing limits. | Codex (TP author); Arndt Gold (TP approval) |

## 11. Next Step

Record this PRD derived_from the exact approved UR using the existing reviewed recording input;
return to gate-check for readiness and fresh presentation. Request a new deliberate Approval: PRD.
Only that approval permits SD drafting for this change; implementation remains gated by SD and TP.

## AGDF Approval Summary (de; source=en)

- Ziel: Die Design-Erstellung erhält einen eigenen fachlichen Auftrag; gate-check prüft
  Voraussetzungen und Freigabereife, der Mensch entscheidet.
- Umfang: Ein kanonisches SD aus dem freigegebenen PRD und anwendbaren Analysen; bestehende
  Quellen-, Revisions-, Registrierungs- und Freigabebindung erhalten.
- AC-001: Fachliche SD-Erstellung und Kontrolle klar trennen.
- AC-002: Design nachvollziehbar aus exakten freigegebenen Quellen ableiten.
- AC-003: Wesentliche Designfragen bündeln; offene Antworten verhindern Freigabereife.
- AC-004: Nur ausdrücklich angeforderte unfreigegebene Entwürfe revisionsgebunden ändern.
- AC-005: Produktkonflikte zur bestehenden UR-/PRD-Revision zurückgeben.
- AC-006: Genau ein SD mit vollständiger Kriterienkette und belegter PRD-Ableitung führen.
- AC-007: Nach Registrierung frisch prüfen; nur der Mensch gibt die präsentierte SD-Fassung frei.
- AC-008: CLI, MCP, Hostprojektionen und Dokumentation konsistent halten; Grenzen nicht abschwächen.
- AC-009: Benachbarte Zuständigkeiten, Gates und unabhängige CI-Arbeit erhalten.
- AC-010: Tatsächliche Verhaltens-/Ableitungsnachweise und ihre Grenzen sichtbar unterscheiden.
- Entscheidungen: Umfang, Zuständigkeit, Abnahme und geringe UX-Auswirkung sind geklärt.
  Skillname, Übergabe-, Bereitschafts- und Revisionsdetails folgen im SD; Aufgaben und Nachweise im TP.
- Abgrenzung: Keine neuen Gates, Writer, parallelen Quellen, automatischen Installations-, Git-
  oder Veröffentlichungsaktionen. TP, Task 0, Reviews, UAT und Abschluss werden hier nicht umgebaut.
- Nächster Schritt: Approval: PRD erlaubt das Solution Design für diesen Umbau; noch keine Umsetzung.
