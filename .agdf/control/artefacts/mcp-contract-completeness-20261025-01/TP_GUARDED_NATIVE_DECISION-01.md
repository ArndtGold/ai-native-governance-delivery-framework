# F-004: Owner decision on two additional guarded Codex sessions

Run: mcp-contract-completeness-20261025-01
Date: 2026-10-25
Owner: Arndt Gold
Evidence class: caller-forwarded deliberate instruction; cooperative local, no independent human-origin proof

## Exact user decision

"Ja, erneuere den TP für zwei zusätzliche, geschützte Codex-Durchläufe mit gpt-6.1-sol und Reasoning low. Die MCP-Limits bleiben unverändert."

This directly accepts NATIVE_FOLLOWUP_PROPOSAL-01.md configuration C2: two ADDITIONAL fresh sequential T7 sessions with the protected existing host owner, Codex CLI 0.163.0 on darwin-x64, gpt-6.1-sol/low, 600000 ms per session, existing ChatGPT account and no additional API-key spend. At most three real model invocations within this Run across the retained failed first cohort and the two new sessions; the old unexecuted second repetition is canceled, not silently resumed. No automatic retry/resume, quota purchase, new account/model/host, installation or credential copying. Normal account quota is consumed and actual usage must be reported; dollar cost remains unavailable unless observed.

## Unchanged approved upstream sources

- UR.md @ sha256:90da41de9d341e20349f682f49b7f23511d869351e71aac699aa8d530860c47a
- PRD.md @ sha256:2a0c4a464e97c0df1a0e72544c9c98073f98273d7e24d7ad67e3e6b85d089dfa
- SD.md @ sha256:04adc7913d3889900fb3594167e0e800c7cce4a9481286119c12faf88b14788f
- Affected approved TP.md @ sha256:b928e629d5073e5faf23fb8bf869d73135314303f89411afc8aee8ae6331e2f6

Only TP's native execution/evidence plan changes from configuration C to C2. The original infrastructure/isolation stop was honored. The original native observation and raw traces remain immutable and unqualified; derived parser repair does not waive the personal-config violation. The existing fixture trust entry remains untouched; this answer authorizes no global configuration cleanup.

## Execution boundary and evidence

Use the prepared macOS OS write guard for config.toml, plugins/installed_plugins.json and plugins/known_marketplaces.json across preflight and exec; retain manifests before preflight, before the model call and after cleanup. Guard absence or config change stops without fallback. The model-free guarded real CLI preflight already passed with zero model invocations (evidence/guarded-preflight-01/observation.json), and direct/atomic write denial and preflight-only/no-model behavior passed offline in evidence/implementation-03/. Real model execution under this guard remains pending.

Preserve every MCP size/performance limit (8192/tool, 24576 combined command/decision, input 65536, result 1048576, cold p95 1500ms, warm p95 1000ms), fixed 20+20 samples, SDK/dependency versions, five command families and approval/effect semantics. Preserve the Copilot 397-file / 3509461-byte zero-headroom baseline. Retain prior deterministic results with exact applicability assessment; renewed TP and Brownfield preparation precede further model execution. Renew candidate/harness/verifier bindings and assess both new repetitions, retaining all failures. No improvement or cross-cohort success-rate claim is authorized.

F-004 is answered in substance by this direct owner instruction. It is not the exact Approval: TP reply for a future newly recorded and presented TP. The current approved TP must be reopened through its existing source-revision owner and freshly approved. E-001 remains open until the two qualified sessions actually exist. No QA, UAT, release or VCS authority follows from this answer.
