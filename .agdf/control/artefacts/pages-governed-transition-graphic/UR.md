# UR: Add the Governed Transition Graphic to Pages

- revision: 1
- status: approved
- approved_at: 2026-08-30
- approval: `Approval: UR`

## User Need

Visitors should understand at a glance how agent output becomes governed delivery progress and what
AGDF makes visible in the interaction versus durable in the repository.

## Intended Outcome

The existing Pages problem section contains one responsive, accessible visual that shows:

1. agents produce plans, code and tests;
2. AGDF checks approved scope, explicit human authority, claim-matched evidence and durable control state;
3. the AGDF interaction exposes the current gate, blocker and next allowed action;
4. `.agdf/control/` records scope, approvals, evidence references and run state; and
5. a missing requirement stops the governed workflow, while satisfied requirements permit the
   transition to count as governed delivery progress.

## Scope

- Add the visual inside the existing `#problem` section rather than creating another top-level section.
- Use repository-native HTML/CSS/Astro so text remains exact, responsive and accessible.
- Reuse the current Pages design language and positioning copy.
- Add deterministic structural and copy assertions plus rendered responsive evidence.

## Acceptance Criteria

1. The visual clearly separates agent output, the AGDF control point and the two possible outcomes.
2. It distinguishes interaction-visible state from durable repository evidence without implying a
   separate dashboard or universal host-side enforcement.
3. `.agdf/control/` is named as the durable location for scope, approvals, evidence references and run state.
4. The visual remains readable and correctly ordered on desktop and narrow mobile layouts.
5. Essential meaning is available to assistive technology and does not depend on colour alone.
6. The existing seven-section structure, control-loop model, competitor boundary and installation content remain unchanged.
7. Focused Pages build, landing regression, responsive rendering and whitespace checks pass.

## Non-Goals

- A new top-level section, dashboard, animation or interactive workflow simulator.
- Claims that every host technically enforces AGDF gates or automatically displays the full repository record.
- Runtime, plugin, CLI, installation, README, handbook, deployment or release changes.
- Commit, push or publication.
