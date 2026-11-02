# Code Review: Human Decision Surface

Status: done
Revision: 2
Date: 2026-07-15

## Code Review

- decision: pass
- findings: none remaining. Revision-2 review found and corrected one primary-title ownership risk: the compatibility `title` field could diverge from `primary_heading`; preflight now requires equality and rejects generic prefixed titles. Adapter metadata lookup was also corrected from the singular `interaction` to canonical `interactions` before pass.
- missing_evidence: Live Codex, Claude and OpenCode rendering behavior is not repository-controlled and remains UAT evidence.
- risks: Repository tests prove snapshot order and fail-closed mapping, not that a host visibly rendered either card or control. A future adapter may set canonical transport true only with trustworthy separate-value evidence and new fixtures.
- required_next_step: Run QA using the approved TP, CD+Tests evidence, TP coverage and clean-review result.

## Reviewed Scope

- Correctness: locale resolution, title fallback, safe links, stable options, distinct outcomes, exact authorization and localized post-approval authority.
- Regression: non-enumerable CLI JSON attachment, existing English/German status output, package assets, generated surfaces, adapter metadata and approval validator behavior.
- Security: relative canonical path syntax, target-root containment, realpath/symlink containment and file-only heading reads.
- Maintainability: one locale owner, one pure helper, no duplicate gate table, byte-identical generated registries.

## Evidence

- `npm run smoke-test`: pass after review corrections.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass.
- `npm run test:interaction-presentation`: ordered snapshot, heading owner and decorated-value negatives pass.
- `npm run test:runtime-integrity-negative`: normative order and adapter-capability mutations fail as required.
- `git diff --check`: pass.
