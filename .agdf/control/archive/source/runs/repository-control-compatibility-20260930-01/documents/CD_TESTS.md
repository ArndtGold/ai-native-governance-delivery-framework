# CD+Tests: Repository-specific migration and repair

Status: done (implementation and automated validation)
Gate: CD+Tests
Date: 2026-09-30
Based on: approved TP; Brownfield Analysis pass; implementation began at sealed revision 14.

## Implementation

One shared `lib/control-maintenance/` owner supplies compatibility, migration, repair, count/result contracts, presentation and interaction. Installer imports remain compatible. The direct `control-maintenance --dir <absolute-repository>` command is read-only by default; `--guided` requires an interactive channel and explicit reviewed application. Startup adds consent-bound per-repository facts and a fixed invocation hint, independently of Doctor, within the existing shared check deadline. Root identity is checked before/after decisions; stale snapshots remain canonical writer concerns. Existing recovery journals, seals, locks, original proof, owned rollback and approval reset are retained.

## Executed validation

29 focused suites passed with exit 0. Output snapshots and exact command/digest records are in [AUTOMATED_EVIDENCE.json](AUTOMATED_EVIDENCE.json). Earlier integration failures were corrected: missing local renderer import, numeric details expectation, and fixtures that did not actually create blocked Doctor state. Real-repository startup can exhaust its deadline; assertions retain honest unavailable behavior, with deterministic completion coverage in isolated fixtures.

| Suite | Result | Output |
|---|---|---|
| `cli-modularization` | pass / exit 0 | [test-evidence/cli-modularization.log](test-evidence/cli-modularization.log) |
| `codex-plugin-consent` | pass / exit 0 | [test-evidence/codex-plugin-consent.log](test-evidence/codex-plugin-consent.log) |
| `control-maintenance-command` | pass / exit 0 | [test-evidence/control-maintenance-command.log](test-evidence/control-maintenance-command.log) |
| `control-maintenance` | pass / exit 0 | [test-evidence/control-maintenance.log](test-evidence/control-maintenance.log) |
| `control-state` | pass / exit 0 | [test-evidence/control-state.log](test-evidence/control-state.log) |
| `copilot-profile` | pass / exit 0 | [test-evidence/copilot-profile.log](test-evidence/copilot-profile.log) |
| `install-control-migration` | pass / exit 0 | [test-evidence/install-control-migration.log](test-evidence/install-control-migration.log) |
| `install-control-repair` | pass / exit 0 | [test-evidence/install-control-repair.log](test-evidence/install-control-repair.log) |
| `install-setup-contract` | pass / exit 0 | [test-evidence/install-setup-contract.log](test-evidence/install-setup-contract.log) |
| `install-setup-interaction` | pass / exit 0 | [test-evidence/install-setup-interaction.log](test-evidence/install-setup-interaction.log) |
| `install-setup-service` | pass / exit 0 | [test-evidence/install-setup-service.log](test-evidence/install-setup-service.log) |
| `local-validator` | pass / exit 0 | [test-evidence/local-validator.log](test-evidence/local-validator.log) |
| `opencode-hardening` | pass / exit 0 | [test-evidence/opencode-hardening.log](test-evidence/opencode-hardening.log) |
| `operational-localization` | pass / exit 0 | [test-evidence/operational-localization.log](test-evidence/operational-localization.log) |
| `package-build` | pass / exit 0 | [test-evidence/package-build.log](test-evidence/package-build.log) |
| `package-contents` | pass / exit 0 | [test-evidence/package-contents.log](test-evidence/package-contents.log) |
| `payload-budget` | pass / exit 0 | [test-evidence/payload-budget.log](test-evidence/payload-budget.log) |
| `public-plugin` | pass / exit 0 | [test-evidence/public-plugin.log](test-evidence/public-plugin.log) |
| `repository-control-startup` | pass / exit 0 | [test-evidence/repository-control-startup.log](test-evidence/repository-control-startup.log) |
| `request-activation-callback` | pass / exit 0 | [test-evidence/request-activation-callback.log](test-evidence/request-activation-callback.log) |
| `request-activation-host-schema` | pass / exit 0 | [test-evidence/request-activation-host-schema.log](test-evidence/request-activation-host-schema.log) |
| `run-lock` | pass / exit 0 | [test-evidence/run-lock.log](test-evidence/run-lock.log) |
| `run-recovery` | pass / exit 0 | [test-evidence/run-recovery.log](test-evidence/run-recovery.log) |
| `run-revision` | pass / exit 0 | [test-evidence/run-revision.log](test-evidence/run-revision.log) |
| `run-step-transaction` | pass / exit 0 | [test-evidence/run-step-transaction.log](test-evidence/run-step-transaction.log) |
| `runtime-check-consent` | pass / exit 0 | [test-evidence/runtime-check-consent.log](test-evidence/runtime-check-consent.log) |
| `runtime-integrity-layout` | pass / exit 0 | [test-evidence/runtime-integrity-layout.log](test-evidence/runtime-integrity-layout.log) |
| `runtime-integrity-negative` | pass / exit 0 | [test-evidence/runtime-integrity-negative.log](test-evidence/runtime-integrity-negative.log) |
| `task-target-resolution` | pass / exit 0 | [test-evidence/task-target-resolution.log](test-evidence/task-target-resolution.log) |

Additional checks: `node plugin/scripts/check-runtime-integrity.mjs` passed (10 skills, 16 control files); `git diff --check` passed; extracted canonical migration/repair body parity passed; the original staged diff remains byte-identical to the pre-implementation capture.

## Scenario Evidence

| scenario_id | result | evidence |
|---|---|---|
| SCN-001/003/014/015 | pass | Shared classifier parity; preserved installer migration tests cover future/active/historical/planned/completed/unsafe cases and approval reset. Extracted migration body is byte-identical; repair body differs only by its shared import. |
| SCN-002/008/019/020 | pass | Actual source CLI and validator roots A/B; special-character paths; explicit absolute target grammar; read-only/default/JSON/details snapshots. |
| SCN-004/005/006/007/009 | pass | Generated hook and consent tests; blocked Doctor plus current compatibility; fixed JSON child with ignored stdin/deadline; malformed/failed/timed-out/wrong-root input; nested/A/B/repo-less context; OpenCode adapter cwd; unchanged fixture roots and consent data; stale identity abstains. |
| SCN-010/011/012/013 | pass | Real stream EOF; invalid/default-free 1/2/3 and aliases in EN/DE/fallback; separate apply callbacks; stale source rejected; identical-content target replacement rejected before migration. |
| SCN-016/017/018 | pass | Shared direct original restoration and canonical checkpoint/Git/nested-root/tamper/symlink/lock/transaction/fault tests. Same extracted repair owner; no original synthesis or raw original bytes in public result. Direct repeat is byte-identical. Fault injection remains in existing canonical suites, not duplicated in the new command. |
| SCN-021/026/027 | pass | Actual generated full-runtime command on Codex/Claude/Copilot/OpenCode; reference-only submission has no claimed runtime. New maintenance import closure excludes install/configuration services; existing Claude MCP support remains. Deterministic build, package contents, profiles, exact payload and positive/negative provenance guards. |
| SCN-022/023/025 | pass | Applied/partial/deferred/needs-input/unavailable result text and exit checks in EN/DE/fallback; actual final reinspection; deferred concurrent inventory changes visible; backups/source bytes and required paths remain explicit. |
| SCN-024 | pass | 2048-run injected inventory uses the shared startup projector; compact fields omit per-run/diagnostic content. Generated fixture hook exercises that same owner. Inert special characters and Unix/PowerShell display quoting tested; native Windows execution is not claimed. |
| SCN-028/029/030 | pass, bounded native lane | Exact installed candidate and real PTY operations passed. Four native fresh Codex SessionStart events prove migration/repair/current/absent target-specific hints with trusted hooks and unchanged roots/consent; see NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json. |

## Scope and package evidence

The attributable product delta is the source-path inventory in AUTOMATED_EVIDENCE.json. Unrelated prior working-tree and staged changes were preserved against `/private/tmp/agdf-repository-maintenance-baseline-20260930`. No real historical run was maintained as a fixture. A read-only direct candidate inspection of this repository reported current compatibility, zero migration/repair cases, and retained historical records.

Copilot inventory grows from 121 files / 1193511 bytes to 130 files / 1247677 bytes (+9 / +54166, about 4.5%). Eight shared capability files and one dedicated command account for the minimal new closure; the measured limit and rationale are documented in the existing baseline/history owner. No budget guard is disabled. Source and generated identities pass; native host/session proof remains separate.

## Evidence limits and next step

At initial implementation validation, SCN-028 through SCN-030 and candidate refresh were missing; that historical snapshot is now supplemented by the installed live follow-up below. The user reinstalled the candidate, and actual installed command behavior is observed. Native fresh-session startup is now observed in four isolated roots; human gate approval and release remain separate. Codex performed no installation, permission change, restart, commit, push or publication.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-NATIVE-INTERACTION-AUTHORITY; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Brownfield Analysis links existing owners; no new authority registry.
- memory_target: scope_artifact
- memory_reason: Candidate-specific automated evidence belongs to this run.
- memory_refs: AUTOMATED_EVIDENCE.json; HOST_EVIDENCE_GAP.md

## Installed live follow-up, 2026-09-30

The user reinstalled the exact prepared candidate. The new model-visible binding/facts, actual installed startup hooks with real unchanged consent and real PTY menu/migration/repair/no-original/repeat outcomes are recorded in CODEX_LIVE_OBSERVATION.md and LIVE_EVIDENCE.json. All tested installed behaviors passed; no source fix was needed. Original candidate/package evidence remains unchanged. The current real repository and its historical runs were not maintenance targets. The subsequent NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json records actual automatically emitted fresh-session events and resolves TP-E01; explicit fixture hook calls remain separate.
