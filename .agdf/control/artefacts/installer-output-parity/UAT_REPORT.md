# UAT Report: Coherent AGDF Installation Lifecycle

Status: accepted
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

- decision: accepted_with_disclosed_limitations
- decisive_reason: Exact `Approval: UAT` was recorded on 2026-07-17 after renewed QA and accepted the delivered behavior within the explicitly non-mutating UAT scope; real Codex repository activation and restart behavior remain unverified and are not claimed.
- remediation_completed: corrected the disabled-repository status next action; focused and aggregate regression evidence pass.
- required_next_step: no further delivery step; a separately authorized live-host verification may be performed later if activation/restart proof is desired.
- release_effect: delivery closeout is allowed; commit, push, PR, publish and release still require separate explicit instruction.

## Safety

- No global plugin install, disable, uninstall or update was applied.
- Only an isolated temporary repository was written; the fixture was removed after evidence capture.
- No commit, push, PR, publish or release action occurred.
