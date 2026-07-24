# UX Intent Definition: Public Community And Governance Journeys

Status: ready
Date: 2026-07-23
Run: `github-community-health-governance`

- decision: ready
- blocking_reason: none; the user accepted the complete recommended product-decision package on 2026-07-23.
- primary_user_intent: A contributor, security reporter or user can choose the correct project interaction path, understand what information is required, receive an honest next action and recover when the selected channel is inappropriate or unavailable.
- success_signal: Each public entry path routes the person to exactly one primary channel, states the expected handling and boundary, and provides a safe recovery path without contradicting AGDF runtime, release or governance truth.
- primary_decision_or_action: Select the appropriate public path for security disclosure, bug reporting, feature or design discussion, documentation change, contribution, support request or maintainer decision.

## Working Modes

1. confidential_security_report
2. public_bug_or_runtime_compatibility_report
3. feature_or_design_discussion
4. documentation_report
5. code_or_documentation_contribution
6. support_request
7. maintainer_triage_and_decision

## Effective State By Mode

| Mode | Effective state |
|---|---|
| confidential_security_report | A private report has been routed to an explicitly owned confidential channel; no sensitive details are requested in a public issue. |
| public_bug_or_runtime_compatibility_report | A structured issue contains reproducible environment, affected surface, observed behavior, expected behavior and non-sensitive evidence. |
| feature_or_design_discussion | The proposal reaches the selected public deliberation channel without implying implementation commitment. |
| documentation_report | A documentation gap identifies the affected public surface, current statement and expected correction. |
| code_or_documentation_contribution | The pull request shows intent, affected owners, tests, generated-asset status, compatibility and governance evidence. |
| support_request | The requester is routed to the supported community channel and sees what support is not promised. |
| maintainer_triage_and_decision | The responsible maintainer can classify, request evidence, close, accept or route the item without treating repository permission as undocumented policy authority. |

## Visible State Types

- route_available
- route_unavailable
- input_incomplete
- ready_to_submit
- submitted_or_opened
- redirected_to_confidential_channel
- redirected_to_discussion
- maintainer_review_pending
- declined_with_reason
- unsupported_request

## Authority And Presentation

| Mode | Effective-state authority | Primary presentation owner |
|---|---|---|
| Security disclosure | The selected confidential reporting system and published `SECURITY.md` policy | GitHub Security surface or the documented fallback channel |
| Issues and runtime reports | GitHub Issue state plus repository issue-form policy | `.github/ISSUE_TEMPLATE/` |
| Discussions | GitHub Discussion state plus published routing policy | GitHub Discussions and `SUPPORT.md` |
| Contributions | GitHub Pull Request state plus approved contribution policy | `CONTRIBUTING.md` and `.github/pull_request_template.md` |
| Maintainer decisions | Approved `GOVERNANCE.md` authority plus GitHub event state | GitHub issue, discussion or pull-request history |

## Activation Paths

- Repository README and About metadata.
- GitHub Community Profile links.
- New issue and new pull-request flows.
- Security tab or confidential fallback named by `SECURITY.md`.
- Public website support and repository links.

## Blockers And Recovery

| Blocker | Visible next action | Recovery |
|---|---|---|
| Security details are entered in a public path | Stop public submission and open the confidential reporting path | Provide the primary confidential link and a truthful fallback |
| Required issue or PR evidence is missing | Name the missing field without implying rejection | Allow the user to complete the structured form or explain why it is unavailable |
| The request is support rather than a defect | Route to the selected support or discussion channel | Preserve a link back to issue reporting when a reproducible defect emerges |
| The request is outside supported versions or surfaces | State the support boundary | Offer upgrade, discussion or unsupported-use guidance without promising remediation |
| GitHub-hosted confidential reporting is unavailable | Do not expose sensitive content publicly | Use the approved private fallback channel |
| Authority for a decision is unclear | Do not imply acceptance or enforcement | Route to the documented maintainer authority |

## Relevant State Transitions

- repository_entry -> choose_path
- choose_path -> confidential_security_report | public_issue | discussion | pull_request | support
- public_security_attempt -> redirected_to_confidential_channel
- incomplete_submission -> input_incomplete -> ready_to_submit
- submitted -> maintainer_review_pending -> accepted | revision_requested | declined_with_reason | redirected
- unsupported_request -> supported_alternative | closed_with_boundary

## Proposed PRD Acceptance Criteria

- Every working mode has one clearly named primary route and at least one safe recovery path where failure or misrouting is possible.
- Security-sensitive information is never solicited through a public issue form.
- Host capability absence produces a truthful private fallback rather than a dead link or public disclosure request.
- Issue and pull-request forms collect only information that an identified maintainer workflow uses.
- Support, Discussions and Issues have non-overlapping primary purposes with explicit redirection.
- Maintainer authority is stated narrowly and is not inferred from current technical permissions.
- Public response expectations distinguish best-effort handling from commitments.
- Language behavior is consistent across repository metadata, documents, forms and recovery messages.

## Resolved Product Decisions

- The current published release line is the only security-supported line.
- GitHub Private Vulnerability Reporting or Security Advisories is the preferred confidential route when verified available; `agdf@iself.eu` is the private fallback.
- Security and support handling is best effort; no numerical service-level promise is published.
- No CLA or DCO is required.
- Material AI assistance and the human verification or test evidence must be disclosed in pull requests; raw prompts, secrets and hidden reasoning are not requested.
- Arndt Gold is the current sole maintainer for triage, merge, release, conduct enforcement and security response. A documented governance change is required before authority changes.
- Issues serve actionable defects, runtime compatibility, documentation gaps and implementation-ready proposals. Discussions serve early ideas, questions and community support. Email is not a general support channel.
- German is the primary project language; English contributions and reports are accepted.

## Open Product Questions

- none

## Affected Outputs

- `SECURITY.md`, `SUPPORT.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `CODE_OF_CONDUCT.md`
- `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`
- README routing and GitHub repository metadata
- Public website contact and repository routes where the approved policy requires alignment

## Evidence

- Approved UR and completed Brownfield Review.
- GitHub public API: Issues and Discussions enabled; description, homepage and topics absent.
- GitHub Community Profile: 28 percent; README and License recognized; conduct, contribution and issue/PR templates absent.
- Existing `README.md`, `INSTALL.md`, `RELEASE.md`, workflows, Pages contact data and legal files.

## Missing Evidence

- Authenticated proof of private vulnerability reporting availability remains an implementation-time host check. It does not block the PRD because the approved email fallback is complete and fail-safe.

## Required Next Step

Incorporate the resolved interaction model into the PRD and request exact PRD approval. No implementation is permitted.
