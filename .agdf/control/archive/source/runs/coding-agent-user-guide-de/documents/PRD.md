# PRD: German User Guide for AGDF in Coding Agents

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided on 2026-07-12
Based on: approved UR and completed Brownfield Review
Date: 2026-07-12
Owner: agent

## 1. Product Scope

Create a German-first, task-oriented guide under `docs/agenten-handbuch/` for users operating AGDF
through a coding agent. The guide consists of an index and six concise chapters:

1. Schnellstart
2. Gates und Freigaben
3. Typische Arbeitsabläufe
4. Mehrere Runs und Run-Auswahl
5. Abschluss und Auslieferung
6. Fehlerbehebung

The guide uses the existing `examples/sample-banking-flow.md` as its complete structured-delivery
scenario and adds only short dialogue fragments to show the boundary between user decisions and agent
work. The root README links to the guide index. Existing framework, installation, runtime and CLI
documents remain authoritative for their domains.

## 2. Acceptance Criteria

- A new user can follow one end-to-end coding-agent workflow from first request through UAT.
- The guide explains Quick Task versus Structured Delivery with a practical decision example.
- Exact approval syntax is visible, and the guide explains why the agent stops at gates.
- Multiple active runs, explicit selection, ambiguity and lifecycle are explained at user level.
- Commit, push, PR, release, QA decision, QA approval and UAT boundaries are explicit.
- Commands, installation steps and normative runtime claims link to their existing owners rather than
  becoming a second maintained rule set.
- The guide index links all chapters and the root README links the index.
- Existing `docs/00-07`, installation links and runtime sources are not moved or semantically changed.
- German terminology remains consistent with the existing German-first documentation and glossary.
- Markdown, links and relevant repository validation pass.

## 3. Non-Goals

- No rewrite or renumbering of `docs/00-07`.
- No duplicate complete gate table, CLI reference, installation matrix or Runtime Contract.
- No English translation in this slice.
- No website documentation application or generated documentation pipeline.
- No change to AGDF gate order, approval syntax, runtime behavior or plugin manifests.

## 4. Users And Roles

- Primary user: developer, product owner or technical lead working with an AGDF-enabled coding agent.
- Secondary user: reviewer who needs to understand why an agent stopped and what evidence is required.
- Decision owner: human user providing exact gate approvals and UAT acceptance.
- Agent role: explain, inspect, plan, implement and verify only within the currently allowed gate.

## 5. Constraints

- Durable AGDF control artefacts remain English; the public guide content is German.
- Normative runtime ownership remains in `plugin/meta/agdf-runtime-contract.md` and `plugin/skills/`.
- Installation ownership remains in `INSTALL.md`; package command ownership remains in package READMEs.
- The guide must remain useful without requiring AGDF CLI knowledge.
- Examples must not imply that chat intent is approval or that a QA pass equals QA approval.
- The existing run-scoped implementation remains an independent active UAT scope.

## 6. Evidence Requirements

- Link/reference scan showing that normative and installation sources are linked rather than copied.
- Manual review of the end-to-end example, chapter navigation and terminology.
- Markdown formatting and repository diff checks.
- Existing relevant package/runtime checks remain green.
- Visible evidence that the root README points to the guide index.

## 7. Risks And Open Questions

- The primary example must be concrete enough for onboarding without becoming a second specification.
- Surface-specific invocation differences should remain short inline notes; a separate appendix is out
  of scope unless TP evidence shows that the shared explanation becomes unclear.
- Website exposure is limited to a link unless a later scope explicitly adds site information architecture.
- A separate SD is expected to be not applicable because this slice introduces no runtime, data,
  component, generation or installation architecture.

## 8. Next Step

Record the documentation-only SD decision and request `Approval: SD` only if a substantive solution
design is introduced. Otherwise persist SD as not applicable and proceed to a compact TP.
