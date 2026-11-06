---
language: en
chapter_role: common_workflows
translation_of: ../de/03-typische-arbeitsablaeufe.md
source_revision: sha256:4107cda418ae16f67781305aab81b42e563c8e39ce226599baa16c1350f24c31
translation_status: reviewed
---

# Common workflows

AGDF uses the smallest safe workflow. The choice depends on impact, ownership, risk and available
evidence—not on the number of changed files.

## Ordinary work outside AGDF

Questions about existing code or documentation, read-only checks and reviews, explanations,
comparisons, recommendations and diagnoses remain outside AGDF unless the request asks for actual
implementation, a binding delivery artefact or an explicit AGDF operation. No AGDF status card is
shown and no AGDF owner is invoked.

Inspection and modification remain separate. For example, a German-language request may say:

```text
Prüfe, ob die README auf einen nicht vorhandenen Link verweist.
```

In English: “Check whether the README links to a page that does not exist.”

This authorizes only the inspection and its findings. The original request or a later instruction
must explicitly include correcting the link before the agent may change it.

## Two-stage instructions

Before positive activation, generated AGDF profiles contain only a compact activation kernel and
short skill descriptions. They make detailed target, gate, quality and closeout rules available on
demand only afterwards. This requires neither a second hook nor an executable prompt classifier.

A versioned contract limits the model-visible UTF-8 bytes for the kernel, discovery, SessionStart,
OpenCode context, compaction and the selected `gate-check` skill. The `skillSet.discovery` metadata
describes the intended discovery boundary. It does not prove that every host technically enforces
that boundary.

Source, generation and package checks remain separate from installed and freshly loaded host
evidence. The [Instruction Footprint Audit](../../../.agdf/control/archive/source/runs/agdf-request-activation-boundary/documents/INSTRUCTION_FOOTPRINT_AUDIT.md)
records the rationale, measurements and evidence limits.

## Quick Task and Compact Delivery

A Quick Task is a compact AGDF path for already positively activated work that is small and clearly
bounded. After an approved UR, the Brownfield Review may record the same bounded path as Compact
Delivery. Both record the result, evidence, remaining risk and next step. They are not appropriate
when new product semantics, architecture, policy, persistence, a public contract, a release boundary
or formal approvals are involved.

## Brownfield Review and path selection

After `Approval: UR`, the Brownfield Review examines the existing context. It records current
owners, sources, protected behavior, reuse opportunities, risks and open decisions. It then records
exactly one of these values with a rationale:

| Mode/Slice value | User-facing meaning |
|---|---|
| `quick_task` | **Compact Delivery:** a small, clearly bounded delivery after an approved UR |
| `verified_change` | a bounded change with one canonical owner and deterministic scope, propagation and test evidence |
| `structured_slice` | a bounded structured outcome that can be accepted independently |
| `structured_delivery` | full structured delivery for consequential or coordination-heavy work |
| `block` | the path cannot yet be chosen safely because decision evidence is missing or contradictory |

The Mode/Slice Decision is an internal routing step, not another user gate.

## Compact Delivery

Compact Delivery is the user-facing name for a `quick_task` path recorded after Brownfield Review.
Implementation remains within the approved UR. The agent runs suitable checks and records a compact
closeout. It creates PRD, SD and TP artefacts only when the work requires them.

If the scope grows or creates new product, architecture, policy or release questions, the path must
escalate to structured delivery.

## Verified Change

Verified Change is a narrow, fail-closed path for a bounded modification. Before implementation,
the evidence must include:

- exactly one canonical owner;
- bounded source and derived paths;
- a clean recorded baseline for affected paths;
- no effects on gates, security, persistence, architecture, public APIs, CLI or release behavior;
- deterministic propagation and at least one deterministic check;
- a named structured escalation target.

If evidence is missing or a path changes outside the permitted scope, work stops instead of
continuing on assumptions. Verified Change escalates to its declared Structured Slice or Structured
Delivery.

## Structured Slice and Structured Delivery

Both structured paths use the same user gates. They differ in required depth.

A **Structured Slice** covers one coherent outcome that can be accepted independently. Ownership,
effects, migration, failure handling and rollback must remain bounded and provable within the slice.

**Structured Delivery** is required when the work must coordinate authority, security, architecture,
persistence, public contracts, deployment, release or multiple independent owners.

The normal structured path is:

```text
UR und Brownfield Review
→ PRD
→ SD
→ TP
→ Pre-Implementation Brownfield Analysis
→ CD+Tests
→ Task Plan Review, Clean Implementation Review und Code Review
→ QA
→ UAT
→ Orchestration Report und Delivery Closeout
```

In English, the path runs from UR and Brownfield Review through PRD, SD, TP, implementation
preparation, CD+Tests, reviews, QA, UAT and final closeout.

Each arrow represents a permitted transition, not automatic continuation. Every user gate requires
the exact approval line.

## Visible changes: clarify UX intent before implementation

When a change affects what people see, do or decide, or how they continue after an error, a general
request is often not enough. Before PRD readiness, AGDF therefore clarifies UX intent when the
impact is medium or high, or when a small change is still ambiguous.

Only the questions needed for the change are answered:

- What is the user's goal, and which working modes exist?
- Which state is effective, and which state is shown to the user?
- Which person or system owns that state?
- What activates the capability, what blocks it and how can the user continue?
- Which transitions are permitted, and what shows that a transition succeeded?

This clarification is not another user gate. It provides testable criteria for the PRD and prevents
the coding agent from making missing product decisions during implementation. A small, unambiguous
change can explicitly record that this clarification is not required.

### Translate brand sources into observable UX criteria

For design-relevant work, the agent reads the target project's explicitly declared brand source.
It describes intended perception and information priorities. AGDF's own English profile is
[BRAND.md](../../../BRAND.md); other products use their own sources. Generic adjectives or existing
colors do not substitute for confirmed brand intent.

The [shared quality rule](../../../plugins/agdf/meta/contracts/quality.md#brand-source-use-across-delivery-paths)
also applies to compact paths. They retain the source and observable checks in their existing
approved scope and compact result/evidence; this alone creates no PRD/SD documents or additional
analytical step.

The UX analysis records the source, owner, scope and revision or digest in the existing `evidence`
field. It translates the relevant passage into a priority, a concrete scenario and an observable
outcome. These become proposals in the existing `proposed_prd_acceptance_criteria` field, together
with the evidence needed to assess them. The presence of a file alone does not demonstrate a
suitable interface.

For AGDF, the brand profile illustrates testable distinctions between decided and pending matters,
reachable result sources, the next permitted step and visibly missing evidence. It includes
concrete scenarios and proposed checks. PRD adopts confirmed, in-scope criteria under its existing
identifiers. SD then owns concrete design and realization.

If a source required for a material decision is missing or conflicts with the approved need, the
question remains open through the existing clarification or revision path. Irrelevant brand input
can be justified as `not_applicable` in the existing `evidence` field; an otherwise required UX
analysis remains required. This adds neither a gate nor a
mandatory brand file for every project. Reviews apply the existing UX Intent Fidelity to adopted
criteria; inspection, actual user observation and untested behavior remain distinguishable.

### Try a proposed interface before PRD approval

When a user flow is hard to assess from text, a focused UI preview in the conversation can help.
Try a concrete task, for example: “Find what was checked, identify the open risk and decide whether
you can approve.” Include the relevant starting state, action, outcome and recovery behavior.
Use an available visualization tool when useful.

When a preview is explicitly requested, the UR already captures its purpose, scenarios, required
interaction and review timing. UX clarification later creates a reopenable version under
`.agdf/control/runs/<run_id>/evidence/previews/<name>-v1/index.html`. The same Run directory also owns documents, control records and immutable history. A revised preview gets a new path; the UX analysis and PRD reference the same inspected
version with file digests and observation limits. A chat rendering alone does not fulfill this
run deliverable.

An optional aid may use a wireframe or written walkthrough. An explicitly requested interactive
preview cannot silently be replaced that way. If unavailable, keep the obligation open until a
concrete recovery or an explicitly agreed scope change resolves it.

Record the scenario, actual feedback and untested assumptions in the UX analysis. During PRD
alignment, turn confirmed behavior into acceptance criteria and record material choices in Approval
Decisions. The PRD must remain understandable without the preview. Prototype interactions stay local;
liking a preview grants no approval and proves no implemented or host behavior. This adds no gate.

At PRD approval, a required preview belongs to the review basis: the presentation gives a concrete
review task, access to the applicable version and the criteria being adopted. Approval confirms the
specified behavior and permits the existing solution-design stage; it proves no delivered feature.
Changes require a current presentation, and material product decisions remain to be resolved before
approval. Dedicated Core/host projection and version revalidation still need implementation and
practical evidence; a preview link in a document alone does not establish that integration.

## Five common delivery failures

AGDF is not intended to produce as many documents as possible. It is intended to detect when fast
agent output is being treated as a reliable delivery decision.

| Failure | How to recognize it | Clean response |
|---|---|---|
| Silent scope drift | The request, approved requirement and implementation no longer describe the same outcome. | Return to the earliest affected artefact and decide the change explicitly. |
| A new parallel path in an existing system | The agent creates a second rule, data source or integration even though a responsible owner already exists. | Check the existing owner and reuse path; a deviation needs a deliberate design decision. |
| Green build, unfinished plan | Tests pass, but tasks, acceptance criteria or visible evidence from the approved plan are missing. | Check plan coverage and evidence before QA makes a decision. |
| Permanent workaround | A guard, fallback or workaround remains without an owner, target state or removal criterion. | Establish the primary solution or explicitly document the transition, responsibility and exit criterion. |
| Premature handoff | A commit, pull request or publication begins while gate state, risks or acceptance remain open. | Close the open decisions, then perform only the explicitly requested delivery step. |

These patterns are indicators, not new gates or modes. The
[Runtime Contract](../../../plugins/agdf/meta/agdf-runtime-contract.md) determines which rule is authoritative.

## Good work requests

A good request starts with the objective and desired result. It also helps to name:

- affected users, files, systems or interfaces;
- behavior that must remain unchanged;
- known risks and dependencies;
- required evidence or acceptance criteria;
- external actions that are explicitly permitted or forbidden.

For example, the German request below says that a transfer marked for manual review must not count
towards the daily limit yet. Normal SEPA transfers and the existing security check must remain
unchanged, and no new database or temporary workaround may be introduced.

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten.

Normale SEPA-Überweisungen und die bestehende Sicherheitsprüfung müssen unverändert
bleiben. Keine neue Datenbank und keine Übergangslösung einführen.
```

These constraints help with planning. The agent still verifies that they fit the existing system,
canonical sources and current gate.

Next: [Multiple runs](04-multiple-runs.md).
