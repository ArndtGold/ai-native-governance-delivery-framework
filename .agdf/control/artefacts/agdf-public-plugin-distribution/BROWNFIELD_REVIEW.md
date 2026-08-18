# Brownfield Review: Public AGDF Plugin Distribution

Status: done  
Mode: `post_ur_review`  
Date: 2026-08-17  
Run: `agdf-public-plugin-distribution`

## Decision

- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: The scope introduces a public discovery, installation, first-use, capability,
  failure and support journey across ChatGPT and Codex, with public trust claims and surface-specific
  effective states.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready

## Scope Assessment

The approved UR is not a new plugin implementation from scratch. AGDF already has canonical plugin
metadata, ten workflow skills, Codex hooks, package composition, local marketplace installation,
release workflows, public product pages and host-evidence artefacts. The new outcome is a public
distribution and review contract layered onto those owners without creating a second AGDF policy or
an independently maintained OpenAI-specific fork.

## Existing Coverage And Reuse

| Area | Coverage | Existing owner or evidence | Reuse decision |
|---|---|---|---|
| Canonical plugin identity and capability metadata | fully_done | `plugin/meta/agdf-plugin.definition.json` | extend as the sole repository metadata owner; generate public manifest fields from it |
| Codex installable plugin manifest | partially_done | `plugin/.codex-plugin/plugin.json` | extend through the canonical definition; do not hand-maintain submission-only drift |
| Workflow skills and governance contracts | fully_done | `plugin/skills/`, `plugin/meta/contracts/`, router | reuse unchanged unless approved public review findings require scoped corrections |
| Codex lifecycle hooks | fully_done for existing Codex package | `plugin/hooks/`; Runtime Integrity | retain as a Codex-specific capability candidate; do not assume ChatGPT execution or trust |
| Release-built plugin composition | fully_done for current npm/local-marketplace path | `create-agdf/scripts/sync-package-assets.js`; `automatic-version-asset-sync` | extend the existing build owner for any public submission bundle |
| Source and installed-layout integrity | partially_done | `plugin/scripts/check-runtime-integrity.mjs`; package build/layout tests | extend to validate all declared metadata entrypoints against the final shipped file inventory |
| npm package inventory | partially_done | `create-agdf/scripts/package-contents-test.js` | reuse dry-run inventory; current assertions cover selected required files but not every declared `bin` or script target |
| Public product copy and visuals | partially_done | `pages/src/data/site.ts`; `pages/src/pages/index.astro`; existing plugin screenshots | extend current Pages owners with public-directory positioning and accurate surface boundaries |
| Public support and security | fully_done for repository/community routing | `SUPPORT.md`; `SECURITY.md`; `CG-PUBLIC-COMMUNITY-GOVERNANCE` | link and extend only where submission URLs require stable web routes |
| Privacy and terms material | not_done | no repository privacy or terms owner found | create canonical public documents/routes after PRD defines scope and claims |
| Public submission listing and reviewer cases | not_done | no submission package or portal draft owner found | add one repository-owned submission-readiness artefact set derived from canonical metadata |
| Current live-host evidence | partially_done | `agdf-live-host-conformance-matrix`; Codex/Claude/OpenCode evidence | reuse methodology and Codex evidence, add applicable ChatGPT plugin evidence; do not flatten unavailable states |
| OpenAI publisher and portal state | not_done / external | OpenAI organization identity, Apps Management permission and submission portal | treat as external effective state requiring explicit authorized read-back and later action |
| Publication and rollback | partially_done for npm; not_done for universal directory | `.github/workflows/publish-agdf.yml`; existing release boundaries | preserve existing release owner and design a separately authorized public-directory publish/rollback path |

## Existing Owners And Source-Of-Truth Boundaries

- `plugin/meta/agdf-plugin.definition.json` remains the canonical repository owner for plugin
  identity, descriptive copy, skills, hooks, capability metadata and generated manifest inputs.
- `plugin/.codex-plugin/plugin.json` remains a generated or synchronized installable projection, not
  a second submission-copy authority.
- `plugin/skills/`, `plugin/meta/contracts/` and the router remain the sole governance and workflow
  policy owners. A public package must consume them without re-authoring gates.
- `create-agdf/scripts/sync-package-assets.js`, package tests and publish workflows own build and
  release composition. A public submission bundle must extend this path rather than add an unrelated
  packager.
- Pages data and page composition own the public website presentation. Repository root support,
  security, license, governance and trademark files own their respective public contracts.
- OpenAI's verified publisher identity, review result, directory listing and publication state are
  external effective state. Repository artefacts may describe desired state and retain evidence but
  cannot prove those host states.

## Impact And Regression Surface

- Product contract: public name, descriptions, capabilities, limitations, supported surfaces,
  support route, privacy and terms.
- User journeys: discovery, install, first prompt, repository activation, ready/blocked/unavailable
  outcomes, revision or uninstall, and support/recovery.
- Package and runtime: public submission file tree, skills, hooks, scripts, assets and manifest paths.
- Host behavior: shared directory discovery plus different effective behavior in ChatGPT and Codex;
  Codex-only hooks are explicitly surface-specific in current OpenAI documentation.
- External authority: verified publisher identity, Apps Management access, review submission,
  approval, publication, regional availability and later rollback.
- Release compatibility: npm/local-marketplace distribution must remain valid while the public
  directory is added; existing Claude Code, OpenCode and Copilot semantics must not drift silently.
- Required evidence: source checks, clean built bundle inventory, local-marketplace installation,
  Codex host UAT, applicable ChatGPT host UAT, reviewer test cases, portal read-back and post-publish
  observation when separately authorized.

## Reuse Strategy

- extend: canonical plugin definition, manifest generator, package inventory validation, Pages,
  public community documents, live-host conformance methodology and release evidence.
- new: repository-owned submission-readiness material, public privacy/terms owners if PRD confirms
  them, ChatGPT/Codex public capability matrix and public-directory external-state evidence.
- refactor: only if later design proves current manifest generation cannot express the official
  submission contract cleanly.
- replace: none.

## Parallel-Structure And Drift Risks

- A portal-only copy of descriptions, prompts or capabilities could drift from the canonical plugin
  definition.
- A separate skills-only fork could become a second AGDF policy owner.
- ChatGPT discovery could be presented as full Codex runtime parity even when hooks, filesystem,
  repository activation or validators are unavailable.
- Public privacy, terms and support pages could duplicate or contradict repository-owned policies.
- Source Runtime Integrity can pass while final package metadata points to files that are not shipped.
- Repository readiness can be mistaken for publisher verification, review approval, publication or
  post-publication behavior.

## UI And UX Routing

High UI/UX impact is present because the public plugin adds several visible working modes and
effective states across two supported products. Before PRD readiness, UX Intent Definition must
define the intended discovery/install/activation journey, state ownership, blocked and unavailable
states, recovery, support and cross-surface transitions. It may propose PRD criteria but cannot decide
publisher authority or authorize submission.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers:
  - external_contract_depth: Public listing, capability, legal/support and compatibility claims
    become an external contract reviewed and consumed independently.
  - release_cross_host_depth: Submission, review, publication, regional availability, update and
    rollback span repository, OpenAI portal, ChatGPT and Codex boundaries.
  - authority_policy_security_depth: Verified publisher identity, portal roles, privacy/terms and
    public trust claims add external authority and policy decisions.
- rejected_alternative: `structured_slice` is rejected because public contract, external authority,
  cross-host release and rollback cannot be contained in an independently reversible local slice.
- missing_or_conflicting_facts: none for depth selection; product choices remain for UX Intent and PRD.
- depth_evidence_refs: approved UR; current official OpenAI plugin architecture and submission
  documentation inspected 2026-08-17; `plugin/meta/agdf-plugin.definition.json`;
  `.github/workflows/publish-agdf.yml`; `automatic-version-asset-sync`;
  `agdf-live-host-conformance-matrix`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-PUBLIC-COMMUNITY-GOVERNANCE`.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One submission-ready public AGDF distribution has a clear UR acceptance boundary. |
| `authority_boundary` | fail | Verified publisher identity, portal permissions, review and publication introduce external authority and policy boundaries. |
| `owner_consumer_coordination` | fail | Repository owners, OpenAI review, ChatGPT, Codex and public users require coordinated contract and release handling. |
| `full_depth_impacts_absent` | fail | External contract, release, cross-host and authority impacts are directly evidenced. |
| `migration_propagation_bounded` | fail | Existing npm/local marketplace distribution must coexist with and propagate into a separately reviewed universal-directory version. |
| `failure_recovery_local` | fail | Review rejection, publication failure, delisting and rollback include OpenAI-owned state outside the repository. |
| `independently_acceptable` | fail | Repository readiness is useful evidence but does not independently deliver or accept the public-directory outcome. |

## Context Graph Impact

- situation: AGDF is adding a new public distribution and authority boundary shared by repository
  sources, the OpenAI submission portal, ChatGPT, Codex and public users.
- context_graph_impact: new_node_required
- context_graph_refs: pending `CG-PUBLIC-PLUGIN-DISTRIBUTION`; link existing
  `CG-CREATE-AGDF-CLI-COMPOSITION`, `CG-NATIVE-INTERACTION-AUTHORITY` and
  `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_reconciliation: open_gap
- context_graph_required_action: create
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes own release-built composition, host interaction authority
  and public community policy, but none owns the universal-directory desired/effective state,
  publisher authority and public surface-capability contract together.

## Transparency

Quick Task and Verified Change are ineligible because this is new public product semantics with
external contract, authority, release and cross-host effects. Structured Slice is insufficient even
though the product outcome is coherent: the decisive effects cannot be delivered or recovered
inside one bounded repository slice. Structured Delivery is selected for the public contract and
release design; it does not authorize a large undifferentiated implementation or any portal action.

## Missing Evidence And Product Decisions

- Exact ChatGPT filesystem, skill, hook and repository-activation behavior for the applicable public
  plugin surface remains unobserved.
- The current publisher verification and Apps Management permission state is external and has not
  been inspected or changed.
- Public package shape, hook inclusion, support commitment, data-handling statement, regional
  availability and rollout policy remain PRD decisions.
- The current final-package metadata gap must be reproduced or closed against the later candidate;
  prior installed-package observations are not treated as current proof.

## Required Next Step

The required UX Intent Definition is ready as non-authorizing PRD input. Draft the PRD for the
public product, submission, evidence and external-authority contract and request `Approval: PRD`.
Implementation, submission, publication, release and VCS actions remain forbidden.
