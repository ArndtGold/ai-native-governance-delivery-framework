# SD: Shared decision-content observation and source-bound UAT brief

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-14
Owner: AGDF Core/presentation maintainer
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend existing Core content observation and presentation ownership. One pure read-only decision-content observer validates stage-required orienting metadata and derives the five UAT information groups from current authoritative sources. Doctor, current gate/preparation, renderer and approval revalidation consume that observation. They neither persist a second result nor decide QA.

Data flow: selected captured Run and contained current artefact bytes -> bounded authored-context observation -> concrete values/source references or typed content gaps -> existing readiness/presentation -> existing immutable document and deliberate approval transaction. Existing integrity, current-source applicability and gate checks remain prior constraints.

The implementation belongs in a focused internal control-evaluation/decision-content-readiness.js owner, reusing the authored-context scanner already owned by report-decision.js. Extend that scanner with closed internal content profiles; do not add another independent Markdown parser or broaden readReportDecision's result domain. Existing report-result contexts and normalization must remain byte-for-byte behavior compatible under their retained regression matrix. The new internal observer has no protocol-facing API or persistent schema.

For new or explicitly revised unapproved UR registration, the existing run-steps writer may replace only an empty/default Run Objective with the exact concrete first authored Goal paragraph from the UR being registered. This is an orienting projection recorded atomically with the UR pointer/binding and revision; it is not an approved product statement. Preserve a custom concrete Objective. Do not auto-edit a legacy Run during diagnosis or presentation. If a usable Goal is absent, retain the draft and report its concrete readiness gap. No title, source filename or template sentence is a fallback outcome.

Current structured QA authoring supplies explicit source-authored outcome/limit/risk fields within its existing authoritative sections. Validate these before a new QA approval presentation, then use the same observer for UAT. This prevents a new approved report becoming unusable because its missing result explanation was only discovered later. Existing approved reports are never auto-patched.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner | Consumption and boundary |
|---|---|---|
| Product need and acceptance | Registered approved UR and PRD | Read exact current bytes; editorial summaries stay subordinate |
| Orienting Run Objective | Existing canonical Run/UR registration writer | Copy actual Goal only during authorized unapproved registration/replacement; custom metadata preserved; no read-side writes |
| Authored-context exclusion | Existing Core report-decision.js scanner | Reuse fences, quotes/lazy continuations, lists, HTML and positive field-block handling through closed internal profiles; current result observer defaults remain unchanged |
| Concrete stage content and UAT group/source observation | Focused internal decision-content-readiness.js in control-evaluation | One pure owner with captured source reader; no filesystem policy, gate decision, writer, cache or summary store |
| Technical QA, coverage and reported qualification | Current registered QA report and applicable implementation/review evidence | Existing readReportDecision and exact qa_acceptance retain authority; outcome text is authored evidence, not independently proved truth |
| Current eligibility and diagnostic routing | Existing gate-check, doctor, artifact-readiness and dispatcher continuation owners | Consume same content gaps, retain existing integrity/approval priority and bounded recovery |
| Localized decision/reading material | Existing run-presentation-render.js and agdf-interaction-locales.json | One projection renders the same brief and exact document; current registered languages en/de, existing fallback policy unchanged |
| Immutable documents, source binding and approval | Existing run-presentation.js, presentation-decision.js and approval writers | No envelope version or receipt schema change; compare current material/digests and preserve stored history |
| Package and actual install | Existing generator/build and supported Codex installer | Exact measured payload, frozen source and actual final installed launcher proof |

The graph and external memory need no mutation. Run-specific reasoning, source identities and tests remain scoped evidence. There is no new UAT.md authority or writable derived dashboard.

## 3. Architecture Decisions

- SDD-001: Use one pure selected-Run decision-content observer and retain the existing authored-context scanner as the sole exclusion owner; rationale: diagnosis, preparation and decision must not maintain divergent content interpretation; consequence: a small necessarily-coupled scanner extension needs the full retained result-context matrix and new closed-profile tests.
- SDD-002: Treat Run Objective as orienting metadata and project a concrete Goal only within authorized initial/replacement UR registration; rationale: ordinary new drafting must not inherit a template outcome or require a read-side repair; consequence: legacy/custom metadata is untouched, and a legacy current placeholder needs an explicit canonical metadata correction.
- SDD-003: Store delivered-result and qualification statements in the existing QA report, observe them before new QA presentation and again at UAT, and derive the five groups from exact current UR/QA/evidence; rationale: explicit authored facts avoid plan/title/task-count inference and retain one QA authority; consequence: new unapproved QA authoring uses bounded required fields, while incomplete already approved sources require their protected correction route.
- SDD-004: Render one source-attributed UAT projection in both decision brief and immutable reading document, using the existing source-authored localization route; rationale: the reader and approver must see the same outcome/limits without an invented translation or second summary store; consequence: missing or oversized required localized information is a content gap rather than truncation/fallback.
- SDD-005: Keep exact source/material/document/revision checks and stored historical reading independent of new current content readiness; rationale: current source changes must expire pending decisions without regrading accepted history; consequence: new preparation and approval revalidation use current observation, while historical document reads/replays keep original immutable proof and no new schema version.
- SDD-006: Route missing-content correction through existing unapproved authoring or protected-source owners and use existing operation/status recovery; rationale: detecting a gap must not authorize editing, replay a human reply or introduce another lifecycle engine; consequence: approved legacy QA lacking new information remains an explicit protected-source gap until an already supported renewal route is deliberately used.
- SDD-007: Qualify source, registered-language output, package and actual installed candidate through existing owners and exact measurement; rationale: a passing old loaded generation cannot prove this candidate and payload guards remain meaningful; consequence: no app restart/native/other-platform claim or discretionary size headroom is introduced.

## 4. Integration Points

### Closed content grammar

The shared authored-context scanner gets a bounded internal observation surface for these specific roles, not caller-defined Markdown rules:

- Run Objective: the real column-zero H2 Objective section and its first authored substantive paragraph. Exclude code, quote/list/HTML examples and nested/unrelated headings. Empty, ambiguous or template-only values are gaps.
- UR Goal: the first authored substantive paragraph under exact Goal or canonical numbered Goal H2. For a localized display use the complete source-authored Goal/Ziel line in the existing validated matching Approval Summary block, retaining the canonical Goal source reference. Source Goal itself must be concrete.
- QA outcome: the first scalar field block under canonical TP Coverage or numbered TP Coverage, containing exactly one `- delivered_result: <concrete authored result>`.
- QA limits: the first scalar field block under Missing Evidence or canonical numbered Missing Evidence, containing exactly one `- qualification_limits: <concrete limits or explicit none>`.
- QA risks: the first scalar field block under Risks or canonical numbered Risks, containing exactly one `- delivery_risks: <concrete open issues or explicit none>`.
- Localized QA values: existing matching source-authored Approval Summary fields `Delivered result / Ergebnis`, `Qualification limits / Grenzen` and `Risks / Risiken`. For en with English artefact content the canonical values are used. For de with English artefacts the complete matching block is required. Existing supported locale resolution/fallback remains authoritative.

These field names are internal authored-document conventions, not protocol/CLI fields. Extend the installed QA template and focused QA authoring/runtime contract guidance accordingly. Existing body prose, coverage matrix, logs and reviews remain inspectable supporting evidence. No independent acceptance field is added: acceptance disposition derives from the original technical QA decision, current coverage/evidence and exact existing separate deviation-acceptance record. Every material accepted deviation is appended intact, independent of optional summary text.

Only the named positive authored blocks can supply values. Shared container exclusion rejects fields supplied solely by examples, quotations, fences, nested sections or HTML. The first eligible field block closes on prose/unknown field/unrelated heading; blanks do not reopen it. Missing/duplicate/ambiguous required declarations are gaps. Values are bounded by existing source/document/summary limits; excess is reported, never silently truncated. This grammar does not prove the truth or translation fidelity of authored statements: those remain cooperative authoring and QA/review responsibilities.

Placeholder recognition is field-local and exact after permitted whitespace/backtick normalization: empty values, whole template choice/angle-marker values, exact supported template instructions (including the observed Objective and QA prompts), and whole TODO/TBD sentinels. No substring blacklist or fuzzy prose-intent classifier is introduced. The literal placeholder mentioned within an otherwise concrete statement is not itself a placeholder-only value. `none` is admitted only for explicitly absent limits/risks, never Goal or delivered result.

### Observation and stage integration

The observer accepts the selected canonical state, actual gate/stage and a contained captured source reader. It returns a bounded internal ready/not-required state, source-attributed content groups and typed gaps naming field, source and existing correction owner/action. It validates exact current registered source roles and required applicability; it does not reread files through unrestricted paths or create another source snapshot.

Doctor/status: an initial unregistered Run is an incomplete authorable draft. For a selected active Run with registered UR, missing/default orienting Objective is a visible warning/content diagnostic; read-only inspection/inventory remains usable. Do not globally change shared isPlaceholderValue behavior. Completed/history/foreign Runs are not regraded by this check. Other hard integrity findings retain priority.

Current human-decision preparation: require concrete Objective and existing stage-required artefact content. Put a content failure into existing preparation/presentation diagnostics and suppress the ready approval request. Do not leave next_operation as human_gate_decision when required content is unready. The dispatcher uses the existing bounded authoring/correction or protected-source recovery route, not a success-shaped card. Ordinary current status remains read-only; no new human gate or public operation is introduced.

Structured QA draft readiness/presentation: require concrete delivered_result, qualification_limits and delivery_risks in the unapproved current report before asking Approval: QA. The technical QA result still comes exclusively from readReportDecision. QA revise/block and deviation eligibility retain their exact current behavior; the content check neither changes that result nor creates acceptance.

UAT readiness/rendering: derive intended Goal from approved UR; result and limits/risks from exact current QA; acceptance from original technical QA and current applicable coverage/evidence/accepted deviations; effect from the existing localized UAT action policy. Add inspectable source role/path/digest attribution and keep the full evidence list as supporting details, including historical/unknown applicability labels. Bare metadata/association lists cannot satisfy the result group. If any required group/source is unavailable or unusable, return its content gap before document/approval preparation.

The current implementation/review source association policy remains: do not silently label historical/unknown rows current or treat an absent required association as independently verified. Where existing legacy current eligibility is allowed, disclose its actual evidence strength; result text still must come from registered authored QA. No new independent human or semantic assurance is inferred.

### Binding and failure behavior

Existing UAT decisionMaterial already includes UR/PRD/SD/TP/QA and current reports. Preserve its exact canonical digest/material-version owner. The rendered UAT artefact/summary/document digests additionally cover the actual derived five groups and source-attribution projection, within the existing fields. No new receipt/envelope version or extra persistent source-set owner is needed. Preparation captures/rechecks exactly the same source observation before persistence; pending approval revalidation recomputes current eligibility and binding under existing locks.

Changed required source, content, localization or Run revision requires a fresh pending presentation. Existing stored accepted documents are read by immutable envelope/digest and are not regenerated using the new observer. Original operation replay reports its historical receipt/effect without creating a current approval or rewriting history. Source tamper and stale version still refuse without canonical mutation.

Content-only gaps name the exact authoring responsibility. Unapproved QA may be completed through qa-gate and its existing writer before fresh QA presentation. An approved QA with missing required fields is not editable by the UAT renderer or delivery-closeout; the current diagnosis explicitly retains the protected-source gap and points to its existing permitted renewal/revision assessment. No new automatic QA-reopen path is invented. Future generated QA reports avoid that situation through the earlier check. Orienting unchanged-intent metadata uses the existing canonical Run update; changed approved intent uses its existing earliest-source revision.

Recoverable transient preparation failures use existing safe retry/status semantics. Uncertain recording uses the original UUID and operation receipt/recovery owner. Do not replay an earlier user approval as a new reply. One explicit next action accompanies a diagnosed gap/failure.

## 5. Constraints And Compatibility

Existing gates, user approvals, file/receipt schemas, protocol fields, CLI flags and state authority remain unchanged. New document conventions are additive within current authoring owners and enforced only for new/current selected decisions, never retroactively for accepted history/completed closeout. Preserve old report-decision behavior and previously approved Run/report bytes. No bulk repair, app restart or runtime-generation replacement.

The source observer is pure, bounded by existing read limits and container grammar. It adds no parser dependency or general Markdown infrastructure. Source read limits, captured reads, symlink containment and canonical digests stay with their current owners. Locale keys/content limits remain within existing registry/summary validation. Existing English fallback behavior is unchanged and does not invent a missing editorial summary.

The repository has pre-existing dirty changes from completed compact/report repairs and unrelated active work. Implementation preparation must capture this baseline and isolate the new scoped delta. Existing loaded native MCP 4ade generation is older than installed 1830 build; authoring receipts are current cooperative control evidence, but final qualification must use the actual newly installed launcher and identity. All necessary generated assets come from the normal build/install owners.

No deliberate debt/fallback is retained by this design. The compatibility treatment for historical material is the existing immutable reading boundary, not an alternative current approval path. If implementation discovers a public contract, new trust/schema/migration or non-local coordination requirement, stop and reassess the approved scope/route before proceeding.

## 6. Test And Evidence Strategy

TP must map each criterion and SDD decision to actual source/command/installed scenarios. Keep the original result-reader context matrix unchanged and add closed content-profile cases: concrete/multiline source paragraphs, exact prompts, whole markers, legitimate embedded citations, list/quote/lazy/fence/HTML/nested contexts, duplicate/unknown/empty required fields, explicit none only in limits/risks, overlong or unavailable inputs.

Exercise actual initial UR recording/projection with draft missing Goal, concrete/custom Objective and unchanged approved source/replacement protections. Test that doctor/status do not mutate or break inventory/foreign/history and that preparation suppresses a human decision for current gaps. Exercise real QA recording/readiness, UAT preparation/read/approval with source-attributed five groups, accepted deviations, partial/limited statements, missing required localized fields, stale/tampered sources and exact receipt replay/refusal-state snapshots.

Render changed current/gap/historical output for every registered locale, currently en/de, and the existing unsupported-tag fallback. Check complete visible outcome/limits, one decision moment, inspectable supporting references and exact document meaning/digest. Standard source/package checks do not prove a fresh native model session.

Run affected canonical regressions and normal build/assembly. Measure any legitimate source growth through the normal generator and update only its exact justified existing baseline if needed, zero headroom. Install through the supported Codex installer. Compare source/package/marketplace/cache identity and qualify the actual final installed observer and CLI/STDIO operations on disposable targets, clearly labeling synthetic fixture prerequisites. Retain frozen source, final identity, transcript and protected source digests. No VCS/release action is authorized.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Shared field-local stage observation; canonical UR writer projects only missing/default Objective; draft/inventory remain usable and current preparation suppresses unready requests | Existing Run/UR writer and Core decision-content observer | SDD-001, SDD-002 | Avoid global placeholder severity changes, custom metadata overwrite or quoted-example rejection |
| AC-002 | Source-authored QA fields and current UR Goal form one five-group brief/document with exact attribution; supporting associations remain details | Registered UR/QA plus current applicable evidence and existing presentation owner | SDD-003, SDD-004 | Bare result/association/plan cannot supply outcome; no stored UAT authority |
| AC-003 | Original technical QA/coverage and exact separate acceptance remain; explicit QA limits/risks and all accepted deviations carried forward | Existing readReportDecision, QA report, qa_acceptance and evidence applicability | SDD-003, SDD-004 | No none from absence, revise-to-pass conversion or unobserved native claim |
| AC-004 | Same content observation feeds preparation/revalidation; exact current source/material and rendered/document digests remain; immutable history reads preserved | Existing decisionMaterial, run-presentation and approval transaction | SDD-001, SDD-005 | Pending upgrade/source change can require fresh preparation, never old-reply transfer |
| AC-005 | Typed source/field gaps route current authoring or protected-source assessment; existing retry/original-UUID receipt recovery retained | Existing gate/dispatcher preparation and operation/receipt owners | SDD-001, SDD-006 | Approved legacy missing QA fields cannot be silently edited; no invented reopen transition |
| AC-006 | Selected active current readiness only; preserve stored historical accepted documents, completed/foreign Runs and protected source digests | Existing immutable presentation/history, Run selection and canonical writers | SDD-002, SDD-005, SDD-006 | No bulk migration or retrospective content grading |
| AC-007 | Existing validated source-authored localized summaries and registry labels render the same groups/gaps/effect with original source identity | Existing artifactSummary/localization and one UAT projection | SDD-004, SDD-007 | Missing localized fields stay explicit, no silent translation/truncation |
| AC-008 | Canonical checks, source freeze, exact normal-generator budget and supported install followed by actual final candidate positive/negative qualification | Existing build/generator/installer and current runtime qualification owners | SDD-007 | Old loaded generation, synthetic prerequisites and unobserved native/platform evidence remain separately labeled |

## 8. Risks And Open Questions

Material design choices are resolved below. The greatest implementation risks are shared-scanner regression, falsely admitting illustrative result fields, divergence of doctor/render/approval checks, incomplete localization and retroactive historical revalidation. Their mandatory mitigation is the single observer/closed grammar plus retained and actual command/installed negative cases. No independent truth or translation-fidelity guarantee is claimed; coding-agent review and QA inspect the source-authored meaning.

The new QA field convention must be documented in the existing template/authoring contract before required current preparation uses it. A currently approved legacy QA lacking the fields is a truthful content gap, not permission for auto-backfill. New report validation happens before QA approval to avoid creating that gap again. Any missing supported protected-source recovery stays explicitly blocked rather than engineering a parallel lifecycle path. Exact test ordering, fixture counts and measurement/log filenames are execution decisions for TP.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Shared content observation and context grammar | before_sd | resolved | Focused pure control-evaluation observer reuses closed authored-context scanner profiles; old technical result defaults remain unchanged, no second parser/store | AGDF Core maintainer |
| Objective projection and current/draft compatibility | before_sd | resolved | Existing UR registration/replacement writer fills only missing/default orientation from concrete authored Goal; custom/legacy/read-only/history remain untouched; current preparation exposes gaps | AGDF Core/writer maintainer |
| Exact outcome/limit source convention | before_sd | resolved | Existing QA TP Coverage/Missing Evidence/Risks gain delivered_result, qualification_limits and delivery_risks scalar fields; current QA validates before new approval; UAT reads exact UR/QA/evidence and original disposition | AGDF QA/Core maintainer |
| Localized brief/document and attribution | before_sd | resolved | Existing source-authored Goal and QA Result/Limits/Risks summary labels, current registry and one projection produce complete same decision material; missing/overlong values are gaps | AGDF presentation maintainer |
| Existing source/document bindings and history | before_sd | resolved | Existing material/source and presentation digests cover the derived brief and immutable document, no schema version change; history reads/replays use original stored proof | AGDF Core/presentation maintainer |
| Gap correction and uncertainty recovery | before_sd | resolved | Use current unapproved authoring or protected-source assessment and original-UUID receipt recovery; no automatic approved QA rewrite or new reopen path | AGDF Core/dispatcher maintainer |
| Qualification and budget owner | before_sd | resolved | Normal build/generator and supported local installer; exact measured ceiling, final source/installed identity and direct actual installed flows; native/model/other-platform claims excluded | AGDF build/installation maintainer |
| Scenario/task/evidence ordering | later_tp | deferred | TP maps every criterion/decision to bounded actual tests and logs, including protected-state/refusal/replay and registered-language observations | Existing task/test plan owner |

## 9. Next Step

Review this SD and approve only with Approval: SD. Its acceptance permits the existing Task/Test Plan drafting stage, not implementation. Production source, package and installed runtime have not been changed by this design.

## AGDF Approval Summary (de; source=en)

- Lösung: Eine gemeinsame reine Inhaltsprüfung liest konkrete aktuelle Run-/UR-/QA-Angaben und liefert entweder die fünf UAT-Informationsgruppen samt Quellen oder eine genaue Lücke. Diagnose, Vorbereitung, Darstellung und Freigabeprüfung verwenden dieselbe Beobachtung; es entsteht keine zweite Ergebnisquelle.
- Verantwortung: UR/PRD bleiben Produktquelle, QA bleibt Ergebnis-/Nachweisquelle, bestehende Run-/Präsentations-/Approval-Writer entscheiden Zustand und speichern Belege. Der vorhandene Berichtskontext-Leser wird intern wiederverwendet; seine bisherigen Entscheidungsregeln bleiben erhalten.
- Entscheidungen: Ein fokussierter Core-Observer, geschlossene Kontextprofile, konkrete Run-Orientierung aus dem tatsächlichen UR-Ziel nur beim erlaubten Erfassen, drei Ergebnis-/Grenzen-/Risiken-Felder im bestehenden QA-Bericht, eine lokalisierte UAT-Projektion und die vorhandenen Digest-/Historien-/Recovery-Owner sind festgelegt. Keine neue UAT-Datei, Parser-Abhängigkeit, Policy oder Belegschema-Version.
- Run-Verhalten: Neue Entwürfe bleiben bearbeitbar. Der UR-Writer kann ausschließlich leere/default Orientierung aus dem konkreten Ziel übernehmen; eigene konkrete Ziele werden nicht überschrieben. Lesende Prüfungen ändern nichts. Bei einer aktuellen Entscheidung verhindert eine Pflichtlücke die Freigabevorlage und nennt den erlaubten Korrekturweg.
- QA und UAT: Geliefertes Ergebnis, Nachweisgrenzen und Risiken stehen als authored Felder in den bestehenden QA-Abschnitten und werden schon vor neuer QA-Freigabe geprüft. UAT zeigt Ziel, Ergebnis, ursprüngliche Abnahme-/QA-Bedeutung, Grenzen/offene Punkte und Wirkung. Bloßes pass, Plantext oder Quellenanzahl reichen nicht; akzeptierte Abweichungen bleiben vollständig sichtbar.
- Integration: Bestehende Core-Readiness, Doctor, Präsentation und Freigabe nutzen eine Quelle. Brief und exaktes Lesedokument zeigen denselben Inhalt und Herkunft. Aktuell registrierte Sprachen en/de und die vorhandene Sprachfallback-Regel bleiben; fehlende Übersetzungsfelder oder zu lange Inhalte werden gemeldet statt erfunden oder gekürzt.
- Schutz und Recovery: Alte genehmigte Dokumente und abgeschlossene/fremde Runs bleiben unverändert. Geänderte aktuelle Quellen brauchen eine frische Präsentation. Genehmigte QA-Berichte werden nicht still ergänzt; eine Lücke bleibt mit geschütztem bestehenden Erneuerungsweg sichtbar. Unsichere Ergebnisse werden über den ursprünglichen UUID/Beleg geprüft, alte Nutzerantworten nicht erneut angewandt.
- Prüfung: Die bestehende Berichtsfeld-Matrix bleibt erhalten; neue Kontext-/Platzhalterfälle, tatsächliche QA-/UAT-Vorbereitung, Dokumentlesen, Ablehnung ohne Zustandsänderung, Abweichungen, Historie und alle registrierten Sprachdarstellungen kommen hinzu. Normaler Build, exakte Paketmessung, unterstützte Installation und tatsächlicher finaler CLI/STDIO-Kandidat werden geprüft.
- Risiken und Abgrenzung: Kontextregression, doppelte Parser-/Ergebnislogik, zu strenge Draft-Prüfung und nachträgliche Historienentwertung sind gezielt zu verhindern. Keine automatische Wahrheitserkennung, neue Gates/Klickbedienung, App-Neustart, Git-Aktion oder Veröffentlichung; native Modell-/Plattformnachweise werden nicht behauptet.
- Nächster Schritt: Approval: SD erlaubt den Task-/Testplan. Der Fix ist noch nicht implementiert oder neu installiert.
