# UAT Evidence: Scope Classification Card Contract Hardening

Status: ready_for_decision
Gate: UAT
Gate approval: open
Based on: approved QA Report Revision 1
Date: 2026-08-19
Owner: agent

## Acceptance Candidate

Accept the corrected repository and release-built package behavior for the Scope Classification Card:

- a valid fresh Quick Task can render the existing non-authorizing localized card;
- Verified Change, structured, gated, ambiguous, selected-run and unknown states do not render it;
- unsupported requested locale tags use the complete deterministic English pack;
- incomplete or invalid registries and invalid dynamic input suppress the card;
- dynamic fields and 1–3 escalation triggers follow the approved bounded single-line plain-text
  contract;
- existing Run Status, approval, task-target and Verified Change flows remain unchanged.

## Acceptance Evidence

| Acceptance scenario | Observable repository/package evidence | Result |
|---|---|---|
| Valid Quick Task | deterministic English/German renderer output, frozen result and `authorizes: false` assertions | pass |
| Non-Quick-Task suppression | renderer negative matrix plus dedicated Verified Change and gated/ambiguous evals | pass |
| Unsupported locale recovery | `fr-CA` request produces complete English labels and `presentation_language: en` | pass |
| Invalid locale source | incomplete and malformed registries return `null` | pass |
| Plain-text safety and bounds | scalar/trigger tests cover type, whitespace, Markdown, CR/LF/U+2028/U+2029 and 1/240/241 code points | pass |
| Trigger collection bounds | 0/1/3/4, duplicate-normalized, invalid-item and non-array tests | pass |
| Existing interaction compatibility | final full package smoke, control-state, routing and interaction regressions | pass |
| Generated package coherence | byte-identical builds, 42-file public-plugin inventory, source/generated integrity and sync idempotence | pass |

## Evidence Strength

- authoritative: approved UR, PRD, SD and TP.
- direct code/test: renderer implementation and focused boundary/negative tests.
- deterministic behavioral: 54/54 skill evals; explicitly not live-host execution.
- package: final complete smoke, generated-layout integrity and byte-identical release-built package.
- governance: TP/Clean/Code Reviews and QA pass; Context Graph reconciliation resolved.

## Disclosed Acceptance Limits

- The currently installed AGDF plugin was not rebuilt, released or reinstalled by this run. This UAT
  does not claim that an existing installed cache already contains the correction.
- No direct live-host observation proves exactly-once Scope Classification Card rendering or host
  visual layout. The approved PRD explicitly excludes that guarantee.
- Repository and package checks prove canonical output behavior, not every host adapter's display.
- No commit, push, PR, publication, deployment or release was performed.

These limits do not contradict the approved acceptance criteria. They remain visible so acceptance
does not silently become a release or installed-host claim.

## UAT Decision

- Accept with exact `Approval: UAT`: accept the repository and release-built package behavior with
  the disclosed installed-plugin and live-host limits, then permit orchestration closeout.
- Request revision: keep UAT open and name the missing or unsatisfactory acceptance behavior.
- Decline: reject acceptance without authorizing closeout.

## Next Step

Review this evidence and approve only with:

`Approval: UAT`
