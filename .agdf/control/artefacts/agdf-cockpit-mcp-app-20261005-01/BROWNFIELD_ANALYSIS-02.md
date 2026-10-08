# Brownfield Analysis: renewed cockpit initial Run focus

- mode: pre_implementation_analysis
- decision: pass
- run: agdf-cockpit-mcp-app-20261005-01
- preparation_revision: c5ae8e15-a257-45f9-8244-8b0f6f5679b9
- required_next_gate: CD+Tests
- scope: renewed approved TP; initial Run opening and retained adaptive card requalification, early actual-host checkpoint before graph/production handoff
- evidence: IMPLEMENTATION_BASELINE-02.json; current contract/session/runtime, React App/reducer/transport/entry, compact card and existing test owners inspected on 2026-10-06
- transparency: preparation permits the minimal approved implementation path; no QA/UAT/closeout claim

## Coverage, reuse and boundaries

| Concern | Coverage | Reuse strategy and owner | Required proof |
|---|---|---|---|
| Core captured reads, worker and evaluator | partially_done retained code; browser/MCP read parity previously tested | extend existing control-inspect contract/session; reuse control-read pool and snapshot | capture once for initial route, scoped identity and no-write; current regression tests |
| Render opening | not_done for optional initial ID; empty-only schema and caller currently discard input | extend the one cockpit-contract schema/parser; runtime passes parsed arguments to session render; metadata carries request only | strict ID/extra-field rejection; no render snapshot, foreign/stale selectors denied |
| Shared React reading | partially_done retained transport/reducer with generations | extend App initial route once per mount; preserve requested identity on missing/unavailable; EmbeddedEntry keys reader by current render session | initial read + manual selection races; new session remount/cancellation; display mode preserves instance |
| Bootstrap and transport scope | existing session bootstrap, mutable bridge session and registrations | validate scoped render metadata in a small entry-owned reader; ignore results without render metadata, remember retired session IDs; clear resource map when session changes and reject old-session read responses | stale bootstrap and delayed read cannot replace current run/session |
| Adaptive card/brand | partially_done retained implementation and browser observations; 20 UI/five service tests passed earlier | reuse CompactCockpit, container CSS, Pages single-owner assets/tokens | current affected tests/build, narrow/wide actual geometry; native width still separate |
| Owned runtime/assembly | partially_done exact isolated profile and named local connection | existing assemble-npm and prepare-cockpit-local; scoped replacement preserves exact owned config | schema/HTML together, provenance/default regressions, fresh descriptor/native read-back |
| Graph and production handoff | not_done; read operations explicitly unavailable | existing approved Core/UI ownership only after T-006 passes | keep context/message feasibility, final packet journey and graph curation open |

## Dirty baseline reconciliation

Baseline 67a97ae80d1fcd286b4b4d5e21e8606fb3c31f26. Existing candidates are dirty/untracked because they contain this run's retained work, not clean new files. IMPLEMENTATION_BASELINE-02.json captures every tracked/untracked dirty path and exact candidate bytes before new changes. Preserve this work and unrelated Pages/config/browser changes. Do not reset, copy a parallel implementation or overwrite other runs. Old analysis and evidence remain historical. The renewed TP requires reassessment; prior test results do not restore execution fulfilment. No AGENTS.md was found in the workspace file inventory; no delegation is required.

## Risks and minimal safe path

Schema and parser must share the bounded Run-ID definition; the server validates input again at its session boundary. Bootstrap identifies requested focus only. Initial snapshot/member check and existing run read own validation; missing data must retain the requested identity rather than silently show a different Run. A new render remounts the reader; existing abort/generation logic discards old replies. A display-mode update must not remount or recapture. Keep host context/message probes deliberate and synthetic, with no automatic bridge action from initial focus. Prepare the owned schema/HTML together and recheck independent stdio before actual native connection; old discovery is insufficient. No new policy/persistence/authority owner or debt waiver is needed.

Minimal next step: implement and test T-004 opening plus retained compact reading; build and prepare together under T-005; perform T-006 fresh native direct/empty/display/read/context/message checkpoint. Missing actual-host capability blocks T-007 onward extensive work, not the reviewed minimal preparation. Test production schema/session, React initial/missing/invalid/races, transport old-session response, default/browser compatibility and no-write window; record observations separately from host evidence.

## Context Graph and persistence

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: current ownership inspection; verified facts still to curate before clean closeout
- memory_target: context_graph
- memory_reason: preserve reusable verified shared-read/runtime/host boundaries through existing knowledge owner after implementation
- required_next_step: record this renewed analysis and redispatch bound gate-check
