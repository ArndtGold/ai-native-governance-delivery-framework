# CD recording provenance clarification

Date: 2026-10-19
Owner: Codex
Run: mcp-error-contract-phase1-20261019-01

The existing run-steps owner normalizes an internal report's reviewed source into its canonical role path. Operation 5a650c8d-d9a9-445d-baf0-3885c946199d accepted CD_TESTS-02.md as input and published its exact bytes at CD_TESTS.md, revision 14 (864e35bf-02f2-4705-9220-f7f97bf52f6d), digest sha256:008c290e667240bf370d8b08a9d1fe15c5012453a593656b279b77fb71eb9108, decision pass/status done. CD_TESTS-02.md is the identical reviewed input mirror, not a second current report authority.

Consequently, the new report's sentence “The registered old report is unchanged” describes an incorrect preservation assumption and is corrected by this explicit provenance note: the canonical current CD_TESTS.md was replaced by its existing recording owner. Its prior revise decision, original operation/revision/source digest and source-set association remain in the append-only Run receipts. The current pass is the replacement result, not a relabeling of old failed checks.

The previous result was revise at revision 13 (93222163-0eff-4594-95fa-9828415808dd), operation a6b61884-878f-4f3e-99d6-10890bbe13e5, original source digest sha256:3a648224e9f606b7a01bec3b86c07b03b4f1a6473b4d23c1d815dd97fcd67c5b. It retained CD-PERF-001 open and SCN-023 partial, with the last pre-repair controlled warm p95 1316.565 ms against 1000 ms.

Contemporaneous source identity, evaluation, protocol/tool captures, scenario map, check inventory and identity verification are retained under pre-performance-fix/. Their exact raw failed timing logs remain in the evidence directory. This note does not claim a byte-identical preserved copy of the previous Markdown report. The new source repair, actual tests, current report digest and pass decision are unaffected. No canonical report, receipt, seal or protected approved input was manually rewritten to correct this note.
