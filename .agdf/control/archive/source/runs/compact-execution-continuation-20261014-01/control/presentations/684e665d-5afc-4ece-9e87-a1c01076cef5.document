# SD: Bound compact execution through existing Core owners

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-14
Owner: Arndt Gold
Run: compact-execution-continuation-20261014-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing evaluated operation and dispatcher handoff rather than adding an orchestration store or another implementation skill. Core remains the sole permission/state owner. An authorized bound continuation at a current executable compact state receives a nonterminal skill_continuation using the existing gate-check execution owner. The handoff carries target, Run, current revision, mode, current operation, source references and the existing runtime contracts. It grants no new gate authority.

The pure policy supplies a semantic implement_compact_scope operation with operation_key implementation.execute for permitted unfinished compact implementation. The dispatcher translates that already validated operation into a compact_implementation continuation, with route-specific instructions. It does not parse presentation text or independently reimplement eligibility. Existing structured implementation and Verified Change record preparation retain their current branches.

Canonical progress governs subsequent work. Applicable completed Code Review in a Quick Task routes to its existing compact closeout owner without issuing another implementation handoff. An executed valid Verified Change is already at OR and uses its existing mini-closeout owner. Completed Runs yield terminal completion with no execution. Interrupted work without sufficient current evidence receives revalidation and explicit inspection of unfinished obligations, never a durable exactly-once claim.

## 2. Ownership And Source Of Truth

| Concern | Existing owner | Design responsibility |
|---|---|---|
| Effective permission and compact phase | packages/core/lib/control-evaluation/gate-policy.js; gate-check.js | Derive the semantic compact action from validated current facts, lifecycle and evidence applicability. |
| Verified Change eligibility and execution evidence | packages/core/lib/control-evaluation/verified-change.js | Preserve baseline/HEAD, candidate cleanliness, scope, declared impact and validation/propagation checks. |
| Handoff | packages/core/lib/skill-dispatch/service.js | Produce one bound nonterminal compact continuation only for the canonical permitted operation. |
| Application continuation | packages/core/lib/delivery-continuation/service.js | Preserve its existing bounded relationship correction and fresh routing; no implementation loop or new writer. |
| Actual implementation and review | Existing gate-check execution and code-review owners | Inspect current evidence, perform unfinished approved scope, run checks and record actual reports. |
| State/evidence/revisions | packages/core/lib/control-state/run-steps.js; run-recording.js; run-state-writer.js | Reuse current exact recording, revision, locks, receipts and backlog projection. |
| Quick Task closeout | Existing release-or owner and supported run-step closeout / closeout.record | OR-lite and required Code Review remain mandatory; no new completion formula. |
| Verified Change closeout | Existing release-or compact record owner and supported run-update revision boundary | Preserve lifecycle-consistent VERIFIED_CHANGE.md mini-closeout and role bindings; do not invoke unsupported closeout.record for this route. |
| User presentation | Existing interaction-presentation.js and interaction.md | Preserve terminal verbatim stops, real decisions and localized status; executing handoffs use brief progress. |
| Host access and installation | Existing CLI Git adapter, MCP Core runtime, generators and Codex installer | Preserve actual transport access; install through the supported path and observe exact candidate identity. |

PRD.md is product authority. BROWNFIELD_REVIEW.md supplies route/ownership evidence. This design is the sole technical decision artefact for the increment; source/control files retain their existing ownership.

## 3. Architecture Decisions

- SDD-001: Derive compact implementation in the existing Core policy and translate it in the existing dispatcher; rationale: both compact states currently resolve to effect none despite permitted execution; consequence: additive semantic operation/continuation values need contract and regression coverage, while existing schema envelopes and public command flags stay unchanged.
- SDD-002: Consume fresh Verified Change eligibility and exact record/source facts, preserving each transport's available Git observations; rationale: permission cannot be inferred from record labels or caller assertions; consequence: installed CLI can demonstrate eligible execution, while current MCP keeps concrete Git-unavailable refusals instead of receiving a new Git capability.
- SDD-003: Gate every compact handoff by authorized continue_delivery, same bound target/Run, active lifecycle, current revision, open nonblocked state, no missing approval and the canonical executable operation; rationale: advisory/status and stale/conflicting material must not become implementation; consequence: all terminal recovery/decision boundaries remain authoritative.
- SDD-004: Derive remaining compact work from existing current evidence and route fulfilled review/executed/completed states to existing closeout or terminal owners; rationale: the unchanged compact gate alone cannot distinguish unfinished work from reviewed work; consequence: preserve current receipts/applicability and existing run-update semantics, with no new persistent implementation marker or exactly-once guarantee.
- SDD-005: Keep structured execution and preparation branches unchanged; synchronize affected focused contracts and existing localized presentation values through current generators; rationale: source/runtime/host instructions must agree on execution and stop meaning; consequence: every changed registered locale/card/state is rendered, and existing stable schema/flag and gate meanings remain compatible.
- SDD-006: Verify source, generated package, supported local Codex install and actual installed CLI/STDIO separately on disposable targets; rationale: a source pass or stale running generation cannot prove the requested installed fix; consequence: exact-build identity and transport limitations are retained, with any native host reconnect preceded by a complete observation sequence.

## 4. Integration Points

### Policy to dispatcher

Keep existing next_operation shape: type, operation_key, actor, effect, gate and skill_id where applicable. implement_compact_scope is an additive semantic type for actor agent/effect implementation/skill_id gate-check. It is selected only from an already permitted compact decision. Existing record_closeout / closeout.record operation meaning represents unfinished compact closeout; no arbitrary next_allowed_action sentence is executable input.

For an active Quick Task, current passing/fulfilled CR evidence routes to record_closeout with release-or instead of implementation. The outward gate remains the existing Quick Task Execution until the existing closeout writer completes the Run. Stale, absent or nonpassing review does not prove fulfillment. Existing actual review findings and current permitted scope constrain further correction; no review label grants upstream changes.

For Verified Change, missing/draft record keeps verified_change_record preparation; valid eligible record supplies implement_compact_scope; executed record retains the existing OR path; invalid/unproven/escalated facts keep existing block/escalation. The dispatcher consumes the final gate-check operation after integrity/readiness overrides, not an earlier policy guess.

### Bound continuation packet

The packet uses compact_implementation for gate-check, target/Run/revision and mode. It contains the current UR path/digest and, for Verified Change, the validated canonical record path and its declared scope/validation facts. Obtain these through existing evaluated contained readers, never another filesystem search or caller-supplied replacement. A missing current source/record or unsafe path stops before executing or emitting success.

The instruction requires inspecting current applicable execution/review facts before changing files, preserving approved UR semantics, performing only unfinished work, running relevant or declared deterministic checks, and recording actual evidence/review/closeout through supported current owners. After recorded changes, redispatch the same target/Run with continue_delivery; do not retain the old revision as permission.

The compact closeout handoff uses the existing release-or skill, phase compact_closeout and current target/Run/revision. Quick Task uses the existing OR-lite writer and report; Verified Change uses its complete linked mini-closeout and existing run-update publication. No implementation instruction is included in this closeout packet. Separate unrelated VCS requests remain explicit user authority.

### Writer boundaries

Reuse supported step.record/run-step for actual bounded evidence and Quick Task Code Review, and existing closeout.record/run-step closeout for Quick Task OR-lite. A recorded review is accepted only according to its actual report and current applicability; the writer owns receipts and dependent projections.

Verified Change's existing record lifecycle and role links are published through its documented run-update boundary, retaining approval rows and sealed history. Core closeout.record currently supports structured and Quick Task report formats, not Verified Change; this repair does not widen that command schema or pretend it accepts the compact record. Validate the updated executed record and mini-closeout with the installed CLI Git-aware evaluation before claiming completion. Finished historical executed state retains its existing persisted-snapshot validation.

### Access adapters

packages/cli/lib/cli/validation-handlers.js injects evaluateGateWithCliGit and the CLI Git observer. The MCP runtime creates Core services without those child-process observations; evaluateVerifiedChange defaults to unavailable observations and explicitly blocks active baseline validation. Preserve that separation. The repair adds no MCP Git subprocess, credential, authority flag or fallback that marks missing observations as eligible.

## 5. Constraints And Compatibility

- No new gate, approval formula, skill, authoritative state store, command group or public CLI flag.
- Existing terminal=true behavior remains a real stop. Never run work after a terminal card; executable compact paths must be nonterminal before being emitted.
- Continue only after the final fresh Core report is open, permits this operation and retains exact target/Run/revision. Preserve source changes, seal findings and unrelated blockers.
- Keep current criteria/source/evidence binding and canonical locking/idempotent writer receipts. Handoff repetition is not a writer receipt or a proof of exactly-once implementation.
- Preserve compact eligibility, required review/OR-lite, Verified Change declared files/commands, escalation and existing completion rules. Previously completed Runs must not reopen automatically.
- Additive operation/phase values are documented in existing contracts and tests. Known structured implementation and compact preparation consumers stay valid; unknown or missing operation values fail closed to existing recovery/status behavior.
- Generated assets use the existing synchronization and content-derived install version. No public release or canonical version bump is part of this design.
- The separately identified duplicate Delivery Map analysis remains outside this increment.

## 6. Test And Evidence Strategy

TP maps the canonical PRD criteria and these decisions to scenarios using existing dispatch/compact/MCP test owners. Include policy operation selection, actual dispatcher handoff, same-Run source binding, missing prerequisites, unreadable records, stale/foreign revisions, changed approvals/scope/baselines, read-only status, review applicability, executed/complete state, interrupted re-entry and existing structured/preparation behavior.

Extend the retained installed-code unit baseline with current positive/negative cases after implementation, but keep its explicit substituted seams. Add disposable Git-aware canonical flows through the supported installed CLI and actual installed STDIO exchanges. Verify Quick Task MCP continuation; verify the current Verified Change MCP access refusal with its actual diagnostics, not a mocked eligible result presented as protocol success.

For installation: synchronize/build through normal tooling, use install:codex, check source/runtime digests and marketplace/cache coherence, and launch the updated installed launcher. Keep source, generated package, installed root, runtime generation and observed host lanes separate. Prepare any required native reconnection with exact candidate and observation sequence; a restored old tool namespace is not fresh qualification.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Core implement_compact_scope and bound compact_implementation handoff for current unfinished Quick Task work | Core gate-policy/gate-check and skill-dispatch/service.js; existing gate-check execution owner | SDD-001 | Additive semantic values; retain schema/flags and test canonical permission before routing. |
| AC-002 | Eligibility-driven Verified Change packet; preserved preparation, scope/command facts and access blockers | Existing verified-change.js and contained record reader; CLI Git adapter and MCP runtime | SDD-002 | Current MCP cannot establish active Git eligibility; preserve refusal and verify CLI positive path separately. |
| AC-003 | Final evaluated state and exact active bound continuation guard before any implementation packet | Existing Core evaluator, approval/integrity owners and dispatcher input contract | SDD-003 | Missing/stale/foreign/blocked state must retain existing terminal behavior; refusal matrix required. |
| AC-004 | Current evidence selects unfinished implementation, compact closeout or completed terminal state; existing recording/revision owners publish results | Core policy, evidence applicability, run-steps/run-recording and existing release-or compact owners | SDD-004 | Compact gate can persist while work advances; no new marker/exactly-once claim, no replay from stale review or old record. |
| AC-005 | Preserve structured/preparation branches and generated focused contracts/localized output | Existing dispatcher, interaction renderer, locale registry and asset generators | SDD-005 | One instruction/presentation authority; render all affected locales and protect existing execution tests. |
| AC-006 | Normal local installation and exact-build disposable installed CLI/STDIO qualification with explicit native limits | Supported Codex installer, runtime provenance and installed launcher | SDD-006 | Older running generations or absent host/Git access cannot count as new-build success. |

## 8. Risks And Open Questions

Material design choices are resolved below. TP owns exact fixture filenames, scenario order and host observation instructions. Implementation must validate contained source facts and applicability through existing owners; review must reject any widening of permission based on a generic compact mode alone. If current writer/eligibility behavior cannot satisfy an approved criterion without changing authority/schema, stop with a design_gap and revise this SD through its existing owner before widening the patch.

No user decision is missing for the design scope. The recorded baseline supplies current reproduction; CLI/MCP access differences were freshly confirmed in source. Native-model proof of a later changed build remains a qualification obligation or explicit limitation, never an assumption.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDD-001 Core operation and dispatcher ownership | before_sd | resolved | Add the compact semantic operation and bound nonterminal handoff to existing Core owners; keep the structured path intact. | Codex |
| SDD-002 Verified Change evidence and transport access | before_sd | resolved | Require current evaluator eligibility and contained record facts; retain actual CLI Git observation and MCP unavailable-evidence refusal. | Codex |
| SDD-003 Execution refusal boundaries | before_sd | resolved | Route only from the final current open authorized active bound operation; missing approval, integrity or binding keeps terminal behavior. | Codex |
| SDD-004 Re-entry and compact completion | before_sd | resolved | Use current applicable review/executed evidence and existing release-or/writer paths; completed Runs are terminal and no new persistent execution marker is added. | Codex |
| SDD-005 Contract and presentation compatibility | before_sd | resolved | Synchronize existing focused contracts/generated output and all affected locales; retain existing schema envelopes, gate meanings and preparation behavior. | Codex |
| SDD-006 Installed qualification boundary | before_sd | resolved | Supported installer plus observed exact-build CLI/STDIO on disposable targets; classify native or Git-unavailable evidence precisely. | Codex |
| Disposable scenarios and evidence filenames | later_tp | deferred | TP maps every criterion/decision to concrete cases and paths before implementation, using existing test owners and exact installed-build observations. | Codex TP author |

## 9. Next Step

Present this design for a new deliberate `Approval: SD`. Approval permits the existing Task/Test Plan drafting stage only. No implementation, installer update, QA result or release is authorized by this draft.

## AGDF Approval Summary (de; source=en)

- Ziel: Die bereits erlaubte kompakte Arbeit über vorhandene Core- und Dispatcher-Owner zuverlässig ausführen und sicher wiederaufnehmen.
- Umfang: Core liefert eine eindeutige kompakte Ausführungsoperation; der Dispatcher gibt dafür eine gebundene nichtterminale Fortsetzung mit aktuellem Run, Revision und Quellen aus. Bestehende Writer behalten Nachweise, Review, Revisionen und Abschluss.
- Änderungen: Bei einem Quick Task mit aktuellem erfülltem Review folgt der vorhandene kompakte Abschluss statt einer erneuten Umsetzung. Ein gültig ausgeführter Verified Change bleibt auf seinem bestehenden OR-/Mini-Closeout-Weg; abgeschlossene Runs bleiben terminal. Ungeklärte Teilumsetzung wird neu geprüft und nicht als einmalig ausgeführt behauptet.
- SDD-001: Core entscheidet den kompakten Ausführungsauftrag; der vorhandene Dispatcher übersetzt ihn. Strukturierte Umsetzung und bestehende Schemahüllen bleiben erhalten.
- SDD-002: Verified Change benötigt frische Eignungs- und Quelldaten. CLI verwendet vorhandene Git-Beobachtungen; MCP behält die konkrete Ablehnung, wenn ihm notwendige Baseline-Daten fehlen. Keine neue Git-Fähigkeit und kein Eignungs-Bypass.
- SDD-003: Nur beauftragte, exakt gebundene, aktive, offene und aktuell erlaubte Fortsetzungen erhalten Umsetzung. Statusfragen, fehlende Freigaben, alte oder fremde Bindungen und Kontrollblockaden bleiben gestoppt.
- SDD-004: Bestehende aktuelle Nachweise bestimmen offene Umsetzung, Abschluss oder fertig. Quick Task verwendet seinen vorhandenen OR-lite-Writer; Verified Change seinen bestehenden vollständigen Mini-Closeout und run-update. Keine zweite Zustandsquelle und keine impliziten Git-Aktionen.
- SDD-005: Betroffene Verträge und generierte Ausgaben werden über vorhandene Generatoren synchronisiert. Alle geänderten registrierten Locale-/Karten-/Zustandsdarstellungen sowie bestehende strukturierte und vorbereitende Wege werden geprüft.
- SDD-006: Über den normalen lokalen Codex-Installer aktualisieren und Build, Digests sowie tatsächlich gestartete CLI-/MCP-Runtime prüfen. Geeignete Verified Changes werden über installierte CLI geprüft; MCP muss fehlende Git-Evidenz korrekt ablehnen. Alte Generationen und nicht beobachtetes natives Hostverhalten bleiben getrennte Nachweisgrenzen.
- Risiken: Ein kompakter Run kann trotz bereits erledigter Arbeit auf demselben Gate stehen. Aktuelle Nachweisgeltung und Abschlussrouting verhindern die erneute Ausführung. Bei fehlenden sicheren Quellen oder unerfüllbarer bestehender Writer-Grenze wird der konkrete Designpunkt geklärt, bevor der Patch erweitert wird.
- Entscheidungen: Alle materiellen Designentscheidungen sind auf bestehende Eigentümer und Schnittstellen begrenzt und aufgelöst. Der Aufgabenplan legt danach konkrete Tests, Dateipfade und die installierte Beobachtungsfolge fest.
- Nächster Schritt: SD-Freigabe erlaubt den Task/Test Plan; Umsetzung bleibt bis zur dafür gültigen Freigabe und den internen Voraussetzungen gesperrt.
