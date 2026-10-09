# TP: Shared Core list projection and readable cockpit rows

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD.md and SD.md
Date: 2026-10-08
Owner: Codex
Run: cockpit-active-backlog-core-ui-20261008-01
Traceability contract: criteria-chain-v1

This plan executes the approved bounded structured slice. Criterion IDs refer to the approved PRD; the verification table supplies tests rather than a second acceptance register. All checks below are planned, not completed. TP approval permits implementation-preparation Brownfield Analysis first; only a satisfactory preparation result permits CD+Tests.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, inspect the exact approved sources, affected existing owners and current tracked/untracked baseline; record implementation-preparation Brownfield Analysis, protected invariants, execution paths and unrelated changes. Escalate a discovered design/scope conflict before code changes. | Codex | TP approval |
| T-002 | Implement pure Core cockpit-list.js and its adjacent declaration; reuse section definitions in cockpit-backlog.js. Cover reverse selected-area order, source-bound identity, stored title/provenance, per-field search and area completeness without mutating raw DTO order or selectability. | Codex | T-001 satisfactory |
| T-003 | Integrate the shared Core projection into Overview and CompactCockpit, add passive shared row markup, use App-controlled area/query and existing navigation, remove local list policy and native select. Apply the compact five-match rendering limit only after projection. | Codex | T-002 |
| T-004 | Coordinate title observations, return focus and overview stale/reload behavior through existing App/reducer paths. Preserve bounded title cache, original-position joins, cancellation and committed-title navigation safeguards; keep run/document/context behavior outside the overview. | Codex | T-002, T-003 |
| T-005 | Adjust scoped list styling and accessible disclosure; verify long titles/keys and complete next steps, keyboard operation, 44px targets, focus and light/dark responsiveness. Preserve existing branding and document layout. | Codex | T-003, T-004 |
| T-006 | Update private-cockpit projection exclusions and focused documentation; run typecheck, browser/MCP builds, source-closure/package and Core/adapter/UI regressions. Record actual commands, results and build identities. | Codex | T-002 through T-005 |
| T-007 | Prepare the existing local cockpit through its supported owner and observe a fresh actual compact Codex surface. Capture build/server/UI identity, host capabilities, actual width, deliberate list journeys and an app-only canonical-file byte comparison. Record missing native evidence explicitly. | Codex | T-006 passing; fresh matching local connection available |
| T-008 | Inspect the final diff and task fulfillment, perform mandatory Code Review and clean implementation review, collate evidence and remaining risks for the existing QA owner. Record CD+Tests/CR through canonical operations; do not self-approve QA/UAT or perform release/Git actions. | Codex | T-006, T-007 evidence assessed |

## 2. Verification Traceability

Each scenario has one task and a concrete observable result. Test-file locations are intended implementation evidence locations; evidence reports record individual scenario outcomes and actual command exits. Every criterion-to-decision edge in the approved SD is represented.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Mixed Active/Planned/Archive fixture returns only selected-area rows in reverse original table sequence; Active Completed remains visible; frozen input and original selector order are unchanged. | New packages/core/test/cockpit-list-test.js; EVIDENCE_CORE.md |
| AC-001 | SDD-003 | T-002 | SCN-002 | Complete active area reports its own total independently of other sections and preview size; missing active table yields unavailable coverage and null counts. | cockpit-list-test.js; EVIDENCE_CORE.md |
| AC-002 | SDD-001 | T-006 | SCN-003 | Both renderers import the same pure helper; identical DTO/query returns identical full matching identities/order before compact slicing; typecheck and both bundles succeed without Node/fs/runtime imports. | Core/UI parity tests; EVIDENCE_BUILD.md with imports and build results |
| AC-002 | SDD-003 | T-003 | SCN-004 | Compact and expanded present the same selected-area coverage/count semantics for complete, partial and unavailable fixtures; no renderer-specific diagnostic classification remains. | compact.test.tsx and backlog-titles.test.tsx; EVIDENCE_UI.md |
| AC-003 | SDD-002 | T-002 | SCN-005 | Query trim/case normalization and separate title/key/status matching are deterministic; a cross-field concatenation-only match is absent; known scope prefix changes display only and unknown prefixes/original title remain intact. | cockpit-list-test.js; EVIDENCE_CORE.md |
| AC-003 | SDD-002 | T-004 | SCN-006 | Completing, failing or cancelling supplementary UR reads does not change primary title or search membership; heading-only queries do not match; observed heading stays inspectable in details. | backlog-titles.test.tsx and browser/backlog-titles.spec.mjs; EVIDENCE_UI.md |
| AC-003 | SDD-004 | T-002 | SCN-007 | Unchanged backlog digest preserves row identity across metadata-only captures; duplicate positions have distinct identities; changed backlog digest replaces identity and retains original source index. | cockpit-list-test.js; EVIDENCE_CORE.md |
| AC-004 | SDD-005 | T-003 | SCN-008 | Six-plus active rows show first five matches only; a query for a row beyond the initial five finds it; section, match and displayed counts remain distinct. | compact.test.tsx; browser/backlog.spec.mjs; EVIDENCE_UI.md |
| AC-004 | SDD-005 | T-003 | SCN-009 | Confirmed expansion preserves active query/order and displays all matches; area change clears query; returning from Planned/Archive to compact resets Active with empty query and heading focus. | compact.test.tsx and host-probe.test.tsx; EVIDENCE_UI.md |
| AC-004 | SDD-005 | T-007 | SCN-010 | Fresh actual compact host shows at most five matching rows and successful search beyond initial preview; supported expansion retains query, or host refusal is explicitly visible without pretending expansion succeeded. | EVIDENCE_NATIVE.md; native list/search/expansion captures |
| AC-005 | SDD-002 | T-005 | SCN-011 | Stored title is primary, stored status is explicitly secondary; disclosure exposes original title/key, scope/priority, source provenance and full next step, including long suffixes. | presentation/compact tests and browser/backlog.spec.mjs captures; EVIDENCE_UI.md |
| AC-005 | SDD-005 | T-005 | SCN-012 | At browser widths 320/560/800/1280 in light and dark, long titles wrap without horizontal list overflow or title truncation; actions/disclosures measure at least 44px and focus is visible. | Playwright layout/target assertions and eight width/theme captures in EVIDENCE_RENDERED.md |
| AC-005 | SDD-005 | T-005 | SCN-013 | Keyboard search, row activation, disclosure and return are operable; invalid rows remain explained/inspectable; focus returns to exact applicable control without opening a neighbor. | Component keyboard tests; browser/backlog.spec.mjs; EVIDENCE_RENDERED.md |
| AC-005 | SDD-005 | T-007 | SCN-014 | At the actual observed compact host width, long-title wrapping, source disclosure and visible focus remain usable without the previous escaping native dropdown. | EVIDENCE_NATIVE.md with measured/observed width and captures |
| AC-006 | SDD-003 | T-002 | SCN-015 | Empty complete area and complete no-match are distinct; malformed/duplicate/nonselectable selected rows yield limited coverage, including cross-section duplicates; unrelated scoped diagnostics do not contaminate a confirmed area and unscoped diagnostics remain conservative. | cockpit-list-test.js and control-cockpit-projection-test.js; EVIDENCE_CORE.md |
| AC-006 | SDD-003 | T-006 | SCN-016 | Contradictory counts/entries are rejected as invalid read data; unavailable values never render as exact zero and partial no-match never claims exhaustive absence. | DTO/service/component boundary tests; EVIDENCE_UI.md |
| AC-006 | SDD-006 | T-004 | SCN-017 | Overview freshness/title source change marks old data stale, disables new selection and does not replace it automatically; only deliberate reload restores a current overview. | changes.test.tsx, mcp-changes.test.tsx and browser/changes.spec.mjs; EVIDENCE_UI.md |
| AC-006 | SDD-006 | T-004 | SCN-018 | Failed refresh preserves visibly previous data and requested route with retry; expired session disables retired reads and requests reopening; successful retry restores the same requested identity. | refresh-control/scoped-reading tests; browser/scoped.spec.mjs; EVIDENCE_UI.md |
| AC-007 | SDD-004 | T-004 | SCN-019 | Filtering/reverse order/title capture rotation cannot change requested run key; duplicate/invalid rows are disabled; missing run retains its requested ID; overview does not auto-open its first row and explicit initial run still opens directly. | cockpit-session/initial-run/reading tests; EVIDENCE_CORE.md and EVIDENCE_UI.md |
| AC-007 | SDD-005 | T-004 | SCN-020 | Return retains applicable area/query and exact visible-row focus; removed row gets removal feedback and heading focus; row hidden by preview/mode gets view-limitation feedback and expansion/search access, not false removal or neighbor focus. | compact/reading/scoped-reading tests; browser/backlog.spec.mjs; EVIDENCE_UI.md |
| AC-007 | SDD-006 | T-004 | SCN-021 | Run activation while a title response has committed server capture replacement sends a fresh explicit-run read rather than a retired opaque selector; late/cancelled responses cannot overwrite navigation. | Existing committed-title response barrier regression in browser/backlog-titles.spec.mjs plus component cancellation tests; EVIDENCE_UI.md |
| AC-008 | SDD-001 | T-006 | SCN-022 | Core projection copies canonical helper bytes for supported private packaging; Copilot excludes helper/declaration with private cockpit closure; payload/integrity checks pass with no public protocol/schema or host capability change. | EVIDENCE_BUILD.md; temporary-root projectCore byte/exclusion check and existing payload/variant tests |
| AC-008 | SDD-006 | T-006 | SCN-023 | HTTP/MCP authentication, containment, selector/session validation, bounded 12-row title reads, 128-entry/256KiB cache, hidden-view cancellation, document/context and publication boundaries retain relevant existing regression results. | Core cockpit suites, service/Vitest suites and CLI cockpit tests; EVIDENCE_REGRESSION.md |
| AC-008 | SDD-006 | T-007 | SCN-024 | During a separately measured native app-only window, list/search/disclosure/select/expand/refresh leave all pre-existing canonical control file bytes and paths unchanged, send no model question and grant no gate approval; displayed resources match recorded fresh build/server identities. | EVIDENCE_NATIVE.md and before/after canonical file hash manifests plus resource/build digest record |
| AC-008 | SDD-001 | T-008 | SCN-025 | Final diff review finds one list-policy owner, browser-safe dependency closure and no UI writer/parallel store; all planned outcomes and native evidence are accounted for or explicitly open, without unsupported host/release claims. | Task fulfillment, clean implementation and CR reports linked for QA |

## 3. Test Plan

### Execution and evidence ownership

Use supported Node 22, currently `/usr/local/Cellar/node@22/22.22.3/bin/node`, and a child-process PATH resolving that executable for npm scripts. Revalidate the path at execution. Commands below run from the repository root after approved preparation and implementation. Persist concise actual command/exit/result records under this run's artefact folder: `EVIDENCE_CORE.md`, `EVIDENCE_UI.md`, `EVIDENCE_BUILD.md`, `EVIDENCE_REGRESSION.md`, `EVIDENCE_RENDERED.md`, and `EVIDENCE_NATIVE.md`. Captures and hash manifests live in an `evidence/` child. Link actual test names/scenario IDs, failures and corrections; do not write passing results in advance.

Core targeted commands:

```sh
node --test packages/core/test/cockpit-list-test.js
node packages/core/test/control-cockpit-projection-test.js
node --test packages/core/test/cockpit-backlog-title-test.js packages/core/test/cockpit-session-test.js packages/core/test/cockpit-scoped-read-test.js packages/core/test/cockpit-changes-test.js packages/core/test/cockpit-context-test.js packages/core/test/cockpit-publication-test.js
```

UI and rendered commands:

```sh
npm --prefix packages/control-ui run typecheck
npm --prefix packages/control-ui test
npm --prefix packages/control-ui run build
npm --prefix packages/control-ui run build:mcp
npm --prefix packages/control-ui run test:browser
```

Extend the existing fixtures/tests rather than create a separate UI harness. Core fixtures cover mixed/empty/missing/malformed areas, both cross-section duplicate occurrences, nonselectable rows, count contradiction, frozen raw arrays, long/unknown prefixes and source metadata replacement. UI fixtures use the same observations for parity, six-plus rows and a search target outside the first five. Replace old UR-heading-as-primary/search expectations explicitly; preserve unrelated bounds/race assertions. The browser suite uses its existing service fixture/configuration and captures the eight width/theme conditions plus keyboard, stale/retry/expiry and committed-title navigation journeys. Inspect generated captures, not only DOM assertions. Typecheck both declaration consumers and inspect the bundles' dependency closure and existing MCP size/digest checks.

Packaging/adapter checks use the existing owners:

```sh
node packages/cli/scripts/payload-budget-test.js
node --test packages/cli/scripts/plugin-mcp-cockpit-variant-test.js packages/cli/scripts/codex-cockpit-config-test.js
node packages/cli/scripts/cockpit-mcp-test.js
node packages/cli/scripts/cockpit-scoped-mcp-test.js
```

After any required asset synchronization through the existing script, inspect generated changes against the baseline and do not edit generated copies by hand. Use `projectCore` against temporary contained test destinations to compare helper/declaration bytes and Copilot exclusion. Preserve canonical Core copying and the private payload budget. Run the repository's applicable verification checks for the final changed paths and canonical doctor/gate readiness; report exact applicability and results. Repeat only checks affected by a subsequent correction.

### Actual compact Codex qualification

After passing builds, use the already documented local preparation/synchronization/manifest owner, never patch a running profile in place. Preserve the existing trusted project configuration and other runtime entries. If the named local entry must be retired, follow its supported close/remove/prepare/reconnect workflow; no global configuration or public plugin release is part of this slice. Record actual host/version, advertised display capability/result, built UI hash, prepared manifest/runtime identity and served resource digest before claiming the new UI was observed.

Open the bound run explicitly when invoking the cockpit tool, then use its overview action for the list journey. Do not drop the established run binding to obtain an overview. Inspect the actual MCP App surface with the enabled app browser surface; capture rendered list/search/disclosure and supported expansion/return. Observe compact width from that surface. A fresh connection/resource read alone does not prove rendering; browser imitation alone does not meet this task. If fresh native access is unavailable, keep the obligation open with the concrete limitation and route it to QA without claiming completion.

For the no-write observation, finish governed bookkeeping first. Create a path-and-SHA-256 manifest of all existing `.agdf/control` files in a temporary directory outside control. Perform only app reading actions during the measurement window, including the scoped search/selection/refresh journey; record no approvals, artefacts or run-step operations until the after manifest is captured. Compare both paths and bytes, then copy manifests/report into the run evidence folder after the window closes. Record visible non-authorizing behavior and relevant adapter/source evidence; do not claim the absence of model interaction from file hashes alone. Any app-induced mutation fails this check; do not subtract changed control files as expected bookkeeping.

## 4. Brownfield Scope

T-001 rechecks approved source digests and current worktree because the plan itself is not execution evidence. Inspect `cockpit-backlog.js`, `cockpit.js`, session/contract/read-worker boundaries, `api.ts`, `Overview.tsx`, `mcp/CompactCockpit.tsx`, `App.tsx`, `state.ts`, `useBacklogTitles.ts`, `mcp/EmbeddedEntry.tsx`, both scoped stylesheets, `scripts/core-projection.mjs`, the existing tests and the UI/architecture documentation. Capture unrelated pre-existing changes and preserve them.

Execution may change the new Core helper/declaration and adjacent parser, focused Core/UI tests, App/row/overview/title-hook/style integration, private projection exclusion and the two documentation owners (`packages/control-ui/README.md`, `docs/architecture/06-agdf-cockpit.md`). Existing transport/session code is inspected and regression-tested, not independently redesigned. Existing generated propagation follows its owner. Newly necessary behavior outside the approved boundaries requires reassessment rather than silent expansion.

## 5. Out Of Scope

No acceptance or source revision, backlog cleanup/status reclassification, new protocol/operation/host support, UI writer or approval-by-click, automatic model question/work, new persistent state/search index, broad branding/document redesign, migration, public release/publication, commit, push or PR creation. Control evidence recording remains separate from app behavior and cannot excuse app writes. Supplementary UR titles remain details, not a larger search corpus.

## 6. Risks And Blockers

- Browser-safe imports, raw-order/opaque-selector mismatch, cross-section completeness errors and count contradictions require correction before QA readiness. Build success alone does not establish semantic correctness.
- Stale/failure/expiry and committed-title races must retain exact requested identity and explicit recovery. A repair that changes run/document/context authority or an external contract returns to the earliest affected owner.
- Long titles and five-row count do not guarantee a fixed pixel height. Inspect the actual native width and browser matrix; do not hide titles to make a capture fit.
- Fresh native evidence, matching served identity and app-only byte equality are required. A host/tool limitation is recorded as open evidence; it never becomes a fabricated pass or a browser substitute.
- T-008 presents the real CR and fulfillment findings to the existing QA skill, which alone decides pass/revise/block. TP approval is no QA/UAT/release assertion.

## 7. Next Step

Approve this exact plan only with `Approval: TP`. The next permitted step is implementation-preparation Brownfield Analysis, followed by implementation and planned verification only when that preparation supports the approved scope.

## AGDF Approval Summary (de; source=en)

Der Plan setzt den freigegebenen PRD und SD für gemeinsame Core-Listenlogik und lesbare Cockpit-Zeilen um. Die Produktkriterien bleiben unverändert; jede Verbindung zwischen Kriterium und Designentscheidung ist mit Aufgabe, Szenario, erwartetem Ergebnis und Nachweisquelle abgedeckt. Die Prüfungen sind geplant und noch nicht bestanden.

T-001 prüft nach TP-Freigabe zuerst die bestehenden Quellen, Zuständigkeiten und den Arbeitsstand und dokumentiert die Implementierungsvorbereitung. Erst bei tragfähigem Ergebnis beginnt Codearbeit. T-002 erstellt das reine Core-Modul samt Typdeklaration und gemeinsamen Bereichen. T-003 bindet beide Ansichten an dieselbe Projektion und den App-Zustand, ersetzt das Dropdown durch gemeinsame Zeilen und begrenzt nur die kompakte Darstellung auf fünf Treffer. T-004 sichert Titelbeobachtungen, exakte Auswahl, Rückkehrfokus und bewusstes Neuladen der Übersicht. T-005 prüft Darstellung, Tastatur und vollständige Details. T-006 aktualisiert Dokumentation und private Paketprojektion und führt Builds sowie Regressionen aus. T-007 beobachtet die echte kompakte Codex-Fläche. T-008 prüft den endgültigen Diff, Aufgabenerfüllung und Codequalität für QA.

25 Szenarien prüfen aktive Bereichszugehörigkeit und umgekehrte Tabellenreihenfolge, gemeinsame Core-Ergebnisse, stabile gespeicherte Titel und Suche, Quellenidentität, Fünfer-Vorschau und Suche darüber hinaus, Vergrößern mit derselben Suche, Rückkehr aus anderen Bereichen, vollständige Originalangaben und nächste Schritte. Hinzu kommen leere, teilweise lesbare und nicht verfügbare Bereiche, bereichsübergreifende Duplikate, widersprüchliche Daten, veralteter Stand, fehlgeschlagenes Neuladen und abgelaufene Sitzungen. Exakte Run-Auswahl, fehlende Runs, entfernte oder nur ausgeblendete Zeilen und die bestehende Absicherung bei gleichzeitig abgeschlossener Titelladung erhalten eigene Prüfungen.

Core-Tests, Service-/Komponententests, Typprüfung, Browser- und MCP-Build sowie die vorhandenen Adapter-/Sitzungsregressionen liefern getrennte Nachweise. Gerenderte Prüfungen decken 320, 560, 800 und 1280 Pixel jeweils in Hell und Dunkel ab; Titelumbruch, sichtbarer Fokus und mindestens 44 Pixel hohe Bedienziele werden gemessen. Die tatsächliche kompakte Host-Breite wird zusätzlich beobachtet. Die reine Core-Abhängigkeit und der Ausschluss privater Cockpit-Dateien aus dem Copilot-Paket werden geprüft.

Der native Nachweis verwendet eine frische Verbindung mit passender Build-, Runtime- und Ressourcenidentität und zeigt die echte Listennutzung. Browser- oder reine Protokollnachweise ersetzen ihn nicht. Für die Schreibfreiheit werden alle vorhandenen Kontrolldateien vor und nach einem getrennten App-Lesefenster nach Pfad und Bytes verglichen; Freigaben und Nachweisspeicherung liegen außerhalb dieses Fensters. Listenaktionen dürfen keine Modellfrage, Freigabe oder Weiterarbeit auslösen. Fehlender Host-Zugang bleibt ausdrücklich offene Evidenz.

Risiken sind falsche Vollständigkeitsangaben, wechselnde technische Selektoren, gleichzeitige Antworten, lange Titel und eine versehentlich über die Übersicht hinausgehende Aktualisierungsänderung. Dafür sind gezielte Grenz- und Fehlerszenarien vorgesehen. Es gibt keine neue Schnittstelle, Datenhaltung, Host-Unterstützung, Veröffentlichung oder Git-Aktion. Nach `Approval: TP` folgt zunächst die Implementierungsvorbereitung, dann die abgegrenzte Umsetzung mit Prüfungen. QA entscheidet später separat über die tatsächliche Qualität; dieser Plan behauptet keine Fertigstellung.
