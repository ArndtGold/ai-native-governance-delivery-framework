# CD+Tests: OpenCode Registry Installation and Runtime Integrity

Status: done
Based on: `.agdf/control/artefacts/opencode-registry-install/TP.md`
Date: 2026-07-13

## 1. Delivered Implementation

- OpenCode global installation now invokes npm from the configured OpenCode directory with `--save-exact create-agdf@<expected-version>` and no local package, npx-cache or production fallback source.
- The parser retains `Brownfield Review`, `Brownfield Analysis`, `CD+Tests` and `CR` artefacts.
- `Mode/Slice Decision` is canonical; legacy `Mode / Slice Decision` remains a read-only fallback with canonical precedence.
- QA approval rows normalize `pass | passed` to `approved`, while QA artefact rows retain `pass | passed` as report evidence.
- The shared transition function now derives Brownfield Analysis, CD+Tests, CR, pre-QA QA, QA report correction, UAT and OR explicitly.
- Explicit persisted `current_gate` no longer overrides missing prerequisite evidence and creates mismatched allowed/forbidden output.
- Unused `firstUnapprovedGate`, `effectiveCurrentGate`, `normalizeCurrentGate` and the now-orphaned `gateProgressOrder` were removed.
- The canonical Runtime Contract and RUN_STATE template now expose the complete late-gate sequence and internal artefact rows.
- Global OpenCode guidance regression tests enforce the current `agdf-global-*` namespace.

## 2. TP Coverage

| task_id | Status | Evidence |
|---|---|---|
| ORI-01 | done | `installOpenCodeGlobalPlugin()` uses exact registry specifier and `--save-exact`; npm runs with `cwd: configDir`. |
| ORI-02 | done | Existing `makeFakeExecutable()`/subprocess seam extended with a bounded fake npm contract; production source has no test override. |
| ORI-03 | done | Clean install, legacy `file:` migration, unrelated-state preservation and registry lock fixtures pass; the permanent test deletes the legacy npx-cache source and proves `opencode-status` remains loadable/current. Isolated real npm migration also passes. |
| ORI-04 | done | Parser/control-state tests retain all four internal artefact rows; CLI fixtures prove Brownfield Analysis may be `not_applicable`, while `CD+Tests` and `CR` marked `not_applicable` do not satisfy the approved-TP path. |
| ORI-05 | done | Canonical, legacy and dual-heading precedence tests pass; canonical RUN_STATE template updated. |
| ORI-06 | done | QA `pass`, `passed`, `approved` approval fixtures pass; QA artefact status remains separate. |
| ORI-07 | done | Eleven-case CLI transition matrix passes for Brownfield Analysis, CD+Tests, CR, pre-QA QA, bounded `not_applicable`, premature QA/UAT evidence, QA report correction, UAT and OR; every case asserts status, gate, missing approval, allowed, forbidden and next action. |
| ORI-08 | done | Runtime Contract and RUN_STATE source templates updated; generated assets synchronized; runtime integrity passes. |
| ORI-09 | done | Dead transition helpers removed; installed global-guidance fixture enforces `agdf-global-*`. |
| ORI-10 | done | Package smoke aggregate, focused control-state tests, runtime integrity, release bootstrap, doctor and diff checks pass. |

## 3. Design Refinement

The approved SD proposed npm `--prefix <configDir>`. A real isolated npm probe showed that npm then writes a `file:`-valued root version and path-based package-lock keys tied to the target directory, even though `create-agdf` itself resolves from the registry. The implementation therefore runs the same exact install command with `cwd: configDir` and omits `--prefix`.

This is a bounded implementation refinement, not a scope or product-semantics change. It preserves the configured target directory and Windows npm-command abstraction while producing a genuinely relocatable lockfile. The fake-npm fixture rejects `--prefix` so this property cannot regress silently.

## 4. Test Evidence

- `node create-agdf/scripts/control-state-test.js` → pass.
- `node create-agdf/scripts/smoke-test.js` → pass.
- `npm --prefix create-agdf run smoke-test` → pass, including generated sync, control-state, Delivery Path Search, generator and routing tests.
- `node plugin/scripts/check-runtime-integrity.mjs` → pass (`9 skills and 14 control files checked`).
- `node create-agdf/scripts/release-bootstrap-smoke-test.js` → pass with unchanged public command shape.
- `node create-agdf/bin/create-agdf.js doctor --json` → pass, 0 findings.
- `git diff --check` → pass.
- Isolated real npm clean-install probe for `create-agdf@0.6.9` → exact dependency `0.6.9`, installed version `0.6.9`, registry lock present, no `file:` source and no temp path in lockfile.
- Isolated real npm migration probe from the observed npx-cache `file:` shape → dependency migrated to `0.6.9`, `@opencode-ai/plugin@1.17.11` preserved, registry lock present, no npx-cache or `file:` reference.
- Permanent source-removal regression → legacy `.npm/_npx` fixture removed after migration; config-local package remains loadable and `current`.
- Complete late-gate regression → eleven CLI cases assert `status`, `current_gate`, `missing_approval`, `allowed`, `forbidden` and `next_allowed_action`; premature QA/UAT cannot bypass internal prerequisites.
- Internal-step policy regression → Brownfield Analysis may be `not_applicable`; CD+Tests and mandatory CR remain unsatisfied until `done` on an approved-TP path.
- Cross-platform npm test seam → `NODE_ENV=test` selects `node <fake-npm-cli>` before platform-specific npm selection, so Windows does not fall through to the real registry during smoke tests.

## 5. Intentionally Not Performed

- The user's real global OpenCode installation was not modified during CD+Tests.
- No commit, push, pull request, publication or release was performed.

## 6. Next Step

Run Task Plan Review, Clean Implementation Review and mandatory Code Review before QA.
