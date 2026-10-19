# Native closing observation and compensation — 2026-10-18

Status: partial
Gate effect: CD+Tests remains revise. This is not a qualified transition or mandatory CR completion.

## Actual observations

The user deliberately confirmed both right panel and Cockpit card closed. Fresh CUA tab inventory was empty. Actual host App ID from the received model-context event was session:e287e9a1-2037-45eb-b093-61ac8206a6ec; it is used solely as a locator and grants no authority.

Corrected the bounded host-log collection window to 06:24:28Z. The prior 06:24:30Z window had excluded the actual session-created event at 06:24:29.155Z. This observation does not establish durable SDK logging: no matching SDK packet logs were captured. The preserved public daily host log rows show creation and a display_mode_changed event at 06:31:45.530Z, fullscreen to inline, reason tab_close. They do not show registration removal or a teardown request/reply. There are no WebMCP tools in the exposed native document, and the supported MCP-App control API cannot close it.

A read-only snapshot request to the exact observed Core view session 4032a7d7-5f13-4e6f-bda4-9c59398c3f22 still succeeded at 06:32:14.409Z. Therefore automatic native session closure was not confirmed. No native teardown success or product defect is inferred solely from disappearance of the panel/user confirmation; an inline instance may remain mounted.

To respect the user's intent to close this view and release its bounded resources, the agent then used the existing owning plugin reader operation close for this exact session. Core acknowledged data.closed:true. A subsequent snapshot request returned state:blocked, code:session_expired, retryable:false. This is explicit model-tool compensation, not a native UI teardown or synthetic substitute for that missing observation. Prior actual native context invalidation had already received both host and Core confirmation.

## Source review and preservation

CODE_REVIEW_PRELIMINARY_20261018.md records a focused interim source review, with no confirmed actionable defect in the inspected scope. Mandatory final post-CD+Tests CR remains missing. The 58 inventoried source/test/build changes are identical to the tested snapshot. No product source changed in this continuation, so the existing automated results were not needlessly rerun. Project and user config hashes remain the previously recorded values. No qualified transition record, legacy disable, publication settlement or later-gate completion was performed.

## Remaining requirement and next action

CPI-E01 stays open: capture actual native view teardown/session cleanup through a supported host SDK path and finish the required clean/isolated/disposable native contexts; then perform the guarded exact legacy transition and final CR. The public installed SDK exposes requestTeardown(), but its notification only asks the host to tear down and does not guarantee acceptance. The current UI exposes no such diagnostic control; it was not invoked or claimed tested. No guessed protocol injection, hidden host API, configuration bypass or forged observation was used. Further opening/closing of the same inaccessible inline instance alone would not supply the missing proof.

## Evidence

Raw wrapper results, exact App-ID daily-log subsets, empty tab observation, source inventory/patch and config readback are in evidence/native-close-20261018. Previous sealed evidence is unchanged.
