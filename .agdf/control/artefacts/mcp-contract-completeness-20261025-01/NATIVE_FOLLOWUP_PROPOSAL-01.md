# Proposed native follow-up after the failed isolation check

Status: proposed; no source revision, additional model execution or approval is recorded here.
Run: mcp-contract-completeness-20261025-01

## Observed outcome

The one real T7 session used Codex CLI 0.163.0, gpt-6.1-sol and observed reasoning low. The fixture UR was approved exactly once after current technical bindings were read through MCP. There were nine MCP calls (eight inspect, one approve), five isError results, including three SDK argument rejections. Duration: 44439 ms. Reported usage: 290992 input tokens, including 251648 cached input tokens, and 1093 output tokens. Account quota was consumed; dollar cost is unavailable. No additional API-key route was used.

The original observation is unqualified: personal_config:config.toml changed. A trusted-project key for the fresh F3 fixture matches its exact command-target hash; config-attribution.json retains that read-only attribution. No before-config contents were retained, so a complete textual diff is not claimed. The trust entry remains untouched; no credential or existing session/config cleanup was attempted. No second real session ran.

The original code-wrapper auditor also rejected an ordinary Promise .then projection. The corrected auditor admits that local computation while retaining forbidden-effect checks, and accepts explicitly classified, corrected SDK input rejections. A new derived analysis of the unchanged raw trace now verifies exactly one proper UR approval, complete trace, correct model/low and no forbidden detours. It does not waive the original isolation violation or alter the original observation.

## Concrete implementation prepared within T-008

The existing Codex probe owner now runs T7 preflight and exec under macOS sandbox-exec, denying direct writes and atomic replacement of config.toml, plugins/installed_plugins.json and plugins/known_marketplaces.json. The temporary OS policy is inside the owned task directory; it is not a Codex user configuration or credential store. Account/session persistence remains with Codex. There is no fallback if the guard is unavailable. Manifests are retained before preflight, before the model invocation and after cleanup; a preflight change stops before model usage. The default host and T4 routes are unchanged. Offline regression checks use a fake Codex process and synthetic settings only; A real CLI preflight with the new guard has passed with zero model invocations and unchanged protected manifests (evidence/guarded-preflight-01/observation.json). Model execution under that guard remains unqualified until a new authorized observation.

The official CLI documentation describes --ignore-user-config as suppressing loading of config.toml while retaining CODEX_HOME authentication; it does not establish an immutable file boundary: https://learn.chatgpt.com/docs/cli/reference#codex-exec . The enforced OS write boundary and its observed offline tests are separate evidence, not an inferred documentation guarantee.

## Required owner decision and bounded proposed TP amendment

The approved TP configuration C says an infrastructure/isolation failure prevents the second session and permits at most two model sessions. Its stop condition has occurred. The substantive next decision belongs to the TP owner; UR intent, PRD acceptance, SD ownership and all MCP limits stay unchanged.

Proposal C2: renew only the native execution/evidence plan for two new fresh sequential T7 sessions using the guarded harness, the same existing ChatGPT account, exact CLI 0.163.0, gpt-6.1-sol/low, 600000 ms per session, no new API spending, installation, credential copy, retry/resume or extra model/host. This would authorize two ADDITIONAL real invocations after the retained failed first attempt, at most three real invocations in total across both cohorts. The unexecuted old second repetition is not silently reused. Record the old cohort as failed isolation; require complete, immutable-config proof in both new repetitions. Rebind candidate/harness/verifier hashes and keep all old raw evidence. Do not claim a success-rate improvement across the changed harness cohorts.

No cleanup of the existing fixture trust entry is included in this proposal. Any such change needs an explicit, separately scoped instruction; unrelated user configuration must remain protected.

After the substantive answer, use the existing approved-source TP revision owner, fresh TP presentation and a new deliberate Approval: TP. No additional real session follows from this proposal file alone.
