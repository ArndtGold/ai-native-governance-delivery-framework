# Clean Implementation Review: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-companion-followup-20261027-01`
- reviewed_at: 2026-10-28
- reviewer: Claude Code implementing agent
- basis: approved SD (SDD-01 to SDD-12), `CD_TESTS.md`, `CODE_REVIEW-input-01.md` and the companion sources and suites.

## Clean Implementation Review

- primary_solution: The delivered structure stays: host-independent logic modules and one thin adapter. Each new concern sits in its owning module:
  - the route reader and the placeholder rule in `run-state.mjs`;
  - the per-mode path and the CD+Tests mark in `gate-bar.mjs`;
  - the build mood in `state.mjs`;
  - the build figure in `figure.mjs`;
  - everything shown outside the pane (detector, notice and status texts, chime) in the new `notice.mjs`;
  - the host calls in `register.mjs`.

  The adapter grew by `announce` and `silence` only.
- evidence: The mirrored core rules are bound by parity tests against their owners:
  - route against `modeSliceDecision`;
  - path and marks against `evaluateGateCheck(...).status_card.breadcrumb`;
  - approvals against `readRunState`;
  - placeholders against `isDecisionContentPlaceholder`;
  - chat language against `resolveConfiguredChatLanguage`;
  - the locale set against the core registry.

  The bounds test computes the hammer swing from the same exported geometry the drawing uses.
- fallbacks_retained: These approved fallbacks stay:
  - session-only choices without the plugin data directory;
  - catch paths on every hook and every new host call;
  - the stale snapshot;
  - state-file defaults, now extended by `notice` (on) and `sound` (off);
  - English when neither AGDF config nor a supported Claude `language` setting exists.

  No new silent fallback hides a failure from tests: the failure-injection and mutation tests show each channel failing on its own.
- workaround_or_shim_risk: Setting the status line after every applied read works around a host behaviour: the desktop dropped the set made during session start (LT-F01). It is documented in code, in `CD_TESTS.md` and in `CODE_REVIEW-input-01.md`. The owner accepted the SDD-07 wording deviation, and it costs one host call per read.
- parallel_structure_risk: The companion mirrors three core rules it cannot import: the status-card path, `modeSliceDecision` and the placeholder rule. This is approved in SDD-01, SDD-02 and SDD-11, and each mirror has a parity test that fails on drift. One divergence is deliberate: completed-run marks follow SDD-02's simplification and are documented.
- brownfield_fit: Fits:
  - It reuses the existing parser helpers, the locale registry and gate titles, the persistence write path, the assignment and stale handling, and the delivered test fixtures and fake host.
  - It adds no binary asset, because the chime is generated.
  - The only change outside the companion folder is one entry in the runtime integrity file list.
- missing_evidence: none for solution integrity.
- required_next_step: Prepare the QA report.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | design_gap | SD | resolved | The status line re-set per read deviates from the SDD-07 wording; owner decision 2026-10-28 to record it without an SD revision (`CODE_REVIEW-input-01.md`, CR-F06) | none |
