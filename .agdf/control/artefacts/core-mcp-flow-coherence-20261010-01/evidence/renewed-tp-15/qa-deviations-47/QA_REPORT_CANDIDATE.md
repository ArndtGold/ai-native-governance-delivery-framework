# QA: Consistent Core and MCP flow — documented deviations
- decision: revise
- owner: qa-gate

Run: core-mcp-flow-coherence-20261010-01
Revision evaluated: 9a65c4c7-c410-423a-ba15-e209b5d0ee93
- tp_review: .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/TP_REVIEW.md
- clean_implementation_review: .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/CLEAN_IMPLEMENTATION_REVIEW.md
- code_review: .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/CODE_REVIEW.md

## Quality Readiness
| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | revise | Current registered plan review retains four evidence-only groups; actual fulfilled Chat/Core outcomes are not repeated or discarded. |
| Solution integrity | pass | Current registered Clean review remains current. The direct acceptance fix reuses the existing material, approval, receipt and history owners; no independent approval ledger or fabricated QA pass. |
| Code quality | pass | Current registered CR remains current for its recorded scope. The separately human-authorized direct fix has source review and exact Core/UI/browser/package evidence in qa-deviations-47/VERIFICATION.json; source tests do not qualify the native Host. |
| QA decision — sole owner qa-gate | revise | Required native/remote/Host/model proof remains incomplete. Human acceptance is a separate explicit decision on the following bounded proposal. |

## Scope
This is a refresh of the existing unapproved QA report for the same Run, not a new Run or a source-gate approval. The approved UR/PRD/SD/TP remain unchanged. Earlier reports remain exact historical evidence. The user explicitly authorized the narrowly scoped QA deviation acceptance implementation outside AGDF; that exception is not inferred from the old TP and does not retroactively approve a source or technical QA pass. This proposal makes the remaining evidence risks visible for a deliberate bounded human acceptance.

## Evidence
The current registered Brownfield, CD+Tests, TP Review, Clean and CR reports retain their exact scope and source associations. The fulfilled German iPad complete reading/discussion/later exact formula, deterministic seven-family comparison and 12-to-0 routine control-table edit result remain available in the existing plan review and referenced evidence. No new actual native or model proof is invented.

The direct fix tests confirm de/en same-material Chat/decision-session parity, one effect, replay, invalid/critical/conflicting/stale negatives, unchanged QA result, UAT disclosure, exact archive and truthful OR closeout. 232 UI tests, types, 14 SDK cases and two corrected assembled-Core cases pass. The retained SDK log also includes its stale-package mismatch, which is resolved by the later assembled log; it is not hidden. The package preparation and version-bound installation succeeded. A separately owned subprocess test reproduced and corrected the installer's 1 MiB capture failure while retaining a 4 MiB limit. These are source/protocol/component/synthetic-host/installation observations, not actual native-host qualification. Exact copied logs and digests are in .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence/renewed-tp-15/qa-deviations-47/VERIFICATION.json.

## Missing evidence and risks
All four current normalized evidence obligations below remain open. Medium severity is limited to internal evaluation with controlled data, no production/native qualification or publication. The model-counter gap is low severity because no model-efficiency claim is allowed. No current registered implementation/upstream finding or hard Run blocker is waived. Missing tests are not marked passed. The user's older QA reply was rejected and is not reused.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TP24-NATIVE | evidence_gap | evidence_obligation | open | Current vR2jT8 is loaded and all 24 Core preparations inventoried; German native handoff/retirement and English SD native retirement/short Chat handoff/TP authoring retained; current all-gate/locale/accessibility/affected-surface matrix is incomplete | Complete the remaining exact native observation matrix without redoing fulfilled Chat/Core checks. |
| TP24-REMOTE | evidence_gap | evidence_obligation | open | Actual German iPad complete document/discussion/later exact formula is fulfilled in IPAD_DISCUSSION_APPROVAL_39.md; SCN-058/063 broader actual surface/display/return traversal remains partial | Complete the remaining matched surface/display/return observations on the actual devices while retaining the fulfilled German Chat sequence. |
| TP24-HOST | evidence_gap | evidence_obligation | open | Fresh human-reported undecided close left the same session available with no automatic Close request; installed Host 26.1007.30912 is up_to_date on its configured prod updater. Actual permission-denial remains absent. Approval-triggered Close is independently confirmed; expiry is separate. | Obtain the required actual host permission/lifecycle observations or retain their exact external qualification gap. |
| TP24-CORPUS | evidence_gap | evidence_obligation | open | Exact original 574-file baseline and actual seven-family matched Core transition corpus are fully retained in matched-flow-41; deterministic hand-edit result 12 before / 0 after. Routine-model search/narration/prompt metrics remain unmeasured/null and cannot establish required zero-model-work claims. | Obtain matched actual routine-model workflow counters for the remaining zero-search/prompt/narration claims, while retaining the completed deterministic Core comparison without re-running it. |

## QA Deviation Acceptance
```json
{
  "schema_version": "1",
  "reviewer": "Codex / qa-gate; cooperative evidence review",
  "usage_scope": "Nur interne Erprobung im bestehenden Projekt mit kontrollierten Daten. Keine allgemeine Veröffentlichung, keine native Produktionsqualifikation und keine Zusage eines Vorteils für schwächere Modelle.",
  "deviations": [
    {
      "finding_id": "TP24-NATIVE",
      "severity": "medium",
      "risk": "Die vollständige native Bedienprüfung für alle Gates, Sprachen und betroffenen Ansichten fehlt.",
      "consequence": "In noch ungeprüften nativen Varianten können Bedien- oder Fokusprobleme auftreten; deren Qualität ist nicht bestätigt.",
      "follow_up": "Die fehlenden Kombinationen am exakt gebundenen Kandidaten prüfen und die Ergebnisse durch den bestehenden Nachweisowner nachtragen.",
      "owner": "AGDF-UI-/QA-Verantwortlicher; tatsächliche Bedienung durch den Anwender"
    },
    {
      "finding_id": "TP24-REMOTE",
      "severity": "medium",
      "risk": "Die deutsche iPad-Lese-, Diskussions- und Textfreigabe ist belegt; der vollständige Vergleich der Ansichten und Dokument-Rückkehr ist noch nicht abgeschlossen.",
      "consequence": "Einzelne Wechsel zwischen Chat, Liste, Detail und Dokument können auf tatsächlichen Geräten abweichen.",
      "follow_up": "Die noch offenen Geräte-/Ansichtswechsel prüfen; die bereits bestandene deutsche Chatfolge nicht wiederholen.",
      "owner": "AGDF-UI-/QA-Verantwortlicher; Geräteprüfung durch den Anwender"
    },
    {
      "finding_id": "TP24-HOST",
      "severity": "medium",
      "risk": "Eine technische Berechtigungsverweigerung und das vollständige native Schließen ohne Freigabe sind weiterhin nicht tatsächlich nachgewiesen.",
      "consequence": "Nach dem Schließen kann eine begrenzte Lesesitzung bis zum Ablauf bestehen bleiben. Automatische Browsertests bestätigen nicht den tatsächlichen Host.",
      "follow_up": "Schließen ohne Freigabe und Berechtigungsverweigerung am passenden Host/Kandidaten beobachten; bis dahin die externe Qualifikationslücke offenhalten.",
      "owner": "AGDF-Laufzeit-/QA-Verantwortlicher; Host-Teardown beim Codex-Host"
    },
    {
      "finding_id": "TP24-CORPUS",
      "severity": "low",
      "risk": "Der deterministische Core-Vergleich ist belegt; tatsächliche Modellmessungen für Suche, Rückfragen und Erläuterungsaufwand fehlen.",
      "consequence": "Eine Effizienzsteigerung oder Hilfe für schwächere Modelle kann nicht zugesagt werden.",
      "follow_up": "Vergleichbare Modellläufe mit tatsächlichen Zählern aufzeichnen; fehlende Messwerte bleiben ungemessen statt null Aufwand.",
      "owner": "AGDF-Evaluationsverantwortlicher"
    }
  ]
}
```

## Required next step
Present this exact current proposal and its complete risks to the human. Only a new deliberate acceptance can lead to UAT; UAT and OR must retain the original revise result and these open follow-ups. Otherwise continue the required evidence collection. No general publication, VCS operation or native qualification is authorized.

## AGDF Approval Summary (de; source=en)
- Umfang: Interne Erprobung im bestehenden Projekt mit kontrollierten Daten; keine Veröffentlichung oder native Produktionsqualifikation.
- Nachweise: Bestehende geprüfte Chat-/Core-Ergebnisse bleiben erhalten; der direkte Fix besteht Core-, UI-, Browser- und Paketprüfungen.
- Risiken: Vier offene Nachweisgruppen: native Bedienung, vollständiger iPad-/Ansichtsvergleich, tatsächliches Host-Schließen/Berechtigungsverweigerung und Modellmessungen. Risiken, Folgen, Nacharbeit und Verantwortliche sind im Abweichungsvorschlag vollständig angegeben. QA bleibt Nachbessern; nur deren ausdrückliche Akzeptanz führt zu UAT.

- memory_target: scope_artifact
- memory_reason: Exact bounded quality/deviation proposal belongs to this Run, not model memory.
- memory_refs: .agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence/renewed-tp-15/qa-deviations-47/VERIFICATION.json
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing source, approval and evidence owners remain; no new graph authority.
