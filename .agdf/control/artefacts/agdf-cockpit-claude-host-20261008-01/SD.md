# SD: AGDF Cockpit MCP App in Claude Code

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-08
Owner: Arndt Gold
Run: agdf-cockpit-claude-host-20261008-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The existing cockpit server mode, contract, Core read services and UI resource are reused. Four bounded changes make them available through the Claude plugin:

1. The cockpit mode accepts the Claude surface in the server entry point and the cockpit runtime factory. The Codex path stays as it is.
2. A Claude-specific cockpit runtime offers the cockpit tools and UI resource only to clients that declare MCP app UI support.
3. The plugin MCP launcher gets one additional Claude form that starts the server in cockpit mode for the project root that Claude substitutes into the plugin declaration.
4. The Claude local plugin build adds the verified UI build and a second `agdf-cockpit` entry to the plugin's `claude.mcp.json`. Other surfaces and the default build are unchanged.

Flow in Claude Code:

1. After plugin installation and restart, Claude starts `agdf` (unchanged) and `agdf-cockpit`.
2. `agdf-cockpit` runs the shared launcher with `--cockpit-dir ${CLAUDE_PROJECT_DIR}`.
3. The launcher prepares the same plugin-owned runtime and spawns the server with `--surface claude --cockpit-dir PROJECT_ROOT`.
4. The server binds the cockpit to that root. On each tool or resource listing it checks the requesting client's declared capabilities, then offers the cockpit only to UI-capable clients.

## 2. Ownership And Source Of Truth

| Concern | Owner | Change |
|---|---|---|
| Cockpit tool names, schemas, UI resource identity, limits | `packages/core/lib/control-inspect/cockpit-contract.js` | none |
| Cockpit read projection, sessions, context | `packages/core/lib/control-inspect/cockpit*.js` | none |
| Server argument validation | `packages/mcp-server/bin/agdf-mcp.js` | accept `--surface claude --cockpit-dir ABSOLUTE_PROJECT_ROOT` |
| Cockpit runtime factory | `packages/cli/lib/mcp-dispatch-runtime.js` `createMcpCockpitRuntime` | accept `claude`; mark capability gating for `claude` |
| Server registration and capability gating | `packages/mcp-server/src/server.js` | Claude cockpit offering filtered by declared client capability |
| Plugin launcher | `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` | one additional Claude argument form |
| Plugin MCP declaration and server copy | `scripts/sync-plugin-mcp.js` | Claude cockpit entry and `server/ui/` when requested |
| Plugin build orchestration | `scripts/sync-package-assets.js`, `packages/cli/scripts/prepare-local-plugin.js` | Claude surface requests the cockpit variant |
| UI build output and validation | `packages/control-ui/scripts/build-mcp.mjs` (writer); validation now in one shared helper used by `scripts/assemble-npm.mjs` and plugin sync | extract existing checks, no format change |
| Project root | Claude Code substitution of `${CLAUDE_PROJECT_DIR}` in plugin MCP args (documented "stable project root") | consumed, never inferred from cwd |
| Canonical control state | `.agdf/control/` of the bound project | read-only |

## 3. Architecture Decisions

- SDD-01: Allow cockpit mode for exactly `codex` and `claude` in `agdf-mcp.js` and `createMcpCockpitRuntime`, keep Copilot and OpenCode rejected, and keep the npm cockpit assembly (`assemble-npm.mjs`, Codex local profile) Codex-only; rationale: the smallest consistent extension of the existing mode without a second server; consequence: both guards and their tests change together.
- SDD-02: Add a separate `agdf-cockpit` stdio entry to the Claude plugin declaration with command `node` and args `${CLAUDE_PLUGIN_ROOT}/mcp/agdf-mcp-launch.js`, `--cockpit-dir`, `${CLAUDE_PROJECT_DIR}`, while the existing `agdf` entry stays byte-identical; rationale: the PRD requires a separate connection whose failure leaves the regular tools usable; consequence: Claude shows two plugin servers and the cockpit tools carry their own server prefix.
- SDD-03: The launcher accepts the additional form `--cockpit-dir ABSOLUTE_PROJECT_ROOT` only for the Claude invocation (data root from `CLAUDE_PLUGIN_DATA`) and spawns the verified server with `--surface claude --cockpit-dir ABSOLUTE_PROJECT_ROOT`. A missing, relative or unsubstituted value (still containing `${`) fails with `AGDF_MCP_ARGUMENTS_INVALID` before any runtime work, all existing forms are unchanged, and the server keeps its realpath and directory check (`AGDF_COCKPIT_TARGET_INVALID`); rationale: the host-provided project root is the explicit session context comparable to the explicit Codex `--cockpit-dir`, whereas a model-supplied path would be a filesystem selector excluded by the cockpit contract and cwd is not target authority; consequence: startup failures appear in the Claude MCP status and an absent `.agdf/control/` uses the existing per-call cockpit states.
- SDD-04: For the Claude surface only, offer the cockpit tools and UI resource only when the requesting client declares `extensions["io.modelcontextprotocol/ui"]` with `mimeTypes` including the MCP app MIME type (extension id as `EXTENSION_ID` in `@modelcontextprotocol/ext-apps` 2.0.3), read from the SDK in both protocol eras (initialize capabilities on 2025-era connections, the per-request envelope with backfilled `getClientCapabilities()` on 2026-07-28 connections). Without it, tools/list omits the cockpit tools, resources/list and resources/read omit the UI resource, and a direct cockpit tool call returns the existing `resource_denied` failure before any session or control read. Codex keeps unconditional registration, and the check is implemented in the server without adding ext-apps as a runtime dependency; rationale: the PRD hides the cockpit in non-UI hosts and per-request evaluation covers both protocol eras without changing the reviewed SDK closure; consequence: the offering is a pure function of declared capabilities, so a host that renders without declaring would not get the cockpit, which the live probe reveals.
- SDD-05: `syncPackageAssets({ surface: "claude" })` builds the cockpit variant of the shared runtime plugin by copying the validated `packages/control-ui/dist-mcp/` files `manifest.json` and `cockpit.html` into `mcp/server/ui/` and writing the two-entry `claude.mcp.json`, while every other surface and the default sync keep the one-entry declaration without `ui/`. A missing or invalid UI build fails the Claude build closed with `AGDF_COCKPIT_UI_BUILD_REQUIRED` naming `npm --prefix packages/control-ui run build:mcp`; rationale: no new UI dependency for CI or other surfaces and a deterministic variant per explicit input; consequence: a local Claude install needs the UI build first and plugin provenance covers `ui/` because it is written before provenance is computed.
- SDD-06: Move the existing UI build validation from `assemble-npm.mjs` into one shared helper used by npm assembly and plugin sync (non-symlink files, size limit, manifest schema, URI, MIME, byte length and digest); rationale: no second UI packaging format or diverging checks; consequence: npm cockpit assembly behavior stays unchanged, which its existing test confirms.
- SDD-07: The cockpit server shares the existing plugin-owned runtime under `${CLAUDE_PLUGIN_DATA}/mcp/VERSION`, and both servers may start concurrently using the existing concurrent-preparation handling; rationale: no second data directory and uninstall removes everything; consequence: concurrent first start must be tested.
- SDD-08: The shared runtime plugin artefact also serves Codex, so a Claude-variant build carries the inert, about 1 MB `ui/` directory in that local artefact while default and Codex builds remain without it and the Copilot profile and its payload baseline are unchanged; rationale: one shared artefact avoids a new profile, with an exit condition to split per host when public distribution is scoped in a separate run; consequence: payload growth is measured per build variant and recorded.

## 4. Integration Points

- Claude Code plugin MCP declaration: `mcp/claude.mcp.json` (via `plugin.json` `mcpServers`), with substitution of `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}` (environment) and `${CLAUDE_PROJECT_DIR}` in stdio args.
- Server ↔ host: MCP stdio in both protocol eras. The server reads client capabilities through SDK 2.0.0 (`@modelcontextprotocol/server`); UI resource `ui://agdf/cockpit/v1.html` with MIME `text/html;profile=mcp-app` and an empty CSP domain set (unchanged).
- Embedded UI ↔ host: the existing ext-apps 2.0.3 bridge in the UI; context and message actions remain capability-gated by the UI (unchanged).
- Installer: `npm run install:claude` → `prepare-local-plugin.js claude` → `syncPackageAssets({ surface: "claude" })` → local marketplace and plugin install; Claude restart required.

## 5. Constraints And Compatibility

- The regular `agdf` server, its launcher invocation and its tools are byte- and behavior-identical.
- The Codex cockpit (`--surface codex --cockpit-dir`), `prepare-cockpit-local.mjs` and the npm cockpit assembly are unchanged.
- No new runtime dependency; the reviewed SDK closure and `sdk-runtime-digest.json` are unchanged.
- Read-only cockpit semantics, session limits and the CSP are unchanged.
- Uninstalling the plugin removes both entries and the shared data root; no user-scope configuration is written.
- Windows paths: `${CLAUDE_PROJECT_DIR}` may contain spaces and drive letters. It is passed as one argv element and validated with `isAbsolute`/`realpathSync`.

## 6. Test And Evidence Strategy

- Unit/protocol: argument validation (claude/codex/invalid); launcher forms; capability gating with a UI-capable client and a non-UI client in both protocol eras (tools/list, resources/list, resources/read, direct call → `resource_denied` without session); a regression showing that Codex cockpit registration stays unconditional.
- Packaging: Claude sync with and without a valid UI build (fail closed); default sync unchanged; the shared UI validation used by npm assembly; provenance digests over `ui/`; Copilot baseline unchanged; payload measurement per variant.
- Lifecycle: an isolated `CLAUDE_CONFIG_DIR` install shows two connected servers; concurrent first start; uninstall leaves no data directory or MCP entry.
- Regression: affected MCP server, CLI MCP lifecycle, cockpit, control-ui and plugin suites.
- Live: an early probe in the Claude desktop Code tab on Windows records the declared capabilities, the tool listing and the rendering outcome, with a byte-identical control-tree check. A final observation after implementation updates the documentation.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Separate `agdf-cockpit` declaration and launcher form; regular entry byte-identical | `scripts/sync-plugin-mcp.js`; `plugin-runtime.js` | SDD-02, SDD-03, SDD-07 | Two servers start concurrently; existing concurrent preparation must hold |
| AC-002 | Claude cockpit mode with unchanged contract and UI resource offered to UI-capable clients | `cockpit-contract.js`; `server.js`; `mcp-dispatch-runtime.js` | SDD-01, SDD-04 | Host bridge behavior differs from Codex; UI capability gating is unchanged |
| AC-003 | Capability-gated offering; direct calls rejected before session creation | `server.js` gating; client-declared capabilities | SDD-04 | A host that renders without declaring loses the cockpit; the live probe reveals it |
| AC-004 | Host-substituted project root, absolute and realpath validation, no cwd or model path | `${CLAUDE_PROJECT_DIR}`; `createMcpCockpitRuntime` | SDD-03 | Unsubstituted variable on older Claude versions fails visibly at startup |
| AC-005 | Unchanged read-only cockpit services; byte-identical check in the live test | Core cockpit services | SDD-01, SDD-04 | none beyond the existing read boundary |
| AC-006 | Claude-variant build carrying the validated UI; plugin-owned data; measured payload; Copilot baseline untouched | `sync-package-assets.js`; shared UI validation helper; plugin provenance | SDD-05, SDD-06, SDD-07, SDD-08 | Local Claude install requires the UI build; inert `ui/` in a Codex install from a Claude-variant build |
| AC-007 | All Codex, dispatch and browser paths unchanged; regression suites | existing owners | SDD-01, SDD-02, SDD-06 | Shared validation extraction must not change npm assembly behavior |
| AC-008 | Early and final live Code-tab observation; documentation update | live evidence record; `docs/architecture/06-agdf-cockpit.md`; `packages/control-ui/README.md` | SDD-04 | Code tab may not declare UI support; documented as a limitation |

## 8. Risks And Open Questions

- The Code tab may not declare the MCP app UI extension. The cockpit then stays hidden there, which is an accepted and documented outcome under the PRD.
- The ext-apps extension identifier or capability shape could change in later protocol revisions. The check is pinned to the identifier used by the bundled ext-apps 2.0.3 UI.
- `${CLAUDE_PROJECT_DIR}` substitution requires a current Claude Code. Older hosts fail visibly at cockpit startup without affecting `agdf`.
- The reused Codex cockpit run has not passed UAT; contract changes there would require re-verification here.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Cockpit surface scope | before_sd | resolved | SDD-01: cockpit mode for codex and claude only; npm cockpit assembly stays Codex-only | Arndt Gold, SD Owner |
| Separate Claude cockpit connection | before_sd | resolved | SDD-02: `agdf-cockpit` entry beside a byte-identical `agdf` entry | Arndt Gold, SD Owner |
| Project binding source | before_sd | resolved | SDD-03: Claude-substituted `${CLAUDE_PROJECT_DIR}` via launcher `--cockpit-dir`; no cwd, no model-supplied path | Arndt Gold, SD Owner |
| Capability detection | before_sd | resolved | SDD-04: per-request declared `io.modelcontextprotocol/ui` extension with the MCP app MIME type, both protocol eras; Claude surface only; direct calls denied before session | Arndt Gold, SD Owner |
| UI payload variant and build prerequisite | before_sd | resolved | SDD-05: Claude-surface sync adds validated `ui/` and the second entry; fail closed without UI build; other builds unchanged | Arndt Gold, SD Owner |
| UI validation ownership | before_sd | resolved | SDD-06: one shared validation helper for npm assembly and plugin sync | Arndt Gold, SD Owner |
| Runtime data and concurrency | before_sd | resolved | SDD-07: shared plugin-owned runtime and existing concurrent preparation | Arndt Gold, SD Owner |
| Shared artefact payload trade-off | before_sd | resolved | SDD-08: inert `ui/` in the shared local artefact only for Claude-variant builds. Rationale: avoid a new profile. Mitigation: measured per build. Exit condition: decide a per-host split when public distribution is scoped in a separate run | Arndt Gold, SD Owner |
| Probe ordering and scenario detail | later_tp | deferred | The TP places the live Code-tab probe first and maps every criterion and SDD to tasks, scenarios and evidence | TP author through gate-check |

## 9. Next Step

Review the current SD and approve only with `Approval: SD`. Valid approval permits Task/Test Plan drafting; implementation still requires an approved TP and Brownfield Analysis.

## Source and Derivation Evidence

- Approved PRD (`PRD.md`, sha256:0066e53b922d0b5dbe4decda2e261be18ce215c68752afd0a70d534ff7c3eeda), BROWNFIELD_REVIEW.md and UX_INTENT_DEFINITION.md of this run.
- Inspected code: `packages/mcp-server/bin/agdf-mcp.js`, `src/server.js`, `src/main.js`, `src/cockpit-resource.js`; `packages/cli/lib/mcp-dispatch-runtime.js`; `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`; `scripts/sync-plugin-mcp.js`, `scripts/sync-package-assets.js`, `scripts/assemble-npm.mjs`, `scripts/prepare-cockpit-local.mjs`; `packages/cli/scripts/prepare-local-plugin.js`, `install-local-plugin.js`; `packages/control-ui/scripts/build-mcp.mjs`; `packages/core/lib/control-inspect/cockpit-contract.js`, `cockpit-session.js`.
- SDK evidence: `@modelcontextprotocol/server` 2.0.0 types (`getClientCapabilities()` backfilled per request on 2026-07-28; per-request envelope carries client capabilities); `@modelcontextprotocol/ext-apps` 2.0.3 `EXTENSION_ID = "io.modelcontextprotocol/ui"` and `getUiCapability`.
- Official Claude documentation (fetched 2026-10-08): plugin `.mcp.json` substitution of `${CLAUDE_PROJECT_DIR}`; Claude Code renders no MCP app UI per the MCP Apps quickstart.

## AGDF Approval Summary (de; source=en)

Das Lösungsdesign verwendet Cockpit-Modus, Vertrag, Core-Lesedienste und UI unverändert weiter. Es macht sie mit vier begrenzten Änderungen über das Claude-Plugin verfügbar. Es ist vorbereitet, aber noch nicht umgesetzt.

- Oberfläche und Verbindung: Der Cockpit-Modus akzeptiert neben `codex` auch `claude` (SDD-01). Das Plugin deklariert zusätzlich einen eigenen Server `agdf-cockpit`; der bestehende Eintrag `agdf` bleibt byte-gleich (SDD-02).
- Projektbindung: Der Launcher übergibt den von Claude eingesetzten Projektpfad `${CLAUDE_PROJECT_DIR}` als `--cockpit-dir` (SDD-03). Fehlt der Pfad, ist er relativ oder nicht ersetzt, scheitert der Start sichtbar. Arbeitsverzeichnis und modellgelieferte Pfade werden nie verwendet.
- Ausblenden ohne UI: Nur für Claude bietet der Server die Cockpit-Werkzeuge und die UI-Ressource ausschließlich Clients an, die die MCP-App-Erweiterung `io.modelcontextprotocol/ui` mit dem passenden MIME-Typ melden (SDD-04). Das gilt in beiden Protokollgenerationen. Direkte Aufrufe ohne diese Fähigkeit werden abgewiesen, bevor eine Sitzung entsteht. Codex bleibt unverändert.
- Plugin-Build: Nur der Claude-Build übernimmt die geprüfte UI und den zweiten Eintrag (SDD-05). Fehlt der UI-Build, bricht er mit dem Befehl `npm --prefix packages/control-ui run build:mcp` ab. Andere Builds und das Copilot-Budget bleiben unverändert. Eine gemeinsame Prüfroutine ersetzt die doppelte UI-Prüfung (SDD-06). Beide Server teilen die vorhandene plugin-eigene Laufzeit; die Deinstallation entfernt alles (SDD-07). Der etwa 1 MB große UI-Ordner liegt nur in Claude-Builds des gemeinsamen Artefakts und wird gemessen (SDD-08). Ausstiegspunkt ist eine spätere Aufteilung je Host bei öffentlicher Verteilung.
- Nachweise: Protokolltests decken UI-fähige und nicht UI-fähige Clients in beiden Protokollgenerationen ab. Dazu kommen Paket- und Lebenszyklustests in isolierter Claude-Konfiguration und die Regressionssuiten. Eine frühe und eine abschließende Live-Probe im Code-Tab mit byte-genauer Prüfung der Kontrolldateien ergänzen sie. Reihenfolge und Szenarien legt der TP fest.
- Zuordnung: AC-001 bis AC-008 sind je genau einmal Designentscheidungen zugeordnet. Hauptrisiko bleibt, dass der Code-Tab die UI-Erweiterung nicht meldet; dann bleibt das Cockpit dort dokumentiert ausgeblendet.
