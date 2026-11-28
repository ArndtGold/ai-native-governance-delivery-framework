# OR: Single Core reader for the companion event journal

Gate: OR
Type: Orchestration Report
Report mode: `OR-full`
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- related_ur: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/UR.md
- related_prd: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/PRD.md
- related_sd: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/SD.md
- related_tp: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/TP.md
- related_qa_report: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/UR.md |
| Brownfield Review | done | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/PRD.md |
| SD | approved | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/SD.md |
| TP | approved | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/TP.md |
| Brownfield Analysis | done | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/CD_TESTS.md |
| CR | done | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/CODE_REVIEW.md |
| QA | approved | .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-11-27 · presentation 974cf8fd-50cc-4f3b-b0c5-ac9adec43344 sha256:fe6d207c70093d71655145bf56e666c589e03a2c6db97f5eef6b58ca78b65779 |

## Run Status Card

| Run status | Value |
|---|---|
| Status | delivered, uncommitted |
| Current gate | OR |
| Allowed now | delivery closeout; commit and stacked PR as named in the task of the parent session |
| Blocked by | none |
| Missing approval | none |
| Next step | commit on agdf/companion-journal-reader and PR against codex/companion-run-events |
| Quality outlook | good; remaining gaps are the unopened live Claude pane and Codex app, and CI until the PR runs |

## Delivered

| Item | Evidence |
|---|---|
| One Core reader for the companion event journal: `readCompanionEvents` reads a project root's events, optionally one run, with the 2x journal read limit, current-before-rotated order, oversized-rotation skip, stat-signature cache and Windows identity check; root matching by realpath and `path.relative` | packages/core/lib/companion/read-companion-events.js (renamed from read-cockpit-events.js); companion-journal-contract-test.js SCN-001, SCN-003, SCN-004, SCN-005 |
| Codex Cockpit observation uses the reader (newest first) and the run detail carries `last_activity` | packages/core/lib/control-inspect/cockpit-session.js, cockpit.js, control-state/run-inventory.js; cockpit-session-test.js 21/21 |
| Read-only `run-view` returns the root's event history with `--companion-data` and an absolute plugin data root, read before the runs; parser rejects relative, repeated or foreign-command use | packages/core/lib/companion/run-view.js; packages/cli/lib/cli/{parse-args,command-registry,project-read-command}.js; run-view-command-test.js SCN-007 |
| Claude companion takes events from run-view, keeps only the size and mtime change check and the UI logic; journal parser, root normalisation and read limit removed from the template | plugins/agdf/host-templates/claude/companion/{register,run-state,events}.mjs; claude-companion-test.js, claude-companion-adapter-test.js |
| Same semantics in both companions: confirmed-only `approval_recorded`/`run_completed`, sticky `effect_unknown`/`recovery_required`, dated lines for an earlier day | events.mjs `historyEvents`, view.mjs `eventTimeText`; packages/control-ui/src/mcp/CompanionCard.tsx, types.ts, companion-figure.d.ts; companion-reading.test.tsx |
| Contract test on shared journal fixtures covering the reader and both consumers | packages/core/test/companion-journal-contract-test.js, packages/core/test/fixtures/companion-journal-fixtures.js (SCN-012) |
| Code Review findings CR-01, CR-03, CR-04 and CR-06 fixed and re-verified | CODE_REVIEW.md; adapter and unit cases |
| Derived artefacts regenerated | plugins/agdf/meta/copilot-payload-baseline.json 462 files / 4,875,947 bytes; docs/compatibility/**; observation 06b80eba |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Root filter in `companion-observe` so the journal signal fires only for new events of this root | outside this UR; current cost accepted by the owner on 2026-11-27 | owner, possible follow-up run |
| Live check in the Claude desktop companion pane and the Codex app | not possible inside this run | owner after install |
| Fresh native Claude CLI compatibility evidence | observations were already stale before this run | owner, native evidence recording |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Contract test 5/5 on shared fixtures | node --test packages/core/test/companion-journal-contract-test.js | single reader, both consumers, Windows root matching | direct |
| Claude companion suites pass | npm --prefix packages/cli run test:claude-companion and test:companion-run-view | Claude pane events, dated lines, transient failure, run-view option | direct |
| Cockpit session 21/21, control-ui vitest 442/442, tsc clean | local runs on Windows | Codex card semantics and types | direct |
| Copilot profile, package contents, plugin MCP runtime, mcp-server, project-read, local validator, CLI modularisation pass | local runs on Windows | runtime projection and packaging | direct |
| compatibility:record and compatibility:check 56/0 on final code | npm run compatibility:record, npm run compatibility:check | contract text change chain | direct |
| CR-01 red before fix, CR-03 shown on base b10fec4a | adapter case and base comparison script | review fixes | direct |
| TP Review, Clean Implementation Review and Code Review pass | TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md | task fulfilment, structure, defects | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Live Claude desktop companion pane and Codex app | warn | owner checks both after the change is installed |
| CI on the PR | warn | runs after commit and PR |
| test:cockpit-core on this host has two host-limit failures (symlink privilege, rename lock under load) | warn | CI or a host with symlink privilege |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Every journal write, also from another project in the same plugin data root, starts one run-view read in each open Claude companion | warn | accepted by the owner on 2026-11-27; root filter in companion-observe as follow-up |
| A run-view process failure (timeout, crash) delays events until the next good read | warn | accepted with the run-view route |
| Only the newest 32 events of the root reach the companion per read | warn | designed bound (SD SDD-001, SDD-003) |
| Branch is stacked on PR #85, which currently conflicts with its base | warn | owner of PR #85 resolves conflicts before merge |

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
- context_graph_evidence: consolidates the existing companion journal reading in its Core owner without a new SoT or owner

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: run-specific evidence stays in the run documents of this Run
- memory_refs: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/

## Next Permissible Step

- next_allowed_action: delivery closeout; commit and PR as instructed in the task
- required_approval: none
- forbidden_until_then: merge of PR #84 or PR #85, release

## Approval

OR does not approve later gates. It records the next permissible step.

## AGDF Approval Summary (de; source=en)

- Ergebnis: Das Companion-Ereignisjournal liest nur noch der Core-Leser; der Claude-Begleiter bekommt die Ereignisse über `run-view`, die Codex-Karte über das Cockpit, beide mit denselben Regeln. Alle Gates von UR bis UAT sind freigegeben, vier Code-Review-Befunde behoben, QA pass.
- Grenzen: Die echte Claude-Pane und die Codex-App sind nicht geöffnet, die CI läuft erst nach dem PR.
- Risiken: Jede Journaländerung startet einen `run-view` je offenem Claude-Begleiter (akzeptiert); bei einem Ausfall von `run-view` kommen Ereignisse verzögert; der Branch baut auf PR #85 auf, der Konflikte hat.
- Nächster Schritt: Commit und gestapelter PR gegen `codex/companion-run-events`.
