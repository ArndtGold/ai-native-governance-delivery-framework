# TP: Implement and qualify concrete Run and UAT decision content

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-14
Owner: AGDF Core/presentation maintainer
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Perform bound implementation-preparation Brownfield Analysis; capture pre-existing dirty source state, exact approved-source and prior completed-Run identities, affected consumers and the installed placeholder/evidence-only reproduction. | Coding agent, existing Brownfield owner | Deliberate TP approval; current approved UR/PRD/SD; completed routing and ready UX |
| T-002 | Implement the shared pure decision-content observer and closed authored-context profiles using the existing report-decision scanner; add focused context/placeholder/source tests without changing retained technical-result defaults. | Coding agent, existing Core observation owner | T-001 |
| T-003 | Integrate concrete Objective projection into permitted UR registration/replacement and shared stage-required content checks into doctor/status, readiness, current preparation and dispatcher correction guidance; preserve draft, selection and historical behavior. | Coding agent, existing Run/readiness/writer owners | T-002 |
| T-004 | Add the three authored QA fields and localized source conventions to existing QA template/contracts; validate before new QA presentation; render one attributed five-group UAT brief/document with existing exact binding, approval, deviation and historical reading owners. | Coding agent, existing QA/presentation/localization owners | T-003 |
| T-005 | Extend actual canonical writer/prepare/read/approve/localization regressions, register focused tests with their existing suite, run affected checks and normal build/assembly, and measure any exact required payload baseline change. | Coding agent, existing test/build owners | T-004 |
| T-006 | Run the supported local Codex installer; freeze/compare source, generated candidate, marketplace/cache and actual launcher identity; qualify actual installed positive/negative current and historical decision paths on disposable targets and retain transcripts. | Coding agent, existing installation/runtime owners | T-005 |
| T-007 | Register actual CD+Tests and perform TP Review, Clean Implementation Review, mandatory Code Review and sole qa-gate assessment; present deliberate live QA/UAT decisions and record/check allowed OR completion with exact receipt replay. | Existing review, QA and release-or owners | T-006; current canonical result bindings |

## 2. Verification Traceability

PRD remains the sole acceptance source. These rows map its exact IDs and every SD decision to executable observations without duplicating acceptance prose. Evidence paths are relative to this Run's artefact directory unless repository-qualified.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Closed profiles observe concrete values and exact whole-value placeholders; embedded quoted sample text does not cause a blanket false rejection; explicit none is accepted only in limits/risks. | Focused Core decision-content tests; evidence/content-matrix.json; evidence/content.log |
| AC-001 | SDD-002 | T-003 | SCN-002 | Actual initial/replacement UR recording projects only an empty/default Objective from a concrete authored Goal in the same sealed revision; custom Objective and unusable Goal draft remain untouched. | Extended actual run-step/UR fixture checks; evidence/objective-writer.json; evidence/writer.log |
| AC-001 | SDD-002 | T-003 | SCN-003 | Initial missing UR remains authorable; selected active current Objective gap is visible during read-only diagnosis and suppresses current decision preparation; inventory/foreign selection remains usable and unchanged. | Existing doctor/control-inspect and current preparation regressions; evidence/stage-readiness.json |
| AC-002 | SDD-003 | T-004 | SCN-004 | Canonical unapproved QA carries exact current delivered_result, qualification_limits and delivery_risks; bare pass, planned tasks, title, association list and illustrative-only fields are insufficient for new QA/UAT presentation. | Existing QA template populated fixtures; actual readiness/prepare tests; evidence/qa-content.json |
| AC-002 | SDD-004 | T-004 | SCN-005 | Ready UAT brief and exact reading document contain the same five source-attributed groups; supporting evidence/unknown history remains inspectable without replacing result text. | Extended presentation-document/decision tests; evidence/uat-projection.json; evidence/renderings.json |
| AC-003 | SDD-003 | T-004 | SCN-006 | Current authored partial/coverage/qualification statements remain unchanged, original technical QA decision is retained and absent limits are not interpreted as none. | Current QA/coverage fixtures; evidence/qa-content.json; evidence/content.log |
| AC-003 | SDD-004 | T-005 | SCN-007 | Actual allowed QA deviation acceptance reaches UAT with all material deviations and original revise; unaccepted required gaps remain ineligible and native/other-platform absence remains explicit. | Existing qa-deviation-acceptance-test.js plus affected fixtures; evidence/command-flow.log; evidence/deviations.json |
| AC-004 | SDD-001 | T-005 | SCN-008 | Unavailable, malformed, duplicate, oversized or stale required sources produce the same concrete content gap across inspection/preparation/revalidation; no unrestricted reader or success-shaped decision bypass. | Actual shared observer/readiness/preparation tests; evidence/source-gap-matrix.json |
| AC-004 | SDD-005 | T-005 | SCN-009 | Changed Goal, QA fields, localized content or revision expires pending material; old reply/approved-source tamper is refused; exact stored historical document remains unchanged and inspectable. | Existing exact document/presentation-decision/approval tests; evidence/binding-refusals.json |
| AC-005 | SDD-001 | T-003 | SCN-010 | Missing required content removes human_gate_decision readiness and identifies exact field/source and permitted authoring owner; explicit status never mutates or repairs. | Existing gate-check/dispatcher/readiness tests; evidence/stage-readiness.json; evidence/dispatcher.json |
| AC-005 | SDD-006 | T-005 | SCN-011 | One permitted own unapproved-content correction followed by canonical recording permits fresh preparation; approved QA is not silently patched and its protected-source gap names the existing renewal assessment without an invented reopen path. | Actual current QA/UAT gap and protected-source scenarios; evidence/recovery.json |
| AC-005 | SDD-006 | T-005 | SCN-012 | Transient preparation exposes safe retry; uncertain writes recover/inspect the original UUID; repeat returns original effect, not a new human decision; refused input preserves Run/output/receipt/backlog snapshots. | Existing preparation/approval/owned-output transaction/recovery tests; evidence/recovery.json; evidence/refusal-state.json |
| AC-006 | SDD-002 | T-005 | SCN-013 | Custom metadata, neighboring Runs and prior completed-source digests remain identical; no bulk update or read-side projection write. | Captured baseline and protected-source comparisons; evidence/protected-sources.json; evidence/objective-writer.json |
| AC-006 | SDD-005 | T-005 | SCN-014 | Existing accepted documents and receipts are read/replayed using their original immutable proof, not newly rendered/regraded; current source changes do not reopen completion. | Existing historical document/replay/completed fixtures; evidence/history.json |
| AC-006 | SDD-006 | T-005 | SCN-015 | A selected legacy active gap preserves earlier approved sources/decisions, offers only its supported current correction route and does not affect unrelated inventory. | Actual legacy-current and foreign selection checks; evidence/history.json; evidence/stage-readiness.json |
| AC-007 | SDD-004 | T-005 | SCN-016 | Every affected current/gap/historical state renders complete outcome/limits/effect in each registered language; required missing translated fields fail explicitly and unsupported tags use the existing fallback without invented content. | Extended operational-localization tests; evidence/renderings.json; evidence/localization.log |
| AC-007 | SDD-007 | T-006 | SCN-017 | Exact final installed en/de current UAT documents and gap output preserve the source/display distinction and same original QA meaning. | evidence/installed-qualification.json; evidence/installed-stdio.jsonl; evidence/installed-renderings.json |
| AC-008 | SDD-007 | T-005 | SCN-018 | Affected canonical source/MCP checks, normal build/generation and instruction/payload checks pass; exact measurement justifies any baseline update with zero headroom. | evidence/command-flow.log; gates.log; control-state.log; control-inspect.log; build.log; footprint.log; payload.json; mcp.log |
| AC-008 | SDD-007 | T-006 | SCN-019 | Supported install succeeds; changed Core/contracts equal frozen source, all candidate marketplace/cache files agree and the actual launched installed generation is identified. | evidence/install.log; installed-identity.json; final-source-identity.json |
| AC-008 | SDD-007 | T-006 | SCN-020 | Actual installed draft/UR projection, QA checks and structured slice/full UAT prepare/read/approve/OR succeed for genuine reports and refuse placeholder/missing/example/quote/stale/tampered cases without canonical mutation; exact UUID replay remains valid. | evidence/installed-qualification.mjs; installed-qualification.json; installed-stdio.jsonl; installed-refusals.json |
| AC-008 | SDD-007 | T-007 | SCN-021 | Reviews/QA assess actual scoped diff and installed evidence; deliberate live approvals remain bound; allowed OR records final lifecycle, protected-source checks and receipt replay without VCS actions. | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md; OR.md; evidence/final-state.json |

## 3. Test Plan

### Preparation and baseline

After valid TP approval, redispatch the same bound gate-check and complete its implementation-preparation Brownfield Analysis before code edits. Record actual current ownership, reused scanner/readiness/writer/renderer surfaces and test integration. Capture Git status and the pre-existing affected file bytes/diff so this correction is reviewed as an additional scoped delta. Preserve the completed compact-execution and report-field repairs and all unrelated work. Capture current approved UR/PRD/SD/TP, the prior completed QA/OR and immutable UAT presentation/receipt identities in evidence/protected-sources.json.

Reproduce the observed Objective and evidence-only UAT behavior using the actual installed candidate on disposable targets or immutable retained actual evidence with a clearly labeled fresh reproduction. Do not reopen, reapprove or edit the completed Run. Keep source, installed launcher, old loaded namespace and synthetic fixture prerequisites distinguishable. Do not qualify a runtime based only on a matching version string.

### Focused observation and writers

Add a focused Core test owner for decision-content-readiness and closed scanner profiles, then register it under the existing canonical command-flow suite. Retain all current report-decision compatibility/context/internal cases and their independent expectations. The scanner extension must not admit new technical-result contexts, QA not_applicable or altered normalization. Exercise concrete Goal/scalar source blocks, canonical numbered headings, quoted/code/list/lazy/HTML/nested/unclosed contexts, first-block closure, duplicate/missing/empty/unknown declarations, exact template/whole-value placeholders, embedded illustrative mentions, permitted explicit none and overlong/unavailable values. Tests must verify meaningful boundaries rather than reproduce helper implementation.

Extend actual UR recording/metadata and readiness fixtures. Call canonical writers and preparation, not a mocked policy result. Compare before/after state, exact preserved custom/protected content and revision/source bindings. Test incomplete creation/intake, current selected versus foreign/legacy/completed diagnosis, custom orientation, concrete/default Goal, permitted unapproved replacement and protected-source refusal. A refused operation must leave Run, registered outputs, receipts and backlog unchanged; read-only checks write nothing.

### QA/UAT and historical integration

Populate the canonical QA template with the new source-authored fields and matching complete en/de summaries before testing current QA. Update only synthetic current-ready fixtures that legitimately need the new declared content; keep dedicated historical/missing-content fixtures unchanged to exercise compatibility and refusal. Do not weaken assertions, skip failures or supply readiness flags to hide missing semantics.

Exercise actual QA registration, readiness/preparation and approval checks, UAT preparation, exact reading and approval revalidation. Verify the same five-group source-attributed content appears in concise output and immutable document; evidence associations remain inspectable supporting details. Compare canonical source/material/summary/document digests before and after real Goal/result/limits/localization changes. Test current reports with contrary illustrative fields, genuine partial/coverage statements and original QA/deviation meaning. Bare pass or source lists alone must be refused.

Retain original source/tamper/stale/deliberate-reply, transaction interruption/recovery and exact-original-UUID replay tests. Preserve immutable accepted history and completed/foreign scopes; missing required fields in an already approved legacy QA must remain an explicit protected-source gap rather than an auto-edit or new transition. Include existing accepted QA deviations and unaccepted-required-gap cases. Final reports may state future live QA/UAT/OR work as pending; no implementation review is retroactively rewritten after those later lifecycle steps.

### Source suites, language and packaging

Run the focused observer test while implementing. After the scoped implementation is complete, run the canonical affected suite once through `npm --prefix packages/cli run test:run-command-flow`. It covers current report/result behavior, actual command/writer/presentation/document/QA-deviation and recovery checks; register the new focused test without removing existing entries. Run `test:cli-gates`, `test:control-state`, `test:control-inspect` and `test:run-step-transaction` through packages/cli for affected gate, read-only inventory/draft and writer/backlog consistency. These are validation, not product truth or native host proof.

Run the affected `test:interaction-presentation`, `test:operational-localization` and `test:interaction-catalog`. Retain actual rendered changed-state fixtures for every locale from the registry, currently en and de, plus existing unsupported-tag fallback. Include ready UAT, current content gap, historical reading and retry/status guidance. Inspect complete labels/outcome/limits/effect, one visible decision moment and exact source/document consistency. Key completeness alone is insufficient.

Run normal `npm run build:prepare` serially after source checks. Do not overlap generators/build/install. If legitimate source/contract growth exceeds the existing exact payload ceiling, retain the actual normal-generator measurement and rationale; update only that exact measured baseline, then rerun the existing check. No arbitrary headroom or disabled size/assertion guard is authorized. Run `test:instruction-footprint` and `test:payload-budget`, preserving current instruction limits. Run actual assembled MCP structured-flow, whole-flow and safety tests against the prepared candidate using the existing test owners. Preserve both supported protocol variants where the affected existing tests cover them.

Repeat or broaden only after a new change, failure or unresolved concern. If final review changes the scanner/readiness/renderer after a suite, rerun its affected checks and regenerate/install; never present an intermediate candidate's tests as final behavior proof. Keep preliminary and final logs separate.

### Supported installation and actual final candidate

Use `npm run install:codex` only after final source/package checks pass. The approved UR/PRD authorize scoped local installed verification; installer/launcher writes outside the workspace may require the host's normal permission review. Use the supported installer, not manual cache patches, and do not restart the app automatically.

Freeze the relevant source/code/contract identity. Capture installation marker, content-derived build, source/runtime digests and selected installed launcher configuration. Compare all marketplace/cache candidate files byte-for-byte and changed installed Core/contracts with source. The currently loaded mcp__agdf generation can be older; do not use it as final-build qualification. Current live recording after installation must use a confirmed exact final writer, with no receipt/approval transfer.

Keep an explicit bounded probe under this Run's evidence directory. Reuse the existing STDIO client and canonical synthetic fixture setup; only disposable scaffold initialization may use the source CLI if the installed surface shim lacks init. Qualifying control operations use the actual installed candidate. No transport helper gains policy or approval authority.

Qualify new incomplete draft/intake and actual UR writer orientation, current QA content checks, structured_slice and structured_delivery UAT prepare/read/approve/closeout with concrete source-attributed reports, en/de source-authored output, original accepted deviations/limits and valid seals. Negative scenarios include placeholder/empty/missing required fields, examples/quotes/HTML only, duplicate fields, source-list-only results, missing localized source information, stale revisions and changed approved/document bytes. Capture refusal-state snapshots and exact original operation replay. Historical accepted material remains readable using original proof; source text is never auto-patched. Remove only owned disposable targets and close temporary sessions.

Save exact requests/results, observed generation and outcomes in evidence/installed-stdio.jsonl and installed-qualification.json; retain installed-renderings.json and installed-refusals.json. QUALIFICATION_SUMMARY.md must distinguish source/package/installed direct proof, synthetic prerequisites/cooperative review and unobserved native model or other platforms. No fresh model/host/click qualification is required for this approved direct installed-runtime scope.

### Review and live closeout

Record actual current CD+Tests through the existing result writer and exact source binding. Perform TP Review, Clean Implementation Review and mandatory Code Review of the actual scoped delta, then sole qa-gate assessment. All applicable normalized or UX fidelity gaps must be resolved or remain explicitly non-passing; missing required installed proof cannot be called pass.

Author the live QA report using the implemented canonical result/limits/risk fields and complete localized source summary. Recheck protected sources and current exact candidate. Present the current QA version and record only a new deliberate user response. Continue the same Run immediately after accepted approval; present required UAT through the actual new brief/document and wait for its own deliberate reply. Then record allowed OR through the canonical closeout writer, check doctor/backlog/final lifecycle and exact original-UUID replay, and retain evidence/final-state.json. No commit, push, PR or publication is part of this plan.

## 4. Brownfield Scope

Inspect the existing authored scanner/result reader, canonical Run/UR writer and DEFAULT_BODY; doctor, gate-check, draft-readiness and dispatcher/required-preparation diagnostics; source containment/captured reads; QA template and authoring/runtime contracts; artifactSummary/localized summary validation and interaction registry; run-presentation-render, decisionMaterial, immutable document and approval writers; current evidence applicability/QA-deviation acceptance; affected fixtures and transaction/backlog guards; normal generation and supported Codex installer.

Use the approved SD's single-owner/closed-profile design. The new focused observer is internal and pure; no new persistent source, generic parser, permission owner or lifecycle transition is allowed. A newly discovered full-depth/public-schema/authority/migration impact requires reassessment before implementation rather than being silently added to this plan.

## 5. Out Of Scope

New gates or exact approval formulas, public CLI/protocol/receipt schema changes, a mutable UAT summary register, generic Markdown/NLP truth parsing, approval buttons or general UI redesign, new runtime-generation replacement, automatic approved-source editing/QA reopening, bulk repair/regrading of other or completed Runs, app restart, native-model/other-platform assurance, VCS/deployment/public release.

## 6. Risks And Blockers

- Shared-scanner context/domain regression, illustrative fields counted as facts, fabricated plan-to-result inference, absent limits treated as none or original QA disposition altered: implementation defect; block passing QA until corrected and covered by meaningful negative cases.
- Divergent diagnosis/preparation/revalidation or a human approval request left enabled despite a required content gap: implementation defect; resolve before presenting QA.
- Incomplete draft/inventory obstruction, custom Objective overwrite, approved-source auto-edit, historical document regeneration/regrading, foreign mutation or refused-operation state change: protected-boundary defect, not an acceptable workaround.
- Missing required translated source content is a concrete authoring gap; invented translation, hidden truncation or untested changed locale is missing/incorrect evidence.
- Failed affected checks/build/install, uncontrolled payload headroom, changed source after final qualification or an old tested runtime generation: required evidence gap; requalify the intended exact candidate before QA.
- Protected legacy QA missing current fields retains its actual gap and existing allowed assessment route. Do not introduce a new automatic reopening or make historical approval false merely to simplify tests.
- Cooperative source statements/review and synthetic fixture prerequisites are not independent truth/human proof. Native model/other-platform observations remain outside the approved acceptance scope and must be reported honestly.

## 7. Next Step

Review this Task/Test Plan and approve only with Approval: TP. Valid approval permits implementation-preparation Brownfield Analysis and then the bounded implementation when its evidence supports it. No new code or installed candidate is delivered by this plan.

## AGDF Approval Summary (de; source=en)

- Plan: Erst aktuelle Zuständigkeiten und geschützte Quellen festhalten, dann die gemeinsame Inhaltsprüfung, Run-/QA-Prüfungen und die UAT-Ergebnisdarstellung umsetzen. Anschließend echte Abläufe, Sprachen, Paket und installierten Kandidaten prüfen; Reviews, QA/UAT und Abschluss bleiben gebunden.
- T-001: Nach TP-Freigabe Brownfield Analysis vor Codeänderungen; Ausgangszustand und vorherige abgeschlossene Fixes schützen, beobachtete Platzhalter-/Quellenlisten-Lücke konkret reproduzieren.
- T-002: Gemeinsamer reiner Core-Observer mit geschlossenen Kontextprofilen. Die bestehende Berichtsfeld-Matrix und Entscheidungsdomäne bleiben erhalten; Beispiele, Zitate, HTML und ganze Platzhalterwerte werden sauber unterschieden.
- T-003: Orientierung nur beim erlaubten UR-Erfassen aus dem konkreten Ziel ergänzen; eigene Ziele erhalten. Draft, Diagnose und Inventar bleiben nutzbar, aber aktuelle Pflichtlücken verhindern eine Freigabevorlage und nennen den Korrekturweg.
- T-004: Ergebnis, Nachweisgrenzen und Risiken im bestehenden QA-Bericht samt Übersetzungen erfassen und schon vor neuer QA-Freigabe prüfen. UAT-Brief und Lesedokument zeigen dieselben fünf Gruppen mit Quellen und ursprünglicher QA-/Abweichungsbedeutung.
- T-005: Tatsächliche Writer-/Vorbereitungs-/Dokument-/Freigabe-/Recovery-Abläufe prüfen. Geänderte Ausgaben in allen registrierten Sprachen rendern; kanonische betroffene Tests und normaler Build bestehen. Paketwachstum nur exakt messen, keine freie Budgetreserve.
- T-006: Unterstützt lokal installieren, eingefrorene Quelle und alle Marketplace-/Cache-Dateien vergleichen und die wirklich gestartete Generation prüfen. Der tatsächliche neue CLI/STDIO-Kandidat besteht positive/negative QA-/UAT-Abläufe mit unverändertem Zustand bei Ablehnung.
- T-007: Aktuelle CD+Tests, Plan-/Lösungs-/Code-Review und alleinige QA-Entscheidung erfassen. Danach neue bewusste QA- und UAT-Freigaben; erlaubter OR, Doctor/Backlog, Abschlussstatus und ursprüngliche Belegwiederholung werden geprüft.
- Nachweise: 21 Szenarien decken alle acht PRD-Kriterien und sieben SD-Entscheidungen ab, einschließlich Platzhalter/Beispielgrenzen, Drafts, Quellen-/Versionsbindung, ursprünglicher QA-Bedeutung, Historie, geschützten Quellen, Sprachdarstellung und tatsächlicher Installation.
- Grenzen und Risiken: Keine zweite UAT-Quelle, neue Gate-/Reopen-Logik, stille genehmigte Änderungen, Alt-Run-Migration, App-Neustart, Git-Aktion oder Veröffentlichung. Fehlende installierte Pflichtnachweise bleiben Lücken; alte Generationen und synthetische Freigaben sind kein Live-Nachweis. Native Modell-/andere Plattformprüfung ist nicht Teil dieses direkten installierten Scopes.
- Nächster Schritt: Approval: TP erlaubt zuerst die Implementierungs-Brownfield-Analyse und danach die freigegebene Umsetzung. Der neue Fix ist noch nicht implementiert oder installiert.
