# Code Review: Automatic local MCP UI preparation

Decision: pass
Reviewer: Codex (self-review)
Date: 2026-10-30
Run: run-9a176a40-6508-4b92-b77f-305741d9ef06

## Reviewed Scope

Actual diff in packages/cli/scripts/prepare-local-plugin.js, packages/cli/scripts/local-preparation-test.js and CONTRIBUTING.md, together with canonical UI validation/build, selected-surface packaging, npm invocation and the installation wrapper. Approved UR and Brownfield Review bound the work. No PRD, SD or TP is required by the recorded Compact Delivery route.

## Implementation And Findings

No actionable defect remains in the reviewed diff. Local preparation checks the required resources before generation, reuses valid builds, invokes the existing npm build only after invalidation and validates again before packaging. Codex/Claude require both resources; Copilot/OpenCode require Decision UI. Existing version checks, payload budget guards and runtime validation remain.

The repair refuses symlinked output directories/files before the canonical build can write either resource. Build execution uses the existing platform-safe npm invocation and an explicit repository cwd, preserving quiet successful preparation and actionable failure output. Missing UI dependencies receive the existing locked npm ci command rather than an implicit network installation.

Tests exercise the real canonical build in an isolated source fixture with copied UI dependencies; intentional failing/no-op builder fixtures establish failure propagation and post-build validation. Assertions for host-specific payloads, runtime identity, unrelated-profile exclusion and budget guards are retained.

## Verification Evidence

Environment: local macOS, Node.js v22.22.3, working-copy sources reviewed on 2026-10-30.

| Claim / UR signal | Actual evidence | Result |
|---|---|---|
| Regression detects original defect | Updated local-preparation-test.js run before production change failed at expected-success assertion with AGDF_DECISION_UI_INVALID for missing output. Earlier diagnosis also observed stale source_digest. | expected failure |
| Missing, stale and corrupt output are repaired | node packages/cli/scripts/local-preparation-test.js; removes output, changes a real UI source and corrupts HTML, then packages validated current resources. | pass |
| Valid builds reused | Same suite verifies unchanged manifest mtime on an already-current Codex build. | pass |
| Surface packaging and failure isolation | Same suite covers all four profiles, missing Cockpit for Claude, budget guard, wrapper success without host mutation, failed build, successful no-op build and linked output refusal. | pass |
| Existing integrity rules preserved | node packages/cli/scripts/plugin-mcp-cockpit-variant-test.js | pass |
| Existing local installer behavior | node packages/cli/scripts/local-development-install-test.js, isolated retry | pass |
| Real current checkout preparation | prepareLocalPlugin('codex') called against the current checkout; no host installer invoked. | pass |
| Syntax and whitespace | node --check for both changed JavaScript files; git diff --check | pass |

The first additional local-development-install-test.js run ended with ENOENT during snapshot copying while another current-checkout generation ran. A complete retry without concurrent generation passed. The cause of the transient copy failure is not established; it is not reported as a passing first run or a production-code fix.

## Missing Evidence And Risks

No unresolved change-specific test obligation. Full repository CI, native Windows execution, installed/restarted host loading and human UAT were not performed. Existing helper reuse and local repository tests establish no additional host-support or release qualification.

Build dependencies remain an explicit prerequisite when rebuilding is required, with an actionable install command on failure. Sources must remain stable for the canonical build; its existing source-drift guard and post-build validation remain effective.

## Context Graph And Assistance

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- AI assistance: Codex implemented the fix/tests/documentation and performed semantic self-review. The human approved UR; no separate human code review or independent agent review is claimed.

## Required Next Step

Record this review/evidence through the canonical owner, then prepare OR-lite for the completed bounded correction. No host installation, commit, push, PR, merge or publication is authorized by this report.
