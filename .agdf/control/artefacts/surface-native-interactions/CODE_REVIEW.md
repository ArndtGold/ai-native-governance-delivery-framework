# Code Review: Surface-Native AGDF Interactions

Status: done
Decision: pass
Date: 2026-07-14
Reviewed scope: actual runtime, skill, metadata, generator, CLI merge, tests, documentation, Pages and Context Graph diff

## Code Review

- decision: `pass`
- findings: none
- missing_evidence: No authenticated Claude native-question probe and no safely automated interactive Codex/OpenCode question rendering. These are supporting UI observations, not missing code-path evidence.
- risks: Host tool names, schemas and timeout behavior can drift. Canonical capability metadata, negative integrity checks, explicit permission preservation and exact-text fallback make that drift visible and fail closed.
- required_next_step: Run the QA gate using TP coverage, clean implementation, code review and deterministic test evidence; do not infer QA approval.

## Reviewed Correctness Boundaries

- OpenCode global install adds `question: allow` only when the property is absent and preserves explicit `allow` and `deny`.
- Existing repository `opencode.json` remains untouched without `--force`; the fragment and output make explicit-decision preservation visible.
- Native control responses do not gain a direct write path; existing run selection, artefact readiness, exact approval and persistence remain authoritative.
- Timeout/default, hook output, plan approval and technical permission results are excluded by the normative contract and gate-check workflow.
- Generated assets remain source-derived and synchronization is idempotent.
