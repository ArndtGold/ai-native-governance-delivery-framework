# SD: One bounded authored report-result observer

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-14
Owner: AGDF Core maintainer
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Replace whole-document result matching with positive recognition of authored result-field blocks in the existing report-decision.js owner. A small, dependency-free, conservative block/context scanner recognizes the bounded AGDF report grammar; it does not claim to implement arbitrary Markdown or infer author intent from prose. Result normalization and conflict handling operate only on fields admitted by that scanner.

The data flow is report text -> admitted authored fields -> normalized unique technical result or null -> existing consumer checks. The reader remains pure and non-authorizing. Existing source, revision, eligibility, approval and transaction checks remain with their current consumers/writers.

## 2. Ownership And Source Of Truth

The approved PRD is the sole acceptance authority. packages/core/lib/control-evaluation/report-decision.js owns both field-context recognition and result interpretation; any small scanner helpers stay in that module. No generic replacement for shared.js, no second Markdown utility, no new dependency or persistent record is added.

Existing QA registration, QA inspection and closeout keep their current import and result-domain behavior. control-state/run-steps.js replaces its separate result regexes in the bound Quick review and non-UX internal-result branches with this shared observer. UX Intent Definition remains with its existing ready/blocked/not_applicable validator; this correction does not reimplement it or widen its result domain. OR's own binding/context/template fields also retain their separate existing validator; closeout's consumption of QA/review technical results uses the hardened observer.

plugins/agdf/meta/contracts/quality.md documents the exact admitted result contexts and excluded containers. Normal generators project that canonical text; no installed cache is edited directly.

## 3. Architecture Decisions

- SDD-001: Positively recognize only authored result-field blocks in the existing Core observer; rationale: deleting a few fenced lines from a whole-document regex would still admit prose or lazy quote continuations; consequence: non-authoritative or unsupported context cannot produce a result.
- SDD-002: Use a conservative, dependency-free report-context scanner with explicit container termination and heading rules; rationale: Core currently has no Markdown dependency and its existing helpers do not identify quotation/code containers; consequence: supported grammar is documented and tested rather than claiming complete Markdown parsing.
- SDD-003: Keep result normalization shared, with a closed internal allowNotApplicable option and unchanged consumer eligibility checks; rationale: internal analysis has a legitimate not_applicable domain that QA does not; consequence: all affected registrars reuse one context interpretation without broadening QA or approval authority.
- SDD-004: Validate both direct reader behavior and actual canonical consumer effects, including unchanged protected sources and refused-operation state; rationale: pure parser cases cannot establish writer or lifecycle correctness; consequence: relevant integrated suites and focused negative fixtures precede installed qualification.
- SDD-005: Build/install through existing supported owners and qualify the exact installed candidate separately from the chat's loaded MCP generation; rationale: an immutable older server can remain loaded after installation; consequence: record installed identity and direct CLI/STDIO evidence, with no native model/platform claim.

### SDD-001 — Authoritative field contexts

Normalize CRLF/bare CR to LF for observation without rewriting source bytes. Admit the existing column-zero scalar syntax, with the existing optional '- ' prefix and case-insensitive Decision/Status names. Inline backticks around one scalar retain compatibility. Indented fields are not authored result declarations.

Initial metadata consists of a scalar-field block at document start, optionally after one column-zero H1 report title and blank lines. Other ordinary scalar metadata such as Gate, Date, Owner and Based on may occur in the same block. Blank lines do not by themselves reopen a closed context. The first prose line, list/example introduction, quoted/code/HTML construct, table, divider or unrelated heading closes this metadata context. Arbitrary later bare fields do not reopen it. An introductory prose paragraph followed by Decision is therefore not result metadata.

An explicit column-zero H2 heading named Decision or QA Decision (case-insensitive, with an optional numeric section prefix such as '1. ') opens a decision-field block. Recognize ordinary optional closing heading hashes while requiring the complete heading name to match; do not match names such as 'Example QA Decision'. The canonical '## 1. QA Decision' is preserved. Only the initial scalar-field block of that section is authoritative. Non-field prose/containers close it. Nested H3/H4 headings, labeled example/evidence sections and later fields in their bodies cannot open result context. A subsequent genuine top-level decision heading can open a new block only outside every active container.

Multiple admitted blocks contribute to the same result set. A reserved decision heading is an explicit authored declaration context, not an intent inference from its prose. No keyword guess about quoted/example text grants authority.

### SDD-002 — Excluded contexts and conservative recovery

Track container state before considering any field or heading. Backtick and tilde fences require at least three markers, obey matching marker kind and sufficient closing length, accept normal zero-to-three-space fence indentation, and do not terminate on a shorter or opposite-kind fence. Unterminated fences suppress every subsequent contained heading/field. Fences nested in indented/list/quote context never authorize fields there.

Indentation, ordinary list content and a blockquote marker close the current authored block. A field-looking lazy continuation remains excluded even when its line lacks a greater-than prefix. Do not reset to metadata after a blank line. Only a genuine column-zero H2 decision heading outside active containers may reenter an authored section; a heading explicitly quoted or indented remains excluded. This deliberately avoids requiring a full generic quote/list parser to authorize a bare field.

HTML example/quotation containers and raw blocks, including blockquote, pre, code, details/div containers and nested wrappers, suppress contained fields and headings. Comments, processing instructions, CDATA/declarations and script/style/textarea raw content are excluded with their explicit termination rules. Container tracking must account for nesting and quoted tag attributes rather than treating an apparent closing tag inside an attribute/comment as a close. A clearly terminated container can be followed by a genuine top-level decision heading; the container itself never reopens an initial metadata block. Unsupported or malformed/unclosed markup cannot be used as a context reset: keep the uncertain remainder excluded. HTML processing is lexical only; never execute or render content.

Keep processing bounded and linear in report text with explicit scanner state; avoid a backtracking whole-document expression or repeated scanning of the entire remainder. A non-result content block may close context without rejecting an already observed genuine result. For example, genuine pass followed by an unclosed illustrative fence remains pass, while a result only inside that fence remains null. Actual conflicting admitted result fields still reject the whole observed result.

### SDD-003 — Result domains and consumer integration

Default readReportDecision(text) retains exactly pass, revise and block. Preserve passed-to-pass normalization, consistent duplicate deduplication, lifecycle Status draft/done as metadata, and null for a missing result or an unknown/empty explicit admitted Decision. Conflicting admitted supported results return null. Ignored examples, quotations and unrelated sections contribute neither values nor conflicts.

Use the closed optional internal argument { allowNotApplicable: true } only for the existing non-UX internal registrar. This additionally recognizes not_applicable in that context; every caller still compares the observed result with its declared input, and existing eligibility, mandatory-result, reason and source-binding predicates remain unchanged. Quick Code Review and all QA/review-closeout consumers use the default domain. Do not add a generic caller-defined result whitelist or broaden any external command schema.

Replace both separate run-steps result regexes: operation-bound Quick review and non-UX internal recording. Keep receipt/source copying, transaction ordering, locks, result-to-status mapping and source-set binding unchanged. Do not use this observer to record approval or generate a QA result.

## 4. Integration Points

- QA report recording: run-artefact-recording.js consumes the shared observed result before accepting the reviewed report binding.
- QA follow-up inspection: qa-follow-up.js uses the same default result and retains normalized finding/source validation.
- Closeout readiness: closeout-readiness.js reads QA/review results with the same default domain and preserves every exact-source, approval, applicability and OR check.
- Internal/Quick review recording: run-steps.js uses the shared result domain appropriate to the existing branch, with unchanged operation and eligibility guards.
- Installation: supported local Codex installer generates and assembles the same Core implementation into the runtime plugin; actual installed entrypoints are exercised on disposable fixture targets.

## 5. Constraints And Compatibility

No change to gate names, exact approval formula, JSON/CLI output schema, state schema, report templates or historical approvals. Preserve bare result fixtures, H1 plus metadata reports, canonical QA section reports and consistent genuine metadata/section duplicates. The previous approved QA_REPORT.md is read-only compatibility evidence and its digest must remain unchanged.

Reports that rely solely on decisions in prose, examples, quoted/code/HTML content or unrelated sections now yield no result, as required by the approved correction. Such a refusal must not be disguised by automatic report rewriting. Correct unapproved input through its existing owner; approved-source changes use their existing revision rules.

This is locally reversible source/package propagation; no public release or shared cutover. Measure generated payload growth under the existing budget and update only an exact justified measured baseline when necessary, without adding arbitrary headroom. Preserve the pre-existing compact-fix workspace changes. Scope growth into general control-field parsing, UX/OR field policy, public schema change or a new trust boundary requires Brownfield re-evaluation.

## 6. Test And Evidence Strategy

Retain all existing reader compatibility/conflict cases, and add positive field-context and negative container/context cases. Include example-only, quote-only and mixed authored/example results; before/after result placement; lazy/nested quotation, lists, indented code, both fence kinds/lengths, unclosed fences, HTML nesting/comments/attributes/raw blocks, malformed markup, heading depths and lookalike names, numeric QA heading and CRLF. Verify default and internal-only not_applicable domains separately.

Exercise actual report recording, Quick/internal report acceptance/refusal, QA inspection and structured closeout. Refused operations must leave canonical Run/receipt/output state unchanged. Preserve existing approved-byte, current-revision and exact-UUID replay coverage. Use source tests followed by normal build/assembly, supported install and exact installed observer and CLI/STDIO scenarios. Fixture authorizations remain explicitly synthetic and never replace live human approvals.

Installed qualification records marker/version/digest, source-to-installed changed-file equality and actual installed operation results. Existing chat tools with an older immutable generation cannot qualify the new build. No native Codex/model or native Windows/Linux claim is inferred from source/package/STDIO results. The exact commands, scenario IDs and evidence locations are TP execution details.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Positive initial metadata and explicit H2 decision-block recognition | Approved PRD; Core report-decision.js owner | SDD-001 | Canonical section-level QA and header fields retained; unrelated prose fails closed |
| AC-002 | Container-first scanner and conservative context reentry | Core report-decision.js owner | SDD-001, SDD-002 | Lazy continuations and nested/malformed containers need boundary tests; no general Markdown claim |
| AC-003 | Existing normalization over admitted fields and immutable canonical/prior-report fixtures | Existing shared observer and canonical QA template | SDD-001, SDD-003 | Genuine aliases/duplicates/CRLF retained; ignored examples cannot create conflict |
| AC-004 | Existing three consumers plus shared result checks in bound Quick/non-UX internal registrar; unchanged transaction/source guards | Existing Core consumer/writer owners | SDD-003, SDD-004 | Internal not_applicable remains closed opt-in; malformed/foreign/stale or protected source guards retain rejection |
| AC-005 | Normal build/install and exact installed candidate qualification | Supported Codex installer and runtime provenance owners | SDD-004, SDD-005 | Loaded old generation is distinct; exact measured payload and native-evidence boundaries retained |

## 8. Risks And Open Questions

The primary implementation risk is container termination or context reentry exposing an illustrative field. The positive grammar and conservative ambiguous-context handling limit that risk, while tests must exercise malformed and nested cases. Legacy legitimate placement beyond the evidenced formats should be inspected before altering acceptance; do not silently guess a new report format. The internal registrar must retain all original eligibility and not_applicable reason restrictions. No material design question remains unresolved; concrete test commands/evidence paths belong to TP.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDD-001 Authored field contexts | before_sd | resolved | Initial scalar metadata or initial scalar block under exact column-zero H2 Decision/QA Decision heading; unrelated contexts do not grant result authority. | AGDF Core maintainer |
| SDD-002 Scanner boundary | before_sd | resolved | Dependency-free conservative report-context scanner in existing observer module; track containers before fields/headings, require clear termination and keep uncertain remainder excluded. | AGDF Core maintainer |
| SDD-003 Consumer result domains | before_sd | resolved | One shared observer, default QA domain unchanged; closed internal not_applicable opt-in for non-UX internal results, unchanged branch eligibility and writer guards. | AGDF Core maintainer |
| SDD-004 Integrated evidence | before_sd | resolved | Reader matrix and actual consumer/writer checks, negative-state immutability and protected-source/replay regressions before installed qualification. | AGDF Core maintainer |
| SDD-005 Installed identity | before_sd | resolved | Existing supported pipeline, exact source/installed identity comparison and fresh installed CLI/STDIO observations; no implicit native-model or other-platform qualification. | AGDF Core maintainer |
| Execution commands and retained evidence | later_tp | deferred | TP will bind tasks/scenarios to these decisions, existing suites, installed probe and Run-local evidence locations. | AGDF Core maintainer |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Lösung: Ein gemeinsamer Core-Leser erkennt nur initiale Ergebnismetadaten und den ersten Feldblock eines ausdrücklich benannten Decision-/QA-Decision-Abschnitts. Er wertet keine beliebigen Markdown-Zeilen mehr als Ergebnis aus.
- Verantwortung: Der bestehende report-decision.js-Owner bleibt zuständig. QA-Registrierung, QA-Prüfung, Abschluss und die notwendige gekoppelte interne beziehungsweise Quick-Review-Registrierung verwenden dieselbe Auswertung; Freigaben und Writer-Prüfungen bleiben bei ihren bestehenden Ownern.
- SDD-001: Gültige Metadaten und der kanonische QA-Decision-Abschnitt bleiben lesbar. Prosa, Beispiele, fremde Abschnitte und verschachtelte Überschriften öffnen keinen Entscheidungskontext.
- SDD-002: Ein begrenzter Scanner schließt Code, eingerückte Inhalte, Listen-/Zitatfortsetzungen und HTML-Container aus. Nur eindeutig geschlossene Container erlauben einen nachfolgenden echten Entscheidungsabschnitt; unklare Inhalte bleiben ausgeschlossen. Keine neue Parser-Abhängigkeit.
- SDD-003: QA behält pass/revise/block, kompatible Varianten und widerspruchsfreie Wiederholungen. not_applicable ist nur für die bestehende interne Analyse explizit zugelassen; deren bisherigen Eignungs- und Begründungsprüfungen bleiben erhalten.
- SDD-004: Neben Parserfällen werden echte Registrierungs-, Prüf- und Abschlussoperationen mit positiven und negativen Fällen geprüft. Abgelehnte Operationen dürfen keinen kanonischen Zustand ändern; genehmigte Berichte bleiben unverändert.
- SDD-005: Normal bauen und installieren, dann den identifizierten installierten Kandidaten direkt prüfen. Eine alte geladene MCP-Generation sowie fehlende native Modell-/Plattformnachweise werden nicht als neuer Erfolg gezählt.
- Entscheidungen: Alle wesentlichen Designentscheidungen sind geklärt. Der TP legt konkrete Aufgaben, Szenarien, Befehle und Nachweispfade fest. Keine neuen Gates, Zustandsquellen, Veröffentlichung oder Git-Aktion; Umsetzung erst nach den erforderlichen Freigaben.
