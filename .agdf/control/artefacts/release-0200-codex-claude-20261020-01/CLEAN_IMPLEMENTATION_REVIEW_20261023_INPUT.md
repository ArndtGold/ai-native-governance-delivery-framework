# Clean Implementation Review — 0.20.0 Desktop release matrix

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-23
- reviewer: Claude (Claude Desktop Code, Windows), using an independent read-only review of 7ce6e838..d4f39956 and own review of {{HEAD_SHORT}}
- source_head: {{HEAD}}

## Clean Implementation Review

- primary_solution: The canonical hostSupport schema 2 in plugins/agdf/meta/agdf-plugin.definition.json owns the release scope. Existing owners were extended in place: release-policy.mjs (checked target selection), release-observation.mjs (human_report and schema-3 Desktop branch), claude-session.mjs (native Desktop transcript parser), release-handoff.mjs (handoff, preflight, templates, scoped import, full validation), host-compatibility contract/producer/render (reported_sources) and publish-agdf.yml (Desktop gate). No second policy owner, evidence service or governance writer was introduced.
- evidence: Commits 2e797838/d7e2587a (matrix), 17a82bf6 (CI fixture SHA), d4f39956 (F-001), {{HEAD_SHORT}} (review fixes F1-F4 and TP negative tests); test:release-qualification 25/25; {{VERIFY_SUMMARY}}.
- fallbacks_retained: (1) schema-1 policy branch and schema-2 CLI record parsing, kept by SD decision for historical candidate 830d8b94 and optional CLI diagnostics; target state is permanent historical verifiability, and publication rejects schema 1 via validate --all-hosts. (2) Generated legacy codex-release-policy.json projection and the optional_cli fallback in scripts/sync-package-assets.js, both serving that same historical branch. (3) Legacy --directory route in release-evidence.mjs throws under schema 2.
- workaround_or_shim_risk: Low. Dead or test-only remnants remain: the assertReleaseEvidence branch in release-evidence.mjs is unreachable while hostSupport exists, and importClaudeEvidence is a test-only wrapper. native-release.mjs uses a 'claude' prefix for mixed-scope projections. Recommended cleanup, no behavioural risk.
- parallel_structure_risk: release-policy.mjs repeats the expected Desktop targets, Codex pins and unqualified scope as a deliberate tamper lock against the canonical definition. A policy change therefore needs a matching validator change, which is intended friction rather than a second owner. Release tooling keeps one owner per concern.
- brownfield_fit: Fits the Brownfield Analysis: existing candidate, lifecycle, handoff, compatibility and workflow owners reused; installer and runtime code under packages/cli/lib and packages/core/lib/runtime unchanged since 97454ec2; no guard, timeout or payload allowance relaxed (CI_COVERAGE.json, Copilot cap unchanged).
- missing_evidence: Native Desktop behaviour of the validator rules is proven on synthetic fixtures plus one real Claude Desktop dispatch excerpt; real Codex Desktop rollout fields beyond session_meta id/source are not yet observed.
- required_next_step: Code Review of the same diff, then QA in this run.

Advisory follow-ups (not normalized findings): remove the unreachable legacy release-evidence branch and the test-only importClaudeEvidence wrapper once historical CLI evidence no longer needs that route; confirm the Codex Desktop session_meta source value at the first real capture.
