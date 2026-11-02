# Codex plugin discovery correction — 2026-10-18

- Run: `agdf-cockpit-plugin-integration-20261016-01`.
- Input revision: `eedd641d-b476-48bd-9c5e-1d1151b5758f` (28).
- Scope: approved TP implementation defect; no source approval or acceptance change.

## Reproduction and correction

The Codex plugin Cockpit server returned an empty `tools/list` before its peer advertised the MCP Apps UI capability. This prevented initial discovery of the tool metadata needed to select the UI-capable invocation route. A regression against the preceding source failed with actual `[]` instead of `agdf_cockpit` and `agdf_cockpit_read` (test line 89, 2025-11-25 protocol).

The Codex plugin now advertises both descriptors and their UI resource metadata before UI capability negotiation. Execution and resource access still require the declared UI capability: render/read calls are refused before execution, resources/list is empty and resources/read denied without it. Advertising allocates no view. Claude gating and standalone legacy behavior remain unchanged. The approved SD explicitly separates capability advertisement from observed rendering qualification, and requires the capability before allocation; both requirements remain intact.

The earlier HOST_BROWSER_TARGET_DIAGNOSIS_20261018.md remains evidence of that separate browser access attempt. Its conclusion that no AGDF defect had been demonstrated is superseded for initial tool discovery by this reproducible server defect. This correction does not claim to fix or qualify native browser-target registration or teardown.

## Verification

Node 22.22.3 in the dependency-equipped isolated verification checkout:

- Updated cockpit-gating regression against old server: exit 1, expected empty-discovery failure.
- `node test/cockpit-gating.test.js`: exit 0 after correction, both 2025-11-25 and 2026-07-28 protocol eras; no-UI calls still denied and execution marker unchanged.
- `node test/protocol.test.js`: exit 0.
- `node test/decision-resource.test.js`: exit 0.
- `node test/contract.test.js`: exit 0.
- Final `node test/generation.test.js`, after normal plugin regeneration: exit 0; actual owned child IPC, exact manifest qualification, capacity, control replay/conflict and acknowledged real-exit retirement. Synthetic host only.
- `git diff --check`: exit 0.

An earlier generation attempt in the installer-only copy lacked the dev-only MCP client dependency. It was rerun successfully in the dependency-equipped checkout against the final generated source, not bypassed. Exact server source SHA256 `ab9396df0ea809ce57313a3b98f1a48b847ce03ced47d5b19e7a60378fc69878` matches repository, verification source, generated package and installation candidate.

## Installed result and remaining boundary

The normal owned rollback settled the preceding pending publication and restored its original rollback point. Public Codex CLI refreshed only the AGDF marketplace registration; foreign registrations were checked unchanged. The normal installer then verified `0.14.5+codex.local-a60e6fe16420`, source `a60e6fe16420c3ebc59f64bcf687980f74b8a684a67b17baf7158ad3e6983d34`, with matched stable package, native cache and immutable runtime. The server digest is `ca56e31c2545939543002071d73453dcac9ccacf24a87c815179b32e0ea49c88`. Core, dispatcher, SDK and UI bytes remain unchanged from the preceding tested candidate; the exact tuple is retained in evidence.

Installer result is `partial`, failure null, version verified, activation `pending_restart`, reason `plugin_reload`. The current chat still exposes only the legacy Cockpit pair; the integrated pair is absent. Neither pair was invoked during this increment. This is not native plugin invocation/render/teardown proof. Project and user config hashes are unchanged; the actual legacy provider remains enabled pending qualification. No qualified publication or legacy retirement was asserted. CD+Tests remains revise; final mandatory CR/QA are not yet reached.

Next: activate the installed candidate by restarting Codex, verify the integrated tool namespace and exact provider tuple, then continue the native evidence and normal guarded legacy owner. Never substitute the legacy provider when the integrated pair is missing.

Evidence: `evidence/plugin-discovery-fix-20261018/` and its SHA256SUMS. Continuity: `HOST_BROWSER_TARGET_DIAGNOSIS_20261018.md`, `VIEW_CLOSE_REPAIR_20261018.md`, `NATIVE_PUBLIC_SDK_TEARDOWN_RESULT_20261018.md`, `CLI_LIFECYCLE_EVIDENCE_20261018.md`, `LEGACY_CUTOVER_REVIEW_20261018.md` and canonical `CD_TESTS.md`. Historical evidence is not transferred as qualification of this candidate.
