# Task Plan Review: Community Health

Status: revise
Date: 2026-07-23
Reviewer: agent
Based on: `.agdf/control/artefacts/github-community-health-governance/TP.md`

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T01 | fully_done | Passing `BROWNFIELD_ANALYSIS.md`; exact connector repository/permission evidence; isolated worktree inventory | Authenticated PVR setting not exposed | warning only because approved fallback is complete |
| T02 | fully_done | Parsed exact `.github/repository-metadata.json`; negative drift fixture | Applied host state | evidence obligation |
| T03 | fully_done | `CODE_OF_CONDUCT.md`; conduct contract assertions and link check | Default-branch Community Profile recognition | post-delivery evidence obligation |
| T04 | fully_done | `SECURITY.md`; fallback, support-line, no-SLA and negative fixtures | Authenticated PVR availability | evidence obligation; email route remains safe |
| T05 | fully_done | `SUPPORT.md`, `GOVERNANCE.md`; routing and authority assertions | Public default-branch links | post-delivery evidence obligation |
| T06 | fully_done | `CONTRIBUTING.md`; canonical-owner, no-CLA/DCO and AI-disclosure assertions | Public default-branch link | post-delivery evidence obligation |
| T07 | fully_done | Four parsed Issue Forms and chooser; required fields, IDs, safety/language/routing and negative schema fixtures | GitHub-rendered chooser | post-delivery evidence obligation |
| T08 | fully_done | PR template and CODEOWNERS; authority and AI-disclosure checks | GitHub template/CODEOWNERS recognition | post-delivery evidence obligation |
| T09 | fully_done | README route section; link and copy assertions | Public default-branch traversal | post-delivery evidence obligation |
| T10 | fully_done | 1280×640 PNG, 850979 bytes; native-resolution visual inspection; image contract test | Uploaded social preview | evidence obligation |
| T11 | fully_done | SOT Registry rows and `CG-PUBLIC-COMMUNITY-GOVERNANCE` | none | none |
| T12 | fully_done | Declared `yaml@2.9.0`, root lockfile, clean `npm ci`, zero audit vulnerabilities | none | none |
| T13 | fully_done | Focused checker passes; JSON/YAML, policy, link escape, metadata and image controls reviewed | none | none |
| T14 | fully_done | Baseline plus 14 negative contracts pass in isolated temporary fixtures | none | none |
| T15 | fully_done | Guardrails workflow retains existing steps, parses as YAML and adds root install/checks | Live Actions run | external CI evidence only |
| T16 | fully_done | Focused tests and the complete `create-agdf` smoke pass; skill evals 39/39; global delivery map has zero block findings | none | none |
| T17 | not_done | Connector proves exact repository and admin permission; in-app browser reaches GitHub but is not signed in | No settings mutation/read-back; PVR, metadata and social preview remain unapplied | live acceptance criteria unavailable until browser sign-in |
| T18 | fully_done | `CLEAN_IMPLEMENTATION_REVIEW.md`, `CODE_REVIEW.md` and this TP Review | none | no open design or implementation finding |
| T19 | fully_done | `QA_REPORT.md` records a revise decision and consumes both evidence gaps without reclassification | Rerun required after T17 | QA remains revise |
| T20 | not_done | Task is explicitly post-UAT/default-branch delivery | Separate VCS authorization and all GH-04–GH-08 observations | final public acceptance unavailable |

## Summary

- fully_done: 18/20
- partially_done: none
- not_done: T17, T20
- out_of_scope_changes: none
- risks: Host state remains unchanged because the available browser is not authenticated; default-branch recognition still requires later VCS delivery.
- required_next_step: Sign in to GitHub in the in-app browser, execute T17 with read-back, then rerun QA.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| CHG-001 | repository_entry / metadata visible | T02, T17 | Local exact manifest; public host state not applied | partial | evidence_gap |
| CHG-002 | repository_entry / Community Profile complete | T03–T09, T20 | Required local files present; no default-branch recognition | not_verifiable | evidence_gap |
| CHG-003 | maintainer decision / conduct route available | T03 | Rendered local policy and confidential route | fulfilled | none |
| CHG-004 | security / confidential route or fallback | T04, T17 | Complete email fallback visible; PVR unavailable to current observation | partial | evidence_gap |
| CHG-005 | security / bounded support | T04 | Current-line, best-effort and no-SLA policy plus negative fixture | fulfilled | none |
| CHG-006 | bug / ready or redirected | T07, T20 | Parsed and contract-tested form; no host rendering | partial | evidence_gap |
| CHG-007 | compatibility / sufficient evidence | T07, T20 | Four-surface fixture contract; no host rendering | partial | evidence_gap |
| CHG-008 | documentation / focused route | T07, T20 | Parsed form and routing copy; no host rendering | partial | evidence_gap |
| CHG-009 | idea/proposal / deterministic redirect | T05, T07, T20 | Routing fixtures and chooser config; no host rendering | partial | evidence_gap |
| CHG-010 | support / truthful route | T05, T07, T20 | Support policy and routing fixtures; no host rendering | partial | evidence_gap |
| CHG-011 | contribution / canonical owners | T06 | Rendered local contribution policy and owner links | fulfilled | none |
| CHG-012 | contribution / proportionate AI disclosure | T06, T08 | Contribution and PR copy with positive/negative assertions | fulfilled | none |
| CHG-013 | pull request / evidence visible | T08, T20 | Local template reviewed; host load unverified | partial | evidence_gap |
| CHG-014 | governance / one owner and change path | T03, T05, T08, T11 | Governance, conduct, CODEOWNERS, registry and graph agree | fulfilled | none |
| CHG-015 | ownership / review routing | T08, T20 | Valid local CODEOWNERS; host recognition unverified | partial | evidence_gap |
| CHG-016 | all modes / German primary, English accepted | T03–T09 | Cross-document and form assertions | fulfilled | none |
| CHG-017 | all modes / single-source policies | T02–T15 | Canonical policies, thin adapters, registry/graph and checker | fulfilled | none |
| CHG-018 | repository vs host / state separated | T02, T17, T20 | Desired-state manifest and explicit evidence ledger; no host read-back | partial | evidence_gap |
| CHG-019 | repository entry / brand preview | T10, T17 | Final asset visually inspected and mechanically valid; not uploaded | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | T16 is now green; T17 host settings remain unchanged because the available browser is not authenticated | Sign in to GitHub in the in-app browser, then execute exact settings preflight/mutation/read-back |
| TPR-002 | evidence_gap | evidence_obligation | open | T20 and GH-04–GH-08 require files on the default branch | After QA/UAT and separate VCS authorization, deliver and collect Community Profile/template/CODEOWNERS/link evidence |
