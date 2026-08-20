# SD: Agent Skills Conformance And Portability Baseline

Status: approved
Gate: SD
Gate approval: Approval: SD
Based on: approved PRD
Date: 2026-08-19
Owner: Arndt Gold

## 1. Solution Overview

Add one dependency-free Agent Skills validator to the plugin and compose it into the existing Runtime
Integrity entry point. The validator will inspect the canonical skill inventory, validate the locally
declared strict metadata profile, classify advisory guidance separately, and resolve declared skill
resources against explicit skill-local and plugin-scoped boundaries.

The same module and policy will travel with the complete generated plugin. Repository tests will also
run the validator against the rewritten Copilot and OpenCode skill projections using explicit surface
descriptors. Existing synchronization remains responsible for rewriting skill names and shared contract
paths; validation observes those outputs and does not become another generator.

The delivered statement is deliberately bounded: AGDF's checked skills satisfy the declared core-format
profile and their declared resources are portable within the checked plugin or generated repository
surface. It is not a general YAML implementation, standalone-skill certification, host-behavior proof,
or public-listing evidence.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner | Consumer or projection |
|---|---|---|
| Canonical skill inventory and surface prefixes | `plugin/meta/agdf-plugin.definition.json` | Validator, router and existing synchronizer |
| Conformance baseline, classifications and allowed portability roots | `plugin/meta/agent-skills-conformance.json` | Validator only |
| Canonical skill content and dependency declarations | `plugin/skills/*/SKILL.md` | Generated plugin, Copilot and OpenCode skills |
| Shared workflow semantics | `plugin/meta/contracts/*.md` | Skills and generated contract projections |
| Conformance implementation | `plugin/scripts/agent-skills-conformance.mjs` | Existing Runtime Integrity and focused tests |
| Aggregate repository/package verification | `plugin/scripts/check-runtime-integrity.mjs` | Existing CI, package and smoke paths |
| Surface generation and path rewriting | `create-agdf/scripts/sync-package-assets.js` | Generated assets only |
| Public compatibility wording | Existing capability matrix and website evidence/compatibility owner | Generated public candidate and website |

The policy must not duplicate `skillSet`, contract contents, or generated-file inventories. It declares
only the upstream snapshot, supported AGDF frontmatter profile, advisory rules, portability classes,
surface layouts and permitted shared-resource roots.

## 3. Architecture Decisions

### AD-1 — Offline versioned policy

`plugin/meta/agent-skills-conformance.json` will use a versioned schema and record the reviewed Agent
Skills specification URL/date. Rules carry an explicit class: `standard_strict`, `upstream_advisory`,
or `agdf_policy`. Only strict and AGDF-policy failures block. Upstream drift is handled by a separately
reviewed policy change; routine validation performs no network access.

### AD-2 — Dependency-free bounded frontmatter decoder

The packaged validator will use only Node.js standard-library modules. It will decode the AGDF-owned
frontmatter profile: document delimiters and unique, unindented top-level scalar fields with plain,
single-quoted, or double-quoted values. `name` and `description` are required. Unsupported nested,
sequence, block-scalar, alias, tag, or multi-document constructs fail under an explicit AGDF profile
rule, not as a claim that the public standard forbids them.

The strict layer validates the public constraints approved in PRD ASC-2. The policy layer limits AGDF's
canonical skills to the supported profile and declared keys. This keeps installed validation
self-contained while avoiding a false claim of general YAML coverage.

### AD-3 — Stable findings and result model

The validator returns a structured result instead of exiting directly:

- surface, inspected skill count and policy version;
- findings with stable code, class, severity, skill path, optional resource and concise remediation;
- portability summary per skill: `skill_local`, `plugin_scoped`, or invalid;
- blocking status derived only from strict and AGDF-policy errors.

`check-runtime-integrity.mjs` formats blocking findings through its existing failure collection and
keeps its current command shape and final success line. Focused tests may consume the structured result
directly.

### AD-4 — Canonical inventory without duplication

For the source and complete plugin layouts, expected skill directories derive from
`agdf-plugin.definition.json.skillSet` and the applicable surface prefix. Missing, duplicate,
non-directory, undeclared, or multiply evaluated skill entries fail closed. The policy contains no
second list of the ten skills.

### AD-5 — Explicit reference syntax and boundary resolution

Dependency extraction is deliberately narrow and deterministic:

1. Treat backtick-wrapped relative `.md` paths in the `## Runtime Contract` section as declared
   dependencies.
2. Scan other backtick-wrapped relative `.md` path tokens and require any dependency-shaped token to
   match a declared dependency; ordinary prose and code examples are not parsed as file references.
3. Normalize each declared path from the owning `SKILL.md` directory. Reject absolute paths, URL-like
   values, empty segments, unresolved files, symlinks escaping the allowed root, and lexical or physical
   traversal outside the surface root.
4. Classify a resolved file inside the skill directory as `skill_local`.
5. Classify a resolved file outside the skill directory but within a policy-declared shared root as
   `plugin_scoped`; every other out-of-skill reference is undeclared and blocking.

The source/full-plugin surface permits only `meta/contracts/` as the current shared root. Copilot and
OpenCode descriptors point at their generated contract roots. Surface descriptors are policy data, so
the validator uses one classification algorithm without hard-coding rewritten path strings.

### AD-6 — Generated parity through observation

`sync-package-assets.js` copies the policy and validator naturally into the complete generated plugin.
Its existing Copilot/OpenCode rewrite functions remain the only transformation owners. After sync,
focused package tests invoke the same validator with these surface roots:

- canonical source plugin: `plugin/skills/` and `plugin/meta/contracts/`;
- generated complete plugin: `generated/plugins/agdf/skills/` and `meta/contracts/`;
- generated Copilot repository surface: `generated/.github/skills/agdf-*/` and `contracts/`;
- generated OpenCode surface: `generated/.opencode/skills/agdf-*/` and `.opencode/contracts/`;
- public OpenAI candidate: its complete plugin skill and contract roots.

Name expectations are derived from canonical slugs plus the existing surface prefix. A generated-only
metadata or dependency failure remains attributable to that surface and blocks package preparation.

### AD-7 — Compatibility claim boundary

The existing capability matrix and website compatibility copy will state that the checked AGDF bundle
has deterministic repository evidence for the declared core-format profile and plugin-scoped shared
resources. The wording must explicitly retain that independent skill installation, identical behavior
across hosts, authenticated host execution, publisher verification and public availability are not
proved by these checks.

Optional host metadata such as `agents/openai.yaml` remains outside this slice and is not a failure.

## 4. Integration Points

- `plugin/scripts/check-runtime-integrity.mjs` imports and runs the focused validator for source and
  installed complete-plugin layouts.
- `create-agdf/scripts/runtime-integrity-negative-test.js` reuses its copied-plugin fixture to exercise
  aggregate fail-closed propagation.
- A focused test script under `create-agdf/scripts/` covers metadata parsing, classification, reference
  boundaries, stable findings and all surface descriptors.
- `create-agdf/scripts/package-build-test.js`, package-content checks and aggregate smoke verify
  generation, idempotence and shipped validator/policy presence.
- `create-agdf/scripts/sync-package-assets.js` remains the sole generator; no new CLI command, workflow,
  host API, job, queue, UI surface, telemetry or network dependency is introduced.
- The existing capability matrix and website data receive the bounded evidence statement without
  changing their responsibility or availability semantics.

## 5. Constraints And Compatibility

- Preserve Node.js compatibility and use only standard-library runtime dependencies in the plugin.
- Preserve current Runtime Integrity invocation, installed/source layout detection, exit behavior and
  success prefix.
- Preserve all current ten skills, routing semantics, approvals and Runtime Contract content.
- Do not accept policy data as a second skill inventory or contract corpus.
- Reject missing/invalid policy, unsupported policy schema and ambiguous surface configuration.
- Resolve physical paths where files exist so symlinks cannot bypass declared roots.
- Keep advisory findings non-blocking and visibly distinct from strict or AGDF-policy failures.
- Keep generated artifacts derivative; source policy, validator and documentation owners are edited.
- Do not claim general Agent Skills certification or standalone portability from this bounded checker.

## 6. Test And Evidence Strategy

TP and QA must collect:

1. Positive focused validation of all ten canonical skills with exact single coverage.
2. Metadata fixtures for missing delimiters, malformed/unsupported YAML profile, duplicate/missing
   fields, invalid name forms, directory mismatch and description length boundaries.
3. Classification proof that the 500-line recommendation is advisory unless AGDF policy deliberately
   promotes it, and that the finding is never labeled a strict standard failure.
4. Resource fixtures for skill-local success, current plugin-scoped contract success, missing target,
   absolute path, lexical escape, symlink escape, undeclared shared root and undeclared inline path.
5. Surface tests for source, complete generated plugin, Copilot, OpenCode and public candidate path/name
   projections, including a generated-only failure.
6. Existing Runtime Integrity pass in source and copied installed layouts plus negative integration
   proof of non-zero propagation.
7. Repeated synchronization digest equality, generated diff inspection, package contents, public-plugin
   checks, skill evaluations and aggregate smoke proportionate to impacted paths.
8. Documentation assertions for the bounded claim and explicit non-claims.
9. Mandatory Task Plan Review, Clean Implementation Review, Code Review and QA evidence after changes.

Repository/package checks are direct deterministic evidence. Live-host behavior and UAT remain
unperformed until separately observed and approved.

## 7. Risks And Open Questions

- The bounded YAML profile accepts less syntax than the public standard. Classification and wording must
  make this an AGDF policy restriction, never an upstream non-conformance claim.
- Backtick-path extraction is intentionally conservative. New dependency syntax must update the policy,
  validator and fixtures together rather than being silently inferred.
- Surface rewrites can drift independently. Each generated descriptor must be exercised after the same
  sync operation used for release preparation.
- Website and submission wording currently uses broad "portable skills" language. The implementation
  must narrow or qualify only the affected claims without restructuring unrelated public copy.
- No product, architecture, security, persistence, migration or release question remains open enough to
  block task planning after SD approval.

## 8. Next Step

The Solution Design was approved with exact `Approval: SD` on 2026-08-19.

Draft and review the bounded Task Plan. Implementation remains forbidden until the Task Plan is
durable and approved and the required pre-implementation Brownfield Analysis passes.
