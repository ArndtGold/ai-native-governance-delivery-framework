# Task Plan Review: Installation Consent for Automatic Runtime Checks

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| IRC-01 | fully_done | baseline, Brownfield Analysis and gate-check | none | none |
| IRC-02 | fully_done | canonical contract, identity and negatives | none | none |
| IRC-03 | fully_done | consent-gated fixed entrypoint and bounded output | none at repository plane | none |
| IRC-04 | fully_done | native projections plus direct Claude/OpenCode invocation | Codex enabled and Windows invocation | evidence gap |
| IRC-05 | fully_done | owned receipts, atomic persistence and rollback tests | none | none |
| IRC-06 | fully_done | first install plus enabled/manual update fixtures always prompt; three outcomes and zero-mutation cancel pass | direct revised behavior on Codex, Claude Code and OpenCode | evidence gap |
| IRC-07 | fully_done | no trust writer; real Codex review shows Active 0, Review 1 | user trust and enabled/disable cycle | evidence gap |
| IRC-08 | fully_done | exact Claude rule plus real hook, revoke and renewal | real managed conflict/rollback | evidence gap |
| IRC-09 | fully_done | verified OpenCode entrypoint and enabled/manual sessions | induced rollback | evidence gap |
| IRC-10 | fully_done | target/verified/update version, previous intent versus host permission, manual-mode explanation, invalid-key recovery and quiet setup progress are regression-tested; D returns to choice; 1/E, 2/M and immediate Esc, raw-mode cleanup, compact result, truthful titles and no-TTY/JSON pass; non-mutating real TTY D/Esc observed | installed-host rendering | evidence gap |
| IRC-11 | fully_done | real same-version update, revoke and re-enable | destructive rollback not induced | evidence gap |
| IRC-12 | partially_done | injected POSIX/win32 matrix and real macOS behavior | IRC-H04 through IRC-H06 | blocks Windows claim |
| IRC-13 | fully_done | docs and 43-file public candidate | rendered listing | evidence gap |
| IRC-14 | fully_done | Runtime Integrity and consent negatives | none | none |
| IRC-15 | fully_done | generation, full smoke, integrity and diff check | none | none |
| IRC-16 | fully_done | CD record and direct host matrix | none | none |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| PRD-IC-01/02 | readable disclosure and deliberate choice on every interactive install/update | IRC-06/10 | beginner-first injected output with version, truthful previous intent, manual explanation and invalid-key recovery; D details loop, compact result plus real non-mutating TTY D/Esc flow; installed-host rendering absent | partial | evidence_gap |
| PRD-IC-03/04 | least privilege and effective state | IRC-02/03/07/08/09 | Claude/OpenCode execution; Codex pending trust | partial | evidence_gap |
| PRD-IC-05 | preserved explicit authority | IRC-08/09/11 | exact Claude rule and unchanged OpenCode permissions | fulfilled | none |
| PRD-IC-06/07 | renewal and revocation | IRC-05/08/11 | Claude renewal/revoke and OpenCode manual session | fulfilled on tested cells | none |
| PRD-IC-08 | non-interactive safe default | IRC-06/10 | CLI fixture and JSON | fulfilled | none |
| PRD-IC-09/10 | honest host/OS matrix | IRC-12/13/16 | macOS explicit; Windows unverified | partial | evidence_gap |
| PRD-IC-11/12 | evidence separation and regression | IRC-14/15/16 | full smoke and direct-host artefact | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | revised repeated-choice behavior on Codex, Claude Code and OpenCode, Codex trust/enabled cycle, IRC-H04 through H07 and selected destructive cases remain unverified | Complete the remaining direct-host cells without inferred parity. |

## Summary

- fully_done: 15/16
- partially_done: IRC-12
- not_done: none
- out_of_scope_changes: none observed
- risks: revised host rendering is not directly observed; Codex enabled state remains a user decision; native Windows and rendered listing are absent
- required_next_step: keep TPR-01 open before QA pass
