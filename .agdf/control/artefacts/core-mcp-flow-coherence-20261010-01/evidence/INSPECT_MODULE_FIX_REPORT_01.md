# Inspect module selector correction

Run: core-mcp-flow-coherence-20261010-01
Consumed revision: 263caefb-7390-40c3-901c-6a32f039d916
Date: 2026-10-11
Scope: TP T-003/T-008/T-010; existing Inspect discovery, diagnostics and verification only.
Evidence report only; not formal CD+Tests/review fulfillment or final QA.

## Finding and correction

The agent first omitted the published required expected_revision_id, then used
prepare/presentation.prepare instead of agdf_prepare/presentation.prepare. Those
were caller mistakes; neither operation wrote or approved anything. The product
diagnostic compounded the second mistake by naming kind instead of the actual
module input and providing no usable allowed selector. The successful corrected
native Inspect call confirms the previously prepared uCKria candidate was loaded.
NATIVE_PROBE_NEXT_HOST_LOADING_01.json records its exact runtime and disposable
German SD presentation 939d83bc-7643-48c2-8aee-678ae5b8c570. Preparation is not human
decision, visible rendering or permission evidence.

The existing Inspect contract now generates canonical module selectors from
RUN_COMMAND_GROUPS, uses that list for validation, and identifies module in its
recovery and structured diagnostic. Its discovery contains the exact prepare
example. The existing localized recovery renderer allows the bounded registry
group/kind grammar only for module values. It does not reflect arbitrary input,
accept shorthand aliases, widen the allowlist or change terminal recovery rules.

## Verification

Three source suites passed: full CLI/Inspect schema, binding and read-only parity;
shared interaction rendering; command definitions and negative validation.
The initial four-suite invocation retains one failure because its default
dist/npm fixture was stale and rejected the current locale registry before reaching
the correction. After explicit regeneration/assembly, the actual current packaged
MCP run-command suite passed over both protocol eras, including corrected
description discovery, every allowed contract, stale binding and rejected selector
cases. Copilot profile and payload-budget suites separately passed (two suites).
All original failed logs are retained and are not represented as passing.

Inspect discovery is 4999 bytes against its unchanged 5000-byte ceiling. Exact
generated Copilot growth is 321 bytes: existing contract +136, service +112 and
recovery renderer +73. Its reviewed inventory is 229 files / 2004304 bytes, with
no spare headroom. Build and exact source/package identities are retained in
INSPECT_MODULE_FIX_VERIFICATION_01.json and INSPECT_MODULE_PAYLOAD_DELTA_01.json.

## Review disposition and remaining work

The same registry owns description/validation/allowed values; no second parser,
endpoint, writer, automatic retry or native permission assumption was introduced.
The focused diff review found no new blocker in this correction. This is bounded
review preparation, not the canonical CR or sole qa-gate decision.

The loaded native candidate precedes the diagnostic correction. Human keyboard,
layout, all-gate/locale decisions, permission and final candidate qualification
remain open. The requested German test observation is pending; no response or
successful human click is inferred. Immediate Codex host close remains upstream;
the previously observed 30-minute idle expiry result is retained separately.
The fixed whole-workflow before/after corpus and full scenario mapping also remain
open. In particular, count the two observed invalid native invocations; do not
claim zero errors or controlled weaker-model benefit from a better diagnostic.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QAC-INSPECT-01 | implementation_gap | CD+Tests | resolved | INSPECT_MODULE_DIAGNOSTIC_FIX_01/02.log; INSPECT_MODULE_FIX_VERIFICATION_01.json | Reuse existing Inspect owner; preserve these negative/discovery regressions and exact candidate assignment in refreshed formal reviews. |
| QAC-CANDIDATE-01 | evidence_gap | evidence_obligation | open | NATIVE_PROBE_NEXT_HOST_LOADING_01.json; INSPECT_MODULE_FIX_VERIFICATION_01.json | Final native qualification must identify the actually executing corrected package; current observations remain scoped to their preceding loaded candidate. |
| QAC-BENEFIT-01 | evidence_gap | evidence_obligation | open | MCP_CANDIDATES.md; QA_INDEX SCN-044 | Complete comparable fixed-corpus counters; retain actual invocation mistakes and separate engineering reads from routine invocation searches. |
