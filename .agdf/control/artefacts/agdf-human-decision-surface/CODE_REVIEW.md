# Code Review: Human Decision Surface

Status: done
Date: 2026-07-14

## Code Review

- decision: pass
- findings: none remaining. Review corrections made before pass: post-approval human copy now derives from the approved current gate rather than overstating next-gate authority; normalized `approve` still requires the exact approval value; artefact link and heading resolution rejects filesystem-missing, non-file and symlink-escaped paths; length budgets cover all visible locale strings.
- missing_evidence: Live Codex, Claude and OpenCode rendering behavior is not repository-controlled and remains UAT evidence.
- risks: A future locale pack can still be linguistically poor while structurally complete; human translation review remains required before claiming support. Host Markdown and accessibility implementation remain host-owned.
- required_next_step: Run QA using the approved TP, CD+Tests evidence, TP coverage and clean-review result.

## Reviewed Scope

- Correctness: locale resolution, title fallback, safe links, stable options, distinct outcomes, exact authorization and localized post-approval authority.
- Regression: CLI JSON serialization, existing English/German status output, package assets, generated surfaces and approval validator behavior.
- Security: relative canonical path syntax, target-root containment, realpath/symlink containment and file-only heading reads.
- Maintainability: one locale owner, one pure helper, no duplicate gate table, byte-identical generated registries.

## Evidence

- `npm run smoke-test`: pass after review corrections.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass.
- `npm pack --dry-run --json`: canonical generated locale registry included.
- `git diff --check`: pass.
