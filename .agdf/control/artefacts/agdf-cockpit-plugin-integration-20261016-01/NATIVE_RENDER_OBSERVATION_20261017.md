# Native inline Cockpit observation and reported missing-card diagnosis

Run: `agdf-cockpit-plugin-integration-20261016-01`.
Delivery binding: revision 15, `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`.
This is a supplementary execution observation; existing sealed CD+Tests reports remain intact.

The user reported that no Cockpit card appeared and requested a repair, supplying a screenshot. That screenshot visibly shows a rendered inline **AGDF Cockpit** for **Deliver Cockpit through the AGDF plugin**, with **Nur Lesen**, **Umsetzung und Prüfung**, and the four approved UR/PRD/SD/TP document links. It also shows the **Run ansehen** and **Alle Vorhaben** navigation controls. The observation therefore does not reproduce a missing-card rendering failure. It establishes visible compact Run-detail rendering, not complete native qualification or successful interaction with those controls.

The recorded invocation used `mcp__agdf_cockpit__agdf_cockpit`, with explicit original project and the established integration Run. It did not invoke `agdf-cockpit-local`. This exact Run binding is required by the tool's contract when a conversation Run is established.

The current source explains the start view: `packages/core/lib/control-inspect/cockpit-session.js` passes the supplied Run as `_meta.agdf_cockpit.initial_run_id`; `packages/control-ui/src/mcp/EmbeddedEntry.tsx` passes the bootstrap to `App`; `packages/control-ui/src/App.tsx` selects `detail` when `initialRunId` exists. `packages/control-ui/src/mcp/CompactCockpit.tsx` provides `Run ansehen` to request an expanded host display and `Alle Vorhaben` to navigate to the overview. The model-visible opening result contains only the safe target identity; private session/bootstrap metadata is carried separately. That minimal model result is not evidence of an empty UI.

No failing call or rendering defect is established by the supplied observation. No source, installed cache or default routing was changed merely to force a different starting view. The reviewed installed tuple remains applicable. A fuller Cockpit view should be requested through the existing **Run ansehen** control; the next user-operated check is to click it and retain the resulting view or an actual error.

Evidence is in `evidence/native-manual-20261017/`: recorded plugin invocation, pre-open configuration/control digest inventory, post-restart plugin/server screenshots, this user-supplied inline screenshot, and `inline-run-render-observation.json`. All previously inventoried config and control files remain byte-identical; Run artefact evidence is excluded from that read-only preservation comparison.

Raw `ui/initialize`/initialized traffic, navigation/document reads, refresh, context transfer, expanded display and teardown are not yet captured here. Clean/same-key/disposable native lifecycle scenarios and guarded legacy retirement remain outstanding. This note does not grant or claim a completed migration, final CD+Tests pass, QA, UAT or OR.
