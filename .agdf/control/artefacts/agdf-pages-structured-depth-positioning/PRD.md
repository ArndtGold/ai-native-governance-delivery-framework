# Product Requirements: Structured Depth Positioning auf AGDF Pages

## Status

- status: ready_for_approval
- gate: PRD
- gate approval: open
- derived_from: `UR.md` (Revision 1), `BROWNFIELD_REVIEW.md`
- run: `agdf-pages-structured-depth-positioning`
- mode_slice_decision: structured_slice
- date: 2026-07-29

## Document Control

- work item: `agdf-pages-structured-depth-positioning`
- source: `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/UR.md`
- brownfield basis: `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/BROWNFIELD_REVIEW.md`
- canonical owner for depth semantics: `plugin/meta/contracts/modes.md` `Structured Depth Decision`
- pages data owner: `pages/src/data/site.ts`
- pages render owner: `pages/src/pages/index.astro`

## 1. User Outcome

Besuchern der AGDF-Pages-Website soll die proportionale Pfadauswahl korrekt, verständlich und überprüfbar erklärt werden. Sie sollen erkennen:

- wie Quick/Compact, Verified Change, Structured Slice und Structured Delivery sich unterscheiden;
- dass Structured Slice und Structured Delivery dieselbe Gate-Kette mit unterschiedlicher Artefakttiefe verwenden;
- dass Full Depth aus belegter Wirkung folgt, nicht aus Produktsemantik, UX oder Zahlen allein;
- dass fehlende oder widersprüchliche Fakten zu `block`/Recovery führen, nicht zu einer scheinbar sicheren Full-Delivery-Klassifikation;
- dass Datei-, Owner-, Consumer-, Task- oder Derived-Path-Zahlen keine alleinige Entscheidungsschwelle sind.

Pages erklärt die proportionale AGDF-Pfadauswahl als Projektion des Modes Contracts, ohne selbst zweite normative Policy zu werden.

## 2. Product Behavior

### 2.1 Canonical Mode Values

Die Public-Copy in `pages/src/data/site.ts` verwendet die kanonischen Modewerte aus `modes.md`:

- `Quick task` (human-facing: Compact Delivery nach Brownfield-Review-Auswahl)
- `Verified Change`
- `Structured Slice` (`structured_slice`)
- `Structured Delivery` (`structured_delivery`)
- `Blocked` / `Depth Unresolved` (`block`, `depth_unresolved`)

Die bestehenden nicht-kanonischen Labels („Bounded slice", „Controlled Delivery") werden durch kanonische Werte ersetzt.

### 2.2 Comparison Surface „How AGDF chooses depth"

Eine neue kompakte, menschenlesbare Vergleichsfläche auf der Landingpage erklärt, wie AGDF die Tiefe wählt:

- trennt kompakte Pfade (Quick/Compact, Verified Change) von strukturierten Pfaden (Structured Slice, Structured Delivery);
- unterscheidet Structured Slice und Structured Delivery anhand belegter Wirkung, nicht anhand von Zahlen;
- erklärt auf angemessener Marketingtiefe die sechs Full-Depth-Wirkungsfamilien (Authority/Policy/Security, Architecture/Runtime, Persistence/Migration, External/Public Contract, Release/Cross-Host, Unbounded Consumer/Owner Coordination) als Trigger für Structured Delivery;
- erklärt die sieben Bounded-Slice-Bedingungen als Kriterien für Structured Slice, ohne eine zweite normative Vollkopie der Check-Matrix zu erstellen;
- erklärt `depth_unresolved` als `block` mit fehlender Evidenz, bekanntem Owner where known und erneuter Bewertung — nicht als sichere Full-Delivery-Klassifikation;
- erklärt das Proxy-Verbot: Datei-, Owner-, Consumer-, Task- oder Derived-Path-Zahlen sind keine alleinige Entscheidungsschwelle.

Die Vergleichsfläche darf `gateModeMatrix` nicht duplizieren. `gateModeMatrix` wird kanonisch gerendert oder durch die Vergleichsfläche ersetzt; es entsteht keine parallele Struktur.

### 2.3 Gate Map Precision

`gateMapPaths.structured` in `site.ts` und die Gate-Map-Section in `index.astro` präzisieren, dass Structured Slice und Structured Delivery dieselbe Gate-Reihenfolge verwenden und sich nur in der Artefakttiefe unterscheiden. Die bestehende einzelne „Structured path"-Darstellung wird ergänzt oder ersetzt, um die gemeinsame Gate-Kette und den Tiefenunterschied sichtbar zu machen.

### 2.4 Modes Contract Boundary

Pages benennt den Modes Contract als alleinigen normativen Owner und grenzt sich selbst als erklärende Projektion ab. Pages erfindet keine neuen Modi, Gates, Approval-Werte, CLI-Flags oder Schema-Felder.

### 2.5 Repository-Derived Evaluation Numbers

`evaluationEvidence.ts` bleibt die alleinige Quelle für Evaluationszahlen und leitet diese zur Build-Zeit aus Plugin-Definition und Eval-Cases ab. Keine Live-Host-Evidenz wird behauptet. Nach der Corpus-Erweiterung bleibt die bestehende Build-Zeit-Validierung erhalten.

## 3. Requirements

### PRD-01: Modes Contract as sole normative owner

Pages benennt `plugin/meta/contracts/modes.md` als alleinigen normativen Owner der Structured-Depth-Entscheidung und grenzt sich selbst als erklärende Projektion ab. Pages erfindet keine neue Produktpolicy.

### PRD-02: Canonical mode values

Die Public-Copy in `site.ts` (`gateModeMatrix`, `requirementPaths`, `workflowSteps`, `gateFlow`) verwendet die kanonischen Modewerte `structured_slice`, `structured_delivery`, `verified_change` und `depth_unresolved`/`block`. Nicht-kanonische Labels („Bounded slice", „Controlled Delivery") werden ersetzt.

### PRD-03: Verified Change visibility

Verified Change wird als separater maschinenvalidierter kompakter Pfad sichtbar, ohne seine Record-Felder, Übergangstabelle oder Vollpolicy zu duplizieren.

### PRD-04: Same gate chain, different artefact depth

Structed Slice und Structured Delivery verwenden sichtbar dieselbe Gate-Kette. Die Gate-Map zeigt die gemeinsame Reihenfolge und den Unterschied in der Artefakttiefe, nicht zwei getrennte Gate-Sequenzen.

### PRD-05: Full depth from evidenced effect

Full Depth (Structured Delivery) wird als wirkungsbasiert erklärt: eine der sechs belegten Wirkungsfamilien ist entscheidend wegen ihrer Wirkung, nicht wegen einer numerischen Zählung. Die sechs Wirkungsfamilien werden auf angemessener Marketingtiefe genannt, ohne jede Trigger-Bedingung zu kopieren.

### PRD-06: Bounded slice conditions

Die sieben Bounded-Slice-Bedingungen werden als Kriterien für Structured Slice erklärt, ohne eine zweite normative Vollkopie der Check-Matrix. Pages erklärt, dass alle sieben als `pass` belegt sein müssen und kein Full-Depth-Trigger vorliegen darf.

### PRD-07: Depth unresolved as block

`depth_unresolved` wird als `block` mit fehlender oder widersprüchlicher Evidenz, bekanntem Owner where known und erneuter Bewertung erklärt. Pages erklärt, dass fehlende Fakten nicht zu `structured_delivery` defaulten.

### PRD-08: Proxy prohibition

Pages erklärt sichtbar, dass Datei-, Owner-, Consumer-, Task- oder Derived-Path-Zahlen keine alleinige Entscheidungsschwelle sind und nie als Threshold für einen strukturierten Modus verwendet werden.

### PRD-09: No parallel structure

Die Vergleichsfläche „How AGDF chooses depth" darf `gateModeMatrix` nicht duplizieren. `gateModeMatrix` wird kanonisch gerendert oder durch die Vergleichsfläche ersetzt; `gateMapPaths` und die Vergleichsfläche behalten unterschiedliche Rollen (Gate-Map = welche Gates in welcher Reihenfolge; Vergleichsfläche = wie die Tiefe gewählt wird).

### PRD-10: Repository-derived evaluation evidence

Evaluationszahlen bleiben repository-derived über `evaluationEvidence.ts`. Keine Live-Host-Evidenz wird behauptet. Die bestehende Build-Zeit-Validierung bleibt erhalten.

### PRD-11: Responsive and accessible rendering

Die neue Vergleichsfläche und die präzisierte Gate-Map bleiben auf kleinen Screens lesbar. Akzeptanzsignale: responsives Verhalten, Desktop-Darstellung, Tastatur-Erreichbarkeit, Kontrast und semantisches HTML innerhalb des vorhandenen Pages-Designsystems.

### PRD-12: Existing-site integrity

Bestehende Section-Anker, Navigation, Styling-Konventionen, responsives Layout und Build-Verhalten bleiben erhalten. Keine neue Route, kein neues Komponentensystem, kein neuer Runtime-Entscheidungspunkt.

## 4. Acceptance Criteria

| ID | Acceptance criterion | Evidence |
|---|---|---|
| AC-01 | Modes Contract ist als alleiniger normativer Owner benannt; Pages ist als erklärende Projektion abgegrenzt. | Rendered Pages inspection |
| AC-02 | Kanonische Modewerte `structured_slice`, `structured_delivery`, `verified_change`, `depth_unresolved`/`block` sind in `site.ts` und im Render sichtbar; nicht-kanonische Labels sind ersetzt. | Data and rendered Pages inspection |
| AC-03 | Verified Change ist als separater maschinenvalidierter kompakter Pfad sichtbar, ohne Record-Felder oder Vollpolicy zu duplizieren. | Rendered Pages inspection |
| AC-04 | Structured Slice und Structured Delivery zeigen sichtbar dieselbe Gate-Kette mit unterschiedlichem Artefakt-Tiefen-Hinweis. | Rendered Pages inspection |
| AC-05 | Full Depth wird als wirkungsbasiert erklärt; die sechs Wirkungsfamilien werden auf Marketingtiefe genannt. | Rendered Pages inspection |
| AC-06 | Die sieben Bounded-Slice-Bedingungen sind als Kriterien für Structured Slice erklärt, ohne zweite normative Vollkopie. | Rendered Pages inspection |
| AC-07 | `depth_unresolved` ist als `block` mit fehlender Evidenz, Owner und Re-Evaluation erklärt; kein Default zu `structured_delivery`. | Rendered Pages inspection |
| AC-08 | Das Proxy-Verbot (Zahlen als keine alleinige Schwelle) ist sichtbar. | Rendered Pages inspection |
| AC-09 | Keine parallele Struktur: `gateModeMatrix` ist gerendert oder ersetzt, nicht dupliziert; `gateMapPaths` und Vergleichsfläche behalten unterschiedliche Rollen. | Data and page diff review |
| AC-10 | Evaluationszahlen bleiben repository-derived; keine Live-Host-Evidenz behauptet; Build-Zeit-Validierung erhalten. | `evaluationEvidence.ts` und Build-Output |
| AC-11 | Vergleichsfläche und präzisierte Gate-Map sind auf kleinen Screens lesbar; Tastatur, Kontrast und semantisches HTML intakt. | Sichtbare Browserprüfung (Desktop + mobile viewport) |
| AC-12 | Pages type/check und production build bestehen; bestehende Anker, Navigation und Styling bleiben erhalten. | `astro check` und `astro build` |

## 5. Scope And Out Of Scope

### In scope

- `pages/src/data/site.ts`: kanonische Modewerte in `gateModeMatrix`, `requirementPaths`, `workflowSteps`, `gateFlow`; `gateMapPaths.structured`-Präzisierung.
- `pages/src/pages/index.astro`: neue Vergleichsfläche „How AGDF chooses depth"; präzisierte Gate-Map-Section; kanonisches Rendering von `gateModeMatrix` oder Ersatz.
- `pages/src/data/evaluationEvidence.ts`: Konsistenzprüfung nach Corpus-Erweiterung, keine semantische Änderung erwartet.
- Fokussierte Copy-/Daten-/Render-/Build-Tests sowie sichtbare Browserprüfung.

### Out of scope

- Keine Änderung an `plugin/meta/contracts/modes.md`, Gate Transition, Skills oder Runtime.
- Keine neue Mode-, Gate-, Approval-, CLI- oder öffentliche Schemasemantik.
- Keine Benchmark-v3-Kalibrierung oder historische Umwertung.
- Kein vollständiges Pages-Redesign, keine neue Route, kein neues Komponentensystem.
- Keine zweite Produktpolicy in Pages.
- Keine Release-, Deploy-, VCS- oder Reinstall-Aktion.
- Keine Behauptung garantierter semantischer Modellbefolgung auf Live-Hosts.
- Keine Änderung an `plugin/**`, `create-agdf/**` oder ausführbarem Code.

## 6. Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Pages wird zweite Policy-Authority. | high | PRD-01 benennt Modes Contract als alleinigen Owner; Vergleichsfläche projiziert nur. |
| Zu viel Detail macht Marketingseite zur Runtime-Doku. | medium | PRD-05/PRD-06 fordern Marketingtiefe; keine Vollkopie der Trigger/Checks. |
| Responsive Vergleichsfläche auf kleinen Screens unlesbar. | medium | PRD-11/AC-11 fordern mobile, Kontrast, Tastatur, semantisches HTML. |
| `gateModeMatrix` und Vergleichsfläche duplizieren sich. | medium | PRD-09/AC-09 verbieten parallele Struktur; kanonisch rendern oder ersetzen. |
| Evaluationszahlen inkonsistent nach Corpus-Erweiterung. | low | PRD-10/AC-10 erhalten Build-Zeit-Validierung. |

## 7. Implementation Boundary

Implementierung ist auf bestehende Pages-Daten und Section-Komposition beschränkt. Kein neuer Content-Owner, keine neue Route, kein neues Komponentensystem, kein neuer Runtime-Entscheidungspunkt. Die Vergleichsfläche nutzt vorhandene `.surface`/`.card-glow`/`.gate-node`/Grid-Patterns.

## 8. Non-Goals

- Keine neue `bug_lightweight`- oder `verified_change`-Mode/Slice Decision oder ausführbare Kontrollpfad-Änderung.
- Keine Änderung an Runtime-Contract-Semantik, Agent-Routing, Approvals oder Skill-Verhalten.
- Keine UX-Intent-Definition (UI/UX-Impact `low`, Intent eindeutig; Brownfield Review hat `ux_intent_definition_required: no` festgelegt).
- Keine Änderung an Plugin-, Runtime-Contract- oder Skill-Dateien.

## 9. Required Next Step

Dieses PRD prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: PRD`

Danach folgt Solution Design in Slice-Tiefe (Eigentumsmodell, Datenstruktur, Render-Section-Struktur, Copy-Texte, Responsive-/Accessibility-Umsetzung). Es ist noch keine Implementierung erlaubt.
