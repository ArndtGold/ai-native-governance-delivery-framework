# TP: AGDF Cockpit MCP App in Claude Code

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-08
Owner: Arndt Gold
Run: agdf-cockpit-claude-host-20261008-01
Traceability contract: criteria-chain-v1

## 1. Scope

This plan implements the approved SD decisions SDD-01 to SDD-08 for the approved PRD criteria AC-001 to AC-008. The live probe of the Claude desktop Code tab comes first, so the host behavior is known before packaging work. No publication, release, Git commit or push is part of this plan.

## 2. Task List

| task_id | task | owner | depends_on |
|---|---|---|---|
| T-001 | Early live capability probe in the Claude desktop Code tab on Windows. Write a minimal stdio probe server outside the repository (in the session scratchpad). It records the declared client capabilities (2025-era initialize and 2026-07-28 per-request envelope) and offers one trivial tool with a `ui://` resource. Register it locally only with explicit user consent, reconnect or restart, invoke it, record the capabilities and rendering outcome, then remove the registration. | implementing agent with user consent | none |
| T-002 | Extend the cockpit surface guards in `packages/mcp-server/bin/agdf-mcp.js` and `createMcpCockpitRuntime` (`packages/cli/lib/mcp-dispatch-runtime.js`) to accept `claude` besides `codex`, and keep Copilot, OpenCode and the npm cockpit assembly Codex-only. Add unit tests. | implementing agent | T-001 |
| T-003 | Implement Claude-only capability gating in `packages/mcp-server/src/server.js`. Offer the cockpit tools and UI resource only to clients that declare the `io.modelcontextprotocol/ui` extension with the MCP app MIME type, in both protocol eras. Reject direct cockpit calls without the capability with `resource_denied` before any session or control read. Keep Codex unconditional. Add protocol tests for both eras. | implementing agent | T-002 |
| T-004 | Add the Claude cockpit launcher form `--cockpit-dir ABSOLUTE_PROJECT_ROOT` to `parseLauncherArguments` and `launchPluginMcpServer` in `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`. Reject missing, relative or unsubstituted values with `AGDF_MCP_ARGUMENTS_INVALID`. Spawn `--surface claude --cockpit-dir`. Keep existing forms unchanged. Add tests. | implementing agent | T-002 |
| T-005 | Extract the existing UI build validation from `scripts/assemble-npm.mjs` into one shared helper and use it in npm assembly and plugin sync without behavior change. Add tests for symlink, oversize, manifest and digest rejection. | implementing agent | none |
| T-006 | Build the Claude variant in `scripts/sync-plugin-mcp.js` and `scripts/sync-package-assets.js` for `surface: "claude"`: copy the validated UI into `mcp/server/ui/` and write the two-entry `claude.mcp.json` with a byte-identical `agdf` entry. Fail closed with `AGDF_COCKPIT_UI_BUILD_REQUIRED` naming `npm --prefix packages/control-ui run build:mcp`. Keep default, Codex and Copilot output unchanged. Measure payload per variant and confirm the Copilot baseline is unchanged. Add tests. | implementing agent | T-004, T-005 |
| T-007 | Run an isolated Claude lifecycle test with a sandboxed `CLAUDE_CONFIG_DIR`. Install the Claude variant and show two connected servers, with concurrent first start of both servers on one shared runtime. Then uninstall and show that no data directory or MCP entry remains. | implementing agent | T-006 |
| T-008 | Run the affected regression suites: mcp-server tests, CLI MCP lifecycle and cockpit MCP tests, core cockpit tests, control-ui tests, plugin and copilot profile tests, and the npm cockpit assembly path. Fix regressions within scope. | implementing agent | T-003, T-006 |
| T-009 | Final live verification. With user consent, reinstall the Claude plugin from this repository and restart Claude. In the Code tab, inspect both connections, and if the tools are offered, open the cockpit for an explicitly named run. Record the outcome as rendered, hidden or failed, and compare a control-tree digest before and after the measured window. | implementing agent with user consent | T-007, T-008 |
| T-010 | Update `docs/architecture/06-agdf-cockpit.md` and `packages/control-ui/README.md` with Claude setup, host requirement and the evidenced status. Keep live, protocol and automated evidence separate, and mark the terminal as not live-verified. | implementing agent | T-009 |

## 3. Sequencing And Dependencies

- T-001 runs first. Its result is reported to the user before T-002. A missing UI capability does not change the plan: hiding is the PRD outcome. The user may still stop the run as a scope decision.
- T-002 to T-006 implement the design; T-007 and T-008 verify it automatically; T-009 and T-010 close with live evidence and documentation.
- T-001 and T-009 change local Claude configuration and therefore need explicit user consent at execution time. The repository control tree is not changed by either.
- A local Claude install (T-007, T-009) requires `npm --prefix packages/control-ui run build:mcp` first, per SDD-05.

## 4. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-02 | T-006 | SCN-001 | Claude variant declares `agdf` (byte-identical to before) and `agdf-cockpit` with launcher, `--cockpit-dir` and `${CLAUDE_PROJECT_DIR}` | Sync test output; diff of `claude.mcp.json` against the previous one-entry version |
| AC-001 | SDD-03 | T-004 | SCN-002 | Launcher accepts the Claude cockpit form, rejects missing/relative/unsubstituted values with `AGDF_MCP_ARGUMENTS_INVALID`, and keeps the zero-argument dispatch form unchanged | Launcher unit test results |
| AC-001 | SDD-07 | T-007 | SCN-003 | Both servers start concurrently on one shared runtime and both report connected | Isolated lifecycle test log |
| AC-002 | SDD-01 | T-002 | SCN-004 | `--surface claude --cockpit-dir` creates the cockpit runtime; an unknown run is reported with its requested identity and no other run is selected | Unit test results |
| AC-002 | SDD-04 | T-003 | SCN-005 | A UI-capable client in each protocol era lists `agdf_cockpit`, `agdf_cockpit_read` and the UI resource, and opening for a named run returns a session bound to that run | Protocol test results for both eras |
| AC-003 | SDD-04 | T-003 | SCN-006 | A client without the UI extension lists no cockpit tools or UI resource; a direct cockpit call returns `resource_denied` and creates no session | Protocol test results with session and read counters |
| AC-004 | SDD-03 | T-004 | SCN-007 | Valid project root binds the cockpit; missing, relative, unsubstituted or nonexistent roots fail at startup with `AGDF_MCP_ARGUMENTS_INVALID` or `AGDF_COCKPIT_TARGET_INVALID`; the working directory is never used | Launcher and server startup tests |
| AC-005 | SDD-01 | T-009 | SCN-008 | Control files are byte-identical before and after the live Code-tab window | Control-tree digest comparison in the live evidence record |
| AC-005 | SDD-04 | T-003 | SCN-009 | Listings and denied calls perform no control-file writes | Protocol test with control-tree digest before and after |
| AC-006 | SDD-05 | T-006 | SCN-010 | Claude variant contains `mcp/server/ui/` and two entries; without a valid UI build it fails with `AGDF_COCKPIT_UI_BUILD_REQUIRED`; default, Codex and Copilot outputs are unchanged | Sync tests and generated-tree comparison |
| AC-006 | SDD-06 | T-005 | SCN-011 | Shared validator rejects symlinks, oversize files and manifest or digest mismatches; npm cockpit assembly output is unchanged | Validator tests and existing assembly test |
| AC-006 | SDD-07 | T-007 | SCN-012 | After uninstall no plugin data directory, cockpit entry or MCP registration remains | Isolated lifecycle test log |
| AC-006 | SDD-08 | T-006 | SCN-013 | Payload is measured for default and Claude variants, and the Copilot payload baseline check passes unchanged | Payload measurement record and baseline check output |
| AC-007 | SDD-01 | T-008 | SCN-014 | Codex cockpit registration stays unconditional and `prepare-cockpit-local.mjs` behavior is unchanged | Existing cockpit MCP and preparation tests |
| AC-007 | SDD-02 | T-008 | SCN-015 | The regular `agdf` server still lists only `agdf_dispatch` and `agdf_inspect`, and the existing MCP suites pass | mcp-server and CLI test results |
| AC-007 | SDD-06 | T-008 | SCN-016 | npm cockpit assembly, browser cockpit and control-ui suites pass unchanged | Assembly, control-ui and browser test results |
| AC-008 | SDD-04 | T-001 | SCN-017 | The early probe records whether the Code tab declares the UI extension and whether it renders a trivial UI resource | Dated probe record with declared capabilities and observation |
| AC-008 | SDD-04 | T-009 | SCN-018 | The final live Code-tab observation records rendered, hidden or failed for an explicitly named run | Dated live evidence record |
| AC-008 | SDD-04 | T-010 | SCN-019 | Documentation states exactly the observed Claude status and marks the terminal as not live-verified | Documentation diff |

## 5. Evidence Plan

- Evidence files go under `.agdf/control/artefacts/agdf-cockpit-claude-host-20261008-01/`: `HOST_PROBE-01.md` (T-001), `CD_TESTS.md` with the command results (T-002 to T-008), and `LIVE_VERIFICATION-01.md` (T-009).
- Automated evidence is recorded as pass/fail per suite with the exact commands; full logs only on failure.
- Live evidence states date, Claude version and surface, declared capabilities and the observed outcome; it does not substitute for protocol evidence or vice versa.

## 6. Risks

- The Code tab probably does not declare the UI extension (official documentation says Claude Code renders no MCP app UI). The cockpit is then hidden there, which is an accepted, documented outcome.
- The probe and the final verification need local Claude configuration changes and restarts; they run only with explicit user consent.
- Concurrent first start of two servers may expose races in runtime preparation; T-007 covers it.
- Windows paths with spaces in `${CLAUDE_PROJECT_DIR}` are covered by T-004 tests.

## 7. Next Step

Review this TP and approve only with `Approval: TP`. Valid approval permits implementation-preparation Brownfield Analysis and then CD+Tests.

## AGDF Approval Summary (de; source=en)

Der Plan setzt die freigegebenen Designentscheidungen SDD-01 bis SDD-08 für AC-001 bis AC-008 in zehn Aufgaben um. Er beginnt mit einer Live-Probe im Code-Tab, damit das Host-Verhalten vor der Paketarbeit feststeht.

- Aufgaben:
  - T-001: Live-Probe im Code-Tab mit einem kleinen Probe-Server außerhalb des Repos. Sie hält fest, ob der Host die UI-Erweiterung meldet und eine triviale UI anzeigt. Sie läuft nur mit deiner Zustimmung, und die Registrierung wird danach wieder entfernt.
  - T-002: Claude im Cockpit-Modus zulassen.
  - T-003: Ausblenden ohne UI-Fähigkeit in beiden Protokollgenerationen; direkte Aufrufe werden ohne Sitzung abgewiesen.
  - T-004: Launcher-Form mit `--cockpit-dir`.
  - T-005: gemeinsame UI-Prüfroutine.
  - T-006: Claude-Build mit UI und zweitem Eintrag. Er bricht ohne UI-Build ab; andere Builds und das Copilot-Budget bleiben unverändert.
  - T-007: isolierter Installations- und Deinstallationstest mit gleichzeitigem Start beider Server.
  - T-008: Regressionssuiten.
  - T-009: abschließende Live-Prüfung im Code-Tab mit byte-genauer Prüfung der Kontrolldateien; nur mit deiner Zustimmung.
  - T-010: Dokumentation des beobachteten Stands.
- Nachweise: 19 Szenarien (SCN-001 bis SCN-019) decken jedes Paar aus Kriterium und Designentscheidung mindestens einmal ab. AC-008 wird dreifach belegt: frühe Probe, Abschlussprüfung, Dokumentation.
- Ablauf: Das Ergebnis von T-001 erhältst du vor T-002. Meldet der Code-Tab keine UI-Fähigkeit, bleibt der Plan gleich, weil Ausblenden das vereinbarte Ergebnis ist. Du kannst den Run dann aber bewusst stoppen. Lokale Claude-Installationen brauchen vorher `npm --prefix packages/control-ui run build:mcp`.
- Risiken:
  - Wahrscheinlich meldet der Code-Tab die UI-Erweiterung nicht.
  - Probe und Abschlussprüfung ändern lokale Claude-Konfiguration und brauchen Neustarts.
  - Beim gleichzeitigen Start zweier Server sind Wettlaufsituationen möglich.
  - Windows-Pfade mit Leerzeichen müssen korrekt behandelt werden.

Keine Veröffentlichung, kein Release, kein Commit.
