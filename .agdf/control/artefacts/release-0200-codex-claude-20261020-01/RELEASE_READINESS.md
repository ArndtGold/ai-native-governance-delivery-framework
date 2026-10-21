# AGDF 0.20.0 release readiness

Date: 2026-10-21
Run: release-0200-codex-claude-20261020-01
Status: three Codex implementation blockers repaired; final local CLI diagnostics 5/5 pass; native release qualification pending
Gate authority: none; this report does not approve QA, UAT, OR or publication.

## Prepared scope

- One canonical 0.20.0 version transaction covers the CLI, wrapper, MCP package, plugin profiles,
  dependent manifests and public version surfaces. Registry preflight found all three intended npm
  package versions available. No package was published.
- The canonical plugin definition owns release support intent and host policy. Codex and Claude
  are qualification targets; Copilot and OpenCode remain experimental. The Codex policy file is
  generated from that definition; the existing client/model pins remain unchanged.
- Candidate inventories bind relevant source, lockfiles, policy, validation/probe code and prepared
  package bytes. Dirty candidates remain diagnostic. Evidence-only imports preserve tested content
  identity; final Codex results still require the exact release CI commit.
- Native CLI probes partition dispatch, failure_case, skill_continuation, upgrade and recovery.
  Primary model/tool events, installed/runtime identities, measured cleanup and frozen tuples are
  required. Released 0.14.5 is downloaded with registry integrity verification for transitions.
  Native preparation jobs fetch complete history/tags for the existing strict release-history checks.
- Separate Windows Desktop Code records require a fresh coding session, actual loaded identity,
  AGDF access, cleanup, transition facts where applicable, and hashed native/capture references.
  Templates start unverified. CLI results cannot satisfy Desktop cases.
- Reviewed Claude imports validate contained references and the exact reviewed bundle before
  immutable import, then project only measured claims through the existing compatibility producer.
  Every publication path depends on the required Codex and Claude evidence validation.

The Windows execution and return instructions are in
[release-0.20.0.md](../../../../docs/maintenance/release-0.20.0.md).

## Earlier preparation verification (2026-10-20)

| Check | Current result | Evidence |
|---|---|---|
| Canonical release preparation | Pass; 49 version surfaces at 0.20.0; nine profile snapshots | release preparation log |
| Candidate/evidence/lifecycle contracts | Pass; eleven tests, including missing/forged evidence, tuple drift, unexpected native tools, exact checkout/CI SHA, immutable import, unsafe paths, source/payload changes and unverified Desktop templates | qualification log |
| Release workflow and legacy-evidence rejection | Pass | full verification maintenance stage |
| Four-host deterministic compatibility | Pass; 56 evaluated, zero unexpected failures | compatibility report and log |
| Package build | Pass; 113/113 deterministic skill evaluations | build log |
| Community documentation fixture | Pass; baseline and 29 negative contracts after adding the new linked document to the fixture | community log |
| Released 0.14.5 artifact | Integrity, safe extraction and package identity pass; no native installation claimed | evidence/BASELINE_REGISTRY_CHECK.json |
| Complete shared CI plan | Pass through documented canonical staged/resumed execution; CLI inventory 159/159, including 18 isolated cells; wrapper/pages stages pass | [CLI_COVERAGE.json](evidence/CLI_COVERAGE.json), [LOG_INDEX.json](evidence/LOG_INDEX.json) |
| Final maintenance, build, compatibility and runtime integrity | Pass; source and installed runtime integrity cover 14 skills and 16 controls; diff whitespace check pass | evidence/logs/*_FINAL.log |
| Native release matrix | Pending; no current-candidate observations accepted | Inventory below |

The two all-in-one verification attempts stopped at coupled fixture issues: the community fixture
omitted the new README link target, then a current-version mock retained 0.14.5. After the targeted
repairs, execution resumed through the existing shared planner and inventory. All 159 required CLI
entries are accounted for, including all 18 isolated source/phase cells, and the remaining wrapper
and pages stages passed. Final maintenance, affected migration fixture, compatibility, build and
runtime integrity checks passed after the last implementation changes. This is a complete audited
local inventory execution; neither earlier all-in-one invocation is reported as a successful run.
The 34 retained logs have a digest index; all stored hashes were rechecked.

Further checks found current-version mocks still fixed at 0.14.5 in inspection, migration, repair,
MCP-lifecycle and OpenCode tests. These now use the canonical current version. The historical
request-activation host-schema test instead retains its own independently checked 0.14.5 run version
and rejects later-release completion records; its historical schema and unavailable matrix were not
edited. The request-activation corpus source fingerprint was recomputed through its existing owner
after review of the version/host-support metadata change. Its 39 deterministic cases pass; old
behavioral/native observations were not relabeled or regenerated.

Byte-custody tests demonstrated and fixed two defects before native use: invalid non-UTF8 byte
sequences without NUL could collapse through text decoding, and Git's global LF policy changed
imported Windows CRLF log bytes. Non-UTF8 inputs now remain byte-exact, and the native evidence
directory has a narrowly scoped `-text` rule. Tests verify the actual Git blob, a fresh checkout and
the complete post-checkout evidence validator. Raw and Git-stored fixture hashes now agree.

The 18 isolated source/phase cases passed through the canonical CI inventory in serial/parallel
execution; the 16 parallel continuations retained the same source snapshot throughout that portion.
They exercise owned deterministic fixtures
and do not count toward any of the 18 native host observations below.

The exact measured Copilot payload budget changed from 3,475,653 to 3,476,904 bytes for version and
host-policy/history metadata, with the same 395-file budget inventory and no spare allowance.
The existing payload-budget owner recorded that assessment. Experimental-host coverage was retained.

## Native obligations

| Surface | Required | Accepted for this candidate | Status |
|---|---|---|---|
| Codex CLI, native Linux; 0.157.1 / gpt-6-luna | Five cases | 0 | Pending |
| Codex CLI, native Windows; 0.157.1 / gpt-6-luna | Five cases | 0 | Pending |
| Claude CLI, native Windows on the other computer | Five cases | 0 | Pending |
| Claude Code in Windows Desktop app | Session, upgrade, recovery | 0 | Pending |

The Windows app/CLI versions and actual model remain to be captured and frozen by preflight on
that computer. The user's description of current installed clients is context, not an exact native
tuple. Local macOS clients and deterministic fixtures do not satisfy these observations.

## Task execution status

| Tasks | Actual state | Remaining obligation |
|---|---|---|
| T-001 | Recorded Brownfield preparation pass; unrelated work/index baseline preserved | None for this preparation |
| T-002–T-008 | Scoped implementation, documentation, deterministic contract coverage and compatibility integration prepared | Actual native behavior remains subject to T-010 |
| T-009 | Version, build and complete local verification pass | Authorized clean source/ref and executable handoff |
| T-010 | Local macOS diagnostics executed; required Linux/Windows matrix not executed | Ten Codex, five Claude CLI, three Desktop observations; reviewed return/import and final all-host validation |
| T-011 | Not completed | Required reviews and final QA against fulfilled current evidence; no QA pass while native obligations remain open |

## Concrete next action and boundaries

Obtain the separately authorized VCS handoff to a clean shared candidate/ref. TP section "Evidence, VCS and publication boundaries" expressly excludes
autonomous commit/push/tag. Preserve the unrelated core-model handoff artefacts and existing index.
Recreate the clean candidate manifest, export the Windows handoff, execute native Codex CI and the
remote Windows cases, review/import the returned files, and validate the complete 18-case matrix.
Then finish the required review/QA sequence with the actual results.

No current clean release SHA, native qualification, completed human acceptance, commit, push,
tag, marketplace submission or publication is asserted by this preparation.

## Earlier preparation diagnostic identity

- Candidate content ID: `1d7c02407e4ad6d6da35445437095335fcd1f6cfdf5727d6616fe880704ce96b`.
- Source HEAD: `da8be438b381493f4dbbdfb7f73d3f18c4d440ed`; dirty: true.
- [CANDIDATE_DIAGNOSTIC.json](evidence/CANDIDATE_DIAGNOSTIC.json) is diagnostic and grants no native qualification.
- Actual handoff rejected it with `candidate_source_dirty` and created no destination: [negative result](evidence/DIRTY_HANDOFF_REJECTION.json).
- The matrix snapshot predates the final byte-custody corrections; affected qualification tests and
  final shared maintenance/build/integrity were rerun. It is not relabeled as native evidence for
  the diagnostic identity. The current exact clean native candidate still has to be created.

## Actual Codex CLI diagnostics after the preparation

The dispatcher continuation call is corrected: expected_revision_id belongs to intake/resume, not
continue_delivery. The bound run returned implementation continuation at revision 13; no gate approval
was repeated or changed.

On 2026-10-20 the existing native harness executed 13 attempts and 10 real model sessions with Codex
CLI 0.163.0, gpt-6-luna, macOS darwin/x64, Node v22.22.3, installed AGDF 0.20.0 and existing ChatGPT
account authentication in isolated profiles. API-key variables were removed from the test invocation.
All five case types were exercised, with failed attempts preserved. Copies of authentication files
were absent afterward, and no profiles or credentials are included in the retained evidence.

[Actual attempts and 87 hashed references](evidence/CODEX_CLI_LOCAL_20261020/INDEX.json).
The latest complete five-case repetition has no passing overall case. Earlier successful dispatch,
invalid-input and post-upgrade tool calls are not a stable qualification: later sessions reported no
AGDF tool in their available inventory. Skill continuation never obtained the required AGDF call.
The retained stdout and session captures support this diagnosis; a configured mcp get declaration
alone did not establish a usable tool in those model sessions.

Recovery failed before model invocation. The repair process returns cockpit_conflict /
host_same_key_or_possible_alias after the owned runtime manifest is made stale. Correcting the
harness working directory removed main-repository configuration from the checked sources, but did
not remove that same-key safety rejection. The existing safety owner was not bypassed.

[Cleanup diagnosis](evidence/CODEX_CLI_LOCAL_20261020/CLEANUP_DIAGNOSIS.json) confirms a protected
immutable runtime with four executable claims. Deinstallation removes registration, plugin policy
and cache but preserves that protected runtime by design; the stricter native cleanup requirement
therefore remains failed. No claim was forcibly removed to make the test pass.

Narrow harness fixes now decode the actual structured error report instead of joining it to a human
diagnostic, run lifecycle commands and the released baseline from the isolated test project, and
retain a redacted repair-process report. Final checks pass: 12/12 qualification tests, native error-
report regression tests, existing 56-case compatibility freshness check and diff whitespace check.
The earlier full inventory remains historical local evidence; it was not rerun or relabeled after
these probe-only fixes.

Latest dirty diagnostic candidate: d365febfebb362e1ce942324cf087a6ce240d7af3eb451ad3a58b3d067a93b00
([manifest](evidence/CANDIDATE_CODEX_LOCAL_FINAL_20261020.json)). This is a post-diagnostic snapshot,
not an exact clean candidate validated before the native attempts. The approved Codex release matrix
still requires CLI 0.157.1 with gpt-6-luna on native Linux and Windows, a clean exact candidate and
passing evidence. Accepted release observations remain Codex 0/10, Claude CLI 0/5 and Desktop 0/3.
CD+Tests stays revise; CR, QA, UAT and OR remain incomplete.

## Codex blocker repair and final local repetition (2026-10-21)

The three implementation gaps E-004/E-005/E-006 are resolved for the measured local tuple.
All five cases pass with Codex CLI 0.163.0 / gpt-6-luna on darwin/x64, including full native
deinstallation. Recovery now rejects damaged dispatcher bytes before executable claims are acquired,
then uses the verified owned repair and a fresh strict connection. Unknown executable use remains
protected. Prior failed attempts are preserved.

[Current detailed implementation/test report](CD_TESTS_CODEX_BLOCKER_REPAIR_INPUT.md),
[final candidate](evidence/CODEX_BLOCKER_REPAIR_20261021/CANDIDATE_FINAL_V4.json),
[primary-evidence audit](evidence/CODEX_BLOCKER_REPAIR_20261021/AUDIT.json),
[all attempts and hashed references](evidence/CODEX_BLOCKER_REPAIR_20261021/INDEX.json).

The final candidate is eae8e25426de427bccfe335bb9f99132d7be4cc5a1606066061067e6fe1dbccb; source HEAD da8be438b381493f4dbbdfb7f73d3f18c4d440ed, dirty=true.
Build (113/113 skill evals), final launcher/shared-host regressions and deterministic compatibility
(56/56) pass. Final MCP protocol, generation, safety, provenance and packed archive checks pass, including
confirmed cleanup without client initialization. The exact shared payload budget is now 397 files / 3,488,492 bytes.
Earlier full-inventory claims above remain dated preparation evidence.

The formal release validator still rejects the local candidate as candidate_source_dirty.
The required pinned Linux/Windows Codex matrix and the other computer's Windows Claude CLI/Desktop
records remain open: accepted release observations are still 0/10 and 0/8. CD+Tests remains revise;
reviews, QA, UAT and OR remain incomplete. Copilot and OpenCode remain experimental.
