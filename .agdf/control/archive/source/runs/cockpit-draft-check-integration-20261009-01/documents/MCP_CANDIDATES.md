# MCP candidates observed during this Run

User instruction: remember source searches and direct Core invocations as candidates, without treating them as authorization to implement them.

| Observation | Existing path/function | Why existing MCP was insufficient | Candidate contract and priority |
|---|---|---|---|
| PRD readiness found no stable criterion IDs despite a criterion_id table column; fixing the draft required reading parser owners | packages/core/lib/control-evaluation/traceability-readiness.js acceptanceCriteria; packages/core/lib/control-state/run-presentation-render.js criterionEntries | artifact-readiness reported missing criteria/summary but not its expected declaration syntax. Criteria evaluation accepts inline table declarations while the summary extractor requires a bullet `- criterion_id: AC-001` | Improve existing artifact-readiness authoring diagnostics or expose bounded gate-authoring format metadata via the existing contract owner. Exact target/Run/gate/revision and expected syntax/result; no validator duplication, source editing or approval. Medium priority; candidate, not approved work |
| UX analytical registration required knowledge that artefact status is done while analytical decision is ready | Existing RUN_STATE Artefacts row and canonical run-update | A ready UX file with a row marked ready remained ux_source_unrecorded; the recovery supplied the required done status and was followed | Bounded analytical-recording adapter using existing Core writer, exact selected target/Run/revision/path and decision/status distinction. Medium priority; no generic run mutation or approval bypass |
| Brownfield route and typed PRD recording used the canonical CLI | run-step route; run-step artefact; run-artefact-recording.js existing owner | MCP currently dispatches/inspects but does not offer these selected writer operations | Existing previously noted writer-adapter candidate: exact target/Run/revision, mode/gate and reviewed evidence; transactional existing Core validation and protected sources. No new writer semantics or inferred permission |
| Source/contract reads to understand the App integration | cockpit-contract.js, cockpit-session.js, cockpit.js, cockpit-worker.js, snapshot.js, mcp/transport.ts and state.ts | Normal Brownfield product/architecture analysis | Not automatically a missing MCP feature; the existing contract and source remain legitimate review evidence |

The live artifact-readiness function is reachable and was used for this PRD; the earlier installation/activation gap is closed. Earlier unsupported early UR revision at SD is a Core lifecycle-capability gap, not something a thin MCP adapter may invent.

## SD follow-up

- Existing MCP artifact-readiness was reached for SD and verified summary, sd-decisions-v1 and criteria-chain-v1 without directly invoking validators.
- Exact SD traceability column names still required a source read of packages/core/lib/control-evaluation/traceability-readiness.js: criterion_id, design_response, source_of_truth, design_decision_ids, compatibility_risk. This extends the existing authoring-contract/diagnostic metadata candidate, not a new validator or registration authority. A bounded gate-authoring contract response should supply supported declaration/table syntax through its canonical contract owner. Medium priority; not authorization to implement it here.
- Snapshot, session, worker, central App state and authenticated browser-route reads served the actual SD ownership/flow assessment. They are legitimate architecture evidence rather than automatic missing MCP operations. The proposed extraction inside artifact-readiness is an SD design decision; no direct Core call or implementation occurred.

### Implementation follow-up (2026-10-09)

- Canonical authoring-preparation recording still requires editing the existing internal Artefacts placeholder plus revision-bound run-update; CLI help currently does not expose the needed writer shape. Candidate: a bounded existing-owner preparation/evidence writer adapter, without approval or gate bypass.
- Qualified MCP evidence runtime construction required direct official Core/runtime preparation calls and an exact SDK-preserving acquisition from the already verified local runtime. Candidate: a bounded build/qualification preparation capability with explicit target/output ownership and no implicit host activation.
- Routine reads of snapshot/session/worker/App architecture and regression tests are implementation evidence, not a missing product MCP function.

### Native qualification follow-up (2026-10-09)

Source reads of the qualified MCP bin/main/server/ui-capability chain and App EmbeddedEntry/HostProbe/bootstrap/transport were needed to distinguish actual operational initialization/capability from saved protocol frames and actual view closure from backend close acknowledgement. This extends the existing bounded runtime/build qualification and evidence-diagnostics candidate: expose exact runtime/UI identity and bounded initialization/session/teardown diagnostics through their existing owners, without arbitrary file access or new authority. Normal UI interaction and source review remain legitimate evidence. Candidate only; no implementation authorization.

The native evidence milestone still required run-step --help (which returned only command names) and a targeted read of packages/core/lib/control-state/run-steps.js to recover the existing evidence/source/covers input shape. This reinforces the bounded canonical evidence-writer/authoring-metadata candidate; the current Core writer remains the owner.


## Final QA observation candidates (no production expansion)

- Exact runtime/UI qualification still called createMcpCockpitRuntime and loadCockpitResource directly; a bounded MCP diagnostic exposing qualified resource/build identity could avoid source/module discovery.
- Isolated native probe used existing Core prepare_context, invalidate_context, complete_context_invalidation and close to create/release genuine one-shot busy. A bounded test-observation profile could package this without agent-authored adapters, synthetic-target-only and non-authorizing.
- Sidebar disappearance did not establish backend cleanup. Existing native read close/session_expired proof worked. Bounded session/lifecycle diagnostics could distinguish view closure, SDK callback and Core close acknowledgement.
- task-plan-review rejects continue_delivery (only gate-check accepts it); catalog route/schema guidance should make this clearer for weaker models. These remain candidates, not new requirements or implementation permission.


## Approval and closeout observation

- Exact CLI run-approve argument discovery still required reading the declared interaction contract after tool metadata exposed no bounded writer operation. A typed approval command preparation/acceptance MCP boundary could expose exact target/run/revision/presentation and verbatim reply requirements; the existing Core approval owner must remain sole writer.
- Updating non-approved QA/report evidence requires run-update before QA source re-recording in this version; update_draft does not allow the QA report seal-change shortcut. A typed bounded report-recording command could expose that required ordering and reduce rejected attempts.
- Current UAT presentation repeats historical open-gap rows without marking their superseded state and leads with creation/UR evidence. A current-evidence projection owned by Core, with separate history provenance, is a candidate for clearer user decisions. No UAT renderer fix is part of this completed Run.


## Structured closeout projection

- Delivery Map after exact OR persistence reports lifecycle=completed and delivery_state=completed_closeout_pending. The existing gate-policy.js structured UAT branch always returns OR/open; unlike Quick Task it does not evaluate completed lifecycle plus OR done. gate-check.js derives completed_closeout_pending whenever lifecycle=completed/currentGate=OR. Source lookup was needed to distinguish actual saved completion from this generic projection. A bounded Core completion/status projection and typed structured closeout recording are candidates; keep policy in the existing Core owner and do not invent another completion source. This completed Run does not authorize that separate behavior change.
