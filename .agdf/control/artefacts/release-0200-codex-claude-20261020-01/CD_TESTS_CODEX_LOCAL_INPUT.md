# CD+Tests actual Codex CLI follow-up

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- source_revision_id: 72c75aee-1d67-4dfb-9966-b54aa3bcf7fd
- date: 2026-10-20
- result_owner: Codex implementation executor

## Result and evidence boundary

The requested Codex CLI observations were performed locally. They expose failures and do not close
release qualification. The existing native producer executed 13 attempts and 10 actual model
sessions using Codex CLI 0.163.0, gpt-6-luna, darwin/x64, Node v22.22.3 and installed AGDF 0.20.0.
The account authentication was copied only into isolated temporary homes and removed by each
completed test. API-key variables were explicitly omitted. All copied authentication paths were
checked absent afterward. No profile or authentication file is part of the retained evidence.

The exact latest five-case repetition failed all five overall cases. Earlier successful native
AGDF calls for dispatch, invalid input and post-upgrade dispatch remain useful observations but
were not reproduced consistently. The required release matrix remains CLI 0.157.1, gpt-6-luna,
native Linux and Windows, with clean exact candidate binding. macOS diagnostics on the dirty local
source cannot fulfill it. No observations are relabeled as release-grade.

Source HEAD remains da8be438b381493f4dbbdfb7f73d3f18c4d440ed, dirty=true. The post-diagnostic manifest
is evidence/CANDIDATE_CODEX_LOCAL_FINAL_20261020.json with candidate ID
d365febfebb362e1ce942324cf087a6ce240d7af3eb451ad3a58b3d067a93b00. It is not a clean pre-execution
candidate. No commit, push, PR, tag, publication, Windows execution or approval mutation occurred.

## Actual native outcomes

| Case | Observed earlier | Latest complete repetition | Bound limitation |
|---|---|---|---|
| dispatch | one actual plugin agdf_dispatch control_result, model and runtime digest observed | no AGDF tool call; model could not find the tool | Tool availability is unstable; cleanup fails |
| failure_case | actual invalid_input returned correctly; initial parser failed to decode diagnostic blocks; targeted repeat passed the purpose assertion | no AGDF tool call | Not stable; cleanup fails |
| skill_continuation | model executed but no AGDF call in every attempt | no AGDF call, no runtime contracts | Required transport/contract observation absent; cleanup fails |
| upgrade | released 0.14.5 integrity, installed baseline and post-upgrade native call observed; foreign data and permission policy preserved | installation upgrade completed but model did not find the tool | No stable post-upgrade usable session; cleanup fails |
| recovery | repair admission failed before model invocation | repair admission still fails; cleanup passes | No post-recovery model session; not a successful recovery |

The retained native index at evidence/CODEX_CLI_LOCAL_20261020/INDEX.json contains all 13 attempts,
the latest cases, and 87 whitelisted capture files with SHA-256/size references. Copied bytes were
verified against every stored digest. Failed attempts were retained separately rather than replaced
by a selected success. Primary model sessions and process outputs are evidence; model PASS prose
and mcp get configuration listings alone are not qualification.

Recovery process evidence returns cockpit_conflict and host_same_key_or_possible_alias after the
owned runtime manifest is deliberately made stale. A discovered test-isolation defect was fixed:
installation/repair commands and the released baseline now use the isolated project cwd rather than
the invoking repository. The final repair report checks only the isolated project and isolated
Codex config; it still rejects the same-key route. Therefore cwd contamination was not the whole
recovery cause, and the production safety boundary remains unchanged.

Deinstallation removed MCP registration, plugin policy and plugin cache. It retained an immutable
MCP runtime protected by executable claims. The actual production inspectors report root_state
protected, retirement_state retained, four claim files in the retained diagnostic profile; see
evidence/CODEX_CLI_LOCAL_20261020/CLEANUP_DIAGNOSIS.json. The facade intentionally retains its
self-owned executable claim when termination cannot be externally confirmed. The native probe's
stricter cleanup condition correctly remains failed. No forced deletion or fake pass was introduced.

## Scoped corrections and verification

The prior parent dispatcher error was invocation misuse: expected_revision_id is accepted for
intake/resume and not for continue_delivery. Omitting that intake-only field returned the correct
implementation continuation for the same selected run. No runtime/schema was altered for this.

The error-result parser now prefers actual structuredContent/structured_content and otherwise
selects the machine JSON content block. A human diagnostic after invalid_input no longer makes a
valid native result unparsable. Regression coverage exercises both structured key forms and a
multi-block native error reply. The harness uses the isolated project cwd for lifecycle commands,
passes it to the released baseline subprocess, and preserves repair-process.json after failures.
A subprocess regression test verifies that baseline execution does not inherit the repository cwd.

- 12/12 qualification tests: pass; evidence/CODEX_CLI_LOCAL_20261020/QUALIFICATION_FINAL.log.
- Native error/report/workflow regression: pass; REGRESSION_FINAL.log in the same directory.
- Existing compatibility freshness: pass, 56 cases / zero unexpected failures; COMPATIBILITY_FINAL.log.
- Native entrypoint syntax and git diff whitespace: pass.

No production permission, cockpit admission, runtime retirement or release acceptance check was
weakened. Source changes are confined to existing probe/parser/lifecycle-helper and necessarily
coupled tests. The earlier complete 159-entry local inventory and preparation evidence remain
historical at CD_TESTS_INPUT.md and its revision-13 receipt; no complete new all-in-one CI run is
claimed after the probe changes. Approved UR/PRD/SD/TP bytes remain unchanged. Foreign artefacts and
the existing Git index were not staged/reset/cleaned by these operations.

## Open gaps and routes

| ID | Classification | Status | Route | Owner and continuation |
|---|---|---|---|---|
| E-001 | evidence_gap | open | evidence_obligation | Maintainer: separately authorized clean shared reference and frozen candidate; prior VCS boundary still applies |
| E-002 | evidence_gap | open | evidence_obligation | Native Codex executor: ten required Linux/Windows observations, 0/10 accepted; exact policy tuple and final candidate required |
| E-003 | evidence_gap | open | evidence_obligation | Remote Windows executor/reviewer: five Claude CLI plus three Desktop Code observations, 0/8 accepted |
| E-004 | implementation_gap | open | CD+Tests | Codex host integration/lifecycle owner: reconcile usable native tool discovery, including unavailable AGDF tools despite configured registration; use retained primary sessions, do not synthesize a call |
| E-005 | implementation_gap | open | CD+Tests | Cockpit/lifecycle owner: resolve supported owned-stale repair versus same-key provenance admission without treating unconfirmed routes as owned; escalate any required safety/design change to its approved source |
| E-006 | implementation_gap | open | CD+Tests | Runtime/lifecycle owner: satisfy teardown evidence while preserving executable-claim safety; no removal of unconfirmed running code merely to satisfy the probe |
| E-007 | implementation_gap | resolved | CD+Tests | Probe owner: native structured-error parsing and actual isolated cwd corrected and regression-tested; repair failure output retained |

T-010 now has real local diagnostic evidence, but its required matrix and successful host behavior
remain incomplete. T-011 mandatory reviews and QA remain incomplete. Keep CD+Tests at revise,
without claiming CR/TP Review/Clean Implementation Review/QA/UAT/OR pass. The report is the actual
CD+Tests result, not a QA verdict or authority to change an approved safety/design statement.
