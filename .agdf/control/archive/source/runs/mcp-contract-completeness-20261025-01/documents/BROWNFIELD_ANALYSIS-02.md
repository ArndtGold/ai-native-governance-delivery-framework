# Brownfield Analysis: MCP contract implementation path

Decision: pass
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Date: 2026-10-25
Owner: Codex brownfield-analysis

## Approved scope and inputs

Run mcp-contract-completeness-20261025-01, revision 6dcc5d88-2ede-4ae1-8848-fe841da7657d. Renewed TP approval operation 174e2045-53d0-48ce-ae24-21ec7928ee52 binds TP.md @ sha256:b928e629d5073e5faf23fb8bf869d73135314303f89411afc8aee8ae6331e2f6 and unchanged approved UR/PRD/SD. Source revision 123fa0af-740e-45f9-a691-15476bd8f649 archived the superseded sources and invalidated fulfillment. The retained source delta at HEAD c327c50deae6e5b4fd8071c9e03b1ef2803df6ae implements the previously approved MCP scope; previous tests remain historical input, not refreshed fulfillment. This analysis reassesses the retained owners against the renewed exact baseline exception. Foreign untracked handoff/host-observation files, old evidence, and incomplete root dist/npm remain protected. T-001 covers the implementation paths; T-010 remains later formal review.

## Existing coverage and minimal reuse path

| Boundary | Current evidence and coverage | Strategy and implementation owner | Regression obligation |
|---|---|---|---|
| SDK/transport | server.js already owns McpServer registration/serveStdio, deferred Ajv schemas, response boundary, direct resource callback and capability discovery. ui-capability.js owns request-local modern versus negotiated legacy capability access. Public SDK 2.0.0 exports classifier, typed error and Transport; SD_SDK_SEAM_FINDINGS-01.md documents the inspected public connect seam. Retained modern denial uses exported classifier/error and the public connect Transport decorator; scoped STDIO tests are historical evidence pending final-candidate verification | Extend existing server with a small public connect subclass/decorator and registered-schema eligibility; extend pure capability helpers. Keep SDK framing/maps/validation/era/codec. No private hook or additional dispatcher | Actual STDIO both eras, malformed metadata/input/unknown tools, wrong/supported MIME, per-request alternation, exact resource route, zero execution and callback/send/close/drain/cancellation |
| Input/help | run-command-contract.js owns descriptors, eleven-field envelope, expanded group schemas, finite own-data checker and operationContract. Retained shared property/payload descriptions and deterministic compact local refs are implemented; expanded checker stays authoritative | Extend this owner with shared field/payload help and deterministic local-ref discovery projection; Core checker stays expanded. No external refs, new parser/registry or validator runtime | Contract/examples and SDK parity corpus; exact final definitions including decision metadata |
| Results/error ownership | run-command-service.js emits full and minimal negative/fallback variants. mcp-dispatch-runtime.js adds execution failures and decision presentation delivery. mcp-tool-errors.js validates producers/consumers and descriptors and retained full structural command result checking runs before serialization and after postprocessing | Add one complete structural result model and bounded public projection at command owner; extend current finite checker only for needed constructs. Call shared checks at existing producer/consumer boundary after postprocessing, preserving original generation descriptor policy | Five-family normal/minimal/budget/executor/postprocessed positives and negatives, malformed success/error, checked fallback and single effect/original UUID after uncertainty |
| Generation/safety | Existing runtime manifests bind definitions; toolResult preserves projected producer metadata and response-limit fallback; workers/locks/provenance have current tests | Reuse all current ownership and equality checks. No receipt rewrite, replay, worker replacement, new writer or installed generation replacement | Generation/package/provenance and current safety/termination/lock suites remain mandatory |
| Metadata/package | Retained manifest/prose and lifecycle validation now compare canonical dispatch metadata. Existing Copilot baseline is still 3495133 bytes / 397 files; canonical all-profile generator measured 3509461 bytes / 397 files and stopped on AGDF_COPILOT_PAYLOAD_GROWTH. Existing build/generate/npm assembly owners remain authoritative | Apply only max_bytes 3509461 with max_files 397 and measured zero headroom under plugins/agdf/meta/copilot-payload-baseline.json; reuse scripts/sync-package-assets.js and assemble-npm.mjs. Preserve all MCP budgets and source/digest checks, profile exclusions, historical and development wording | Deliberate mismatch fixtures, source/generated/archive equality and existing installation-facing contracts |
| Native task | Existing Codex host owner contains focused T4 candidate/fixture/JSON/rollout/isolation path; shared native-run.js has T4-specific parser/auditor. Retained supplemental T7 path reuses this owner and its fixture/verifier while keeping the original T4 path and historical baselines; offline tests already exercised two mocked sessions, not real model runs | Scoped T7 mode at same host owner, reused task/fixture/verifier/metrics with explicit host-qualified parsing. Existing account via exec --ignore-user-config and inline candidate-only config; no credential handling or installation. Two fresh gpt-6.1-sol/low runs, no additional API expenditure | Offline spawn/config/two-session/no-fallback tests first; actual exact candidate/model/effort/full trace/fixture transition/isolation and account usage recorded; missing evidence stays open |

Current overall coverage remains partially_done. Retained code and scoped historical deterministic tests cover the public Transport seam, shared descriptions/full-result model/compact projection, metadata and T7 harness. The renewed exact Copilot packaging exception is not yet applied, required all-profile generation and package checks need renewal, and actual two-session native evidence is absent. No persistence format migration is planned. Schema structure must preserve all legitimate current fields and negative variants; model validity must not be inferred from a happy-path example. Test additions belong at existing owners named by TP routes R1-R10, not a new policy/evidence system.

## Risks, constraints and implementation order

Public transport interception has a lifecycle surface: forward every normal message/context unchanged, use the original channel to settle denied request IDs and preserve SDK input/error precedence. Only a known enabled tool with valid synchronous registered input and valid modern envelope can be denied early. Resource lookup stays SDK-owned. If this seam cannot satisfy real tests, route a design gap to SD rather than patching private SDK state.

Discovery has limited headroom: retained failed probes -01 through -03 and feasible -04 are subordinate design evidence only. Measure final metadata/compositions; do not raise 8192/24576/65536/1048576 or 1500/1000ms thresholds. Output schema tightening must not invent receipt/effect facts or create replay. Input projection references are only local SDK-validated discovery; existing Core own-data validation remains strict. Full result checking and producing-generation policy retain their current owners.

Order: exact Copilot baseline change and isolated final candidate generation; required package/functional/safety/provenance checks on that candidate; refreshed final discovery and p95; offline scoped Codex checks; two existing-account gpt-6.1-sol/low sessions at most; task/clean/code reviews and sole QA assessment. Root build:prepare previously hit a pre-existing duplicated control-ui dependency tree (ENOTEMPTY); use a disposable clean candidate and existing locked dependencies/prebuilt UI only with explicit source/provenance limits, preserve foreign root dist and dependencies, and retain any canonical build failure as an open qualification limit rather than claiming full build success. Rebuild changes invalidate dependent evidence. This pass determines a safe reuse path; it claims no renewed test fulfillment, native qualification or delivery completion.

## Scope and authority

No material upstream ambiguity or new architecture choice was found beyond approved SD/TP. No accepted technical debt, parallel registry, writer, permission store, SDK fork, dependency change or generic dispatcher is proposed. If execution exposes an actual gap, retain its evidence and route through the existing normalized owner. The approved TP is sufficient for the scoped path after this internal record, without another human Brownfield approval.

## Context Graph and knowledge persistence

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: existing owners above remain authoritative; this is candidate-specific implementation preparation, not a new durable project-memory claim
- memory_target: scope_artifact
- memory_reason: retain exact Run/source-bound preparation and limits here
- memory_refs: this report and approved TP/SD

## Missing evidence and next step

No missing existing-system fact blocks implementation preparation. Final candidate generation, affected functional/package/provenance/budget/safety checks and actual native evidence remain explicit TP obligations. The existing source route, exact baseline owner and accepted TP exception are sufficiently known to continue; missing execution evidence prevents completion/QA, not this preparation decision. Record this actual analysis through the existing internal step writer, redispatch gate-check, and begin CD+Tests only on its fresh permitted route.
