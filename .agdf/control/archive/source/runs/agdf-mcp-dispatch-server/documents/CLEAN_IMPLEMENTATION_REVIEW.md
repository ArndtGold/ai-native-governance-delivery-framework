# Clean Implementation Review: Cross-Host AGDF Dispatch Through MCP

Status: done
Decision: pass
Revision: 2
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Based on: approved SD Revision 3, TP Revision 2, Brownfield Analysis Revision 2 and the final implementation diff

## Clean Implementation Review

- decision: pass
- primary_solution: one canonical semantic function definition feeds a narrow version-matched dispatcher runtime, one SDK v2 STDIO server and thin reversible host lifecycle adapters. Existing target, control, presentation, approval, package-staging and configuration owners retain their authority.
- evidence: `create-agdf/lib/skill-dispatch/contract.js`, `create-agdf/lib/skill-dispatch/service.js`, `plugin/meta/agdf-interaction-locales.json`, `create-agdf/lib/mcp-dispatch-runtime.js`, `agdf-mcp-server/src/`, `create-agdf/lib/mcp-lifecycle/`, package/provenance tests, static reachable-graph checks, rollback tests, the complete exact-TP2 passing smoke suite, `DIRECT_HOST_EVIDENCE.md` and the independent controlled dual-protocol tests.
- fallbacks_retained: the existing version-matched CLI skill-dispatch path is shown only when MCP is disabled, unavailable or unverified. It is never executed automatically. Its exit condition is successful explicit MCP enablement and direct qualification for the selected host tuple.
- workaround_or_shim_risk: low. The version-aware OpenCode 1.x/2.x configuration shape is isolated inside the host adapter and tested in both directions. OpenCode and Codex configuration-origin tracking is attached to the owned MCP entry and removes only the empty container AGDF created; it does not add a parallel cleanup path. Wire parsing retains structural validation and delegates semantic values to the existing dispatcher service, which remains the sole semantic owner. The structural Git-worktree reader exists only because the read-only MCP graph cannot use a subprocess and rejects fake, symlinked or special markers. Approval presentation serializes the existing ordered presentation blocks, while one locale registry owns PRD, SD, TP and internal post-TP operational values. The control-state regression consumes that owner instead of retaining another text literal.
- parallel_structure_risk: none found. There is no second semantic schema, target resolver, gate evaluator, renderer, approval store, workflow engine, runtime search or remote transport.
- brownfield_fit: pass. The implementation uses the Brownfield Analysis reuse points and confines new ownership to the server process, read boundary, runtime reference transaction and host-specific MCP configuration.
- missing_evidence: none for the approved first-release scope. Claude model execution, OpenCode 2.x and native Linux/Windows remain explicitly unverified future evidence lanes and do not indicate a second owner or workaround.
- required_next_step: pass this renewed solution-integrity result to Code Review and QA.

No normalized clean-implementation finding remains open.
