# MCP evaluation: evidence and candidate selection

Scope: direct evaluation without AGDF activation. Base main 5046858826f3bca7922c14ef402b095feca8b6fb. Product source changes exist only in an isolated temporary Git clone. The existing account is used only by the bounded guarded native probes; no account configuration changes or credential copying.

## Primary sources and interpretation

- OpenAI Function Calling: https://developers.openai.com/api/docs/guides/function-calling — make parameter meaning and usage clear, prevent invalid states, fill already known arguments in code, consider combining functions always used in sequence. This supports a visible root property schema and exact read navigation from canonical owners. It does not prove a particular local implementation improves task outcomes.
- Anthropic Writing effective tools for agents: https://www.anthropic.com/research/writing-tools-for-agents — high signal tool responses, clear parameter semantics, workflow-oriented tools, agent evaluations that retain task failures and usage. This supports testing real agents and judging completion before fewer calls.
- MCP tools specification: https://modelcontextprotocol.io/specification/2026-07-28/server/tools — validate inputs and return actionable errors; stateful operations require explicit identifiers and authorization checks. Navigation is read-only and cannot substitute for Run/target/revision checks or a deliberate human response.
- SDK issue 2879: https://github.com/modelcontextprotocol/typescript-sdk/issues/2879 — the v2 input validation failure occurs before tool callbacks and currently has a fixed private error construction path. This is corroborated in the installed SDK source; a private patch or no-op validator is rejected.
- Codex renderer source: https://github.com/openai/codex/blob/main/codex-rs/code-mode-protocol/src/json_schema_types.rs — branch combinators are rendered before sibling properties. The exact installed CLI 0.163.0 behavior was independently captured against a deterministic loopback server, with no model or account access.

## Alternatives

1. Keep main: real A1/A2 both record the intended fixture approval, but 7/9 SDK input errors, 13/15 calls. Only A1 satisfies the unchanged strict audit; A2 includes unsupported local wrapper operations. Both outcomes are retained.
2. Merely move root conditions below required operation: all fields become visible and schema acceptance is unchanged, but real B1/B2 fail to complete the task. Their smaller call counts are early aborts and are not counted as improvements.
3. Fully typed discriminated operation union: 6630-byte definition exceeds the unchanged 5000-byte Inspect definition limit. Rejected before model calls; no budget increase or validation relaxation.
4. Visible root properties plus precise selector semantics and bound read navigation: final candidate definition 4992 bytes; gate-check adds a separate navigation envelope with canonical presentation catalog and exact read calls only for an explicitly bound Run, validated by the catalog owner. The CLI report itself stays identical. Existing operation contracts, catalog, document reads and command owners remain authoritative. Ambiguity never selects a document; missing/invalid records never trigger preparation. Native evaluation follows the frozen experiment plan.

## Prototype limitations

- The first prototype added 2558 bytes to the Copilot distribution (397 files, 3512019 bytes vs existing 3509461 ceiling). The normal build rejects this. Baseline remains unchanged. This was a packaging acceptance failure. Version 2 removes duplicate selector mapping and shortens redundant help/comments, so the unchanged ceiling is respected: 397 files, 3509443 bytes, 18 bytes headroom.
- Native probe fixtures currently exercise one UR approval workflow. Held-out prompts are language/wording variants of that workflow, not evidence for all eleven operations or other host products.
- Protocol latency is observed on this machine and is not cross-host release qualification. All old negative observations remain immutable and separately linked.

## Refinement evidence

The initial guided prototype recorded the intended approval with zero SDK input errors, but parallel contract/document reads caused a real `dispatch_busy` result and Promise.allSettled was outside the unchanged wrapper audit allowlist. It remains a failed strict observation, not a success or a discarded run. The final description explicitly requests sequential next_calls, which matches the actual single-in-flight runtime. No auditor, parser allowlist, predicate, or timeout was weakened.

The final prototype keeps all CLI report fields unchanged; navigation is separate envelope metadata. A source-only test setup copied a workspace Core dependency as a physical stale directory. This was detected by the old discovery description in a local unit test and corrected to a normal workspace symlink before final native sessions. The actual assembled MCP provenance preflights independently verify the final 4992-byte definition. One obsolete description assertion in a temporary copy of the existing control-inspect test is updated for the new navigation wording; all selection, output, CLI parity, preview and read-only assertions remain unchanged and pass. The original test file is preserved.

Historical binding tests through real MCP preserve the original document revision, use the current revision for operation-contract, and reject both stale_revision and presentation_binding_invalid approval attempts without changing the Run. Ambiguity, missing documents, invalid records and foreign target/revision cases also fail closed.
