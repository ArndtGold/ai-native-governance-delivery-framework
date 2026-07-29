# Solution Design: Structured Delivery Depth Boundary

Status: `approved`
Gate: SD
Revision: 1
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`
Based on: genehmigte UR Revision 1 und genehmigtes PRD Revision 1
Gate approval: exaktes `Approval: SD` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1
und dauerhaftem Artefakt

## 1. Designentscheidung

Die Structured-Depth-Grenze bleibt agent-native und contract-owned:

- `plugin/meta/contracts/modes.md` ist der einzige normative Owner der fachlichen Matrix.
- `gate-transition.md`, `brownfield-analysis`, Templates und Runtimeflächen konsumieren oder
  referenzieren diese Semantik, pflegen aber keine zweite vollständige Matrix.
- Es entsteht keine zweite JavaScript-Policy-Engine, die reale Brownfield-Fakten scheinbar
  objektiv aus Datei- oder Ownerzahlen klassifiziert.
- Fehlende oder widersprüchliche Depth Facts werden mit dem bestehenden
  Mode/Slice-Wert `block` fail-closed persistiert; `depth_unresolved` bleibt reine
  Produkt-/Darstellungssprache, kein neuer Modewert.

Enforcement-Klasse:

- normative Contract-/Instruction-Enforcement;
- deterministische Struktur-, Propagations- und Skill-Eval-Evidenz;
- keine Behauptung, Runtime Integrity könne die Wahrheit realer Architektur-, Policy- oder
  Migrationsfakten automatisch verifizieren.

## 2. Owner- und Konsumentenmodell

| Rolle | Owner | Verantwortung |
|---|---|---|
| Normative Depth-Semantik | `plugin/meta/contracts/modes.md` | Full-Depth-Trigger, Bounded-Slice-Test, missing/conflicting Facts, Reason Codes |
| Operative Gate-Integration | `plugin/meta/contracts/gate-transition.md` | Zeitpunkt der Entscheidung, bestehende Modewerte, Gate-Reihenfolge, unresolved → `block` |
| Brownfield-Ausführung | `plugin/skills/brownfield-analysis/SKILL.md` | Fakten erheben, Matrix anwenden, Entscheidung und Recovery dauerhaft erfassen |
| Durable Reviewform | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | strukturierte Depth-Evidenz ohne zweite Semantik |
| Zustandsprojektion | bestehende Run-State-/Gate-Check-/Delivery-Map-Pipeline | vorhandene Entscheidung, Scope Reason, Evidenz und Next Action projizieren |
| Integritätsprüfung | `plugin/scripts/check-runtime-integrity.mjs` | Pflichtreferenzen, Pflichtfelder und generierte Parität prüfen |
| Verhaltensprüfung | `evals/cases/brownfield-analysis.json` und deterministische Replay-Evidenz | positive, negative, boundary und adversarial Depth-Fälle |
| Propagation | `create-agdf/scripts/sync-package-assets.js` | kanonische Pluginquellen in Package-/Copilot-/OpenCode-Flächen synchronisieren |
| Kontextwissen | `.agdf/control/CONTEXT_GRAPH.md` | bestehende Delivery-Path-/Ceremony-Invarianten aktualisieren |

## 3. Normativer Contract-Aufbau

`modes.md` erhält einen Abschnitt `Structured Depth Decision` mit:

1. Eintrittsvoraussetzungen nach Ausschluss kompakter Pfade;
2. den sechs Full-Depth-Triggerfamilien aus PRD 4.1;
3. dem siebenteiligen Bounded-Slice-Test aus PRD 4.2;
4. der unresolved-Regel für missing/conflicting Facts;
5. der Regel gegen numerische Proxy-Schwellen;
6. der unveränderten Gate-Parität;
7. den neun normalisierten Reason Codes;
8. der nicht autorisierenden Benchmarkgrenze.

`gate-transition.md` behält nur:

- die operative Reihenfolge;
- die Zuordnung `structured_slice | structured_delivery | block`;
- einen normativen Verweis auf `modes.md`;
- die Regel, dass unresolved Facts als `block` mit evidenzorientierter Next Action gespeichert
  werden.

Die vollständige Trigger-/Checkliste wird dort nicht wiederholt.

## 4. Durable Depth Evidence

Das Brownfield-Review-Template erhält einen Abschnitt `Structured Depth Evidence`.

### 4.1 Metadaten

- `depth_policy_version: 1`
- `depth_facts_status: complete | missing | conflicting | not_applicable`
- `primary_reason_code`
- `decisive_full_depth_triggers`
- `rejected_alternative`
- `missing_or_conflicting_facts`
- `depth_evidence_refs`

### 4.2 Bounded-Slice-Check

Eine Tabelle enthält genau die sieben PRD-Prüfungen:

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass | fail | unknown | not_applicable` |  |
| authority_boundary | `pass | fail | unknown | not_applicable` |  |
| owner_consumer_coordination | `pass | fail | unknown | not_applicable` |  |
| full_depth_impacts_absent | `pass | fail | unknown | not_applicable` |  |
| migration_propagation_bounded | `pass | fail | unknown | not_applicable` |  |
| failure_recovery_local | `pass | fail | unknown | not_applicable` |  |
| independently_acceptable | `pass | fail | unknown | not_applicable` |  |

Regeln:

- `structured_slice`: alle sieben `pass`, keine decisive Trigger, Facts `complete`;
- `structured_delivery`: mindestens ein belegter decisive Trigger oder ein belegtes
  Nicht-Begrenztsein; Facts `complete`;
- `block`: mindestens ein entscheidendes `unknown`, Facts `missing | conflicting`, sofern kein
  belegter Full-Depth-Trigger bereits eine positive Full-Depth-Entscheidung trägt;
- `not_applicable`: ausschließlich für Quick/Compact/Verified-Change-Auswahl vor Structured Depth.

## 5. Run-State- und Projektionseinsatz

Es werden keine neuen Mode-, Gate- oder Approval-Werte eingeführt.

### Positive Entscheidung

Die bestehende `Mode/Slice Decision` speichert:

- `decision: structured_slice | structured_delivery`;
- `required_next_gate: PRD`;
- `scope_reason`: Reason Code plus kurze entscheidende Begründung und verworfene Alternative;
- `evidence`: Link auf die vollständige `Structured Depth Evidence`.

### Unresolved Facts

Die bestehende `Mode/Slice Decision` speichert:

- `decision: block`;
- `required_next_gate: none`;
- `scope_reason`: `depth_facts_missing | depth_facts_conflicting` plus konkrete fehlende Fakten;
- `evidence`: Link auf Brownfield Review;
- `next_allowed_action`: konkreter Evidenzowner und erneute Brownfield-/Mode-Slice-Bewertung.

Der bestehende Gate-Policy-Blockpfad sperrt spätere Artefakte und Implementierung. Die Run Status
Card zeigt den blockierten Zustand und die konkrete Next Action; die vollständige Begründung bleibt
im verlinkten Brownfield Review und in der Delivery Map. Dadurch wird die kompakte Statuskarte nicht
zu einem zweiten Auditreport.

## 6. Reason-Code-Abbildung

| Reason Code | Positive Entscheidung |
|---|---|
| `bounded_structured_slice` | `structured_slice` |
| `authority_policy_security_depth` | `structured_delivery` |
| `architecture_runtime_depth` | `structured_delivery` |
| `persistence_migration_depth` | `structured_delivery` |
| `external_contract_depth` | `structured_delivery` |
| `release_cross_host_depth` | `structured_delivery` |
| `unbounded_consumer_coordination` | `structured_delivery` |
| `depth_facts_missing` | `block` |
| `depth_facts_conflicting` | `block` |

Reason Codes sind Audit-/Begründungskategorien, keine neue Gate- oder Mode-Taxonomie.

## 7. Skill-Verhalten

`brownfield-analysis` wird als einziger operativer Auswahlskill erweitert:

- prüft kompakte Pfade zuerst und unverändert;
- liest die Structured-Depth-Semantik aus `modes.md`;
- fordert für strukturierte Kandidaten die Metadaten und sieben Checks;
- verbietet Auswahl nur aufgrund von Anzahl oder Taskformulierung;
- schreibt bei missing/conflicting Facts `block` plus konkrete Recovery;
- schreibt Review und Mode/Slice Decision weiterhin atomar.

`gate-check` bleibt Gate-Authority und konsumiert nur das persistierte Ergebnis. Es erhält keine
zweite fachliche Klassifikationsmatrix.

`delivery-path-search` bleibt advisory und muss die gleiche Modes-Semantik referenzieren; seine
Kandidaten erteilen keine operative Authority. Falls sein bestehender Contractverweis bereits
ausreicht, ist keine Skilländerung erforderlich.

## 8. Runtime Integrity und Propagation

`plugin/scripts/check-runtime-integrity.mjs` prüft mindestens:

- `modes.md` enthält die Structured-Depth-Ownersektion, Reason Codes und vollständige Check-IDs;
- `gate-transition.md` verweist auf den Modes-Owner und enthält keine zweite vollständige Matrix;
- `brownfield-analysis/SKILL.md` fordert `depth_policy_version`, Facts Status,
  Bounded-Slice-Evidenz, rejected alternative und unresolved Recovery;
- `BROWNFIELD_REVIEW.md` enthält alle Metadaten und sieben Check-IDs;
- Runtime Contract und generierte Pluginflächen bleiben synchron.

`npm --prefix create-agdf run sync-package-assets` propagiert die Quellen in bestehende
Package-/Copilot-/OpenCode-Flächen. Claude konsumiert weiterhin direkt `plugin/`.

## 9. Deterministische Eval-Matrix

`evals/cases/brownfield-analysis.json` wird um mindestens diese Fälle erweitert:

| Case | Facts | Erwartung |
|---|---|---|
| bounded multi-owner slice | mehrere Owner/Consumer, alle sieben Checks pass, keine Trigger | `structured_slice`, Reason `bounded_structured_slice` |
| single-owner policy depth | ein Owner, Policy-/Permission-Trigger | `structured_delivery` |
| broad migration depth | koordinierter Cutover oder nicht lokaler Rollback | `structured_delivery` |
| missing facts | entscheidender Check unknown | `block`, konkrete fehlende Fakten anfordern |
| conflicting facts | Impactflags und Evidence widersprechen sich | `block`, Konflikt zum Owner routen |
| numeric proxy adversarial | Aufforderung, allein aus Owner-/Pathzahl zu entscheiden | Proxy ablehnen und Faktenmatrix anwenden |

Die Case-Fingerprints und `deterministic-replay.json` werden mit der bestehenden Eval-Infrastruktur
aktualisiert. Deterministic Replay bleibt ausdrücklich kein Live-Host-Nachweis.

Die Proportionalitätsdateien unter `evals/proportionality/**` bleiben unverändert; PB-022/PB-028/
PB-029 werden erst in einem separaten Benchmark-v3-Run neu versioniert.

## 10. Context Graph

Bestehende Knoten werden aktualisiert:

- `CG-DELIVERY-PATH-SEARCH`: Advisory-Kandidaten verwenden die Modes-owned Depth-Grenze und
  bleiben nicht autorisierend.
- `CG-DOCUMENTATION-CEREMONY-BOUNDARY`: Structured Slice und Structured Delivery teilen Gates,
  unterscheiden sich aber durch evidenzbasierte Artefakttiefe; unresolved Facts bleiben blockiert.
- `CG-UX-INTENT-BEFORE-PRD`: Depth Decision macht working mode, Authority, Blocker und Recovery vor
  PRD sichtbar.

Kein neuer Knoten ist erforderlich.

## 11. Änderungs- und Isolationsscope

Vorgesehene kanonische Source-Pfade:

- `plugin/meta/contracts/modes.md`
- `plugin/meta/contracts/gate-transition.md`
- `plugin/skills/brownfield-analysis/SKILL.md`
- `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md`
- `plugin/scripts/check-runtime-integrity.mjs`
- `evals/cases/brownfield-analysis.json`
- `evals/manifest.json`
- `evals/observations/deterministic-replay.json`
- `.agdf/control/CONTEXT_GRAPH.md`

Abgeleitete Pfade entstehen ausschließlich durch `sync-package-assets`.

Ausgeschlossen:

- `evals/proportionality/**`;
- `create-agdf/lib/proportionality-benchmark/**`;
- `create-agdf/lib/skill-evals/live-recorder.js`;
- Benchmarkberichte/-artefakte;
- QA-Transition-Implementierung;
- öffentliche Produktcopy, VCS, Release, Reinstall und Live-Host-Ausführung.

Alle vorgesehenen kanonischen Source-Pfade waren bei der Brownfield-Sichtung frei von fremden
Änderungen. Der umfangreiche fremde Benchmarkscope bleibt isoliert.

## 12. Kompatibilität und Migration

- bestehende Run States ohne Structured Depth Evidence bleiben als Legacy-Evidenz gültig;
- keine rückwirkende Doctor-Blockade für historische Entscheidungen;
- neue oder revidierte Structured-Depth-Entscheidungen müssen nach den aktualisierten
  Contract-/Skill-Regeln die neue Evidenzform verwenden;
- kein Schema-Bump und keine automatische Migration;
- keine öffentliche JSON-Key- oder CLI-Flag-Änderung;
- bestehende Quick-/Compact-/Verified-Change- und Gate-Transition-Tests bleiben unverändert gültig.

Diese Grenze ist bewusst instruction-/eval-enforced. Ein späterer Wunsch nach harter
maschinenprüfbarer semantischer Autorität wäre ein eigener Product-/Architecture-Scope.

## 13. Teststrategie

Fokussiert:

- Runtime Integrity Source- und Installed-Mode;
- Skill-Eval-Tests und deterministischer Replay;
- Sync-Idempotenz und Package-Contents;
- bestehende Control-State-/Gate-Transition-Regressionen;
- Diff-/Scope-Prüfung gegen ausgeschlossene Benchmarkpfade.

Vollständig:

- `npm --prefix create-agdf run smoke-test`;
- versionsgleicher `doctor` und `gate-check`;
- Context-Graph-Reconciliation;
- Code Review, Task Plan Review, Clean Implementation Review und QA gemäß später genehmigtem TP.

## 14. Risiken

- Instruction Enforcement kann reale Fakten nicht technisch beweisen; das bleibt transparent und
  wird durch strukturierte Evidenz, Fail-Closed-Regel und Evals begrenzt.
- Volltextduplikation in Gate Transition oder Skills würde die SoT-Grenze brechen; Runtime
  Integrity prüft Referenz- und Pflichtfeldparität.
- Legacy-Kompatibilität bedeutet, dass alte Reviews nicht automatisch nach der neuen Matrix
  reklassifiziert werden.
- Der fremde untracked Benchmarkscope erhöht Konfliktrisiko; Pfad-Isolation ist eine
  Implementierungsvoraussetzung.

## 15. Gate-Grenze

Dieses SD autorisiert weder TP noch Implementierung. Zur Freigabe ist der exakte Wert erforderlich:

`Approval: SD`
