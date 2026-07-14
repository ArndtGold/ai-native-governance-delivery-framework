# Code Review: Reliable Native Gate-Approval Invocation

- decision: `pass`

## Findings

- None blocking, revisable or advisory in the reviewed diff.

## Review scope

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/scripts/check-runtime-integrity.mjs`
- synchronized generated copies under `create-agdf/generated/`
- `IMPLEMENTATION_EVIDENCE.md` and Brownfield Analysis

## Evidence

- Runtime integrity passed and enforces the first-attempt/no-retry wording.
- Routing and control-state tests passed.
- Generated copies contain the canonical first-attempt and immediate-fallback
  requirements.
- `git diff --check` passed.

## Risks and limitations

- Host-owned button rendering is not proven by deterministic repository tests.
  Existing live observations remain supporting evidence only; the exact-text
  fallback is the correctness path when host behavior is unavailable.
- The integrity guard intentionally checks required contract phrases; future
  semantic wording changes must update the guard and its generated surfaces
  together.

## Required next step

Run the AGDF QA Gate. Do not claim native host rendering or release readiness
without the bounded live evidence and QA decision.
