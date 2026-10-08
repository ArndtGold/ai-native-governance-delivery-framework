# Current native reading qualification

- Date: 2026-10-06
- Run: agdf-cockpit-mcp-app-20261005-01
- Observed control revision: 43 / ba4a7152-a206-49c1-9309-81e1c6405f3d
- Native opening arguments: {run_id: "agdf-cockpit-mcp-app-20261005-01"}. Actual host invocation now succeeds.
- Current larger MCP Apps side-panel DOM shows this exact Run, objective, CD+Tests status, open evidence and next allowed step. Source mutation during separate agent bookkeeping is visibly marked stale; deliberate refresh restores current readable data.
- Registered UR opening displays passive content and exact contained Run/path. The document has no Summary/Details switch. X returns to the same Run, preserves Details, and restores focus to the original Requirements source button.
- Clicking Summary preserves the larger surface; Documents disappear and Summary is pressed. Native viewport observed 816 by 1372 pixels, document scrollWidth 816: no horizontal overflow. See NATIVE_RUN-03.jpg.
- Loaded module script and prepared CSS were read through DOM only and matched byte-for-byte against the prepared self-contained HTML. NATIVE_LOADED_IDENTITY-03.json records matching script/style digests, two additional host styles, and prepared full HTML digest sha256:47270f91722834ddad9bfabd66d54a2b7777f471d9419761415e1a4e96e5c800. This proves current executable/style resource identity; it does not invent a new host version.
- Empty native invocation {} also returns success. Its new inline card is not yet exposed in the automation side panel; visible overview outcome remains unobserved. The earlier panel correctly reports its retired session and disables further reads; see NATIVE_EXPIRED-03.jpg. No silent alternative Run was chosen.
- The app-only reading window in NATIVE_NO_WRITE-03.json covers 2940 canonical control files, zero changes. Evidence bookkeeping began only after the window ended.
- Historical synthetic context acknowledgement and neutral question acceptance are retained in NATIVE_PROBE_RECORD-02.json/HOST_FEASIBILITY-02.md. No question was automatically resent.
- Scenario status: current named Run/document/return and local Summary/Details native observations pass; SCN-045 remains partial pending displayed empty overview and final feasibility reconciliation. T-006 remains partial until that current checkpoint is recorded. T-007 onward remains unopened; full production context/handoff, QA/UAT are not qualified.
- Immediate next action: user expands the new empty-input overview; inspect it through the supported MCP Apps panel, reconcile T-006, then implement the approved dependent scope.
