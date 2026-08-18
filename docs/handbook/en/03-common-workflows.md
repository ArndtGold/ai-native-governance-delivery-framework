---
language: en
chapter_role: common_workflows
translation_of: ../de/03-typische-arbeitsablaeufe.md
source_revision: sha256:9144306b4670dbbd1403d314e3c615c9c49085865eb54b156bae60728debadba
translation_status: reviewed
---

# Common workflows

AGDF uses the smallest safe workflow. The choice depends on impact, ownership, risk and available
evidence—not on the number of changed files.

## Quick Task

A Quick Task works well outside a formal delivery run for:

- questions about existing code or documentation;
- read-only checks and reviews;
- debugging;
- suitable small corrections without new product semantics or formal gate artefacts.

Inspection and modification remain separate. For example, a German-language request may say:

```text
Prüfe, ob die README auf einen nicht vorhandenen Link verweist.
```

In English: “Check whether the README links to a page that does not exist.”

This authorizes only the inspection and its findings. The original request or a later instruction
must explicitly include correcting the link before the agent may change it.

A Quick Task records the result, evidence, remaining risk and next step in compact form. It is not
appropriate when new product semantics, architecture, policy, persistence, a public contract, a
release boundary or formal approvals are involved.

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
[Runtime Contract](../../../plugin/meta/agdf-runtime-contract.md) determines which rule is authoritative.

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
