# Core Read Evidence

Status: minimal path checks passed; remaining TP scenarios unqualified.

- Existing control inspection baseline passed before implementation.
- Shared captured-read worker and bounded pool moved to Core; browser imports are compatibility delegates.
- Core cockpit-session tests: 5 passed (real shared reads/no control writes/cross-run binding, strict schema, replacement and close, fake-clock expiry, concurrent render/close).
- Browser service and React suite: 5 service plus 8 React tests passed after extraction and injection. Initial restricted-sandbox listen/asset failures were followed by successful authorized runs; no assertions were weakened.
- Codex separate-connection compatibility regression: 1 passed; governance registration/removal preserves agdf-cockpit-local and still rejects malformed actual agdf table names.
- Existing default MCP protocol matrix passed for both protocol generations. A namespace import retains compatibility with existing installed dispatcher packages.
- Private UI typecheck and resource build passed. git diff --check passed.
- Session limits are ephemeral and read-only. Context graph selection and complete packet/context-question semantics are not implemented or claimed by these checks.
