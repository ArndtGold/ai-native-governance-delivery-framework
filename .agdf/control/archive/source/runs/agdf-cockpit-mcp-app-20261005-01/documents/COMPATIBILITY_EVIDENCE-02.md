# Compatibility Evidence — Current Scoped Corrections

Date: 2026-10-06. Supersedes only the payload finding in COMPATIBILITY_EVIDENCE.md; prior evidence remains historical.

- Full canonical syncPackageAssets completes on current sources with no surface shortcut.
- Current Copilot payload: 203 files / 1711580 bytes; unchanged maximum 203 files / 1716129 bytes, 4549 bytes remaining.
- Default Core composition has no private cockpit service dependency. The Copilot projection omits that opt-in read closure; the existing projected dispatcher/inspector imports and exposes the same two tools. Cockpit creation on the Copilot surface is rejected before private module loading.
- Copilot inventory/digest/source-drift/exclusion/growth tests, default MCP protocol matrix, plugin MCP runtime, runtime integrity layout and control-inspect pass. Private React HTML/dependencies remain excluded from default packages; opt-in Codex composition and fresh current stdio tests pass.
- This resolves the measured payload regression; it does not claim full T-011 compatibility or cross-host native QA/UAT. Remaining TP and native T-006 obligations are unchanged.
