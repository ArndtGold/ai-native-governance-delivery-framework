# QA Report: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-11-06
Owner: Arndt Gold

## 1. QA Decision

Decision: revise

The delivered implementation fulfils T-001 to T-012 of the approved TP (revision 47) with strong automated evidence; Code Review and Clean Implementation Review pass. The decision is `revise` because one evidence-only finding stays open: the native desktop check T-013 (TPR-01). This report proposes that finding for explicit human acceptance with deviations; the acceptance would not change this technical result.

## 2. TP Coverage

- delivered_result: A host-neutral Core run view (`packages/core/lib/companion/`) projected from the unchanged evaluateGateCheck report inside captured control snapshots, a read-only run-view command, store and per-run diagnosis, figure states and catalog texts, MCP events journaled once by the executing process with review facts and drift warnings for bound run documents, and the Claude companion rebuilt on the run view and the journal without any Core import.

TP Review (`evidence/TP_REVIEW-input-02.md`, revision 52): T-001 to T-012 fully_done (12 of 13), T-013 not_done. UX Intent Fidelity: AC-001, AC-003 to AC-008 and AC-010 fulfilled; AC-002 partial only for its live check (TPR-01).

## 3. Evidence

- Approved sources after the source revision `f40ed3bf` of 2026-11-06: PRD revision 43, SD revision 45, TP revision 47; Brownfield Analysis pass (revision 48, `evidence/BROWNFIELD_ANALYSIS-input-04.md`).
- CD+Tests pass (revision 49, `evidence/CD_TESTS-input-03.md`): T-001 to T-012, the CR corrections CR-A1 to CR-C6 and the QA follow-up corrections CIR-01 to CIR-06 and RV-01 to RV-07, each with a targeted test and, where a defect was fixed, a red check on the previous code; 30 targeted checks green in one sequence on Windows (win32), the companion suites re-run green after the last change; the RV-1 probe under concurrent writes (`evidence/CD_TESTS-probe-rv1-01.md`).
- Code Review pass (revision 51, `evidence/CODE_REVIEW-input-03.md`): three independent reviewers on the CD+Tests diff, one on the follow-up delta; all findings resolved.
- Clean Implementation Review pass (revision 53, `evidence/CLEAN_IMPLEMENTATION_REVIEW-input-03.md`): CIR-01 to CIR-06 resolved.
- TP Review revise (revision 52): TPR-02, TPR-03 resolved by the source revision; TPR-04, TPR-05 resolved by the probes in `evidence/TP_REVIEW-probes-01.md`; TPR-06 (T-002 snapshot read) resolved; TPR-01 open.
- Status card bytes for F01 to F13 equal the T-001 golden baseline; `gate-check.js` is byte-identical to main `53e8e900`; MCP contract, ergonomics, payload budget and compatibility check unchanged or within baseline.

## 4. Missing Evidence

- qualification_limits: The native Claude desktop check T-013 is not done, so native rendering, the measured refresh time and the legacy-store live check rest on automated tests with a fake host; the full packages/mcp-server suite is assigned to PR CI before merge and was not repeated locally after the follow-up corrections; Linux and macOS runners are covered only by PR CI.

## 5. Risks

- delivery_risks: The companion may show a defect that only the real desktop host reveals until T-013 is done; a run-view call costs about 0.7 to 0.8 s in process plus the node start on this repository's store, accepted by the owner (C2); under continuous writes the companion keeps its last good view stale until a read succeeds; the drift of a recording's input file after recording is not detected (PRD decision P5).

## 6. Required Next Step

Present this QA version with the deviation proposal below; on a deliberate `Approval: QA` for exactly this version, UAT follows with T-013 as UAT input. Without acceptance, Arndt Gold runs T-013 first and the TP Review and this report are recorded again.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | TP T-013 and SCN-005, PRD AC-002 evidence ("live check against a real legacy project") and PRD section 9 ("Native Claude desktop check ... with screenshots"): no screenshot, observation note or measured refresh time exists; the owner's desktop access is required | Arndt Gold runs T-013 in the Claude desktop app with the locally built plugin (current project, disposable copy of `.agdf/control/archive/source`, live events during a short run) and the screenshots, observation note and measured refresh time are stored as run evidence |

## QA Deviation Acceptance
```json
{
  "schema_version": "1",
  "reviewer": "Claude (qa-gate, reviewing agent for Arndt Gold)",
  "usage_scope": "Acceptance of this QA version for the UAT step of this run only; the native desktop check T-013 follows as UAT input; no native production qualification of the companion is claimed.",
  "deviations": [
    {
      "finding_id": "TPR-01",
      "severity": "medium",
      "risk": "The companion has not been observed in the Claude desktop app with this build: native rendering, the measured refresh time and the legacy-store hint (PRD AC-002 live check) are evidenced only through automated tests with a fake host.",
      "consequence": "A rendering or timing defect that only the real desktop host shows could reach UAT; automated parity, adapter, integrity and journal tests reduce but do not exclude it.",
      "follow_up": "Run T-013 in the Claude desktop app with the locally built plugin (current project, disposable copy of .agdf/control/archive/source, live events during a short run) and store screenshots, observation note and measured refresh time as UAT input before Approval: UAT.",
      "owner": "Arndt Gold"
    }
  ]
}
```

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Der Begleiter zeigt auf einen Blick und wahrheitsgetreu, wo jeder Run steht und was der Agent über AGDF getan hat, aus einer gemeinsamen Run-Ansicht in Core und echten MCP-Ereignissen.
- Ergebnis: T-001 bis T-012 sind umgesetzt und mit gezielten Tests belegt; Code Review und Clean Review bestanden; die technische QA-Bewertung bleibt revise, weil nur die Desktop-Prüfung T-013 (TPR-01) fehlt.
- Grenzen: Ohne T-013 ist der Begleiter in der echten Desktop-App mit diesem Stand nicht beobachtet; die volle MCP-Server-Suite und Linux/macOS laufen erst in der PR-CI.
- Risiken: Ein nur im echten Host sichtbarer Darstellungs- oder Zeitfehler kann bis zur UAT unentdeckt bleiben; eine erst nach der Erfassung geänderte Quelldatei wird nicht verglichen (P5).
- Abweichung: TPR-01 (mittel) wird mit „Mit Abweichungen freigeben“ angenommen; Nacharbeit T-013 durch Arndt Gold als UAT-Eingabe vor Approval: UAT; keine native Produktionsqualifikation.
