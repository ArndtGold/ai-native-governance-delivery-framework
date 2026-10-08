# TP independent-view session derivation review

Status: reviewed plan; not implemented evidence
Date: 2026-10-06
Run: agdf-cockpit-mcp-app-20261005-01
Reviewer: Codex gate-check; cooperative self-review, no independent approval
Source revision: d83596aa-b722-45de-a427-cd896b0ae0e5

The approved SD SHA-256 is 2ad7312e1e7cb5c94d84932fd5ee6600efc1732ca684d55e627fd65fd8780d54 and the unchanged PRD SHA-256 is 8f372986651c47aa376accb9044bdc2ad822db101270f1c76ac0ab08e41dcb1c. TP is derived from this source pair; no acceptance prose is copied downstream as another product authority.

## Semantic review

- SDD-001/003 map to MCP-specific constructor limits and the existing session/pool/worker owners, atomic four live/retiring slots, eight jobs maximum, one lazy worker per slot, private captures/selectors and own timers. Browser defaults are a separate preservation lane. Deferred termination and shutdown/partial failure are observable scenarios rather than an assumed synchronous close.
- SDD-002 and 007 retain exact SDK dependencies, existing build:mcp and local provenance/assembly owners. Actual host feasibility is early and now includes concurrent independent views through one connection. Protected host setup and fresh loaded identity are neither inferred nor already performed.
- SDD-004/005 retain explicit graph ownership, registered captured bytes, exact 64 KiB serialized packet bound, inclusion/exclusion, source mutation and no canonical writes. Existing implementation must be requalified under the renewed preparation; planning does not create graph links.
- SDD-006 adds AC-006 verification coverage for exclusive publication, deferred reservation, failed never-published preparation, owner validation, two-sided begin/host acknowledgement/completion, one idempotent receipt, foreign tokens, immutable old controller cleanup, no nonowner publication, owner loss and uncertainty. Questions remain deliberate and are never automatically resent. Read capacity is independent of the quarantined publication record.
- Same-view bootstrap replacement is separate from opening another view. Prior tests asserting that render B invalidates A are obsolete; unrelated scope/expiry/generation boundaries remain required. No fixture-only guard or weaker production boundary is planned.
- Twelve stable tasks cover sixty scenarios and all twenty approved criterion/design pairs. Brownfield preparation precedes code changes; minimal independent reading precedes host checkpoint; full production handoff and final native journey follow. The canonical readiness evaluator reports ready with no open items; a separate static check confirms IDs/counts and unchanged approved source hashes.
- Retained Pages branding and work-step/evidence UX, light/dark container checks, browser/default MCP regressions, no-write window and documentation/knowledge closeout remain obligations. Native gaps cannot be covered by browser screenshots, two sequential panels, old runtime digests or protocol success.

## Evidence and limits

TP_SESSION_PLAN_VERIFICATION-01.json records the plan-only canonical traceability evaluation and source preservation. This is no proof that session limits, publication release, UI or native behavior work. No code change, build, runtime activation, test-suite execution, QA decision or Git action occurred while drafting this renewal. The separate mapping proof is cooperative machine attestation only. A new deliberate Approval: TP is required before preparation and implementation.
