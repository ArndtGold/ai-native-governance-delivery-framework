# QA Report: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-11-07
Owner: Arndt Gold

## 1. QA Decision

Decision: pass

The delivered implementation fulfils T-001 to T-015 of the approved TP (revision 60, after the TP source revision `fbfbe051` of 2026-11-07) with strong automated and native evidence. Code Review, Clean Implementation Review and TP Review pass, and no normalized finding is open. The native desktop check T-013 found two defects and led to one owner request; all three were planned by the TP revision, implemented, reviewed and verified, including the native re-check of the legacy store.

## 2. TP Coverage

- delivered_result: A host-neutral Core run view projected from the unchanged evaluateGateCheck report inside captured control snapshots, a read-only run-view command, store and per-run diagnosis including the run-folder count of an unsupported store, figure states and catalog texts, MCP events journaled once by the executing process with review facts and drift warnings, and the Claude companion rebuilt on the run view and the journal, loadable by the desktop host and naming runs only where needed.

TP Review (`evidence/TP_REVIEW-input-03.md`, revision 66): T-001 to T-015 fully_done (15 of 15). UX Intent Fidelity: AC-001 to AC-008 and AC-010 fulfilled with visible evidence, including native screenshots.

## 3. Evidence

- Approved sources: PRD revision 43, SD revision 45, TP revision 60 (TP source revision `fbfbe051` from UAT, proposal `evidence/TP-revision-proposal-02.json`); Brownfield Analysis pass (revision 61, `evidence/BROWNFIELD_ANALYSIS-input-05.md`).
- CD+Tests pass (revision 62, `evidence/CD_TESTS-input-04.md`): T-001 to T-015 with the native-check follow-up F1 (host load), F2 (run-folder count) and F5 (texts), red checks for F1 and F2, and the re-run suites of 2026-11-07.
- Code Review pass (revision 63, `evidence/CODE_REVIEW-input-05.md`): an independent delta review of the follow-up found no product defect and four test gaps (DR-01 to DR-04), all corrected with checks shown failing on the previous state; the static host checks now run on the acorn syntax tree.
- Clean Implementation Review pass (revision 64, `evidence/CLEAN_IMPLEMENTATION_REVIEW-input-04.md`): no new integrity finding; the listing rule stays with its discovery owner.
- Native check (revision 65, `evidence/T-013-NATIVE_CHECK-02.md`): current project, legacy store with "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt", live events 0.6 to 5.1 s after their journal entry, drift 4.7 to 6.8 s after a file edit, toasts in the main window 3.4 to 4.6 s after their event, run-view 1.2 to 2.8 s median.
- Status card bytes for F01 to F13 equal the T-001 golden baseline; `gate-check.js` is byte-identical to main `53e8e900`; compatibility record re-recorded and checked (0 failed); payload, package contents and host compatibility pass; `claude plugin validate` passes.

## 4. Missing Evidence

- qualification_limits: The full packages/mcp-server suite and PR CI on GitHub Actions run before merge, so Linux and macOS runners are not yet covered; native evidence covers the Claude desktop app on Windows 11 only, not the Claude CLI or Codex.

## 5. Risks

- delivery_risks: A run-view call costs 1.2 to 2.8 s on the measured stores (owner accepted, C2); the desktop app draws plugin toasts only in its main window; the drift of a recording's input file after recording is not detected (PRD decision P5); the wording points F4 of the native check are a follow-up.

## 6. Required Next Step

Approve this QA version with `Approval: QA`; UAT follows with the native check `evidence/T-013-NATIVE_CHECK-02.md` as input.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | resolved | The native check T-013 is done: `evidence/T-013-NATIVE_CHECK-02.md` (recorded evidence, revision 65) with screenshots, measured refresh time and the SCN-005 re-check with count | none |
| TPR-07 | plan_gap | TP | resolved | The TP gaps found by the native check (count for an unsupported store, host load rule, owner-requested texts) were closed by TP revision 60 and fulfilled (TP Review revision 66) | none |

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Der Begleiter zeigt auf einen Blick und wahrheitsgetreu, wo jeder Run steht und was der Agent über AGDF getan hat, aus einer gemeinsamen Run-Ansicht in Core und echten MCP-Ereignissen.
- Ergebnis: T-001 bis T-015 sind umgesetzt und belegt, die technische QA-Bewertung ist pass; Code Review, Clean Review und TP Review bestanden, kein Befund offen.
- Nativer Test: In der Desktop-App lädt der Begleiter, zeigt Runs, Ereignisse, Abweichungen und Toasts im Hauptfenster und nennt für den alten Bestand „189 Runs nicht lesbar“; die drei Befunde des Tests sind über die TP-Revision vom 7. November behoben.
- Grenzen: Die volle MCP-Server-Suite und Linux/macOS laufen erst in der PR-CI; nativ geprüft ist nur die Claude-Desktop-App unter Windows 11.
- Risiken: Eine Aktualisierung kostet 1,2 bis 2,8 Sekunden; Toasts erscheinen nur im Hauptfenster; die Formulierungspunkte F4 folgen in einem eigenen Auftrag.
