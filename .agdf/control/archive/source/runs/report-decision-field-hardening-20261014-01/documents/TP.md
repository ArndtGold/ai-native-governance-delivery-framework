# TP: Harden authored report fields and qualify the installed plugin

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-14
Owner: AGDF Core maintainer
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Perform bound implementation-preparation Brownfield Analysis; record pre-change source/worktree and protected-source identities, exact affected consumers and the installed reproduction. | Coding agent, existing Brownfield owner | Deliberate TP approval; approved PRD/SD; completed Brownfield Review |
| T-002 | Implement positive authored-field recognition and conservative container handling in the existing report-decision.js module; retain normalization/default result domain and add closed internal not_applicable support; extend focused reader regression cases. | Coding agent, existing Core observer owner | T-001 |
| T-003 | Replace the separate bound Quick/non-UX internal registrar regexes with the shared observer; extend actual registration/inspection/closeout regressions and refusal-state checks; update the focused quality contract. | Coding agent, existing Core consumer/writer owners | T-002 |
| T-004 | Run affected canonical suites and normal build/assembly; measure generated payload; make only an exact justified baseline update if required; preserve all existing source and approval guards. | Coding agent, existing build owners | T-003 |
| T-005 | Use the supported local Codex installer; compare changed source with installed Core and marketplace/cache identity; exercise positive and negative reader/registration/closeout paths through the actual installed CLI/STDIO on disposable targets; retain results and identity. | Coding agent, existing installation/runtime owners | T-004 |
| T-006 | Record actual CD+Tests, perform TP Review, Clean Implementation Review, mandatory Code Review and sole QA decision; present required live QA/UAT decisions and complete OR only when allowed. | Existing review, qa-gate and release-or owners | T-005; current writer-owned evidence |

## 2. Verification Traceability

PRD remains the source of acceptance; these rows map its IDs to executable scenarios without creating a separate acceptance register. All evidence paths below are relative to this Run's artefact directory.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Bare result metadata, H1-plus-metadata and canonical numbered QA Decision section yield the genuine supported result; nested/lookalike/unrelated section fields and prose-prefaced fields do not. | packages/core/test/report-decision-test.js; evidence/parser.log; evidence/context-matrix.json |
| AC-001 | SDD-001 | T-005 | SCN-002 | The same admitted-context and example-only cases produce the expected result in the exact installed observer and actual QA registration. | evidence/installed-qualification.json; evidence/installed-stdio.jsonl |
| AC-002 | SDD-002 | T-002 | SCN-003 | Backtick/tilde fences, marker-kind/length mismatches, indentation, lists, explicit/lazy/nested quotations and quoted/indented headings cannot admit a result; an unclosed fence does not expose subsequent contained fields. | packages/core/test/report-decision-test.js; evidence/parser.log; evidence/context-matrix.json |
| AC-002 | SDD-002 | T-002 | SCN-004 | Nested HTML wrappers, comments, quoted attributes, raw elements, declarations and malformed/unclosed markup suppress contained fields/headings; clear termination permits a following genuine decision section. | packages/core/test/report-decision-test.js; evidence/parser.log; evidence/context-matrix.json |
| AC-002 | SDD-001 | T-003 | SCN-005 | Genuine pass/revise/block plus contrary or unknown illustrative content retains its genuine result in actual report registration and inspection; examples alone are refused without canonical state change. | Core integrated registration/QA/closeout tests; evidence/consumer.log; evidence/refusal-matrix.json |
| AC-003 | SDD-003 | T-002 | SCN-006 | Existing case/dash/backtick/CRLF/alias/consistent-duplicate cases remain passing; conflicting, missing, empty and unknown actual decisions remain null. Default QA rejects not_applicable as a Decision; internal opt-in recognizes it without widening QA. | packages/core/test/report-decision-test.js; evidence/parser.log |
| AC-003 | SDD-001 | T-003 | SCN-007 | The canonical QA template populated with a genuine result and the previous approved QA report remain readable; historical report bytes and approved current UR/PRD/SD/TP bytes match their captured identities. | evidence/protected-sources.json; evidence/compatibility.json; Core integration logs |
| AC-004 | SDD-003 | T-003 | SCN-008 | Actual bound Quick review and non-UX internal recording accept genuine results and refuse example-/quotation-only reports; eligible analysis not_applicable still requires its reason, while mandatory review/implementation not_applicable remains forbidden. | packages/core/test/quick-closeout-command-test.js; relevant internal command-flow tests; evidence/consumer.log; evidence/refusal-matrix.json |
| AC-004 | SDD-004 | T-004 | SCN-009 | Actual QA registration, normalized inspection and structured slice/full closeout agree on genuine reports; invalid reports leave canonical Run/output/receipt state unchanged; altered approved bytes and stale bindings remain rejected; exact original-UUID replay remains idempotent. | packages/core/test/run-closeout-command-test.js; run-closeout-slice-test.js; qa-deviation-acceptance-test.js; evidence/command-flow.log |
| AC-004 | SDD-004 | T-005 | SCN-010 | Installed actual registrar, QA inspection, Quick/internal recording and structured closeout demonstrate the same positive/negative rules on disposable targets, with valid seals/receipts and no negative mutation. | evidence/installed-qualification.json; evidence/installed-stdio.jsonl; evidence/installed.log |
| AC-005 | SDD-005 | T-004 | SCN-011 | Normal build/assembly and affected contract/payload/instruction checks pass; the measured payload baseline contains no arbitrary added headroom; no external schema, gate or approval formula changes. | evidence/build.log; evidence/package-checks.log; evidence/payload.json |
| AC-005 | SDD-005 | T-005 | SCN-012 | Supported local Codex install succeeds; version/build/digests and all marketplace/cache files agree; changed installed Core equals source; actual launched installed runtime is the candidate. | evidence/install.log; evidence/installed-identity.json; evidence/installed-stdio.jsonl |
| AC-005 | SDD-004 | T-006 | SCN-013 | TP Review, solution integrity and Code Review assess actual scoped diff/evidence; QA explicitly separates source/package/installed evidence from unobserved native model/other-platform behavior and identifies every material missing obligation. | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md; evidence/QUALIFICATION_SUMMARY.md |
| AC-005 | SDD-005 | T-006 | SCN-014 | Live human decisions stay bound to their exact presented reports/revisions; allowed OR verifies protected sources and original receipt replay; no automatic VCS/publication action occurs. | Canonical live presentations/receipts; OR.md; evidence/final-state.json |

## 3. Test Plan

### Preparation and implementation boundary

After TP approval, redispatch the bound gate-check and follow its implementation-preparation Brownfield Analysis owner before code changes. Capture the pre-existing workspace state and hashes of candidate files, this Run's approved sources and the previous completed Run's approved QA report. Do not overwrite any approved report, receipt or previous evidence. Preserve the compact-continuation changes already in the workspace; assess this fix as an additional scoped delta.

The production implementation is confined to the existing report-decision.js and necessarily-coupled run-steps.js result checks. The focused quality contract, existing tests and exact measured payload baseline are supporting scope. A necessary additional test file may be registered in the existing test suite; it must exercise actual behavior rather than mirror implementation. Any unanticipated production owner, public contract, result-domain or authority change requires reassessment before continuing.

### Focused reader and consumer checks

Run `node packages/core/test/report-decision-test.js` with the existing 19 compatibility/refusal cases retained and the approved context/container matrix added. Record each matrix family and its expected/actual result. Include at least one exact previously failing fenced-example-only report and one lazy quote continuation with an unprefixed result-looking line. Verify real result context before and after excluded examples, numeric and optional closing heading syntax, mixed actual metadata/section conflicts and internal-only not_applicable.

Extend actual Core command-flow tests so they call the canonical registrar/inspector/closeout, not a substituted reader. Use temporary target fixtures with deliberate synthetic prerequisites and clear synthetic approval labels. Compare canonical state and writer-owned outputs/receipts around rejected input. Cover both internal non-UX and bound Quick review branches, the existing internal reason/eligibility restrictions and default QA's unchanged domain.

Run the canonical affected suite: `npm --prefix packages/cli run test:run-command-flow`. Its serial execution covers the shared reader, actual command/writer flows, transaction/recovery, review/QA and structured/Quick closeout. Run `npm --prefix packages/cli run test:cli-gates` for gate/QA-follow-up compatibility and `npm --prefix packages/cli run test:control-state` for unchanged state guards. Preserve all existing assertions and do not skip failures. Keep logs in evidence/parser.log, command-flow.log, gates.log and control-state.log.

### Build, package and transport checks

Run `npm run build:prepare` through the normal preparation owner before testing assembled MCP paths. Build/generation and payload-producing operations execute serially to avoid overlapping outputs. If the legitimate source growth exceeds the exact current payload baseline, record the actual generator measurement and rationale, update only its exact measured ceiling and rerun the existing payload check; do not disable the check or add discretionary headroom.

Run the affected existing instruction/payload checks (`npm --prefix packages/cli run test:instruction-footprint` and the existing payload-budget test), then the MCP structured-flow, whole-flow and safety tests against the assembled candidate. The full canonical command-flow suite is run once after the scoped implementation is complete; repeat or broaden only for a new change, failure or unresolved concern. Keep original-UUID replay, exact source/approval, revision and transaction assertions intact.

### Actual installed candidate qualification

Run the supported `npm run install:codex` after source/package checks pass. It may need the host's existing approval for writes outside the repository; the user requested installed-plugin verification, and the supported installer is the bounded necessary action. Do not patch installed files by hand or restart the app automatically.

Capture the installation marker, content-derived local build, source/runtime digest and selected launcher configuration. Compare all marketplace/cache files byte-for-byte and changed Core files with source. Qualify the actual installed observer and the actual installed CLI/STDIO entrypoints; do not assume the already loaded mcp__agdf namespace has reloaded. The source CLI may initialize an isolated scaffold only if the surface-local installed shim lacks init; every qualifying delivery/control operation then uses the installed candidate, and that setup boundary is explicit.

Use disposable targets for real operations. Positive cases include genuine top-level and canonical section reports, genuine results with contrary examples/quotes, current QA inspection, allowed analysis not_applicable, bound Quick review and structured slice/full closeout. Negative cases include examples-only and quotations-only registration, conflicting/unknown actual fields, invalid mandatory not_applicable/reason, stale revision and changed approved bytes. Record exact requests/results, candidate identity and before/after state for refusals. Reuse the existing STDIO test helper and canonical fixture setup, labeling synthetic decisions as such. Close temporary sessions and remove only their own temporary targets.

Keep the probe and outputs in evidence/installed-qualification.mjs, installed-qualification.json, installed-stdio.jsonl, installed-identity.json and installed.log. If native model or other-platform execution is not observed, say so in QUALIFICATION_SUMMARY.md and QA rather than claiming it. No fresh native session or cross-host release is required for the approved direct installed-runtime acceptance scope.

### Review, QA and closeout

Record actual passing CD+Tests through the existing result owner with its current source binding. Perform TP Review, Clean Implementation Review and mandatory Code Review of this scoped delta, then run the sole qa-gate owner. Evidence-only missing observations must not be silently called passed. Present a ready QA report against a fresh current revision; record only a new deliberate live user reply. Follow the existing UAT and allowed OR owners, preserving exact artefact/approval identities and final lifecycle checks. The original implementation request does not authorize VCS, release or publication.

## 4. Brownfield Scope

Inspect the existing shared reader; run-artefact-recording.js QA check; qa-follow-up.js technical-result check; closeout-readiness.js QA/review checks; both result regexes in run-steps.js; current mandatory-result/not_applicable eligibility and reason checks; canonical QA template; existing focused/command-flow/Quick/structured/MCP tests; normal generator and supported Codex installer.

UR, PRD, SD and TP stay immutable after their deliberate approvals. The previous compact-execution-continuation-20261014-01 QA report is read-only compatibility evidence. UX Intent Definition's distinct validator and OR's own binding/template fields remain their current owners and do not become another Markdown rewrite in this scope.

## 5. Out Of Scope

New gates, approval formulas, persistent record schemas, public APIs/flags, generic Markdown parsing infrastructure, parser dependency, Git adapter, runtime updater, UI changes, automatic approved-report correction, completed-Run reopening, public version release, VCS actions and native model/other-platform qualification claims.

## 6. Risks And Blockers

- Context reentry or malformed/nested containers exposing an illustrative result is an implementation defect; block QA until corrected and covered by a passing negative case.
- Suppressing a supported canonical genuine field, widening QA to not_applicable, weakening eligibility/reason/source guards or mutating refused-operation state is an implementation defect; no approval request from that state.
- Failed build/payload/install, source-versus-installed mismatch or testing only a stale generation is missing installed acceptance evidence; complete the intended candidate qualification or report the precise blocker.
- Any unexpected scope/authority/public-format change routes back to the earliest affected approved source and Brownfield owner; do not silently expand this TP.
- Native model/other-platform observations are outside the approved direct installed-runtime acceptance scope; record their absence accurately. A synthetic fixture approval is never live Run authority.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Plan: Nach der TP-Freigabe zuerst die bestehende Implementierungsstrecke prüfen, dann den gemeinsamen Berichtsfeld-Leser härten und die gekoppelte interne/Quick-Review-Registrierung daran anschließen. Gültige Berichte, bestehende Freigaben und Writer-Grenzen bleiben erhalten.
- T-001: Ausgangszustand, betroffene Owner und geschützte Berichtsdigests festhalten; Brownfield Analysis vor der Umsetzung.
- T-002: Echte Metadaten-/Entscheidungsfelder erkennen, Code-, Zitat- und HTML-Kontexte sicher ausschließen; vorhandene Varianten, Widerspruchsregeln und die interne not_applicable-Grenze prüfen.
- T-003: Tatsächliche Registrierung, QA-Prüfung und Abschluss testen. Beispiele allein dürfen keinen Erfolg erzeugen; abgelehnte Operationen dürfen keinen kanonischen Zustand verändern.
- T-004: Betroffene kanonische Tests, normaler Build und Paketprüfungen. Ein nötiges Größenbudget wird nur exakt nach Messung angepasst; keine Prüfungen abschwächen.
- T-005: Über den unterstützten Codex-Installer installieren, Identität und Dateigleichheit prüfen und den tatsächlichen installierten Kandidaten per CLI/STDIO auf temporären Zielen testen. Alte geladene Generationen zählen nicht als neuer Nachweis.
- T-006: Tatsächliche Nachweise registrieren, Plan-, Lösungs- und Code-Review sowie QA durchführen; erforderliche QA/UAT-Freigaben frisch vorlegen und anschließend den erlaubten Run-Abschluss prüfen.
- Prüfungen: Vierzehn konkrete Szenarien decken alle PRD-Kriterien und SD-Entscheidungen ab, einschließlich kompatibler Berichte, verschachtelter/offener Container, interner Ergebnisdomäne, unveränderter genehmigter Inhalte und installierter positiver/negativer Abläufe.
- Abgrenzung: Keine neuen Gates, Veröffentlichung oder Git-Aktion. Native Modell- und andere Plattformnachweise werden nicht aus lokalen Tests abgeleitet. Der Fix ist noch nicht umgesetzt; die TP-Freigabe erlaubt die Umsetzung nach der erforderlichen Brownfield Analysis.
