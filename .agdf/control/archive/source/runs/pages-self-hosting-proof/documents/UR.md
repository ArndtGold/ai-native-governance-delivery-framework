# User Requirement: Proven In Its Own Development

- work_item: `pages-self-hosting-proof`
- status: approved
- revision: 1
- date: 2026-07-15
- approval: exact `Approval: UR` received on 2026-07-15; earlier `Approval: UR.` remains retained only as rejected, non-authorizing intent evidence

## User Need

The public AGDF Pages site should make its own development practice visible as product evidence: AGDF is actively developed using AGDF. The section should show that the repository is both the framework and a working example of governed agent delivery without claiming that every historical line was created under the current process.

## Required Presentation

Add one dedicated proof section directly before the existing `#why` section.

- label: `Proven in its own development`
- heading: `AGDF is developed using AGDF.`
- body: two concise paragraphs explaining that the website, plugins, CLI and documentation evolve through AI coding agents using AGDF's durable artefacts, gates, evidence and human approvals, and that the repository is both the framework and a working example of governed agent delivery
- evidence cards:
  - `25+` governed delivery runs
  - `Codex · Claude Code · OpenCode` plugin surfaces
  - `This repository` is the reference implementation

The first metric must be tied to observable durable run/OR evidence rather than the ambiguous phrase `agent iterations`. The current repository contains more than 25 durable Orchestration Reports, so the conservative threshold is verifiable.

## Acceptance Criteria

1. The section appears immediately before `#why` and after the existing hero/proof introduction.
2. The exact label and heading are visible.
3. The copy uses the defensible present-tense claim `is developed`, not the unbounded historical claim `was built`.
4. The repository, website, plugins, CLI and documentation are framed as actively evolving through AGDF-controlled agent delivery.
5. Three compact evidence cards show the approved run, plugin-surface and reference-implementation messages.
6. The run metric remains traceable to durable `.agdf/control/artefacts/*/OR.md` evidence.
7. Existing Pages composition, styling and responsive behavior are reused; no new route, navigation item, component system or runtime behavior is introduced.
8. Pages check/build, rendered-content assertions, responsive visual inspection, relevant source assertions, doctor and `git diff --check` pass.

## Scope Boundary

In scope: concise English Pages copy and composition in the existing Pages owners, plus durable delivery artefacts for this run.

Out of scope: claims that all historical AGDF code was produced under the current process, automatic live telemetry, runtime/plugin behavior changes, navigation changes, new routes, legal claims, commit, push, PR or release.

## Evidence Basis

- current Pages hero and `#why` composition in `pages/src/pages/index.astro`
- more than 25 durable OR artefacts under `.agdf/control/artefacts/*/OR.md`
- existing Codex, Claude Code and OpenCode integration documentation and Pages compatibility copy
- the repository-local `.agdf/control/` artefact chain as the working example
