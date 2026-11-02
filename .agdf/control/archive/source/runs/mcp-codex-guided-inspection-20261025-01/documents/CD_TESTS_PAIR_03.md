# CD+Tests: final native flow passes; test-stream correction needs scope renewal

Decision: revise
Gate: CD+Tests
Date: 2026-10-25
Owner: Codex

## Scope and actual completion

Current TP sha256:094ac6cef506aa40ccfb04cfc88056420c15f65963d650847f27d1c3bdcd04bb was deliberately approved at revision 24. Fresh implementation-preparation Brownfield Analysis passed at revision 25. Exact current UR/PRD/SD and post-UR Review remain retained. This report is implementation/test evidence, not QA or user approval.

The current fixed product/harness/test/task sources were rechecked against all nine TP source rows and actual assembled Core, locked SDK manifests/runtime digest and UI assets. New frozen-candidate.json contains 19,339 files. Compared with the old 19,336-file passing snapshot, only the previously reviewed 17 canonical changes differ; three new frozen paths are the guard helper and two content-addressed compatibility observations. No product/harness/test/audit source changed during this approved renewal.

All 24 scenarios were reassessed in evidence/qualification/pair-guidance-01/applicability.json. Current pair-* checks establish 247,003 equivalent SDK cases, 160 frozen Core outcomes, original 24-input/15-error replay, actual installed CLI rendering of all 14 fields/11 operations and explicit pairing comments, CLI and both SDK/STDIO protocols, normal canonical build and 56 deterministic compatibility cases, source/assembly/provenance, profile/budgets and original fixed performance. Unchanged full MCP/Core subpaths and exact guard-integration-03 input/coverage remain applicable after the documented assessment. No complete old-suite pass label is automatically transferred.

Current measured limits remain Inspect 4,993 <=5,000 bytes, command aggregate 23,254 and command/decision aggregate 24,509 <=24,576, each command <=8,192 and input/output 65,536/1,048,576. Copilot is 397 files/3,509,461 bytes at its unchanged ceiling. Original fixed-fixture current p95 is 701.422 ms cold and 426.184 ms warm against 1,500/1,000 ms. No baseline, limit, predicate or required coverage was changed.

626 selected prestudy originals and retained bytes, original two real observations/ledgers, all prior failures and source-revision archives are preserved. Fresh current preparation/retention/applicability/freeze and launcher review are in evidence/qualification/pair-guidance-01. The Run-local launcher adapted paths/current bindings and truthful counters only; the existing T7 entry remains sole reservation/one-profile/controller owner.

## Fresh native qualification: pass 2/2

The new integrated protected preflight passed with zero model calls, expected host/account/discovery, real Root/config append-open denials and permitted owned temporary write/read, matching current source/policy and unchanged snapshots. It reserved no session.

Exactly one new cohort then executed exactly two additional authorized sessions, distinct from the old two consumed slots. Model and observed effort are gpt-6.1-sol/low, Codex CLI 0.163.0, Node 22.22.3 on darwin x64. Both original and strict predicates pass with one intended UR approval, complete traces, no detour/shell or invalid/is-error/AGDF-failure result. Every separate host/control/discovery/isolation check passes.

| New session | Original/strict success | MCP calls | SDK/other errors | model wall time |
|---|---|---|---|---|
| pair-guidance-01/native/session-01 | pass/pass | 4 | 0 | 29,679 ms |
| pair-guidance-01/native/session-02 | pass/pass | 4 | 0 | 28,541 ms |

Controller/launcher qualified:true; full frozen candidate and original Root/control/settings/staging were equal before/after, checked before import. Policy SHA remains 7aec332955219d99dba2bc6784417a8afc61882c357cbf082f328b9c738685f4. Original and new exclusive ledgers/events are separate; original ledger digest is unchanged. Total real sessions in this Run are exactly four (two prior plus these two); no third new or replacement session, retry/resume or other model was launched. The cohort completed in approximately 134.2 seconds, within the unchanged 25-minute bound. Native proof is bounded to this exact normal T7 tuple/workflow, not other hosts or a human viewing claim. Permission-denial/cost estimates remain unavailable where originally reported; successful configured existing-account flow and raw counters are retained, not guessed.

No credentials copy/login/config/plugin/usage-reset operation or extra API-spend authority was used. Parent/worker outputs stayed in the isolated candidate during comparison. Exact original observations/events/rollouts/effective configuration/final-response and retention manifests are preserved under the new namespace. Broad prior complete:true observations and prior PRD 1/2 outcome are untouched and are not substituted for these two fresh successes.

## Concrete remaining defect and explicit scope boundary

A final model-free inspection of the changed test's unsupported-platform branch found that scripts/native-probes/codex-command-task-test.mjs expects T7_GUARD_APPLICATION_UNAVAILABLE in result.stdout. The unchanged controller correctly throws before any account/model action on a non-darwin platform; Node reports this on stderr. A process.platform=linux simulation of the actual current entry on darwin returned exit 1, empty stdout and the expected typed guard error on stderr. This is a branch/stream diagnosis, not native Linux qualification. No real model or protected write was attempted.

The actual one-line proposed correction changes only that negative test assertion from result.stdout to result.stderr. It preserves nonzero exit and exact guard-error assertions; it neither weakens a predicate nor changes product/runtime/guard/task/parser/audit. The captured actual stderr matches the proposed assertion. The patch is prepared but not applied, so all frozen current source hashes remain exact.

The current approved TP explicitly says: "Keep all seven current product/test/guard files above unchanged in this qualification renewal" and "Unplanned product/harness/test/audit changes are not authorized by this TP." Its Out Of Scope also excludes new test changes. Therefore the necessary test-only repair cannot silently be performed under this frozen qualification scope. The earliest changed approved source is TP's concrete test-edit boundary. UR/PRD/SD acceptance/design and every model/size/time/protection limit remain unchanged. No further real model session is requested or required by the proposed repair; current native runtime proof must be reassessed against unchanged runtime/guard/task/audit source after the test-only edit, not rerun or relabeled automatically.

Evidence: evidence/qualification/pair-guidance-01/non-darwin-stream-diagnostic.json, test-stream-followup.json and proposed-non-darwin-stream-fix.patch. No source test file or original observation was changed to make this diagnostic pass.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CGI-NATIVE-FINAL-01 | evidence_gap | evidence_obligation | resolved | Current pair-guidance-01 native-summary qualified:true; two original/strict successes each 4 calls/0 error; complete bound traces, host/control/source/isolation and before/after comparisons | none; retain exact qualified evidence and limits |
| CGI-TEST-STREAM-01 | implementation_gap | CD+Tests | open | Changed non-darwin negative test asserts stdout; actual current guard-unavailable branch emits typed error on stderr; captured model-free diagnostic and exact unapplied one-line patch | Obtain the existing TP owner's bounded test-only scope renewal, apply the prepared stderr assertion, verify affected model-free tests and reassess unchanged-runtime native applicability; zero additional real models |

## Next permitted step

Prepare a read-only TP source-revision preview for the single test-only correction and zero additional real sessions. Retain exact upstream approvals, current post-UR Review, all original/native proofs and actual outcomes. Reassess TP-bound preparation/quality and native runtime applicability under the renewed narrow scope. Source revision and later new TP approval remain deliberate human actions; do not infer them or silently modify the explicit current test freeze. Formal TP/Clean/Code reviews and sole QA assessment remain mandatory after the scoped defect is resolved; no QA pass, UAT, installation, publication or Git handoff is claimed.
