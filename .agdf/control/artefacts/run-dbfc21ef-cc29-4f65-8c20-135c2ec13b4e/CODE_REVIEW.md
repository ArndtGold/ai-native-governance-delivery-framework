# Code Review: MCP input discovery and guidance repair

Decision: pass
Reviewer: Codex (implementation self-review)
Date: 2026-10-30
Run: run-dbfc21ef-cc29-4f65-8c20-135c2ec13b4e

## Scope and evidence

Reviewed the actual diff of the three canonical Core schema owners; the four affected CLI/MCP contract and protocol test owners plus Core command tests; architecture and payload-history documentation; the exact Copilot baseline; and the ignored local configuration removal. The approved UR and Brownfield Review remain unchanged. Existing unrelated staged/unstaged work is excluded.

Implementation/test evidence: EVIDENCE-3e1574309ff27af47d18576c85fd8bd4835e463741be12489c57d76a40513d67.md, evidence/schema-parity.json, evidence/renderer-comparison.json and the retained before/after signatures and definitions.

## Findings

No actionable correctness, confinement, regression or security defect was found in this bounded diff.

- Required skill_id evaluates every relocated dispatch condition; no authority, scope, Run or revision predicate was removed.
- The writable type view is mechanically derived from the existing expanded owner. It is a superset for display, not an alternative accepted contract. Required command always activates exact remaining SDK restrictions.
- Residual constraints omit only types/closed outer keys/required counts already guaranteed by the visible view. Per-kind source alternatives, foreign-field rejection, value limits and operation permissions remain. Closed objects with every declared key required retain equivalent minProperties constraints.
- Numeric local references remain internal JSON Schema pointers. The compact UUID spelling retains the same lowercase hexadecimal layout.
- The 301,097-case before/after SDK comparison reports zero acceptance differences; Core regression coverage includes missing and wrong-type fields and cross-kind payloads. Actual STDIO suites exercise both protocols, confinement, recording, replay/status and uncertain execution.
- Native Codex renderer captures reproduce 28 unknown occurrences before the change and zero after it; every expected field is visible in all nine final signatures. These are offline captures, not user/model task-success observations.
- The full operation contract and on-demand help remain authoritative. Distinct group purposes do not imply independent approval proof. The inspect example is complete, valid and explicitly illustrative for a confirmed project.
- Updated tests replace obsolete presentation-shape/word-count assumptions with field visibility, complete help and actual on-demand schema retrieval. Functional negative checks remain.
- Only the named legacy stanza was removed; installed runtime packages and current plugin registration were not changed.
- Existing generators produced the candidate; Copilot source growth is measured exactly with zero reserve. The 5,000-byte inspect and 24,576-byte composition caps are unchanged and pass.

## Missing evidence

None required for this bounded repository repair. Full repository CI, a performance benchmark, installed-host replacement, productive UI interaction and independent human review were not performed or claimed. The same agent implemented and reviewed this diff.

## Risks

The fixed discovery budgets have little headroom (Inspect 2 bytes; command/decision composition 24 bytes); existing tests continue to enforce them. A live chat can retain its previous tool metadata. SDK rejection wording may differ even when acceptance is identical. New host support or installed qualification is not inferred.

## Required next step

Record the canonical Compact Delivery OR-lite and report the implemented outcome and qualification limits. No VCS, publication or installation action is authorized.
