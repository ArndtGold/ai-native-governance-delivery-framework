# UR: AGDF Cockpit MCP App in Claude Code

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: agdf-cockpit-claude-host-20261008-01
Language: en

## 1. Problem

The AGDF cockpit MCP app (`agdf_cockpit`, `agdf_cockpit_read`, UI resource `ui://agdf/cockpit/v1.html`) is prepared only for Codex. With the AGDF plugin installed in Claude Code, the user cannot open the cockpit at all: the installed plugin starts only the regular AGDF server with `agdf_dispatch` and `agdf_inspect`; the server entry point accepts `--cockpit-dir` only with `--surface codex` (`packages/mcp-server/bin/agdf-mcp.js`); the plugin contains no cockpit UI payload; and `scripts/prepare-cockpit-local.mjs` writes only a Codex configuration. `docs/architecture/06-agdf-cockpit.md` states that Claude use is neither implemented nor demonstrated in a host. Whether Claude Code displays MCP app UI resources at all is unknown.

## 2. Goal

A user who installs the AGDF plugin in Claude Code gets the cockpit as part of that installation and can open it for an explicitly named run. A real Claude Code session establishes whether the embedded app surface is displayed and which host capabilities it offers. The result is recorded honestly: either evidenced Claude support for the cockpit or a documented limitation with the existing fallback.

## Affected Users

The user working on AGDF delivery in Claude Code with the AGDF plugin installed, starting with the current Windows environment (Claude Code in the Claude desktop app and in the terminal). Users of the Codex cockpit and of the regular AGDF MCP tools are affected indirectly because their behavior must remain unchanged. Support for other hosts must not be claimed without corresponding evidence.

## 3. Scope

- Allow the existing cockpit mode for the Claude surface in the MCP server entry point, using the same tool, resource, session and read boundaries as the Codex cockpit. The Codex cockpit path and the regular `agdf_dispatch`/`agdf_inspect` server stay unchanged.
- Package the built cockpit UI resource and the runtime it needs into the generated Claude plugin. Add a separate cockpit MCP server entry in the plugin's `claude.mcp.json`, started through the existing plugin launcher and plugin-owned data location.
- Bind the cockpit to one verifiable project root for the session, consistent with existing task-target rules: working directory alone is not target authority, and an unbound or invalid project produces a visible failure.
- Keep installation and removal within the existing Claude plugin lifecycle: plugin installation provides the cockpit, plugin uninstallation removes its server and payload without residue.
- Verify in a real Claude Code session that the cockpit opens for an explicit run, and record whether and how the UI resource is displayed (inline/expanded presentation, available bridge methods such as display-mode change, model context and messages). Without a usable surface, record the limitation and the existing fallbacks (textual tool result, local browser cockpit) instead of claiming embedded support.
- Update the cockpit architecture page and the UI README so that Claude status, setup and evidence are stated separately from protocol and automated evidence.

## 4. Non-Goals

- No new approval writer, approval by selection or click, automatic run continuation or changed gate semantics; the cockpit stays read-only.
- No new cockpit features beyond the existing Codex cockpit. Context handoff and contextual questions are offered in Claude only where the host demonstrably supports them; no workaround or emulation.
- No changes to the Codex local cockpit profile (`agdf-cockpit-local`) or its rollback behavior.
- No support for Claude Desktop chat or claude.ai connectors, remote MCP servers, GitHub Copilot or OpenCode in this scope.
- No public plugin distribution, npm publication, release, Git commit or push in this scope.
- No transfer of approvals or evidence authority from `agdf-cockpit-mcp-app-20261005-01` or other runs.

## 5. Acceptance Signals

1. With the AGDF plugin installed in Claude Code, a separate cockpit MCP server connects and lists `agdf_cockpit`, `agdf_cockpit_read` and the cockpit UI resource; the regular AGDF server still lists only `agdf_dispatch` and `agdf_inspect`.
2. In a real Claude Code session on the user's Windows machine, opening the cockpit for an explicitly named run either displays the embedded app, with the observed surface and capabilities recorded, or results in an explicit, documented limitation. Claude support is claimed only to the extent observed.
3. The cockpit reads only the bound project's `.agdf/control/` and writes no control file (verified byte-identical over the test window). Run binding behaves like the Codex cockpit: an unknown or invalid run is reported with its requested identity; no other run is selected automatically.
4. The Codex cockpit path, the regular MCP dispatch/inspection and the browser cockpit keep their validated behavior; their existing automated checks pass.
5. Uninstalling the plugin leaves no cockpit server, payload or data directory behind. The plugin payload growth caused by the UI resource is measured, reviewed and bounded.
6. Documentation states the evidenced Claude status, setup steps and remaining limits, and keeps installed-host evidence separate from protocol and automated evidence.

## 6. Existing Source Of Truth

- The user's requests in this conversation: real Claude support for the cockpit MCP app, consisting of cockpit mode for `--surface claude`, the UI payload in the Claude plugin with its own server entry in `claude.mcp.json`, and a test in the real Claude host.
- `packages/mcp-server/bin/agdf-mcp.js` and `packages/mcp-server/src/server.js` (entry-point arguments, cockpit mode, resource registration); `packages/mcp-server/src/cockpit-resource.js`.
- `packages/core/lib/control-inspect/cockpit-contract.js`, `cockpit.js`, `cockpit-session.js` and `cockpit-context.js` as owners of tool names, schemas, UI resource, sessions and read projection.
- `packages/control-ui/` with the built MCP resource `packages/control-ui/dist-mcp/cockpit.html` (about 1 MB single file) and `manifest.json`.
- `plugins/agdf/` as canonical plugin source, `scripts/sync-package-assets.js` and the plugin MCP launcher `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`; earlier decision to keep Claude state in plugin-owned surfaces (`${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`).
- `scripts/prepare-cockpit-local.mjs` and `docs/architecture/06-agdf-cockpit.md` for the existing Codex-only preparation and documented status.
- Run `agdf-cockpit-mcp-app-20261005-01` (Codex cockpit, currently awaiting UAT) supplies the reused implementation and evidence only.
- Normative rules under `plugins/agdf/meta/contracts/` remain authoritative for activation, target resolution, binding and human decisions.

## 7. Risks And Unknowns

Whether Claude Code renders MCP app UI resources (`text/html;profile=mcp-app`) at all, and which bridge methods it supports, is the central open question; the host test answers it and may end in a documented limitation. The global plugin server needs a verifiable project binding without treating the working directory as authority; SD must choose the mechanism. The roughly 1 MB UI resource affects plugin payload budgets, provenance digests and profile baselines. The reused cockpit implementation belongs to a run that has not yet passed UAT, so later changes there may require re-verification here. New tools may trigger Claude permission prompts. Reinstallation requires a Claude restart before the host test. Brownfield Review must establish reuse and packaging boundaries; PRD and SD must define host-capability handling and failure outcomes.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Die vorhandene Cockpit-MCP-App soll auch in Claude Code nutzbar werden. Heute ist sie nur für Codex vorbereitet: Das installierte Claude-Plugin startet nur den regulären AGDF-Server mit `agdf_dispatch` und `agdf_inspect`. Der Server-Einstieg erlaubt den Cockpit-Modus nur für `--surface codex`, das Plugin enthält keine Cockpit-Oberfläche, und die lokale Vorbereitung schreibt nur eine Codex-Konfiguration. Ob Claude Code MCP-App-Oberflächen überhaupt anzeigt, ist unbekannt.

Ziel ist, dass ein Anwender mit installiertem AGDF-Plugin das Cockpit mit der Plugin-Installation erhält und für einen ausdrücklich genannten Run öffnen kann. Betroffen ist zunächst der Anwender in Claude Code unter Windows (Desktop-App und Terminal). Codex-Cockpit und reguläre MCP-Werkzeuge müssen unverändert weiterlaufen.

Zum Umfang gehört dreierlei. Erstens wird der Cockpit-Modus für `--surface claude` mit denselben Werkzeug-, Ressourcen-, Sitzungs- und Lesegrenzen wie unter Codex zugelassen. Zweitens kommen die gebaute UI-Ressource samt benötigter Laufzeit ins Claude-Plugin, mit einem eigenen Cockpit-Servereintrag in `claude.mcp.json` über den bestehenden Plugin-Launcher. Drittens wird das Cockpit an ein nachprüfbares Projekt gebunden; das Arbeitsverzeichnis allein gilt nicht als Zielautorität. Installation und Deinstallation bleiben im bestehenden Plugin-Lebenszyklus. Ein echter Claude-Code-Test stellt fest, ob und wie die Oberfläche angezeigt wird und welche Host-Fähigkeiten verfügbar sind. Architekturseite und UI-README werden entsprechend aktualisiert.

Abnahmefähig ist der Umfang unter sechs Bedingungen:
- Ein eigener Cockpit-Server verbindet sich und listet die beiden Cockpit-Werkzeuge und die UI-Ressource; der reguläre Server bleibt unverändert.
- Ein echter Claude-Code-Test zeigt die eingebettete App mit erfasster Darstellung, oder er führt zu einer ausdrücklich dokumentierten Einschränkung samt Rückfall (Textergebnis, lokales Browser-Cockpit). Unterstützung wird nur im beobachteten Umfang behauptet.
- Das Cockpit liest nur `.agdf/control/` des gebundenen Projekts und schreibt keine Kontrolldatei. Unbekannte Runs werden sichtbar gemeldet und nicht ersetzt.
- Codex-Cockpit, MCP-Dispatch/-Inspektion und Browser-Cockpit bestehen ihre bestehenden Prüfungen.
- Eine Deinstallation hinterlässt keine Reste; der Größenzuwachs des Plugins durch die etwa 1 MB große UI ist gemessen und begrenzt.
- Die Dokumentation trennt Host-Nachweise von Protokoll- und automatischen Nachweisen.

Nicht enthalten sind:
- neue Freigabeschreiber, Freigaben per Klick, automatische Fortsetzung oder geänderte Gate-Regeln;
- neue Cockpit-Funktionen; eine Kontextübergabe gibt es nur, wenn der Host sie nachweislich unterstützt;
- Änderungen am Codex-Profil `agdf-cockpit-local`;
- Claude Desktop Chat, claude.ai-Konnektoren, Remote-MCP, Copilot oder OpenCode;
- Veröffentlichung, npm, Release, Git-Commit oder Push;
- eine Übernahme von Freigaben aus dem Codex-Cockpit-Run.

Maßgebliche Quellen sind:
- Server-Einstieg und Server in `packages/mcp-server/`;
- die Cockpit-Verträge und -Dienste in `packages/core/lib/control-inspect/`;
- die UI in `packages/control-ui/`;
- die Plugin-Quelle `plugins/agdf/` mit Sync-Skript und Plugin-Launcher;
- die Codex-Vorbereitung und `docs/architecture/06-agdf-cockpit.md`;
- die Runtime-Verträge unter `plugins/agdf/meta/contracts/`.

Der Run `agdf-cockpit-mcp-app-20261005-01` liefert nur wiederverwendbare Implementierung und Nachweise.

Die zentrale Unbekannte ist, ob Claude Code MCP-App-Oberflächen anzeigt und welche Bridge-Methoden es unterstützt. Weitere offene Punkte:
- eine nachprüfbare Projektbindung für den global installierten Plugin-Server;
- Größe, Digests und Basislinien des Plugins;
- die Abhängigkeit vom noch nicht per UAT abgenommenen Cockpit-Run;
- mögliche Berechtigungsabfragen;
- der nötige Claude-Neustart nach der Neuinstallation.

Nächster Schritt nach `Approval: UR` ist Brownfield Review mit Mode/Slice Decision, danach die erforderliche Produkt- und Lösungsplanung vor der Umsetzung.
