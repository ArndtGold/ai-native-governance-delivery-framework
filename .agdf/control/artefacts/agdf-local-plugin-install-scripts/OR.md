# OR: Simple Local Plugin Installation Scripts

- gate: OR; UAT approved
- report_mode: OR-full
- artefact: `.agdf/control/artefacts/agdf-local-plugin-install-scripts/OR.md`
- status: pass
- delivered: Simple source-checkout npm entry points for Codex, Claude Code and OpenCode; canonical source preparation; exact local identity and provenance handling; reuse of existing installer and lifecycle owners; contributor documentation; deterministic automated coverage; direct restarted Codex loaded-host proof for `0.13.5+codex.local-619acdcbd1f9`.
- intentionally_not_delivered: npm release, marketplace publication, deployment, automatic commit, push or pull request. Direct Claude Code and OpenCode loaded-host UAT was not performed and was not required by the accepted Codex UAT boundary.
- evidence: Approved UR, PRD, SD, TP, QA and UAT; TP Review 15/15; UX fidelity 11/11; Brownfield, clean implementation and code reviews pass; full smoke passes; 66/66 deterministic skill evaluations; 29 coherent version surfaces; 302 package files; Runtime Integrity passes; root audit reports 0 vulnerabilities; fresh Codex task loads the exact suffix skill and validator runtime; focused doctor passes.
- missing_evidence: none within the accepted Codex UAT boundary
- risks: Historical Codex caches remain retained; native Windows execution is fixture-backed only; OpenCode retains its development-local file dependency until a future public installation path replaces it.
- retained_fallbacks: none
- required_next_step: Use `delivery-closeout` only if the user explicitly requests a commit, push or pull request handoff.
- quality_outlook: Preserve direct restarted-host checks whenever installer identity, cache selection or host activation behavior changes.

## Coverage And Fit

- tp_coverage: pass; 15/15 approved tasks and 11/11 UX fidelity rows are fulfilled.
- brownfield_fit: pass; canonical preparation, marketplace, lifecycle, OpenCode and validation owners were reused without parallel authority.
- solution_integrity: pass; no retained fallback, workaround or competing owner was found.
- documentation_impact: pass; `INSTALL.md` and `CONTRIBUTING.md` distinguish source-checkout installation, public bootstrap, restart, new-task pickup, repository activation and UAT evidence.
- uat_status: approved; exact user approval followed direct loaded-host evidence and same-run, same-gate, same-revision revalidation.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing node records the source-checkout installation aliases, canonical preparation and reuse boundary.

## Coordination

- parent_reconciliation: not_applicable
