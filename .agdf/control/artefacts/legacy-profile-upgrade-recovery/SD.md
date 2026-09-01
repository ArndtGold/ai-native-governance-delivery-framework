# Solution Design: Release-Owned Historical Profile Compatibility

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` accepted on 2026-09-01 after same-run, SD-gate, durable
Revision 3 and run revision_id `D3AE6C92-6AF1-4DE8-9D0B-6FBFDF3A2957` revalidation
Revision: 3
Date: 2026-09-01
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
| Package projection | existing canonical build/sync owners | Copy catalogue as ordinary canonical plugin metadata |
| Marketplace rebuild | `local-marketplace.js` | Reuse current provenance checks and unchanged atomic transaction |
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

1. Before changing version/profile semantics, retain all existing records unchanged.
2. Add the new exact release record and reuse or add its semantic contract.
3. Run canonical generation and release continuity verification.
4. Publish only after the package, tag and append-only matrices pass.

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
| Ownership/provenance/digest mismatch | existing precise failure; no historical exception |

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

Tag fixtures use repository objects read-only. Installer tests use temporary roots and injected
executors only; no real host/cache mutation is part of implementation verification.

## 10. Approved Design Boundary

The later TP may change:

- new `plugin/meta/distribution-profile-history.json`;
- new focused runtime and release history modules;
- existing provenance, marketplace and canonical generation/release-coherence owners;
- directly corresponding tests and generated projections;
- documentation of the release compatibility lifecycle;
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

## 12. Next Step

Review Solution Design Revision 3. Approve only with:

`Approval: SD`

Approval permits drafting Task and Test Plan Revision 4 only. It does not authorize catalogue
implementation, real installation/cache mutation, QA, UAT, release or VCS actions.
