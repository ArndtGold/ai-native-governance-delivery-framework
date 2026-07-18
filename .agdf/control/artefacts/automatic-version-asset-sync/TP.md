# Task and Test Plan: Release-Built Plugin Runtime Distribution

Status: approved
Gate: TP
Date: 2026-07-18
Derived from: approved `SD.md`
Gate approval: `Approval: TP` provided on 2026-07-18 after same-run, same-gate, revision-5 and
durable-artefact revalidation.

## 1. Scope

Implement the approved source/build/install separation without adding another runtime owner. Keep
`plugin/` canonical and runtime-free; build the complete plugin only beneath the packaged
`create-agdf/generated/` tree; stage that package asset into one AGDF-owned durable local marketplace;
and migrate only the exact known Codex or Claude GitHub marketplace registration when the user reruns
the installer. OpenCode, gate semantics and validator behavior remain unchanged.

No npm publication, tag, commit, push, PR, live host marketplace mutation or deletion of unowned
user data is part of implementation or repository verification.

## 2. Task Plan

| task_id | Task | Primary owners | Acceptance mapping | Required evidence |
|---|---|---|---|---|
| RBP-01 | Make source `plugin/runtime/` explicitly derived and untracked; change source-layout integrity from requiring runtime to rejecting generated runtime while retaining canonical generator-owner checks. | `.gitignore`; `plugin/scripts/check-runtime-integrity.mjs`; integrity fixtures | PRD-01, AC-01 | Source layout passes without runtime and fails if a runtime payload is introduced. |
| RBP-02 | Refactor runtime generation to require a containment-checked output root and make package sync generate runtime directly into the refreshed generated plugin. | `create-agdf/scripts/sync-plugin-runtime.js`; `sync-package-assets.js` | PRD-02, AC-01, AC-02 | Two clean builds are byte-identical; neither build writes `plugin/runtime/`; unsafe/source output roots fail before mutation. |
| RBP-03 | Define explicit source, generated-package and installed-layout integrity modes, including exact version, manifest, digest and focused payload validation. | runtime-integrity modules and negative-test owners | PRD-01, PRD-05, AC-01, AC-05 | Positive fixtures pass only in their matching mode; independent absence, mismatch, digest and ownership tampering cases fail. |
| RBP-04 | Generate package-local Codex and Claude marketplace manifests that both reference `./plugins/agdf`, and verify the actual `npm pack --dry-run` file list contains one complete runtime-bearing plugin. | generated marketplace assets; package/prepack checks | PRD-02, PRD-05, AC-01, AC-02 | Tarball evidence includes manifest, entrypoint, runtime manifest and focused payload exactly once and excludes source-only leakage. |
| RBP-05 | Add the shared cross-platform AGDF data-root resolver and durable local-marketplace layout with an exact ownership manifest and injected filesystem root. | new focused module under `create-agdf/lib/installers/` | PRD-03, AC-03 | Linux/macOS/Windows path fixtures resolve outside repository and npm cache; unowned, malformed and escaping roots block without mutation. |
| RBP-06 | Implement atomic stage, validate, swap, bounded retention, commit and rollback transactions using platform-neutral filesystem APIs. | local-marketplace staging module | PRD-03, AC-03, AC-04 | First stage, idempotent match, owned update, interruption, host failure, rollback success and rollback failure fixtures preserve the last proven version. |
| RBP-07 | Add fail-closed host marketplace classification for absent, owned local current, exact legacy GitHub, conflict and unknown states. | shared classifier and host adapter fixtures | PRD-04, AC-03, AC-04 | Only absent, owned-current and the exact known legacy source are mutable; conflict/unknown inputs execute no removal. |
| RBP-08 | Migrate the Codex installer to the prepared durable local marketplace, literal argument vectors and exact installed-version verification; restore exact prior state on failure. | `create-agdf/lib/installers/plugin-installers.js`; Codex lifecycle tests | PRD-04, AC-03, AC-04 | First install, update, legacy migration, conflict, wrong version and rollback cases assert exact command order and lifecycle result. |
| RBP-09 | Migrate the Claude installer at user scope with the same ownership boundary, install/update selection, available-version verification and rollback behavior. | `plugin-installers.js`; Claude lifecycle tests | PRD-04, AC-03, AC-04 | First install, update, legacy migration, version-unavailable degradation, conflict and rollback cases assert exact command order and preserved state. |
| RBP-10 | Update `Publish AGDF packages` and guardrails to build before installed/package integrity and tarball validation in both validation and publish jobs, without repository writes or tag changes. | `.github/workflows/publish-agdf.yml`; guardrail workflow/test owners | PRD-02, PRD-05, AC-02, AC-05 | Workflow-order assertions prove source check, build, installed check and tarball check precede publish; permissions and Git state remain unchanged. |
| RBP-11 | Update lifecycle copy and installation/release documentation for release-built distribution, explicit rerun migration, offline validation and honest rollback/degraded outcomes. | installer lifecycle cards; `INSTALL.md`; package and release docs | PRD-03, PRD-04, compatibility | Copy tests preserve public commands and restart guidance while removing the claim that Git source is the installed runtime owner. |
| RBP-12 | Synchronize canonical derived assets and reconcile SoT/Context Graph ownership for package composition and local marketplace staging. | canonical sync flow; `.agdf/control/SOT_REGISTRY.md`; `.agdf/control/CONTEXT_GRAPH.md` | AC-02, AC-05, Context Graph | Generated drift is explained or absent; `CG-CREATE-AGDF-CLI-COMPOSITION` records the final owner and evidence. |
| RBP-13 | Run focused, offline and aggregate verification; record task-level CD+Tests evidence and keep authenticated host behavior for UAT separate. | test owners and run artefacts | AC-01 through AC-05 | All tests below pass, `git diff --check` passes, and no publication or real host configuration change occurs. |

## 3. Execution Order And Dependencies

1. Run the mandatory pre-implementation Brownfield Analysis after TP approval. It must inventory the
   dirty worktree, distinguish prior interaction/OpenCode work, confirm current host CLI contracts,
   and refine exact module seams without changing the approved architecture.
2. Implement RBP-01 through RBP-04 first. The three-layout integrity contract and deterministic
   package output must be stable before installer work consumes the built plugin.
3. Implement RBP-05 through RBP-07 as host-neutral transaction and classification logic with injected
   filesystem and command boundaries.
4. Implement RBP-08 and RBP-09 against the shared staging/classification contract. Their host-specific
   test fixtures may proceed independently only where files do not overlap.
5. Implement RBP-10 and RBP-11 after package and installer behavior is stable; then run RBP-12 through
   canonical synchronization rather than hand-editing generated assets.
6. Complete RBP-13 and mandatory reviews. Any new public command, marketplace identity, background
   update behavior, runtime owner or destructive migration returns to SD/TP review.

## 4. Test Plan

| test_id | Covers | Required cases | Expected result |
|---|---|---|---|
| RBP-T01 | RBP-01, RBP-03 | Clean source layout; introduced source runtime; missing generator owner; source/package mode confusion | Source succeeds only without generated runtime and with canonical owners; wrong layouts fail closed. |
| RBP-T02 | RBP-02 | Two clean temp-root builds; stale generated files; missing/relative/source/escaping output roots; interrupted build | Outputs are identical and contained; source is untouched; invalid roots fail before mutation. |
| RBP-T03 | RBP-03, RBP-04 | Generated plugin exact version/digest; missing entrypoint/module; corruption; duplicate payload; marketplace reference escape | Valid generated/installed layouts pass; every independent integrity defect fails with focused evidence. |
| RBP-T04 | RBP-04 | `npm pack --dry-run` file inventory from clean package state | Complete plugin files occur exactly once; required runtime is packaged; source runtime and unintended files are absent. |
| RBP-T05 | RBP-05 | Platform path fixtures; custom injected root; unowned stable root; bad marker; symlink/path escape | Only contained AGDF-owned roots are eligible; unsafe roots remain byte-for-byte unchanged. |
| RBP-T06 | RBP-06 | Initial stage; matching no-op; owned upgrade; copy/validate/rename interruption; successful and failed rollback; retention boundary | Transaction either commits a validated version or preserves/reports the last proven state without guessing ownership. |
| RBP-T07 | RBP-07 | Every common classification plus malformed/extra host output and same-name foreign source | Classifier is deterministic; conflict/unknown produces zero marketplace mutation commands. |
| RBP-T08 | RBP-08 | Codex absent install, owned update, exact GitHub migration, conflict, add/install failure, wrong version and rollback | Literal argv order matches SD; only exact legacy is removed; final success requires exact installed version. |
| RBP-T09 | RBP-09 | Claude absent install, update, exact GitHub migration, conflict, unavailable version, command failure and rollback | User-scope argv order matches SD; degraded verification remains explicit; prior source/root is restored on failure. |
| RBP-T10 | RBP-08, RBP-09 | Rejecting network/registry stubs after staging; installed `doctor`, `gate-check`, `delivery-map` | Routine validators execute from the staged exact-version plugin with no registry or PATH dependency. |
| RBP-T11 | RBP-10 | Validate-job and publish-job step ordering; failed build/integrity/tarball checks; workflow permissions and Git diff | Every failure stops before publish; successful workflow reaches publish only after explicit build and verification and never writes Git history. |
| RBP-T12 | RBP-11 | Existing public install commands, rerun migration, lifecycle success/degraded/failure and restart guidance | User-visible copy is architecture-accurate and preserves command compatibility. |
| RBP-T13 | RBP-12, RBP-13 | Canonical sync, focused installer/package tests, Runtime Integrity positive/negative, skill evals, aggregate smoke and `git diff --check` | All applicable repository checks pass with no unexplained derived drift; live-host claims remain excluded. |

## 5. Acceptance Traceability

| Acceptance criterion | Tasks | Tests |
|---|---|---|
| AC-01: Runtime-free source and complete built/installed plugin | RBP-01 through RBP-04 | RBP-T01 through RBP-T04 |
| AC-02: Build and verify before publication without Git mutation | RBP-02, RBP-04, RBP-10, RBP-12 | RBP-T02, RBP-T04, RBP-T11, RBP-T13 |
| AC-03: Durable Codex/Claude local marketplaces preserve host state | RBP-05 through RBP-09, RBP-11 | RBP-T05 through RBP-T10, RBP-T12 |
| AC-04: Legacy migration is idempotent, safe and rollback-capable | RBP-06 through RBP-09 | RBP-T06 through RBP-T09 |
| AC-05: Focused, offline and aggregate evidence | RBP-03, RBP-04, RBP-10, RBP-13 | RBP-T01 through RBP-T13 |

## 6. Safety And Regression Constraints

- Never delete, replace or unregister a path or marketplace without exact AGDF ownership or exact
  known-legacy evidence.
- Never use shell interpolation, unresolved environment variables, broad recursive deletion or the
  repository/current working directory as the durable marketplace root.
- Never build into or require source `plugin/runtime/`.
- Never treat npm cache or `npx` extraction paths as durable installed state.
- Never fall back silently to the GitHub marketplace after local staging or migration failure.
- Preserve plugin ID, marketplace name, public install commands, OpenCode architecture, exact gate
  semantics and unrelated host configuration.
- Preserve unrelated dirty-worktree changes and distinguish the earlier run's interaction/OpenCode
  implementation from the Codex/Claude distribution delta.
- Repository fixtures cannot prove authenticated host behavior; reserve real host migration and
  restart evidence for UAT with explicit user authority.

## 7. Review And Evidence Sequence

After implementation and focused tests:

1. record CD+Tests evidence by `task_id` and `test_id`;
2. run Task Plan Review;
3. run Clean Implementation Review;
4. run Code Review;
5. run QA Gate and produce the QA report;
6. request the next exact approval only when the durable report and gate projection are ready; and
7. keep real Codex/Claude marketplace migration, restart and UI evidence separate for UAT.

## 8. Next Step

Run the mandatory pre-implementation Brownfield Analysis. Implementation remains forbidden until
that internal analysis passes.
