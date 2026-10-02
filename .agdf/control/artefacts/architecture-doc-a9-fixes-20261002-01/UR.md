# UR: Architecture docs match plugin MCP distribution

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-02
Owner: Repository owner

## 1. Problem

Architecture review run 4 (`docs/reviews/REVIEW_ai-native-governance-delivery-framework_v4_Architektur.md`,
finding A9) found three statements in the architecture and privacy documentation that contradict
the code at HEAD `0898310`:

- `docs/architecture/README.md:310-311` says the `mcp` commands "do not belong to AGDF 0.14.5",
  although `mcp` is registered in `packages/cli/lib/cli/command-registry.js` and the CLI ships 0.14.5.
- `docs/architecture/README.md:132` and the note in `diagrams/04-distribution.dot` say plugin
  installation stays separate from the MCP lifecycle, although the generated Claude and Codex profiles
  bundle an MCP server and `host-adapters/claude/plugin-mcp.js` reports `deferred_to_first_start`.
- The plugin MCP launcher installs `@modelcontextprotocol/server` from the npm registry on first start
  into a stage directory, and Claude keeps that runtime under `CLAUDE_PLUGIN_DATA`. Neither appears in
  the architecture documentation (only in `INSTALL.md`), and `PRIVACY.md:28-30` states that a local
  runtime needs no package acquisition.

Readers who change distribution or MCP code are misled, and users in proxy, offline or compliance
environments learn about the network access only at first start.

## 2. Goal

The architecture documentation and `PRIVACY.md` describe the shipped 0.14.5 distribution truthfully:
`mcp` commands exist, plugin profiles can bundle a plugin MCP server, and that server's first start
acquires a pinned SDK from npm into a host-owned data directory.

## 3. Scope

- Correct `docs/architecture/README.md` at the plugin-installation row (around line 132) and the
  `mcp` command section (around lines 310-311).
- Describe the plugin MCP path in the architecture docs: bundled profile entry, deferred first start,
  npm acquisition of the pinned SDK into a stage directory, and the second runtime location
  `CLAUDE_PLUGIN_DATA`.
- Correct the note in `docs/architecture/diagrams/04-distribution.dot` and add the plugin MCP path;
  regenerate the matching SVG if the repository keeps a generated SVG.
- Correct `PRIVACY.md:28-30` so the plugin MCP first-start npm acquisition is disclosed.

## 4. Non-Goals

- No code, installer, launcher, lockfile or checksum change (finding L1 is a separate scope).
- No completion of the building-block table or of diagrams 01-03, 05, 06 beyond the items above.
- No change to normative contracts, skills or `INSTALL.md` unless a statement there contradicts the
  corrected text.

## 5. Acceptance Signals

- No sentence in `docs/architecture/*.md` or `PRIVACY.md` claims that `mcp` is absent from 0.14.5,
  that plugin installation never activates MCP, or that a local runtime never fetches packages.
- The plugin MCP first-start path, npm acquisition and `CLAUDE_PLUGIN_DATA` are named in the
  architecture docs and diagram 04, with references to the owning code.
- All relative links in `docs/architecture/*.md` still resolve; existing doc-binding tests (for example
  `packages/mcp-server/test/protocol.test.js`) stay green.

## 6. Existing Source Of Truth

- `packages/cli/lib/cli/command-registry.js`, `packages/cli/lib/cli/application.js` (`mcp` command).
- `packages/cli/lib/host-adapters/claude/plugin-mcp.js`, generated profiles `mcp/claude.mcp.json` and
  Codex `mcp.json`.
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`, `packages/cli/lib/mcp-lifecycle/package.js`
  (stage install, version and identity checks).
- `INSTALL.md` sections on first start and `CLAUDE_PLUGIN_DATA`.

## 7. Risks And Unknowns

- Brownfield Review must confirm the exact first-start behaviour per host (Claude vs. Codex) before the
  docs describe it, and whether the diagram SVG is generated or hand-maintained.
- Integrity checks (`check-runtime-integrity.mjs`) may pin sentences in these files; changed wording
  can break them.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)
- Problem: Architektur-Doku und PRIVACY.md widersprechen dem Code: `mcp`-Befehle angeblich nicht in 0.14.5, Plugin-Installation angeblich ohne MCP, npm-Bezug beim ersten Start und `CLAUDE_PLUGIN_DATA` fehlen.
- Ziel: Doku und Datenschutzhinweis beschreiben die ausgelieferte 0.14.5-Distribution wahrheitsgemäß.
- Umfang: README.md (Zeile ~132 und ~310), Diagramm 04 samt SVG, PRIVACY.md; keine Code-, Installer- oder Lieferkettenänderung (L1 separat).
