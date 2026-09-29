# Clean Implementation Review: Review v2 remediation

Decision: pass for the local source and temporary-root verification scope
Date: 2026-09-29
Run: `agdf-review-remediation-20260929-01`
Basis: approved SD/TP, Brownfield Analysis, CD+Tests and the actual worktree diff

## Clean Implementation Review

- decision: pass
- primary_solution: Extend the existing control-state, lifecycle, marketplace, release and projection owners. Run/OR/Backlog use one journal under the Run and Backlog locks; the sealed Run revision remains the commit point. Host mutations recheck a plan-time file snapshot or directory identity at apply time. Marketplace recovery uses an explicit prepared/committed phase within its existing transaction owner.
- evidence: `run-step-transaction-test`, `run-lock-test`, `run-revision-test`, `verified-change-test`, `lifecycle-test`, `opencode-hardening-test`, `local-marketplace-test`, release workflow and package suites pass locally. The full aggregate smoke on final source passes; its complete log is attached in CD+Tests as `LOCAL_SMOKE.log`.
- fallbacks_retained: Pending Run-step journals and ambiguous owner locks stop with a recovery-required result. An unknown registry state stops publication for an operator decision. These are bounded fail-closed branches with no alternative approval or release authority; recovery ends when the exact old or committed state is verified.
- workaround_or_shim_risk: No alternate Run state, generic approval migration, time-based lock expiry or live-host patch was added. The generic atomic writer is reused by host adapters; it preserves existing POSIX file permissions and creates private temporary files.
- parallel_structure_risk: The temporary journal records intent and expected bytes only; it does not decide product or approval rules. Eval observations and generated guards remain projections of the canonical contract. The registry classifier reports exact states but does not select a version or publish independently.
- brownfield_fit: Control-state writer, lifecycle adapters, marketplace installer, coupled release workflow and canonical guard generator retain ownership as recorded in Brownfield Analysis. Other active runs retain MCP inspect and package-payload decisions.
- missing_evidence: Exact Linux/Windows CI, registry-side and loaded-host observations are outside the verified local source scope. These are tracked in TP Review and are not a structural pass claim for release readiness.
- required_next_step: Record the Code Review result and let QA evaluate the open evidence obligations.

Review corrections: a new-file destination could have been redirected by a replaced parent directory, and atomic replacement could have widened an existing private file's mode. The final implementation snapshots parent and file identity plus content, rejects both symlink and regular-directory swaps, opens a private temporary file and preserves an existing POSIX mode. Focused regression cases pass.

Context Graph impact: `link_only` to `CG-RUN-SCOPED-CONTROL-STATE`, `CG-PUBLIC-PLUGIN-DISTRIBUTION` and `CG-REQUEST-ACTIVATION-AUTHORITY`; no new owner or policy node.
