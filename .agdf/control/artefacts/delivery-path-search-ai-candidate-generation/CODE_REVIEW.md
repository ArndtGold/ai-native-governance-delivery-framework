# Code Review: AI-Native Delivery Path Candidate Generation

Status: pass
Date: 2026-07-11

## Code Review

- decision: pass
- findings: none remaining
- resolved_findings:
  - [P1] `contracts.js` generator schema initially violated provider Structured Output rules for nested metadata; removed model-supplied metadata from the schema and retained local adapter metadata, verified by live Codex probe.
  - [P1] `candidate-policy.js` initially allowed differently worded proposals with identical decision signatures; centralized rejection now covers equal intent, equal signature or similarity threshold, with regression fixtures.
  - [P1] `read-only-guard.js` initially checked mutation only after successful processes; it now checks after success and failure, with mutation-on-failure fixture.
  - [P1] over-budget generator responses initially hid actual consumed cost; consumption is now visible and charged before typed fallback.
  - [P2] compact CLI output initially omitted generation cost, duration and typed failure; all are now surfaced.
- reviewed_scope: contracts, candidate policy, state adapter, search engine, persistence, shared guard, Codex/Claude evaluator refactor, generator adapters, CLI parsing/orchestration, focused/smoke tests, canonical runtime/skill, sync output and public docs.
- missing_evidence: authenticated Claude live generation response; deterministic success/auth tests pass and actual unauthenticated behavior is correctly diagnosed.
- risks: deterministic token similarity is deliberately conservative and may reject close wording with distinct structured claims; this matches the approved minimum-diversity safety posture and is versioned/tested.
- required_next_step: Run QA gate with TP partial evidence visible; do not claim full Claude live verification.
