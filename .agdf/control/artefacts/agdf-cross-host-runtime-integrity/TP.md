# TP: Cross-Host Plugin Runtime Integrity

Status: approved; revision 2  
Gate: TP  
Gate approval: approved by exact `Approval: TP` on 2026-08-25 after same-run, same-gate and revision-2 revalidation.  
Based on: approved `SD.md` revision 2  
Date: 2026-08-25  
Owner: agent

## 1. Delivery Boundary

Implement the approved bounded Structured Slice without changing gate semantics or creating another
runtime, installer, marketplace, status or profile owner. The implementation removes both root
runtime-free source-repository marketplaces, adds one canonical distribution-profile and installation-
provenance contract, extends the shared runtime probe, and exposes truthful loaded-root evidence
through existing lifecycle and SessionStart surfaces.

Real Codex or Claude Code installation, cache deletion, publication, deployment, commit, push and PR
creation are not implementation tasks. Direct host installation and fresh-session checks remain
separately authorized evidence actions after repository implementation is review-clean.

## 2. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CRI-01 | Capture the tracked and untracked baseline, confirm the selected-run path boundary, and preserve unrelated `docs/presentation/agdf_cto_praesentation.key`. | PRD-RI-09, PRD-RI-10 | Before-change path snapshot; protected unrelated path remains byte-untouched. |
| CRI-02 | Add schema-versioned `distributionProfiles` to the canonical plugin definition; remove active source-repository-marketplace metadata, the root marketplace renderer/call, `.agents/plugins/marketplace.json` and `.claude-plugin/marketplace.json`. Preserve package-local generated runtime-complete marketplace composition. | PRD-RI-01, PRD-RI-02, PRD-RI-03, PRD-RI-07 | Definition/manifest unit assertions; fresh-source fixture has neither installable root marketplace; generated full marketplace still targets `./plugins/agdf`. |
| CRI-03 | Extract one shared plugin-provenance helper beside the existing runtime owner. Centralize normalized source digest, runtime digest, profile lookup, marker validation and stable reason classification. Replace duplicate applicable digest logic without changing unrelated directory-digest consumers. | PRD-RI-01, PRD-RI-04, PRD-RI-05, PRD-RI-10 | Direct helper tests; one owner scan; deterministic identical-content digest and independent tamper negatives. |
| CRI-04 | Generalize owned installation provenance to `.agdf-installation.json` in `local-marketplace.js`. Write it for canonical and local-development stages, include it in the outer plugin digest, exclude it from normalized source digest, validate before promotion and preserve atomic rollback. Accept `.agdf-local-install.json` only as legacy owned migration input during explicit reinstall. | PRD-RI-03, PRD-RI-05, PRD-RI-08 | Local marketplace fixtures for canonical install, cachebuster install, idempotent rerun, legacy migration, tamper, interruption and rollback. |
| CRI-05 | Extend `resolveLocalValidator` and generated `agdf-local.js` with additive distribution profile, evidence plane, canonical/plugin version, runtime/source digest, observed plugin root and provenance status. Require coherent installed provenance before returning an executable machine-evidence result. Preserve config-local OpenCode and configured absolute-path behavior. | PRD-RI-01, PRD-RI-04, PRD-RI-05, PRD-RI-07, PRD-RI-09 | Table-driven local-validator tests for every profile and each stable negative reason; no registry or network access. |
| CRI-06 | Extend the shared SessionStart hook to invoke the runtime probe from its own observed plugin root and emit one compact integrity line. On Claude Code, compare `${CLAUDE_PLUGIN_ROOT}` when present. On failure, preserve agent-native boundaries and show the existing install/update recovery without editing caches. | PRD-RI-02, PRD-RI-06, PRD-RI-08, PRD-RI-09 | Isolated hook fixtures for healthy, restart/stale, root mismatch, missing runtime, malformed JSON and portable/no-runtime states. |
| CRI-07 | Update Codex and Claude installer verification plus general lifecycle/status projections to distinguish generated, registered, installed, restart-required and freshly loaded evidence. Treat absence of source-root marketplaces as normal. Preserve `agdf@agdf-repo` only for a runtime-complete generated repository projection or deliberate legacy recovery, and never delete it silently. | PRD-RI-03, PRD-RI-06, PRD-RI-08, PRD-RI-09, PRD-RI-10 | Lifecycle and plugin-installer fixtures proving plane separation, valid generated-repository selection, legacy recovery, unowned conflict blocking and unchanged host command authority. |
| CRI-08 | Update Runtime Integrity, runtime payload composition and generated/package checks for source non-installability, profile parity, new shared helper inclusion and installed marker rules. Preserve portable candidate runtime absence and OpenCode config-local behavior. | PRD-RI-01, PRD-RI-02, PRD-RI-04, PRD-RI-05, PRD-RI-07, PRD-RI-10 | Source/installed positive checks; negative integrity matrix; public plugin, package contents, package build, release coherence and OpenCode tests. |
| CRI-09 | Add explicit Codex-cache and Claude-plugin-root filesystem fixtures that execute the copied installed runtime from the observed root. Prove source shadowing, stale version, wrong root, marker tamper and digest corruption fail independently. | PRD-RI-02, PRD-RI-04, PRD-RI-05, PRD-RI-06, PRD-RI-08 | Deterministic temporary-root tests with no real host configuration, cache or network mutation. |
| CRI-10 | Update contributor and installation documentation to make the source checkout non-installable, point to the existing explicit local install commands, explain restart/fresh-session proof and distinguish runtime-bearing from portable profiles. | PRD-RI-01, PRD-RI-06, PRD-RI-07, PRD-RI-08, PRD-RI-09 | Documentation assertions plus manual link and command-name inspection. |
| CRI-11 | Regenerate all derived assets only through canonical sync, inspect generated drift, run focused and full regression verification, and record an exact post-change path snapshot. | PRD-RI-09, PRD-RI-10 | All declared commands pass; no unexplained generated drift; unrelated baseline remains isolated. |
| CRI-12 | Persist `CD_TESTS.md` with task-by-task evidence and explicitly separate repository fixtures from direct Codex and Claude host evidence. Do not claim QA, loaded-host parity or UAT from lower evidence planes. | All PRD-RI criteria | Complete CRI-01 through CRI-11 evidence map, remaining external evidence obligations and no unsupported host claim. |

## 3. Approved Implementation Paths

Implementation may change only these owners and their necessarily generated or test consumers:

- `.agents/plugins/marketplace.json` (deletion only)
- `.claude-plugin/marketplace.json` (deletion only)
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/hooks/session-start.sh`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/lib/public-plugin/manifest.js`
- `create-agdf/lib/runtime/local-validator.js`
- one new focused shared provenance helper under `create-agdf/lib/runtime/`
- `create-agdf/lib/installers/local-marketplace.js`
- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/lib/lifecycle/operations.js`
- `create-agdf/lib/lifecycle/status.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/sync-plugin-runtime.js`
- directly corresponding existing test files under `create-agdf/scripts/`
- `create-agdf/generated/**` only through canonical generation
- `CONTRIBUTING.md`, `INSTALL.md` and `create-agdf/README.md`
- this run's `.agdf/control/` artefacts and canonical backlog row

If implementation requires another executable owner, public CLI field, gate contract, persistent
schema outside owned installation provenance, or host permission boundary, stop and route the gap to
SD before changing it.

## 4. Stable Failure Contract

Additive local-resolution `reason` values must be deterministic and separately testable:

- `profile_invalid`
- `installation_provenance_missing`
- `installation_provenance_invalid`
- `plugin_root_mismatch`
- `runtime_missing`
- `runtime_digest_mismatch`
- `source_digest_mismatch`

Existing reason values such as `manifest_invalid`, `package_missing`, `entrypoint_missing` and
`invalid_entrypoint` remain compatible. The implementation may refine internal diagnostic wording,
but one failure must not collapse into another category. None of these values authorizes a gate or a
recovery mutation.

## 5. Test Plan

| test_id | Scope | Required assertion |
|---|---|---|
| CRI-T01 | Source profile and root marketplaces | Fresh source has no `plugin/runtime/`, neither installable root marketplace and one valid `source-development` declaration. |
| CRI-T02 | Profile matrix | Runtime plugin, OpenCode config-local, portable skills and source profiles each have exactly one coherent installability/runtime/evidence contract; unknown or contradictory profiles fail. |
| CRI-T03 | Shared provenance helper | Digest output is deterministic; marker exclusion and Codex version normalization are exact; path escape, missing field, wrong owner and digest tamper fail independently. |
| CRI-T04 | Marketplace staging | Canonical and cachebuster stages write valid provenance; same content is idempotent; interruption and tamper restore or block without deleting unowned state. |
| CRI-T05 | Legacy marker migration | Existing owned `.agdf-local-install.json` is readable only for explicit reinstall/migration; the new stage writes only `.agdf-installation.json`; arbitrary legacy files fail. |
| CRI-T06 | Resolver positive matrix | Generated bundle reports `generated_bundle`; installed plugin reports installed provenance; OpenCode reports config-local; all executable results are exact-version, digest-matched and registry-free. |
| CRI-T07 | Resolver negative matrix | Every stable reason in Section 4 has an isolated fixture and returns no executable machine-evidence result. |
| CRI-T08 | Codex effective cache | Runtime invoked from a copied Codex cache reports that observed root; runtime-free source, stale manifest and corrupt digest are not healthy. |
| CRI-T09 | Claude effective root | Runtime invoked from the plugin root agrees with `${CLAUDE_PLUGIN_ROOT}` when set; disagreement is `plugin_root_mismatch`; absent host variable retains observed-root evidence without inventing host attestation. |
| CRI-T10 | SessionStart output | Healthy, portable, degraded and retry states render one compact deterministic line; malformed probe output does not suppress the governance reminder or trigger fallback installation. |
| CRI-T11 | Lifecycle evidence planes | Successful install returns restart required, installed state does not imply loaded state, fresh-session evidence is separate and unowned conflicts remain blocking. |
| CRI-T12 | Repository lifecycle compatibility | Source-checkout operations target `agdf@agdf`; a valid runtime-complete generated repository may target `agdf@agdf-repo`; legacy incomplete state remains detectable for deliberate recovery; source sync recreates neither root marketplace. |
| CRI-T13 | Runtime Integrity | Source, generated and installed modes enforce their declared profile; runtime or provenance absence is accepted only where the profile declares it. |
| CRI-T14 | Portable and OpenCode regression | Public Skills-only candidate stays runtime-free with honest machine-validation boundary; OpenCode config-local install, permissions and status remain unchanged apart from additive profile evidence. |
| CRI-T15 | Package and generation | Two canonical syncs are idempotent; generated runtime contains the shared helper once; tarball includes the complete runtime-bearing plugin and no root repository marketplace owner. |
| CRI-T16 | Full repository regression | Complete `create-agdf` smoke, skill evaluations, routing, package, Runtime Integrity and lifecycle suites pass without skipped or weakened assertions. |
| CRI-T17 | Control and scope integrity | Selected-run doctor/gate/delivery reports have no block or revise finding; `git diff --check` passes; changed paths stay in Section 3 and preserve unrelated user work. |

## 6. Verification Commands

Focused commands, run after their owning tasks:

```text
npm --prefix create-agdf run test:local-validator
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:public-plugin
npm --prefix create-agdf run test:opencode-hardening
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
```

Canonical and aggregate verification:

```text
npm --prefix create-agdf run release:prepare
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js --resolve-only --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js doctor --run agdf-cross-host-runtime-integrity --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js gate-check --run agdf-cross-host-runtime-integrity --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js delivery-map --run agdf-cross-host-runtime-integrity --json
npm --prefix create-agdf audit
git diff --check
```

Tests use temporary roots and injected command executors. They must not touch real Codex, Claude Code
or OpenCode configuration, caches, marketplaces or installed plugins.

## 7. Direct Host Evidence Obligations

These are required before a final cross-host QA pass but are not authorized by TP approval alone:

| evidence_id | Surface | Required observation |
|---|---|---|
| CRI-H01 | Codex | Explicit supported install/update completes, reports restart required, a new task loads the intended cache root, the installed provenance matches and focused `doctor --json` runs registry-free. |
| CRI-H02 | Claude Code | Explicit supported install/update completes, reports restart required, a fresh session loads the intended `${CLAUDE_PLUGIN_ROOT}`, provenance matches and focused `doctor --json` runs registry-free. |
| CRI-H03 | OpenCode | Existing config-local installation remains exact-version and the status surface reports the additive profile without permission or SDK regression. |
| CRI-H04 | Portable profile | Packaged Skills-only surface remains usable agent-natively and does not claim a local executable. |

If a host does not expose sufficient loaded-root evidence, record `unverified`; do not infer success
from package or installer tests. Human acceptance remains the later UAT gate.

## 8. Brownfield Scope Before Implementation

After TP approval, mandatory pre-implementation Brownfield Analysis must revalidate:

- the exact current implementations and tests of `manifest.js`, `sync-package-assets.js`,
  `local-marketplace.js`, `local-validator.js`, `plugin-installers.js`, `operations.js`, `status.js`,
  SessionStart and Runtime Integrity, plus both root source-marketplace files;
- the completed `automatic-version-asset-sync`, `agdf-local-plugin-install-scripts` and
  `agdf-plugin-reliability-hardening` ownership boundaries;
- current tracked, untracked and unrelated baseline paths;
- whether any new host, package or marketplace behavior has appeared since SD approval; and
- whether the proposed shared helper can replace duplicate logic without widening its owner.

Brownfield Analysis must pass before CRI-02 through CRI-12 implementation begins. A conflict, new
full-depth trigger or required path outside Section 3 routes to SD or TP revision.

## 9. Review And QA Sequence

After CD+Tests:

1. run Task Plan Review and map every CRI task and PRD criterion;
2. run Clean Implementation Review and reject fallbacks, duplicate runtime/profile owners and direct
   cache workarounds;
3. run mandatory Code Review and resolve blocking correctness, security and maintainability findings;
4. run QA Gate only with separated repository, package, installed-host and fresh-session evidence;
5. do not request or claim UAT before the QA report passes and receives its exact gate approval.

## 10. Out Of Scope

- Per-skill or per-host validator copies.
- New gate, approval, runtime-contract or status authorities.
- Public CLI command or output-schema breaking changes.
- Automatic registry fallback, hosted validation or MCP validation.
- Real host cache mutation, garbage collection or silent marketplace removal.
- Publication, release, commit, push or pull request creation.
- Changes to the separate public-plugin-distribution run.
- Any change to `docs/presentation/agdf_cto_praesentation.key`.

## 11. Risks And Blocking Rules

- Any executable result with missing or mismatched installed provenance blocks implementation
  acceptance for that profile.
- Recreating either installable source-root marketplace, adding runtime to `plugin/` or adding a
  per-skill runtime is a design violation and blocks QA.
- A lower evidence plane presented as loaded-host proof blocks QA.
- Missing direct Codex or Claude Code evidence prevents a final cross-host QA pass; it is not
  downgraded to a warning.
- OpenCode or portable-profile regression is at least revise.
- Unexplained generated drift, out-of-scope paths, weakened tests, failed rollback or modification of
  unrelated user work blocks QA.
- The existing Context Graph warning remains open until the reusable invariant is reconciled before
  closeout.

## 12. Next Step

Review this Task and Test Plan. Approval permits mandatory pre-implementation Brownfield Analysis
first. Implementation remains gated until that analysis passes.

Approve only with:

`Approval: TP`
