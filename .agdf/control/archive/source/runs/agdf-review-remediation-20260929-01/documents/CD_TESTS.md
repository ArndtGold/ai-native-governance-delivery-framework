# CD+Tests: Review v2 remediation

Status: implementation complete locally; cross-platform and release observations open
Date: 2026-09-29
Run: `agdf-review-remediation-20260929-01`
Based on: approved TP revision 12, Run revision 14
Source baseline: `737457bdd8b4f19c18524eaa4cb469759e158836` on `feat/mcp-inspect-slice-1`
Evidence plane: local source, deterministic fixtures and local package build on macOS; no publish or fresh-host claim

## Delivered change and ownership

- The existing control-state owner now journals a Run/OR/Backlog transition, locks Run then shared Backlog, and recovers according to the sealed Run commit point. It checks the old seal and every listed artefact before accepting the staged OR change, including when OR was already listed. Readers block on pending intent. The journal is temporary recovery metadata, not another approval authority.
- Normal Run writes require a valid seal; `run-update` remains the explicit route for recording changed content. Live or ambiguous lock owners are not reclaimed. Path validation is shared across Run artefact, Verified Change and seal reads.
- OpenCode and lifecycle operations replace files atomically and recheck planned ownership at execution. The marketplace owner records prepared/committed transaction phase, verifies stable payload and backup identity, preserves committed stable content after cleanup failure, and blocks recovery when a prior backup is missing.
- Review found two additional host-file regressions before finalization: an absent target could be redirected through a replaced parent, and an existing private file could gain broader permissions during atomic replacement. File snapshots now bind parent and file identity plus digest, and atomic writes keep a private temporary file and the prior POSIX mode. Focused symlink, regular-directory, same-byte file-swap and `0600` fixtures pass.
- The coupled `agdf-v*` workflow is the sole publish route. Lock/version coherence, exact package legal-file inventory, registry preflight/readback and workflow contract checks are part of validation. Action references are pinned by full SHA; published registry state has not been changed.
- The canonical guard uses a plugin-relative installed path. Generated projections, fixture fingerprints and offline Eval provenance were updated. Public copy distinguishes curated replay from host execution and describes local MCP, CLI and npm acquisition.
- The separate MCP inspect, historical marketplace and package-payload runs retain their own approvals. Existing MCP inspect documentation and protocol changes in this checkout are not counted as this run's product delivery.

## Baseline and boundary checks

An isolated archive of baseline commit `737457b` used its unchanged control and installer source with copied generated package metadata. With a held Run lock, C1 returned `run_write_locked` and left Run/Backlog unchanged but replaced the previous `OR.md` with the new result. The final source returns the same lock rejection while preserving all three prior bytes. For C3, a child process left a Run lock and exited; the old writer returned `AGDF_RUN_WRITE_LOCKED` (`BASELINE_C3.json`), while final dead-owner recovery is covered by `test:run-lock`. For C4, a file named `D:foo` under a temp root was accepted by the baseline Run reader and Verified Change predicate (`true`); both final readers reject it. The C5/C6 baseline lifecycle plan returned `success`, overwrote a foreign file and removed another; the final apply returns `failed`, preserves the foreign bytes and leaves the other file present. For C7, a temporary new stable marketplace root plus old backup was restored to the old root on restart (`BASELINE_C7.json`); this is the durable state left by a postcommit backup-cleanup failure, though the `EBUSY` error was not itself injected into unchanged old source. No live installation was used.

The baseline C2 failure is reproduced by two child processes on different Run IDs sharing one temporary Backlog (`BASELINE_C2.json`). Both old-source calls returned `recorded` with `backlog: updated`; the final Backlog retained only beta's row. A 4 MB inert comment widened the read/write overlap without changing the old implementation. Final concurrency and external-edit fixtures are permanent tests. Together with C7's bounded durable-state counterexample, T-001's required C1–C7 baseline has direct or bounded evidence.

Direct readers checked: Run state reader/editor, doctor/gate-check, run seal, control evaluation and shared Backlog inspection. Selected-run reads reject a pending journal; doctor blocks shared Backlog interpretation while any pending run-step exists. `run-step` alone performs guarded recovery under Run then Backlog locks. The MCP inspection read path imports only the pure pending-journal locator, not mutation code; its static safety suite passes.

## TP and scenario coverage

| Task | Status on local source | Scenarios and evidence |
|---|---|---|
| T-001 | done locally | Baseline C1–C6 reproductions, C7 durable-state counterexample, reader inventory and other-run boundaries above; `BASELINE_C2.json`, `BASELINE_C3.json` and `BASELINE_C7.json` retain process/state evidence. |
| T-002 | done locally | SCN-001–003: four durable failpoints, already-listed OR regression, sealed Run/OR/Backlog readback, concurrent different-run Backlog writers and external edit conflict in `test:run-step-transaction`. |
| T-003 | done locally, Windows open | SCN-004–005: live/dead/ambiguous lock and missing-seal/approval fixtures in `test:run-lock`, `test:run-revision`, `test:control-state`. Windows process behavior awaits CI. |
| T-004 | done locally, Windows open | SCN-006–007: Windows lexical forms, traversal, symlink escape and contained positive files in `test:verified-change`; actual Windows host awaits CI. |
| T-005 | done locally | SCN-008–010: atomic interruption, file swap and runtime-tree ownership conflicts in `test:lifecycle` and `test:opencode-hardening`. |
| T-006 | done locally | SCN-011–012: committed cleanup failure, changed stable payload, replaced backup identity, missing prior backup and precommit recovery in `test:local-marketplace`. |
| T-007 | done locally, CI open | SCN-013–015: legacy workflow removed; 44 version surfaces and stale-lock negatives pass. Exact clean Linux/Windows commit logs remain absent. |
| T-008 | done locally | SCN-016: LICENSE and applicable NOTICE in all three exact dry-run tarball inventories; missing-file negatives pass. |
| T-009 | done locally, registry open | SCN-017–018: simulated `published/absent/unknown` states and retry stop pass; no live registry observation or publish. |
| T-010 | done locally | SCN-019–020: canonical fingerprint `sha256:af2f01f9e18a3ba1c520faf0691aa1cd4a4299bdfa027cf83651c5d14319bfdc`, generated/packed paths and drift negatives pass. |
| T-011 | partial evidence | SCN-021 passes with observation-owned fingerprints and curated replay labeling. SCN-022 public text is corrected in source; exact tagged public package and loaded-host comparisons remain unavailable. |
| T-012 | partial evidence | SCN-023–024 static permissions, SHA pins and dependency contract pass; exact CI and registry-side credential observations remain unavailable. |
| T-013 | partial | Focused, package and local integration checks pass. Clean Linux/Windows and affected workflow logs for one candidate commit are still required before QA pass. |

## Local verification

| Check | Observed result |
|---|---|
| Root and MCP `npm ci --offline --ignore-scripts` | pass from committed dependency declarations using local npm cache |
| `release:prepare`; version coherence | pass; 44 surfaces at `0.14.5`, eight profile snapshots |
| New transaction, lock, workflow and registry-state suites | pass on macOS; added to aggregate smoke command |
| Control-state, run-revision, Verified Change, lifecycle, OpenCode and marketplace suites | pass on macOS, including negative/fault fixtures |
| MCP complete `npm test` | pass; protocol, isolation, provenance, performance and package lanes |
| Instruction footprint, runtime-integrity layout/negative and `eval:skills` | pass; source-composed and curated deterministic evidence only |
| Exact package inventory | `create-agdf` 572 files after release preparation; CLI and MCP legal-file inventory assertions pass |
| `npm --prefix agdf run smoke-test` | pass; CLI package smoke on final local source |
| Astro site build | pass, four pages |
| `git diff HEAD --check` | pass |
| Full `create-agdf` smoke on final source | pass; release preparation, all focused and MCP suites, installer, generated host surface, localized status card and gate transition scenarios completed; full log: `LOCAL_SMOKE.log` |
| Review correction verification | lifecycle, OpenCode, Run revision and marketplace focused suites pass; payload budget updated to 117 files / 1125353 bytes from an exact measured rebuild |

The initial aggregate run exposed two stale guard fingerprints in the unavailable-host matrix and fixture expectations. The next run exposed a real `run-approve` locale precheck defect and an older missing-UR diagnostic expectation. The final code validates the prepared presentation in its recorded locale while preserving the missing-artefact rejection. Focused packaged intake and control-state tests pass. Marketplace review then added backup-identity and missing-prior-backup guards; its focused suite passes. None of these earlier aggregate runs is treated as final-source evidence.

## Open observations and handoff

- No clean Linux or Windows checkout/CI run is available for the uncommitted candidate. SCN-004, 006, 015, 023 and 024 retain their cross-platform or workflow evidence obligations.
- No npm registry write or live preflight has been performed. `NPM_TOKEN` rights, npm provenance/Trusted Publishing configuration and any partial registry state remain operator observations. `RELEASE.md` provides a stop-and-inspect procedure; it does not certify the registry.
- The current `agdf-v0.14.5` tag belongs to a prior release. This checkout changes future sources and makes no claim that tagged or already published packages contain these fixes. No loaded Codex, Claude, Copilot or OpenCode host was retested with this candidate.
- Context Graph impact is `link_only`: existing `CG-RUN-SCOPED-CONTROL-STATE`, `CG-PUBLIC-PLUGIN-DISTRIBUTION` and `CG-REQUEST-ACTIVATION-AUTHORITY` remain owners. This artefact, approved TP and later reviews provide run-specific links; no new policy node or parallel source of truth is created.

Next: record TP Review, Clean Review and Code Review against the final diff. QA must withhold pass while exact Windows/Linux CI and relevant release/host evidence are absent.
