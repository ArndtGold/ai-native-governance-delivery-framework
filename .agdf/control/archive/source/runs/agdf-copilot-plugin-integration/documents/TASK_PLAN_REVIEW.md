# Task Plan Review: Copilot Task-Target Binding

Status: done
Decision: revise
Revision: 15
Date: 2026-09-07
Reference: approved `TP.md` Revision 4 and Brownfield Analysis Revision 4

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI3-T01 through CPI3-T13, except CPI3-T12 | fully_done | Historical Revision 3 implementation, reviews, complete smoke and installed 0.14.5 evidence remain valid; final profile regression is green | none for the Revision 3 slice | none |
| CPI4-T14 | fully_done | Brownfield Analysis Revision 4 maps parser, registry, validator dispatch, resolver, presentation, SessionStart generator and regression owners with explicit stop conditions | none | none |
| CPI4-T15 | fully_done | `repository-context.js`, `task-target-resolution.js`, validator dispatch and `target-check --json`; unit matrix covers all four unresolved reason codes, three sources, real paths, repository membership, contradictory continuation and stale/current context | none | none |
| CPI4-T16 | partially_done | The latest loaded Copilot observation proves `qa-gate` still chose English in a German conversation and that later model translation changed the canonical fields. The common function description, binding grammar and all ten executable skills now require current-conversation language. Installed `de` and `de-DE` invocations render the complete German card, unsupported `fr-FR` renders the complete English fallback card, and the selected-run status projection uses the same normalized language without localization diagnostics. | fresh fully restarted Copilot `qa-gate` observation against the corrected install | open visible-behavior locale evidence gap; current implementation correction is installed but not yet loaded-host verified |
| CPI4-T17 | partially_done | SessionStart generator and focused fixtures prove `repo_less` skips doctor/config, `repository_bound` uses verified root, malformed input fails closed and disabled consent stays silent | fresh restarted Copilot SessionStart observation after renewed consent | evidence gap only; hook implementation and byte identity pass |
| CPI4-T18 | fully_done | Resolver matrix, locale-safe orientation tests, the new prior-UR adversarial case and 83/83 deterministic evals cover explicit, continued, current, unavailable, multiple, stale, intent-less ungoverned and unresolved-with-history paths | live model behavior remains UAT evidence | none before UAT |
| CPI4-T19 | partially_done | One uninterrupted serial aggregate passes after the complete language correction; the reviewed Copilot profile contains 95 files and 751161 bytes; refreshed install is 0.14.5 and Ready | restarted German `qa-gate` observation plus repository-bound and optional consented SessionStart observations | keep UAT closed until observed |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| CPI2-AC-02, AC-04, AC-11 | repo-less GeneralChat | CPI4-T16, CPI4-T17 | latest `qa-gate` host run still renders the first canonical card in English; the cross-skill conversation-language correction is installed but not yet observed after restart | partial | evidence_gap |
| CPI2-AC-02, AC-04, AC-11 | repository-bound session | CPI4-T15, CPI4-T17 | installed runtime resolves only matching Git context; deterministic hook fixture uses verified root | not_verifiable | evidence_gap |
| CPI2-AC-02, AC-04, AC-11 | deterministic and installed runtime | CPI4-T15, CPI4-T18 | focused matrix, 70/70 evals, full smoke, installed 0.14.5 and byte identity | fulfilled | none |

## Summary

- fully_done: 15/19
- partially_done: 4/19
- not_done: 0/19
- out_of_scope_changes: none identified; all changes remain within approved CLI, runtime, interaction, generated-profile, eval and control owners
- risks: Copilot remains `instruction_only`; loaded-session behavior cannot be inferred from installed bytes
- required_next_step: QA retains one fresh-session `qa-gate` locale proof as the decisive evidence obligation; the refreshed clean and code reviews are complete

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR11-01 | evidence_gap | evidence_obligation | open | the latest loaded `qa-gate` observation remains English and later model translation omits a field; the canonical cross-skill conversation-language correction is installed but not loaded-host observed | fully restart Copilot and capture the complete German `qa-gate` `no_reliable_target` card immediately, then test repository-bound behavior separately |

## 2026-09-07 Cross-Skill Conversation-Language Coverage

This correction stays inside approved TP Revision 4 tasks CPI4-T16, CPI4-T18 and CPI4-T19. It
removes the `gate-check`-only precision gap by making the model-facing function description the
canonical language owner and projecting it into all ten executable skills.

| Evidence | Result |
|---|---|
| Semantic function contract and binding grammar | pass; `presentation_language` means current conversation language, normalizes supported regional variants, uses `en` for unsupported values and remains required |
| Language edge matrix | pass; missing CLI value stops before dispatch, `fr-FR` renders the complete English target and selected-run cards, `de-DE` renders the complete German target card, and the normalized value reaches gate evaluation and skill continuation |
| German `qa-gate` adversarial case | pass; literal `de`, German card and German recovery required; English forbidden |
| Skill projection integrity | pass; all ten skills contain the same function-derived language instruction exactly once |
| Selected-run German status | pass; `gate-check --run agdf-copilot-plugin-integration` has no localization diagnostics and renders the canonical German QA-revise card |
| Release and package checks | pass; 95-file, 751161-byte Copilot profile and 467-file package inventory |
| Complete deterministic aggregate | pass; 83/83 skill evals plus remaining smoke suites |
| Installed Copilot state | pass; version 0.14.5 Ready, generated, staged and installed `qa-gate`, runtime and locale bytes identical; missing, unsupported, regional German and resolved English/German executable cases match the contract |
| Loaded Copilot behavior | not_verifiable until a full restart and new German `qa-gate` session |

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
