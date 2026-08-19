# Aggregate Acceptance: AGDF Product Maturity Roadmap

Status: `in_progress`
Date: 2026-08-19
Task: `RMP-10`
Decision: `startable_not_final`

## Readiness Decision

RMP-10 can start because Live Host Conformance, QA Transition Integrity, Structured Depth and
Benchmark v3 now have canonical closeout evidence. It cannot complete and RMP-12 cannot start
because PMR-5 and PMR-6 still depend on unsettled canonical owner decisions and direct
understandability UAT. The Parent does not create a speculative Unified Journey child to fill that
evidence gap.

## PMR Acceptance Matrix

| Requirement | Workstream | Canonical evidence | Evidence class | Status | Limitation |
|---|---|---|---|---|---|
| PMR-1 Visible ceremony | WS-00, WS-02, WS-04 | `agdf-interaction-ownership-quick-path-ux/QA_REPORT.md`; `agdf-structured-delivery-depth-boundary/OR.md`; `agdf-staged-proportionality-baseline-v3/OR.md` | `repository_tested`, `user_accepted` | `partial` | Interaction Ownership still awaits UAT and direct installed-host consumption remains unverified. |
| PMR-2 Enforcement transparency | WS-00, WS-01, WS-03 | `agdf-live-host-conformance-matrix/OR.md`; `agdf-qa-block-transition-integrity/OR.md`; BL-01 through BL-05 | `user_accepted`, `repository_tested`, `authenticated_host_observed` | `partial` | Task Target awaits QA; OpenCode parity still lacks one authenticated contract-valid evaluator result. |
| PMR-3 Live-host conformance | WS-01 | `agdf-live-host-conformance-matrix/OR.md`; BL-11 | `user_accepted` | `satisfied_with_limits` | 16 direct passes, 8 honest limitations and 12 Claude `host_unavailable` rows; no broader host guarantee is claimed. |
| PMR-4 Automatic proportionality | WS-02 | `agdf-structured-delivery-depth-boundary/OR.md`; `agdf-staged-proportionality-baseline-v3/OR.md`; BL-13 and BL-14 | `user_accepted`, `deterministic_replay` | `satisfied_with_limits` | The 40-case/72-scenario v3 corpus and deterministic 216-observation replay pass; authenticated v3 live-agent behavior is explicitly unclaimed. |
| PMR-5 Simple default journey | WS-00, WS-04 | `agdf-interaction-ownership-quick-path-ux/QA_REPORT.md`; `task-target-resolution-boundary/QA_REPORT.md`; `opencode-single-install-activation/UAT_EVIDENCE.md` | `repository_tested` | `open` | The three canonical owners have not all reached accepted closeout; no residual Journey gap can yet be isolated safely. |
| PMR-6 Understandability | WS-01, WS-04 | `agdf-live-host-conformance-matrix/OR.md`; existing UX intent artefacts | `user_accepted`, `repository_tested` | `open_critical_evidence_gap` | Eight blinded understandability scenarios with independent participants have not been evidenced; automated fixtures cannot replace this UAT. |
| PMR-7 Protective effect | WS-01, WS-02, WS-03, WS-04 | completed child ORs, full regression evidence and open-owner QA/UAT states | mixed, explicitly bounded | `partial` | Repository safeguards pass, but final protection acceptance must wait for PMR-5/PMR-6 evidence and the remaining owner decisions. |

## RMP-10 Entry Checks

- canonical child evidence is linked rather than copied: `pass`;
- evidence classes remain distinct and are not promoted: `pass`;
- Benchmark v3 history and live-host non-claim remain visible: `pass`;
- PMR-1 through PMR-7 each have a current evidence row: `pass`;
- no open critical gap: `fail` because PMR-6 lacks required direct understandability UAT;
- complete canonical owner outcomes for PMR-5: `fail`;
- RMP-12 readiness: `not_ready`.

## Required Next Step

Settle the named canonical owner decisions beginning with `task-target-resolution-boundary` at QA,
then re-evaluate PMR-5/PMR-6 and define direct understandability UAT without creating a parallel
Journey owner.

## Evidence Boundary

This matrix is a Parent coordination artefact. It grants no Child approval, does not decide QA or
UAT, does not promote repository evidence to live-host evidence and does not authorize runtime,
VCS, release or host mutation.
