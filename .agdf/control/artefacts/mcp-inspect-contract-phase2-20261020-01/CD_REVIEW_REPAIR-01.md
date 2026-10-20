# CD review repair evidence

Date: 2026-10-20
Owner: Codex

CR-AUDIT-001 was reproduced and repaired in the existing pureInspectWrapper owner. tools may now occur only as the receiver of an admitted direct method call; method handles cannot escape to local aliases. Computed member access requires a literal key, so calculated constructor names fail closed. All 44 deterministic evaluator tests pass, including both reported reproductions and an additional inspect-handle escape negative. No model session was invoked.

The original replacement trace still passes strict_t4_document_flow_v1, with complete original binding, 3 ordered pages, 77796 bytes, final user delivery and no data-access detours. Final reviewer replay: probe-results/mcp-inspect-contract-phase2/native-replacement-verifier-cr-final.json @ sha256:81607fd15c1ac9eed89daff193c446217e62baebf9779cf090ff0e2e24f0f36c. Regression log: probe-results/mcp-inspect-contract-phase2/checks/agdf-phase2-cr-audit-regression.log @ sha256:48ce67e4b56505096f60a1598ab154ff6f807f95c90a7c49a000338a430ba92c.

The existing Core document test now also injects a real directory change after the catalog initial snapshot through the standard filesystem boundary: the scan returns presentation_catalog_changed, while a fresh stable scan returns unique. Production Core code is unchanged. Log: probe-results/mcp-inspect-contract-phase2/checks/agdf-phase2-document-review-final.log @ sha256:ab83b9856c32c86a9a5220ced1e858b24570b5b91fd0e61dac44fb9ee7e7f7a6.

Fresh payload measurement confirms exact 395 files / 3440927 bytes, with zero headroom: checks/agdf-phase2-payload-final.log. The canonical protocol comparator against the unchanged historical baseline returns changed (expected): 9 is_error and 9 failure_without_isError corrections inherited from Phase 1, documented-field/definition changes and response-size/token changes; zero class/outcome changes. Its exit 1 is a difference signal, not a failed assertion of unchanged behavior. Log: checks/agdf-phase2-protocol-comparison.log. No historical native cohort comparison is claimed.

The existing CG-MCP-DISPATCH-ADAPTER node now links this scoped result with explicit qualification limits. Context graph ref: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter @ sha256:b8ffd22eccb70993e55331f8f7bf108f351745fca9a719f960bfdeca2229249d. The canonical internal writer projected CD_TESTS_FINAL.md into CD_TESTS.md when recording pass; earlier checkpoint-path mentions are historical, not a second current report. All original failed/replacement observation files and their digests remain preserved.

Required next step: consume this repair and same-trace proof in final CR, TP coverage and clean review; qa-gate retains the sole final quality decision.
