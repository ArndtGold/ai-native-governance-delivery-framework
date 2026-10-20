# CD+Tests: Compact closeout after a CLI-recorded Code Review

Gate: CD+Tests
Type: Compact Delivery evidence
Status: done
Decision: pass

## Run

- run_id: compact-closeout-cli-review-20261020-01
- related_ur: .agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md (approved)
- mode: `quick_task` (Compact Delivery, Narrow Code-Fix Criterion), see BROWNFIELD_REVIEW.md
- implemented_at: 2026-10-20
- code_state: branch `claude/zealous-dijkstra-767443`: fix commit `d6df0a36`, merged with `origin/main` `377b7547` in `39f56f06`, plus the uncommitted review nits, payload re-pin and re-recorded compatibility evidence
- machine: Windows 11 Enterprise 10.0.26200, Node v22.22.3

## Change

- `packages/core/lib/skill-dispatch/compact-continuation.js`: in the compact closeout branch, the Code Review source is read and bound only when the CR Artefacts row has a registered path. A `done` CR recorded by the CLI review step (empty path) now yields the regular `release-or` closeout continuation with UR and Brownfield Review sources. Registered paths keep their fail-closed binding.

## Regression Tests

| Test | Before the fix | After the fix |
|---|---|---|
| `packages/core/test/quick-closeout-command-test.js`, new CLI lane: CLI run-step ur/route, run-present/run-approve, CLI review step with `--source`, dispatch with `continue_delivery`, CLI closeout | fail: dispatch returned `evaluator_error` with `dispatch_control_evaluation_failed` and "Repair gate evaluation and retry once." (the incident) | pass: `compact_closeout` for `release-or` with sources UR and Brownfield Review; CR row path is empty; CLI closeout completes the run; seal valid; completed dispatch is terminal |
| `packages/cli/scripts/compact-continuation-test.js`, new boundary: registered CR, CR with empty path, registered but missing CR file | fail: continuation was null for the empty-path CR | pass: sources UR, Brownfield Review, CR for a registered CR; UR and Brownfield Review for an empty path; `evaluator_error` for a missing registered file |

File-symlink assertions in `compact-continuation-test.js` are skipped on this Windows machine (EPERM without Developer Mode); they run on Linux CI.

## Affected Suites And Checks

| Command | Result |
|---|---|
| `npm --prefix packages/cli run test:skill-dispatch` (includes `compact-continuation-test.js`) | pass |
| `npm --prefix packages/cli run test:control-state` (CLI review without source and CLI closeout) | pass |
| `npm --prefix packages/cli run test:run-step-transaction` | pass |
| `npm --prefix packages/cli run test:run-command-flow` (includes `quick-closeout-command-test.js`) | pass |
| `node plugins/agdf/scripts/check-runtime-integrity.mjs` and the built-runtime check | pass |
| `node packages/cli/bin/create-agdf.js delivery-map --dir . --all-active` | pass (exit 0) |
| `npm run test:host-compatibility` | pass |
| `npm --prefix packages/mcp-server run test:performance` and `test:package` | pass (warm p95 575 ms on the merged state) |
| `node scripts/sync-package-assets.js` after re-pinning the Copilot payload baseline | pass |
| `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` | pass; 56 evaluated, 0 failed |
| `git diff --check` | pass |

## Pinned Values Updated

- `plugins/agdf/meta/copilot-payload-baseline.json`: `max_bytes` 3442564 to 3442716, the exact +152 bytes of this fix on main `377b7547`; file count unchanged at 395.
- `docs/compatibility/HOST_COMPATIBILITY.md`, `docs/compatibility/evidence/facts.json`, `docs/compatibility/evidence/snapshot.json` and one new `evals/host-compatibility/observations/*.json`: re-recorded for the new source fingerprint. Only digests, timestamps and the recording environment changed; the environment is now `win32` / "native Windows" instead of `darwin` / "macOS" because the evidence was recorded on this machine.

## Missing Evidence

- CI on Linux 22/24 and Windows 22 is pending until the pull request runs.
- The installed runtime (AGDF 0.14.5) keeps the defect until the next release and reinstall; this run's own Code Review is therefore recorded through `agdf_record`.

## Risks

- If the owner prefers macOS as the recording environment for host-compatibility evidence, the evidence must be re-recorded on macOS before merge.
- PR #22 also moves the payload baseline and compatibility evidence; whichever merges second must re-measure and re-record.
