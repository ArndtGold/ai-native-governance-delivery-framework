# Brownfield Analysis: Intermediate cards and relationship maintenance

Date: 2026-10-03
Mode: pre_implementation_analysis
Run: agdf-intermediate-status-card-reduction-20261002-01
Status: done
Decision: pass for implementation preparation
Basis: approved UR, PRD Revision 2, SD and TP; source HEAD c24d9be19c854262edc8569ae86f3824e4a80462 with the separately recorded dirty worktree.

## Scope and current coverage

This analysis verifies the existing-system path for T-001 through T-006. It grants no approval and does not waive TP's positive before-workflow prerequisite. Production edits remain dependent on that recorded baseline. Nothing here claims execution, host reduction, QA or release readiness.

| Surface | Coverage | Existing owner and evidence | Reuse strategy |
|---|---|---|---|
| Event policy and visible field semantics | partially_done | plugins/agdf/meta/contracts/interaction.md already owns status, approval orientation and internal transition narration | extend the event policy here; consumers reference it |
| Bound continuation | partially_done | packages/core/lib/skill-dispatch/service.js routes post-UR review, artefact preparation, post-TP analysis and post-UAT closeout | extend this orchestration within existing outcome/target/control contracts |
| Pure permission evaluation | fully_done for current permission rules | packages/core/lib/control-evaluation/gate-policy.js permits CD+Tests after TP and Brownfield Analysis; gate-check.js derives current status | retain authority and required checkpoints |
| Required relationships | partially_done | packages/core/lib/control-evaluation/delivery-map.js has the registry, applicability and diagnostics; currently requires a relationship after its gate is satisfied | extract the existing registry once and add prospective readiness |
| Artefact recording | partially_done | packages/core/lib/control-state/run-steps.js and run-recording.js own canonical recording; UR approval alone writes its approved_by row | extend run-step with the approved typed artefact operation |
| Revision, approval protection and atomic publication | fully_done for existing operations | run-state-writer.js owns locking, expected-content/revision checks, protected approval changes and atomic rename | retain this sole publication owner; extend validation |
| Run/backlog commit and fault recovery | fully_done for existing operations | run-step-transaction.js and run-step-pending.js define lock order, journal and Run commit point | reuse when recording affects backlog; do not introduce another transaction manager |
| Structured sealed relationship provenance | not_done | run-state-parser.js allows optional sections; approval-operations.js supplies an existing strict receipt encoding precedent | add subordinate binding evidence in existing Run state, retaining legacy compatibility |
| Exact-proof clerical correction | not_done | service.js coordinates evaluation; state writer owns mutation; pure evaluators have no correction operation | injected Core operation before output with one attempt and fresh validation |
| Human card rendering and locales | fully_done for existing cases | packages/core/lib/interaction-presentation.js and plugins/agdf/meta/agdf-interaction-locales.json | extend affected cases; preserve sole renderer and all-locale validation |
| Projection/package integrity | fully_done for existing distribution | scripts/sync-package-assets.js and existing package/provider/runtime boundary tests | synchronize canonical changes through the existing projections |

## Visible-state finding and baseline candidate

gate-policy.js lines 228 onward already permits implementation, tests and evidence maintenance in CD+Tests without another human approval. gate-check.js maps CD+Tests to next_skill none. In service.js, the continue_delivery route only hands off when next_skill names another skill or a specific preparation/closeout branch applies. An otherwise open CD+Tests request therefore reaches deterministic_control and returns terminal control_result with a complete status card. A bound request can consequently stop despite no new user decision or blocker.

This is a source-evidenced candidate for W-01, not yet an observed positive baseline. The installed gate-check skill's dispatch-first rule supplies the existing consumer: an already permitted change request needs its bound preflight. The investigation must start the isolated fixture already within CD+Tests. The first live transition from Brownfield Analysis to CD+Tests is a protected permission change and must not be counted as redundant. No unnecessary status call may be added to inflate the comparison.

Existing dispatcher tests cover post-TP Brownfield continuation and terminal deterministic results, but do not establish reduced visible output during an already permitted CD+Tests workflow. Deterministic source emission and actual Codex observation are separate evidence lanes. T-001 must freeze the former before production edits; T-006 still needs the actual matched host observation.

## Interfaces, data and compatibility

- The CLI grammar change is confined to existing run-step's new artefact step. Command registry/handler adapters delegate to Core; no extra MCP endpoint or mutation route in pure evaluation.
- The binding receipt section is optional, sealed evidence within RUN_STATE.md, versioned and strictly decoded. Absence is valid legacy data but cannot authorize correction. Existing valid operative relationship rows retain their meaning.
- Destination pointer, reviewed source binding, chain row and audit are committed as one candidate Run revision. Current approved bytes and approval receipts are protected. Exact approval integrity comes from full stored evidence, never the abbreviated human digest.
- Correction requires one unambiguous previously sealed binding, unchanged contained files, current expected revision and unchanged permission envelope. Prose, inferred gate order, multiple omissions, unrelated blockers, pending transactions and invalid seals are ineligible. Existing terminal output is never intercepted after emission.
- No persistent visibility cache, alternate policy/gate owner, schema migration or control-state version change is needed. Run-specific evidence remains under this run.

## Regression risks and required verification

| Finding | Classification | Owner and mitigation / exit condition |
|---|---|---|
| A relationship-only gap can route back to drafting or be detected after approval | problem | Core registry/readiness owners; pass prospective registry matrix and preparation-loop negatives |
| Receipt or correction logic could indirectly authorize work | problem | Core writer and dispatcher; exact approval snapshots, before/after permission parity, stale/foreign/changed-byte negatives |
| Publication faults or competing writers could expose partial accepted control | problem | Existing writer/transaction owners; pre/post-commit and same-revision concurrency scenarios |
| Existing terminal continuation can stop routine work | problem | Existing dispatcher/interaction owners; freeze eligible deterministic before output, retain protected events and terminal byte equality |
| Source replay may be mistaken for actual host behavior | problem | T-006 evidence owner; separate source, candidate, installed and human-visible Codex lanes; missing host observation blocks the relevant acceptance claim |
| Canonical and generated instructions/locales could diverge | problem | Existing sync/renderer owners; all-language rendered matrix, integrity and idempotence checks |

No accepted debt or unresolved owner decision is introduced. Baseline eligibility is a required evidence prerequisite, not a new governance gate. If it fails, stop production edits and record the concrete gap under TP; do not substitute relationship-only W-04.

## Minimal safe implementation path

Complete this internal record, then secure T-001's positive eligible W-01 and exact source/worktree/artefact/runtime inputs. Reuse the single relationship registry for prospective readiness; extend existing run-step/writer for strict atomic recording; integrate the one-proof correction in existing dispatcher orchestration; align canonical interaction consumers/locales and synchronize projections. Run T-006's scoped suites and required reviews only after the implementation is stable. A missing actual host observation remains an explicit QA gap.

Existing installation-repair deletions plugins/agdf/hooks/hooks.json and session-start.sh are a separate pre-existing delta. No installation, fresh model/agent/thread run, VCS or release action is authorized here.

## Context Graph and knowledge ownership

- memory_target: scope_artifact
- memory_reason: This is preparation evidence for the selected run; implementation decisions remain owned by approved SD and existing canonical modules.
- memory_refs: .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_ANALYSIS.md
- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority
- context_graph_required_action: link
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes are linked for renderer and dispatcher ownership. No new node, alternate source of truth or completed implementation is claimed.

## Next permissible action

Record the completed internal Brownfield Analysis, capture and assess T-001's frozen before workflow, and redispatch gate-check for the same target/run with continue_delivery. Implementation is conditional on the TP prerequisite; QA, UAT and release remain gated.
