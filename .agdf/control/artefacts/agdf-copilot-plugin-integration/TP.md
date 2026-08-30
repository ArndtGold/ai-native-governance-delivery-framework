# TP: Plugin-Only AGDF Integration for GitHub Copilot

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` accepted for revision 2 on 2026-08-30 after same-run, same-gate and revision revalidation
Revision: 2
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` revision 2
Date: 2026-08-30
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CPI2-T01 | Remap the CLI `copilot` command to the existing plugin installation handler. Remove `copilot-plugin` and `both` from the command registry, help and runtime-check option validation. | CPI2-AC-01, AC-03, AC-08, AC-09; AD-CPI2-01, AD-CPI2-02 | Command registry and handler tests; supported-name snapshot; retired targets fail before mutation; consent choices use `copilot`. |
| CPI2-T02 | Remove Copilot repository planning and presentation from scaffold owners while preserving `codex-repo`, `opencode-repo`, `init` and `config`. | CPI2-AC-03, AC-05, AC-07; AD-CPI2-04 | Scaffold target inventory; write-plan tests; retired targets create no files; remaining targets unchanged. |
| CPI2-T03 | Refactor asset synchronization so the plugin manifest, `copilot-skills/**`, hook, contracts and runtime remain generated while owned repository-only Copilot outputs are removed from `create-agdf/generated`. | CPI2-AC-04, AC-05, AC-11; AD-CPI2-03 | Generated inventory before and after `release:prepare`; plugin skill and contract parity; absence of root Copilot repository assets; Runtime Integrity. |
| CPI2-T04 | Preserve local `npm run install:copilot` orchestration and update its public handler expectation from `copilot-plugin` to `copilot`. | CPI2-AC-02, AC-09; AD-CPI2-01, AD-CPI2-06 | Local installer unit and orchestration tests; exact checkout version; lifecycle exit-code preservation. |
| CPI2-T05 | Add non-destructive legacy fixtures proving install, update, status, disable and uninstall never alter existing `AGENTS.md`, `AGENTS.agdf.md`, `.github/**` or `.agdf/control/**`. | CPI2-AC-06, AC-07, AC-09; AD-CPI2-05 | Before and after content hashes for user-owned and formerly generated fixtures; failure and rollback cases. |
| CPI2-T06 | Update focused lifecycle, consent, routing, package, Agent Skills and smoke tests for the plugin-only contract. Remove assertions that require the retired repository projection without weakening plugin coverage. | CPI2-AC-04, AC-08, AC-09, AC-11, AC-12; AD-CPI2-06, AD-CPI2-08 | Copilot manifest, skill inventory, hook JSON, exact validator, approval negative cases, package absence and cross-surface regressions. |
| CPI2-T07 | Update `README.md`, `INSTALL.md`, `create-agdf/README.md`, CLI help and contributor guidance to publish one Copilot command and distinguish public registry from local checkout installation. | CPI2-AC-03, AC-10, AC-12; AD-CPI2-07 | Documentation assertions; no `copilot-plugin`, `copilot-repo` or supported Copilot repository bootstrap claims; identity and evidence boundaries consistent. |
| CPI2-T08 | Update Pages compatibility and installation content so GitHub Copilot is shown as an installable AGDF plugin using the canonical command. | CPI2-AC-03, AC-10, AC-12; AD-CPI2-07 | Pages landing tests and build; removal of repository-only claim; public command present; no publication overclaim. |
| CPI2-T09 | Run release preparation and all focused and aggregate repository verification. Repair only failures caused by this scope and preserve unrelated worktree changes. | All criteria; AD-CPI2-08 | `release:prepare`, focused tests, full smoke suite, package inventory, Runtime Integrity, 66 skill evaluations and `git diff --check`. |
| CPI2-T10 | Install through `npm run install:copilot`, verify the resulting Copilot host registration and record separate installed-root and fresh-session evidence where directly observable. | CPI2-AC-01, AC-02, AC-04, AC-08, AC-09, AC-12 | Exact installed version, marketplace and plugin identity, loaded skill inventory or explicit unavailable boundary, hook observation and retained repository files. |
| CPI2-T11 | Run mandatory Task Plan Review, Clean Implementation Review and Code Review, then reconcile Context Graph links before QA. | All criteria | Per-task coverage, clean-owner decision, diff findings, resolved drift and updated run evidence. |

## 2. Deterministic Test Plan

| test_id | Scope | Required assertions | Blocking effect |
|---|---|---|---|
| CPI2-CLI | Command contract | `copilot` is the only supported Copilot setup command; it reaches the plugin handler; `copilot-plugin` and `both` fail before mutation. | Block on stale or ambiguous routing. |
| CPI2-SCAFFOLD | Remaining scaffold surfaces | Codex repository, OpenCode repository, init and config outputs remain coherent; no Copilot repository plan exists. | Block on missing retained output or Copilot repository writes. |
| CPI2-GEN | Generated assets | Plugin manifest, prefixed skills, hook, contracts and runtime exist; retired root Copilot repository assets do not. | Block on missing plugin content, stale retired content or parallel owner. |
| CPI2-LOCAL | Local installation | `npm run install:copilot` invokes public handler `copilot`, installs the checkout version and preserves exit codes. | Block on wrong command, version or masked failure. |
| CPI2-NONDELETE | Legacy file retention | All repository fixtures retain exact contents across every plugin lifecycle operation and failure path. | Block on any repository mutation. |
| CPI2-CONSENT | Consent and hook | Manual default, explicit enable, cancel, renewal and hook JSON remain bounded; no result grants gate authority. | Block on execution without consent or authority confusion. |
| CPI2-LIFE | Plugin lifecycle | Install, update, status, disable and uninstall report truthful package, host and restart states and preserve prior healthy state on failure. | Block on false healthy state or destructive rollback. |
| CPI2-PACK | Package and runtime | Marketplace, `plugin.json`, `copilot-skills/**`, hook, exact runtime, version and digests are coherent. | Block on version, provenance or Runtime Integrity failure. |
| CPI2-DOC | Documentation | All public surfaces use `npx --yes @agdf/cli@latest copilot`; contributor surfaces use `npm run install:copilot`; no retired path is recommended. | Revise on stale or conflicting copy. |
| CPI2-PAGES | Website | Copilot is listed as plugin support with bounded evidence; build and landing tests pass. | Revise on stale repository-only or publication claims. |
| CPI2-REG | Cross-surface regression | Codex, Claude Code and OpenCode install, scaffold, consent, runtime and routing tests remain unchanged in behavior. | Block on regression. |

## 3. Direct Host Evidence

| observation_id | Procedure | Required evidence |
|---|---|---|
| CPI2-H01 | Run `npm run install:copilot` from the approved checkout. | Exact target and installed version, `agdf@agdf`, lifecycle result and restart instruction. |
| CPI2-H02 | List registered marketplaces and installed plugins after installation. | Marketplace and plugin identities reported by Copilot, separate from package metadata. |
| CPI2-H03 | Start a fresh Copilot session. | Loaded plugin or skill inventory and hook invocation, or an explicit unavailable result. |
| CPI2-H04 | Repeat lifecycle operations with a fixture repository containing legacy AGDF Copilot files. | Directly unchanged files and control state after install, status, disable and uninstall. |

Rendered Copilot observations prove only the tested app or CLI version, operating system, account,
permissions and session. They do not establish cross-platform parity, human acceptance or public
Marketplace availability.

## 4. Acceptance Coverage

| PRD criterion | Tasks | Primary tests |
|---|---|---|
| CPI2-AC-01 | T01, T09, T10 | CPI2-CLI, CPI2-LIFE, H01 |
| CPI2-AC-02 | T04, T09, T10 | CPI2-LOCAL, H01 |
| CPI2-AC-03 | T01, T02, T07, T08 | CPI2-CLI, CPI2-SCAFFOLD, CPI2-DOC, CPI2-PAGES |
| CPI2-AC-04 | T03, T06, T09, T10 | CPI2-GEN, CPI2-PACK, H02, H03 |
| CPI2-AC-05 | T02, T03, T06 | CPI2-SCAFFOLD, CPI2-GEN |
| CPI2-AC-06 | T05, T06, T10 | CPI2-NONDELETE, H04 |
| CPI2-AC-07 | T02, T05 | CPI2-SCAFFOLD, CPI2-NONDELETE |
| CPI2-AC-08 | T01, T06, T10 | CPI2-CONSENT, CPI2-LIFE, H03 |
| CPI2-AC-09 | T01, T04, T05, T06 | CPI2-LOCAL, CPI2-NONDELETE, CPI2-LIFE |
| CPI2-AC-10 | T07, T08 | CPI2-DOC, CPI2-PAGES |
| CPI2-AC-11 | T01 through T09 | All deterministic suites |
| CPI2-AC-12 | T07 through T11 | CPI2-DOC, CPI2-PAGES, CPI2-PACK, host evidence and reviews |

## 5. Brownfield Preparation Before Implementation

After TP approval, run `brownfield-analysis` in `pre_implementation_analysis` mode. It must confirm:

- the existing plugin handler is reused rather than copied;
- removal of repository projection code does not remove plugin `copilot-skills/**` generation;
- only AGDF-owned derived paths inside `create-agdf/generated` are cleaned;
- no target repository cleanup or migration is introduced;
- Codex, OpenCode, generic control and other host owners remain intact;
- existing unrelated worktree changes remain excluded.

Stop before implementation if a second installer, generator, consent store, lifecycle model,
approval path or repository cleanup mechanism would be required.

## 6. Out Of Scope

- Submission to `copilot-plugins`, `awesome-copilot` or another external Marketplace.
- Automatic Marketplace publication or publisher verification.
- A renamed Copilot repository command or compatibility alias.
- Deletion or migration of existing user repository files.
- Native approval buttons, new agents, MCP servers, LSP servers or canvas extensions.
- Unsupported cross-platform claims, release, commit, push or pull request creation.

## 7. Required Verification Sequence

1. Implement T01 through T08 with focused tests.
2. Run `npm run release:prepare` before broad generated-asset validation.
3. Run affected focused suites, full `npm --prefix create-agdf run smoke-test` and Runtime Integrity.
4. Run local Copilot install and bounded host observations.
5. Run Task Plan Review, Clean Implementation Review and Code Review.
6. Run selected-run `doctor`, `gate-check`, `delivery-map` and `git diff --check`.
7. Prepare QA evidence without claiming QA pass.

## 8. Next Step

Review Task and Test Plan revision 2. Approval permits Brownfield implementation preparation and
then implementation of the approved tasks. It does not approve QA, UAT, publication or release.

Approve only with:

`Approval: TP`
