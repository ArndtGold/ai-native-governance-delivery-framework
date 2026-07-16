# Brownfield Analysis: create-agdf CLI Modularization

Status: done
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-07-16
Owner: agent
Based on: approved TP revision 1

## 1. Scope Verified

CM-01 through CM-14 remain aligned with the current 3,342-line
`create-agdf/bin/create-agdf.js`. All targeted responsibility groups are still present at
the locations described by SD revision 1. No production-code change has occurred since TP
approval.

## 2. Existing Owners And Reuse Path

| Concern | Current owner | Reuse strategy | Implementation boundary |
|---|---|---|---|
| Canonical run state | `create-agdf/lib/control-state/` | extend consumers only | Do not move or wrap its parser/resolver/writer APIs. |
| Delivery Path Search | `create-agdf/lib/delivery-path-search/` | reuse | Move only CLI option adaptation/rendering. |
| Interaction presentation | `create-agdf/lib/interaction-presentation.js` | reuse | Gate-check imports existing helpers; no locale/card duplication. |
| CLI command/parse/application | `create-agdf/bin/create-agdf.js` | refactor | Extract into approved `lib/cli/` owners. |
| Global installers | `create-agdf/bin/create-agdf.js` | refactor | Move current behaviour verbatim behind narrow adapters. |
| Repository scaffold | `create-agdf/bin/create-agdf.js` | refactor | Separate pure plan, ordered writer and presentation. |
| Doctor/Verified Change | `create-agdf/bin/create-agdf.js` | refactor | Extract shared parsing once and keep fail-closed results unchanged. |
| Gate policy/check | `create-agdf/bin/create-agdf.js` | refactor | One transition owner; compose existing doctor/delivery/presentation owners. |
| Delivery map | `create-agdf/bin/create-agdf.js` | refactor | One relationship/aggregation owner shared by command and gate-check. |

## 3. Current Function Boundaries

- CLI/config: `printUsage()` through `parseArgs()`.
- OpenCode installation/status: `defaultOpenCodeConfigDir()` through
  `printOpenCodeStatus()`.
- Codex/Claude installation: `installCodexGlobalPlugin()` through shared version helpers.
- Scaffold: `loadAsset()` through `printNextSteps()`.
- Shared inspection/doctor: `readTargetFile()` through `printDoctorReport()`.
- Verified Change/run state/delivery analysis: `extractField()` through
  `deriveQualityOutlook()`.
- Gate policy/presentation/check: `postApprovalTransition()` through
  `printGateCheckReport()`.
- Delivery map command: `readBacklogPointers()` through `printDeliveryMapReport()`.
- Delivery Path Search/application: `executeDeliveryPathSearch()` and `main()`.

These contiguous regions support staged move-based extraction without inventing a second
implementation.

## 4. Worktree And Parallel-Scope Check

- Production paths under `create-agdf/`, `agdf/` and `plugin/` are clean at baseline.
- Current changes are limited to this run's control artefacts and one backlog row.
- `installer-output-parity` references the same installer functions but remains at UR; its
  behavioural Windows/error-output scope is excluded and will not be implemented here.
- `agdf-human-decision-surface` and `agdf-state-orientation` reference gate presentation,
  but their delivered/current behaviour is already present in HEAD. This refactor treats
  HEAD as immutable semantic baseline.
- No uncommitted competing production-code owner or parallel implementation exists.

## 5. Package And Runtime Boundary

- `create-agdf/package.json` publishes complete `bin` and `lib` directories, so approved
  internal modules require no `files` expansion.
- `./cli` and the `create-agdf` bin both resolve to `bin/create-agdf.js`; those mappings
  remain unchanged.
- `agdf/bin/agdf.js` delegates by importing `create-agdf/cli`; the thin executable must
  therefore remain safe as an import side effect and execute exactly once.
- Generated plugin definition and locale JSON currently load before argument parsing. The
  runtime-context extraction must keep that eager ordering.

## 6. Regression And Test Impact

- `smoke-test.js` is the broad public scaffold/install/doctor/gate compatibility owner.
- `control-state-test.js` covers selectors, run lifecycle, gate and delivery-map CLI paths.
- Interaction, Verified Change, runtime-integrity and Delivery Path Search suites cover
  domain-specific behaviour.
- Release-bootstrap smoke covers the wrapper/clean-client command path.
- `cli-modularization-test.js` will add direct seams and static import-direction evidence;
  it complements rather than replaces subprocess coverage.

## 7. Dependency And Parallel-Structure Check

The approved import graph is implementable without cycles:

- shared control inspection is dependency-free apart from Node and control-state helpers;
- doctor, Verified Change and delivery-map depend on shared inspection;
- gate-policy is pure;
- gate-check depends downward on those owners and existing presentation;
- application alone depends on every command handler;
- no domain module imports application or bin.

No compatibility shim, barrel registry, service locator or second transition model is
required.

## 8. Risks And Required Controls

- Move functions in dependency order and run syntax/focused tests after each stage.
- Preserve literal user-facing and machine-readable strings unless registry derivation
  necessarily resolves the documented unsupported-command list drift.
- Preserve sync ordering and `stdio` options for filesystem/subprocess paths.
- Keep test adapters narrow; production code must not branch on test-only behaviour beyond
  the existing npm CLI override.
- Stop and revise SD/TP if extraction reveals a hidden reverse dependency that requires a
  new owner or public contract.

## 9. Decision

- decision: pass
- mode: pre_implementation_analysis
- reuse_strategy: refactor the monolithic owners; reuse existing domain libraries directly
- parallel_structure_risk: controlled
- regression_risk: high but bounded by staged extraction and existing subprocess suites
- context_graph_impact: new node remains deferred to verified OR closeout
- next_allowed_action: Implement CM-01 through CM-14 and record CD+Tests evidence.
