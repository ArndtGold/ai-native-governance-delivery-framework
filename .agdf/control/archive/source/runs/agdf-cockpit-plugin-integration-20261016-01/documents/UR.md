# UR: Deliver Cockpit through the AGDF plugin

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-16
Owner: Arndt Gold
Run: agdf-cockpit-plugin-integration-20261016-01
Language: en

## 1. Problem

The Codex MCP settings list the regular AGDF server under plugin-provided servers, while the general Cockpit is supplied through a separately prepared project-local connection named `agdf-cockpit-local`. The user expects installing AGDF to provide its Cockpit. Separate setup, update and removal make one product appear to be two independently maintained integrations.

## 2. Goal

Installing or updating the AGDF plugin for Codex also supplies the existing Cockpit with compatible runtime and UI assets. The user can open it without building or registering a separate local MCP server. Plugin lifecycle operations own the integrated components. Use the user-facing name **Cockpit**, the recommended spelling of the user's tentative suggestion "cockbit"; technical identifiers are a design concern.

## Affected Users

AGDF users in Codex, including the current user with an existing local Cockpit connection, and maintainers responsible for plugin packaging and installation. Codex is the first delivery surface established by this conversation; the existing Claude integration is related work with its own scope and evidence.

## 3. Scope

- Supply the existing Cockpit tools and interactive UI through the Codex AGDF plugin, using existing packaging, launcher, runtime and lifecycle owners. A separate internal MCP process is permissible if justified; no separate user setup is required.
- Include compatible UI and runtime assets in the actual installed distribution. Plugin installation, update, disablement and removal must account for the integrated Cockpit, with accurate reporting of partial failures and recovery.
- Establish an explicit, verifiable project binding when the Cockpit is opened. Avoid hardcoded repository paths, silent selection from recency, or treating working directory as project authority. Unresolved or ambiguous targets need a clear user-facing outcome.
- Preserve the existing read, session, source identity and context handoff boundaries. Opening a view or selecting a run does not approve a gate or authorize delivery.
- Provide a bounded transition from the existing separate local connection. Recognize owned legacy registrations, avoid duplicate effective Cockpit tools, and preserve unrelated or foreign configuration. Remove or disable the owned legacy connection only after the replacement is verified and recovery is defined.
- Use **Cockpit** consistently as the visible feature name. Preserve or migrate existing technical identifiers and references as needed for compatibility rather than renaming them indiscriminately.
- Update setup and architecture documentation to describe plugin-provided use and the legacy transition. Perform the bounded local installation and fresh Codex verification needed to establish the result, retaining separate package, installed-payload and live-host evidence.

## 4. Non-Goals

- New Cockpit product features, a UI redesign, new approval writers, changed gate semantics, automatic delivery continuation or a parallel control-state store.
- A new installer, launcher, runtime store or lifecycle authority alongside existing owners.
- Expanding the existing Claude work, implementing other hosts or claiming compatibility from Codex-only evidence.
- Public marketplace submission, npm publication, release, Git commit or push. These require their own applicable instruction and delivery boundary.
- Rewriting historical evidence or transferring approvals from the local Cockpit, Claude, packaging or guided-MCP runs.

## 5. Acceptance Signals

1. A clean Codex AGDF plugin installation provides the Cockpit tool and UI resource without `prepare-cockpit-local`, manual project configuration or an additional MCP installation command.
2. In a fresh Codex session using that installed plugin, the user opens the existing Cockpit and reads the intended project's canonical run and document data. The observed rendering and context capabilities are recorded; declaring a server is insufficient proof.
3. The displayed feature name is Cockpit. The user can identify it as part of AGDF, without needing to understand internal server names.
4. Project binding is checked and repository-specific paths are absent from the distributed declaration. Missing, invalid and ambiguous targets do not silently open another project.
5. Updates keep UI and runtime compatible. Disablement/removal and partial failure handling follow the existing plugin lifecycle and preserve unrelated configuration.
6. For the existing local setup, the transition leaves one effective Cockpit path after successful verification; foreign or unrecognized registrations produce a bounded conflict outcome rather than destructive cleanup.
7. Regular AGDF operations and Cockpit read/context boundaries retain their behavior. Documentation distinguishes source and automated checks from installed and actual Codex-host verification.

## 6. Existing Source Of Truth

- The current user's explicit request to integrate the Cockpit into the AGDF plugin and eliminate separate setup, following the Codex settings screenshot and this conversation.
- `plugins/agdf/`, `scripts/sync-plugin-mcp.js`, the package assembly pipeline and `packages/cli/lib/mcp-lifecycle/` for canonical plugin projections, packaging and runtime/lifecycle ownership.
- `packages/mcp-server/`, `packages/control-ui/` and `packages/core/lib/control-inspect/cockpit*.js` for existing tools, resources, UI and canonical read/session/context services.
- `scripts/prepare-cockpit-local.mjs` and `docs/architecture/06-agdf-cockpit.md` for the current separate Codex preparation and its boundaries.
- Related URs: `agdf-cockpit-mcp-app-20261005-01` supplies the local Codex journey and excludes public distribution; `agdf-cockpit-claude-host-20261008-01` owns Claude plugin integration and explicitly excludes changes to the Codex local profile. Guided-MCP and portable-package work remain owners of their existing lifecycle and packaging concerns, not approvals for this new integration.
- `.agdf/control/` and `plugins/agdf/meta/contracts/` remain canonical for project state, target resolution and deliberate human decisions.

## 7. Risks And Unknowns

Brownfield Review must establish the smallest reuse path through Codex plugin declarations and existing lifecycle owners, including interactions with related packaging work. PRD and SD must define how a plugin-provided Cockpit receives a verified project target, how legacy ownership and conflicts are recognized, and how update/recovery keeps UI and runtime coherent. The UI payload affects package budgets and provenance. A fresh Codex session may be required after local installation; package checks alone cannot establish host behavior. Naming is a reversible editorial choice proposed for approval here, not permission to break identifiers.

## 8. Next Step

Review this persisted UR and approve only with `Approval: UR`. That permits Brownfield Review and Mode/Slice selection for this scope. Product/design/task-plan preparation and implementation remain subject to their applicable gates.

## AGDF Approval Summary (de; source=en)

Das Cockpit soll zur normalen AGDF-Plugin-Installation in Codex gehören. Heute erfordert es eine separate lokale Vorbereitung und Serververbindung. Ziel ist: AGDF installieren oder aktualisieren und das vorhandene Cockpit ohne zusätzlichen Build, Konfigurationseintrag oder MCP-Einrichtungsbefehl öffnen können. Als sichtbaren Namen schlägt diese Anforderung **Cockpit** vor, die übliche Schreibweise deines Namensvorschlags.

Betroffen sind AGDF-Anwender in Codex, insbesondere dein vorhandenes lokales Setup, sowie die Verantwortlichen für Plugin und Installation. Das Plugin soll passende UI- und Laufzeitbestandteile liefern und deren Installation, Update, Deaktivierung und Entfernung über die bestehenden Zuständigkeiten verwalten. Intern dürfen getrennte Server bestehen. Das Zielprojekt muss beim Öffnen eindeutig und überprüfbar gebunden werden; ein fest eingebauter Repositorypfad oder eine stillschweigende Auswahl reicht nicht.

Die vorhandene lokale Cockpit-Verbindung wird kontrolliert abgelöst: kein doppeltes wirksames Angebot, Erhalt fremder Einstellungen und Abschaltung oder Entfernung des eigenen alten Eintrags erst nach geprüftem Ersatz mit definierter Wiederherstellung. Die lokale Plugin-Installation und eine frische Codex-Prüfung gehören zum Nachweis. Abnahmefähig ist die Integration, wenn eine saubere Plugin-Installation das Cockpit samt Oberfläche bereitstellt, der echte Host die vorgesehenen Projektdaten anzeigt, der Wechsel vom alten Setup funktioniert und Updates sowie Entfernung konsistent bleiben. Quellen-, Paket-, Installations- und Hostnachweise bleiben unterscheidbar.

Wiederverwendet werden die kanonische Pluginquelle, Paketgenerierung, vorhandene Launcher und Lifecycle-Dienste sowie Core-, MCP- und UI-Cockpit. Die bestehenden lokalen Codex- und Claude-Arbeiten behalten ihre eigenen Freigaben. Enthalten sind weder neue Cockpit-Funktionen noch neue Freigabeschreiber, neue Installationssysteme, andere Hostintegrationen, Veröffentlichung, Release oder Git-Aktionen. Lesen und Auswahl erteilen weiterhin keine fachliche Freigabe.

Offen für Brownfield Review und anschließendes Design sind die konkrete Codex-Projektbindung, sichere Erkennung alter Einträge, Konflikt- und Wiederherstellungsverhalten sowie Paketgröße und Versionskonsistenz. Der nächste Schritt nach `Approval: UR` ist Brownfield Review mit Wahl des kleinsten tragfähigen Delivery-Pfads; diese Freigabe erlaubt noch keine Codeänderung.
