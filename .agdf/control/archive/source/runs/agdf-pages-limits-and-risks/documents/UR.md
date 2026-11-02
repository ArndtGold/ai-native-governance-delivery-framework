# User Requirement

## Work Item

- key: `agdf-pages-limits-and-risks`
- title: Make AGDF limits, dependencies and process overhead explicit on the Pages site
- status: approved
- approval: `Approval: UR`

## User Need

The public Pages site should explain clearly what AGDF does not replace and which human, repository and evidence conditions its value depends on. This prevents AGDF from being interpreted as an architecture authority, compliance certification or substitute for engineering judgment.

## Proposed Content

Add a concise boundary section near the existing `What AGDF Is Not` and governance-evidence sections:

### What AGDF Does Not Replace

- Architecture expertise
- Security and privacy review
- Domain acceptance
- Regulatory certification
- Good tests
- Human judgment

### What AGDF Depends On

- Correct repository control state
- Complete and traceable evidence
- Actually executed tests
- Honest human UAT
- Disciplined use by agents and teams

Include the framing:

> AGDF makes delivery more governable. It does not make engineering judgment, verification or human responsibility optional.

Also state that AGDF adds process overhead and therefore depends on choosing the smallest governance path that matches the change.

## Acceptance Criteria

1. The Pages site visibly communicates AGDF's non-replacement boundaries.
2. The Pages site visibly communicates the repository, evidence, test, UAT and human-discipline dependencies.
3. Additional process overhead is acknowledged without undermining AGDF's purpose.
4. The wording does not claim compliance certification or autonomous correctness.
5. Existing `What AGDF Is Not` and AI-governance evidence content remains coherent and non-duplicative.
6. Pages checks/build and relevant link/content validation pass.

## Scope Boundary

In scope: public Pages copy and its existing section/data ownership.

Out of scope: AGDF runtime behavior, plugin manifests, gate semantics, control templates, legal advice or regulatory classification.

## Evidence And Approval

- user approval: `Approval: UR`
- approval date: 2026-07-13
- source discussion: current Codex task conversation
