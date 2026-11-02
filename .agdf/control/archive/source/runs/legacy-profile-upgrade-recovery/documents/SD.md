# Solution Design: Release-Owned Historical Profile Compatibility

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` accepted on 2026-09-02 after same-run, SD-gate, durable
Revision 5 and run revision_id `0BF255D2-4F89-4C2C-B179-88A13E4A32E0` revalidation
Revision: 5
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`
Based on: approved PRD Revision 4

## 1. Design Summary

Replace the incident-specific in-code `0.13.8` registry with one canonical, checked-in,
machine-readable compatibility catalogue. Every profile-bearing AGDF release has an exact release
record that references one immutable semantic contract and binds the provenance schema, profile
identity and deterministic entry digest.

The catalogue is copied into every generated runtime-bearing plugin and included in existing source
and plugin digests. Installation never queries Git, GitHub, npm or tags. The current package can
therefore classify an installed root entirely from packaged policy plus the root's existing ownership,
provenance, manifests and digests.

Normal current validation stays unchanged. Existing-root migration asks the catalogue only after
current validation fails. A match requires an exact release version and exact semantic contract; no
range, subset or normalization path exists. Eligible roots continue through the already implemented
`owned_supported_historical_rebuild` classification and unchanged canonical transaction.

Release preparation validates catalogue continuity. It proves each backfilled release record against
the matching local release tag, proves the current definition against its current-version record and
rejects removal or mutation of previously supported records. Explicit retirement requires separately
reviewed compatibility metadata; there is no automatic pruning.

The bounded Claude Windows cache recovery and restart-plus-fresh-session lifecycle behavior from
Revision 1 remain unchanged.

Revision 4 replaces the manual current-release snapshot step with one internal, transactional
version-bump owner. It updates every canonical version surface and the exact current catalogue entry
as one validated change. Existing historical entries remain immutable. An unchanged semantic profile
contract is reused automatically; a changed contract fails before mutation and requires an explicit
reviewed contract-digest acceptance on a subsequent invocation.

Revision 5 closes the local-install source-identity race exposed by the aggregate smoke run. Local
installation takes one validated immutable build snapshot, derives every surface identity from that
snapshot exactly once and stages only those same bytes. The strict Codex
`<canonical>+codex.local-<digest>` identity remains unchanged; arbitrary local versions are not
accepted. A source tree that changes while the snapshot is captured fails with a precise unstable-
source result instead of being misreported as an invalid local release version.

## 2. Canonical Catalogue

Canonical source:

`plugin/meta/distribution-profile-history.json`

Schema:

```json
{
  "schema_version": 1,
  "contracts": {
    "shared-runtime-profile-v1": {
      "distribution_profiles": {},
      "contract_digest": "sha256"
    }
  },
  "releases": {
    "0.13.6": {
      "contract_id": "shared-runtime-profile-v1",
      "provenance_schema_version": 1,
      "profile_id": "runtime-plugin",
      "entry_digest": "sha256",
      "status": "supported"
    }
  }
}
```

Rules:

- `schema_version` is exactly `1`.
- Contract and release keys are unique and lexically sorted by canonical serialization.
- `distribution_profiles` stores the complete semantic object from the released plugin definition.
- `contract_digest` is SHA-256 over canonical JSON of only `distribution_profiles`.
- `entry_digest` is SHA-256 over canonical JSON of version, contract ID, contract digest, provenance
  schema version, profile ID and status.
- Each release references exactly one existing contract.
- Duplicate semantic contracts share one contract record, while each exact release retains its own
  signed-by-digest release record.
- `status` is initially only `supported`. A later retirement schema requires a separately approved
  design and cannot be inferred by deleting a record.
- Unknown keys, schemas, statuses, digest formats or dangling references fail validation.

Initial records cover exact coherent profile-bearing releases `0.13.6`, `0.13.7`, `0.13.8`,
`0.14.1`, `0.14.2` and `0.14.3`. Releases through `0.14.1` reference the pre-Copilot four-profile
contract. `0.14.2` and `0.14.3` reference the five-profile contract and use the normal current-shape
path today while remaining durable predecessor evidence for a future schema change.

`agdf-v0.14.0` is verified as an explicit negative: its plugin definition, package and Codex manifest
identify `0.13.8`, so it cannot authorize a `0.14.0` catalogue record. Release verification reports
the tag/version mismatch without aliasing or inferring compatibility.

## 3. Ownership And Data Flow

| Concern | Owner | Responsibility |
|---|---|---|
| Catalogue policy | `plugin/meta/distribution-profile-history.json` | Exact supported release-to-contract records |
| Catalogue parsing/digests | new `create-agdf/lib/runtime/distribution-profile-history.js` | Canonical JSON projection, schema validation and exact lookup |
| Current profile validation | `create-agdf/lib/runtime/plugin-provenance.js` | Preserve `validateDistributionProfiles()` unchanged |
| Migration classification | `plugin-provenance.js` | Ask the validated catalogue only for an otherwise non-current existing root |
| Release continuity | new `create-agdf/lib/release/profile-history.js` plus existing release coherence test | Verify source, generated copies, exact tags and append-only support |
| Version bump transaction | new focused release module and repository-only script, exposed through one `release:bump` package script | Plan, validate and atomically update version surfaces plus the exact current catalogue snapshot |
| Package projection | existing canonical build/sync owners | Copy catalogue as ordinary canonical plugin metadata |
| Marketplace rebuild | `local-marketplace.js` | Reuse current provenance checks and unchanged atomic transaction |
| Local build snapshot and surface identity | `local-marketplace.js` | Capture and validate one immutable source snapshot, derive the source digest and surface versions once, and feed the existing marketplace transaction from those exact bytes |
| Local install orchestration | `scripts/install-local-plugin.js` | Select the surface/profile and delegate identity derivation to the snapshot owner; never precompute a second source digest |
| Host sequencing/recovery | `plugin-installers.js` and `claude-cache-recovery.js` | No catalogue policy; retain bounded retry and rollback |
| Lifecycle guidance | `lifecycle/result.js` | No change from Revision 1 |

```text
release source definition ----+
                               +--> release continuity validator --> publish allowed/blocked
canonical history catalogue ---+
             |
             +--> generated plugin metadata --> existing source/plugin digests
                                             |
installed root --> current validator --------+--> current path
             |
             +--> exact release lookup --> exact contract compare
                                          +--> no match: preserve and block
                                          +--> match: existing provenance/digest checks
                                                      |
                                                      v
                                     owned_supported_historical_rebuild
                                                      |
                                                      v
                                     existing canonical atomic transaction
```

## 4. Runtime Classification

The history module exports only:

```text
validateDistributionProfileHistory(catalogue)
classifyHistoricalDistributionProfile({ catalogue, version, distributionProfiles })
canonicalDistributionProfileDigest(distributionProfiles)
```

Classification returns:

```text
status: matched | unsupported | invalid
reason: stable reason
release_version: exact version | null
contract_id: exact id | null
contract_digest: digest | null
entry_digest: digest | null
```

Algorithm:

1. Validate the complete catalogue schema and every recomputed digest.
2. Require the observed version to be an exact release key.
3. Resolve exactly one contract ID.
4. Recompute the observed semantic contract digest.
5. Require both digest equality and exact deep structural equality.
6. Return the immutable release and contract identity.

`validateDistributionProfiles()` remains the first and only current-contract authority. The historical
lookup is invoked only by installed-root migration inspection with
`allowHistoricalProfilesForMigration: true`. Generated repositories, current target stages, local
validator health and ordinary runtime resolution never receive that option.

## 5. Release Continuity

`assertDistributionProfileHistory()` runs inside `release:prepare` after canonical asset synchronization.
It validates:

1. canonical catalogue schema and internal digests;
2. the current source definition has exactly one release record for its exact version;
3. that record resolves to a contract exactly equal to the current source definition;
4. generated shared and Copilot runtime-bearing copies equal the canonical catalogue byte-for-byte;
5. each initial supported record equals the definition in its exact local `agdf-v<version>` tag;
6. `agdf-v0.14.0` remains rejected while its internal version surfaces identify `0.13.8`;
7. no previously supported release record is absent or altered relative to the merge-base/default
   branch catalogue when that baseline is available; and
8. every internally version-coherent profile-bearing release in the configured supported lineage has
   a record, while incoherent tags fail visibly.

Checks 1–4 are deterministic package requirements and always run. Tag/baseline checks run in repository
release/CI context and fail visibly when required evidence is unavailable; installed runtime does not
run them.

Future release procedure:

1. Run the single repository-only bump command with the exact target version.
2. The command reads the canonical current `distributionProfiles`, reuses an identical existing
   contract and computes the new release-entry digest automatically.
3. If no identical contract exists, the first invocation makes no writes and returns
   `profile_history_contract_review_required` with the proposed exact digest. A second deliberate
   invocation must carry that exact digest before a new contract and release entry are written.
4. The command plans every version and catalogue edit in memory, validates the complete target state,
   then commits the files atomically; any validation/write failure restores the original bytes.
5. Canonical generation and release preparation run after the transaction. Publication remains a
   separate explicit action.

### 5.1 Pre-Tag And Tag Evidence

- The current source version is authoritative before its tag exists. Its catalogue entry must exactly
  match the current source definition and does not require a tag during branch/PR preparation.
- Every non-current supported release record requires its exact `agdf-v<version>` tag.
- If the current tag is present, it must also match exactly.
- A tag-triggered publication validates the current tag because checkout includes it and the workflow
  already verifies that the tag name equals the current package version.
- Advancing to the next version turns the former current record into historical evidence; its tag must
  then exist or the next release preparation fails closed.

This removes the impossible ordering in which a pre-tag bump would require its own not-yet-created tag
while preserving exact tag evidence before any later release can proceed.

This makes compatibility evidence proactive. A later schema change consumes already packaged
predecessor records instead of reconstructing them after an incident.

## 6. Migration, Transaction And Recovery

The existing marketplace flow remains:

1. validate outer ownership;
2. validate installed manifests, provenance and all digests;
3. classify current or exact catalogue-backed historical contract;
4. build the stage only from current generated content;
5. validate current stage and provenance;
6. swap stable to backup and stage to stable;
7. perform host operation and version read-back;
8. commit or restore the exact backup and previous registration/plugin.

Catalogue match is necessary but not sufficient. It does not relax ownership, marketplace identity,
profile identity, provenance schema, source digest, runtime digest, plugin digest or manifest checks.

### 6.1 Immutable Local Build Snapshot

Local-checkout installation adds a preparation step before the existing marketplace transaction:

1. Validate the canonical generated plugin metadata and canonical version at the requested source
   root.
2. Capture the plugin tree in an AGDF-owned temporary snapshot outside the stable marketplace root.
3. Compute normalized source digests before and after capture and compute the snapshot digest. All
   three values must match. A mismatch returns `local_install_source_unstable`, cleans only the owned
   snapshot and performs no marketplace or host mutation.
4. Build one immutable descriptor containing canonical version, profile ID, snapshot root, source
   digest and per-surface version identity. Codex derives
   `<canonical>+codex.local-<first-12-digest>`; Claude and Copilot retain the canonical version.
5. Pass that descriptor to the existing marketplace transaction. The transaction copies only the
   snapshot bytes, writes manifests and provenance from the descriptor, and validates the completed
   stage against the same descriptor before any stable-root swap.
6. Remove the owned snapshot after commit or rollback. A caller cannot supply an arbitrary derived
   Codex version on the normal local-install path.

The descriptor is an internal value object, not a new persisted source of truth or marker schema.
Public install commands, canonical release versions, marketplace layout, ownership markers,
provenance fields and host activation behavior remain unchanged. The existing transaction retains
sole authority for stable/backup replacement and recovery.

Claude recovery remains Windows-only, source-operand-ordered, exact-namespace and one-retry maximum.
Lifecycle output remains one action requiring full application restart and a fresh session while
warning that restoration can retain stale skills.

## 7. Failure Contract

| Condition | Stable result |
|---|---|
| Catalogue missing/malformed/digest mismatch | `profile_history_invalid` |
| Exact version absent | `historical_contract_unsupported` |
| Version present but semantic contract differs | `historical_contract_invalid` |
| Release references unknown contract | `profile_history_invalid` |
| Current release snapshot missing or different | `profile_history_current_release_mismatch` |
| Backfilled tag differs | `profile_history_tag_mismatch` |
| Previously supported entry removed/changed | `profile_history_continuity_break` |
| New semantic contract lacks exact deliberate digest acceptance | `profile_history_contract_review_required` |
| Version/catalogue target plan is incomplete or inconsistent | `release_version_bump_invalid` |
| Transactional write fails | `release_version_bump_write_failed`; restore original bytes |
| Ownership/provenance/digest mismatch | existing precise failure; no historical exception |
| Generated source changes during local snapshot capture | `local_install_source_unstable`; no marketplace or host mutation |

Catalogue validation failure blocks historical migration but must not make a current healthy
installation invalid. Release preparation always blocks on the same defect.

## 8. Security And Compatibility

- Exact release keys prevent semver-range downgrade authority.
- Exact structure plus recomputed digests prevent hash-only or shape-only acceptance.
- Packaged policy avoids network/tag trust during installation.
- Existing plugin/source digests bind the catalogue delivered with the installer.
- Append-only release checks prevent accidental support loss.
- Current validation remains strict and independent.
- Historical bytes remain rollback input only, never target-stage input.
- Explicit later retirement is a product compatibility decision, not cleanup.

## 9. Verification Strategy

Required deterministic matrices:

1. Catalogue schema, sort order, digest and reference positives/negatives.
2. Exact tag-backed records for `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2` and `0.14.3`,
   plus explicit `agdf-v0.14.0` tag/version-mismatch rejection.
3. Per-version mutation, missing/extra key, wrong contract, wrong digest and unknown-version negatives.
4. Current validator remains current-only.
5. `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1` each enter the same named rebuild and canonical
   transaction.
6. `0.14.2` and `0.14.3` current-shape roots remain on the ordinary path.
7. Ownership/provenance/manifest/digest tamper blocks before stage and host calls for every historical
   contract family.
8. Canonical stage exclusion and byte-identical rollback for each distinct historical contract.
9. Source/generated/package catalogue parity.
10. Release continuity failure for missing current snapshot, tag mismatch, changed prior entry and
    silent deletion.
11. Existing Claude cache, rollback and lifecycle suites remain green.
12. Full release preparation, package smoke, Runtime Integrity and control validation.
13. Version bump with an unchanged contract appends the exact current record and updates all version
    surfaces atomically.
14. Changed-contract first invocation performs zero writes and returns the exact review digest;
    wrong/stale digest rejects, exact deliberate digest permits one new contract.
15. Pre-tag current validation passes without its tag; tag publication validates the present current
    tag; the next bump requires the prior release tag.
16. Injected write failure restores every original file byte-for-byte.
17. Local-install orchestration performs no caller-side digest derivation; one stable snapshot yields
    one exact Codex local identity, while an injected mid-capture source change fails before the
    marketplace transaction and host calls.

Tag fixtures use repository objects read-only. Installer tests use temporary roots and injected
executors only; no real host/cache mutation is part of implementation verification.

## 10. Approved Design Boundary

The later TP may change:

- new `plugin/meta/distribution-profile-history.json`;
- new focused runtime and release history modules;
- existing provenance, marketplace and canonical generation/release-coherence owners;
- directly corresponding tests and generated projections;
- documentation of the release compatibility lifecycle;
- a new focused internal version-bump module/script and package-script entry;
- the existing version-coherence surface inventory, refactored only as needed so reading and writing
  use one canonical target list;
- existing canonical version surfaces already covered by release coherence;
- `create-agdf/lib/installers/local-marketplace.js` for the internal immutable-snapshot descriptor,
  single digest derivation and pre-transaction unstable-source rejection;
- `create-agdf/scripts/install-local-plugin.js` to delegate local identity derivation to that owner;
- `create-agdf/scripts/local-development-install-test.js` and directly corresponding marketplace
  tests for stable-snapshot, source-change and no-host-mutation regression evidence;
- existing Revision 1 implementation only where needed to consume the catalogue; and
- this run's control artefacts and Context Graph.

It must not introduce runtime Git/network access, semver compatibility, inferred subsets, automatic
retirement, a second marketplace transaction, a second provenance store, broad cache management,
release publication or real host mutation.

## 11. Rejected Alternatives

- **Accept any older version with a subset contract:** unsafe downgrade and tamper path.
- **Hard-code several versions in JavaScript:** repeats the incident fix and leaves release continuity
  manual.
- **Query Git tags during install:** unavailable in npm/global installs and makes policy network/repo
  dependent.
- **Store one semver range per contract:** exact release provenance is lost and unpublished versions
  can become eligible.
- **Generate history only when a schema changes:** predecessor evidence can already be unavailable or
  forgotten; every release must snapshot proactively.
- **Automatically retain the last N releases:** silently narrows public compatibility and conflates age
  with safety.
- **Keep version bumps manual and rely on CI:** repeats the observed omission; CI detects drift only
  after an invalid multi-file version commit already exists.
- **Always create new contracts automatically:** silently creates a compatibility promise when profile
  semantics change; changed contracts require exact digest review.
- **Require the current tag before preparing the current release:** creates a circular pre-tag
  dependency and encourages bypasses.
- **Accept any syntactically valid local build metadata:** disconnects the installed identity from
  the exact source bytes and weakens provenance.
- **Compute the digest in both orchestrator and marketplace preparation:** preserves the observed
  time-of-check/time-of-use race and turns a changing build source into a misleading version error.
- **Serialize all surfaces behind one universal version string:** ignores host-specific identity
  needs; the shared snapshot is generic, while surface version strategies remain explicit.

## 12. Next Step

Draft and review Task and Test Plan Revision 9. Implementation remains forbidden until exact
`Approval: TP` is accepted for that durable revision and the required pre-implementation Brownfield
Analysis passes.
