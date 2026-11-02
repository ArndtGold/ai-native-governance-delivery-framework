# Solution Design: Proportionate Fit Guidance With One Runtime Owner

## Design Decision

Use two intentionally different surfaces with one runtime source of truth:

| Concern | Owner | Responsibility |
|---|---|---|
| Human onboarding and copyable assessment | Root `README.md` | Explain when AGDF is useful, when it is disproportionate, and expose a copyable assessment prompt before installation. |
| Executable first suggestion in Codex | `plugin/meta/agdf-plugin.definition.json` | Own the first `codex.defaultPrompt` wording. |
| Derived runtime surfaces | `plugin/.codex-plugin/plugin.json`, generated package assets | Receive, but never independently define, the default-prompt list. |

The README prompt is deliberately a readable, copyable onboarding equivalent. It is not a second runtime contract and must not be described as authoritative plugin metadata.

## README Placement And Content

Insert `#### Passt AGDF zu diesem Vorhaben?` inside `## Runtime und Setup`, immediately after `### AGDF als Plugin mit einem Coding Agent anwenden` and before the existing installation-reference paragraph. This keeps the conceptual project explanation separate from plugin-use and installation decisions.

The section has three compact elements:

1. One German-first paragraph: AGDF helps when AI-assisted changes need visible scope, approval, evidence or coordination; it is not automatically proportionate for small, low-risk or exploratory work.
2. A short instruction to use the assessment before installation or governed delivery.
3. A single fenced, copyable English prompt.

The section must not repeat command examples, link to a second installation flow, prescribe a gate path, or claim that an assessment is an approval.

## Prompt Wording Contract

The canonical first prompt is:

> Assess whether AGDF is proportionate for this repository and request before proposing any implementation. Explain AGDF's purpose and practical benefits, weigh governance overhead against the project's delivery risk, and recommend the lightest suitable path — or explicitly advise against AGDF where it would add more process than value.

The README copyable prompt may match this wording exactly. Exact matching is preferred to make onboarding clear, but it is not a runtime synchronization mechanism; metadata validation continues to compare only generated runtime surfaces with the canonical definition.

## Propagation

1. Edit only `plugin/meta/agdf-plugin.definition.json` for the canonical runtime wording.
2. Run `node create-agdf/scripts/sync-package-assets.js` to update the Codex manifest and generated package surfaces.
3. Do not hand-edit derived prompt lists except where synchronization deterministically produces them.
4. Validate with runtime integrity and package smoke checks.

## Authority And Compatibility Boundaries

- The suitability assessment is advisory and precedes any proposal to implement.
- It does not approve UR, PRD, SD, TP, QA or UAT, and does not initialize durable control state.
- Existing default prompts two through four remain unchanged and in order.
- No CLI command, skill, hook, evaluator, runtime contract, Pages surface or installation instruction changes.
- No migration or backwards-compatibility adapter is required because the first suggestion changes wording only and existing suggested actions remain available.

## Validation Design

| Check | Evidence |
|---|---|
| README placement and content | Targeted text inspection confirms section order, German framing and copyable prompt. |
| Canonical wording | Targeted JSON inspection confirms the first `codex.defaultPrompt`. |
| Derived prompt order | Generated Codex manifest matches canonical definition and retains the following three prompts. |
| Runtime drift | `node plugin/scripts/check-runtime-integrity.mjs` passes. |
| Package propagation | `npm --prefix create-agdf run smoke-test` passes. |
| Repository hygiene | `node create-agdf/bin/create-agdf.js doctor --json` and `git diff --check` pass. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| README copy drifts from runtime wording | Keep runtime ownership explicit; use the canonical wording verbatim in the README for this slice. |
| Prompt is mistaken for implementation authority | State "before proposing any implementation" and preserve the advisory boundary in README copy. |
| Derived metadata is hand-edited and diverges | Synchronize from canonical metadata and run runtime integrity. |

## Context Graph

- context_graph_impact: `none`
- rationale: no durable architecture, ownership or policy relationship changes; this is constrained onboarding wording on established owners.

## Approval

- status: approved
- approval: `Approval: SD`
- approval date: 2026-07-14

## Decision Required

Approve the task plan before implementation: `Approval: TP`.
