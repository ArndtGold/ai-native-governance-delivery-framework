# QA Report: integrated AGDF Cockpit with bounded native evidence

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, registered CD+Tests/CR/Plan/Clean reviews and exact runtime evidence
Date: 2026-10-18
Owner: Codex — qa-gate

## Objective

Use Cockpit through the AGDF plugin without separate MCP setup, bind the intended project and Run, and safely migrate the owned Legacy route without changing unrelated configuration.

## 1. QA Decision

Decision: revise

The code and structural reviews pass. Implementation, actual native replacement reading/context/close and the guarded Legacy migration are evidenced. The remaining applicable finding is evidence-only, of medium severity; complete native production qualification is not asserted. A bounded internal-use deviation proposal is provided below. Only qa-gate owns this technical result; direct user acceptance is not rewritten as a technical pass or an exact QA approval.

## 2. TP Coverage

- delivered_result: The installed AGDF plugin provides agdf-cockpit for the confirmed project/Run; native source reading, Host-confirmed context handoff, cleanup and closing were observed. The guarded owner reversibly disabled agdf-cockpit-local, and a fresh project-scoped CLI context exposes only the integrated replacement as connected.

Eight of nine tasks are fully evidenced within their implementation/handoff scope; T-008 is partially_done because its broader native qualification scenarios are incomplete. Registered TP Review preserves the AC/UX partial rows and CPI-E01; it does not turn tests into passes. T-001 through T-007 and T-009 are addressed by the actual source, preserved historical repository lane and rerun impacted checks. The user explicitly accepts the existing evidence without another restart.

## 3. Evidence

- Registered CODE_REVIEW.md: pass; no remaining concrete code defect found in the reviewed integration and applied migration effects.
- Registered CLEAN_IMPLEMENTATION_REVIEW.md: pass; existing target/session/installer/config/publication owners reused without a parallel control source.
- Registered TP_REVIEW.md: revise, solely CPI-E01 evidence_gap; task/AC and visible-mode coverage is explicit.
- CD_TESTS.md: completed implementation execution with qualification limits, preserved historical full 26-stage/45-browser lane and impacted subsequent checks. Final UI 259/259, typecheck/build, CLI probe/config 12 tests, plugin MCP and lifecycle/package/adapter suites pass.
- TERMINAL_NATIVE_RESULT_20261018.md: actual final candidate initialization/provider/project/Run/PRD/context/cleanup/inline/teardown; user confirms the resulting card disappeared or was quiet and compact. Final 32x416 SDK size is retained as an observation, not a known correct viewport measurement.
- LEGACY_RETIREMENT_APPLIED_20261018.md and indexed evidence/project-origin-fix-20261018: actual accepted guarded retirement, exact config preservation, fresh CLI replacement-only connected result.
- USER_EVIDENCE_ACCEPTANCE_20261018.md: direct no-restart/evidence-acceptance instruction.
- The explicitly approved same-byte runtime generation replacements admitted generation 4 and retired original generation 1 through the existing bounded pool. The normal file-lock owner then reclaimed the dead owner's lock, and formal CR recording succeeded at revision 42. No manual lock deletion, process kill, Desktop restart, package change or unobserved UI success was used.

## 4. Missing Evidence

- qualification_limits: Complete final native clean-install/same-key/destructive lifecycle/Decision coexistence and post-retirement live Desktop connection-refresh observations are not all available. Existing native replacement proof and fresh CLI discovery do not establish those stronger claims. CPI-E01 remains open.

The exact final native UI/server tuple and its observed lifecycle remain valid. No further restart or UI loop is requested under the user's instruction. The evidence limitation survives a human acceptance and must remain visible in UAT/OR.

## 5. Risks

- delivery_risks: A running Desktop may retain its historical connection until its normal future refresh; broader native lifecycle behavior and final publication settlement are unqualified. Scope is internal read-only use, Core approval boundaries remain enforced, Legacy config is reversibly disabled and its runtime/rollback point retained. This bounds the evidence-only risk to medium for the proposed usage; it does not authorize a broad native production rollout.

No open requirements/design/plan/implementation defect is identified by the current reviews. No high/critical risk, code-review block or structural failure is masked as an evidence deviation.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-E01 | evidence_gap | evidence_obligation | open | T-008 and partial UX rows above; native replacement journey and fresh CLI migration result exist, but broader native production qualification is incomplete | QA prepares one medium evidence-only deviation proposal for bounded internal use under the user's no-restart constraint |

## QA Deviation Acceptance

```json
{
  "schema_version": "1",
  "reviewer": "Codex — QA evidence assessment",
  "usage_scope": "Bounded internal read-only use of the integrated AGDF Cockpit for this repository. No claim of complete native production qualification or final publication settlement. No additional Desktop restart/UI test is requested.",
  "deviations": [
    {
      "finding_id": "CPI-E01",
      "severity": "medium",
      "risk": "Complete native clean/same-key/destructive lifecycle/Decision coexistence and post-retirement Desktop refresh proof is not available for the final tuple. The running Desktop can retain a prior connection even though project configuration and fresh CLI discovery are correct.",
      "consequence": "Only the observed native replacement journey and fresh CLI single-provider result are qualified. Broader native rollout and final installation publication settlement remain unqualified; guarded rollback state stays retained.",
      "follow_up": "Preserve this evidence boundary and rollback point. Before claiming broader native production qualification, the AGDF evidence owner records the remaining scenarios during an ordinary future Host refresh or in an available supported test context; no new restart is required for this accepted internal-use disposition.",
      "owner": "AGDF runtime/evidence owner (Codex)"
    }
  ]
}
```

## 6. Required Next Step

Present this exact bounded scope, medium risk, consequence, follow-up and owner for a deliberate QA acceptance with deviations. The user's earlier acceptance of existing evidence motivates this proposal but is not silently transferred to a new QA material version. No further TP approval, Desktop restart or UI test is requested. Technical QA remains revise and CPI-E01 remains open even after acceptance.

## 7. Gate Approval

The contextual action is “Approve with deviations” / “Mit Abweichungen freigeben”. The existing exact chat approval for this newly presented proposal is `Approval: QA`. No QA/UAT/release approval is recorded by this report.

## Context Graph

- memory_target: scope_artifact
- memory_reason: Exact run-specific quality evidence and explicit qualification limits.
- memory_refs: QA_REPORT.md; TP_REVIEW.md; USER_EVIDENCE_ACCEPTANCE_20261018.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none

## AGDF Approval Summary (de; source=en)

- Ergebnis: Das installierte AGDF-Plugin stellt Cockpit für das bestätigte Projekt und den Run bereit. Lesen, Kontextübergabe, Bereinigung und Schließen wurden nativ beobachtet. Der alte lokale Eintrag ist reversibel deaktiviert; eine frische CLI-Sitzung verbindet nur den integrierten Provider.
- Grenzen: Die vollständige native Prüfung von Neuinstallation, gleichem Servernamen, deaktiviertem/entferntem Plugin, Decision-Koexistenz und dem laufenden Desktop nach der Legacy-Umstellung ist nicht vollständig belegt. Die vorhandenen Nachweise werden für begrenzte interne Nutzung vorgelegt; ein weiterer Neustart wird nicht verlangt.
- Risiken: Der laufende Desktop kann seine bisherige Verbindung noch zwischenspeichern. Die breite native Produktionsqualifikation und der endgültige Installationsabschluss bleiben offen. Die Nutzung bleibt intern und lesend; Rückstellung und ursprüngliche Runtime bleiben erhalten. Die technische QA-Bewertung bleibt revise.
