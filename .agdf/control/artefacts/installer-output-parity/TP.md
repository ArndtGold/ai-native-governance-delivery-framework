# Task Plan: Coherent AGDF Installation Lifecycle

Status: approved; revision 4
Gate: TP
Date: 2026-07-17
Derived from: approved `SD.md` revision 2
Revision: 4
Revision reason: correct the pre-implementation verification command to the existing focused CLI test
Gate approval: revision 3 approved on 2026-07-17; revision 4 approved with exact `Approval: TP` on 2026-07-17

## Revision 3 Delta Scope

Implement only the approved English multi-surface lifecycle-card slice. Reuse lifecycle result,
presentation, CLI parser/application, installer adapters and scaffold presentation. Do not reopen
existing disable/uninstall safety, approval transport, gate authority or unrelated onboarding work.

## Revision 3 Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| MSC-01 | Validate canonical lifecycle surfaces and add additive schema-v1 `installation`, `activation` and `delivery` projections in `lifecycle/result.js`, preserving existing fields and values. | agent | Unit fixtures cover all five canonical surface values, missing/unsupported rejection, default `not_evaluated` delivery and restart-derived activation. |
| MSC-02 | Replace lifecycle locale lookup with one frozen English renderer, operation titles, surface labels and readable state formatting in `lifecycle/presentation.js`. | agent | German and English project/system locale fixtures render byte-identical English cards; JSON output remains unchanged. |
| MSC-03 | Add `--verbose` through parser, command registry and CLI application; ensure lifecycle callers pass normalized coding-agent surface rather than project chat locale. | agent | Help/argument tests cover the flag; quiet output is default, verbose is opt-in and lifecycle operations receive the correct surface. |
| MSC-04 | Capture successful Codex and Claude native plugin-phase output as structured evidence, replay it only in verbose mode, and preserve decisive error output in normal failure paths. | agent | Adapter fixtures prove phase order, quiet success, verbose diagnostics, Windows-safe invocation and failure evidence. |
| MSC-05 | Route Codex, Claude Code and OpenCode global installs plus Codex, OpenCode and GitHub Copilot repository setup through the shared card with evidence-based activation and next actions. | agent | Surface matrix proves correct human label, no implicit Codex fallback, shared card shape and truthful surface-specific action. |
| MSC-06 | Keep `status`, disable and uninstall compatible while rendering their AGDF-owned lifecycle/status copy in English and retaining existing delivery authority. | agent | Existing safety/status fixtures pass; a pending restart never produces a delivery decision. |
| MSC-07 | Extend focused lifecycle, CLI, scaffold, installer and release-bootstrap tests for all card variants, locale invariance, verbose policy, repository delivery semantics and update/unchanged wording. | agent | All focused suites pass; regression tests fail on mixed language, duplicate normal success detail or surface misrouting. |
| MSC-08 | Synchronize derived assets and update concise CLI documentation for English default and `--verbose`; reconcile the two existing Context Graph nodes. | agent | Runtime integrity, documentation/link checks, Context Graph evidence and aggregate smoke pass. |

## Revision 3 Execution Order

1. MSC-01 establishes result invariants and canonical surface validation.
2. MSC-02 renders only from those invariants.
3. MSC-03 propagates surface and verbose intent through command handling.
4. MSC-04 and MSC-05 integrate native adapters and repository setup.
5. MSC-06 preserves status/mutation boundaries.
6. MSC-07 proves the public contract before MSC-08 synchronizes generated assets and documentation.

## Revision 3 Acceptance Matrix

| SD / PRD delta | Planned evidence |
|---|---|
| Explicit multi-surface propagation | MSC-01, MSC-03, MSC-05 surface matrix |
| English invariant CLI card | MSC-02, MSC-07 locale fixtures |
| Additive schema-v1 projections | MSC-01 result tests and JSON compatibility assertions |
| Quiet default and verbose diagnostics | MSC-03, MSC-04, MSC-07 adapter/CLI fixtures |
| Installation, activation and delivery separation | MSC-01, MSC-05, MSC-06 status fixtures |
| Truthful update/unchanged language | MSC-02, MSC-07 lifecycle fixtures |
| Shared repository setup card | MSC-05 scaffold fixtures |
| Aggregate integrity and documentation | MSC-08 aggregate verification |

## Revision 3 Verification Commands

```text
node create-agdf/scripts/lifecycle-test.js
node create-agdf/scripts/cli-modularization-test.js
node create-agdf/scripts/smoke-test.js
AGDF_EXPECTED_VERSION="$(node -p \"JSON.parse(require('node:fs').readFileSync('./agdf/package.json', 'utf8')).version\")" node create-agdf/scripts/release-bootstrap-smoke-test.js
node plugin/scripts/check-runtime-integrity.mjs
node create-agdf/bin/create-agdf.js doctor --run installer-output-parity --json
node create-agdf/bin/create-agdf.js gate-check --run installer-output-parity --json
git diff --check
```

No focused or aggregate test may mutate the user's active plugins or real host configuration. Live
host activation/restart remains a separately authorized UAT concern.

## Revision 3 Constraints

- Do not add a second lifecycle renderer, surface registry, locale registry or gate/status evaluator.
- Do not change commands, destructive-operation scope, approval authority, interaction transport or
  host-native operation sequences outside the capture/presentation boundary.
- Do not remove existing JSON fields, project-language behavior, German interaction locale packs or
  compatibility entry points.
- Do not claim a host restart or activation completed from fixture evidence alone.

## Revision 2 Baseline

## Scope

Implement the approved lifecycle contract across CLI routing, surface inspection and mutation,
Success Card/status presentation, repository verification, approval capability truth and the three
existing documentation owners. Preserve current gate authority, compatibility commands, durable
repository state and unrelated working-tree changes.

## Tasks

| task_id | Task | Owner | Evidence / acceptance |
|---|---|---|---|
| IOP-01 | Add the schema-v1 lifecycle result model, invariant validation and localized Success Card/status/failure renderers under the approved lifecycle owner. | agent | Human and JSON output share one model; ordered fields, one next action, explicit unknown and partial-result behavior have focused tests. |
| IOP-02 | Refactor Codex, Claude and OpenCode install handlers to return phase-classified lifecycle evidence and render one Success Card after preserved host output. | agent | Install/update/unchanged/unknown-version fixtures pass; no competing completion summary remains; upstream output is retained. |
| IOP-03 | Correct Claude error classification so executable, marketplace, plugin operation, version and verification failures retain their real phase. | agent | A marketplace Git failure is not reported as a missing Claude executable; original command evidence and one recovery action remain visible. |
| IOP-04 | Add read-only surface probes and the general `status` composition for installation, repository and delivery state using existing doctor/gate-check authority. | agent | Human/JSON fixtures show healthy installation with blocked delivery, missing control state, selected run and ambiguous run without mutation or invented selection. |
| IOP-05 | Register and validate `status`, `disable` and `uninstall` plus `--scope` and `--confirm` in the existing CLI parser/registry/application owners. | agent | Primary help and usage tests pass; unsupported or ambiguous surface/scope pairs fail before mutation; existing invocations remain accepted. |
| IOP-06 | Implement repository-local `disable` planning, ownership preflight, minimal supported opt-out and postcondition verification for supported surfaces. | agent | Default repository scope retains global capability and `.agdf/control`; owned, user-owned, ambiguous and unsupported fixtures are deterministic. |
| IOP-07 | Implement global `uninstall` preview/apply orchestration with explicit surface/scope/confirmation, host-native removal and marker-proven generated-file cleanup. | agent | No-confirm is non-mutating; confirmed plans remove only proven owned state; repository/control/ambiguous files are retained; partial failures are reported honestly. |
| IOP-08 | Strengthen `codex-repo` post-write verification and route completion through the shared Success Card with one truthful remaining host action. | agent | Every planned file and marketplace definition is verified; repository setup and plugin activation remain distinct; no premature healthy claim appears. |
| IOP-09 | Add only the once-per-request read-only request-classification branch after section-level revalidation against `agdf-state-orientation`; reuse its status/narration owners and create no second projection. | agent | English/German contract tests prove one visible orientation for a fresh read-only request, no repeated banner or durable write, and unchanged existing status/narration behavior. |
| IOP-10 | Integrate and document approval capability truth by consuming `agdf-human-decision-surface`; do not modify approval transport metadata, authority or fallback policy in this run. | agent + dependency | Integration tests retain decorated-value rejection and exact-text fallback; docs state capability dependence; AC-05/06 remain dependent on that run's fresh live UAT rather than duplicated implementation. |
| IOP-11 | Reorder root and package onboarding documentation around the current product and primary `@agdf/cli` family; expand INSTALL lifecycle guidance and move compatibility variants under Advanced / Compatibility. | agent | README/INSTALL/package README link and command checks pass; disclaimers remain visible; button claims are capability-dependent. |
| IOP-12 | Sync generated assets, update the three approved Context Graph nodes and run focused plus aggregate regression verification. | agent | Generated sources match canonical assets; context graph reconciliation is resolved; package, release-bootstrap, CLI, interaction, integrity, doctor and whitespace checks pass. |
| IOP-13 | Perform live Codex UAT for approval fallback sequencing and repository install/restart/plugin-activation claims where the host permits. | user + agent | Durable UAT evidence distinguishes host-visible proof from repository projections; unavailable scenarios remain explicit and do not become pass claims. |

## Dependencies And Execution Order

1. `IOP-01` establishes the result/presentation contract used by all later lifecycle work.
2. `IOP-02` and `IOP-03` integrate installers; `IOP-04` builds read-only status from their probes.
3. `IOP-05` exposes the command surface after contracts exist.
4. `IOP-06` and `IOP-07` implement mutations using the same probes and result model; they must not
   precede ownership and preview tests.
5. `IOP-08` integrates repository setup independently of global removal.
6. `IOP-09` is section-scoped and may proceed only after revalidation against the completed
   `agdf-state-orientation` changes. `IOP-10` is dependency/integration work only; the active
   `agdf-human-decision-surface` run remains the sole owner of approval transport and fallback policy.
7. `IOP-11` documents only implemented, verified behavior.
8. `IOP-12` closes repository evidence; `IOP-13` supplies host-visible evidence after QA readiness.

## Acceptance Matrix

| PRD acceptance | Planned evidence |
|---|---|
| AC-01 ordered install/update Success Card | IOP-01, IOP-02 tests |
| AC-02/03 separated installation, repository and delivery state | IOP-04 human/JSON fixtures |
| AC-04 read-only orientation once and non-mutating | IOP-09 contract/integration tests |
| AC-05/06 capability-dependent native control and exact approval | IOP-10 integration regression plus linked `agdf-human-decision-surface` fresh live UAT; this run cannot independently close the host-visible claim |
| AC-07 primary CLI hierarchy with compatible secondary forms | IOP-05, IOP-11 usage/link tests |
| AC-08 repository disable safety | IOP-06 ownership/postcondition fixtures |
| AC-09 global uninstall safety | IOP-07 preview/confirmation/retention fixtures |
| AC-10 `codex-repo` automation and truthful manual remainder | IOP-08 tests plus IOP-13 live UAT |
| AC-11 phase-correct failures | IOP-02, IOP-03 adapter fixtures |
| AC-12 deterministic lifecycle coverage | IOP-01 through IOP-10 focused suites |
| AC-13 aggregate integrity | IOP-12 verification record |

## Verification Commands

The implementation phase must select the smallest existing focused test commands discovered during
Brownfield Analysis, then include these aggregate owners where applicable:

```text
node create-agdf/scripts/sync-package-assets.js
node create-agdf/scripts/smoke-test.js
node create-agdf/scripts/release-bootstrap-smoke-test.js
node plugin/scripts/check-runtime-integrity.mjs
npx --yes @agdf/cli@latest doctor --run installer-output-parity --json
npx --yes @agdf/cli@latest gate-check --run installer-output-parity --json
git diff --check
```

Tests requiring temporary home/config state must use isolated fixtures and must not change the
user's installed plugins or real host configuration. Live host mutation is reserved for explicit UAT
scope and authorization.

## Constraints

- Do not create a second gate evaluator, approval adapter, plugin manager, version source or docs
  owner.
- Do not delete `.agdf/control`, repository plugin files, source documents, user-authored or
  ambiguously owned configuration.
- Do not alter gate order, approval formulas, existing evaluator authority or compatibility entry
  points.
- Do not modify approval transport metadata, native-attempt policy or fallback authority owned by
  `agdf-human-decision-surface`; consume its contract and preserve its UAT status.
- Do not create a second status/narration projection beside `agdf-state-orientation`.
- Do not claim host-visible native buttons, restart completion or plugin activation from repository
  tests alone.
- Keep unrelated working-tree changes isolated and do not commit, push, publish, reinstall the
  active plugin or open a PR without a separate user request.

## Required Review Path

After exact TP approval, run the mandatory pre-implementation Brownfield Analysis. If it passes
without reopening product or design gates, execute CD+Tests task-by-task. Then run Task Plan Review,
Clean Implementation Review, Code Review and QA Gate. Live UAT follows QA readiness; Delivery
Closeout and OR follow the resulting evidence.

## Traceability

- product contract: `UR.md`, `PRD.md`
- brownfield sizing: `BROWNFIELD_REVIEW.md`
- solution contract: `SD.md`
- CLI owners: `create-agdf/lib/cli/`
- lifecycle and surface owners: `create-agdf/lib/lifecycle/`, `create-agdf/lib/installers/`,
  `create-agdf/lib/scaffold/`
- delivery authority: `create-agdf/lib/control-evaluation/`
- interaction authority: `create-agdf/lib/interaction-presentation.js`,
  `plugin/meta/contracts/interaction.md`, `plugin/meta/agdf-plugin.definition.json`
- documentation owners: `README.md`, `INSTALL.md`, `create-agdf/README.md`
- context graph refs: `CG-NATIVE-INTERACTION-AUTHORITY`,
  `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-RUN-STATUS-CARD`

## Approval

- `Approval: SD` provided on `2026-07-16`.
- Revision 1 received `Approval: TP` on `2026-07-16` and was superseded by the Brownfield ownership finding.
- Revision 2 received exact `Approval: TP` on `2026-07-16` after same-run, same-gate and artefact revalidation.
