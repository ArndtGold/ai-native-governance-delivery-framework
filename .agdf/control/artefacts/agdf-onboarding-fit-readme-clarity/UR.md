# User Requirement: Sharpen AGDF Fit Guidance In README And Default Prompt

## Work Item

- key: `agdf-onboarding-fit-readme-clarity`
- title: Make AGDF fit assessment visible before installation and explicitly proportionate
- status: approved
- approval: `Approval: UR`

## User Need

People evaluating AGDF should be able to decide before installation whether its governance is proportionate for their repository and request. The visible project entry point and the first Codex default prompt must explain AGDF's value and administrative cost honestly, recommend the lightest suitable path, and clearly permit a recommendation against AGDF when it would add more process than value.

## Proposed Behavior

1. Add a concise, German-first `Passt AGDF zu diesem Vorhaben?` section to the root `README.md` under `Runtime und Setup`, immediately before the existing installation reference. It should contain a copyable English assessment prompt and explain its purpose in plain German.
2. Sharpen the first canonical Codex `defaultPrompt` so it asks whether AGDF is proportionate, weighs delivery risk against governance overhead, recommends the lightest suitable path, and explicitly advises against AGDF when it would add more process than value.
3. Keep the canonical definition as the sole metadata owner and synchronize all derived Codex/package surfaces.

## Acceptance Criteria

1. The root README presents the fit decision before installation or setup material and does not duplicate installation instructions.
2. The README prompt asks for purpose, practical benefit, administrative overhead, delivery-risk fit and the smallest suitable AGDF path.
3. The prompt allows the answer to recommend against AGDF where the overhead is disproportionate.
4. The first Codex default prompt expresses the same proportionate-governance decision without granting implementation or gate authority.
5. `plugin/meta/agdf-plugin.definition.json` remains the sole canonical prompt owner; Codex manifest and generated package surfaces stay synchronized.
6. Existing governance-start, durable-control-state and closeout prompts stay available and retain their order after the first prompt.
7. No gate model, runtime contract, skill, CLI behavior, installation command or Pages content changes.
8. Relevant documentation, runtime-integrity and package smoke checks pass.

## Scope Boundary

In scope: root README fit-assessment entry and the canonical first Codex default prompt with its required derived-surface synchronization.

Out of scope: installation instructions, Pages, gate semantics, runtime contract, skills, hooks, evaluators, CLI behavior, control templates, commits, pushes, pull requests and releases.

## Evidence And Approval

- source discussion: current Codex task on 2026-07-14
- related completed scope: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/`
- approval: `Approval: UR` received on 2026-07-14
- placement clarification: user directed placement under `Runtime und Setup` on 2026-07-14; the scope and acceptance intent are unchanged.
