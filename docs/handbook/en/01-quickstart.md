---
language: en
chapter_role: quickstart
translation_of: ../de/01-schnellstart.md
source_revision: sha256:44207d8dbd4e9b643113e3a6defa3debef4978e13205226e8bd1b6c5ddb49941
translation_status: reviewed
---

# Quickstart

You do not need to learn AGDF commands. Tell the coding agent what you want to achieve. If you know
which files, systems or boundaries are affected, name them as well. When you request implementation,
a binding delivery artefact or an explicit AGDF operation, the agent confirms the intended work,
checks the next permitted step and prepares only what that step requires.

An ordinary question, assessment, explanation, recommendation, review or diagnosis does not activate
AGDF. The agent answers it without an AGDF status card, gate notice or hidden AGDF action. This also
applies when the text mentions AGDF or possible implementation only as a topic, quotation, example,
hypothesis or negated action. A mixed request activates AGDF only when it actually asks for
implementation or another binding delivery outcome.

Before that decision, generated AGDF profiles contain only a small common activation kernel and
short skill descriptions. They make detailed routing, gate, quality and closeout rules available on
demand only after positive activation. Versioned size budgets constrain these visible instructions
and are checked during generation and packaging. This reduces unnecessary system instructions
without weakening approval or safety rules.

Those checks prove source and generated package behavior. Proving what a specific host actually
loads and retains after installation and restart requires separate loaded-host evidence.

You decide when to approve each user gate.

## Your first delivery request

A German-language business request might start like this:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten. Normale SEPA-Überweisungen müssen unverändert bleiben.
```

In English, the request says that a real-time transfer marked for manual review must not yet count
towards the daily limit, while normal SEPA transfers must remain unchanged.

The coding agent clarifies open points and creates or updates the User Requirement (UR). For new
work, the first draft may appear in the conversation. The artefact must become durable before the
next gate depends on it.

If the UR reflects your intent, reply with exactly:

```text
Approval: UR
```

An instruction such as `Leg los`, `Mach weiter` or `Sieht gut aus`—roughly “get started”, “continue”
or “looks good”—lets the agent continue only within work that is already permitted. It does not
replace a gate approval.

## What an approval does

Every approval uses this format:

```text
Approval: <GateName>
```

The user gates are:

```text
Approval: UR
Approval: PRD
Approval: SD
Approval: TP
Approval: QA
Approval: UAT
```

Each approval permits only the specific next step. For example, `Approval: PRD` permits Solution
Design, not implementation. [Gates and approvals](02-gates-and-approvals.md) explains the exact
effect of each decision.

## Choosing the delivery path

After an approved UR, AGDF examines the existing context in a Brownfield Review. It considers
existing owners, sources, risks and reuse opportunities, then selects the smallest safe path with a
recorded rationale:

- **Compact Delivery** for a small, clearly bounded change after an approved UR;
- **Verified Change** for a bounded change with a proven owner, clean baseline and deterministic
  checks;
- **Structured Slice** for a structured outcome that can be accepted independently;
- **Structured Delivery** for broad or consequential changes;
- **Block** when important decision evidence is missing or contradictory.

Independent questions and read-only checks remain outside AGDF. A small correction is implementation
and therefore activates the suitable bounded delivery path.

## Typical structured workflow

A structured change normally follows this path:

```text
Wunsch und eindeutiges Vorhaben
→ User Requirement (UR) und Approval: UR
→ Brownfield Review und Mode/Slice-Entscheidung
→ Product Requirements Document (PRD) und Approval: PRD
→ Solution Design (SD) und Approval: SD
→ Task- und Testplan (TP) und Approval: TP
→ Pre-Implementation Brownfield Analysis
→ Umsetzung und Tests (CD+Tests)
→ Task Plan Review, Clean Implementation Review und Code Review
→ QA-Entscheidung und Approval: QA
→ User Acceptance Testing (UAT) und Approval: UAT
→ Orchestration Report und Delivery Closeout
```

In English, the sequence moves from the initial request and UR through Brownfield Review, PRD, SD,
TP, implementation preparation, CD+Tests, reviews, QA, UAT and final closeout.

Structured Slice and Structured Delivery use the same user gates. They differ in the depth of their
artefacts and evidence. Compact Delivery and Verified Change have their own compact closeout paths
and do not pass through the full gate sequence by default.

## What the coding agent handles

Depending on the currently permitted step, the coding agent can:

- analyse existing context and artefacts;
- prepare the current gate draft;
- implement approved tasks;
- run tests and reviews;
- document evidence and remaining risks;
- show the next permitted step.

The agent never decides that a human gate has been approved. It also does not commit, push, open a
pull request, release or publish externally without an explicit request.

Next: [Gates and approvals](02-gates-and-approvals.md).
