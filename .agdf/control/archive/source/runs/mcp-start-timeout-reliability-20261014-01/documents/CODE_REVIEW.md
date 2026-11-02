# Code Review: Reliable MCP runtime and coherent Codex setup
Decision: pass
Reviewer: Codex cooperative diff review; no independent reviewer claimed
Date: 2026-10-14

## Reviewed scope
Reviewed the final 30-path owner/test freeze against baseline 6dda9e353f1df87b2049f019417674913cfbb6b8 and the directly affected callers: package/launcher claims and acquisition, Core lock publication/reclaim/release, Worker/generation completion and failures, Codex transaction/derived setup/reference owners, Cockpit/probe helpers and build/eval fixture corrections. Reviewed production error paths and ownership/data preservation, not only green checks. Unrelated architecture/UI changes are excluded.

## Code findings and correction proof
- Valid live contention: exact lock path and closed live-owner schema gate waiting; full runtime proof reruns under the same publication lock. Unknown/malformed/foreign/oversized records never become a wait/reclaim authority. 5550ms wait is capped by the same 30000ms caller deadline.
- Atomic owner publication: exclusive same-directory link exposes complete metadata, never an empty owner. Failed handoff closes its descriptor and removes only exact owned inode/token bytes. Foreign replacement remains intact. Existing abandoned-owner path and bounded absence retry remain; no claim GC is added.
- Acquisition deadline: the existing package owner passes remaining time to its directly owned no-script acquisition child and rechecks before/after publication and after full claim proof. Original HEAD actually published after 33427ms; actual installed candidate stops the same controlled long child at its original 30000ms budget, with observed 6.759ms exit/cleanup overhead and no budget reset.
- Worker: result/cancel/error/timeout keep occupancy until confirmed end; rejected/hung termination stays bounded and retains capacity; late exit releases only the same active row. Fresh Worker/provenance remain. Unknown effect never becomes rollback/no-effect proof.
- Config/ref transitions: exact closed role/spec/source/wrapper proof and snapshots revalidate at mutation; repeated unchanged transitions also revalidate. Rollback cannot overwrite foreign post-state. Shared refs distinguish role/server ID. Triple-quoted, nested, duplicate and indented foreign config cannot masquerade as owned generated sections. Malformed explicit enable values stay unknown.
- Diagnostics: closed failure reasons/phases prevent arbitrary exception/canary text escaping; unknown preparation retains an honest phase. Plugin status recommends the existing plugin entry instead of an incompatible duplicate activation. Probe preparation requires explicit run-local evidence and preserves older descriptors on repeat.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-MCP-001 | implementation_gap | CD+Tests | resolved | SD_CLAIM_CONTENTION_MECHANISM.json; retention-closed-owner-final.log; installed-qualification.json | Consume the bounded contention correction in QA. |
| CR-MCP-002 | implementation_gap | CD+Tests | resolved | implementation-baseline.json; atomic-safety-generation.log; complete MCP suite | Consume confirmed-termination occupancy proof in QA. |
| CR-MCP-003 | implementation_gap | CD+Tests | resolved | installed-transport-before-atomic-lock.json; lock-owner-closed-shape.log; installed-qualification.json | Consume atomic complete-record publication proof in QA. |
| CR-MCP-004 | implementation_gap | CD+Tests | resolved | baseline-acquisition-overrun.json; launcher-child-focused-qualified.log; installed-recovery-reviewed.json | Consume the unchanged shared acquisition/publication deadline proof in QA. |
| CR-MCP-005 | implementation_gap | CD+Tests | resolved | config-indentation-final.log; retention-closed-owner-final.log; diagnostic-repeat-final.json; host-setup-final.json | Consume exact transaction, rollback and derived-state proof in QA. |

## Evidence strength and limits
Actual final configured STDIO, actual installed surface-local CLI and installed-function negative/timeout probes bind dispatcher 99ba11c32405acfb2445da5227d7049be836f3988789c2ee658838af79dcaece, server 57e00b512994b060995ff5875e89620f87bf5a275857ea217f87f2ba6f1dd6b1 and SDK b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb. Config lifecycle scenarios are own disposable source/local-package fixtures; actual host declarations remain byte-identical. Full local setup CLI and plugin-local validator are different supported surfaces. No fresh native desktop/Windows/model-host claim. Historical suppressed exceptions remain individual attribution limits, not fabricated causes. Self-review is cooperative.
The size ceiling changes only to exact normal measured 253 files/2218869 bytes, without spare headroom or weakened guards. Required concrete/canonical test fixtures replace stale invalid inputs; deterministic eval bindings were reviewed with outputs/grades unchanged, not presented as live model execution. Original failures and the corrected child-probe prerequisite assumption remain retained.

## Result
No meaningful open functional, ownership, regression or data-integrity finding remains in this reviewed scoped candidate. Existing conservative immutable claim retention, unknown host policy and conditional legacy retention are intentional approved boundaries with explicit exit conditions, not native success or completed cleanup claims.
required_next_step: Complete bound plan/clean evidence and sole qa-gate assessment; no human approval is granted.
