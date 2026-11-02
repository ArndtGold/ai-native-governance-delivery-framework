# Task Plan: Proportionate AGDF Fit Onboarding

## Plan Meta

- workstream: `agdf-onboarding-fit-readme-clarity`
- derived_from: `PRD.md`, `SD.md`
- mode: `structured_slice`
- implementation_permission: granted via `Approval: TP` on 2026-07-14

## Tasks

| Task ID | Change | Owner And Boundary | Acceptance Evidence |
|---|---|---|---|
| AFC-01 | Add `#### Passt AGDF zu diesem Vorhaben?` in `README.md` under `Runtime und Setup`, after the Coding-Agent subsection heading and before the existing installation-reference paragraph. | `README.md` is the human onboarding surface only; do not alter conceptual sections or installation commands. | Targeted text inspection proves the heading order, German-first framing and no duplicate install flow. |
| AFC-02 | Add concise German-first copy that explains AGDF's appropriate fit, its practical value, and the legitimate lighter/no-AGDF outcome for low-risk or exploratory work. | README copy remains advisory and does not grant gate or implementation authority. | Text inspection proves purpose, benefit, overhead/risk balance and advisory boundary. |
| AFC-03 | Add the copyable English assessment prompt to the new README subsection. | Use the SD wording verbatim so the user-facing prompt is clear; README is not declared a runtime owner. | Prompt inspection proves the “before proposing implementation”, risk/overhead, lightest-path and explicit no-AGDF clauses. |
| AFC-04 | Update only the first `codex.defaultPrompt` in `plugin/meta/agdf-plugin.definition.json` to the approved proportionate wording. | Canonical definition remains the sole runtime owner; keep prompts two through four unchanged and ordered. | JSON inspection proves exact first prompt and preserved remaining order. |
| AFC-05 | Run `node create-agdf/scripts/sync-package-assets.js` to propagate canonical metadata. | Do not manually author derived prompt values. | Generated Codex manifest and package surface match canonical metadata. |
| AFC-06 | Run targeted validation and record results. | No QA claim during CD+Tests. | `node plugin/scripts/check-runtime-integrity.mjs`, `npm --prefix create-agdf run smoke-test`, `node create-agdf/bin/create-agdf.js doctor --json`, and `git diff --check` pass. |

## Traceability

| Requirement | Tasks |
|---|---|
| PRD-01: Early README fit decision in Runtime and Setup | AFC-01, AFC-02 |
| PRD-02: Explicit proportionate assessment | AFC-02, AFC-03, AFC-04 |
| PRD-03: Authority boundary and prompt preservation | AFC-02, AFC-04 |
| PRD-04: Single metadata owner and propagation | AFC-04, AFC-05 |
| PRD-05: Non-goals preserved | AFC-01 through AFC-06 |

## Test Plan

1. Inspect the README insertion point and verify it remains inside `Runtime und Setup`, before the installation reference.
2. Inspect canonical and derived prompt lists; verify the refined first prompt and unchanged following prompt order.
3. Run runtime integrity to verify no metadata drift.
4. Run the package smoke suite to verify propagation and installer/package behavior.
5. Run `doctor --json` after control-state writes and `git diff --check` before review.

## Non-Goals And Guardrails

- No change to Pages, installation commands, gate semantics, runtime contract, skills, hooks, evaluators, CLI behavior or control templates.
- No hand-maintained second runtime prompt owner.
- No claim that the advisory assessment itself approves or implements work.
- No commit, push, pull request or release in this task plan.

## Approval Required

Approve this task plan to permit Brownfield Analysis and CD+Tests: `Approval: TP`.
