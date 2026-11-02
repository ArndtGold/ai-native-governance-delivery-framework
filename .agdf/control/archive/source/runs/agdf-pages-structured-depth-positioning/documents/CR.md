# Code Review: Structured Depth Positioning auf AGDF Pages

Status: done
Run: `agdf-pages-structured-depth-positioning`
Date: 2026-07-29
Reviewer: agent

## Code Review

- decision: pass
- findings:
  - [advisory] pages/src/pages/index.astro:476 — `#intake` heading „Choose the Lightest Safe Delivery Path" now covers 5 paths including Structured Delivery (heaviest). Heading still works (choosing the appropriate path from lightest to heaviest) but could be reconsidered in a future content pass. Not a defect.
- missing_evidence: SDP-13 (Responsive Browserprüfung) und SDP-14 (Accessibility-Prüfung) erfordern manuelle Browserprüfung — für QA sichtbar, nicht für CR blockierend.
- risks: keine blockierenden oder revise-Risiken im Diff identifiziert.
- required_next_step: QA-Gate (inkl. SDP-13/SDP-14 manuelle Browserprüfung).

## Reviewed Scope

| File | Lines changed | Coverage |
|---|---|---|
| `pages/src/data/site.ts` | `workflowSteps[2].desc`, `requirementPaths` (3→5 entries), `gateFlow[2].desc`, `gateMapPaths.structured` (`note` + `depthHint`), `gateModeMatrix` (6 entries, labels/decisions kanonisch), `depthChoice` (neu) | full diff |
| `pages/src/pages/index.astro` | Import (`depthChoice`), neue Section `#depth-choice` (97 lines), Gate-Map `depthHint`-Block (3 lines) | full diff |

## Correctness

- `depthChoice`-Datenstruktur: Property-Zugriffe in `index.astro` (`depthChoice.compactPaths.map`, `depthChoice.structuredPaths.sharedGateChain`, `depthChoice.structuredPaths.structuredSlice.boundedChecks.map`, `depthChoice.structuredPaths.structuredDelivery.fullDepthFamilies.map`, `depthChoice.depthUnresolved.*`, `depthChoice.proxyProhibition`, `depthChoice.modesContractOwner`, `depthChoice.projection`) — alle korrekt, `astro check` 0 errors.
- `gateMapPaths.structured.depthHint` — neues Feld, korrekt referenziert im Gate-Map-Block.
- `gateModeMatrix` — nicht in `index.astro` gerendert (grep bestätigt); keine Render-Abhängigkeit, keine Regression.
- `requirementPaths`-Erweiterung von 3 auf 5 Einträge: `.map()` mit dynamischem `data-reveal-delay={String(i + 1)}` — keine hardcoded Card-Anzahl, keine Layout-Abhängigkeit.

## Security

- Keine User-Input-Verarbeitung, kein State-Management, keine Datenhandhabung — statische Content-Section.
- Keine neuen externen Links, keine neue Skripte, keine neue Interaktivität.

## Regression And Compatibility

- `gateModeMatrix` wird nicht in `index.astro` gerendert — Änderung hat keine Render-Auswirkung.
- `gateMapPaths.structured.note` Text geändert, `depthHint` hinzugefügt — bestehende `.note`-Referenz bleibt funktional; `depthHint` ist additiv.
- `requirementPaths`-Grid (`lg:grid-cols-2`): 5 Karten als 2+2+1 — visuell unausgewogen aber funktional korrekt; keine Breakage.
- `workflowSteps[2].desc` und `gateFlow[2].desc`: Text-Only-Änderung, keine Strukturbrechung.
- Bestehende Anker (`#intake`, `#workflow`, `#gate-flow`) erhalten; neue Section-ID `#depth-choice` additiv.
- `evaluationEvidence.ts` nicht geändert — Build-Zeit-Validierung unverändert.
- `astro check` 0 errors, `astro build` erfolgreich, `git diff --check` clean.

## Maintainability

- `depthChoice` folgt bestehender Export-Konvention in `site.ts` (typed object literal).
- Neue Section verwendet bestehende Patterns (`.surface`, `data-reveal`, `font-mono`-Eyebrows, Grid-Layouts, Badge-Listen).
- Semantisches HTML: `<section>`, `<h2>`/`<h3>`, `<ol>` für nummerierte Checks, `<ul>` für Badge-Liste, `<code>` für Contract-Pfad.
- Keine parallele Struktur: `gateModeMatrix` nicht gerendert; kanonische Werte fließen in `depthChoice` und `requirementPaths` ein.
- Keine Fallbacks, Guards, Defaults oder Shims eingeführt.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | advisory | content_coherence | open | `#intake` heading covers full spectrum now (5 paths including heaviest) | Future content pass; not blocking QA |
