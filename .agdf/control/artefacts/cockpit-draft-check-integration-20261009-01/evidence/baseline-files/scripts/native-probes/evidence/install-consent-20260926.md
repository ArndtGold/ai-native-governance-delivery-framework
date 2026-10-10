# Codex combined installation consent — 2026-09-26

`--accept-plugin-capabilities` is explicit consent to the AGDF SessionStart capability and the
single MCP tool `agdf_dispatch`. Existing commands without the flag retain their consent behavior.
The installer stores the content-bound AGDF hook-intent receipt and uses Codex's documented
`config/value/write` API for the plugin-scoped tool approval, followed by `config/read` verification.
It never writes hook trust hashes or global permission settings. Existing disable settings block
tool approval. Failed or unverified approval returns a partial installation result.

CLI is the standard test; Desktop restart is not a prerequisite for the test. The E2E now installs
with the option and no longer injects its own MCP approval. Real Codex 0.157.1 / gpt-6-luna passed
installation consent, discovery, terminal dispatch, invalid input, contract continuation and removal.
See `codex-install-consent-20260926.json`; raw local evidence:
`probe-results/codex-host-e2e-20260926-191428`.

Unit/integration checks passed: native-policy RPC fixture, consent and hook observation,
CLI argument parsing and install orchestration (including partial failures), setup contract,
setup interaction, setup service, Agent Skills conformance and 83/83 deterministic skill cases.
Tests verify that native hook review remains pending instead of being claimed as execution.

The normal user installation succeeded with `0.14.5+codex.local-29e95a40ad16` and MCP config
readback `configured`. Hook verification remains `hook_review_required`. Start a fresh CLI process
for tests; reviewing the current hook under `/hooks` remains necessary for native hook execution.

Validation limitations: the generic plugin-creator validator only accepts `.mcp.json`, while this
repository's tested Codex profile uses `mcp/codex.mcp.json`; its check therefore failed. The native
installation and E2E validated that host-specific profile. An initial normal-profile preparation
failed its provenance check while package checks ran in parallel; serial retry succeeded. No
provenance check was bypassed. Avoid concurrent writers to the generated package directory.
