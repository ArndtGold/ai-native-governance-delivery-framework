# Native execution evidence: Cockpit plugin integration

Status: actual isolated CLI evidence obtained; native visible-UI procedures unexecuted. This document is an execution-gap record, not qualification or approval.

The final candidate has not been installed into the user's active Codex Desktop installation. The existing `agdf-cockpit-local` registration remains enabled and the project configuration is byte-identical to the pre-probe snapshot. No real legacy retirement or active plugin publication update was performed. The whole user configuration digest changed during the wider verification window; its cause is unknown because no prior byte copy is available. Whole-file preservation is therefore not claimed; see `evidence/active-config-preservation.json`.

## Observed access

- Installed host CLI: `codex-cli 0.163.0`; bounded sanitized configuration inventory and configuration digests: `evidence/native-access.json`.
- The current tool inventory exposes the existing plugin `agdf` reader and the directory-bound `agdf_cockpit_local` tools. It does not expose the candidate plugin `agdf-cockpit` render tool.
- The Codex MCP Apps browser is accessible for existing side-panel apps. `cockpitApps.tabs.list()` returned an empty list. This API cannot create a native app tab or an isolated Codex Desktop instance. Native computer-control APIs are disabled in this session.
- No supported separate native Desktop profile/instance for the same target, without the old standalone registration, is available through the loaded capabilities. This is a statement about this session's access, not a claim that Codex can never provide such a context.
- CLI MCP configuration readback, SDK protocol clients, the synthetic browser host, and a different `CODEX_HOME` CLI process cannot substitute for visible native App rendering, interaction and teardown.

## Additional user-directed CLI evidence

The user subsequently requested the Codex CLI as the separate test instance. This was executed with independent temporary `CODEX_HOME`, `AGDF_DATA_DIR` and project, using the normal local plugin installer. The final installed source digest matches the normal generated profile. Real Codex app-server metadata attributes the tools/resource to `agdf@agdf`; a capability-announcing test client opens the checked original target, reads the exact Run and closes its view. Actual CLI disable, explicit isolated project-plugin re-enable, global removal and real same-key/alias admission checks have retained evidence. No standalone MCP registration was needed for clean installation. The optional hook trust remains ungranted; no hook-trust bypass was used.

See `IMPLEMENTATION_NOTES.md` and `evidence/cli-host-ui.json`, `cli-host-ui-raw.json`, `cli-lifecycle-verified.json`, `cli-conflicts.json`, and `cli-install-final.json`. The test client explicitly declares the UI extension but has no visible renderer and performs no `ui/initialize`/DOM interaction. Its real host-transport result does not satisfy a native visible-UI obligation. Earlier model prose without an MCP call is not used as proof. The active user's installation and legacy route are preserved.

## Required native scenarios left unexecuted

| Scenario | Procedure | Missing prerequisite | Required next action |
|---|---|---|---|
| SCN-010 | N-LEGACY | final plugin's native render/read proof, then fresh normal provider discovery | Observe the exact final candidate natively for this project before any guarded legacy retirement. |
| SCN-014 | N-LIFECYCLE | supported disposable native Desktop context and reload controls | Observe native update/disable/re-enable/removal in that context; do not remove the user's active installation as a test. |
| SCN-022 | N-CLEAN | separate clean native Desktop context, final package installation and fresh connection | Execute the approved normal installer and native UI journey in that context, capturing provider, initialize, rendered target/Run, interaction, context and teardown. |
| SCN-024 | N-SAMEKEY | supported same-target isolated native Desktop context | Qualify the stable same-key candidate there before a guarded normal-context transition; absent access leaves the original route intact. |
| SCN-025 | N-CLEAN | final native governance/Decision and Cockpit connections with actual UI routing | Observe reader attribution and unchanged canonical control bytes through the native journey. |

The approved TP explicitly requires preserving the current installation when the separate clean native context is unavailable. Its unavailable-action branch is applied here. No new TP approval is requested, and no native result is inferred from automated fixtures. CD+Tests and task fulfillment cannot be marked complete while these obligations remain open. Mandatory CR, Task Plan Review, Clean Review and QA remain subsequent canonical steps.
