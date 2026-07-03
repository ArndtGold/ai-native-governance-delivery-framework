# AGDF for GitHub Copilot

This repository supports GitHub Copilot CLI and the Copilot Coding Agent through checked-in repository instructions.

## Primary instruction sources

1. Follow `AGENTS.md` as the main operating model.
2. Use `plugin/meta/agdf-runtime-contract.md` for repeated gate, quality-contract, and closeout output rules when this repository also contains the AGDF runtime files.
3. Reuse the AGDF skill names as prompt entrypoints: `agdf-gate-check`, `agdf-brownfield-analysis`, `agdf-task-plan-review`, `agdf-clean-implementation-review`, `agdf-qa-gate`, `agdf-release-or`, `agdf-delivery-closeout`.

## Working mode

- Default to **Quick Task Mode** for small questions, reviews, debugging, and local fixes without new product semantics.
- Escalate to **Structured Delivery Mode** for new capabilities, architecture or policy changes, persistence changes, release-critical work, or formal artefacts.

## Copilot prompt entrypoints

Use natural-language prompts such as:

- `Run an AGDF gate check for this request.`
- `Perform an AGDF brownfield analysis before implementation.`
- `Review the completed work against the AGDF task plan expectations.`
- `Make the AGDF QA gate decision from the available evidence.`

## Rules

- Respect the gate order and exact approval formula from `AGENTS.md`.
- Do not treat implicit consent as approval.
- Prefer evidence over assumptions.
- In brownfield work, reuse before create and avoid silent parallel structures.
- After relevant work, include exactly one `Next step:` and exactly one `Quality outlook:`.
