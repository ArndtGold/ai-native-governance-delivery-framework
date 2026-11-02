# UR: Close Remaining Claude/Codex Parity Gaps In Docs, Tests And CLI Help

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

After `claude-evaluator-tool-enforcement-implementation` upgraded Claude to a real, `tool_enforced`
Delivery Path Search evaluator alongside Codex, three drift/gap items remain:

1. `INSTALL.md:18` still states "Codex is the executable reference evaluator", now inaccurate.
2. The public docs site `pages/src/pages/index.astro:946` states "Codex is the executable Delivery
   Path Search reference because it currently provides the native evaluator adapter" — factually
   outdated and user-facing.
3. `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`'s `enforcementForSurface` function
   has zero dedicated unit tests. A silent regression (e.g. Claude's entry reverting to
   `instruction_only`) would not be caught by CI.
4. The CLI `--help` examples in `create-agdf/bin/create-agdf.js` only demonstrate
   `--surface codex`, with no `--surface claude` example, even though the error message already
   lists both as reference adapters.

## 2. Goal

Make the documentation and CLI help text accurately reflect that both Codex and Claude are real,
`tool_enforced` executable evaluators, and add regression-proof unit test coverage for
`capabilities.js` so this specific class of regression (silently losing enforcement parity) is
caught automatically going forward.

## 3. Scope

- In scope: update `INSTALL.md` and `pages/src/pages/index.astro` wording to name both Codex and
  Claude as executable reference evaluators, without overstating Copilot/OpenCode's status.
- In scope: add a `--surface claude` example next to the existing `--surface codex` examples in the
  CLI help text.
- In scope: new unit tests for `enforcementForSurface` in `capabilities.js` — asserting the exact
  `level`/`evidence` for `codex`, `claude`, `copilot`, `opencode`, `generic`, and the custom-evidence
  override behavior.

## 4. Non-Goals

- No change to Copilot or OpenCode's actual enforcement level — they remain `instruction_only`,
  documentation must not imply otherwise.
- No new evaluator implementation work.
- No change to the Pages site's build tooling or unrelated content.

## 5. Acceptance Signals

- `INSTALL.md` and the Pages site no longer claim Codex is the sole executable reference evaluator.
- `--help` output shows a `--surface claude` example.
- A new unit test file (or addition to the existing one) asserts `enforcementForSurface` behavior for
  all five surface keys and fails if any of them silently changes.
- `npm --prefix create-agdf run smoke-test`-equivalent local checks and `check-runtime-integrity.mjs`
  still pass.

## 6. Existing Source Of Truth

- `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`
- `INSTALL.md`, `pages/src/pages/index.astro`
- `create-agdf/bin/create-agdf.js` (`--help` text, `executeDeliveryPathSearch`)
- `.agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH` (already accurate, no change needed there)

## 7. Risks And Unknowns

- The Pages site is an Astro build (`pages/`); this UR only touches copy text, not build config —
  Brownfield Review should confirm no build step needs to run beyond the existing `check` script.
- None expected for the test addition; it follows the same pattern already used for
  `scoring.js`/`candidate-policy.js`/`contracts.js` unit tests.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
