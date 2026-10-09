# Native observation — evidence open

Run: backlog-status-flow-clarity-20261009-01
Scenario: SCN-026; T-007/T-009. Finding: BSC-NATIVE-001.

The supported MCP Apps surface was inspected through CUA getBrowser(id=mcpapps), tabs.list(), tabs.get(1) and domSnapshot(). It exposed the already open “Agdf Cockpit Local MCP Agdf cockpit” tab. Its visible state showed 9.10.2026 12:07:45, 59 active entries, a “Neuer Stand verfügbar / Aktualisieren” banner and disabled controls; the newly approved Run was absent. The prior generic “In Progress” rows remained visible. This is a stale earlier native observation, not evidence that the new summary resource rendered.

The visible sandbox URL identified initId e72b6d1d-d8d0-43a8-b022-f10dd9575836 and sandboxId source-b74a278f7bf713ee. No current runtime/UI/resource digest was verified in that native view. No native screenshot, keyboard/scroll/error sequence or fresh new native resource result is claimed. No installer, profile registration or host configuration was changed. The prepared current source test payload is described in READ_PROTOCOL.json; it is deliberately not treated as an installed native bundle.

Required observation: capture a fresh supported native MCP App for this exact approved increment, verify its resource URI and runtime/UI digests against the prepared current source, then observe compact/expanded QA-evidence meaning, direct complete action/limitation at narrow/wide widths, keyboard sources/selection, downward scrolling with delayed title loading and visible retry/reload. Preserve displayed Run/revision/observation and source identity in Run-local evidence, refresh applicable reviews and rerun QA. Any installation/configuration prerequisite requires its own explicit authorized scope; this TP does not grant rollout authority.

No finding or report belonging to gate-internal-continuation-recovery-20261008-01 is closed or changed. Its QF-001 remains owned by that Run.

## Final corrected candidate for the already authorized local refresh

The report-count and same-visible-text writer corrections are both included in `dist/local/backlog-summary-complete-20261009/preparation.json`. The earlier native restart observations remain identified historical/partial proof, not a current corrected-candidate claim. Follow the complete supported Codex compact/expanded narrow/wide/source/selection/keyboard/scroll/retry sequence above with this exact candidate. Verify the selected Run's committed revision and saved comparison as matching; the detail disclosure and work summary must both name the supplied open count as report findings. The empty Run-document evidence list must be explicitly scoped rather than presented as no QA work. Current two report-local BSC-NATIVE-001 observations must not be asserted as two distinct tasks. Unsupported or failed native controls remain evidence gaps; stop on identity mismatch, source change, unexpected counts, focus/scroll jumps or flackering. The host must restart and reopen after the existing connection is updated; a stdio resource check does not prove native rendering.

{
  "node": "/usr/local/Cellar/node@22/22.22.3/bin/node",
  "entrypoint": "/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/dist/local/backlog-summary-complete-20261009/runtime/0.14.5/node_modules/@agdf/mcp-server/bin/agdf-mcp.js",
  "ui": {
    "schema_version": "1",
    "uri": "ui://agdf/cockpit/v1.html",
    "mime_type": "text/html;profile=mcp-app",
    "bytes": 1062823,
    "digest": "sha256:86061b0cdd12613d4bed1dc16956cb031d6f718620b04374c20ab289fe10967e"
  },
  "server_digest": "8bf2dd8dd57c4979de8f3442cf65b7dbc73eb85be293b12c12d876097eef0a06",
  "dispatcher_digest": "368e45579616d2b28471aeba6ea390ea98e07e1614b995d68f775cf9c141f59c",
  "sdk_digest": "02e7212cc00a844c08ac190c572b98dd9aa52671936cb4900808460d44c543d9",
  "activated": false,
  "authorizes": false
}

## Final supported observation completed

At Run revision 32 (5e3cf847-10ec-48a8-95e0-6634700c25dd), the fresh Codex MCP App exposed initId fc5b48db-2f81-4833-ba4e-46f43f76fd03. Its full module was acquired in bounded read-only DOM chunks and matched the prepared module exactly: 674078 characters, sha256:08da0cf3f858df7495f0a656d8d70d8a93bfbf4890a623274526e7a6bd20a79c, in UI resource sha256:86061b0cdd12613d4bed1dc16956cb031d6f718620b04374c20ab289fe10967e. The installed dispatcher provenance is matched and its corrected writer matches source (FINAL_LOCAL_INSTALLATION.json). Fresh served state identifies this exact Run/revision and comparison matching (NATIVE_QUALIFICATION_STATE.json).

Actual supported native DOM observations showed TP Review; closing it returned to the selected summary with both counts expressed as 2 report findings, BSC-NATIVE-001, scoped empty Run-document gaps, full next action and matching saved/current revision. The overview capture contains the saved QA-evidence-open row with complete action and explicit saved-only limitation. The compact and controlled delayed/error states remain covered by the final fixed-build component/Chromium tests; they are not represented as injected native failures.

The user then directly confirmed the requested current-view sequence (narrow/wide resize, Tab/Enter disclosure and document open/close, downward/return list scroll and reload): “Alles stabil geprüft”. This is human-reported native interaction evidence, not synthetic keyboard/scroll automation or QA/UAT approval. Direct DOM inspection and exact identity corroborate which candidate that confirmation refers to. A subsequently changed/destroyed tab was relisted and briefly rebound; stale handle attempts were not counted as successful actions.

NATIVE_FINAL_IDENTITY_AND_CONFIRMATION.json records exact proof boundaries and the confirmation. native-final-detail.txt/png contain the real overview captured during user navigation despite their initial filename. Together with the existing fixed-build compact/expanded narrow/wide/delayed/error browser tests, this fulfils the Run-local current-host readability obligation SCN-026. No other Run's finding is resolved and no broader host/platform guarantee is claimed.
