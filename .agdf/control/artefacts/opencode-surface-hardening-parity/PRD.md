# PRD: OpenCode Surface Hardening and Evaluator Parity

Status: approved
Gate: PRD
Revision: 1
Date: 2026-07-23
Derived from: `.agdf/control/artefacts/opencode-surface-hardening-parity/UR.md`
Gate approval: Exact `Approval: PRD` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation.

## Product Outcome

An OpenCode user can determine the effective AGDF hook, version and Delivery Path Search evaluator
capability before relying on it. Missing or unprovable stronger capability is visible, never
silently inherited and always has one safe recovery path.

## Users And Primary Intent

- Primary user: a developer or delivery agent using AGDF through an installed OpenCode runtime.
- Intent: know whether governance guidance and executable evaluator enforcement are currently
  available and what to do when they are degraded.
- Success: status and search output distinguish declared evidence, live/runtime evidence,
  degradation and recovery without overstating authority.

## Product Principles

1. Evidence strength is explicit: SDK declarations are not live hook execution proof.
2. Host, plugin SDK and AGDF package versions are separate facts.
3. Version divergence is warning-only; AGDF must not automatically align the host-owned SDK.
4. `tool_enforced` is an invocation-scoped result, not a static surface promise.
5. Failed or unavailable preflight stops the executable evaluator path and points to the existing
   instruction-only workflow; it does not continue as a weaker executable subprocess.
6. Delivery Path Search remains advisory and canonical gate-check remains the authority.
7. Existing OpenCode configuration and explicit permission decisions remain authoritative.

## Working Modes And Visible States

### Mode A: OpenCode Status Inspection

The user sees:

- OpenCode host version, installed plugin-SDK version and installed/expected AGDF package version;
- hook declaration state for each required experimental hook;
- one aggregate capability state and one next action;
- repository activation, global surface and session evidence kept distinct.

Hook declaration states:

- `declared_supported`: the installed SDK declaration contains the required hook;
- `declared_missing`: the SDK is inspectable and the hook declaration is absent;
- `uninspectable`: the SDK or declaration cannot be resolved or read.

`declared_supported` must not be presented as observed live invocation.

### Mode B: Active Plugin Guidance

Static global instructions preserve the minimum governance boundary even when neither experimental
hook executes. Dynamic hooks may reinforce that boundary but must not become its sole owner.
Plugin hook failures or unexpected host output shapes must not crash the session or silently claim
that guidance was injected.

### Mode C: Executable Delivery Path Search

The executable OpenCode evaluator is available only when the current invocation proves:

- required OpenCode CLI capability;
- the evaluator agent can be selected;
- the required deny-permission profile is effective;
- the model/provider is callable;
- contract output can be obtained and validated;
- repository mutation detection remains active.

Only that invocation may report `tool_enforced`.

### Mode D: Degraded Evaluator Recovery

When preflight is unavailable or fails:

- the executable evaluator run stops before producing an evaluator recommendation;
- output reports a typed failure and preserves `instruction_only` as the available surface
  capability;
- the user receives one next action: repair and retry, or consciously use the existing
  instruction-only Delivery Path Search workflow;
- a previous successful preflight must not be reused.

Repository mutation is a hard failure and must not be presented as recoverable instruction-only
execution.

## Functional Requirements

### PRD-OC-01 — Hook declaration evidence

`opencode-status` shall inspect the resolved installed plugin SDK for both required experimental hook
declarations and report per-hook and aggregate states using the defined evidence vocabulary.

### PRD-OC-02 — Evidence boundary

Human, JSON and documentation output shall distinguish SDK declaration support from observed live
hook execution. Unknown or unreadable evidence shall fail closed to `uninspectable`.

### PRD-OC-03 — Version transparency

Install/status output shall report OpenCode host, plugin SDK and AGDF package versions separately.
Host/SDK divergence shall create a warning with a safe diagnostic or repair action and shall never
automatically update or align the SDK.

### PRD-OC-04 — Static fail-closed governance

Static global instructions alone shall retain repository-activation checks, gate-check-first routing,
exact approval authority, version-matched local validation and prohibition of later-gate work when
authority is missing.

### PRD-OC-05 — Defensive dynamic guidance

Both existing experimental hook paths shall tolerate missing or unexpected output containers and
shall not crash the host. They may reinforce only the canonical static governance boundary.

### PRD-OC-06 — Executable OpenCode evaluator

Delivery Path Search shall offer one OpenCode evaluator that implements the shared evaluator input,
output, scoring, candidate-policy and read-only mutation contracts without surface-specific forks.

### PRD-OC-07 — Invocation-scoped preflight

Each executable OpenCode evaluator invocation shall perform a bounded capability and permission
preflight. `tool_enforced` requires current successful evidence; cached or installation-time success
is insufficient.

### PRD-OC-08 — Fail-closed evaluator fallback

Failed preflight shall stop executable evaluation before a recommendation is produced, return a
typed failure and point to the existing instruction-only workflow. It shall not continue the same
subprocess under weaker classification.

### PRD-OC-09 — Mutation boundary

Repository mutation checks shall run after successful and failed evaluator transports. Detected
mutation is a hard failure and shall not fall back to instruction-only execution.

### PRD-OC-10 — Truthful capability projection

Capability matrix, CLI output, INSTALL, package README and Pages shall report OpenCode as
`tool_enforced` only for a currently preflighted executable invocation. Baseline surface availability
without that evidence remains `instruction_only`.

### PRD-OC-11 — Configuration preservation

Install, status and evaluator setup shall preserve existing explicit OpenCode configuration and
permission decisions. No `ask`, `allow` or `deny` decision may be silently replaced.

### PRD-OC-12 — Candidate-generation boundary

OpenCode candidate generation remains unavailable. Evaluator availability must not imply generator
parity.

## Acceptance Criteria

| Criterion | Observable evidence |
|---|---|
| AC-01 | Status fixtures cover both hooks present, one missing, both missing and uninspectable SDK states with stable JSON and human output. |
| AC-02 | Status shows host, SDK and AGDF versions independently and warns on the observed 1.18.3/1.17.11 divergence without modifying either installation. |
| AC-03 | Hook-absent fixtures and skill evaluations prove that static instructions still block unactivated or ungated work. |
| AC-04 | Defensive-hook tests cover missing output arrays and inactive/active repository guidance without host crashes. |
| AC-05 | The OpenCode evaluator passes the shared evaluator fixture and contract tests without changing shared scoring or gate semantics. |
| AC-06 | Successful current preflight yields `tool_enforced` with concrete evidence and zero repository mutation. |
| AC-07 | Missing CLI capability, agent, effective deny permissions, authentication, timeout or malformed output stops executable evaluation and returns a typed instruction-only recovery response without a recommendation. |
| AC-08 | Mutation detection after success and failure is a hard failure with no instruction-only execution fallback. |
| AC-09 | Repeated invocation does not reuse stale successful preflight evidence. |
| AC-10 | Capability matrix, CLI help/output, INSTALL, package README, Pages and generated/runtime-integrity assertions agree on baseline versus invocation-scoped enforcement. |
| AC-11 | Existing explicit OpenCode permission decisions remain byte-equivalent except for separately owned AGDF additions. |
| AC-12 | Candidate generation remains Codex/Claude-only and its existing tests remain unchanged in meaning. |

## Non-Goals

- Change gate order, approval values or the Interaction Contract.
- Remove the experimental hooks while they remain the only dynamic injection path.
- Add OpenCode candidate generation.
- Use in-host `permission.ask` as the primary evaluator enforcement mechanism.
- Claim live hook invocation from SDK declaration inspection.
- Automatically align or update the OpenCode host or plugin SDK.
- Perform VCS, release or publish actions in this run.

## Evidence Obligations

- Repository tests prove deterministic contract and regression behavior.
- A real installed-SDK probe proves declaration-level status behavior.
- A real bounded OpenCode evaluator probe is required before claiming live `tool_enforced`
  availability; fixture success alone is insufficient.
- Documentation must preserve the boundary between repository evidence and live host observation.

## Open Questions

Technical agent packaging, inline permission transport, output extraction, timeout values and typed
error schema are Solution Design decisions. They must preserve this PRD's user-visible states and
fail-closed behavior.
