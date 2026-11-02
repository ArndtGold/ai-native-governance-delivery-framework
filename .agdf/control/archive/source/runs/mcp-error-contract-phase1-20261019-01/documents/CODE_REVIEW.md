# Code Review: MCP error contract Phase 1

Decision: pass
Date: 2026-10-19
Owner: Codex
Run: mcp-error-contract-phase1-20261019-01
Review assurance: cooperative local source/runtime review by the implementation host; no independent human review claim.

- decision: pass
- findings: No open correctness, security, receipt/authority, regression or maintainability defect is evidenced in the reviewed scope.
- missing_evidence: None for this bounded review. Native model/host behavior and remote CI are outside the approved qualification claim.
- risks: Unknown effects still require original-operation inspection. Lazy SDK compilation pays its cost on the first actual tool call; the unchanged 20-call benchmark includes that call. Local p95 qualification is not a universal latency guarantee.
- required_next_step: Complete the separate TP/Clean review evidence and submit the current source/evidence to qa-gate.

## Reviewed scope and conclusions

Reviewed the actual implementation diff against HEAD a8a867a3578a2d8b16853860276c401ddd04db28, its directly affected neighbors and the 40 exact source hashes in evidence/source-final.json. This includes the Core projector and locale budget, CLI failure/projection seam, worker phase/termination handling, server/serialization/fallback and generation protocol/entry/facade, UI transport/decision/bootstrap, actual package and protocol tests, suite registration and documentation. Generated compatibility/payload changes were checked against their supported recorder and exact measured inventory; immutable evaluation source/baselines and approved gate sources remain unchanged.

- Classification uses explicit operation/outcome families and preserves successful blocked/readiness/unknown-status reports. No nested text search or competing gate evaluator is introduced.
- Typed parser/cause fields remain bounded and allowlisted. Arbitrary exception messages/codes are not model guidance. Handoff uncertainty, termination confirmation, slot/capacity ownership and original UUID/payload/receipt semantics remain intact.
- A producer projects once after postprocessing. Versioned generation qualification binds that contract; the facade consumes old producers' descriptors, strips private metadata and never re-executes a write to repair delivery.
- Error-domain/descriptor invariants are checked independently of the SDK. Full response limits include public metadata and the bounded single fallback. Successful presentation text and public domain shape remain intact.
- Negative UI envelopes are checked against their current view/session/binding. Accepted data under isError cannot confirm a decision; flagged bootstrap data cannot initialize a view. Actual visible browser evidence complements components.
- The performance repair reuses Doctor's exact selected state only within one evaluation. Subsequent revisions and unsealed changes are read/validated afresh; parent/child selection, aggregate/missing-Control and all mutation owners retain their checks.
- Deferred schema compilation delegates to the pinned SDK's own exported Ajv provider with the same defaults. It caches validators rather than data/decisions. Actual first-input rejection, first-output rejection after one execute and later input rejection pass through regular STDIO for both eras. Discovery definitions are identical.
- Test edits add coverage, correct an unsupported in-memory modern-negotiation fixture and use the existing adjacent browser teardown order. No assertions, timeouts, performance samples, caps or CI tests are removed or relaxed. The Chromium sandbox launch failure is separately recorded from the unchanged four-case passing browser qualification with the required process permission.

Current actual owned protocol, generation, safety/provenance/SDK, exact npm archives, command/replay and all four complete structured-delivery/slice flows pass. Both unchanged final performance checks pass (cold/warm p95 1088.087/876.261 and 701.275/611.639 ms). All 28 mandatory scenarios and all 30 immutable evaluation-file identities are verified. Detailed scope/dispositions: evidence/checks-final.json, scenario-evidence.json, EVALUATION.md and fix-protocol-disposition.json / fix-browser-disposition.json.

## Recorded-report provenance

The existing internal report owner publishes the reviewed CD input at canonical CD_TESTS.md. The registered evidence/CD_RECORDING_PROVENANCE.md explicitly corrects the report's assumption that its previous Markdown file was unchanged. Prior decision/revision/digest receipts and contemporaneous raw test/evaluation/source evidence remain available; a byte-identical preserved previous Markdown body is not claimed. This clarification changes neither current source qualification nor its pass decision and does not turn historical failed checks into passes. CD_TESTS-02.md is an identical reviewed input mirror, not a parallel current authority.

## Normalized findings consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CD-PERF-001 | emergent_risk | CD+Tests | resolved | CD_TESTS.md; evidence/PERFORMANCE_FIX.md; fix2-performance.log; fix2-performance-confirmation.log; source-final.json | None for this finding; proceed through the remaining quality owners. |

CR supports Quality Readiness; qa-gate alone decides final QA. No human QA/UAT, installation, VCS or release approval is inferred.
