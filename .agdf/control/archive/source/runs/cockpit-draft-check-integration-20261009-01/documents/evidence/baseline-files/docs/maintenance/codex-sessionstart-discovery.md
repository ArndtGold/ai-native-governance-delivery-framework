# Codex SessionStart discovery repair — 2026-10-05

The Codex/Claude runtime distribution uses `.codex-plugin/plugin.json` and
`.claude-plugin/plugin.json`. It deliberately excludes root `plugin.json`.
Source, public skills-only and Copilot distributions retain their schema-valid
portable root manifests. The runtime MCP declaration remains `mcp.json`, referenced
explicitly by the native Codex manifest.

Codex Desktop's bundled CLI 0.160.0 returned no hooks for the previous runtime
bundle with the portable root `$schema`. Isolated `plugin/read` comparisons used
the identical hook file: adding an inline OpenAI hooks extension or root hooks did
not restore discovery; omitting the root manifest restored SessionStart discovery.
Removing only `$schema` also restored discovery, but would produce an invalid
portable manifest. The build therefore selects the supported native manifest.

The package validator rejects a root manifest in this runtime profile, and package
contents tests enforce its absence. Installation tests cover upgrading the previous
portable bundle, restoring it on rollback and committing the native replacement.
Adding a root manifest to the installed replacement fails provenance integrity.
Public portable schema validation and Copilot payload guards remain enabled.

The supported local installer installed `0.14.5+codex.local-4bb920034fa7`.
Native `plugin/read` discovered 13 skills, the `agdf` MCP server and one SessionStart
hook. Native `hooks/list` reported that hook enabled and trusted, with no warnings
or errors. Its existing trust hash was preserved; no cache or trust setting was
patched manually.

A fresh ephemeral engine session using the actual Desktop binary then received
one diagnostic prompt. Codex emitted `hook/started` and `hook/completed` for
`sessionStart`; status was `completed`, duration 4975 ms. The context entry contained
the activation guard, `AGDF dispatcher binding:` and `AGDF runtime facts:`. The
process ended after hook completion. No dispatcher call or delivery run was used.
The local doctor's reported `automatic_check.status` was `unknown`; successful
hook execution does not imply a passing repository health assessment.

This proves execution in the Desktop engine on this macOS host, not a reopened
desktop window, another OS or another Codex version. Existing desktop chats still
need a full restart and a fresh chat to reload the corrected installation.

Read-only installed discovery can be repeated with:

```sh
node scripts/native-probes/codex-hooks-list.mjs "$PWD" agdf@agdf "$CODEX_BIN"
```

Set `CODEX_BIN` to the binary bundled with the desktop app when qualifying that
host. Discovery alone is not execution evidence; require native hook events and
the returned context from a fresh first prompt.
