# Codex CLI project setup: 2026-11-04

The installed local candidate completed independent project setup with a complete
event trace. This is one bounded macOS host observation, separate from repository
tests, CI and human acceptance.

| Identity or result | Observed value |
|---|---|
| Source baseline | `3d0069ce5479434a49d746a6899eb5589c387eb3` plus the uncommitted implementation |
| Reviewed product scope | `sha256:42556c57add1c44c94c8b25072137a57e9ee22fe4340e1f0f05a291426bac422` |
| Codex CLI | `0.163.0` |
| Installed plugin | `0.20.2+codex.local-0efcc9d75052` |
| Configured model | `gpt-6.1-sol` |
| Platform / Node | macOS / `v22.22.3` |
| Native result | pass, process exit 0, completed turn, complete structured trace |
| Events | 31 readable events; all 12 started items completed |
| Initialization | accepted; original operation `d8fca0bf-5596-4793-8a7f-df401e5451df` read back as `recorded` |
| Files | All 16 installed-plan files match; no extra files, Runs, approvals or staging residue |
| Elapsed time | 77.080 seconds total; 74.819 seconds model session |

The installed source digest matches the generated candidate. The live MCP Core
digest also matches the assembled candidate Core. The source evidence was collected
before this evidence summary was added; it is not execution on a later commit.

## Independent execution and trace

The existing [setup runner](../codex-project-setup.mjs) supplied its fixed task to
one fresh ephemeral CLI session in an empty directory. The child created Git,
derived its target and UUID, and used native `agdf_inspect` / `agdf_project` tools.
There was no parent feedback, prepared writer envelope, manual seed copy, CLI write
fallback, credential copy or extra writable source directory. The existing
`workspace-write` policy, 300-second deadline and disclosed
`mcp_optional_startup_grace_ms=0` invocation override were retained.

A passive parent listener captured event structure and digests without changing
the child's request or the oracle. Six native calls include an initial
`target_unresolved` read, which the child corrected independently. All six calls
and all event lifecycle records remain in the structured evidence. Raw prompts,
model reasoning, full tool payloads, personal paths and credentials are excluded.

## Failed attempts and host correction

The first two candidate attempts completed functional setup but failed the strict
trace predicate. The second attempt identified duplicate Codex error items for an
ignored `trusted_content_hash` setting on the AGDF session-start hook. Exactly this
unsupported metadata entry was backed up and removed under the user's explicit
host-test instruction. The regular `trusted_hash` remained present.

The third fresh-project attempt passed the unchanged parser and oracle. The known
development-feature warning retained the parser's existing treatment. No warning
filter, assertion, timeout or product implementation was changed to obtain pass.
The cleanup is a local host observation, not an automatic repair delivered by this
PR. Earlier unsuccessful observations remain recorded in the evidence summary.

## Repository checks and governance boundary

The local implementation record reports public CLI reads 4/4, startup composition
2/2, existing Codex origin/config 20/20, Core initializer 28/28, CLI canonical init
19/19, Doctor 12/12, read snapshots 4/4, missing-source 2/2, material 7/7,
error projection 222 cases, CLI recovery 4/4, native oracle/preflight 3/3 and shared
native helpers 4/4. Actual MCP protocol, package/build/runtime, contract, locale,
budget and local CI-inventory checks also passed. Local inventory was 28/28; the
inspect definition was 6030 bytes against the unchanged 6144-byte cap.

An existing native command-guard full invocation was 3/4; its remaining deadline
case passed separately 1/1 with identical limits. The original full invocation is
not relabeled green. Required remote CI must be checked against the actual PR head.

AGDF Run: `run-73cf90ea-e42b-4ed9-a698-82589c31ac7e`. Its exact QA deviation
acceptance and UAT approval preceded completed OR. The historical technical QA
decision remains `revise`, accepted with the explicit native-evidence deviation.
This later host result supplies new evidence without rewriting approved artefacts
or asserting a new formal QA decision. The complete local Run archive is retained
locally rather than publishing personal paths and local control records.

This observation establishes neither a general reliability rate, normal startup
without the disclosed override, other operating systems, Desktop UI acceptance,
nor release readiness. Commit/PR creation was separately requested; merge and
release remain maintainer decisions under [CONTRIBUTING.md](../../../CONTRIBUTING.md)
and [GOVERNANCE.md](../../../GOVERNANCE.md).

Structured evidence: [codex-project-setup-20261104.json](codex-project-setup-20261104.json).
