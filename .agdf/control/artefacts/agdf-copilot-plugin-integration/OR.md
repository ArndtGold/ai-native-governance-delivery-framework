# Orchestration Report: Copilot Installer Correction

Date: 2026-09-05
Run: agdf-copilot-plugin-integration

## OR

- gate: QA
- report_mode: OR-full, corrective slice of approved TP Revision 4
- artefact: .agdf/control/artefacts/agdf-copilot-plugin-integration/OR.md
- status: revise, as decided by qa-gate
- delivered: normal installer uses the existing atomic Copilot marketplace with native Git transport and content-derived refs; verifies all expected enabled skills and matching payload; restores managed state on failure; adds focused regression coverage and documentation; actual normal installation replaces temporary registration
- intentionally_not_delivered: patch to Copilot's application runtime, visual desktop proof, completed target-routing UAT, native Windows proof, VCS actions, release or publication
- evidence: HOST_EVIDENCE.md 2026-09-05; final normal installer exit 0; matching source digest; ten global and ten fresh-session skills; both native CLI versions pass first/repeat/same-version-update/rollback; full smoke and 83/83 evals
- tp_coverage: 7/8 corrective slices fully_done; desktop observation keeps CPI3-T12 partial; overall 15/19 fully_done and 4/19 partial including previous host evidence obligations
- brownfield_fit: pass; existing staging, settings, profile, provenance and lifecycle owners reused
- solution_integrity: pass; no second editable package, direct-install fallback or native-cache patch
- missing_approvals: no approval needed for the completed correction; QA/UAT remain unapproved for the broader run while host evidence is missing
- missing_evidence: desktop visibility after full restart; prior German repo-less and repository-bound behavior; optional consented SessionStart
- risks: runtime discovery is distinct from rendered desktop and live model behavior; native Windows unobserved
- retained_fallbacks: existing pinned official CLI bootstrap only if the normal launcher is unavailable; same installation path and verification; exit when the normal launcher works
- context_graph_impact: link_only
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-CREATE-AGDF-CLI-COMPOSITION
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- parent_reconciliation: evaluated not_applicable; no parent coordination or programme aggregation was inferred
- delivery_closeout: not the next step while required host evidence remains open; no commit or push performed
- required_next_step: fully quit GitHub Copilot, reopen it and verify the ten AGDF skills in a fresh desktop session
- quality_outlook: after visible discovery succeeds, continue the existing German task-target host observations and renew QA
