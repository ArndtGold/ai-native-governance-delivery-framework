# MCP skill continuation fix — 2026-09-26

The MCP-first skills still required a SessionStart executable binding to load their contracts.
Codex reported the installed hook as enabled but `modified`; the stale native trust approval
therefore did not establish hook execution. MCP discovery alone could not fill that gap.

The dispatcher now supplies each judgement skill's allowlisted, package-owned contract modules
in `continuation.runtime_contracts`, including SHA-256 content hashes. The nine skills consume
these directly; CLI bindings and bundled files remain explicit fallback routes. Missing required
contracts stop continuation. Contracts and their reader are covered by runtime provenance.
The plugin assembly now includes the nested contract directory as well as the reader.

Validation:

- Real Codex CLI 0.157.1 / gpt-6-luna / macOS x64 / Node 22.22.3: install, discovery,
  dispatch, invalid input, code-review continuation and removal passed. See the adjacent
  `codex-luna-continuation-20260926.json`; raw local results are under its recorded directory.
- All nine skill continuations returned exact bundled module contents over real MCP stdio.
  Inventory checks also verify the SKILL.md module lists and MCP-first consumption instructions.
- Assembled plugin runtime test imports the packaged reader and loads its contracts.
- Provenance test rejects contract tampering; missing-contract service test stops without continuation.
- Offline skill replay: 83/83. Fingerprints were refreshed after reviewing the nine contract-loading
  instruction changes and additive module inventories; expected routes, approvals, actions and
  observations were not changed. This is deterministic fixture revalidation, not nine live reviews.
- Package boundary test passes with npm 10.9.8. npm 12.1.0's changed pack JSON shape still causes
  the existing package-test parser to fail; that separate tooling incompatibility was not changed.
- The complete MCP suite passed under npm 10.9.8, including protocol, safety, provenance,
  performance and packaging. Final performance p95: cold tools/list 1010.965 ms (limit 1500),
  warm dispatch 788.113 ms (limit 1000), 20 samples each; limits were not changed.
- The globally installed MCP runtime's packaged reader also returns `quality` and `context-graph`;
  this confirms the installed runtime contains the fix, not only the isolated test fixture.

Installed local version: `0.14.5+codex.local-2ae8a08c1e05`. AGDF runtime-check consent was renewed.
The native hook remains `modified`: review and trust the AGDF SessionStart hook under `/hooks`,
fully restart Codex for the plugin reload, and start a fresh session. No native trust hashes were
changed automatically. Neither this install nor the MCP E2E proves SessionStart execution.

The compatibility-report refresh stopped with `foreign_output_files`; unrelated existing files
in `docs/compatibility` were preserved. No claim of a freshly regenerated compatibility report.
