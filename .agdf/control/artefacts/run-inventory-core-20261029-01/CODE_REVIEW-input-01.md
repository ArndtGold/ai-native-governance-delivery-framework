# Code Review: Shared Core Run Inventory from Stored Run State

Decision: pass
run_id: run-inventory-core-20261029-01
Reviewer: independent Claude Code review subagent (read-only), corrections verified by the implementing agent
reviewed_at: 2026-10-30

## Scope

Working-tree diff against `main` (`356cc4ee`): pure inventory module and reader, moved placeholder rule and run-ID title, doctor inventory fields, inspect operation and presentation, CLI command, routing contract, router, gate-check skill line, evaluation cases and fingerprints, tests, handbook and UI concept text. Excluded: `.agdf/control/` run bookkeeping.

## First Pass Result

The independent review returned `revise` with one defect and nine notes. It confirmed as sound: the purity of the module chain (`run-inventory.js`, `run-state-document.js`, `run-identity.js`, `decision-content-placeholder.js`), the definition size of 4989 bytes, the unchanged doctor fields and the passing new and existing tests.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | the surface-local validator rejected `inventory`, which the routing fallback names; `packages/cli/lib/runtime/validator-application.js` now lists it in the command set and help; `control-inspect-test.js` runs `agdf-validator.js inventory --json` and compares its output with the reader | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | authored titles could inject Markdown links, HTML or break the bold span; `renderRunInventory` escapes Markdown metacharacters in titles; `control-inspect-test.js` renders a hostile title and checks the escaped line | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | a negated text such as "No Approval: UR is needed" counted as decision required; `runAttention` ignores an approval preceded by no, not or without; `run-inventory-test.js` case `negated-approval-run` | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | a folder without run state got two findings and a runs path that is a file produced a sentinel run entry; the module adds no second finding and the reader reports the sentinel as a store-level finding with state incomplete; covered in `run-inventory-test.js` | none |
| CR-F05 | implementation_gap | CD+Tests | resolved | hard-wrapped objectives produced cut titles; the title is now the joined first paragraph; `run-inventory-test.js` wrapped-objective case | none |
| CR-F06 | emergent_risk | PRD | resolved | the presentation header counts lifecycle-active runs while invalid entries are also listed; earliest-owner assessment: PRD AC-006 requires invalid entries to be listed with the incomplete note, which the header already precedes; the count stays the active total and the PRD wording holds | none |
| CR-F07 | emergent_risk | SD | resolved | the schema does not forbid `run_id` with `inventory`; earliest-owner assessment: SD SDD-10 keeps the definition within 5000 bytes, and Core rejects the selection identically on CLI and MCP (`validateReadSelection`), tested with the message | none |
| CR-F08 | emergent_risk | SD | resolved | the inventory does not check seals, so a tampered run can be listed as valid while doctor blocks it; earliest-owner assessment: SD SDD-02 and SDD-06 take validity from the parser by design and every entry states that it is stored state, not an evaluation; doctor remains the integrity check | none |
| CR-F09 | implementation_gap | CD+Tests | resolved | refusal checks asserted only a non-zero exit; `control-inspect-test.js` now also matches the refusal messages for `--run` and `--all-active` | none |
| CR-F10 | emergent_risk | SD | resolved | two field descriptions were shortened; earliest-owner assessment: SD SDD-10 decided this, the schema still enforces both rules, and 11 bytes of headroom remain | none |
| CR-F11 | implementation_gap | CD+Tests | resolved | found after the review by the STDIO probe: the MCP result projection in `packages/core/lib/mcp-tool-errors.js` classifies every inspect read by name and rejected `inventory` as `tool_result_invalid`, so agents could not use the operation over MCP; `inventory` is now a report read; `active-run-inventory-test.js` projects the result and fails without the fix; `evidence/inventory-stdio.json` shows the STDIO call succeeding | none |
| CR-F12 | evidence_gap | evidence_obligation | resolved | the request-activation evaluator prompt in `evals/lib/request-activation-evals/behavioral.js` had no callback rule for deterministic control inspection, so Claude predicted `repository_status_owner` for the inventory route; the rule for control.doctor, control.delivery_map and control.inventory was added and both active-run cases pass with Claude Code 2.1.302 | none |

## Verification After Corrections (2026-10-30, final tree, Node 22.22.3 on Windows)

The CD+Tests record describes the tree before these corrections; AGDF does not accept a second CD+Tests record at the CR gate, so this section is the verification of the final tree.

- `run-inventory-test.js`, `control-inspect-test.js` (doctor, CLI, validator, escaping, refusal messages) and `active-run-inventory-test.js` (including the MCP result projection) pass.
- `test:control-inspect`, `test:control-state`, `test:run-close`, `test:request-activation` and `claude-companion-test.js` pass.
- MCP server scripts contract, continuation, late-source-revision, run-command-flow, protocol, cockpit-gating, generation, safety, provenance, performance (warm p95 543 ms, cold p95 869 ms on a quiet machine), package, sdk-digest and tool-errors pass after rebuilding the package; one earlier performance failure (warm p95 2075 ms) happened while model evaluations ran in parallel.
- STDIO probe with a separate server process (`packages/mcp-server/test/stdio-entry.js`, source runtime) and the MCP SDK client on this repository: `inspect_result`, 152 entries equal to the CLI, 231 to 309 ms, `run_id` refused (`evidence/inventory-stdio.json`, probe script `evidence/inventory-stdio-probe.mjs`).
- Request-activation behavioral evaluation with Claude Code 2.1.302: 38 of 39 cases pass; `en-explicit-agdf-help` fails identically on `main` 356cc4ee and is pre-existing.
- `npm run build:prepare`, `npm run compatibility:record` (0 failed) and `run-skill-evals.js` (113/113) pass with the Copilot payload baseline at 402 files/3596554 bytes.
- Measurement on this repository (`evidence/measurement.json`): 152 entries, each run folder once, lifecycle counts equal Run Meta, no template title, no last activity from `updated_at`; CLI 632 ms, MCP in-process 242 ms; `doctor --all-active` 9345 to 9718 ms with 174 to 201 ms added by the inventory.

## Residual Notes

- The inventory reports stored state; consumers that need certainty for one run still call gate evaluation.
