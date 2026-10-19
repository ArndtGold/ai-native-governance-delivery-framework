# Clean Implementation Review: MCP ergonomics baseline evaluation

Type: Clean Implementation Review
Status: done
Decision: pass

## Run

- run_id: mcp-ergonomics-baseline-20261016-01
- related_tp: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md (approved)
- related_sd: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/SD.md (approved, SDD-001 to SDD-014)
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-17
- code_state: `16d08888` plus this run's uncommitted change set (114 paths), including the README Setup correction from the TP Review (TPR-01)
- scope: `evals/mcp-ergonomics/**`, `evals/scripts/*mcp-ergonomics*.js`, `scripts/native-probes/lib/claude-session.mjs`, `scripts/native-probes/claude-host-e2e.mjs`, root `package.json`, `scripts/verify-ci.mjs`, `scripts/verification-test.mjs`, and the CI owner registration in `scripts/ci-plan.mjs` after the main merge
- supporting_evidence: `BROWNFIELD_ANALYSIS.md`, `CODE_REVIEW.md` (CR-01 to CR-16 resolved), TP Review source `TP_REVIEW_SOURCE-01.md`, `evidence/CLEAN_CHECKOUT_VERIFICATION.md`

## Clean Implementation Review

- decision: pass
- primary_solution: A measurement component outside the product. The protocol layer drives the real server through the existing MCP test harness (`withStdioClient`, `createOwnedRuntimeFixture`) and the cockpit's own UI-capability constant (SDD-002). Fixtures come from the canonical CLI and the existing builders in `packages/cli/scripts/fixtures/` (SDD-003). The native layer runs Claude Code through one shared session module, `scripts/native-probes/lib/claude-session.mjs`, now also used by `claude-host-e2e.mjs`, the T-003 spike and the re-evaluation script (SDD-006). Success predicates read control state through Core (`createCoreServices`, `readRunState`) instead of parsing files on their own (SDD-010). Fixture mutation uses the existing `snapshotWorkspace`, `changedPaths` and `mutationViolations` from `evals/lib/skill-evals/workspace.js` (SDD-011). One classifier (`classify.js`) serves the protocol and native layers, and one predicate owner (`evaluateSuccess`) serves the runner and the re-evaluation.
- evidence: import graph of every changed module (no copied harness, fixture or parser code); no file under `packages/` changed and `tools/list` is byte-identical to the T-002 capture (SDD-014); 37 of 37 unit tests and the repository-lane stage pass; the clean-checkout run reproduces the protocol baseline (`unchanged`).
- fallbacks_retained:
  - Pre-session MCP check with exactly one retry after 30 s (`run-mcp-ergonomics-native.js`): bounded, every attempt is recorded per cell, and a failed check makes the cell `aborted` (`mcp_unavailable`) with launcher diagnostics and no cost. It does not hide the run 2 connect timeouts; it makes them visible and keeps them from consuming budget. Rationale: native run 2 (CD+Tests); it is part of the measurement procedure, not a product fallback, so it needs no product exit criterion.
  - Credential copy (`withCopiedCredentials`): the approved SDD-006 mechanism, shared with the host E2E probe. The token mode added for CR-16 takes precedence; the native runner uses the copy only with the explicit `--credentials-copy` opt-in. Removal runs in `finally` and on termination signals.
  - Unknown session cost charged with the session budget (CR-07) and per-cell error containment (CR-06): fail-closed accounting that keeps the 25 USD cap (SDD-009) and the run outcome visible (`runner_error`, `aborted`), not silent recovery.
  - Isolated-home path guard (`pluginDataRootBudget`, 79 characters): stops before installing when the Windows path would be too long for the plugin MCP runtime and names `--work-root` as the remedy; a fail-closed precondition, documented in the README.
- workaround_or_shim_risk: low. `--tools`, `ENABLE_CLAUDEAI_MCP_SERVERS=false`, `--disable-slash-commands` and `disableAllHooks` are host configuration chosen in T-003 and the owner decisions of 2026-10-16 (SDD-007), not product changes. Each session verifies its variant from the init event and transcript and rejects foreign MCP servers and built-in tools.
- parallel_structure_risk: low, design-sanctioned. Root replacement exists twice: `normalize.js` replaces known roots in raw, forward-slash, single-, double- and slash-escaped forms for deterministic metrics (SDD-004), and `createRedactor` in the shared session module replaces them at any escaping depth and in Git Bash form for privacy (SDD-006). The SD assigns the two purposes to these two owners. The forms covered differ, but both are guarded: a missed form in normalization shows up as a protocol difference in the two-run compare and as a violation in the fail-closed promote check. Unifying the two is a candidate for the follow-up slice that extends the session module (native Codex measurement); it is not a finding against the approved design.
- integration_with_main: after merging `origin/main` on 2026-10-19, the stage `mcp-ergonomics` is registered in main's existing `compatibility` check area in `scripts/ci-plan.mjs` (one line, the owner table requires exactly one owner per stage). This reuses the existing owner table instead of adding a CI path of its own; the merged tree passes build, unit, verification, CI-plan and compatibility checks, and the protocol baseline compare stays `unchanged`.
- brownfield_fit: pass; consistent with `BROWNFIELD_ANALYSIS.md`. The evaluation imports the MCP test harness from `packages/mcp-server/test/`, so it depends on that package's separate SDK lock; CI installs it in the `mcp-dependencies` stage, and the README now names the step for local runs (TP Review TPR-01).
- missing_evidence: the native host E2E probe was not re-run after the shared session module changed (unit-tested equivalence only); the T-003 spike script is kept as the reproducible source of `SPIKE_T003.json` and is documented only in its own header.
- required_next_step: record the OR closeout once AGDF permits TP Review and Clean Implementation Review at OR.

No normalized finding: no fallback without rationale, no second owner of a product rule, no workaround that masks a root cause, and no code that violates an approved SD or TP decision.
