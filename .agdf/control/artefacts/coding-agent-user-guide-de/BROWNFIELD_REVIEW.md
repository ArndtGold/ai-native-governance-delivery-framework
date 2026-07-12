# Brownfield Review: German User Guide for AGDF in Coding Agents

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `coding-agent-user-guide-de`
- related_ur: `.agdf/control/artefacts/coding-agent-user-guide-de/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-12

## Objective

Size and route the approved German coding-agent user guide while preserving existing documentation
ownership and avoiding a second normative or installation source.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Runtime Contract and approved AGDF workflow | `plugin/meta/agdf-runtime-contract.md` | high |
| Source of truth | Root README for public entry; `docs/00-07` for framework explanation | `README.md`; `docs/` | medium |
| Runtime path | Router and skills own agent workflow controls | `plugin/meta/agdf-agent-router.md`; `plugin/skills/` | high |
| UI / UX | Markdown reading path in repository; website currently a single landing page | `README.md`; `pages/src/pages/index.astro` | medium |
| Persistence / data | No data model; guide is source-owned Markdown | repository tree | none |
| Tests / QA | Link/reference scans, Markdown inspection, Pages checks where navigation changes | existing package and Pages scripts | low |
| Release / operations | `INSTALL.md` and package READMEs own commands and surface support | `INSTALL.md`; `agdf/README.md`; `create-agdf/README.md` | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing `docs/00-07` are conceptual, not task-oriented | numbered reading path in `README.md` | warn | Add a separate guide cluster without moving or renumbering existing files |
| Installation commands already have one owner | `INSTALL.md` and package READMEs | block | Link to installation sections; do not copy command matrices into the guide |
| Gate rules already have a normative owner | Runtime Contract and skills | block | Explain through examples and concise summaries with canonical links; do not maintain a second complete gate table |
| Website is not yet a documentation application | one Astro landing page | warn | Add only a guide link in this slice; defer any docs-site architecture |
| German-first public documentation is established | Manifest language policy and existing docs | none | Author the first guide version in German |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: The change is documentation-only but creates a durable six-chapter public information architecture, navigation entry points and many workflow claims that must remain aligned with normative owners.
- evidence: Existing conceptual docs, installation guide, runtime contract, skills, package references and website ownership were inspected directly.
- transparency_note: A compact PRD is required to freeze audience, chapter outcomes, link-versus-copy rules and acceptance criteria. A separate SD is likely unnecessary unless the PRD reveals generation or website architecture work.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which user journey is the primary end-to-end example? | PRD | revise |
| Which normative claims may be summarized and which must only be linked? | PRD | block |
| Should surface-specific differences be inline notes or a later appendix? | PRD | warn |
| Is website exposure limited to one link in this slice? | PRD | revise |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Documentation ownership already follows existing repository SoT rules; no new reusable runtime invariant is introduced.

## Next Permissible Step

- next_allowed_action: Draft a compact PRD for the German coding-agent guide.
- forbidden_until_then: Guide chapters, README/site navigation changes, SD, TP, implementation, QA and UAT.

## Quality Outlook

- quality_outlook: The guide should reduce onboarding uncertainty without increasing the normative document surface.
