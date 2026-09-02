# Task And Test Plan: Release-Owned Historical Profile Compatibility

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` accepted on 2026-09-02 after same-run, TP-gate, durable
Revision 9 and revision_id `2B83E2C1-3523-4D19-AD03-C1DD27F42B67` revalidation
Revision: 9
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`
Based on: approved PRD Revision 4 and approved SD Revision 5

## 1. Delivery Boundary

Retain the implemented exact release-owned compatibility catalogue and migration behavior. Complete
the already implemented full-history checkout correction for every CI job that runs release
validation.

Close the 0.14.4 release-process gap through one repository-only transactional bump owner. Preserve
the existing maintainer interface `npm run set-version -- <version>` and its semver and npm
publication preflight. Replace the current incremental mutation body with delegation to the focused
owner. The owner updates every canonical source-version surface and the exact current catalogue entry
from one shared target inventory.

An unchanged semantic profile contract is reused automatically. A changed contract performs zero
writes until a second deliberate invocation supplies the freshly recomputed exact contract digest.
The current source version is allowed before its tag exists; every historical record still requires
its exact tag. A bounded same-version mode may repair only the observed 0.14.4 state in which all
canonical source versions already agree and only the exact catalogue record is absent.

The multi-file transaction uses same-directory staged files, exact backups and a bounded
repository-local recovery journal. A later invocation restores an interrupted owned transaction
before considering a new plan. This is recoverable application-level atomicity, not a claim of one
filesystem-wide atomic primitive.

Do not add runtime Git/network access, semver/subset inference, automatic support retirement, real
host/cache mutation, publication, tagging or VCS delivery.

Revision 9 additionally removes duplicate local source-digest ownership. One immutable generated-
plugin snapshot supplies the exact source digest, Codex local version, staged bytes and provenance.
The existing strict local-version format, public commands, marketplace layout, ownership and
provenance schemas, and host lifecycle remain unchanged.

After exact `Approval: TP`, Brownfield Analysis Revision 8 in `pre_implementation_analysis` mode must
confirm that all Revision 9 stop conditions are resolved before implementation begins.

## 2. Task List

| task_id | Task | Required evidence |
|---|---|---|
| CAT-T01 | Run Brownfield Analysis Revision 7 against the existing root command, profile-history, version-coherence, filesystem transaction and workflow owners. | Pass only when the existing entry point delegates to one owner and every journal/backup path is authorized. |
| CAT-T02 | Retain the canonical catalogue, exact historical classification and generated/package projection already implemented under prior approved revisions. | Existing catalogue and migration matrices remain green without a second compatibility source. |
| CAT-T03 | Export one canonical version-surface inventory from release coherence, distinguishing writable canonical sources from generated evidence. | Coherence reads and bump writes share target definitions; every writable target matches exactly once and begins at the common source version. |
| CAT-T04 | Implement one pure bump planner and catalogue updater. | Invalid version, skewed/missing target, duplicate release and incomplete plan reject before writes. |
| CAT-T05 | Preserve the root `set-version` entry point and npm publication preflight while delegating mutation to the focused owner. | Invalid semver and already-published versions perform zero writes; no second mutation implementation remains. |
| CAT-T06 | Reuse identical profile contracts automatically and require exact fresh-digest acceptance for changed contracts. | First changed-contract invocation performs zero writes; missing, wrong and stale digest reject; exact digest adds one canonical contract and release. |
| CAT-T07 | Implement same-directory staging, exact backups, bounded journal validation, rollback and interrupted-run recovery. | Injected failures and materialized interrupted journals restore every original byte; malformed or escaping recovery evidence touches no undeclared path. |
| CAT-T08 | Distinguish current pre-tag evidence from historical tag evidence in release validation. | Untagged current source passes with exact current record; present current tag must match; after advancing, the former current tag is mandatory. |
| CAT-T09 | Reconcile the existing coherent 0.14.4 source surfaces by adding only their exact catalogue record. | Same-version repair accepts only the observed omission shape and does not advance to 0.14.5. |
| CAT-T10 | Retain the three bounded full-history workflow checkouts. | Every job invoking `release:prepare` directly or through `smoke-test` has tags and `origin/main`. |
| CAT-T11 | Replace manual catalogue-bump documentation with the stable automatic command and explicit changed-contract review flow. | No competing manual procedure, implicit retirement or publication authority. |
| CAT-T12 | Run focused and aggregate verification, then update CD+Tests, mandatory reviews, Context Graph and QA. | Complete evidence chain with no inferred CI, publication or live-host evidence. |
| CAT-T13 | Move local source-identity derivation from orchestration into the existing marketplace preparation owner. | `install-local-plugin.js` selects only surface/profile and does not compute or pass a second digest-derived Codex version. |
| CAT-T14 | Capture and validate one immutable local-build snapshot before the marketplace transaction. | Pre-source, snapshot and post-source normalized digests match; one descriptor supplies canonical version, profile, digest and per-surface versions. |
| CAT-T15 | Fail closed when generated source changes during snapshot capture. | Return `local_install_source_unstable`, remove only the owned snapshot and perform no marketplace swap or host call. |
| CAT-T16 | Add deterministic stable-source, injected source-change, cleanup and regression evidence. | Exact Codex local identity remains content-bound; Claude/Copilot remain canonical; existing marketplace, lifecycle and aggregate suites do not weaken. |

## 3. Approved Implementation Paths

TP Revision 8 implementation may change only:

- `plugin/meta/distribution-profile-history.json`;
- `create-agdf/lib/runtime/distribution-profile-history.js` only to export existing canonical digest
  helpers required by the planner without changing runtime classification;
- `create-agdf/lib/release/profile-history.js`;
- new `create-agdf/lib/release/version-bump.js`;
- `create-agdf/lib/release/version-coherence.js` for one reusable source/generated surface inventory;
- new `create-agdf/scripts/release-bump.js`;
- new `create-agdf/scripts/release-bump-test.js`;
- `create-agdf/scripts/release-version-coherence-test.js`;
- `create-agdf/package.json` for `release:bump`, focused test and aggregate wiring;
- existing `scripts/set-version.mjs`, reduced to input/preflight handling and delegation;
- root `package.json` only if a mechanical script-delegation adjustment is required;
- generated outputs produced by existing synchronization scripts;
- `create-agdf/lib/installers/local-marketplace.js`, limited to the immutable local-build snapshot,
  single identity descriptor and pre-transaction unstable-source rejection approved by SD Revision 5;
- `create-agdf/scripts/install-local-plugin.js`, limited to removing caller-side digest/version
  derivation and delegating to the snapshot owner;
- `create-agdf/scripts/local-development-install-test.js` and directly corresponding marketplace
  tests for stable snapshot, injected source mutation, cleanup and no-host-call evidence;
- `RELEASE.md`, `CONTRIBUTING.md` and `create-agdf/README.md` only for the automatic release path;
- `.github/workflows/agdf-guardrails.yml`, `.github/workflows/publish-create-agdf.yml` and
  `.github/workflows/publish-agdf.yml`, limited to the already implemented checkout history change;
- transient `.agdf/release-bump-transaction.json` plus journal-declared same-directory staged and
  backup files during command execution only. Tests use temporary repositories. Successful or
  recovered execution leaves none behind;
- this run's control artefacts, backlog/projection and `.agdf/control/CONTEXT_GRAPH.md`.

Stop and revise SD before changing public installer commands, the strict Codex local-version format,
marker/provenance schema, runtime classification, cache authority, stable/backup swap authority,
host activation behavior or unrelated runs.

## 4. Stable Failure And Evidence Contract

| reason | Trigger | Required behavior |
|---|---|---|
| `profile_history_current_release_mismatch` | Current source and exact current record differ | Block release preparation. |
| `profile_history_tag_mismatch` | Required historical or present-current tag evidence differs or is unavailable | Block release preparation. |
| `profile_history_continuity_break` | Prior supported release or contract changed or disappeared | Block release preparation. |
| `profile_history_contract_review_required` | Changed target profiles lack the exact freshly proposed digest | Return exact digest and perform zero writes. |
| `release_version_bump_invalid` | Version, source inventory, same-version shape or planned state is invalid | Reject before mutation. |
| `release_version_bump_write_failed` | Staging, replacement or post-write validation fails | Restore every declared original byte and retain actionable failure evidence. |
| `release_version_bump_recovery_required` | A valid incomplete prior journal is found | Restore originals, remove owned transaction files and require a fresh invocation. |
| `release_version_bump_recovery_invalid` | Journal or backup evidence is malformed, escaping, symlinked or incomplete | Fail closed without touching undeclared paths. |
| `local_install_source_unstable` | Normalized source bytes differ before/after snapshot or from the snapshot | Clean the owned snapshot; perform no marketplace or host mutation. |

## 5. Deterministic Test Matrix

| test_id | Scope | Blocking assertions |
|---|---|---|
| CAT-INVENTORY | Shared targets | Read/write targets are unique, exact and coherent; generated surfaces remain read-only evidence. |
| CAT-BUMP-SAME | Unchanged contract | Normal forward bump updates all sources and appends one exact record. |
| CAT-BUMP-REPAIR | 0.14.4 repair | Exact same-version omission is repaired; any other same-version skew rejects. |
| CAT-BUMP-CHANGED | Changed contract | First call writes nothing; only an exact fresh digest permits one new contract. |
| CAT-BUMP-PREFLIGHT | Existing entry point | Invalid semver and published version reject before mutation; root command delegates once. |
| CAT-BUMP-ROLLBACK | Controlled failure | Failures before and during replacement restore byte-identical originals and owned cleanup state. |
| CAT-BUMP-RECOVERY | Interrupted process | Valid journal recovers before planning; invalid/escaping/symlink evidence fails closed. |
| CAT-PRETAG | Tag authority | Untagged current passes, present current tag must match and former current tag becomes mandatory after bump. |
| CAT-CONTINUITY | Historical policy | Missing/changed prior record, tag mismatch and generated drift block release preparation. |
| CAT-CI-HISTORY | GitHub Actions | All release-validation jobs use complete history; unrelated jobs remain unchanged. |
| CAT-REGRESSION | Existing behavior | Catalogue, marketplace, package, lifecycle, Runtime Integrity and both smoke suites remain green. |
| CAT-LOCAL-STABLE | Stable generated plugin source | One snapshot digest produces the exact expected Codex local version and the same staged/provenance identity. |
| CAT-LOCAL-UNSTABLE | Injected source mutation during capture | Stable typed failure, owned cleanup and zero marketplace/host mutation. |
| CAT-LOCAL-SURFACES | Surface identity strategies | Codex remains digest-qualified; Claude and Copilot retain the canonical version without a universal version fallback. |

Repository/tag tests remain read-only. Mutation tests use temporary repository fixtures and injected
filesystem/npm adapters. Installed runtime never invokes Git or the bump owner.

## 6. Verification Commands

```text
npm --prefix create-agdf run test:release-bump
npm --prefix create-agdf run test:distribution-profile-history
npm --prefix create-agdf run test:release-version-coherence
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix pages run build
node create-agdf/bin/create-agdf.js doctor --dir . --run legacy-profile-upgrade-recovery --json
node create-agdf/bin/create-agdf.js gate-check --dir . --run legacy-profile-upgrade-recovery --json
node create-agdf/bin/create-agdf.js delivery-map --dir . --run legacy-profile-upgrade-recovery --json
git diff --check
```

Validate edited workflow YAML and exact `fetch-depth: 0` coverage. A rerun of the failed GitHub
Actions job remains the authoritative Linux CI evidence. Do not contact npm in deterministic tests,
advance beyond 0.14.4, install a real plugin, mutate a real cache, tag or publish.

## 7. Brownfield Stop Conditions

Brownfield Analysis Revision 7 must block implementation if:

- the root command cannot delegate without retaining a second mutation implementation;
- source reads and writes cannot share one target inventory;
- complete target bytes cannot be validated before the first destination replacement;
- the recovery journal can reference absolute, escaping, symlinked or undeclared paths;
- interrupted recovery cannot complete before new planning;
- same-version repair would normalize any state beyond the exact 0.14.4 catalogue omission;
- current-source and historical-tag authority cannot be separated without accepting an untagged
  historical release; or
- implementation requires an unapproved path or public contract change;
- snapshot capture cannot prove pre-source, snapshot and post-source equality;
- identity derivation requires accepting an arbitrary local suffix or changing the existing
  marker/provenance schema;
- the unstable-source path could reach the stable marketplace swap or a host call; or
- the implementation introduces a second snapshot, digest or transaction owner.

## 8. Evidence Plane Boundary

- Temporary fixtures prove planning, transaction, rollback and recovery behavior.
- Local tags prove repository history authenticity.
- Generated/package tests prove catalogue delivery.
- Workflow structure proves checkout configuration, not a successful remote run.
- None proves npm publication, a native-Windows upgrade, restart or fresh-session loading.

## 9. Required Execution Sequence

1. Persist exact TP Revision 9 approval.
2. Run and pass Brownfield Analysis Revision 8 against the snapshot and existing marketplace owners.
3. Implement CAT-T13 through CAT-T15 without changing public or persisted contracts.
4. Run CAT-LOCAL-STABLE, CAT-LOCAL-UNSTABLE and CAT-LOCAL-SURFACES first.
5. Rerun the existing local marketplace, lifecycle, Runtime Integrity and release matrices.
6. Rerun complete create-agdf smoke using an isolated npm cache and the affected remote workflow.
7. Persist revised CD+Tests and run Task Plan, Clean Implementation and Code Review.
8. Rerun QA; do not request UAT while any evidence gap remains.

## 10. Out Of Scope

- 0.14.5 or later release creation.
- Semver-range, subset or heuristic compatibility.
- Automatic catalogue pruning or deprecation.
- Runtime Git/npm/network lookup.
- New provenance or marker schema.
- Real host/cache mutation, commit, push, tag, publication or release.
- Repair of unrelated baseline defects.
- Generic acceptance of arbitrary SemVer build metadata or replacement of explicit surface identity
  strategies with one universal local version.

## 11. Next Step

Run Brownfield Analysis Revision 8. Only its `pass` decision permits implementation within Section 3.
QA/UAT approval, host/cache mutation, VCS, tagging and publication remain unauthorized.
