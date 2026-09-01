# Task And Test Plan: Release-Owned Historical Profile Compatibility

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` accepted on 2026-09-01 after same-run, TP-gate, durable
Revision 5 and run revision_id `70AA61D1-23F1-496C-9335-178116DAFEF2` revalidation
Revision: 5
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved PRD Revision 4 and approved SD Revision 3

## 1. Delivery Boundary

Replace the incident-specific JavaScript history entry with a canonical packaged per-release catalogue,
backfill exact coherent profile-bearing releases `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2`
and `0.14.3`, reject the internally version-incoherent `agdf-v0.14.0` tag, integrate exact lookup into
the existing migration-only provenance path and make release preparation enforce catalogue
completeness and continuity.

Preserve the already implemented canonical rebuild, Claude Windows recovery, lifecycle guidance and
all current validation behavior. Do not add runtime Git/network access, semver/subset inference,
automatic support retirement, real host/cache mutation, publication or VCS delivery.

After exact `Approval: TP`, a new Brownfield Analysis Revision 4 in `pre_implementation_analysis`
mode must pass for TP Revision 5 before code changes begin.

## 2. Task List

| task_id | Task | Required evidence |
|---|---|---|
| CAT-T01 | Capture the current implementation baseline and run Brownfield Analysis Revision 4 for TP Revision 5 across profile, provenance, generator, package and release owners. | `BROWNFIELD_ANALYSIS.md` Revision 4 with pass/revise/block and exact reuse/path map. |
| CAT-T02 | Add canonical `plugin/meta/distribution-profile-history.json` with schema 1, deduplicated exact contracts and release records for `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2` and `0.14.3`. | Every record matches its exact local release tag; `agdf-v0.14.0` is rejected for internal version mismatch; deterministic digests and sort order pass. |
| CAT-T03 | Add the focused runtime history module for schema validation, canonical digest computation and exact version/contract classification. | Positive catalogue matrix plus unknown key/schema/status/reference/digest/version/shape negatives. |
| CAT-T04 | Replace the hard-coded historical JavaScript registry with catalogue consumption in migration-only provenance inspection. Keep current validation first and unchanged. | Current callers reject old shape; historical lookup is unreachable without explicit migration purpose. |
| CAT-T05 | Generalize marketplace migration fixtures for exact `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1` rebuilds and ordinary current-shape `0.14.2`–`0.14.3` behavior. | Canonical-only stages, exact rollback, host-order/registration and tamper matrices pass for each distinct contract family. |
| CAT-T06 | Add release-history continuity validation and wire it into `release:prepare`. Validate current source snapshot, generated parity, all supported local release tags and the explicit `agdf-v0.14.0` mismatch. | Missing/changed prior record, missing current record, incoherent tag, tag mismatch, duplicate/dangling entry and generated drift block release preparation. |
| CAT-T07 | Ensure canonical builders copy the catalogue into shared/Copilot generated plugins, runtime package projections and package inventory without a second source. | Byte-identical canonical/generated/package copies and deterministic rebuild. |
| CAT-T08 | Update installation, contributor and release documentation with the proactive snapshot procedure and explicit deprecation boundary. | No runtime Git/network instruction, permissive compatibility or implicit retirement claim. |
| CAT-T09 | Run focused suites, release preparation, package checks, Runtime Integrity and full smoke without weakening or skipping assertions. | Commands in Section 6 pass, or unrelated baseline failures remain separately evidenced and non-successful. |
| CAT-T10 | Persist revised CD+Tests and rerun Task Plan, Clean Implementation and Code Review; reconcile Context Graph and QA without inferring live-host evidence. | Complete artefact chain and normalized finding disposition. |

## 3. Approved Implementation Paths

TP Revision 5 implementation may change only:

- new `plugin/meta/distribution-profile-history.json`;
- new `create-agdf/lib/runtime/distribution-profile-history.js`;
- `create-agdf/lib/runtime/plugin-provenance.js`;
- `create-agdf/lib/installers/local-marketplace.js` only for catalogue-backed evidence/classification;
- new `create-agdf/lib/release/profile-history.js`;
- `create-agdf/lib/release/version-coherence.js` only for composition with history validation;
- `create-agdf/scripts/release-version-coherence-test.js`;
- `create-agdf/scripts/sync-package-assets.js` or its existing builder dependencies only if canonical
  metadata is not already copied generically;
- `plugin/meta/copilot-payload-baseline.json` only for the reviewed one-file catalogue increase and
  measured bytes, with no unrelated capacity increase;
- `create-agdf/scripts/local-marketplace-test.js`;
- at most one new focused `distribution-profile-history-test.js`;
- `create-agdf/package.json` for focused/aggregate test wiring;
- canonical generated outputs produced by existing scripts;
- `INSTALL.md`, `CONTRIBUTING.md`, `RELEASE.md` and `create-agdf/README.md`;
- this run's control artefacts, backlog/projection and `.agdf/control/CONTEXT_GRAPH.md`.

The already changed Claude cache, installer retry, lifecycle and CLI owners may be touched only if
catalogue regression tests expose a direct integration defect. Stop and revise SD before changing any
public command, marker/provenance schema, cache authority, marketplace transaction or unrelated run.

## 4. Stable Failure And Evidence Contract

| reason/evidence | Trigger | Required behavior |
|---|---|---|
| `profile_history_invalid` | Catalogue schema, reference or recomputed digest fails | Current healthy validation remains available; historical migration blocks before mutation. |
| `historical_contract_unsupported` | Exact installed version has no supported release record | Preserve root; no stage/host/cache action. |
| `historical_contract_invalid` | Version exists but complete observed contract differs | Preserve root; no normalization or fallback. |
| `profile_history_current_release_mismatch` | Current source definition and current record differ | Block release preparation. |
| `profile_history_tag_mismatch` | Backfilled record differs from exact release tag | Block release preparation and migration support claim. |
| `profile_history_continuity_break` | Prior profile-bearing tag record is missing or changed | Block release preparation. |
| Existing ownership/provenance/digest reason | Independent installed authority fails | Preserve root; catalogue match grants no exception. |
| `marketplace_recovery:owned_supported_historical_rebuild` | Exact historical root enters rebuild | Record exact release, contract and entry digests without claiming loaded-session state. |

## 5. Deterministic Test Matrix

| test_id | Scope | Blocking assertions |
|---|---|---|
| CAT-SCHEMA | Catalogue schema | Exact schema/keys/types/order/references/digests; all malformed variants reject. |
| CAT-TAGS | Release backfill | Definitions in tags for `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2` and `0.14.3` match exact release records; `agdf-v0.14.0` fails for internal version mismatch. |
| CAT-CURRENT | Current source | Current definition/version has exactly one matching catalogue record and current validator remains first. |
| CAT-HIST | Old contract | `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1` independently match the four-profile contract only. |
| CAT-CURRENT-HISTORY | Current contract history | `0.14.2` and `0.14.3` records match but ordinary installed roots stay on current-shape path. |
| CAT-NEG | Closed policy | Unknown version, range-like version, altered/missing/extra profile/key, wrong digest and dangling contract all reject. |
| CAT-AUTHORITY | Installed evidence | Every ownership/provenance/manifest/source/runtime/plugin digest mutation blocks before stage/host calls. |
| CAT-TRANSACTION | Rebuild | Every old version uses canonical-only stage, exact backup rollback and successful commit. |
| CAT-CONTINUITY | Release lifecycle | Missing/changed prior or current entry, tag mismatch and generated drift block `release:prepare`. |
| CAT-PACKAGE | Distribution | Source/generated/package copies are byte-identical and included in existing payload digests/inventory. |
| CAT-REGRESSION | Revision 1 behavior | Cache one-retry, previous-plugin rollback and restart/fresh-session tests remain green. |
| CAT-CONTROL | Governance | Changed paths stay approved; doctor/gate state and revised evidence are coherent. |

Release-tag tests use read-only `git show` through an injected executor where possible and require the
local tags in repository release/CI context. Unit tests use embedded exact tag fixtures so normal npm
package tests do not require `.git`. Installed runtime never invokes Git.

## 6. Verification Commands

```text
npm --prefix create-agdf run test:distribution-profile-history
npm --prefix create-agdf run test:release-version-coherence
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:claude-cache-recovery
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run release:prepare
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
node create-agdf/bin/create-agdf.js doctor --dir . --run legacy-profile-upgrade-recovery --json
node create-agdf/bin/create-agdf.js gate-check --dir . --run legacy-profile-upgrade-recovery --json
node create-agdf/bin/create-agdf.js delivery-map --dir . --run legacy-profile-upgrade-recovery --json
git diff --check
```

If the focused test is integrated into an existing registered suite, use that package script and record
the mapping. Do not install a real plugin, delete a real cache entry, contact a registry or publish.

## 7. Brownfield Analysis Stop Conditions

TP Revision 5 Brownfield Analysis Revision 4 must block implementation if:

- canonical plugin metadata is not copied generically and a second bespoke generator would be needed;
- exact supported release-tag definitions and explicit `agdf-v0.14.0` incoherence cannot be established;
- a release record cannot be bound to the existing source/plugin digest chain;
- historical lookup would leak into current runtime/generated validation;
- release continuity would require Git or network access during installation;
- prior-entry retirement cannot fail closed;
- package tests would require a `.git` directory for ordinary consumers; or
- implementation requires an unapproved path or public schema change.

## 8. Evidence Plane Boundary

- Embedded fixtures prove deterministic parser/classifier behavior.
- Local tag comparison proves repository backfill authenticity.
- Generated/package tests prove delivery of the catalogue.
- Temporary marketplace tests prove transaction behavior.
- None proves public npm publication, a real native-Windows upgrade, app restart or fresh-session
  loading.

Revision 1 direct-host obligations remain open and separate. Catalogue implementation does not
authorize or satisfy them.

## 9. Required Execution Sequence

1. Persist exact TP Revision 5 approval.
2. Run and pass Brownfield Analysis Revision 4.
3. Implement canonical catalogue and pure history validator.
4. Replace hard-coded runtime registry and extend migration matrices.
5. Implement release continuity and generated/package parity.
6. Update directly affected docs.
7. Run focused then aggregate verification.
8. Persist revised CD+Tests and mandatory reviews.
9. Rerun QA; do not request UAT while any evidence gap remains.

## 10. Out Of Scope

- Semver range, "older than", subset or heuristic compatibility.
- Releases before the profile-bearing/provenance-supported lineage.
- Automatic catalogue pruning or deprecation.
- Runtime Git, GitHub, npm or network lookup.
- A new provenance/marker schema.
- General cache management or changes to the bounded Claude algorithm.
- Real host mutation, publication, release, commit, push or pull request.
- Repair of unrelated baseline test defects unless separately authorized by their owning run.

## 11. Next Step

Review Task and Test Plan Revision 5. Approve only with:

`Approval: TP`

Approval permits TP Revision 5 pre-implementation Brownfield Analysis Revision 4 and, only after it passes,
implementation within Section 3. It does not authorize real host/cache mutation, QA approval, UAT,
publication, release or VCS actions.
