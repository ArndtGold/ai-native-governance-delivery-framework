# UR: Decision-ready Run and UAT content without placeholders

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-14
Owner: Arndt Gold

## 1. Problem

The user requested the next bounded technical improvement after the installed report-field repair: detect placeholder Run content and present the delivered result and its qualification limits in UAT using existing authoritative artefacts. The observed UAT presentation for report-decision-field-hardening-20261014-01 displayed "Describe the trustworthy outcome." and mostly technical evidence associations. Its Run passed doctor and could be presented and approved. Exact content binding therefore coexisted with a decision brief that did not adequately explain the accepted outcome.

That completed Run is immutable historical reproduction evidence; its approvals remain valid under the then-current contract. This correction must not reinterpret or reopen them. The defect concerns required content readiness and its presentation, not adding another human gate or claiming automatic understanding of report truth.

## 2. Goal

An agent can determine that required Run and UAT decision content is concrete, current and attributable before requesting approval. The user can understand the intended outcome, what was delivered, whether the scoped acceptance is satisfied, material limits or open issues, and the effect of UAT approval. Placeholders and source-association lists alone cannot substitute for that information. Missing required content produces a precise permitted correction route rather than a success-shaped approval request.

## Affected Users

- Coding agents preparing and checking canonical Run content and exact UAT presentations.
- Users deciding whether the scoped delivered outcome can be accepted.
- Maintainers reviewing content provenance, protected approvals and installed behavior.

## 3. Scope

1. Detect template placeholders and absent required outcome content at the existing Run/content-readiness and decision-presentation boundaries. New Run initialization may remain an honest incomplete draft; this must not make intake or permitted authoring impossible. The relevant stage determines what content must already exist.
2. Present a concise, concrete UAT result brief using existing authoritative, current Run artefacts and evidence. It includes intended outcome, delivered result, scoped acceptance/QA disposition, material qualification limits or unresolved issues, and approval effect. Technical source references remain inspectable supporting evidence rather than the only result description.
3. Preserve attribution and exact presentation/document binding. The brief is a derived, non-authorizing projection, not another mutable requirement, acceptance, QA or delivery authority. Do not infer delivery from task status, source titles, arbitrary prose or historical evidence. Preserve accepted QA deviations and unobserved qualification limits explicitly when applicable.
4. Missing, placeholder-only, unusable or stale required inputs prevent a decision-ready presentation and identify the concrete content gap and existing correction owner. Never silently edit an approved source, copy a previous approval, fabricate an outcome or mark missing evidence passed. Do not require a new approval merely to correct an unapproved draft.
5. Keep the normal gate order, existing writers, exact revision/digest checks, inspection and deliberate response semantics. Reading/status inspection must remain non-mutating. Completed/foreign Runs and protected source bytes remain unchanged; previously prepared historical documents are not retroactively rewritten or judged invalid.
6. Verify the implemented correction through affected source/package tests, the supported local installer and the actual installed CLI/STDIO presentation and approval paths on disposable targets. Test concrete positive and missing/placeholder/stale negative cases and refused-operation state preservation. Clearly distinguish installed execution from unobserved fresh native-model or other-platform behavior.

## 4. Non-Goals

- New human gates, approval buttons, click provenance, a general Cockpit/card redesign or a new authoritative UAT/summary store.
- Automatic semantic proof that an authored result is true, independent reviewer/human identity guarantees, or generic natural-language/Markdown interpretation.
- Rewriting approved reports, transferring approvals, reopening completed Runs, repairing all existing repository Runs or a bulk migration.
- Runtime/session replacement, app restart, commit, push, PR, deployment or public release.
- Native model/Windows/Linux qualification unless separately requested; direct exact installed execution is the scoped verification lane.

## 5. Acceptance Signals

- AC-001: A new incomplete Run remains authorable, while stage-required outcome content containing the observed template placeholder, an empty value or equivalent supported placeholders cannot yield a ready decision presentation. A concrete source-derived outcome remains accepted.
- AC-002: A ready UAT presentation and its exact inspectable document explain intended outcome, delivered result, acceptance/QA disposition, material limits/open issues and approval effect. A report-source association list alone is insufficient. Genuine partial delivery or accepted deviations are disclosed accurately and do not become full completion claims.
- AC-003: Every decision-relevant statement is attributable to current authoritative source content/evidence. Stale, unavailable or malformed required inputs produce an explicit gap and permitted correction route. Changed source/control requires a fresh presentation; a previously presented reply cannot authorize changed material.
- AC-004: Refused presentation/approval paths preserve canonical state and receipts. Existing approved-byte, revision, historical-document, completed-Run, QA-deviation and deliberate-response protections remain effective. No approved/foreign Run is rewritten, and missing content is never auto-filled as a delivery claim.
- AC-005: Affected source/package checks pass; normal preparation and supported installation produce one identifiable candidate. The actual installed positive/negative presentation and approval scenarios match the source result, with precise evidence/assurance limits. Changed visible text is checked in all registered languages supported by the affected presentation owner.

## 6. Existing Source Of Truth

- Canonical RUN_STATE.md, registered UR/PRD/SD/TP/QA and writer-owned current implementation/review evidence retain their existing authority. No parallel outcome/acceptance register is introduced.
- packages/core/lib/control-state/run-state-repository.js supplies the observed default Objective placeholder. Existing doctor/gate/content readiness owns required-condition evaluation.
- packages/core/lib/control-state/run-presentation-render.js supplies the current UAT evidence-only summary and immutable document; run-presentation.js and presentation-decision.js own exact bindings and decision-source integrity. Existing interaction/localization owners retain rendered output responsibility.
- The completed report-decision-field-hardening-20261014-01 UAT presentation and final doctor report reproduce this gap. Its implemented report-decision observer, approved reports and completion are protected neighbors.
- gate-decision-card-20261010-01 owns broader native click/card interaction; agdf-actionable-card-ux-20260928-01 owns explanatory next-action presentation; core-mcp-flow-coherence-20261010-01 owns broader Core/MCP flow and source-revision integration. This bounded correction adds required content quality within existing presentation/writer owners, without importing their approvals, implementing native click behavior or creating duplicate lifecycle machinery. Shared source changes must be checked for compatibility during Brownfield/design.

## 7. Risks And Unknowns

Brownfield/PRD must decide the exact existing source fields, stage-specific minimums and compatibility handling for legacy/incomplete Runs. A global placeholder block must not obstruct creation or unrelated valid recovery; closed historical material must remain intact. SD must establish one derivation/readiness owner and exact source binding without adding another mutable summary authority. The field grammar must distinguish supported placeholders from legitimate content and preserve missing/unverifiable result limits.

The current worktree contains earlier completed-scope changes and several unrelated active Runs. This scope is independently requested; preserve them and qualify only this scoped delta. Existing payload ceilings have zero headroom; any necessary change needs exact normal-generator measurement under the approved plan, not discretionary budget growth. A fresh native host/model is not required for direct installed-runtime acceptance and is never inferred from protocol tests.

## 8. Next Step

Review this UR and approve only with Approval: UR. Then perform the existing Brownfield/Mode-Slice and any required UX-intent preparation before the next product/design gate. This draft authorizes no implementation and transfers no prior approval.

## AGDF Approval Summary (de; source=en)

- Problem: Die letzte UAT-Vorlage enthielt „Describe the trustworthy outcome.“ und überwiegend technische Quellenzuordnungen, obwohl die Konsistenzprüfung bestand. Die Fassung war exakt gebunden; ihr konkretes Ergebnis war zu wenig erklärt.
- Ziel: Run- und UAT-Inhalte müssen zur jeweiligen Stufe konkret und aktuell sein. UAT zeigt verständlich Ziel, geliefertes Ergebnis, Abnahme-/QA-Status, wesentliche Grenzen/offene Punkte und die Wirkung der Freigabe.
- Betroffene: Coding-Agenten, die Vorlagen vorbereiten und prüfen; Nutzer, die das gelieferte Ergebnis abnehmen; Maintainer, die Herkunft und Freigabeschutz prüfen.
- Umfang: Platzhalter und fehlende erforderliche Angaben erkennen; Ergebnisdarstellung aus bestehenden autoritativen Artefakten ableiten; Quellen weiterhin prüfbar halten. Unvollständige neue Runs bleiben entwerfbar. Fehlende Inhalte führen zum konkreten bestehenden Korrekturweg, ohne erfundenen Erfolg oder automatische Änderung freigegebener Quellen.
- AC-001: Platzhalter/Leere dürfen keine entscheidungsreife Vorlage erzeugen; gültige konkrete Angaben bleiben nutzbar, und Intake wird nicht blockiert.
- AC-002: UAT erklärt das tatsächliche Ergebnis, Abnahme und Grenzen. Eine Quellenliste genügt nicht; Teilergebnisse und akzeptierte QA-Abweichungen bleiben ausdrücklich sichtbar.
- AC-003: Entscheidungsrelevante Aussagen haben aktuelle Quellen. Fehlende/veraltete/ungültige Pflichtquellen ergeben eine konkrete Lücke. Geänderte Inhalte benötigen eine frische Präsentation.
- AC-004: Ablehnungen verändern keinen kanonischen Zustand oder Beleg. Geschützte Quellen, Revisionen, historische Dokumente, abgeschlossene Runs und bewusste Antworten bleiben gesichert.
- AC-005: Betroffene Tests, normaler Build und unterstützte lokale Installation bestehen. Der tatsächliche installierte Kandidat wird positiv/negativ geprüft; geänderte Darstellungen werden in allen registrierten Sprachen kontrolliert. Native Modell- und Plattformnachweise werden daraus nicht abgeleitet.
- Quellen und Abgrenzung: Bestehende Run-, Artefakt-, QA-, Präsentations- und Writer-Owner bleiben zuständig. Keine neue UAT-Quelle, neue Gates/Klickbedienung, allgemeine UI-Überarbeitung, Alt-Run-Migration, Git-Aktion oder Veröffentlichung. Der abgeschlossene Berichtsfeld-Fix und Nachbarvorhaben bleiben geschützt.
- Risiken und Klärung: Brownfield/PRD bestimmen Mindestfelder je Stufe und Legacy-Verhalten; SD legt eine eindeutige Ableitung und Bindung fest. Strenge Prüfungen dürfen erlaubtes Drafting/Recovery nicht verhindern. Paketwachstum wird exakt gemessen.
- Nächster Schritt: Diese UR mit Approval: UR freigeben. Danach folgen die nötigen Brownfield-/Produkt-/Designentscheidungen; der Fix ist noch nicht implementiert.
