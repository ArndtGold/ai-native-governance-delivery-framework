# SD: Reliable internal gate continuation and actionable recovery

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-08
Owner: Arndt Gold
Run: gate-internal-continuation-recovery-20261008-01
Language: en
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the current Core evaluation, dispatcher, analytical/authoring skills and interaction renderer. Keep one canonical control path. An explicit bound continuation first checks current permission and source facts, selects an existing responsible skill, and returns its existing continuation shape. The agent completes permitted preparation or correction, validates and records through current writers, then reevaluates the same run. A ready decision, a material missing choice, an external obligation or an unchanged/forbidden failure ends internal work with the actual next actor.

The approved PRD is product authority. Brownfield Review selected structured_slice and the ready UX analysis supplies subordinate state/actor input. This design resolves PRD decision D-006; execution/scenario mapping D-007 remains TP-owned. No source code, native qualification, QA result or release is produced by this draft.

Source inspection found that readDefinitionSources returns null both for a missing UX file and a non-ready exact decision field. The QA routeNextSkill condition excludes revise. Operational actor presentation derives agent work from internal_next_step without knowing whether dispatch will terminate. These are the bounded integration points; the fix must not simply remove guards or reinterpret invalid calls.

## 2. Ownership And Source Of Truth

| Concern | Existing authoritative owner | Design responsibility |
|---|---|---|
| Intent and acceptance | Approved UR and PRD in this run | Preserve scope, criteria and deliberate decisions |
| Activation, target and supported input | request-activation.md, task-target-resolution.js, skill-dispatch/contract.js | Keep status read-only; reject unknown fields and incompatible options before dependent work |
| Current permission and readiness | control-evaluation/gate-policy.js, gate-check.js and focused readiness modules | Compute eligible preparation and constrained QA follow-up from current bound facts |
| Analytical content | ux-intent-definition and brownfield-analysis | Prepare/repair only their permitted unapproved run-local input; expose material questions |
| Product/design content | prd-definition and sd-definition | Retain their existing binding, readiness, source and explicit revision rules |
| Normalized review gaps | quality.md, section Normalized Review Gaps | Sole normative meanings/routes; Core has one consuming validator, no dispatcher or skill route copy |
| Routing and host action | skill-dispatch/service.js and existing phase helpers | Consume evaluated facts; return the existing result variants and named-skill handoffs; never write control |
| Application-level control correction | delivery-continuation/service.js | Retain its exact existing sealed-relationship correction boundary; no general repair/retry authority |
| Recording and approval | control-state/run-recording.js, run-presentation.js and existing source-revision writers | Locks, exact revisions, approved-source relationships, receipts and presentation binding remain mandatory |
| Operational presentation | interaction-presentation.js, interaction-catalog.js and agdf-interaction-locales.json | One renderer for actual actor/stop semantics and localized condition detail |
| Quality decision | qa-gate; CR, task-plan-review and clean-implementation-review as evidence dimensions | Consume current normalized findings; QA alone decides pass, revise or block |
| Host qualification | Existing run-local evidence and qualification work under TP/QA | Prepare candidate and sequence; record actual observed identity and evidence applicability |

Any new internal fact helper is part of its existing Core owner, exported only where current modules need it. It is not a public recovery service, new gate, store, scheduler or independently editable policy. Unrelated cockpit, intake, card-reduction, wording and stale-next-action runs retain their scopes and approvals.

## 3. Architecture Decisions

- SDD-001: Separate source-readiness facts from permission and routing within existing Core owners; rationale: a null source result hides whether input is absent, malformed or forbidden; consequence: focused internal read-only facts and conformance tests replace the ambiguous branch, without accepting malformed input or adding a public result field.
- SDD-002: Route an eligible missing/non-ready UX prerequisite through the existing analytical named-skill continuation before PRD drafting; rationale: UX is required internal preparation, not another human approval; consequence: retain source and authoring guards, record/reevaluate through existing writers and stop for material intent or protected-source conflicts.
- SDD-003: Consume normalized review findings once in Core and route QA-revise according to current permission and the declared existing target; rationale: the broad revise label cannot grant code or source-edit authority; consequence: distinguish implementation, internal evidence, external evidence and upstream source decisions, with invalid/mixed authority-sensitive findings stopping corrective implementation.
- SDD-004: Bound correction in the active agent chain by the failed condition and actual input/evidence change, using existing validation and recording; rationale: repeating an unchanged invocation is not progress; consequence: one permitted correction attempt for a diagnosed condition followed by validation, no automatic loop/service and no interception after terminal output.
- SDD-005: Select execution disposition before rendering and pass it internally to the existing interaction owner; rationale: a terminal result cannot truthfully say the agent is immediately continuing; consequence: preserve terminal safety and canonical content, distinguish potential next work from actual running work, and check every affected locale without a second renderer.
- SDD-006: Prepare host qualification in ordinary version-bound run evidence before the external handoff; rationale: package preparation, reconnection and observation need one coherent candidate/sequence; consequence: no host restart or installer automation, no new state schema, and new candidates invalidate only explicitly affected evidence.
- SDD-007: Verify whole continuation chains and protected stops alongside existing unit/contract coverage; rationale: isolated passing calls did not demonstrate the observed multi-turn behavior; consequence: fixed baseline/corrected traces, read-only byte checks, all-locale renders and a separate actual installed-host qualification are required before stronger claims.

### Alternatives And Trade-Offs

A skill-instruction-only fix would reduce invocation mistakes but leave missing-prerequisite and QA routing defects intact. Removing the QA exclusion alone would route work before establishing its actual authority and evidence obligations. A new persistent orchestration/retry service would introduce another control source, storage and a broader delivery boundary. The selected extension instead shares facts and evaluated decisions at the current Core owners, while skills perform content work and the existing renderer communicates execution. It costs focused integration and whole-chain testing, but preserves current public interfaces, writers and human decision boundaries. Package reinstall or host restart is not a substitute for correcting these source behaviors.

### Source Facts And Internal Preparation

Replace the overloaded readDefinitionSources null path with a read-only source inspection shared by the relevant Core readiness and dispatch paths. Internal facts identify the contained path, logical source, canonical digest when available, required field/value, observed value or absence and failed condition. Missing file, malformed exact decision syntax, blocked analytical decision, unsafe path and unavailable approved source remain distinct. Do not infer ready from a heading, ordinary prose, a truthy string or a partial file. Existing containment, symlink and digest helpers remain mandatory.

Core evaluates prerequisite eligibility only after activation/binding, approved upstream sources, completed Brownfield routing, permitted analysis ownership and unrelated integrity checks are satisfied. For the approved pre-PRD case, it selects the existing UX owner before attempting dependent authoring. Reuse the existing analytical reassessment operation/continuation semantics or the generic named-skill shape; introduce no new outcome, phase, input property or CLI flag. The returned existing instruction carries the exact bound task, source/field condition and required validation/recording step. This is analytical preparation, not a fabricated source revision or PRD-authoring assignment.

The UX owner can prepare an absent eligible file or correct its own unapproved analysis. It cannot normalize an approved product source, foreign file, unsafe path, blocked material requirement or unknown integrity condition. A genuine unresolved question remains blocked with a focused bundled clarification. Completion is recorded with the existing run-step/run-update procedure appropriate to that analytical input; pointer, status and evidence must match the validated bytes. A fresh gate-check precedes PRD authoring. The PRD/SD skills retain their present exact approved sources and ready-draft editing restrictions.

Diagnostics use current diagnostics[].code, recovery.action and continuation.instruction containers. Condition evidence is rendered from validated facts: source/path, expected field/value, available observed condition, responsible actor and allowed next action. Keep paths contained and text escaped/bounded; do not include arbitrary exception stacks or secrets. Preserve existing top-level recovery codes and schema; more precise explanations do not become new machine authority. Source validation and dependent authoring must not maintain separate contradictory readiness parsers.

### QA-Revise Follow-Up

Add one focused normalized-finding consumer under control-evaluation, shared with the gate/QA follow-up decision. It reads the current run's applicable, contained review reports and QA references, using their existing normalized row format and stable finding IDs. It validates declared values and compatibility with quality.md; it never guesses a gap from free-text wording. Retain the contract as sole normative route table and a single runtime interpretation; neither dispatcher nor skills maintain another complete type-to-route table. Conformance tests compare the consumer with the declared contract.

The current QA report's explicit revise decision, current approved UR/PRD/SD/TP, required completed analysis, valid recording/relationships and all unrelated blockers remain checks. The route is computed in Core and consumed by the dispatcher; merely dropping the current QA conditional or always routing to qa-gate is insufficient.

| Evaluated condition | Compatible existing handoff | Limit |
|---|---|---|
| Valid open implementation finding within the approved task scope, no conflicting source/authority gap | Existing implementation continuation with gate-check, current QA run and exact correction instruction | Correct only approved tasks; refresh affected CD+Tests/reviews, then reevaluate; never approve QA |
| Valid evidence obligation obtainable with current supported tools/authority | Existing named evidence/review owner coordinated through the QA skill contract | Gather only missing proof, preserve applicable evidence and rerun QA only when obligations are satisfied |
| Evidence requires a necessary inaccessible native host or human connection action | Existing qualification/evidence owner prepares the candidate and sequence, then precise external handoff | No installed success from source/protocol evidence; do not pretend the host is observable |
| Upstream source target, assessed emergent risk, material conflict or changed intent | Existing earliest source/revision owner and required decision route | No direct unapproved edit of an approved source and no corrective code that depends on an unresolved source choice |
| Missing/unknown/contradictory row, missing referenced report or unresolved mixed source authority | Precise blocked diagnosis through current control/presentation | No fallback to generic code correction or QA approval |

Evidence acquisition uses required_next_step and referenced obligations; the consumer does not infer that every evidence_gap needs a reconnect or that every evidence_gap is internally executable. Where executability is not established, the evidence owner inspects/prepares the obligation without claiming completion. Material unknowns stop at their actual owner. qa-gate remains the only quality decision instance; revise and block cannot yield a QA approval presentation. Multiple findings retain their identities, and a decisive upstream conflict prevents dependent code even if another row is locally actionable.

### Bounded Correction And Resume

Before a dependent invocation, authoring/execution instructions require checking the declared argument schema, skill-specific options and exact machine-readable readiness fields. Preserve MCP presentation_language, CLI --language and gate-check-only continue_delivery rules. Invalid public calls remain invalid; no coercion, new alias or automatic retry is added. Instructions/examples are corrected at their existing owner and projections regenerated rather than patched independently per host.

For a permitted own unapproved-input correction, the agent keeps a chain-local condition identity from target/run, source or invocation, field/condition, available input digest/value and evidence obligation. This is working context and run-local diagnostic evidence, not a second control state. It makes one bounded correction attempt, validates the changed input, records it where required and reevaluates. If the same condition remains, no observable relevant change can be established, validation fails, or a protected input is involved, stop with one precise reason and next actor. A newly exposed different prerequisite is evaluated on its own permission; it is not blanket retry authority. Known independent checks within the same permitted owner may be prepared together before the handoff.

These instructions are supported by actual owner validation and chained tests; they do not claim that an in-memory agent ledger is a durable cross-session enforcement mechanism. After interruption, use fresh canonical binding/evaluation and retained source/evidence. Do not trust an old progress message or in-memory permission. A terminal result already emitted is never intercepted; any later retry must be a separately permitted current invocation. No background work or autonomous recovery scheduler is created.

### Execution Disposition And Presentation

The dispatch path selects one existing result/host-action combination before producing user-facing execution wording. Internal preparation/correction returns nonterminal skill_continuation with a concrete named task. Ready approval uses presentation_required and canonical run-present, then waits. A genuinely terminal status/error/external stop transmits its returned presentation/recovery verbatim and ends the turn.

An internal renderer parameter derived from this disposition distinguishes actual executing work from a possible future agent action. Explicit status inspection must describe current state and allowed next work without promising execution. External stops name the required external actor/action and unproven observation; technical stops name the blocked condition. Preserve existing direct status rendering with truthful neutral wording when no active execution context exists. No new public response property or persisted actor state is needed. The renderer must not derive permission from wording, internal_next_step alone, or a locale string.

Existing catalog/locale keys and localized recovery composition remain the only presentation owners. Reuse or add internal locale entries there as needed and render every affected state for every registered locale. Keep canonical approval text/digests, exact response transport and terminal invariants unchanged. This work is limited to disposition/condition correctness; general card redesign and blanket intermediate-card suppression belong to the separate existing runs.

### Prepared Host Qualification

The existing evidence owner records, in this run's normal evidence artefacts, the exact candidate package/runtime/resource identity, relevant source-check results, supported surface and connection action, ordered observation sequence, expected visible behavior and obligation-to-evidence applicability. Record that plan before requesting the external action. It is a test/evidence record, not an executable manifest, new acceptance gate or persistent workflow schema.

After connection, observe the actual loaded runtime/resource identity before attributing behavior to the candidate. Execute the prepared sequence for the fixed missing/malformed-prerequisite, permitted QA follow-up and truthful-stop states as applicable to that candidate. Record actual events separately from fixture expectations. Mismatch/inaccessibility leaves the affected observation missing. A changed candidate triggers impact assessment and fresh evidence for affected obligations; unchanged source/protocol evidence may remain applicable with explicit rationale. Real defects or changes may legitimately require a new session; a stable successful candidate should need one prepared observation session.

## 4. Integration Points

- Core readiness/gate evaluation supplies distinct contained source facts and normalized-finding follow-up decisions. Focused modules remain read-only. Existing status/delivery-map projections consume the same evaluated result rather than inferring another next action.
- skill-dispatch/service.js consumes evaluated eligibility before the current broad source-failure or QA terminal branches and emits existing continuation/recovery members. Phase helpers preserve ready-draft restrictions, approved-source checks and language/source binding.
- delivery-continuation/service.js retains its current bounded sealed-relationship correction. No generalized mutation/correction mechanism is added to the routing service.
- Analytical/authoring/QA skill contracts describe prevalidation, same-run recording, bounded correction and evidence handoff. Supported schemas and MCP/CLI wrappers remain identical; invalid input is diagnosed without accepting it.
- interaction-presentation.js composes actor and recovery text from current evaluation plus internal execution disposition. The catalog and locale registry own translations; the dispatcher never hand-builds an alternate status card.
- Existing run writers publish changed control/evidence at exact revisions; run-present and run-approve retain exact digest binding. A change requires current canonical reevaluation and any newly required deliberate approval.
- Existing package/runtime sync owners propagate approved compatible code and instruction changes. Qualification measures the actually served/installed candidate, not an assumed source checkout. No installation or host reconnection is performed by this design stage.

## 5. Constraints And Compatibility

Maintain current public dispatch schema/contract versions, six result variants, declared inputs/options, host-action modes and phase semantics. Use current flexible diagnostics/recovery/instruction content; internal inspection/reducer data is not a new public API. No new CLI flag, persisted control schema, approval value, gate, process, host integration, migration or installer behavior. If implementation requires such a change, stop and reassess the existing Mode/Slice and earliest affected approved source before dependent work.

Preserve request activation, target/run/revision/presentation binding, supported exact runtime provenance, containment and symlink rejection, seals/locks and canonical source relationships. Unknown integrity changes cannot be resealed as recovery. Explicit status/doctor/evaluation cannot write, collect delivery evidence as an implicit action, or start a skill. Restore neither approved content nor approvals from conversational memory. Never transfer approvals from reference/adjacent runs.

The current repository has unrelated cockpit/control changes. Recheck affected owners and overlapping runs before implementation; retain their work. Generated projections follow existing sync ownership. Packaging/installation defects discovered during qualification remain separately governed, not a hidden repair inside this slice.

## 6. Test And Evidence Strategy

TP maps all criteria and SDD decisions to executable cases and exact evidence/commands. Reuse current skill-dispatch, skill-dispatch-function-contract, binding, PRD/SD-definition, CLI gate-scenario, interaction/catalog and source-revision suites at their existing owners. Extend behavior cases where needed rather than create a parallel test harness or mirror helper implementation.

Required proof dimensions:

1. Readiness/containment: absent UX, malformed exact field, blocked analytical input, valid ready input, protected/foreign/unsafe source, unrelated integrity failure and genuinely missing user intent.
2. Full pre-PRD chain: approved upstream source -> analytical handoff -> permitted correction/preparation -> canonical recording -> fresh dispatch -> bound PRD decision. Count extra continuation prompts and distinguish actual approvals.
3. QA follow-up chains: implementation, internal evidence, external evidence, upstream and mixed/invalid findings; maintain exact report/revision/source relationships and demonstrate no premature QA pass or approval presentation.
4. Invocation and bounded recovery: valid MCP/CLI fields/options, invalid-field/skill options rejected, correction before dependent work, unchanged failure stops, protected source remains untouched.
5. Presentation: actual continuation, status-only, decision, external and technical stops, for every affected state and registered locale. Verify semantic actor/action and rendered output, not just locale-key completeness.
6. Resume/protection: changed revision/authority, deliberate interruption, foreign approvals, ambiguous target/run, invalid seal/runtime, no alternate run or hidden installation. Observe canonical control paths/bytes and absence of writes on read-only calls.
7. Separate installed-host proof: candidate/source/package/protocol identities, plan recorded before external handoff, actual loaded identity and complete observation trace. Report unavailable surfaces as missing evidence. Fixture success does not qualify a live agent/host.

Baseline and corrected scenarios use comparable initial states; the ledger records prompts, internal terminal stops and unchanged correction attempts separately from necessary user decisions/external actions. Do not present scripted fixture counts as actual user timing. CR, plan review and clean implementation review assess their dimensions before QA; qa-gate alone decides readiness.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Contained prerequisite inspection and eligible analytical handoff before dependent authoring; canonical recording and fresh evaluation | Core readiness/gate evaluation; UX analytical owner and existing writers | SDD-001, SDD-002 | Preserve upstream approval and source safety; no new public continuation shape |
| AC-002 | Distinct exact source/field diagnoses and single bounded permitted correction with validation | Core source-readiness facts; existing authoring/analytical skill and writer | SDD-001, SDD-004 | No coercion or approved-source repair; unchanged/protected conditions stop |
| AC-003 | Shared normalized-finding consumer and constrained QA follow-up into implementation, evidence or source decision | quality.md normative routes; Core evaluation; existing correction/evidence owners and qa-gate | SDD-003 | Invalid or unresolved source-sensitive gaps cannot authorize code; revise remains non-approvable |
| AC-004 | Invocation prevalidation and execution-disposition-aware canonical presentation | skill-dispatch/contract.js; skill contracts; interaction-presentation.js and locale registry | SDD-004, SDD-005 | Invalid fields remain invalid; terminal safety and exact approval are retained |
| AC-005 | Prepared version-specific candidate/sequence and explicit evidence applicability in existing artefacts | Existing TP/evidence/qualification owner and actual host observations | SDD-006 | No installer/restart automation or native claim from source/package proof |
| AC-006 | Comparable whole-chain and interruption traces with fresh binding and categorized prompts/stops | Canonical run/evidence chain; existing dispatch/recording integration tests | SDD-004, SDD-007 | No durable retry state or memory-derived authority; fixtures are not actual user timing |
| AC-007 | Preserve existing activation/approval/integrity checks and observe no writes on read-only calls | Request Activation, Core gate evaluation, canonical writers and runtime validation | SDD-003, SDD-004, SDD-005, SDD-007 | Upstream conflicts and blocked authority stay stopped; no alternate run or silent repair |
| AC-008 | Single owner per policy/presentation dimension, all-locale rendering and distinct source/package/native proof | Core/quality/interaction owners; CR, plan review, clean review and qa-gate | SDD-001, SDD-003, SDD-005, SDD-006, SDD-007 | No parallel classifier/renderer/store; unsupported hosts remain unqualified |

## 8. Risks And Open Questions

- Core currently lacks a normalized-finding machine consumer; its implementation must be the one shared consumer of the existing contract, not a second discretionary policy table. Invalid/incomplete old reports stay explicit gaps rather than being inferred from prose.
- Eligibility and source-fact reading must stay aligned. A reusable read-only fact function avoids divergent readiness interpretations, while canonical writers recheck current revisions and protected bytes.
- Phase/operation reuse must preserve existing semantics. If compatible existing shapes cannot carry a safe handoff, stop for scope/depth reassessment rather than silently extend the public contract.
- Loop prevention combines chain-local agent instructions, owner validation and observable integration/native evidence. It is not claimed as a durable autonomous retry engine. Unknown progress after interruption requires current inspection, not another blind correction.
- External-evidence availability is not established by a normalized gap label. Prepare first, prove actual access/identity, and retain missing observations where necessary.
- Overlapping runs and installed/source drift can change the baseline. TP and pre-implementation analysis must recheck owners and candidate identity; independent installer/package issues stay separate.
- No material design or product decision remains unresolved. Exact test task IDs, fixture inputs, commands, candidate hashes and observation script content belong to TP/execution under the resolved design.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDD-001 Source diagnosis owner | before_sd | resolved | Share contained read-only facts at Core readiness; retain exact parsing and use existing diagnostic containers | Core readiness owner |
| SDD-002 Analytical prerequisite handoff | before_sd | resolved | Use current analytical/generic named-skill continuation only after bound permission; record and reevaluate before PRD | Core evaluation and UX analytical owner |
| SDD-003 QA follow-up authority | before_sd | resolved | One Core consumer of normalized declared findings; dispatcher consumes evaluated permission; source/invalid gaps cannot become code authority | Core evaluation and qa-gate owner |
| SDD-004 Correction and resume bounds | before_sd | resolved | One condition-specific permitted attempt with validation/progress check; unchanged failure stops; fresh canonical resume, no persistent retry store | Existing skill/agent execution owner |
| SDD-005 Truthful presentation | before_sd | resolved | Determine execution disposition before rendering; internal context informs current canonical renderer; terminal output remains final | Dispatcher and interaction owner |
| SDD-006 Host qualification handoff | before_sd | resolved | Existing run evidence holds candidate, complete sequence and applicability before external action; actual loaded identity qualifies claims | TP/evidence and qualification owner |
| SDD-007 Evidence architecture | before_sd | resolved | Whole-chain comparable tests, negative/read-only controls, rendered locales and separate installed-host trace extend existing suites | TP and quality evidence owners |
| TP-DETAIL Scenario and command binding | later_tp | deferred | Bind resolved design and criteria to tasks, exact fixture/candidate commands and complete native observation sequence; execution detail cannot change authority or design | TP owner |

## 9. Next Step

Review this exact design and decide with `Approval: SD`, request revision or decline. Valid approval permits TP drafting only. Implementation, QA, installation, publication and release remain outside this approval.

## AGDF Approval Summary (de; source=en)

- Lösung: Bestehende Core-Auswertung, Dispatcher und Skills setzen erlaubte Vorbereitung und Nacharbeit bis zur nächsten echten Entscheidung fort. Fehlende Datei, falsches Bereitschaftsfeld und echte Blockade werden getrennt erkannt.
- Verantwortung: Core entscheidet über aktuelle Erlaubnis; bestehende Skills erstellen Inhalte; kanonische Writer erfassen sie. Der Quality-Vertrag bleibt maßgeblich für Befunde, qa-gate entscheidet allein über Qualität, der vorhandene Renderer über die Darstellung.
- Entscheidungen: SDD-001/002 führen genaue Quelldiagnose und die erlaubte UX-Vorbereitung vor dem PRD zusammen. SDD-003 wertet normalisierte Befunde einmal im Core aus und unterscheidet Implementierung, interne/externe Nachweise und vorgelagerte Quellentscheidungen. Unklare oder widersprüchliche Befunde erlauben keine Codekorrektur.
- Begrenzte Korrektur: SDD-004 erlaubt einen gezielten Versuch am eigenen unfreigegebenen Eingang mit anschließender Prüfung und Erfassung. Bleibt derselbe Fehler bestehen, stoppt der Ablauf konkret. Wiederaufnahme prüft Bindung und Erlaubnis frisch; kein dauerhafter Retry-Speicher und kein Übergehen bereits ausgegebener terminaler Stopps.
- Darstellung und Integration: SDD-005 bestimmt vor dem Rendern, ob Arbeit tatsächlich weitergeht, eine Entscheidung ansteht oder ein externer/technischer Stopp gilt. Bestehende Antwortformen, Host-Aktionen, Eingabefelder und Writer bleiben erhalten. Ungültige Aufrufe bleiben ungültig; Statuslesen startet keine Arbeit.
- Host-Prüfung: SDD-006 bereitet Kandidat, vollständige Prüffolge und Nachweisgültigkeit im vorhandenen Run-Nachweis vor einer nötigen Neuverbindung vor. Nur die tatsächlich geladene Fassung wird qualifiziert. Kein automatischer Neustart, Installer oder neuer Workflow-Speicher.
- Belege: SDD-007 verlangt vollständige Vorher-/Nachher-Ketten, Wiederaufnahme, negative Kontrollfälle, unveränderte Daten beim Statuslesen und gerenderte Zustände in allen betroffenen registrierten Sprachen. Echte installierte Host-Beobachtung wird getrennt von Quellen-, Paket- und Protokollprüfungen belegt. Alle acht PRD-Kriterien sind genau einmal technisch zugeordnet.
- Abwägung und Risiken: Ein gemeinsamer Core-Verbraucher verhindert konkurrierende Routingregeln; alte unvollständige Berichte bleiben erkennbare Lücken. Begrenzte Korrektur stützt sich auf Skill-Regeln, Validierung und Ablaufbelege, nicht auf eine neue autonome Engine. Unbeobachtbare Hosts und geänderte Kandidaten behalten konkrete Nachweispflichten. Verwandte Runs bleiben getrennt.
- Offen und nächster Schritt: Keine materielle Designentscheidung ist offen. Konkrete Aufgaben, Testbefehle und Beobachtungsschritte folgen im TP. Wenn vorhandene Schnittstellen nicht ausreichen, wird Umfang und Tiefe neu bewertet. `Approval: SD` erlaubt den Aufgaben- und Testplan; Implementierung und deren Nachweise stehen noch aus.
