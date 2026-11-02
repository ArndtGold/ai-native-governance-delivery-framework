# TP: Modularize the create-agdf CLI Entry Point

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided in session on 2026-07-16 after same-run, same-gate and revision revalidation
Based on: approved SD revision 1
Date: 2026-07-16
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CM-01 | Add `cli-modularization-test.js` with frozen command names, usage groups, representative output/exit fixtures and static dependency-direction assertions before extraction. Wire it into `package.json` and the aggregate smoke chain. | FR-02, FR-07, FR-08; AC-2, AC-3, AC-5, AC-8 | Focused test fails against missing modular seams for the intended reason, then passes as tasks land; existing smoke remains green. |
| CM-02 | Extract `cli/runtime-context.js` and `cli/command-registry.js`; derive supported-command validation, usage command listings and dispatch keys from one immutable registry while preserving eager generated-metadata loading. | FR-01, FR-02, FR-06; AC-1, AC-2 | Registry uniqueness/group tests, generated-assets-missing fixture and existing help/routing tests pass. |
| CM-03 | Extract pure `cli/parse-args.js` with `CliUsageError` and help/command result types; inject cwd and language resolution; remove parser console/process mutation. | FR-03, FR-08; AC-3 | Direct parser matrix covers all current options, aliases, defaults, bounds and failure classes without spawning or exiting. |
| CM-04 | Extract Codex/Claude plugin installation into `installers/plugin-installers.js` behind explicit subprocess/io adapters, moving command/version/error behaviour verbatim. | FR-04, FR-05, FR-07, FR-10; AC-4, AC-5, AC-11 | Recording-adapter tests prove exact executable, argument order, stdio and version/failure paths; no Windows behaviour delta. |
| CM-05 | Extract OpenCode install/status/package/native-surface logic into `installers/opencode.js`, including current npm test override and Windows npm-cli resolution. | FR-04, FR-05, FR-07, FR-10; AC-4, AC-5 | Existing OpenCode smoke fixtures plus direct command/config transition tests pass unchanged. |
| CM-06 | Extract scaffold ownership into `scaffold/plan.js`, `scaffold/write.js` and `scaffold/presentation.js`; preserve complete-plan preflight, file order, overwrite policy, ownership preservation and cleanup timing. | FR-04, FR-05, FR-07; AC-4, AC-6 | Exact per-target plan snapshots/file lists, overwrite/refusal/cleanup tests and full scaffold smoke pass. |
| CM-07 | Extract shared Markdown, backlog, run-selection and quality-contract helpers to `control-evaluation/shared.js`; extract doctor evaluation/rendering to `control-evaluation/doctor.js`. | FR-05, FR-06, FR-07; AC-4, AC-7 | Direct doctor fixtures and full control-state tests preserve finding codes, severity, summaries, paths and multi-run aggregation. |
| CM-08 | Extract Verified Change Git/baseline/path evaluation to `control-evaluation/verified-change.js` without weakening fail-closed checks. | FR-05, FR-06, FR-07; AC-4, AC-8, AC-11 | Existing Verified Change suite and focused direct fixtures pass with identical result states/codes. |
| CM-09 | Extract delivery relationship/quality/backlog analysis and command rendering to `control-evaluation/delivery-map.js`. | FR-05, FR-06, FR-07; AC-4, AC-7 | Direct relationship fixtures, `delivery-map --all-active` and existing control-state tests preserve JSON/human/exit behaviour. |
| CM-10 | Extract pure transition policy to `control-evaluation/gate-policy.js`; extract gate-check composition and rendering to `control-evaluation/gate-check.js`, reusing doctor, delivery-map and interaction-presentation owners. | FR-05, FR-06, FR-07; AC-4, AC-7, AC-11 | Table-driven gate-path fixtures plus current control-state/interaction/Verified Change suites preserve exact decisions, approval formulas and cards. |
| CM-11 | Extract `cli/delivery-path-search-command.js` and `cli/application.js`; use explicit handler map and adapters; replace handler exits with returned codes; reduce `bin/create-agdf.js` to the final composition root. | FR-01, FR-06, FR-07; AC-1, AC-5, AC-7 | Application exit/channel matrix, all Delivery Path Search suites, routing test and executable smoke pass. |
| CM-12 | Remove obsolete declarations/imports from the executable and assert there is no duplicate command list, transition tree, scaffold manifest, installer implementation or catch-all relocated monolith. | FR-02, FR-05, FR-06; AC-1, AC-2, AC-11 | Static ownership/import-direction assertions, syntax checks and Clean Implementation Review evidence. |
| CM-13 | Verify package completeness from a packed clean-client fixture without changing `bin`, `exports` or `files`; run release-bootstrap smoke. | FR-09; AC-9, AC-10 | Tarball contains every new module; `./cli` and executable load; release-bootstrap smoke passes. |
| CM-14 | Run complete verification, repair only in-scope regressions, and record CD+Tests evidence mapped to CM-01–CM-13 and BT-01–BT-20. | All FRs; AC-5–AC-12 | Full package smoke, Runtime Integrity, focused live commands and `git diff --check` pass; unverified native Windows boundary disclosed. |

## 2. Test Plan

### Focused tests

| test_id | Check | Expected evidence |
|---|---|---|
| BT-01 | Registry contains every current command exactly once. | Set equality against frozen baseline; no duplicate names or handler keys. |
| BT-02 | Usage and unsupported-command text derive command names from registry. | Preferred/scaffold/legacy groups contain expected commands and no unregistered command. |
| BT-03 | Parser accepts all current valid option/value/alias/default cases. | Returned option objects match frozen fixtures with injected cwd/locale. |
| BT-04 | Parser rejects missing values, unknown arguments, invalid surfaces/languages and numeric bounds. | Exact error class/message/showUsage metadata; no process or console calls. |
| BT-05 | Command validators preserve `--all-active`, `--run` and run lifecycle constraints without newly rejecting tolerated options. | Table-driven pass/fail matrix matches current `main()`. |
| BT-06 | Application maps help, usage, install/config, doctor, gate, delivery-map and search outcomes to current channels and exit codes. | Recording `io` plus returned numeric status. |
| BT-07 | Codex/Claude installer commands and version handling are unchanged. | Exact subprocess sequence/options and representative mismatch/missing-CLI errors. |
| BT-08 | OpenCode npm/config/native-surface transitions are unchanged. | Existing test override, Unix/Windows command plans and status fixtures pass. |
| BT-09 | Scaffold planning is pure and returns exact per-target file lists/order/metadata. | Frozen target fixture snapshots for config/init/Codex/Copilot/OpenCode/both. |
| BT-10 | Scaffold writer preserves whole-plan preflight, refusal, overwrite, ownership preservation and cleanup order. | Temp-directory mutation assertions and unchanged output plan. |
| BT-11 | Doctor direct fixtures retain codes, severity, summary and aggregation. | Current missing/ambiguous/multi-run/backlog/quality-contract cases. |
| BT-12 | Verified Change evaluation remains fail-closed. | Existing baseline/path/owner/prohibited-impact/escalation fixtures. |
| BT-13 | Gate policy covers structured delivery, structured slice, quick task, Verified Change, QA revise and UAT/OR paths. | Exact status/gate/approval/allowed/forbidden/next-action fixtures. |
| BT-14 | Gate-check composition retains cards, locale projection and doctor blocking precedence. | Existing control-state and interaction-presentation suites plus direct fixture. |
| BT-15 | Delivery-map relationships and multi-run aggregation remain unchanged. | Focused fixtures and live `--all-active` output. |
| BT-16 | Delivery Path Search CLI adapter preserves fixture/generator/evaluator/persistence paths. | Existing three Delivery Path Search suites and application exit mapping. |
| BT-17 | Executable is a thin composition root and package mappings remain unchanged. | Static source assertion plus package metadata smoke. |
| BT-18 | Import graph follows the SD and contains no cycle or reverse import into domain libraries. | Static import-direction assertion over new modules. |
| BT-19 | Packed clean-client and release-bootstrap paths include/load all modules. | Tarball inventory, clean-client `--help`/load and release-bootstrap smoke. |
| BT-20 | Aggregate repository verification is green. | Package smoke, plugin Runtime Integrity, selected doctor/gate/delivery commands and `git diff --check`. |

### Required command bundle

```bash
node create-agdf/scripts/cli-modularization-test.js
npm --prefix create-agdf run test:control-state
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:verified-change
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:skill-evals
npm --prefix create-agdf run eval:skills
npm --prefix create-agdf run test:delivery-path-search
npm --prefix create-agdf run test:delivery-path-search-unit
npm --prefix create-agdf run test:delivery-path-search-generator
npm --prefix create-agdf run test:routing
npm --prefix create-agdf run smoke-test
npm --prefix create-agdf run test:release-bootstrap
node plugin/scripts/check-runtime-integrity.mjs
node create-agdf/bin/create-agdf.js doctor --dir . --run create-agdf-cli-modularization --json
node create-agdf/bin/create-agdf.js gate-check --dir . --run create-agdf-cli-modularization --json
node create-agdf/bin/create-agdf.js delivery-map --dir . --all-active
git diff --check
```

If release-bootstrap requires external registry state unavailable in the environment, QA
must distinguish an environmental block from product-code failure and may not claim that
evidence as passed.

## 3. Acceptance Mapping

| PRD acceptance criterion | Tasks | Tests |
|---|---|---|
| AC-1 thin executable | CM-02, CM-11, CM-12 | BT-17, BT-18 |
| AC-2 single command definition | CM-01, CM-02, CM-12 | BT-01, BT-02 |
| AC-3 pure parser coverage | CM-03 | BT-03, BT-04, BT-05 |
| AC-4 direct module tests | CM-04–CM-10 | BT-07–BT-15 |
| AC-5 CLI output/exit compatibility | CM-01, CM-11, CM-14 | BT-06, BT-20 |
| AC-6 generated-file compatibility | CM-06, CM-14 | BT-09, BT-10, BT-20 |
| AC-7 machine contract compatibility | CM-07, CM-09–CM-11 | BT-11, BT-13–BT-16 |
| AC-8 aggregate suites | CM-01, CM-08, CM-10, CM-14 | BT-12, BT-14, BT-20 |
| AC-9 Runtime Integrity/whitespace | CM-14 | BT-20 |
| AC-10 packed client | CM-13 | BT-19 |
| AC-11 no fallback/parallel owner | CM-04–CM-12 | BT-18 plus Clean Implementation Review |
| AC-12 Context Graph at OR | CM-14 closeout evidence | OR reconciliation after QA/UAT |

## 4. Brownfield Scope

Before implementation, Brownfield Analysis must revalidate:

- exact current functions and helper dependencies in `create-agdf/bin/create-agdf.js`;
- current package and wrapper export/load boundaries;
- whether active `installer-output-parity`, `agdf-human-decision-surface` or state-oriented
  work has introduced overlapping uncommitted changes;
- generated metadata load timing and test override behaviour;
- existing subprocess tests that rely on exact output/order/exit semantics;
- the proposed import graph for cycles and parallel owners;
- the cleanest extraction order against the actual current worktree.

Any material drift from approved SD must revise SD/TP rather than be silently absorbed.

## 5. Out Of Scope

- Installer output/error/Windows fixes.
- New commands, flags, public exports or dependencies.
- Gate, status-card, locale or Delivery Path Search semantic changes.
- Async conversion, retries, fallbacks or performance work.
- Documentation cleanup unrelated to required package/test wiring.
- Context Graph node creation before verified OR closeout.
- Commit, push, PR, publish or reinstall.

## 6. Risks And Blockers

- Any unisolated dirty overlap in production code is a Brownfield block until ownership is
  resolved.
- Any command/output/exit/gate decision drift not mechanically required by registry
  derivation is a revise finding.
- Any duplicate transition tree, command list, scaffold manifest or temporary compatibility
  shim remaining after its extraction stage blocks Clean Implementation Review.
- A packed package missing one new runtime module blocks QA.
- Failure of doctor, gate-check, delivery-map, full smoke or Runtime Integrity blocks QA.
- Native Windows installer execution remains unverified unless separately demonstrated; it
  is a disclosure, not an automatic failure of this behaviour-preserving refactor.

## 7. Next Step

Run pre-implementation Brownfield Analysis against the approved tasks and current
worktree. Begin CD+Tests only if that internal analysis passes.
