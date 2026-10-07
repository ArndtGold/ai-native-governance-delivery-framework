# Brownfield Analysis — independent Cockpit reading views

- mode: pre_implementation_analysis
- decision: pass
- scope: approved TP tasks T-001 through T-012, source revision da10acf7-d4cc-4fc2-88b9-5e8840f354ac; no new product or authority decision
- evidence: SESSION_IMPLEMENTATION_BASELINE-01.json; approved SD/TP; inspected production session, pool/worker, contract, packet reader, EmbeddedEntry, transport and handoff owners
- current_coverage: retained optional Run opening, graph/source packets, strict MCP composition, private build and shared Pages UX exist; independent sessions and publication-owner release are not_done; native new tuple/two-view behavior is not qualified
- reuse_strategy: extend/refactor existing Core registry and worker options, focused immutable UI ports/controllers and strict contract; no parallel service, database or evaluator
- missing_evidence: implementation tests, fresh assembly and early actual-native two-view feasibility; these are TP execution obligations, not missing ownership or source decisions
- required_next_step: record preparation and implement/test minimal bounded independent reading before T-006 native checkpoint

## Current system and baseline

Baseline commit 31cb3af126d224a6e3dd356d7e796d610e5b9fe1 includes the previously retained changes and approved sources. The only initial dirty entry is this selected RUN_STATE.md following current TP approval. Candidate implementation files are clean at baseline; preserve the committed Pages/work-step/UI design and numbered local config. Exact approved hashes and candidate hashes are in the baseline JSON. The canonical control capture has 3193 files and 61114891 source bytes before writing this baseline; it currently fits the approved 64 MiB view limit with limited headroom. Future oversize must remain an explicit resource_limit, never silent truncation or raising the approved limit.

## Owners and minimal path

| Concern | Existing source owner | Intervention and tests |
|---|---|---|
| Independent reading registry | packages/core/lib/control-inspect/cockpit-session.js | Replace one current pointer with bounded per-view records and counted retirement; no render eviction; fake-clock/concurrent/scoped/shutdown tests in cockpit-session-test.js |
| Memory/capture/jobs | packages/core/lib/control-read/cockpit-pool.js, cockpit-worker.js, snapshot.js; cockpit.js constructor | Pass MCP-only reader limits and worker old-generation options while preserving browser defaults; await termination before next worker; production worker and controlled teardown fixtures |
| Wire and composition | cockpit-contract.js; packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src | One strict completion schema; existing runtime owns one service per connection, registration derives from Core contract; default two-tool MCP unchanged |
| Publication state | same Core session service and existing reader packet operations | Exclusive bounded reservation/owner/pending completion/receipt, failed preparation release, no nonowner clearing; exact session tokens and quarantine after uncertain owner loss |
| UI visible/session ownership | EmbeddedEntry.tsx, transport.ts, handoff-port.ts, handoff.ts | Immutable session-bound transport/port/controller per receiving bootstrap; own prior cleanup only; ordered host ack then checked completion; typed feedback through existing UI state |
| Build and local setup | existing build:mcp, assemble-npm and local-source preparation owners | Preserve exact private SDK locks and self-contained resource; prepare paired schema/UI through owned output; no plugin cache or global config repair |
| Docs and knowledge | docs/architecture/06-agdf-cockpit.md and existing Context Graph node | Update implemented flow only after implementation verification; curate verified invariant/recovery facts at closeout |

T-003/004 and minimal T-009 binding/capacity feedback are the first coherent vertical slice. Add production regression tests alongside existing owners, then build/reprepare the scoped output and qualify actual native reading before extensive T-008/010 handoff change. An unavailable native connection leaves that checkpoint open and dependent feature work stops as TP requires; it does not permit mock substitution or resetting unrelated runtimes.

## Risks and controlled trade-offs

- Existing pool reset terminates without awaiting and may start replacement while old worker retires: change the same owner to keep teardown counted; test delayed termination, timeout and close so the approved four-worker/eight-job limits are real.
- Session activity currently renews idle before selector validation: separate valid owned acceptance from rejected/foreign requests, retain exact own timers, and test expiry without prolonged waiting.
- Existing handoff invalidates server then publishes even after begin failure; mutable bridge session lets old cleanup target a new view: use immutable ports, exact Core ownership, and the approved two-sided completion. No interpretation of reading as permission or mutation of canonical control is introduced.
- Current host context can be deferred or historical. Completion is cooperative transport acknowledgement, not independently proven context erasure. Lost acknowledgement/owner must quarantine transfer while reads continue; no timed takeover, automatic resend or claim that chat history was deleted.
- Worker limits bound captured bytes and old generation, not total RSS. Each slot remains counted until cleanup settles; browser memory defaults stay unchanged. Test controlled fixture boundaries and record exact production options.
- React entry remains orchestration only; packet validation and publication flow stay in focused ports/controller and Core session owner, avoiding a second context policy inside document rendering.

## Context Graph and authority

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: PER_VIEW_SESSION_IMPACT-01.md; approved SD; planned verified implementation/host evidence
- memory_target: context_graph
- memory_reason: existing MCP node must reflect verified per-view resource and context-owner boundaries at closeout
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER

No graph content or relationship is inferred from planning. Exact upstream sources and approvals remain unchanged. Preparation pass establishes safe owners/reuse, not execution success, QA/UAT or clean closeout.
