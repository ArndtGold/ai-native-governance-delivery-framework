# UAT Evidence: AGDF Landing Page Simplification

Status: ready
Gate: UAT
Run: `agdf-pages-landing-simplification`
Date: 2026-08-19
Approved basis: QA Report Revision 3 and exact `Approval: QA`

## Acceptance Candidate

The candidate is the current repository-built static AGDF landing page with seven sections, 1,536
visible words, the explicit activity-to-delivery thesis, one four-step control model and the
canonical handbook/runtime detail boundary.

## User-Visible Outcome

- engineering teams and the human decision boundary are explicit in the first viewport;
- the Hero states the control-layer proposition and uses the Formula 1 analogy exactly once;
- the Problem section states `Agent activity is not delivery progress.` and connects useful activity
  to approved scope, visible evidence and deliberate transitions;
- the page presents exactly one control loop and keeps repository, host and publication evidence
  distinct;
- installation, alternative guidance, policy routes and responsibility owners remain reachable;
- desktop and mobile layouts preserve readable hierarchy without horizontal overflow.

## Acceptance Evidence

| Dimension | Result | Evidence |
|---|---|---|
| Approved scope | pass | Current approved PRD Revision 3, SD Revision 3 and TP Revision 2 |
| QA | approved | QA Report Revision 3 `pass`; exact `Approval: QA` accepted 2026-08-19 after revision-13 revalidation |
| Plan and UX fidelity | pass | Task Plan Review 12/12; LPS-AC-01 through LPS-AC-16 fulfilled |
| Solution and code integrity | pass | Clean Implementation Review and Code Review pass with no open finding |
| Static output | pass | Four routes; seven homepage sections; zero client scripts in built HTML |
| Content and payload | pass | 1,536 visible words; 1,210,792 referenced local-image bytes |
| Automated checks | pass | Astro check/build, landing mutation suite, public-document suite and Runtime Integrity |
| Visible local checks | pass | Fresh 1440x900 and 390x844 inspection on 2026-08-19; no horizontal overflow, responsive navigation and visible CTAs |
| Context Graph | pass | `CG-PUBLIC-PLUGIN-DISTRIBUTION` reconciliation resolved |

## Disclosed Acceptance Limits

- Evidence covers the repository and local static build only.
- It does not prove the deployed `agdf.iself.eu` domain, CDN behavior, analytics, publisher state,
  OpenAI portal review, directory availability or public release.
- No deployment, publication, release, commit, push or PR action is authorized by UAT evidence.
- The native mobile details menu remains open after an anchor selection until toggled. This does not
  hide or block the destination.

## UAT Decision Boundary

The user may accept the repository/local-render outcome with exact `Approval: UAT`, request a
revision or decline. Acceptance does not authorize deployment, publication, release or VCS delivery.
