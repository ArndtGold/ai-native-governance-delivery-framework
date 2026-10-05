# SD: Dedicated Solution Design authoring

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD
Date: 2026-10-04
Owner: Arndt Gold
Run: sd-definition-separation-20261004-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Introduce the canonical judgement skill `sd-definition` for semantic design drafting,
clarification and explicitly requested revision of an unapproved design. Follow the existing
UR/PRD separation: gate-check evaluates control; Core dispatch routes evaluated work; the
focused authoring contract defines reasoning and clarification; the existing artifact writer
records the design and its approved-source relationship. Human Approval: SD remains separate.

The author receives a `sd_definition` continuation containing the exact governance target,
run, current revision, canonical SD path and checked approved/analytical sources. It produces
one SD, including reasoned design decisions and criteria mappings, records it, and returns to
fresh gate-check. No new execution engine, artifact store, writer or approval lane is introduced.

The approved PRD is the product authority. Applicable Brownfield/UX analyses inform the design
but cannot supersede approved acceptance. The design author explains architecture, ownership,
flows, reuse and trade-offs at proportionate depth; structural validation cannot certify the
semantic adequacy of those explanations.

### Proposed flow

1. Positive request activation and existing target/run assignment precede evaluated eligibility.
2. An eligible SD authoring intent yields `sd_definition` and its focused contracts.
3. Missing material design facts yield bundled clarification and a retained draft. Declared
   unresolved decisions keep SD readiness closed; a material product conflict returns to its
   existing UR/PRD authority instead of generating a ready design.
4. The author records SD-derived_from-PRD with the shared typed input and receives a new revision.
5. Fresh gate-check evaluates decisions, criteria chain and existing integrity prerequisites.
6. A ready design gets the existing bound presentation and a new deliberate Approval: SD.
7. Valid approval opens the existing TP stage. SD authoring creates no TP or implementation.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner and surface | Design boundary |
|---|---|---|
| Approved product intent and acceptance | Selected run's approved PRD.md and existing product owner | The sole acceptance source; never copied into another acceptance register. |
| Skill identity, discovery, host names, contract module registration | plugins/agdf/meta/agdf-plugin.definition.json and existing central name registry | Add sd-definition and its focused modules once; generated host names remain derived. |
| Semantic design and clarification | plugins/agdf/skills/sd-definition/SKILL.md and meta/contracts/sd-definition.md | New focused instructions, with the existing activation guard and bound-dispatch requirements. |
| Gate prerequisites and readiness | packages/core/lib/control-evaluation/gate-check.js, existing traceability-readiness.js and proposed sd-readiness.js | Evaluation only; no competing design-authoring instructions. |
| Authoring assignment | packages/core/lib/skill-dispatch/service.js and proposed sd-definition.js | Pure phase selection plus contained source facts; no writer or approval. |
| Public dispatch arguments and CLI/MCP normalization | packages/core/lib/skill-dispatch/contract.js and existing CLI adapters | One shared contract; adapters transport the same meaning. |
| Canonical SD, decision state and traceability | Selected run's SD.md, existing SD template and criteria-chain-v1 | Decisions live in the same design, not a new control or decision store. |
| Artifact recording and source proof | Existing run-artefact-recording.js, relationship registry, seals and run-step transaction | Reuse SD-derived_from-PRD, draft replacement and history; no cloned writer. |
| Approval readiness, presentation and decision | Existing gate evaluation, run-presentation.js, approval writer and Arndt Gold | Fresh evaluation and exact human reply; authoring and dispatch do not approve. |
| Derived distribution and host surfaces | scripts/sync-package-assets.js, existing Core/plugin projection and package builders | Regenerate from canonical sources; never maintain independent skill copies. |
| Review and evidence | Existing TP, Code Review and QA owners | Assess real behavior and derivation; this SD is a proposal, not delivered capability evidence. |

The existing gate route may continue to name gate-check for SD readiness. The authoring
continuation and preparation assignment name sd-definition; gate ownership and content ownership
are different responsibilities. The shared recording module remains available to the author.

## 3. Architecture Decisions

- SDD-001: Register sd-definition with one focused semantic contract and the shared gate-artifact-preparation recording contract; remove SD semantic drafting from gate-check/shared procedural guidance while retaining readiness and recording references; rationale: mirror the established UR/PRD ownership seam without another control authority; consequence: catalog, skill, router and generated descriptions must change together within existing budgets.
- SDD-002: Add a pure sdDefinitionPhase over evaluated state plus a contained exact-source reader in the dispatch service, returning phase sd_definition before generic artifact preparation; rationale: source validation, eligibility and semantic content have distinct owners; consequence: invalid sources or unrelated blockers retain fail-closed control and cannot fall through to authoring.
- SDD-003: Add mutually exclusive sd_action revise and CLI --sd-action revise to the existing revision-bound gate-check resume-intake contract; rationale: a ready registered draft needs explicit editing intent and the current assignment, rather than silent rewrite on continuation; consequence: shared schemas, normalization, help, CLI transport and protocol tests require additive compatibility updates.
- SDD-004: Use an opt-in Design Decisions contract: sd-decisions-v1 marker and one Design Decisions table in SD.md, evaluated by Core SD readiness; rationale: declared unanswered design decisions need a deterministic presentation/approval blocker without retroactively migrating existing designs; consequence: all new sd-definition outputs must declare the marker, legacy designs without marker/table retain existing behavior, and validation proves declared decision state rather than undisclosed semantic completeness.
- SDD-005: Reuse criteria-chain-v1 and the existing SD-derived_from-PRD typed writer, receipts, update_draft replacement, revision checks and fresh presentation; rationale: design ownership changes must not duplicate acceptance, source proof, persistence or approval; consequence: actual derivation and review are still required beyond the cooperative mapping attestation.
- SDD-006: Record product conflicts as unresolved current design decisions and return to the earliest affected existing UR/PRD revision authority; rationale: technical clarification cannot change approved product intent; consequence: SD approval stays unavailable until the conflict is resolved at its proper source, and unsupported current revision transitions require explicit existing recovery rather than manual source edits.
- SDD-007: Extend canonical contracts and supported generated host projections through existing generators, preserving all instruction, payload, runtime-integrity and performance limits; rationale: CLI/MCP and host consumers must receive the same identity and boundaries from one source; consequence: legitimate content must fit existing limits, and failure requires content/scope refinement rather than relaxed assertions.
- SDD-008: Bind delivery evidence to the actual candidate and distinguish deterministic source/package/protocol checks, semantic derivation review and fresh native-host/model observation; rationale: a registered skill or complete template does not establish live model behavior or human review; consequence: TP/QA must retain actual inputs, outcomes and limitations, without automatic installation or external actions.

## 4. Integration Points

### Catalog and focused semantic contract

Add sd-definition as judgement_required with requiresControlSnapshot true. Its focused modules
are sd-definition and gate-artifact-preparation; register the new module in the existing runtime
contract manifest/catalog mechanism. Use the existing skill activation guard, exact target-source
rules, terminal-response discipline and supplied runtime binding. The skill must not select a run
from cwd, AGDF_RUN_ID, recency or discovery. Its authoring contract requires reading the exact
approved PRD, resolved product decisions, completed Brownfield routing and required ready analyses.

The contract owns semantic architecture drafting and focused questions. It requires explicit
design choices with rationale/consequences, accountable sources and one mapping per PRD criterion.
It preserves confirmed answers, non-goals and product authority. New output always declares both
criteria-chain-v1 and sd-decisions-v1. Ordinary status/discovery is not editing intent. A direct
skill invocation also requires actual human drafting/revision intent; mere loading/selection is
insufficient. A ready draft cannot be overwritten because a skill became visible.

### Evaluated routing and exact source facts

Eligibility requires the selected run/revision, current SD gate, structured route, approved and
durable PRD, completed Brownfield Review and existing valid control/source integrity. There must
be no approved SD. A registered draft must point to the canonical run-local SD.md. Evaluate
eligibility before reading source facts so unrelated blockers keep their original diagnosis.

Read the exact PRD and applicable recorded Brownfield/required ready UX inputs using existing
contained non-symlink resolution and canonical digest helpers. Return their type, path and digest
with governance_target, run_id, revision_id, presentation_language, artifact_path,
source_artifacts, sources and draft_registered. Missing/invalid sources produce a dedicated
localized recovery; they never enable generic content creation.

Select the author for a missing eligible SD, a permitted declared clarification/traceability
repair, or explicit draft revision. For a registered ready draft, ordinary intake/continuation
prepares its existing presentation. The phase may permit only the specific
AGDF_SD_DECISIONS_OPEN and AGDF_SD_TRACEABILITY_INCOMPLETE content-repair blockers after all
other prerequisites/integrity checks pass. These exceptions do not declare readiness or remove
the blocker. Direct invocation without a selected run uses the existing delivery-run assignment
inventory, then revision-bound gate-check resume; wrong or stale assignments never choose another
run silently. An ineligible direct author invocation returns current control, not a generic
judgement writer. An ineligible explicit revision cannot fall through to another stage.

Keep the preparation operation's content skill_id consistent with sd-definition. Keep the
SD readiness gate route under gate-check. Remove the generic SD authoring continuation after
the focused phase exists; TP preparation and implementation routing remain unchanged.

### Public revision contract

Add sd_action with only value revise to the shared dispatch input and --sd-action revise to the
existing CLI parser/transport/help/binding argument description. It requires gate-check,
intake true, intake_mode resume, run_id and expected_revision_id, and excludes ur_action,
prd_action and continue_delivery. Schema and runtime validation enforce the same combinations.
Existing inputs retain their semantics. A stale expected revision returns the existing fresh
assignment inventory before authoring; it never transfers editing intent to another run.

The focused direct-author route returns the current revision and still requires actual editing
intent in its semantic contract. The explicit canonical replacement is the revision-bound
gate-check resume route. Loading the author is never a substitute for either intent or binding.

### Declared design decision readiness

The canonical new SD template and author contract include the marker above and exactly one
section headed Design Decisions containing this table schema:

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDQ-001: example technical choice | before_sd | resolved | Concrete choice and confirmed basis | Accountable design owner |

Decision identities must be nonempty and unique. Timing is before_sd or later_tp. Status is
resolved, open or deferred. before_sd requires resolved status, a concrete resolution and named
owner. later_tp requires a named owner and concrete deferral reason/boundary; it may cover task,
test execution or evidence detail, never an unresolved binding architecture/product choice.
Validate exact columns, row shape, recognized values and non-placeholder content; duplicate,
missing, empty or malformed declared sections/markers keep readiness closed. A design with no
material question records a concrete resolved applicability decision rather than an empty table.

The proposed pure sd-readiness.js returns ready, open_decisions and its contract classification.
No marker and no table means legacy: unchanged existing readiness, no state rewrite/migration.
A table without its marker, an unsupported/duplicated marker or marked missing/malformed table
is invalid rather than a legacy escape. The author must never remove the marker/table to conceal
an open decision. Legacy compatibility does not certify missing semantic decisions. Tests and
derivation review assess marker retention on new authoring/revision outputs.

Gate-check evaluates declared decisions and the existing SD criteria chain when the current
artifact is durable. Existing integrity/prerequisite blockers take precedence; decision gaps
use AGDF_SD_DECISIONS_OPEN, otherwise incomplete mappings retain AGDF_SD_TRACEABILITY_INCOMPLETE.
Carry detailed gaps in sd_readiness/open_decisions and sd_readiness_items; render the status,
allowed correction, forbidden presentation and next action through the existing locale registry.
Update the interaction field contract and validate actual rendered cards for every registered
locale. Do not put untranslated control sentences into the presentation.

Existing run-present and approval validation already re-evaluate gate status; use that same
evaluation to refuse open design decisions. Do not add a second readiness or approval check store.
Only recorded confirmed resolution followed by fresh evaluation can allow presentation.

### Recording, clarification and source conflicts

Prepare the canonical SD.md and fresh reviewed mapping/input files in the selected run directory.
Use the shared typed input with destination SD draft, approved source PRD and SD-derived_from-PRD.
Initial registration uses update_draft false; explicitly permitted replacement uses true.
Use the returned revision, retain prior binding evidence/history and redispatch gate-check.
The existing transactional writer enforces source and revision integrity under locks; ordinary
run-update, hand-authored receipts and separate relationship publication are not substitutes.

For a material design question, record a useful draft with before_sd open and a named owner,
then ask one bundled question explaining what answer is missing. Retain answers as design
context/source review evidence; update the draft through the same checked recording procedure.
If a choice changes approved scope/acceptance, keep it unresolved and name the UR/PRD owner and
existing revision/recovery needed. Do not manufacture authority to run-revise after a downstream
artifact is already linked, edit approved sources manually, or inherit an old approval. The
conflicting design remains unready until the supported source revision path completes.

### Distribution and documentation

Regenerate existing package/Core and Codex, Claude, Copilot, OpenCode and portable projections
from the canonical definition/contracts using the existing builders. Register/normalize the
new host names through the shared name mechanism; do not invent aliases in adapters. Ensure
focused contract delivery and MCP generated dispatch schemas agree with CLI behavior. Update
the canonical router/runtime/authoring documentation for the new owner and legacy distinction.
No version bump, plugin installation, release or host-cache edit is authorized by this design.

## 5. Constraints And Compatibility

The gates, exact approval formula, run lifecycle, approval/source seals, existing transaction
recovery and SD-to-TP relationship remain unchanged. Existing SDs without the new declaration
retain legacy checks; existing approved designs are never rewritten. A new contract declaration
is additive and explicitly documented, not a silent run migration. Older installed runtimes
retain their previous capabilities until a separately authorized candidate deployment.

Unknown skill/action/marker values fail with supported recovery. Additive public inputs require
shared schema and adapter conformance; an older runtime is not claimed to accept --sd-action.
User-visible authoring assignments change, while readiness and approval authority remain stable.

Preserve all current budgets and guardrails. The extra catalog entry consumes real discovery
and projection space; keep descriptions and focused contracts concise and eliminate competing
SD prose within this scope. Do not change unrelated skill behavior to manufacture budget room.
If necessary content cannot fit, return the measured conflict to the existing PRD/SD owner before
implementation or QA claims. Do not change ceilings, benchmarks or assertions as an expedient.

Keep the independent CI changes and prior UR/PRD runs separate. The observed PRD-summary label
ambiguity is recorded in PRD_SUMMARY_CORRECTION-02.md; compliant summary wording is used here.
A general renderer defect repair is not bundled into this ownership change.

## 6. Test And Evidence Strategy

TP must derive concrete tasks/scenarios from this design and the approved criteria. Evidence
must cover eligible missing-SD drafting; exact contained sources; unbound/stale/foreign assignment;
wrong-stage/approved/integrity refusal; direct invocation and registered host-name normalization;
ordinary ready-draft presentation versus explicit revision; decision open/resolved/malformed/legacy
states; answer retention; product conflict/source protection; typed recording/history; complete
and incomplete criteria mapping; fresh presentation and exact approval to unchanged TP.

Use actual version-bound source and assembled CLI/MCP consumers, shared-schema invalid-input
checks, generated supported host projections, all registered-locale rendered cards, package/runtime
integrity and existing instruction/payload/performance checks. Include absence of competing SD
semantic instructions and adjacent UR/PRD/TP routes. Respect the repository's shared verification
entry point without modifying the independent CI scope.

Retain an actual approved-source-to-design example and a cooperative reasoning review of decisions,
source authority, unanswered questions and conflicts. Deterministic fixtures/synthetic approvals
prove protocol transitions only, not genuine human review or fresh host/model behavior. Use
candidate identity in later evidence. Fresh native-host/model behavior remains unverified unless
actually observed; no automatic plugin installation or support/release claim follows from tests.

## 7. Acceptance Traceability

These rows describe technical realization of existing PRD IDs, not a second acceptance source.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Focused semantic owner and evaluated content handoff; remove competing SD prose, retain shared recording. | Plugin definition/semantic contract and Core gate/dispatch owners | SDD-001, SDD-002 | Catalog/route/prose drift; regenerate and compare source/package consumers. |
| AC-002 | Exact approved PRD and applicable ready analyses in contained source facts; reasoned source-to-design derivation. | Approved run PRD, Core source reader and SD author contract | SDD-002, SDD-005 | Stale/foreign inputs and template-only claims; binding checks plus reasoning review. |
| AC-003 | Same-design declared decision table, specific readiness blocker and permitted focused clarification. | SD.md, proposed sd-readiness.js and existing gate/interaction owners | SDD-004, SDD-002 | Marker omission/hidden questions cannot be semantic proof; contract retention and reviewed examples complement deterministic checks. |
| AC-004 | Explicit revision-bound resume action and checked draft replacement; ordinary ready continuation presents existing content. | Shared dispatch contract/CLI adapters and existing artifact transaction | SDD-003, SDD-005 | Additive public input and stale request risk; reject incompatible combinations and preserve history/approved bytes. |
| AC-005 | Unresolved conflict keeps design unready and names existing earliest source-revision owner. | Approved UR/PRD, existing revision/recovery and semantic SD contract | SDD-006, SDD-004 | Linked downstream artifacts constrain recovery; no invented transition or manual approved-source edits. |
| AC-006 | Exactly-once criteria realization, stable decision references and existing reviewed source relationship. | criteria-chain-v1 evaluator, run-artefact-recording.js and approved PRD | SDD-005 | Preserve existing traceability/history; source attestations alone do not prove semantic derivation. |
| AC-007 | Fresh combined readiness returns to existing presentation/approval writer and unchanged TP stage. | Core gate evaluation, run-presentation.js and human approval owner | SDD-004, SDD-005 | Stale presentation or unresolved declared decision; canonical re-evaluation refuses approval. |
| AC-008 | Central registration/argument contract drives CLI/MCP, names, focused modules and generated host surfaces. | Plugin definition, shared dispatch contract and existing projection builders | SDD-001, SDD-003, SDD-007 | Catalog cost/public input changes; measured unchanged budgets and candidate-bound consumer conformance. |
| AC-009 | SD-only authoring path and opt-in readiness, with no migration or adjacent ownership rewrite. | Existing gate lifecycle and selected-run sources | SDD-004, SDD-007 | Legacy compatibility requires explicit tests; independent CI paths remain outside scope. |
| AC-010 | Candidate-bound behavior and actual derivation records, separated from synthetic and fresh native observations. | Existing TP/review/QA evidence owners and delivery records | SDD-008 | Fresh native host/model remains unverified without observation; no inflated support/readiness claim. |

## 8. Risks And Open Questions

The main trade-offs are the real catalog/payload cost, additive public revision input, explicit
legacy compatibility and limits of declared-decision checking. They are addressed by the design
above rather than hidden as implementation exceptions. No binding architecture or product question
remains open before SD approval. The following later_tp row concerns execution/evidence detail.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDQ-001: Semantic identity and responsibility | before_sd | resolved | sd-definition owns content and clarification; gate-check readiness, Core evaluated dispatch and existing writer/approval retain authority. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-002: Handoff and explicit revision | before_sd | resolved | sd_definition phase with exact sources; mutually exclusive sd_action revise on revision-bound resume, ordinary ready draft only presented. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-003: Decision readiness and legacy compatibility | before_sd | resolved | sd-decisions-v1 declaration plus one same-artifact decision table; declared material open questions block presentation; unmarked legacy designs retain existing checks. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-004: Sources, conflict and recording | before_sd | resolved | Preserve approved PRD authority, criteria-chain-v1 and typed writer; product conflicts remain unresolved and return to supported earliest source revision/recovery. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-005: Distribution and evidence boundary | before_sd | resolved | Existing generators and unchanged budgets; candidate-bound behavior plus reasoned derivation; native observations stated separately, no automatic install/release. | Codex (design author); Arndt Gold (SD approval) |
| SDQ-006: Concrete task/scenario and qualification execution | later_tp | open | TP selects concrete tasks, scenario IDs and candidate-bound evidence collection for this fixed design; no architecture/product decision is deferred. | Codex (TP author); Arndt Gold (TP approval) |

## 9. Next Step

Record this draft as SD-derived_from the exact approved PRD, return to fresh gate-check, prepare
the supplied SD presentation and request a new deliberate Approval: SD. Only that approval
permits Task/Test Plan drafting. This design does not authorize implementation or claim delivery.

## AGDF Approval Summary (de; source=en)

- Lösung: sd-definition erstellt und klärt das Solution Design; gate-check prüft Voraussetzungen
  und Freigabereife. Dispatcher, bestehender Writer und Mensch behalten ihre Zuständigkeiten.
- Verantwortung: Ein kanonisches SD aus dem exakt freigegebenen PRD; Analysen sind ergänzende
  Eingaben. Kriterienkette, Quellenbeleg, Revisionsschutz und Freigabeverfahren werden wiederverwendet.
- Entscheidungen: SDD-001–008 legen Skill und Vertrag, gebundene Übergabe, ausdrückliche Revision,
  Entscheidungsprüfung, bestehende Registrierung, Produktkonflikte, Hostkonsistenz und Nachweisgrenzen fest.
- Übergabe: Eine ausgewertete sd_definition-Route liefert Ziel, Run, Revision, SD-Pfad und exakte
  Quellen. Ein fertiger Entwurf wird bei normaler Fortsetzung präsentiert; Änderungen brauchen
  tatsächlichen Überarbeitungsauftrag und aktuelle Bindung.
- Freigabereife: Neue Entwürfe führen sd-decisions-v1 mit einer Entscheidungstabelle im selben SD.
  Wesentliche offene Designentscheidungen sperren Präsentation und Freigabe. Bestehende Designs
  ohne diese Deklaration werden nicht migriert und behalten ihre bisherigen Prüfungen.
- Revision: sd_action revise und --sd-action revise erweitern den gemeinsamen CLI-/MCP-Vertrag.
  Der vorhandene Writer ersetzt nur zulässige unfreigegebene Entwürfe und erhält Beleggeschichte.
- Produktkonflikte: Zur zuständigen UR-/PRD-Revision zurückgeben; keine stillen Quellenänderungen
  oder erfundenen Übergänge. Betroffene Designs bleiben bis zur Klärung unfreigegeben.
- Integration: Katalog, Verträge, Dokumentation und unterstützte Hostprojektionen gemeinsam
  aktualisieren; bestehende Anweisungs-, Payload-, Integritäts- und Leistungsgrenzen beibehalten.
- Nachweise und Risiken: Alle zehn PRD-Kriterien sind zugeordnet. TP plant Verhalten, Grenzfälle
  und tatsächliche Ableitungsprüfung. Deklarierte Entscheidungen beweisen keine ungenannten Fragen;
  Paket-/Protokolltests beweisen keine frische Host-/Modellsitzung.
- Offen: Keine wesentliche Produkt- oder Architekturentscheidung; konkrete Aufgaben, Szenarien
  und Nachweiserhebung folgen im TP mit benanntem Verantwortlichen.
- Abgrenzung: Keine neuen Gates, parallelen Quellen, Writer oder automatischen Installations-,
  Git- und Veröffentlichungsaktionen. Unabhängige CI-Arbeit und benachbarte Zuständigkeiten bleiben separat.
- Nächster Schritt: Approval: SD erlaubt den Aufgaben- und Testplan; noch keine Umsetzung.
