---
language: en
chapter_role: closeout_and_delivery
translation_of: ../de/05-abschluss-und-auslieferung.md
source_revision: sha256:0d356faa81272adb8368c3b52eaad6effbd839c6c21bf07db5e862cbe9352004
translation_status: reviewed
---

# Closeout and delivery

A successful test run does not mean the work is complete or ready for delivery. AGDF separates
implementation, reviews, Quality Assurance, user acceptance and delivery.

## After implementation

For a structured delivery, CD+Tests records:

- which tasks were implemented;
- which files or artefacts were affected;
- which tests and checks were run;
- which evidence was collected;
- what was not checked;
- which risks remain.

The required reviews come next. Code Review is a mandatory internal step for code changes. Task Plan
Review and Clean Implementation Review add evidence about plan coverage and solution integrity.
None of these reviews decides QA on its own.

## Quality Assurance

`qa-gate` is the sole owner of the final QA decision:

| Result | Meaning |
|---|---|
| `pass` | Plan coverage, solution integrity, reviews and evidence support the next gate decision. |
| `revise` | A correctable gap or missing evidence must be routed back to the responsible step. |
| `block` | A hard prerequisite or critical risk prevents transition. |

A QA report marked `pass` still needs human approval. Only the exact

```text
Approval: QA
```

opens UAT. A `revise` or `block` finding is routed to the earliest responsible owner. That may be
UR, PRD, SD, TP, CD+Tests or an Evidence Obligation.

## User Acceptance Testing

In UAT, you evaluate the result from the user's perspective and against the agreed purpose.
Repository tests or a QA report do not replace this observation.

The German example below says that a transfer marked for manual review does not yet count towards
the daily limit, and that an approved payment is counted exactly once:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit
noch nicht. Eine später freigegebene Zahlung wird genau einmal gezählt.
```

If the observed result meets the requirement, you can approve exactly:

```text
Approval: UAT
```

If it does not, record what you observed. The agent routes the finding to the earliest relevant
artefact, implementation step or evidence owner. It does not declare UAT passed itself.

## Orchestration Report and Delivery Closeout

After the required QA/UAT path, the Orchestration Report summarizes the run. It records gate state,
delivered and intentionally omitted scope, plan coverage, solution integrity, evidence, risks
and the next permitted step.

Delivery Closeout prepares the operational Git handoff. Neither the report nor closeout performs a
commit, push, pull request, release, deployment or external publication automatically.

## Git and release

Git and release actions require an explicit request with a clear target. Even after successful QA
and UAT, this applies to:

- staging;
- commit;
- push;
- pull request;
- tag or release;
- deployment, plugin submission or publication.

Repository evidence does not prove external execution. A local build is not a deployment, a plugin
bundle is not an installation, and a prepared submission has not been published.

Next: [Troubleshooting](06-troubleshooting.md).
