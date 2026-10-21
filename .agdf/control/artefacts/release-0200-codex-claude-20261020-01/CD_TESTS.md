# CD+Tests: durable Codex blocker repair and actual CLI repetition

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- source_revision_id: 6222e5be-e467-4686-8eca-48a37a7c2a09
- date: 2026-10-21
- result_owner: Codex implementation executor

## Result and identity

The three reported Codex implementation blockers are repaired in their existing owners. The final
five-case native CLI repetition passes, including strict actual removal in every case. This is
bounded local diagnostic evidence: Codex CLI 0.163.0, gpt-6-luna, darwin/x64, Node v22.22.3,
installed AGDF 0.20.0. It does not fulfill the approved release matrix.

The candidate was frozen after final generation, deterministic compatibility and package build,
before these five sessions: eae8e25426de427bccfe335bb9f99132d7be4cc5a1606066061067e6fe1dbccb. See [candidate](evidence/CODEX_BLOCKER_REPAIR_20261021/CANDIDATE_FINAL_V4.json),
[audit](evidence/CODEX_BLOCKER_REPAIR_20261021/AUDIT.json) and [all attempts and 188 hashed files](evidence/CODEX_BLOCKER_REPAIR_20261021/INDEX.json).
Source HEAD remains da8be438b381493f4dbbdfb7f73d3f18c4d440ed, dirty=true. The installed source/runtime identities
match the candidate in all five records. Primary tool captures independently match the immutable
dispatcher digest 602c03f9d5348230ff77caf9c2fb2c870a6385ad84ece5e2e8b6ae15b9e900d0 where the request reaches the runtime.
The defined invalid-input case is rejected before runtime dispatch.

## Durable corrections and retained safeguards

1. Tool inventory: the existing Codex origin and native-session owners now wait for MCP startup
   within each server's existing startup timeout, using the invocation-only setting
   mcp_optional_startup_grace_ms=0. Independent child sessions strip inherited session/connector
   routing identities, while retaining sandbox, network, approval and authentication settings.
   The origin observer polls starting connections inside its existing 45-second bound and requires
   the actual app-server exit. No global user setting or server timeout is raised. The portable
   plugin schema remains unchanged. See the [official MCP documentation](https://developers.openai.com/codex/mcp).
2. Supported owned-stale repair: the existing marketplace owner can prove one damaged runtime
   manifest against the exact native cached installation. It reconstructs the original bytes only
   in a bounded private copy, verifies the full original owned payload hash and provenance, and
   rechecks the observed source before the existing transaction. Foreign, aliased, cancelled,
   duplicate or unidentified providers remain rejected. Exact native plugin identity is still
   required. Recovery keeps rollback until a fresh strict native connection qualifies, with no
   repair exception at that final check.
3. Runtime teardown: a launcher-side owner directly supervises its SDK facade and keeps the
   executable claim until token-bound cleanup acknowledgement AND the actual successful child exit.
   This also covers a host killing its direct launcher. Confirmed claim release retries only a
   verified live publication-lock owner within the existing claim bound. Unknown ownership,
   missing/wrong acknowledgement, abnormal exit and uncertain work remain protected. Global
   removal observes the existing claim owner and retires eligible generations through the canonical
   publisher-locked transaction. Enclosing directories are removed only when empty, so concurrent
   publication survives. Canonical paths are retained, including macOS temporary-path aliases.

Further Recovery repetitions exposed two startup/teardown gaps within blocker E-006. The launcher checks the full dispatcher
manifest digest before runtime publication, claim acquisition or SDK execution. A real subprocess
regression checks both ordinary startup and --prepare against an already cached SDK: rejection,
no protocol output, no new executable claim, and the existing runtime remains eligible. A separate
gap persisted when an inventory connection ended before MCP initialize: the SDK had not created a
server instance, so the prepared executor/generation had no instance-driven closer. The STDIO owner
now closes that exact prepared composition even without a client instance and still requires its
actual child exit and zero occupancy. The main closer is idempotent and also handles already-ended
input. Launcher/owner shutdown now queues token-bound private IPC requests through SDK bootstrap,
instead of forwarding a signal before the child has installed its handlers. Requests arriving
before the serving handle exists remain pending until that exact handle can close. Real assembled
subprocess regressions terminate and SIGKILL the host launcher immediately after claim acquisition,
before client initialization; cleanup acknowledgement and actual exit remain mandatory. The test
expects Windows to report forced SIGTERM termination of the host launcher, as documented by
[Node 22](https://nodejs.org/download/release/v22.22.3/docs/api/process.html#signal-events), while
still requiring acknowledged actual SDK exit. Native Windows qualification remains unverified. An actual assembled SDK subprocess with no initialize call verifies confirmed cleanup and
an eligible runtime. These changes strengthen admission and resource ownership. Failed native-removal
profiles are now preserved automatically for diagnosis; copied authentication is still removed.

The final native-only leak was in the discovery owner's context lifetime. A filtered Cockpit
inventory could finish while the sibling governance connection was still handshaking. The observer
now collects the complete inventory of its same ephemeral context, waits for pending connections
inside the unchanged 45-second bound, and only then projects the requested provider subset. A
regression starts with a connected Cockpit and connecting governance sibling and rejects premature
host closure. Another regression refuses an inventory arriving with no remaining teardown budget.
The repair postcondition now requires an explicitly observed owned connected provider; mere
admission or provider absence cannot commit the repair, and the actual rollback bytes are tested.

The retained diagnostic comparison records a narrow-observer facade exiting abnormally without
its child's close receipt. After complete-context discovery, all twelve instrumented claims receive
their actual owner release. The separate uninstrumented lifecycle confirmation also passes ordinary
repair and removal. These zero-model diagnostics explain the defect; they are not counted as final
model observations. The final five cases below use the normal executable/environment, without the
temporary observation module or Node wrapper. One invalidated diagnostic overlapped generation;
the unchanged integrity check rejected the mixed payload. Its failure is preserved separately.


No SDK integrity check, three-slot limit, uncertain-effect protection, cockpit ownership check,
hook trust, tool consent, gate approval, native platform/model pin or release validator was weakened.
The observed installation/repair state remains mcp_ready_hook_review_required; that unresolved hook
review is reported, not converted into hook trust. Only the existing installer-owned agdf_dispatch
consent is used in the isolated profile.

## Actual final observations

| Case | Result | Primary observation | Native directory |
|---|---|---|---|
| recovery | pass | one actual gpt-6-luna call; full owned removal | codex-host-e2e-20261021-085519 |
| dispatch | pass | one actual gpt-6-luna call; full owned removal | codex-host-e2e-20261021-085751 |
| failure_case | pass | one actual gpt-6-luna call; full owned removal | codex-host-e2e-20261021-085920 |
| skill_continuation | pass | one actual gpt-6-luna call; full owned removal | codex-host-e2e-20261021-090021 |
| upgrade | pass | one actual gpt-6-luna call; full owned removal | codex-host-e2e-20261021-090120 |

Each case has one observed model, one actual plugin-owned AGDF call and process/capture references.
The failure case returns invalid_input. Fortsetzung returns the actual quality and context-graph
contracts with verified digests. Upgrade and Recovery use the integrity-verified published 0.14.5
baseline, preserve the foreign sentinel and permission settings, and demonstrate fresh access.
Recovery also records the owned stale-manifest repair. Every removal has exit 0 and no remaining
MCP listing, MCP config section, plugin tool policy, plugin cache or plugin runtime directory.

All 19 local attempts from this repair day are retained, including intermediate
failures and earlier successful purpose calls with failed removal. They are not relabeled as the
final candidate. [Prior protected Recovery state](evidence/CODEX_BLOCKER_REPAIR_20261021/RECOVERY_PRIOR_DIAGNOSIS.json) retains
the observed four claims without forced deletion. The final index contains only whitelisted
redacted observations, process/primary captures, candidate records and test logs; no profiles or
credentials. Every copied auth path is absent, and every indexed byte digest was rechecked.

## Verification

- Final launcher/runtime regression: real assembled STDIO discovery, orderly EOF, host SIGKILL,
  token/exit safety, live-lock contention, unknown-lock preservation, expired shared monotonic
  deadline and invalid-manifest startup refusal pass.
- Retention/lifecycle/Codex ownership tests pass: active and legacy protection, concurrent
  publication during retirement, strict repair/cache tamper rejection, native provider identity,
  session isolation and security-setting preservation.
- Shared Claude plugin and cockpit variants pass after the final launcher change; Codex exact-tool
  consent and its revocation pass. Copilot and OpenCode remain experimental.
- Final MCP generation, both protocol eras, host skill-name parity, typed errors, isolation/cancellation,
  abandoned-worker locks, provenance, package boundaries and exact packed archive smoke pass.
- Maintenance contracts, final 12-case release qualification and native-evidence rejection
  regressions pass. Final build passes with 113/113 deterministic skill evaluations and prepared
  CLI/MCP archives. Final deterministic compatibility: 56 evaluated, zero failures, fingerprint
  d794f629189285afe15ce9c7aba711d1488c4395b68f806c63ee8ab6ceffc4f1.
- The common executable-owner closure adds two files to the shared runtime-enabled payload.
  The existing payload-budget owner accepted the exact measured 397 files / 3,488,492 bytes,
  including the early-admission guard, queued bootstrap shutdown and uninitialized-transport cleanup, with no spare allowance. The existing portable
  schema, profile/history and payload checks pass; experimental-host coverage remains present.
- Approved UR/PRD/SD/TP hashes match their prior bindings. Git diff whitespace passes. Existing
  staged files and unrelated core-model handoff artefacts were not staged, reset or cleaned.

Component logs are in evidence/CODEX_BLOCKER_REPAIR_20261021/logs. The earlier 159-entry shared CLI inventory remains historical
preparation evidence. No new complete verify:ci invocation is asserted after the production fixes.
No commit, push, PR, tag, publication, remote Windows execution or human approval was performed.

## Open obligations and routing

| ID | Classification | Status | Route | Owner / next action |
|---|---|---|---|---|
| E-001 | evidence_gap | open | evidence_obligation | Maintainer: separately authorized clean shared reference and frozen release candidate; approved VCS boundary remains |
| E-002 | evidence_gap | open | evidence_obligation | Codex native executor: ten required Linux/Windows observations with CLI 0.157.1 / gpt-6-luna and exact release candidate, 0/10 accepted |
| E-003 | evidence_gap | open | evidence_obligation | Other Windows computer/executor/reviewer: five Claude CLI and three Desktop Code records with actual frozen app/CLI/model tuples, 0/8 accepted |
| E-004 | implementation_gap | resolved | CD+Tests | Codex inventory/session owner: final five-case CLI series demonstrates usable actual plugin calls |
| E-005 | implementation_gap | resolved | CD+Tests | Marketplace/admission owner: supported owned-stale repair and fresh strict connection demonstrated; foreign/tamper negatives remain enforced |
| E-006 | implementation_gap | resolved | CD+Tests | Runtime/lifecycle owner: final five removals pass; invalid-source pre-admission and acknowledged real-exit retention regression pass |
| E-007 | implementation_gap | resolved | CD+Tests | Earlier structured-error and isolated-cwd correction retained and regression-tested |

The unchanged formal release validator rejects these actual local records with
candidate_source_dirty. The tuple also remains outside the required native Linux/Windows policy.
No macOS record is imported as release qualification. CD+Tests therefore remains revise for the
unfulfilled release evidence. Mandatory TP Review, Clean Implementation Review, CR, final QA,
human UAT and OR remain incomplete. This actual implementation report grants none of them.
