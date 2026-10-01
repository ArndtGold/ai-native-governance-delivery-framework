# Brownfield Review: Lesende AGDF-Operationen über MCP statt Shell

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-mcp-inspect-slice1-20260929-01`
- related_ur: `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` (approved, revision 2)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-09-29

## Objective

Size and route the approved change: expose the read-only control operations through the existing AGDF MCP server and let a `presentation_required` dispatch result carry the canonical review text, while every write operation and the approval binding stay on the existing CLI path.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Users see the same canonical cards and approval text; only the number of intermediate agent steps before the card appears changes. No decision, state, feedback or recovery semantics change for the user.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| MCP tool surface | `agdf-mcp-server/src/server.js`; `create-agdf/lib/mcp-dispatch-runtime.js` | `buildAgdfServer` registers exactly one tool from `runtime.definition` and executes through `runtime.execute(runtime.parse(...))`. The owned runtime validates version, provenance digests and the SDK layout before serving. Adding tools means the runtime exposes several definitions and the server registers each; the trust checks are reusable unchanged. | `medium` |
| Dispatch contract | `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/skill-dispatch/service.js` | `SKILL_DISPATCH_FUNCTION_DEFINITION` is the only tool definition. The result already has a `presentation` field that is populated only for terminal target orientation; `presentation_required` returns `presentation: null` and a `run-present` argv in `continuation.steps`. `outputSchema` already allows `presentation`, so carrying the review text is additive. | `medium` |
| Read-only evaluation | `create-agdf/lib/control-evaluation/gate-check.js`, `doctor.js`, `delivery-map.js`; `create-agdf/lib/cli/contract-command.js` | `evaluateGateCheck` returns `status_card`, `status_presentation` and a read-only `approval_presentation.preview_markdown`; `run-present` only persists the binding record on top of that rendering. Doctor and delivery-map are pure evaluations. | `medium` |
| CLI argument authority | `create-agdf/lib/cli/command-registry.js`, `parse-args.js`, `application.js` | Validation rules for `doctor`, `gate-check --json/--approval-envelope`, `delivery-map --json`, `contract --module`, `target-check` and `status` live in the CLI layer (for example `--module` only for `contract`, `--all-active` only for doctor/delivery-map). An MCP operation must reuse these rules, not restate them. | `medium` |
| Read boundary | `create-agdf/lib/control-read-boundary.js` | `assertMcpControlReadBoundary` rejects symlinks and non-file entries under `.agdf/control` before any MCP read. It applies unchanged to every new read operation. | `low` |
| Persistence / approval authority | `create-agdf/lib/control-state/run-presentation.js`, `run-recording.js`; `run-approve` | Presentation records, revisions and approvals are written only by the CLI write commands. The slice changes none of them; the `presentation_id` binding stays a CLI write. | `none` |
| Skills and contracts | ten `plugin/skills/*/SKILL.md`; `plugin/meta/contracts/interaction.md`, `gate-transition.md`; `plugin/meta/agdf-plugin.definition.json` | All ten skills already dispatch MCP-first and fall back to binding schema 2. Read operations are still named as shell commands about 40 times; `interaction.md` step 3 requires `run-present` before a gate question. gate-check must stay within its 6900-byte installed budget; the terminal-dispatch block is fingerprint-locked by `plugin/scripts/instruction-footprint.mjs`. | `medium` |
| Host lifecycle | `create-agdf/lib/mcp-lifecycle/*`, adapters for claude, codex, copilot, opencode | Installers register one server, not individual tools; tool discovery is protocol-side. No adapter change is needed for additional tools. Codex requires per-call approval and absolute launcher paths; Copilot and OpenCode MCP use is unproven. | `low` |
| Tests | `agdf-mcp-server/test/*.test.js` (protocol, safety, provenance, performance); `create-agdf/scripts/skill-dispatch-*.js`, `plugin-mcp-runtime-test.js`, `control-state-test.js`, `interaction-presentation-test.js` | Safety tests pin the single-tool surface and read-only behavior; dispatch tests pin the result shape. `control-state-test.js` is red on `main` at line 279 after commit 62e4140 (fixture expects `user_action_required: no` for a free-text QA-revise action); that suite will also host this slice's parity assertions. | `medium` |
| Package generation | `create-agdf/scripts/sync-package-assets.js`; `copilot-payload-baseline.json` | Skills and locales propagate through the existing generator; new tool descriptions add bytes to every session context and to the Copilot profile. | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: The change extends an externally consumed interface (the MCP tool surface hosts load) and the host runtime contract (dispatch result shape). It introduces no new data or source-of-truth owner, no security or policy authority, and no compatibility window: tools, skills and runtime ship together in one plugin version whose digest the owned runtime already verifies. The CLI remains the single engine; MCP operations must call the same service functions the CLI calls.
- architecture_evidence: `agdf-mcp-server/src/server.js` (single registration from `runtime.definition`); `create-agdf/lib/mcp-dispatch-runtime.js` (version and provenance gating, `interactionLocales` and `readSkillRuntimeContracts` already imported); `create-agdf/lib/skill-dispatch/service.js` lines 70–99 (`presentation` field and `terminalPresentationAction`); `create-agdf/lib/control-evaluation/gate-check.js` lines 469–541 (`approval_presentation.preview_markdown` computed read-only); `create-agdf/lib/cli/command-registry.js` lines 25–42 and 90–138 (read-only command grammar and validation).
- architecture_missing_evidence: none for selecting the bounded route. Whether the dispatch result may show the review text before a `presentation_id` exists is a design decision for SD: `interaction.md` step 3 currently ties visibility to `run-present`; the preview rendering itself is already read-only in gate-check.
- architecture_next_owner_and_action: SD owner Arndt Gold decides the preview-versus-binding sequence and the service extraction boundary; no new technical owner is introduced.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem — read-only operations reachable only through the shell although the MCP runtime already imports the evaluators and contracts | `mcp-dispatch-runtime.js` imports `readSkillRuntimeContracts` and `interactionLocales`; `command-registry.js` exposes `doctor`, `gate-check`, `delivery-map`, `contract`, `target-check`, `status` as CLI only; skills name them as shell steps | `revise` | Add read operations as thin wrappers over the existing evaluation functions; reuse CLI validation rules by extracting them into shared functions, not by copying. |
| problem — `presentation_required` forces one extra shell step before the user sees the review text | `service.js` sets `presentation: null` and emits `run-present` argv in `continuation.steps`; `gate-check.js` already renders `approval_presentation.preview_markdown` | `revise` | Populate the existing `presentation` field with the canonical preview; keep `run-present` as the binding write. |
| trade-off — every additional tool schema costs context tokens in every session on every host | dispatcher description in `contract.js` lines 36–63; `copilot-payload-baseline.json` | `revise` | One read tool with an `operation` enum instead of one tool per command. Rationale, accountable owner (SD owner Arndt Gold), mitigation (`payload:budget` test) and exit condition (measured profile accepted in `payload-budget-history.md`) are recorded in SD. |
| unresolved — the shared regression suite is red on `main` | `create-agdf/scripts/control-state-test.js` line 279 fails on 62e4140 and passes on its parent; owned by run `agdf-actionable-card-ux-20260928-01` | `revise` | Route to that run before this slice's CD+Tests; this slice must not silently absorb or weaken the failing assertion. |
| No parallel evaluation or presentation owner is introduced | `gate-check.js` remains the only status/approval evaluator; `interaction.md` forbids adapters from rebuilding cards | `none` | Reuse the single evaluator and renderer; the MCP layer never renders or decides on its own. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice` — one coherent outcome makes the read-only control operations and the approval preview reachable without a shell on MCP hosts. The canonical evaluators, the dispatch contract, the read boundary and the skill routing are identified owners. The slice adds no write path, no authority, no persisted data, no migration, no adapter change and no rollout mechanism beyond the existing versioned plugin distribution. Rejected alternative: `structured_delivery` (no evidenced full-depth trigger).
- evidence: Approved UR; `agdf-mcp-server/src/server.js`; `create-agdf/lib/mcp-dispatch-runtime.js`; `create-agdf/lib/skill-dispatch/service.js`; `create-agdf/lib/control-evaluation/gate-check.js`; `create-agdf/lib/cli/command-registry.js`; `create-agdf/lib/control-read-boundary.js`; `plugin/meta/contracts/interaction.md`; MCP probe and small-path baseline memos of 2026-09-25. The seven bounded-slice checks below are complete.
- transparency_note: `quick_task` and `verified_change` are ineligible because the change adds a new tool surface, alters the dispatch result and touches skills, contracts and several owners. `structured_delivery` is unnecessary: the tool surface is additive and versioned with the plugin, consumers are the framework's own skills, and the shell fallback keeps hosts without MCP unchanged.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` — no authority, persistence, migration, independent external consumer or coordinated cutover is evidenced; the additive tool and result field ship in one plugin version with digest-verified provenance.
- missing_or_conflicting_facts: none that affect depth selection. The preview-versus-binding sequence and the token budget are SD decisions inside the slice.
- depth_evidence_refs: `agdf-mcp-server/src/server.js`; `create-agdf/lib/mcp-dispatch-runtime.js`; `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/skill-dispatch/service.js`; `create-agdf/lib/control-evaluation/gate-check.js`; `create-agdf/lib/cli/command-registry.js`; `create-agdf/lib/control-read-boundary.js`; `plugin/meta/contracts/interaction.md`; `agdf-mcp-server/test/safety.test.js`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | The approved UR defines one outcome: read-only control operations and the approval preview are reachable through MCP without a shell; acceptance is byte parity with the CLI. |
| authority_boundary | `pass` | Read-only operations behind the existing read boundary; approvals, revisions and presentation records stay CLI writes; every tool result remains `authorizes: false`. |
| owner_consumer_coordination | `pass` | Consumers are the framework's own skills, shipped in the same plugin version; hosts discover tools via the protocol, so no adapter or external consumer needs a cutover. |
| full_depth_impacts_absent | `pass` | No persistence, migration, security authority, host installer, release or deployment behavior changes; the dispatch result gains an optional populated field under the same schema version. |
| migration_propagation_bounded | `pass` | Skills and locales propagate through the existing generator; no persisted state exists to migrate. |
| failure_recovery_local | `pass` | An unavailable or failing tool falls back to the existing binding path already declared in every skill; nothing irreversible is introduced. |
| independently_acceptable | `pass` | Parity tests, safety tests and the small-path measurement verify this slice alone; write tools (Slice 2) are not a prerequisite. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which exact operations belong to the read tool, and does `status` (host-level) belong to it or stay CLI? | `PRD` | `revise` |
| May the dispatch result show the review text before `run-present` has recorded a `presentation_id`, and how does `interaction.md` step 3 change? | `SD` | `revise` |
| Where is the CLI validation extracted to so that MCP and CLI share one rule set? | `SD` | `revise` |
| How is the per-session token cost of the new schema measured and capped? | `SD` | `revise` |
| The red `control-state-test.js` on `main` must be green before this slice's CD+Tests; owner is run `agdf-actionable-card-ux-20260928-01`. | `TP` | `revise` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: This review records run-specific reuse evidence; ownership of evaluators, renderer and approval authority is unchanged.

## Next Permissible Step

- next_allowed_action: Draft the structured-slice PRD with stable acceptance criteria for the read tool, the embedded approval preview, CLI parity, the read-only guarantee and the step-count target.
- forbidden_until_then: Do not draft SD or TP, change code, register tools or alter skills before PRD, SD and TP are approved.

## Quality Outlook

- quality_outlook: Keep one evaluator and one validation rule set; prove byte parity between MCP and CLI results and that no MCP call writes under `.agdf/control`; measure steps and tokens before claiming the benefit.
