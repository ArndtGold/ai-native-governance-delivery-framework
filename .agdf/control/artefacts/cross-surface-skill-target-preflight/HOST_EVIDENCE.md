# Host Evidence: Cross-Surface Skill Target Preflight

Date: 2026-09-04
Evidence boundary: Repository and generated-profile evidence do not prove installed or freshly
loaded host behavior.

| Surface | Canonical source | Generated projection | Installed bytes for this change | Fresh-session direct invocation | Current claim |
|---|---|---|---|---|---|
| Codex | pass | pass through shared runtime-plugin projection and conformance test | installed local 0.14.5 snapshot is provenance-matched | direct repo-less and resolved QA cases not observed | Installed bytes confirmed; loaded behavior unclaimed |
| Claude Code | pass | pass through shared runtime-plugin projection and conformance test | not installed or refreshed in this run | not observed | Source and generated contract only |
| GitHub Copilot | pass | pass; 82-file inventory, 612679-byte reviewed payload and profile test | installed 0.14.5 root is provenance-matched | repo-less `/agdf-qa-gate` observed: target safety stop passed; German locale, verbatim renderer transfer and compact recovery failed; resolved QA case not observed | Partial loaded-host conformance with disclosed failures |
| OpenCode | pass | pass through generated `.opencode` skills/contracts and conformance test | not installed or refreshed in this run | not observed | OpenCode generated semantics only |

## Required Fresh-Session Observation

For every later authorized and available host, observe separately:

1. a repo-less direct skill invocation that renders the localized target orientation and stops;
2. a resolved-repository direct `qa-gate` invocation that selects or clarifies one run, reads
   available durable evidence and emits only the QA-owned result;
3. no Run Status Card or interactive QA-card promise from `qa-gate`;
4. no use of a host permission or plan control as AGDF approval.

Unavailable, unauthenticated, stale-session or uninstalled hosts remain explicit evidence gaps.

## Loaded Copilot Observation 2026-09-04

The direct invocation proved the most important fail-closed boundary: no cwd authority, repository
inspection, run selection or fabricated QA decision occurred before target resolution. It also
proved that an instruction-following model may still select the wrong locale, reconstruct canonical
Markdown, over-explain recovery and search for the wrong executable. The canonical installed
`runtime/agdf-local.js` returned the correct complete German orientation when called directly.

This observation is UAT evidence, not a reason to infer parity for another host. Technical
enforcement belongs to the separately proposed executable dispatcher run.
