# TP: Agent Skills Conformance And Portability Baseline

Status: approved
Gate: TP
Gate approval: Approval: TP
Based on: approved SD
Date: 2026-08-19
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| ASP-01 | Add the versioned `plugin/meta/agent-skills-conformance.json` policy with the reviewed upstream snapshot, explicit `standard_strict`, `upstream_advisory`, and `agdf_policy` classifications, supported frontmatter profile, allowed shared roots and surface descriptors. Keep `agdf-plugin.definition.json.skillSet` as the sole inventory. | ASC-1, ASC-3, ASC-4, ASC-7; AD-1, AD-4, AD-5 | Policy-schema fixtures; inspection proving no duplicated skill list; missing, invalid and unsupported-policy-schema failures. |
| ASP-02 | Implement `plugin/scripts/agent-skills-conformance.mjs` as a dependency-free structured validator. Cover exact inventory, bounded frontmatter decoding, strict name/description constraints, AGDF profile restrictions, advisory line guidance and stable classified findings without direct process exit. | ASC-1, ASC-2, ASC-3; AD-2, AD-3, AD-4 | Focused unit tests for all metadata/profile boundaries; all ten canonical skills evaluated exactly once; advisory-only fixture remains non-blocking. |
| ASP-03 | Implement deterministic dependency declaration extraction and physical boundary resolution. Classify skill-local and policy-declared plugin-scoped resources, and reject undeclared inline paths, unresolved files, unsafe traversal, absolute/URL paths and symlink escape. | ASC-4; AD-5 | Positive current-contract and skill-local fixtures; negative fixtures for every declared boundary family with stable codes and remediation. |
| ASP-04 | Compose the focused validator into `plugin/scripts/check-runtime-integrity.mjs` while preserving the existing command, layout detection, failure aggregation, exit behavior and success prefix. Extend the existing copied-plugin negative fixture instead of creating a second aggregate check. | ASC-1, ASC-2, ASC-3, ASC-4, ASC-6; AD-3, AD-4 | Source Runtime Integrity pass; installed-layout pass; representative conformance failure propagates through Runtime Integrity with non-zero exit; existing negative suite remains green. |
| ASP-05 | Extend existing synchronization/package verification so the same policy and validator are present in the complete plugin and the same algorithm validates source, complete generated plugin, Copilot, OpenCode and public-candidate descriptors after canonical path/name rewriting. Do not add another generator. | ASC-5, ASC-6; AD-6 | Focused surface tests; generated-only drift fixture; repeated-sync digest equality; package-build, package-content, public-plugin and runtime-layout tests. |
| ASP-06 | Narrow the existing capability-matrix and website evidence/compatibility wording to the proved core-format profile and plugin-scoped resource boundary. Preserve explicit non-claims for standalone installation, identical host behavior, authenticated execution, publisher verification and public availability. | ASC-7; AD-7 | Exact documentation assertions; generated public-candidate inspection; review confirms no unrelated website restructuring or optional host metadata work. |
| ASP-07 | Run the proportionate regression set, inspect generated diffs and record implementation evidence. Resolve any implementation findings, then run Task Plan Review, Clean Implementation Review and mandatory Code Review before QA. | ASC-1 through ASC-7 | Focused validator tests; Runtime Integrity source/installed; sync and package tests; skill evaluations and aggregate smoke where impacted; `git diff --check`; durable TP Review, Clean Review and CR evidence. |

Task order is ASP-01 through ASP-07. ASP-02 and ASP-03 may be developed together after ASP-01, but
ASP-04 must consume their single exported result model. ASP-05 follows the source implementation;
ASP-06 follows stable evidence semantics; ASP-07 closes implementation evidence. No task may create a
parallel skill inventory, validator entry point, generator or compatibility authority.

## 2. Test Plan

### Focused validator tests

- Baseline: validate the ten canonical skills once each with zero blocking findings.
- Inventory: missing directory, undeclared directory, missing `SKILL.md`, duplicate/ambiguous entry and
  surface-prefix mismatch.
- Frontmatter: missing or misplaced delimiters, duplicate keys, missing required fields, unsupported
  nested/block/multi-document syntax, plain/single/double quoted scalar success, malformed quotes,
  invalid name characters and hyphen positions, parent mismatch, empty/overlong name and empty/overlong
  description.
- Classification: strict failure blocks; AGDF policy failure blocks; the 500-line upstream guidance is
  advisory and cannot be labeled strict; deliberately promoted local policy is visibly AGDF-owned.
- Resources: current shared Runtime Contract dependencies pass as `plugin_scoped`; skill-local resource
  passes as `skill_local`; missing, absolute, URL-like, lexical escape, physical/symlink escape,
  undeclared shared root and undeclared dependency-shaped inline token each fail with stable findings.
- Result model: surface, policy version, inspected count, per-skill portability and finding field order
  remain deterministic across repeated runs.

### Integration and generated-surface tests

- Run source Runtime Integrity and its existing negative fixture suite.
- Generate assets once, validate the complete plugin, Copilot, OpenCode and public candidate with their
  explicit descriptors, then generate again and compare digests for idempotence.
- Introduce one isolated generated-only metadata/path fault in a fixture and prove the relevant surface
  fails without misattributing the source surface.
- Verify packaged contents include the policy and validator and that installed-layout Runtime Integrity
  remains self-contained without registry or network access.
- Run package build, public-plugin, package-contents and runtime-layout checks; run skill evaluations and
  aggregate smoke after focused checks pass because the touched verification chain is release-relevant.

### Documentation and review checks

- Assert the canonical capability statement includes `core-format profile`, `plugin-scoped` and the
  required standalone/host/publication non-claims or equivalent approved wording.
- Inspect the actual diff for unrelated generated or website changes.
- Run `git diff --check` and preserve separate repository/package evidence from unperformed live-host
  and UAT evidence.

No authenticated live-host exercise is part of this TP. Its absence is an explicit evidence boundary,
not an automated-test failure.

## 3. Brownfield Scope

Before implementation, run `agdf:brownfield-analysis` in `pre_implementation_analysis` mode against
this approved TP. It must revalidate:

- `plugin/meta/agdf-plugin.definition.json` remains the sole skill-inventory owner;
- `plugin/scripts/check-runtime-integrity.mjs` remains the only public aggregate verification entry;
- `create-agdf/scripts/sync-package-assets.js` remains the only source-to-surface generator;
- `create-agdf/scripts/runtime-integrity-negative-test.js` and existing package tests are extended,
  not shadowed by parallel infrastructure;
- generated trees remain derivative and are not edited as independent sources;
- existing skill routing, Runtime Contract semantics, gate approvals and command shapes are unchanged;
- public compatibility wording stays within the repository/package evidence actually collected;
- unrelated dirty worktree paths remain isolated from this run.

The analysis must return `pass` before ASP-01 implementation begins. New evidence of a policy,
security, public-contract, release or unbounded cross-host impact routes back to SD/TP revision rather
than being decided during implementation.

## 4. Out Of Scope

- General-purpose YAML parsing or certification of arbitrary third-party skills.
- Standalone packaging or installation of individual AGDF skills.
- Copying shared Runtime Contract modules into each canonical skill.
- Changes to skill behavior, routing, gate order, approval semantics or host permissions.
- Optional `agents/openai.yaml`, MCP, connectors, registries, telemetry or network checks.
- A new CLI command, public output schema, CI workflow, generator or top-level validation authority.
- Authenticated Codex, Claude Code, OpenCode, Copilot or ChatGPT UAT.
- Publisher verification, public listing, deployment, release, commit, push or PR actions.

## 5. Risks And Blockers

- `block`: policy duplicates the canonical skill inventory, validator/runtime checks disagree, missing
  or unsupported policy defaults open, or a resource can escape an allowed physical root.
- `block`: a strict, advisory or AGDF-policy finding is mislabeled in a way that overstates upstream
  non-conformance or weakens a blocking local rule.
- `block`: source or generated surfaces fail focused validation, synchronization is non-idempotent, an
  existing aggregate check regresses, or required test/review evidence is missing.
- `revise`: implementation needs YAML constructs, reference syntax, surface rewrites or public-contract
  changes not decided by the approved SD; route the gap to SD or TP as applicable.
- `revise`: compatibility copy still implies standalone or identical cross-host behavior after the
  evidence boundary is introduced.
- `warn`: optional host metadata remains absent, because it is explicitly outside scope and does not
  affect the approved conformance claim.
- Machine gate validation remains separately unavailable if the exact installed 0.13.2 local validator
  is absent; source Runtime Integrity and repository tests must not be relabeled as that evidence.

## 6. Next Step

The Task Plan was approved with exact `Approval: TP` on 2026-08-19.

Run the required pre-implementation Brownfield Analysis. When it passes, execute ASP-01 through
ASP-07 and collect the approved evidence before QA.
