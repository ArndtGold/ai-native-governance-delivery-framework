# Solution Design: Public AGDF Plugin Distribution

Status: approved
Revision: 3
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

Revision 3 reconciles approved PRD Revision 3. It preserves the complete Revision 2 architecture
and changes only the description projections: canonical local/package copy becomes **Control layer
for governed AI-assisted delivery.**, constrained public copy becomes **Governed AI delivery
controls**, and “operating system” is excluded from plugin manifests and directory metadata. No
capability, package, portal, prompt, long-description or implementation boundary changes.

## 1. Design Decision

AGDF will produce one deterministic, reviewable OpenAI public-plugin submission projection from the
existing canonical plugin, skill and public-policy owners. The projection is a build artefact and
manual portal input, never a second policy source and never an automated OpenAI submission client.

The first public release is skills-first and operates no AGDF MCP server. The portable skills core
is shared across ChatGPT and Codex. Codex hooks remain an explicitly surface-specific enhancement
and are included only where the accepted package format and direct host evidence support them.
Unsupported or unverified surface behavior is reported as advisory, unavailable or unverified; it
is not normalized into false parity.

The canonical local/package projection uses the established display name and the description
**Control layer for governed AI-assisted delivery.** The constrained public directory projection
uses display name **AGDF**, short description **Governed AI delivery controls** and exactly the three
prompts defined in PRD Revision 3 Section 6. Long-form listing copy and the website continue to
identify the product as **AI Governance & Delivery Framework (AGDF)**. These are two projections of
one canonical identity, not two products.

Repository readiness, publisher verification, portal draft, review, approval, publication and
post-publication behavior are separate states with separate evidence. The current publisher identity
state is `unverified`. No Persona inquiry URL, identity document, identity image, raw session value or
equivalent sensitive verification material may be persisted in repository evidence.

## 2. Architectural Boundaries

### Canonical repository authority

The repository owns desired product identity, listing content, capabilities, package inputs,
reviewer cases, public policy sources and evidence requirements. Existing AGDF gate rules, approval
semantics and skill behavior remain owned by their current canonical contracts and skills.

### OpenAI authority

OpenAI owns organization identity verification, Apps Management authorization, accepted submission
schema, review findings, approval, effective directory listing, availability and host behavior.
Repository records may capture observed state and provenance, but may not infer or manufacture it.

### Human authority

A verified authorized publisher deliberately creates or changes a portal draft, submits, publishes,
changes availability, updates, withdraws or rolls back a listing. Each external mutation requires an
explicit user instruction appropriate to that action and a post-action read-back.

### Non-authorities

Generated bundles, CI results, installation state, screenshots, host buttons and plan approval do not
approve AGDF gates or prove publisher identity, portal state, publication or live enforcement.

## 3. Canonical Owners And Components

| Component | Planned owner | Responsibility | Boundary |
|---|---|---|---|
| Public distribution contract | `plugin/meta/agdf-plugin.definition.json` | Versioned listing identity, public URLs, publisher target, starter prompts, availability decision and surface capability declarations | Adds distribution metadata only; does not duplicate gate or skill policy |
| Plugin manifest projection | `plugin/.codex-plugin/plugin.json` and existing sync owner | Host-installable plugin metadata derived from the canonical definition | Generated/synchronized projection, not independently edited policy |
| Reviewer cases | `plugin/submission/openai/reviewer-cases.json` | At least five positive and three negative reproducible cases with prerequisites and expected safe outcomes | Test data only; canonical skills and contracts still own behavior |
| Capability matrix | `plugin/submission/openai/capability-matrix.json` | Release-specific common, Codex-specific, ChatGPT-specific, advisory, unavailable and unverified claims | Claims require evidence class and exact release version |
| Release-note source | `plugin/submission/openai/release-notes.md` | Review-facing change summary and intentional limitations for the candidate | Must agree with version and public contract |
| Public legal contract | root `PRIVACY.md`, root `TERMS.md`, existing `LICENSE`, `NOTICE`, `TRADEMARKS.md`, `SUPPORT.md`, `SECURITY.md` | Canonical privacy, terms, licensing, marks, support and security meaning | Pages and submission link to or derive from these owners; no divergent policy copy |
| Submission builder | focused modules under `create-agdf/lib/public-plugin/` plus a thin script wrapper | Validate canonical inputs and create deterministic submission projection | Local build only; no portal credentials, network submission or publication |
| Package staging | existing `create-agdf/scripts/sync-package-assets.js` composition | Stage the exact public candidate beside existing generated plugin assets | Preserves npm/local marketplace paths and existing surfaces |
| Runtime payload builder | existing `create-agdf/scripts/sync-plugin-runtime.js` | Build exact-version local validator payload and runtime metadata | Runtime metadata may declare only files actually shipped in that payload |
| Candidate validator | focused public-plugin validation module and test wrapper | Validate schema, paths, inventory, digests, version, cases, URLs and surface evidence declarations | Repository/bundle proof only; never reports live-host or portal success |
| Public Pages projection | existing Pages content/build owners | Serve stable website, support, privacy and terms routes from canonical content | Pages deployment and live URL evidence remain separate external state |
| Evidence records | run-scoped artefacts under `.agdf/control/artefacts/agdf-public-plugin-distribution/` | Readiness, host UAT, portal and post-publication observations | Evidence classes remain separate and record unverified states explicitly |

The Source of Truth Registry is updated during implementation only after the approved paths exist.
The design does not pre-register absent owners.

## 4. Public Distribution Contract

The canonical plugin definition gains one bounded public-distribution object. Its exact schema is
finalized in TP, but it must contain or reference:

- stable technical ID `agdf`, constrained directory display name `AGDF` and full long-form identity
  `AI Governance & Delivery Framework (AGDF)`;
- canonical local/package description `Control layer for governed AI-assisted delivery.`, exact
  directory short description `Governed AI delivery controls` and long description with
  independent-publisher and non-certification boundaries;
- publisher display target and machine state reference, initially `unverified`;
- category, production logo reference and public website, support, privacy and terms URLs;
- the three ordered PRD Revision 3 starter prompts;
- release-specific availability decision;
- common and surface-specific capability declarations;
- candidate/release version relationship;
- reviewer-case and release-note sources;
- explicit no-MCP/no-AGDF-service declaration for the first release.

The object references existing canonical skills and contracts rather than embedding their normative
text. Build validation rejects missing references, contradictory identity/version values, incomplete
required listing fields and unsupported capability-state vocabulary. Final-directory validation
measures Unicode code points and rejects display name over 30, short description over 30, more than
three starter prompts or any starter prompt over 128 characters. It never truncates a value.

The manifest projector continues to own the local/public distinction. It emits the canonical
top-level `description` only to the local/package Codex interface and emits the constrained
`publicDistribution.shortDescription` only to the public candidate. Exact projection tests assert
the two approved values and the 29-code-point public length. The shared strategic
`longDescription` remains the only detailed-copy owner for Codex, Claude and public submission.

## 5. Source And Generated Package Shape

The reviewed source material remains under `plugin/` and canonical root policies. The deterministic
builder stages a disposable candidate under:

`create-agdf/generated/submissions/openai/agdf/`

The staged candidate contains only the package form accepted for review plus:

- the generated host manifest and required skills/resources;
- accepted surface-specific plugin material, when applicable;
- listing/readiness metadata derived from the public distribution contract;
- logo and referenced public assets;
- reviewer cases, capability matrix and release notes;
- a sorted inventory with paths, byte sizes and content digests;
- a readiness report naming passed, failed and unverified evidence classes.

Generated output is excluded from canonical ownership and rebuilt by existing package preparation.
It must not contain `.agdf/control/`, repository secrets, Persona material, local absolute paths,
portal cookies/tokens, private fixtures, development caches or unrelated repository files.

Two clean builds from identical sources must be byte-equivalent after excluding only documented,
non-semantic archive metadata. Inventory ordering, JSON serialization and line endings are stable.

## 6. Runtime Metadata Repair

The generated local-validator runtime currently must not inherit a source `package.json` whose
declared commands or scripts are absent from that payload. The runtime builder will generate a
minimal runtime-specific package manifest containing only metadata needed to load the shipped ESM
runtime, including the exact version and `type: module`. It will not declare `bin`, `scripts`,
`exports` or other targets unless every referenced target is part of the final payload and is tested
from that payload.

The final-inventory validator resolves every runtime-relevant declaration from the staged root and
rejects:

- missing or escaping paths;
- case-mismatched paths;
- absent manifest, skill, hook, script, export, asset or runtime entry targets;
- symlinks or path traversal that escape the candidate root;
- unloadable runtime entrypoints;
- version disagreement across definition, manifest, runtime and submission material.

Development-only npm scripts remain source-package concerns and are not copied into the isolated
runtime manifest. Existing package tests continue to validate the source npm package separately.

## 7. Build And Validation Flow

1. Read the canonical plugin definition, existing manifest inputs, skills, public policies and
   submission sources.
2. Validate schemas, product identity, public URL shape, version coherence, case counts and allowed
   surface states, including the current final-directory name/copy/prompt constraints.
3. Rebuild existing generated plugin assets through their current owners.
4. Build the minimal exact-version local-validator runtime.
5. Select the portable skills core and only accepted surface-specific material.
6. Stage the candidate in a clean temporary directory without using network or portal credentials.
7. Resolve all declarations against the staged inventory and load executable runtime entrypoints in
   a bounded smoke test.
8. Write the sorted inventory, digests and repository/bundle readiness report.
9. Atomically replace the generated submission directory only after all deterministic checks pass.
10. Compare a second clean build in the reproducibility test.

Any failure leaves the previously generated candidate untouched and returns a non-zero result.
There is no fallback that omits a failed skill, hook, policy, case or asset while still declaring the
candidate ready.

## 8. Effective State Model

| State | Authority and minimum evidence | Permitted transition |
|---|---|---|
| `repository_ready` | Approved implementation plus passing repository and exact-bundle evidence | Prepare host UAT or an explicitly authorized portal draft |
| `publisher_unverified` | Portal read-back shows identity/authority prerequisite incomplete, or no positive read-back exists | Publisher completes OpenAI/Persona verification outside the repository |
| `draft` | Authorized portal action plus observed saved draft | Revise or explicitly submit |
| `submitted` | Authorized submission plus portal receipt/read-back | Await review; no implicit publish |
| `revise` | Portal finding observed and captured without sensitive data | Route finding to canonical owner, rebuild, retest and explicitly resubmit |
| `approved` | Portal approval observed | Explicitly publish or defer |
| `published` | Authorized publish action and effective listing read-back | Perform post-publication verification, update or withdraw |
| `withdrawn` | Authorized withdrawal/delist action and effective read-back | Correct and explicitly resubmit if desired |

`publisher_unverified` is an orthogonal external prerequisite, not a repository build failure. A
candidate can be repository-ready while portal submission remains blocked. Conversely, identity
verification never proves candidate readiness.

## 9. Evidence Model

Every claim records one of these non-interchangeable evidence classes:

| Class | Proves | Does not prove |
|---|---|---|
| `repository` | Canonical source consistency and deterministic tests | Shipped contents, host behavior or portal state |
| `bundle` | Exact staged inventory, loadability, digests and reproducibility | Installation or live interaction behavior |
| `installed_host` | Exact version and observed workflow on a named host/account context | Other hosts, portal review or publication |
| `portal` | Observed publisher prerequisite, draft, submission, review or approval state | Repository quality or public discoverability |
| `post_publication` | Effective listing visibility and bounded live positive/negative behavior | Future availability or all account/region contexts |

Host UAT records product, plugin version, host, account/workspace context, repository context,
workflow, expected and visible result, enforcement class, timestamp and unavailable/unverified
boundaries. Portal evidence records only non-sensitive state, organization context, timestamp and
the authorized action/read-back. Screenshots may support observations but never replace structured
state or approval evidence.

## 10. Portal And Identity Sequence

The repository tooling ends at deterministic candidate/readiness generation. Portal work is a
manual or browser-assisted operational sequence:

1. Observe the selected OpenAI organization and Apps Management authority.
2. Observe verified individual or business identity. Until positive read-back, record
   `publisher_identity: unverified`.
3. With explicit authorization, create or update a portal draft using the generated material.
4. Read back all saved fields and compare them with the canonical contract.
5. With a separate explicit instruction, submit for review.
6. Route review findings to canonical owners and regenerate the candidate; do not patch only the
   portal when that would create drift.
7. After observed approval, require a separate explicit instruction to publish.
8. Read back the effective listing and perform bounded post-publication checks.

No CI job, package script or local builder logs into OpenAI, starts Persona verification, uploads
identity material, submits, publishes, changes availability or withdraws a listing.

## 11. Public Policies And Pages

Root `PRIVACY.md` and `TERMS.md` become canonical English public documents consistent with the
existing license, notice, trademark, support and security owners. Privacy states that the first
release operates no AGDF external service receiving conversations or repository data, distinguishes
OpenAI-hosted processing and user-authorized local/repository operations, and avoids promises about
systems AGDF does not control. Terms preserve Apache-2.0, independent-project, trademark, warranty,
non-certification and best-effort support boundaries.

Pages exposes stable support, privacy and terms routes by rendering or importing canonical content
through one established content adapter. It must not maintain independent policy prose. Link and
content-origin tests prevent drift. A successful local Pages build proves neither deployment nor
public URL reachability; those are captured separately before submission.

## 12. Diagnostics And Failure Behavior

| Code | Meaning | Required recovery |
|---|---|---|
| `AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID` | Canonical public distribution contract is missing, malformed or contradictory | Correct the canonical contract |
| `AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED` | A constrained directory name, short description or starter prompt exceeds current final-submission count/length limits | Revise the owning PRD/public contract; never truncate generated output |
| `AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING` | A final candidate declaration resolves to no shipped file or escapes the root | Correct source metadata or package composition and rebuild |
| `AGDF_PUBLIC_PLUGIN_VERSION_DRIFT` | Candidate owners disagree on exact AGDF version | Synchronize through the canonical version owner |
| `AGDF_PUBLIC_PLUGIN_CASE_SET_INVALID` | Reviewer cases are incomplete, unsafe or structurally invalid | Correct canonical reviewer cases |
| `AGDF_PUBLIC_PLUGIN_SURFACE_UNVERIFIED` | A claimed surface capability lacks the required exact-release evidence | Mark it unverified/advisory or obtain host evidence |
| `AGDF_PUBLIC_PLUGIN_PUBLISHER_UNVERIFIED` | Verified identity or Apps Management authority has not been positively observed | Complete/observe verification outside the repository; do not persist sensitive material |
| `AGDF_PUBLIC_PLUGIN_SUBMISSION_INCOMPLETE` | Required listing, legal, availability or review material is absent | Complete canonical submission inputs |
| `AGDF_PUBLIC_PLUGIN_EXTERNAL_STATE_STALE` | Portal/effective listing read-back does not match the intended state | Stop the transition, read back again and reconcile with the canonical owner |

These are diagnostics, not new AGDF gates. Deterministic candidate validation fails closed for
contract, path, version, case and submission completeness errors. Host, publisher and portal gaps
remain visibly unverified or blocked in their own evidence class.

## 13. Security And Privacy Controls

- The first release adds no AGDF network service, telemetry, account or service credential.
- Builders are offline-capable and receive no OpenAI or Persona credential.
- Candidate path resolution is root-bounded and rejects traversal and escaping symlinks.
- Fixtures use synthetic, non-sensitive data and require no private network.
- Review prompts request the least authority needed and preserve exact approval protection.
- Logs and artefacts redact tokens and exclude inquiry URLs, identity documents and session values.
- Public security reports follow `SECURITY.md`; sensitive reports are never routed to public issues.
- Capability and enforcement claims fail closed when direct exact-release evidence is absent.

## 14. Compatibility And Migration

Existing npm/local marketplace, Claude Code, OpenCode and GitHub Copilot distributions retain their
current composition and installation owners. The new submission projection is additive. The runtime
metadata repair changes only the isolated generated validator payload and removes invalid
declarations; it does not rename its manifest-owned runtime entrypoint or alter gate semantics.

Migration consists of regenerating package assets and validating both existing package paths and the
new public candidate. No installed cache is edited in place. Existing installed AGDF versions retain
their state until an explicitly authorized normal update/uninstall path changes them.

If an accepted OpenAI package constraint cannot represent Codex hooks together with the portable
skills bundle, the builder omits hooks from that accepted submission projection and declares them
unavailable there; it does not create a second skill-policy fork. Any material change to the public
promise routes back to PRD.

## 15. Verification Strategy

### Deterministic repository and bundle tests

- schema and contract validation for canonical public distribution metadata;
- Unicode code-point tests for the 30-character display name, 30-character short description,
  three-prompt maximum and 128-character per-prompt limit, including boundary and over-limit cases;
- generated manifest parity and identity/version coherence;
- exact final-inventory validation for every declared path and executable target;
- negative fixtures for missing, case-mismatched, escaping and unloadable paths;
- minimal runtime-manifest proof with no absent `bin`, script or export target;
- reviewer-case schema, at least five positive/three negative counts and required safety themes;
- capability matrix vocabulary, evidence reference and no-MCP boundary checks;
- public URL, policy-owner and Pages projection/link consistency;
- candidate exclusion tests for secrets, control state, local paths and sensitive identity material;
- two-build reproducibility comparison;
- existing Runtime Integrity, package-content, package-build, smoke and supported-surface regressions.

### Later live evidence

- exact-version Codex installation and representative positive/negative workflows;
- applicable ChatGPT installation and portable-core workflows with advisory/unverified boundaries;
- public Pages deployment/readability and listing-link checks;
- selected organization, verified identity and Apps Management authority read-back;
- portal draft field-by-field reconciliation, submission receipt and review result;
- after explicit publication, directory discoverability and bounded post-publication checks.

Deterministic tests may pass before live or portal evidence exists. Readiness reporting must preserve
that distinction and must not collapse an unperformed UAT into success.

## 16. Requirements Traceability

| PRD requirements | Design realization |
|---|---|
| PPD-01–PPD-05 | Canonical public distribution contract, independent-publisher copy and starter fit workflow |
| PPD-06–PPD-11 | Skills-first composition, one policy source, capability matrix, surface-specific hooks and durable authority boundary |
| PPD-12–PPD-16 | No implicit activation, fail-closed diagnostics, recovery and existing lifecycle ownership |
| PPD-17–PPD-21 | Canonical privacy/terms/support/security owners and stable Pages projections |
| PPD-22–PPD-26 | Complete submission contract, reviewer cases, skill scan inputs and explicit availability decision |
| PPD-27–PPD-31 | Exact staged inventory, runtime metadata repair, version coherence, compatibility and reproducible build |
| PPD-32–PPD-34 | Five evidence classes, exact-release host UAT and observed publisher authority |
| PPD-35–PPD-40 | External state model, explicit portal actions, remediation, publication verification, withdrawal and no release implication |

## 17. Rollback And Withdrawal

Before publication, rollback deletes or ignores the disposable generated candidate and corrects the
canonical source; no external state is assumed. After a portal draft or submission, an explicitly
authorized operator updates or withdraws through the portal and records effective read-back. After
publication, containment may stop new exposure through an authorized availability change or
withdrawal while a corrected candidate is built and reviewed.

Repository reversion, npm release changes and OpenAI withdrawal are independent operations. None
implicitly performs another. Retained installed copies and their supported status must be stated
honestly in any correction notice.

## 18. Task Plan Obligations

The Task Plan must decompose this design into reviewable tasks with acceptance evidence for:

1. the canonical public distribution schema and metadata;
2. reviewer cases and release-specific capability matrix;
3. privacy, terms and Pages projections;
4. deterministic builder, inventory and readiness report;
5. minimal runtime metadata and all-declaration package proof;
6. reproducibility, negative fixtures and existing-distribution regression coverage;
7. run-scoped readiness, UAT, portal and post-publication evidence templates;
8. Source of Truth Registry and documentation synchronization;
9. explicit pre-implementation Brownfield revalidation;
10. later external-action checkpoints that remain blocked until separately authorized.

TP must identify the exact accepted OpenAI submission package shape from current official
documentation before implementation. If that shape materially contradicts this design or changes
the public promise, work stops and routes to SD or PRD revision instead of adding a compatibility
shim or independently maintained fork.

## 19. Explicit Non-Goals

- automating OpenAI or Persona login, identity verification, portal submission or publication;
- adding an AGDF MCP server, hosted backend, telemetry or custom account;
- changing AGDF gate order, approval values or human authority;
- proving ChatGPT/Codex parity from repository tests;
- modifying installed plugin caches;
- combining npm publication with OpenAI directory publication;
- guaranteeing review acceptance, global availability or review timing.

## 20. Approval Boundary

Approval of this Solution Design permits drafting the Task/Test Plan only. It does not permit code,
policy or Pages implementation; creation or mutation of an OpenAI portal draft; Persona identity
actions; submission; publication; VCS delivery; npm release; deployment; or installed-cache changes.
