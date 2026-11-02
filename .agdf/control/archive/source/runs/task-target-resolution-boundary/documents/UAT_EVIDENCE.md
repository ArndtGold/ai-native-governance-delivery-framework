# UAT Evidence: Task Target Resolution Boundary

Status: `approved`
Gate: `UAT`
Revision: `1`
Date: `2026-08-19`
Owner: user
Based on: approved QA Report dated 2026-07-28

Exact `Approval: UAT` accepted on `2026-08-19` after same-run, same-gate and Revision 2
revalidation, with the evidence boundary below retained.

## Acceptance Decision

Decide whether to accept the repository-proven target-resolution behavior with the disclosed
authenticated-host, attachment and host-path evidence limits.

## User Outcome

- An explicit target in the current request takes precedence over the working directory, mentioned
  repositories and evidence sources.
- Repository activation, scope classification and gate evaluation occur only after one primary
  target is resolved.
- A clear follow-up retains the confirmed target; an explicit target change replaces it visibly.
- Multiple plausible targets, unavailable targets and target-content mismatches fail closed before
  repository activation or mutation.
- Target, governance target, evidence sources and working directory remain visibly distinct in one
  non-authorizing presentation owner.

## Acceptance Evidence

| Acceptance area | Result | Evidence |
|---|---|---|
| Explicit target over working directory | pass | TTR-1 behavioral and contract coverage |
| Evidence source is not mutation authority | pass | TTR-2 behavioral coverage |
| Resolution precedes activation and gate evaluation | pass | TTR-3 Runtime Integrity and eval coverage |
| Follow-up stability and explicit target change | pass | TTR-4 and TTR-5 multi-turn coverage |
| Ambiguity, mismatch and unavailable target fail closed | pass | TTR-6 through TTR-8 adversarial and retry coverage |
| Compact non-authorizing presentation | pass | TTR-9 renderer coverage with `authorizes: false` |
| Generated-surface semantic parity | pass | TTR-10 sync, Runtime Integrity and smoke coverage |
| Approved plan and quality | pass | 13/13 tasks, 10/10 UX criteria, Clean Review, Code Review and QA pass |

## Evidence Boundary

Repository tests and deterministic replay prove the contract, ordering, presentation and generated
surface semantics. They do not prove attachment availability, host-specific path transport, model
compliance or visible behavior in authenticated Codex, Claude Code, OpenCode and Copilot sessions.
These remain explicit observation limits and must not be relabelled as performed UAT evidence.

## Intentionally Not Delivered

- changes to gate order, approval values or approval authority;
- a sandbox, ACL or permission system;
- unrestricted intent inference;
- a second scope classifier, presentation owner or renderer;
- historical-run migration;
- VCS, release, deployment or installed-plugin mutation.

## Decision Options

- Approve with exact `Approval: UAT` to accept the repository behavior and disclosed evidence
  boundary, then prepare the final Orchestration Report.
- Request revision and name the unmet acceptance outcome.
- Decline UAT.
