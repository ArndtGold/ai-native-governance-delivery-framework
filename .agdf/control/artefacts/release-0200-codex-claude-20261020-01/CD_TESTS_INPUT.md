# CD+Tests actual implementation and verification result

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- source_revision_id: 2d9532c6-6b43-49db-b37c-1cebbd0b4f46
- date: 2026-10-20
- result_owner: Codex implementation executor
- scope: approved TP implementation and local verification; native release qualification remains open

## Actual implementation

The coherent 0.20.0 version transaction, canonical host-support policy, generated Codex policy,
content-bound candidate/source/payload inventories, safe released-0.14.5 baseline handling,
Codex/Windows Claude CLI five-case probes, separate Desktop three-case records, reviewed immutable
Windows import, compatibility projection and publication prerequisites are implemented. Codex and
Claude are qualification targets; Copilot and OpenCode remain experimental. Complete history is
fetched for strict release preparation in native/publication jobs. No release tag, publication,
commit, push or remote Windows execution occurred.

Candidate and observation validation require clean source for executable handoff, native host
identity, frozen version/model tuples, actual loaded runtime identity, primary process/model/tool
references, preserved foreign data and measured cleanup. Missing observations cannot be replaced by
templates or deterministic fixtures. Raw Windows captures survive Git unchanged; invalid non-UTF8
bytes remain raw rather than collapsing through text decoding. Coupled current-version test mocks
now use the canonical version; the independently checked historical 0.14.5 schema fixture remains
historical. Experimental integration checks and existing payload/time/history requirements remain.

## Local evidence actually obtained

| Check | Result | Retained evidence |
|---|---|---|
| Canonical release preparation | pass; 49 surfaces, nine profile snapshots | evidence/logs/CLI_PREFIX.log; BUILD_FINAL.log |
| Qualification contracts | pass; 11 tests | evidence/logs/QUALIFICATION.log; MAINTENANCE_FINAL.log |
| Complete canonical CLI inventory | pass; 159 required / 159 covered | evidence/CLI_COVERAGE.json |
| Isolated source/phase matrix | pass; 18/18 deterministic cells | evidence/MATRIX_RESULTS.json; logs indexed below |
| Remaining shared plan / wrapper / pages | pass | evidence/logs/CLI_AFTER_MATRIX.log |
| Final maintenance and affected migration fixture | pass | evidence/logs/MAINTENANCE_FINAL.log; MIGRATION_FINAL.log |
| Final build | pass; 113/113 deterministic skill evaluations | evidence/logs/BUILD_FINAL.log |
| Final adapter compatibility | pass; 56 evaluated, zero unexpected failures | evidence/logs/COMPATIBILITY_FINAL.log; docs/compatibility/HOST_COMPATIBILITY.md |
| Final source and installed runtime integrity | pass; 14 skills, 16 controls | evidence/logs/INTEGRITY_FINAL.log |
| Final diff whitespace check | pass | evidence/logs/DIFF_CHECK_FINAL.log |
| Released 0.14.5 baseline | registry integrity / safe extraction / help startup pass; no native install claimed | evidence/BASELINE_REGISTRY_CHECK.json; logs/BASELINE_HELP.log |
| Byte custody regression demonstration | collision removed; raw and Git CRLF fixture hashes match | evidence/BYTE_CUSTODY_BEFORE.json; BYTE_CUSTODY_AFTER.json |
| Dirty-source handoff rejection | pass; candidate_source_dirty, no output destination | evidence/DIRTY_HANDOFF_REJECTION.json |

The two original all-in-one verify:ci commands stopped at coupled fixture failures and are retained
as failures. Following scoped repairs, execution resumed through the unmodified canonical
verificationPlan / executeVerificationPlan / testInventory owners. The audit accounts for every
CLI inventory entry and the remaining wrapper/pages stages. No successful all-in-one invocation is
claimed. The interrupted UR/TP matrix execution was rerun; two serial and sixteen parallel cells
passed. The source snapshot stayed unchanged throughout that parallel continuation. The final byte
fixes occurred afterward; affected qualification and final shared maintenance/build/integrity were
rerun. These are deterministic local checks, not the required native release observations.

All 34 retained text-log hashes in evidence/LOG_INDEX.json were verified after copying. Native
capture custody is separately byte-exact. The diagnostic candidate ID is
1d7c02407e4ad6d6da35445437095335fcd1f6cfdf5727d6616fe880704ce96b at source HEAD
da8be438b381493f4dbbdfb7f73d3f18c4d440ed, dirty=true. It is not a clean release reference.

## Approved-source and task bounds

The approved UR, PRD, SD and TP digests were rechecked unchanged before this report:

- UR: sha256:2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248
- PRD: sha256:300db93728b59074a42667cb1677d7ec0e01b9ffdaf88e53ecd3b977d1b2cdaf
- SD: sha256:8e1da114cc8454d904017cf63813b5ea8f413b1530f024ec1e9e5f36a334b72a
- TP: sha256:4df6433a55d45e0ed517772f88616993e18b5dd6d6841ea688e93632faefffee

T-001 Brownfield pass was already recorded. T-002 through T-008 implementation and deterministic
coverage are prepared. T-009 local version/build/check work passes, but its clean shared reference
and executable handoff remain open. T-010 native observations are absent. T-011 mandatory reviews
and QA are not complete. Acceptance criteria requiring actual current-candidate native behavior
are not fulfilled by local contract checks. No formal CR, TP Review, Clean Implementation Review,
QA, UAT or OR pass is asserted. Existing index and unrelated core-model handoff artefacts were
preserved; only the approved run's report/evidence files are added here.

## Open gaps and exact continuation

| ID | Classification | Status | Route | Owner / required action |
|---|---|---|---|---|
| E-001 | evidence_gap | open | evidence_obligation | Maintainer: separately authorize scoped VCS handoff under TP boundary; isolate prepared changes, obtain clean shared commit/ref, recreate and validate candidate, then export executable Windows handoff |
| E-002 | evidence_gap | open | evidence_obligation | Codex native CI executor: observe dispatch, failure_case, skill_continuation, upgrade, recovery on native Linux and Windows with pinned 0.157.1 / gpt-6-luna; 0/10 currently accepted |
| E-003 | evidence_gap | open | evidence_obligation | Windows executor: capture/freeze actual CLI, Desktop app and model tuples on the other computer; return five CLI and three separate Desktop Code cases; 0/8 currently accepted; Codex reviewer reviews exact bundle before import and final all-host validation |

The local macOS clients and user's description of current Windows clients provide no exact remote
tuple or native execution proof. Unsupported isolation, missing cleanup, unavailable credentials,
changed candidate/tuple or timeout stop the affected native case and remain visible gaps. No
blanket remote access, messaging, credential movement or extra model spend is authorized by this
report. After the native matrix is complete, record fresh CD+Tests evidence and follow the existing
mandatory review/QA sequence. This revise decision is the actual CD+Tests result, not a QA verdict.
