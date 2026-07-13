# SD: OpenCode Registry Installation and Runtime Integrity

Status: approved
Gate: SD
Gate approval: approved on 2026-07-13
Based on: `.agdf/control/artefacts/opencode-registry-install/PRD.md`
Date: 2026-07-13
Owner: AGDF installer and control-state maintainers

## 1. Solution Overview

Extend the existing installer and shared control-state runtime at their current ownership points:

1. Replace the local package-directory npm argument with the exact registry specifier `create-agdf@<pluginDefinition.version>` and add `--save-exact`.
2. Expand the existing internal artefact allowlist and consume those artefacts in explicit late-gate transition branches.
3. Normalize canonical and legacy run-state vocabulary only in `run-state-parser.js`.
4. Remove the unused transition helper.
5. Extend existing smoke/control-state fixtures so every corrected boundary is exercised without introducing another runtime path.

## 2. Ownership And Source Of Truth

- `plugin/meta/agdf-plugin.definition.json` remains the sole owner of package name, expected version and OpenCode skill prefixes.
- `create-agdf/bin/create-agdf.js` remains the owner of OpenCode global installation, gate evaluation and transition output.
- `create-agdf/lib/control-state/run-state-parser.js` remains the sole Markdown-to-control-state normalization boundary.
- `plugin/meta/agdf-runtime-contract.md` remains the canonical gate sequence and vocabulary owner. Its transition table must explicitly include the missing `CD+Tests`, `CR` and pre-QA states so code and contract agree.
- `create-agdf/scripts/smoke-test.js` and `create-agdf/scripts/control-state-test.js` remain the regression-evidence owners.
- `create-agdf/scripts/sync-package-assets.js` remains the propagation path for generated package assets.
- `.github/workflows/publish-agdf.yml` remains the exact-version registry-readiness owner.

No OpenCode-specific parser, gate table or transition function is introduced.

## 3. Architecture Decisions

### AD-1 Exact registry installation

The production npm invocation is:

```text
npm install --silent --save-prod --save-exact --prefix <configDir> create-agdf@<expectedVersion>
```

The package specifier is built from `pluginDefinition.opencode.npmPackage` and `pluginDefinition.version`. The installer has no local-path or cache fallback. npm owns migration of the existing dependency and lock entry; the installer preserves its current config merge and ownership preflight.

### AD-2 Test-only npm boundary

Source-level installer tests inject a fake `npm` executable through `PATH` on the existing subprocess boundary. The fixture records arguments and creates only the minimal expected package/lock/node_modules state in the supplied `--prefix` directory. Production code receives no environment-controlled package-source override. The existing public release-bootstrap test remains the real-registry evidence after publication.

### AD-3 Internal artefact model

`internalStepArtefacts` becomes the single allowlist for:

```text
Brownfield Review
Brownfield Analysis
CD+Tests
CR
```

The existing `isInternalStepSatisfied()` status vocabulary (`done | not_applicable`) remains unchanged. No internal step is added to the user approval order.

### AD-4 Canonical late-gate transition

After an approved and persisted TP, `transitionDecisionForRunState()` evaluates in this order:

1. Brownfield Analysis missing → `Brownfield Analysis`.
2. Brownfield Analysis satisfied and CD+Tests missing → `CD+Tests`.
3. CD+Tests satisfied and CR missing → `CR`.
4. CR satisfied and QA not approved → `QA`, with `missing_approval: Approval: QA`; QA report creation/refinement and exact approval request are allowed.
5. QA approved but its durable report is missing or not `pass | passed` → stay at `QA` with no invented new approval.
6. QA satisfied and UAT not approved → `UAT`, with `missing_approval: Approval: UAT`.
7. UAT satisfied → `OR`.

The generic Brownfield Analysis fallback is removed. `effectiveCurrentGate()` may still display a later explicitly persisted gate only when it is consistent with the computed progression; it must not compensate for missing transition branches.

### AD-5 Parser-boundary compatibility

`Mode/Slice Decision` is canonical. The parser reads it first and falls back to legacy `Mode / Slice Decision` only when the canonical section is absent. Generated templates and normative documentation use the canonical heading. Fixtures cover both forms and canonical precedence.

For the QA row in the Approvals table, `pass` and `passed` normalize to `approved`. Artefact-table QA status remains `pass | passed`; approval and durable report evidence remain separate.

### AD-6 Dead code and namespace drift

`firstUnapprovedGate()` is removed because transition decisions already derive the earliest blocking gate directly. Generated and installed OpenCode instruction fixtures assert the `agdf-global-*` namespace and reject the obsolete global `agdf-*` wording.

## 4. Integration Points

- npm registry and the configured OpenCode global directory (`package.json`, `package-lock.json`, `node_modules/create-agdf`).
- OpenCode global config and owned instruction/runtime/skill files; their current merge and collision behavior is unchanged.
- Shared `doctor`, `gate-check` and `delivery-map` consumers of parsed run state.
- Canonical and generated `RUN_STATE.md` templates and Runtime Contract copies.
- npm publication workflow and clean public bootstrap smoke test.

There is no database, API, UI, queue or persistence-schema migration.

## 5. Constraints And Compatibility

- Keep `npx --yes @agdf/cli@latest opencode` unchanged.
- Preserve unrelated OpenCode dependencies, config fields and user-owned files.
- Keep Windows npm invocation support through the existing `npmCommand`/`npmPrefixArgs` abstraction.
- Do not turn internal steps into user approval gates.
- Do not collapse QA approval and QA report status into one field.
- Legacy heading support is read compatibility only; generated output is canonical.
- Synchronize generated assets before source-level package checks.
- Do not mutate the unrelated currently selected completed run; scope evidence remains under `opencode-registry-install`.

## 6. Test And Evidence Strategy

- Installer argument test: exact package/version and `--save-exact`; no local package path.
- Clean-install fixture: exact dependency and registry-style lock entry, package loadable from config-local `node_modules`.
- Migration fixture: existing npx-cache `file:` dependency replaced; unrelated dependency/config preserved.
- Source-removal fixture: package status remains loadable/current without the original source/cache directory.
- Parser tests: all internal artefacts retained; canonical and legacy Mode/Slice headings; canonical precedence; QA `pass`, `passed` and `approved` normalization.
- Transition matrix tests: Brownfield Analysis, CD+Tests, CR, QA before approval, QA approved/report missing, UAT and OR.
- Contract/template tests: canonical heading and explicit late-gate rows propagated to generated assets.
- OpenCode guidance test: generated and installed global instructions use `agdf-global-*`.
- Regression suite: package sync, focused control-state tests, full smoke test, runtime integrity, release-bootstrap static checks, `doctor --json`, and `git diff --check`.

## 7. Risks And Open Questions

- The fake npm fixture must model only observable npm output needed by the installer tests; it must not become a package-manager reimplementation.
- Existing runs may use the legacy spaced heading. Read compatibility avoids blocking them while canonical output converges.
- Late-gate transition tests must prove both computed state and human-visible `allowed`, `forbidden`, `missing_approval` and `next_allowed_action` fields.
- A real registry install of the not-yet-published working version cannot pass before publication; local QA therefore proves command construction and fixture behavior, while the release workflow remains the authority for post-publish registry availability.

No unresolved product decision blocks task planning.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`

## Approval

- `Approval: UR` provided on `2026-07-13`.
- `Approval: PRD` provided on `2026-07-13`.
- `Approval: SD` provided on `2026-07-13`.
