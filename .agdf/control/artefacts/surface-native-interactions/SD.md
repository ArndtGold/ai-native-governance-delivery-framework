# SD: Surface-Native AGDF Interactions

Status: approved
Gate: SD
Gate approval: `Approval: SD` recorded on 2026-07-14
Based on: `.agdf/control/artefacts/surface-native-interactions/PRD.md`
Date: 2026-07-14
Owner: AGDF

## 1. Solution Overview

Implement the approved behavior as a contract-and-adapter extension of existing AGDF owners:

1. Add one normative **Native Interaction Contract** to the canonical Runtime Contract.
2. Extend the canonical gate-check skill to select native structured questions only when the interaction contract permits them.
3. Declare surface capability metadata in the canonical plugin definition and generate surface-specific guidance/configuration through the existing package sync path.
4. Keep canonical gate evaluation and repository control state as the only approval validator and durable authority.
5. Retain concise exact-text interaction as the deterministic fallback on every surface.

No custom UI component, new gate service, new persistence layer or new workflow skill is introduced.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design rule |
|---|---|---|
| Interaction semantics and invariants | `plugin/meta/agdf-runtime-contract.md` | Owns interaction kinds, required context, timeout/automation prohibition, user-origin requirement and fallback behavior. |
| Gate readiness and prompting workflow | `plugin/skills/gate-check/SKILL.md` | Decides whether a gate question may be shown and revalidates the response before transition. |
| Surface capability declaration | `plugin/meta/agdf-plugin.definition.json` | Declares host tool names/capabilities and technical permission ownership without duplicating gate policy. |
| Surface generation | `create-agdf/scripts/sync-package-assets.js` | Maps canonical skill/contract language into Codex, Claude Code, OpenCode and fallback surfaces. |
| OpenCode repository configuration | canonical OpenCode metadata plus `create-agdf/bin/create-agdf.js` merge path | Enables native questions when not user-denied while preserving user configuration and explicit edit/bash permissions. |
| Approval validation and persistence | selected `.agdf/control/runs/<run_id>/RUN_STATE.md` plus existing control-state parser/evaluator | Remains authoritative; native UI answers are inputs, not state. |
| Drift enforcement | `plugin/scripts/check-runtime-integrity.mjs` | Verifies canonical semantics, surface metadata, skill mapping and generated ownership. |
| Package regression evidence | `create-agdf/scripts/smoke-test.js` and focused control-state tests | Verifies generated mappings/configuration and fail-closed behavior. |
| User-facing setup boundaries | `INSTALL.md` and existing Pages compatibility data where needed | Explains native enhancement versus deterministic fallback without claiming host UI ownership. |

## 3. Architecture Decisions

### AD-01: Two-Layer Contract

The solution uses two layers with separate authority:

- **Normative semantic layer:** Runtime Contract defines what an AGDF interaction means.
- **Surface capability layer:** canonical plugin metadata declares how a host can render or enforce the interaction.

Surface metadata must not restate gate order, approval validity or persistence rules.

### AD-02: Canonical Interaction Envelope

The normative envelope is conceptually:

```text
interaction_kind: clarification | tool_permission | gate_approval
surface: codex | claude | opencode | fallback
run_id: required for gate_approval
current_gate: required for gate_approval
prompt: required
options: required for structured questions
effects: required when an action has side effects
required_evidence: required for gate_approval
auto_resolution: forbidden for gate_approval
response_origin: deliberate_user_input for gate_approval
```

This is a semantic contract, not a new persisted record. Existing run state records the resulting approval and evidence.

### AD-03: Gate Interaction State Machine

A native gate interaction follows one bounded sequence:

1. Resolve exactly one selected run.
2. Run canonical gate-check and confirm the required durable artefact is present and ready.
3. Build a gate-specific question whose approving option is exactly `Approval: <GateName>`.
4. Present through a safe native adapter or textual fallback.
5. Receive deliberate user input with no timeout/default authority.
6. Re-run canonical gate-check against the same `run_id` and expected gate.
7. Reject stale, wrong-run, wrong-gate or no-longer-ready input.
8. Persist accepted approval through the existing control-state workflow and expose the newly permitted next step.

No native option selection writes control state directly.

### AD-04: Native Adapter Selection

| Surface | Clarification adapter | Gate-approval adapter | Technical permission owner | Gate safety boundary |
|---|---|---|---|---|
| Codex | native short-question/request-user-input control when callable | same control with one gate question and no auto-resolution setting | Codex sandbox/approval/app action UI | If the native control cannot wait for deliberate input, use exact text. |
| Claude Code | `AskUserQuestion` | `AskUserQuestion` only when `askUserQuestionTimeout` cannot auto-continue the gate question | Claude Code permission prompts and `ExitPlanMode` | Do not add a hook that supplies `answers` or `updatedInput` for a gate. If timeout safety is unknown, use exact text. |
| OpenCode | `question` | `question` with exact approval option | OpenCode `permission` outcomes (`once`, `always`, `reject`) and auto mode | Set/merge `permission.question: allow` only when not explicitly user-denied; permission outcomes never become gate input. |
| Fallback / non-interactive | concise text | exact textual approval request | host-specific | Wait for a new explicit user response; never synthesize one. |

### AD-05: Codex Mapping

Codex integration is instruction-driven and uses the currently callable native short-question control. For `gate_approval`:

- ask one question, not a multi-question batch;
- include the selected run and current gate in the prompt;
- present `Approval: <GateName>`, request revision and cancel/decline as bounded outcomes;
- omit any auto-resolution option;
- treat a free-form response through the existing exact-approval validator;
- leave command, edit, network, external-directory and app-action approval to Codex.

No new Codex plugin capability, MCP server or lifecycle hook is required.

### AD-06: Claude Code Mapping

Claude Code integration remains skill-driven. `AskUserQuestion` supports structured questions, while Claude permissions and `ExitPlanMode` remain separate host authority.

For AGDF gates:

- do not configure an auto-continue timeout for AGDF;
- if a user-level timeout is active or cannot be determined safe, use textual fallback;
- do not use `PreToolUse` or another hook to pre-fill `answers`, return `updatedInput`, auto-allow, or otherwise answer a gate question;
- do not interpret plan approval as an AGDF gate;
- non-interactive `defer`/resume integration is outside this slice because it would require a separate trusted UI and user-origin proof.

The existing SessionStart hook remains unchanged except for compact source guidance if required; it must not become an approval interceptor.

### AD-07: OpenCode Mapping

OpenCode integration uses its built-in `question` tool and existing repository instructions/skills.

- Canonical OpenCode metadata declares `question: allow` alongside existing permissions.
- Config generation writes that permission for new AGDF repository surfaces.
- Merge logic adds it only when the user configuration has no explicit `question` decision; an explicit user `deny` is preserved and triggers textual fallback.
- `once`, `always`, `reject`, permission pattern suggestions and `--auto` apply only to technical tools.
- No new custom OpenCode tool is created.
- The npm plugin remains a discoverability/context hook, not a gate policy owner.

### AD-08: Prompt-Fatigue Control

The gate-check skill owns the trigger policy. It must prefer repository inspection over clarification and must not invoke structured UI for status updates, discoverable facts, routine read-only work or repeated non-ready gate prompts.

Native interaction is a presentation improvement at real decision points, not a new ceremony layer.

### AD-09: Backwards Compatibility

Exact textual approvals remain canonical and fully supported. Native controls produce inputs that are validated by the same path; they do not create a competing approval format.

Existing users, CI flows and non-interactive integrations remain valid without native UI support.

### AD-10: Honest Enforcement Classification

Evidence must distinguish:

- host-enforced technical permission;
- instruction-driven selection of a native question tool;
- deterministic AGDF gate validation and persistence.

The release must not claim that a host UI enforces AGDF semantics when only skill instructions select that UI.

## 4. Integration Points

### Canonical files

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/meta/agdf-agent-router.md` only if a short routing reminder is necessary

### Generation and package files

- `create-agdf/scripts/sync-package-assets.js`
- generated Codex, OpenCode and Copilot/fallback runtime copies
- `create-agdf/bin/create-agdf.js` OpenCode config merge path

### Validation

- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/smoke-test.js`
- focused control-state/gate tests where existing coverage does not prove stale/wrong-gate rejection

### Documentation

- `INSTALL.md` surface boundaries
- Pages compatibility or feature explanation only if needed to avoid public capability drift

## 5. Constraints And Compatibility

- Preserve the public AGDF CLI command set; no new command or parameter is introduced.
- Preserve existing plugin installation and generated repository layouts.
- Preserve explicit user OpenCode permission choices; generated config may add only missing owned defaults.
- Do not make a native host control mandatory for correctness.
- Do not auto-answer, preselect or time out a gate approval.
- Do not allow an agent-to-agent message, hook output or permission response to carry user authority.
- Do not edit generated files independently of their canonical owners.
- Keep durable artefacts in English and user-facing interaction text in configured chat language.
- Use current host tool names as capability metadata, with text fallback when unavailable or changed.

## 6. Test And Evidence Strategy

### Deterministic contract tests

- Runtime Contract contains the three interaction kinds, gate state machine, deliberate-user-input requirement, no-auto-resolution invariant and fallback rule.
- Gate-check skill requires readiness before presenting gate approval and revalidation after response.
- Runtime integrity validates canonical surface metadata and required contract/skill clauses.

### Generated-surface tests

- Codex packaged skill/runtime copy contains the canonical mapping and no auto-resolution permission for gates.
- Claude packaged skill/runtime copy contains `AskUserQuestion` mapping and forbids timeout/hook-supplied approval.
- OpenCode generated instructions/skill contain `question` mapping and distinguish permissions from gates.
- OpenCode generated config and merge fixtures cover absent, existing-allow and explicit-deny `question` settings.
- Copilot/generic generated content retains concise textual fallback.

### Gate behavior tests

- valid post-artefact exact approval advances only the current gate;
- missing artefact, wrong gate, ambiguous run and stale expected gate remain blocked;
- generic consent, permission outcome labels and plan approval do not satisfy a gate;
- textual approvals remain backwards compatible.

### Surface evidence

- Codex: inspect the callable native interaction behavior in a live Codex session and verify that no auto-resolution is configured for a gate question.
- Claude Code: inspect current `AskUserQuestion`/permission behavior and, where an authenticated runtime is available, run a bounded prompt showing that a gate question is not accepted through timeout or plan approval.
- OpenCode: run a bounded repository-surface probe showing the native question path and that auto permission mode does not produce an AGDF approval.

Authenticated UI probes are supporting evidence; deterministic contract, generated-surface and gate-state tests remain release-critical.

## 7. Risks And Open Questions

| Risk | Design mitigation | TP requirement |
|---|---|---|
| Host tool names or schemas change | Capability metadata plus textual fallback | Add drift assertions that fail visibly without breaking fallback. |
| Claude user timeout cannot be inspected reliably by a skill | Use textual fallback whenever safety is not known | Test documented safe and fallback branches. |
| OpenCode user denies `question` | Preserve deny and use textual fallback | Add merge fixture and fallback assertion. |
| A native response arrives after gate state changes | Revalidate run and expected gate before persistence | Add stale-response fixture or equivalent deterministic test. |
| Prompt fatigue | Central trigger policy and no routine prompts | Add negative trigger cases to skill/integrity checks. |
| Instruction-driven UI selection is mistaken for enforcement | Explicit evidence taxonomy | QA must label each surface honestly. |

## 8. Context Graph Decision

Create one reusable invariant during approved implementation/closeout:

> Host permission, plan approval and native question presentation are not AGDF gate authority. Only deliberate user input that passes current-run, current-gate and durable-artefact validation may be persisted as an AGDF approval.

The Context Graph records the invariant and links this delivery; it does not duplicate surface schemas or version details.

## 9. Next Step

SD was approved with exact post-artefact evidence on 2026-07-14. Prepare the Task and Test Plan; implementation remains blocked until exact `Approval: TP` and the required post-TP Brownfield Analysis.
