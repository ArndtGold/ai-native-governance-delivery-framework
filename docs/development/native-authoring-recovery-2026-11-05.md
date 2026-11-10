# Native authoring recovery: retained observations, results and lessons

This change addresses repeated malformed MCP calls, redundant authoring reads, and
SD/TP draft-recovery loops. The repair was performed directly with repository tools,
as explicitly requested, without an AGDF workflow or a new repair Run. Existing
repository Runs and earlier native records were preserved.

This document retains the successive candidate-specific observations, including what was still
pending at each stage. The [completed campaign on 2026-11-06](#completed-resumption-campaign-on-2026-11-06)
is the latest result below. Its [sanitized evidence projection](native-authoring-evidence-2026-11-06.json)
records the measured identities, cases and private-archive manifest hashes. Historical results do
not qualify a later candidate or the documentation commit containing this report.

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

## Retained three-case observation and 2026-11-06 follow-up

The frozen `d249ce80` candidate `0.30.0+codex.local-e9d01c065d25` completed
all three original independent Luna/high cases. The functional SD/TP negative,
repair, fresh German presentation and simulated approval path passed in all three;
only case 03 was fully error-free. Active times were 22:35.643, 22:31.547 and
10:27.876; MCP calls 90/63/45; MCP failures 2/2/0; host-script failures 0/1/0;
per-invocation 20-minute caps reached 1/1/0. All 26 internal adapter reads passed.
All 40 compared sources, 855 older evidence files, 49 existing Run files and
45 unrelated untracked files were preserved. These are observations, not human
acceptance or a general reliability claim. The 311-file sealed manifest is
`6291c39be2efbff79067b6ee6352be46dcb82909ce52fdad7612eea493a7e3f1`.

The four failed MCP calls were reconstructed read/status envelopes with missing
target or original Run/revision selectors. They did not expose malformed supplied
calls. The follow-up retains explicitly offered normal read requests by reference,
using the original SDK validator and read-only declaration; it never supplies an
inferred target or refreshes a revision. Executed internal read arguments remain
separate observations; explicit Raw recovery retains the original request across
reconnect. Existing byte, lifetime, permission and input limits remain unchanged.

One SD source already had concrete rationale and consequence, but its labelled
inline JSON schema example contained `<uuid>` and `<non-empty string>`. The old
whole-decision prompt scan emitted a generic rationale/consequence error, causing
three further replacements over 128.664 seconds. The follow-up recognizes typed
JSON string-value metavariables only in explicitly labelled, parseable inline
schema examples in the decision clause. Actual author prompts, unknown schema
choices, malformed examples and missing/duplicate author fields remain blocked;
diagnostics identify the affected field and token.

A new frozen-candidate campaign must qualify this follow-up separately. It uses
three fresh projects, the same original task, Luna/high and the same per-invocation
budget; observer-only changes do not supply technical or semantic answers.
Earlier failed cases remain retained and are never substituted by later passes.

## Retained read-path campaign and resumption follow-up

The frozen `919d3cbf` candidate `0.30.0+codex.local-58c7c68c5f3e` ran exactly
three fresh Luna/high cases with Codex CLI 0.163.0. The first two completed both
SD/TP negative-readiness, canonical-correction, fresh German presentation and
simulated-approval paths; neither was error-free. Their active CLI times were
25:12.454 and 14:41.465, with 78/64 MCP calls, 95/69 outer tool rounds, one MCP
rejection each, zero/two host-script errors and no reached per-invocation cap.
All 37 internal adapter reads passed. Both actual MCP runtimes had digest
`409f7d202fbd45ae34ead42aad59deb208128a12171bc00a46da30f7c8efaa55`;
all 41 compared files matched.

Case 03 stopped after 57.806 seconds and four successful shell calls, without
an MCP invocation. The installed local CLI returned a terminal `control_setup`
card. The unchanged controller recognized setup only from MCP results and
provided no further input. There is no MCP runtime or tool-inventory proof for
that case. Its missing audit/comparison outputs and the once-attempted audit
errors remain retained; the local CLI identity is not substituted for MCP proof.
Zero MCP use does not establish tool unavailability or a startup failure.

The aggregate is `findings`: 2/3 functional completions, 0/3 clean passes. All
three selected cases remain; none was repeated or replaced. The 270-file sealed
manifest is `67ce920dbbcdf90bdcc1185fe9d2d81563eb9c4df72652efd134b4256e4e7ebb`.
Final comparisons retained 362 canonical sources, 49 existing Run files,
45 unrelated files and 1,202 older proof files. CI #701 passed all 173 jobs and
174 checks for `919d3cbf`; that result qualifies only that commit.

The observed next-action defect is concrete: an accepted private UX stage
returns a complete corrective `material_call`, but the normal action is
`idle/null`. The follow-up projects that exact authored correction, preserving
the negative source verdict and the separate explicit canonical recording step.
Newly observed authoring revisions retire only matching cached source scopes;
the Core still rejects an old revision even when a client selects an older form.

The other rejection used a reference offered by an earlier CLI invocation. The
serving connection reported it unknown before argument expansion or Core
execution; the reconstructed original request passes offline validation. A
connection-local reference registry explains this boundary, although the
observation contains no explicit serving connection ID. The follow-up retains
offered templates in a private, integrity-checked, bounded owned-runtime journal,
preserving the original identity, lifetime, target and revision. It never records
submitted author/review/reply inputs or grants permission. Unknown references
and unavailable storage receive separate transport causes; a failed future-form
publication must preserve any already accepted operation and receipt.

Two JavaScript syntax errors arose in host-authored helper code. Shared Core
guidance now treats Markdown as UTF-8 data, preferring structured input or a
host file-editing tool followed by a file read. This adds no server-side file
reader. Backticks and interpolation-like text remain literal transfer bytes.
The plugin contract also removes its obsolete `submit`/JSON-pointer guidance.

The next campaign keeps the original task, Luna/high, CLI version, invocation
budget and maximum turns. It deliberately expands the controller to recognize
the same fresh, bound, verbatim setup card from the installed local CLI as from
MCP. That controller change is an explicit comparison boundary, not an
observer-only change or a retroactive pass for case 03. No technical hints or
semantic answers from this chat may be supplied. Source and installed-host
checks, current-head CI and independent human acceptance remain separate.
The shared observer is versioned in
`scripts/native-probes/setup-card-observation.mjs`; the existing MCP-specific
finite setup oracle remains unchanged. A display before the actual card result
or a later tool/file action cannot establish a fresh setup-card observation.

## Completed resumption campaign on 2026-11-06

### Profile and method

The frozen product source was
[`b89156e1f1dba9f179299daf3f593d3bd9b2ccbe`](https://github.com/ArndtGold/ai-native-governance-delivery-framework/commit/b89156e1f1dba9f179299daf3f593d3bd9b2ccbe),
installed successfully as local candidate `0.30.0+codex.local-92f767cea8eb` from a separate empty Git
project. This is local-candidate evidence, not qualification of the published 0.30.0 package.

| Input or boundary | Recorded value |
|---|---|
| Host and model | Codex CLI 0.163.0; `gpt-6-luna`, reasoning `high` |
| Observer process | Node.js v22.22.3, `darwin/x64`; physical CPU, translation layer and exact OS release are not established by these fields |
| Task identity | SHA-256 `2755116443cb439b1a4c46bb779615eb0afa3f331d64b9fd33f790a29ed9b6f8` |
| Selected cases | Exactly three fresh Git projects, fixed before the first CLI start, sequential; no replacement or repeated case |
| Invocation budget | Original 20-minute cap per CLI invocation, maximum ten invocations per case; a reached cap remains a finding after resumption |
| Decisions | Authorized simulated UR/PRD/SD/TP replies; no independent human acceptance |
| Parent assistance | No parent-chat history, technical hints or semantic answers; observers did not act inside the cases |
| Host context | Ordinary host documentation and memory access remained possible; this was not a memory-hermetic experiment |
| Frozen boundary | Product sources and immutable installed files were not changed during the cases; normal product-owned mutable runtime state was allowed |

The controller deliberately added recognition of the equivalent fresh local CLI setup card while
retaining the original task, replies, model, generic continuations and budgets. All three new cases
actually used MCP and did **not** exercise that local CLI setup branch. Synthetic observer tests
and native proof of that branch remain different evidence. Earlier descriptions of an `arm64`
profile were incorrect: the launch records describe the observer process as `darwin/x64`.

### Results

| Case | Run | Observed mode | Active CLI time | MCP calls / outer rounds | Internal reads / failures | Host-code failures | Reached caps |
|---|---|---|---:|---:|---:|---:|---:|
| 01 | `run-c32046ee-984e-49d1-9c3f-9c704e9992b7` | `structured_slice` | 23:10.646 | 60 / 82 | 13 / 0 | 1 | 1 |
| 02 | `run-2feb85d1-2b01-4f95-9649-7a6744f50e7b` | `structured_delivery` | 26:58.401 | 67 / 83 | 19 / 0 | 2 | 1 |
| 03 | `run-47272e59-4e91-4100-b1aa-1293127d3603` | `structured_delivery` | 19:28.133 | 54 / 68 | 7 / 0 | 1 | 0 |

**3/3 functional SD/TP completions; 0/3 clean passes.** All cases retained the first SD and TP drafts
without the German summary, observed the concrete missing-summary diagnosis, corrected through the
offered authoring path, delivered a fresh German presentation and recorded a simulated approval.
Readiness evidence can be part of the authoring/prepare response; this does not assert that every
case made an additional explicit readiness call. No application implementation was attempted.

All 181 MCP calls and 39 internal adapter reads had zero recorded MCP execution/read failures.
Expected content findings are successful validation results, not evidence that MCP execution failed.
The aggregate remains `findings`: the four host-code failures and two reached invocation caps are
counted, along with the retained runtime-mapping finding described below.

The decisive native resumption witness is in **case 01 only**: invocation `02-native`, item 87,
offered a bound `agdf_record` reference for `material.stage` / `put`; invocation `03-native`, item 6,
submitted that same reference and was accepted without a fresh offer in between. This is private
material transfer, not a cross-invocation canonical artefact-record witness. The selected Run,
target, revision and original request binding were retained. The sanitized evidence projection records this event chain and
binding/request hashes. Cases 02 and 03 used fresh offers; they are not additional direct
cross-invocation reuse witnesses. No unobserved connection ID or journal-backend access is inferred.

### Retained failures and limits

| Finding | Observed cause | Consequence |
|---|---|---|
| Case 01 host failure | Missing closing parenthesis in the calling JavaScript expression | Parser failure before its intended MCP call; this was not a Markdown/backtick failure. |
| Case 02 first host failure | An inline backtick broke the outer JavaScript template string | Markdown was treated as code syntax despite prior data-handoff guidance. |
| Case 02 second host failure | A canonical `agdf_record` name was used as `tools[call.tool]` without resolving the registered host function | The cell had already completed a dispatch read; its intended record call was never invoked. A failed cell does not establish zero preceding effects. |
| Case 03 host failure | An inline backtick closed the outer template before a Run path | The path was parsed as JavaScript; the intended MCP call was not reached. |
| Cases 01 and 02 cap | An invocation reached its original 20-minute limit | Generic continuation completed the workflow; the reached cap remains a failed clean-run predicate. |

The shared UTF-8 handoff is guidance, not a mechanically safe host serializer or a new file API.
Likewise a logical tool name is not a guaranteed property of the host's JavaScript tool object.
These remaining integration failures prevent a claim that the whole invocation path is fixed.

Actual MCP runtime metadata was observed in **all three cases**, with dispatcher digest
`5257735ac18825b088ff3e7deec458f586c3efdcd73c96e1e7585994d02e4d3f`.
The raw verifier nevertheless reports 47/48 matching source paths. Its extra expectation places
the bootstrap owner `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` inside the reduced dispatcher
image. That file is absent there by the canonical
[`mcpDispatcherRuntimeEntries` inventory](../../packages/core/lib/runtime/plugin-provenance.js);
the separately installed bootstrap copy matches the source. The raw labels
`mcp_runtime_observed:false` and `not_observed` conflate actual observation with a failed comparison
predicate. They remain unchanged in the original aggregate; the separate mapping assessment
explains the false expectation. Fixing this evaluator would still leave all three cases with
host-code failures. No pass threshold or case outcome was retroactively changed.

All 33 keyed configuration snapshots parsed successfully. Each case added exactly one project
trust leaf; no existing leaves changed or disappeared. Observation timing does not identify the
writer. Raw values, authentication data and the ephemeral hashing key were not retained, and no
automatic restoration was performed. All 1,517 older proof files, 48 affected source files, 365
canonical files, 49 existing repository Run files and 45 unrelated working files remained unchanged.

### Timing and comparison

The three cases used 69:37.180 active CLI time. Of that, 89.5% was outside the measured union of
outer tool execution. That remainder includes provider/model, host and serialization work; it is
not an isolated measurement of model thinking. Tool counts alone do not explain total latency.

Case 01 improved against the retained previous case 01 from 25:12.454 to 23:10.646 and from 78 to
60 MCP calls. Case 02 took longer and selected `structured_delivery`, while its previous baseline
selected `structured_slice`. The previous blocked third case remains in the comparison and cannot
serve as a fast successful reference. Controller changes, different routing and model variability
prevent a general speed claim or a strict unchanged-controller benchmark.

### Traceability and evidence classes

The [sanitized JSON projection](native-authoring-evidence-2026-11-06.json) is derived from retained
recorded metadata. It supplies durable, reviewable results without publishing author text, raw
prompts, hidden reasoning, credentials, configuration values or personal machine paths. Hashes
identify the private original archives; they do not make those archives publicly accessible or
permit independent replay of their contents from this report alone.

| Retained evidence | Files | SHA-256 of manifest |
|---|---:|---|
| Native campaign and all three cases | 669 | `e9d2948750011d8087756fcd44683833191704b667eac0fc5a093f2fe15f7cb6` |
| Separate cause/mapping assessments | 56 | `fc396bbb4fbb931a5024fd1a38c1ad8b8b720722fbc9d7dad27136324b4da6da` |
| Initial exact-head CI evidence | 125 | `078a037a4472ec9e906acaf108bc2f1cd6e6987ccbc7e507005fcd57b029465d` |
| Post-native CI refresh | 11 | `3a36ec8a251be907e3a5784b34ed93230c8501e6a21927d5777d59aa779010a0` |

All four inventories and hashes were verified after sealing.
[CI #702, attempt 1](https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/42198544253),
associated with product head `b89156e1f1dba9f179299daf3f593d3bd9b2ccbe`, completed successfully:
173/173 canonical jobs and 174/174 head checks, including the separate Cloudflare check, with no
open/failed/skipped checks or legacy contexts. The post-native refresh used fully paginated
inventories and verified SHA/run/attempt/job/check bindings. This CI result does not qualify a
later documentation head; its own checks must be reported separately.

### Consequences and open follow-up

The reusable criteria live in the existing
[MCP integration guidelines](../architecture/09-mcp-integrationsrichtlinien.md); this report adds no
new gate, authority source or host-support claim. The handbook explains
[how to read native results](../handbook/de/05-abschluss-und-auslieferung.md#native-agententests-lesen)
and [how to distinguish failed calls](../handbook/de/06-fehlerbehebung.md#der-nächste-werkzeugaufruf-schlägt-fehl).

| Open item | Responsible surface | Evidence needed for closure |
|---|---|---|
| Safe transfer of long author text | Host invocation/data handoff; Core remains owner of content validation | Actual text reaches the writer unchanged without JavaScript delimiter failures; a new instruction alone is insufficient. |
| Logical name to host-function resolution | Host adapter/invocation boundary, not hard-coded host prefixes in Core | The returned normal action resolves to the actually registered function; unavailable mappings stay explicit. |
| Runtime evaluator mapping and labels | Native verifier and canonical package inventory | Declared bootstrap/dispatcher inventories determine expected paths; metadata observation and comparison verdict are separate fields, including a missing/wrong-runtime negative control. |
| Local setup branch | Versioned setup observer and targeted native qualification | A separate authorized case actually exercises the equivalent local card; these three cases provide no such proof. |
| Comparable performance | Native evaluation profile and timing method | Fixed controller, task, budgets and comparable delivery path; retain failures and distinguish tool time from unattributed remainder. |

These are remaining findings, not implemented fixes or authorization for another native campaign.
The observed three-case repeatability supports this task and candidate only; it establishes no
general model reliability, other-host/platform qualification, human QA/UAT or release approval.
