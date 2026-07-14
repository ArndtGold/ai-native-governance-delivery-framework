# Product Requirements Document: Proportionate AGDF Fit Onboarding

## Product Decision

AGDF onboarding must help users decide whether to use AGDF before they install or start governed work. The decision must be candid: AGDF is valuable where delivery risk and coordination need traceability, but it is not automatically the right choice for every repository or request. The first default prompt and the public root README must consistently recommend the lightest suitable path, including a clear recommendation against AGDF when its administrative cost exceeds its likely value.

## User Outcome

A user can, within the first README screen or first Codex interaction:

1. understand AGDF's purpose and practical benefit;
2. weigh its governance overhead against repository and delivery risk;
3. receive a proportional recommendation rather than a default escalation to governed delivery; and
4. distinguish this advisory assessment from approval, implementation permission or a runtime gate decision.

## Requirements

### PRD-01: Early README Fit Decision

The root `README.md` must add a concise German-first section titled `Passt AGDF zu diesem Vorhaben?` inside `Runtime und Setup`, immediately before the existing installation reference.

The section must:

- explain in plain German that AGDF is most useful where AI-assisted work affects existing systems, delivery risk, coordination or accountability;
- state that very small, low-risk or exploratory work can be better served by a lighter approach;
- contain one copyable English prompt for an agent-led suitability assessment; and
- direct users to installation only after this decision, without copying commands or installation material.

### PRD-02: Explicitly Proportionate Assessment Prompt

The copyable README prompt and the first canonical Codex `defaultPrompt` must communicate the same decision criteria:

- assess AGDF's suitability and purpose for the repository and request;
- explain practical benefits and administrative/governance overhead;
- weigh that overhead against delivery risk;
- recommend the lightest suitable AGDF path before proposing implementation; and
- explicitly advise against AGDF when it would add more process than value.

The runtime prompt must remain English because it is user-facing plugin metadata. The surrounding README explanation remains German-first.

### PRD-03: Authority Boundary

Neither the README section nor the default prompt may imply that the assessment grants a gate approval, authorizes implementation, initializes durable control state or changes the AGDF runtime contract. Existing governance-start, durable-control-state and delivery-closeout prompts remain available after the first prompt in their current order.

### PRD-04: Single Metadata Owner And Propagation

`plugin/meta/agdf-plugin.definition.json` remains the sole canonical owner of the runtime default-prompt wording. `plugin/.codex-plugin/plugin.json` and generated package assets must be updated only through the established synchronization path. The README may present a copyable equivalent for people, but it must not claim to be the runtime source of truth.

### PRD-05: Non-Goals

This slice must not change installation instructions, Pages, gate semantics, runtime contract, skills, hooks, evaluators, CLI behavior, control templates, or release behavior.

## Acceptance Criteria

1. `README.md` contains the new fit-decision section at the defined early location with concise German-first framing and a copyable English prompt.
2. The visible prompt covers purpose, practical benefits, overhead, delivery-risk fit, smallest suitable path and an explicit no-AGDF outcome when disproportionate.
3. The first canonical Codex default prompt contains the same proportionate decision, remains advisory, and preserves the three following prompts and their order.
4. Canonical definition, Codex manifest and generated package surfaces are synchronized; no independently maintained runtime prompt is introduced.
5. Runtime integrity, relevant package smoke checks, documentation checks and `git diff --check` pass.

## Evidence And Constraints

- Existing owner and propagation evidence: `BROWNFIELD_REVIEW.md`.
- Prior first-prompt delivery: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/OR.md`.
- No new runtime capability, external integration or data handling is required.
- Context Graph impact: none.

## Approval

- status: approved
- approval: `Approval: PRD`
- approval date: 2026-07-14
- note: this approval follows the user-directed placement refinement under `Runtime und Setup`.

## Decision Required

Approve the focused SD to create the task plan: `Approval: SD`.
