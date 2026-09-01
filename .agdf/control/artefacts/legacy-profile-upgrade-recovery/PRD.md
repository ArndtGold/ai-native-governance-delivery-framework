# PRD: Safe Legacy Profile Upgrade Recovery

Status: approved
Gate: PRD
Gate approval: exact `Approval: PRD` accepted on 2026-09-01 after same-run, PRD-gate, durable
Revision 4 and run revision_id `FAE1F128-8DDF-4110-BD9C-B52564133CA5` revalidation
Revision: 4
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Owner: Arndt Gold
Based on: approved `UR.md`, completed `BROWNFIELD_REVIEW.md`, ready
`UX_INTENT_DEFINITION.md`

## 1. Product Outcome

A user with an explicitly supported, AGDF-owned historical shared marketplace can run the normal
public AGDF install or update command and receive a verified current installation without manual
marketplace or cache surgery.

The upgrade remains fail-closed. Historical state becomes migration authority only when its exact
released contract, ownership, installation provenance, manifests and all declared digests agree.
Replacement content comes exclusively from the current canonical package and uses the existing
stage/backup/commit/rollback transaction.

On native Windows, one exact recoverable Claude cache-temp rename failure may trigger narrowly bounded
cleanup and retry. Successful installation is then reported as pending a full application restart and
a newly started session; restoring the old session is not accepted as evidence that the current skill
registry loaded.

## 2. Users And Needs

- An existing AGDF user needs a supported upgrade to work through the documented command rather than
  expert filesystem intervention.
- A security-conscious user needs unknown, unowned, malformed or tampered installations preserved and
  rejected rather than silently migrated or deleted.
- A Codex or Claude user sharing the durable marketplace needs an upgrade to preserve the other host's
  registration and rollback state.
- A Windows Claude user needs a transient, host-created cache-temp collision to recover without broad
  cache deletion.
- A user reading installer output needs to know that application restart and starting a fresh session
  are separate activation steps.
- A maintainer or reviewer needs deterministic evidence for every accepted historical contract,
  mutation boundary, rollback result and loaded-session claim.

## 3. Compatibility And Authority Contract

### 3.1 Versioned Historical Compatibility Catalogue

Every published AGDF release that contains an installation-provenance marker and a distribution-profile
contract must have one immutable, exact entry in a checked-in historical compatibility catalogue. The
catalogue is package content and must be usable without Git, network or registry access at install time.

Each entry binds:

1. one exact canonical release version;
2. the complete byte-independent semantic distribution-profile contract, including schema version,
   marketplace identities, complete profile set and every profile value;
3. the supported installation-provenance schema and shared profile identity; and
4. a deterministic digest of the canonical catalogue entry.

The initial backfill must include every provenance-bearing, profile-bearing release with an internally
version-coherent matching release tag. Direct tag evidence establishes the pre-Copilot shared contract
for `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1`; all four require exact historical migration records.
It establishes the five-profile current contract for `0.14.2` and `0.14.3`; these remain ordinary
current-shape upgrades while providing proactive predecessor snapshots.

The tag `agdf-v0.14.0` is not authority for a `0.14.0` entry because its plugin definition, package and
Codex manifest all identify `0.13.8`. The catalogue and release verifier must expose this exact
tag/version mismatch and must not fabricate, infer or alias a `0.14.0` contract. A future `0.14.0`
support claim requires separately gated authoritative release evidence.

The catalogue is closed over exact published versions, not over one incident. The release process must
append and verify the current release's exact contract before publication so a later schema change
already has trustworthy predecessor evidence. It must fail release preparation when the current
version is missing, differs from its catalogue snapshot, duplicates a version with different content,
or silently drops a previously supported entry.

The absence of `copilot-runtime-plugin` is eligible only inside a complete exact catalogue entry. It is
never a general rule permitting missing profiles. Semver ranges, "older than current", subset matching,
unknown schemas, inferred compatibility and best-effort normalization remain prohibited.

Retiring a catalogue entry is an explicit public compatibility decision requiring a deprecation policy,
release note, gated review and a major-version-compatible support decision. Runtime observation or a
new release alone must never narrow or widen the catalogue.

### 3.2 Migration Authority

An allowlisted historical contract is necessary but not sufficient. Migration may proceed only when
all of the following agree:

- the marketplace root has the valid AGDF ownership marker and expected shared `runtime-plugin`
  identity;
- ownership marker version, plugin definition version, runtime manifest version and Claude manifest
  version are the same supported historical canonical version;
- the Codex manifest version is either that canonical version or its valid AGDF local-install
  projection derived from the recorded source digest;
- `.agdf-installation.json` has the supported schema, `create-agdf` owner, shared profile and durable
  marketplace identity;
- the provenance canonical version, Codex install version, source digest and runtime digest agree with
  the installed content and manifests;
- the ownership marker marketplace/plugin digest and source digest agree with the complete observed
  root; and
- marketplace manifests identify the exact durable AGDF marketplace and local plugin path.

Any missing, contradictory or unverifiable field removes migration authority. The installer must
preserve the observed state, report a stable reason and stop before staging or host mutation.

## 4. UX Intent And Effective States

- ui_ux_impact: `high`
- ux_intent_definition: ready at `UX_INTENT_DEFINITION.md`
- primary_user_intent: Upgrade a known AGDF installation through the supported command without expert
  filesystem surgery while retaining fail-closed protection.
- success_signal: The command either completes a verified canonical installation and gives one
  truthful activation handoff, or preserves state and reports one safe recovery action.
- primary_decision_or_action: Run the normal host-specific install/update command; after verified
  installation, fully restart the application and start a fresh session.

| Working mode | Effective state | Visible feedback | Authority |
|---|---|---|---|
| Current healthy installation | Current contract, ownership, provenance and digests match | Current installation verified; restart/fresh-session guidance after update | Current validator and installed-root evidence |
| Supported historical installation | Exact versioned catalogue entry and all migration evidence match | Supported historical upgrade detected; canonical rebuild begins | Versioned catalogue plus complete installed evidence |
| Unsafe or unsupported installation | Any allowlist, ownership, provenance, manifest or digest check fails | Upgrade blocked with stable reason and no destructive action | Fail-closed classifier |
| Canonical marketplace staged or installed | Existing transaction is open until host success | Installing current canonical payload; rollback remains available | Existing marketplace transaction |
| Recoverable Claude cache contention | Exact current install attempt failed on Windows `EPERM` for one eligible `temp_local_*` entry | Bounded cleanup/retry is named | Exact host error plus path and filesystem safety checks |
| Restart pending | Installed version read-back passed | Fully restart the application | Installer result only |
| Fresh-session pending | Application restarted, but old session was restored | Start a new session; restored sessions may retain stale AGDF skills | Session lifecycle observation |
| Loaded current | New post-restart session exposes the expected current skills/runtime | Current loaded state may be claimed only from direct fresh-session evidence | Host/plugin/skill read-back in the new session |

## 5. Functional Requirements

### LUR-01 — Exact Versioned Historical Contract Recognition

The canonical provenance/profile owner must expose a deterministic result that distinguishes:

- current contract;
- one exact supported historical catalogue entry;
- unsupported historical or future contract; and
- invalid contract.

The result must identify the matched catalogue ID, exact version and entry digest without weakening
current-contract validation. No caller may independently reproduce or broaden the policy.

### LUR-01A — Release-Owned Catalogue Continuity

The canonical release process must:

- store the catalogue in one canonical machine-readable source;
- verify backfilled entries against their exact release tags;
- ensure the current release version and exact current contract have one catalogue snapshot;
- carry every supported prior entry forward unchanged;
- generate runtime/package projections only from that source;
- reject duplicate, changed, missing or unreferenced entries; and
- provide a deliberate reviewed mechanism for explicit deprecation, never implicit pruning.

Normal installation reads only packaged catalogue data. It must not execute Git, inspect tags, contact
GitHub/npm or infer policy from the installed version.

### LUR-02 — Complete Pre-Migration Verification

The shared-marketplace classifier must evaluate every authority condition in Section 3.2 before
creating a stage, renaming a root, changing host registration or cleaning cache state.

A profile mismatch may become recoverable only when it is explained solely by an exact allowlisted
historical contract. Ownership, provenance, manifest, source, runtime or marketplace-digest failure
must continue to fail closed.

### LUR-03 — Canonical-Only Transactional Rebuild

An eligible historical root must enter the existing local-marketplace transaction as a named
historical-profile rebuild classification.

The replacement stage must:

- be copied only from the current generated canonical shared plugin;
- receive only current manifests, profile contract, runtime and installation provenance;
- contain no file copied from the historical plugin root;
- validate fully before replacing the stable root; and
- retain the historical root as the transaction backup until host installation and version read-back
  succeed.

### LUR-04 — Exact Rollback And Shared-Host Preservation

Any failure after the historical root is moved and before commit must restore the exact prior owned
marketplace bytes and valid pre-operation host registration state where the existing adapter can do
so.

The flow must account for the shared Codex/Claude root. Upgrading through one host must not silently
remove, redirect or corrupt the other host's durable marketplace registration. Supported uninstall
may continue retaining the owned shared root; a subsequent install/update must classify and migrate
that retained root correctly.

### LUR-05 — Bounded Claude Windows Cache Recovery

Automatic cache cleanup is allowed only when all of these conditions hold:

- the active surface is Claude Code;
- the platform is native Windows;
- the current `claude plugin install agdf@agdf` attempt fails with `EPERM` during its cache rename;
- the failure identifies one exact existing directory whose basename matches Claude's observed
  `temp_local_*` temporary-entry convention;
- the resolved path is an immediate, contained child of the expected Claude cache namespace for the
  `agdf@agdf` install attempt;
- the entry is a real directory, not a symlink, junction, reparse-point escape or ambiguous path; and
- no non-temporary cache entry is selected.

The installer may remove only that exact failed temporary entry and retry the Claude installation at
most once in the same invocation. It must not enumerate-and-delete matching entries, clean another
plugin/version namespace, remove the destination cache, or treat non-`EPERM` errors as recoverable.

If any condition is absent or the retry fails, the operation must stop visibly and execute the normal
marketplace rollback. Removal of the failed host temporary entry is reported separately and must not
be represented as rollback of user content.

### LUR-06 — Deterministic Failure Categories

At minimum, the public lifecycle failure must distinguish:

- `historical_contract_unsupported`;
- `historical_contract_invalid`;
- `historical_ownership_or_provenance_invalid`;
- `historical_digest_mismatch`;
- `historical_rebuild_failed`;
- `historical_rollback_failed`;
- `claude_cache_temp_recovery_unsafe`;
- `claude_cache_temp_retry_exhausted`; and
- ordinary host installation failure.

Equivalent stable repository naming may be selected in Solution Design, but categories must remain
machine-testable, path-safe and actionable. Error output must not disclose unrelated cache contents.

### LUR-07 — Truthful Restart And Fresh-Session Handoff

Every successful global runtime-bearing AGDF install/update result must preserve the existing one-next-
action lifecycle schema while making both required transitions explicit:

1. fully restart the target host application; and
2. start a fresh session/task/conversation after restart.

The human result must warn that restoring the prior session can retain a stale skill registry. The
machine-readable result must carry the same semantic next action. Surface-native wording may differ,
but `Restart` alone is insufficient.

Installation success may set activation only to a pending state. It must not claim that the restarted
application, fresh session, skills or AGDF runtime are current.

### LUR-08 — Evidence Planes Stay Separate

Repository tests, canonical build validation, marketplace transaction success, host installed-version
read-back, application restart and fresh-session loaded-skill evidence are separate planes.

No lower plane may satisfy a higher-plane claim:

- repository tests do not prove native-Windows Claude cache behavior;
- installed `0.14.3` does not prove application reload;
- application restart does not prove a restored session refreshed its registry; and
- a fresh-session claim requires direct observation from that new session.

### LUR-09 — Existing Owners And Public Compatibility

The change must extend the existing provenance, local-marketplace, installer-sequencing, lifecycle-
result and test owners. It must not add a second profile validator, marketplace transaction, Claude
installer, lifecycle card or cache-management subsystem.

Current installations, Codex local-version semantics, Copilot's isolated marketplace, OpenCode's
config-local profile, portable Skills, exact AGDF approval authority and all unrelated public CLI
syntax must remain compatible.

### LUR-10 — Release And Mutation Boundaries

Creating or approving this PRD does not authorize implementation, local installation mutation, cache
cleanup, version changes, publication, release, commit, push or pull request.

Later repository evidence may establish release readiness only after approved SD and TP, Brownfield
Analysis, implementation and tests, mandatory Code Review and QA. Direct native-Windows and fresh-
session observations remain separately authorized UAT evidence.

## 6. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | The exact released `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1` shared profile contracts are recognized as supported historical state only when the exact canonical version and every contract field match their catalogue records. |
| AC-02 | `0.14.0`, an unlisted version, one changed value, one additional/missing profile, an unknown schema or a future version is rejected before mutation; exact current-contract records for `0.14.2` and `0.14.3` remain on the ordinary current-shape path. |
| AC-03 | A supported-profile fixture with any invalid ownership, provenance, manifest, source digest, runtime digest or marketplace/plugin digest is preserved and rejected before staging or host commands. |
| AC-04 | Eligible `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1` fixtures independently upgrade to the current canonical marketplace through the existing transaction and each final root passes current provenance, profile, runtime and digest validation. |
| AC-05 | A historical-only sentinel file never appears in the replacement stage or committed current root. |
| AC-06 | Stage, swap or host failure restores the exact historical marketplace digest and cleans only transaction-owned stage/failed roots. |
| AC-07 | Upgrading through Claude preserves the supported Codex relationship to the shared marketplace, and upgrading through Codex preserves the Claude marketplace relationship. |
| AC-08 | A retained supported historical root after uninstall is classified and migrated by the next supported install/update rather than reproducing the profile blocker. |
| AC-09 | On native Windows, an exact simulated/current-attempt Claude `EPERM` for one safe contained `temp_local_*` directory removes only that entry and performs no more than one install retry. |
| AC-10 | Non-Windows, non-`EPERM`, missing-path, escaped-path, symlink/junction/reparse, non-directory, non-temporary, destination-cache and unrelated-plugin fixtures perform no cache deletion and fail visibly. |
| AC-11 | Retry exhaustion rolls the marketplace back exactly, preserves every unrelated cache entry and reports the cache recovery as incomplete. |
| AC-12 | Human and JSON results expose stable distinct states for blocked historical migration, rebuild/rollback failure, cache recovery, installation verified, restart pending and fresh-session pending. |
| AC-13 | Every successful global runtime-bearing install/update next action says to fully restart the application and then start a fresh session; it warns that restoring the old session may retain stale skills. |
| AC-14 | Installer success leaves activation pending and contains no restarted-host, loaded-skill, fresh-session, QA or UAT success claim. |
| AC-15 | Existing current-installation, tamper, rollback, Codex local version, Copilot isolation, OpenCode, lifecycle, package, Runtime Integrity and aggregate smoke tests pass without weakened assertions. |
| AC-16 | Direct native-Windows evidence reproduces the historical upgrade and exact cache-contention recovery using an authorized disposable/owned fixture or real supported install boundary. |
| AC-17 | Direct post-restart evidence comes from a newly started session and verifies the expected current skill registry; restoring the prior session is recorded only as stale-session evidence. |
| AC-18 | No implementation, installation/cache mutation, versioning, publishing or VCS action occurs before its later AGDF transition and explicit authority. |

## 7. Non-Functional Requirements

- Safety: every missing or ambiguous authority fact fails closed before mutation.
- Security: path containment and filesystem-type checks prevent cache escape, link traversal and broad
  deletion.
- Determinism: the same observed root and target version produce the same classification and planned
  transaction.
- Atomicity: marketplace replacement retains the existing exact backup/commit/rollback semantics.
- Bounded recovery: one exact cache-temp cleanup and at most one retry per invocation.
- Compatibility: the allowlist is exact and versioned; current and unrelated profile behavior remains
  unchanged.
- Auditability: classification, mutation, cleanup, retry, rollback and evidence-plane outcomes are
  machine-testable and visible without exposing unrelated user paths.
- Portability: historical classification and marketplace rollback are cross-platform; Claude cache
  cleanup is explicitly native-Windows-only until separately evidenced.
- Usability: every terminal outcome presents one primary next action and distinguishes restart from a
  fresh session.

## 8. Explicit Non-Goals

- Accepting releases before `0.13.6`, the internally version-incoherent `agdf-v0.14.0` tag, or any
  version without an exact authoritative catalogue record.
- Accepting arbitrary incomplete, subset, future or normalized profile contracts.
- Trusting a version string, directory name, marketplace registration or ownership marker by itself.
- Copying historical plugin files into the current stage.
- Weakening current provenance, manifest, source, runtime or marketplace digest checks.
- General Claude cache cleanup, wildcard deletion, age-based deletion or repair of other plugins.
- Treating every Claude `EPERM` as recoverable.
- Changing Claude Code itself or guaranteeing undocumented behavior on every Claude/platform version.
- Combining installation, application restart and loaded fresh-session evidence.
- Reopening Copilot marketplace design, OpenCode installation, portable Skills or AGDF gate semantics.
- Publishing, releasing, committing, pushing or installing automatically.

## 9. Evidence Plan

- Released `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2` and `0.14.3`
  semantic-contract fixtures whose exact tag origins and digests are recorded, plus negative evidence
  for the `agdf-v0.14.0` tag/version mismatch.
- Positive exact-match and negative version/schema/profile-value fixtures.
- Ownership, provenance, manifest, source-digest, runtime-digest and marketplace-digest tamper matrix.
- Canonical-only rebuild, historical-sentinel exclusion, commit and exact rollback fixtures.
- Shared Codex/Claude registration and retained-root uninstall/reinstall fixtures.
- Native-Windows path-containment, filesystem-type, exact-entry deletion, one-retry and exhaustion
  fixtures with unrelated-cache sentinels.
- Human and JSON lifecycle-result assertions for restart plus fresh-session guidance on supported
  global runtime-bearing surfaces.
- Existing focused installer, lifecycle, package, Runtime Integrity and aggregate smoke suites.
- Separately authorized native-Windows real-host upgrade evidence.
- Separately authorized fresh post-restart session evidence; restored-session evidence is labeled
  stale and cannot satisfy UAT.

## 10. Open Solution Design Questions

- What single data structure owns exact release records, semantic contract IDs and evidence references
  without weakening the current validator or inferring support for `0.14.0`?
- How does classification reuse current validation while reporting that only the profile contract is
  historical and every other authority plane is current-valid for that installation?
- Which exact Claude error fields provide the failed path, and how is the expected AGDF cache namespace
  derived without scraping unrelated output or trusting an arbitrary absolute path?
- Which Windows filesystem APIs prove directory containment and reject links, junctions and reparse
  points before deletion?
- Where does the one cleanup-and-retry orchestration live so `plugin-installers.js` remains the single
  Claude sequencing owner and tests can inject the filesystem boundary?
- How are pre-operation Claude/Codex registration states captured and restored when host failure
  follows marketplace replacement?
- What surface-specific wording preserves one next-action field while clearly requiring a full app
  restart followed by a newly started session?

These are Solution Design decisions. They must not relax the requirements or acceptance criteria.

## 11. Next Step

Review PRD Revision 4 and approve only with:

`Approval: PRD`

Approval permits Solution Design drafting only. Implementation, tests, local installation/cache
mutation, QA, UAT, release and VCS actions remain forbidden.
