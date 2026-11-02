# Proposed resolution of F-002: measured Copilot payload growth

Status: proposal, not applied
Run: mcp-contract-completeness-20261025-01
Date: 2026-10-25
Owner: Arndt Gold; tp-definition

## Actual finding

The implementation adds shared command help/result checks, modern capability errors and canonical metadata consistency. Full canonical syncPackageAssets() in a fresh temporary candidate rejects with AGDF_COPILOT_PAYLOAD_GROWTH: observed 397 files/3509461 bytes; baseline 397/3495133. The increase is 14328 bytes (about 0.41 percent), with no additional payload files. The current baseline rationale explicitly says zero headroom. The guard is working, not an environment or test-harness failure.

The approved TP.md @ sha256:586f4228a3cf5e178889798659e8d0bc73f53363910f26c2a3c024d7d4c1c272, Test Plan, states: "No lockfile/dependency/version/threshold change is authorized by this TP." Its out-of-scope list also excludes changed limits. Merely recording the larger payload as a pass would violate that approved source. The zero-headroom constraint should have been identified during pre-TP packaging review.

## Concrete proposed change

Review COPILOT_PAYLOAD_BASELINE_PROPOSED.json next to this proposal. Its sole numeric change from plugins/agdf/meta/copilot-payload-baseline.json is max_bytes 3495133 -> 3509461; max_files remains 397. Its rationale states this exact measured growth and the existing authority/qualification limits. This is a new reviewed payload baseline, not a disabled growth assertion. It has not been applied to production metadata and existing guard/test behavior is unchanged.

If the user substantively accepts this direction, use the existing TP source-revision preview/apply and renewed approval route to authorize only this measured Copilot baseline reconciliation. Keep MCP definition 8192/24576, input 65536, result 1048576, cold p95 1500ms and warm p95 1000ms unchanged. Preserve exact source mappings, profile exclusions, digest validation, SDK/dependency versions and historical baselines. A later source change requires a fresh measured assessment, not automatic headroom.

If this change is declined, leave the full-profile build and QA unready. Keeping the old absolute payload ceiling would require a separately assessed payload reduction; do not remove unrelated material, minify source to conceal growth or waive checks under this Run's current authority. No approved UR/PRD/SD/TP source is edited by this proposal.

## Current evidence and limits

A fresh canonical Codex-only assembly can be built without changing this Copilot ceiling; scoped functional evidence is retained separately. It does not qualify the failed all-profile generator. Native T7 configuration/verifier passes offline mock tests, while real Codex model repetitions remain unperformed because their complete candidate prerequisites are not satisfied. No QA, UAT, release, install or publication approval is inferred.

The root workspace also has a separate preexisting incomplete dist/npm without assembly.json and a UI npm-ci ENOTEMPTY problem involving an entities/dist 3 directory. The original assembly/foreign files remain untouched; these environment facts are separate from the reproducible payload growth in the clean temporary candidate.

## Normalized finding

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-002 | plan_gap | TP | open | The approved no-threshold-change plan cannot complete its required canonical package generation under the zero-headroom Copilot payload ceiling: 397/3509461 observed versus 397/3495133 allowed | Obtain the user's substantive decision on this exact proposed baseline reconciliation, then use the existing TP source-revision owner before changing that threshold |
