# TP: Installable AGDF Plugin for GitHub Copilot

Status: approved
Gate: TP
Gate approval: approved with exact `Approval: TP` on 2026-08-28
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md`
Date: 2026-08-28
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CPI-T01 | Freeze and validate the supported Copilot plugin, manifest, skill, hook, installation and precedence contracts in bounded fixtures. Reject unknown required fields or unsupported assumptions. | CPI-AC-01, CPI-AC-02, CPI-AC-07, CPI-AC-10, CPI-AC-12; AD-CPI-02, AD-CPI-03 | Official-source references with observation date; positive and negative contract fixtures; explicit compatibility boundary. |
| CPI-T02 | Extend `plugin/meta/agdf-plugin.definition.json` and the canonical manifest renderer with one Copilot projection for root `plugin.json`, prefixed skill path and optional Copilot hook path. Do not create a second metadata owner. | CPI-AC-01, CPI-AC-10, CPI-AC-12; AD-CPI-01, AD-CPI-02 | Renderer unit tests; invalid name, version and path cases; canonical metadata parity. |
| CPI-T03 | Extend `sync-package-assets.js` to generate the root Copilot manifest and `copilot-skills/agdf-*/` tree in the existing release-built plugin root using the current Copilot skill transformation and shared contracts. | CPI-AC-01, CPI-AC-02, CPI-AC-03, CPI-AC-09; AD-CPI-01, AD-CPI-03, AD-CPI-04 | Exact declared-versus-generated inventory; content parity digests; routing tests for every canonical skill; no source `plugin/` runtime. |
| CPI-T04 | Extend exact-version runtime and provenance handling with the explicit `copilot` surface while retaining one packaged validator and fail-closed resolution. | CPI-AC-04, CPI-AC-06, CPI-AC-10; AD-CPI-05 | `--resolve-only --json` fixtures for matched, missing, mismatched, stale and tampered payloads; runtime and source digest assertions; no registry or older fallback. |
| CPI-T05 | Generate a Copilot version-1 `sessionStart` hook and extend the content-bound consent model with `copilot`. Keep manual as the default and make changed capability identity require renewal. | CPI-AC-06, CPI-AC-11; AD-CPI-08 | Hook schema tests; POSIX and PowerShell command fixtures; no-argument, no-network, no-write and no-gate-authority assertions; manual, enabled, stale and revoked consent tests. |
| CPI-T06 | Add a focused Copilot host-command adapter for documented install, list, enable, disable and uninstall operations. Bind parsing to supported host output and return typed unavailable or managed states. | CPI-AC-01, CPI-AC-06, CPI-AC-10, CPI-AC-12; AD-CPI-06, AD-CPI-07 | Command construction and sanitized-output fixtures; missing executable, managed policy, malformed output, wrong version and command failure tests. |
| CPI-T07 | Integrate Copilot with the shared lifecycle operations and presentation. Build and verify before mutation, re-query after mutation, preserve prior proven state and provide a truthful manual app handoff when no CLI is callable. | CPI-AC-01, CPI-AC-06, CPI-AC-10, CPI-AC-12; AD-CPI-06, AD-CPI-07 | Install, update, repair, status, disable, uninstall and failed-update transaction tests; previous/current version and next-action assertions; manual-mode result fixture. |
| CPI-T08 | Preserve repository bootstrap ownership and implement deterministic diagnostics for plugin, project and personal skill precedence without overwriting files. | CPI-AC-05, CPI-AC-07, CPI-AC-09; AD-CPI-03, AD-CPI-04 | Before/after repository snapshots for plugin-only, bootstrap-only and combined modes; collision fixtures; effective-source diagnostics; existing scaffold smoke tests. |
| CPI-T09 | Extend package contents, version coherence, Runtime Integrity and release preparation so the Copilot manifest, prefixed skills, contracts, hook and exact runtime are one verified bundle. | CPI-AC-01, CPI-AC-02, CPI-AC-04, CPI-AC-10, CPI-AC-12; AD-CPI-01, AD-CPI-10 | `release:prepare`; package content tests; Runtime Integrity; root-manifest and skill inventory assertions; generated marketplace fixture validation; `git diff --check`. |
| CPI-T10 | Add deterministic routing and interaction regressions proving Copilot starts at `agdf-gate-check` and that plugin actions, permissions, plans, hooks and decorated values cannot authorize an AGDF gate. | CPI-AC-03, CPI-AC-08, CPI-AC-11; AD-CPI-09 | Positive, wrong-gate, stale-revision, permission-confusion, hook-output and decorated-value cases; exact approval revalidation evidence. |
| CPI-T11 | Update user documentation, capability matrices and install guidance to distinguish plugin package, repository bootstrap, app, CLI, cloud agent, operating system and evidence plane. Remove stale repository-only claims. | CPI-AC-05, CPI-AC-09, CPI-AC-10, CPI-AC-12 | Documentation assertion tests; support matrix with explicit version and OS boundaries; public-copy review; no automatic-publication claim. |
| CPI-T12 | Execute local-path installation and fresh-session verification in the installed macOS GitHub Copilot app using the generated exact bundle. Observe install, activation, skill inventory, governed routing, one collision, disable and uninstall retention. | CPI-AC-01, CPI-AC-02, CPI-AC-03, CPI-AC-05, CPI-AC-06, CPI-AC-07, CPI-AC-09, CPI-AC-10 | Direct rendered app observations; installed version; fresh-session declared-versus-loaded comparison; repository snapshots; retained files after uninstall. |
| CPI-T13 | Execute Copilot CLI lifecycle and hook evidence only when a supported callable CLI is available. Otherwise retain an explicit unavailable result and narrow claims. | CPI-AC-02, CPI-AC-04, CPI-AC-06, CPI-AC-10, CPI-AC-11, CPI-AC-12 | CLI version and command inventory; direct install/list/session/hook outputs, or typed `host_unavailable` evidence with narrowed support matrix. |
| CPI-T14 | Evaluate Linux and native Windows lifecycle behavior through direct environments when available. Do not block the macOS product outcome solely on unavailable environments, but forbid unsupported parity claims. | CPI-AC-06, CPI-AC-10, CPI-AC-11 | Direct path, process, update and rollback evidence per OS, or explicit unavailable rows and narrowed release claims. |
| CPI-T15 | Reconcile approved Copilot plugin ownership, evidence-plane and distribution decisions with the Context Graph and quality contracts after implementation evidence confirms the design. | CPI-AC-08, CPI-AC-10, CPI-AC-12 | Updated or linked Context Graph nodes with resolved drift; delivery-map result; no duplicate lifecycle or approval owner. |

## 2. Test Plan

### 2.1 Deterministic automated suites

| test_id | Scope | Required assertions | Blocking effect |
|---|---|---|---|
| CPI-MAN | Copilot manifest contract | Root manifest is valid, exact-versioned, canonical, points only to existing Copilot components and excludes undeclared MCP, LSP, agents and extensions. | Block on any invalid or duplicated owner. |
| CPI-GEN | Generation and parity | Every canonical skill has exactly one `agdf-` Copilot projection; required contracts resolve; generated content matches the canonical transform. | Block on missing, extra, stale or divergent content. |
| CPI-ROUTE | Skill routing | New product intent routes through `agdf-gate-check`; all canonical skill discovery cases retain their trigger and boundary. | Block on later-gate or implementation bypass. |
| CPI-RUN | Runtime and provenance | Copilot resolves the exact packaged validator and reports matched provenance; missing, mismatch and tamper cases fail closed without registry or older fallback. | Block on false healthy or fallback behavior. |
| CPI-CONSENT | Hook and consent | Manual default runs nothing; exact enabled identity permits the bounded check; stale, missing, denied or revoked consent runs nothing; no result grants gate authority. | Block on execution without valid consent or on unsafe capability. |
| CPI-LIFE | Lifecycle operations | Install, update, repair, status, enable, disable and uninstall preserve atomic and truthful state; managed and missing-host cases have one recovery action. | Block on partial healthy claims, cache deletion or repository mutation. |
| CPI-PREC | Precedence and repository ownership | Project and personal components win per host contract; AGDF reports the source and never overwrites it; bootstrap behavior remains unchanged. | Block on destructive override or implicit migration. |
| CPI-APPROVAL | Gate authority | Only exact same-run, gate and revision approval advances; plugin install, permission, plan, hook, timeout and decorated labels do not. | Block on any authority confusion. |
| CPI-REL | Release and package integrity | Version coherence, package contents, Runtime Integrity, marketplace fixture and generated assets pass from a clean release preparation. | Block on version or digest skew. |
| CPI-DOC | Documentation and support | Docs distinguish source, generated bundle, installed root, loaded session, UAT and publication; every compatibility claim has evidence. | Revise on stale or overstated claims. |

### 2.2 Direct host observations

| observation_id | Host and mode | Procedure | Required visible evidence |
|---|---|---|---|
| CPI-H01 | macOS Copilot app, `not_installed` | Open plugin management and select the exact generated local payload through a supported host action. | AGDF identity, expected version, source and host result. |
| CPI-H02 | macOS Copilot app, `installed_pending_fresh_session` | Start a fresh session after verified installation. | Loaded plugin identity and declared-versus-loaded `agdf-` skill inventory. |
| CPI-H03 | macOS Copilot app, `active_ungoverned_repository` | Request new product work in a repository without active AGDF control. | Correct gate-check routing and explicit repository setup boundary. |
| CPI-H04 | macOS Copilot app, `active_governed_repository` | Open a repository with one selectable AGDF run and request status. | Selected run, current gate, allowed next action and exact-text approval boundary. |
| CPI-H05 | macOS Copilot app, `active_with_project_override` | Provide one project skill with the same declared name. | Project source wins, collision is visible and no file is overwritten. |
| CPI-H06 | macOS Copilot app, `degraded_or_stale` | Introduce a bounded version or component mismatch fixture. | Expected versus observed state, evidence plane and one recovery action; no active claim. |
| CPI-H07 | macOS Copilot app, `disabled_or_uninstalled` | Disable and uninstall through the host. | New session no longer claims plugin components; repository files remain unchanged. |
| CPI-H08 | Copilot CLI when available | Install the exact local bundle, list it and start a fresh session. | Host version, installed identity, skill inventory and separate loaded-session evidence. |
| CPI-H09 | Copilot CLI hook when available | Observe manual default, then separately authorized enabled session check. | No execution before consent; bounded read-only context after valid consent; no gate authority. |
| CPI-H10 | Linux and native Windows when available | Repeat supported lifecycle and runtime cases. | Platform-specific direct evidence or explicit unavailable result. |

Direct rendered app observations require the actual user-visible Copilot surface. Package files,
command metadata and internal app bundle strings are not substitutes.

### 2.3 Acceptance and UX fidelity coverage

| prd_criterion | working_mode_state | task_id | planned_visible_evidence |
|---|---|---|---|
| CPI-AC-01 | `not_installed` | CPI-T01, CPI-T02, CPI-T06, CPI-T07, CPI-T09, CPI-T12 | Exact plugin identity, version, verification, activation and next action. |
| CPI-AC-02 | `installed_pending_fresh_session` | CPI-T03, CPI-T09, CPI-T12, CPI-T13 | Fresh-session declared-versus-loaded skill inventory. |
| CPI-AC-03 | `active_ungoverned_repository`, `active_governed_repository` | CPI-T03, CPI-T10, CPI-T12 | Visible gate-check routing and authority boundary. |
| CPI-AC-04 | active and degraded modes | CPI-T04, CPI-T09, CPI-T13 | Exact runtime source, version, digest, provenance and evidence plane. |
| CPI-AC-05 | plugin and bootstrap modes | CPI-T08, CPI-T12 | Distinct plugin and repository state plus unchanged repository snapshots. |
| CPI-AC-06 | lifecycle modes | CPI-T05, CPI-T06, CPI-T07, CPI-T12, CPI-T13, CPI-T14 | Operation, prior/current version, failing phase, rollback and recovery. |
| CPI-AC-07 | `active_with_project_override` | CPI-T08, CPI-T12 | Collision, winning source and non-destructive next action. |
| CPI-AC-08 | `active_governed_repository` | CPI-T10, CPI-T12 | Canonical approval presentation and negative authority cases. |
| CPI-AC-09 | `repository_bootstrap_only` and active modes | CPI-T03, CPI-T08, CPI-T12 | Explicit setup writes and preserved existing files. |
| CPI-AC-10 | all | CPI-T01, CPI-T04, CPI-T06, CPI-T09, CPI-T11, CPI-T12, CPI-T13, CPI-T14, CPI-T15 | Evidence-qualified support matrix and narrowed claims. |
| CPI-AC-11 | pending, active and degraded modes | CPI-T05, CPI-T10, CPI-T12, CPI-T13 | Manual or enabled automatic-check state and authority limitation. |
| CPI-AC-12 | not installed and active | CPI-T02, CPI-T06, CPI-T07, CPI-T09, CPI-T11, CPI-T13 | Source, versions, update result, restart need and separate publication boundary. |

Every PRD criterion has at least one implementation task, deterministic check and planned visible
or direct-host evidence. Task Plan Review must later evaluate the canonical UX Intent Fidelity shape.

### 2.4 Required aggregate verification

After focused tests pass, run the repository's standard release preparation and all affected
aggregate suites. Use a writable temporary npm cache if the default cache is not writable. At
minimum retain:

- focused manifest, generation, runtime, consent, lifecycle, routing and documentation results;
- existing scaffold, public-plugin, package-content, Runtime Integrity and release-version results;
- `npm run release:prepare` before broad generated-asset validation;
- repository test command or the narrowest documented aggregate equivalent;
- `git diff --check` and an exact changed-path inventory;
- the selected-run exact-version `doctor`, `gate-check` and `delivery-map` outputs.

Do not weaken, skip or rewrite existing assertions merely to accept the Copilot surface.

## 3. Brownfield Scope

Before implementation, run `brownfield-analysis` in `pre_implementation_analysis` mode for the
approved TP scope. It must inspect and confirm fit with:

- `plugin/meta/agdf-plugin.definition.json` and the manifest rendering owner;
- `plugin/skills/**`, Copilot skill transforms and shared contract path rewriting;
- `create-agdf/scripts/sync-package-assets.js` and `sync-plugin-runtime.js`;
- `create-agdf/lib/runtime/plugin-provenance.js`, local validator and runtime manifest;
- `create-agdf/lib/runtime-check-consent/**` including state schema, adapters and service;
- `create-agdf/lib/installers/**`, `create-agdf/lib/lifecycle/**` and local install entrypoints;
- package-content, release coherence, Runtime Integrity, scaffold, routing, consent and lifecycle tests;
- public documentation and support/capability matrices;
- the installed macOS Copilot app as a later direct-host evidence surface, not a source-code owner;
- existing unrelated worktree changes, which remain excluded from implementation scope.

Brownfield Analysis must stop if a second canonical plugin source, runtime, lifecycle model, consent
store, approval path or repository activation owner would be required.

## 4. Out Of Scope

- Native Copilot approval buttons, elicitation or extension UI.
- New custom agents, MCP servers, LSP servers or Copilot extensions.
- Automatic publication, marketplace registration, release creation or portal changes.
- Hosted AGDF services, telemetry, accounts or remote governance state.
- Silent migration or deletion of repository Copilot bootstrap files.
- Direct mutation of Copilot internal cache or configuration files when documented host operations
  are unavailable.
- Claims for unsupported Copilot surfaces, versions or operating systems without direct evidence.
- Fixing unrelated existing AGDF runs or pre-existing worktree changes.

## 5. Risks And Blockers

| condition | QA effect | Required response |
|---|---|---|
| Generated Copilot components diverge from canonical skill or metadata owners. | `block` | Restore generation from the canonical source and rerun parity plus Runtime Integrity. |
| Copilot resolves the existing Claude manifest or unprefixed skills instead of the root manifest and prefixed tree. | `block` | Correct manifest precedence or bundle layout and rerun cross-host package tests. |
| Any plugin operation, hook or host permission can advance an AGDF gate. | `block` | Route the gap to PRD or SD as appropriate; do not proceed to QA approval. |
| Runtime resolution uses PATH, network, registry, wildcard cache or older fallback. | `block` | Restore exact installed-root resolution and provenance proof. |
| Install, update or uninstall changes repository-owned files. | `block` | Restore files, correct ownership boundaries and rerun repository snapshots. |
| Automatic check runs without current content-bound consent or gains network, write or gate authority. | `block` | Disable the hook path and correct consent identity before further host testing. |
| Lifecycle result claims healthy or active without host and loaded-session evidence. | `revise` | Narrow the state and collect the missing evidence plane. |
| Existing Codex, Claude or OpenCode behavior regresses. | `block` | Resolve the regression in the shared owner before Copilot QA. |
| macOS Copilot app cannot install or discover the generated plugin. | `revise` | Diagnose the supported host path; revise design if no bounded recovery exists. |
| Copilot CLI, Linux or native Windows is unavailable. | `warn` | Record unavailable evidence and narrow support claims; do not infer parity. |
| Marketplace publication or managed-policy behavior lacks authorized direct evidence. | `warn` | Keep publication and managed behavior unverified and outside the delivery claim. |

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
