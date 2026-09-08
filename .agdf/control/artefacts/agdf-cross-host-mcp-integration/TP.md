# TP: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: approved
Gate: TP
Gate approval: Exact `Approval: TP` for Revision 2 was accepted on 2026-09-08 after
same-target, same-run, same-gate and run revision
`A1667D1E-1C90-487D-A439-90572F52625D` revalidation.
Previous approval: Exact `Approval: TP` for Revision 1 was accepted on 2026-09-06 after
same-target, same-run, same-gate and run revision
`2492951D-2FD8-4AA2-BC58-502B6A6E8EC0` revalidation. That approval remains historical and does
not cover PRD or SD Revision 2.
Revision: 2
Date: 2026-09-08
Owner: Arndt Gold / Codex
Run: agdf-cross-host-mcp-integration
Based on: approved SD Revision 2, approved PRD Revision 2, CHMCP-AC-01 through CHMCP-AC-24 and review findings CHMCP-CR-07 through CHMCP-CR-12
Delivery depth: Structured Delivery

This revision plans the bounded correction of the already delivered four-host MCP lifecycle. The
historical TP Revision 1 tasks remain delivery evidence for the lifecycle, adapters, shared runtime,
documentation and host lanes. Revision 2 adds only the missing language-contract work: strict
external input, a complete English registry invariant, one semantic function description, separate
system-locale adaptation, one shared test matrix across both production MCP protocols and distinct
loaded-host observations.

## 1. Baseline And Scope

- Source baseline: commit `599b23b35990e4678dbf6830c71476a3c0e7e782` plus the current
  uncommitted language and governance corrections already inventoried in the run state.
- Product version: `0.14.5`.
- Existing semantic owner: `create-agdf/lib/skill-dispatch/contract.js`.
- Existing service boundary: `create-agdf/lib/skill-dispatch/service.js`.
- Existing presentation and locale owner: `create-agdf/lib/interaction-presentation.js` and
  `plugin/meta/agdf-interaction-locales.json`.
- Existing detected-system-locale owner: `create-agdf/lib/cli/runtime-context.js`.
- Existing production MCP test boundary: `agdf-mcp-server/test/protocol.test.js` for protocol
  versions `2025-11-25` and `2026-07-28`.
- Historical lifecycle delivery: TP Revision 1 tasks CHMCP-TP-01 through CHMCP-TP-22 and tests
  CHMCP-C01 through CHMCP-C20. They are not reopened unless the correction changes their behavior.

Included:

- exact function-owned meaning for `presentation_language`;
- one shared strict BCP 47 lexical constraint and canonicalizer for MCP and direct service input;
- schema and service rejection for missing, wrong-type, empty, padded, list, underscore,
  POSIX-suffixed and malformed input;
- proof that invalid input stops before activation, target resolution and gate evaluation;
- canonical registry validation with a mandatory complete `en` pack and exact pack parity;
- exact-pack, primary-language-pack and complete-English resolution for valid tags;
- a separate adapter for trusted detected system locales;
- one table-driven language matrix shared by contract, service, registry, presentation and both
  production MCP protocol tests;
- separate loaded-host observations for language selection where a host exposes submitted
  arguments;
- generated binding, documentation, Context Graph, review and QA reconciliation.

Excluded:

- a new MCP tool, protocol version, schema version, transport or authorization path;
- server-side inspection of conversation text or model-language detection;
- per-field translation fallback, runtime translation services or a configurable fallback locale;
- changing target, gate, approval, lifecycle, plugin-installation or host-adapter authority;
- treating repository tests as proof that a loaded host selected the correct request language;
- public publication, release, commit or push.

## 2. Task List

Effort is a bounded engineering estimate rather than elapsed agent time: S = 1 to 2 hours,
M = 2 to 4 hours, L = 4 to 8 hours. Only CHMCP-TP-23 through CHMCP-TP-30 are pending in Revision 2.

| task_id | Task and source boundary | Depends on | Acceptance mapping | Evidence required | Effort |
|---|---|---|---|---|---|
| CHMCP-TP-23 | Revalidate this TP, the exact run revision and the current worktree after TP approval. Refresh Brownfield Analysis at depth-policy v1 before product edits. Inspect the semantic contract, service, presentation, registry, runtime-context, generated bindings and production MCP protocol seams. | Exact TP Revision 2 approval | AC-21 through 24 | Brownfield Analysis names reuse, dependency direction, errors, test seams and any conflict with SD Revision 2. A material conflict returns to SD. | M |
| CHMCP-TP-24 | Create one table-driven language fixture owner and capture pre-change controls. Cover absent, wrong type, empty, padded, underscore, POSIX suffix, list, malformed, supported, regional, valid unsupported and registry-mutation rows. | TP-23 pass | AC-21 through 24 | The current `de-DE.!!!` acceptance and mutable-fallback weakness reproduce before correction. Every matrix row has one expected boundary and result class. | M |
| CHMCP-TP-25 | Update `contract.js` as the semantic owner. Add the shared lexical pattern, preserve required input and replace the hardcoded installed-language list with the approved precedence, invalid-input and unsupported-language behavior. Verify every generated Skill and MCP `tools/list` projection consumes this exact description. | TP-24 | AC-23, 24 | Contract and projection tests prove byte-equal semantic text and schema constraints. No generated or host-specific binding owns an independent language rule or installed-pack list. | M |
| CHMCP-TP-26 | Implement strict public input validation in `interaction-presentation.js` and `service.js`. Reject input without coercion, trimming, underscore repair, suffix stripping or list selection. Ensure direct callers return stable `invalid_input` and `dispatch_input_invalid` before activation, target or gate work. | TP-24, 25 | AC-21 through 23 | Handler and service spies prove zero activation, target and gate calls for every invalid row. Valid canonical and regional tags continue to the same downstream path. | L |
| CHMCP-TP-27 | Strengthen `validateLocaleRegistry`, `resolvePresentationLocale` and `localePack`. Require `schemaVersion: 1`, exact `fallbackLocale: en`, a complete English baseline, canonical unique locale keys and exact pack-key parity. Resolve exact pack, primary pack, then immutable complete English pack. | TP-24, 26 | AC-21, 22 | Registry-mutation tests reject missing English, non-English fallback, aliases, duplicates and incomplete packs. Unsupported tags render one complete English pack with no hybrid fields. | L |
| CHMCP-TP-28 | Add `canonicalizeDetectedSystemLocale` to `runtime-context.js` and route only trusted detected operating-system locale values through it. Keep explicit CLI, configuration, service and MCP values on the strict path. | TP-26 | AC-21 through 23 | `de_DE.UTF-8` succeeds only as detected system input. The same value fails through explicit CLI, direct service and MCP paths. Existing locale detection remains compatible. | M |
| CHMCP-TP-29 | Apply the shared matrix to direct service, registry, presentation and production MCP tests for both `2025-11-25` and `2026-07-28`. Keep protocol results separate and add loaded-host observations for explicit response language, dominant language and mixed or ambiguous input where each host exposes the submitted argument. | TP-25 through 28 | AC-21 through 24 | Both protocol reports distinguish SDK rejection from successful structured results, assert `authorizes: false`, complete pack consistency and empty STDERR. Host records identify the exact client and submitted tag and never substitute for protocol evidence. | L |
| CHMCP-TP-30 | Update the interaction contract, beginner architecture documentation, Context Graph and delivery evidence. Run Task Plan Review, Clean Implementation Review and Code Review; correct in-scope findings, rerun affected checks and invoke QA Gate. | TP-29 green | AC-01 through 24 | Documentation explains the four language classes and ownership boundaries. Reviews are current, all pending tasks and criteria map to evidence, and no unresolved revise/block finding is hidden from QA. | L |

## 3. Test Plan

### 3.1 Shared Language Matrix

| matrix class | Representative input | Schema/MCP boundary | Direct-service boundary | Presentation result |
|---|---|---|---|---|
| missing | property absent | SDK input error before handler | `invalid_input`; no activation, target or gate | no governance card |
| wrong type or empty | `null`, `0`, `""` | SDK input error before handler | `invalid_input`; no activation, target or gate | no governance card |
| padded or list | `" de "`, `de,en` | SDK input error before handler | `invalid_input`; no activation, target or gate | no governance card |
| underscore or POSIX | `de_DE`, `de-DE.UTF-8` | SDK input error before handler | `invalid_input`; no activation, target or gate | no governance card |
| malformed | `de-DE.!!!`, `de--DE` | SDK input error before handler | `invalid_input`; no activation, target or gate | no governance card |
| supported | `de`, `en` | handler called once | normal governance evaluation | one complete matching pack |
| supported regional | `de-DE`, `en-US` | handler called once | canonical tag reaches downstream work | one complete primary-language pack |
| valid unsupported | `fr-FR`, `es` | handler called once | canonical tag reaches downstream work | one complete English pack |
| registry mutation | fallback `de`, missing `en`, key `DE`, incomplete pack | server initialization or presentation setup fails | registry validation fails before rendering | no partial or hybrid card |

The same fixture data drives the lexical constraint tests, strict canonicalizer, direct service,
registry, renderer and both production MCP protocol suites. Layer-specific expected envelopes may
differ, but input classification and semantic outcome may not.

### 3.2 Acceptance Checks

| test_id | Acceptance behavior | Deterministic evidence | Direct or separate evidence |
|---|---|---|---|
| CHMCP-C21 | Supported and regional tags render exactly one complete matching or primary-language pack on every dispatch path. | Contract, service, registry and renderer matrix | Both production MCP protocols reported separately |
| CHMCP-C22 | A valid unsupported tag renders the immutable complete English pack while stable keys, codes and authorization remain unchanged. | Registry mutation and whole-pack snapshots | Both production MCP protocols reported separately |
| CHMCP-C23 | Missing or invalid input fails before governance evaluation without coercion or a governance card. | Schema, strict canonicalizer and zero-call service spies | SDK error observations on both production MCP protocols |
| CHMCP-C24 | The semantic owner tells hosts to use explicit response-language instruction, otherwise dominant request language, otherwise `en` for mixed or ambiguous input. | Function-contract and generated-projection equality | Per-host fresh-session observation where submitted arguments are visible; unsupported clients remain explicit gaps |
| CHMCP-C25 | Trusted detected system locale adaptation is isolated from all explicit inputs. | Runtime-context unit and CLI tests | No host-language claim; this is a CLI environment boundary |
| CHMCP-C26 | Invalid registry metadata cannot produce a presentation, and a resolved presentation cannot mix packs. | Registry mutation and renderer completeness tests | Production server startup/presentation failure where applicable |

Historical checks CHMCP-C01 through CHMCP-C20 remain regression coverage. They must be rerun only
to the extent that changed owners or generated assets can affect them, followed by the existing
aggregate smoke suite.

### 3.3 Dual-Protocol Evidence

`agdf-mcp-server/test/protocol.test.js` must run each applicable matrix row independently for
`2025-11-25` and `2026-07-28`. The retained report records for each protocol:

1. initialization and negotiated protocol;
2. `tools/list` schema and exact semantic description;
3. SDK error response for missing, wrong-type and lexically invalid input;
4. structured result for supported, regional and valid unsupported tags;
5. exact `structuredContent.authorizes: false`;
6. complete one-pack language consistency across all human-facing fields;
7. unchanged stable machine keys and diagnostic codes;
8. empty STDERR and clean shutdown.

One protocol result cannot satisfy or mask the other. Repository service tests cannot replace
either protocol lane.

### 3.4 Loaded-Host Evidence

Loaded-host checks remain separate from repository and MCP protocol evidence. For Copilot, Codex,
Claude Code and OpenCode, use a fresh available client session and a controlled request set:

1. explicit German response instruction;
2. explicit English response instruction;
3. one clearly dominant natural-language request;
4. one mixed or ambiguous request that should submit `en`;
5. one request for a valid unsupported response language where the host should submit that tag and
   the server should render English.

Record exact host, client version, OS, scope, session freshness, tool discovery, submitted
`presentation_language`, result language and cleanup. If the client does not expose submitted
arguments, authentication is unavailable or policy blocks invocation, retain the precise gap. Do
not infer host selection correctness from English output alone.

### 3.5 Planned Verification Entrypoints

The implementation must use existing package scripts where possible. Final evidence records exact
commands rather than assuming these planning names exist:

```text
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:skill-dispatch
npm --prefix create-agdf run test:mcp-server
npm --prefix create-agdf run test:mcp-lifecycle
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run smoke-test
git diff --check
```

## 4. Acceptance Traceability

| PRD criterion | Primary tasks | Primary test |
|---|---|---|
| CHMCP-AC-01 through CHMCP-AC-20 | Historical TP-01 through TP-22; regression impact checked by TP-23 and TP-30 | Historical C01 through C20 plus affected aggregate regression |
| CHMCP-AC-21 | TP-24, 26 through 29 | C21, C25, C26 and both protocol lanes |
| CHMCP-AC-22 | TP-24, 27, 29 | C22, C26 and both protocol lanes |
| CHMCP-AC-23 | TP-24, 26, 28, 29 | C23, C25 and both protocol lanes |
| CHMCP-AC-24 | TP-25, 29, 30 | C24 plus separate loaded-host records |

## 5. Brownfield Scope

After TP approval and before product edits, Brownfield Analysis must inspect the complete current
diff and the approved PRD, SD and TP revisions. It must verify that the correction reuses the
existing function contract, service, presentation, locale registry, CLI runtime context and MCP
protocol harness. It must reject a second validator, a host-specific language list, a second locale
registry, per-field fallback or server-side conversation-language detection.

The analysis explicitly covers schema compatibility, direct embedded callers, generated Skills,
CLI detected and explicit locale paths, SDK validation timing, activation/target/gate side effects,
registry initialization, error envelopes, two protocol versions, installed-host observability and
release-asset generation. A material design conflict returns to SD.

## 6. Execution Order

1. After exact TP Revision 2 approval, execute TP-23 and stop on a Brownfield conflict.
2. Capture TP-24 pre-change controls before modifying product code.
3. Update the semantic contract in TP-25.
4. Implement strict input handling in TP-26.
5. Implement the registry invariant and resolution order in TP-27.
6. Isolate trusted system-locale adaptation in TP-28.
7. Execute the deterministic and dual-protocol matrix before loaded-host observations in TP-29.
8. Reconcile documentation, governance evidence and mandatory reviews in TP-30.
9. Invoke QA only after every changed layer passes and all host gaps remain explicit.

## 7. Required Evidence Before QA

- exact TP Revision 2 approval and passing refreshed Brownfield Analysis;
- a pre-change reproduction for `de-DE.!!!` and mutable non-English fallback;
- one shared matrix owner covering every class in section 3.1;
- semantic contract and every generated projection with exact description equality;
- schema and direct-service invalid-input results with zero activation, target and gate calls;
- registry mutation results and whole-pack completeness proof;
- separate detected-system-locale and explicit-input results;
- separate reports for MCP `2025-11-25` and `2026-07-28`;
- direct loaded-host observations or exact per-host gaps, kept separate from protocol proof;
- affected historical C01 through C20 regressions and full aggregate smoke result;
- updated interaction contract, architecture documentation and Context Graph;
- current Task Plan Review, Clean Implementation Review and Code Review;
- `CD_TESTS.md` mapping TP-23 through TP-30 and C21 through C26;
- `git diff --check` and exact changed-path inventory.

## 8. QA Severity And Stop Conditions

QA blocks if invalid external input reaches activation, target or gate work; unsupported language
can render a non-English or mixed pack; English is missing or mutable; locale rules have more than
one semantic owner; the two protocol versions are merged into one claim; a loaded-host claim lacks
the submitted argument; stable machine semantics or `authorizes: false` change; or required tests
fail.

QA revises if the implementation accepts input outside the approved lexical contract, preserves a
parallel installed-pack list, performs per-field fallback, uses POSIX cleanup for explicit input,
documents behavior that tests do not prove or leaves an in-scope review finding unresolved.

A host that cannot expose the submitted argument limits CHMCP-AC-24 evidence for that exact client.
It does not invalidate the deterministic contract or protocol results and cannot be described as a
successful loaded-host selection observation.

## 9. Context Graph And Knowledge Decision

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-REQUEST-ACTIVATION-AUTHORITY`;
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`
- context_graph_reconciliation: `design_resolved_implementation_pending`
- context_graph_required_action: after implementation, record strict dispatch validation, immutable
  English pack resolution, separate system-locale adaptation, dual-protocol evidence and bounded
  loaded-host language-selection evidence
- memory_target: `context_graph`
- memory_reason: The language ownership and evidence boundaries are reusable architecture facts.

## 10. Next Step

Task Plan Revision 2 is approved through exact `Approval: TP`. Run the refreshed Brownfield
Analysis before any product edit. If it passes, implement CHMCP-TP-24 through CHMCP-TP-30 in
dependency order. Publication, release, commit and push remain outside this approval.
