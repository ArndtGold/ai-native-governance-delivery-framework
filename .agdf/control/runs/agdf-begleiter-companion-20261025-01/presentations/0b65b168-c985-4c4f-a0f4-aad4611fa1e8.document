# SD: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-25
Owner: Arndt Gold
Run: agdf-begleiter-companion-20261025-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The companion is a Claude Code hooks module (a "mod") shipped inside the generated AGDF runtime plugin and declared only by the runtime-profile Claude manifest. It consists of a thin host adapter (`register.mjs`) and host-independent ES modules for run-state reading, state rules, run assignment, localization, gate bar and figure rendering. The adapter registers the `/agdf-companion` command, observes main-loop turn events, refreshes a read-only snapshot of `.agdf/control/runs/*/RUN_STATE.md` and draws its own pane. It holds no authority: it writes nothing under `.agdf/control`, has no gating hooks and offers no approval or continuation action. Codex and Copilot never reference it, the shared `hooks/hooks.json` stays byte-identical, and a module failure is isolated by the host.

Feasibility was probed on 2026-10-25 with Claude Code 2.1.308 on Windows: a hooks file referenced only by `.claude-plugin/plugin.json` (`"hooks": "./hooks/claude-companion.json"` with `"modules"`) passed `claude plugin validate` and loaded its module at session start, while the plugin's `hooks/hooks.json` SessionStart command hook ran as well; a deliberately throwing module failed to load with a reported error while the same plugin's SessionStart command hook still ran and the session answered normally.

## 2. Ownership And Source Of Truth

- Run state: `RUN_STATE.md` written only by the canonical AGDF writers in `packages/core/lib/control-state/`; the companion is a read-only consumer.
- Configured chat language: `.agdf/control/config.json` `chat_language`, resolved with the same rule as `resolveConfiguredChatLanguage` in `packages/core/lib/resources/context.js` (missing or invalid → fallback locale `en`).
- Gate titles and operational values (next step): `plugins/agdf/meta/agdf-interaction-locales.json`, localized with the same lookup as `localizedOperationalValue` in `packages/core/lib/interaction-presentation.js`.
- Companion labels: a companion-owned locale file with the same locale identifiers and fallback.
- Companion source: new canonical source `plugins/agdf/host-templates/claude/companion/`; generated into the runtime plugin by `scripts/sync-package-assets.js`.
- Claude manifest: `createClaudePluginManifest` in `scripts/public-plugin/manifest.js`; its runtime profile adds the companion declaration from the Claude companion descriptor `plugins/agdf/host-templates/claude/companion/companion.json`; verified by `plugins/agdf/scripts/check-runtime-integrity.mjs` and `packages/cli/scripts/public-plugin-test.js`. The shared plugin definition `plugins/agdf/meta/agdf-plugin.definition.json` stays unchanged because it ships in the Copilot payload.
- Copilot payload: explicit inventory in `scripts/public-plugin/copilot-profile.js` with its reviewed baseline.
- Payload budget and provenance: `scripts/payload-budget.js`, `docs/maintenance/payload-budget-history.md`, `packages/core/lib/runtime/plugin-provenance.js`.
- User choices (on/off, still pose, per-project selection): one state file `companion-state.json` in the AGDF plugin data directory `plugins/data/agdf-agdf/` in the Claude configuration directory (`CLAUDE_CONFIG_DIR`, else `.claude` in the user profile), which Claude removes on uninstall; the host plugin store `$.store` is not used.
- Turn activity: the Claude host (`turn.start` / `turn.complete` of the main loop).

## 3. Architecture Decisions

- SDD-01: Wire the companion only through the runtime-profile Claude manifest: `createClaudePluginManifest` (runtime profile only) adds `"hooks": "./companion/hooks.json"` read from the Claude companion descriptor `plugins/agdf/host-templates/claude/companion/companion.json`, not from the shared plugin definition; `companion/hooks.json` declares `{ "modules": ["./register.mjs"] }`; the source manifest declares none, as for `mcpServers`; rationale: the probe proved manifest-referenced modules load and merge with `hooks/hooks.json`, and the shared definition ships in the Copilot payload (Brownfield Analysis BA-F01), so the definition, `hooks/hooks.json`, Codex hook trust and the Copilot payload stay untouched; consequence: companion files are physically present but inert in the Codex view of the shared runtime folder, and the descriptor is a second, Claude-only input to the manifest projection.
- SDD-02: Keep the companion out of the Copilot projection: no inventory mapping for `companion/`, and an integrity assertion that neither the Copilot payload nor the Codex manifest nor `hooks/hooks.json` references it; rationale: AC-009 with an unchanged Copilot baseline; consequence: one more negative check in the integrity owner.
- SDD-03: Write the companion as plain ES modules (`.mjs`) without JSX or TypeScript, building elements through the host-provided surface table; all logic modules are host-independent and import nothing from the host; rationale: the repository CI has no Claude Code and no plugin TypeScript toolchain, so Node tests in `verify:ci` must import the logic directly; consequence: the mod API is not type-checked in CI; `claude plugin validate` and `claude plugin test` remain native evidence.
- SDD-04: Read `RUN_STATE.md` directly with a bounded parser of the documented sections (Run Meta fields `run_id`, `lifecycle`, `current_gate`, `decision`, `updated_at`; Current Control State answers "What is missing?" and "What is the next allowed action?"; Approvals rows; first Objective line) and bind it to the canonical format with parity tests that create fixtures through the canonical writers and compare with the core control-state reader; a state matching no rule is reported unreadable; rationale: no host-independent canonical projection is reachable from a mod without permission prompts and process coupling; consequence: format changes fail the parity tests instead of drifting silently. Rejected: calling `agdf_inspect` from the mod (tool permissions, about one second per run, coupling the panel to the MCP lifecycle) and a new core status file (UR non-goal).
- SDD-05: Localize with existing data: chat language per SDD source rule; gate titles from `gateTitles`; next step by matching the English source value against the fallback pack's `operationalValues`, `primary.actions`, `primary.afterApproval` and `primary.quality` and taking the same key from the chat-language pack, else the source text; companion labels from `companion/locales.json` (en, de) using the same locale identifiers and fallback; rationale: AC-005 while keeping the core locale registry and the Copilot payload unchanged; consequence: a second, small locale file whose locale set a parity test keeps equal to the core registry.
- SDD-06: Assign the displayed run per session: record the host time at `session.start`; on each refresh the open runs whose `updated_at` is at or after that time are "changed in this session" and the most recent one wins; otherwise the remembered selection for the project root (one selection entry per project root in the companion state file); otherwise no run assigned; a remembered run that is no longer open is dropped; rationale: implements the approved rule without core changes; consequence: a run changed concurrently by another session on the same repository can take over the panel (documented limit). Rejected for now: observing AGDF tool-call inputs for run identifiers (tighter coupling to tool names and inputs).
- SDD-07: Persist only three user choices in one JSON file `companion-state.json` inside the AGDF plugin data directory `plugins/data/agdf-agdf/` in the Claude configuration directory (`CLAUDE_CONFIG_DIR`, else `.claude` in the user profile): `enabled`, `still` and one `selection` entry per project root; the module derives the directory through `$.env` because it does not receive `CLAUDE_PLUGIN_DATA`, and reads and writes the file with `$.fs` only when that directory already exists, otherwise the choices last for the session only and nothing is created; `$.store` is not used; `/agdf-companion` toggles `enabled`, opens or closes the pane and starts or stops refreshing; closing the pane by its own mark hides it for the session only; rationale: AC-001 and AC-004 with storage that `claude plugin uninstall` removes (AC-009): the T-001 host probe of 2026-10-25 showed that Claude keeps `$.store` data after uninstall but removes the plugin data directory, and that the AGDF MCP server stays connected beside the state file; consequence: the path follows the observed host convention of naming the data directory after plugin and marketplace (`agdf-agdf` for the AGDF marketplace); if the convention changes, the companion falls back to session-only choices, and the native checks after host updates cover it.
- SDD-08: Refresh only while enabled: at `session.start`, after each main-loop `turn.complete`, on "Neu lesen" and on a 30-second timer; `turn.start` / `turn.complete` without `agentId` drive the läuft state; a transient read failure keeps the last snapshot marked stale; the companion uses `$.fs.read`, `$.fs.list` and `$.fs.exists` only; rationale: AC-003, AC-006 and AC-007; consequence: a read of all run states per refresh (prototype: 144 runs in about 240 ms), acceptable for the cadence.
- SDD-09: Render per surface: on desktop an `Svg` figure (`isInteractive` for SMIL motion) whose accessories sit in a reserved region outside the figure's bounding box, a still pose that emits no animation elements, a compact gate bar of `✓`, `●`, `○` tokens without separators sized to the pane's `bodyColumns` with a condensed form below the fitting width, a one-line objective with a toggle, the next step, the assignment origin and the last read time; in the terminal the same fields as text; mobile is not an acceptance surface; rationale: AC-002 and AC-010 from the panel findings; consequence: geometry and width rules are covered by rendering tests.
- SDD-10: Isolate failures: no gating hooks (only observing turn events, the own command and the own pane), every adapter hook passes the event on through a catch path, and logic exceptions become the unreadable state; module load failures are skipped by the host as probed; rationale: AC-008; consequence: a broken companion can at most fail to show itself.
- SDD-11: Treat the payload change through existing owners: regenerate the runtime plugin and its provenance, record the payload budget change with a reason through `scripts/payload-budget.js`, refresh evaluation fingerprints and compatibility records through their generators, and renew native Claude evidence only where the qualification tuple's payload changes; rationale: AC-011 and the Brownfield cross-host finding; consequence: release-qualification evidence for this change is refreshed in this run, not deferred.

## 4. Integration Points

- Claude host: hooks module API (`session.start`, `turn.start`, `turn.complete`, `command.run`, `ui.render` for the own pane, `ui.close`), `$.ui.open`, `$.command.register`, `$.fs`, `$.env`, `$.clock`, `$.session.cwd`, `$.plugin.root`.
- AGDF control files: `.agdf/control/config.json`, `.agdf/control/runs/*/RUN_STATE.md` (read-only).
- Plugin data: `meta/agdf-interaction-locales.json`, `companion/locales.json` (read through `$.plugin.root`).
- Build and checks: the Claude companion descriptor `plugins/agdf/host-templates/claude/companion/companion.json`, `scripts/public-plugin/manifest.js`, `scripts/sync-package-assets.js`, `plugins/agdf/scripts/check-runtime-integrity.mjs`, `packages/cli/scripts/public-plugin-test.js`, `scripts/public-plugin/copilot-profile.js`, `scripts/payload-budget.js`, provenance and compatibility generators.
- Documentation: the Claude section of the installation documentation and the plugin-facing documentation for switching the companion on and off.

## 5. Constraints And Compatibility

- `hooks/hooks.json`, the Codex manifest, the shared plugin definition and the Copilot payload stay byte-identical; Codex hook trust is not invalidated.
- The source plugin manifest declares no runtime components; only the runtime profile declares the companion.
- No change to contracts, dispatcher, MCP server, SessionStart hook behaviour or the `RUN_STATE.md` format.
- The mod API is early access; the documentation names the Claude Code version range observed (2.1.302 to 2.1.308 at design time) and the behaviour on an incompatible host (companion unavailable, AGDF unchanged).
- The working directory is not AGDF target authority; the companion's project root is used for display only.

## 6. Test And Evidence Strategy

- Node tests in `verify:ci`: parser and state rules on fixtures created by the canonical writers in a temporary target, with parity against the core control-state reader; assignment (session start, several changes, remembered selection, vanished run); localization parity against the status-card lookup and locale-set parity; gate bar width rules; figure geometry (accessory regions disjoint from the figure box) and still pose; terminal text; adapter behaviour with a fake host (command toggling, persistence keys, no write calls, catch paths).
- Integrity and payload checks: Claude runtime manifest declares exactly the companion hooks file; Codex manifest, `hooks/hooks.json` and Copilot payload carry no companion reference; budget and provenance regenerated and reviewed.
- Native evidence where Claude Code is available: `claude plugin validate` and `claude plugin test` on the generated companion; an early host probe of an installed AGDF build (module loads, failure isolation with a deliberately broken module, no companion state after uninstall).
- Live evidence: one dated Claude desktop Code tab session on Windows covering the four states, still pose, single-line gate bar, no-run state, a turn transition and a byte-identical control-state check.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | `/agdf-companion` toggles `enabled` in the companion state file in the AGDF plugin data directory, opens or closes the pane; off by default | Claude host command, `$.fs` and `$.env` APIs; companion adapter | SDD-07 | Session-only choices when the plugin data directory is missing; removal on uninstall verified by the T-001 probe |
| AC-002 | Pane layout with compact gate bar, one-line objective toggle, origin and last read time | Companion render module; pane `bodyColumns` | SDD-09 | Narrow panes use the condensed gate bar; covered by width tests |
| AC-003 | State rules over parsed run state plus main-loop turn activity; unknown states reported unreadable | `RUN_STATE.md` via canonical writers; host turn events | SDD-04, SDD-08 | Format drift caught by parity tests |
| AC-004 | Session-start comparison of `updated_at`, most recent wins, remembered selection per project, no-run state | Run state `updated_at`; selection in the companion state file | SDD-06 | Concurrent sessions on one repository may reassign; documented limit |
| AC-005 | Chat language from config; gate titles and next step through the status-card lookup; companion labels from its locale file | `agdf-interaction-locales.json`; `config.json`; `companion/locales.json` | SDD-05 | Locale-set parity test prevents divergence |
| AC-006 | Specific messages for missing control, unreadable state and no open runs; stale marker and retry | Companion reader and adapter | SDD-04, SDD-08 | none beyond the read cadence |
| AC-007 | Read-only file access, no gating hooks, no approval or continuation controls | Companion adapter; host API surface used | SDD-08, SDD-10 | Static check that no write API is called |
| AC-008 | Separate module, catch paths, host-skipped load failures | Claude host module isolation; companion adapter | SDD-10 | Proven by probe for command hooks; MCP isolation verified in the TP host probe |
| AC-009 | Claude-only manifest declaration from the companion descriptor; unchanged plugin definition; Copilot inventory without companion; integrity negative checks | Claude companion descriptor; manifest projection; integrity check; Copilot inventory | SDD-01, SDD-02 | Inert companion files in the Codex view of the shared folder |
| AC-010 | Reserved accessory region, still pose without animation elements, terminal text fallback | Companion figure and render modules | SDD-09 | SMIL ignores reduced motion; still pose is the fallback |
| AC-011 | Node tests in verification, native plugin checks, regenerated budgets, fingerprints and compatibility records, documentation | `verify:ci`; payload, provenance and compatibility owners | SDD-03, SDD-11 | Native evidence for the changed payload must be renewed |

## 8. Risks And Open Questions

- Claude keeps `$.store` data after uninstalling the plugin (T-001, 2026-10-25); the companion therefore never uses `$.store`. The plugin data directory path is a host convention observed on Claude Code 2.1.302; a changed convention degrades to session-only choices.
- MCP isolation from a failing companion was verified in T-001 for the MCP connection and the SessionStart hook; the dispatch call under a failing companion is renewed with fresh authentication.
- Installed-plugin hooks modules sit behind a host rollout flag (`tengu_plugin_hooks_modules`); where a host does not load them, the companion is absent and AGDF is unaffected.
- The mod API may change; the version range and incompatible-host behaviour are documented.
- Reading all run states per refresh scales linearly with the number of runs; measured in the live test.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Claude-only wiring | before_sd | resolved | SDD-01: runtime-profile Claude manifest declares `./companion/hooks.json` from the Claude companion descriptor under `plugins/agdf/host-templates/claude/companion/`; shared plugin definition, `hooks/hooks.json`, Codex manifest and Copilot payload unchanged; evidenced by the 2026-10-25 probe and corrected by the SD source revision after Brownfield Analysis BA-F01 | Arndt Gold, SD Owner |
| Copilot exclusion | before_sd | resolved | SDD-02: no Copilot inventory mapping; integrity negative checks | Arndt Gold, SD Owner |
| Module language and testability | before_sd | resolved | SDD-03: plain `.mjs`, host-independent logic modules tested in `verify:ci`; native plugin checks as separate evidence | Arndt Gold, SD Owner |
| Status source | before_sd | resolved | SDD-04: bounded `RUN_STATE.md` parser with parity tests against canonical writers; MCP call and new core file rejected | Arndt Gold, SD Owner |
| Localization source | before_sd | resolved | SDD-05: config chat language, status-card lookup on the core locale packs, companion labels in `companion/locales.json` with locale-set parity | Arndt Gold, SD Owner |
| Run assignment mechanism | before_sd | resolved | SDD-06: `updated_at` at or after session start, most recent wins, remembered selection per project root, no-run state | Arndt Gold, SD Owner |
| Persistence of user choices | before_sd | resolved | SDD-07: `companion-state.json` in the AGDF plugin data directory with `enabled`, `still` and one `selection` entry per project root, written only when the directory exists; no `$.store`; corrected by the SD source revision after the T-001 probe | Arndt Gold, SD Owner |
| Refresh cadence and read boundary | before_sd | resolved | SDD-08: refresh while enabled at session start, after main-loop turns, on retry and every 30 seconds; read-only file APIs | Arndt Gold, SD Owner |
| Rendering per surface | before_sd | resolved | SDD-09: SVG figure with reserved accessory region, compact gate bar by `bodyColumns`, one-line objective toggle, terminal text; mobile not an acceptance surface | Arndt Gold, SD Owner |
| Failure isolation | before_sd | resolved | SDD-10: no gating hooks, catch paths, host-skipped load failures | Arndt Gold, SD Owner |
| Payload and evidence refresh | before_sd | resolved | SDD-11: existing generators and budget review; native Claude evidence renewed where the payload changes | Arndt Gold, SD Owner |
| Early host probe sequence | later_tp | open | Probe module loading in an installed build, failure isolation including MCP, and no companion state after uninstall before implementing persistence | TP author through gate-check |
| Fixture strategy for parity tests | later_tp | open | Which canonical writer sequences produce the fixture states for all four moods and the unreadable case | TP author through gate-check |
| Documentation placement | later_tp | open | Exact documentation files for switching on and off and the limits | TP author through gate-check |

## 9. Next Step

Review this solution design and approve only with `Approval: SD`. Valid approval permits Task/Test Plan authoring; implementation still requires the approved TP and implementation-preparation Brownfield Analysis.

## Source and Derivation Evidence

- Approved PRD (`PRD.md`, sha256:f0d1d17780912408d10100eba78f448f79ab85156f4b0b876ac2f620344fbdf0), `BROWNFIELD_REVIEW.md` and `UX_INTENT_DEFINITION.md` of this run.
- Inspected code: `scripts/public-plugin/manifest.js:84-96`; `plugins/agdf/scripts/check-runtime-integrity.mjs:1330-1359`; `packages/cli/scripts/public-plugin-test.js:79-80`; `scripts/sync-package-assets.js:189,615`; `scripts/public-plugin/copilot-profile.js:30-38,90-130`; `packages/core/lib/runtime/plugin-provenance.js`; `packages/core/lib/interaction-presentation.js:415-440`; `packages/core/lib/resources/context.js:44-49`; `plugins/agdf/meta/agdf-plugin.definition.json`; `plugins/agdf/meta/agdf-interaction-locales.json`.
- Host probe 2026-10-25 (Claude Code 2.1.308, Windows): manifest-referenced hooks file with `modules` validated and loaded beside `hooks/hooks.json`; a throwing module failed to load while the plugin's SessionStart command hook ran. Probe plugins and debug logs in the session scratchpad.
- Claude Code mod API declarations of Claude Code 2.1.308 (`$.store` is a JSON file under the user's Claude Code configuration directory; `$.plugin` exposes `name` and `root`).
- SD source revision 2026-10-25 after Brownfield Analysis BA-F01: `scripts/sync-plugin-runtime.js:219` copies the shared plugin definition into the runtime bundle, and the generated Copilot profile contains `meta/agdf-plugin.definition.json`; SDD-01 therefore no longer uses the shared definition.
- SD source revision 2026-10-26 after the T-001 host probe (`T-001_HOST_PROBE.md`; Claude Code 2.1.302, Windows): the `$.store` file under `plugins/store/` survives `claude plugin uninstall`; a state file in `plugins/data/agdf-agdf/` written through `$.fs` is removed with the plugin while the AGDF MCP server stays connected; the module sees `CLAUDE_CONFIG_DIR` and `USERPROFILE` but not `CLAUDE_PLUGIN_DATA`.

## AGDF Approval Summary (de; source=en)

Der Begleiter wird als Claude-Mod im erzeugten AGDF-Runtime-Plugin ausgeliefert und nur über das Claude-Manifest eingebunden. Er ist vorbereitet, aber noch nicht umgesetzt.

- Einbindung: Das Claude-Manifest des Runtime-Profils verweist auf `./companion/hooks.json` mit dem Modul. Den Verweis setzt die Manifest-Erzeugung aus einer Begleiter-Beschreibung unter `plugins/agdf/host-templates/claude/companion/`, nicht aus der gemeinsamen Plugin-Definition; diese landet auch in der Copilot-Payload (Befund BA-F01, korrigiert per Quellrevision). Plugin-Definition, `hooks/hooks.json`, Codex-Manifest und Copilot-Payload bleiben byte-gleich (SDD-01, SDD-02). Eine Probe vom 2026-10-25 hat gezeigt, dass Claude so ein Modul lädt und den normalen SessionStart-Hook daneben weiter ausführt.
- Aufbau: reine `.mjs`-Module; die Logik (Auslesen, Zustandsregeln, Zuordnung, Sprache, Gate-Leiste, Figur) ist hostunabhängig und wird in der Node-Verifikation getestet; Claude-Plugin-Prüfungen gelten als native Nachweise (SDD-03).
- Statusquelle: ein begrenzter Leser für `RUN_STATE.md`, abgesichert durch Paritätstests gegen Testdaten aus den kanonischen Writern; ein MCP-Aufruf aus dem Mod und eine neue Statusdatei im Kern sind verworfen (SDD-04).
- Sprache: Chat-Sprache aus `config.json`, Gate-Titel und nächster Schritt über dieselbe Zuordnung wie die Statuskarte, eigene Panel-Beschriftungen in `companion/locales.json` mit gleichem Sprachsatz (SDD-05).
- Zuordnung und Speicherung: Es gilt der seit Session-Beginn zuletzt geänderte offene Run, sonst die pro Projekt gemerkte Auswahl, sonst „Kein Run zugeordnet“ (SDD-06). Gespeichert werden nur Ein/Aus, Standbild und Auswahl, und zwar in einer Datei im AGDF-Plugin-Datenordner, den die Deinstallation entfernt. Den Plugin-Speicher von Claude behält Claude nach der Deinstallation, deshalb wird er nicht genutzt (SDD-07, korrigiert nach der Host-Probe T-001). Fehlt der Ordner, gelten die Einstellungen nur für die laufende Sitzung.
- Aktualisierung, Darstellung, Isolation: Neu gelesen wird nur bei eingeschaltetem Begleiter, nach jedem Turn, auf Knopfdruck und alle 30 Sekunden, ausschließlich lesend (SDD-08). Zubehör liegt außerhalb der Figur, die Gate-Leiste ist kompakt und an die Panelbreite angepasst, im Terminal erscheint Text (SDD-09). Es gibt keine blockierenden Hooks, und Fehler werden abgefangen (SDD-10).
- Payload und Nachweise: Budgets, Provenienz, Fingerprints und Kompatibilitätsnachweise werden über die bestehenden Generatoren erneuert, native Claude-Nachweise dort, wo sich die Payload ändert (SDD-11).
- Zuordnung zu den Kriterien: AC-001 bis AC-011 sind je genau einmal Designentscheidungen zugeordnet. Die frühe Host-Probe hat Laden und Isolation bestätigt und gezeigt, dass Claude den Plugin-Speicher nach der Deinstallation behält; daraus folgt die Korrektur von SDD-07. Offen für den TP bleiben die Testdaten-Strategie, der Ort der Dokumentation und der erneuerte Dispatch-Nachweis bei fehlerhaftem Begleiter.
