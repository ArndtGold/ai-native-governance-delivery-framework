# Duplicate runtime module remediation

Date: 2026-10-01
Run: agdf-portable-plugin-package-structure-20261001-01
Authorization: user explicitly asked “fix it” and then “leg los” for the five identified supplemental control modules. This extends the prior preservation boundary only for those five paths; it does not revise approved product/design/plan semantics or transfer another run approval.

## Source correction

CLEANUP.json binds five removed paths to saved copy/canonical SHA-256 values and a task-owned backup. Four files were identical. The supplemental run-recovery copy lacked the canonical assertRecoveryOperationsTrusted import and call; no unique behavior needed merging. Canonical originals were retained byte-for-byte. Existing full directory/runtime generation removes the stale generated copies after source correction, yielding exactly 15 fewer paths in the packed create-agdf package. No filename exclusion, raised payload budget or weakened validator was introduced.

## Evidence refresh

Normal release preparation, actual Copilot profile and canonical recovery tests passed. Actual Copilot output: 136 files / 1274662 bytes, exactly the existing limits. Normal create-agdf prepack and package-content check passed with 642 files. All eight verification groups and exact normal archives/profile checks passed; three package boundaries unchanged. The temporary reporting helper initially needed adjustment for npm lifecycle logs preceding JSON; the production pack succeeded and the corrected capture was repeated. No active plugin installation, native host observation, publication, commit, index update or push is performed.

## Recovery and scope

Original five supplemental files are preserved in the task-owned backup listed in CLEANUP.json; canonical originals were never overwritten. Other preexisting copies, original startup-test deletion and unrelated concurrent edits remain outside this fix. PRIOR_* reports preserve the original revise evidence. Review owners must resolve TPR-E001 only after actual generation/prepack/archive evidence passes, and sole qa-gate must decide the refreshed result.

Compatibility recording was refreshed for the current source snapshot (56 scenarios pass), followed by passing community-health. Current review dimensions and sole QA Revision 2 pass; no user approval is inferred.
