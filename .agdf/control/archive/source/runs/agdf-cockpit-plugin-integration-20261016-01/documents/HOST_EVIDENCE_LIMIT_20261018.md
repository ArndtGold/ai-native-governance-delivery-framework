# Host-dependent native closing evidence limit

Date: 2026-10-18
Run: agdf-cockpit-plugin-integration-20261016-01
Classification: host-dependent evidence limit
Authorizes: false

## Bounded finding

The actual Codex Desktop host observation records a change from fullscreen to inline with reason `tab_close`, rather than confirmed destruction of the native App. The panel disappeared from the supported MCP-App tab inventory, but the observed Core view session still answered a subsequent read. The captured host logs contain no native teardown request/reply or registration-removal confirmation for this observation.

This is a host-dependent limit on the available closing evidence. It is not a demonstrated Cockpit implementation defect. A host defect is also not established: the observed close action may intentionally return the App to an inline instance instead of terminating it. Root cause remains unconfirmed.

## Confirmed cleanup and evidence

The agent subsequently closed the exact observed session through the existing owning plugin reader. Core acknowledged closure and rejected a subsequent read with `session_expired`. This proves the explicit compensating cleanup, not native host teardown.

Source: `NATIVE_CLOSE_OBSERVATION_20261018.md`; raw host and Core observations: `evidence/native-close-20261018/`. Successful native initialization, exact TP reading, provider correlation, context publication/invalidation and refresh remain separately evidenced by `NATIVE_PANEL_EVIDENCE_20261018.md` and `evidence/native-panel-20261018/`.

## Disposition

Existing finding CPI-E01 remains an open `evidence_gap` routed to `evidence_obligation`. This note narrows its interpretation; it does not relabel it as an implementation defect, mark a missing test passed, waive approved TP requirements or establish native qualification. The separate clean/isolated/disposable native scenarios remain open as recorded.

No product source or approved UR/PRD/SD/TP changes are made. No additional TP approval is needed for this documentation. CD+Tests remains revise; legacy retirement, final publication settlement and mandatory final CR are not completed by this note.

Next permissible evidence action: obtain a supported native host teardown observation with session-cleanup confirmation, keeping actual host behavior, captured evidence and any later root-cause diagnosis distinct.
