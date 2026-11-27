# CD+Tests: Chromium Companion continuation

## Decision
- decision: pass

## Result
All twelve browser scenarios passed on the corrected candidate in 21 test variants. The full SDK browser file passed 27 of 27 tests, including the six existing SDK scenarios. The built UI digest was sha256:d8f2230a7d770600d9ad558e2c32079df8f4b89eb704ceba359b6aceb3857e2b. The evidence records the source baseline, fixture digest, selected Run, events by source and final visible outcome for every variant.

## Resolution of SCN-009
The reproduced cancellation issue was corrected on the linked implementation Run. The selected Run keeps the original grant locked on an Interrupt. It displays “Der Abbruch wurde angefordert.” while confirmation is outstanding, including after reload. A foreign Stop leaves it locked. A matching Stop releases the original claim after the existing mutation checks. The action reappears without a second user message or work grant.

SCN-009 now distinguishes the interruption request from the confirmed end of that same attempt, as requested in the follow-up. The earlier assertion expected a fresh start from the Interrupt signal alone. The new case checks that restarting is unavailable in that interval and that it becomes available automatically on confirmation. The ordinary competing route was refused in the interval. Both before and after evidence are retained.

## Other cases
SCN-001 through SCN-004 covered isolated selection, stale and foreign bindings, 360-pixel keyboard and pointer input, publication and one matching fixture read and marker reply, including replay. SCN-005 and SCN-006 produced one winner across two Browser views and against ordinary dispatch in both orders. SCN-007 and SCN-008 preserved the original attempt across reopening and manual status checks. Explicit pre-publication cancellation allowed deliberate retry. SCN-010 through SCN-012 covered retained predecessor state across simulated candidate change, missing evidence versus measured zero, duplicate messages and complete versus partial fixture evidence.

## Evidence
[Corrected candidate and 21 case records](../evidence/browser-continuation-after-interrupt-fix.json), SHA-256 12f39601eab99555188ebdce047d6ddf6ffd40168813751b738f43216cfaed1f. [Original reproduction](../evidence/browser-continuation.json), SHA-256 11e7e5b214a08f25578b514aa61b142bd018a1e0285ee94841b45dd0c7f6dfbb. Run the Chromium suite with `npm --prefix packages/control-ui run test:browser -- sdk-trace.spec.mjs` after building the MCP UI. The typecheck and build passed. The final serial component suite passed 441 tests. An earlier parallel component run missed one Reader session-expiry notice. Its 48-test file also passed in isolation. The Core and MCP checks passed 26 tests.

## Limits and next step
These are browser clicks with a simulated SDK host, bounded fixture receiver and simulated lifecycle inputs. The linked continuation Run retains responsibility for native qualification. Proceed to mandatory code review of the browser-test delivery.
