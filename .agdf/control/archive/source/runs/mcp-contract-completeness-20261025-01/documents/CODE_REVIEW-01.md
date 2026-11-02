# Code Review: MCP contract completeness and guarded C2 evidence

Decision: pass
Date: 2026-10-25
Reviewer: Codex, cooperative local review
run_id: mcp-contract-completeness-20261025-01
source_revision: 0b3a75a2-858e-4c5a-903c-56b51fd4232d
Based on: TP.md @ sha256:52f644123916ad5db5b102d8508d094db110a6e3d032e3ed23a2febdec7f0adb; CD_TESTS-03.md @ sha256:b3fc9587d6cccb3150537f67b20b552dd240fe659ee39dbf2cb1d2db2e3ad15e

## Code Review

- findings: No open defect found in the reviewed implementation and affected tests. This is the local author's evidence review, not an independent reviewer or proof of general MCP conformance.
- missing_evidence: none for this approved scope; broader native host, production and comparative usability qualification are outside the acceptance claim.
- risks: Final decision-enabled command discovery has 67 bytes of headroom. The native task still requires recovery from seven/eight SDK-invalid calls; passing task completion does not demonstrate efficient first-attempt use. The original unguarded session remains unqualified, with its trust entry untouched.
- required_next_step: Complete TP and solution-integrity evidence, then qa-gate evaluates the actual current evidence and prepares a fresh human QA decision.

## Actual diff and boundary assessment

Reviewed the actual diff and affected neighbors in packages/core/lib/control-state/run-command-contract.js, packages/cli/lib/mcp-dispatch-runtime.js and mcp-lifecycle/profile.js, packages/mcp-server/src/server.js and ui-capability.js, the existing native task/parser/host owners, metadata, packaging baseline, README and affected tests. Exact current source applicability is recorded in evidence/c2-prerequisites-01/source-freeze.json; repaired harness/verifier bytes are bound by evidence/implementation-03/source-manifest.json. Generated compatibility outputs are projections of the recorded 56-scenario observation and verified matching source/payload fingerprints, not hand-authored qualification.

The request-local capability decorator uses public SDK APIs. Classification and the registered synchronous input schema precede a modern tool denial; unknown/disabled tools, bad arguments and malformed mandatory metadata remain SDK-owned. The typed resource error and tool denial agree on -32021 and requiredCapabilities; the legacy behavior remains separate. Original transport send, callback context/options/session methods, close and pending-ID drain are preserved. Evidence includes the nine actual wire exchanges and exactly one supported execution, both protocol-era matrices and lifecycle/worker/lock tests, not only exception text.

Core remains the input/help and structural-result owner. Deterministic local-reference discovery derives from the expanded input model; finite diagnostics preserve strict input semantics and handle only the needed structural output types. Public compact output schemas are an intentional essential projection, with the complete structural model enforced at existing producer/consumer/postprocessing boundaries. Faults yield bounded failures without a second execution or invented effect certainty. Reviewed parity, legitimate/minimal results, malformed outputs, error projection, source/revision/receipt/UUID recovery and result-limit assertions are retained in implementation-02 and the criterion assessment.

The lifecycle profile reads the canonical dispatch annotation; the manifest now agrees with it. The Copilot change is exactly the authorized 397 files / 3509461 bytes, no headroom. Dependencies, SDK pin, versions and MCP thresholds remain unchanged. Normal build, all three actual archives and their consumers passed, with current archive identity rechecked under C2. Historical and foreign observations were preserved.

The T7 host route is explicitly selected and tuple-bound, with exactly two repetitions and no resume/retry. macOS write denial wraps all child preflights and model exec; all three protected paths use canonical home resolution. Missing guard/auth/version or manifest drift stops execution. The preflight-only route invokes zero models. T4/default mode retains its own permissions. Existing account credentials are not read/copied by T7; only the CLI owns account/session persistence. The matching newly returned thread ID selects its own session record. Pure Promise projection and known pre-execution SDK rejection recovery do not bypass prior authoritative bindings, one accepted original approval, trace completeness or isolation checks.

## Verification and limitations

The retained deterministic suites, build/archive consumers, raw protocol/error/lifecycle evidence and fixed 20+20 performance arrays remain applicable to the exact unchanged candidate, as freshly assessed in c2-prerequisites-01. No unchanged broad test is described as newly rerun. Failed dependency/build/cache/deadline/contended performance attempts remain retained with their scoped resolution; no lowered assertion or raised MCP threshold was used.

Both actual guarded C2 observations in evidence/c2-native/repetition-01 and repetition-02 have complete traces, exactly one bound UR effect each, gpt-6.1-sol/low, identical protected manifests and no detours. Original failure evidence is immutable. Metrics remain 13 calls each, eight/seven SDK-invalid calls, nine/eight isError results and 85665/81495 ms model-session wall time. These figures are separate from synthetic MCP p95. No more real model invocations are authorized by the exhausted three-invocation Run allowance.

## Normalized gaps

No new applicable finding. The current CD_TESTS-03.md resolved F-003/F-004/E-001 rows retain their original classifications and concrete resolution evidence; the old CD_TESTS-02.md revise result and original isolation failure are not rewritten or promoted.

## Knowledge disposition

- memory_target: scope_artifact
- memory_reason: Candidate-specific review and execution evidence stay in this Run; source ownership remains unchanged.
- memory_refs: CD_TESTS-03.md; evidence/c2-prerequisites-01/; evidence/c2-native/
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: BROWNFIELD_ANALYSIS-03.md preserves the existing linked Brownfield knowledge; no new reusable graph claim or graph mutation is made here.
