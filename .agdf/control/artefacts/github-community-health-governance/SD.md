# Solution Design: Project-Appropriate Community Health And Maintainer Governance

Status: approved
Gate: SD
Gate approval: accepted — exact user response `Approval: SD` on 2026-07-23
Based on: `.agdf/control/artefacts/github-community-health-governance/PRD.md`
Date: 2026-07-23
Owner: Arndt Gold

## 1. Solution Overview

Implement one repository-owned public policy system with thin GitHub interaction adapters and separately verified GitHub host state.

The solution has four layers:

1. Root policy documents define the durable public contract for conduct, contribution, security, support and governance.
2. `.github/` files project that contract into GitHub-native issue, pull-request and ownership interactions.
3. A machine-readable repository metadata manifest records the approved desired host state without pretending that a committed file changes GitHub settings.
4. A dependency-pinned validator checks repository structure, YAML/JSON syntax, required policy invariants, links and routing fixtures. Authenticated GitHub observations remain a separate evidence class after host mutation and default-branch delivery.

The implementation does not change AGDF gate order, approvals, runtime behavior, package publication or coding-agent capabilities.

## 2. Ownership And Source Of Truth

### 2.1 Canonical policy owners

| Domain | Canonical owner | Responsibility |
|---|---|---|
| Conduct | `CODE_OF_CONDUCT.md` | Participation expectations, scope, confidential reporting, enforcement and reconsideration |
| Contribution | `CONTRIBUTING.md` | Contribution workflow, canonical/derived path rules, validation, compatibility, documentation and AI-assistance disclosure |
| Security | `SECURITY.md` | Supported release boundary, confidential reporting, fallback, non-public disclosure warning and best-effort handling |
| Support | `SUPPORT.md` | Discussions/Issues/Security/documentation routing and unsupported support promises |
| Maintainer governance | `GOVERNANCE.md` | Current authority, decision responsibilities, conflicts, succession and authority-change mechanism |
| Runtime and installation truth | Existing `INSTALL.md`, runtime contracts and generated-asset owners | Capability, installation and source/derived behavior; the new policies link to these owners and do not restate them |
| Release behavior | Existing `RELEASE.md` and publish workflow | Release process and authority boundaries |
| Legal and brand | Existing `LICENSE`, `NOTICE` and `TRADEMARKS.md` | Licensing, notices and trademark boundaries |

### 2.2 GitHub adapters

The following files are adapters, not independent policy owners:

- `.github/ISSUE_TEMPLATE/*.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`
- README community-navigation section

Each adapter links to the relevant canonical policy and contains only the interaction-specific fields or reminders needed at that GitHub entry point.

### 2.3 Desired and effective host state

Add `.github/repository-metadata.json` as the canonical desired-state record for:

- repository description;
- homepage;
- ordered topic set;
- social-preview source path;
- expected Issues and Discussions availability;
- desired private-vulnerability-reporting state.

The GitHub repository settings and public API remain the effective host state. The manifest does not auto-apply settings and must never be reported as proof of live configuration. The validator checks repository intent; an authenticated read/apply/re-read sequence supplies host evidence.

### 2.4 Registry and context ownership

Update `.agdf/control/SOT_REGISTRY.md` with public-policy, GitHub-adapter and repository-metadata domains. Add `CG-PUBLIC-COMMUNITY-GOVERNANCE` to `.agdf/control/CONTEXT_GRAPH.md` with the source-of-truth split, security-routing invariant, host-evidence boundary and authority-change rule.

## 3. Architecture Decisions

### AD-01 — Use project-specific root policies

Create the five policy files at repository root so they are prominent to readers and in GitHub-supported locations. `CODE_OF_CONDUCT.md` uses Contributor Covenant 2.1 as its attributed baseline, with project-specific German-primary reporting and enforcement sections. The remaining policies are AGDF-specific rather than generic templates.

### AD-02 — Keep language policy single and usable

Policy prose is German-primary. Stable product names, commands, file paths, exact AGDF approval values and established technical terms remain unchanged. Every public intake surface states that German and English reports and contributions are accepted. No parallel translated policy tree is created.

### AD-03 — Make confidential reporting fail-safe

`SECURITY.md` always exposes `agdf@iself.eu` as a private fallback and tells reporters not to publish sensitive details in Issues or Discussions. GitHub Private Vulnerability Reporting is described as the primary route only after authenticated availability is verified. If unavailable, the effective public copy must use email as the complete primary route rather than advertising a dead link.

The issue chooser links to `SECURITY.md`, never directly to a capability-dependent advisory URL. This keeps the chooser valid if the host capability changes.

### AD-04 — Bound security promises to current evidence

Security support applies only to the current published release line derived from existing package/release metadata. `SECURITY.md` provides upgrade guidance and a best-effort handling statement with no numeric response or resolution SLA.

### AD-05 — Separate Discussions from actionable Issues

Disable blank Issues and provide four Issue Forms:

- `bug_report.yml` for reproducible, non-sensitive defects;
- `runtime_compatibility.yml` for Codex, Claude Code, OpenCode and GitHub Copilot host/version/degradation evidence;
- `documentation.yml` for inaccurate, missing or confusing documentation;
- `feature_proposal.yml` only for scoped, evidence-bearing, implementation-ready proposals.

`.github/ISSUE_TEMPLATE/config.yml` routes early ideas, questions and community support to repository Discussions and confidential security matters to `SECURITY.md`. It does not guess Discussion category slugs.

### AD-06 — Make pull-request evidence reviewable without creating a second gate

The pull-request template captures intent, linked context, affected surfaces, canonical and generated paths, tests, visible evidence, security, compatibility, documentation, proportional AGDF evidence and material AI assistance. Items may be marked not applicable only with a short explanation.

The template explicitly says:

- it is review input, not AGDF approval or release authorization;
- no CLA or DCO is required;
- material AI assistance and human verification/test evidence must be disclosed;
- raw prompts, hidden reasoning, secrets and unrelated private data must not be supplied.

### AD-07 — Represent current authority truthfully

`GOVERNANCE.md` names Arndt Gold as the current sole maintainer for triage, merge, release, conduct enforcement and security response. `.github/CODEOWNERS` contains the default rule `* @ArndtGold`.

CODEOWNERS is described as review routing only. It does not claim branch-protection enforcement, and GitHub permission alone does not change documented policy authority. Authority changes require a reviewed `GOVERNANCE.md` and CODEOWNERS update in the same change.

### AD-08 — Use a deliberate social preview asset

Create `assets/github-social-preview.png` as a 1280×640, solid-background composition derived from the existing brand-consistent `assets/intro.png` and repository logo treatment. The source image is 2172×724 and must be adapted rather than stretched or blindly cropped.

The validator enforces PNG format, exact dimensions and size below 1 MB. Upload remains a GitHub Settings action and requires separate live observation; committing the asset alone is not host proof.

### AD-09 — Add deterministic, dependency-pinned validation

Add the declared root development dependency `yaml` and a root lockfile. Do not import the undeclared transitive `yaml` copy currently present under Pages.

Add:

- `scripts/check-community-health.mjs` — validates a supplied repository root, defaulting to the current repository;
- `scripts/community-health-test.mjs` — creates isolated positive and negative fixtures and exercises the checker;
- root package scripts `check:community-health` and `test:community-health`;
- an AGDF Guardrails workflow step that installs the root lockfile dependencies and runs the focused tests plus the live repository check.

The checker uses Node built-ins for Markdown, JSON, file and image checks and the declared YAML package for Issue Form parsing. It must not implement a second partial YAML parser.

### AD-10 — Keep host mutation explicit and evidence-backed

Repository implementation and host mutation are two distinct operations:

1. Repository phase: create files, run deterministic checks and obtain review/QA/UAT evidence.
2. Delivery phase: only after separate VCS authorization, deliver the repository files to the default branch.
3. Host phase: only after the approved plan authorizes the external mutation, apply description, homepage, topics, social preview and private-vulnerability-reporting state; then re-read public/authenticated state.
4. Recognition phase: verify the Community Profile/API and visible routes after default-branch processing.

No token, credential, mutation script or automatic settings workflow is committed. A failed or unavailable host action remains `unverified` or `blocked`; it cannot be converted into pass by local files.

## 4. File And Integration Design

### 4.1 Planned repository files

| Path | Change | Design role |
|---|---|---|
| `CODE_OF_CONDUCT.md` | add | Conduct contract and enforcement route |
| `CONTRIBUTING.md` | add | Contribution contract and canonical-owner routing |
| `SECURITY.md` | add | Confidential vulnerability and supported-version policy |
| `SUPPORT.md` | add | User-request routing |
| `GOVERNANCE.md` | add | Maintainer authority and succession |
| `.github/CODEOWNERS` | add | GitHub review-routing adapter |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | add | Structured defect intake |
| `.github/ISSUE_TEMPLATE/runtime_compatibility.yml` | add | Structured host/runtime intake |
| `.github/ISSUE_TEMPLATE/documentation.yml` | add | Structured documentation intake |
| `.github/ISSUE_TEMPLATE/feature_proposal.yml` | add | Implementation-ready proposal intake |
| `.github/ISSUE_TEMPLATE/config.yml` | add | Disable blanks and route Discussions/Security |
| `.github/pull_request_template.md` | add | Review-evidence adapter |
| `.github/repository-metadata.json` | add | Desired GitHub host state |
| `assets/github-social-preview.png` | add | Social-preview upload source |
| `README.md` | update | Concise public route index |
| `.agdf/control/SOT_REGISTRY.md` | update | New authoritative domains |
| `.agdf/control/CONTEXT_GRAPH.md` | update | Durable ownership/invariant node |
| `package.json` and root lockfile | update/add | Pinned validator dependency and scripts |
| `scripts/check-community-health.mjs` | add | Deterministic repository checker |
| `scripts/community-health-test.mjs` | add | Contract/regression fixtures |
| `.github/workflows/agdf-guardrails.yml` | update | CI execution |

### 4.2 Issue Form contract

Every Issue Form must contain GitHub-required top-level metadata and a non-empty body. Required user inputs use GitHub `validations.required: true`; checkboxes use stable IDs. Labels are omitted unless their existence is separately verified, preventing forms from depending on undeclared repository labels.

Common safety copy:

- do not include secrets, credentials or private data;
- do not disclose suspected vulnerabilities publicly;
- use `SECURITY.md` for confidential reporting;
- German and English submissions are accepted.

The runtime form uses stable option values for all four supported surfaces and includes AGDF version, host version, install scope, activation state, expected capability, observed degradation, reproduction and sanitized status evidence.

### 4.3 Link design

Repository-relative links are used among committed documents. GitHub host links use the canonical repository URL. Security routing from Issue configuration resolves to the default-branch `SECURITY.md`; support routing resolves to the repository Discussions root.

The README adds one compact “Community and contribution” section linking to Conduct, Contributing, Security, Support, Governance, Issues and Discussions. It does not duplicate the policy bodies.

### 4.4 Host integration

The implementation may use an authenticated GitHub connector or API for read-only preflight and, only after the approved task-plan step is permitted, for settings changes. Exact targets must be resolved to `ArndtGold/ai-native-governance-delivery-framework`. Every mutation is followed by a read-back. Social preview may require browser/UI upload if no stable authenticated API is available.

## 5. Constraints And Compatibility

- Preserve all existing runtime, installation, release, legal and trademark semantics.
- Preserve German-first guidance and exact English technical identifiers.
- Do not change AGDF gate order, approval values or interaction contracts.
- Do not edit generated or installed plugin caches.
- Do not add CLA, DCO, numeric SLA, paid-support promise or unstaffed governance roles.
- Do not claim Candidate Generation, host enforcement, runtime support or standard status beyond existing owners.
- Do not make VCS, release or publish actions without separate user authorization.
- Treat default-branch delivery as required for GitHub recognition, but not as implicitly authorized by SD or TP approval.
- Preserve unrelated worktree changes and the separate OpenCode run.
- Use case-exact filenames because GitHub recognition and CODEOWNERS resolution are case-sensitive.

## 6. Test And Evidence Strategy

### 6.1 Deterministic repository checks

`check-community-health.mjs` must fail non-zero for:

- a missing or empty required file;
- invalid JSON or YAML;
- duplicate Issue Form IDs or missing required form metadata;
- blank Issues enabled;
- missing Security or Discussions routing;
- unresolved repository-relative links;
- public vulnerability-report instructions;
- absent private email fallback;
- numeric security SLA language;
- historical-release security support claims;
- CLA/DCO requirements;
- AI disclosure that requests prohibited sensitive material;
- inconsistent maintainer handle, email or language policy;
- CODEOWNERS/governance authority drift;
- metadata drift from PRD-approved values;
- an invalid social-preview format, dimension or size;
- policy duplication that contradicts existing owner links, where represented by explicit assertions.

### 6.2 Fixture contract tests

The test runner supplies:

- one complete positive repository fixture;
- one negative fixture per major policy invariant;
- one valid Issue Form per form type;
- malformed YAML, missing required field and duplicate-ID cases;
- routing cases for vulnerability, bug, runtime compatibility, documentation, early idea, implementation-ready proposal, general support and pull request;
- German and English input examples;
- positive and negative AI-assistance disclosures;
- CODEOWNERS/governance mismatch;
- missing/broken relative link;
- invalid social-preview shape and size metadata.

Fixtures must run outside the working repository and clean up their temporary directories.

### 6.3 Existing regression checks

The Task Plan must retain and run, at minimum:

- focused community-health tests and repository check;
- root package lock consistency;
- `node plugin/scripts/check-runtime-integrity.mjs`;
- `npm --prefix create-agdf run test:package-contents`;
- `npm --prefix create-agdf run smoke-test`;
- `npm --prefix agdf run smoke-test`;
- `npm --prefix pages run check`;
- `git diff --check`;
- AGDF `doctor --all-active`, plus per-run `gate-check` for this run.

Existing failures unrelated to this scope must be classified and not silently repaired.

### 6.4 Live GitHub evidence

Local QA and host-visible evidence are reported in separate rows:

| Evidence | Required proof |
|---|---|
| Repository metadata | Public API read-back of description, homepage and exact topics |
| Community Profile | API plus visible checklist after default-branch delivery |
| Private vulnerability reporting | Authenticated capability/status observation and safe public route |
| CODEOWNERS | Default-branch recognition or API-visible syntax/owner evidence |
| Issue Forms and chooser | Visible New Issue flow with all four forms and contact links |
| Pull-request template | Visible new-PR template load |
| Social preview | Repository Settings/public share-preview observation after upload |
| Links | Public default-branch link traversal |

Missing authentication, unavailable host controls or absence from the default branch is an evidence gap, not a deterministic-test failure and not a pass.

## 7. Security And Failure Handling

- Never copy vulnerability details into public fixtures, Issues, Discussions or logs.
- Never store GitHub tokens or email credentials in the repository.
- Redact authenticated response fields that are not required evidence.
- Preflight the exact repository, permissions and current setting before each host mutation.
- If private vulnerability reporting cannot be proven, publish only the email route as effective and record the host feature as unverified.
- If a host mutation partially succeeds, read back each independent setting, report the exact partial state and avoid broad rollback without explicit authorization.
- If GitHub does not recognize a delivered file, diagnose filename, location and default-branch state before changing policy content.
- If the sole-maintainer handle lacks required write access for CODEOWNERS, fail closed and reconcile GitHub permission with `GOVERNANCE.md`; do not substitute another owner silently.

## 8. PRD Traceability

| PRD criteria | Design coverage |
|---|---|
| CHG-001, CHG-018 | AD-09, AD-10, metadata manifest and live read-back |
| CHG-002 | Root policy locations, GitHub adapters and recognition evidence |
| CHG-003 | AD-01, AD-03 and conduct owner |
| CHG-004, CHG-005 | AD-03, AD-04 and security failure handling |
| CHG-006, CHG-007, CHG-008, CHG-009 | AD-05 and Issue Form contract |
| CHG-010 | Support owner, Discussions routing and chooser config |
| CHG-011, CHG-012, CHG-013 | AD-06 and contribution/PR ownership |
| CHG-014, CHG-015 | AD-07 and governance/CODEOWNERS consistency checks |
| CHG-016 | AD-02 and cross-document assertions |
| CHG-017 | Source-of-truth model, registry/context updates and adapter boundaries |
| CHG-019 | AD-08 and separate upload evidence |

All 19 criteria have an implementation owner and evidence route. Live-only criteria remain explicitly dependent on later authorized delivery and host operations.

## 9. Risks And Open Questions

### Accepted residual risks

- GitHub Issue Forms are still documented as public preview; deterministic schema checks reduce, but cannot eliminate, host-rendering drift.
- Community Profile processing and visible template loading occur only after default-branch delivery.
- Social preview upload may require authenticated UI work rather than an API.
- A sole-maintainer model creates availability concentration; the governance document makes this truthful and supplies a controlled succession path without inventing a committee.
- The security email fallback is operationally dependent on the mailbox owner; the policy promises best effort only.

### Open questions

None block task planning. The Task Plan must treat VCS delivery and GitHub setting mutations as explicitly gated external steps and may not infer authorization from SD or TP approval.

## 10. Next Step

Review this solution design and approve only with:

`Approval: SD`
