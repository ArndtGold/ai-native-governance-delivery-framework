# TP: Joint Coding-Agent Control Concept for Dispatcher and MCP

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD and SD
Date: 2026-10-02
Owner: Arndt Gold
Run: agent-control-dispatcher-mcp-concept-20261002-01
Language: en
Traceability contract: criteria-chain-v1

This plan produces and verifies the concept described by the approved SD. It does not implement the proposed control mechanisms, MCP interfaces or host adapters. All file names below refer to this run's artefact directory unless explicitly qualified.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform and record implementation-preparation Brownfield Analysis for the concept-only paths; confirm approved sources, reusable owners and unchanged scope | Coding agent | Approval: TP; approved PRD/SD |
| T-002 | Create CONCEPT.md index, intent, evidence vocabulary, observed current flow, target responsibility map and direct-tool escape paths; link all UR signals | Coding agent | T-001 |
| T-003 | Populate control catalogue and action-binding model with owners, mechanisms, enforcement/detection classes, residual limits and trusted-boundary assessment | Coding agent | T-002 |
| T-004 | Specify exactly bound human decisions, provenance lanes and common status/decision meaning; document native versus text fallback and assurance-dependent blocking | Coding agent | T-002, T-003 |
| T-005 | Define scope-to-actual-change/evidence verification, reviewer independence classes, conditional checks and agent-selected-depth risks | Coding agent | T-003 |
| T-006 | Complete lifecycle-to-MCP operation catalogue and host matrix; collect dated primary protocol/host references, observed repository/installed evidence where available, and explicit unknown statuses | Coding agent | T-002, T-003, T-004 |
| T-007 | Work through every named SD scenario with source/target condition, authority, owner, feedback, persisted effect, safe recovery and required evidence; cross-check consistency with control/operation matrices | Coding agent | T-003 through T-006 |
| T-008 | Reconcile related scopes and current source separately; derive dependency-aware implementation slices with outcome, prerequisite, owner, compatibility, verification and rollback obligations | Coding agent; Arndt Gold accountable for future scope choices | T-002 through T-007 |
| T-009 | Complete criterion/decision and UR-signal coverage, evidence and limitation registers; verify links, source existence, IDs, unresolved guarantees and concept-only diff; record CD_TESTS.md | Coding agent | T-002 through T-008 |
| T-010 | Review plan fulfilment, structural integrity and actual document diff; resolve findings and persist TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md and CODE_REVIEW.md; prepare QA_REPORT.md through qa-gate | Existing review/QA skills; actual producer and independence stated | T-009 |

Tasks are document production and verification. T-010 does not create an independent-review claim: if the same agent conducts these reviews, record that fact. The concept must still distinguish stronger future verification mechanisms from this run's actual assurance. No subagents, installations or external write actions are required by this plan.

## 2. Verification Traceability

Every row describes a document/source inspection or semantic walkthrough, not a simulated claim that an unimplemented runtime passed a test. Scenario evidence is recorded in CONCEPT.md and CD_TESTS.md; failed or incomplete cases remain explicit gaps.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Canonical index locates current/target flow, every criterion and all seven UR acceptance signals without another acceptance register | CONCEPT.md index and coverage; CD_TESTS.md SCN-001 |
| AC-001 | SDD-002 | T-002 | SCN-002 | SC-NORMAL traverses request, permission, bounded execution, evidence and acceptance with one named owner at each authority transfer | CONCEPT.md flow and SC-NORMAL; CD_TESTS.md SCN-002 |
| AC-002 | SDD-002 | T-003 | SCN-003 | Workflow permission, actual tool mediation and result verification are separate; successful Dispatcher/MCP calls are not proof of prevention | CONCEPT.md control catalogue; CD_TESTS.md SCN-003 |
| AC-002 | SDD-003 | T-003 | SCN-004 | SC-BYPASS identifies file/shell/network escape paths, interception capability or gap, detectable effects and dependent blocking | CONCEPT.md SC-BYPASS and control rows; CD_TESTS.md SCN-004 |
| AC-002 | SDD-003 | T-003 | SCN-005 | SC-TAMPER identifies agent-editable evidence/verifier limits and independently trusted enforcement prerequisites; seals are not adversarial assurance | CONCEPT.md SC-TAMPER; CD_TESTS.md SCN-005 |
| AC-003 | SDD-004 | T-004 | SCN-006 | SC-STALE and SC-WRONG reject old/wrong subject responses and require fresh binding and a new deliberate decision | CONCEPT.md decision contract and scenario rows; CD_TESTS.md SCN-006 |
| AC-003 | SDD-004 | T-004 | SCN-007 | SC-NEGATIVE preserves authority for revise/decline/cancel/timeout/default; labels and transport accept alone do not approve | CONCEPT.md SC-NEGATIVE; CD_TESTS.md SCN-007 |
| AC-004 | SDD-005 | T-005 | SCN-008 | SC-EVIDENCE shows that passing selected tests cannot close incomplete/wrong scope; missing/contradictory proof has owner, non-success outcome and remedy | CONCEPT.md verification and SC-EVIDENCE; CD_TESTS.md SCN-008 |
| AC-004 | SDD-005 | T-005 | SCN-009 | Review independence and SC-ROUTE explicitly distinguish self-review, fresh-context review and an external trust boundary; omitted checks and self-selected depth have safeguards or declared gaps | CONCEPT.md review classes and SC-ROUTE; CD_TESTS.md SCN-009 |
| AC-005 | SDD-006 | T-006 | SCN-010 | Every SD operation family has canonical owner, binding, effect, result, authorization, error/retry, audit and compatibility requirements; necessary primitives are justified | CONCEPT.md operation catalogue; CD_TESTS.md SCN-010 |
| AC-005 | SDD-006 | T-006 | SCN-011 | Proposed writes delegate to existing canonical services; resources/prompts/events and successful transport never create authority or a parallel state owner | CONCEPT.md integration and operation boundaries; CD_TESTS.md SCN-011 |
| AC-006 | SDD-004 | T-004 | SCN-012 | Same bound decision on native and text paths retains value, subject and effect; fallback never upgrades cooperative input to attested input | CONCEPT.md cross-host decision walkthrough; CD_TESTS.md SCN-012 |
| AC-006 | SDD-007 | T-006 | SCN-013 | Codex/Claude and relevant OpenCode/Copilot cells distinguish documented/installed/live/unsupported/unknown evidence; SC-CAPABILITY preserves equivalent fallback or blocks dependent guarantee | CONCEPT.md host matrix, evidence register and SC-CAPABILITY; CD_TESTS.md SCN-013 |
| AC-007 | SDD-003 | T-007 | SCN-014 | SC-CONCURRENT defines fresh pre-execution validation and safe checkpoints; revision changes do not pretend to undo irreversible effects | CONCEPT.md action binding and SC-CONCURRENT; CD_TESTS.md SCN-014 |
| AC-007 | SDD-008 | T-007 | SCN-015 | SC-REPLAY uses explicit operation identity and conflict/prior-result behavior without duplicate effect or transferred approval | CONCEPT.md SC-REPLAY; CD_TESTS.md SCN-015 |
| AC-007 | SDD-008 | T-007 | SCN-016 | SC-RESTART reconstructs canonical state and revalidates before resume; no old response or inferred scope is adopted | CONCEPT.md SC-RESTART; CD_TESTS.md SCN-016 |
| AC-007 | SDD-008 | T-007 | SCN-017 | SC-TRANSPORT distinguishes failure from unknown outcome before/after effect, exposes retry and reconciles outcome before repeating a write | CONCEPT.md SC-TRANSPORT; CD_TESTS.md SCN-017 |
| AC-008 | SDD-009 | T-008 | SCN-018 | Related-run state, approved scope and current source are separately dated; no approval transfer or completion inferred from code existence | CONCEPT.md scope reconciliation; CD_TESTS.md SCN-018 |
| AC-008 | SDD-009 | T-008 | SCN-019 | Each proposed slice depends on the complete concept and names acceptance boundary, prerequisites, contracts/hosts, validation and rollback; no runtime diff is introduced | CONCEPT.md roadmap; CD_TESTS.md SCN-019 and bounded diff inventory |
| AC-009 | SDD-001 | T-009 | SCN-020 | All criteria and UR signals resolve to concrete concept sections and evidence; placeholders, missing sources or inconsistent IDs are reported as failures | CONCEPT.md coverage and CD_TESTS.md SCN-020 |
| AC-009 | SDD-007 | T-009 | SCN-021 | Every material guarantee cites its evidence class/date or explicit limit with owner and dependency; no documentation-only claim is called live enforcement | CONCEPT.md evidence/limits register; CD_TESTS.md SCN-021 |
| AC-009 | SDD-009 | T-010 | SCN-022 | Reviews and QA assess semantic completeness and concept-only scope; actual review independence is declared and future implementation authority remains separate | TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md, QA_REPORT.md |

## 3. Test Plan

### Preparation and baseline

After TP approval, run the canonical pre-implementation Brownfield route before producing CONCEPT.md. Reconfirm this run's target/revision, approved PRD/SD and allowed paths. Capture `git status --short` and the relevant source commit as dated baseline evidence. Existing unrelated changes must not be reset or claimed as concept work. Inspect only sources needed for the concept.

### Concept/source validation

Check all referenced repository paths, internal anchors, catalogue/scenario IDs and criteria/decision coverage. Use the existing criteria-chain validator through canonical gate evaluation for TP readiness; no new runtime validator is introduced. For the final concept, perform a bounded structural check of the required sections, nine criterion coverage rows, seven UR-signal references and all thirteen named SD walkthroughs. Keep check output and commands in CD_TESTS.md. Structure checks establish completeness of references, not truth of control behavior.

For each SCN row, manually inspect and record pass/revise/block with the concrete section/evidence, producer, observation and limitations. All thirteen named SD walkthroughs must be substantively populated: SC-NORMAL, SC-BYPASS, SC-STALE, SC-WRONG, SC-REPLAY, SC-CONCURRENT, SC-NEGATIVE, SC-RESTART, SC-TRANSPORT, SC-CAPABILITY, SC-EVIDENCE, SC-TAMPER and SC-ROUTE. A walkthrough cannot count as an execution test of the proposed mechanism.

### Protocol and host evidence

Collect dated primary MCP and official host documentation for claims the concept actually makes. Separate standard capability, product documentation, installed exposure and observed behavior. Read installed configuration or code only where needed and available; do not install, activate plugins, invoke consequential operations or create test runs on unrelated scopes. Missing live evidence is marked unknown with a named future qualification obligation. Lack of optional native controls does not block this documentation deliverable if the concept clearly describes the supported fallback and assurance limit. A missing required guarantee or contradictory source without an honest consequence is a concept defect.

### Scope and semantic review

Check the actual diff and untracked paths against the baseline. Permitted durable outputs are this run's concept, checks, review/QA/closeout artefacts and required canonical run/backlog bookkeeping. No changes to executable code, host configuration, normative runtime contracts or unrelated runs are permitted. Examine action trust boundaries, irreversible side effects, label/value separation, self-review limits, fallback consequences and roadmap dependencies for semantic gaps. Resolve findings through the existing gap owner; do not weaken acceptance to obtain a pass.

Use appropriate existing review skills. QA remains the sole final Quality Readiness decision. After a passing durable QA report, prepare its exact presentation and wait for a new deliberate `Approval: QA`; UAT and OR remain separate existing steps. No approval is inferred from this TP.

## 4. Brownfield Scope

- Approved sources: this run's PRD.md and SD.md; UR.md and BROWNFIELD_REVIEW.md provide scope and baseline provenance.
- Canonical control: packages/core/lib/control-evaluation/ and control-state/, particularly gate policy, presentation and approval validation, recording/command identity and verified-change eligibility.
- Routing and transport: packages/core/lib/skill-dispatch/, packages/cli/lib/mcp-dispatch-runtime.js and packages/mcp-server/src/server.js; current docs/architecture/dispatcher.md and mcp-target-architecture.md.
- Presentation, host and quality: packages/core/lib/interaction-presentation.js; plugins/agdf/meta/contracts/; relevant host templates, consent and adapter sources; existing review/QA skill contracts.
- Related scope evidence: cross-surface-executable-skill-dispatcher, mcp-zielarchitektur-doku-20260929-01, agdf-mcp-inspect-slice1-20260929-01, codex-harness-conformance-slice and agdf-product-maturity-roadmap. Read their own scope/state without editing or transferring approvals.

## 5. Out Of Scope

Implementation of a mediator, enforcement hook, sandbox, signed authority token, attestation channel, MCP schema/tool/resource/prompt/event, form, panel or React application. No installations, runtime changes, migration, publication, Git action or unsolicited communication. No new policy gate, parallel acceptance store, rerouting of unrelated runs or fabricated independent review. No broad runtime test suite for a documentation-only diff.

## 6. Risks And Blockers

- Block later work if target, scope, source approvals, revision integrity or required Brownfield preparation is invalid.
- Revise the concept when a criterion, design decision, required walkthrough, source or authority boundary is missing or contradictory.
- Revise/block QA for unevidenced prevention/live-host claims, hidden fallback assurance reduction, duplicate policy/state ownership, unsupported human attestation described as valid, or roadmap authority beyond this run.
- Unknown installed/live capabilities are explicit limitations with owner/dependency. They are not automatically failures of concept acceptance; misleading or unresolved consequences are failures.
- If a materially new product promise is needed, route to PRD revision. If design decisions must change, return to SD. Do not rewrite approved source artefacts silently.
- Review findings use the existing quality.md gap classification. Same-agent review is disclosed; a fresh context or separate model is never claimed without evidence.
- Reassess Context Graph impact on closeout; any durable reusable concept decision must be curated through its existing owner, without automatically turning proposals into runtime policy.

## 7. Next Step

Review this persisted Task/Test Plan and approve only with `Approval: TP`. Approval permits implementation-preparation Brownfield Analysis, then production and verification of the concept within the declared paths. It does not permit implementation of proposed runtime, MCP or host mechanisms.

## AGDF Approval Summary (de; source=en)

- Aufgaben: Zehn Schritte führen von der erneuten Brownfield-Prüfung über Ist-/Zielmodell, Kontrollkatalog, Freigaben, Ergebnisprüfung, MCP-/Host-Matrix und Fehlerabläufe bis zur Roadmap und den Reviews.
- Liefergegenstand: Ein vollständiges CONCEPT.md mit Quellen, Grenzen, Entscheidungen und Abdeckung der freigegebenen Anforderungen. Die vorgeschlagenen technischen Mechanismen werden in diesem Run nicht umgesetzt.
- Zuordnung: Alle neun PRD-Kriterien und alle neun SD-Entscheidungen sind konkreten Aufgaben und insgesamt 22 Prüfszenarien zugeordnet. Alle sieben UR-Abnahmesignale werden nachgewiesen.
- Fehlerprüfung: Die dreizehn SD-Abläufe umfassen Normalfall, direkte Umgehung, veraltete oder falsche Freigaben, Wiederholung, Parallelität, Ablehnung/Abbruch, Neustart, Verbindungsverlust, fehlende Host-Fähigkeit, falsche Ergebnisnachweise, Manipulation und selbst gewählte Prüftiefe.
- Nachweise: Repository-Quellen und datierte offizielle Protokoll-/Host-Dokumentation werden getrennt von installierten und live beobachteten Fähigkeiten geführt. Fehlende Live-Nachweise bleiben sichtbar unbekannt und erhalten eine spätere Prüfpflicht.
- Prüfung: Struktur, Verweise und Abdeckung werden kontrolliert; die Abläufe werden zusätzlich inhaltlich geprüft. Ein Dokument-Walkthrough wird nicht als Laufzeittest ausgegeben. Der tatsächliche Diff muss auf Konzept und nötige Run-Buchführung begrenzt bleiben.
- Reviews: Planerfüllung, strukturelle Qualität und Dokument-Diff werden geprüft; QA trifft anschließend die alleinige Qualitätsentscheidung. Die tatsächliche Unabhängigkeit der Prüfer wird offen angegeben.
- Grenzen: Keine neue MCP-Schnittstelle, kein Host-Adapter, Hook, Panel, React-Projekt, Ereignisdienst, keine Installation oder Veröffentlichung. Bestehende Freigaben anderer Runs werden nicht übernommen.
- Nächster Schritt: Nach TP-Freigabe erfolgt zuerst Brownfield Analysis, danach die Erstellung und Prüfung des Konzepts. Die nächste menschliche Qualitätsentscheidung bleibt Approval: QA.
