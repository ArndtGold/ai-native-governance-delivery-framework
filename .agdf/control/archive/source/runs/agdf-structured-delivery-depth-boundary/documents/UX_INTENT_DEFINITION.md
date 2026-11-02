# UX Intent Definition: Structured Delivery Depth Boundary

Status: `ready`
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Nach genehmigter UR und Brownfield Review nachvollziehen können, warum ein
  formaler Change als begrenzte Structured Slice oder als vollständige Structured Delivery
  weitergeführt wird.
- success_signal: Dieselben vollständigen Impact-Fakten erzeugen dieselbe Tiefenklasse und eine
  sichtbare Begründung; unvollständige entscheidende Fakten erzeugen einen sichtbaren
  Informationsgap statt einer erfundenen Klassifikation.
- primary_decision_or_action: Fehlende Brownfield-Fakten ergänzen oder den projizierten nächsten
  formalen Gate-Schritt für die evidenzbasierte Tiefenklasse ausführen.
- working_modes:
  - `structured_slice`: begrenzte formale Slice mit vollständigen entscheidenden Impact-Fakten;
  - `structured_delivery`: vollständige formale Lieferung bei entscheidender Full-Depth-Wirkung;
  - `depth_unresolved`: keine Klassifikation, solange entscheidende Fakten fehlen oder sich
    widersprechen.
- effective_state_by_mode:
  - `structured_slice`: formaler Gate-Pfad aktiv; PRD, SD und TP bleiben erforderlich, Inhalt und
    Evidenz werden auf die genehmigte Slice begrenzt;
  - `structured_delivery`: vollständiger formaler Gate-Pfad mit allen betroffenen Authority-,
    Consumer-, Migration-, Betriebs- und Release-Grenzen aktiv;
  - `depth_unresolved`: Mode/Slice Decision bleibt offen oder blockiert; keine spätere
    Artefakt- oder Implementierungsautorität.
- visible_state_types: ausgewählte Tiefenklasse, ausschlaggebende Signale, verworfene Alternative,
  Evidenz, fehlende Fakten, erforderlicher nächster Gate-Schritt und nicht autorisierender
  Benchmarkstatus.
- effective_state_authority_by_mode:
  - alle Modi: genehmigte UR plus evidenzbasierte Brownfield Review unter der normativen Grenze des
    Modes Contract;
  - Benchmark: ausschließlich read-only Kandidat, niemals operative Authority.
- primary_state_presentation_owner_by_mode:
  - operative Modi: bestehende Run Status Card und Mode/Slice Decision;
  - Benchmark: bestehendes Proportionalitätsreporting mit sichtbarer
    `non_authorizing`-Evidenzgrenze.
- activation_paths: erst nach genehmigter dauerhafter UR; Brownfield Review schließt bestehende
  kompakte Pfade anhand ihrer unveränderten Voraussetzungen aus oder eskaliert sie und bewertet
  dann die strukturierten Tiefensignale.
- blockers:
  - fehlende Authority-, Impact-, Consumer-, Migrations-, Kompatibilitäts- oder Release-Fakten;
  - widersprüchliche Brownfield-Evidenz;
  - Versuch, Tasktext, Ownerzahl oder Benchmarkziel allein als Tiefenentscheidung zu verwenden;
  - konkurrierender Policy-Owner außerhalb des Modes Contract.
- recovery_paths:
  - fehlende konkrete Fakten im Brownfield-Nachweis ergänzen und die Entscheidung erneut
    projizieren;
  - widersprüchliche Evidenz zum zuständigen SoT-/Produktowner routen;
  - bei Scope-Wachstum die vorhandene Entscheidung revidieren, bevor spätere Artefakte oder
    Implementierung fortgesetzt werden.
- relevant_state_transitions:
  - approved UR → Brownfield Review → `structured_slice`;
  - approved UR → Brownfield Review → `structured_delivery`;
  - approved UR → Brownfield Review → `depth_unresolved` → Evidenzergänzung → erneute
    Mode/Slice Decision;
  - kompakter Pfad → nachgewiesene Eskalationsbedingung → strukturierte Tiefenbewertung;
  - strukturierter Benchmarkkandidat → keine operative Zustandsänderung.
- proposed_prd_acceptance_criteria:
  - vollständige Fakten erzeugen deterministisch genau `structured_slice`,
    `structured_delivery` oder einen erklärten Blockzustand;
  - jede positive Entscheidung nennt mindestens ausschlaggebende Signale, verworfene Alternative,
    Evidenz und nächsten Gate-Schritt;
  - fehlende entscheidende Fakten bleiben sichtbar und nicht autorisierend;
  - Owner-/Datei-/Consumerzahlen können weder allein eskalieren noch hohe Wirkung verdecken;
  - Structured Slice und Structured Delivery verwenden dieselbe bestehende Gate-Reihenfolge;
  - Benchmarkprojektionen bleiben sichtbar read-only und beeinflussen keine operative Authority.
- open_product_questions:
  - Welche Impact-Dimensionen sind einzeln zwingende Full-Depth-Trigger?
  - Welche kumulativen Signale machen eine ansonsten begrenzte Slice nicht mehr beherrschbar?
  - Welche Mindestfakten muss Brownfield Review für eine positive Tiefenentscheidung liefern?
  - Wie wird die geringere Artefakttiefe einer Structured Slice beobachtbar, ohne Gates
    auszulassen?
- affected_outputs: Modes Contract, Brownfield-/Gate-Routing-Anweisungen, Run-State-/Statusprojektion,
  deterministische Skill-Evals, Runtime Integrity und spätere Benchmark-v3-Konsumenten.
- evidence: genehmigte UR Revision 1; `STAGED_PRODUCT_FINDINGS_ASSESSMENT.md` SPF-05;
  `modes.md`; `gate-transition.md`; PB-022/PB-028/PB-029 Evidence Packs und r3-Beobachtungen.
- missing_evidence: konkrete Produktentscheidungen zu Triggern, Kumulation und Mindestfakten sind
  absichtlich PRD-Inhalt; technische Owner und Propagation sind SD-Inhalt.
- required_next_step: PRD auf Basis dieses UX-Intents erstellen und die offenen
  Produktentscheidungen explizit festlegen; keine Implementierung vor den folgenden Gates.
