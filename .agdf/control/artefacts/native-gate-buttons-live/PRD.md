# PRD: Clear Native Gate Interaction Boundaries

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Based on: `.agdf/control/artefacts/native-gate-buttons-live/UR.md`; `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md`
Date: 2026-07-14
Owner: AGDF

Delivery mode: `structured_delivery`

## Product Outcome

When AGDF cannot safely present a gate approval because the active run or gate is not uniquely ready, the user sees a clear resolution step instead of an apparently broken button prompt. Once one run and one ready gate are confirmed, AGDF presents one native gate question when the host safely supports it and otherwise uses the exact textual approval path.

## Problem Statement

The current native-interaction contract correctly fails closed for ambiguous runs, but the user-facing boundary between run clarification, gate readiness, native presentation and exact-text approval can still be read as one generic approval prompt. In particular, `AGDF_ACTIVE_RUN_AMBIGUOUS` must not look like a missing `Approval: UR` that the user can bypass by typing the approval immediately.

## Users And Jobs

- A user with multiple active runs needs to know which run must be selected before any gate approval can be considered.
- A user at a ready gate needs one deliberate, gate-specific approval decision.
- A user on a host without a safe native question needs a concise, exact textual approval path.
- An agent needs wording that does not confuse host presentation with AGDF authority.

## Functional Requirements

### 1. Clarification Before Gate Approval

1. `AGDF_ACTIVE_RUN_AMBIGUOUS` must be presented as a run-selection blocker, not as a ready UR gate.
2. The response must state that AGDF cannot select a run silently.
3. Where available, the response must identify the competing run IDs or otherwise state how the user can select one.
4. No native gate-approval question or simulated button may be presented while the run is ambiguous.
5. `Approval: UR` supplied while the run remains ambiguous must not advance or persist the gate.

### 2. Ready Gate Presentation

1. After exactly one run is selected, AGDF must re-evaluate the same run and confirm that the current gate and durable artefact are ready.
2. If the declared native adapter is callable and can wait for deliberate user input without timeout, default, hook or auto-continue behavior, AGDF MUST invoke that adapter before emitting any textual approval request.
3. The native question must identify the selected run and current gate and offer the exact approving value `Approval: <GateName>` plus bounded revise and decline outcomes.
4. The native attempt is mandatory, bounded to exactly one attempt, and must be observable in the agent action trace as a native-adapter invocation.
5. A host-owned native control must never be simulated, forced or treated as AGDF authority by itself.

### 3. Exact-Text Fallback

1. AGDF MUST NOT emit a textual approval request for a ready gate before the mandatory native attempt has been made, unless the adapter is explicitly unavailable, unsafe, non-interactive or unable to wait for deliberate input.
2. If the ready gate's native control is unavailable, unsafe, not rendered or non-interactive, AGDF must immediately use concise exact-text wording without retrying the native prompt.
3. The agent must record or state the concrete fallback reason, such as `adapter_unavailable`, `control_not_rendered`, `non_interactive_surface` or `unsafe_auto_continue`.
4. The exact approval remains `Approval: <GateName>`.
5. Text approval must be accepted only after revalidation of the same run, expected gate and durable artefact.
6. The fallback must not be described as a workaround or as weaker authority.

### 4. Mandatory Agent Decision Procedure

For every missing approval at a ready user gate, the agent MUST execute this procedure in order:

1. Resolve exactly one `run_id`.
2. Run canonical gate evaluation for that `run_id`.
3. Confirm the current gate and its durable artefact are ready.
4. Classify the interaction as `gate_approval`, not `clarification` or `tool_permission`.
5. If the surface adapter is callable and gate-safe, invoke the native adapter exactly once.
6. If the native attempt is unavailable or not applied, switch immediately to exact text and state the fallback reason.
7. Wait for deliberate user input; never auto-resolve, preselect, infer or accept an agent-produced answer.
8. Re-run canonical gate evaluation for the same `run_id` and expected gate.
9. Persist approval only when the exact validator accepts the response after revalidation.

The agent MUST NOT finish the turn by asking for `Approval: <GateName>` directly when steps 1–5 establish that a safe native adapter is callable. A direct textual request in that state is a procedure violation, not a valid fallback.

### 5. User-Facing Sequence

AGDF should communicate the sequence in this order:

1. current blocker or readiness state;
2. required run-selection action, when applicable;
3. native gate question, only when the gate is ready;
4. exact-text fallback, only when native presentation is unavailable or unsafe;
5. post-response revalidation and resulting next step.

### 6. Host Capability And Evidence

1. Codex and Claude Code must use their host-native question adapters when the declared safety and availability conditions are met.
2. A live probe must distinguish a host capability limitation from an AGDF orchestration defect.
3. A native control, when rendered, remains a presentation input only; it does not itself authorize or persist an AGDF approval.
4. The exact-text fallback must remain demonstrable on every supported surface, including when native capability, authentication or interactive mode is unavailable.

## Canonical User-Facing Wording

For an ambiguous run:

> Das UR-Gate ist noch nicht entscheidungsbereit: Mehrere aktive Runs wurden gefunden. AGDF wählt keinen Run stillschweigend aus und zeigt deshalb keine Gate-Abfrage an. Bitte wähle zuerst den gewünschten Run. Danach wird derselbe Gate-Zustand erneut geprüft.

For a ready gate without a safe native control:

> Das UR-Gate ist für Run `<run_id>` bereit. Die native Abfrage ist in dieser Oberfläche nicht sicher verfügbar. Gib zur Freigabe exakt `Approval: UR` ein. Die Eingabe wird vor der Übernahme für denselben Run und dasselbe Gate erneut geprüft.

## Acceptance Criteria

1. An ambiguous multi-run fixture produces a structured blocker that names `AGDF_ACTIVE_RUN_AMBIGUOUS`, does not show a gate-approval question and does not accept `Approval: UR`.
2. A ready single-run fixture records a mandatory native-adapter invocation before any textual approval request.
3. A callable native adapter produces one native gate-question attempt with no auto-resolution.
4. A host-unavailable or non-interactive fixture uses exact text immediately, states the fallback reason and does not retry or simulate native controls.
5. A ready gate with a callable adapter fails the test if the agent emits direct exact-text approval without a native invocation.
6. Wrong-run, wrong-gate, stale and post-ambiguity text responses remain rejected.
7. A valid exact `Approval: UR` remains backward-compatible after the same-run, same-gate and durable-artefact revalidation succeeds.
8. Runtime Contract, gate-check skill, canonical interaction metadata and generated surfaces use the same clarification-versus-gate and native-first wording.
9. No custom UI, second approval store, host configuration change or new public command is introduced.
10. Live evidence records either a real native control in each available supported host or a precise host-capability limitation; it must not claim button support from instruction text alone.

## Non-Goals

- Choosing a run automatically based on recency, branch or chat context.
- Making native buttons mandatory for correctness.
- Removing or changing the public exact approval formula.
- Treating tool permissions, plan approval, timeout, default selection or hook output as AGDF approval.
- Replacing the existing control-state evaluator or persistence workflow.

## Constraints And Risks

- Ambiguity must fail closed even when a user supplies a syntactically correct approval phrase.
- Native presentation is host-owned and may vary by surface or runtime version.
- Wording must remain concise in interactive chat while preserving the authority boundary.
- Generated adapters must continue to derive from canonical `plugin/` sources.

## Source Of Truth And Owners

- Normative interaction semantics: `plugin/meta/agdf-runtime-contract.md`
- Agent routing and prompt policy: `plugin/skills/gate-check/SKILL.md`
- Surface capability metadata: `plugin/meta/agdf-plugin.definition.json`
- Durable authority and persistence: `.agdf/control/runs/<run_id>/RUN_STATE.md`
- Generated surface propagation: `create-agdf/scripts/sync-package-assets.js`
- Drift enforcement: `plugin/scripts/check-runtime-integrity.mjs`

## Required Next Step

Review this PRD and provide exact approval:

`Approval: PRD`
