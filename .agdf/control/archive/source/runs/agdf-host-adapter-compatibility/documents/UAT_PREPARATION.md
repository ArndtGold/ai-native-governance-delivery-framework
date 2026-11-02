# Human UAT Preparation

Run: agdf-host-adapter-compatibility
Revision: 1
Date: 2026-09-09
Status: ready for human review; results pending

## Review basis

Exact user QA approval was accepted for QA Report Revision 3 against run revision 9
(f13a6fb9-e77b-4e5c-b55c-a88fe8280820). QA report SHA-256: `ffec24638b226d873563f3fb19d95e9103674e8bf273dbab1989286c09c26768`.

Review the [compatibility report](../../../../docs/compatibility/HOST_COMPATIBILITY.md),
its [recorded facts](../../../../docs/compatibility/evidence/facts.json) and
[exact snapshot](../../../../docs/compatibility/evidence/snapshot.json).
Source fingerprint: `dc967b46e93bf214abe12d61c18101cc798e68da9faf1690166d9025b01bb734`.
Compatibility report SHA-256: `a39e73d55c7c373611973d4dce3b4beaeb85114003e79d8b247b3c17e01c4286`.
The QA decision and automated checks establish the deterministic slice. The human reviews the
supplied report's meaning and relevant workflow, as specified in approved TP Revision 1.

## Pending human checks

| ID | Review action and expected meaning | Human result |
|---|---|---|
| UAT-01 | Read Five deterministic outcomes. The five independent installation, discovery, invocation, update and recovery results are understandable for each of the four hosts. The fixture scope and dated snapshot remain clear. | pending |
| UAT-02 | Inspect discovery-missing, update-stale, manual-checks and trusted-unexecuted in Scoped observations. A passing negative test still shows a failed observed capability; trust does not mean a check executed. | pending |
| UAT-03 | Read Native coverage and Capability evidence. All twelve host/OS combinations and the separate available-skills, automatic-checks, governance and enforcement promises remain visibly unverified for current native environments. | pending |
| UAT-04 | Follow the report links to facts and snapshot and inspect Historical evidence. The date, current source identity and original historical limits are traceable, with no transfer of older results to the current installation. | pending |
| UAT-05 | Choose one failed or unverified observation and read its Next action. The existing bounded verification, manual-check or recovery path is useful and understandable; the report does not itself perform host changes. | pending |

## Decision scope

Human acceptance concerns the supplied compatibility report and its relevant workflow within the
approved deterministic slice. It does not create native-host certification or fill missing native
observations. No human result is inferred from QA approval or agent checks. Record concrete issues
against the check IDs if revision is needed. The UAT decision remains pending in RUN_STATE.md.

Approval provenance: [QA acceptance](evidence/QA_APPROVAL_20260909.json).
