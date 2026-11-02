# Solution Design: Read-only AGDF Control Operations over MCP

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD revision 6
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Add one read-only MCP tool, `agdf_inspect`, beside the existing `agdf_dispatch`, and let a `presentation_required` dispatch result carry the canonical approval preview. Both are thin projections over the existing evaluators. The CLI stays the single engine: the tool calls `evaluateDoctor`, `evaluateGateCheck`, `evaluateDeliveryMap` and `readRuntimeContract` exactly as the CLI handlers in `validation-handlers.js` do, and it validates its selection with the same rule set the CLI uses. No write path, presentation record, approval or run selection moves to MCP.

The solution has four bounded parts:

1. A new module `create-agdf/lib/control-inspect/` with the tool definition, argument parsing and an execute service that maps `operation` to the existing evaluator and returns the very report object the CLI serializes with `--json`.
2. A shared read-selection validator extracted from `create-agdf/lib/cli/command-registry.js`, consumed by the CLI option validation and by the inspect service, so one rule set governs both surfaces.
3. The owned MCP runtime (`mcp-dispatch-runtime.js`) exposes a `tools` list; `agdf-mcp-server/src/server.js` registers every listed tool through the same worker executor, trust checks and result serialization.
4. The dispatcher (`skill-dispatch/service.js`) populates its existing `presentation` field with the read-only `approval_presentation.preview_markdown` when it returns `presentation_required`; `run-present` remains the only binding writer.

No new gate, approval value, run-state field, persisted data, CLI flag, host adapter or installer change is introduced. Skills and contracts route read steps to the tool first and keep binding schema 2 as the declared fallback.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action |
|---|---|---|
| Control evaluation | `create-agdf/lib/control-evaluation/doctor.js`, `gate-check.js`, `delivery-map.js` | Called unchanged by the inspect service; they remain the only evaluators. |
| Runtime contract text | `create-agdf/lib/cli/contract-command.js` (`readRuntimeContract`, allowlisted modules from the plugin definition) | Called unchanged for `operation: contract`; no caller path or environment is consumed. |
| Read-selection rules | Today: `command-registry.js` option validation | Extract the read-command subset into `create-agdf/lib/control-inspect/selection.js`; `command-registry.js` and the inspect service both call it. |
| MCP read boundary | `create-agdf/lib/control-read-boundary.js` | `assertMcpControlReadBoundary` runs before every inspect operation, as it does before dispatch. |
| Tool surface and trust | `create-agdf/lib/mcp-dispatch-runtime.js`; `agdf-mcp-server/src/server.js`, `worker.js`, `worker-entry.js` | Runtime exposes `tools: [dispatch, inspect]` and keeps `definition` for the dispatcher; the server registers each tool with the same executor and `toolResult`. |
| Dispatch result shape | `create-agdf/lib/skill-dispatch/contract.js` (`outputSchema`), `service.js` | Populate the existing optional `presentation` object for `presentation_required`; `schema_version` stays `1`. |
| Approval preview rendering | `gate-check.js` via `run-presentation-render.js` (`approval_presentation.preview_markdown`, digests) | Read as is; never re-rendered by the dispatcher or the MCP layer. |
| Presentation binding and approval | `create-agdf/lib/control-state/run-presentation.js`, `run-approve` | Unchanged; the only writers of presentation records and approvals. |
| Agent routing text | ten `plugin/skills/*/SKILL.md`; `plugin/meta/contracts/interaction.md`, `gate-transition.md`, `quality.md` | Name the inspect operation as the primary read route when the host lists the tool; keep the binding fallback; leave fingerprint-locked blocks untouched. |
| Package and budget | `create-agdf/scripts/sync-package-assets.js`; `payload-budget.js`; `copilot-payload-baseline.json` | Existing generation order; growth measured and accepted through the existing budget review. |

The selected `RUN_STATE.md`, gate policy and digest-bound artefacts remain authoritative. The MCP layer never renders, decides, selects or writes.

## 3. Architecture Decisions

- SDD-001: Expose exactly one additional MCP tool `agdf_inspect` with `operation` restricted by schema enum to `doctor`, `gate-check`, `delivery-map` and `contract`, executed through the existing worker executor and read boundary; rationale: one tool with an enum bounds the per-session schema cost and keeps the surface enumerable for safety tests, while the existing worker, timeout, provenance and boundary checks are reused without change; trade-off: gate-check variants (`status-card`, `approval-envelope`) become operation arguments instead of separate tools, so the tool description must stay precise and the protocol test's single-tool pin changes to a two-tool pin.
- SDD-002: Share one read-selection rule set between CLI and MCP by extracting the read-command validation from `command-registry.js` into `control-inspect/selection.js`, and run the evaluators with the dispatcher's dependency set (no git child process); rationale: the MCP server source must stay free of `node:child_process`, and parity is only provable when both surfaces apply identical rules and dependencies; trade-off: for `verified_change` runs the CLI's `cliGitObservation` can yield baseline fields the MCP result cannot, so parity is asserted for fixtures without git observation and the limitation is documented in the tool description and contract.
- SDD-003: The dispatcher populates `presentation` for `presentation_required` with `semantic_block: approval_preview`, the canonical `preview_markdown`, `artefact_digest`, `summary_digest`, run, gate, revision and `authorizes: false`, while the result stays non-terminal and the continuation keeps the `run-present` step; rationale: the preview is already rendered read-only inside `evaluateGateCheck`, so surfacing it costs no new rendering or write and gives the agent verbatim text from a structured result; trade-off: the agent may show the preview before `run-present` exists, so `interaction.md` step 3 must state that the gate question is asked only after `run-present` returned a `presentation_id` and its text is digest-identical to the preview; a missing or invalid summary leaves `presentation` null and carries the existing recovery.
- SDD-004: Skills and contracts name the inspect operation as the primary route for every read-only process step and keep binding schema 2 as the declared fallback, without touching fingerprint-locked blocks or exceeding the gate-check budget; rationale: all ten skills already use the MCP-first pattern for dispatch, so the same wording pattern applies and hosts without MCP see unchanged behavior; trade-off: the wording must fit into the remaining gate-check budget of 6900 bytes, which may require shortening non-locked prose elsewhere in that skill.
- SDD-005: Cap the new tool's serialized definition (name, description, input and output schema) at 2048 bytes and record the measured Copilot profile growth through the existing `payload:budget --accept` review with its rationale; rationale: the schema is loaded into every session on every host, and the framework already owns a measured budget process; trade-off: the description cannot carry long operational guidance, so operational detail stays in skills and contracts.

## 4. Tool Contract

### 4.1 `agdf_inspect` input

| Field | Type | Rule |
|---|---|---|
| `operation` | enum `doctor` \| `gate-check` \| `delivery-map` \| `contract` | Required. Any other value fails schema validation before execution. |
| `working_directory` | string, absolute | Required; same semantics as dispatch: execution context, never target authority. |
| `presentation_language` | BCP 47 tag | Required; parsed with the dispatcher's existing rules and English fallback. |
| `target_source` / `primary_target` | dispatch grammar | Optional pair, resolved with the existing task-target resolution; an unresolved target returns the existing orientation and no evaluation. |
| `run_id` | run-id pattern | Optional; selects an existing run exactly as `--run` does. |
| `variant` | enum `status-card` \| `approval-envelope` | Only with `operation: gate-check`; mirrors `--status-card` and `--approval-envelope`. |
| `module` | runtime-contract module name | Only with `operation: contract`; validated against the plugin definition's module list. |
| `all_active` | boolean | Only with `doctor` or `delivery-map`; mirrors `--all-active`. |

The shared selection validator rejects every combination the CLI rejects today (for example `module` outside `contract`, `all_active` outside doctor/delivery-map) with the same reason string.

### 4.2 `agdf_inspect` output

```text
{
  schema_version: "1", contract_version: 1, outcome: "inspect_result" | "target_unresolved" | "invalid_input" | "evaluator_error",
  terminal: true, authorizes: false,
  operation, runtime, target,
  report: <the exact object the CLI serializes with --json for this operation>,
  presentation: <canonical Markdown block when the CLI prints one, else null>,
  recovery, host_action, timing, diagnostics
}
```

`report` is the CLI's `--json` object without modification; `presentation.markdown` is the CLI's canonical Markdown (`status_presentation.markdown` for gate-check, the contract text for `contract`). Parity is asserted on `report` and `presentation.markdown`.

### 4.3 Dispatch result with preview

For `presentation_required`, `presentation` becomes:

```text
{ schema_version: "1", semantic_block: "approval_preview", run_id, revision_id, current_gate,
  presentation_language, markdown: <preview_markdown>, artefact_digest, summary_digest, authorizes: false }
```

`host_action.mode` stays `continue_delivery_intake`; `continuation.steps` still contains `run-present`.

## 5. Data Flow

```text
host lists agdf_inspect ──> agent calls operation + selection
                                   |
                     assertMcpControlReadBoundary(target)
                                   |
                     shared read-selection validator (same as CLI)
                                   |
        +--------------+-----------+------------+----------------+
        v              v                        v                v
  evaluateDoctor  evaluateGateCheck      evaluateDeliveryMap  readRuntimeContract
        \______________|________________________|________________/
                                   v
                 report (== CLI --json) + canonical Markdown
                                   v
             worker result -> toolResult -> host (authorizes: false)

agdf_dispatch ... presentation_required
        evaluateGateCheck -> approval_presentation.preview_markdown
                 -> result.presentation (approval_preview)  [read-only]
                 -> continuation.steps: run-present            [CLI write, binding]
                 -> run-approve --presentation <id>            [CLI write, approval]
```

## 6. Integration Points

| Integration point | Design action | Compatibility boundary |
|---|---|---|
| `create-agdf/lib/control-inspect/contract.js`, `service.js`, `selection.js` (new) | Definition, parsing, shared validator and execute service. | Reuse dispatcher helpers for language and target parsing; no new evaluator. |
| `create-agdf/lib/cli/command-registry.js` | Replace the inline read-command rules with calls to the shared validator. | Identical CLI error strings and exit codes; covered by existing CLI tests. |
| `create-agdf/lib/mcp-dispatch-runtime.js` | Add `tools` (dispatch and inspect) with `parse`/`execute`/`serialize` per tool; keep `definition`, `parse`, `execute` for the dispatcher. | Existing dispatcher tests keep passing unchanged. |
| `agdf-mcp-server/src/server.js`, `worker-entry.js` | Register each tool; worker receives the tool name and routes to that tool's parse/execute. | Safety test prohibitions unchanged; protocol test pins two tools. |
| `create-agdf/lib/skill-dispatch/service.js`, `contract.js` | Populate `presentation` for `presentation_required`; describe the field in `outputSchema`. | `schema_version` 1; existing consumers ignore the new populated object or use it. |
| `plugin/meta/contracts/interaction.md` step 3, `gate-transition.md`, `quality.md` | Read steps name the inspect operation first; preview may be shown before binding, gate question only after `run-present`. | No approval semantics change. |
| ten `plugin/skills/*/SKILL.md` | Same MCP-first wording pattern as dispatch for read steps. | Fingerprint-locked blocks untouched; gate-check within 6900 bytes. |
| `plugin/scripts/instruction-footprint.mjs`, `smoke-test.js` | Budget and anchored phrases stay valid. | Any anchored phrase that moves is updated in the same change. |
| `copilot-payload-baseline.json`, `payload-budget-history.md` | Accept the measured growth with rationale. | Cap from SDD-005. |

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | `agdf_inspect` maps each operation to the existing evaluator and returns the CLI's `--json` report and canonical Markdown unchanged; CLI and MCP validate selection through one shared function. | `control-evaluation/*.js`, `contract-command.js`, `control-inspect/selection.js` | SDD-001, SDD-002 | `verified_change` runs may differ because MCP runs without git observation; parity fixtures exclude git-dependent fields and the limitation is documented. |
| AC-002 | Schema enum restricts operations; the read boundary runs before evaluation; the service imports no write function and the server source stays free of prohibited modules. | `control-read-boundary.js`, `control-inspect/contract.js`, `agdf-mcp-server/test/safety.test.js` | SDD-001 | The safety test's source scan must also cover the new module; snapshot assertions guard against indirect writes. |
| AC-003 | The dispatcher copies `approval_presentation.preview_markdown` and digests into `presentation` for `presentation_required`; binding and approval stay CLI writes. | `skill-dispatch/service.js`, `gate-check.js`, `run-presentation.js` | SDD-003 | Agents may show the preview early; the contract requires the gate question only after `run-present`; digest equality is tested. |
| AC-004 | Skills and contracts name the inspect operation as the primary read route with the binding as fallback; locked blocks and budgets are preserved. | `plugin/skills/*/SKILL.md`, `plugin/meta/contracts/*.md`, `instruction-footprint.mjs` | SDD-004 | gate-check budget pressure; anchored smoke-test phrases may need coordinated updates. |
| AC-005 | Inspect and preview results carry `authorizes: false`; `presentation_language` is parsed with the dispatcher's existing rules and English fallback; protocol literals pass through untouched. | `skill-dispatch/contract.js` language rules, `interaction-catalog.js` | SDD-001 | None beyond existing locale fallback behavior. |
| AC-006 | Hosts without the tool follow the unchanged binding fallback; no installer, adapter or lifecycle file changes. | `mcp-lifecycle/*`, skills' binding sections, `eval:skills` | SDD-004 | None; fallback text is unchanged apart from naming the primary route. |
| AC-007 | The tool definition is capped at 2048 bytes; profile growth is measured with `payload:budget` and the small-path scenario is rerun with the server listed. | `payload-budget.js`, `payload-budget-history.md`, `scripts/native-probes/` | SDD-005 | Measurement depends on a host session and is recorded as evidence, not as a gate. |

## 8. Compatibility, Safety And Risks

- No migration, run-state field, approval value, CLI flag or host adapter changes; the dispatch schema version stays 1.
- The MCP server remains free of child processes, network and write calls; the safety test's reachable-source scan covers the new module.
- Parity limitation: git-dependent `verified_change` fields are unavailable over MCP. The tool description says so; the CLI remains the reference for such runs.
- Worker executor serializes calls (`dispatch_busy`); inspect calls share that executor, so a long-running inspect can delay a dispatch by at most the 10-second timeout.
- Codex requires per-call approval; the benefit is smaller there. Copilot and OpenCode rely on the fallback until evidenced.
- The shared regression suite is red on `main` (`control-state-test.js` line 279, owned by run `agdf-actionable-card-ux-20260928-01`); it must be green before this slice's CD+Tests.

## 9. Verification Design

The Task/Test Plan must include, at minimum:

- parity assertions per operation, variant and registered locale between the inspect `report`/`presentation.markdown` and the CLI `--json` output on the same fixture, with the evaluator dependency held equal;
- schema rejection of unsupported operations and invalid field combinations, with error strings equal to the CLI's;
- control-tree snapshot before and after every operation and rejected call; extension of the safety source scan to `control-inspect/`;
- protocol test pinning exactly two tools with their definitions; worker routing per tool;
- dispatch `presentation_required` with populated preview, digest equality against `run-present`, and `run-approve` rejection without a presentation id; null preview with recovery when the summary is invalid;
- instruction-footprint, smoke, skill-eval, request-activation and copilot-profile checks after skill and contract edits; recorded search for remaining primary read-only shell steps;
- definition size assertion (≤ 2048 bytes) and payload-budget review; dated small-path measurement.

This is a verification design only; no tests were added or run while the SD remains unapproved.

## 10. Approval

This Solution Design is derived from approved PRD revision 6. Review this exact SD and approve only with:

`Approval: SD`

Task/Test Plan drafting is permitted after approval. Implementation remains blocked until both SD and TP are approved.

## AGDF Approval Summary (de; source=en)
- Ziel: Ein zusätzliches lesendes MCP-Tool `agdf_inspect` neben `agdf_dispatch`, und der Dispatch trägt bei erforderlicher Präsentation den kanonischen Vorschautext. Beides sind dünne Projektionen über die bestehenden Evaluatoren; die CLI bleibt der einzige Motor.
- Umfang: Neues Modul `control-inspect` mit Definition, Parsing und Service; gemeinsamer Auswahl-Validator für CLI und MCP; Runtime und Server registrieren zwei Tools über denselben Worker; Skills und Verträge nennen die Leseoperation als primären Weg mit Binding-Fallback.
- Entscheidungen:
  - SDD-001: Genau ein zusätzliches Tool mit `operation`-Enum (doctor, gate-check, delivery-map, contract) über den bestehenden Worker und die Lesegrenze.
  - SDD-002: Ein gemeinsamer Regelsatz für die Leseauswahl in CLI und MCP; Evaluatoren laufen ohne Git-Kindprozess, daher Paritätsgrenze bei `verified_change`.
  - SDD-003: Der Dispatch füllt `presentation` mit dem read-only Vorschautext und Digests; `run-present` bleibt der einzige Schreiber der Bindung; Gate-Frage erst nach `run-present`.
  - SDD-004: Skills und Verträge routen Leseschritte MCP-first mit deklariertem Fallback, ohne Fingerprint-Blöcke oder das gate-check-Budget zu verletzen.
  - SDD-005: Tool-Definition höchstens 2048 Bytes; Profilwachstum über den bestehenden Budget-Review gemessen und akzeptiert.
- Zuordnung: AC-001 auf SDD-001 und SDD-002; AC-002 auf SDD-001; AC-003 auf SDD-003; AC-004 auf SDD-004; AC-005 auf SDD-001; AC-006 auf SDD-004; AC-007 auf SDD-005.
- Risiken: Paritätsgrenze bei Git-abhängigen Feldern; geteilter Worker mit 10-Sekunden-Timeout; Codex-Freigabe pro Aufruf; rote `control-state-test.js` auf main muss vor CD+Tests grün sein.
