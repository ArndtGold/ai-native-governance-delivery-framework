# UX Intent Definition: Verlässlicher Delivery-Intake

- decision: ready
- blocking_reason: none
- primary_user_intent: Einen klar beauftragten Änderungsumfang bearbeiten lassen, ohne interne Run-Verwaltung selbst orchestrieren zu müssen.
- success_signal: Ein eindeutig gebundener Entscheidungsvorschlag; nach Freigabe Fortschritt bis zur nächsten tatsächlichen Nutzerentscheidung oder konkreten Blockade.
- primary_decision_or_action: Präsentierten Umfang und Revision freigeben, überarbeiten lassen oder ablehnen.
- working_modes: neuer Auftrag; gebundene Fortsetzung; reine Statusabfrage; Freigabeentscheidung; Fehlerbehebung.
- effective_state_by_mode: Neuanlage bleibt vor Freigabe unapproved; Fortsetzung reicht nur bis zum kanonisch erlaubten nächsten Schritt; Status verändert nichts; Entscheidung gilt ausschließlich der präsentierten Bindung; Fehlerzustand bewahrt letzte gültige Autorität.
- visible_state_types: Vorbereitung läuft; Auswahl erforderlich; Entscheidung bereit; Freigabe angenommen; interne Arbeit läuft; blockiert; überholte Entscheidung; unveränderter Status.
- effective_state_authority_by_mode: Nutzer liefert Auftrag und Entscheidung; kanonischer Run und Gate-Prüfung bestimmen wirksame Freigaben in allen Modi. Eine Anzeige erzeugt keine Freigabe.
- primary_state_presentation_owner_by_mode: Aktueller Chat mit kanonischer Run-/Gate-Darstellung für alle Modi; CLI/MCP-Ausgaben dienen derselben Semantik, ohne konkurrierende Entscheidungsaufforderung.
- activation_paths: Expliziter neuer Änderungsauftrag aktiviert Intake; eindeutig gebundener Fortsetzungsauftrag bzw. gültige Gate-Antwort aktiviert begrenzte Fortsetzung; Statusfrage bleibt lesend. Abbruch beendet aktuelle Bearbeitung ohne Freigabe.
- blockers: Unklarer Umfang oder Ziel -> gezielte Klärung; unklarer bestehender Run -> Auswahl mit passenden Kandidaten; fehlende Artefakte -> Vorbereitung statt Freigabeaufforderung; veraltete Bindung -> neuer Vorschlag; technischer Fehler -> konkreter Fehler und Wiederholungsmöglichkeit.
- recovery_paths: Transiente Prüfung erneut ausführen; bereits angelegten Run innerhalb desselben autorisierten Vorgangs wiederverwenden; nach Unterbrechung aktuellen Stand prüfen. Keine doppelte Anlage oder Übertragung alter Antworten. Bei unklarem Wiederaufnahmebezug zuerst Klärung.
- relevant_state_transitions: neuer Auftrag -> Run/UR vorbereitet -> Entscheidung bereit -> deliberate approval -> gebundene Freigabe -> Brownfield Review/Routenwahl -> nächstes Gate. Jeder Fehler hält vor unzulässiger Mutation; Statusabfrage bleibt im Ausgangszustand.
- proposed_prd_acceptance_criteria: IC-01 bis IC-08 in PRD.md.
- open_product_questions: none for the approved UR scope; Nachweisverfahren und Kompatibilität bleiben SD.
- affected_outputs: Run-Statuskarte; Gate-Entscheidung; Auswahl-/Fehlerhinweise; interne Fortsetzungsrückmeldung; CLI/MCP-Zustand.
- evidence: UR.md; BROWNFIELD_REVIEW.md; beobachteter Referenzchat; vorhandene Contracts zu Gate-Transition und Interaction.
- missing_evidence: Implementierte und sichtbare Host-Erfüllung noch nicht vorhanden; diese Analyse behauptet sie nicht.
- required_next_step: Kriterien in PRD zur Nutzerentscheidung übernehmen.

Dies ist analytischer Input, keine eigenständige Produktfreigabe. Keine Komponenten-, Protokoll- oder Speicherentscheidung wird hier festgelegt.
