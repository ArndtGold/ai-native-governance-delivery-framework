# PRD: One Explicit Approval-Recording Command

Status: draft
Gate: PRD
Gate approval: open
Based on: Approved UR.md and completed BROWNFIELD_REVIEW.md
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one explicit command contract for recording a new deliberate reply to a current, previously prepared AGDF gate presentation. The existing CLI and a local programmatic consumer use the same canonical service, policy and writer. The operation reports its bound request, actual resulting Run state, replay/conflict behavior and cooperative authority limit. The reference end-to-end scenario uses a UR approval; other existing gate semantics and supported CLI inputs remain compatible.

The first slice uses existing MCP tools for read-only observation only. It introduces no mutating MCP registration, kernel package requirement, independent human-proof lane or external identity dependency. This choice allows the command boundary and persistence guarantees to be accepted independently before a later transport expansion.

The supported lane records a caller-forwarded deliberate human reply under the existing cooperative host contract. Neither a caller's role/origin label, prepared presentation, filesystem hash nor successful tool execution may be reported as independently verified human authority. Requests claiming stronger verification are rejected rather than downgraded silently.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready; UX_INTENT_DEFINITION.md, analytical input only
- primary_user_intent: Record the decision I deliberately gave for the exact artefact I reviewed, and understand its effect and assurance.
- success_signal: One decision produces one observable transition; retries, stale requests and interrupted execution give an accurate result and actionable next step.
- primary_decision_or_action: Approve, request revision or decline the current gate; only the current deliberate exact approval reply changes approval state.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| inspect | No approval or mutation; current Run and limitations are visible | not_ready, current_gate, independent_human_proof_unavailable | Canonical Run and existing gate policy | Existing AGDF status presentation |
| decide | A current prepared presentation awaits a new reply | awaiting_decision, revised_or_declined | Human owns decision; canonical Run determines eligibility | Existing AGDF gate presentation |
| submit | One accepted transition or no accepted change | accepted, rejected_stale, rejected_conflict, unsupported_authority | Canonical approval service and Run; cooperative reply provenance is explicit | Existing command consumer using the canonical result |
| retry_or_recover | Original logical effect is identified or conflict/recovery is required | already_applied, retryable_failure, recovery_required | Canonical Run/operation evidence, never caller-declared success | Existing command consumer using the canonical result |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Explicit Run-bound work and a new deliberate reply after its prepared presentation. Status, prepared-but-unanswered presentation, cancellation, missing reply, revision request and decline never grant approval. Existing repository activation and technical host permissions remain independent.
- blockers_and_visible_next_actions: Missing or stale presentation requires fresh current presentation and a new reply; wrong target/Run/gate or unsupported authority needs corrected binding/assurance; unmet prerequisites route to the existing next permitted step; concurrent write permits safe same-request retry; unknown interrupted state requires supported recovery.
- recovery_paths: Show a visible retry instruction for recoverable transient failure. A retry of a completed request reports the original effect without another revision. A changed binding is not a retry of the original decision. Recovery never transfers approval to new content or another Run.
- relevant_state_transitions: Waiting plus valid new reply becomes one recorded approval and the canonical next gate. Completed-request replay becomes already-applied with the original result. Stale/conflicting input is rejected without accepted change. Interrupted execution becomes a determinable accepted/no-effect outcome or explicit recovery-required state.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: submit
  - source_state: current prepared gate with eligible prerequisites
  - trigger/action: submit one exact deliberate approval reply for the bound target, Run, gate and revision
  - expected effective state: one approval transition through the existing canonical owner; structured result identifies the action, original binding and resulting revision/current gate
  - visible feedback: The consumer shows what was recorded and the next permitted action from the authoritative result.
  - blocker/failure behavior: A malformed or unrelated command cannot become a generic state write or force transition.
  - recovery/next action: Correct the request or follow the existing gate prerequisite.
  - observable success: CLI and local programmatic consumers use the same decision/mutation service and equivalent fixtures reach the same semantic result.
  - required evidence: Shared-service call-path inspection and CLI/local-consumer integration scenarios.

- criterion_id: AC-002
  - working_mode: inspect, decide
  - source_state: unapproved current Run
  - trigger/action: inspect status, prepare presentation, wait, revise, decline or provide no reply
  - expected effective state: no approval is recorded; only the already-supported presentation bookkeeping may be created
  - visible feedback: The user sees the actual pending decision and no invented approval.
  - blocker/failure behavior: A status result or earlier conversation reply cannot authorize the submit transition.
  - recovery/next action: Present current content and obtain a new deliberate reply when approval is desired.
  - observable success: Approval rows and Run revision do not advance from read/wait/non-approval operations.
  - required evidence: Before/after snapshots for all selected read and non-approval cases.

- criterion_id: AC-003
  - working_mode: inspect, decide, submit
  - source_state: cooperative local decision lane
  - trigger/action: inspect the guarantee or submit caller-provided role/origin claims, model-authored assertions or a claim of independent human verification
  - expected effective state: Cooperative assurance remains explicit; no supplied assertion upgrades it. Unsupported stronger verification requests are rejected without mutation.
  - visible feedback: The result says that the host/agent forwards a deliberate reply and that independent human visibility/decision proof is unavailable.
  - blocker/failure behavior: Neither an actor label, presentation record nor content hash is accepted as independent authority evidence.
  - recovery/next action: Use the existing deliberate-reply workflow with its explicit trust assumption; stronger guarantees require a separately accepted producer/verifier scope.
  - observable success: No accepted result claims independent human verification in this slice, including negative fabricated-authority inputs.
  - required evidence: Schema/command boundary cases and visible result evidence; no fixture is mislabelled as real human proof.

- criterion_id: AC-004
  - working_mode: submit
  - source_state: presentation or evaluated decision bound to an earlier snapshot
  - trigger/action: change the Run revision, gate, relevant artefact or prepared presentation before submission
  - expected effective state: the earlier decision is rejected; the current canonical state is preserved
  - visible feedback: The consumer identifies the stale or mismatched binding and required next action.
  - blocker/failure behavior: It cannot transfer an old reply to changed content, target or Run.
  - recovery/next action: Prepare the current gate again and obtain a new deliberate reply.
  - observable success: Every selected stale/mismatched scenario has no accepted approval effect.
  - required evidence: Revision/artefact/presentation changes and foreign target/Run/gate negative scenarios.

- criterion_id: AC-005
  - working_mode: submit
  - source_state: two consumers share the same eligible pre-transition snapshot
  - trigger/action: submit competing requests concurrently
  - expected effective state: one coherent accepted transition; no lost update or contradictory accepted state
  - visible feedback: Other consumers see already-applied for an identical logical request or a precise conflict for a different request.
  - blocker/failure behavior: Concurrent writes cannot overwrite another accepted decision.
  - recovery/next action: Retry the same logical request or inspect the current state before a new decision.
  - observable success: Recorded approval and logical transition occur once, with consistent resulting revision.
  - required evidence: Real concurrent local-process scenarios and final authoritative state inspection.

- criterion_id: AC-006
  - working_mode: retry_or_recover
  - source_state: original command completed but its response was lost
  - trigger/action: repeat the exact logical request
  - expected effective state: no new approval or revision; the original effect and its resulting revision are returned as already-applied
  - visible feedback: The caller can distinguish accepted replay from stale unrelated input and see the current next action when state has since progressed.
  - blocker/failure behavior: Reusing request identity with different content or binding is rejected; replay is not a new execution authorization.
  - recovery/next action: Continue from current state; material changes require a new presentation and decision.
  - observable success: Repeated accepted requests and changed-payload replays have deterministic, distinguishable outcomes.
  - required evidence: Response-loss replay, subsequent Run progress and changed-payload cases.

- criterion_id: AC-007
  - working_mode: retry_or_recover
  - source_state: execution is interrupted before or after authoritative commit
  - trigger/action: inject a write/process failure and retry or inspect recovery
  - expected effective state: no duplicate logical approval; accepted effect and associated operation evidence agree, or explicit recovery is required
  - visible feedback: A recoverable failure names the safe retry; an unknown/conflicting state reports recovery-required without claiming success.
  - blocker/failure behavior: Unknown or changed recovery data cannot be guessed into approval.
  - recovery/next action: Use the supported same-request recovery or resolve the reported authoritative conflict.
  - observable success: Failure boundary scenarios establish unchanged pre-commit state or one recoverable committed effect; unrelated Run/artefact bytes remain unchanged.
  - required evidence: Fault-injection and process-interruption scenarios around the selected commit boundaries.

- criterion_id: AC-008
  - working_mode: inspect, decide, submit, retry_or_recover
  - source_state: existing CLI consumers and historical Run records
  - trigger/action: use supported current inputs and compare the complete reference workflow before/after
  - expected effective state: Existing exact-reply, gate and presentation requirements remain intact; no historical approval gains new provenance; MCP inspection remains read-only
  - visible feedback: Compatibility limits and baseline/result measurements are explicit; absent improvement is reported.
  - blocker/failure behavior: No stronger historical guarantee, automatic install/release or extra routine human decision is introduced.
  - recovery/next action: Use the unchanged supported lane; incompatible design requires revision before implementation.
  - observable success: Existing relevant regressions remain valid; measured calls, presentation repetition and manual corrections are reported without a fabricated reduction target.
  - required evidence: Compatibility fixtures, package/source propagation checks and dated workflow observations.

- criterion_id: AC-009
  - working_mode: all
  - source_state: source, protocol, installed-runtime and visible host evidence have different availability
  - trigger/action: inspect the evidence or consumer result for the selected transition
  - expected effective state: Relevant observations and missing information are explicit; evidence classes and trust assumptions cannot substitute for each other
  - visible feedback: The user can distinguish repository proof, installed-path execution and human-visible host observation.
  - blocker/failure behavior: An unavailable required observation cannot silently produce a stronger accepted guarantee.
  - recovery/next action: Collect the named missing evidence or retain the clearly stated supported guarantee ceiling.
  - observable success: QA can trace each claim to the exact scenario/environment and independently identify absent host proof.
  - required evidence: Operation/observation contract cases and a separated qualification report; real host decisions require visible multi-turn evidence.

## 6. Non-Goals

No mutating MCP tool; no universal kernel package or generic set-state API; no independent human-verification implementation, identity platform or role model; no prevention of arbitrary shell writes; no protected merge/release execution; no historical approval recovery; no MGDF changes; no automatic install, publication or VCS action. These boundaries are product scope, not shortcuts that permit stronger guarantees.

## 7. Users And Roles

Arndt Gold owns this PRD and decides product scope. The human user owns each deliberate gate decision. The host/agent forwards the current reply under a cooperative assumption. Canonical AGDF policy/approval services determine eligibility and effect. CLI/local consumers report the same result; MCP remains a read-only observer. QA remains the sole Quality Readiness decision owner.

## 8. Constraints

Reuse existing policy, presentation, Run and writer owners. Preserve current exact formulas and earliest-gate routing, existing supported CLI invocation and historical approval meaning. Keep operation evidence under the current control-state authority; introduce no independently editable approval ledger as a second source of truth. The SD must define compatibility, replay identity and recovery without weakening these constraints.

## 9. Evidence Requirements

Use fresh isolated Runs for destructive/concurrent/failure fixtures. Record exact source/runtime identity, platform and scenario. Cover the selected command via real CLI and local programmatic consumers; existing MCP observation must stay non-mutating. Separate deterministic tests from installed-path and visible human-host evidence. Measure the same declared baseline/result workflow, including errors and retries. Linux/native Windows evidence is required for claims on those platforms; if unavailable, report the qualification limit and do not claim it passed.

## 10. Risks And Open Questions

The selected host does not provide an independently evidenced human-decision channel; cooperative assurance is therefore the product ceiling. Direct filesystem access remains outside the command boundary. Lost-response acknowledgement and authoritative Run commit need a consistent design, not a parallel ledger. A command envelope must not duplicate gate policy or infer action permission from descriptive text. Existing Git-observation differences require a decision about relevance for this transition. Related recovery work's historical provenance gap remains open under its own Run.

## Approval Decisions

These are concrete proposed product choices for this PRD, derived from the approved UR and Brownfield Review. They become binding only when this exact PRD is approved.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| One complete transition | before_prd | resolved | Record a current prepared gate approval; use UR as the reference scenario and preserve other existing supported gate semantics. | Arndt Gold |
| Consumer scope | before_prd | resolved | Existing CLI plus local programmatic consumer share the command service; existing MCP tools observe read-only. No new MCP write tool in this slice. | Arndt Gold |
| Authority ceiling | before_prd | resolved | Cooperative caller-forwarded deliberate reply only; unsupported independent-verification claims are rejected. No fabricated human receipt or identity dependency. | Arndt Gold |
| Retry and interruption promise | before_prd | resolved | Exact completed-request replay identifies the original effect without another revision; altered request identity/binding conflicts; unknown interruption is explicitly recoverable or blocked. | Arndt Gold |
| Compatibility and qualification | before_prd | resolved | Preserve existing supported CLI and historical approval semantics; qualify source, installed and visible host evidence separately; no installation/publication/VCS action. | Arndt Gold |
| User effort | before_prd | resolved | Measure the comparable workflow and expose absence of improvement; do not add routine human gates or promise an unmeasured percentage/step reduction. | Arndt Gold |
| Command/result and recovery design | later_sd | deferred | Define typed action binding, operation identity, canonical authoritative evidence, commit/replay protocol, freshness and compatibility treatment for the approved criteria. | AGDF control-state and approval-service owner |
| Executable evidence plan | later_tp | deferred | Map every criterion and SD decision to tasks, boundary scenarios, fault/concurrency checks and qualified environment evidence. | AGDF task/test-plan owner |

## 11. Next Step

Review this exact PRD. A new deliberate `Approval: PRD` permits Solution Design drafting for these product choices; SD, TP and implementation approvals are not inferred.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Eine bewusst gegebene Gate-Entscheidung für die tatsächlich geprüfte Fassung einmal speichern und ihre Wirkung sowie Beleggrenze verstehen.
- Umfang: Ein gemeinsamer Vertrag für das Speichern einer bereits präsentierten Freigabe, genutzt durch bestehende CLI und lokalen programmatischen Verbraucher. MCP bleibt in diesem Slice lesend. Referenzfall ist die UR-Freigabe; bestehende Gate-Regeln bleiben erhalten.
- AC-001: Ein konkreter Auftrag erzeugt über denselben fachlichen Service genau einen gebundenen Übergang und ein nachvollziehbares Ergebnis mit Folgerevision und nächstem Schritt.
- AC-002: Status, Vorbereitung, Warten, Überarbeitung, Ablehnung und fehlende Antwort erzeugen keine Freigabe.
- AC-003: Die lokale Spur bleibt ausdrücklich kooperativ. Agentenangaben, Rollenlabels, Präsentationsdateien und Hashes beweisen keine unabhängig bestätigte menschliche Entscheidung; unbelegte stärkere Verifikationsansprüche werden ohne Mutation abgewiesen.
- AC-004: Geänderte Revision, Artefakt, Gate, Präsentation oder fremdes Ziel lassen eine alte Entscheidung nicht auf neue Inhalte übergehen; es braucht eine neue Präsentation und Antwort.
- AC-005: Gleichzeitige Verbraucher erzeugen einen konsistenten Übergang; identische Wiederholung wird als bereits ausgeführt erkannt, andere Konkurrenz als Konflikt.
- AC-006: Eine verlorene Antwort führt bei exakter Wiederholung zur ursprünglichen Wirkung und keiner Doppelrevision. Geänderte Wiederholungen werden abgewiesen; spätere Fortschritte werden nicht zurückgesetzt.
- AC-007: Unterbrechung und Recovery verdoppeln keine Wirkung. Unbekannter Zustand bleibt sichtbar blockiert; sichere Wiederholung beziehungsweise nötige Wiederherstellung wird benannt.
- AC-008: Bestehende Aufrufe und historische Freigaben behalten ihre Bedeutung. Vergleichbare Aufrufzahlen, wiederholte Darstellungen und manuelle Korrekturen werden gemessen; fehlender Gewinn wird berichtet.
- AC-009: Beobachtungen und fehlende Nachweise bleiben sichtbar. Quelltests, installierter Pfad und menschlich sichtbare Host-Beobachtung werden getrennt qualifiziert.
- Entscheidungen: Vorgeschlagen sind eine Freigabeoperation, CLI und lokaler Service ohne MCP-Schreiben, kooperative Autorität ohne unabhängigen Nachweiskanal, eindeutige Wiederholung und kompatible Einführung. Speicher-/Recovery-Design folgt in SD, konkrete Tests in TP.
- Abgrenzung: Kein universeller Kernel-Umbau, keine historische Freigabereparatur, keine Identitätsplattform, keine Shell-Schreibsperre oder Merge-/Release-Durchsetzung, keine MGDF-Änderung und keine automatische Installation oder Veröffentlichung.
- Offen: Das technische Design muss Request-Identität, konsistente Ergebnisaufzeichnung und sichere Wiederherstellung mit den bestehenden Eigentümern lösen. Ein unabhängiger menschlicher Nachweis bleibt außerhalb der zugesagten Garantie dieses Slice.
