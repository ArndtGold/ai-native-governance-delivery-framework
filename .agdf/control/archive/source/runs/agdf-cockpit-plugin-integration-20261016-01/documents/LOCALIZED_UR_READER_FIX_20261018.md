# Localized approved UR summary compatibility

- Date: 2026-10-18
- Run: agdf-cockpit-plugin-integration-20261016-01
- Revision inspected: 51 / 8d6147a3-9734-4491-bd6a-857452322917
- Effect: repair the false German UAT content blocker; no gate approval or source revision.

The approved UR contains an existing German prose summary under the exact AGDF Approval Summary (de; source=en) heading. The current decision-content observer only understood a named Ziel scalar. It consequently reported localized_content_missing despite the saved German explanation of the intended outcome.

The shared authored-content lexical owner now provides a closed localized_goal compatibility profile. UAT first reads the existing explicit localized goal field. Only absent structured content can use the entire first authored paragraph of the exact locale/source summary. This path neither selects individual sentences nor translates, rewrites, truncates or invents content. Recognized named fields anywhere in that summary reject prose fallback. The 128 KiB source bound and 1200-character concrete-content bound remain. QA result/limits/risks still require their explicit fields.

Regression coverage includes structured summaries, multiline prose, verbatim paragraph projection, unchanged source bytes, wrong locale/source, nested/duplicate headings, quotes, fences, HTML, empty/duplicate fields, mixed prose/fields, unrelated fields, placeholders, overlong content and unchanged source-size limits. decision-content-test.js passed. Report decision, immutable presentation, QA deviation acceptance and command-service suites also passed (four suites, no failures). Focused source review found no new write path, arbitrary-heading option or gate override. git diff --check passed.

The actual public repository CLI gate-check now reports UAT open, blocking_reason none and doctor pass. Evidence is retained in evidence/localized-ur-reader-fix-20261018/cli-gate-check.json. Protected UR and QA hashes were checked against the approved material and remain unchanged; see protected-sources.json. The QA acceptance of CPI-E01 remains recorded with technical QA revise. UAT still requires a separate deliberate user response to its exact prepared presentation.

The corrected repository CLI is the supported path used here. The previously loaded immutable Desktop/MCP candidate has not been replaced or patched, and no restart or additional UI test is requested. A future packaged update must use the normal publication/installation owners. Native qualification and rollback boundaries remain unchanged.
