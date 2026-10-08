# Code Review Defect Corrections

Run: agdf-cockpit-mcp-app-20261005-01. Date: 2026-10-06. Bound source revision: 6040aeb9-a5d6-4227-9cb3-586409624f6e.

## Scope and result

The user requested corrections to three confirmed cooperative code-review findings. These are bounded correctness fixes under approved T-004 and T-011, SCN-022/024/032/039/042/043. Approved UR/PRD/SD/TP remain byte-identical. This report is implementation evidence for those fixes, not completion of the full TP or mandatory CR, QA or release.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | Canonical full asset synchronization and Copilot profile regressions pass under unchanged budget. | none for this finding |
| CR-002 | implementation_gap | CD+Tests | resolved | Expired response is non-retryable; compact/expanded initial/retained views explain reopening and disable reads; fresh host bootstrap restores same explicit Run. | none for this finding |
| CR-003 | implementation_gap | CD+Tests | resolved | Requested route is retained across thrown and envelope read failures, tested for snapshot/run in compact/expanded views. | none for this finding |

## Production owners and corrections

- CR-001: the common Core service entry point returns to its default composition. The existing MCP cockpit factory imports its canonical Core contract/session only after Codex/target validation; the existing MCP entry point awaits that opt-in composition. Canonical projectCore omits the five private cockpit read modules from the Copilot profile only. Full npm/default/Codex projections retain canonical Core bytes. There is no duplicated Core implementation or increased payload baseline. The Copilot test imports its actual projected dispatcher/inspector, checks the unchanged two tools, and rejects cockpit activation on that surface. Current full synchronization passes with 203 files / 1711580 bytes under 203 / 1716129.
- CR-002: canonical session_expired responses are non-retryable. The shared UI preserves that exact code, explains reopening in the chat, and disables reads/selection/retry through the retired session in both formats. Prior source contents remain explicitly stale. A new render bootstrap with a new session remounts the same reader and restores its explicitly supplied Run; it sends no model context or question automatically. The existing unavailable-inventory notice renders once in the expanded view.
- CR-003: the reducer tracks the requested route separately from the last successful displayed route. It clears that pending route after a successful inventory/read, retains it on both thrown failures and null-data error envelopes, and both reload and retry use it. Initial Run identity survives snapshot and Run failures; unknown/removed IDs still fall back honestly without reading an alternative Run.

## Verification

48 UI tests, seven Core session tests, five real HTTP service tests, typecheck, browser/MCP builds, canonical full asset sync, Copilot profile, default MCP protocol language matrix, plugin MCP runtime, runtime integrity layout and control-inspect pass. Loopback HTTP tests initially encountered sandbox EPERM; the unchanged suite passed with authorized local listener access. UI tests ran with one worker and no skipped/weakened assertions. An additional snapshot-error-envelope case found during validation was corrected and the final suite rerun.

Actual fresh stdio clients pass on both protocol eras (2025-11-25 and 2026-07-28), covering the exact Run/bootstrap, invalid selectors, supersession, non-retryable expiry, same bound source/no writes, fixed UI/CSP and unchanged default tools. Final server c593b914c276f7dbe1eb089312d8fa0ab0c45636ace3e88590bfb7a0a586825b; UI sha256:47270f91722834ddad9bfabd66d54a2b7777f471d9419761415e1a4e96e5c800, 995531 bytes. Own project config remains 9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9. Previous evidence and approvals are preserved; two exactly matched named cockpit processes were stopped for initial replacement, with no ordinary AGDF server change.

## Boundaries and next evidence

The latest native exact-Run open returned Transport closed after the local runtime replacement. Fresh protocol/resource bytes are proven; current native rendered navigation is not. T-006 still needs a fresh host connection and direct Run/document/return observation. Earlier synthetic context/message acceptance remains historical and is not automatically repeated. Remaining Context Graph/context-packet/handoff work, full T-011 mapping and formal CR/QA/UAT/OR remain open. Existing graph ownership and canonical control/writer boundaries are preserved.
