---
language: en
chapter_role: closeout_and_delivery
translation_of: ../de/05-abschluss-und-auslieferung.md
source_revision: sha256:8045edf05c3caca1824bed78ad2d00bf61e2956aa7724c2857b0517f56db4cc6
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

## What each kind of evidence proves

Evidence is only as strong as the level that was actually checked. It must not be used to support a
broader claim.

| Evidence | What it proves | What it does not prove |
|---|---|---|
| Repository and build evidence | What the checked source contains and which documented tests, reviews or builds passed. | That the same version is installed, deployed, available to users or accepted for its intended purpose. |
| Observation in an installed host | What happened with the observed version, account, permissions and specific situation. | That all accounts, versions, hosts or users have the same behavior. |
| Human UAT | That the observed behavior was accepted for the agreed purpose and tested acceptance cases. | That other environments work or that deployment, release or public listing has occurred. |
| Deployment or publication evidence | That the responsible external platform reports the specific deployment, review or publication state that was read back. | That a local bundle, prepared submission or expected platform action is already effective externally. |

For important claims, name the evidence source, version or scope and the boundary of the check. A
host observation that was not performed remains visibly `unverified`; it is not inferred from
repository tests.

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
