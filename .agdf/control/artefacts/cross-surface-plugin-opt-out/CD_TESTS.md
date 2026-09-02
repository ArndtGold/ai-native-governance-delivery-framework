# CD+Tests: Projektbezogener Plugin-Opt-out über alle Oberflächen

Status: done_with_open_evidence_gap
Revision: 1
Date: 2026-09-02
Based on: approved TP revision 1 and passing Brownfield Analysis revision 1

## Delivered

- `--shared` is parsed and accepted only for explicit Copilot repository disable.
- Personal Copilot disable targets ignored `.github/copilot/settings.local.json`; shared mode targets
  `.github/copilot/settings.json`.
- One settings owner validates repository and parent paths, rejects symlinks, strict-JSON violations,
  ambiguous values and unverified ignore state, performs exact merge, atomic write, exact-byte
  rollback and postcondition verification.
- Repository lifecycle remains one plan/apply/verify path. Codex behavior is retained. Claude Code and
  OpenCode remain unsupported for repository disable without mutation.
- Lifecycle output reports configuration evidence, personal/shared audience, `pending_restart`,
  retained instructions and one next action. Preflight failure now returns a structured result.
- Root, installation and package documentation contain both Copilot modes, the four-surface matrix,
  Git-ignore prerequisite and separate `/plugin list` versus `/instructions` verification.

## Changed Paths

- `create-agdf/lib/cli/application.js`
- `create-agdf/lib/cli/command-registry.js`
- `create-agdf/lib/cli/parse-args.js`
- `create-agdf/lib/installers/copilot-settings.js`
- `create-agdf/lib/lifecycle/operations.js`
- `create-agdf/scripts/cli-modularization-test.js`
- `create-agdf/scripts/lifecycle-test.js`
- `create-agdf/scripts/copilot-repository-retention-test.js`
- `README.md`
- `INSTALL.md`
- `create-agdf/README.md`

Control artefacts for this run are additional. No release-profile production path, workflow, package
version, generated runtime source or foreign image was intentionally changed by this implementation.

## Test Evidence

| Evidence | Result | Detail |
|---|---|---|
| `test:cli-modularization` | pass | parser, exact option matrix, help and documentation assertions |
| `test:lifecycle` | pass | both Copilot modes, strict JSON, symlink and parent safety, ignored/unignored/Git errors, idempotency, exact merge, atomic rename and exact-byte rollback, Codex regression |
| `test:copilot-repository-retention` | pass | real temporary Git repository, personal and shared CLI, tracked-local rejection, instruction and control retention |
| Runtime Integrity source | pass | 10 skills and 16 control files |
| `test:package-contents` with isolated npm cache | pass | 383 files and complete release-built plugin |
| `test:package-build` with isolated npm cache | pass | byte-identical complete builds, source untouched |
| release preparation inside package test | pass | distribution history, release bump, version coherence and public plugin |
| control-state, parent-reconciliation, interaction-presentation, verified-change | pass | no control or interaction regression |
| runtime-integrity layout/negative and Agent Skills conformance | pass | source, negative and four generated surfaces |
| proportionality, Delivery Path Search focused/unit/generator and OpenCode hardening | pass | all completed successfully |
| routing render | pass | plugin-only Copilot skill routing |
| `git diff --check` | pass | no whitespace error |
| aggregate `smoke-test` | fail, foreign scope | stops in `local-development-install-test`: current parallel release changes produce `0.14.4+codex.local-*`, rejected by their existing local-marketplace validation |
| `test:skill-evals` | fail, foreign scope | all failing rows are stale Gate Check fingerprints after unrelated gate behavior/version-owner changes |
| direct `scripts/smoke-test.js` | fail, foreign scope | TP fixture uses `tp-transition-revision-1`, rejected by current unrelated revision-id validation |

The first package-contents attempt also hit an unwritable user npm cache. Repeating with
`NPM_CONFIG_CACHE=/private/tmp/agdf-cso-npm-cache` passed without changing user permissions.

## Evidence Boundary

Repository and fixture evidence proves safe configuration behavior. It does not prove a restarted
Copilot host, managed-policy precedence or cloud-agent uptake. Those remain post-QA UAT evidence.

## Result

- implementation: complete for `CSO-T02` through `CSO-T10`
- focused_evidence: pass
- aggregate_evidence: revise because the dirty parallel release and gate-validation scope prevents a
  fully green repository aggregate
- next_step: keep QA at `revise` until the foreign baseline is reconciled and the full smoke plus skill
  evaluations pass on the combined worktree
