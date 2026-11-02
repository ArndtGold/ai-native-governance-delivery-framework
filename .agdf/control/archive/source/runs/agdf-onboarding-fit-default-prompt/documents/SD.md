# Solution Design

## Document Control

- work item: `agdf-onboarding-fit-default-prompt`
- derived from: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/PRD.md`
- gate approval: `Approval: SD` pending post-artefact confirmation

## 1. Design Decision

Extend the existing canonical Codex `defaultPrompt` array in `plugin/meta/agdf-plugin.definition.json` by prepending one advisory onboarding prompt. Use the established package synchronization script to propagate the canonical metadata to generated package surfaces. Do not add a new skill, hook, evaluator, CLI command, gate rule or source-of-truth location.

## 2. Component Responsibilities

| Component | Responsibility | Change |
|---|---|---|
| `plugin/meta/agdf-plugin.definition.json` | Canonical plugin metadata owner | Add the first default prompt. |
| `plugin/.codex-plugin/plugin.json` | Installed Codex manifest | Receive the synchronized prompt list. |
| `create-agdf/scripts/sync-package-assets.js` | Generated package propagation | No logic change; run it to update generated surfaces. |
| `plugin/scripts/check-runtime-integrity.mjs` | Cross-surface contract validation | No logic change; verify exact equality. |
| `create-agdf` smoke tests | Package and routing regression evidence | No logic change; execute existing suites. |

## 3. Runtime Flow

```text
canonical plugin definition
        |
        v
sync-package-assets.js
        |
        v
Codex manifest + generated package metadata
        |
        v
runtime-integrity and smoke-test validation
```

The prompt itself only requests an assessment. It does not invoke or alter gate authority. Any later implementation remains governed by the normal AGDF runtime contract.

## 4. Exact Prompt Contract

The first prompt must be exactly:

> Evaluate whether AGDF is appropriate for this repository and request. Explain its purpose, practical value, governance overhead, and fit for the project's risk level. Recommend the smallest suitable AGDF path before proposing implementation.

The existing prompts remain in their current order after it.

## 5. Compatibility And Failure Handling

- If generated assets are stale, runtime-integrity must fail rather than silently accept drift.
- If the prompt list differs between canonical and Codex manifests, the existing equality check must report failure.
- No fallback prompt or second metadata owner is introduced.
- Existing installations continue to expose the original governance and closeout prompts.

## 6. Verification Design

1. Inspect the canonical prompt order and exact text.
2. Run `npm --prefix create-agdf run sync-package-assets`.
3. Run `node plugin/scripts/check-runtime-integrity.mjs`.
4. Run `npm --prefix agdf run smoke-test`.
5. Run `npm --prefix create-agdf run smoke-test`.
6. Run `npx --yes @agdf/cli@latest doctor --json`.
7. Review the diff to confirm only the intended metadata and generated surfaces changed.

## 7. Security And Governance

This is an advisory onboarding change. It must not claim compliance, grant approval, bypass Brownfield Review, or imply permission to implement, commit, push, open a PR or release. No secrets, user data, persistence or external integrations are involved.

## 8. Implementation Boundary

The implementation may modify only the canonical prompt metadata and synchronized outputs required by the existing propagation path. Any request to alter assessment logic, gate behavior, or runtime instructions is a separate scope.

## 9. Open Design Questions

None blocking. The exact wording and order are fixed by the PRD and this design.

## 10. Gate Decision

This Solution Design is ready for user confirmation. After valid post-artefact `Approval: SD`, create the focused Task Plan. Implementation remains forbidden until `Approval: TP` and the required pre-implementation Brownfield Analysis are complete.
