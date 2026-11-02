# UR: Project-Appropriate Community Health And Maintainer Governance

Status: approved
Gate: UR
Gate approval: accepted
Date: 2026-07-23
Owner: project maintainer

## 1. Problem

The public AGDF GitHub repository currently exposes a README and license, but it does not provide a complete, authoritative surface for contributions, security reports, support requests, issues, pull requests, or maintainer decisions. GitHub therefore reports an incomplete Community Profile. Generic checkbox-oriented documents would also fail to represent AGDF's multi-runtime architecture, generated-asset boundaries, evidence requirements, and governed delivery model accurately.

## 2. Goal

Establish a complete, GitHub-recognized and project-specific community health and maintainer governance surface. Contributors and users must be able to determine how to report bugs, request features, disclose vulnerabilities privately, obtain support, prepare changes, validate runtime compatibility, and understand decision and release authority.

## 3. Scope

- Configure truthful GitHub repository metadata: description, homepage and project topics; assess a project-specific social preview.
- Add a project-specific code of conduct with a real enforcement and escalation route.
- Add contribution guidance covering development setup, AGDF gates, source-of-truth ownership, generated assets, runtime-specific validation, documentation duties, version and release boundaries, security routing and an explicit policy for AI-assisted contributions.
- Add a security policy covering supported versions, private reporting, affected product surfaces, triage and coordinated disclosure.
- Add structured issue forms for bugs, features, documentation and runtime or host compatibility, plus intentional blank-issue and routing configuration.
- Add a project-specific pull request template covering intent, affected surfaces, source and derived paths, tests and evidence, security, compatibility, documentation, generated assets and governance traceability.
- Add support and project-governance guidance.
- Add maintainer ownership or CODEOWNERS only where actual authority can be evidenced.
- Add README navigation to the new public governance surfaces.
- Validate schemas, links, cross-document consistency and GitHub Community Profile recognition after delivery to the default branch.

## 4. Non-Goals

- Do not invent service-level promises, maintainers, support capacity or security response guarantees.
- Do not introduce a CLA or DCO without an explicit product decision.
- Do not add dependency-update automation such as Dependabot or Renovate in this scope.
- Do not change AGDF gate order, approval values or the Interaction Contract.
- Do not perform commit, push, pull-request, release or publish actions in this run unless separately and explicitly authorized at delivery closeout.

## 5. Acceptance Signals

- GitHub recognizes every applicable Community Profile component after delivery to the default branch.
- No public governance document contains generic placeholders or contradicts actual repository architecture and operating practice.
- Security reporters have a functional confidential reporting path with truthful support and response expectations.
- Issue forms and the pull request template route work unambiguously and collect the evidence needed for AGDF's supported surfaces.
- Contribution guidance accurately describes canonical sources, generated assets, validation, runtime parity, governance gates and release boundaries.
- Repository metadata, README, support, security, contribution and governance documents are mutually consistent.

## 6. Existing Source Of Truth

- `README.md`, `INSTALL.md` and the public Pages site for product positioning and supported surfaces.
- `.agdf/control/` for delivery governance, approvals and evidence expectations.
- `plugin/`, `create-agdf/` and the runtime-integrity checks for canonical versus generated ownership.
- `.github/workflows/` for current CI and release behavior.
- `LICENSE` for the existing licensing boundary.
- GitHub repository settings for metadata, private vulnerability reporting, Discussions and other host-owned capabilities.

## 7. Risks And Unknowns

- The supported-security-versions policy and realistic response targets require an explicit product decision.
- The preferred private reporting channel and availability of GitHub private vulnerability reporting must be verified.
- Maintainer, triage, merge, release and security-response authority must not be inferred from repository permissions alone.
- The intended split between Issues, Discussions and support email is not yet defined.
- CLA, DCO and AI-assistance disclosure expectations require product decisions.
- Repository-local documents and GitHub-hosted metadata have different owners and delivery mechanisms.
- Generic community templates could create policy drift or promise operational behavior the project cannot sustain.

## 8. Next Step

Perform the post-UR Brownfield Review and record the proportional Mode/Slice Decision before drafting PRD.

