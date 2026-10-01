# Codex portable MCP discovery repair

Date: 2026-10-01
Scope: agdf-portable-plugin-package-structure-20261001-01
Authorization: user "fix it" for the missing AGDF connection and its production cause.

The installed plugin was enabled and its server answered directly, but Codex did
not discover AGDF: the recognized portable root lacked `mcp.json`. Its fallback
declared `mcp/codex.mcp.json`, which cannot replace portable component discovery.
The current official packaging contract describes this boundary:
[Build plugins](https://developers.openai.com/plugins/build/plugins).

The existing provenance renderer now owns a portable root `mcp.json` with explicit
`stdio` transport. The existing installer completes absolute launcher/data paths;
the builder prunes the former file. Manifest/profile and standalone integrity
validators enforce that projection. Exact owned MCP projections are normalized;
command, schema, environment, transport and surface changes remain hash-bound.
Historical nonportable declarations retain their original digest semantics. No
new public MCP capability, package or control authority was introduced.

`BASELINE_AND_DELTA.json` records the before state and exact shared-owner growth
of 276 bytes. The Copilot inventory is 136 files / 1275270 bytes, with the exact
ceiling and no additional runtime files. Public/source profiles omit MCP; Claude
keeps its declared `mcp/claude.mcp.json` profile. Existing staged duplicate removals
are unrelated and were preserved.

`CHECKS.json` and its logs record passing release preparation, Codex and Claude
MCP/profile, marketplace, Copilot, runtime, local preparation, package contents,
local installation fixtures, runtime integrity layout and negative checks.
The actual user installation through `npm run install:codex` also exits 0.

`INSTALLED.json` records enabled version `0.14.5+codex.local-c34709e47444`, matching
root/fallback identities and the root MCP declaration. Codex CLI now lists AGDF
as enabled. Installed standalone integrity passes. `SERVER_PROTOCOL_BEFORE.json`
and `SERVER_PROTOCOL_AFTER.json` distinguish server health from discovery: both
list `agdf_dispatch` and `agdf_inspect`; the latter actually inspects the named
physical-boundaries run through the installed runtime with matched provenance.

A separate fresh CLI model probe failed before model/tool invocation because the
desktop-configured model `gpt-6.1-sol` is unsupported by that CLI account route.
The probe also used an invalid quoted plugin-key override. Its stderr/events are
preserved; no persistent model or tool policy was changed. This does not establish
a fresh model invocation. The current desktop chat's tool inventory still lacks
AGDF, and the successful installer requests restart/fresh-session activation.

The prior QA pass is archived in `PRIOR_QA_REPORT.md` and marked superseded in the
canonical report/state. Current qa-gate revalidation is pending. No new QA, UAT,
release, publication or VCS approval is inferred.

The separate `agdf-physical-package-boundaries-20261001-01` remains at SD with its
UR/PRD approvals preserved. This repair does not implement that migration or
transfer the earlier run's SD/TP approvals to it.

Reusable component-discovery knowledge is reconciled into existing
`CG-PUBLIC-PLUGIN-DISTRIBUTION`, architecture documentation and payload history;
exact cache/runtime/probe tuples remain evidence of this repair snapshot.
