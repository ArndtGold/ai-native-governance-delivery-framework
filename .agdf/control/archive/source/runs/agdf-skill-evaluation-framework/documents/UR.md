# User Requirements — Versioned AGDF Skill Evaluation Framework

## Status

- status: ready_for_approval
- run_id: agdf-skill-evaluation-framework
- gate: UR

## Problem

AGDF validates plugin structure, runtime contracts, deterministic control logic and package smoke behavior, but it does not yet maintain a versioned evaluation corpus that proves how every canonical skill behaves against realistic prompts and repository states. This leaves routing, gate safety, action boundaries and artefact quality exposed to regressions that structural checks alone cannot detect.

## User Need

As an AGDF maintainer, I need a repository-owned, versioned `evals/` system so that every canonical AGDF skill is evaluated against realistic scenarios before changes are accepted or released.

## Required Outcomes

1. Every canonical AGDF skill has realistic prompt fixtures paired with bounded repository and control-state fixtures.
2. Each evaluation case declares the expected skill selection, current gate or internal step, allowed actions, forbidden actions and permitted mutation boundary.
3. Safety-critical invariants use deterministic grading and fail closed when routing, gate, approval, action or mutation expectations are violated.
4. Artefact-producing scenarios receive an additional quality assessment that is reported separately from deterministic safety results and cannot override a failed safety invariant.
5. Evaluation cases and their schema are explicitly versioned, reproducible and produce stable machine-readable reports.
6. CI enforces declared thresholds and blocks gate-bypass, unsafe-action, mutation-boundary and routing regressions.
7. Existing unit, contract, integrity and smoke tests remain authoritative for their current responsibilities and are composed with, not duplicated by, the evaluation system.

## Acceptance Boundaries

- The first release covers all canonical skills declared by the plugin definition.
- A missing skill case, invalid fixture, unknown expectation or unavailable required deterministic grader fails closed.
- Safety decisions must not depend solely on an LLM-as-judge score.
- Host- or model-specific execution evidence must be labelled honestly; fixture-based evaluation must not be presented as proof of live cross-host behavior.
- Evaluation execution must not mutate files outside the case's declared disposable workspace and mutation allowance.

## Non-Goals

- Replacing existing runtime-integrity, control-state, package or smoke tests.
- Claiming universal model quality or identical behavior across all hosts and model versions.
- Requiring network credentials or paid model calls for the deterministic baseline CI gate.
- Automatically publishing, releasing or reinstalling AGDF after evaluation passes.

## Success Signal

A clean CI run can show, from a versioned report, that every canonical skill is covered; all safety-critical cases pass deterministically; routing and gate regressions breach explicit thresholds; mutation boundaries remain intact; and artefact quality results are visible without weakening the safety gate.
