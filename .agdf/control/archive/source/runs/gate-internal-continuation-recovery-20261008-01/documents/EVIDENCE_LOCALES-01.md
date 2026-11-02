# Rendered locale evidence

- assessed_at: 2026-10-08T18:30:08.764183+00:00
- candidate: 0.14.5+codex.local-0ad3b168da8e
- runtime_digest: 28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278
- evidence_boundary: source/package/protocol; no new native model session observed

Locales are enumerated from Object.keys of the canonical registry: de, en. Actual affected diagnostic/status/disposition output follows. C009/C010 also verify operational localization and exact catalog ownership; the supported unknown-locale fallback remains English. These are real renderer outputs, not a claim of native host visual inspection. Host clipping/readability and actual actor behavior remain N-006 obligations.

| Locale | State | Result |
|---|---|---|
| en | ux_source_missing | rendered; assertions passed |
| en | ux_decision_malformed | rendered; assertions passed |
| en | ux_source_unrecorded | rendered; assertions passed |
| en | ux_not_ready | rendered; assertions passed |
| en | unsafe_ux_source | rendered; assertions passed |
| en | unsafe_destination | rendered; assertions passed |
| en | source_unavailable | rendered; assertions passed |
| en | inspect | rendered; assertions passed |
| en | continue | rendered; assertions passed |
| en | external | rendered; assertions passed |
| en | integrity | rendered; assertions passed |
| en | qa-upstream | rendered; assertions passed |
| en | ready | rendered; assertions passed |
| de | ux_source_missing | rendered; assertions passed |
| de | ux_decision_malformed | rendered; assertions passed |
| de | ux_source_unrecorded | rendered; assertions passed |
| de | ux_not_ready | rendered; assertions passed |
| de | unsafe_ux_source | rendered; assertions passed |
| de | unsafe_destination | rendered; assertions passed |
| de | source_unavailable | rendered; assertions passed |
| de | inspect | rendered; assertions passed |
| de | continue | rendered; assertions passed |
| de | external | rendered; assertions passed |
| de | integrity | rendered; assertions passed |
| de | qa-upstream | rendered; assertions passed |
| de | ready | rendered; assertions passed |

## en: ux_source_missing

The required UX analysis is missing.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `missing`
Next action: The UX owner may prepare or correct this unapproved analysis, validate it and record it canonically before fresh evaluation.

## en: ux_decision_malformed

The UX readiness field is absent or ambiguous.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `exact field absent`
Next action: The UX owner may prepare or correct this unapproved analysis, validate it and record it canonically before fresh evaluation.

## en: ux_source_unrecorded

The ready UX analysis is not canonically recorded.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `unrecorded`
Next action: The UX owner may prepare or correct this unapproved analysis, validate it and record it canonically before fresh evaluation.

## en: ux_not_ready

The UX analysis is not ready.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `blocked`
Next action: The source owner must resolve this condition before dependent work.

## en: unsafe_ux_source

The UX source belongs to another path or is unsafe.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `foreign or unsafe source`
Next action: The source owner must resolve this condition before dependent work.

## en: unsafe_destination

The output path is unsafe.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `unsafe`
Next action: The source owner must resolve this condition before dependent work.

## en: source_unavailable

A required source is unavailable.

Source: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Expected field/value: `- decision: ready`
Observed (original wording): `missing`
Next action: The source owner must resolve this condition before dependent work.

## en: inspect

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | open |
| Current gate | Implementation and tests (`CD+Tests`) |
| Allowed now | implement the approved TP tasks |
| Forbidden now | claim QA pass |
| Next permitted agent action | TP approved. Implementation, tests and CD+Tests evidence are permitted within the approved scope. |
| Missing approval | none |

## en: continue

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | open |
| Current gate | Implementation and tests (`CD+Tests`) |
| Allowed now | implement the approved TP tasks |
| Forbidden now | claim QA pass |
| I am continuing | TP approved. Implementation, tests and CD+Tests evidence are permitted within the approved scope. |
| Missing approval | none |

## en: external

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | open |
| Current gate | Implementation and tests (`CD+Tests`) |
| Allowed now | implement the approved TP tasks |
| Forbidden now | claim QA pass |
| Your turn | Choose whether AC-006 stays open under this TP or a separate host-provisioning scope update starts. Host changes are not authorized by this TP. |
| Missing approval | none |

## en: integrity

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | blocked |
| Current gate | Implementation and tests (`CD+Tests`) |
| Allowed now | run doctor again |
| Forbidden now | implement code<br>claim QA pass |
| Blocked by | An unresolved control finding needs attention (AGDF_RUN_ID_MISMATCH) |
| Next permitted agent action | run doctor again |
| Missing approval | none |

## en: qa-upstream

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | open |
| Current gate | Quality assurance (`QA`) |
| Allowed now | route the blocking QA findings to their authoritative owner |
| Forbidden now | implement code<br>claim QA pass |
| QA follow-up | SD source-owner decision required. (original wording) |
| Next permitted agent action | Resolve or route the QA revise findings through their authoritative owner before dependent work. Do not request Approval: QA from a revise report. |
| Missing approval | none |

## en: ready

## AGDF status-card

| Status field | Value |
|---|---|
| Selected run | Locale Test · `locale-test` |
| Status | open |
| Current gate | Task and test plan (`TP`) |
| Your decision | Approval: TP · Revise · Decline |
| Agent may work on now | implement the approved TP tasks |
| Forbidden now | claim QA pass |
| Waiting for | Approval: TP |

## de: ux_source_missing

Die erforderliche UX-Analyse fehlt.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `missing`
Nächster Schritt: Der UX-Verantwortliche darf diese unfreigegebene Analyse vorbereiten oder korrigieren, prüfen und vor erneuter Auswertung kanonisch erfassen.

## de: ux_decision_malformed

Das genaue UX-Bereitschaftsfeld fehlt oder ist mehrdeutig.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `exact field absent`
Nächster Schritt: Der UX-Verantwortliche darf diese unfreigegebene Analyse vorbereiten oder korrigieren, prüfen und vor erneuter Auswertung kanonisch erfassen.

## de: ux_source_unrecorded

Die bereite UX-Analyse ist noch nicht kanonisch erfasst.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `unrecorded`
Nächster Schritt: Der UX-Verantwortliche darf diese unfreigegebene Analyse vorbereiten oder korrigieren, prüfen und vor erneuter Auswertung kanonisch erfassen.

## de: ux_not_ready

Die UX-Analyse ist nicht bereit.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `blocked`
Nächster Schritt: Der Quellenverantwortliche muss diese Bedingung vor abhängiger Arbeit klären.

## de: unsafe_ux_source

Die UX-Quelle liegt an einem fremden oder unsicheren Pfad.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `foreign or unsafe source`
Nächster Schritt: Der Quellenverantwortliche muss diese Bedingung vor abhängiger Arbeit klären.

## de: unsafe_destination

Der Ausgabepfad ist unsicher.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `unsafe`
Nächster Schritt: Der Quellenverantwortliche muss diese Bedingung vor abhängiger Arbeit klären.

## de: source_unavailable

Eine erforderliche Quelle ist nicht verfügbar.

Quelle: `.agdf/control/artefacts/test/UX_INTENT_DEFINITION.md`
Erwartetes Feld/Wert: `- decision: ready`
Gefunden (Originalangabe): `missing`
Nächster Schritt: Der Quellenverantwortliche muss diese Bedingung vor abhängiger Arbeit klären.

## de: inspect

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | offen |
| Aktuelles Gate | Implementierung und Tests (`CD+Tests`) |
| Jetzt erlaubt | die freigegebenen TP-Aufgaben implementieren |
| Aktuell verboten | QA als bestanden erklären |
| Nächster erlaubter Agentenschritt | TP freigegeben. Umsetzung, Tests und CD+Tests-Nachweise sind im genehmigten Umfang erlaubt. |
| Fehlende Freigabe | keine |

## de: continue

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | offen |
| Aktuelles Gate | Implementierung und Tests (`CD+Tests`) |
| Jetzt erlaubt | die freigegebenen TP-Aufgaben implementieren |
| Aktuell verboten | QA als bestanden erklären |
| Ich arbeite weiter | TP freigegeben. Umsetzung, Tests und CD+Tests-Nachweise sind im genehmigten Umfang erlaubt. |
| Fehlende Freigabe | keine |

## de: external

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | offen |
| Aktuelles Gate | Implementierung und Tests (`CD+Tests`) |
| Jetzt erlaubt | die freigegebenen TP-Aufgaben implementieren |
| Aktuell verboten | QA als bestanden erklären |
| Du bist dran | AC-006 offenlassen oder eine separate Umfangsänderung für Host-Bereitstellung starten. Dieser TP erlaubt keine Host-Änderungen. |
| Fehlende Freigabe | keine |

## de: integrity

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | blockiert |
| Aktuelles Gate | Implementierung und Tests (`CD+Tests`) |
| Jetzt erlaubt | doctor erneut ausführen |
| Aktuell verboten | Code implementieren<br>QA als bestanden erklären |
| Blockiert durch | Ein ungeklärter Kontrollbefund muss bearbeitet werden (AGDF_RUN_ID_MISMATCH) |
| Nächster erlaubter Agentenschritt | doctor erneut ausführen |
| Fehlende Freigabe | keine |

## de: qa-upstream

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | offen |
| Aktuelles Gate | Qualitätssicherung (`QA`) |
| Jetzt erlaubt | die blockierenden QA-Befunde an ihren zuständigen Owner leiten |
| Aktuell verboten | Code implementieren<br>QA als bestanden erklären |
| QA-Nacharbeit | SD source-owner decision required. (Originalwortlaut) |
| Nächster erlaubter Agentenschritt | Kläre QA-Revise-Befunde beim zuständigen Verantwortlichen vor abhängiger Arbeit. Aus Revise keine Approval: QA anfordern. |
| Fehlende Freigabe | keine |

## de: ready

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | Locale Test · `locale-test` |
| Status | offen |
| Aktuelles Gate | Aufgaben- und Testplan (`TP`) |
| Deine Entscheidung | Approval: TP · Überarbeiten · Ablehnen |
| Der Agent darf jetzt | die freigegebenen TP-Aufgaben implementieren |
| Aktuell verboten | QA als bestanden erklären |
| Wartet auf | Approval: TP |
