# TP: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-25
Owner: Arndt Gold
Run: agdf-begleiter-companion-20261025-01
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Early host probe before persistence and adapter work: a minimal companion wired like SDD-01 into a scratch copy of the generated runtime plugin; verify module loading in an installed plugin, failure isolation with a throwing module (SessionStart hook, AGDF MCP connection and a dispatch call stay working) and that no companion state remains after uninstall; record the outcome as run evidence. The first run on 2026-10-25 (`T-001_HOST_PROBE.md`) confirmed loading and isolation of the SessionStart hook and MCP, found `$.store` data retained after uninstall (SDD-07 corrected) and verified the plugin data directory state file; before T-004 the two throwing-module variants are repeated with a fresh CLI login so the dispatch call is observed | Claude Code implementing agent; live part with Arndt Gold | none |
| T-002 | Claude companion descriptor and manifest projection: add `plugins/agdf/host-templates/claude/companion/companion.json` with the declaration `"hooks": "./companion/hooks.json"`; read it in `createClaudePluginManifest` (`scripts/public-plugin/manifest.js`) for the runtime profile only; leave the shared plugin definition `plugins/agdf/meta/agdf-plugin.definition.json` unchanged; extend `packages/cli/scripts/public-plugin-test.js` with the runtime declaration and its absence from the source manifest | Claude Code implementing agent | T-001 |
| T-003 | Companion logic modules under `plugins/agdf/host-templates/claude/companion/`: run-state reader, state rules, run assignment, localization lookup, gate bar, figure SVG and terminal text, `locales.json` (en, de) | Claude Code implementing agent | T-001 |
| T-004 | Host adapter `register.mjs` and `hooks.json` (`modules`): `/agdf-companion` command, companion state file `companion-state.json` in the AGDF plugin data directory through `$.env` and `$.fs` with a session-only fallback when the directory is missing (no `$.store`), `session.start`, main-loop `turn.start` / `turn.complete`, refresh timer, pane rendering per surface, catch paths, no gating hooks | Claude Code implementing agent | T-001, T-003 |
| T-005 | Generation and integrity: copy the companion into the generated runtime plugin in `scripts/sync-package-assets.js`; extend `plugins/agdf/scripts/check-runtime-integrity.mjs` with the Claude manifest declaration, companion file presence and negative checks for the Codex manifest, `hooks/hooks.json`, the shared plugin definition and the Copilot payload | Claude Code implementing agent | T-002, T-004 |
| T-006 | Node tests in the repository verification: parity with canonical-writer fixtures, state rules, assignment, localization and locale-set parity, gate bar widths, figure geometry and still pose, terminal text, adapter behaviour with a fake host (toggle, persistence keys, no write calls, catch paths, failure injection); register them in the CI plan | Claude Code implementing agent | T-003, T-004 |
| T-007 | Payload and evidence refresh: regenerate the runtime plugin and provenance; review and record the payload budget change with a reason via `scripts/payload-budget.js`; refresh evaluation fingerprints and compatibility records through their generators; run `npm run verify:ci` | Claude Code implementing agent | T-005, T-006 |
| T-008 | Documentation in the Claude section of `INSTALL.md`: switching the companion on and off, supported surfaces, early-access mod API with the observed version range, incompatible-host behaviour, known limits | Claude Code implementing agent | T-004 |
| T-009 | Native and live evidence: `claude plugin validate` and `claude plugin test` on the generated companion; install the built AGDF locally into Claude; one dated Claude desktop Code tab session on Windows covering the four states, still pose, single-line gate bar, no-run state, a turn transition and a byte-identical control-state check | Arndt Gold with the Claude Code implementing agent | T-007, T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-07 | T-004 | SCN-001 | With a fake host the companion is off by default; the command sets `enabled` true and opens the pane, a second call sets it false and closes the pane; a new session reads the stored choice from the state file; without the plugin data directory the choice lasts for the session only and no file or directory is created | Node test output (adapter suite) |
| AC-001 | SDD-07 | T-009 | SCN-002 | In the desktop app `/agdf-companion` opens the panel, a second call closes it, and a new session keeps the last choice | Dated live observation with screenshots |
| AC-002 | SDD-09 | T-006 | SCN-003 | At `bodyColumns` 40 and 60 the gate bar renders on one line (condensed below the fitting width), the objective takes one line with a toggle, and origin and last read time are present | Node test output (render suite) |
| AC-002 | SDD-09 | T-009 | SCN-004 | At the default docked width state, gate bar and next step are readable without wrapping | Live screenshot |
| AC-003 | SDD-04 | T-006 | SCN-005 | For canonical-writer fixtures the parsed fields equal the core reader's values and the four moods plus the unreadable case are derived as specified | Node test output (parity suite) |
| AC-003 | SDD-08 | T-006 | SCN-006 | A main-loop `turn.start` shows läuft; `turn.complete` returns to the run-derived state; subagent turns change nothing | Node test output (adapter suite) |
| AC-004 | SDD-06 | T-006 | SCN-007 | Changed-in-session wins with the most recent; otherwise the remembered selection; otherwise no run assigned; a vanished remembered run is dropped; the origin is shown | Node test output (assignment suite) |
| AC-005 | SDD-05 | T-006 | SCN-008 | German and English panels use pack labels; the next step equals the status-card localization for registered values and falls back to source text otherwise; the companion locale set equals the core registry | Node test output (localization suite) |
| AC-006 | SDD-04 | T-006 | SCN-009 | Missing control, unreadable state and no open runs each produce their specific message without a run list where not applicable | Node test output (reader suite) |
| AC-006 | SDD-08 | T-006 | SCN-010 | A transient read failure keeps the last snapshot marked stale; "Neu lesen" restores the normal state | Node test output (adapter suite) |
| AC-007 | SDD-08 | T-006 | SCN-011 | The adapter never calls a write API and registers no gating hook; the pane offers no approval or continuation control | Node test output plus `claude plugin validate` hook listing |
| AC-007 | SDD-10 | T-009 | SCN-012 | Over the live test window every `RUN_STATE.md` the companion read is byte-identical before and after | Hash listing before and after the live session |
| AC-008 | SDD-10 | T-001 | SCN-013 | With a throwing companion module in an installed build, the SessionStart hook runs, the AGDF MCP server connects and a dispatch call succeeds | Probe debug log and stream output |
| AC-008 | SDD-10 | T-006 | SCN-014 | An exception inside companion logic yields the unreadable state and every adapter hook still passes the event on | Node test output (failure-injection suite) |
| AC-009 | SDD-01 | T-005 | SCN-015 | The runtime Claude manifest declares exactly `./companion/hooks.json`, taken from the companion descriptor; the source manifest declares none; the integrity check fails on any deviation | Integrity check output and manifest projection test |
| AC-009 | SDD-02 | T-005 | SCN-016 | The shared plugin definition, the Codex manifest and `hooks/hooks.json` are byte-identical to before; the Copilot payload inventory and baseline are unchanged and contain no companion file | Integrity and Copilot payload check output with digests |
| AC-009 | SDD-01 | T-001 | SCN-017 | The companion state file exists in the plugin data directory before uninstall; after uninstalling the plugin no companion files, no state file, no `$.store` file and no settings remain | Probe file listing before and after uninstall |
| AC-010 | SDD-09 | T-006 | SCN-018 | For each state the accessory region does not intersect the figure box; the still pose contains no animation element; the terminal text carries state, gate bar and next step | Node test output (figure suite) |
| AC-010 | SDD-09 | T-009 | SCN-019 | The four states render without overlap in the desktop panel and the still pose stops motion | Live screenshots |
| AC-011 | SDD-03 | T-006 | SCN-020 | The companion suites run as part of `npm run verify:ci` | CI plan entry and verification output |
| AC-011 | SDD-11 | T-007 | SCN-021 | Payload budget change reviewed with a reason, provenance and fingerprints regenerated, compatibility records refreshed, `npm run verify:ci` passes | Budget record, generator output and verification output |
| AC-011 | SDD-03 | T-009 | SCN-022 | `claude plugin validate` passes and `claude plugin test` passes on the generated companion, labelled native evidence | Command output with Claude Code version |
| AC-011 | SDD-11 | T-008 | SCN-023 | `INSTALL.md` explains switching on and off, surfaces and limits and separates live, native and automated evidence | Documentation diff |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node --test` companion adapter suite with a fake host | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing adapter tests | Fix before T-007 |
| AC-001 | SCN-002 | Manual: run `/agdf-companion` twice, start a new session | Claude desktop Code tab on Windows with the locally built AGDF installed | Local AGDF installation; Claude restart after install | Arndt Gold | Screenshots and dated note | Record the gap; QA stays revise |
| AC-002 | SCN-003 | `node --test` render suite | Local Node and CI | none | Claude Code implementing agent | Passing render tests | Fix before T-007 |
| AC-002 | SCN-004 | Manual screenshot at default width | Claude desktop Code tab on Windows | As SCN-002 | Arndt Gold | Screenshot | Record the gap; QA stays revise |
| AC-003 | SCN-005 | `node --test` parity suite with canonical-writer fixtures | Local Node and CI | Temporary directory for fixtures | Claude Code implementing agent | Passing parity tests | Fix before T-007 |
| AC-003 | SCN-006 | `node --test` adapter suite (turn events) | Local Node and CI | none | Claude Code implementing agent | Passing adapter tests | Fix before T-007 |
| AC-004 | SCN-007 | `node --test` assignment suite | Local Node and CI | none | Claude Code implementing agent | Passing assignment tests | Fix before T-007 |
| AC-005 | SCN-008 | `node --test` localization suite against the status-card lookup | Local Node and CI | none | Claude Code implementing agent | Passing localization tests | Fix before T-007 |
| AC-006 | SCN-009 | `node --test` reader suite | Local Node and CI | none | Claude Code implementing agent | Passing reader tests | Fix before T-007 |
| AC-006 | SCN-010 | `node --test` adapter suite (stale marker, retry) | Local Node and CI | none | Claude Code implementing agent | Passing adapter tests | Fix before T-007 |
| AC-007 | SCN-011 | `node --test` static and adapter checks; `claude plugin validate` hook listing | Local Node and CI; local Claude Code for the listing | Claude Code installed for the listing | Claude Code implementing agent | Passing tests; listing without write calls or gating hooks | Without Claude Code, rely on the static test and record the native gap |
| AC-007 | SCN-012 | Hash all `RUN_STATE.md` before and after the live session | Repository on the user's Windows machine | Read access to `.agdf/control` | Claude Code implementing agent | Identical hash lists | Record the gap; QA stays revise |
| AC-008 | SCN-013 | Probe: install a scratch runtime build with a throwing companion; start a session; check SessionStart hook marker, `system/init` MCP status and one `agdf_dispatch` call | Isolated `CLAUDE_CONFIG_DIR` (credential copy pattern of `scripts/native-probes/claude-host-e2e.mjs`) on Windows | Fresh Claude CLI login right before the run (a copied, expired access token is refreshed in the copy and invalidates the real refresh token); explorer-launched process if the packaged app blocks the install; short probe paths below the Windows path limit | Claude Code implementing agent | Debug log and stream output | Stop T-004 and report the blocker; return to SD if isolation fails |
| AC-008 | SCN-014 | `node --test` failure-injection suite | Local Node and CI | none | Claude Code implementing agent | Passing tests | Fix before T-007 |
| AC-009 | SCN-015 | `node plugins/agdf/scripts/check-runtime-integrity.mjs` and the manifest projection test | Local Node and CI | Generated runtime plugin | Claude Code implementing agent | Passing integrity and projection tests | Fix before T-007 |
| AC-009 | SCN-016 | Integrity negative checks, a digest comparison of the shared plugin definition and the Copilot payload check with digests | Local Node and CI | Generated runtime and Copilot profiles | Claude Code implementing agent | Unchanged digests and baselines | Fix before T-007 |
| AC-009 | SCN-017 | Probe: the companion module writes `companion-state.json` into the AGDF plugin data directory; uninstall the plugin; list the Claude configuration directory | Isolated `CLAUDE_CONFIG_DIR` on Windows | As SCN-013 | Claude Code implementing agent | File listing before and after | If any companion state or store file remains, stop and return to SD before T-004 persistence |
| AC-010 | SCN-018 | `node --test` figure suite | Local Node and CI | none | Claude Code implementing agent | Passing figure tests | Fix before T-007 |
| AC-010 | SCN-019 | Manual screenshots of the four states and the still pose | Claude desktop Code tab on Windows | As SCN-002; fixture runs or real runs in each state | Arndt Gold | Screenshots | Record the gap; QA stays revise |
| AC-011 | SCN-020 | `npm run verify:ci` | Local Node and CI | none | Claude Code implementing agent | Verification output listing the companion suites | Fix the CI plan registration |
| AC-011 | SCN-021 | `node scripts/payload-budget.js` with reason, generators, `npm run verify:ci` | Local Node | none | Claude Code implementing agent | Budget record and passing verification | Stop before QA and report the failing owner |
| AC-011 | SCN-022 | `claude plugin validate` and `claude plugin test` on the generated companion | Local Claude Code on Windows | Claude Code installed | Claude Code implementing agent | Command outputs with version | Record the native gap; automated evidence stays separate |
| AC-011 | SCN-023 | Review the `INSTALL.md` diff | Repository | none | Arndt Gold | Approved documentation diff in review | Revise the documentation |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Early host probe sequence | SD: Early host probe sequence | resolved | T-001 runs first, before persistence and adapter work: module loading in an installed build, failure isolation including the AGDF MCP connection and a dispatch call, and no companion state after uninstall, in an isolated `CLAUDE_CONFIG_DIR`; retained state or failed isolation stops the run and returns it to SD. The first run on 2026-10-25 returned the run to SD for SDD-07; the throwing-module variants are repeated with a fresh CLI login before T-004 | Claude Code implementing agent, TP author |
| Fixture strategy for parity tests | SD: Fixture strategy for parity tests | resolved | Fixtures are produced in a temporary target by the canonical writers (`run-create`, `run-step`, `run-update`) for created, UR-open and UR-approved states; revise, block and completed states use the existing core control-state test builders; every fixture is compared with the core reader's parsed fields | Claude Code implementing agent, TP author |
| Documentation placement | SD: Documentation placement | resolved | The Claude section of `INSTALL.md`; no additional files in the plugin payload | Claude Code implementing agent, TP author |
| CI registration of companion tests | TP | resolved | Register the companion suites in the existing verification plan used by `npm run verify:ci` | Claude Code implementing agent, TP author |

## 4. Brownfield Scope

Inspect before implementation: `scripts/public-plugin/manifest.js`, `plugins/agdf/meta/agdf-plugin.definition.json` (read only; it ships in the Copilot payload through `scripts/sync-plugin-runtime.js`), the build-only `plugins/agdf/host-templates/` tree, `scripts/sync-package-assets.js`, `plugins/agdf/scripts/check-runtime-integrity.mjs`, `packages/cli/scripts/public-plugin-test.js`, `scripts/public-plugin/copilot-profile.js`, `scripts/payload-budget.js`, `packages/core/lib/runtime/plugin-provenance.js`, `packages/core/lib/control-state/` writers and reader, `packages/core/lib/interaction-presentation.js`, `plugins/agdf/meta/agdf-interaction-locales.json`, `scripts/ci-plan.mjs` and `scripts/verify-ci.mjs`, `scripts/native-probes/claude-host-e2e.mjs` and the Claude section of `INSTALL.md`.

## 5. Out Of Scope

- Changes to contracts, dispatcher, MCP server, SessionStart hook behaviour or the `RUN_STATE.md` format.
- Changes to the shared plugin definition `plugins/agdf/meta/agdf-plugin.definition.json`.
- Any Codex, Copilot or OpenCode companion, Codex Pets integration or Stop-hook status line.
- A separate plugin or marketplace entry; publication, npm release or merge.
- Session-to-run binding in the AGDF core; tool-call based run detection.
- Mobile surface acceptance.

## 6. Risks And Blockers

- Block: T-001 shows that companion state remains after uninstall or that a failing companion affects AGDF hooks or MCP; the run returns to SD. The first T-001 run did so for `$.store`; SDD-07 now uses the plugin data directory, verified in the same probe.
- Warn: native probes that copy CLI credentials need a fresh login right before the run; otherwise the copy refreshes an expired access token and the real refresh token becomes invalid.
- Revise: any live scenario (SCN-002, SCN-004, SCN-012, SCN-019) without evidence keeps QA at revise.
- Warn: the mod API is early access; a Claude Code update during the run may require re-running native checks.
- Warn: payload budget growth must be reviewed and recorded; unreviewed growth fails verification.

## 7. Next Step

Review this task and test plan and approve only with `Approval: TP`. Valid approval permits the implementation-preparation Brownfield Analysis, then implementation of the approved tasks.

## AGDF Approval Summary (de; source=en)

Der Plan setzt das freigegebene Lösungsdesign in neun Aufgaben um und ordnet alle elf Kriterien und alle elf Designentscheidungen 23 prüfbaren Szenarien zu. Er ist vorbereitet, aber noch nicht umgesetzt.

- Reihenfolge: Zuerst kommt eine frühe Host-Probe (T-001): Laden im installierten Build, Isolation bei absichtlich fehlerhaftem Begleiter einschließlich AGDF-MCP und Dispatch, und dass nach der Deinstallation kein Begleiter-Zustand zurückbleibt. Der erste Lauf vom 2026-10-25 hat Laden und Isolation bestätigt und gezeigt, dass Claude den Plugin-Speicher behält; deshalb speichert der Begleiter jetzt in einer Datei im Plugin-Datenordner (SDD-07), die die Deinstallation entfernt. Vor T-004 werden die Fehlervarianten mit frischer Anmeldung wiederholt, damit auch der Dispatch-Aufruf nachgewiesen ist.
- Umsetzung: Begleiter-Beschreibung unter `plugins/agdf/host-templates/claude/companion/` und Claude-Manifest des Runtime-Profils (T-002); die gemeinsame Plugin-Definition bleibt unverändert. Dazu Logik-Module mit Sprachdatei (T-003), Host-Adapter mit Befehl, Zustandsdatei im Plugin-Datenordner, Turn-Ereignissen und Panel (T-004) sowie Erzeugung und Integritätsprüfungen einschließlich der Negativprüfungen für Codex, `hooks/hooks.json`, Plugin-Definition und Copilot (T-005).
- Tests: Node-Tests in `verify:ci` für Parität mit den kanonischen Writern, Zustandsregeln, Zuordnung, Sprache, Gate-Leiste, Figur, Terminaltext und Adapter mit Fehlerinjektion (T-006). Testdaten entstehen über die kanonischen Writer und vorhandene Kern-Testbausteine.
- Nachweise: Payload-Budget mit Begründung, Provenienz, Fingerprints und Kompatibilitätsnachweise werden erneuert und `npm run verify:ci` läuft (T-007). Die Dokumentation steht im Claude-Abschnitt von `INSTALL.md` (T-008). Native Prüfungen mit `claude plugin validate` und `claude plugin test` sowie ein datierter Live-Test im Code-Tab unter Windows decken die vier Zustände, Standbild, einzeilige Gate-Leiste, „Kein Run zugeordnet“, einen Turn-Wechsel und die byteidentischen Run-Dateien ab (T-009).
- Risiken: Fehlen Live-Nachweise, bleibt QA auf revise. Ein Claude-Update während des Runs kann eine Wiederholung der nativen Prüfungen erfordern, und ungeprüftes Payload-Wachstum lässt die Verifikation scheitern.
