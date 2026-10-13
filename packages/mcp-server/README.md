# @agdf/mcp-server

Local STDIO MCP adapter for AGDF dispatch and control inspection.

MCP tools: `agdf_dispatch`, `agdf_inspect`, `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.

The bounded write groups, selected contract/status reads, original-operation recovery and
focused app-only decision facade are described in [Core and MCP command flow](../../docs/architecture/core-mcp-command-flow.md).
Host tool permission is separate from a deliberate gate decision. The source candidate's
click actions remain disabled while native app-only mediation is unqualified.

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
Dispatch follows the canonical skill-dispatch contract;
inspect exposes read-only doctor, gate-check, delivery-map and contract operations.

The shared Core continuation service may record one previously sealed relationship correction
for an authorized bound `continue_delivery` request, then route the same run afresh. The routing
service itself remains read-only. Accordingly, `agdf_dispatch` declares `readOnlyHint: false`;
`agdf_inspect` declares `readOnlyHint: true`. Neither tool creates an approval.

> [!IMPORTANT]
> This package documents the repository development build. The previously published AGDF 0.14.5 release
> did not include the MCP support described here. Repository assemblies and local plugin builds still
> carry the canonical version `0.14.5`, but can contain these newer MCP features. The version alone
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

`agdf_dispatch` requires `presentation_language` as one well-formed BCP 47 tag. The host selects it
from the latest natural-language request: an explicit response-language instruction wins, otherwise
the dominant language is used, with `en` for mixed or ambiguous input. Missing or invalid input is
rejected by the MCP schema before governance evaluation. A valid unsupported tag is accepted and
renders through the complete English locale pack. The production tests exercise this contract
separately for protocol versions `2025-11-25` and `2026-07-28`.

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
