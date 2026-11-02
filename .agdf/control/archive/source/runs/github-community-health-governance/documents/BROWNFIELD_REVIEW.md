# Brownfield Review: GitHub Community Health And Maintainer Governance

Status: done
Mode: post_ur_review
Date: 2026-07-23
Run: `github-community-health-governance`

## Decision

- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: The change creates several public interaction and recovery paths for contributors, security reporters and maintainers, including a safety-relevant confidential-disclosure path and host-owned repository settings.
- ux_intent_definition_required: yes

## Scope

Establish the public Community Health and maintainer-governance surface without changing AGDF runtime, gate or release semantics. The work spans repository-owned policy and templates plus GitHub-owned metadata and capabilities, so it cannot be treated as a single-document or checkbox-only change.

## Existing Coverage

| Area | Coverage | Evidence | Reuse decision |
|---|---|---|---|
| Product identity and public positioning | fully_done | `README.md`, `NOTICE`, `TRADEMARKS.md` | extend links and routing; do not restate product identity |
| Installation and runtime support boundaries | fully_done | `INSTALL.md` | link from contribution and support guidance |
| Release ownership and validation | fully_done | `RELEASE.md`, `.github/workflows/publish-agdf.yml` | reference the existing release owner |
| CI and generated-asset integrity | fully_done | `.github/workflows/agdf-guardrails.yml`, `create-agdf/scripts/sync-package-assets.js` | extend the existing guardrail workflow with focused validation |
| Public contact and repository link | partially_done | `pages/src/data/site.ts` exposes `agdf@iself.eu` and the repository URL | reuse only after the contact channel's support and security purpose is decided |
| Contribution invitation | partially_done | `README.md` welcomes discussions, issues, examples and pull requests | replace the informal invitation with authoritative routing links |
| GitHub collaboration capabilities | partially_done | public GitHub API reports Issues and Discussions enabled | use existing capabilities after PRD defines their roles |
| Community Profile | not_done | GitHub Community Profile reports 28 percent with only README and License recognized | add the applicable standard files in GitHub-recognized locations |
| Repository metadata | not_done | public GitHub API reports no description, homepage or topics | configure truthful metadata as a separate host-owned delivery action |
| Conduct, contribution, security, support and governance policies | not_done | no corresponding repository files exist | create project-specific canonical documents |
| Structured issue and pull-request intake | not_done | no issue forms or pull-request template exist | create forms and templates around the approved interaction model |

## Existing Owners And Boundaries

- `README.md` owns the public repository entry and high-level routing.
- `INSTALL.md` owns supported installation and runtime behavior.
- `RELEASE.md` and `.github/workflows/publish-agdf.yml` own release procedure and evidence.
- `.github/workflows/agdf-guardrails.yml` owns repository validation on pushes and pull requests.
- `plugin/meta/contracts/`, `plugin/` and `create-agdf/` own runtime, gate, generated-asset and capability truth; community documents must link to these owners rather than reinterpret them.
- `pages/src/data/site.ts` owns the public website contact and repository references.
- `LICENSE`, `NOTICE` and `TRADEMARKS.md` own existing legal and mark-use boundaries.
- GitHub repository settings own description, homepage, topics, Discussions and private vulnerability reporting; repository files cannot prove those settings were applied.

## Reuse Strategy

- extend: README routing, guardrail validation, Source-of-Truth Registry and existing public website/contact references.
- new: code of conduct, contribution policy, security policy, support policy, governance policy, issue forms and pull-request template.
- refactor: none required by current evidence.
- replace: none.

## Impact And Regression Surface

- Files and modules: root public-policy documents, `.github/` templates and workflow validation, README routing, SOT Registry and Context Graph.
- Host state: GitHub description, homepage, topics and applicable security/community capabilities.
- Interfaces: contributor, security reporter, support requester and maintainer workflows.
- Data or migrations: none.
- Runtime and CLI compatibility: no behavior change is intended; public copy must remain consistent with current runtime capabilities.
- Release compatibility: release authority and package workflows remain unchanged.
- Required validation: Markdown links, YAML syntax and form schemas, required issue/PR fields, project-specific placeholder checks, contact/link consistency, existing guardrails, and post-default-branch Community Profile observation.

## Parallel-Structure And Drift Risks

- A generic contribution guide could duplicate runtime, release or generated-asset rules and become a second source of truth.
- `SECURITY.md` could promise response capacity that the project has not decided or cannot sustain.
- Repository files and GitHub-hosted metadata can drift because they require separate delivery mechanisms.
- A CODEOWNERS file or maintainer list would create false authority if derived only from current administrative permissions.
- Support email, Issues and Discussions require an explicit routing model to avoid overlapping intake.

## Product Decisions For PRD

- Exact supported-security-versions policy.
- Preferred confidential reporting channel and fallback.
- Truthful acknowledgement and response targets, including whether numeric targets should be published at all.
- Issues versus Discussions versus email boundaries.
- Maintainer roles for triage, merge, release, conduct enforcement and security response.
- CLA, DCO or no contributor sign-off.
- Required disclosure for AI-assisted contributions.
- Primary language and translation policy for public governance documents.
- Exact repository description, homepage and topic vocabulary.

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: pending `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_reconciliation: open_gap
- context_graph_required_action: create
- context_graph_gate_effect: warning
- context_graph_evidence: The run introduces durable public policy ownership, host-setting boundaries and cross-document invariants not represented by an existing node.

## Transparency

Structured Delivery is required because the scope establishes public security and contributor policy, safety-relevant recovery paths, host-owned settings and several repository owners. A Quick Task, Verified Change or shortened slice would leave essential product and authority decisions implicit.

## Missing Evidence

- Current private-vulnerability-reporting availability is not exposed by the available authenticated repository connector and the in-app browser session is not signed in.
- Administrative repository permission is evidenced, but conduct, security-response and release authority are not inferred from it.
- Response-time commitments, contributor sign-off and AI-disclosure policy remain product decisions.

## Required Next Step

Complete the required UX Intent Definition, incorporate its resolved interaction model into the PRD, and request `Approval: PRD`. Implementation remains forbidden.

