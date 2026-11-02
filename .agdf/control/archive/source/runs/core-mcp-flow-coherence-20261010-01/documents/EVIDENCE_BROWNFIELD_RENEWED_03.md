# Renewed Brownfield evidence

Observed: 2026-10-11. Run core-mcp-flow-coherence-20261010-01, approved UR digest sha256:aa34d410513866e46718be708f0b9e245df447c8136b003e46d3dc194e367af4. Read-only source/runtime/reference observations; no native qualification, new implementation or QA decision.

## Fresh productive reconnection and timeout diagnosis

RUNTIME_SYNC_RECONNECTED_01.json records the actual current productive tools, not an isolated substitute: matched runtime d834465306f62111a7d9c25540fd18605fb95cc30008e778ea5505feaad68eb9; Brownfield Review at revision 32cbb5ce-2560-476b-9aef-afdf6965a27a; doctor pass; saved UR accepted; both source archives verified.

The previous operation-contract call failed with dispatch_timeout. worker.js imposes a ten-second deadline from worker creation; it covers runtime import/integrity, input parsing and execution. Failure reports contain zero phase timings, so the original slow phase cannot be recovered from that result. There is no evidence of a writing effect from this read-only failure.

INSPECT_TIMEOUT_DIAGNOSIS_01.json measures a fresh isolated call against the same installed runtime: import about 147 ms, provenance about 126 ms, composition about 1 ms, parse below 1 ms, execution about 424 ms, total about 698 ms. The actual productive one-time retry succeeded with about 207 ms reported Core timing. The original delay is not reproduced; cold-start, load or filesystem latency is not asserted as its proven cause. No timeout increase or product source repair was performed.

The agent used an incorrect previous module selector, step.record. The canonical selector is agdf_record/step.record, as OPERATION_CONTRACT_MODULES and operationContract(group, kind) show. That input mistake was corrected; it is not established as the ten-second delay's cause. The current returned contract supplies exact source/payload/UUID schemas and current binding.

## Current source coverage replaces obsolete findings

- control-evaluation/run-state.js now exports prepareRunContentState with the complete internal catalogue, evidence applicability and closeout readiness. run-steps.js reuses it. The old review's shortened writer model is historical baseline evidence, not a description of today's writer.
- skill-dispatch/service.js now routes implement_approved_plan through typed next_operation, rather than the earlier exact display sentence. Keep semantic wording-independence tests as regressions.
- run-command-service.js already mediates bounded typed recording, artefact registration, presentation, approval, revision and closeout through canonical owners. run-command-contract.js exposes their fixed group/operation schema. Reuse these owners; do not create one tool per historical candidate.
- run-steps.js now supports structured closeout with source/quality/readiness/confirmation checks and transactions. Retained tests and receipts do not establish fulfillment under the renewed scope or backward compatibility for every historical Run.
- decision-session.js has bounded ephemeral view/read sessions, epoch identity, pending operations, expiry and counted retirement failure. It does not own host connections or process generations.
- plugin-runtime.js owns its directly spawned child in one launcher invocation. It inherits STDIO, forwards termination and observes exit; it has no multi-generation admission/routing/drain controller. Package directory ownership and pruning are separate from child process ownership and currently lack active-connection retention proof.
- server.js/main.js own their STDIO runtime/executor close; worker.js owns one active execution and its deadline. Those existing responsibilities are reusable without moving business policy into a replacement broker.

## Foreign scope and current reference observations

BROWNFIELD_CURRENT_BASELINE_03.json captures exact current revisions/raw source digests and policy observations for the five related active Runs and two completed cockpit references. This planning turn does not edit them. Related scopes remain QA or CD+Tests and are not merged or closed by this Run.

Both completed cockpit references now evaluate blocked at OR although stored lifecycle is completed and OR done. This differs from the old open-OR reproduction. It is an explicit current historical-compatibility/readiness input, not permission to fabricate missing evidence or alter foreign completed records. Future PRD/SD must explain historical insufficiency versus valid current completion; fixture success cannot erase this observation.

## Host ownership and missing qualification

NATIVE_CONNECTION_FINDING_01.md remains candidate-bound historical diagnosis: actual connection denied UI, isolated clients forwarded declared support. No native loss-point/renderer/teardown proof was produced in this planning turn. A generation replacement cannot manufacture required host capability. Codex owns connection/capability/native teardown; AGDF may manage only directly owned children and its own view/operation bindings. Independent proof of actual UI support and native interactions remains mandatory.

## Additional MCP candidate observations

The incorrect module selector required a source lookup into control-inspect/contract.js. Candidate: discoverable command-group/operation selectors in the existing Inspect contract/schema/examples. First reuse OPERATION_CONTRACT_MODULES and the existing operation-contract surface; do not add an endpoint. Outcome should be an invocable exact group/kind without parser lookup. Source inspection for architecture/ownership remains normal engineering work.

The bound recording contract does not expose route block although the Brownfield mode policy defines it. This does not affect the positively evidenced structured_delivery route here. Retain it as a bounded canonical contract-coverage candidate for review; no manual control edits, fake positive route or repair was made.

All new analysis records are selected-Run evidence. Existing archived sources, prior approval/native milestones and unrelated worktree changes remain historical/protected. Native QA, full flow comparison, formal reviews and new TP fulfillment remain open.
