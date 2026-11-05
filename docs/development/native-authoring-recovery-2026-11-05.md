# Native authoring recovery: retained observations and remaining validation

This change addresses repeated malformed MCP calls, redundant authoring reads, and
SD/TP draft-recovery loops. The repair was performed directly with repository tools,
as explicitly requested, without an AGDF workflow or a new repair Run. Existing
repository Runs and earlier native records were preserved.

## Source and transport changes

- Core supplies bound writer, delivery, approval and original-operation observation
  calls. A connection-local MCP reference can retain immutable command arguments;
  it accepts only the listed author inputs and still executes the canonical validators.
  The original full call remains available for recovery. Read and dispatch schemas
  retain their existing argument mode.
- Bundled authoring inputs distinguish complete text documents, partial fragments and
  metadata. Formats accompany the source snapshot, reducing separate contract reads.
- Direct UTF-8 staging seals up to 48 KiB per file within the existing 64 KiB JSON
  request bound. Multipart pieces remain bounded to 16 KiB. Recording, review and
  approval remain separate canonical actions.
- SD/TP summary gaps return to the existing authoring route. Requested presentation
  language, current bindings and exact approval-response syntax are retained.
- The final follow-up distinguishes quoted CLI arguments such as `done <id>` from
  unfinished prompts, identifies the exact TP mapping column and allowed source IDs,
  and supplies a revision-bound approval-help call.

Canonical owners are `packages/core/lib/`, `packages/mcp-server/src/`, and the
contracts/templates under `plugins/agdf/`. Package payloads are regenerated through
the existing synchronization/build process; installed caches are not edited.

## Earlier completed native observation

This observation applies to **an earlier local candidate**, not the final PR head:

| Property | Observed value |
|---|---|
| Candidate | `0.30.0+codex.local-3dbef07d7b80` |
| Host | Codex CLI `0.163.0`, macOS, x64, Node.js `22.22.3` |
| Model | `gpt-6-luna`, reasoning effort `high` |
| Runtime digest | `63a6e90fed51332d4aebe977a87297fa7f07884c1ac0a2355c7efeb34dcf4a6e` |
| Source identity | All 27 compared changed runtime files matched the installed candidate |
| Functional cases | SD and TP drafts without the German approval summary were diagnosed, corrected and freshly presented |
| Decisions | UR, PRD, SD and TP approvals were authorized **simulations**, not independent human acceptance |
| Overall audit | `audit_findings`; the matched per-invocation budget failed |

The test used a fresh empty project and the same original task. The parent supplied
only ordinary setup/continuation replies and authorized simulated decisions; it did
not pass chat history, repair hints or edit the test project. No application code
was implemented.

The comparison baseline is `0.30.0+codex.local-d88d45da15ae`.

| Measurement | Earlier prepared candidate | Last completed candidate |
|---|---:|---:|
| MCP calls | 125 | 101 |
| Outer tool round trips | 116 | 102 |
| Failed MCP calls | 8 | 1 |
| Active CLI time | 27:49.883 | 27:57.640 |

The remaining MCP failure was an unnecessary approval-contract read missing its
revision. Five syntax failures in model-authored host scripts were recorded
separately. A 20-minute invocation cap was exceeded and the same case subsequently
continued; functional completion does not turn that into a budget pass. Source
corrections and TP mapping attempts accounted for additional rounds. These are
single observations with route/controller differences, not a reliable speed benchmark.

The audit recorded unchanged digests for 616 earlier files, all 27 frozen source
files and 35 pre-existing repository Run files. Raw traces remain local and are not
included in the contribution. Their retained audit identities are:

| Local audit artifact | SHA-256 |
|---|---|
| `native-result.json` | `9a53109f188d7db6cba5fab9aef33c6b2ffc2c74276a699579f2ff1ea50d5fe4` |
| `comparison-result.json` | `423df6b80afa5ef79a92020ebb2019cbfeb34406f5edd69cccaffcd576bbebe4` |
| `manifest.json` | `75d2426c22bdab419cd436bf37f10cd73fc1096d1c421ef0250cf1c4ca14cef9` |

These hashes identify retained local evidence; they do not make its contents
publicly reviewable or establish independent acceptance.

## Native observation at PR head e8da5f2f

The resumed test installed `0.30.0+codex.local-b9b1a90cb926` from commit
`e8da5f2f0407e30baeb884425efdbf8c756cf004`, using the same task, Codex CLI,
OS and `gpt-6-luna/high` model tuple. Both SD/TP negative-summary cases reached
canonical replacement, fresh German presentation and authorized simulated approval.
The run stopped before implementation, with Brownfield Analysis as its next step.

The overall result remained `audit_findings`: 91 MCP calls, three malformed calls,
four host-script failures, 24:29.664 active CLI time, and one exceeded 20-minute
invocation cap. There were 91 outer tool round trips. The MCP calls themselves
took 2:29.512; time outside outer tool calls includes provider/model, host and
context processing and cannot be interpreted as pure model reasoning time.

The retained trace identifies the causes directly:

- One request combined the raw command envelope with reference-only `inputs`.
- Two requests read `submit.prepared_call_id` instead of
  `submit.arguments.prepared_call_id` and submitted `inputs` without a reference.
- An own SD source moved beyond the first bounded page; code accessed it without
  following the supplied cursor. A separate failure accessed an unsuccessful
  response as though it contained a successful structured result.
- Other host-script failures used unescaped Markdown in executable text and a
  cloning helper unavailable in that host's execution environment.
- The PRD summary grouped criteria instead of naming each required criterion on
  its own line. The umbrella diagnostic incorrectly described this as open product
  decisions. A later SD traceability gap correctly identified an unmapped decision.

All 30 compared candidate files matched the source, including the complete PRD
template actually read through MCP. Config, context graph and SoT registry were
created; no Masterbacklog was created. All 45 untracked working files, 49 existing
Run files, 686 older evidence files and the global Codex configuration were unchanged.

| Local audit artifact | SHA-256 |
|---|---|
| `native-result.json` | `6ddd49fcf9ae894415a2205906cf62cd01f7bfbe6603de4c4f833e1501e733d1` |
| `comparison-result.json` | `dd56de1d49a184f528191957620decc19b48ba5fb72f70d3db108627033b1d84` |
| `manifest.json` | `2c0331b07430dd4beced94d8e78d8af905a197f0ea32444c30233f3e643382db` |

The follow-up makes reference extraction explicit, provides bounded transport
corrections before dispatch, makes own-draft and page access actionable, and
distinguishes summary readiness from real decision and traceability gaps. It does
not relax validators, infer missing bindings or prefill approval replies. Native
validation of this follow-up is separate from the two historical observations.

## Validation boundary

The later candidate `0.30.0+codex.local-78156d8093e4` at source commit
`62428882402bcc51efe39ae0877f10c1951c65d2` completed both functional SD/TP cases,
with one canonical correction per gate. It used 84 MCP calls and 95 outer tool
round trips in 20:14.804 active CLI time. All three invocations stayed within the
unchanged 20-minute per-invocation limit. Seven malformed MCP calls and four
host-script failures remained; this was not a clean native qualification. One
reference was empty, another differed from the supplied UUID by one character.
There was no evidence of reference expiry or registry exhaustion. All 34 compared
candidate files, 758 older evidence files, 49 repository Run files and 45 untracked
working files were preserved. The global Codex config digest changed near CLI
startup; timing alone did not identify the writer or the changed keys.

Its retained audit SHA-256 is
`e94d21f403b3dad16e2df70b90cf3e12256ac56dde26243c88f27a3ac528a245`;
comparison `3451e2684261d3cdbda3cf12b15a8d0fd4355ff918c8bbbe506f0fae18f02ca2`;
84-file manifest `98d342583839af7f38809e70331d1e91da9eaf1158b846124b9d9557917b5a16`.

The subsequent normal-path change exposes one `next_action.call`, maps named
inputs in the adapter, and moves original Raw requests to `recovery_only`.
One uniquely supplied safe inspect can be included without repeating a host tool
round; dispatch, mutation, presentation and approval remain explicit. Source pages
stay explicit, and failed follow-up reads cannot replace a successful write result.
The duplicate delivery call that requested a freshly generated UUID is removed.
These changes require their own installed-candidate evidence. Three fresh Luna
cases are selected before execution; no failed case may be replaced. Their config
observer retains keyed value hashes and sanitized key identities, never raw config
or authentication data. Native verdicts and current-head CI belong in the PR.

Repository and actual STDIO regressions cover source reconstruction, UTF-8 and
request limits, immutable prepared arguments, original-operation replay, language,
summary recovery, and the final diagnostic/help changes. Compatibility fixtures and
deterministic eval reference hashes are separate from native host qualification.

The e8da5f2f observation exercises the previous diagnostic/help changes and main
integration; the later follow-up above requires its own exact-candidate native run.
No QA, UAT, release qualification, merge authorization or independent human approval
is claimed. Exact local checks, current-head CI and the latest native observation
belong in the PR evidence section; a historical result does not qualify a later head.

Local PR preparation on the integrated source passed the build, all 56 synthetic
compatibility scenarios, the SD/TP diagnostic regressions, the selected Core
regressions (18 tests), prepared-reference guards/budgets, the actual legacy/modern
prepared submission chain, and pre-dispatch failure checks for both facade protocols
and the plugin generation. Compiled-worker relocation/tamper checks and MCP contract
checks also passed. Full repository regression remains in CI; these results do not
replace the native follow-up for the current candidate.
