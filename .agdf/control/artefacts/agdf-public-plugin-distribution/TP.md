# Task And Test Plan: Public AGDF Plugin Distribution

Status: approved
Revision: 4
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

Revision 4 was approved with exact `Approval: TP` on 2026-08-18 after revalidation of the selected
run, current gate, revision and durable artefact.

## 1. Planning Decision And Resolved Constraint

Solution Design Revision 4 is approved. It preserves the completed Revision 3 plan and adds a
bounded bilingual-handbook delta: migrate the current German handbook to its canonical language
root, create a natural reviewed English edition, preserve known legacy links as navigation-only
projections and extend the existing community-health validator with deterministic parity checks.
Tasks PPD-T01 through PPD-T20 remain the historical approved baseline; PPD-T21 through PPD-T24 are
the only new implementation tasks in this revision.

Initial planning against current official OpenAI plugin
documentation identified these final-directory constraints:

- final directory `interface.displayName` is limited to 30 characters; the approved customer-facing
  name `AI Governance & Delivery Framework` has 34 characters;
- final directory `interface.shortDescription` is limited to 30 characters; the current canonical
  value has 51 characters;
- final directory `interface.defaultPrompt` accepts at most three prompts of at most 128 characters;
  the current definition has four prompts and its first prompt has 336 characters.

The user retained **AGDF** as the constrained directory label and approved PRD/SD Revision 3 for a
narrow copy correction. The canonical local/package description becomes **Control layer for
governed AI-assisted delivery.** The public short description becomes **Governed AI delivery
controls** (29 Unicode code points). The strategic `longDescription`, public prompts, capability
contract and every external-action boundary remain unchanged. Implementation remains forbidden
until exact `Approval: TP` for Revision 4 and passing pre-implementation Brownfield Analysis.

The verified submission form for the first release is **Skills only**. The submitted installable
tree is rooted at the plugin directory, requires `.codex-plugin/plugin.json`, contains the final
`skills/` tree and may contain supported assets and lifecycle hooks. It contains no `.app.json`,
`.mcp.json`, MCP endpoint, AGDF account or AGDF-operated service. Portal-only materials include
listing fields, verified developer identity selection, starter prompts, five positive and three
negative cases, availability and release notes.

Official sources revalidated 2026-08-17:

- `https://developers.openai.com/plugins/build/plugins`
- `https://developers.openai.com/plugins/deploy/submission`
- `https://developers.openai.com/plugins/deploy/submission-errors#listing-and-interface-errors`

## 2. Implementation Boundary

After an approved PRD/SD revision and exact `Approval: TP`, implementation may change only the
canonical public-distribution, legal/public-site, package-builder, package-validation, evidence and
documentation owners named below. It may not create a portal draft, submit, publish, perform Persona
verification, release npm, deploy Pages, modify installed caches or perform VCS delivery.

Before CD+Tests, the mandatory pre-implementation Brownfield Analysis must revalidate current
owners, active package/release work, Pages structure, generated-file boundaries and unrelated
worktree changes. Any changed official OpenAI limit or accepted package shape stops implementation
and routes to the owning PRD, SD or TP revision.

For the Revision 4 delta, that analysis must also inspect current handbook files, inbound links,
the existing community-health validator and test fixtures, the Source of Truth Registry and any
unrelated documentation changes. The implementation may move and translate handbook content only;
it may not translate Runtime Contract files or create another workflow authority.

## 3. Planned Implementation Tasks

| Task ID | Task | Planned owner area | Acceptance mapping | Required evidence | Stop condition |
|---|---|---|---|---|---|
| PPD-T01 | Change canonical `description` to `Control layer for governed AI-assisted delivery.` and constrained `publicDistribution.shortDescription` to `Governed AI delivery controls`; regenerate Codex, Claude and public projections without changing shared `longDescription`, display names, prompts, hooks or capability metadata. | `plugin/meta/agdf-plugin.definition.json`, canonical manifest projector and generated manifests | PPD-01–PPD-05, PPD-22 | Exact local/public projection assertions, 29-code-point public length, duplicate-owner rejection and generated-manifest parity | Any wording is truncated, independently duplicated, projected to the wrong surface or changes the strategic long copy |
| PPD-T02 | Extend the canonical plugin definition with one bounded public-distribution object for Skills-only submission type, public URLs, publisher target/state, category, listing copy, prompts, availability, release notes, reviewer cases and capability-matrix references. | `plugin/meta/agdf-plugin.definition.json` | PPD-01–PPD-08, PPD-17, PPD-21–PPD-26, PPD-29 | Schema/contract tests and canonical-owner review | Gate/skill policy is duplicated or portal state becomes repository authority |
| PPD-T03 | Generate the richer `.codex-plugin/plugin.json` interface from the canonical definition, including public website, privacy, terms and support URLs, compliant prompt count/length and exact relative component paths. | existing manifest projection/sync owner | PPD-01–PPD-03, PPD-07–PPD-09, PPD-17, PPD-21–PPD-22, PPD-27–PPD-29 | Generated parity test and final-submission constraint validation | Manifest is edited as an independent policy source or claims MCP/ChatGPT-Codex parity |
| PPD-T04 | Create canonical English `PRIVACY.md` consistent with the no-MCP/no-AGDF-service release and OpenAI-hosted versus user-authorized local/repository processing boundary. | root public policies | PPD-17, PPD-19–PPD-20, PPD-34 | Policy review and cross-policy contradiction test | Policy promises facts about OpenAI processing or requests/stores Persona material |
| PPD-T05 | Create canonical English `TERMS.md` consistent with Apache-2.0, `NOTICE`, `TRADEMARKS.md`, `SUPPORT.md`, `SECURITY.md`, no warranty, no certification and no SLA. | root public policies | PPD-17–PPD-20 | Policy review and canonical cross-link/contradiction test | Terms change software license or create certification/service promises |
| PPD-T06 | Add stable `https://agdf.iself.eu/privacy`, `/terms` and `/support` routes that resolve to the canonical GitHub documents through one explicit Pages redirect/adapter, without duplicating policy prose. Fix site-domain metadata to `agdf.iself.eu` and expose the three links in visible navigation/footer. | `pages/`, Cloudflare Pages static routing | PPD-03, PPD-17–PPD-21 | local Pages build, route/redirect assertions, link/accessibility inspection; live deployment remains separate evidence | Canonical content is forked into Pages or local build is called deployment proof |
| PPD-T07 | Add a concise public OpenAI-plugin section describing Skills-only/no-MCP composition, shared portable core, Codex-specific trusted hooks, ChatGPT advisory boundaries, independent publisher and installation/publication state. | canonical Pages data/content adapter | PPD-02–PPD-06, PPD-08–PPD-12, PPD-14, PPD-21 | rendered-content assertions and visible inspection at desktop/mobile breakpoints | Site claims publication, enforcement, parity or certification without evidence |
| PPD-T08 | Create the release-specific capability matrix with allowed state vocabulary, exact evidence-class references and explicit common/Codex/ChatGPT/advisory/unavailable/unverified rows. | `plugin/submission/openai/capability-matrix.json` | PPD-06–PPD-11, PPD-14, PPD-30, PPD-32–PPD-33 | schema validation and claim-to-evidence checks | A strong capability claim lacks exact-release host evidence |
| PPD-T09 | Create reviewer-case sources with at least five positive and three negative cases, synthetic fixtures, prerequisites, expected workflow/result shape and refusal/clarification rationale. | `plugin/submission/openai/reviewer-cases.json` | PPD-04–PPD-05, PPD-12–PPD-15, PPD-23–PPD-25 | structure/count/theme tests; no-private-context scan | Case needs secrets, MFA, private network, internal repository context or unsafe authority |
| PPD-T10 | Create release-note source and explicit availability decision record for the initial submission, with publisher/support/legal readiness prerequisites. | `plugin/submission/openai/release-notes.md` plus canonical distribution metadata | PPD-22, PPD-26, PPD-29, PPD-35 | completeness/version tests and review checklist | Availability is inferred as global or publisher readiness is asserted without read-back |
| PPD-T11 | Implement focused public-plugin contract, build, validation and report modules with a thin script wrapper; keep network and portal operations absent. | `create-agdf/lib/public-plugin/`, `create-agdf/scripts/` | PPD-07, PPD-22–PPD-31, PPD-35–PPD-37, PPD-40 | unit tests, offline execution proof and code review | Module submits, authenticates, publishes, deploys or embeds a second policy owner |
| PPD-T12 | Stage a clean deterministic candidate at `create-agdf/generated/submissions/openai/agdf/` containing the accepted Skills-only plugin tree, listing/readiness projection, reviewer material, sorted inventory and digests. Integrate through existing package sync/prepack composition. | `create-agdf/scripts/sync-package-assets.js` and focused builder | PPD-06–PPD-09, PPD-22–PPD-31 | exact tree snapshot, two-build comparison and package regression | Candidate includes control state, secrets, absolute paths, caches, Persona data, `.app.json` or `.mcp.json` |
| PPD-T13 | Replace copied source-package metadata in the isolated local-validator payload with a minimal generated ESM runtime manifest containing only shipped declarations and exact version. | `create-agdf/scripts/sync-plugin-runtime.js` | PPD-27–PPD-30 | runtime load test and manifest-to-inventory proof | Existing validator entrypoint or other distribution semantics change unintentionally |
| PPD-T14 | Validate every declared skill, hook, asset, manifest path, runtime entry, export, bin and shipped script against the final candidate/payload, including root containment, case match and loadability. | focused candidate validator and package tests | PPD-09, PPD-14, PPD-27–PPD-29, PPD-31 | positive inventory proof plus missing/case/traversal/symlink/unloadable negative tests | Selected-file allowlist is mistaken for all-declaration proof |
| PPD-T15 | Produce a machine-readable and readable readiness report that keeps repository, bundle, installed-host, portal and post-publication evidence separate and renders absent live evidence as unverified. | focused report module; run evidence templates | PPD-14–PPD-15, PPD-32–PPD-40 | report contract tests and incomplete-state snapshots | Unperformed UAT, identity verification, portal action or publication becomes pass |
| PPD-T16 | Add run-scoped templates/checklists for exact-version Codex and applicable ChatGPT UAT, publisher/Apps Management read-back, portal draft reconciliation and post-publication checks without sensitive fields. | `.agdf/control/artefacts/agdf-public-plugin-distribution/` | PPD-32–PPD-39 | template field validation and sensitive-key negative tests | Persona inquiry URL, document, image, token or session value can be recorded |
| PPD-T17 | Update Source of Truth Registry, README/install/package documentation and support routing after owners exist, preserving one policy source and distinguishing local marketplace, npm, workspace and universal public directory. | `.agdf/control/SOT_REGISTRY.md`, public docs | PPD-07, PPD-16–PPD-21, PPD-29–PPD-30, PPD-35–PPD-40 | link/terminology/owner consistency checks | Documentation claims effective submission/publication or overwrites current distribution paths |
| PPD-T18 | Integrate focused public-candidate validation into package preparation and the appropriate CI/readiness workflow without adding portal mutation or coupling npm publication to OpenAI publication. | `create-agdf/package.json`, CI/package workflow | PPD-25, PPD-27–PPD-31, PPD-35–PPD-40 | CI command contract tests and workflow inspection | CI receives portal credentials or changes external directory state |
| PPD-T19 | Execute pre-implementation Brownfield Analysis, CD+Tests, Task Plan Review, Clean Implementation Review and Code Review with all findings resolved or routed before QA. | AGDF run artefacts | PPD-01–PPD-44 | mandatory review artefacts and full task/evidence mapping | Any task is partial, unverified, scope-expanded or supported only by source assertions |
| PPD-T20 | Run QA using repository and exact-bundle evidence only; keep live-host, publisher, portal, deployment and post-publication items visibly pending until separately executed and authorized. | QA and later UAT/OR artefacts | PPD-32–PPD-40 | QA decision with explicit evidence boundary | QA pass implies submission, publication, deployment, VCS delivery or external authority |
| PPD-T21 | Create the neutral `docs/handbook/` selector, move the seven current German chapter roles to `docs/handbook/de/` and replace every former `docs/agenten-handbuch/` content path with a bounded link-only compatibility projection. | `docs/handbook/`, `docs/agenten-handbuch/` | PPD-41–PPD-42 | exact inventory, repository link scan, compatibility-file no-prose check and readable selector inspection | German handbook prose exists in both canonical and legacy locations, a known inbound link breaks or a chapter role is lost |
| PPD-T22 | Translate all seven canonical German chapters into clear natural English under `docs/handbook/en/`, preserving exact protected values and adding per-chapter `translation_of`, SHA-256 `source_revision` and reviewed-state metadata. | `docs/handbook/de/`, `docs/handbook/en/` | PPD-41, PPD-43–PPD-44 | one-to-one mapping, digest proof, protected-content comparison and recorded human semantic review | English becomes an independent owner, literal wording obscures meaning, a stronger capability claim appears or review is unrecorded |
| PPD-T23 | Extend the existing community-health validator and negative-test harness to fail closed on chapter-count, mapping, source-digest, review-state, protected-token, fenced-code, semantic-boundary, prohibited-legacy-wording and link drift. | `scripts/check-community-health.mjs`, `scripts/community-health-test.mjs` | PPD-41–PPD-44 | passing baseline plus isolated negative fixtures for every new failure class | Validation creates a second semantic model, silently normalizes values or accepts stale/unreviewed translation |
| PPD-T24 | Update root documentation, support routing, Source of Truth Registry and Context Graph references to the intended language/selector while preserving the German-canonical and English-derived relationship. | root docs, `.agdf/control/SOT_REGISTRY.md`, `.agdf/control/CONTEXT_GRAPH.md` | PPD-21, PPD-41–PPD-44 | repository-wide link/owner scan, SoT review and Context Graph reconciliation | A consumer points to deleted content, English is described as canonical or external publication/deployment is implied |

## 4. Automated Test Plan

| Test ID | Assertion | Task coverage |
|---|---|---|
| PPD-V01 | Public metadata schema accepts the approved Skills-only contract, asserts exact local/public descriptions and rejects missing listing, publisher-target, URL, prompt, case, availability and evidence fields. | T01–T03, T08–T10 |
| PPD-V02 | Final-directory constraints enforce display name ≤30, exact 29-code-point public short description, developer name ≤80, at most three prompts and each prompt ≤128 Unicode code points. | T01–T03 |
| PPD-V03 | Manifest paths begin with `./`, stay within candidate root and resolve with exact case. | T03, T12, T14 |
| PPD-V04 | Skills-only candidate contains `.codex-plugin/plugin.json` and final `skills/`; it contains no MCP/app configuration or AGDF network-service declaration. | T02–T03, T12 |
| PPD-V05 | Privacy/terms/support/website URLs are HTTPS, publisher-consistent and represented in both manifest/readiness output. | T03–T06 |
| PPD-V06 | Privacy and terms match canonical license, marks, support, security, no-service, non-certification and no-SLA boundaries. | T04–T05 |
| PPD-V07 | Pages builds statically; `/privacy`, `/terms` and `/support` resolve through the configured canonical adapter; visible links and `agdf.iself.eu` metadata are present. | T06–T07 |
| PPD-V08 | Reviewer material contains at least five positive and three negative cases with required fields and all mandated safe-failure themes. | T09 |
| PPD-V09 | Fixtures contain no secret patterns, private endpoints, identity data, MFA dependency or local absolute path. | T09, T12, T16 |
| PPD-V10 | Capability matrix accepts only common, Codex-specific, ChatGPT-specific, advisory, unavailable and unverified states and requires evidence provenance for stronger states. | T08, T15 |
| PPD-V11 | Final candidate inventory proves every manifest, skill, hook, asset, runtime, bin, export and shipped-script target; negative fixtures fail for missing, case mismatch, traversal, escaping symlink and unloadable module. | T12–T14 |
| PPD-V12 | Generated runtime package manifest has exact version and ESM type and declares no absent target; local validator loads and passes resolve-only from the built payload. | T13–T14 |
| PPD-V13 | Two clean candidate builds are content-equivalent after the documented non-semantic archive exclusion. | T11–T12 |
| PPD-V14 | Readiness report never upgrades absent host, publisher, portal, deployment or publication evidence from unverified/pending. | T15–T16, T20 |
| PPD-V15 | Sensitive-key tests reject Persona inquiry/session URL, identity-document/image, token, cookie and raw credential fields in evidence artefacts and logs. | T11–T12, T15–T16 |
| PPD-V16 | Existing Runtime Integrity, local validator, local marketplace, package-build, package-contents, lifecycle, routing, skill-eval and full smoke suites remain green. | T03, T11–T14, T17–T18 |
| PPD-V17 | CI/workflow inspection proves no OpenAI/Persona credential, portal request or coupled npm/directory publish step exists. | T11, T18 |
| PPD-V18 | Task Plan Review maps every PPD-01–PPD-44 criterion to completed implementation and visible evidence or to a clearly pending separately authorized external action. | T19–T24 |
| PPD-V19 | Handbook inventory contains one neutral selector, exactly seven canonical German roles, exactly seven derived English roles and link-only compatibility projections for every former handbook path. | T21, T24 |
| PPD-V20 | Each English chapter maps to one existing German file and its declared lowercase `sha256:<hex>` source revision equals the digest recomputed from the exact German bytes. | T22–T23 |
| PPD-V21 | Missing, malformed, duplicate, stale or non-reviewed translation metadata fails independently with the handbook translation diagnostic. | T22–T23 |
| PPD-V22 | Exact approval values, CLI commands, Mode/Slice values, paths, normative identifiers and complete fenced code blocks remain unchanged between mapped chapters. | T22–T23 |
| PPD-V23 | German and English semantic assertions preserve scope, authority, gate, recovery and evidence boundaries; negative fixtures reject prohibited legacy wording and any strengthened host, submission, enforcement or release claim. | T22–T23 |
| PPD-V24 | All language-local, selector, root-document and compatibility links resolve; compatibility files contain navigation only and no duplicated handbook semantics. | T21, T23–T24 |
| PPD-V25 | Existing community-health baseline and negative suite, Runtime Integrity and applicable documentation/package smoke tests remain green after migration. | T21–T24 |

## 5. Manual And Live Evidence Plan

These checks are not deterministic repository tests and may not be marked complete during CD+Tests
unless directly performed in the named environment:

| Evidence ID | Check | Preconditions | Evidence boundary |
|---|---|---|---|
| PPD-L01 | Inspect built candidate tree and listing preview for truthful identity, copy, assets, links and exclusions. | Passing exact-bundle validation | Bundle evidence only |
| PPD-L02 | Install the exact candidate in Codex and exercise proportional fit, governed progression, missing approval, status and closeout cases. | Approved implementation and safe test repository | Exact Codex host only |
| PPD-L03 | Install/test the accepted portable Skills-only candidate in applicable ChatGPT surface and exercise advisory/unsupported boundaries. | Surface availability and exact candidate | Exact ChatGPT host/account context only |
| PPD-L04 | Observe deployed website, privacy, terms and support routes including mobile/keyboard/readability checks. | Separately authorized Pages deployment | Public deployment evidence only |
| PPD-L05 | Observe selected OpenAI organization, Apps Management Write and verified publisher identity. | User completes verification outside repository | Portal prerequisite only; no Persona material retained |
| PPD-L06 | With explicit user authorization, create/update portal draft and compare every saved field to canonical material. | Repository/bundle readiness plus L04/L05 | Portal draft only; no submission implied |
| PPD-L07 | With separate explicit authorization, submit and record receipt/review outcome. | Complete reconciled draft | Submitted/review state only |
| PPD-L08 | After approval and separate explicit authorization, publish, read back discoverability and run bounded positive/negative checks. | Observed OpenAI approval | Post-publication exact context only |
| PPD-L09 | A human reviewer compares every English chapter with its mapped German source for natural reading flow and preserved scope, authority, safety, recovery and evidence meaning. | Passing V19–V25 and complete English candidate | Repository review evidence only; does not prove host, portal or publication state |

## 6. Implementation Order

1. Approve TP Revision 4 and revalidate handbook owners, inbound links, validators, control-state
   references and worktree isolation through pre-implementation Brownfield Analysis.
2. Move the German source, create the neutral selector and install link-only compatibility projections.
3. Produce the seven English translations with exact source-digest metadata and protected values.
4. Extend semantic, parity, metadata and link validation with isolated negative fixtures.
5. Complete human semantic review, update documentation/SoT/Context Graph references and record evidence.
6. Run complete regressions, Task Plan Review, Clean Review, Code Review and QA.
7. Perform live host, deployment, identity, portal, submission and publication steps only at their
   separately authorized checkpoints.

## 7. Requirement Coverage

| PRD range | Tasks | Verification |
|---|---|---|
| PPD-01–PPD-05 | T01–T03, T07, T09 | V01–V02, V05, V07–V09 |
| PPD-06–PPD-11 | T02–T03, T07–T08, T12 | V03–V04, V10–V11, L02–L03 |
| PPD-12–PPD-16 | T03, T07, T09, T15–T16 | V08–V10, V14–V15, L02–L03 |
| PPD-17–PPD-21 | T02–T07, T17 | V05–V07, V16, L04 |
| PPD-22–PPD-26 | T02–T03, T08–T10, T12 | V01–V05, V08–V10, L01 |
| PPD-27–PPD-31 | T03, T11–T14, T18 | V03–V04, V11–V13, V16–V17 |
| PPD-32–PPD-34 | T08, T15–T16, T20 | V10, V14–V15, L02–L05 |
| PPD-35–PPD-40 | T10–T12, T15–T20 | V14–V18, L05–L08 |
| PPD-41–PPD-44 | T19, T21–T24 | V18–V25, L09 |

## 8. QA Blocking Conditions

QA cannot pass while any of the following applies:

- unresolved PRD/SD product identity or official submission-shape conflict;
- incomplete task, requirement or visible-evidence mapping;
- final candidate contains an unresolved or escaping declared path;
- runtime metadata declares an absent target;
- privacy, terms, support or website route is missing, contradictory or not publicly observed where
  deployment evidence is claimed;
- capability claim exceeds exact-release host evidence;
- reviewer case count/theme/fixture safety is incomplete;
- candidate reproducibility or existing-distribution regression fails;
- sensitive identity or credential material appears in source, bundle, logs or evidence;
- repository/bundle evidence is presented as publisher, portal, publication or live-host proof;
- either handbook edition lacks a chapter role, an English source digest is stale, protected values
  or fenced code diverge, human semantic review is absent, or translation strengthens an authority,
  enforcement, submission, host or release claim;
- compatibility paths retain duplicate handbook prose or any known repository handbook link breaks;
- any portal, deployment, submission, publication, release or VCS action occurred without explicit
  authority.

## 9. Out Of Scope

- OpenAI or Persona automation;
- MCP server, AGDF backend, telemetry, account or service authentication;
- automatic Pages deployment, portal draft, submission, publication or withdrawal;
- automatic npm release, commit, push or pull request;
- installed-cache edits;
- Runtime Contract translation, automatic translation publication or independent English workflow policy;
- ChatGPT/Codex parity claims without direct evidence;
- broad redesign of the existing AGDF website or unrelated distribution surfaces.

## 10. Required Next Step

Review TP Revision 4 and provide exact `Approval: TP`, request revision or decline. Approval permits
only pre-implementation Brownfield Analysis for the bilingual handbook delta. Implementation starts
only if that internal step passes. Portal, deployment, submission, publication, release and VCS
actions remain separately unauthorized.
