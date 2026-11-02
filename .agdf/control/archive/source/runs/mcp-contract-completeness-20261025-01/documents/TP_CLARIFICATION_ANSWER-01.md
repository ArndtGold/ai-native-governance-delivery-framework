# F-001: Native configuration answer and source-bound planning resolution

Run: mcp-contract-completeness-20261025-01
Date: 2026-10-25
Evidence class: caller-forwarded deliberate user clarification plus read-only local availability checks; cooperative local, not independent human-origin proof.

## Exact user answer

"Nein, die durchläuft mit Codex planen nicht mit Claude"

The user rejects the proposed Claude route and directs planning of the native repetitions with Codex. This is explicit editing intent for the incomplete TP. It is not Approval: TP or permission to begin implementation or native execution now. The former USD 5 Claude proposal is rejected; no Claude token, Claude install or paid API authority is acquired.

## Exact approved source bindings reassessed

- UR: .agdf/control/artefacts/mcp-contract-completeness-20261025-01/UR.md @ sha256:90da41de9d341e20349f682f49b7f23511d869351e71aac699aa8d530860c47a
- PRD: .agdf/control/artefacts/mcp-contract-completeness-20261025-01/PRD.md @ sha256:2a0c4a464e97c0df1a0e72544c9c98073f98273d7e24d7ad67e3e6b85d089dfa
- SD: .agdf/control/artefacts/mcp-contract-completeness-20261025-01/SD.md @ sha256:04adc7913d3889900fb3594167e0e800c7cce4a9481286119c12faf88b14788f
- Affected SD later_tp decision: Native evaluation configuration.
- Affected PRD criterion: AC-008. It requires a real bounded agent task but does not require Claude or an external paid API.

The approved sources permit host-specific planning through current owners. Codex changes this unapproved execution configuration, not acceptance, architecture, tool effects or upstream intent. No source revision is required. Both later_tp inventory and all T-008/T-009/SCN-019/SCN-020/R10, environment, permission, risk and summary references must be reassessed together.

## Current local evidence, no model run

- command -v codex: /Users/arndtgold/.npm-global/bin/codex.
- codex --version: codex-cli 0.163.0. It reports a sandbox PATH-alias warning; no host setup repair occurred.
- codex login status: Logged in using ChatGPT. Only the status subcommand was used; no auth file or token was opened, copied, displayed or changed by the agent.
- Selected non-secret config fields: model gpt-6.1-sol; model_reasoning_effort high; no profile selector. These existing configured values are the proposed fixed native model/effort, not a new model migration.
- Current host: darwin-x64; Node v22.22.3; SDK server/client 2.0.0 pinned by the candidate locks.
- Local codex exec --help establishes --ignore-user-config (auth still uses CODEX_HOME), --json, --config, --model, --sandbox and normal session persistence behavior. --ignore-user-config is exec-specific, not a global login option.
- Local features list reports code_mode_host stable true; shell, memories, multi-agent, apps, hooks and plugins have feature switches for explicit child-only configuration.
- Existing scripts/native-probes/codex-host-e2e.mjs has a focused single-task path with createProtocolRuntime, fixture generation, sanitized JSON/rollout evidence, exact candidate hashing and parsed-call verification. Existing parseCodexT4Trace/pureInspectWrapper are T4-specific and must retain their semantics; T7 uses scoped generalization at those owners with offline regressions. Its current T4 path copies auth into a temporary home; do not invoke that path unchanged for T7.

## Concrete Codex configuration C selected for the revised plan

Plan two fresh sequential T7 fixtures via a new scoped T7 mode of the existing Codex host-probe owner, using Codex CLI 0.163.0 and the configured gpt-6.1-sol/high with existing ChatGPT account authentication. Use the existing CODEX_HOME only for normal Codex-owned auth/session handling and apply candidate-only MCP/configuration through exec --ignore-user-config plus child-only -c overrides. Disable unrelated plugins/apps/hooks, shell, memory and subagents. Do not create a fresh credential store, read/copy credentials, run a login, install/replace any plugin, edit the real config or use an API-key fallback. No additional API expenditure is authorized (USD 0); account quota is consumed and must be reported, not called free or zero usage.

Expose the exact temporary assembled candidate under the existing fixture/provenance machinery, not the installed old AGDF server. Permit only the existing agdf_inspect and agdf_approve tools needed for the selected presented-UR task; truthful normal Codex call approval is separate from the fixture's deliberate user decision. Verify effective context/config, candidate digest, full original MCP argument/result traces and read-only protected-config manifests before interpreting success. Retain normal Codex session data as owned by Codex and sanitized evidence for the test; never rewrite or clean prior native sessions.

Use a fixed maximum of two sessions, timeout 600000ms each, no automatic retries/resume, no model/account/host switch and no API fallback. Missing model/auth/quota, rejected scoped MCP permissions, incomplete trace, unsafe isolation or candidate mismatch remains explicit unavailable/failed evidence, blocking AC-008 and QA pass. These execution-time prerequisites are now concrete checks at a known available host/login, not an unanswered planning choice. Their eventual success is not claimed.

## Official documentation checked

[Codex CLI reference](https://learn.chatgpt.com/docs/cli/reference) documents exec --json, per-invocation overrides, model/sandbox flags and login status. [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) documents one-off -c overrides, including nested keys, without editing persistent configuration. Local CLI help is the exact-version evidence for exec-specific --ignore-user-config auth behavior. These docs do not establish that a future candidate, model session or T7 trace has passed.

## Resolution meaning

F-001 is resolved for planning by the direct Codex selection, available CLI/configured model/ChatGPT status and concrete zero-additional-API/no-install/no-credential-copy route. Record this file through step.record evidence before updating TP. This resolves the rejected Claude-specific planning prerequisite only. Native evidence remains unperformed, and TP still needs fresh presentation/approval before the implementation path begins.
