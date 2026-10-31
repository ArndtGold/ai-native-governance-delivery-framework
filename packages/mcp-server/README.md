# @agdf/mcp-server

Local STDIO MCP adapter.

MCP tools: `agdf_dispatch`, `agdf_inspect`, `agdf_project`, `agdf_run`, `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.

[Integration guide](../../docs/architecture/09-mcp-integrationsrichtlinien.md).
[Command flow](../../docs/architecture/core-mcp-command-flow.md): bounded writes,
contract/status reads, original-operation recovery and the app-only decision facade.
Host tool permission is separate from a deliberate gate decision. The source candidate's
click actions remain disabled while native app-only mediation is unqualified.

`agdf_closeout` also ends active runs as `superseded` or `abandoned`. Kind `closure.preview` takes
`{"entries":[{"run_id","outcome","reason","successor_run"|"successor_reference"}]}` and returns the
preview text with the phrase `Close runs: <preview_id>`; kind `closure.apply` takes `preview_id`
and the owner's verbatim `confirmation`. Both use a target-bound envelope without `run_id` or
`expected_revision_id`; every other `agdf_closeout` kind keeps the per-run envelope. The agent
forwards only the owner's reply and never supplies the phrase itself.

`agdf_inspect` also exposes read-only draft preflight through `operation: artifact-readiness`:

```json
{
  "operation": "artifact-readiness",
  "presentation_language": "de",
  "working_directory": "/absolute/repository",
  "target_source": "explicit_target",
  "primary_target": "/absolute/repository",
  "run_id": "selected-run",
  "gate": "PRD",
  "expected_revision_id": "00000000-0000-4000-8000-000000000000"
}
```

Supply the actual current revision. Supported drafts are UR, PRD, SD and TP; their canonical
run-local path is derived by Core. `report.ready` means the existing authoring checks passed,
including required localized summary and applicable product-decision/traceability checks.
`checks`, `diagnostics` and `next_action` explain failures, with exact source digest and revision
when available. Core uses a bounded, revalidated read snapshot. The operation never registers,
reseals, prepares a presentation or approves anything; semantic derivation and reviewed source
bindings remain separate. An absent or unsafe source, stale revision or current control blocker
is unready. QA decisions and UAT are outside this authoring preflight.

To read an existing prepared document, obtain the current run revision with `gate-check`, then
read `operation-contract` with `module: agdf_prepare/presentation.prepare`. Its derived
`inspect_contract` explains arguments/examples; `presentation_catalog` supplies validated
`read_arguments`. A complete unique match is readable; several matches require selection.
Absence or an unavailable/partial catalog cannot justify guessing or preparing another record.
Follow every returned `next_cursor` with `presentation-document` to reconstruct the frozen bytes.
Keep the original document revision, including for historical reads. Catalog pages contain at most
16 candidates; scans stop at 256 records, 1 MiB of record bytes or 1024 directory entries. Catalog,
document and preview cursors are not interchangeable. Prepared records prove no human approval.

Dispatch follows the canonical skill-dispatch contract;
inspect exposes read-only doctor, gate-check, delivery-map and contract operations.

`agdf_inspect/project-state` observes the confirmed existing Git project's setup without a Run.
Deliberate `agdf_project/project.initialize` uses the shared Core initializer and fixed versioned
plan, preserving authored initialized governance. It creates no Run, approval, installation,
permission or Git effect and exposes no force/repair/arbitrary writer. Original request recovery
uses `operation-status` module `project.initialize/<original UUID>`, distinct from Run creation.
Unknown/unowned partial states remain blocked. Successful setup returns creation help.

`agdf_run/run.create` creates an unapproved Run from a semantic title and original operation UUID;
pre-Run `operation-status` resolves a lost response without inventing a second Run.
`authoring-inputs` returns versioned templates and exact sources with bounded cursors.
`agdf_record/material.stage` transfers at most 16 KiB per part and 128 KiB per file, then seals
Core-owned references for existing typed writers, including reviewed formal artefacts, unapproved
UR replacement, Verified Change and closeout. Code edits, actual tests and Git execution remain
external work; none of these operations grants approval.

MCP `doctor` observes an exact selected Run without enumerating unrelated histories. All-active
diagnosis returns bounded pages and an opaque observation cursor; consume every `next_cursor`.
Only complete accounted observations have an overall domain status. Partial, stale, expired or
resource-limited reads never imply a clean pass. Read failures report elapsed/unmeasured timing
and read recovery separately from uncertain writes and their original operation receipts.

Preparation opens no UI. `presentation.prepare` freezes one Markdown decision document;
`presentation.deliver` chooses its primary delivery once. The ordinary route returns the whole
Markdown. Optional `agdf_decision_view` opens a non-primary read-only preview. UI primary delivery
requires actual bound current-surface confirmation and gives Chat only a short pointer; action
qualification remains separate. The current SDK adapter cannot establish that surface identity,
so capability/qualification alone always keeps Markdown as the primary route. Replay adds no
second question; explicit fallback retires a primary view before returning the same Markdown.

The shared Core continuation service may record one previously sealed relationship correction
for an authorized bound `continue_delivery` request, then route the same run afresh. The routing
service itself remains read-only. Accordingly, `agdf_dispatch` declares `readOnlyHint: false`;
`agdf_inspect` declares `readOnlyHint: true`. Neither tool creates an approval.

> [!IMPORTANT]
> This package documents the repository development build. The previously published AGDF 0.14.5 release
> did not include the MCP support described here. Current assemblies and local plugin builds take their version from the canonical package manifests. The version alone
> does not identify the payload: verify the assembly or installed runtime digests and the loaded session.
> These development instructions do not establish what a current npm `@latest` resolution contains.

The server requires Node.js 22 or later, exposes no generic shell, filesystem or network operation,
and never grants AGDF approval or delivery authority. Use the `create-agdf` lifecycle command to
prepare and register the exact version-matched server for a delivered host adapter. Host support
remains unverified until direct registration, discovery, invocation, failure and removal evidence exists.

The guided `codex`, `claude`, `copilot` and `opencode` installers can call that same lifecycle after
the user explicitly chooses complete setup. In non-interactive use this requires `--with-mcp` and
an entered absolute `--dir`; otherwise installation remains plugin-only. The plugin transaction and
MCP transaction retain separate results and recovery. A verified plugin is never rolled back only
because MCP setup fails. Marketplace-only installation has no CLI callback and therefore remains
plugin-only.

The nine regular MCP tools may omit `presentation_language`; the adapter resolves a valid explicit
request override, then the confirmed project's `.agdf/control/config.json`, then the versioned
`plugins/agdf/meta/agdf-defaults.json`. Shipped preferences are `chat_language: en`,
`artifact_language: en`, `presentation_route: markdown`, and `gate_check_variant: null`.
The existing complete project configuration remains the only project override file. The last two
settings are optional siblings of its language fields. Explicit invalid input and present invalid
recognized settings are errors; defaults never activate or repair missing/incomplete control.

Set an explicit BCP 47 language when the current request differs from the configured language.
A valid unsupported presentation tag selects one complete English pack; malformed tags/resources
fail. Presentation overrides never change artefact language or approved material. Existing setup
locale selection and stored project values remain; normal calls and package generation write no config.
The seven command groups also allow omitted `schema_version` and `assurance`; their fixed values
come from the contracts, not configuration or independent human proof. `presentation.deliver` may
omit route; only inspect `gate-check` may inherit the configured variant. UI/approval owners stay unchanged.

`working_directory` may be omitted only with private trustworthy invocation context. Current native
adapters have no evidenced task-directory source and return `working_directory_required` on omission;
supply the absolute execution directory explicitly. Neither target nor plugin/process directory is a substitute.
All target/Run/revision/operation/presentation/digest/reply bindings remain explicit. The SDK accepts
the public omission schema; existing Core owners receive and validate the complete effective envelope.
Existing explicit clients remain usable. Existing inspect/help reports expose effective values and sources
without a mandatory extra lookup before each ordinary call.

Existing family records retain original resolution in their versioned `resolved/1` extension. New readers
validate its original family version and original logical/effective request digests. Unchanged complete-envelope
digest and existing family recovery stay authoritative. A same-UUID retry restores original values after
configuration changes; another logical request conflicts. Prepared language/material/identity remain immutable.
Legacy records are read unchanged; old binaries can reject new record versions. No shadow ledger or automatic
history/config migration is introduced. Repository/SDK, native CLI transport, installed plugin and human UI
acceptance require separate evidence; a smaller definition or green build alone proves no task-efficiency gain.

### Selected Cockpit draft authoring check

`agdf_cockpit_read` additionally supports `artifact_readiness` with exactly `session_id`, `snapshot_id`, `run_id`, `gate` (`UR | PRD | SD | TP`) and `expected_revision_id`. It checks the currently observed, supported unapproved canonical draft, including an unregistered draft where supported. It accepts no target/path/writer/general-inspect override.

The same Core authoring projection serves standalone inspection and the scoped reader. The selected descriptor captures the draft file or absence before the snapshot freezes. The check validates the old binding, replaces the read scope with a same-Run capture, revalidates revision/gate/source before publication, and reissues resource selectors. Session/worker/pool and source observers adopt that capture together; context cleanup quarantine and existing bounds remain enforced.

The optional selected-detail `draft_check` contains source metadata, the unchanged authoring report and a Core-derived display/recovery state. A passed report never grants semantic review, registration, approval, implementation permission or QA. Old operations remain compatible; a client against a server lacking this descriptor shows bounded unavailable without a general-tool fallback.

## Repository test dependencies

Prepare the current source assembly before installing or running MCP package tests:

```sh
npm run build:prepare
npm --prefix packages/mcp-server ci --ignore-scripts
npm --prefix packages/mcp-server run test:protocol
npm --prefix packages/mcp-server run test:safety
```

Run these commands from the repository root. The repository lock resolves `create-agdf` from
`dist/npm/create-agdf`, which includes the assembled Core and generated resources. The published
package dependency remains version-pinned. Safety and cockpit-gating tests import that assembly
directly, so rebuilding it cannot leave those tests using an older same-version npm copy.
Other package-consumer tests create their own isolated runtimes from the same assembly. Installing
SDK dependencies is a separate preparation step; these tests neither update a host installation
nor qualify a native session. A direct `node test/...` invocation also requires the preparation.

Business failures use MCP `isError: true`, preserve the public domain result in
`structuredContent` and the first text block, and append one bounded EN/DE
explanation with the cause, known effect limit and supported correction. Success
keeps its existing single block, including exact decision presentation text.
Successful doctor, readiness, operation-status and freshness observations remain
successful when they report blocked, not-ready or unknown state. SDK input errors
and protocol errors retain their SDK-owned behavior.

The producing runtime owns the pure `agdf-tool-result/1` projection. Its checked
private descriptor travels with an old generation's result and is consumed before
public serialization; generation qualification includes that contract version.
Error-domain invariants are checked even though SDK 2 skips output validation for
error results. Existing response limits include the explanation and fallback.
Known parse rejection means not dispatched; timeout, cancellation after handoff or
a lost connection cannot establish rollback. For an uncertain command, inspect
`operation-status` with the original UUID and retain its exact payload. Recovery,
receipts, approval eligibility and any permitted replay remain Core-owned.

Worker requests retain a ten-second total deadline, including shutdown confirmation.
Execution reserves up to one second (one quarter of shorter configured deadlines) for
termination. Capacity and owned locks are released only after confirmed termination or
an observed exit, including an exit after a rejected termination request. If shutdown
remains unconfirmed, the error preserves the typed `cause_code` when one exists and the
last allowlisted `worker_phase` in diagnostics and the bounded explanation. Result content
and raw exception text never become a cause; an uncertain worker continues to block reuse.

This follows the [MCP tool error contract](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#error-handling)
and [SDK error behavior](https://ts.sdk.modelcontextprotocol.io/v2/servers/errors).
Local protocol, package and browser tests do not establish native host or agent
performance; the unchanged ergonomics comparison records that evidence separately.


### Owned thread execution

New packages declare `agdfExecutionModel: owner_threads_v1` and the exact owner-protocol
import/export. The existing launcher and detached retention owner remain OS processes.
That owner hosts one genuine SDK facade Worker and at most three counted generation
Workers. Per-request Workers keep their existing execution and lock owners. Public
STDIO uses native streams and backpressure; generation output cannot write MCP STDOUT.
One entry-owned SDK output queue serializes actual writes, bounding queued frames/bytes
without lowering existing per-result or UI resource limits. A blocked reader therefore
does not create a parallel drain/error listener for every response.
The private channel accepts bounded finite JSON with exact fields, a per-connection
token/epoch, publication identity and original operation identity. It limits pending
frames and bytes, and requalifies replacement candidates through the existing immutable
publisher. Historical packages retain their declared process path and digest entry sets.

Executable claims bind once to actual native Worker objects. Successful actual exit
and a complete close acknowledgement are both required for release. Facade loss drains
surviving work without replay; unconfirmed exits, uncertain effects and nested locks
remain protected. Fatal failure of the shared owner process can lose all its Workers;
original operation receipts and retained claims remain the recovery evidence. No PID
scan, claim garbage collection or timeout alone establishes safe termination.

Repository tests exercise both actual STDIO protocols, replacement, bounded channel
admission and real write/lock interruption in disposable, fully rehashed fault candidates.
They do not qualify an installed host or another OS. The fixed performance test selects
the actual owned plugin launcher; its existing 20/20 samples and 1500/1000 ms limits
remain unchanged. Final performance acceptance and native qualification are separate
required evidence, not consequences of the topology declaration.
