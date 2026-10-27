# PRD: Proportionate and effective quality evidence

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-27
Owner: Codex (PRD author; human approval remains with Arndt Gold)
Traceability contract: criteria-chain-v1

## 1. Product Scope

Extend the existing central Quality Contract so delivery agents plan the smallest
sufficient set of effective tests and evidence, reuse valid results, reverify findings
and end redundant checking when obligations are satisfied. Make the contract directly
discoverable through the Context Graph, SoT registry and architecture entry.

SD, TP and existing reviews apply this shared policy within their current responsibilities.
This slice changes policy, phase-specific guidance, templates and explanatory references,
with proportionate verification and normal source-to-package propagation. It does not
introduce a new evidence registry, gate, CI schedule or general runtime enforcement system.
The conflicting routine-pass output instructions are resolved as specified below.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact semantics below, supported by BROWNFIELD_REVIEW.md; no separate UX analysis or preview is required.
- primary_user_intent: Understand the current technical quality result and any necessary action without repeated reports or hidden gaps.
- success_signal: Routine pass is concise; revise/block exposes all four quality dimensions, the decisive reason, source reference and next permitted action. Full evidence remains accessible on request.
- primary_decision_or_action: At an outstanding result, follow the existing corrective route; deliberate human gate decisions remain on the existing bound presentation path.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| test_evidence_planning | Applicable obligations and execution placement are planned; no test result is implied | Scope/risk rationale, existing evidence references, planned checks and gaps | Approved UR/PRD and existing SD/TP owners under quality.md | Existing SD/TP artefact and gate-presentation owners |
| quality_review | Technical result remains pass, revise or block; evidence may be sufficient, incomplete or contradictory | Concise pass or actionable four-dimension revise/block overview; linked full reports | Existing review owners; qa-gate alone owns final technical QA | Existing review output and interaction presentation owners |
| human_gate_decision | Approval remains missing until deliberately recorded for the exact presented material | Existing bound gate presentation and receipt | Existing approval owner and human decision | Existing interaction/presentation owner |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Apply test/evidence policy when a positively activated Run plans, executes or reviews applicable obligations. It does not activate AGDF for ordinary questions.
- blockers_and_visible_next_actions: Missing, stale, inaccessible or conflicting required proof stays an explicit gap under existing normalized routing. No pass or closure may be manufactured from a summary or code edit.
- recovery_paths: Reuse a still-applicable result or perform the smallest needed new check. On a recoverable transient access/execution failure, expose that failure and a bounded retry of the same intended check; preserve failures and distinguish infrastructure faults from product behavior. An unavailable route retains its gap and concrete next action.
- relevant_state_transitions: Planning produces obligations and placement, execution provides scoped results, review assesses applicability and findings, and QA reaches its existing technical decision. A new relevant change invalidates only the evidence it affects. Completed technical verification stops redundant collection but does not skip required reviews or authorize a human gate. Evidence-only deviation acceptance retains the original technical result and gaps.

## 5. Acceptance Criteria

### Shared authority and planning

- criterion_id: AC-001
- requirement: quality.md is the single normative owner of the new shared test/evidence policy. Context Graph, SoT registry and architecture entry identify it directly and explain its consumers and decision boundaries without maintaining a second full policy.
- observable_success: A reader starting at each of the three entry points reaches the authoritative contract without needing UX-specific prior knowledge; existing runtime-module references agree.

- criterion_id: AC-002
- requirement: Before adding tests, evidence documents or repeated executions, assess approved criteria, changed behavior, affected interfaces/dependencies, regression risks and reusable existing coverage. Explain the additional need proportionately in existing planning/review records.
- observable_success: A bounded change selects relevant checks with a scope/risk reason; uncertain impact or uncovered dependencies broadens the selection or remains an explicit gap. File locality alone is insufficient.

- criterion_id: AC-003
- requirement: Distinguish targeted Run checks, mandatory PR/merge CI and applicable full nightly checks, including why each group runs there and when its evidence must exist. Verify actual automated coverage against the existing authoritative inventory; do not assume completeness from a CI label or an undeclared nightly service.
- observable_success: A reviewer can identify full required regression coverage, current results and pending checks. Essential change-specific proof cannot be deferred beyond the decision it supports. Existing complete CI coverage remains in place.

### Reuse and effective verification

- criterion_id: AC-004
- requirement: Assess reuse before new collection. A referenced result is retrievable, identifies its source and tested revision/environment, and has justified applicability to the current claim. One valid result can cover multiple criteria, tasks or reviews through references.
- observable_success: Shared applicable proof is referenced once rather than recopied; relevant changes, expired sources, incompatible environments or contradictions require fresh proof or an explicit gap. An older green build is never relabeled as execution against an untested new revision.

- criterion_id: AC-005
- requirement: Additional files, source/log copies and repeated executions need a concrete added value such as uncovered behavior, changed conditions, reproducibility or required independent review. Identify claim, acceptance/risk/rule basis and decision point using existing records or coherent groups.
- observable_success: A later gate alone causes neither another evidence document nor re-execution. Compact references suffice for bounded work, while broader risks retain sufficient proof. No parallel inventory, per-proof form, fixed file budget or mandatory overhead report is introduced; technical receipts/history remain protected.

- criterion_id: AC-006
- requirement: Expected results derive from approved requirements/domain rules. For defect fixes, where feasible, show that the targeted regression check detects the original defect for the intended reason and passes after correction; critical new rules have an applicable negative case. If original replay is unsafe or impractical, explain the alternative and its limits in the existing record.
- observable_success: Representative cases distinguish genuine defect detection from copied implementation logic, empty assertions or infrastructure failure. No universal mutation-testing or historical-replay obligation is created.

- criterion_id: AC-007
- requirement: A finding is technically resolved only after targeted re-verification of its original failure condition and relevant side effects, or a justified alternative that adequately supports the same closure within the existing owner. A code edit, status change or aggregate green build alone is insufficient.
- observable_success: Resolution references the targeted outcome and applicable side-effect evidence. Missing or insufficient re-verification remains a gap; accepted deviations do not become technical resolution or a pass.

- criterion_id: AC-008
- requirement: Technical verification is complete when required claims and coverage have valid evidence, applicable findings are resolved and contradictions are cleared. Additional checking then needs a concrete trigger: changed conditions, invalidated evidence, an uncovered obligation or a new contradiction.
- observable_success: Unchanged evidence is not recollected merely to reach another gate. A relevant new change reopens only affected obligations. Mandatory reviews, independent assessments where required, human approvals and closeout remain necessary.

### Consumers, output and limits

- criterion_id: AC-009
- requirement: SD sets the proportionate strategy, TP maps executable checks and evidence, reviews assess fulfillment/effectiveness and qa-gate decides technical quality using the same central policy. Phase-specific instructions reference shared rules and preserve existing normalized gap routes and upstream ownership.
- observable_success: Consumers cannot silently waive obligations, redefine acceptance or create a second QA authority. Evidence reuse does not eliminate a required review's own assessment and accountable owner.

- criterion_id: AC-010
- working_mode: quality_review
- source_state: A review or QA result has been produced for the current scoped material; human approval may still be missing.
- trigger_action: The agent communicates that technical result through the existing output owner.
- expected_effective_state: The technical result, review dimensions, open findings and human approval state are unchanged by presentation.
- visible_feedback: Routine pass uses one concise result line per applicable review/QA output and a durable report reference; it does not automatically expand the four-row Quality Readiness projection. At revise/block, show the four dimensions in the existing order, identifying qa-gate as final technical decision owner, and expand only the decisive reason with its evidence reference and next permitted action. Full reports and the derived overview remain available on request.
- blocker_failure_behavior: Missing/conflicting required proof cannot appear as pass; output failure cannot change the technical result or imply approval.
- recovery_next_action: Show the existing gap/recovery action or provide requested evidence detail; preserve normal gate presentations and deliberate decisions separately.
- observable_success: Policy and affected consumers agree on routine pass, revise/block and requested-detail behavior. A concise pass is never presented as delivery acceptance.
- required_evidence: Scoped source/consumer consistency review and representative returned-output or documented scenario checks, with direct-host limits explicitly retained.

- criterion_id: AC-011
- requirement: Preserve existing approval/gate semantics, authoritative CI inventory and coverage, protected technical records and historical approved sources. No CI restructuring, nightly implementation, evidence deletion, retention change or persistence-format change is delivered in this slice.
- observable_success: The actual diff and verification respect these exclusions; no numerical savings, native-host qualification or general machine enforcement is claimed from policy text or repository checks.

- criterion_id: AC-012
- requirement: Verify policy meaning and consumer/source propagation proportionately through existing review/testing paths, including representative valid and invalid plans/evidence/finding scenarios. Documentation of current versus planned behavior remains accurate.
- observable_success: Evidence shows which scenarios were assessed and their expected/observed outcomes. Keyword presence alone does not establish effective policy application; generated/packaged-source parity does not establish native agent compliance. Source propagation retains the existing canonical owners.

## 6. Non-Goals

No new CI schedule, relocated job, relaxed assertion/timeout, reduced regression coverage,
new gate or evidence store, additional standard report, blanket mutation testing,
universal independent reviewer, historical artefact rewrite, evidence deletion,
receipt/retention migration, broad architecture rewrite or new enforcement platform.
No installation, release, publication or native model/session qualification is required
by this policy slice; such work needs its own explicit scope and evidence.

## 7. Users And Roles

- Delivery agents and maintainers plan, implement and assess the required scoped proof.
- SD/TP and review owners retain their existing phase responsibilities; quality.md owns shared policy.
- qa-gate remains the sole final technical QA decision owner.
- Arndt Gold retains deliberate human gate decisions; this proposed PRD does not claim approval.
- Context/registry/architecture are reference and explanation surfaces, not independent policy authorities.

## 8. Constraints

The exact approved UR and its exclusions are binding. Existing mode/depth, recording,
integrity, interaction and approval owners retain their domains. Use current English
canonical artefacts with a complete German decision summary. New policy instructions
must be consistent across relevant consumers and normal generated distribution paths,
with no hand-edited derived files or unrelated runtime fixes.

## 9. Evidence Requirements

Retain a concise source/consumer mapping and representative scenario outcomes in the
existing implementation/test/review records. Scenarios must include valid shared reuse,
invalidated or expired evidence, a partial CI inventory, detected versus ineffective
regression checks, unreverified finding closure, sufficient verification stopping,
reopening after a relevant change, and pass/revise/block/detail-request output.

Use the canonical CI inventory and existing propagation/integrity checks where affected;
select exact commands in SD/TP. Do not run the complete suite merely to author this PRD.
No fresh native session is required for a policy-only claim. If a later claim requires
actual host behavior, either provide its specifically authorized evidence or bound the
claim accordingly. Keep missing proof and non-independent self-review visible.

### Derivation Basis

Primary source: approved UR.md @ sha256:680afdfada2f352cb010db4d0305629c8faa26846e5c5729aa6693b0907c6f0d.
Analytical input: BROWNFIELD_REVIEW.md @ sha256:2ae4db4322f8c6cbfd92a011088d5e6967d2a2cea84365a6f8dad20328279473.
The criteria refine the approved needs for central ownership, risk-based test placement,
reusable sufficient proof, effectiveness, re-verification and stopping; the output
choice resolves the UR's explicit contradiction within its low-impact scope. No new
product, approval or storage authority is introduced. This is a cooperative author
derivation assessment, not an independent semantic review.

## 10. Risks And Open Questions

Savings remain unmeasured. Indirect dependencies can invalidate reuse, CI sources can
expire and replay can be unsafe; applicability and alternatives must stay explicit.
A stop rule must not hide a gap or skip a required assessment. Avoid creating paperwork
to justify paperwork. Concrete consumer placement, source propagation and scenario
execution design remain SD/TP responsibilities, without changing product acceptance.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Central policy scope and authority | before_prd | resolved | Extend existing quality.md and phase consumers; graph/registry/architecture identify and link that owner. No extra gate, registry or runtime enforcement project. | Codex, PRD author; human approval pending |
| Routine technical pass and exception detail | before_prd | resolved | Propose concise pass plus report reference, no automatic four-row expansion; revise/block shows the four dimensions and decisive action; full detail remains available on request. Human gate presentations stay distinct. | Codex, PRD author; human approval pending |
| CI and evidence scope boundary | before_prd | resolved | Preserve full existing CI coverage and technical records. Nightly is an optional planning category; no scheduler or job relocation is part of this slice. | Codex, PRD author; human approval pending |
| Consumer placement and verification design | later_sd | open | SD selects minimal references/consumer changes and existing propagation checks; TP selects exact executable scenarios within these criteria. | Codex, SD author |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

Approval adopts the specified behavior, scope and criteria and permits the existing SD
step. It does not approve implementation, establish test results or authorize release.

## AGDF Approval Summary (de; source=en)

- Ziel: Die kleinste ausreichende Menge wirksamer Tests und Nachweise verwenden; weniger suchen, zuordnen und vergleichen, bei sichtbaren Lücken und unveränderten Freigaben.
- Umfang: quality.md als zentralen Qualitätsvertrag ergänzen; SD/TP/Reviews anwenden lassen und in Context Graph, SoT und Architektur verankern. Run-Tests, CI und optional Nightly unterscheiden; Wiederverwendung, Testwirksamkeit, Befundnachprüfung und Prüfabschluss regeln.
- AC-001: Zentralen Vertragsowner von Graph, Registry und Architektur direkt finden; keine parallelen Regelkopien.
- AC-002: Vor neuen Tests und Nachweisen Änderung, Akzeptanz, Schnittstellen, Risiken und vorhandene Abdeckung bewerten.
- AC-003: Run-/CI-/Nightly-Platzierung und Nachweiszeitpunkt begründen; tatsächliche vollständige Abdeckung prüfen, Pflichtnachweise rechtzeitig erbringen.
- AC-004: Gültige, abrufbare und zum aktuellen Umfang passende Ergebnisse mehrfach referenzieren; Revision, Umgebung und Grenzen erhalten.
- AC-005: Zusätzliche Dateien und Wiederholungen brauchen Mehrwert; bestehende Zuordnungen genügen, technische Belege bleiben geschützt.
- AC-006: Erwartungen aus Anforderungen ableiten; Fehlererkennung vor und Erfolg nach Korrektur möglichst zeigen, kritische Regeln negativ prüfen; begründete Alternativen zulassen.
- AC-007: Befunde gezielt am ursprünglichen Fehler und relevanten Nebenwirkungen nachprüfen; Codeänderung oder grüner Gesamtbuild allein schließen nichts.
- AC-008: Bei ausreichender gültiger Evidenz und geklärten Befunden endet Zusatzprüfung; neue Anlässe öffnen betroffene Pflichten, Reviews und Freigaben bleiben nötig.
- AC-009: SD plant die Strategie, TP konkretisiert, Reviews bewerten, qa-gate entscheidet technisch; gemeinsame Regeln und Befundwege bleiben zentral.
- AC-010: Routinemäßiges pass als kurze Ergebniszeile mit Berichtreferenz; revise/block zeigt vier Dimensionen und entscheidenden Grund samt nächster Aktion. Vollständige Details auf Wunsch; keine Freigabe durch Darstellung.
- AC-011: CI-Abdeckung, Gates, Freigaben und Historie erhalten. Kein Nightly-Aufbau, keine Löschung oder Änderung technischer Belege; keine unbelegten Wirkungs-/Hostaussagen.
- AC-012: Regeln und Quellenweitergabe anhand positiver/negativer Szenarien und bestehender Prüfwege bewerten; Texttreffer und Paketparität beweisen keine Agentenbefolgung.
- Entscheidungen: Zentraler bestehender Owner und begrenzter Policy-Umfang; für Routine-pass eine kurze Zeile statt automatischer Vier-Zeilen-Projektion vorschlagen. Konkrete Consumer-Einbindung und Prüfgestaltung folgen im SD. Menschliche PRD-Freigabe steht aus.
- Risiken: Einsparungen ungemessen; indirekte Abhängigkeiten, ablaufende Quellen und unsichere Wiederholung brauchen sichtbare Grenzen. Keine neue Dokumentationsbürokratie und keine Behauptung universeller technischer Durchsetzung.
- Nächster Schritt: Mit Approval: PRD diese vorgeschlagene Fassung freigeben; danach SD, noch keine Implementierung.
