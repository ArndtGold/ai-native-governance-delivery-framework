# TP: Host-Specific AGDF Artifact for GitHub Copilot

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` accepted for revision 4 on 2026-09-03 after same-target, same-run, same-gate and revision revalidation
Revision: 4
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` revision 4
Date: 2026-09-03
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CPI3-T01 | Refresh Brownfield Analysis in `pre_implementation_analysis` mode. Map the shared plugin generator, runtime dependencies, marketplace transaction, provenance, CLI dependency injection and all cross-host consumers before changing code. | CPI2-AC-04, AC-09, AC-11, AC-13; AD-CPI3-01, AD-CPI3-05 through AD-CPI3-08 | Exact owner and call-path map; required Copilot runtime dependency list; coexistence and rollback boundaries; explicit stop conditions. |
| CPI3-T02 | Introduce one Copilot profile builder that projects canonical skills and allowlisted runtime dependencies into `generated/plugins/copilot/agdf`. Remove Copilot manifest, hook and `copilot-skills/**` from the Codex/Claude profile only after the new profile passes focused validation. | CPI2-AC-04, AC-11, AC-13; AD-CPI3-01, AD-CPI3-02 | Generated-tree inventory; exactly ten prefixed skills; no canonical `skills/**`, Codex/Claude manifests or other host projections in the Copilot profile; retained shared-profile behavior. |
| CPI3-T03 | Define and emit a deterministic Copilot semantic inventory with destination, component class, canonical owner, transformation rule, host requirement and content digest for every included file. | CPI2-AC-11, AC-13; AD-CPI3-03 | Stable inventory across two builds; every file and owner mapped exactly once; inventory digest recorded. |
| CPI3-T04 | Add fail-closed Copilot profile validation and a reviewed file-count and byte baseline. Add negative fixtures for unmapped files, missing required files, duplicate semantic owners, stale projections, excluded host surfaces and unexplained growth. | CPI2-AC-11, AC-13; AD-CPI3-03, AD-CPI3-04 | Named negative tests for every failure class; exact baseline values and component breakdown; zero unexplained tolerance unless the reviewed baseline is updated. |
| CPI3-T05 | Make Runtime Integrity and installation provenance profile-aware. Validate the Copilot profile without requiring Codex or Claude manifests and bind provenance to canonical version, runtime digest and inventory digest. | CPI2-AC-04, AC-09, AC-11, AC-13; AD-CPI3-07 | Positive and tamper tests; exact-version local validator resolution from the Copilot root; rejection of wrong profile or inventory digest. |
| CPI3-T06 | Add an atomic `prepareCopilotMarketplace` owner under the surface-specific `marketplaces/agdf-copilot` root. Reuse safe staging, ownership, swap, recovery and digest primitives without changing the existing Codex/Claude marketplace root. | CPI2-AC-01, AC-02, AC-09, AC-13; AD-CPI3-05 | First install, idempotent refresh, upgrade, interrupted transaction, foreign-root refusal and rollback tests; root and manifest identity assertions. |
| CPI3-T07 | Route `installCopilotGlobalPlugin`, public `copilot` and local `install:copilot` through the Copilot preparation owner while preserving consent, direct-install migration, lifecycle result, version verification and restart behavior. | CPI2-AC-01 through AC-04, AC-08, AC-09; AD-CPI3-06, AD-CPI3-09 | CLI and installer tests; injected preparer observation; `agdf@agdf` identity; no command or consent regression. |
| CPI3-T08 | Add cross-host coexistence and failure-isolation coverage using one AGDF data root. Exercise Codex→Claude→Copilot and Copilot→Codex→Claude sequences and verify roots, digests and registrations after successful and failed Copilot operations. | CPI2-AC-09, AC-11, AC-12, AC-13; AD-CPI3-05, AD-CPI3-08 | Both orderings pass; Copilot rollback changes only `agdf-copilot`; Codex and Claude roots and digests remain byte-identical. |
| CPI3-T09 | Update package, routing, Agent Skills conformance, lifecycle, retention and Runtime Integrity tests to consume the new Copilot profile. Preserve all revision 2 command, repository-retention and documentation guarantees. | CPI2-AC-03 through AC-12; AD-CPI3-08, AD-CPI3-09 | Package contains both separately owned profiles; Copilot tests use only its profile; retired repository surface remains absent; all prior relevant regressions stay green. |
| CPI3-T10 | Update technical installation and contributor documentation only where profile paths or diagnostic evidence changed. Keep the public command, product identity and bounded support claims unchanged. | CPI2-AC-03, AC-10, AC-12; AD-CPI3-06, AD-CPI3-09 | README, INSTALL, package README and Pages consistency tests; no new user-facing command or publication claim. |
| CPI3-T11 | Run release preparation, focused suites, complete smoke, package inventory, Runtime Integrity, skill conformance, skill evaluations, Pages checks and diff validation. Repair only scope-caused failures. | All criteria | Two deterministic release builds; all focused and aggregate suites pass; unrelated worktree changes preserved; `git diff --check` passes. |
| CPI3-T12 | Install through `npm run install:copilot`, inspect the staged and installed Copilot roots, record the before/after payload breakdown and capture bounded fresh-session behavior where directly observable. | CPI2-AC-01, AC-02, AC-04, AC-09, AC-12, AC-13 | Exact version and `agdf@agdf`; installed root contains one skill projection; measured file and byte reduction; hook and skill observation or explicit unavailable boundary. |
| CPI3-T13 | Run Task Plan Review, Clean Implementation Review and Code Review, reconcile Context Graph links and prepare revised QA evidence. | All criteria | 13/13 task coverage or explicit gaps; clean-owner decision; findings resolved or blocking; source, package, staged, installed and loaded evidence remain separated. |
| CPI4-T14 | Refresh Brownfield Analysis for SD revision 4. Confirm the existing CLI composition root, SessionStart generator, task-target contract, presentation owner and generated Copilot profile are the only owners needed for the correction. | AD-CPI4-01 through AD-CPI4-06 | Exact reuse map, call paths, target-result ownership and stop conditions before implementation. |
| CPI4-T15 | Add one code-owned task-target preflight and expose it through the exact local runtime as `target-check --json`. Validate target source, absolute and real paths, repository membership, contradictory input and the normalized resolved or unresolved result. | AD-CPI4-01 through AD-CPI4-03 | Unit tests for every reason code; no implicit `process.cwd()` authority; machine result repeats the verified governance target. |
| CPI4-T16 | Require Copilot gate-check routing to complete target preflight before doctor, run selection or gate evaluation. Keep `target_unresolved` separate from `repository_ungoverned` and forbid current-gate or approval output for unresolved results. | AD-CPI4-01 through AD-CPI4-03, AD-CPI4-05 | Behavioral evaluation proves no shell-list activation probe, no gate output and no synthetic UR in repo-less GeneralChat. |
| CPI4-T17 | Refine SessionStart so physical host context is classified before repository checks. Skip doctor and config lookup for `repo_less`; use only the verified root for `repository_bound`; preserve consent, read-only behavior and non-authorizing output. | AD-CPI4-03, AD-CPI4-04 | Focused hook fixtures for repo-less, repository-bound, malformed input and disabled consent; generated and installed bytes remain traceable. |
| CPI4-T18 | Add deterministic and behavioral regression coverage for explicit repository targets, continued targets, current-repository targets, unavailable paths, multiple plausible targets, stale target changes and ungoverned repositories with and without concrete user intent. | AD-CPI4-01 through AD-CPI4-06 | Full target-state matrix passes on canonical and generated Copilot skills; unsupported stronger enforcement is not claimed. |
| CPI4-T19 | Regenerate the Copilot profile, update semantic inventory and reviewed payload baseline when required, run focused and aggregate verification, reinstall 0.14.5 from the approved checkout and capture separate repo-less and repository-bound fresh-session UAT evidence. | All revision 4 decisions | Source, generated, package, installed-root and two fresh-session evidence planes remain distinct; reviews and renewed QA are completed before UAT. |

## 2. Deterministic Test Plan

| test_id | Scope | Required assertions | Blocking effect |
|---|---|---|---|
| CPI3-BUILD | Copilot profile build | Two builds are byte-stable; exactly one prefixed skill tree, one manifest and one Copilot hook exist. | Block on nondeterminism, missing content or parallel projection. |
| CPI3-ALLOWLIST | Payload boundary | Copilot root excludes `skills/**`, `.codex-plugin/**`, `.claude-plugin/**`, Codex hooks, submissions and unrelated host assets. | Block on any excluded surface. |
| CPI3-INVENTORY | Semantic ownership | Every payload file maps to one source owner, transformation and host requirement; the inventory digest matches. | Block on missing, multiple or stale ownership. |
| CPI3-NEGATIVE | Integrity failures | Unmapped, missing, duplicated, stale, excluded-surface and unexpected-growth fixtures each fail with a named reason. | Block if any fixture passes or fails ambiguously. |
| CPI3-BASELINE | Growth control | Exact reviewed file-count and byte ceilings match the accepted profile; any change requires an explicit baseline and rationale update. | Block on unexplained growth. |
| CPI3-RUNTIME | Runtime and provenance | Exact validator, hook runtime, profile identifier, runtime digest and inventory digest agree; tampering fails closed. | Block on version, profile, provenance or Runtime Integrity mismatch. |
| CPI3-MARKET | Copilot marketplace transaction | Surface root, ownership, idempotence, upgrade, foreign-root refusal, recovery and rollback are correct. | Block on unsafe mutation or false healthy state. |
| CPI3-CLI | Public and local routing | Both canonical commands select the Copilot profile; consent and result contracts remain unchanged. | Block on wrong preparer, command, identity or consent behavior. |
| CPI3-COEXIST | Cross-host coexistence | Both installation orders preserve independent roots, registrations and digests; Copilot failure cannot roll back another host. | Block on shared-root mutation or cross-host regression. |
| CPI3-PACK | Registry package | The package includes separately owned shared and Copilot profiles; each inventory is complete and no retired repository projection returns. | Block on missing artifact, ambiguity or stale content. |
| CPI3-RETENTION | Repository safety | Existing repository instructions, skills and `.agdf/control/**` remain byte-identical across lifecycle operations. | Block on repository mutation. |
| CPI3-DOC | Public consistency | Commands, identity, restart behavior and evidence limits remain consistent; profile details appear only where useful. | Revise on conflicting or inflated claims. |
| CPI3-REG | Aggregate regression | Codex, Claude, OpenCode, Pages, skill conformance, evaluations and full smoke retain expected behavior. | Block on scope-caused regression. |
| CPI4-TARGET-UNIT | Target preflight | Every normalized resolved and unresolved state validates source, path and repository identity without cwd fallback. | Block on implicit authority, incomplete result or wrong reason code. |
| CPI4-GENERALCHAT | Repo-less Copilot behavior | Internal chat cwd yields `no_reliable_target`; doctor, gate evaluation, synthetic UR and approval output are absent. | Block on any downstream governance evaluation. |
| CPI4-EXPLICIT | Explicit target from repo-less chat | One accessible named repository resolves and only that root is evaluated. | Block on fallback, neighbor search or target mismatch. |
| CPI4-UNGOVERNED | Resolved ungoverned repository | A concrete user outcome may produce a minimal UR; absent intent produces clarification only. | Block on invented requirements or premature approval request. |
| CPI4-SESSION | SessionStart context | Repo-less skips doctor/config; repository-bound uses the verified root; consent and authority remain unchanged. | Block on false missing-config claims or target selection by the hook. |
| CPI4-PROPAGATION | Generated surface integrity | Canonical, generated, packaged and installed target-preflight owners and skill instructions match. | Block on stale or parallel ownership. |

## 3. Direct Host And Installed-Root Evidence

| observation_id | Procedure | Required evidence |
|---|---|---|
| CPI3-H01 | Run `npm run install:copilot` from the approved checkout. | Exact target, canonical version, `agdf@agdf`, Copilot marketplace source and restart instruction. |
| CPI3-H02 | Inspect the generated profile and AGDF-owned Copilot marketplace before host cache copying. | Inventory digest, component breakdown, one skill projection and absence of other host surfaces. |
| CPI3-H03 | Inspect the host-reported installed plugin and accessible installed root where available. | Installed identity and version; package, staged and host-cache evidence clearly distinguished. |
| CPI3-H04 | Start a fresh Copilot session. | Loaded prefixed skills and hook behavior, or an explicit unavailable result tied to the tested host version. |
| CPI3-H05 | Verify an existing Codex and Claude installation before and after Copilot refresh. | Unchanged registered source, version and digest for each independent host. |
| CPI4-H06 | Resume or start a Copilot GeneralChat without repository metadata and invoke `agdf-gate-check`. | Visible unresolved-target orientation; no repository, run, gate, UR or approval claim; host working directory remains context only. |
| CPI4-H07 | Start a fresh Copilot session bound to the approved repository and invoke `agdf-gate-check`. | Exact repository identity, canonical selected run, current gate and localized presentation from the installed runtime. |

Rendered or CLI Copilot observations prove only the tested app or CLI version, operating system,
account, permissions and session. They do not establish public Marketplace availability, native
Windows or Linux parity, human acceptance or general host enforcement.

## 4. Acceptance Coverage

| PRD criterion | Tasks | Primary tests |
|---|---|---|
| CPI2-AC-01 | T06, T07, T11, T12 | CPI3-MARKET, CPI3-CLI, H01 |
| CPI2-AC-02 | T06, T07, T12 | CPI3-CLI, H01 |
| CPI2-AC-03 | T07, T09, T10 | CPI3-CLI, CPI3-DOC |
| CPI2-AC-04 | T02, T05, T07, T12 | CPI3-BUILD, CPI3-RUNTIME, H02 through H04 |
| CPI2-AC-05 | T02, T09 | CPI3-ALLOWLIST, CPI3-PACK |
| CPI2-AC-06 | T08, T09 | CPI3-RETENTION, CPI3-COEXIST |
| CPI2-AC-07 | T08, T09 | CPI3-RETENTION, CPI3-REG |
| CPI2-AC-08 | T07, T09 | CPI3-CLI, CPI3-RUNTIME |
| CPI2-AC-09 | T05 through T09, T12 | CPI3-RUNTIME, CPI3-MARKET, CPI3-COEXIST |
| CPI2-AC-10 | T10 | CPI3-DOC |
| CPI2-AC-11 | T02 through T11, T13 | All deterministic suites and reviews |
| CPI2-AC-12 | T08 through T13 | CPI3-DOC, CPI3-REG and bounded host evidence |
| CPI2-AC-13 | T01 through T09, T11 through T13 | CPI3-BUILD through CPI3-PACK, H02, H03 |
| CPI2-AC-02, AC-04, AC-11 | T14 through T19 | CPI4-TARGET-UNIT through CPI4-PROPAGATION, H06, H07 |

## 5. Brownfield Preparation Before Implementation

After TP approval, run `brownfield-analysis` in `pre_implementation_analysis` mode and persist the
refreshed result before changing code. It must confirm:

- the minimum runtime and metadata dependency closure for the Copilot profile;
- how atomic marketplace helpers are reused without coupling surface roots;
- the exact CLI injection change needed to select a Copilot preparer;
- how existing installation provenance migrates without false ownership claims;
- how Copilot content is removed from the shared generated profile without breaking Codex or Claude;
- which package, routing, conformance and runtime tests own each regression boundary;
- that unrelated working-tree changes can remain isolated.
- the exact owner and invocation path for `target-check --json` without adding a second target model;
- how gate-check consumes only a resolved governance target while Copilot remains `instruction_only`;
- how SessionStart shares physical context classification without becoming target or gate authority.

Stop before implementation if the design requires a second editable skill source, post-install
network fetch, broad cleanup of user data, shared-root replacement, weakened Runtime Integrity or a
new approval authority.

## 6. Out Of Scope

- Public Marketplace submission, publisher verification or release.
- Renaming the technical marketplace or plugin identity from `agdf@agdf`.
- Changing the public install command or consent choices.
- Deleting or migrating existing user repository files.
- Reducing the registry package to a single-host product.
- Native approval buttons or new Copilot agents, MCP servers, LSP servers or extensions.
- Unsupported cross-platform claims, commit, push or pull request creation.

## 7. Required Verification Sequence

1. Complete and persist CPI4-T14 before implementation.
2. Implement T15 through T18 with their focused positive and negative tests.
3. Run `npm run release:prepare` twice and compare the Copilot profile and inventory.
4. Run focused tests, full `npm --prefix create-agdf run smoke-test`, Runtime Integrity, package and Pages checks.
5. Execute T19 and record source, generated, staged, installed-root and fresh-session evidence separately.
6. Run Task Plan Review, Clean Implementation Review and Code Review.
7. Reconcile Context Graph links and run selected-run `doctor`, `gate-check`, `delivery-map` and `git diff --check`.
8. Prepare revised QA evidence without claiming QA pass.

## 8. Next Step

Review Task and Test Plan revision 4. Approval permits Brownfield implementation preparation and then
implementation of the approved tasks. It does not approve QA, UAT, publication or release.

Approve only with:

`Approval: TP`
