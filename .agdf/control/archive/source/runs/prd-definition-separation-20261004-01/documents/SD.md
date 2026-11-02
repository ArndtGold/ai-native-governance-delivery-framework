# SD: Dedicated PRD authoring through existing control boundaries

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-04
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Introduce prd-definition as a judgement-required semantic authoring skill, using the existing canonical catalog and generated host profiles. A focused runtime contract owns product derivation, clarification and the PRD result format. A small pure Core routing function identifies a permitted PRD authoring continuation; the shared dispatcher supplies the binding and focused contract. Neither component records or approves artifacts.

Keep the existing gate-artifact-preparation contract as the shared registration procedure and as the current SD/TP preparation owner. Move its PRD-specific drafting instructions into the focused PRD contract. Gate-check delegates PRD content, while Core gate evaluation retains readiness and presentation eligibility. Keep the PRD gate's control route on gate-check; distinguish it from the dedicated authoring continuation.

Reuse run-step --step artefact --gate PRD for both first registration and an explicitly requested draft replacement. Retain its reviewed source mapping, approved-source proof, revision lock, aggregate seal and update_draft reconstruction. After registration, redispatch gate-check, prepare run-present when permitted and wait for a new deliberate response. This design creates no second writer or persistent state.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner | Change |
|---|---|---|
| Canonical skill identity and host aliases | plugins/agdf/meta/agdf-plugin.definition.json and existing generators | Add prd-definition and its focused runtime module; derive all projections |
| Semantic product authoring | plugins/agdf/skills/prd-definition/SKILL.md, help.md and meta/contracts/prd-definition.md | New bounded instructions; product acceptance remains in each run's approved PRD |
| Eligibility and bound authoring continuation | packages/core/lib/skill-dispatch/prd-definition.js, integrated by service.js | Pure read/routing function consuming existing canonical evaluation |
| Gate prerequisite/readiness policy | packages/core/lib/control-evaluation/gate-check.js, prd-readiness.js and existing UX/criteria policy | Preserve authority; preparation operation names the dedicated PRD author |
| Shared CLI/MCP argument contract | packages/core/lib/skill-dispatch/contract.js and existing CLI adapters | One typed revision-intent argument with identical validation |
| Registration, source relation and draft replacement | packages/core/lib/control-state/run-artefact-recording.js, artefact-binding-proof.js and run-step transaction | Reuse unchanged canonical writer and proof format |
| Human presentation and approval | run-presentation-render.js, run-present and run-approve | Existing localized completeness, digest/revision and deliberate-reply checks |
| SD/TP drafting and QA/reviews | Existing gate-artifact-preparation and judgement skills | No ownership transfer in this slice |

All module paths describe planned source changes, not an installed or already implemented new skill. Existing Core/CLI/MCP package boundaries remain intact.

## 3. Architecture Decisions

- SDD-001: Add one canonical prd-definition skill and focused semantic runtime contract; rationale: product drafting and clarification require an explicit owner while catalog/generators remain the common distribution authority; consequence: one new catalog entry with measured generated cost, no duplicate per-host authoring procedure.
- SDD-002: Implement a pure PRD eligibility/continuation function in the existing Core skill-dispatch boundary and call it before generic judgement fallback; rationale: the author must receive one validated target/run/revision/path/source snapshot and must not escape through generic judgement dispatch when the current gate forbids authoring; consequence: new and direct PRD entry paths share one routing guard, while existing gate policy remains authoritative.
- SDD-003: Put semantic derivation, material clarification, stable criterion IDs, product decisions and the low-impact PRD interaction in the focused contract; rationale: agent judgement creates product content, while structural readiness cannot prove semantic adequacy; consequence: complete and incomplete inputs need actual cooperative behavior evidence, and applicable UX analysis remains required input rather than a second product source.
- SDD-004: Add prd_action revise, exposed as --prd-action revise, only on gate-check revision-bound resume intake; rationale: routine continuation of a ready PRD must present it, whereas an explicitly requested registered-draft edit needs a machine-visible intent and current assignment revision; consequence: shared schema/parser validation grows narrowly and rejects missing fields, other values, incompatible skill/intake combinations and simultaneous UR/PRD revision intents.
- SDD-005: Reuse typed run-step artifact registration and update_draft replacement, retaining all historical proof files; rationale: the existing writer already verifies contained paths, exact approved sources, current revision and unchanged protected content under locks; consequence: the author creates a new reviewed mapping/recording input for each accepted draft revision and never hand-edits a receipt or substitutes run-update for a required source-binding replacement.
- SDD-006: Keep readiness, localized approval completeness, run-present and run-approve with their existing owners; rationale: a finished draft is not approval and a localized summary must cover the actual product decision; consequence: material questions, invalid source/UX evidence, changed drafts or missing criterion summaries suppress presentation, and only a fresh deliberate Approval: PRD permits SD.
- SDD-007: Extend the existing shared contract/projection/package qualification and measure exact catalog/instruction/payload costs without changing limits; rationale: new public skill identity and continuation behavior must stay coherent across consumers; consequence: targeted new cases coexist with unchanged existing guards, and source/package parity does not become a native-host claim.
- SDD-008: Preserve downstream routes, foreign state and evidence-lane distinctions, and reconcile existing context ownership after verified implementation; rationale: the approved slice is independent of later SD/TP/execution/UAT reorganizations; consequence: no installation, migration or VCS action is implied, and closeout must resolve the planned existing Context Graph/source-registry update.

## 4. Integration Points

### Bound authoring continuation

The pure prd-definition routing function consumes canonical gate evaluation and normalized request arguments. It admits only the selected run at the PRD stage, with exact approved UR, completed Brownfield/Mode-Slice prerequisites, required ready UX input and no unrelated doctor or integrity blocker. It may admit the existing AGDF_PRD_DECISIONS_OPEN readiness state solely to finish permitted PRD clarification; this does not suppress that readiness blocker or permit approval. Invalid source proofs, seals, paths or approved destinations remain non-authoring states.

Emit phase prd_definition and skill_id prd-definition with governance_target, run_id, revision_id, presentation_language, canonical artifact_path, exact approved source references and draft_registered. Include only the focused runtime contracts needed for semantic work and existing recording. The contract supplies the PRD structure; a missing project-local template is not repaired through a new template store or invented runtime. Use contained source reads and canonical writer checks, not raw path substitution.

Dispatch ordering:

1. Preserve existing request/target/runtime validation and run assignment.
2. For an unbound direct prd-definition invocation, use the existing candidate inventory and resolve_delivery_run flow, ignoring AGDF_RUN_ID as a selector. Match the original request against candidate UR scope before a revision-bound resume. Do not create a replacement run or fabricate a UR to make PRD prerequisites pass.
3. After canonical evaluation, evaluate PRD authoring eligibility before generic judgement fallback. Missing permitted PRD artifacts route to the new author from the existing prepare_gate_artifact operation; incomplete product decisions route to clarification under the same bounded owner.
4. A registered ready PRD under ordinary gate-check continuation goes to presentation. prd_action revise on a valid resume routes an explicit draft edit. Direct prd-definition invocation can expose the bound unapproved authoring assignment, but the focused skill must require an actual human drafting/revision request before changing an existing ready draft.
5. A declined PRD revision or direct invocation at UR, approved PRD/SD or any other forbidden stage returns canonical control output. It never falls through to a generic writer-capable judgement continuation.

Routing uses structured gate/status/operation/readiness facts, not English next_allowed_action sentences. Preserve the separate existing implementation-route behavior; changing that route is outside scope.

### Shared revision intent

Add the optional prd_action field and CLI option to the single shared contract. Allowed value is revise. Require gate-check, intake true, intake_mode resume, run_id and expected_revision_id. Reject simultaneous ur_action and prd_action and any revise value on continue_delivery. expected_revision_id keeps its current assignment meaning; do not add it to judgement or ordinary continuation calls.

Propagate the field through normalizeSkillDispatchInput/validate arguments, CLI parser/validation adapter and the existing generated function schema. No new MCP endpoint, approval field or tool-local validation table is introduced. Before editing, stale assignment returns the existing inventory flow for fresh scope/revision matching.

### Semantic PRD contract

Read the original request, confirmed answers, approved UR, Brownfield Review and applicable UX input. Populate the existing PRD sections and retain criteria-chain-v1. Separate supported product requirements from assumptions; propose no unsupported users/scope/acceptance promise. Keep stable unique criteria, explicit before_prd decisions, accountable owner and only genuine owner-bound later_sd/later_tp deferrals.

A material product gap preserves a useful draft with an open Approval Decisions row and emits one bundled question. Readiness remains false. An actual answer may complete the draft within approved intent; material conflict with UR routes to existing UR revision. A product change after PRD approval uses existing canonical revision routes, never this unapproved-draft writer. Complete inputs do not repeat answered questions. Merely loading/selecting a skill is not revision intent.

### Registration and returned control

Create the PRD and a new exact reviewed mapping/recording input under the supplied run artifact directory. Use PRD derived_from UR through the existing writer, current revision and new proof path. Applicable Brownfield/UX references remain semantic inputs; they do not replace the approved UR relationship. Initial draft uses update_draft false; explicit registered replacement uses true and the previous binding's exact aggregate reconstruction. Keep old proof files and history intact.

An open-decision draft can be recorded through the existing writer's gate policy; the fresh full gate evaluator subsequently blocks presentation on readiness. A valid source-binding replacement preserves all other bound/approved bytes. Never bypass a seal failure by resealing unknown edits. Recording interruption or transient failure follows existing transactional recovery and a supported visible retry; retry re-evaluates current canonical state instead of replaying an assumed revision.

After recording, use the returned revision and redispatch gate-check. Before requesting human approval, run-present must prepare the exact current presentation. If artifact language differs from presentation language, the existing summary contract applies: user goal and scope, every PRD criterion ID once, decision context, one locale block and unchanged size limits. Invalid editorial summaries require an explicit canonical draft replacement and a fresh presentation; do not suppress the guard or reuse an old reply.

### Contract and source cleanup

Move only PRD semantic instructions out of gate-artifact-preparation. Retain its shared registration contract and SD/TP sections; reference the shared procedure from the PRD contract rather than duplicating it. gate-check instructions delegate named PRD continuations. Catalog runtime modules and installed help/instruction-only references must match the existing integrity/conformance conventions. The pure routing helper does not become another gate policy or product completeness parser.

## 5. Constraints And Compatibility

- Existing gates, approval formulas, source proofs, persistence schema, run-step transaction and approval receipt format remain unchanged. No run migration or approval transfer.
- Old calls without prd_action retain existing behavior except the intended semantic-authoring responsibility. Existing skill aliases resolve from the expanded canonical catalog; exact fixed catalog counts become catalog equality where necessary.
- UR authoring and ur_action retain their existing semantics. SD/TP prepare_gate_artifact operations remain gate-check-owned. CR, QA, UAT, OR and implementation routes retain their current behavior.
- Older installed runtimes cannot invoke the new catalog skill or accept the new optional argument. They retain their current behavior; no host-cache patch or guessed runtime fallback. This scope qualifies generated/package consumers and does not install or claim fresh native host adoption.
- Reuse existing builders and profile boundaries, including Copilot runtime-clean exclusions. Measure actual files/bytes and instruction footprint before an exact observed baseline adjustment. No threshold increases or spare headroom.
- Existing repository/run state outside this slice is protected. All candidate and preservation observations must be bound to the source identity actually tested.

## 6. Test And Evidence Strategy

TP must map every criterion and decision to tasks and executable scenarios. Required coverage includes normalized shared input and negative arguments; direct/unbound assignment without environment selection; permitted new authoring; complete versus material-gap behavior; explicit ready-draft revision; ordinary ready-draft presentation; invalid/stale/foreign/approved bindings; approved-UR conflict; exact typed registration and replay/interruption behavior; localized presentation completeness; and preservation of all unchanged downstream routes.

Use existing unit/CLI/MCP/package consumers to verify the actual built path, not injected test-only copies. Qualify the canonical catalog, generated four-host projections, help/runtime-module integrity, aliases, request activation, source relationship, budgets and affected runtime performance. Record exact measured inventory and compare existing evaluation behavior without weakening guards.

Semantic authoring evidence needs actual inputs/context, produced drafts/questions, known unknowns, author/reviewer identity, current skill/contract digest and real canonical bindings. Include complete, incomplete, revision and approved-intent-conflict observations. Root cooperative observations are identified as cooperative; no independent review or fresh installed four-host proof is implied. Routine deterministic checks cannot be described as model compliance. Preserve failed attempts and superseding results.

The current SD is validated by canonical traceability, source binding and fresh gate evaluation only; it does not claim implementation tests have run. No mock or UI prototype is needed for the defined low-impact existing workflow. Applicable visible-result claims still require actual rendered summaries/questions, not code existence alone.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Register one semantic skill, move PRD drafting into its focused contract and route bound authoring before generic fallback | Canonical catalog/contract and Core dispatch owner; maintainers accountable to Arndt Gold | SDD-001, SDD-002 | Duplicate instructions or generic fallback could preserve two authors; remove semantic duplication and exercise actual dispatch |
| AC-002 | Existing structure and exact approved inputs govern the generated draft, stable criteria and reviewed source relationship | Focused semantic contract; approved UR/PRD; existing run-artefact-recording owner | SDD-003, SDD-005 | Syntactic proof cannot establish meaning; actual cooperative drafting and semantic review supplement typed proofs |
| AC-003 | Preserve useful draft with open decisions, one material question, remembered answers and blocked presentation | Focused contract and existing prd-readiness/UX/gate policy owners | SDD-003, SDD-006 | Invented answers or unnecessary questions; complete/incomplete observations and fresh readiness evidence |
| AC-004 | Explicit revision flag on bound resume, protected approved destinations, typed update_draft replacement and fresh presentation | Shared argument contract; canonical artifact/revision and presentation writers | SDD-004, SDD-005, SDD-006 | Stale intent/reply or unknown modified bytes; reject conflicting inputs and exercise exact writer/seal behavior |
| AC-005 | One pure eligibility boundary for new/direct calls, assignment first and no generic writer fallthrough | Core prd-definition routing, existing target/assignment/gate evaluation and contained-file owners | SDD-002, SDD-004, SDD-005 | Wrong target/run or approved-stage authoring; negative cases must preserve bytes and authority |
| AC-006 | Fresh canonical readiness and locale-complete run-present precede deliberate Approval: PRD | Existing gate-check, PRD/UX/criteria readiness, run-present and run-approve owners | SDD-006 | Invalid summaries or completion mistaken for approval; actual rendered bound presentation and negative freshness checks |
| AC-007 | Derive aliases/contracts/projections, verify built consumers and measure exact inventory without new limits | Shared contract/catalog and existing generators, profile/integrity and budget owners | SDD-001, SDD-004, SDD-007 | New identifier/argument compatibility and payload drift; qualify generated/package evidence and retain native boundary |
| AC-008 | Preserve later authoring/control semantics and foreign state; curate existing context only after verified implementation | Existing gate/recording/quality contracts; Context Graph and SOT Registry | SDD-007, SDD-008 | Regression, parallel authority or false host claims; unchanged guards, preservation evidence and explicit lane reconciliation |

## 8. Risks And Open Questions

All product decisions are taken from the approved PRD. No unresolved design decision blocks TP. Actual code touchpoints and test commands must be rechecked during approved-TP Brownfield Analysis; any new material authority/compatibility requirement returns to its earliest affected approved artifact rather than widening scope silently.

Open implementation risks: incorrect ordering before generic fallback; missed source/UX/integrity blocker; draft edit confused with status; accidental writer/proof duplication; incomplete localized summary; catalog or instruction growth; cooperative observations overclaimed as independent/native evidence. Owners and mitigations are assigned in the decision and traceability rows. There is no knowingly accepted debt or indefinite fallback.

Context impact: update the existing CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY node and existing SOT_REGISTRY after verified ownership implementation, not a parallel memory store. Reconciliation remains an explicitly planned open_gap until that evidence is curated; it prevents clean closeout, not task planning. No Codex memory update is requested or performed.

## 9. Next Step

Prepare the exact SD presentation and obtain a new deliberate Approval: SD. Then prepare TP with mappings for all eight criteria and decisions. Implementation remains forbidden before Approval: TP and the existing implementation-preparation prerequisites.

## AGDF Approval Summary (de; source=en)

- Lösung: prd-definition übernimmt die fachliche PRD-Erstellung über einen fokussierten Vertrag. Eine kleine lesende Core-Routingfunktion bindet zulässige Aufträge. gate-check behält Bereitschaft und Freigabesteuerung; der bestehende Writer registriert, der Mensch entscheidet.
- SDD-001: Ein kanonischer Skill mit fokussiertem Fachvertrag und vorhandenen Hostgeneratoren. Keine kopierten hostabhängigen Erstellungswege; der zusätzliche Katalogeintrag wird genau vermessen.
- SDD-002: Eine reine Routingfunktion prüft die bestehenden Gate-, Quellen-, Run- und Revisionsvoraussetzungen vor dem generischen Skillpfad. Direkte ungebundene Aufrufe verwenden die vorhandene Run-Zuordnung ohne AGDF_RUN_ID. Unzulässige oder freigegebene Zustände fallen niemals in einen generischen Schreibauftrag durch.
- SDD-003: Der Fachvertrag übernimmt Ableitung, stabile Kriterien, Produktentscheidungen und gebündelte wesentliche Fragen. Ein sinnvoller Entwurf bleibt bei offenen Fragen erhalten und nicht freigabereif. Bestehende Antworten und erforderliche UX-Eingaben bleiben maßgeblich; semantische Qualität braucht tatsächliche Beobachtungen.
- SDD-004: prd_action revise beziehungsweise --prd-action revise kennzeichnet eine ausdrücklich gewünschte Entwurfsänderung ausschließlich bei gate-check mit revisionsgebundenem Resume-Intake. Falsche Werte, fehlende Bindungen, kombinierte UR-/PRD-Revisionsabsichten und unzulässige Fortsetzungen werden abgewiesen. Gewöhnliche Fortsetzung eines fertigen PRD führt weiterhin zur Präsentation.
- SDD-005: Neue und überarbeitete Entwürfe verwenden die bestehende typisierte Artefakterfassung. Jeder Ersatz erhält neue Mapping-/Eingabedateien; update_draft prüft die vorige Quellenbindung und den Erhalt aller anderen geschützten Inhalte. Historische Nachweise bleiben erhalten. Keine zweite Persistenz, keine handgeschriebenen Receipts oder Umgehung ungültiger Siegel.
- SDD-006: Bestehende PRD-/UX-/Kriterienbereitschaft, lokalisierte Vollständigkeit, run-present und run-approve bleiben zuständig. Die deutsche PRD-Zusammenfassung enthält Ziel, Umfang, alle Kriterien-IDs einzeln und Entscheidungen. Geänderte Entwürfe brauchen eine neue Präsentation und bewusste Approval: PRD; erst danach folgt SD.
- SDD-007: Gemeinsames Schema, CLI-/MCP-Konsumenten, vier generierte Hostprojektionen, Paketintegrität, Kataloggleichheit und Budgets werden über vorhandene Prozesse qualifiziert. Genaue gemessene Änderungen ersetzen keine Grenzen durch Polster. Quell-/Paketerfolg behauptet keine frische native Hostnutzung.
- SDD-008: Spätere Gates, UR, SD-/TP-Erstellung, Umsetzung, Reviews, QA, UAT und Abschluss bleiben unverändert. Fremde Zustände und Freigaben bleiben geschützt. Nach verifizierter Umsetzung werden der vorhandene Context-Graph-Knoten und die Quellenregistrierung aktualisiert; keine parallele Wissensablage oder automatisch ausgelöste Installation, Migration oder Git-/Release-Aktion.
- Ablauf: Zulässiger Auftrag führt zu prd_definition mit Ziel, Run, Revision, PRD-Pfad, Quellen, Sprache und Entwurfsstatus. Fachliche Erstellung oder Klärung folgt; typisierte Registrierung und frisches gate-check bestimmen den nächsten Schritt. Bei fehlenden materiellen Produktentscheidungen bleibt die Präsentation gesperrt. Direkter Aufruf allein ersetzt keine bewusste Überarbeitungsabsicht.
- Nachweise: TP ordnet alle acht PRD-Kriterien und acht Designentscheidungen Aufgaben, Szenarien und konkreten Nachweisen zu. Erforderlich sind tatsächliche Quellen-/Revisions-/Freigabeflüsse, negative Bindungsfälle, gerenderte Präsentationen sowie konkrete vollständige, unvollständige, überarbeitete und konfliktbehaftete Fachfälle. Autor, Reviewer, Vertragsidentität und Evidenzart werden benannt; kooperative Beobachtung ist keine unabhängige oder native Qualifikation.
- Risiken und Grenzen: Routingreihenfolge, Quellen-/UX-Blocker, Revisionsabsicht, gemeinsame Registrierung, Zusammenfassungen und Payloadkosten gezielt prüfen. Kein neuer Mock für den unveränderten Ablauf und keine neue Fach- oder Freigabequelle. Für TP bleibt keine materielle Designfrage offen; neue wesentliche Erkenntnisse führen zur zuständigen vorgelagerten Revision.
- Entscheidung: Approval: SD bestätigt dieses Lösungsdesign und erlaubt den Aufgaben-/Testplan. Implementierung bleibt bis zur bestehenden TP-Freigabe und ihren Voraussetzungen gesperrt.
