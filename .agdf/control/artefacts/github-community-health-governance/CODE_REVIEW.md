# Code Review Report: Community Health

Status: pass
Date: 2026-07-23
Reviewer: agent

## Review Scope

- public policy and README changes;
- GitHub Issue Forms, chooser, PR template, CODEOWNERS and metadata manifest;
- root dependency/lockfile and Guardrails workflow integration;
- social-preview binary properties and visual output;
- `scripts/check-community-health.mjs` and `scripts/community-health-test.mjs`;
- SOT Registry, Context Graph and run-specific control artefacts.

## Decision

- decision: `pass`
- findings: none
- missing_evidence:
  - Full `create-agdf` smoke cannot complete because the repository's existing deterministic gate-check observations have a stale source fingerprint; this change does not touch the behavior owners or eval manifest.
  - Global `delivery-map --all-active` is blocked by the unrelated `opencode-plugin-honesty-hardening` Verified Change baseline/scope state.
  - GitHub PVR/settings and default-branch template recognition are not observable in the unauthenticated browser state.
- risks:
  - GitHub Issue Forms remain host-owned public-preview behavior; local YAML and contract tests cannot prove rendering.
  - The validator intentionally enforces project-specific exact invariants and is not a reusable general community-file linter.
- required_next_step: Run Task Plan Review and classify the isolated external and post-delivery evidence gaps before QA.

## Correctness And Safety Evidence

- Positive repository contract and 14 independent negative fixtures pass.
- JSON is compared semantically; topic order remains contract-significant.
- YAML is parsed with declared `yaml@2.9.0`, unique-key checking and structural form checks.
- Markdown link validation rejects malformed, broken and repository-escaping targets.
- Social preview validation checks PNG signature, 1280×640 dimensions and size below 1 MB.
- Security tests require a private fallback, forbid public disclosure routing and reject numeric response-time promises.
- No credential or token is introduced; `npm audit` reports zero vulnerabilities.
- `git diff --check`, Node syntax checks and workflow YAML parsing pass.

## Regression Evidence

- Runtime Integrity: pass.
- Package contents: pass.
- `@agdf/cli` smoke: pass.
- Pages check: pass, zero diagnostics.
- Delivery Path Search focused/unit/generator: pass.
- OpenCode hardening: pass.
- Direct create-agdf smoke and routing script after the stale-eval step: pass.
- Existing full-suite blocker is isolated above and was not weakened or silently repaired.

## Normalized Findings

None.
