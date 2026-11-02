# Aggregate Acceptance: AGDF Product Maturity Roadmap

Status: `in_progress`
Date: 2026-08-19
Task: `RMP-10`
Decision: `startable_not_final`
Revision: `4`

## Readiness Decision

RMP-10 remains startable because Live Host Conformance, QA Transition Integrity, Structured Depth,
Benchmark v3, Task Target Resolution, Lean Interaction Ownership and Single Install Activation now
have canonical accepted closeout evidence. PMR-5 advances to `satisfied_with_limits`; no residual
Unified Journey product gap is evidenced. RMP-10 cannot complete and RMP-12 cannot start because
OpenCode parity remains evidence-limited and PMR-6 lacks the required direct understandability UAT.
The smallest current PMR-6 path is the Parent-owned evidence protocol, not a speculative product
Child.

## Execution Availability

- protocol readiness: `ready_for_execution`;
- independent participants currently available: `0/4 minimum`;
- primary observations completed: `0/8`;
- external evidence state: `blocked_external_participants`;
- consequence: RMP-10 remains `startable_not_final`, PMR-6 remains
  `open_critical_evidence_gap` and RMP-12 remains closed;
- resume condition: at least four independent real participants become available.

This is an external evidence dependency, not a repository implementation defect. No remaining
in-repository action can satisfy PMR-6, and neither agents nor simulated observations may be used as
a substitute.

## PMR Acceptance Matrix

| Requirement | Workstream | Canonical evidence | Evidence class | Status | Limitation |
|---|---|---|---|---|---|
| PMR-1 Visible ceremony | WS-00, WS-02, WS-04 | `agdf-interaction-ownership-quick-path-ux/OR.md`; `agdf-structured-delivery-depth-boundary/OR.md`; `agdf-staged-proportionality-baseline-v3/OR.md` | `user_accepted`, `repository_tested` | `satisfied_with_limits` | Compact interaction ownership and proportional depth are accepted; released installed-host consumption remains explicitly unobserved. |
| PMR-2 Enforcement transparency | WS-00, WS-01, WS-03 | `task-target-resolution-boundary/OR.md`; `agdf-live-host-conformance-matrix/OR.md`; `agdf-qa-block-transition-integrity/OR.md`; BL-01 through BL-05 | `user_accepted`, `repository_tested`, `authenticated_host_observed` | `partial` | Target authority is accepted; OpenCode parity still lacks one authenticated contract-valid evaluator result. |
| PMR-3 Live-host conformance | WS-01 | `agdf-live-host-conformance-matrix/OR.md`; BL-11 | `user_accepted` | `satisfied_with_limits` | 16 direct passes, 8 honest limitations and 12 Claude `host_unavailable` rows; no broader host guarantee is claimed. |
| PMR-4 Automatic proportionality | WS-02 | `agdf-structured-delivery-depth-boundary/OR.md`; `agdf-staged-proportionality-baseline-v3/OR.md`; BL-13 and BL-14 | `user_accepted`, `deterministic_replay` | `satisfied_with_limits` | The 40-case/72-scenario v3 corpus and deterministic 216-observation replay pass; authenticated v3 live-agent behavior is explicitly unclaimed. |
| PMR-5 Simple default journey | WS-00, WS-04 | `agdf-interaction-ownership-quick-path-ux/OR.md`; `task-target-resolution-boundary/OR.md`; `opencode-single-install-activation/OR.md` | `user_accepted`, `repository_tested` | `satisfied_with_limits` | All three canonical owners are accepted and no separate Journey gap is evidenced; authenticated installed-host behavior remains explicitly limited. |
| PMR-6 Understandability | WS-01, WS-04 | `agdf-live-host-conformance-matrix/OR.md`; `UNDERSTANDABILITY_UAT_PROTOCOL.md`; existing UX intent artefacts | `user_accepted`, `repository_tested`, `evidence_protocol_ready` | `open_critical_evidence_gap` | The eight-scenario blinded protocol is ready, but 0/8 direct independent-participant observations exist; automated fixtures cannot replace them. |
| PMR-7 Protective effect | WS-01, WS-02, WS-03, WS-04 | completed child ORs, full regression evidence and open-owner QA/UAT states | mixed, explicitly bounded | `partial` | Repository safeguards pass, but final protection acceptance must wait for PMR-5/PMR-6 evidence and the remaining owner decisions. |

## RMP-10 Entry Checks

- canonical child evidence is linked rather than copied: `pass`;
- evidence classes remain distinct and are not promoted: `pass`;
- Benchmark v3 history and live-host non-claim remain visible: `pass`;
- PMR-1 through PMR-7 each have a current evidence row: `pass`;
- no open critical gap: `fail` because PMR-6 lacks required direct understandability UAT;
- complete canonical owner outcomes for PMR-5: `pass` with disclosed installed-host limits;
- PMR-6 direct-observation protocol readiness: `pass`;
- PMR-6 valid direct observations: `fail`, 0/8;
- RMP-12 readiness: `not_ready`.

## Required Next Step

Wait until at least four independent participants are available, then execute the eight blinded
observations in `UNDERSTANDABILITY_UAT_PROTOCOL.md`. Do not change stimuli after exposure, simulate
participants or create a product Child unless a recorded observation first proves a concrete
product gap.

## Evidence Boundary

This matrix is a Parent coordination artefact. It grants no Child approval, does not decide QA or
UAT, does not promote repository evidence to live-host evidence and does not authorize runtime,
VCS, release or host mutation.
