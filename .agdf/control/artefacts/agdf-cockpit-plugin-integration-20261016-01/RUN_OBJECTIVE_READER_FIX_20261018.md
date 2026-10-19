# Run Objective reader repair

- Date: 2026-10-18
- Run: agdf-cockpit-plugin-integration-20261016-01
- Scope: Repair the false QA decision-content blocker; no gate approval or qualification change.

The Run contains a concrete Objective but its append-only history grew to 186579 UTF-8 bytes. The authored-content reader incorrectly applied the 131072-byte report bound to the entire Run. The original reader returns null on the actual current Run; the repaired reader returns the existing concrete Objective. No Run content or historical evidence was shortened or rewritten.

The closed Objective profile now uses the existing control-read capture file bound (32 MiB). All report profiles retain the 128 KiB bound. The reader still scans the entire document, rejects a duplicate Objective even after large history, excludes code/HTML/quoted content and preserves the separate concrete-content length/placeholder checks. Callers cannot choose a larger arbitrary limit.

Verification passed:

- decision-content-test.js: large-history Run readiness, late Objective, late duplicate refusal, fenced content exclusion, UTF-8 bound and unchanged report bounds; existing writer/read-only/localization cases.
- report-decision-test.js: 19 compatibility cases, 139 context cases, 6 internal cases and template/default-domain checks.
- presentation-document-test.js, qa-deviation-acceptance-test.js and run-command-service-test.js: all three suites passed; immutable documents, exact QA acceptance, negative cases and source/operation binding preserved.
- Source review of the two-file repair: no finding; no permissive caller option, shortened Run, manufactured Objective, report limit increase or QA decision change.
- Actual repository CLI gate-check: see evidence/run-objective-reader-fix-20261018/cli-gate-check.json and regression.json. The public CLI is used for subsequent presentation preparation with the repaired source Core.

The already loaded Desktop/MCP runtime remains the previous immutable candidate; this repair has not been installed into it. No cache or runtime generation was patched in place, no Desktop restart was requested, and the existing native UI evidence is unchanged. Any future packaged update must use the normal installer/publication owner. This note does not replace the existing registered review reports or approve QA. Technical QA remains revise and CPI-E01 remains open; only the false reader blocker is removed on the supported repository CLI path.
