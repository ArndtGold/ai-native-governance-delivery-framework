# UX Intent Definition: Cross-Surface Skill Target Preflight

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Einen evidenzabhängigen AGDF-Skill direkt aufrufen, ohne Repository-Kontext,
  Reviews oder Tests manuell erneut zusammenzustellen.
- success_signal: Der Skill klärt zuerst das Arbeitsziel oder verwendet den aufgelösten
  Governance-Kontext und liefert danach genau seinen vorgesehenen, lokalisierten Output.
- primary_decision_or_action: Ein Ziel benennen, wenn es ungeklärt ist; andernfalls die
  skill-spezifische Entscheidung oder Analyse prüfen.
- working_modes: `target_unresolved`; `governed_target_resolved`; `evidence_incomplete`;
  `skill_result_ready`.
- effective_state_by_mode: `target_unresolved` hat keine Repository- oder Gate-Autorität;
  `governed_target_resolved` bindet genau ein Repository und einen Run; `evidence_incomplete`
  bleibt fail-closed; `skill_result_ready` trägt genau die Entscheidung des aufgerufenen Skills.
- visible_state_types: lokalisierte Task Target Orientation; skill-spezifische Quality Readiness
  oder Entscheidung; genau ein nächster Schritt; kanonische Fehlerdiagnose bei undarstellbarem Zustand.
- effective_state_authority_by_mode: Target-Contract und `target-check` für Zielzustand;
  `.agdf/control/` und fokussierter Validator für Run-Zustand; der jeweilige Skill-Contract für das Ergebnis.
- primary_state_presentation_owner_by_mode: `interaction-presentation.js` für Task Target Orientation;
  `gate-check` für Run Status Card; `qa-gate` für QA-Entscheidung und Quality Readiness.
- activation_paths: direkter Slash-/Skill-Aufruf in Codex, Claude Code, GitHub Copilot oder OpenCode;
  unmissverständliche Fortsetzung eines bereits bestätigten Ziels.
- blockers: kein belastbares Ziel; mehrere plausible Ziele; Ziel nicht verfügbar; Zielinhalt passt
  nicht; kein auswählbarer Run; fehlende oder widersprüchliche Review-Evidenz.
- recovery_paths: kleinstes konkretes Ziel benennen; fehlenden Zugriff bereitstellen; Run klären;
  offenen Review-Fund beim Ursprungsowner korrigieren; anschließend sichtbar erneut ausführen.
- relevant_state_transitions: direkter Aufruf -> Target-Preflight; unresolved -> Orientierung und
  terminaler Stopp; resolved -> Repository-Aktivierung und Evidenzlesen; incomplete -> fail-closed
  Skill-Ergebnis; sufficient -> kanonisches Skill-Ergebnis.
- proposed_prd_acceptance_criteria: `CSTP-01` bis `CSTP-08` im PRD-Entwurf.
- open_product_questions: `none`; Umfang und technische Orchestrierungsstelle werden in PRD und SD
  innerhalb des freigegebenen Scopes festgelegt.
- affected_outputs: direkte Skill-Antworten, Task Target Orientation, Quality Readiness,
  QA-Entscheidung und Cross-Surface-Skill-Projektionen.
- evidence: freigegebene UR; Brownfield Review; installierter Copilot-Fehlpfad; bestehende Target-,
  Interaction- und Quality-Contracts.
- missing_evidence: geladene Hostbeobachtungen nach späterer Implementierung bleiben TP-/QA-Evidenz.
- required_next_step: PRD-Entwurf aus diesen beobachtbaren Zuständen ableiten.
