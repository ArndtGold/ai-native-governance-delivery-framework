# QA Report: Repository-specific migration and repair

Status: pass; ready for exact QA approval
Gate: QA
Gate approval: open
Decision: pass
Date: 2026-09-30
Control snapshot: revision 20, da0e298c-416f-4b70-a367-a020a2629ab7; reevaluation after native fresh-session evidence
Owner: Arndt Gold; QA decision owner: qa-gate

## Quality Readiness

| Dimension | Evidence | Result |
|---|---|---|
| Plan coverage | TASK_PLAN_REVIEW.md: T-001 through T-009 complete; all 12 criteria done and applicable UX fidelity rows fulfilled; TP-E01 resolved by actual native events. | pass |
| Solution integrity | CLEAN_IMPLEMENTATION_REVIEW.md: shared maintenance owner, canonical reuse, bounded/manual fallbacks and unchanged source digests. | pass |
| Code quality | CODE_REVIEW.md: scoped pass; CR-001/002 resolved with concrete regressions; 29 retained passing suites. | pass |
| QA decision | qa-gate consumes completed reviews, installed PTY behavior and four actual fresh native Codex SessionStart events with unchanged roots/consent. | pass |

This is the derived non-authorizing projection. Only qa-gate decides the final QA result.

## QA Gate

- decision: pass
- evidence: Approved PRD/SD/TP and Brownfield preparation; 29 focused passing suites with intact output hashes; canonical extraction parity, deterministic profiles, reviewed payload and integrity guards; completed source/clean/plan reviews; unchanged 30 product source digests, original staged diff and 156 other run files. Installed PTY migration/repair/details/deferral/no-original/repeat outcomes are recorded separately from four actual fresh native Codex SessionStart events. NATIVE_SESSION_EVIDENCE.json records enabled trusted installed hooks, exact candidate binding, distinct session IDs, native completed context, migration/repair/current/absent target states, correct hint/no-hint and unchanged fixture/real receipt hashes. All applicable UX fidelity rows are fulfilled.
- missing_evidence: None within the approved implementation/QA scope. Human Approval: QA and human UAT are not recorded and are not inferred from work intent or fixture choices.
- risks: Large inventories retain the tested honest unavailable/manual fallback under the shared startup deadline. Native Windows and other hosts are outside this observed Codex/macOS lane. This observation uses the actual native local app-server and model-context hook events; it does not claim a graphical desktop restart, completed model answer, continuous directory-change monitoring or human UAT. Prior unrelated checkout changes remain outside the scoped QA result.
- required_next_step: Present this sealed QA pass for exact Approval: QA on the current run revision.
- impact_codes: Existing AGDF quality/ownership boundaries apply; no new registry or product criterion is introduced.

## Finding Consumption

| finding_id | source | gap_type | routing_target | gap_status | QA effect |
|---|---|---|---|---|---|
| CR-001 | CODE_REVIEW.md | implementation_gap | CD+Tests | resolved | Installer renderer regressions prove correction. |
| CR-002 | CODE_REVIEW.md | implementation_gap | CD+Tests | resolved | Target-identity replacement/no-write test proves correction. |
| TP-E01 | TASK_PLAN_REVIEW.md | evidence_gap | evidence_obligation | resolved | Native session IDs, trusted hook discovery and automatically completed model-context events prove the routed evidence obligation. |

No finding is reclassified or suppressed. The previously open evidence obligation is resolved by actual native SessionStart execution, not by source/fixture inference. QA pass is a readiness decision; it grants no human QA/UAT approval, release or VCS authority.

## Context Graph

- Situation: The shared capability and direct/startup adapters retain existing CLI composition and interaction/dispatcher authority owners.
- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-NATIVE-INTERACTION-AUTHORITY; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Completed Brownfield Review/Analysis and Clean Implementation Review link concrete existing nodes; no new parallel policy or registry.
- memory_target: scope_artifact
- memory_reason: Candidate-specific evidence and missing observation belong to this run.
- memory_refs: CD_TESTS.md; AUTOMATED_EVIDENCE.json; HOST_EVIDENCE_GAP.md

## Native fresh-session reevaluation

Four ephemeral read-only sessions on isolated repair, migration, current and absent roots ran the unchanged trusted installed hook automatically on first turn. Native context was captured and turns were interrupted without executing tools or changing fixture bytes. NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json contain the raw native event evidence and boundary. The initial sandbox-only attempt failed before session startup; permitted host-state access allowed observation without modifying trust/config/receipt. No new source fix was needed. qa-gate returns pass within the approved scope; exact human QA approval remains pending.

## AGDF Approval Summary (de; source=en)

- Entscheidung: QA pass für die genehmigte Umsetzung. Alle offenen Review-Findings sind nachweislich gelöst; qa-gate ist die einzige Stelle für die endgültige QA-Bewertung.
- TP-Abdeckung: Alle neun Aufgaben und zwölf Abnahmekriterien sind erfüllt. Die anwendbaren UX-Kriterien sind belegt. TP-E01 ist durch vier echte, frische Codex-Sitzungen mit automatisch ausgeführtem SessionStart geschlossen.
- Belege: 29 bestandene Testsuiten, unveränderte 30 Produktdateien, bewahrte frühere Änderungen und 156 andere Run-Dateien. Die installierte Runtime besteht Migration, belegte Reparatur, Details, Aufschub, fehlende Originale und Wiederholung. Native Starts melden für Migration und Reparatur den richtigen Repository-Hinweis; aktuelle und AGDF-freie Repositories erhalten keinen Wartungshinweis. Plugin-Hooks sind aktiviert und vertrauenswürdig; Repository- und Berechtigungsdaten bleiben unverändert.
- Fehlt: Innerhalb des genehmigten QA-Umfangs fehlen keine Belege. Die menschliche QA-Freigabe und die spätere UAT-Entscheidung liegen noch nicht vor.
- Risiken: Große Bestände können das geprüfte Zeitlimit erreichen und erhalten dann den ehrlichen manuellen Ausweichweg. Andere Hosts und natives Windows sind nicht live geprüft. Die Beobachtung belegt native Codex-Start-Ereignisse und deren Modellkontext, keinen grafischen Desktop-Neustart, keine abgeschlossene Modellantwort, keine kontinuierliche Verzeichnisüberwachung und keine menschliche UAT. Frühere fremde Änderungen sind nicht Teil dieser QA-Bewertung.
- Nächster Schritt: Diese versiegelte QA-Fassung prüfen und auf dem angegebenen Run und der aktuellen Revision ausdrücklich mit Approval: QA freigeben. UAT, Veröffentlichung und VCS-Aktionen sind damit noch nicht ausgeführt.
