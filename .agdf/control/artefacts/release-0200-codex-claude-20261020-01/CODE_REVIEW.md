# Code Review — 0.20.0 Desktop release matrix

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- reviewer: Claude (Claude Desktop Code, Windows); independent read-only review of 7ce6e838..d4f39956 plus own review of the fixes in 0e93784f and 2295730c
- source_head: 2295730c4ed661f688ca5b0d10be335e945a7843

## Code Review

- scope: .github/workflows, scripts/native-probes, scripts/host-compatibility, scripts/sync-package-assets.js, plugins/agdf/meta/agdf-plugin.definition.json, packages/cli/scripts/release-workflow-contract-test.js, evals manifests and evals/mcp-ergonomics/test/native.test.mjs, docs/maintenance/release-0.20.0.md (7ce6e838..2295730c). Generated evidence under docs/compatibility/evidence and evals/host-compatibility/observations was checked only for unchanged outcomes.
- findings:
  - [resolved] scripts/native-probes/lib/release-observation.mjs - Claude Desktop captures were parsed only as CLI stream-json, so genuine Desktop transcripts failed with desktop_model_mismatch - fixed in d4f39956, real Desktop dispatch excerpt now passes, CLI streams rejected
  - [resolved, was blocking] release-observation.mjs - a Codex CLI or exec trace could satisfy a Codex Desktop case - fixed in 0e93784f (rollouts required, one session_meta id equal to session_id, exec/cli source rejected)
  - [resolved] release-observation.mjs - one scenario's proof or session could back another case - fixed in 0e93784f (primary scenario, distinct sessions per host, no repair on upgrade)
  - [resolved] release-handoff.mjs - reviews could lock foreign tuples - fixed in 0e93784f (one tuple of the own scope, import and validate)
  - [resolved] release-observation.mjs - capture accepted by file extension only - fixed in 0e93784f (PNG/JPEG/WebP signature)
  - [resolved] evals/mcp-ergonomics/test/native.test.mjs - Windows path from URL.pathname - fixed in 3ac401a5
  - [resolved] scripts/native-probes/release-handoff-test.mjs - the link-rejection step ran after a successful import had dirtied the fixture, so it failed with candidate_source_dirty wherever links can be created (CI Contracts on Linux and Windows) and was skipped on this host - fixed in 2295730c (check while clean, junction fallback); Contracts lanes green in run 39927176152
- missing_evidence: Real Codex Desktop rollout and real Desktop transitions are not available on the reviewing host; validator rules are proven by fixtures and one real Claude Desktop excerpt.
- risks (advisory, no defect in reviewed scope):
  - Desktop transition baseline integrity and source digest are format-checked; the lifecycle owner verifies the actual registry tarball at execution, and the evidence reviewer must compare against BASELINE_REGISTRY_CHECK.json (sha512-ZC1fPJc0…).
  - Preflight version evidence is the operator-captured tuple JSON by design; a separate native capture reference would strengthen it.
  - A failed import can leave empty candidate/host parent directories (no files).
  - The publish job relies on a deterministic rebuild instead of comparing candidate_id with the desktop-evidence job; byte-identical payloads across macOS and Windows support determinism.
  - The Windows test path fix keeps the file's existing drive-letter idiom; paths with spaces would stay percent-encoded.
- required_next_step: QA in this run consumes TP Review, Clean Implementation Review and this Code Review.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | d4f39956: parseClaudeDesktopTranscript and desktop-code capture; CLAUDE_DESKTOP_CAPTURE_PROBE_AFTER_FIX.json shows model claude-opus-5-5 and session 6da83f61 from real Desktop lines; release-handoff-test case 3 | none |
| CR-002 | implementation_gap | CD+Tests | resolved | 0e93784f: Codex desktop-code rollout session/source rules; release-handoff-test case 4 rejects stdout, exec, cli, missing or second session_meta and foreign session | none |
| CR-003 | implementation_gap | CD+Tests | resolved | 0e93784f: primary scenario, desktop_session_reused and desktop_upgrade_repair_invalid; release-handoff-test case 5 | none |
| CR-004 | implementation_gap | CD+Tests | resolved | 0e93784f: assertReviewScope in import and validate; release-handoff-test case 5 rejects foreign tuples on both routes | none |
| CR-005 | implementation_gap | CD+Tests | resolved | 0e93784f: imageSignature check; release-handoff-test case 5 rejects a text capture | none |
| CR-006 | implementation_gap | CD+Tests | resolved | 3ac401a5: test:mcp-ergonomics 44/44 on win32; verify:commit stage mcp-ergonomics passed | none |
| CR-007 | implementation_gap | CD+Tests | resolved | 2295730c: link check runs before the successful import; reproduced candidate_source_dirty with the 0e93784f test locally via a junction; Contracts Linux22, Linux24 and Win22 pass in run 39927176152 | none |
