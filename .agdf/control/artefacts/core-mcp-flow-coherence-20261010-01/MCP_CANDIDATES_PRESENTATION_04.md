# Further MCP candidates observed during PRD presentation

2026-10-11; Run core-mcp-flow-coherence-20261010-01. Observation only; no new implementation authority.

1. Qualification diagnostics: the actual card reports not_qualified but not the failed qualification condition. Source inspection of decision-session.js, mcp-dispatch-runtime.js and runtime/plugin-provenance.js plus the productive owned marker was required to establish that decision_app_qualification is absent. Candidate: a read-only typed capability/qualification report through the existing Inspect owner, distinguishing rendering, action mediation, exact candidate/host evidence and missing record. Never turn diagnosis into qualification or human approval.
2. Dispatcher invocation guidance: expected_revision_id requires intake/resume, whereas continue_delivery excludes intake. Two invalid read-only calls exposed this constraint; checking skill-dispatch/contract.js was required. Candidate: existing contract/catalog metadata should expose conditional allowed request forms and the correctly bound next invocation, without a new policy or direct Core fallback.

Both refine existing discoverability/host-truth requirements. The correct continued dispatcher call succeeded; PRD stays open and no decision was recorded.
