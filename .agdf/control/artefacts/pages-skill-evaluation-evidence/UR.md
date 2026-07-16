# User Requirements — Pages Skill Evaluation Evidence

## Status

- status: ready_for_approval
- run_id: pages-skill-evaluation-evidence
- gate: UR

## Problem

The public Pages site explains AGDF's skills, evidence model and self-hosting practice, but it does
not yet show that all canonical skills are covered by the repository's new versioned behavioral
evaluation framework. This leaves a useful reliability signal invisible and makes the current
self-hosting proof less concrete than the repository evidence supports.

## User Need

As a prospective AGDF user or maintainer, I need a concise and verifiable explanation of skill
evaluation coverage so that I can understand how routing and safety regressions are checked without
mistaking the evidence for certification or universal proof of agent behavior.

## Required Outcomes

1. Add one small, focused Pages statement near the existing self-hosting or skill-trust narrative.
2. State that every canonical AGDF skill has versioned normal, boundary and adversarial evaluations.
3. State that deterministic safety invariants run fail-closed in CI.
4. State that optional live-host recordings add evidence without overriding deterministic checks.
5. Show only repository-verifiable current figures: 9 canonical skills and 27 behavioral cases.
6. Keep the wording concise and consistent with the existing Pages visual and editorial system.
7. Add focused assertions that fail when the visible claim or its underlying repository figures drift.

## Approved Copy Direction

> Every canonical AGDF skill is covered by versioned normal, boundary and adversarial evaluations.
> Deterministic safety invariants run fail-closed in CI; optional live-host recordings provide
> additional evidence without overriding those checks.

## Acceptance Boundaries

- The figures must be derived from or mechanically checked against canonical repository owners.
- The page must preserve the replay/live evidence distinction.
- The copy must not say or imply `fully proven`, `certified`, `all agent behavior tested`, universal
  host parity or guaranteed future model behavior.
- The change must not redesign the Pages site or expand into general evaluation documentation.

## Non-Goals

- Adding an OpenCode live-recorder adapter.
- Claiming live execution coverage for every host or every case.
- Publishing, releasing, reinstalling or changing the completed evaluation-framework scope.
- Rewriting the existing skills, control-system or compliance sections.

## Success Signal

The rendered page presents one compact, accurate evaluation-evidence proof point whose 9-skill and
27-case figures are mechanically verifiable and whose wording preserves AGDF's honest capability
boundary.
