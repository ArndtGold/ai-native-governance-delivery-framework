# Task Plan Review: Copilot Task-Target Binding

Status: done
Decision: revise
Revision: 12
Date: 2026-09-05
Reference: approved `TP.md` Revision 4 and Brownfield Analysis Revision 4

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI3-T01 through CPI3-T13, except CPI3-T12 | fully_done | Historical Revision 3 implementation, reviews, complete smoke and installed 0.14.5 evidence remain valid; final profile regression is green | none for the Revision 3 slice | none |
| CPI4-T14 | fully_done | Brownfield Analysis Revision 4 maps parser, registry, validator dispatch, resolver, presentation, SessionStart generator and regression owners with explicit stop conditions | none | none |
| CPI4-T15 | fully_done | `repository-context.js`, `task-target-resolution.js`, validator dispatch and `target-check --json`; unit matrix covers all four unresolved reason codes, three sources, real paths, repository membership, contradictory continuation and stale/current context | none | none |
| CPI4-T16 | partially_done | Three restarted observations prove correct unresolved stopping, no prior-UR/approval leak, no chat-folder target promotion and one concise question. The third remains English. The final skill now binds a German user conversation to literal `--language de` and requires the question to match the renderer language; focused and aggregate tests pass. | fourth fresh restarted Copilot GeneralChat observation against the locale-corrected install | open visible-behavior locale evidence gap; all observed implementation defects are corrected |
| CPI4-T17 | partially_done | SessionStart generator and focused fixtures prove `repo_less` skips doctor/config, `repository_bound` uses verified root, malformed input fails closed and disabled consent stays silent | fresh restarted Copilot SessionStart observation after renewed consent | evidence gap only; hook implementation and byte identity pass |
| CPI4-T18 | fully_done | Resolver matrix, locale-safe orientation tests, the new prior-UR adversarial case and 70/70 deterministic evals cover explicit, continued, current, unavailable, multiple, stale, intent-less ungoverned and unresolved-with-history paths | live model behavior remains UAT evidence | none before UAT |
| CPI4-T19 | partially_done | Final full smoke passes; 82-file/604901-byte baseline is exact; refreshed install is 0.14.5 and Ready | fourth repo-less observation plus repository-bound and optional consented SessionStart observations | keep UAT closed until observed |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| CPI2-AC-02, AC-04, AC-11 | repo-less GeneralChat | CPI4-T16, CPI4-T17 | third host run now stops correctly, keeps chat cwd non-authorizing and asks one concise question, but remains English; final locale-corrected bytes are not yet observed | partial | evidence_gap |
| CPI2-AC-02, AC-04, AC-11 | repository-bound session | CPI4-T15, CPI4-T17 | installed runtime resolves only matching Git context; deterministic hook fixture uses verified root | not_verifiable | evidence_gap |
| CPI2-AC-02, AC-04, AC-11 | deterministic and installed runtime | CPI4-T15, CPI4-T18 | focused matrix, 70/70 evals, full smoke, installed 0.14.5 and byte identity | fulfilled | none |

## Summary

- fully_done: 15/19
- partially_done: 4/19
- not_done: 0/19
- out_of_scope_changes: none identified; all changes remain within approved CLI, runtime, interaction, generated-profile, eval and control owners
- risks: Copilot remains `instruction_only`; loaded-session behavior cannot be inferred from installed bytes
- required_next_step: QA retains the fourth fresh-session locale proof as the decisive evidence obligation; the clean and code reviews are complete

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR11-01 | evidence_gap | evidence_obligation | open | the third restarted GeneralChat proves target and concise-output corrections but remains English; the literal German conversation-locale correction is installed but not loaded-host observed | restart Copilot and capture one German `no_reliable_target` card followed by one short German target question, then test repository-bound behavior separately |

## 2026-09-05 Final installer correction coverage

The earlier task-target observations and CPI-TPR11-01 remain open. This is a corrective slice of approved TP Revision 4, not a new plan or approval.

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI3-T06 | fully_done | canonical atomic Git transport; deterministic first/repeat/update, foreign-root and rollback tests; real native update at identical public version | native Windows | no new implementation gap |
| CPI3-T07 | fully_done | CLI composition, both native versions and final normal npm run install:copilot pass; identity, content and all ten skills verified | none for the installation slice | none |
| CPI3-T08 | fully_done | existing coexistence suites pass; no shared-root or Codex/Claude registration change in correction | native Windows | final shared-root digest recorded separately |
| CPI3-T09 | fully_done | focused installer, local-development and repository-retention suites pass; new suite included in aggregate smoke | aggregate result tracked under CPI3-T11 | no new focused regression |
| CPI3-T10 | fully_done | package README and contributor install instructions explain Git prerequisite, automatic migration, discovery verification and restart boundary | none | none |
| CPI3-T11 | fully_done | complete aggregate smoke, 83/83 evals, 410-file package inventory, both native versions and focused suites pass | native Windows | none for local verification |
| CPI3-T12 | partially_done | actual 1.0.83-5 SDK global and fresh-session APIs each discover ten skills using the corrected installer | restarted desktop presentation; actual installed readback now passes | visible behavior remains evidence_gap |
| CPI3-T13 | fully_done | code and clean reviews, QA revise with explicit host gap, Context Graph link and OR completed | none for reporting | QA remains revise |

Evidence confidence is high for executed deterministic and native API tests. Desktop rendering remains not_verifiable until directly observed. The discovery probe sends no model prompt and cannot replace German target-routing UAT.

Current correction coverage: 7/8 relevant task slices fully_done; CPI3-T12 remains partially_done only for restarted desktop presentation. This reopens that visible-behavior part of the historical CPI3 group. Overall current plan coverage is 15/19 fully_done and 4/19 partially_done, including unchanged CPI4-T16, T17 and T19 evidence obligations.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR12-02 | evidence_gap | evidence_obligation | open | normal install and exact-runtime APIs find ten matching skills; the user desktop has not been observed after restart | fully quit Copilot and verify the ten AGDF skills in a fresh desktop session |
