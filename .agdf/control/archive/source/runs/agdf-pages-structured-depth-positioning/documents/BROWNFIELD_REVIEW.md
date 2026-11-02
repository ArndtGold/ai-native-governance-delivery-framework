# Brownfield Review: Structured Depth Positioning auf AGDF Pages

Status: done
Mode: post_ur_review
Run: `agdf-pages-structured-depth-positioning`
Date: 2026-07-29

## Decision

- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- artefact: .agdf/control/artefacts/agdf-pages-structured-depth-positioning/BROWNFIELD_REVIEW.md

## Delivery Context And UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Bounded content/copy correction and one new static comparison surface within the existing Pages design system. No interactive capability, working mode, effective state, activation, blocker or recovery behavior is introduced or changed. The change preserves unambiguous intent (explain AGDF depth selection correctly); acceptance signals for responsive and accessible rendering are content-level PRD criteria, not interactive UX semantics.
- ux_intent_definition_required: no

## Scope

Korrektur und kanonische Ausrichtung der öffentlichen Pages-Kommunikation für die Structured-Depth-Produktsemantik:

- `pages/src/data/site.ts`: `gateModeMatrix`, `requirementPaths`, `gateMapPaths`, `workflowSteps`, `gateFlow` an kanonische Modewerte aus `modes.md` anpassen.
- `pages/src/pages/index.astro`: kanonische, menschenlesbare Vergleichsfläche „How AGDF chooses depth" und präzisierte Gate Map innerhalb des vorhandenen Designsystems rendern.
- `pages/src/data/evaluationEvidence.ts`: bleibt repository-derived; keine Änderung erwartet, nur Konsistenzprüfung nach Corpus-Erweiterung.

## Existing Owners And Source Of Truth

| Owner | Path | Role |
|---|---|---|
| Modes Contract | `plugin/meta/contracts/modes.md` | Sole normative owner for `structured_slice` vs `structured_delivery`, `verified_change`, `quick_task`, `depth_unresolved`. Pages must project, not re-author. |
| Gate Transition | `plugin/meta/contracts/gate-transition.md` | Operative gate sequence and UI/UX routing owner. |
| Pages data | `pages/src/data/site.ts` | Existing Pages copy/data owner; `gateModeMatrix`, `requirementPaths`, `gateMapPaths`, `workflowSteps`, `gateFlow`, `approvalGates`. |
| Pages rendering | `pages/src/pages/index.astro` | Existing landingpage composition; renders `gateMapPaths` but not `gateModeMatrix`. |
| Eval evidence | `pages/src/data/evaluationEvidence.ts` | Repository-derived counts; runtime build-time validation. |

## Current Coverage

| Element | Coverage | Evidence |
|---|---|---|
| Quick/Compact path copy | partially_done | `requirementPaths[0]` und `gateModeMatrix[0]` existieren, nutzen aber nicht das kanonische Compact-Delivery-Label; `verified_change` fehlt vollständig. |
| Bug Lightweight path | partially_done | `requirementPaths[1]` und `gateModeMatrix[1]` vorhanden; Label „Bug lightweight" weicht von kanonischer Semantik leicht ab, aber Boot-Track-Logik korrekt. |
| Structured Slice vs Structured Delivery | not_done | `gateModeMatrix[2,3]` nennt „Bounded slice" und „Structured delivery", unterscheidet aber nicht nach belegter Wirkung und zeigt nicht dieselbe Gate-Kette. `gateMapPaths.structured` ist ein einzelner Pfad ohne Tiefenunterscheidung. |
| Verified Change | not_done | In keinem Pages-Datenobjekt oder Render-Section vorhanden. |
| Full-Depth-Wirkungsfamilien (6) | not_done | Auf Pages nicht erklärt; `gateModeMatrix[3].decision` nennt nur pauschal „new capability, architecture, persistence, policy, UX or release-critical work". |
| Seven Bounded-Slice Checks | not_done | Auf Pages nicht erklärt. |
| `depth_unresolved` / Block-Recovery | not_done | `gateModeMatrix[4]` nennt „Blocked" ohne `depth_unresolved`, fehlende Evidenz, Owner oder erneute Bewertung. |
| Proxy-Verbot (numerische Entscheidungen) | not_done | Auf Pages nicht sichtbar. |
| Gate-Map: gleiche strukturierte Gate-Kette | partially_done | `gateMapPaths.structured` zeigt eine Kette, aber nicht, dass Slice und Delivery dieselbe Gate-Reihenfolge mit unterschiedlicher Artefakttiefe verwenden. |
| Vergleichsfläche „How AGDF chooses depth" | not_done | `gateModeMatrix` ist definiert aber wird in `index.astro` nicht gerendert. |
| Evaluationszahlen repository-derived | fully_done | `evaluationEvidence.ts` leitet Zahlen zur Build-Zeit aus Plugin-Definition und Eval-Cases ab; wirft bei inkonsistenten IDs. |
| Responsive/barrierearme Darstellung | partially_done | Vorhandenes Designsystem nutzt responsive Grids und semantisches HTML; neue Vergleichsfläche muss auf kleinen Screens lesbar bleiben. |

## Reuse Strategy

- `extend`: `site.ts`-Datenobjekte (`gateModeMatrix`, `requirementPaths`, `gateMapPaths`, `workflowSteps`, `gateFlow`) mit kanonischen Modewerten und fehlenden Modi ergänzen.
- `extend`: `index.astro` um eine neue Vergleichsfläche erweitern, bestehende `.surface`/`.card-glow`/`.gate-node`/Grid-Patterns wiederverwenden.
- `refactor`: `gateModeMatrix` ist definiert aber ungerendert — als Vergleichsfläche rendern oder durch eine kanonische Version ersetzen, statt eine parallele Struktur zu erstellen.
- `new`: keine neue Designsystem-Komponente erforderlich; Inline-Section in `index.astro` oder kleine Daten-Erweiterung in `site.ts`.

Keine parallelen Strukturen: `gateModeMatrix` und `gateMapPaths` müssen versöhnt werden (eine Vergleichsfläche, eine Gate-Map), nicht dupliziert.

## Copy Drift Inventory (UR Acceptance Signal 2)

| Stelle | Aktuelle Copy | Kanonische Semantik | Abweichung |
|---|---|---|---|
| `gateModeMatrix[2].mode` | „Bounded slice" | `structured_slice` | Kanonischer Modewert fehlt; Wirkung nicht belegt. |
| `gateModeMatrix[3].mode` | „Structured delivery" | `structured_delivery` | Kanonischer Modewert fehlt; Unterscheidung nach Wirkung nicht gezeigt. |
| `gateModeMatrix[4].mode` | „Blocked" | `block` / `depth_unresolved` | `depth_unresolved`, fehlende Evidenz, Owner und Re-Evaluation fehlen. |
| `gateModeMatrix` allgemein | Quick/Bug/Bounded/Structured/Blocked | + `verified_change` (Compact Delivery) | Verified Change fehlt. |
| `requirementPaths[2].label` | „Controlled Delivery" | `structured_slice` / `structured_delivery` | Nicht-kanonischer Name; konfliert die zwei strukturierten Modi. |
| `gateMapPaths.structured` | Ein einzelner „Structured path" | Slice + Delivery, gleiche Gates, unterschiedliche Tiefe | Tiefenunterscheidung fehlt. |
| `workflowSteps[2].desc` | „quick, bug-lightweight, bounded, structured or blocked" | + verified_change, depth_unresolved | Verified Change und depth_unresolved fehlen. |
| `gateFlow[2].desc` | „small / bounded / structured / blocked" | + verified_change | Verified Change fehlt. |

## Change Impact

- files/modules: `pages/src/data/site.ts`, `pages/src/pages/index.astro` (ggf. kleine Inline-Section).
- interfaces: keine.
- data model/migrations: keine.
- backwards compatibility: voll gegeben (statische Site, Content-Änderung).
- regression tests: `astro check`, `astro build`, sichtbare Browserprüfung; keine behavioural Tests vorhanden.
- side effects: keine außer Pages-Rendering.

## Parallel-Structure Risk

`gateModeMatrix` ist definiert aber ungerendert. Eine neue Vergleichsfläche darf `gateModeMatrix` nicht duplizieren, sondern muss es kanonisch rendern oder ersetzen. `gateMapPaths` (Gate-Map-Section) und die neue Vergleichsfläche (Mode-Selection-Section) müssen unterschiedliche Rollen behalten: Gate-Map = welche Gates in welcher Reihenfolge; Vergleichsfläche = wie die Tiefe gewählt wird.

## SoT/Runtime/Product-Semantics Drift

- `gateModeMatrix`- und `requirementPaths`-Labels weichen von kanonischen Modewerten in `modes.md` ab.
- Pages darf nicht zur zweiten normativen Policy werden (UR Non-Goal). Modes Contract bleibt alleiniger Owner.
- Keine Runtime-/Contract-Änderung erforderlich; Drift ist ausschließlich Public-Copy.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`, `CG-DELIVERY-PATH-SEARCH`, `CG-UX-INTENT-BEFORE-PRD`
- context_graph_required_action: none_at_brownfield_review (bestehende Knoten werden referenziert, nicht geändert; Pages ist erklärende Projektion)
- context_graph_gate_effect: none

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Pages wird zweite Policy-Authority | high | PRD muss Modes Contract als alleinigen Owner benennen und Pages als Projektion abgrenzen. |
| Zu viel Detail macht Marketingseite zur Runtime-Doku | medium | PRD muss angemessene Marketingtiefe festlegen; keine Vollkopie der Checks/Trigger. |
| Responsive Vergleichsfläche auf kleinen Screens unlesbar | medium | PRD-Akzeptanzsignale für mobile, Kontrast, Tastatur und semantisches HTML. |
| `gateModeMatrix` und neue Vergleichsfläche duplizieren sich | medium | Eine kanonische Vergleichsfläche rendern, keine parallele Struktur. |

## Missing Evidence

- Vollständiges Inventar der falschen Public-Copy ist in dieser Review erfasst; PRD muss die genauen Ziel-Copy-Texte definieren.
- Keine fehlenden entscheidenden Tiefen-Fakten: alle sechs Full-Depth-Trigger sind als nicht anwendbar belegt, alle sieben Bounded-Slice-Checks sind als `pass` belegt.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: verified_change — ausgeschlossen, weil (1) nicht genau ein kanonischer Owner (Daten-Owner `site.ts` + Render-Owner `index.astro`), (2) keine deterministische Validierung für Content-/Copy-/Accessibility-Akzeptanz (UR fordert sichtbare Browserprüfung), (3) Worktree nicht an vollem Baseline-Commit (Kontrolldateien sind dirty), (4) Akzeptanz erfordert menschliche visuelle/accessibility-Verifikation, nicht maschinell. `structured_delivery` — ausgeschlossen, weil kein Full-Depth-Trigger belegt ist.
- missing_or_conflicting_facts: none
- depth_evidence_refs: `plugin/meta/contracts/modes.md` Structured Depth Decision; UR Revision 1; `pages/src/data/site.ts`; `pages/src/pages/index.astro`

### Bounded-Slice Checks

| Check ID | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | Ein kohärentes Outcome: Pages erklärt Structured-Depth-Positioning korrekt und verständlich; UR definiert klare Akzeptanzsignale. |
| `authority_boundary` | pass | Modes Contract ist alleiniger normativer Owner; Pages ist erklärende Projektion; keine neue Trust-/Policy-/Permission-/Security-Grenze. |
| `owner_consumer_coordination` | pass | Owner sind `site.ts` und `index.astro`; keine externe Consumer-Koordination oder shared cutover. |
| `full_depth_impacts_absent` | pass | Keine Architektur-, Runtime-, Persistenz-, Daten-, externen-API-, öffentlichen-CLI-, Release- oder Cross-Host-Effekte belegt (statische Content-Änderung). |
| `migration_propagation_bounded` | pass | Keine Migration; Änderung ist Content/Copy, lokal reversibel via Git. |
| `failure_recovery_local` | pass | Rollback via Git; Build-Fehler sind lokal isoliert. |
| `independently_acceptable` | pass | UR-Akzeptanzsignale sind in sich geschlossen; keine versteckte nachfolgende Arbeit als Voraussetzung. |

## Transparency

- PRD ist erforderlich, weil `structured_slice` durch PRD/SD/TP mit Slice-Tiefe geht. PRD muss Ziel-Copy, Vergleichsflächen-Design, Responsive-/Accessibility-Akzeptanzsignale und die Abgrenzung zum Modes Contract definieren.
- SD/TP folgen in Slice-Tiefe (nur der kohärente begrenzte Outcome und seine Owner/Contracts/Propagation/Recovery/Tasks/Tests).
- Implementierung bleibt bis nach `Approval: TP` und pre-implementation Brownfield Analysis verboten.
- UX Intent Definition ist nicht erforderlich (`low` impact, keine interaktive UX-Semantik, Intent eindeutig).

## Required Next Step

PRD in Slice-Tiefe draften: Scope, Akzeptanzkriterien, Non-Goals, Ziel-Copy, Vergleichsflächen-Design, Responsive-/Accessibility-Signale, Abgrenzung zum Modes Contract. Danach exakt `Approval: PRD` anfordern.

- Keine Implementierung.
- Keine Brownfield Analysis vor TP.
- Kein VCS/Deploy/Release.
