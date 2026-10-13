# CD+Tests: bounded canonical Run archive repair
- decision: pass

Run: core-mcp-flow-coherence-20261010-01. Scope: TP46-REVISION-ARCHIVE-SIZE under the unchanged approved T-019/SCN-069..075. The new QA-deviation acceptance policy remains an unimplemented proposal requiring source renewal. Prior wider CD+Tests evidence is retained in PREVIOUS_CD_TESTS.md and its cited exact sources.

The existing revision/history owner now distinguishes its exact canonical control Run and verified same-Run archive snapshot from ordinary source/report/proposal documents. The control record is bounded to the existing 1 MiB control-output ceiling before allocation. Ordinary documents and manifest remain bounded at 128 KiB; other Run records do not gain larger archival admission within this revision. Containment, no-symlink checks, exact byte/canonical hashes, original phase/policy, seals, history and supported recovery are retained. No record/history is compacted or rewritten, no eligibility or QA override is implemented.

A red disposable long-Run test reproduced rejection. The corrected test passes preview without mutation, exact large-state archival, application and original-UUID replay, verified history and tamper rejection; it retains ordinary-file/fake-RUN_STATE bounds and rejects a control file above 1 MiB. A separate bound test verifies exact selected-Run admission and symlink rejection. Existing all-18-cell expanded tests, original and v2 command/recovery tests and early UR-at-SD/Core-CLI/concurrency tests pass. The actual main-Run read-only preview now returns accepted; approved sources and exact Run bytes remain unchanged by that preview. No real revision apply occurred.

Packaging and exact source proof are recorded in VERIFICATION.json. Measured same 232-file Copilot payload grows by 974 bytes; baseline has no added headroom. Native Host, production installation/load and whole-run QA are not inferred from these results.
