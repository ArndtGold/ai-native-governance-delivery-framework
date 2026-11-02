# UX Intent Definition: Cross-surface Executable Skill Dispatcher

- decision: `ready`
- blocking_reason: none
- primary_user_intent: Invoke a named AGDF skill and receive the correct first AGDF state quickly,
  without watching the model search plugin files, reconstruct commands or guess the task target.
- success_signal: The first AGDF-owned visible output is either the canonical localized terminal
  orientation or a concise acknowledgement that the target is resolved and the named skill may
  continue with exactly one bounded next action.
- primary_decision_or_action: Invoke one direct AGDF skill; when clarification is terminal, provide
  only the requested target or recovery input.

## Working Modes

1. `target_unresolved`: no reliable target exists; the dispatcher returns the canonical localized
   Task Target orientation and the invocation stops.
2. `target_resolved`: one target and governance repository are valid; the dispatcher returns the
   permitted skill continuation without broad discovery.
3. `control_decision_available`: the requested skill has a complete deterministic evaluator or
   renderer path; the dispatcher returns that canonical output directly.
4. `skill_judgement_required`: deterministic preparation succeeds, but the named review or quality
   skill must still inspect bounded evidence and make its own judgement.
5. `dispatcher_unavailable`: runtime, version, binding or input is invalid; no skill work starts and
   one recovery action is visible.
6. `host_instruction_only`: the host cannot prove executable-first binding; the surface remains
   usable but is visibly not classified as executable dispatch.

## Effective State By Mode

| Mode | Effective state |
|---|---|
| `target_unresolved` | No governance target, run or gate is active for this invocation. |
| `target_resolved` | Only the returned governance target may be inspected downstream. |
| `control_decision_available` | Existing code-owned evaluator and renderer output is authoritative; dispatcher adds no decision. |
| `skill_judgement_required` | Target and bounded input scope are fixed; the named skill remains the decision owner. |
| `dispatcher_unavailable` | Invocation is blocked and authority is unchanged. |
| `host_instruction_only` | Instruction path is available with an explicit capability limitation; no executable-conformance claim. |

## Visible State Types

- `starting`: short AGDF-owned acknowledgement or host-native progress state when the result is not
  immediate and the host can render one.
- `target_orientation`: canonical localized resolved or unresolved Task Target block.
- `bounded_continuation`: named skill, governance target, permitted evidence scope and one next action.
- `canonical_decision`: existing Run Status, approval or other code-owned presentation where the
  underlying evaluator can decide deterministically.
- `blocked_recovery`: typed runtime, version, input, target or host-binding failure with one action.
- `capability_disclosure`: executable or instruction-only enforcement status without marketing
  equivalence.

## Effective State Authority By Mode

- Task target and governance target: existing Task Target Resolution contract and implementation.
- Gate state and allowed action: existing gate evaluator and durable selected run.
- QA or review judgement: the named canonical skill, never the dispatcher.
- Approval authority: exact deliberate user input plus existing post-response revalidation.
- Dispatcher availability and duration: executable dispatcher result.
- Host-visible latency and binding capability: direct loaded-host observation, not dispatcher self-report.

## Primary State Presentation Owner By Mode

- Task Target orientation, Run Status and approval presentation: existing Interaction renderer and
  complete locale registry.
- Dispatcher diagnostics and timing: the dispatcher output contract, presented concisely by the host adapter.
- Skill-specific review result: the named skill's existing compact output contract.
- Host progress chrome: host-owned and reported as such; it is not AGDF state.

## Activation Paths

- Direct slash or named-skill invocation from a supported installed host.
- Agent router selection of a canonical AGDF skill.
- Explicit deterministic CLI invocation for tests, automation or diagnosis.
- No activation solely from current working directory, evidence access or plugin installation.

## Blockers And Visible Next Actions

| Blocker | Visible next action |
|---|---|
| No reliable target | Name one repository, file or continued target. |
| Multiple plausible targets | Select exactly one listed target. |
| Target unavailable or mismatched | Correct or supply the target, then retry. |
| Ambiguous active run | Select exactly one run identifier. |
| Runtime missing | Run the supported installation or repair action, then restart the host. |
| Version or provenance mismatch | Refresh the matching plugin/runtime version and retry in a fresh session. |
| Invalid dispatcher input/output | Report the invalid field and stop; do not fall back to model reconstruction. |
| Host binding cannot prove executable-first behavior | Disclose `instruction_only` and use the existing safe skill path without an executable-conformance claim. |

## Recovery Paths

- Every recoverable failure exposes exactly one retryable action.
- Retry is explicit; no automatic target substitution, registry contact, installation or weaker
  subprocess fallback occurs.
- An unresolved target retry starts a new dispatcher invocation with the supplied target.
- A repaired or refreshed runtime retry begins only after version and provenance are revalidated.
- A host-binding limitation remains visible until new direct host evidence proves otherwise.

## Relevant State Transitions

1. `invoked -> starting -> target_unresolved -> waiting_for_target`.
2. `waiting_for_target -> invoked -> target_resolved -> bounded_continuation`.
3. `target_resolved -> control_decision_available -> canonical_decision`.
4. `target_resolved -> skill_judgement_required -> named_skill_workflow`.
5. `invoked -> dispatcher_unavailable -> blocked_recovery -> explicit_retry`.
6. `invoked -> host_instruction_only -> safe_instruction_path`, with capability limitation retained.
7. Any target, run, gate or revision change invalidates the prior dispatch packet and requires fresh
   revalidation before mutation or approval persistence.

## Proposed PRD Acceptance Criteria

1. The dispatcher is the first operational action for a conforming direct skill invocation; no
   exploratory contract or runtime-file search precedes it.
2. Its process duration is measured independently and remains at or below two seconds in local
   deterministic fixtures.
3. A conforming loaded host produces first AGDF-owned visible output within 15 seconds in the defined
   local test scenario. A surface that cannot meet or prove this remains explicitly
   `instruction_only`, not falsely passed.
4. Terminal unresolved output is localized, renderer-owned, contains one recovery action and causes
   no repository control inspection.
5. Resolved output fixes the governance target and gives the named skill only one bounded next action.
6. Users never need to understand plugin paths, CLI entrypoints or contract filenames for normal use.
7. Missing runtime, version mismatch, invalid input and host-binding limits are distinguishable and actionable.
8. Dispatcher execution never grants an approval, mutates control state or substitutes for a skill judgement.
9. German and English interactions remain complete-locale outputs without mixed values.
10. Direct loaded-host results and timing are recorded independently for Copilot, Codex, Claude Code
    and OpenCode.

## Open Product Questions

- none; product behavior is sufficiently defined for PRD. Exact command name, module ownership,
  schema layout and adapter mechanics remain SD decisions.

## Affected Outputs

- Direct invocation of every shipped canonical AGDF skill.
- Task Target orientation and deterministic status/approval presentation where applicable.
- Runtime failure and capability-disclosure messages.
- Package/profile conformance and host UAT timing evidence.

## Evidence

- Approved UR Revision 1.
- Brownfield Review with `ui_ux_impact: high` and `structured_delivery`.
- User-attested three-minute Copilot observation and earlier QA invocation transcript.
- Existing target, interaction, gate, local-validator and generated-profile owners.

## Missing Evidence

- Technical feasibility and exact binding mechanism per host; owned by SD and later host evidence.

## Required Next Step

Incorporate these criteria into PRD Revision 1. This analysis grants no implementation authority.
