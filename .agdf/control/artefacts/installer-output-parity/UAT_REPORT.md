# UAT Report: Coherent AGDF Installation Lifecycle

Status: revise
Date: 2026-07-16
Scope: user-selected non-mutating UAT

## Scenarios

| Scenario | Result | Evidence |
|---|---|---|
| Exact-text QA fallback | pass | Native preflight was `unavailable_before_invocation`; the user supplied the undecorated exact QA value and same-run/same-gate revalidation accepted it. |
| Repository setup Success Card | pass | Local `codex-repo` in an isolated temporary repository rendered result, scope, expected version, healthy verification, restart requirement and one next action. |
| Read-only status separation | pass | Local JSON reported global installation healthy, repository active and delivery not configured; no run directory was created. |
| Repository disable | pass after remediation | Initial UAT exposed an incorrect next action; the canonical status branch was fixed and now reports restart while retaining healthy global installation. |
| Global uninstall preview | pass | Preview exposed the native removal plan, required confirmation and retained state; `codex plugin list` was byte-identical before and after. |
| Real repository plugin activation | not_verifiable | Excluded by the user-selected non-mutating scope. |
| Actual host restart/reload | not_verifiable | Excluded by the user-selected non-mutating scope. |
| Native approval button presentation | not_verifiable | Current preflight remains unavailable; exact text is safe and authoritative, but no native-button pass is claimed. |

## Decision

- decision: revise
- decisive_reason: real Codex repository activation and restart behavior remain unverified, as intentionally required by the selected non-mutating scope.
- remediation_completed: corrected the disabled-repository status next action; focused and aggregate regression evidence pass.
- required_next_step: renew QA approval for the post-QA code delta, then either authorize bounded host UAT or keep activation/restart explicitly unaccepted.
- release_effect: blocked; no UAT pass or release claim is permitted.

## Safety

- No global plugin install, disable, uninstall or update was applied.
- Only an isolated temporary repository was written; the fixture was removed after evidence capture.
- No commit, push, PR, publish or release action occurred.
