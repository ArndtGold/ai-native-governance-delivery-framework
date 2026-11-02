# SD: Cross-Surface Skill Target Preflight

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD Revision 1
Date: 2026-09-03
Owner: Arndt Gold

## 1. Solution Overview

Die bestehende Task Target Resolution wird zur einzigen ausführbaren Preflight-Grenze für direkte
AGDF-Skill-Aufrufe erweitert. Jeder kanonische Skill verweist vor seinem fachlichen Workflow auf
diese Grenze. Ein unresolved Ergebnis rendert ausschließlich die bestehende lokalisierte Task Target
Orientation und beendet den Skill für den aktuellen Turn. Erst ein resolved Governance-Ziel erlaubt
Repository-Aktivierung, Run-Auswahl und das Lesen skill-spezifischer Evidenz.

`qa-gate` erhält zusätzlich einen expliziten Post-Resolution-Pfad: Es wählt genau einen passenden
Run, liest dessen TP-, Brownfield-, Review-, Test- und Finding-Evidenz aus `.agdf/control/` und trifft
danach genau eine QA-Entscheidung. Fehlende oder widersprüchliche Evidenz wird gemäß Quality Contract
als `revise` oder `block` behandelt. Die vollständige Run Status Card bleibt bei `gate-check`.

Die vier Hostprofile erhalten keine eigenen Implementierungen. Die bestehenden Generatoren
projizieren dieselben kanonischen Skill- und Contract-Quellen nach Codex, Claude Code, GitHub Copilot
und OpenCode.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design responsibility |
|---|---|---|
| Target semantics and ordering | `plugin/meta/contracts/task-target-resolution.md` | Direct-Invocation-Preflight, Authority-Precedence und terminale unresolved Zustände |
| Gate and run legality | `plugin/meta/contracts/gate-transition.md`; `gate-check` | Run-Auswahl, Gate-Status und erlaubte nächste Aktion |
| Target and status presentation | `plugin/meta/contracts/interaction.md`; `create-agdf/lib/interaction-presentation.js` | Einzige Renderer für Task Target Orientation und Run Status Card |
| QA evidence and decision | `plugin/meta/contracts/quality.md`; `plugin/skills/qa-gate/SKILL.md` | Evidenzverbrauch und alleinige Entscheidung `pass | revise | block` |
| Canonical direct skill instructions | `plugin/skills/*/SKILL.md` | Kurzer Verweis auf den gemeinsamen Preflight vor dem jeweiligen Workflow |
| Machine preflight | `create-agdf/lib/task-target-resolution.js`; `target-check` | Bestehende normalisierte resolved/unresolved Auswertung |
| Cross-surface projection | `create-agdf/scripts/sync-package-assets.js`; `plugin/meta/agdf-plugin.definition.json` | Ableitung der Codex-, Claude-, Copilot- und OpenCode-Profile |
| Drift detection | `plugin/scripts/check-runtime-integrity.mjs`; Skill-Evals und Conformance-Tests | Vollständigkeit, identische Semantik und verbotene Host-Forks |

## 3. Architecture Decisions

### AD-01 — One executable preflight contract

`task-target-resolution.md` erhält einen Abschnitt `Direct Skill Invocation Preflight`. Er besitzt
die operative Reihenfolge und die zwei vorhandenen `target-check`-Aufrufformen:

- context-only mit expliziter Chatsprache, wenn kein belastbares Ziel existiert;
- selected-target mit Target Source, absolutem Primary Target und Working Directory, wenn ein Ziel
  semantisch ausgewählt ist.

Der Abschnitt verbietet cwd-Autorität, implizite Hostpfade, Registry-Installationen und nachgelagerte
Skill-Arbeit bei unresolved. Die bestehende semantische Resolution Result bleibt unverändert.

### AD-02 — Every canonical skill is direct-invocation safe

Alle zehn Skills aus `agdf-plugin.definition.json` konsumieren den Target-Contract und den
Interaction-Contract. Vor ihrem Workflow führen sie dieselbe kurze Pflicht aus:

1. Ziel auflösen oder revalidieren.
2. Bei unresolved die kanonische Orientation unverändert ausgeben, genau die Recovery-Aktion
   anfordern und terminal stoppen.
3. Bei resolved ausschließlich das abgeleitete Governance-Ziel für Repository-, Run- und
   Evidenzzugriff verwenden.

`gate-check` verliert seine lokal duplizierte operative Preflight-Regel und verweist auf den
gemeinsamen Contract. Skill-spezifische Gate- oder Qualitätslogik bleibt in den jeweiligen Skills.

### AD-03 — QA self-discovers durable evidence

Nach resolved Target führt `qa-gate` folgende Reihenfolge aus:

1. Governance-Repository über den resolved Report übernehmen.
2. Kanonischen Run aus explizitem Run-Hinweis oder eindeutiger aktiver Auswahl bestimmen.
3. Bei mehrdeutiger Run-Auswahl vor QA stoppen und nur Run-Klärung anfordern.
4. Aktuelles Gate prüfen; QA nur ausführen, wenn der Run QA erlaubt.
5. Approved TP, Task Plan Review, Brownfield Analysis, Clean Review, Code Review, Tests,
   Normalized Findings und Context-Graph-Effekt aus durablem Control lesen.
6. Genau `pass`, `revise` oder `block` plus einen zulässigen nächsten Schritt erzeugen.

Der Benutzer muss vorhandene Repository-Evidenz nicht erneut als Links oder Chattext liefern.
Externes oder nicht lesbares Material bleibt eine sichtbare Evidenzlücke und wird nicht erfunden.

### AD-04 — Presentation ownership remains separated

- Unresolved Target: Task Target Orientation vom bestehenden Renderer.
- Operativer Run-Status oder Approval-Orientierung: ausschließlich `gate-check`.
- QA: Quality Readiness und QA-Entscheidung vom bestehenden Quality-/QA-Owner.

`qa-gate` darf weder eine Run Status Card rekonstruieren noch eine native/interaktive QA-Karte
versprechen. Hostinteraktionen bleiben Präsentationsadapter ohne Approval-Autorität.

### AD-05 — Canonical source, generated host projections

Es entstehen keine Dateien wie `qa-gate-codex`, `qa-gate-claude` oder `qa-gate-copilot` als
semantische Owner. Die bestehenden Sync-Pfade erzeugen Hostnamen und relative Contract-Pfade aus
den kanonischen Quellen. Cross-Surface-Gleichheit wird am erzeugten Inhalt geprüft, nicht behauptet.

### AD-06 — Fail-closed degradation

- Kein exact-version surface-local Validator: agent-native Auflösung nur soweit belegbar;
  `machine_validation: unavailable`, keine Installation und kein Registry-Zugriff.
- Kein renderbares Target: Zielklärung ohne Repository-Aktivierung.
- Mehrere Runs: Run-Klärung ohne QA-Entscheidung.
- Fehlende QA-Evidenz nach eindeutigem QA-Kontext: `revise` oder `block` gemäß Quality Contract.
- Geladener Host mit alten Bytes: als Host-Evidenzlücke, nicht als bestandene Parität behandeln.

## 4. Integration Points

| Integration point | Change type | Compatibility boundary |
|---|---|---|
| `task-target-resolution.md` | extend | Keine Änderung an Result-Schema oder Reason Codes |
| zehn kanonische Skill-Dateien | extend/refactor | Fachliche Skill-Outputs und Gate-Owner bleiben unverändert |
| `qa-gate/SKILL.md` | extend | Entscheidung bleibt exakt `pass | revise | block` |
| `gate-check/SKILL.md` | refactor | Bestehendes Verhalten bleibt, lokale Preflight-Duplikation entfällt |
| Runtime Integrity | extend | Prüft Preflight-Verweis, terminale Grenze und Ownertrennung je Skill |
| Skill-Eval-Corpus | extend | Direkte unresolved Fälle je Skill und QA-Self-Discovery-Fälle |
| Profilgenerierung | unchanged reuse | Erzeugt dieselben kanonischen Änderungen für vier Hosts |
| Hostinstallationen | evidence only | Keine automatische Installation; jede Fresh-Session separat autorisieren und beobachten |

## 5. Constraints And Compatibility

- `target-check`-CLI, JSON-Schema, Reason Codes und Exit-Semantik bleiben kompatibel.
- Der Working Directory bleibt Kontext und erhält keine Zielautorität.
- Exact `Approval: <GateName>` und Same-Run/Gate/Revision-Revalidierung bleiben unverändert.
- Repository-, Bundle-, Installations- und Fresh-Session-Evidenz bleiben getrennt.
- Canonical Skills bleiben Agent-Skills-konform und innerhalb bestehender Profilbudgets oder erhalten
  eine begründete neue Baseline.
- Die unversionierte Bilddatei außerhalb dieses Runs bleibt unangetastet.
- Keine automatischen VCS-, Release-, Installations- oder externen Hostaktionen.

## 6. Test And Evidence Strategy

### Deterministic contract evidence

- Runtime Integrity verlangt in jedem kanonischen Skill den gemeinsamen Direct-Invocation-Preflight,
  Target- und Interaction-Contract sowie die terminale unresolved Grenze.
- Negative Prüfungen erkennen lokale Resolver, cwd-Fallbacks, QA-Statuskartenrekonstruktion und
  manuelle Host-Forks.

### Skill behavior evidence

- Für jeden Skill existiert mindestens ein adversarial unresolved Direct-Invocation-Fall.
- `qa-gate` erhält zusätzlich:
  - repo-less/no-target -> Orientation und terminaler Stopp;
  - resolved/eindeutiger QA-Run -> Repository-Evidenz selbst laden und Entscheidung ausgeben;
  - resolved/mehrere Runs -> Run-Klärung ohne QA-Fiktion;
  - fehlende Reviews -> `revise` oder `block`, keine freie Evidenzliste;
  - Host-/Approval-Bait -> keine interaktive Karte oder implizite Freigabe.

### Generated-profile evidence

- Sync-Idempotenz und Agent Skills Conformance für Codex, Claude, Copilot und OpenCode.
- Semantischer Vergleich der Preflight-Pflicht und relativen Contract-Verweise.
- Paketinhalt, Runtime Integrity und vollständiger `create-agdf` Smoke-Test.

### Host evidence

- Separater Fresh-Session-Test pro beanspruchtem Host.
- Repo-loser Direktaufruf und resolved Repository-Aufruf werden getrennt beobachtet.
- Ein nicht verfügbarer oder nicht authentifizierter Host bleibt offen und wird nicht aus anderen
  Hosts abgeleitet.

## 7. Risks And Open Questions

- Skill-Instruktionen können durch Host-Routing unterschiedlich geladen werden; direkte
  Fresh-Session-Evidenz bleibt deshalb erforderlich.
- Zehn Skill-Verweise erhöhen Textmenge; TP muss Payload-Wachstum messen und begrenzen.
- `qa-gate` darf eine Run-Ambiguität nicht fälschlich als QA-`block` persistieren, bevor ein Run
  ausgewählt ist.
- Die bestehende deutsche Statuskarte dieses neuen Runs ist wegen unregistrierter dynamischer Werte
  fail-closed. Das ist ein transparenter Presentation-Befund, aber keine Berechtigung, den
  Statuskarten-Owner innerhalb dieses Scopes umzubauen.
- Keine offene Produktentscheidung blockiert TP; konkrete Dateigruppen und Testfälle sind bestimmt.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
