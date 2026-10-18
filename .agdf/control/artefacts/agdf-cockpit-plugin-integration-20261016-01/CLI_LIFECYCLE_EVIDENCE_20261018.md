# Isolated Codex CLI lifecycle evidence — 2026-10-18

Result: pass within the CLI lane
Authorizes: false
Run: agdf-cockpit-plugin-integration-20261016-01

## Requested scope and isolation

The user explicitly requested isolated lifecycle checks using Codex CLI. Actual installed Codex CLI 0.163.0 commands and fresh stdio App Server processes ran in /private/tmp/agdf-codex-lifecycle-20261018-bNdZgv with a dedicated child-only CODEX_HOME, AGDF_DATA_DIR and empty project directory. No model turn, extra agent or credential copy was used. App Server initialize identified this diagnostic client honestly and did not advertise MCP App UI support.

The existing normal AGDF marketplace preparation owner created disposable old/candidate marketplace payloads from read-only copies of the retained owned backup and current installed payload. Only temporary input manifest versions were canonicalized for the build-input contract; normal preparation recreated the local install version and verified its source digest against the original owned payload. Every generated MCP launcher and data path points into the isolated temporary root.

Old: 0.14.5+codex.local-fb1def114314, source fb1def114314338c2d49ac9e03eceb3f939a23e9827e189221f35d4b39c9b235.
Candidate: 0.14.5+codex.local-dc02ea9eae18, source dc02ea9eae188c0af7f20d331a581523ce246f17474f1e5654b9101b4fc18a89.

## Actual results

| Phase | Native mutation/readback | Observed plugin server offering |
|---|---|---|
| Baseline install | plugin marketplace add and plugin add | agdf, attributed to agdf@agdf; seven governance tools |
| Update | Native local marketplace remove/add with candidate source, followed by plugin add; returned exact candidate local version | agdf and agdf-cockpit attributed to agdf@agdf |
| Disable | Supported config/value/write set plugins."agdf@agdf".enabled=false in the isolated config; fresh CLI and App Server | No AGDF plugin servers |
| Re-enable | Same supported config writer set enabled=true; fresh CLI and App Server | agdf and agdf-cockpit reappear with correct plugin attribution |
| Remove | Native plugin remove agdf@agdf --json; fresh CLI and App Server | No AGDF plugin servers; candidate plugin cache removed |

Every mutation was followed by actual codex mcp list --json and a fresh actual mcpServerStatus/list request, with no pagination and no toolsError for plugin rows. Governance discovery returns all seven expected tools. Cockpit tools/resources remain hidden because this CLI client does not declare App UI support; this is capability gating, not a failed plugin or a rendered Cockpit. Host runtimeStatus was null and is not claimed as a positive process-liveness observation.

The update route is the supported native refresh/reinstall route for a local marketplace, not a fabricated invocation of Git-only marketplace upgrade. Both enablement write responses name the isolated config path. A separately disabled foreign lifecycle_canary MCP configuration survived all plugin operations unchanged in its effective readback.

## Preservation and evidence

Production before/after SHA-256 canaries are identical for the real project/user configs, owned current/backup marketplace identity/declaration/manifest files and current marketplace transaction. This is a bounded 11-file preservation check, not a complete filesystem or all-foreign-plugin inventory. No real legacy entry was disabled and no production publication journal was settled. Existing source and its automated test results were not changed.

Raw command argv, child environment overrides, exits/stdout/stderr, actual stdio JSON-RPC transcripts, status/config readbacks, production canaries and helper scripts are sealed in evidence/cli-lifecycle-20261018/SHA256SUMS.json. Rejected setup/dependency attempts are noted; they did not execute a lifecycle phase or modify production. Temporary state is retained for reproducibility.

## Boundary and disposition

This completes the requested isolated CLI lifecycle lane. It supplies additional lifecycle evidence toward T-008/SCN-014 but does not mark the approved native N-LIFECYCLE scenario complete: no desktop rendering, UI initialization, interaction or native teardown occurred in these CLI checks. N-SAMEKEY native isolation and CPI-E01 remain open. The previously documented Host-dependent native closing limit and explicit compensating cleanup remain as recorded in HOST_EVIDENCE_LIMIT_20261018.md, NATIVE_CLOSE_OBSERVATION_20261018.md and NATIVE_PANEL_EVIDENCE_20261018.md. No acceptance criterion was silently changed or waived by the requested CLI test.

CD+Tests remains revise. Guarded production legacy retirement, final settlement and mandatory final CR remain pending. CODE_REVIEW_PRELIMINARY_20261018.md remains a focused interim source review, not the final CR step.

Next permissible step: finish the remaining native evidence obligations through their supported host paths before the guarded exact legacy cutover and final Code Review.

## Documentation sources

Official OpenAI cookbook: https://developers.openai.com/cookbook/examples/partners/harness_aware_plugin_evals/harness_aware_plugin_evals#the-codex-provider-setup
Official App Server API: https://learn.chatgpt.com/docs/app-server#api-overview
Installed CLI help and generated protocol schemas were used to verify the concrete installed commands and config writer shape. Documentation establishes interfaces only; raw local results establish these observations.
