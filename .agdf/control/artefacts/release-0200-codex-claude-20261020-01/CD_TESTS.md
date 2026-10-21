# CD+Tests: Windows owner lifetime, evidence binding and native Claude CLI observations

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- source_revision_id: 06bf1cb3-921a-420a-9ee4-b5904c69e73c
- date: 2026-10-21
- result_owner: Claude Code implementation executor

## Result and identity

Five native Claude CLI release cases pass on Windows, and the release validator of the candidate
checkout accepts each record. This completes the CLI part of the Claude matrix (5/5). It is not yet
reviewed or imported: import requires the complete Claude matrix, including three Windows Desktop
Code records (0/3). Codex native Linux/Windows remains 0/10.

- Candidate: 5961f3913205b6c741e16b44a85849ad65fbbbc2eafa33ccb7e627128a5dc7ea, validated clean
  against its checkout before and after execution.
- Source: bbeae23ecea52f76c1efb0c28c70f914b4ad6f0a, dirty=false; head of pushed PR #27
  (codex/fix-windows-mcp-owner-lifetime), not merged.
- Tuple: claude / cli / win32 / x64, Claude Code 2.1.302, claude-sonnet-5-5, Node v22.22.3;
  tuple digest 6d128179ec098bd0d52149937d0864fbe845bd740a5f49af7f53341ab916aa4a. The Claude policy
  pins no client version or model; the model was chosen by the executor and frozen by preflight.

Claude records bind candidate content, not the commit SHA. They remain valid after a merge only
while the candidate content stays identical.

## Changes since the previous record

Base: 4a50cd1e349665ef4ec5f91d8c3181a40c91c514 on main. The push run of that commit failed two
Windows jobs (Packages Win22 1of2, MCP Win22 5of5) with "the direct owner must acknowledge and
observe facade exit even after its host launcher is killed".

1. b9964037, cc58c4af, a8814e13 (PR #27, Codex lane): the facade owner is detached on Windows
   too, so libuv no longer kills it with its launcher; SIGTERM after initialization is covered;
   compatibility evidence refreshed; Windows MCP CI partitions rebalanced from measured durations
   with unchanged deadlines.
2. 486b1965: the facade fork passes windowsHide. A detached Windows owner has no console, so
   Windows opened a visible console window for every facade. Measured with the real launcher:
   visible without the flag, hidden with it. The kill-mode regressions keep the inherited stdin
   open, so shutdown is proven through the private channel instead of MCP EOF.
3. bbeae23e: native evidence tooling.
   - Claude CLI delivers an MCP error reply as one string: the machine report, then a human
     diagnostic. The Claude parser now extracts the report, as the Codex trace already did.
   - Native calls report the digest of the MCP generation's dispatcher projection
     (digestPluginMcpDispatcherSource), not the plugin runtime manifest digest. The candidate
     identity now carries identities.mcp_dispatcher, and the validator compares executed calls
     against it. Before, every real native record failed native_executed_runtime_mismatch,
     including the earlier Codex diagnostics; the fixtures hid this by equating both digests.

Retained safeguards: payload budget unchanged (max 397 files / 3,488,492 bytes; measured below it).
The packaged-app install refusal, credential copy and removal, tuple and model checks, reference
digests and every other validator condition are unchanged. Copilot and OpenCode remain
experimental.

## Verification

On this Windows computer unless noted:

- plugin-mcp-runtime-test: all five real facade modes pass on win32, with stdin kept open after a
  launcher kill (99 s). mcp-runtime-retention, mcp-tool-errors (222 cases) and payload-budget
  tests pass.
- Release qualification 12/12 (release-candidate, release-handoff, release-lifecycle) and
  release-evidence-test pass. Counter-check: the new tests fail against the previous parser and
  against the previous validator.
- The real Windows failure_case capture now decodes as invalid_input.
- compatibility:record/check 56/56 and test:host-compatibility (68 checks) pass for each source
  change. The snapshot was recorded on Windows, so the deterministic rows now name Windows.
- git diff --check is clean.
- PR #27 CI: all checks passed on a8814e13. On bbeae23e, 75 of 117 checks had passed and none had
  failed when this report was recorded; the rest were pending.
- Not run locally: the Linux/macOS variants of the changed facade test and a complete verify:ci.

## Native observations

A separate clean worktree at bbeae23e was prepared with the canonical CI stages (dependencies,
prepare, mcp-dependencies), followed by candidate, handoff and preflight. The AGDF installer
correctly refuses inside the packaged Claude Desktop app (Claude_pzs8sxrjxfjjc virtualizes
%LOCALAPPDATA%), and child processes inherit that context. The five cases therefore ran once each
from a script launched through explorer.exe, outside the package.

| Case | Probe | AGDF outcome | Validator | Directory |
|---|---|---|---|---|
| dispatch | pass | control_result, one call | accepted | final/claude-host-e2e-2026-10-21T12-10-26-883Z |
| failure_case | pass | invalid_input, one call | accepted | final/claude-host-e2e-2026-10-21T12-11-38-474Z |
| skill_continuation | pass | skill_continuation, contracts verified | accepted | final/claude-host-e2e-2026-10-21T12-12-52-583Z |
| upgrade | pass | control_result after upgrade from published 0.14.5 | accepted | final/claude-host-e2e-2026-10-21T12-14-14-357Z |
| recovery | pass | control_result after owned stale-state repair | accepted | final/claude-host-e2e-2026-10-21T12-15-30-259Z |

Every call reports dispatcher digest 602c03f9d5348230ff77caf9c2fb2c870a6385ad84ece5e2e8b6ae15b9e900d0,
equal to identities.mcp_dispatcher. One tuple and unique record IDs across all five cases.
Every removal leaves no MCP listing, plugin data, enabled entry, permission rule, user MCP server
or installed entry; the AGDF marketplace registration is kept by design. The foreign sentinel and
foreign permission rule are preserved. No credentials, profiles or work directories are retained.

Evidence: [index with 86 hashed files](evidence/CLAUDE_CLI_WINDOWS_20261021/INDEX.json),
[validation](evidence/CLAUDE_CLI_WINDOWS_20261021/VALIDATION.log),
[candidate](evidence/CLAUDE_CLI_WINDOWS_20261021/CANDIDATE.json) and
[tuple](evidence/CLAUDE_CLI_WINDOWS_20261021/TUPLE_CLI.json). The run log and launch script are
stored with LF line endings, matching the repository's text normalization.

## Retained attempts

- attempts/candidate-0162491b: the same five cases on 486b1965. Product behaviour was correct,
  but 0/5 were accepted (failure_case parser defect; four native_executed_runtime_mismatch). This
  led to bbeae23e. The records are not relabeled.
- attempts/packaged-app-refusal: one invocation without a candidate (PowerShell dropped npm's `--`)
  and a manual install reproduction, both refused inside the packaged app.

## Open obligations and routing

| ID | Classification | Status | Route | Owner / next action |
|---|---|---|---|---|
| E-001 | evidence_gap | open | evidence_obligation | Maintainer: merge PR #27 or authorize another final shared ref, then recreate the candidate there; the Claude CLI records stay valid only if the candidate content is unchanged |
| E-002 | evidence_gap | open | evidence_obligation | Codex native executor: ten Linux/Windows observations with CLI 0.157.1 / gpt-6-luna on the exact release CI SHA, 0/10 accepted |
| E-003 | evidence_gap | open | evidence_obligation | Windows test executor: Desktop Code session, upgrade and recovery records in an isolated test environment (0/3); then a reviewer completes the review record and imports the full Claude bundle (CLI 5/5 validator-accepted, review pending) |
| E-004 | implementation_gap | resolved | CD+Tests | Codex inventory/session owner: retained from the previous record, no further action |
| E-005 | implementation_gap | resolved | CD+Tests | Marketplace/admission owner: retained; native Claude recovery repair also passes on Windows |
| E-006 | implementation_gap | resolved | CD+Tests | Runtime/lifecycle owner: retained; native Claude removal also passes 5/5 on Windows |
| E-007 | implementation_gap | resolved | CD+Tests | Retained structured-error and isolated-cwd correction, no further action |
| E-008 | implementation_gap | resolved | CD+Tests | Runtime/lifecycle owner: Windows owner lifetime (b9964037) and hidden facade console (486b1965); Windows CI and native removal pass |
| E-009 | implementation_gap | resolved | CD+Tests | Native evidence owner: Claude error-report decoding and executed-dispatcher binding (bbeae23e); real native records are accepted |

CD+Tests remains revise for the unfulfilled release evidence. TP Review, Clean Implementation
Review, CR, final QA, human UAT and OR remain incomplete; this report grants none of them. The
executor prepared 486b1965 and bbeae23e; the maintainer committed and pushed them. No tag,
publication, marketplace submission or human approval was performed.
