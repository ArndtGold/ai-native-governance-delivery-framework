# Verified Change: <Title>

Status: `draft | eligible | executed | escalated`

## Record

- status: draft
- related_ur:
- escalation_target: `structured_slice | structured_delivery`
- canonical_owner:
- allowed_source_paths:
- allowed_derived_paths: none
- prohibited_impacts: none
- propagation_command: none
- validation_commands:
- baseline_tracked_paths: none
- baseline_untracked_paths: none
- validation_status: pending
- propagation_status: not_applicable

## Eligibility Assertions

| Condition | Evidence | Status |
|---|---|---|
| Exactly one canonical owner |  | `pass | fail` |
| Source and derived paths are bounded |  | `pass | fail` |
| No gate, permission, security, persistence, architecture, external API, CLI or release impact |  | `pass | fail` |
| Deterministic propagation is defined when derived paths exist |  | `pass | fail | not_applicable` |
| Deterministic validation is defined |  | `pass | fail` |
| Candidate paths are clean at baseline |  | `pass | fail` |

## Execution Evidence

| Evidence | Source | Result |
|---|---|---|
| Changed paths since baseline |  | `pass | fail` |
| Propagation command |  | `pass | fail | not_applicable` |
| Validation commands |  | `pass | fail` |

## Mini-Closeout

- delivered:
- intentionally_not_delivered:
- escalation_result: none
- residual_risk: none
- next_step:

This compact record is valid only for a Brownfield-selected `verified_change`. Any missing, failed or ambiguous condition must set `status: escalated` and continue at `escalation_target`.
