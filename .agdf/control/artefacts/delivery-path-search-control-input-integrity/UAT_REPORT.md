# UAT Report: Delivery Path Search Control Input Integrity

- status: in_progress
- decision: pending
- gate: UAT
- gate_approval: open
- date: 2026-08-30
- owner: user

## Acceptance Scope

Accept the bounded repository and generated-package behavior of Delivery Path Search:

1. It derives allowed and forbidden actions from the selected run's canonical gate evaluation.
2. It binds the search to run, gate, scope and revision and stops on stale or unavailable input.
3. It distinguishes input, candidate and evaluation failures from an evaluated recommendation result.
4. It exposes candidate and evaluation provenance and persists only valid recommendation-facing results.
5. It does not grant gate authority and does not silently reuse an unrelated scope.

## Visible Evidence

- Actual canonical-run fixtures work without a persisted Run Status Card.
- Empty or unavailable input produces a typed recovery outcome with zero evaluator calls.
- Zero valid evaluations cannot become or persist as a recommendation.
- CLI and JSON output identify the selected scope, revision, phase and provenance counts.
- An adversarial cross-scope evaluation rejects unrelated run reuse.
- Focused suites, 67/67 deterministic skill evaluations, package checks and the aggregate smoke test pass.

## Required Installed-Host Evidence

- Installed: the generated local AGDF plugin is present in the existing `agdf` Codex marketplace.
- Verified: Codex reports digest-bound identity `0.14.2+codex.local-bf61ec5e26c9` as installed and enabled.
- Verified: installation provenance records canonical `0.14.2`, source digest `bf61ec5e26c9512aa94a638233da94efe21c70130a9390d3f704dbe4c09edaee`
  and runtime digest `64c3b00c6048c70432c8029211ba416dc5e3218755c54568cb67130960a6e45f`.
- Verified: the plugin-creator validator accepts the installed plugin structure.
- Retained for recovery: the previous intact `0.14.1` marketplace copy at
  `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf.pre-0.14.2-uat-backup`.
- Start a fresh Codex thread so the updated skills and runtime are loaded.
- Exercise Delivery Path Search there against a fitting canonical run and retain the visible outcome.

## Evidence Boundary

- Verified: repository source, generated runtime and generated package behavior.
- Verified: refreshed installed plugin on disk and in `codex plugin list`.
- Pending: fresh-task Codex pickup and the user-visible Delivery Path Search example.
- Not claimed: authenticated external evaluator, native Windows, release, publication or deployment.
- No commit, push, PR, installation, release or publication was performed or authorized.

## Decision

Do not request acceptance yet. Restart Codex, open a fresh task and exercise the updated skill there.
Then present the resulting evidence for exact `Approval: UAT`, revision or decline. Release and all
later delivery actions remain separately gated.
