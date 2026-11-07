# Brownfield Analysis findings before CD+Tests (pre-implementation, attempt 1)

- decision: revise
- mode: pre_implementation_analysis
- run_id: run-d2818184-27fc-40ae-9195-70d080d3e926
- based_on: approved TP sha256:51687d5e162e7111decc566d9abf086f4dc5fc66e283766ce8a98a779dd7f0f1, SD sha256:df33245488fe2b983ddff08993511e87131a94572fad518e4b8105c4174a7019
- reviewer: Claude (agent analysis for Arndt Gold)
- reviewed_at: 2026-11-05

## Design findings routed to SD

### B1 Doctor and prepared run state feed the status fields

`evaluateGateCheck` (`packages/core/lib/control-evaluation/gate-check.js`, from line 323) derives status, blocking reason, allowed/forbidden and next step not only from the pure gate policy:

- doctor findings override the status (`evaluateDoctorWithRunState`, lines 353-397: control file missing, active run missing, run not selectable, any block or revise finding such as seal or pending transaction);
- `readRunState`/`prepareRunContentState` (`run-state.js`) prepares presentation decisions, evidence applicability, QA deviation acceptance, closeout evidence, approval material findings and source-revision UX; `gate-policy-pure.js` consumes these fields;
- these producers import `node:crypto` (`approval-command-contract.js` `digest`, `evidence-bindings.js`), `fs` through `control-read/fs.js` and `resources/context.js`.

SDD-002 keeps the doctor node-side, so the pure-only companion cannot reproduce doctor-derived overrides. The SD does not decide what the companion shows then. Owner decision 2026-11-05 (Arndt Gold): the doctor stays node-side; the run view takes doctor findings as an optional captured fact applied by a pure override rule; CLI and MCP capture supply it, the companion capture marks integrity as not checked; AC-001 parity is claimed for runs without doctor findings. Run-state preparation joins the pure split with an injected hash function.

### B2 Event hook location misses failure paths

`postprocessToolResult` runs only on the success path (`packages/mcp-server/src/server.js` line 139, `packages/mcp-server/src/generation-runtime.js` line 75). Thrown failures, including pre-dispatch rejections (`not_dispatched`) and execution failures reported as `effect_unknown`, go through the `catch` branch to `runtime.failure` and `projectToolResult`. At the location named in SDD-006 the kinds `write_rejected` and part of `effect_unknown` (AC-006) cannot be observed. Owner decision 2026-11-05: the journal is written at the final result projection for success and failure paths, once in the executing process (facade without generation, or generation).

## Facts without design change

- Reuse: the companion bridge already imports `gate-policy-pure.js`, `run-state-document.js`, `run-state-policy.js` and `run-identity.js` (`plugins/agdf/host-templates/claude/companion/core.mjs`) and loads `meta/agdf-interaction-locales.json` at runtime (`register.mjs` line 170). The run view extends this path; no second gate policy.
- Fixtures: `packages/core/test/fixtures/current-run.js` uses `randomUUID`; TP exact-token normalization applies; run lists must be compared in sorted order.
- Legacy v2: no test loader exists for `agdf-0.20.2-control-v2.json.gz` (README only). F08 uses a real archived v2 RUN_STATE from `.agdf/control/archive/source/runs/*/control/RUN_STATE.md` instead.
- Payload: Copilot profile 442 files / 4,510,405 bytes against the baseline 453 / 4,717,872 (headroom 11 files, 207,467 bytes). New Core modules must be few; a budget re-record needs a reviewed owner decision.
- Data root: `CLAUDE_PLUGIN_DATA` or the Codex absolute argument is resolved in `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`dataRoot`), not yet passed into the dispatch runtime's trusted context.

## Required next step

Revise SD (SDD-002, SDD-006 and affected sections) through the source revision owner, then TP, then repeat this analysis.
