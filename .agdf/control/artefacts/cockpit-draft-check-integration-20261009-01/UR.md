# UR: Draft checks in the Cockpit alongside documented approvals

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Owner: Arndt Gold
Date: 2026-10-09
Run: cockpit-draft-check-integration-20261009-01
Language: en

## Problem

The existing Core/MCP artifact-readiness operation evaluates a selected draft's authoring checks, but the Cockpit does not offer this action or explain its results. Users must depend on agent tool calls to discover missing fields, unresolved decisions and the next correction. The user explicitly requested integrating this capability into the App and its product requirements while refining the documented-approval overview.

The separate cockpit-documented-approvals-20261009-01 Run has approved UR and PRD for compact documented approvals and truthful current-version links. Its PRD does not include draft checking. This supplementary requirement connects draft checking to the same undertaking detail without transferring those approvals or rewriting its approved sources. The currently supported early revision path cannot replace that Run's approved UR at SD; this new scope preserves its exact historical decisions.

## Goal

Users can deliberately check the current supported draft in the existing Cockpit, understand concrete corrections and the next action, and distinguish a successful authoring check from documented approval, current gate eligibility and final QA.

## Affected Users

The existing repository owner and agents inspecting the selected undertaking in the Cockpit. No new host or user population.

## Scope

- Offer Entwurf prüfen for the selected undertaking's current, unapproved UR, PRD, SD or TP draft when the existing Core service supports that exact state. Keep this action in the undertaking/draft context alongside the documented-approval information hierarchy; draft checks must not appear as historical approval rows.
- Reuse the existing Core artifact-readiness owner through a bounded MCP App read interface. The selected target, Run, gate and expected current revision must be explicit or derived from the existing verified reading context. The App may not supply an arbitrary file path or switch target to make a check succeed.
- Expose distinguishable not-yet-checked, checking, passed, corrections-required and unavailable/stale states. A successful result says Entwurfsprüfung bestanden and explains its authoring-check scope. Preserve actual diagnostics and present concrete missing information or decisions and the available next correction; show unavailable information honestly.
- Make the inspected gate, revision and available source identity visible or deliberately inspectable. A result for an older selection, revision or changed source must not remain a current success indicator. Existing reload/retry and deliberate recheck recover supported transient states.
- Keep approval, semantic derivation review, canonical registration, binding presentation and QA authority with their existing owners. The draft check cannot approve, record, modify or advance a gate. A supported empty diagnostic list is not proof of substantive completeness or current permission to implement.
- Preserve narrow/wide reading, keyboard operation, focus, scrolling, source guards and the compact documented-approval overview. Keep the added explanation concise and put technical binding details behind deliberate inspection where they are useful.
- Review the existing Core snapshot and App session/freshness boundaries before choosing a read adapter. Any added App operation must remain selected-context-bound and reuse the same validator, rather than introducing parallel readiness rules or a generic tool/file bridge.

## Non-Goals

No new validator or approval/gate writer, click approval, automatic registration, QA decision, signature, identity proof, historical archive, arbitrary file/shell access or cross-target inspection. No automatic continuous checking or polling requirement. No amendment or transfer of the separate approval-overview Run's approved sources. No broad dashboard redesign, unrelated finding closure, publication, Git action or global installation change. This requirement does not claim implementation, native rendering or approval of this new scope.

## Acceptance Signals

1. The selected supported current draft has an explicit, keyboard-usable Entwurf prüfen action with equivalent narrow/wide access and readable loading/result feedback. Unsupported, approved, missing or unavailable sources show a clear bounded state without offering a misleading working check.
2. Results come from the existing Core authoring checks through MCP. Meaningful complete/incomplete and open-decision cases show the actual outcome, concrete corrections and next action; unavailable information is not guessed.
3. The displayed result is bound to its inspected target, Run, gate, revision and available source identity. Selection/revision/source changes invalidate current success; a late response from a previously selected draft cannot replace the new selection's result. Existing reload and recheck recover supported states.
4. Entwurfsprüfung bestanden is visibly distinct from Freigabe, current control eligibility and QA. Reading/checking changes no durable control, document or approval bytes and never enables a forbidden next gate.
5. The draft action, detail inspection, retry and surrounding documented-approval/document actions preserve keyboard focus, readable long diagnostics, scrolling and disabled/stale handling at wide/narrow widths.
6. Relevant Core/MCP/App integration and rendered behaviour are verified with exact source/build identities and bounded claims. Source or stdio results are distinguished from any fresh native-host observation. Existing approvals, review history, approved sources and unrelated Runs remain protected.

## Existing Source Of Truth

The user's request to include the new function in the App and PRD defines this added need. packages/core/lib/control-inspect/artifact-readiness.js owns the existing checks; packages/core/lib/control-inspect/contract.js and the MCP service expose artifact-readiness for UR/PRD/SD/TP with explicit target/Run/gate/revision. The report already declares authoring_checks, authorizes false, semantic_review_required, registration_required and presentation_required. Existing App reading sessions, scoped snapshots and source freshness retain boundary ownership; packages/control-ui/src/api.ts and current selected-undertaking components are consumers. Their precise integration must be reviewed before design. The original compact documented-approval UR/PRD are contextual references, not this new approval authority.

The installed MCP and current chat have already successfully evaluated the earlier PRD. This proves tool availability and that specific authoring result only, not that an App action has been built, rendered or approved.

## Risks And Unknowns

The App's existing read selectors do not yet expose the new draft-check operation. Integrating the generic MCP operation must preserve the tighter App session/selection boundary. A stale Run revision and an unchanged revision with changed draft bytes both require honest freshness handling. Missing or unreadable drafts need bounded feedback, not an invented success state. Technical representation and protection against late responses belong to the later design; no material product question remains open. The shared checkout contains earlier changes, so protected-source and scoped-diff evidence are required.

## Next Step

Obtain a new deliberate Approval: UR for this concrete added scope. Then perform the existing Brownfield/Mode and required UX analysis and derive the supplementary product criteria and design. Coordinate its presentation with the separately approved compact overview through explicit references and existing owners. The recorded Approval: PRD in the original Run does not approve this integration.

## AGDF Approval Summary (de; source=en)

- Problem und Ziel: Die Core/MCP-Entwurfsprüfung ist erreichbar, wird aber im Cockpit noch nicht angeboten. Nutzer und Agenten sollen den aktuellen Entwurf selbst prüfen und konkrete fehlende Angaben, offene Entscheidungen und nächste Schritte verstehen.
- Umfang: Entwurf prüfen beim ausgewählten aktuellen, nicht freigegebenen UR-, PRD-, SD- oder TP-Entwurf. Die App verwendet dieselbe Core-Prüfung über einen begrenzten MCP-Lesezugriff und bindet das Ergebnis an Vorhaben, Gate, Revision und verfügbare Quellenidentität. Keine beliebigen Dateipfade oder Zielwechsel.
- Anzeige und Abnahme: Noch nicht geprüft, Prüfung läuft, Entwurfsprüfung bestanden, Korrekturen erforderlich und Prüfung nicht verfügbar beziehungsweise veraltet sind unterscheidbar. Echte Befunde und nächste Schritte bleiben nachvollziehbar; Quellen- oder Auswahländerungen und verspätete Antworten dürfen keinen aktuellen Erfolg vortäuschen. Wiederholen und Neuladen nutzen bestehende Wege.
- Freigaben und Grenzen: Entwurfsprüfung bestanden bedeutet nur bestandene Autorenprüfungen. Fachliche Prüfung, Registrierung, Freigabe, aktuelle Kontrollauswertung und QA behalten ihre bestehenden Verantwortlichen. Der Aufruf schreibt keine Dokumente, Kontrollstände oder Freigaben und erteilt keine Implementierungserlaubnis. Keine neue Prüfregel, Archivablage, automatische Prüfung, Git- oder Veröffentlichungsaktion.
- Bedienung und Nachweise: Schmale und breite Anzeige, Tastatur, Fokus, Scrollen, lange Befunde und gesperrte Quellen werden geprüft. Core-, MCP-, Browser- und frische native Nachweise bleiben getrennt. Die kompakte Freigabenübersicht und frühere Quellen und Entscheidungen bleiben geschützt.
- Quellen und Risiken: Die vorhandene Core-Funktion bleibt Prüfhoheit; die App übernimmt Darstellung und der MCP-Zugriff wahrt Sitzungs-, Auswahl- und Frischeregeln. Der App-Lesezugriff muss erweitert und auf veraltete Ergebnisse geprüft werden. Die bisherige PRD-Freigabe zur Übersicht ist gespeichert, enthält diese Ergänzung aber nicht und wird nicht übertragen.
- Nächster Schritt: Diese ergänzende UR freigeben; danach Wiederverwendung, UX und Produktkriterien für die Integration ausarbeiten. Noch keine Implementierung oder native Darstellung behauptet.
