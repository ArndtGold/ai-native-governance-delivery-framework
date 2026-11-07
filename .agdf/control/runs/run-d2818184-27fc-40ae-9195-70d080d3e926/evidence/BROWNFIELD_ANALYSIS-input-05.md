# Brownfield Analysis: Companion core in Core (pre-implementation, after the TP source revision of 2026-11-07)

Decision: pass
Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Reviewer: Claude (agent analysis for Arndt Gold)
reviewed_at: 2026-11-07
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Run

- related_prd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/PRD.md` @ sha256:9b959dc9680207e368d8baf7ffb73e942f2e31f409b6cdf45b71dda51414cf66 (approved; AC-002 asks for count and reason also for an unsupported store)
- related_sd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md` @ sha256:4477fc25e6168443d09836806447758454dfa5c45242517044e63964990230fa (approved; SDD-003, SDD-010)
- related_tp: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md` @ sha256:b6ae43b3d50e9f161213fe3e86ead94023877b041772d2c5e4141bb96efb6eac (approved, revision 60; T-004, T-014, T-015, SCN-004, SCN-023, SCN-024)
- source revision: `fbfbe051-c9bb-4443-8346-4e15464ca848` from UAT (proposal `evidence/TP-revision-proposal-02.json`) after the native check `evidence/T-013-NATIVE_CHECK-01.md`
- previous analysis of this TP family: `BROWNFIELD_ANALYSIS-input-04.md` (pass for TP revision 47)
- retained work: the implementation of T-001 to T-012 and the corrections listed in `evidence/CD_TESTS-input-03.md`, plus the code of F1 (`processes($)` wrapper and its two static checks) and F5 (event and notice texts) written on 2026-11-06 after the QA approval

## Objective

Verify the implementation path for the three TP changes before CD+Tests is recorded again: T-004/SCN-004 needs a code change (run-folder count for an unsupported layout); T-014/SCN-023 and T-015/SCN-024 describe code that already exists and needs verification only.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact of the revision |
|---|---|---|---|
| Store diagnosis of the run view | `readRunView` in `packages/core/lib/companion/run-view.js`: an inventory read failure becomes `store: { status: 'unavailable', reason: boundedCode(error) }` | `companion-run-view-test.js` SCN-001 (F09), `run-view-command-test.js` SCN-002 and CIR-05 assert the store object exactly | extend: for `control_layout_unsupported` the store also carries `run_folders` |
| Run folder listing | `discoverCapturedRuns` in `packages/core/lib/control-state/run-state-reader.js` lists the non-dot entries of `.agdf/control/runs`, but only after `readControlLayout` succeeded | `run-state-reader.js` lines 46 to 69; `control-layout.js` throws `AGDF_CONTROL_LAYOUT_UNSUPPORTED` for a config without `control_layout: run-folders-v1` | refactor: move the entry rule into an exported `runFolderEntries(root)` used by discovery and by the run view, so the listing rule keeps one owner |
| Read boundary | `captured(readRoot, project)` with `captureControlScope` and the `control-read/fs.js` readers | QA follow-up CIR-01, RV-01 to RV-03 | reuse: the count runs inside its own captured snapshot through `view.root` |
| Companion snapshot and rendering | `snapshotFromRunView` in `run-state.mjs`, `buildPanelView` in `view.mjs`; the label `messages.unreadableRuns` ("{count} Runs nicht lesbar: {reasons}") already renders unreadable runs of a readable store | `claude-companion-test.js` lines 61, 166, 277 | extend: map `store.run_folders` to the snapshot and render it with the existing label; no new catalog key |
| Host load check (T-014) | `processes($)` in `register.mjs`; static checks in `claude-companion-adapter-test.js` and `claude-companion-integrity-test.js` | red run against the old code; `claude plugin validate` passed on the generated and the installed plugin (2026-11-06) | verify only |
| Event and notice texts (T-015) | `eventText`, `eventRunLabel`, `shortRunId` in `events.mjs`; `noticeText` in `notice.mjs`; label `events.ofRun` | companion suite green after the change; native C6 toasts without run id | verify only |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: one additive optional field in the versioned `run-view/1` store object; the listing rule moves to an exported function of its existing owner; no MCP schema, gate rule or companion write changes
- architecture_evidence: SD SDD-003 (store diagnosis with counts), SDD-010 (companion reads only the run view); TP T-004 names `store.run_folders`
- architecture_missing_evidence: none
- architecture_next_owner_and_action: CD+Tests implements T-004 as described below and re-runs the affected suites

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A second listing of `.agdf/control/runs` in the run view would duplicate the discovery rule (dot entries skipped) | `discoverCapturedRuns` | parallel structure if copied | trade-off avoided: export `runFolderEntries` from `run-state-reader.js` and use it in both places |
| The count reuses `messages.unreadableRuns` instead of a new text | catalog `companion.messages.unreadableRuns` | none | none; the singular form "1 Runs" stays with the wording follow-up F4 |
| `run_folders` counts entries, not readable runs | the layout is unsupported, so no run is parsed | none; the reason states why none is readable | none |

## Implementation Path

1. `run-state-reader.js`: export `runFolderEntries(root)` (non-dot entry names of `.agdf/control/runs`, sorted, empty when the folder is missing or no directory); `discoverCapturedRuns` maps over it after its existing checks, so discovery stays byte-identical.
2. `run-view.js`: when the inventory read fails with `control_layout_unsupported`, count `runFolderEntries` in its own captured snapshot and set `store.run_folders`; a failing count leaves the field out.
3. `run-state.mjs`: carry `store.run_folders` as `runFolders` in the snapshot; `view.mjs`: an unavailable store with a positive count renders `messages.unreadableRuns` with that count and the reason, otherwise the existing reason line.
4. Tests: `companion-run-view-test.js` (F09 count, a legacy-like store with several folders and a dot entry), `run-view-command-test.js` (store objects with `run_folders`), `claude-companion-test.js` (snapshot mapping and rendering with and without count).
5. Rebuild generated assets, re-record the compatibility evidence, run the companion, core companion, command, catalog, payload and host-compatibility suites, `claude plugin validate`, and re-check the legacy store natively (SCN-005).

## Regression Risk And Test Impact

- Discovery behavior: covered by the existing gate-check, status-card golden and inventory suites, which must stay green unchanged.
- The two command tests and the core F09 test assert the store object exactly and change by the one field; no assertion is weakened.
- The native legacy check is repeated after reinstalling the build, because the visible text changes.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no curated node owns the companion, the run view or run discovery

## Decision

- decision: pass
- evidence: approved PRD, SD and revised TP above; repository evidence in the Existing-System View
- missing_evidence: none for CD+Tests
- risks: low; one additive store field and a refactor of the listing rule behind an unchanged discovery result
- required_next_step: implement T-004 as described, verify T-014 and T-015, then record CD+Tests

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP
- forbidden_until_then: none beyond the TP order

## Quality Outlook

- quality_outlook: after CD+Tests the open items are the renewed reviews and QA; the wording points F4 stay a follow-up
