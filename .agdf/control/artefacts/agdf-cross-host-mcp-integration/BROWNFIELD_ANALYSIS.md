# Brownfield Analysis: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_ANALYSIS.md`
- run: `agdf-cross-host-mcp-integration`
- revision: 2
- date: 2026-09-08
- based_on: approved TP Revision 2, SD Revision 2 and PRD Revision 2
- source_baseline: `599b23b35990e4678dbf6830c71476a3c0e7e782` plus the current inventoried worktree
- scope: Verify the approved strict presentation-language boundary, immutable complete English
  fallback, separate detected-system-locale adaptation, shared dual-protocol matrix and loaded-host
  evidence boundary against the existing implementation before product edits.
- evidence: Direct inspection of `skill-dispatch/contract.js`, `skill-dispatch/service.js`,
  `interaction-presentation.js`, `cli/runtime-context.js`, the interaction locale registry,
  generated projections, MCP server registration, both production protocol lanes and existing tests.
- transparency: The correction can extend existing owners. It needs no second semantic contract,
  locale registry, dispatcher service, MCP tool, renderer or host adapter.
- missing_evidence: Loaded-host argument visibility remains client-dependent and must stay separate
  from deterministic and protocol evidence. This does not block the repository correction.

## 1. Current Coverage And Reuse

| Approved area | Current coverage | Reuse strategy | Existing owner and consequence |
|---|---|---|---|
| Language meaning | `partially_done` | `extend` | `skill-dispatch/contract.js` already owns the required property and all generated projections. Replace its hardcoded installed-language list with the approved semantic precedence. |
| Strict public tag validation | `partially_done` | `refactor` | `interaction-presentation.js` owns `canonicalizeLanguageTag`, but currently trims, replaces underscores and strips suffixes. Make that function strict and export its lexical source to the schema. |
| Invalid-input short circuit | `partially_done` | `extend` | `skill-dispatch/service.js` already normalizes before target evaluation and returns `dispatch_input_invalid`. Preserve this order and prove zero activation, target and gate calls. |
| Locale registry | `partially_done` | `strengthen` | `validateLocaleRegistry` already checks pack parity, keys and budgets, but derives its baseline and fallback from mutable metadata. Require exact `en` and canonical unique keys. |
| Locale resolution | `partially_done` | `strengthen` | `resolvePresentationLocale` already performs exact, primary and fallback lookup. Make the final choice the constant complete English pack. |
| Detected system locale | `partially_done` | `split input paths` | `runtime-context.js` currently sends explicit and detected values through the same permissive helper. Add one POSIX adapter used only after `detectSystemLocale`. |
| Protocol validation | `partially_done` | `extend` | `agdf-mcp-server/test/protocol.test.js` already runs both `2025-11-25` and `2026-07-28`, but only one successful German call. Apply the full shared matrix to each lane. |
| Loaded-host selection | `partially_done` | `observe separately` | Existing host evidence covers registration and bounded dispatch. Language-selection correctness requires fresh host evidence only where submitted arguments are observable. |

- current_coverage: Core behavior exists, but the public canonicalizer is too permissive, fallback
  metadata is mutable, function text duplicates installed-language facts and protocol tests omit
  negative and unsupported-language rows.
- reuse_strategy: Refactor the existing canonicalizer and runtime-context call sites, strengthen the
  existing registry validator/resolver, extend the existing semantic description and drive all
  affected tests from one shared fixture module.
- required_next_step: Capture pre-change controls, then implement CHMCP-TP-25 through
  CHMCP-TP-30 in dependency order.

## 2. Dependency And Data Flow

The retained dependency direction is:

```text
host-selected tag -> MCP schema -> strict canonicalizer -> dispatch service
                                                    -> target and gate evaluation
validated locale registry -> exact pack -> primary pack -> constant complete en pack
detected system locale -> CLI-only POSIX adapter -> strict canonicalizer
```

`contract.js` imports the lexical constraint from `interaction-presentation.js`. Generated Skills
and MCP `tools/list` import the function definition. They do not own copies. The service receives a
validated tag and asks the presentation owner for the resolved pack. The server does not inspect
conversation text.

No persistent control schema, host registration format, protocol version or MCP result schema
changes. Existing direct callers remain protected because service normalization repeats validation
after the MCP schema boundary.

## 3. Parallel-Structure And Drift Check

| Risk | Assessment | Required control |
|---|---|---|
| second language validator | clear | Export one lexical pattern and strict canonicalizer from `interaction-presentation.js`; schema and service consume them. |
| second semantic description | clear | Keep the complete host-selection meaning only in `SKILL_DISPATCH_FUNCTION_DEFINITION`. |
| second installed-pack inventory | clear | Do not list installed locales in model-facing text; validated registry keys remain the inventory. |
| second fallback owner | controlled | Require `fallbackLocale === "en"` and return constant `en` after exact and primary lookup. |
| mixed pack rendering | controlled | Exact pack-key parity and whole-pack resolution remain mandatory before rendering. |
| CLI repair leaking into MCP | controlled | Use a named detected-system-locale adapter only in the detected branch. |
| repository proof replacing host behavior | controlled | Retain separate protocol and loaded-host evidence records. |

Product-semantics drift is resolved by approved PRD and SD Revision 2. Runtime drift remains open
only in the current permissive implementation and is the exact approved correction. No blocking
ownership conflict or hidden migration is present.

## 4. Change Impact

| Dimension | Impact | Control |
|---|---|---|
| interface | `presentation_language` remains required but gains an enforceable pattern and exact semantics. | Contract, schema and both MCP protocol tests. |
| compatibility | Previously repaired values such as `de_DE` and `de-DE.UTF-8` become invalid on explicit paths. | Preserve only detected-system-locale adaptation and document the deliberate boundary. |
| errors | MCP schema failures and direct-service `invalid_input` differ by layer. | Shared classification matrix with layer-specific expected envelope. |
| side effects | Invalid input must stop before activation, target and gate work. | Injected spies assert zero calls. |
| data/schema | Locale registry structure stays version 1; validation becomes stricter. | Mutation tests for fallback, English baseline, canonical keys and pack parity. |
| security/authority | No authorization semantics change. | Assert `authorizes: false` on every successful and semantic-error result. |
| observability | Host selection cannot be inferred from rendered English alone. | Record submitted arguments only where the loaded host exposes them. |
| release assets | Generated bindings consume changed function text and schema. | Run release preparation, projection parity and package inventory checks. |

## 5. Test And Evidence Impact

One shared fixture module may be added under the existing skill-dispatch test boundary. It owns only
representative inputs and expected classes, not production decisions. Contract, service,
interaction-presentation and MCP protocol tests consume the same rows. Production code continues to
own validation and resolution.

The pre-change controls are already directly reproducible: `de-DE.!!!` resolves to German because
the canonicalizer strips the suffix, and a registry with `fallbackLocale: de` validates because the
baseline is derived from mutable fallback metadata. These are the two primary negative controls.

Both MCP protocol versions must report independently. Loaded-host evidence may record a precise gap
when the client hides submitted arguments or cannot run. Neither evidence lane substitutes for the
other.

## 6. Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_required_action: After implementation, replace current weakness evidence with the
  delivered strict boundary, immutable English fallback and separated evidence results.
- no_new_node_reason: The existing MCP dispatch adapter node already owns this contract.

## 7. Decision

The analysis passes. Existing owners are understood, the correction is bounded, the reuse path is
clear and no second source of truth is required. CD+Tests may begin for approved TP Revision 2.
