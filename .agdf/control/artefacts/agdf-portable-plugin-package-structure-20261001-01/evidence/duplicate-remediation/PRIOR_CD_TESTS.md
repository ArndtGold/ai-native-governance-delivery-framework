# CD+Tests: Portable plugin package structure

Run: agdf-portable-plugin-package-structure-20261001-01
Date: 2026-10-01
Status: execution completed; quality evidence gap remains.

Implemented stages A and B under approved TP: portable root identity, explicit inline/fallback selection, shared build-only hook templates, strict pinned schema validation, canonical source relocation and active consumers. Three npm package identities/exports remain unchanged. Source/public skills-only and runtime profile semantics remain separate. No policy, release, active install or VCS action was performed.

[Stage A](evidence/MILESTONE_A.md), [Stage B](evidence/MILESTONE_B.md), [schema/profile manifests](evidence/MANIFEST_MATRIX.json), [source audit](evidence/SOURCE_PATH_AUDIT.md), [scenario coverage](evidence/SCENARIO_RESULTS.json), [test commands](evidence/TEST_INDEX.md), [evidence lanes](evidence/EVIDENCE_MATRIX.md), [exact archives](evidence/PACKED_OUTPUTS.json).

T-001 through T-005 and T-007 through T-009 are evidenced within their approved boundaries. T-006 remains partially_done: actual workspace create-agdf archive has 657 files versus 642 in isolated clean fixture; five original duplicate modules appear at root and in two runtimes, totaling 15 paths. Actual Copilot output is 141 files / 1303527 bytes and fails the 136 / 1274662 limit. The legitimate path-migration delta is exactly 54 bytes; file limit and duplicate headroom were not widened. The unrelated deleted startup test and duplicate files remain preserved; external staging is recorded without attributing VCS action to this task.

The clean fixture proves implementation/package composition but cannot certify actual dirty prepack. Normal pack scripts were explicitly skipped only to inspect the failing actual archive after separate clean prepack tests. Native Codex/Claude/Copilot/OpenCode recognition is unverified. Windows native and whole root smoke-test were not executed or claimed.

Review/QA must consume the actual-package evidence gap. Required next step: reconcile preexisting duplicate modules through the existing payload owner, then regenerate and verify all actual packages; do not transfer isolated evidence or bypass the payload guard.
