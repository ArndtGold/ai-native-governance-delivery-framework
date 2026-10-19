# Native close result and effective-provider discovery boundary — 2026-10-18

Run: agdf-cockpit-plugin-integration-20261016-01.
Input revision: e374742f-6755-4b45-930a-9d5a391df683 (38).

## Actual activated candidate

Installed stable/cache UI bytes still match candidate `0.14.5+codex.local-cebb272906fd`, UI sha256:2832b1d94a43656c8af2201ade0a8b4236e621af6acbe7b542ea0534bb128d86. A fresh actual plugin call opened the established target/Run. Its native diagnostic DOM showed ui/initialize request/reply protocolVersion 2026-01-26, chatgpt 26.1013.40934, Codex MCP client 0.163.0-alpha.10.2, and provider connection b6caa25a-666e-4e41-a3dd-ab165d0cf80a at the expected immutable runtime generation 4a9dee79383de5e78b94b981fdfca85b44ff463aadc6edf8ef7962d7439524a1/0.14.5. View session f20ae025-0416-44a3-91be-d6421e1ea971; trace 5fe01132-7b76-4c7b-b333-16b206d478a4. The earlier installer pending_restart flag is historical; this fresh invocation establishes use of the new provider generation.

## Native public SDK journey

Rendered the correct project/Run, opened its registered PRD, displayed the linked-context controls, explicitly prepared/published context and observed “Kontext vom Host bestätigt. Die Frage wurde noch nicht gesendet.” No question message was sent. The already authorized bounded SDK recording and close workflow were used.

At close the actual DOM snapshot contained only the closing terminal region and status; unlike the duplicate-key reproduction, no main view or diagnostic subtree remained. The bounded lifecycle log confirms invalidate_context (47/48), Host acknowledgement of invalid context (49/51), complete_context_invalidation (52/53), validated Core close (54/55), inline request/ack (56/58), one final size notification (59), then public request-teardown (60). Subsequent public MCP App tab inventory was empty. Raw console rows: 21; parsed bounded JSON rows: 18. Some raw messages are truncated, so this is not a complete SDK transcript.

The human answered the concrete post-close question with “Verschwunden oder ruhig und kompakt”. This is positive direct observation that the newly closed card is no longer large or flickering. The answer does not distinguish disappearance from quiet compact retention; no unsupported continuous screen recording or exact disappearance latency is asserted.

The final native size notification was 32x416. This is substantially different from the previous retained expanded-container height 1987, but it does not establish correct inline width/layout during the Host transition. It remains a bounded presentation observation; the human confirmed the final acceptable visible state. The native Host's internal sizing/animation mechanism is not claimed to be understood.

## Legacy investigation and concrete remaining boundary

The first isolated public app-server inventory attempt failed before connection because sandboxing denied Codex runtime setup. A permitted escalated read succeeded. This is a diagnostic environment issue, not a plugin discovery failure.

The public full mcpServerStatus/list default inventory in a separate app-server observes global plugin agdf and agdf-cockpit, with correct pluginId agdf@agdf and exposed tools. However it omits the project legacy server, while actual target-cwd codex mcp list --json includes enabled agdf-cockpit-local. Its result therefore cannot be labeled the complete effective native project inventory. The locally generated public JSON schema supports threadId; a bounded query for this existing native chat returned “thread not found” because the separate app-server does not own the running desktop chat. No private Host connection or fabricated connection identifier was used to bridge this boundary.

The positive native render/context/close result removes the prior teardown uncertainty for this exact candidate. Complete effective project provider-origin attribution remains distinct and unresolved. Consequently no qualified transition record was fabricated and no identical invalid partial retirement was retried. Project/user configs and the enabled Legacy route remain unchanged. Existing guarded retirement predicate and rollback remain intact. Final normal-context single-provider discovery, complete CD+Tests, operational CR and QA remain pending.

Evidence: evidence/terminal-native-20261018 with SHA256SUMS.json. Continuity: TERMINAL_RECONCILIATION_REPAIR_20261018.md, INLINE_MODE_HANDSHAKE_REPAIR_20261018.md, LEGACY_CUTOVER_REVIEW_20261018.md and canonical CD_TESTS.md. Earlier sealed evidence remains intact.
