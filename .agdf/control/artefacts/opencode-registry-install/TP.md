# TP: OpenCode Registry Installation and Runtime Integrity

Status: approved
Gate: TP
Gate approval: approved on 2026-07-13
Based on: `.agdf/control/artefacts/opencode-registry-install/SD.md`
Date: 2026-07-13
Owner: AGDF installer and control-state maintainers

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| ORI-01 | Change the production OpenCode installer to invoke npm with `--save-exact` and `create-agdf@<pluginDefinition.version>` instead of `packageRoot`. | Clean and repeat installs persist an exact registry dependency; no production local-path fallback exists. | Focused argument assertion; source inspection; no `packageRoot` in the OpenCode npm install argument list. |
| ORI-02 | Add a bounded fake-npm subprocess fixture for source-level OpenCode installer tests. | Tests are deterministic without changing the production command or introducing an environment-controlled package source. | Fixture records arguments and creates minimal package, lock and config-local `node_modules` state; negative assertion rejects local source arguments. |
| ORI-03 | Add clean-install, existing-`file:` migration, unrelated-state preservation and source-removal installer tests. | Exact dependency/lock state, migration safety, package loadability and existing status/version behavior are proven. | Focused fixture outputs plus existing OpenCode status/version/global-surface assertions. |
| ORI-04 | Expand the internal artefact allowlist and parser fixtures for `Brownfield Review`, `Brownfield Analysis`, `CD+Tests` and `CR`. | All internal rows survive parsing and retain path/status/notes; internal steps remain outside user approvals. | Parser assertions covering all four rows and `done | not_applicable` satisfaction behavior. |
| ORI-05 | Make `Mode/Slice Decision` canonical with read fallback for legacy `Mode / Slice Decision`. | Canonical fields parse; legacy runs remain readable; canonical section wins when both forms exist. | Canonical, legacy and dual-heading parser fixtures; generated template inspection. |
| ORI-06 | Normalize QA approval-table `pass` and `passed` to `approved` while keeping QA artefact status `pass | passed`. | QA approval and durable report evidence remain separate and deterministic. | Parser fixtures for `pass`, `passed`, `approved` and non-approved values; durable artefact vocabulary regression assertions. |
| ORI-07 | Replace the late-gate fallback with explicit Brownfield Analysis, CD+Tests, CR, pre-QA QA, QA-report correction, UAT and OR transitions. | Every late-gate boundary reports the correct current gate, status, missing approval, allowed/forbidden actions and next action. | Transition-matrix smoke fixtures for each boundary, including `Approval: QA` and approved-QA-with-missing-report cases. |
| ORI-08 | Align the canonical Runtime Contract and RUN_STATE template with the implemented late-gate sequence and canonical heading. | Contract, template, parser and transition implementation share one vocabulary and order. | Runtime-integrity checks; source/generated diff inspection; no second transition table outside the canonical contract and implementation. |
| ORI-09 | Remove `firstUnapprovedGate()` and strengthen global OpenCode namespace regression checks. | No unused helper remains; generated/installed guidance consistently uses `agdf-global-*`. | Repository search for helper; smoke assertions for generated and installed AGDF guidance; obsolete wording rejected. |
| ORI-10 | Synchronize generated package assets and run the full regression suite. | Existing installer, status, control-state and release behavior remains green with no generated drift. | `sync-package-assets`, focused tests, full smoke test, runtime integrity, release-bootstrap test, `doctor --json`, and `git diff --check`. |

## 2. Test Plan

### Focused automated checks

- Run parser/control-state fixtures for internal artefacts, Mode/Slice compatibility and QA normalization.
- Run the late-gate transition matrix through the real CLI JSON path, not only helper-level assertions.
- Run OpenCode installer tests with the fake npm executable injected through `PATH`; assert exact arguments and generated package/lock state.
- Verify migration from the observed npx-cache `file:` dependency while preserving an unrelated dependency, config entry, instruction, permission and user-owned skill.
- Delete or make unavailable the fixture source/cache path and rerun `opencode-status` against config-local `node_modules`.

### Regression checks

```text
npm --prefix create-agdf run sync-package-assets
node create-agdf/scripts/control-state-test.js
node create-agdf/scripts/smoke-test.js
node plugin/scripts/check-runtime-integrity.mjs
node create-agdf/scripts/release-bootstrap-smoke-test.js
node create-agdf/bin/create-agdf.js doctor --json
git diff --check
```

If package scripts provide canonical wrappers for these commands, use the wrappers and record their exact results.

### Manual inspection

- Confirm production installer source contains only the exact registry package specifier.
- Confirm generated and installed global OpenCode guidance uses `agdf-global-*`.
- Confirm no unrelated active run or user global configuration was mutated by test execution.

## 3. Brownfield Scope

Before implementation, inspect and reuse:

- `create-agdf/bin/create-agdf.js`: `installOpenCodeGlobalPlugin`, internal artefact constants, gate satisfaction and `transitionDecisionForRunState`.
- `create-agdf/lib/control-state/run-state-parser.js`: heading, approval and artefact normalization.
- `create-agdf/scripts/smoke-test.js` and `create-agdf/scripts/control-state-test.js`: existing fixtures and test helpers.
- `plugin/meta/agdf-runtime-contract.md` and `plugin/control/templates/RUN_STATE.md`: canonical transition and heading ownership.
- `create-agdf/scripts/sync-package-assets.js`: generated-copy propagation.
- `.github/workflows/publish-agdf.yml` and `create-agdf/scripts/release-bootstrap-smoke-test.js`: registry-readiness contract.
- Current dirty worktree: isolate this scope from unrelated completed AGDF runs and preserve all pre-existing user changes.

The pre-implementation Brownfield Analysis must confirm exact insertion points, test helper reuse and whether any generated files require source-first updates.

## 4. Out Of Scope

- New CLI commands, flags, skills or OpenCode repository activation behavior.
- OpenCode-specific parser or gate-transition implementations.
- Changes to unrelated package installers, Windows compatibility work, data models, APIs or UI.
- Production fallback to local paths or an alternate registry.
- Live publication of the working package version; post-publish registry visibility remains release-workflow evidence.
- Mutation of the user's real global OpenCode installation during CD+Tests unless separately requested for UAT.
- Commit, push, pull request or release.

## 5. Risks And Blockers

- `block`: any implementation retains or introduces a production `file:`/cache fallback.
- `block`: transition behavior diverges from the canonical Runtime Contract or creates a second surface-specific owner.
- `block`: QA approval and QA report status are collapsed so one can satisfy the other without separate evidence.
- `revise`: the fake npm fixture becomes broader than the observable installer contract or tests only a helper instead of the CLI path.
- `revise`: migration tests do not prove preservation of unrelated OpenCode state.
- `revise`: canonical/generated assets drift or the legacy heading becomes a second emitted canonical form.
- `warn`: real installation of the working exact version cannot be proven before publication; this remains explicit release/UAT evidence, not a local QA pass claim.

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## Approval

- `Approval: UR` provided on `2026-07-13`.
- `Approval: PRD` provided on `2026-07-13`.
- `Approval: SD` provided on `2026-07-13`.
- `Approval: TP` provided on `2026-07-13`.
