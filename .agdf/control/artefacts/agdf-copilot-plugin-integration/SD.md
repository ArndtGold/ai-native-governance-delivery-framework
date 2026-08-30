# Solution Design: Host-Specific AGDF Artifact for GitHub Copilot

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation
Revision: 3
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` revision 3
Date: 2026-08-30
Owner: Arndt Gold

## 1. Design Summary

Keep `plugin/**` as the only editable source and split the generated release outputs by host need.
Codex and Claude Code continue to use the existing complete runtime-plugin artifact. Copilot receives
a separately materialized artifact containing its manifest, hook, prefixed skill projection and only
the runtime, contracts, metadata and support files required for offline operation.

The split occurs during `release:prepare`, not in the source tree and not after host installation.
The Copilot installer stages this artifact in a separate AGDF-owned marketplace root. This prevents
a Copilot installation from replacing the shared Codex and Claude marketplace on machines that use
several hosts.

The design optimizes semantic ownership first. Reduced package size is a measured consequence, not
the primary correctness rule.

## 2. Architectural Decisions

### AD-CPI3-01 — One editable source, two generated runtime profiles

`plugin/**` and `plugin/meta/agdf-plugin.definition.json` remain the only editable owners for skills,
metadata, contracts, hooks and host projection rules. `sync-package-assets.js` produces:

- the existing `generated/plugins/agdf` runtime-plugin profile for Codex and Claude Code;
- a new `generated/plugins/copilot/agdf` Copilot profile.

The Copilot profile is always rebuilt from canonical source and generated runtime owners. No file in
that profile becomes an input to another projection and no Copilot-specific source tree is added.

### AD-CPI3-02 — Copilot profile uses an explicit allowlist

The Copilot profile builder materializes only these semantic component classes:

- root `plugin.json` rendered from the canonical definition;
- `hooks/copilot-hooks.json` rendered from the canonical hook contract;
- `copilot-skills/**` projected from canonical skills and focused Runtime Contract modules;
- exact-version `runtime/**` required by the hook and local validator;
- the minimal metadata, control templates, scripts and static assets referenced by that runtime.

It excludes canonical `skills/**`, `.codex-plugin/**`, `.claude-plugin/**`, Codex hooks, submission
content and other host projections. The concrete allowlist is code-owned and dependency-tested. A
new runtime dependency must be added deliberately with corresponding inventory evidence.

### AD-CPI3-03 — Semantic inventory is a release contract

The build emits a deterministic Copilot payload inventory, stored beside the generated profile. Each
entry records:

- destination path and semantic component class;
- canonical source owner or generated-runtime owner;
- projection rule or copy rule;
- content digest;
- host requirement that justifies inclusion.

The inventory validator fails `release:prepare` when it finds an unlisted file, a missing required
file, an excluded host surface, more than one Copilot skill projection, an unmapped semantic owner or
a digest that is stale relative to its source and projection rule.

File-name equality alone is not treated as semantic duplication. Conversely, renamed copies with
the same semantic owner remain detectable through the owner mapping.

### AD-CPI3-04 — Growth budget is a review signal, not a substitute for integrity

The first accepted Copilot profile inventory establishes a reviewed file-count and byte baseline.
Tests reject unexplained growth above a narrow explicit tolerance. An intentional increase requires
updating the reviewed baseline together with the source-owner mapping and host requirement.

Passing the size budget cannot override a semantic inventory failure. Required offline runtime and
contract files are not removed merely to reduce bytes.

### AD-CPI3-05 — Copilot gets a separate atomic marketplace projection

`prepareCopilotMarketplace` reuses the existing ownership-marker, staging, rollback, provenance and
digest primitives but writes to a surface-specific stable root such as:

```text
<AGDF_DATA_DIR>/marketplaces/agdf-copilot
```

Its internal marketplace name and installed plugin identity remain `agdf`, so Copilot continues to
display `agdf@agdf`. The root contains only the Copilot marketplace manifest and
`plugins/agdf` copied from `generated/plugins/copilot/agdf`.

The existing `<AGDF_DATA_DIR>/marketplaces/agdf` root remains the Codex and Claude owner. Copilot
staging, rollback or uninstall never swaps or removes that root.

### AD-CPI3-06 — Copilot lifecycle selects the Copilot preparation owner

`installCopilotGlobalPlugin` defaults to `prepareCopilotMarketplace`; Codex and Claude installers
continue to default to `prepareLocalMarketplace`. CLI dependency injection distinguishes the two
preparation functions so tests can observe the selected profile without changing consent or
lifecycle result contracts.

The public and source-checkout commands remain:

```bash
npx --yes @agdf/cli@latest copilot
npm run install:copilot
```

Both build or consume the same Copilot profile. Direct-path migration, marketplace installation,
version verification, consent and recovery behavior remain unchanged except for the registered
marketplace source root.

### AD-CPI3-07 — Runtime integrity becomes profile-aware

Installation provenance records a profile identifier such as `copilot-runtime-plugin`, canonical
version, source digest, runtime digest and payload-inventory digest. Copilot validation checks its
own profile contract and must not require Codex or Claude manifests.

The local validator continues to resolve the exact installed runtime from the Copilot plugin root.
Source, generated profile, staged marketplace, installed host root and loaded session remain separate
evidence planes.

### AD-CPI3-08 — Cross-host behavior is protected explicitly

No Codex, Claude Code or OpenCode command, manifest path, marketplace root or installed profile is
redirected to the Copilot artifact. Tests install Codex, Claude and Copilot in both orders against one
data root and prove that each registered root and digest remains stable.

OpenCode generation and npm package behavior remain unchanged except that the registry package also
contains the new generated Copilot profile as a separately owned release artifact.

### AD-CPI3-09 — Existing plugin-only decisions remain in force

Revision 2 decisions for the canonical `copilot` command, retired `copilot-plugin` and `both`
commands, non-destructive legacy repository boundary, consent authority, documentation ownership and
evidence separation remain unchanged unless this revision explicitly replaces them.

## 3. Component Changes

| Component | Revision 3 change | Preserved boundary |
|---|---|---|
| Asset synchronization | Build explicit Copilot profile and inventory | Canonical `plugin/**` source |
| Copilot profile validator | Verify allowlist, owners, projections, digests and growth budget | Existing Runtime Integrity remains authoritative for runtime code |
| Local marketplace staging | Add surface-specific Copilot root and profile validation | Existing Codex and Claude marketplace stays unchanged |
| Copilot installer | Select Copilot preparation owner | Consent, migration, verification and rollback contract |
| Provenance | Add Copilot profile and inventory digest | Canonical version and runtime digest semantics |
| Package tests | Require Copilot profile and reject unused host projections inside it | Registry package may contain separately owned host artifacts |
| Cross-host tests | Exercise coexistence and install order | No inferred live-host parity |

## 4. Build And Installation Flow

```text
plugin/** canonical source
        |
        +-- existing runtime-plugin build --> generated/plugins/agdf
        |
        +-- Copilot projection builder
              |
              +-- allowlisted payload --> generated/plugins/copilot/agdf
              +-- semantic inventory + baseline check
                            |
                            v
                  prepareCopilotMarketplace
                            |
                            v
           <AGDF_DATA_DIR>/marketplaces/agdf-copilot
                            |
                            v
             copilot plugin install agdf@agdf
```

Every transition validates its input before replacing an owned destination. A failure leaves the
previous proven Copilot marketplace and the independent Codex/Claude marketplace untouched.

## 5. Failure And Recovery Design

- Missing or unmapped Copilot files fail release preparation before host mutation.
- Unexpected canonical `skills/**` or another host manifest in the Copilot profile fails packaging.
- A stale skill projection fails source-to-projection digest verification.
- An unexplained payload increase fails the reviewed baseline check with a component breakdown.
- Invalid or foreign Copilot marketplace roots are never overwritten.
- Failed Copilot registration rolls back only the Copilot marketplace transaction.
- Existing direct installs are migrated through the current lifecycle and recover to the prior
  proven state when marketplace installation fails.
- Coexisting Codex and Claude installations are verified as unchanged after Copilot failure cases.

## 6. Security And Authority

- No new network endpoint, credential, telemetry or gate authority is introduced.
- The Copilot hook remains argument-free, read-only, offline and consent-bound.
- Generated inventory and provenance are evidence, not AGDF gate approval.
- Ownership markers constrain cleanup to exact surface-specific roots.
- `.agdf/control/` and exact revalidated `Approval: <GateName>` remain the delivery authority.

## 7. Verification Strategy

Focused deterministic tests must prove:

1. one canonical source produces exactly one Copilot skill projection;
2. the Copilot profile excludes canonical skills and other host manifests;
3. every included component has one semantic owner and host requirement;
4. stale, duplicated, unmapped and unexpected-growth fixtures fail closed;
5. exact runtime, hook, consent and prefixed-skill behavior is preserved;
6. Copilot staging uses its own root and profile-aware provenance;
7. Codex, Claude and Copilot coexist in both installation orders;
8. rollback affects only the failing surface;
9. package inventory, Runtime Integrity, routing, skill conformance and full smoke remain green;
10. installed-root and fresh-session evidence remain separately reported.

## 8. Acceptance Mapping

| PRD criteria | Design decisions |
|---|---|
| CPI2-AC-01, AC-02 | AD-CPI3-05, AD-CPI3-06 |
| CPI2-AC-03 | AD-CPI3-09 |
| CPI2-AC-04 | AD-CPI3-01, AD-CPI3-02, AD-CPI3-07 |
| CPI2-AC-05, AC-06, AC-07 | AD-CPI3-08, AD-CPI3-09 |
| CPI2-AC-08, AC-09 | AD-CPI3-05, AD-CPI3-06, AD-CPI3-09 |
| CPI2-AC-10 | AD-CPI3-09 |
| CPI2-AC-11, AC-12 | AD-CPI3-03, AD-CPI3-07, AD-CPI3-08 |
| CPI2-AC-13 | AD-CPI3-01 through AD-CPI3-08 |

## 9. Rejected Alternatives

- **Prune the shared marketplace in place:** rejected because Copilot installation could replace the
  artifact used by Codex and Claude on the same machine.
- **Keep the shared physical root and rely on Copilot ignoring `skills/**`:** rejected because unused
  semantic copies remain in the installed artifact and can drift.
- **Maintain a hand-written Copilot source tree:** rejected because it creates a second editable owner.
- **Deduplicate only by file hashes or a size limit:** rejected because renamed or transformed semantic
  duplicates can pass while required runtime content can be removed incorrectly.
- **Download shared runtime dependencies after installation:** rejected because it weakens offline,
  exact-version and rollback guarantees.

## 10. Next Step

Review Solution Design revision 3. Approval permits drafting the revised Task and Test Plan. It does
not permit implementation.

Approve only with:

`Approval: SD`
