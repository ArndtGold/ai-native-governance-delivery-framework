# Brownfield Analysis: Chromium Companion continuation
Decision: pass
Mode: pre_implementation_analysis
Date: 2026-11-22
Reviewer: Codex

## Approved scope
The renewed TP defines twelve scenarios for the built card in Chromium, with a local SDK host and disposable Runs. Its canonical binding is sha256:2ec0e2bb2c755639754d74deaaa4c22421114f34bb3e6724ced817b7f6e1b108. Source baseline aa73dfbad75d367d42c635dfdd24317ecac9df72. The previously scoped native workflow is excluded.

## Current coverage and reuse
The first case in packages/control-ui/test/browser/sdk-trace.spec.mjs already renders fixture F04 through the built UI and real SDK in Chromium. It observes a keyboard activation, an actual host message and a pending handoff across reopen. The page-local log is lost on reload. Retain those assertions and promote the prior pointer and two-view experiments to durable tests. Reuse the existing SDK AppBridge host and Chromium configuration. Use an external per-case journal for lifecycle-spanning observations with explicit source coverage.

Core owns eligibility in codex-continuation-binding.js and atomic service transitions in codex-continuation.js. packages/mcp-server/test/companion-continuation.test.js demonstrates the ordinary dispatch and receiving dispatch sharing a private admission directory. Use the original bound call and observe fresh work_admission. Read only the selected test Run status and return its marker. Browser views in the same case share a store and receive distinct sessions. Exclude unrelated selectors before test dispatch, compare target and run in all joins, and label simulated lifecycle and candidate changes. Preserve the previous admission record while rolling over the simulated view generation.

## Impact and risks
Product UI, public APIs, control schema, qualification records and native Desktop integration require no changes. Test fixture, SDK host and browser spec ownership stays with test integration. The primary regression risks are counting a send permit as a send, mistaking a page reload for zero prior events, and letting independent stores produce two winners. Assertions distinguish gestures, bridge sends, permits, grants and replies and exercise both ordinary race orders. Unavailable outcomes remain unknown. The Context Graph has no new product or authority boundary.

## Next step
Implement the fixture and twelve browser scenarios in the approved TP, then run Chromium and supporting checks on the same build. The pass decision establishes readiness for that work. Browser results and simulated receiver completion are still to be collected.