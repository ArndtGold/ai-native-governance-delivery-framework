# Guard revision proposal

Status: proposed; not implemented or approved

The approved TP's outer original-ROOT sandbox encloses the unchanged harness's own immutable-settings sandbox. This host refuses the second sandbox application with exit 71 and `sandbox_apply: Operation not permitted`. The original harness consequently emits its broad `EXISTING_CHATGPT_AUTH_UNAVAILABLE` error before Codex starts. Account invalidity is not established. All model invocations and cohort reservations remain zero.

The recommended bounded design is **one** macOS sandbox application for the whole candidate cohort, carrying both the original ROOT subtree write denial and all three existing global-settings literal write denials. Every harness, MCP and Codex child inherits that same protection. Keep normal owned candidate/fixture writes and existing account/session persistence allowed. Verify denied append-opening of existing protected files without writing, an owned temporary positive control, exact policy digests and before/after snapshots before any model invocation. Do not replace the OS guard with a cooperative promise or remove any protected target.

This requires the existing native-harness execution owner to avoid nested sandbox application and fail closed when the inherited protection cannot be proven. The prompt, task, strict/original predicates, trace parser, wrapper audit, model/effort, two-session allowance and every MCP/Copilot limit stay unchanged. No global configuration, credentials, installation or project VCS action is proposed.

The earliest affected approved source is **SD**: Compatibility and qualification design / SDD-006 currently requires the native guard to remain unchanged. TP also explicitly requires an outer sandbox plus the existing guard and forbids weaker fallback on incompatibility. Renew that concrete SD execution design and then its dependent TP/harness fingerprints through the canonical approved-source revision path. Keep UR/PRD intent and acceptance unchanged; retain this Run's code and evidence subject to exact applicability reassessment. Do not launch further qualification commands under a substituted guard before renewal.

Evidence: evidence/qualification/guard-stack-diagnostic.json; preflight-02/native-preflight/observation.json; preflight-02/result-from-retained-evidence.json. The original observations are retained byte-for-byte and have not been rewritten.
