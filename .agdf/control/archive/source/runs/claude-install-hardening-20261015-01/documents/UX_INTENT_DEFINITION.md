# UX Intent Definition: Harden the Claude installer against stale and shadowed installations

Status: ready
Decision: ready
Based on: approved UR (claude-install-hardening-20261015-01, revision 3650f149) and BROWNFIELD_REVIEW.md
Date: 2026-10-15
Owner: Arndt Gold

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The install capability gains a refusal blocker inside packaged apps, `healthy` gains content-verification meaning, post-commit recovery changes, and Claude sessions may receive runtime facts and a drift notice.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Install or update AGDF for Claude once and be able to trust that every new Claude session (Claude Desktop or terminal Claude Code) runs exactly that installed AGDF state.
- success_signal: The install result is `healthy` only when the state Claude loads matches the installed content; any other outcome names its cause and the single remedy, and a new session either shows no drift notice or explains the mismatch.
- primary_decision_or_action: Run the Claude install from an ordinary terminal and act on the reported result (proceed when healthy; follow the named remedy otherwise).

## 3. Working Modes And State

- working_modes: (M1) install from an ordinary terminal; (M2) install started inside a packaged app such as a Claude Desktop session; (M3) repeated install with unchanged or changed content; (M4) install whose post-commit cleanup fails; (M5) Claude session start in Claude Desktop or terminal; (M6) `runtime-checks status --surface claude`.
- effective_state_by_mode: M1 `healthy` when committed and loaded content digests match, otherwise `degraded`; M2 `refused` before any change; M3 unchanged content keeps the installed state without uninstall/reinstall, changed content reaches the loaded root and is verified as in M1; M4 `degraded` with the new state committed and cleanup pending; M5 `matched` (no notice) or `drift` (notice), plus runtime facts while the plugin is enabled; M6 `enabled` only when sessions actually receive the check results, otherwise the truthful lower state.
- visible_state_types: install result status with evidence entries and a remedy line; refusal error with cause and remedy; SessionStart context lines (dispatcher binding, runtime facts, drift notice) that the agent relays to the user; runtime-check status output.
- effective_state_authority_by_mode: M1/M3/M4 the installer verification against installed provenance; M2 the packaged-app preflight; M5 the loaded plugin root's provenance compared with the installed record, and Claude plugin enablement as runtime-check consent; M6 the same consent evaluation used by M5.
- primary_state_presentation_owner_by_mode: M1–M4 the AGDF install CLI output; M5 the agent in the session, from the SessionStart context; M6 the runtime-checks CLI output.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: `npm run install:claude` (local checkout) or the published `npx @agdf/cli claude` install; any new Claude session start; `runtime-checks status --surface claude`; deactivation of the session check through `claude plugin disable agdf@agdf`.
- blockers: install inside a packaged app (refused: "install from a terminal outside <app>"); content digest mismatch after install (degraded, both digests and remedy shown); a stale or foreign package-private copy that cannot be retired (degraded, package named, remedy shown); post-commit cleanup blocked by running sessions (degraded, sessions named, "close them and run the installation again"); Claude Code CLI unavailable (existing executable error).
- recovery_paths: rerun the install from an ordinary terminal; close or restart Claude Desktop and running Claude Code sessions, then rerun; a rerun completes pending cleanup and reports `healthy` without re-installing unchanged content; a session showing a drift notice is resolved by restarting the app, or by reinstalling from a terminal when the notice persists. Transient lock failures are reported as retryable with the same rerun action.
- relevant_state_transitions: refused → (rerun outside the package) → healthy; degraded (digest mismatch or stale copy) → (restart/reinstall per remedy) → healthy; degraded (cleanup pending) → (next run) → healthy; session drift → (restart or reinstall) → matched; plugin enabled ↔ disabled toggles runtime facts on/off.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria:
  1. An install started inside a packaged app makes no change and reports the cause and the remedy in one message.
  2. An install from an ordinary terminal reports `healthy` only if the content Claude will load matches the committed content; otherwise `degraded` with both digests and a remedy.
  3. After an install from an ordinary terminal, a new Claude Desktop session and a new terminal Claude Code session load the same AGDF state and show no drift notice.
  4. A repeated install with unchanged content performs no uninstall or reinstall and stays `healthy`; changed content reaches new sessions.
  5. Installed state and version are read from machine-readable Claude Code output where available; otherwise a defined fallback is used and reported.
  6. With the plugin enabled, a Claude session receives the AGDF runtime facts that `runtime-checks status --surface claude` reports as enabled; disabling the plugin stops them; no receipt or permission rule is written.
  7. If cleanup fails after the commit, the new state stays installed, the result is `degraded` with recovery evidence, no evidence claims a restoration that did not happen, and the next run completes the cleanup.
  8. A session that loads a state other than the installed one shows a drift notice naming the cause and remedy; a matching session shows none.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: none blocking. For PRD Approval Decisions: confirm criterion 6 (deliver runtime facts under plugin-enablement consent rather than lowering the reported status), and the exact wording of refusal, degraded and drift messages.
- affected_outputs: install CLI result and evidence; refusal error; SessionStart context (runtime facts, drift notice); runtime-checks status for Claude; uninstall report if the marketplace location changes.
- evidence: UR revision 3650f149; BROWNFIELD_REVIEW.md; `packages/cli/lib/host-adapters/claude/plugin.js`; `packages/cli/lib/host-adapters/claude/runtime-check.js`; `packages/cli/lib/runtime-check-consent/service.js`; `scripts/sync-plugin-runtime.js`; observed 2026-10-15 session behaviour (MCP launcher and SessionStart binding loaded from the marketplace path, no runtime facts, no Claude receipt present).
- missing_evidence: native confirmation of in-place loading across supported Claude Code versions and of MSIX behaviour (assigned to SD/TP evidence).
- required_next_step: Record this analysis, then draft the PRD with these criteria and the two approval decisions above.
