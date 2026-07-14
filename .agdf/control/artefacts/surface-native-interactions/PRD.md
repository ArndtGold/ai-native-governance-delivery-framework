# PRD: Surface-Native AGDF Interactions

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Based on: `.agdf/control/artefacts/surface-native-interactions/UR.md`; `.agdf/control/artefacts/surface-native-interactions/BROWNFIELD_REVIEW.md`
Date: 2026-07-14
Owner: AGDF

## 1. Product Scope

Deliver a portable AGDF interaction behavior that uses native Codex, Claude Code and OpenCode controls when they improve a real user decision, while retaining concise text as the universal fallback.

The product behavior must distinguish three interaction kinds:

1. `clarification`: a bounded question that gathers missing requirements, preferences or scope decisions but grants no AGDF authority.
2. `tool_permission`: a host-owned decision about executing a command, changing files, using the network, accessing an external directory or performing another side effect; it grants only the technical action shown by the host.
3. `gate_approval`: deliberate user authorization for exactly one currently-valid AGDF gate, represented by the exact value `Approval: <GateName>` and accepted only after the selected run and required durable artefact are revalidated.

Every AGDF-native interaction must make enough context visible for the user to understand the decision: interaction kind, active run or scope where relevant, current gate where relevant, proposed action, expected effect or side effects, and the consequence of each option.

### 1.1 Interaction Trigger Policy

Use a native structured interaction when at least one of these is true:

- two or more materially different user choices remain open;
- a missing answer would materially change scope, architecture, risk or delivery path;
- a host-controlled tool action requires technical permission;
- the selected AGDF run is ready for an exact user gate approval.

Do not add a structured interaction for:

- progress updates or status reporting;
- read-only actions already permitted by the host;
- routine low-risk actions that require no user decision;
- questions whose answer is discoverable from repository evidence;
- repeated approval prompts when the gate is not ready;
- generic confirmation after the user has already provided valid explicit authority.

### 1.2 Gate Approval Behavior

A native gate-approval interaction may be presented only when canonical gate evaluation confirms all of the following:

- exactly one selected run is in scope;
- the displayed gate is the run's current gate;
- the gate's required durable artefact exists and has a valid gate-specific status;
- no earlier gate or mandatory internal step blocks approval;
- the exact approval formula can be shown without ambiguity.

The interaction must provide a gate-specific approval choice using the exact value `Approval: <GateName>`, plus non-approving paths for requesting revision and cancelling or declining. A custom/free-form answer remains non-approving unless its submitted value itself contains the exact current-gate formula and passes normal gate validation.

After the user chooses approval, AGDF must re-evaluate the selected run before persisting or advancing. If the run, gate, artefact or blocker changed while the interaction was open, the answer is stale and must fail closed with a refreshed status.

### 1.3 Timeout And Automation Boundary

An AGDF gate approval must never result from:

- an unanswered-question timeout;
- a default or preselected option;
- auto-approve mode;
- accept-once or always-allow tool permission;
- plan approval;
- an agent inference from silence, urgency or generic consent;
- a hook, plugin or external process answering on the user's behalf without a deliberate user-originated gate decision.

If a surface cannot guarantee deliberate, non-expiring user input for a gate decision, AGDF must use the concise textual approval request instead of the native control.

### 1.4 Surface Outcomes

- Codex: use its native short-question control for clarification and ready gate approvals when available; continue using Codex-native permission dialogs for technical actions.
- Claude Code: use `AskUserQuestion` for clarification and ready gate approvals only when auto-continuation cannot grant approval; keep permission and plan decisions distinct from AGDF gates.
- OpenCode: use the native `question` interaction for clarification and ready gate approvals; keep `once`, `always`, `reject`, auto mode and permission configuration distinct from AGDF gates.
- Unsupported or non-interactive surface: render a concise textual question or exact approval request and wait for explicit user input.

## 2. Acceptance Criteria

- **AC-01** A canonical interaction contract distinguishes `clarification`, `tool_permission` and `gate_approval`.
- **AC-02** The contract carries or derives the active run/scope, current gate, displayed action, expected effect or side effects, decision options and required evidence when applicable.
- **AC-03** Native controls are used only at decision-relevant points defined by the trigger policy.
- **AC-04** Routine actions, progress updates and repository-discoverable questions do not create avoidable interaction prompts.
- **AC-05** A gate-specific native approval is offered only after canonical gate evaluation confirms one selected run, the current gate and a valid durable artefact.
- **AC-06** The approving option visibly uses the exact current-gate value `Approval: <GateName>`.
- **AC-07** Revision and cancel/decline options do not advance the gate or write approval evidence.
- **AC-08** A free-form or custom response does not approve a gate unless it independently satisfies the exact current-gate approval rule.
- **AC-09** Gate readiness is revalidated after the user response and before persistence or transition.
- **AC-10** Wrong-run, wrong-gate, missing-artefact and stale-interaction responses fail closed and expose the refreshed next permissible step.
- **AC-11** Tool permission, including session-wide or auto-approved permission, cannot satisfy an AGDF user gate.
- **AC-12** Plan approval cannot satisfy an AGDF user gate.
- **AC-13** Timeout, default selection, unattended continuation or agent inference cannot satisfy an AGDF user gate.
- **AC-14** Codex, Claude Code and OpenCode each have an explicit tested or inspectable mapping from the canonical interaction kinds to available native controls.
- **AC-15** A deterministic textual fallback remains available when native interaction capability is unavailable, unsafe for gate use or non-interactive.
- **AC-16** Existing plain-text exact approvals remain backwards compatible.
- **AC-17** Accepted gate decisions remain persisted in repository-owned AGDF control state; native UI state and chat history remain non-authoritative.
- **AC-18** Runtime-integrity and package tests detect drift between canonical semantics and generated surface guidance.

## 3. Non-Goals

- Building or styling Codex, Claude Code or OpenCode UI components.
- Replacing or intercepting host security and permission systems.
- Creating a second AGDF gate model, approval database or interaction service.
- Changing gate order, gate names or approval syntax.
- Automatically committing, pushing, opening pull requests or releasing after approval.
- Guaranteeing identical visual presentation across surfaces.
- Adding native interaction support to GitHub Copilot in this slice; it retains the canonical textual fallback.
- Making every agent action interactive.

## 4. Users And Roles

- **Delivery user:** answers clarifications, grants technical host permissions and explicitly approves or rejects AGDF gates.
- **Coding agent:** selects the interaction kind, presents bounded context, applies the surface mapping and never infers authority.
- **AGDF gate evaluator:** determines current gate readiness before presentation and revalidates after a response.
- **Repository control state:** remains the durable authority for scope, artefacts, approvals and next permissible action.
- **Host runtime:** owns native question rendering and technical permission enforcement; it does not own AGDF gate semantics.

## 5. Constraints

- Canonical gate semantics remain owned by `plugin/meta/agdf-runtime-contract.md`.
- Gate workflow behavior remains owned by `plugin/skills/gate-check/SKILL.md` and selected-run control state.
- Surface outputs must be generated or mapped from canonical owners; hand-maintained duplicate policy is forbidden.
- Host-native capabilities are optional enhancements, not prerequisites for AGDF correctness.
- Gate decisions must fail closed when capability, run selection, artefact state or user origin is uncertain.
- Interaction text must follow the configured chat language; durable artefacts and runtime contracts retain their configured languages.
- The behavior must remain compatible with existing plugin, npm and repository-local installation paths.
- Prompt frequency must remain proportional to risk and actual decision need.

## 6. Evidence Requirements

QA must later be able to verify:

1. canonical interaction semantics and ownership;
2. a Codex mapping for all three interaction kinds;
3. a Claude Code mapping including timeout and plan/permission separation;
4. an OpenCode mapping including `once`/`always`/auto-mode separation;
5. textual fallback behavior;
6. valid current-gate approval persistence;
7. rejection of wrong-run, wrong-gate, missing-artefact and stale responses;
8. rejection of timeout, default, host permission and plan approval as AGDF authority;
9. canonical-to-generated propagation and drift detection;
10. backwards compatibility for existing exact textual approvals.

Evidence may combine deterministic tests, generated-asset inspection and bounded authenticated surface probes. A visual host prompt alone is not evidence that durable gate validation or persistence worked.

## 7. Risks And Open Questions

| Risk or question | Required resolution |
|---|---|
| Native APIs and schemas can change independently of AGDF | SD must use capability-based adapters and define the fallback boundary. |
| A native option label may be mistaken for persisted authority | SD must define the response-to-validation boundary and one canonical approval owner. |
| Prompt fatigue could reduce attention at real gates | SD/TP must preserve the trigger policy and test that routine actions remain non-interactive. |
| Claude Code question auto-continuation may submit existing selections | SD must prohibit any gate mapping that can auto-submit; TP must include evidence. |
| OpenCode auto mode can approve technical permission requests | SD must keep gate questions outside permission authority; TP must include evidence. |
| Codex, Claude Code and OpenCode may not expose identical metadata | SD must identify the minimal common contract and surface-specific optional fields. |
| Executable adapter code may be unnecessary for some surfaces | SD must prefer instruction/generated metadata and add runtime code only where enforcement or reliable mapping requires it. |
| Context Graph invariant is not yet persisted | Create or update the reusable cross-surface invariant during an approved later step before closeout. |

## 8. Release Boundary

The first release is complete only when all three named surfaces have an explicit mapping and the textual fallback remains valid. A surface may use instruction-driven native behavior when its host owns the interaction, but AGDF must label the evidence honestly and must not claim technical enforcement it cannot demonstrate.

The feature must be additive: users who continue to type exact approval text receive the same gate behavior as before.

## 9. Next Step

Approved with `Approval: PRD` on 2026-07-14. The next permissible artefact is the Solution Design; implementation remains forbidden.

