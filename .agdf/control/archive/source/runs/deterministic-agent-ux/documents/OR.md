# Orchestration Report: Deterministic Agent UX

Date: 2026-07-17
Gate: OR
Report mode: OR-full

## OR

- gate: OR; all required user approvals through UAT are recorded.
- artefact: `.agdf/control/artefacts/deterministic-agent-ux/OR.md`
- status: pass
- delivered: A deterministic, validated approval presentation projection; a clear three-role operating model for chat/skill, durable control state and CLI validation; synchronized Codex, Claude Code, OpenCode and GitHub Copilot repository assets; and documented exact-text fallback semantics.
- intentionally_not_delivered: No new gate authority, second renderer, second evaluator, native Copilot adapter, automatic global installation, dependency write, network access, or VCS/release action.
- TP coverage: 10/10 DAU tasks are fully done according to `TASK_PLAN_REVIEW.md`.
- Brownfield fit: pass; the approved existing presentation, evaluator, locale, generated-asset and documentation owners were extended in place.
- solution integrity: pass; one presentation owner and one gate-evaluation composition owner remain authoritative, with exact-text fallback retained only as the bounded safe transport.
- evidence: `CD_TESTS.md`, `TASK_PLAN_REVIEW.md`, `CLEAN_IMPLEMENTATION_REVIEW.md`, `CODE_REVIEW.md`, approved `QA_REPORT.md`, accepted `UAT_EVIDENCE.md`, aggregate and focused smoke evidence, Runtime Integrity, doctor and whitespace checks.
- missing_evidence: Authenticated live Claude Code, OpenCode and GitHub Copilot observations were not exercised; repository conformance does not claim those host-visible behaviors.
- risks: Host Markdown and interaction capabilities may vary. Native approval remains unavailable unless a host proves deliberate canonical-value transport.
- retained_fallbacks: Exact textual approval after fresh same-run/same-gate validation. Exit criterion: host evidence for safe deliberate transport of the exact canonical approval value.
- documentation_impact: First-contact guidance and generated surface assets now distinguish chat/skill interaction, durable repository state and optional deterministic CLI validation.
- context_graph_impact: link_only
- context_graph_refs: `CG-RUN-STATUS-CARD`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- required_next_step: No further delivery step. A commit, push, PR, publish or release requires a separate explicit user instruction; a new OpenCode installation-lifecycle simplification requires its own scoped run.
- quality_outlook: Preserve the distinction between repository conformance and observable host rendering in future surface changes.
