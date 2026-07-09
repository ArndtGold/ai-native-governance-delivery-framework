# Implementation Evidence: AGDF Delivery Path Search

Status: CD+Tests complete
Date: 2026-07-09
Approved plan: `.agdf/control/artefacts/agdf-delivery-path-search/TP.md`

## Delivered

- Provider-neutral Delivery Path Search runtime under `create-agdf/lib/delivery-path-search/`
- Versioned contracts, deterministic legality, scoring, bounded best-first search, budgets and stopping rules
- Codex evaluator using `codex exec --sandbox read-only --ephemeral --output-schema`
- Enforcement declarations for Codex, Claude Code, Copilot, OpenCode and generic surfaces
- Redacted JSON and Markdown persistence
- `delivery-path-search` command in the existing CLI and published wrapper
- One canonical AGDF skill with generated Copilot and OpenCode mappings
- Runtime Contract, router and documentation updates
- Website updated to show all 9 canonical skills, the Planning family, Delivery Path Search in the workflow and the honest per-surface evaluator boundary
- Delivery Path Search positioning now makes reduced rework, faster evidence and safer agent autonomy explicit
- Page flow consolidated so intake, execution workflow and durable Gate Map have distinct responsibilities
- Pages distinguish the implemented bounded best-first search from possible future MCTS mechanics
- Runtime Integrity prevents future Pages/plugin skill-count drift
- Install and package docs cover search prerequisites, options, persistence, cost semantics and support boundaries
- Focused, CLI, routing, package and wrapper tests

## DPS-01 Feasibility

The installed Codex runtime accepted:

- `codex exec`
- `--sandbox read-only`
- `--ephemeral`
- `--ignore-user-config`
- `--output-schema`
- `--output-last-message`

The first probe correctly rejected a schema property that used `const` without an explicit JSON type. The corrected strict schema produced valid evaluator JSON. Repository status was inspected around the run; no evaluator mutation was observed.

The implementation uses non-interactive Codex rather than adding an SDK dependency. Runtime and configured-model metadata are recorded when observable.

## Verification

Passed:

```text
npm --prefix create-agdf run test:delivery-path-search
npm --prefix create-agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix agdf run smoke-test
npm --prefix pages run check
npm --prefix pages run build
npm pack --dry-run --json  # from create-agdf/
git diff --check
```

Observed results:

- focused search tests passed
- create-agdf smoke test passed
- routing render test passed
- runtime integrity passed with 9 skills and 13 control files
- packed wrapper executed the new command through the packaged `create-agdf/lib/`
- dry-run package contained all Delivery Path Search runtime modules and generated surface mappings
- Astro check completed with 0 errors, warnings or hints
- static website build completed successfully
- Pages skill data matched the canonical plugin skill set exactly

## Security And Failure Evidence

- unsafe scope keys are rejected as path segments
- gate-illegal and substring-smuggled actions are rejected before evaluation
- invalid evaluator output yields `no_safe_recommendation`
- read-only Codex runs compare Git status before and after evaluation
- raw prompts, hidden reasoning, secrets, credentials and source snapshots are removed from persisted results
- cost, evaluation, duration, depth and stable-leader limits are represented in the runtime contract
- unsupported non-Codex native evaluator transports fail explicitly instead of falling back silently
- canonical gate-check remains the required next action after every result

## Known Limitations

- Codex is the only executable native evaluator adapter in this release.
- Claude Code, Copilot and OpenCode receive the shared workflow and contract mapping; they require a conforming external/native evaluator before executable search.
- Instruction-only surfaces cannot prove the absence of writes and are labelled accordingly.
- Cost units are evaluator rubric units, not provider currency measurements.
- The existing gate-check CLI projection still does not consume persisted Brownfield Analysis completion; the live run and Brownfield artefact remain the operative evidence.
