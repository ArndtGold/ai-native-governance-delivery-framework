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

## Last completed native observation

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

## Validation boundary

Repository and actual STDIO regressions cover source reconstruction, UTF-8 and
request limits, immutable prepared arguments, original-operation replay, language,
summary recovery, and the final diagnostic/help changes. Compatibility fixtures and
deterministic eval reference hashes are separate from native host qualification.

The final diagnostic/help changes and integration with the subsequent main-branch
pre-dispatch fix **have not received a new native Luna run**. That follow-up remains
paused at the user's request. No QA, UAT, release qualification, merge authorization
or independent human approval is claimed. Exact local checks and current-head CI
belong in the PR evidence section; the draft must retain this native validation gap.

Local PR preparation on the integrated source passed the build, all 56 synthetic
compatibility scenarios, the SD/TP diagnostic regressions, the selected Core
regressions (18 tests), prepared-reference guards/budgets, the actual legacy/modern
prepared submission chain, and pre-dispatch failure checks for both facade protocols
and the plugin generation. Compiled-worker relocation/tamper checks and MCP contract
checks also passed. Full repository regression remains in CI; these results do not
replace the paused native follow-up.
