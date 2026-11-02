# PRD: Authored report fields exclude examples and quotations

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-14
Owner: AGDF Core maintainer
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved report-field hardening as one compatible local Core correction. Only genuine authored report result fields establish a technical result; illustrative or quoted content cannot supply or contradict it. Registration, inspection and closeout must interpret those fields consistently. Preserve existing top-level result metadata and the canonical QA Decision section, without rewriting approved reports or changing decision/approval authority.

The necessary-coupled internal result registrar identified in Brownfield Review is part of validating the same property for report registration. Its existing not_applicable result and eligibility restrictions remain intact. This does not broaden the result domain of QA or closeout.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable; internal report correctness, no new interaction or visible working mode.
- primary_user_intent: Agents and users can rely on authored technical report results rather than illustrative Markdown.
- success_signal: Supported genuine reports retain their result; examples and quotations never establish or alter it; the exact installed candidate exhibits the same behavior.
- primary_decision_or_action: not_applicable; existing technical reviewers and deliberate human gate approvals retain their decisions.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Existing report consumption | Confirmed supported technical result or unconfirmed report | Existing readiness, blocker and completion output | Existing Core consumers and canonical writers; parser observes authored fields only | Existing AGDF renderer; no presentation changes |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing AGDF request activation and bound operations remain unchanged.
- blockers_and_visible_next_actions: A missing, conflicting, empty or unknown authoritative result remains unconfirmed and follows the existing consumer's failure/blocker route.
- recovery_paths: Correct an unapproved report through its existing recording owner and retry against current state. Protected or approved sources require their existing revision route; no automatic repair or approval transfer. Transient writer failures retain existing retry/recovery behavior.
- relevant_state_transitions: This change adds no lifecycle transition. Existing registrations and closeout proceed only when actual authored results and all other source/revision/approval checks satisfy their existing rules.

## 5. Acceptance Criteria

### Authored fields

- criterion_id: AC-001
- requirement: Only an explicitly recognized authored report-field context supplies a result: initial report result metadata or the canonical result/QA Decision section. Arbitrary prose, evidence/example sections, code examples and quotations are non-authoritative.
- observable_success: A report containing only illustrative or quoted Decision/Status text has no confirmed result; genuine authored contexts retain their result.
- required_evidence: Positive canonical-template/top-level fixtures; negative illustrative-context fixtures and field-placement matrix.

### Markdown containers

- criterion_id: AC-002
- requirement: Backtick and tilde fenced code, indented code, block quotations including lazy/nested continuations, and Markdown/HTML example or quotation containers cannot establish or contradict a result. An unclosed illustrative container does not expose subsequent contained fields as authored results.
- observable_success: A genuine pass with an illustrative block/revise/unknown decision retains pass; a genuine revise/block cannot become pass through examples.
- required_evidence: Focused Markdown boundary and mixed-content regression cases; SD names the exact supported context rules and fails closed outside them.

### Compatibility and conflicting actual fields

- criterion_id: AC-003
- requirement: Genuine existing fields preserve documented case variants, optional dash form, inline-backtick scalar values, CRLF, consistent repeated supported values and passed alias. Lifecycle Status draft/done remains metadata. Conflicting authoritative results, unknown/empty explicit authoritative Decision and absence of a supported authoritative result remain unconfirmed.
- observable_success: Existing compatibility cases pass; the canonical QA template and previous approved QA report remain compatible without edits; conflicting or malformed genuine results remain unconfirmed.
- required_evidence: Existing compatibility cases unchanged plus contextual duplicate/conflict cases and immutable prior-report check.

### Consistent consumer enforcement

- criterion_id: AC-004
- requirement: Existing report registration, QA inspection and closeout use one result-context interpretation; necessary-coupled internal registration cannot confirm a result only from examples/quotes. Internal not_applicable and its required reason/eligibility rules retain their current meaning, while QA remains pass/revise/block.
- observable_success: Invalid operations leave canonical state unchanged, and exact approved bytes/revision checks remain effective across existing consumers.
- required_evidence: Integrated positive and negative writer/inspection/closeout cases, state snapshots, protected-source regression checks.

### Installed candidate qualification

- criterion_id: AC-005
- requirement: Supported build, assembly and local Codex installation succeed; the exact installed candidate passes positive authored-field and negative example/quotation cases, including actual registration/closeout checks.
- observable_success: Candidate identity and direct installed CLI/STDIO outcomes are recorded; native model or other-platform qualification is not inferred.
- required_evidence: Build/install results, measured payload baseline, exact installed identity/source comparison and installed operation logs.

## 6. Non-Goals

No new gates, approval formula, human authority, storage schema, public API/CLI flag, Git adapter, runtime updater, public release or VCS action. No rewriting approved historical reports or reopening completed Runs. No independent human or native Codex/model/Windows/Linux qualification claim from fixtures or STDIO alone.

## 7. Users And Roles

Coding agents consume reports; users decide their existing deliberate gates. The AGDF Core maintainer owns the correction. Existing review/QA skills author technical judgments; the shared reader observes those judgments and grants no approval. Local fixture approvals demonstrate machinery only and never authorize a live Run.

## 8. Constraints

Reuse the existing Core owner and consumers; introduce no parallel format authority or report-state store. Keep supported existing templates and formats compatible. Any material compatibility/authority expansion beyond this correction requires reassessment of the Brownfield route. Preserve all pre-existing workspace changes and approved source bytes. Use the supported installation pipeline and existing measured payload budget; qualify the actual installed generation rather than assuming this chat reloads its MCP server.

## 9. Evidence Requirements

Retain the context matrix, parser regressions, integrated refusal/state-immutability checks, relevant existing suites, normal generation/assembly/install results and actual installed candidate observations in this Run. Bind reported pass to the tested candidate and exact scope. The initial observed example-only pass is reproduction evidence, not proof of a complete QA bypass.

## 10. Risks And Open Questions

Markdown containers, lazy quotes and heading/context transitions can expose apparently unprefixed fields. Restricting every field to the header would break the canonical section-level QA Decision. Internal not_applicable differs from the QA result domain and must not be accidentally removed or broadened. Detailed lexical strategy and scenario commands belong to SD and TP; no material product question remains open.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Authoritative authored contexts and compatibility | before_prd | resolved | Keep initial result metadata and canonical result/QA Decision context; exclude examples, quotations and unrelated sections; preserve genuine supported existing fields and immutable historical reports. | AGDF Core maintainer |
| Necessary-coupled internal registration | before_prd | resolved | Apply the same context exclusion to the existing internal result validator while retaining not_applicable and its existing eligibility/reason rules; no additional result authority. | AGDF Core maintainer |
| Acceptance scope | before_prd | resolved | Source/package and exact installed local CLI/STDIO verification are required; fresh native model and other-platform proof remain separately labeled and are not asserted. No release or VCS action. | AGDF Core maintainer |
| Shared Markdown context strategy | later_sd | open | Specify exact recognized fields, headings, containers and ambiguity handling using existing Core ownership. | AGDF Core maintainer |
| Installed scenario execution | later_tp | open | Bind focused regression and integrated installed checks to exact candidate identity and record evidence. | AGDF Core maintainer |

## 11. Next Step

Review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Ziel: Nur echte Berichtsfelder dürfen eine technische Entscheidung begründen. Beispiele und Zitate dürfen weder ein Ergebnis liefern noch ihm widersprechen.
- Umfang: Den bestehenden gemeinsamen Core-Leser und die notwendige gekoppelte interne Berichtsregistrierung härten, gültige Berichtsformate erhalten und den Fix im exakt installierten lokalen Codex-Plugin prüfen.
- AC-001: Nur initiale Ergebnismetadaten und der definierte Ergebnis-/QA-Decision-Abschnitt zählen; beliebiger Text, Beispiele und fremde Abschnitte liefern keine Entscheidung.
- AC-002: Codeblöcke, eingerückter Code, verschachtelte oder fortgesetzte Zitate und Markdown-/HTML-Beispielcontainer dürfen echte Ergebnisse weder erzeugen noch überschreiben; offene Container bleiben ausgeschlossen.
- AC-003: Echte Felder behalten Varianten, konsistente Wiederholungen, passed-Alias und CRLF-Unterstützung. Widersprüche, unbekannte oder leere echte Entscheidungen bleiben unbestätigt. Die vorhandene QA-Vorlage und der frühere genehmigte QA-Bericht bleiben unverändert gültig.
- AC-004: Registrierung, QA-Prüfung und Abschluss verwenden dieselbe Kontextauswertung. Die interne not_applicable-Regel bleibt erhalten; abgelehnte Operationen ändern keinen kanonischen Zustand, bestehende Inhalts- und Revisionsprüfungen bleiben wirksam.
- AC-005: Build, Installation und direkte Prüfungen im identifizierten installierten Plugin müssen bestehen. Native Modell- und andere Plattformnachweise werden daraus nicht abgeleitet.
- Entscheidungen: Produktumfang und Akzeptanz sind geklärt. Keine neuen Gates, Freigabeinstanzen, Veröffentlichung oder Git-Aktion. Parserstrategie folgt im SD; konkrete Tests und installierte Szenarien im TP. Die Implementierung bleibt bis zu den erforderlichen Freigaben gesperrt.
