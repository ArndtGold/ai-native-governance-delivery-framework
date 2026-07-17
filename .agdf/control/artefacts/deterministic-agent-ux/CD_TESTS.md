# Code Deliverables and Tests: Deterministic Agent UX

Status: done
Derived from: approved `TP.md` revision 1
Date: 2026-07-17
Owner: agent

## Delivered

- Extended the canonical English/German locale registry with neutral decision headings, human-readable
  required decisions and neutral approve/revise/decline guidance for all six user gates.
- Refactored the existing approval snapshot to five decision-time fields while preserving the public
  full `status_card`, including `missing_approval` and `quality_outlook`.
- Added one pure renderer and fail-closed validation for field/card order, exact approval occurrence,
  artefact paths, locale consistency and selected run/gate/revision identity.
- Added additive schema-v1 `approval_presentation` output and the local
  `gate-check --approval-envelope` renderer path without adding another evaluator or approval authority.
- Added fresh-evaluation recovery that requests exact text only while the same gate remains ready.
- Updated canonical contracts, the gate-check skill, public operating-model guidance and generated
  Codex, Claude Code, OpenCode and GitHub Copilot surfaces. Copilot remains an exact-text surface with
  no claimed native approval adapter.

## Verification Evidence

- `npm --prefix create-agdf run smoke-test`: pass, including focused presentation, CLI, lifecycle,
  control-state, Runtime Integrity, 27/27 deterministic skill evaluations, Delivery Path Search,
  package smoke and routing render tests.
- `npm --prefix agdf run smoke-test`: pass.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass; 9 skills and 15 control files checked.
- `node create-agdf/bin/create-agdf.js doctor --run deterministic-agent-ux --json`: pass, zero findings.
- `node create-agdf/bin/create-agdf.js gate-check --run deterministic-agent-ux --json`: open at
  `CD+Tests` before review-state persistence; `approval_presentation` is `null` for the non-ready state.
- `git diff --check`: pass.
- Real ready-gate CLI fixture proves both additive JSON projection and two-card plus exact-text output.
- Negative fixtures prove biased/generic headings, duplicate/decorated approvals, wrong field/artefact
  structure, unsafe paths, mixed locale, missing/stale identity and newly non-ready recovery fail closed.

## Evidence Boundary

Repository tests prove deterministic semantics and generated-surface conformance. They do not prove
host-visible native controls. Live Codex, Claude Code, OpenCode or Copilot observations remain UAT
evidence and must name the actual surface. No native Copilot control is claimed.

## Decision

- decision: done
- missing_evidence: live host observation, intentionally deferred to UAT
- required_next_step: Run Task Plan Review, Clean Implementation Review and Code Review before QA.
