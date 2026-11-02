# UR: Sharpen AGDF Pages Positioning

- revision: 1
- status: approved
- approved_at: 2026-08-30
- approval: `Approval: UR`

## User Need

Visitors should understand how AGDF differs from specification frameworks, agent-development
methods and orchestration systems without relying on an unsupported superiority claim.

## Intended Outcome

The existing Pages problem section explains the defensible AGDF distinction in concise public copy:
many frameworks help agents perform work, while AGDF controls when that work may count as governed
delivery progress. The explanation grounds that distinction in approved scope, explicit human
authority, claim-matched evidence and repository-owned control state that remains understandable
across chats, agents and hosts.

## Scope

- Refine the existing problem-section copy in `pages/src/data/site.ts`.
- Add or update focused assertions in `pages/scripts/landing-page-test.mjs`.
- Preserve the existing Hero, seven-section structure and single control-loop model.

## Acceptance Criteria

1. The public copy distinguishes specification or agent-work organization from AGDF delivery control.
2. The copy states the defensible USP without claiming universal superiority or exclusive ownership
   of gates, artefacts, reviews or human approval.
3. Approved scope, explicit human authority, matching evidence and durable repository-owned control
   state remain visible as the basis of the distinction.
4. No competitor is named on the landing page.
5. The existing page structure, control loop and evidence boundaries remain unchanged.
6. The focused landing-page regression and Pages build pass.

## Non-Goals

- A competitor matrix or dedicated comparison section.
- Claims that AGDF replaces specification, orchestration, implementation or code-review tools.
- README, handbook, runtime, plugin, CLI, installation or host-behaviour changes.
- Deployment or publication.

