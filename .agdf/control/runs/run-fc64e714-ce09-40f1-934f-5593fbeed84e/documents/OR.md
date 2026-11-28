# OR: Lean Codex continuation handoff

Gate: OR
Type: Orchestration Report
Report mode: `OR-full`
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- related_ur: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/UR.md
- related_prd: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/PRD.md
- related_sd: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/SD.md
- related_tp: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/TP.md
- related_qa_report: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/UR.md |
| Brownfield Review | done | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/PRD.md |
| SD | approved | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/SD.md |
| TP | approved | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/TP.md |
| Brownfield Analysis | done | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/CD_TESTS.md |
| CR | done | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/CODE_REVIEW.md |
| QA | approved | .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-11-28 · presentation 622c107b-8ce6-4c93-a257-c40ace22e94c sha256:6152e91c6203c39d0690f26d63f0f5cdc9a813bd3dfc5602977c6037f799cb1b |

## Run Status Card

| Run status | Value |
|---|---|
| Status | delivered, uncommitted |
| Current gate | OR |
| Allowed now | delivery closeout; commit and push to PR #84 and merging the base upward into PR #85 and PR #86 as planned in this session |
| Blocked by | none |
| Missing approval | none |
| Next step | commit on agdf/pr84-continuation-locks, push to codex/agdf-companion-reader-and-continuation, then merge upward into #85 and #86 |
| Quality outlook | good; remaining gaps are the browser cases and a live Codex host, the native re-qualification, and CI until the push |

## Delivered

| Item | Evidence |
|---|---|
| Handoff store instead of a run lock: one version-2 record per target and Run only while reserved (2 min), published (10 min) or picked up (1 min); removal on access, pruning on reservation, PR #84 records absent, unreadable records block Companion operations for at most 10 minutes (also with a far-future file time) | packages/core/lib/companion/codex-continuation.js; codex-continuation-admission-test.js 7/7 |
| Single pickup per handoff; repeat, expired or outdated pickups refused with one chat sentence; a terminal pickup releases its handoff | codex-continuation.js `claim`, `release`; packages/cli/lib/mcp-dispatch-runtime.js; companion-continuation.test.js case 2 |
| Ordinary Codex `continue_delivery` never refused by the admission; outdated-revision writes still rejected by Core | mcp-dispatch-runtime.js `admitCodexContinuation`; companion-continuation.test.js case 3 |
| Companion running state from the activity lease, no reservation while Codex works, ended own reservation never leaves the card stuck; `stopping` removed | packages/core/lib/control-inspect/cockpit-session.js; packages/control-ui/src/mcp/companion-continuation.ts, CompanionContinuationAction.tsx; companion-continuation.test.js case 3, companion-continuation.test.tsx |
| Owner chain removed: `continuation_owner` gone from the dispatch contract; `codex-activity.js`, `prepared-control-calls.js`, `mcp-continuation.js` byte-identical to 6e166cab | packages/core/lib/skill-dispatch/contract.js; skill-dispatch-function-contract-test.js; git diff 6e166cab empty |
| Qualification observations `ordinary_continuation_unblocked`, `running_from_activity` | packages/core/lib/runtime/plugin-provenance.js; companion-continuation.test.js case 1 |
| Code Review findings CR-01, CR-03, CR-04, CR-05 fixed and re-verified; the five lock findings of the PR #84 review resolved by the redesign | CODE_REVIEW.md |
| Superseded run-5fbcb71f closed with successor run-fc64e714 | closure preview 0e658628, `Close runs: 0e658628` confirmed by the owner on 2026-11-27 |
| Derived artefacts regenerated | build:prepare without payload growth (baseline unchanged); docs/compatibility/**; observation d0246518 |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Native re-qualification of the Codex continuation on a real Codex host | outside this run (UR non-goal) | owner, native qualification recording |
| Running the updated browser continuation cases | not runnable on this Windows host; used by the native release probe | owner, release probe |
| English fallback text in the German Companion card (nit of the PR #84 review) | outside this run's scope | owner, possible follow-up |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Handoff store 7/7 with controlled clock and explicit file times | node --test packages/core/test/codex-continuation-admission-test.js | bounds, removal, pruning, legacy and unreadable records, single pickup, release | direct |
| Dispatch and Cockpit 3/3 through the real runtimes | node --test packages/mcp-server/test/companion-continuation.test.js | pickup, refusal, ordinary continuations, activity, stuck reservation, revision check | direct |
| MCP server full suite, safety and continuation re-run after CR fixes | npm --prefix packages/mcp-server test, test:continuation, test:safety | packaging, write boundary | direct |
| Run-view 77 pass, skill dispatch pass, cockpit session 18/18 | npm --prefix packages/cli run test:companion-run-view, test:skill-dispatch; cockpit-session-test.js | Core and contract behaviour | direct |
| control-ui 441/441, tsc clean | npm --prefix packages/control-ui test, npx tsc --noEmit | rendering without stopping | direct |
| compatibility:record and compatibility:check 56/0 on final code | npm run compatibility:record, npm run compatibility:check | contract text change chain | direct |
| CR-01, CR-03, CR-04 red with the fix reverted, green with it | temporary revert run | review fixes | direct |
| TP Review, Clean Implementation Review and Code Review pass | TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md | task fulfilment, structure, defects | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Browser continuation cases and a live Codex app | warn | release probe and native check on a Codex host |
| CI on the pushed branch | warn | runs after the push |
| test:cockpit-core on this host has one host-limit failure (symlink privilege, untouched file) | warn | CI or a host with symlink privilege |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| After the 1-minute pickup display only the activity lease blocks a new Companion start; approval handoffs, phases without a lease or hosts without trusted hooks allow a second click | warn | accepted in the PRD; consistency through the revision check |
| The public dispatch schema loses `continuation_owner` | warn | introduced only by the unreleased PR #84 |
| PR #85 and PR #86 must merge this base again and resolve payload baseline and compatibility conflicts | warn | done in this session after the push |
| Native continuation qualification no longer matches | warn | owner records it again on a real Codex host |

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: no OR reconciles_with relationship declared
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

- startable: false
- final_ready: false
- acceptance_ref: none
- evidence: not a programme run
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: narrows the existing Codex continuation admission inside its Core owner without a new SoT or owner; CG-MCP-DISPATCH-ADAPTER text stays valid

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: run-specific evidence stays in the run documents of this Run
- memory_refs: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/

## Next Permissible Step

- next_allowed_action: delivery closeout; commit and push as planned in this session
- required_approval: none
- forbidden_until_then: merge of PR #84, PR #85 or PR #86, release

## Approval

OR does not approve later gates. It records the next permissible step.

## AGDF Approval Summary (de; source=en)

- Ergebnis: Die Codex-Fortsetzungssperre aus PR #84 ist durch eine schlanke Begleiter-Übergabe ersetzt; gewöhnliche Chat-Fortsetzungen werden nie gesperrt, „Codex arbeitet“ kommt aus dem Aktivitätsnachweis, die Owner-Kette ist entfernt. Alle Gates von UR bis UAT sind freigegeben, vier Code-Review-Befunde behoben, QA pass; der alte Run run-5fbcb71f ist als abgelöst geschlossen.
- Grenzen: Browserfälle und echte Codex-App nicht ausgeführt, native Neuqualifizierung offen, die CI läuft erst nach dem Push.
- Risiken: Nach der Abholanzeige ist ohne Aktivitätsnachweis ein zweiter Start möglich (akzeptiert); #85 und #86 müssen den Stand nachziehen.
- Nächster Schritt: Commit auf agdf/pr84-continuation-locks, Push zu PR #84, danach #85 und #86 abgleichen.
