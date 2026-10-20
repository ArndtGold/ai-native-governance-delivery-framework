# Scoped performance repair

Owner: Codex
Date: 2026-10-19
Bound Run: mcp-error-contract-phase1-20261019-01
Finding: CD-PERF-001

The user requested “Fix it” after the recorded CD+Tests revise result. Approved product intent, criteria, error semantics, ownership, protocol and executable thresholds remain unchanged. This repair stays at CD+Tests: reuse the selected state already validated within one gate evaluation, without a new worker lifecycle, persistent cache, optional check, privilege or public schema. No UR/PRD/SD/TP source statement requires changing. The approved exclusion of a general performance/warm-worker project remains in effect.

## Diagnosis

The diagnostic uses the actual owned candidate Worker executor and its existing phase observer, 20 calls, the existing 10 s deadline and current Run fixture. It is supplementary profiling, not a replacement for the unchanged SDK/stdio performance test. Raw phase/result/byte observations: profile-worker.json. The normal response is approximately 10,000 bytes; projection/consumption/serialization takes about 0.3 ms after its first call. Large outliers occur before projection, across imports, provenance and Core evaluation.

A separate inspector CPU profile of eight real Core evaluations on the retained common Control snapshot identifies repeated Run-history parsing/canonical validation and directory reads. Original aggregate sampled self time includes readdir 818.721 ms, canonicalJson and its object callback 721.193 ms, line-ending normalization 292.546 ms. These are sampled diagnostic costs, not end-to-end qualification figures. Source inspection confirms evaluateGateCheck invoked evaluateDoctor (which reads/validates the selected Run by discovering the complete canonical inventory), then called readRunState again and repeated that inventory validation.

Concurrent local contention is also observed: system load averages 6.66/12.12/16.18; a read-only process sample shows macOS iCloud bird at 85.6% CPU and fileproviderd at 18.7%. This does not establish that those services alone caused every outlier. No system service is stopped or reconfigured and no timing failure is waived on that basis.

## Repair and invariants

The existing Doctor owner exposes its report together with the exact selected state it already read, through evaluateDoctorWithRunState. Its existing evaluateDoctor entry retains the same report shape. Gate evaluation consumes that same observation and falls back to its existing read only when Doctor did not select a state (missing control or aggregate route). Parent/child evaluation and standalone Doctor checks retain their own reads.

The observation belongs to one synchronous evaluation. No state is retained between calls or across writes, no caller can supply a prevalidated state, and every writer keeps its existing fresh lock/revision/source verification. All canonical Run discovery, receipt/history validation, seal checks, boundary checks, quality/gate rules and negative results remain enabled. This removes duplicate work; it does not skip the initial validation or weaken a regression criterion.

The existing control-state suite gains behavioral regression checks for the retained observation, a freshly recorded revision on the next call, an unsealed later change, aggregate selection, missing Control and the unchanged standalone Doctor report. Existing broader control/continuation/recovery/package checks remain authoritative. Earlier development assertions initially referenced nonexistent report fields and then the invalid-seal code instead of the actual changed-content seal-mismatch code; those assertions were corrected to the existing contract. No product failure or performance assertion was relaxed.

## Qualification

Pending canonical final build, real dependency snapshot, unchanged performance suite and affected regression checks. Passing profile timings alone cannot close this finding.

## First qualification and cold-start follow-up

The first unchanged final-package performance check after the Core repair passes warm dispatch: p95 773.708 ms (all 20 samples 655–774 ms). It fails cold tools/list at p95 3270.028 ms; the original failed log is fix-performance.log. A common-Control alternating in-process diagnostic yields median 309.286 ms before and 183.351 ms after (fix-causal-comparison.json). This is source-level diagnostic evidence, not a substituted performance test.

Four instrumented owned cold processes, followed by four full initialize/list/teardown profiles, are summarized in profile-cold-summary.json and profile-cold-full-summary.json. SDK schema compilation is visible in the full profile, alongside module compilation, provenance hashing and filesystem work. All phases fluctuate under host contention; no claim assigns every cold outlier to one function.

Source verification of the pinned SDK 2.0.0 confirms fromJsonSchema immediately calls provider.getValidator; the SDK's default Ajv provider compiles the schema there. The adapter previously invoked this eagerly for every tool input and output during registration, even when the connection only discovers tools. The adapter now supplies a per-server deferred getValidator wrapper around the **same exported SDK AjvJsonSchemaValidator with default options**. It returns the same SDK validator result at the first validation and retains that compiled validator for later calls. Schema advertisement is unchanged; the SDK still validates input before execute and successful output after exactly one execute. No SDK version/provider options, schema, error behavior, trust boundary, deadline or test limit changes.

This is bounded initialization of the existing adapter's fixed schema inventory, not a new validator, policy evaluator, worker pool or persistent cache. An added actual SDK test asserts malformed first input cannot execute, malformed first successful output is rejected by the SDK, and subsequent invalid input remains rejected. Existing protocol-era and real owned/packed seams also remain required. The error-path independent domain validator remains necessary and unchanged because SDK output validation intentionally skips isError results.
