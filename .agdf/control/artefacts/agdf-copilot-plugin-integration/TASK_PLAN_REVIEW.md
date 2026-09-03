# Task Plan Review: Copilot Task-Target Binding

Status: done
Decision: revise
Revision: 11
Date: 2026-09-03
Reference: approved `TP.md` Revision 4 and Brownfield Analysis Revision 4

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI3-T01 through CPI3-T13 | fully_done | Historical Revision 3 implementation, reviews, complete smoke and installed 0.14.5 evidence remain valid; final profile regression is green | none for the Revision 3 slice | none |
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

- fully_done: 16/19
- partially_done: 3/19
- not_done: 0/19
- out_of_scope_changes: none identified; all changes remain within approved CLI, runtime, interaction, generated-profile, eval and control owners
- risks: Copilot remains `instruction_only`; loaded-session behavior cannot be inferred from installed bytes
- required_next_step: QA retains the fourth fresh-session locale proof as the decisive evidence obligation; the clean and code reviews are complete

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR11-01 | evidence_gap | evidence_obligation | open | the third restarted GeneralChat proves target and concise-output corrections but remains English; the literal German conversation-locale correction is installed but not loaded-host observed | restart Copilot and capture one German `no_reliable_target` card followed by one short German target question, then test repository-bound behavior separately |
