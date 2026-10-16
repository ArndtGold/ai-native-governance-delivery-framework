# TP: Harden the Claude installer against stale and shadowed installations

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-15
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Review candidate `42c42850` and extend `packages/core/lib/runtime/host-installation.js` as single owner of packaged-app detection, provenance comparison and drift inspection | Arndt Gold | none |
| T-002 | Packaged-app preflight: probe-based `detectPackagedAppProcess` in `host-installation.js`, invoked as first step of the Claude install flow (`application.js` claude path and `installClaudeGlobalPlugin`) with a `packaged_app` lifecycle error | Arndt Gold | T-001 |
| T-003 | Installation record: write `installation.json` atomically into the Claude plugin data root after commit; report it in the uninstall plan | Arndt Gold | T-001 |
| T-004 | Installer verification with the shared comparator: marketplace plugin root and installation record, plus cache entry in copied mode; drift notice compares against the installation record | Arndt Gold | T-001, T-003, T-006 |
| T-005 | In-place loading sequence in `claude/plugin.js`: no uninstall/install for equal version on the owned directory marketplace; existing path for copied mode or version change | Arndt Gold | T-006 |
| T-006 | Host state from `claude plugin list --json` in the Claude adapter with text fallback and evidence | Arndt Gold | none |
| T-007 | Generated session check (`scripts/sync-plugin-runtime.js`): plugin enablement as consent for surface `claude`; regenerate plugin runtime | Arndt Gold | none |
| T-008 | Post-commit handling: `commit({ tolerateCleanupFailure })` in `local-marketplace.js`, pre-commit-only recovery in `claude/plugin.js`, truthful rollback evidence in `plugin-command.js` | Arndt Gold | none |
| T-009 | Regression suite `packages/cli/scripts/claude-install-hardening-test.js` (`npm run test:claude-install-hardening`), extended `claude-packaged-app-copy-test.js`, smoke-test chain and unchanged other-host suites | Arndt Gold | T-001 to T-008 |
| T-010 | Native Windows qualification with Claude Desktop and terminal Claude Code, recorded as run evidence bound to installed digests | Arndt Gold | T-009 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-002 | T-002 | SCN-001 | With a simulated package store that receives the probe, the install throws `packaged_app` naming the package and remedy; marketplace, data root and registrations are byte-identical before and after; probe removed | claude-install-hardening-test.js output |
| AC-001 | SDD-001 | T-001 | SCN-019 | Preflight and reconciliation obtain the package verdict from the same `host-installation.js` detector; a simulated package is detected identically by both | claude-install-hardening-test.js output |
| AC-001 | SDD-002 | T-010 | SCN-002 | Install started from a Claude Desktop session is refused with package `Claude_pzs8sxrjxfjjc` and remedy; no file under the real or private `agdf` folders changes | native log NATIVE_QUALIFICATION.md |
| AC-002 | SDD-002 | T-002 | SCN-003 | Without a package hit the preflight passes with evidence `packaged_app_preflight:passed`; probe file absent afterwards | claude-install-hardening-test.js output |
| AC-002 | SDD-006 | T-004 | SCN-020 | A verified ordinary install reports `healthy` with `installation_verification:matched` | claude-install-hardening-test.js output |
| AC-003 | SDD-003 | T-010 | SCN-004 | After a terminal install, new Claude Desktop and terminal sessions report identical source and runtime digests and no drift notice | native log NATIVE_QUALIFICATION.md |
| AC-003 | SDD-005 | T-003 | SCN-021 | After commit `installation.json` exists in the Claude plugin data root with the committed source and runtime digests and marketplace root | claude-install-hardening-test.js output |
| AC-004 | SDD-003 | T-001 | SCN-005 | Stale owned copy retired, current copy kept, foreign copy untouched and reported, failed rename keeps copy with reason; result degraded while any copy remains | claude-packaged-app-copy-test.js output |
| AC-005 | SDD-004 | T-005 | SCN-006 | Equal installed version on the owned directory marketplace issues no `plugin uninstall` or `plugin install`; evidence `plugin_operation:unchanged`; status `healthy` | claude-install-hardening-test.js recorded command list |
| AC-005 | SDD-007 | T-006 | SCN-022 | The installed version used for the unchanged decision comes from `claude plugin list --json` with evidence `plugin_list:json` | claude-install-hardening-test.js recorded host outputs |
| AC-006 | SDD-004 | T-005 | SCN-007 | In-place mode: changed content is verified live without reinstall; copied mode or version change issues the install path | claude-install-hardening-test.js recorded command list |
| AC-006 | SDD-004 | T-010 | SCN-008 | A changed same-version build installed from a terminal is loaded by a new Claude Desktop session | native log NATIVE_QUALIFICATION.md |
| AC-007 | SDD-006 | T-004 | SCN-009 | Matching marketplace root and record yield `healthy`; a mismatching record or root yields `degraded` with expected and observed digests and remedy | claude-install-hardening-test.js output |
| AC-007 | SDD-001 | T-001 | SCN-023 | Installer verification and the session drift check call the same comparator in `host-installation.js` and return identical verdicts for the same fixtures | claude-install-hardening-test.js output |
| AC-008 | SDD-007 | T-006 | SCN-010 | JSON listing yields version and enabled state with evidence `plugin_list:json`; failing JSON uses the text parser with `plugin_list:text_fallback`; neither yields non-healthy with reason | claude-install-hardening-test.js with recorded host outputs |
| AC-009 | SDD-008 | T-007 | SCN-011 | Generated session check with surface claude and no receipt emits `AGDF runtime facts`; Codex without receipt does not; no receipt or permission rule is written | runtime-integrity-layout-test.js and claude-install-hardening-test.js output |
| AC-009 | SDD-008 | T-010 | SCN-012 | A new Claude Desktop session shows runtime facts; after `claude plugin disable agdf@agdf` a new session shows none | native log NATIVE_QUALIFICATION.md |
| AC-010 | SDD-009 | T-008 | SCN-013 | Injected backup-removal failure after commit: no uninstall/rollback/reinstall command, result `degraded` with `marketplace_cleanup:pending:<code>`, no `restored` entry; next run completes cleanup and reports `healthy` | claude-install-hardening-test.js fault-injection output |
| AC-011 | SDD-006 | T-004 | SCN-014 | Session check: record mismatch emits a drift notice naming the package copy; matching record emits none; missing record emits none | claude-packaged-app-copy-test.js output |
| AC-011 | SDD-001 | T-001 | SCN-024 | The drift notice is produced by the shared `host-installation.js` inspection, not by a second comparison in the generated hook | claude-packaged-app-copy-test.js output |
| AC-011 | SDD-006 | T-010 | SCN-015 | With a deliberately stale private copy, a new Claude Desktop session shows the drift notice; after reinstall from a terminal none | native log NATIVE_QUALIFICATION.md |
| AC-012 | SDD-003 | T-009 | SCN-016 | Marketplace root remains `%LOCALAPPDATA%\agdf\marketplaces\agdf`; no migration code path exists | claude-install-hardening-test.js assertion on localMarketplaceRoot |
| AC-013 | SDD-009 | T-009 | SCN-017 | Codex, Copilot and OpenCode suites pass unchanged; default commit still throws on cleanup failure | npm run smoke-test output |
| AC-013 | SDD-001 | T-009 | SCN-025 | The Copilot payload excludes `host-installation.js` and stays byte-identical; payload budget unchanged | copilot-profile and payload budget suites output |
| AC-014 | none — evidence obligation without a new design decision | T-010 | SCN-018 | SCN-002, SCN-004, SCN-008, SCN-012 and SCN-015 are recorded on Windows with Claude Desktop and terminal Claude Code, bound to installed digests | native log NATIVE_QUALIFICATION.md |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22, any OS (simulated package store) | write access to temp folders | Arndt Gold | passing assertions for refusal and unchanged fixtures | block CD+Tests until the test runs |
| AC-001 | SCN-019 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | write access to temp folders | Arndt Gold | identical detector verdicts | block CD+Tests |
| AC-001 | SCN-002 | `npm run install:claude` from a Bash tool inside a Claude Desktop session | Windows 11 with Claude Desktop (MSIX) | Claude Desktop session on the user's machine | Arndt Gold | refusal text and before/after directory listing | record as open evidence gap; UAT stays blocked |
| AC-002 | SCN-003 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | passing assertions | block CD+Tests |
| AC-002 | SCN-020 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | healthy result with matched evidence | block CD+Tests |
| AC-003 | SCN-004 | terminal install, then new Desktop and terminal sessions; read SessionStart context and installed digests | Windows 11, Claude Desktop and Claude Code CLI | user terminal outside Claude Desktop | Arndt Gold | digests and absence of drift notice from both sessions | record gap; UAT blocked |
| AC-003 | SCN-021 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | record content assertions | block CD+Tests |
| AC-004 | SCN-005 | `npm --prefix packages/cli run test:claude-packaged-app-copy` | local checkout, Node 22 | junction creation permitted (Windows) or symlinks (POSIX) | Arndt Gold | passing assertions | run on POSIX CI if junctions are refused; record environment |
| AC-005 | SCN-006 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | recorded command list without uninstall/install | block CD+Tests |
| AC-005 | SCN-022 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | recorded `claude plugin list --json` output (2.1.268) | Arndt Gold | evidence `plugin_list:json` | block CD+Tests |
| AC-006 | SCN-007 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | recorded command lists per mode | block CD+Tests |
| AC-006 | SCN-008 | terminal install of a changed build, new Desktop session | Windows 11, Claude Desktop | user terminal | Arndt Gold | session digests equal new install digests | record gap; UAT blocked |
| AC-007 | SCN-009 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | healthy and degraded outputs with digests | block CD+Tests |
| AC-007 | SCN-023 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | identical comparator verdicts | block CD+Tests |
| AC-008 | SCN-010 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | recorded outputs of `claude plugin list --json` and text form | Arndt Gold | evidence keys per source | block CD+Tests |
| AC-009 | SCN-011 | `npm --prefix packages/cli run test:runtime-integrity-layout` and `test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | facts present for claude, absent for codex without receipt | block CD+Tests |
| AC-009 | SCN-012 | new Desktop session before and after `claude plugin disable agdf@agdf` | Windows 11, Claude Desktop | user may toggle the plugin | Arndt Gold | SessionStart context excerpts and measured duration | record gap; UAT blocked |
| AC-010 | SCN-013 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | command list, evidence and second-run result | block CD+Tests |
| AC-011 | SCN-014 | `npm --prefix packages/cli run test:claude-packaged-app-copy` | local checkout, Node 22 | junctions or symlinks | Arndt Gold | notice present or absent per case | run on POSIX if junctions are refused |
| AC-011 | SCN-024 | `npm --prefix packages/cli run test:claude-packaged-app-copy` | local checkout, Node 22 | none | Arndt Gold | generated hook imports the shared inspection | block CD+Tests |
| AC-011 | SCN-015 | create a stale private copy (older build) and start a Desktop session; reinstall from terminal; restart | Windows 11, Claude Desktop | user consent to modify the private copy | Arndt Gold | notice before, none after | record gap; UAT blocked |
| AC-012 | SCN-016 | `npm --prefix packages/cli run test:claude-install-hardening` | local checkout, Node 22 | none | Arndt Gold | root assertion | block CD+Tests |
| AC-013 | SCN-017 | `npm --prefix packages/cli run smoke-test` | local checkout, Node 22 | known environment limits recorded (symlink EPERM) | Arndt Gold | full chain output | record failing unrelated suites with cause; QA decides |
| AC-013 | SCN-025 | `npm --prefix packages/cli run test:copilot-profile` and the payload budget suite | local checkout, Node 22 | none | Arndt Gold | unchanged Copilot payload inventory | block CD+Tests |
| AC-014 | SCN-018 | manual native session per SCN-002, SCN-004, SCN-008, SCN-012, SCN-015 | Windows 11, Claude Desktop, Claude Code CLI 2.1.268 or newer | the user's machine and approval to toggle plugin and private copy | Arndt Gold | NATIVE_QUALIFICATION.md bound to digests | UAT stays blocked until recorded |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Message wording and evidence keys | SD: Exact message wording and evidence keys | resolved | Refusal: "AGDF install refused: this process runs inside the packaged app <package>, whose %LOCALAPPDATA% writes stay private to that app. Run the installation from a terminal outside <package>." Drift and degraded texts name cause and remedy. Evidence keys: `packaged_app_preflight:passed`, `installation_record:written`, `installation_verification:matched` or `mismatch`, `plugin_operation:unchanged`, `installed` or `reinstalled`, `plugin_list:json` or `text_fallback`, `marketplace_cleanup:pending:<code>`, `rollback:not_applicable_committed`. | Arndt Gold |
| Test file location | TP | resolved | New `packages/cli/scripts/claude-install-hardening-test.js` with script `test:claude-install-hardening` in the smoke-test chain; packaged-copy cases stay in `claude-packaged-app-copy-test.js`. | Arndt Gold |
| Native qualification procedure | TP | resolved | T-010 runs after CR on the user's Windows machine; results go to `NATIVE_QUALIFICATION.md` in this run and are recorded as run evidence. | Arndt Gold |
| Session-check startup time | TP | resolved | Measure the Claude session-check duration in SCN-011 and SCN-012 and record it as evidence; QA warns above 2 seconds. | Arndt Gold |

## 4. Brownfield Scope

Inspect before implementation: `packages/cli/lib/host-adapters/claude/{plugin,uninstall,runtime-check,plugin-mcp}.js`,
`packages/cli/lib/installers/{local-marketplace,plugin-command,packaged-app-marketplace}.js`,
`packages/cli/lib/cli/application.js` (claude install path), `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`
(`claudePluginDataRoot`), `packages/core/lib/runtime/host-installation.js`, `scripts/sync-plugin-runtime.js`,
`scripts/core-projection.mjs`, existing tests listed in the Test Plan.

## 5. Out Of Scope

Marketplace relocation and migration; `bigint` identities; splitting `local-marketplace.js`; Codex,
Copilot and OpenCode behaviour; package copies of `runtime-checks`, `mcp`, `packages`; MCP server,
dispatcher and gate changes; release or publication.

## 6. Risks And Blockers

- Native evidence (SCN-002, SCN-004, SCN-008, SCN-012, SCN-015) blocks UAT until recorded.
- Junction or symlink creation may fail with EPERM locally; affected scenarios run where permitted.
- A probe false negative would allow an install inside a package; native SCN-002 is decisive.
- Session-check startup time above the warning threshold is a QA warning.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen PRD und das SD in zehn Aufgaben umsetzen und jedes Abnahmekriterium mit Tests und nativen Nachweisen belegen.
- Umfang: T-001 Fix 42c42850 prüfen und als einzigen Ort für Erkennung und Herkunftsvergleich ausbauen; T-002 Vorab-Check per Probedatei als ersten Installationsschritt; T-003 Installationsprotokoll im Plugin-Datenordner; T-004 Installationsprüfung und Drift-Meldung gegen das Protokoll; T-005 kein Deinstallieren und Neuinstallieren bei gleicher Version; T-006 claude plugin list --json mit Text-Fallback; T-007 Runtime-Facts für Claude im generierten Session-Check; T-008 Commit mit toleriertem Aufräumfehler und ehrlichem Nachweis; T-009 neue Testsuite und smoke-test-Kette; T-010 nativer Nachweis unter Windows.
- Entscheidungen: Meldungstexte und Nachweisschlüssel sind festgelegt, unter anderem der Ablehnungstext mit Paketname und Abhilfe. Neue Testdatei claude-install-hardening-test.js in der smoke-test-Kette. Der native Nachweis läuft nach dem Code Review auf deinem Windows-Rechner und wird als NATIVE_QUALIFICATION.md festgehalten. Die Startzeit des Session-Checks wird gemessen, QA warnt über 2 Sekunden.
- Risiken: Ohne nativen Nachweis bleibt UAT gesperrt; lokale Junction- oder Symlink-Rechte können einzelne Tests verhindern; ein Fehlschlag der Probe würde Installationen aus Paketen durchlassen, deshalb ist der native Test SCN-002 entscheidend.
