# CD+Tests: Portable plugin package structure — evidence refresh

Run: agdf-portable-plugin-package-structure-20261001-01
Date: 2026-10-01
Revision: 2
Status: execution completed; actual-package evidence gap resolved.

Approved TP stages A/B are implemented with existing source/package/runtime owners. The user subsequently authorized remediation of the five identified supplemental control modules with “fix it” and “leg los”. Four copies were identical; the fifth lacked the canonical recovery trust-check import/call. Canonical originals are byte-for-byte unchanged; original copies are preserved in a task-owned backup. Other duplicates and startup-test deletion remain outside this correction.

## Actual verification

[evidence/duplicate-remediation/CLEANUP.json](evidence/duplicate-remediation/CLEANUP.json) binds removed and retained files to SHA-256. Normal release:prepare, Copilot profile, run recovery, create-agdf package contents/control-command-package, CLI package/smoke and MCP package tests all pass (eight recorded groups; the control-command-package group also runs its existing eight isolated regressions). The actual Copilot profile is exactly 136 files / 1274662 bytes, matching the unchanged baseline. No added headroom, file exclusion or weakened validation.

[Actual archives](evidence/duplicate-remediation/PACKED_OUTPUTS.json) use normal npm pack with scripts enabled and successful create-agdf prepack: create-agdf 642 files, @agdf/cli 5, @agdf/mcp-server 9. All five source copies and their ten distributed runtime copies are absent. All three identities, versions, exports and dependency bindings match the prior supported packages. Build-only templates and schema-engine dependencies remain excluded. [Unpacked profiles](evidence/duplicate-remediation/PACKED_PROFILE_CHECKS.json) pass runtime/public schema/resource and actual Copilot budget checks.

The earlier stage, source, schema, rollback, adapter, protocol and documentation evidence remains valid for unchanged owned sources. PRIOR_CD_TESTS and PRIOR_* review reports preserve original failed actual-package evidence. The native lanes remain explicitly unverified under approved SCN-017; no fresh host, Windows, active install, publication or VCS action is claimed. The deleted unrelated startup test means no whole root smoke-test is claimed; the selected affected and packed-consumer checks passed.

TPR-E001 may now be resolved by Task Plan Review using the fresh actual package evidence; sole qa-gate owns the refreshed decision. No human approval is inferred.

The Compatibility report was re-recorded after the source fingerprint changed (56 scenarios pass); current community-health passes. Sole QA Report Revision 2 now consumes the resolved TPR-E001 and decides pass. Human QA/UAT approvals remain absent.
