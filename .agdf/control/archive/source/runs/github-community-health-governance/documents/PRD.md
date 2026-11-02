# PRD: Project-Appropriate Community Health And Maintainer Governance

Status: approved
Gate: PRD
Gate approval: accepted — exact user response `Approval: PRD` on 2026-07-23
Based on: `.agdf/control/artefacts/github-community-health-governance/UR.md`
Date: 2026-07-23
Owner: Arndt Gold

## 1. Product Scope

Deliver one coherent public community-health and maintainer-governance surface for AGDF across repository files and GitHub-owned metadata.

The product scope includes:

- truthful repository description, homepage, topics and a deliberate social-preview treatment;
- project-specific conduct, contribution, security, support and governance policies;
- explicit current maintainer ownership and CODEOWNERS routing;
- structured issue forms for bugs, runtime compatibility, documentation gaps and implementation-ready feature proposals;
- Discussions routing for early ideas, questions and community support;
- a pull-request template aligned with AGDF source-of-truth, generated-asset, test, compatibility and evidence boundaries;
- README navigation to every public policy and interaction path;
- deterministic repository validation plus separate host-visible verification after default-branch delivery.

The documents must route to existing runtime, release, legal and product owners rather than duplicate or reinterpret them.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: ready — `.agdf/control/artefacts/github-community-health-governance/UX_INTENT_DEFINITION.md`
- primary_user_intent: A contributor, security reporter or user can select the correct project interaction path, understand what information is required, see the handling boundary and recover safely from an unavailable or inappropriate route.
- success_signal: Every supported journey has one primary path, truthful visible state, a safe next action and no contradiction with AGDF runtime, release, language or governance authority.
- primary_decision_or_action: Choose and complete the appropriate path for confidential security disclosure, actionable issue reporting, discussion, contribution, support or maintainer decision.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| confidential_security_report | A report is routed privately to a maintained confidential channel; sensitive details are not requested publicly. | route_available, route_unavailable, redirected_to_confidential_channel, submitted | Verified GitHub security capability plus approved `SECURITY.md`; email fallback when host capability is unavailable | GitHub Security surface and `SECURITY.md` |
| public_bug_report | A public issue contains reproducible, non-sensitive problem evidence and the affected AGDF surface. | input_incomplete, ready_to_submit, submitted, maintainer_review_pending | GitHub Issue state plus approved issue-form policy | `.github/ISSUE_TEMPLATE/bug_report.yml` |
| runtime_compatibility_report | A public issue identifies host, versions, installation scope, expected support and sanitized diagnostics. | input_incomplete, ready_to_submit, submitted, unsupported_request | Current capability truth plus GitHub Issue state | `.github/ISSUE_TEMPLATE/runtime_compatibility.yml` |
| documentation_report | A public issue identifies the affected document, current statement and expected correction. | ready_to_submit, submitted, redirected | GitHub Issue state plus documentation ownership | `.github/ISSUE_TEMPLATE/documentation.yml` |
| feature_or_design_discussion | Early ideas enter Discussions; only sufficiently scoped and evidence-bearing proposals enter the actionable issue backlog. | redirected_to_discussion, ready_to_submit, submitted, declined_with_reason | Approved routing policy plus GitHub Discussion or Issue state | `SUPPORT.md`, issue configuration and feature-proposal form |
| code_or_documentation_contribution | A pull request discloses intent, affected owners, tests, generated assets, compatibility, security and material AI assistance. | input_incomplete, ready_to_submit, maintainer_review_pending, revision_requested, accepted, declined_with_reason | GitHub Pull Request state plus approved contribution and governance policy | `CONTRIBUTING.md` and `.github/pull_request_template.md` |
| support_request | The requester reaches Discussions for best-effort community support and sees unsupported channels and promises. | route_available, redirected_to_discussion, unsupported_request | Approved `SUPPORT.md` policy plus GitHub Discussion state | `SUPPORT.md` and `.github/ISSUE_TEMPLATE/config.yml` |
| maintainer_triage_and_decision | The documented maintainer classifies, routes, accepts, requests revision or declines work under explicit authority. | maintainer_review_pending, revision_requested, accepted, declined_with_reason, redirected | Approved `GOVERNANCE.md`; current authority is Arndt Gold | GitHub issue, discussion and pull-request history |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation:
  - Repository README, About metadata and Community Profile expose the public entry routes.
  - GitHub New Issue, New Discussion, New Pull Request and Security surfaces activate the corresponding mode.
  - A route is deactivated only by an approved governance or support-policy change; a broken or unavailable host feature must not remain advertised.
- blockers_and_visible_next_actions:
  - Public security disclosure attempt: stop and route to the confidential path.
  - Missing issue or pull-request evidence: identify the missing information and keep the submission revisable.
  - General idea or support request in Issues: route to Discussions.
  - Unsupported release or runtime: state the boundary and offer upgrade or discussion guidance.
  - Unclear authority: route to the documented sole maintainer rather than implying acceptance.
- recovery_paths:
  - If GitHub private vulnerability reporting is unavailable, show `agdf@iself.eu` as the complete confidential fallback.
  - If a form cannot represent a legitimate case, route to the appropriate Discussion category or maintainer contact without enabling unstructured blank issues.
  - Recoverable YAML, link or schema failures must be detected before delivery and corrected; no invalid template is published knowingly.
- relevant_state_transitions:
  - repository_entry -> choose_path -> security | issue | discussion | pull_request | support
  - public_security_attempt -> confidential_security_report
  - incomplete_submission -> ready_to_submit -> submitted
  - early_feature_idea -> discussion -> implementation_ready_proposal
  - submitted -> maintainer_review_pending -> accepted | revision_requested | declined_with_reason | redirected
  - unsupported_request -> upgrade_guidance | discussion | closed_with_boundary

## 5. Acceptance Criteria

### CHG-001 — Repository metadata is truthful and discoverable

- working_mode: repository_entry
- source_state: GitHub reports no description, homepage or topics.
- trigger/action: A user opens the repository or searches by topic.
- expected_effective_state: Description, homepage and topics accurately describe the current independent AGDF project and supported surfaces.
- visible_feedback: Repository About metadata shows the approved copy and links to `https://agdf.iself.eu`.
- blocker/failure_behavior: Metadata must not claim standard status, endorsement, unsupported runtime parity or unpublished capability.
- recovery/next_action: Correct the host metadata through the repository settings owner and recheck the public API.
- observable_success: Public GitHub repository metadata returns the approved values.
- required_evidence: GitHub API response and public repository observation after application.

Approved metadata intent:

- description: `Kontrollorientiertes Governance- und Delivery-Framework für KI-gestützte Softwareentwicklung mit Codex, Claude Code, OpenCode und GitHub Copilot.`
- homepage: `https://agdf.iself.eu`
- topics: `ai-governance`, `agentic-software-development`, `software-delivery`, `brownfield`, `codex`, `claude-code`, `opencode`, `github-copilot`, `npm`

### CHG-002 — Community Profile components are complete

- working_mode: repository_entry
- source_state: GitHub Community Profile reports 28 percent and recognizes only README and License.
- trigger/action: GitHub evaluates the default branch.
- expected_effective_state: Every applicable checklist component is recognized from a supported location.
- visible_feedback: Code of Conduct, Contributing, Security policy, Issue templates and Pull Request template appear as present.
- blocker/failure_behavior: A local file that GitHub does not recognize is treated as incomplete, not pass.
- recovery/next_action: Correct location, filename or default-branch delivery and rerun host verification.
- observable_success: GitHub Community Profile shows every applicable component fulfilled.
- required_evidence: Community Profile API and visible checklist observation after default-branch delivery.

### CHG-003 — Conduct expectations and enforcement are explicit

- working_mode: maintainer_triage_and_decision
- source_state: No code of conduct or enforcement route exists.
- trigger/action: A participant reviews conduct expectations or reports misconduct.
- expected_effective_state: A recognized conduct standard, scope, private reporting route, confidentiality boundary and enforcement authority are visible.
- visible_feedback: `CODE_OF_CONDUCT.md` names Arndt Gold as the current enforcement authority and provides a private contact route.
- blocker/failure_behavior: The document must not expose a reporter publicly or imply an unstaffed committee.
- recovery/next_action: Use the documented private contact and governance-change path.
- observable_success: A reader can identify expected conduct, reporting, enforcement and appeal or reconsideration path.
- required_evidence: Content assertions, link checks and GitHub Community Profile recognition.

### CHG-004 — Security disclosure is confidential and fail-safe

- working_mode: confidential_security_report
- source_state: No security policy exists and private-vulnerability-reporting availability is unverified.
- trigger/action: A reporter wants to disclose a vulnerability.
- expected_effective_state: The current GitHub confidential route is primary when verified available; `agdf@iself.eu` is always a private fallback.
- visible_feedback: `SECURITY.md` explicitly says not to disclose sensitive details in public Issues or Discussions.
- blocker/failure_behavior: An unavailable host route must not produce a dead end or invite public disclosure.
- recovery/next_action: Use the email fallback and preserve confidentiality.
- observable_success: A reporter can complete a private report through at least one verified channel.
- required_evidence: Authenticated host-capability observation or documented unavailability, email-link validation and policy assertions.

### CHG-005 — Security support promises are bounded

- working_mode: confidential_security_report
- source_state: No supported-version or response policy exists.
- trigger/action: A reporter checks whether a version is supported and what response to expect.
- expected_effective_state: Only the current published release line is security-supported; handling is explicitly best effort without numerical service levels.
- visible_feedback: `SECURITY.md` shows the supported-version rule, upgrade guidance and non-SLA response boundary.
- blocker/failure_behavior: The policy must not promise support for historical lines or response times without operational evidence.
- recovery/next_action: Direct older-version users to reproduce on or upgrade to the current line where feasible.
- observable_success: Supported and unsupported cases are distinguishable without maintainer interpretation.
- required_evidence: Policy assertions against current package/release metadata.

### CHG-006 — Public issue intake is structured and non-sensitive

- working_mode: public_bug_report
- source_state: Blank issue creation is available and no project-specific forms exist.
- trigger/action: A user starts a bug report.
- expected_effective_state: The form collects affected version, surface, environment, reproduction, expected and observed behavior, and sanitized evidence.
- visible_feedback: Required fields explain what is needed and warn against secrets or vulnerability details.
- blocker/failure_behavior: Security-sensitive content is redirected before public submission.
- recovery/next_action: Open the confidential security route or complete the missing public evidence.
- observable_success: A submitted fixture contains sufficient non-sensitive triage information.
- required_evidence: YAML/schema validation and fixture-based field assertions.

### CHG-007 — Runtime compatibility reports preserve capability truth

- working_mode: runtime_compatibility_report
- source_state: Runtime-specific problems have no dedicated intake contract.
- trigger/action: A user reports Codex, Claude Code, GitHub Copilot or OpenCode behavior.
- expected_effective_state: The report distinguishes host version, AGDF version, installation scope, activation, expected capability and observed degradation.
- visible_feedback: The form requests deterministic status output where available and warns against secrets.
- blocker/failure_behavior: A host-visible observation must not be treated as proof of unsupported enforcement or vice versa.
- recovery/next_action: Request the specific deterministic status or reproduction evidence required for that surface.
- observable_success: Maintainers can identify the affected compatibility boundary without first reconstructing the environment.
- required_evidence: Form-schema assertions and representative fixtures for all supported surfaces.

### CHG-008 — Documentation gaps have a focused route

- working_mode: documentation_report
- source_state: Documentation feedback is unstructured.
- trigger/action: A user reports inaccurate, missing or confusing documentation.
- expected_effective_state: The issue identifies document or page, current statement, expected correction and user impact.
- visible_feedback: The form links to the German-first language policy and accepts English reports.
- blocker/failure_behavior: Product changes disguised as documentation fixes are routed to Discussion or feature proposal.
- recovery/next_action: Reclassify the request without losing its evidence.
- observable_success: Documentation issues are distinguishable from runtime defects and product proposals.
- required_evidence: Schema assertions and routing-copy tests.

### CHG-009 — Ideas and actionable feature proposals have distinct routes

- working_mode: feature_or_design_discussion
- source_state: README welcomes both Discussions and Issues without a precise split.
- trigger/action: A user proposes an idea or a delivery-ready feature.
- expected_effective_state: Early ideas and questions go to Discussions; a scoped proposal with problem, users, evidence and compatibility impact may use the feature-proposal issue form.
- visible_feedback: Issue configuration and support guidance explain the distinction.
- blocker/failure_behavior: A vague idea must not be presented as accepted backlog scope.
- recovery/next_action: Redirect to Discussions; allow a later evidence-bearing proposal.
- observable_success: Each example case maps deterministically to Discussion or Issue.
- required_evidence: Routing fixtures and link validation.

### CHG-010 — Support has a truthful community boundary

- working_mode: support_request
- source_state: No support policy exists; the public email currently has no defined support purpose.
- trigger/action: A user asks for setup, usage or troubleshooting help.
- expected_effective_state: Discussions is the primary best-effort support path; email is reserved for confidential security and explicitly named private matters.
- visible_feedback: `SUPPORT.md` states supported topics, unsupported guarantees and routes to documentation, Issues, Discussions or Security.
- blocker/failure_behavior: No paid, guaranteed, private general-support or response-time promise is implied.
- recovery/next_action: Redirect reproducible defects to Issues and vulnerabilities to Security.
- observable_success: Representative requests map to exactly one primary route.
- required_evidence: Routing tests and cross-document consistency assertions.

### CHG-011 — Contribution requirements reuse canonical owners

- working_mode: code_or_documentation_contribution
- source_state: README invites pull requests but no contribution contract exists.
- trigger/action: A contributor prepares a change.
- expected_effective_state: `CONTRIBUTING.md` explains setup, scope selection, AGDF gates, canonical versus generated paths, validation, documentation, compatibility and release boundaries by linking to their existing owners.
- visible_feedback: The contributor sees commands and owner links without duplicated runtime policy.
- blocker/failure_behavior: Generated or installed cache content must not be edited as a primary source.
- recovery/next_action: Redirect the change to the canonical owner and required synchronization command.
- observable_success: A contributor can identify source paths, derived paths and required evidence for each change category.
- required_evidence: Link checks, owner assertions and source/derived-path fixtures.

### CHG-012 — Contributor sign-off and AI assistance are proportionate

- working_mode: code_or_documentation_contribution
- source_state: No CLA, DCO or AI-assistance policy exists.
- trigger/action: A contributor opens a pull request.
- expected_effective_state: No CLA or DCO is required; material AI assistance and human verification or test evidence are disclosed.
- visible_feedback: Contribution and pull-request guidance asks what AI assistance materially affected, what was reviewed and what evidence supports the result.
- blocker/failure_behavior: Raw prompts, hidden reasoning, secrets or unrelated private data must not be requested.
- recovery/next_action: Add a concise disclosure and verification evidence before review proceeds.
- observable_success: A representative AI-assisted PR can comply without exposing sensitive information.
- required_evidence: Template assertions and positive/negative disclosure fixtures.

### CHG-013 — Pull requests are reviewable against AGDF boundaries

- working_mode: code_or_documentation_contribution
- source_state: No pull-request template exists.
- trigger/action: A pull request is opened.
- expected_effective_state: The description captures intent, issue or Discussion link, affected surfaces, canonical and generated paths, tests, visible evidence, security, compatibility, documentation, AGDF run or proportional boundary, and AI disclosure.
- visible_feedback: Checklist language distinguishes evidence from claims and does not imply gate or release approval.
- blocker/failure_behavior: Missing required evidence remains visible for maintainer review.
- recovery/next_action: Supply the missing evidence or explain a justified non-applicable item.
- observable_success: The PR template supports deterministic review without becoming a second AGDF gate.
- required_evidence: Template field assertions and representative completed fixture.

### CHG-014 — Maintainer authority is explicit and changeable

- working_mode: maintainer_triage_and_decision
- source_state: Administrative permission exists, but public governance authority is undocumented.
- trigger/action: A participant needs a triage, merge, release, conduct or security decision.
- expected_effective_state: `GOVERNANCE.md` names Arndt Gold as the current sole maintainer for those responsibilities.
- visible_feedback: The document explains decision transparency, conflicts, succession and the documented change mechanism.
- blocker/failure_behavior: Repository permission alone must not silently create or transfer policy authority.
- recovery/next_action: Change authority through a reviewed governance update.
- observable_success: Every named responsibility has one current owner and one change path.
- required_evidence: Governance assertions and consistency with CODEOWNERS and release documentation.

### CHG-015 — CODEOWNERS routes review without overstating enforcement

- working_mode: maintainer_triage_and_decision
- source_state: No CODEOWNERS file exists.
- trigger/action: GitHub resolves review ownership for a changed path.
- expected_effective_state: The repository routes ownership to `@ArndtGold` consistently with `GOVERNANCE.md`.
- visible_feedback: GitHub recognizes the CODEOWNERS file.
- blocker/failure_behavior: The file must not claim branch-protection enforcement that is not configured.
- recovery/next_action: Correct the owner or governance document together when authority changes.
- observable_success: CODEOWNERS syntax is valid and owner references match governance policy.
- required_evidence: Static syntax/owner validation and host recognition where observable.

### CHG-016 — Language behavior is consistent

- working_mode: all_public_modes
- source_state: AGDF is German-first; public operational and technical material contains established English terminology.
- trigger/action: A German- or English-speaking participant uses a public route.
- expected_effective_state: German is the primary policy and guidance language; German and English reports and contributions are accepted.
- visible_feedback: Documents and forms state the language boundary without rejecting English input.
- blocker/failure_behavior: Mixed language must not alter gate values, technical identifiers or policy meaning.
- recovery/next_action: Clarify terminology or provide a concise routing note without creating divergent policy versions.
- observable_success: Language statements are consistent across README, policies and templates.
- required_evidence: Cross-document copy assertions.

### CHG-017 — Public policy remains single-source and testable

- working_mode: maintainer_triage_and_decision
- source_state: Runtime, release, legal and website truth already have separate owners.
- trigger/action: Community-health content is added or later changed.
- expected_effective_state: SOT Registry identifies public community policy and GitHub metadata owners; documents link to runtime, release and legal owners instead of copying them.
- visible_feedback: Maintainers can locate the authoritative source for each rule.
- blocker/failure_behavior: Contradictory duplicate policy fails validation or review.
- recovery/next_action: Reconcile to the canonical owner and update derived routing copy.
- observable_success: Static checks find no known placeholder, broken internal link or conflicting owner statement.
- required_evidence: SOT Registry update, Context Graph reconciliation and deterministic validation.

### CHG-018 — Host state and repository state are verified separately

- working_mode: repository_entry
- source_state: Repository files and GitHub settings have different mutation and evidence paths.
- trigger/action: The change reaches delivery validation.
- expected_effective_state: Local tests prove repository content; authenticated or public host observations prove metadata, capabilities and Community Profile recognition.
- visible_feedback: QA and closeout distinguish repository evidence from host-visible evidence.
- blocker/failure_behavior: Local files alone cannot claim GitHub recognition or applied metadata.
- recovery/next_action: Deliver to the default branch or apply host settings, then rerun the missing observation.
- observable_success: Every public claim has evidence from its actual owner.
- required_evidence: Local validation reports, default-branch commit reference, GitHub API output and Community Profile observation.

### CHG-019 — Social preview is deliberate and brand-consistent

- working_mode: repository_entry
- source_state: No evidenced social-preview treatment is recorded.
- trigger/action: A repository link is shared on a surface that uses GitHub's social preview.
- expected_effective_state: GitHub uses a legible AGDF-branded preview derived from existing project identity.
- visible_feedback: The preview shows project name and identity without third-party endorsement.
- blocker/failure_behavior: An unsuitable asset, incorrect aspect ratio or misleading partner branding must not be applied.
- recovery/next_action: Reuse or create a compliant asset from the existing brand system and verify the GitHub preview.
- observable_success: The configured preview is legible and consistent with `TRADEMARKS.md`.
- required_evidence: Asset inspection and authenticated GitHub settings observation.

## 6. Non-Goals

- No change to AGDF gate order, approvals, runtime behavior, evaluator behavior or Interaction Contract.
- No CLA or DCO.
- No Dependabot, Renovate, package-signing or unrelated security automation.
- No commercial support offering, numerical response SLA or historical-version support promise.
- No new maintainer committee, inferred co-maintainer or undocumented delegation.
- No duplicated German and English policy sources that could drift independently.
- No commit, push, pull request, release or publish action without separate delivery authorization.

## 7. Users And Roles

- Security reporter: submits sensitive vulnerability information privately.
- User or adopter: requests support, reports defects and compatibility problems.
- Contributor: proposes documentation, code or policy changes.
- Discussion participant: explores ideas, asks questions and gives feedback.
- Maintainer: Arndt Gold currently owns triage, merge, release, conduct enforcement and security response.
- GitHub: hosts metadata, forms, Discussions, Security surfaces, pull requests and Community Profile recognition; it does not define AGDF policy.

## 8. Constraints

- Apache-2.0, `NOTICE` and `TRADEMARKS.md` remain authoritative legal and brand boundaries.
- AGDF remains independent and must not imply affiliation, endorsement or standard status.
- Public policies must match actual operational capacity.
- Sensitive security information must not be requested publicly.
- The latest published release line is the sole security-supported line.
- Community support and security response are best effort without numerical service levels.
- German is primary; English input is accepted.
- Existing runtime, capability, release and generated-asset owners remain authoritative.
- GitHub metadata changes and default-branch file delivery require separate evidence.

## 9. Evidence Requirements

- Deterministic validation of required files, recognized locations, YAML syntax, form schemas, CODEOWNERS syntax and required fields.
- Link validation for repository-internal, website, Discussion, Security and contact routes.
- Positive and negative routing fixtures for security, support, bug, runtime, documentation, feature and pull-request journeys.
- Cross-document assertions for maintainer authority, language, support boundaries, current-version policy and AI disclosure.
- Existing AGDF guardrails, package smoke tests, runtime integrity and Pages checks remain green where affected.
- Public GitHub API evidence for metadata and Community Profile after delivery.
- Authenticated evidence for host-only settings such as private vulnerability reporting and social preview.
- Clear disclosure of any host evidence that remains unavailable.

## 10. Risks And Open Questions

- Private vulnerability reporting may be unavailable or disabled; the approved email fallback prevents a disclosure dead end.
- GitHub Discussions categories and exact contact links must be verified during Solution Design.
- Contributor Covenant or another recognized conduct baseline must be selected and reviewed without weakening the approved enforcement model.
- Static validation must not become a second policy owner; it should assert approved invariants only.
- Social-preview reuse may require asset adaptation while preserving the existing brand system.
- No product question remains open that blocks Solution Design.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
