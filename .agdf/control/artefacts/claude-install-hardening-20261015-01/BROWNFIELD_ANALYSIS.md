# Brownfield Analysis: Harden the Claude installer against stale and shadowed installations

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Status: done
Decision: pass

## Run

- run_id: claude-install-hardening-20261015-01
- related_tp: .agdf/control/artefacts/claude-install-hardening-20261015-01/TP.md
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-15
- baseline: branch `feat/claude-install-fix` at `42c42850` (on `main` `6668ad9b`), clean worktree

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- scope: T-001 to T-010 of the approved TP.
- evidence: inspected `packages/cli/lib/host-adapters/claude/{plugin,uninstall,runtime-check,plugin-mcp}.js`, `packages/cli/lib/installers/{local-marketplace,plugin-command,packaged-app-marketplace}.js`, `packages/cli/lib/cli/application.js` (`runGuidedInstall`, `installPluginPayload`), `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (`claudePluginDataRoot`), `packages/core/lib/runtime/host-installation.js`, `scripts/sync-plugin-runtime.js` (session-check template, consent gate lines 297-322), `plugins/agdf/meta/agdf-plugin.definition.json` (`automaticRuntimeChecks.surfaces.claude: plugin-enablement`, `instructionFootprint.budgets.sessionStartBase`), `packages/cli/scripts/runtime-integrity-layout-test.js`; `claude plugin list --json` output of Claude Code 2.1.268.
- missing_evidence: native Windows behaviour (T-010) only.
- current_coverage: packaged-copy reconciliation and drift notice `partially_done` (candidate); everything else `not_done`.
- reuse_strategy: `extend` existing owners; no new module beyond the TP-named test file.
- risks: see Regression Risks.
- context_graph_impact: link_only at closeout (CG-PUBLIC-PLUGIN-DISTRIBUTION).
- required_next_step: CD+Tests along the implementation path below.

## Owners And Reuse

| Area | Existing owner | Reuse |
|---|---|---|
| Detection, comparison, drift | `host-installation.js` (`packagedAppCopies`, `sameFileSystemEntry`, `inspectClaudeHostInstallationDrift`) | extend with `detectPackagedAppProcess`, a shared provenance comparator and record-based drift |
| Reconciliation | `packaged-app-marketplace.js` | keep; consume the shared detector |
| Install sequence | `claude/plugin.js` `installClaudeGlobalPlugin` | restructure into pre-commit and post-commit phases |
| Transaction | `local-marketplace.js` `commit()` | add opt-in `tolerateCleanupFailure`; default unchanged |
| Rollback evidence | `plugin-command.js` `rollbackMarketplaceFilesystem` | report `not_applicable_committed` when the transaction is closed |
| Plugin data root | `plugin-runtime.js` `claudePluginDataRoot` | reuse for `installation.json` |
| Guided install entry | `application.js` `runGuidedInstall` → `runInstallSetup` → `installPluginPayload` | preflight runs before `runInstallSetup` for target `claude` |
| Session check | `sync-plugin-runtime.js` template | surface `claude` bypasses the receipt gate; drift reference becomes the installation record |

## Regression Risks And Test Impact

- `runtime-integrity-layout-test.js` asserts that Claude hooks without a receipt emit no runtime facts (lines 81, 120, 133). This encodes the behaviour the approved PRD (AC-009) and SD (SDD-008) change; the assertions are updated so Claude emits facts and Codex without a receipt still does not.
- `assertSessionBase` measures the whole hook stdout against the `sessionStartBase` budget (1912 bytes). With runtime facts the base must be measured without the facts and drift lines; the budget itself stays unchanged.
- `runInstallSetup` may perform control or consent steps before the payload; the preflight therefore sits before it so no data-root or registration mutation precedes the check.
- `plugin-command.js` parsers are shared with Codex; Claude JSON reading lives in the Claude adapter only.
- `commit()` is shared with Codex and Copilot; only the Claude adapter passes the new option.
- Candidate `42c42850` drift reference changes from the cache entry to the installation record; its tests are adapted.
- Windows junction creation in tests can fail with EPERM; affected cases fall back as planned in the TP.

## Minimal Clean Implementation Path

1. `host-installation.js`: add `detectPackagedAppProcess({ env, platform, fs, randomId })`, `compareInstallationProvenance(expected, observed)`, `readClaudeInstallationRecord`/`writeClaudeInstallationRecord` helpers (record path from the plugin data root), and switch drift inspection to the record.
2. `claude/plugin.js`: export `preflightClaudeInstall`; split install into pre-commit (preflight, prepare, marketplace registration, JSON listing, conditional install) and post-commit (record, reconciliation, verification, MCP) with individual guards.
3. `application.js`: call the Claude preflight before `runInstallSetup` for target `claude`.
4. `local-marketplace.js`, `plugin-command.js`: opt-in cleanup tolerance and truthful rollback evidence.
5. `sync-plugin-runtime.js`: Claude consent via plugin enablement; regenerate runtime with existing sync scripts.
6. Tests: new `claude-install-hardening-test.js`, adapted `claude-packaged-app-copy-test.js` and `runtime-integrity-layout-test.js`, smoke-test chain entry.

## Quality Outlook

- quality_outlook: Local deterministic coverage is achievable for every scenario except the native ones; native qualification remains the UAT precondition.
