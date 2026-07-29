# UX Intent Definition: AGDF Product Maturity Roadmap

Status: ready
Date: 2026-07-28
Authority: nicht-autorisierende PRD-Eingabe

- decision: `ready`
- blocking_reason: none
- primary_user_intent: AGDF durch einen Coding Agent nutzen, ohne das interne Governance-Modell
  beherrschen zu müssen, und dennoch sicher wissen, woran gearbeitet wird, was gilt und welche echte
  Entscheidung jetzt erforderlich ist.
- success_signal: Der Nutzer erkennt Arbeitsziel, effektiven Status, nächsten zulässigen Schritt und
  Entscheidungswirkung in einer kompakten Standardinteraktion; Detail- und Audit-Evidenz bleibt auf
  Nachfrage verfügbar.
- primary_decision_or_action: Eine echte Gate-Entscheidung treffen, eine Ziel-/Scope-Unklarheit
  auflösen oder ohne künstliche Interaktion den nächsten internen Schritt ausführen lassen.
- working_modes: `read_only_orientation`, `quick_task`, `compact_delivery`,
  `structured_delivery`, `blocked_recovery`, `host_limited_evidence`.
- effective_state_by_mode:
  - `read_only_orientation`: Ziel und vorhandener Kontrollzustand sind sichtbar, es entsteht keine
    Autorität oder Mutation.
  - `quick_task`: keine neue Produktsemantik und kein Gate; Ergebnis, Evidenz, Risiko und nächster
    Schritt genügen.
  - `compact_delivery`: UR ist genehmigt, Brownfield Routing ist abgeschlossen und interne Evidenz
    wird ohne zusätzlichen Nutzerentscheid präsentiert.
  - `structured_delivery`: der ausgewählte Run, das aktuelle Gate und die fehlende exakte Freigabe
    bestimmen die Autorität.
  - `blocked_recovery`: Target, Scope, Evidenz oder Artefaktstatus ist unklar; nachgelagerte
    Aktivierung und Mutation bleiben gesperrt.
  - `host_limited_evidence`: Repositoryzustand ist bekannt, reale Host-Durchsetzung oder Darstellung
    bleibt ausdrücklich unverified beziehungsweise instruction-only.
- visible_state_types: primäres Arbeitsziel; ausgewählter Run nur wenn relevant; menschlicher
  Delivery Path; aktueller Status; Blocker; eine nächste Aktion; aktuelle Entscheidung; optionales
  Warum; Enforcement-/Evidenzgrenze bei relevanter Einschränkung.
- effective_state_authority_by_mode:
  - Zielzustand: Task Target Resolution Contract.
  - Delivery Path und Gate: Modes und Gate Transition Contract.
  - Run-/Approval-Status: kanonischer `RUN_STATE.md` plus Validator.
  - Host-/Enforcement-Status: bestehende Capability-, Adapter- und direkte Host-Evidenz.
  - UAT-Akzeptanz: Nutzerentscheidung; weder Renderer noch Host-Control.
- primary_state_presentation_owner_by_mode: `interaction.md` und
  `interaction-presentation.js` bleiben für alle Modi der einzige normative beziehungsweise
  code-owned Presentation-Pfad; Host-Controls sind Adapter.
- activation_paths: nach bestätigter Task-Target-Auflösung; status-only bei Read-only-Anfrage;
  Scope Classification bei frischer Änderung; Gate-Projektion nur bei ausgewähltem Run; Target
  Orientation nur bei relevanter Zieltrennung, Blocker oder Zielwechsel.
- blockers:
  - `multiple_plausible_targets`: plausible Ziele knapp zeigen und explizite Auswahl verlangen.
  - `target_content_mismatch`: Widerspruch nennen und Korrektur oder anderes Ziel verlangen.
  - fehlendes Artefakt oder Approval: frühestes Gate und exakten zulässigen nächsten Schritt zeigen.
  - host-limited Enforcement: Grenze sichtbar machen; keine technische Garantie behaupten.
  - widersprüchliche aktive Runs: Scope-Linien zeigen und Auswahl verlangen.
- recovery_paths: explizites Ziel oder Run wählen; nicht verfügbares Attachment erneut bereitstellen;
  Artefakt vervollständigen; exakten Approval-Wert verwenden; Host-Evidenz erneut authentifiziert
  ausführen; `Why?` für Begründung nutzen; bei transientem Hostfehler sichtbaren Retry anbieten.
- relevant_state_transitions: unaufgelöstes zu bestätigtem Ziel; Orientierung zu Quick/Compact/
  Structured Path; internes Review zu entscheidungsbereitem Gate; Approval zu nächstem Gate;
  Host-Probe zu verifiziert oder explizit unverified; expliziter Zielwechsel beendet alte Bindung.
- proposed_prd_acceptance_criteria:
  1. Standardausgabe beantwortet Ziel, Status, nächsten Schritt und aktuelle Entscheidung ohne
     vollständiges internes Vokabular.
  2. Kein interner Review- oder Routing-Schritt erzeugt eine Nutzerfreigabe.
  3. Detail-/Audit-Evidenz ist progressiv verfügbar und bleibt vollständig kanonisch.
  4. Jede sichtbare Enforcement-Aussage nennt zuverlässig Klasse und Evidenzgrenze.
  5. Blocker besitzen eine konkrete Recovery-Aktion; transiente Fehler besitzen sichtbaren Retry.
  6. Quick-, Compact- und Structured-Zustände sind für Nutzer unterscheidbar, ohne persistierte
     Kompatibilitätswerte umzubenennen.
  7. Repository-, Replay-, Live-Host- und UAT-Evidenz werden sichtbar getrennt.
  8. Die gemeinsame Journey wird mit neuen Nutzern oder gleichwertigen Verständlichkeitsfällen auf
     den verbindlichen Hosts geprüft.
  9. Interaction-/Presentation-Autorität bleibt single-source; es entsteht kein Dashboard-SoT.
  10. Weniger Interaktion darf Schutzwirkung, exakte Freigaben oder fail-closed Recovery nicht
      reduzieren.
- open_product_questions: PRD muss verbindliche Hosts, Reifegradmetriken, Interaktionsbudgets und
  akzeptable Fehlklassifikationsgrenzen festlegen; diese Entscheidungen sind innerhalb der
  genehmigten UR offen, widersprechen ihr aber nicht.
- affected_outputs: Roadmap-PRD; spätere getrennte Conformance-, Proportionalitäts-, Enforcement- und
  Journey-Runs; kanonische Interaction-/Mode-/Capability-Projektionen nur bei genehmigtem Folgescope.
- evidence: genehmigte Roadmap-UR; `task-target-resolution-boundary`;
  `agdf-interaction-ownership-quick-path-ux`; bestehende Context-Graph-Knoten für Target,
  Interaction, Ceremony, Delivery Path Search, Run Status und UX Intent.
- missing_evidence: authentifizierte gemeinsame Host-Conformance, Real-Task-Benchmark und
  novice-taugliche Verständlichkeitsbeobachtung; diese sind geplante Produktnachweise, keine
  Blocker für PRD-Definition.
- required_next_step: Die vorgeschlagenen UX-Kriterien in den PRD-Entwurf überführen und erst durch
  exaktes `Approval: PRD` autoritativ machen.
