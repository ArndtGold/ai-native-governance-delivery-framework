# PRD: Stabile AGDF-ID und katalogbasierte Host-Namensauflösung

Status: draft
Gate: PRD
Gate approval: open
Based on: UR.md; BROWNFIELD_REVIEW.md; SCOPE_CHANGE.md
Date: 2026-10-02
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Der bestehende Dispatcher akzeptiert auf jeder unterstützten Hostoberfläche neben der kanonischen ID auch den exakt registrierten sichtbaren Skillnamen. `agdf-gate-check` und `gate-check` zeigen auf denselben bestehenden Katalogeintrag mit der stabilen ID `gate-check`. Das gilt entsprechend für alle ausgelieferten Skills auf Codex, Claude Code, Copilot und OpenCode, einschließlich bestehender lokaler und globaler Namensformen. Die bestehende Plugin-Definition bleibt die einzige Quelle für die Zuordnung; intern, in Contracts, Ergebnisfeldern und Fortsetzungen bleiben kanonische IDs maßgeblich.

Die gemeinsame Hostprojektion erhält die jeweiligen sichtbaren Präfixe und Namensräume und unterscheidet sichtbare Skillreferenzen von technischen Dispatcher-IDs. Bestehende kanonische Aufrufe anderer Hosts bleiben kompatibel. Diese Lieferung ändert keine Installation und veröffentlicht kein Paket.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: direkt definierte low-impact Semantik; keine neue Benutzerentscheidung oder Arbeitsweise gemäß BROWNFIELD_REVIEW.md.
- primary_user_intent: Einen sichtbaren AGDF-Skill auf dem jeweiligen Host zuverlässig aufrufen.
- success_signal: Sichtbarer Name und kanonische ID führen bei identischem Kontext zum gleichen fachlichen Ergebnis.
- primary_decision_or_action: Skill aufrufen; bei ungültigem Namen die diagnostizierte Eingabe korrigieren und einmal erneut versuchen.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Host-Skillaufruf | Bekannter Name wird eindeutig einer stabilen ID zugeordnet; Governance bestimmt danach den erlaubten Schritt | Bestehendes Dispatcher-Ergebnis und bestehende Status-/Recovery-Präsentation | Kanonischer Skill-Katalog und bestehende Target-/Control-Evaluierung | Bestehender Dispatcher-Renderer |
| Ungültiger Skillaufruf | Keine eindeutige Zuordnung; Target-/Governance-Evaluierung bleibt aus | invalid_input mit verständlicher Korrektur | Katalogvalidierung und gemeinsame Eingabevalidierung | Bestehende Input-Recovery-Präsentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Bestehende Request Activation und Hostinstallation bleiben maßgeblich. Namen aktivieren keine zusätzliche Autorität.
- blockers_and_visible_next_actions: Unbekannte Namen, Namen einer nicht zugehörigen Hostoberfläche oder mehrdeutige Zuordnungen werden vor der Target-/Kontrollevaluierung abgewiesen. Die Diagnose benennt das betroffene Feld; gültige Formen werden aus dem Katalog abgeleitet, soweit ein eindeutiger Katalog verfügbar ist.
- recovery_paths: Eingabe anhand der gültigen Formen korrigieren und einmal erneut versuchen. Eine Katalogkollision erfordert eine Korrektur der kanonischen Definition; der Agent darf keine Zuordnung raten.
- relevant_state_transitions: Bekannter Name führt zum bestehenden Katalogeintrag und danach zum bisherigen Dispatcherpfad. Ungültige Eingabe führt zu terminalem invalid_input. Zielklärung, Runbindung und Gateprüfung behalten ihre bisherigen Übergänge. Ein Netzwerk-Retry ist not_applicable, da die Namensauflösung lokal und deterministisch ist.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: Auf jeder unterstützten Oberfläche liefern ihre exakt registrierten sichtbaren Skillnamen und die kanonischen IDs bei sonst gleichem Kontext dieselbe kanonische Skill-ID und dasselbe fachliche Dispatcher-Verhalten; volatile Zeitwerte dürfen differieren. Beispiele sind agdf:gate-check auf Codex/Claude Code, agdf-gate-check auf Copilot/OpenCode und agdf-global-gate-check auf globalem OpenCode. Alle ausgelieferten Skills werden entsprechend zugeordnet.
  - required_evidence: Core-/Dispatcher-Regression über den vollständigen vorhandenen skillSet

- criterion_id: AC-002
  - observable_success: Die Zuordnung wird ausschließlich aus bestehenden kanonischen Slugs und deklarierten Hostnamenregeln abgeleitet. Kanonische IDs bleiben intern, in Ergebnissen und Fortsetzungen unverändert; bestehende kanonische Aufrufe der unterstützten Hosts bleiben gültig.
  - required_evidence: Registry-, Normalisierungs- und Fortsetzungsprüfungen mit derselben Plugin-Definition

- criterion_id: AC-003
  - observable_success: Unbekannte Namen, beliebige zusätzliche Präfixe, fremde Hostnamen und Alias-/ID-Kollisionen werden eindeutig abgewiesen; es gibt kein heuristisches Abschneiden. Fehler dürfen keine Target-/Governance-Evaluierung auslösen und bieten kataloggestützte Korrektur, soweit der Katalog eindeutig ist.
  - required_evidence: Negative Eingabe-/Kollisionsprüfungen, Beobachtung der unterdrückten Evaluierung und lokalisierte Recovery-Prüfung

- criterion_id: AC-004
  - observable_success: Generierte Host-Skills behalten ihre jeweils deklarierten sichtbaren Namen und Namensräume; technische IDs, Dispatcherparameter und Contractreferenzen bleiben kanonisch. Sichtbare Skillreferenzen und IDs sind konsistent beschrieben.
  - required_evidence: Generator-/Paketprüfung aller ausgelieferten Host-Skills und der betroffenen technischen Referenzen

- criterion_id: AC-005
  - observable_success: CLI und MCP zeigen dieselbe katalogbasierte Semantik. Eine Namenszuordnung ersetzt weder ein fehlendes Ziel noch eine Runbindung oder Freigabe; jedes Dispatcher-Ergebnis bleibt nicht autorisierend.
  - required_evidence: CLI-/MCP-Paritätsprüfungen für bekannte und unbekannte Namen sowie unresolved-target- und non-authorizing-Szenarien

- criterion_id: AC-006
  - observable_success: Die Dispatcher-Dokumentation beschreibt sichtbaren Namen, stabile ID, Hostbindung, Fehlerbehandlung und Evidenzgrenzen. Die Lieferung weist Quellcode-/Paketnachweise aus und behauptet keine ungeprüfte Installation oder frische Host-Sitzung.
  - required_evidence: Dokumentations-/Diffreview und fokussierte Test-/Paketnachweise

UX-Beobachtung für AC-001 und AC-003: Arbeitsmodus ist Host-Skillaufruf; Auslöser ist die Übergabe von Skillname oder ID. Bei gültiger Eingabe bleibt das fachliche Ergebnis identisch zum kanonischen Aufruf. Bei ungültiger Eingabe ist die sichtbare Rückmeldung die bestehende Recovery-Präsentation; nächste Aktion ist genau eine korrigierte Eingabe oder Katalogkorrektur. Frische Hostdarstellung gehört nicht zum Repository-Abnahmenachweis.

## 6. Non-Goals

Keine zweite Mappingliste oder Dispatcherinstanz; keine freie Präfixentfernung; keine neue Gate-/Approval-/Targetlogik; keine automatische Ziel- oder Runwahl; keine Einführung neuer Hostnamenskonventionen; keine Installation, Veröffentlichung oder Marketplaceänderung.

## 7. Users And Roles

Arndt Gold ist Product Owner und entscheidet über die exakten Gatefreigaben. Nutzer unterstützter Hosts und aufrufende Modelle profitieren von eindeutigen Namen. Bestehende Core-, CLI-/MCP- und Projektionsowner tragen die technischen Änderungen und Prüfungen im selben Repository.

## 8. Constraints

Bestehende kanonische IDs und Ausgabeformen bleiben kompatibel. Kein neuer normativer Katalog. Hostkontext bleibt durch den bestehenden Transport bestimmt; eine Eingabe darf ihn nicht über einen Namen ersetzen. Keine bestehende Assertion wird zur Umgehung eines Problems entfernt oder abgeschwächt. Maßgeblich sind der ursprüngliche UR und die direkte Benutzerkorrektur in SCOPE_CHANGE.md; die Erweiterung wird durch die erneute PRD-Freigabe gebunden.

## 9. Evidence Requirements

Gezielte Core-/Registry-, Dispatcher-, CLI-/MCP- und Host-Generatorprüfungen decken AC-001 bis AC-005 ab. Paket-/Integritätsprüfungen und Review decken die Verteilung und AC-006 ab. QA trennt Quellcode, erzeugtes Paket, installierte Version und frischen Host. Ein etwaiger bestehender Prüfungsfehler wird mit Ursache und Scope dokumentiert.

## 10. Risks And Open Questions

Das SD legt den kleinsten Metadatentransport zur gemeinsamen Normalisierung, die Kollisionsvalidierung und präzise Textprojektion fest. Das TP bindet diese Entscheidungen an ausführbare Tests. Bestehende Dirty Paths außerhalb des Scopes bleiben isoliert. Im PRD sind keine Produkt-, Release- oder Ownershipfragen offen.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Sichtbarer Name und stabile interne ID | before_prd | resolved | Benutzerklarstellung: gate-check bleibt stabil; Dispatcher mappt den Skillnamen auf die ID; Präfix agdf- bleibt erhalten. | Arndt Gold |
| Allgemeine Namensauflösung und Hostprojektion | before_prd | resolved | Benutzerkorrektur: Namensauflösung und präzise Projektion allgemein für Codex, Claude Code, Copilot und OpenCode. Nur bestehende deklarierte Namensformen akzeptieren, keine neuen Hostkonventionen erfinden. | Arndt Gold |
| Installations-/Releasegrenze | before_prd | resolved | Genehmigte UR schließt Installation, Veröffentlichung und Behauptung frischer Host-Evidenz aus. | Arndt Gold |
| Metadatentransport und Kollisionsprüfung | later_sd | open | Bestehender Core-/Transportowner legt die gemeinsame Normalisierung und exakte Hostbindung ohne zweite Quelle fest. | Codex |
| Technische Referenzen der Hostprojektion | later_sd | open | Bestehender Generatorowner legt die präzise Unterscheidung sichtbarer Referenzen und technischer IDs fest. | Codex |
| Szenarien und konkrete Prüfkommandos | later_tp | open | Bestehende Tests ergänzen; Parität, Fehlergrenzen und deterministische Verteilung belegen. | Codex |

## 11. Next Step

Review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Ziel: Sichtbare Host-Skillnamen werden über den bestehenden Katalog stabilen AGDF-IDs zugeordnet. Die jeweiligen sichtbaren Präfixe und Namensräume bleiben erhalten; intern bleiben kanonische IDs maßgeblich.
- Umfang: Hostprojektion, Diagnostik und Dokumentation werden konsistent; Installation und Veröffentlichung sind ausgeschlossen.
- AC-001: Alle registrierten Namen auf Codex, Claude Code, Copilot und OpenCode und ihre kanonischen IDs zeigen dasselbe fachliche Dispatcher-Verhalten.
- AC-002: Eine bestehende Plugin-Definition liefert die Zuordnung; interne IDs, Ergebnisse, Fortsetzungen und kanonische Aufrufe anderer Hosts bleiben stabil.
- AC-003: Unbekannte Namen, beliebige Präfixe, fremde Hostnamen und Kollisionen scheitern vor Target-/Governance-Evaluierung mit verständlicher Korrektur; keine heuristische Zuordnung.
- AC-004: Die generierten Skills behalten ihre deklarierten sichtbaren Hostnamen und Namensräume, während technische IDs und Contractreferenzen kanonisch bleiben.
- AC-005: CLI und MCP nutzen dieselbe Semantik; Namensauflösung ersetzt keine Ziele, Runs oder Freigaben und bleibt nicht autorisierend.
- AC-006: Dokumentation und Nachweise erklären die Grenzen und unterscheiden Quellcode, Paket, Installation und frischen Host.
- Entscheidungen: Stabile ID und allgemeines Dispatcher-Mapping sowie Hostprojektion sind vom Benutzer bestätigt; die frühere Copilot-Begrenzung ist durch SCOPE_CHANGE.md erweitert. Keine Produktentscheidungen sind offen. Metadatentransport, Kollisionen und präzise Textprojektion werden im SD durch Codex entschieden; konkrete Szenarien und Kommandos folgen im TP.
