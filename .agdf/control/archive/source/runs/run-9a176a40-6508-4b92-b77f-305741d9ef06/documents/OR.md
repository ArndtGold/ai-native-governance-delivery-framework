# OR: Automatic local MCP UI preparation

Gate: OR
Type: Orchestration Report
Report mode: OR-lite
Status: done
Run: run-9a176a40-6508-4b92-b77f-305741d9ef06

## Result

Implemented the approved bounded correction in packages/cli/scripts/prepare-local-plugin.js: local installers reuse valid required MCP UI builds and automatically rebuild missing, stale or corrupt resources through the existing canonical build, then validate them before packaging. Failures stop before host installation, and missing UI dependencies receive an actionable locked-install command. Linked output paths are rejected before rebuild writes.

Extended packages/cli/scripts/local-preparation-test.js and documented behavior in CONTRIBUTING.md. Existing surface-specific payloads and integrity rules remain. The human approved UR; Brownfield Review selected Compact Delivery. Mandatory Code Review is pass. No separate technical QA decision or human QA/UAT acceptance is claimed.

## Evidence

[Code Review and verification evidence](CODE_REVIEW.md) contains the actual diff review and acceptance mapping:
- The new missing-output regression failed with AGDF_DECISION_UI_INVALID before the production fix.
- The expanded local-preparation test passed with real rebuilds, source invalidation, valid reuse, corrupt output repair, all four surface profiles, build/no-op failures, linked output refusal and host isolation.
- Existing plugin-mcp-cockpit-variant integrity tests passed.
- Existing local-development-install tests passed on an isolated retry. The first run returned ENOENT in snapshot copying during concurrent generation; the transient cause is not established.
- Current-checkout Codex preparation passed without host installation.
- Changed JavaScript syntax checks and git diff --check passed.
Evidence environment: local macOS and Node.js v22.22.3. No redundant full suite, CI, native Windows or loaded-host execution was performed for this bounded slice.

## Risk

No unresolved change-specific Code Review finding. UI build dependencies remain explicit prerequisites when a rebuild is needed; failures show npm --prefix packages/control-ui ci --ignore-scripts. Existing source-change and post-build integrity validation remain effective.

No host installation, MCP registration, release, publication, commit, push, PR or merge was performed. No native-host support or human acceptance is inferred from repository tests.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- memory_target: scope_artifact
- memory_reason: Bounded reproduction, implementation and verification evidence stays with this Run.

Evaluated Parent reconciliation from Delivery Map: outcome not_applicable; disposition not_applicable; missing_evidence none; next_action none. Programme aggregation is not applicable.

## Next Step

Rerun npm run install:codex to use the corrected local preparation when installing the checkout. No further change-specific implementation or review is pending; host installation remains a separate user action.
