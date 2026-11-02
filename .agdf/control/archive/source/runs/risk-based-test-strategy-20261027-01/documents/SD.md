# SD: Central policy with proportionate evidence reuse

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-27
Owner: Codex (SD author; human approval remains with Arndt Gold)
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend `plugins/agdf/meta/contracts/quality.md` in place with shared rules for test
selection/placement, evidence applicability/reuse, effective verification, finding
re-verification and verification completion. Apply them through existing authoring
and review owners. Reconcile the existing output contradiction without introducing
a rule engine, evidence schema, gate or report family.

The operational path remains: approved criteria and change/risk context -> SD strategy
-> TP executable scenarios and existing evidence references -> scoped execution ->
reviews of claims/results and findings -> existing QA decision -> separate human gates.
Technical receipts/history remain writer-owned. A completed check does not approve a gate.

No production change is made by this SD. Implementation follows only after the
existing TP approval and implementation-preparation Brownfield Analysis.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Application in this solution |
|---|---|---|
| Shared test/evidence/output policy and normalized findings | plugins/agdf/meta/contracts/quality.md | Extend this contract; retain one semantic definition of each shared obligation. |
| SD and TP phase authoring | sd-definition.md / tp-definition.md; their skills and SD.md / TP.md templates under plugins/agdf/ | Reference central rules and use existing strategy/scenario/evidence sections. |
| Skill contract delivery | plugins/agdf/meta/agdf-plugin.definition.json runtimeContractModules; packages/core/lib/resources/contracts.js | Add quality to the existing SD/TP module lists; reuse the unchanged contract reader. |
| Review and technical QA assessment | task-plan-review, code-review, clean-implementation-review and qa-gate skills | Add only the role-specific application of central rules; keep required assessments and normalized routes. |
| Result projection and human presentation | Existing quality projection/interaction/approval owners | Reconcile agent output guidance; retain derived data, explicit detail access and deliberate gate decisions. |
| Quality authority navigation | .agdf/control/CONTEXT_GRAPH.md; SOT_REGISTRY.md; docs/architecture/ | Identify and link the quality owner; these references define no independent policy. |
| Executable test inventory and distribution | Canonical npm scripts; scripts/ci-plan.mjs; sync-package-assets.js; sync-plugin-runtime.js; core-projection.mjs | Retain inventory, CI and generators; never hand-edit generated output. |

## 3. Architecture Decisions

- SDD-001: Extend quality.md as the sole shared policy owner, using concise named sections for proportional evidence and verification effectiveness/completion; rationale: it already owns QA/evidence meaning and normalized gaps, so another quality document or validator would split authority; consequence: policy meaning is assessed through existing reviews, not claimed as universal machine enforcement.
- SDD-002: Deliver quality through existing SD/TP runtimeContractModules metadata and fallback references, with phase-specific prompts in the current contracts/templates; rationale: the current bound SD/TP continuations supply only their focused contract and gate-artifact-preparation, so a prose link alone does not ensure delivery; consequence: the unchanged reader delivers the same digest-bound quality source, adding context bytes once per phase rather than new repeated reads or a separate loading service.
- SDD-003: Express evidence sufficiency/reuse/re-verification/completion through existing strategy, scenario, evidence and finding records, including coherent groups; rationale: these records already map claims, results and decisions, while a per-proof registry would add overhead; consequence: source/revision/environment/applicability remain explicit, mandatory reviews persist and no runtime receipt/history format changes.
- SDD-004: Apply the approved routine-pass versus revise/block behavior in quality.md and affected review/QA instructions, preserving current derived projection and explicit status/detail interfaces; rationale: the contradiction is in automatic output guidance, while buildQualityReadiness and explicit status-card detail retain a valid use; consequence: no evaluator, CLI/MCP schema, locale pack or approval-renderer change is needed for this policy scope; source/scenario evidence does not qualify native host behavior.
- SDD-005: Curate one general CG-QUALITY-CONTRACT context node, add a specific SoT registry entry and direct architecture-entry references, and link the existing UX node to that owner; rationale: the inspected graph has no general quality node and the only explicit ownership statement is UX-specific; consequence: the new node is justified reusable knowledge and navigation, not another normative contract or a Run log.
- SDD-006: Use existing structural/dispatch, propagation/integrity and semantic-review paths, with exact measured distribution-footprint accounting and no new semantic validator; rationale: generated-module tests can prove source delivery, but deterministic replays/keyword assertions cannot prove agent judgment; consequence: evidence stays bounded, source additions use normal generation, and any net payload growth needs an attributed exact-size baseline update with unchanged file count and no arbitrary headroom.

These choices introduce no new library, service, protocol or major version. Their
basis is the inspected repository sources, checked on 2026-10-27; no external
technology selection or version recommendation is made.

## 4. Integration Points

### Central contract and authoring consumers

In quality.md, keep the existing normalized gap types/routes and deviation semantics.
Define the new common obligations once and reconcile its existing output clauses.
Use short section references from the consumers rather than full rule copies.

Add `quality` to the SD/TP `runtimeContractModules` arrays in the existing plugin
definition. Their skill fallback lists also name the same module. The existing
resources/contracts.js reader and dispatcher remain unchanged: consume returned
module content/digest once for that phase; request it through the existing contract
reader only when the declared fallback applies. Do not infer a source from cwd.

SD's existing Test And Evidence Strategy section records scope/risk, reusable coverage,
Run/CI/optional-nightly placement, required decision points and outstanding obligations.
TP keeps its current Test Plan and Verification Traceability columns. Applicability,
expected behavior, results and rationale use those records plus compact explanatory
prose; no new mandatory table, JSON block or file for each piece of proof is added.

### Evidence and review flow

A result may be referenced by several mapped claims when it remains retrievable and
applicable. Its tested revision/environment are retained; an applicability assessment
never relabels an older result as execution against a newer revision. Changed behavior,
dependencies, environment or contradictory results reopen affected obligations; uncertain
reach broadens the assessment rather than defaulting to reuse.

Derive expected behavior from approved sources. Defect-fix proof distinguishes intended
failure before the fix from success afterward; infrastructure failure is not sensitivity
proof. Record a justified alternative for unsafe/impractical replay. Finding closure
references targeted outcomes and relevant side effects; inadequate proof stays open under
the existing owner. Accepted deviations keep their technical gap and original QA result.

TP Review assesses task/criterion coverage and applicability; Code Review assesses
changed behavior and test sensitivity; Clean Implementation Review checks reuse and
parallel structures; QA consumes all applicable results and gaps. Each retains its own
assessment even when underlying evidence is shared. Once required proof is sufficient,
stop redundant collection until a concrete trigger; continue mandatory reviews and gates.

### Output and navigation

Reconcile quality.md and qa-gate's current instruction to always show the projection.
Routine technical pass becomes a concise result line with report reference. At revise/block,
retain four dimensions in order, the decisive source/reason and next permitted action.
Explicit detail requests may still show the full derived overview and reports. Existing
human gate presentations remain intact and can never be replaced by a concise pass line.
`printGateCheckStatusCard` is an explicit detail path; its full projection is retained.

The general graph node records situation, owner/consumer boundaries, risks, invariants
and exit criteria with links to quality.md. The existing UX node references it for shared
policy. SOT_REGISTRY names the shared quality domain explicitly. Architecture README and
01-systemarchitektur explain/link that domain; existing 02-dispatcher and 03-agentenkontrolle
references are reconciled as needed, with current versus planned behavior kept distinct.

## 5. Constraints And Compatibility

- Preserve all approved UR/PRD bytes, normalized types/routes, gate formulas, required
  reviews, approval transactions, receipts/history and supported command schemas.
- Preserve canonical test inventory, current CI schedules and complete required coverage;
  nightly is only an applicability category, not a delivered scheduler.
- Limit production changes to canonical policy/guidance, metadata, templates, relevant
  source-reference tests, graph/registry/architecture and normal derived propagation.
- Reuse the normal generators; never copy a second contract into source or manually patch
  generated host/package output. No install, release or native qualification is implied.
- The current Copilot profile is capped at 397 files / 3,509,461 bytes with zero headroom.
  Prefer removing genuine duplication in touched guidance. If needed after generation,
  update its existing baseline metadata only to the exact measured and reviewed total
  attributed to this policy change, retaining file count/profile exclusions and recording
  the source delta. Never add padding, arbitrary headroom or raise instruction budgets to
  conceal unrelated growth. Unexpected growth is a finding, not an automatic baseline reset.

## 6. Test And Evidence Strategy

Use three complementary evidence groups, retained in the existing CD+Tests/review records.
TP supplies exact scenarios/commands and execution prerequisites; no checks are claimed run now.

1. Source and dependency checks: extend the existing build-contract/SD/TP dispatch checks
   to verify that selected continuations receive the actual canonical quality module,
   content and digest; retain fail-closed behavior when required modules are unavailable.
   Check the three direct navigation entry points and consumer references. Negative
   structural fixtures must detect a missing delivery dependency, not merely match words.
2. Semantic case review: assess concrete valid/invalid examples for bounded test selection,
   incomplete CI coverage, reusable versus stale/expired proof, effective versus mirrored
   tests, unsafe replay alternatives, unsupported finding closure, verification completion
   and reopening, and pass/revise/block/detail output. Record expected/assessed decisions,
   central source references and limitations in one compact section of the existing test
   report. This is cooperative semantic assessment, not an independent or live-model result.
3. Propagation/regression: use normal source generation, existing build-contract, footprint,
   runtime-integrity and focused definition/eval/interaction checks where impacted. Retain
   existing deterministic skill evaluations as routing/structure evidence only. Use existing
   CI partitions for broad regression; do not repeat the complete suite after each edit.

Run cheap decisive source/scenario checks before expensive package consumers. Reuse unchanged
results with explicit applicability and repeat affected checks after material changes. A
required unavailable result remains a QA-relevant gap. Native behavior/savings are unclaimed.

### Derivation Review

Primary source: PRD.md @ sha256:c679089a7bf6320bffe6f3a0d843ace0c7d9997528121287b866796fd48cc1ab.
Analytical source: BROWNFIELD_REVIEW.md @ sha256:2ae4db4322f8c6cbfd92a011088d5e6967d2a2cea84365a6f8dad20328279473.
The design resolves the PRD's later_sd consumer/verification obligation using existing module
metadata and source propagation, preserves product choices and maps every criterion below.
This is an author self-review, not independent assurance; typed recording binds sources but
does not prove semantic correctness. No additional policy/enforcement authority is introduced.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | General quality node, explicit registry row and direct architecture entry links; shared rules stay central | quality.md; CONTEXT_GRAPH.md; SOT_REGISTRY.md; architecture entry; Codex implementation/review owner | SDD-001, SDD-005 | Avoid a second full policy and preserve existing UX references. |
| AC-002 | Central selection obligation applied in existing SD/TP strategy/planning sections | quality.md; sd-definition.md; tp-definition.md; SD/TP templates | SDD-001, SDD-002 | Indirect dependency uncertainty must remain visible. |
| AC-003 | Execution placement/decision timing and inventory applicability in existing strategy | quality.md; canonical npm scripts; ci-plan.mjs; SD/TP | SDD-001, SDD-002 | No CI changes or assumption that nightly already exists. |
| AC-004 | Reuse validity and multiple references through current evidence mappings | quality.md; existing TP/review records | SDD-003 | Preserve tested revision/environment; inaccessible proof is not sufficient. |
| AC-005 | Grouped rationale and reuse in existing sections; technical history untouched | quality.md; existing evidence/recording owners | SDD-003 | Avoid new per-proof paperwork or a second inventory. |
| AC-006 | Requirement-derived expectations, targeted sensitivity and safe alternatives applied by test planning/Code Review | quality.md; TP and code-review skill | SDD-001, SDD-003 | Semantic assessment cannot be replaced by keyword assertions. |
| AC-007 | Targeted re-verification in existing finding resolution and QA assessment | quality.md Normalized Review Gaps; review/QA owners | SDD-003 | No status-only closure; deviations remain separate. |
| AC-008 | Verification completion/new-trigger rule distinct from reviews/gates | quality.md; existing reviews and gate owners | SDD-003 | A stop condition must not waive gaps or human decisions. |
| AC-009 | Metadata delivers quality to SD/TP; brief phase instructions for existing review consumers | agdf-plugin.definition.json; resources/contracts.js; skill/phase sources | SDD-002, SDD-003 | Increased phase context is bounded to one existing module; no new reader. |
| AC-010 | Reconcile automatic output guidance; preserve derived and explicit-detail/gate interfaces | quality.md; qa-gate skill; existing interaction/projection owners | SDD-004 | No evaluator/schema/UI rewrite or native rendering claim. |
| AC-011 | Protected scope boundaries and normal canonical generation | approved UR/PRD; existing gates, CI and writers | SDD-001, SDD-006 | No history migration, weakening of coverage or release authorization. |
| AC-012 | Complementary dependency, semantic and propagation groups; exact footprint accounting | existing build/dispatch/definition/eval/integrity checks; normal generators | SDD-006 | Distinguish structural proof, self-review, package parity and live-host evidence. |

## 8. Risks And Open Questions

No material design choice remains open. Execution-level scenario grouping and command
selection are delegated below. Principal risks are instruction growth, ineffective
semantic checks, stale evidence and stopping too early; the central validity/gap rules,
existing required reviews and exact measured propagation constrain those risks.
The Copilot net byte delta is unknown until implementation generation; only its bounded
measurement/accounting method is selected here. New runtime enforcement or broader
payload/security changes require an explicit scope decision rather than being hidden
inside a test fix. No quantitative performance or native-host claim is made.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Shared rule and evidence representation | before_sd | resolved | SDD-001/SDD-003 keep quality.md normative and apply grouped obligations through existing records; no new schema or store. | Codex, SD author |
| Consumer placement and verification design | before_sd | resolved | SDD-002 uses existing SD/TP runtimeContractModules and fallback references; existing phase/review prompts and the three evidence groups apply the shared policy. Resolves the approved PRD later_sd obligation. | Codex, SD author |
| Routine output implementation boundary | before_sd | resolved | SDD-004 changes automatic skill guidance only; full explicit detail and underlying derived values/approval presentations remain intact. | Codex, SD author |
| General quality discoverability | before_sd | resolved | SDD-005 curates one general node and explicit registry/architecture links; existing UX context links to the common owner. | Codex, SD author |
| Distribution and footprint accounting | before_sd | resolved | SDD-006 uses normal generators; retain file count and instruction budgets, attribute any required exact measured payload-byte baseline update without arbitrary headroom. | Codex, SD author |
| Execution scenarios and command grouping | later_tp | deferred | TP selects exact existing checks, scenario IDs, grouping, evidence locations and unavailable actions before execution. This defers execution detail only; architecture, central ownership and evidence boundaries are fixed above. | Codex, TP author |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

Approval permits the existing TP drafting stage, not implementation or installation.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen zentralen Qualitätsvertrag mit wirksamen, proportionalen Tests und wiederverwendbaren Nachweisen konkret umsetzen, ohne neue Gates oder Nachweisverwaltung.
- Umfang: quality.md zentral ergänzen; SD/TP über die bestehende Modulzuordnung mit genau dieser Quelle versorgen und vorhandene Planungs-/Reviewabschnitte nutzen. Einen allgemeinen Qualitätsknoten, eine SoT-Zeile und direkte Architekturverweise kuratieren.
- Umsetzung: Aussagen, Zeitpunkt und Gültigkeit in bestehenden Zuordnungen festhalten; gültige Ergebnisse mehrfach referenzieren. Tests aus Anforderungen ableiten, Befunde gezielt nachprüfen und Zusatzprüfungen bei ausreichender Evidenz beenden; Pflichtreviews und Freigaben bleiben bestehen.
- Darstellung: Die widersprüchlichen automatischen Ausgaberegeln bereinigen: pass kurz mit Berichtreferenz, revise/block mit vier Dimensionen und entscheidender Aktion. Bestehende Detailabfragen, abgeleitete Daten und menschliche Gate-Präsentationen bleiben erhalten; keine neue UI oder Auswertungslogik.
- Prüfung: Gebundene Vertragslieferung und fehlende Abhängigkeiten strukturell prüfen, konkrete positive/negative Szenarien semantisch bewerten und normale Quellen-/Paketweitergabe prüfen. Wiederholungen gezielt begründen; selbst bewertete Szenarien oder deterministische Replays sind keine native Agentenqualifikation.
- Paketgrenze: Bestehende Generatoren nutzen, keine abgeleiteten Dateien manuell ändern. Falls die neuen Regeln netto Paketbytes benötigen, nur die exakt gemessene und begründete Byte-Baseline anpassen; Dateizahl, Profilausschlüsse und Instruktionsbudgets erhalten. Kein pauschaler Puffer.
- Grenzen: Keine CI-Umstellung, kein Nightly-Aufbau, keine Nachweislöschung, keine Änderungen an Freigaben/Historie und kein neues Regelsystem. Einsparungen und native Hostwirkung sind ungemessen; alle zwölf PRD-Kriterien sind dem Design zugeordnet.
- Entscheidungen: Die wesentlichen Designfragen einschließlich Consumer-Einbindung sind geklärt. Nur konkrete Szenarien, Befehle und Gruppierung der Ausführung bleiben beim TP-Owner.
- Risiken: Mehr Vertragskontext und Paketwachstum müssen begrenzt bleiben. Gültigkeitsprüfung und Stoppregel dürfen keine Nachweislücke oder Pflichtprüfung verdecken; strukturelle Prüfungen beweisen keine fachliche Wahrheit.
- Nächster Schritt: Mit Approval: SD diese Fassung freigeben; anschließend TP entwerfen. Noch keine Implementierung oder Installation.
