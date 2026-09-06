# UX Intent Definition: AGDF MCP Dispatch

- decision: `ready`
- blocking_reason: `none`
- run_id: `agdf-mcp-dispatch-server`
- source_ur: approved UR Revision 1
- routing_source: Brownfield Review, `ui_ux_impact: high`
- prepared_at: 2026-09-06

## Primary Intent And Success

- primary_user_intent: Invoke an AGDF skill on a supported coding agent and receive the same bounded,
  target-correct governance preflight without constructing or approving a general shell command.
- success_signal: The host exposes one recognizable `agdf_dispatch` tool, invokes it with validated
  target evidence, and shows the canonical terminal presentation or continues the named skill using
  only the returned target and control snapshot.
- primary_decision_or_action: The user invokes an AGDF skill or starts an AGDF-governed request. Any
  later AGDF gate decision remains a separate deliberate action using exact `Approval: <GateName>`.

## Working Modes

| Working mode | Effective state | Visible state |
|---|---|---|
| MCP available, target unresolved | AGDF cannot select repository governance or a run. | One localized target-orientation or activation recovery. The invocation terminates. |
| MCP available, deterministic skill | The validated target and current control result are authoritative for this invocation. | Canonical status or approval presentation. The invocation terminates when `terminal: true`. |
| MCP available, judgement skill | Target and bounded control snapshot are resolved, but the skill retains judgement authority. | The named skill continues without target or run rediscovery. |
| MCP unavailable or version-invalid | No trusted dispatcher result exists. | One actionable recovery identifying unavailable configuration, version or runtime. No inferred fallback execution. |
| Host unsupported or MCP not enabled | The existing compatible AGDF path remains effective and is identified as such. | Honest manual or CLI-based guidance without an MCP support claim. |

## State Authority And Presentation

- effective_state_authority_by_mode:
  - MCP connection and permission: the coding-agent host.
  - Package identity and dispatcher version: the installed AGDF runtime and provenance owner.
  - Target and control result: the existing AGDF target resolver and dispatcher service.
  - Gate approval: `.agdf/control/` plus exact deliberate user approval and revalidation.
- primary_state_presentation_owner_by_mode:
  - Tool availability and invocation indicator: the host.
  - Target, status, approval and recovery text: the existing AGDF interaction renderer and locale
    registry returned through the dispatcher contract.
  - Unsupported/manual guidance: the existing AGDF installation and status surface.

## Activation Paths

- Explicit invocation of a canonical AGDF skill after existing request-activation routing.
- Project- or user-scoped MCP registration accepted through the host's supported configuration path.
- Version-matched local package entrypoint started by the host.
- Existing compatible path when MCP is disabled, unavailable or unverified for that host.

MCP registration does not activate repository governance by itself. Target resolution still precedes
repository activation and run selection.

## Blockers And Recovery

| Blocker | Visible next action |
|---|---|
| No reliable target | Ask for or confirm exactly one primary target. |
| Inactive repository | Show the existing bounded AGDF activation guidance. |
| Server not configured | Show the host-specific registration or manual-mode instruction. |
| Server startup failure | Identify the fixed AGDF entrypoint as unavailable and offer a visible retry after repair. |
| Version or provenance mismatch | Stop and require a coherent AGDF refresh. Do not search for another runtime automatically. |
| Tool input invalid | Return localized field-level recovery using canonical allowed values. |
| Host does not support the required MCP path | Retain and name the existing compatible path without claiming parity. |
| Terminal result | Present `host_action.text` without surrounding interpretation and stop. |

## Relevant State Transitions

1. Not configured to configured after explicit host registration or installation consent.
2. Configured to available after successful initialization and tool discovery.
3. Available to terminal target recovery when target evidence is insufficient.
4. Available to terminal control presentation for deterministic skills.
5. Available to bounded skill continuation for judgement skills.
6. Available to unavailable after startup, protocol, version or provenance failure.
7. Unavailable to available after a visible repair and retry.
8. Configured to disabled or removed through the host's reversible configuration path.

## Proposed PRD Acceptance Criteria

1. Users see one stable `agdf_dispatch` capability with a description that states purpose,
   non-authorizing behavior, terminal handling and continuation limits.
2. Tool availability never changes target, repository or approval authority.
3. Every terminal outcome presents one canonical action and prevents further skill execution.
4. Every non-terminal outcome binds continuation to the returned skill, target, run and control.
5. Configuration, unavailable, version-mismatch and unsupported states each provide one truthful,
   actionable recovery.
6. Enabling MCP is deliberate and reversible per host. It does not widen general shell or edit access.
7. Existing compatible behavior remains visible when MCP cannot be used.
8. Support claims name the tested host, version, configuration and evidence plane.

## Open Product Questions

- none blocking for PRD drafting
- PRD must freeze the first-release host claim, activation boundary, fallback promise and public
  distribution exclusion before SD chooses configuration and package mechanisms

## Affected Outputs

- coding-agent tool list and tool-call surface
- AGDF skill first response and terminal recovery
- installation, enablement, status, disable and rollback guidance
- host compatibility evidence and support statements
- package and public-distribution capability declarations

## Evidence

- approved UR Revision 1
- Brownfield Review and current dispatcher/function contracts
- installed MCP management help for Codex, Claude Code and OpenCode
- current official OpenAI, Anthropic, OpenCode, GitHub and MCP documentation

## Missing Evidence

- loaded AGDF MCP behavior on every claimed host
- direct Copilot host evidence
- native Windows and Linux behavior

## Required Next Step

Use this ready analytical input in PRD Revision 1. It is non-authorizing and does not prescribe the
MCP package, SDK, transport implementation or host configuration format.
