# User Requirement

## Work Item

- key: `agdf-onboarding-fit-default-prompt`
- title: Add an AGDF suitability-assessment prompt as the first Codex default prompt
- status: approved
- approval: `Approval: UR`

## User Need

An AGDF user should receive an initial, practical assessment of whether AGDF fits the repository and request before starting governed delivery work.

## Proposed Behavior

Add this runtime-language prompt as the first Codex `defaultPrompt` entry:

> Evaluate whether AGDF is appropriate for this repository and request. Explain its purpose, practical value, governance overhead, and fit for the project's risk level. Recommend the smallest suitable AGDF path before proposing implementation.

Keep the existing governance-start, durable-control-state, and delivery-closeout prompts available after it.

## Acceptance Criteria

1. The first Codex default prompt requests an evidence-based suitability assessment.
2. The prompt covers purpose, practical value, governance overhead, project risk fit, and proportional AGDF path.
3. The prompt does not imply implementation authority.
4. The canonical plugin definition, Codex manifest, and generated package surfaces remain synchronized.
5. Runtime-integrity and relevant package smoke tests pass.

## Scope Boundary

In scope: Codex default prompt wording and its canonical/generated propagation.

Out of scope: changes to gate semantics, runtime contract, skills, control templates, or the evaluation logic itself.

## Evidence And Approval

- user approval: `Approval: UR`
- approval date: 2026-07-13
- source discussion: current Codex task conversation
