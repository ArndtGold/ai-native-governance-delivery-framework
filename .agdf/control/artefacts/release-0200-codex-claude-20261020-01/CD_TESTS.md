# CD+Tests: CI partition repair and native Claude CLI observations on the current candidate

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- source_revision_id: 1109775b-bc30-4c7c-8c39-45897c418b41
- date: 2026-10-21
- result_owner: Claude Code implementation executor

## Result and identity

Five native Claude CLI release cases pass on Windows against the current candidate, and the release
validator of the candidate checkout accepts each record. This replaces the records of the previous
CD+Tests entry, whose candidate 5961f391 no longer matches the source after the CI repair below.
The records are not yet reviewed or imported; import requires the complete Claude matrix, including
three Windows Desktop Code records (0/3). Codex native Linux/Windows remains 0/10.

- Candidate: 830d8b9414a6e7b4eb4080ff5ce64daeb4b064cbf5fffc8680c4d2876604ebff, validated clean
  against its checkout before and after execution.
- Source: 97454ec2fcb0b4e194219ad31d962d4d8c24cae3, dirty=false; head of pushed PR #27
  (codex/fix-windows-mcp-owner-lifetime), not merged.
- Tuple: claude / cli / win32 / x64, Claude Code 2.1.302, claude-sonnet-5-5, Node v22.22.3;
  tuple digest 6d128179ec098bd0d52149937d0864fbe845bd740a5f49af7f53341ab916aa4a (unchanged).

## Changes since the previous record

The previous record (run revision 16) was committed as 4c725e68. Its Guardrails run 39600811858
failed in Packages Win22 1of2: `control-command-package-test.js` hit the eight-minute execution
budget of its partition. On Windows that suite took 288 s, 356 s and then more than 380 s, while the
planner still estimated 218 s. Recording the measured duration alone would fail planning, because
357 s with headroom exceeds the 360 s group budget.

1. e3a0a632: the suite follows the existing source/phase pattern. It accepts `--part core`,
   `plugin-mcp-runtime` or `runtime-integrity` from a shared part list
   (`packages/cli/scripts/control-command-package-parts.js`), rejects invalid selectors and still
   runs every part by default. The planner expands the file into the three parts, each with its
   share of the measured duration plus setup, so they run in separate Windows partitions. The
   measured duration is recorded in `scripts/ci-duration-baseline.json`; the planner tests cover the
   expansion, the separate partitions and selector rejection; CONTRIBUTING documents the split.
2. 97454ec2: the Contracts job of e3a0a632 failed on all three lanes. The new selector test starts
   the suite in a job without generated packages, and a static fixture import read
   `packages/core/generated` during module loading (ENOENT instead of the selector rejection). The
   project fixtures are now imported after the selector check, as the source/phase suite does.

No production, payload, policy or validator code changed. The test inventory is unchanged; each
platform/Node lane still runs every test.

## Verification

On this Windows computer unless noted:

- Planner tests 9/9 and verification tests 16/16 pass, including the selector test without
  generated packages (reproduced first: ENOENT on e3a0a632, selector rejection on 97454ec2).
- Parts: `core` passes (155 s) and `plugin-mcp-runtime` passes (117 s, and 123 s with the dynamic
  imports). `runtime-integrity` fails locally with EBUSY when the unchanged
  `runtime-integrity-layout-test.js` removes its temporary fixture after spawning bash; it fails the
  same way standalone in the repository and is identical to main. It passes on the CI runners.
- Community health (39 files, 4 issue forms; 29 negative contracts) passes. The compatibility
  evidence stays current (fingerprint unchanged). `git diff --check` is clean.
- Not completed locally: `test:maintenance-contracts` stops later in the unchanged
  `ci-publication-test.mjs`, because the local Git Bash drops the backslashes of the Windows path;
  `verify:commit` was not run for the same environment reasons. The Guardrails run executes the
  same plan.
- CI: Guardrails run 39609232214 on 97454ec2 completed with 118/118 jobs successful. The four
  Windows Packages partitions needed 189, 286, 209 and 261 s of verification (before: 470 of the
  480 s budget); the parts took core 95 s, plugin-mcp-runtime 137 s and runtime-integrity 129 s.

## Native observations

A fresh clean worktree at 97454ec2 was prepared with the canonical CI stages (dependencies,
prepare, mcp-dependencies), followed by candidate, handoff and preflight. The five cases ran once
each from a script launched through explorer.exe, outside the packaged Claude Desktop app.

| Case | Probe | AGDF outcome | Validator | Directory |
|---|---|---|---|---|
| dispatch | pass | control_result, one call | accepted | final/claude-host-e2e-2026-10-21T13-37-20-265Z |
| failure_case | pass | invalid_input, one call | accepted | final/claude-host-e2e-2026-10-21T13-38-09-439Z |
| skill_continuation | pass | skill_continuation, contracts verified | accepted | final/claude-host-e2e-2026-10-21T13-38-56-944Z |
| upgrade | pass | control_result after upgrade from published 0.14.5 | accepted | final/claude-host-e2e-2026-10-21T13-39-43-226Z |
| recovery | pass | control_result after owned stale-state repair | accepted | final/claude-host-e2e-2026-10-21T13-40-38-775Z |

Every call reports dispatcher digest 602c03f9d5348230ff77caf9c2fb2c870a6385ad84ece5e2e8b6ae15b9e900d0,
equal to identities.mcp_dispatcher. One tuple and unique record IDs across all five cases. Every
removal leaves no MCP listing, plugin data, enabled entry, permission rule, user MCP server or
installed entry; the AGDF marketplace registration is kept by design. No credentials, profiles or
work directories are retained.

Evidence: [index with 79 hashed files](evidence/CLAUDE_CLI_WINDOWS_20261021_830D8B94/INDEX.json),
[validation](evidence/CLAUDE_CLI_WINDOWS_20261021_830D8B94/VALIDATION.log),
[candidate](evidence/CLAUDE_CLI_WINDOWS_20261021_830D8B94/CANDIDATE.json) and
[tuple](evidence/CLAUDE_CLI_WINDOWS_20261021_830D8B94/TUPLE_CLI.json). Wrapper logs and the launch
script are stored as LF without trailing whitespace; primary captures are unchanged.

## Retained and superseded attempts

- attempts/candidate-331409e0: the same five cases on e3a0a632, 5/5 accepted. Superseded because
  97454ec2 changed the candidate content.
- evidence/CLAUDE_CLI_WINDOWS_20261021 (candidate 5961f391 on bbeae23e, 5/5 accepted, and the
  earlier 0/5 attempt on 0162491b): retained unchanged from the previous record and superseded.

## Open obligations and routing

| ID | Classification | Status | Route | Owner / next action |
|---|---|---|---|---|
| E-001 | evidence_gap | open | evidence_obligation | Maintainer: merge PR #27 or authorize another final shared ref, then recreate the candidate there; the Claude CLI records stay valid only if the candidate content is unchanged |
| E-002 | evidence_gap | open | evidence_obligation | Codex native executor: ten Linux/Windows observations with CLI 0.157.1 / gpt-6-luna on the exact release CI SHA, 0/10 accepted |
| E-003 | evidence_gap | open | evidence_obligation | Windows test executor: Desktop Code session, upgrade and recovery records on candidate 830d8b94 in an isolated test environment (0/3); then a reviewer completes the review record and imports the full Claude bundle (CLI 5/5 validator-accepted, review pending) |
| E-004 | implementation_gap | resolved | CD+Tests | Codex inventory/session owner: retained from earlier records, no further action |
| E-005 | implementation_gap | resolved | CD+Tests | Marketplace/admission owner: retained; native Claude recovery repair passes on Windows |
| E-006 | implementation_gap | resolved | CD+Tests | Runtime/lifecycle owner: retained; native Claude removal passes 5/5 on Windows |
| E-007 | implementation_gap | resolved | CD+Tests | Retained structured-error and isolated-cwd correction, no further action |
| E-008 | implementation_gap | resolved | CD+Tests | Runtime/lifecycle owner: Windows owner lifetime (b9964037) and hidden facade console (486b1965); retained |
| E-009 | implementation_gap | resolved | CD+Tests | Native evidence owner: Claude error-report decoding and executed-dispatcher binding (bbeae23e); retained |
| E-010 | implementation_gap | resolved | CD+Tests | CI planning owner: packed control-command suite split into planned parts (e3a0a632) with selector validation before fixture loading (97454ec2); Guardrails green on 97454ec2 |

CD+Tests remains revise for the unfulfilled release evidence. TP Review, Clean Implementation
Review, CR, final QA, human UAT and OR remain incomplete; this report grants none of them. The
executor prepared, committed and pushed e3a0a632 and 97454ec2 at the maintainer's request. No tag,
publication, marketplace submission or human approval was performed.
