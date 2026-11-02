# Clean Implementation Review: Run-Scoped AGDF Control State

- decision: pass
- primary_solution: Canonical per-run files with one shared parser, repository, resolver, writer, migration/projection owner and aggregate.
- evidence: The actual final diff uses export-only `index.js`; all CLI/runtime consumers resolve selected canonical state; complete validation is green.
- fallbacks_retained: Legacy-only reads before explicit migration and explicit non-authoritative projection, both required by the approved PRD and guarded against mixed authority/drift.
- workaround_or_shim_risk: none; the temporary `merge=union` approach was removed from canonical guidance and canonical same-run conflicts remain visible.
- parallel_structure_risk: none; no writable active-run index or duplicate generated tree remains.
- brownfield_fit: Existing gate evaluator, Delivery Path Search adapter, package synchronizer and documentation owners are reused.
- missing_evidence: none.
- required_next_step: Run `qa-gate`; this review does not decide QA.

## Delta — 2026-07-13 (post-QA, pre-UAT)

- decision: pass
- primary_solution: Directory-fsync is skipped on `win32` at its single call site (`fsyncDirectory`), reached exclusively through `atomicWrite()` — the one shared write primitive already owned by `run-state-writer.js` for both `writeRun()` and `writeCanonical()` in `legacy-migration.js`. No new abstraction, wrapper, or alternate code path introduced.
- evidence: grep confirms no other fsync/atomicWrite call sites exist in `create-agdf/lib` or `bin`; diff is a single guarded early-return.
- fallbacks_retained: none in the workaround sense — Windows exposes no fsync-on-directory-handle operation at all, regardless of privileges, so skipping it is the ceiling of achievable durability on that platform, not a degraded choice among available better options.
- workaround_or_shim_risk: low; the rejected alternative (blanket try/catch swallowing EPERM regardless of platform) would have been the actual symptom-masking workaround, since it could silently absorb genuine permission errors on POSIX too.
- parallel_structure_risk: none; single existing module and function, no duplicate write/durability path.
- brownfield_fit: consistent with this run's existing ownership boundary; `run-state-writer.js` was already the frozen owner of the write path.
- missing_evidence: none remaining; full control-state suite now completes after the accompanying test-harness resilience fix (`control-state-test.js` symlink fixture no longer aborts the whole process on `EPERM`).
- required_next_step: none for this review; delta covered by `task-plan-review` and `qa-gate`.
