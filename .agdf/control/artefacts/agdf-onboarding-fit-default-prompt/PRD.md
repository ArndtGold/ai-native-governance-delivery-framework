# Product Requirements Document

## Document Control

- work item: `agdf-onboarding-fit-default-prompt`
- source: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/UR.md`
- brownfield basis: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/BROWNFIELD_REVIEW.md`
- gate approval: `Approval: PRD` pending post-artefact confirmation

## 1. User Outcome

When a user first engages with AGDF, the first suggested Codex action should help them decide whether AGDF is appropriate for the repository and request. The response should explain value and overhead, assess fit against project risk, recommend the smallest suitable AGDF path, and preserve the distinction between advice and implementation authority.

## 2. Product Behavior

The first Codex `defaultPrompt` entry becomes:

> Evaluate whether AGDF is appropriate for this repository and request. Explain its purpose, practical value, governance overhead, and fit for the project's risk level. Recommend the smallest suitable AGDF path before proposing implementation.

The existing prompts remain available in this order afterward:

1. `Start this request under AGDF governance.`
2. `Create durable AGDF control state for this repository.`
3. `Close this delivery run with an auditable AGDF report.`

## 3. Requirements

### PRD-01: First-interaction assessment

The first Codex default prompt must request a suitability assessment rather than directly starting implementation or control-state creation.

### PRD-02: Assessment coverage

The prompt must ask for:

- AGDF purpose;
- practical value;
- governance overhead;
- fit for the repository/request risk level;
- the smallest suitable AGDF path.

### PRD-03: Authority boundary

The prompt must not grant approval, implementation, commit, push, PR, QA, UAT or release authority. It must explicitly place implementation after the assessment and applicable AGDF gates.

### PRD-04: Existing prompt preservation

The three existing default prompts must remain unchanged in wording and available after the new first prompt.

### PRD-05: Canonical propagation

The canonical plugin definition remains the source of truth. The Codex manifest and generated package surfaces must be synchronized through the existing asset propagation path.

### PRD-06: Verification

The change must pass:

- `node plugin/scripts/check-runtime-integrity.mjs`;
- `npm --prefix agdf run smoke-test`;
- `npm --prefix create-agdf run smoke-test`;
- `npx --yes @agdf/cli@latest doctor --json`.

## 4. Non-Functional Requirements

- Runtime prompt language remains English, consistent with `runtime_language=en`.
- Wording must be concise enough for a composer starter prompt.
- The prompt must be advisory and evidence-oriented, not promotional or absolute.
- No changes to the Runtime Contract, gate transitions, skills, control templates or evaluator behavior.

## 5. Acceptance Criteria

| ID | Acceptance criterion | Evidence |
|---|---|---|
| AC-01 | The suitability prompt is the first Codex default prompt. | Canonical definition and Codex manifest inspection |
| AC-02 | The prompt covers purpose, value, overhead, risk fit and proportional path. | Exact prompt text review |
| AC-03 | The prompt does not imply implementation authority. | Exact prompt text and runtime-integrity review |
| AC-04 | Existing governance and closeout prompts are preserved. | Canonical definition diff |
| AC-05 | Generated package surfaces match the canonical definition. | Sync plus runtime-integrity evidence |
| AC-06 | Existing CLI and package smoke tests remain green. | Command results |
| AC-07 | Doctor reports no control-state finding after the backlog/artefact update. | `doctor --json` result |

## 6. Scope And Out Of Scope

### In scope

- One new first-position Codex default prompt.
- Canonical definition update.
- Codex manifest and generated package propagation.
- Focused runtime and smoke verification.

### Out of scope

- Changes to AGDF gate semantics or approvals.
- Changes to the Runtime Contract or skills.
- New assessment CLI commands or output schemas.
- Changes to Claude, Copilot or OpenCode prompt behavior unless generated propagation requires their existing metadata copy to remain consistent.
- Product claims that AGDF is mandatory or suitable for every repository.

## 7. Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Users may interpret the assessment as a compliance verdict. | medium | Keep wording advisory and require a risk-fit explanation rather than a binary certification. |
| Users may expect the first action to start delivery immediately. | low | Preserve the existing governance-start prompt as the second option. |
| Manifest drift occurs if files are edited independently. | medium | Edit the canonical definition first and run the existing sync/integrity checks. |

## 8. Implementation Boundary

Implementation is limited to the existing canonical metadata owner and its established propagation path. No new source of truth or runtime decision point may be introduced.

## 9. Gate Decision

This PRD is ready for user confirmation. Implementation remains forbidden until the PRD has durable post-artefact approval, followed by the required SD/TP path or an explicitly evidenced smaller route.
