---
language: en
chapter_role: common_workflows
translation_of: ../de/03-typische-arbeitsablaeufe.md
source_revision: sha256:be71b989aee91905a0ba47f106097f3bc900a13bc3869011056e97c12e31f698
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
