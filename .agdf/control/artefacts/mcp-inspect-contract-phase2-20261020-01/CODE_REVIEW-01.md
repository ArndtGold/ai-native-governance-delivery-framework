# Code Review: native wrapper admission defect

Decision: revise
Date: 2026-10-20
Reviewer: Codex; cooperative source review, not independent human review
Run: mcp-inspect-contract-phase2-20261020-01

## Code Review

- decision: revise
- findings: [medium] evals/mcp-ergonomics/lib/native-run.js, pureInspectWrapper: storing tools in a local alias admits a forbidden method handle, and a computed member key can evade the literal constructor blacklist. Deterministic read-only reproductions both returned true: `const t=tools; const f=t.exec_command; text(await f({cmd:"cat control"}));` and `const k="constructor"; const F=text[k]; const run=F("return process"); text(run().env);`. The auditor never executes these snippets, but must reject them to substantiate its no-detour claim.
- missing_evidence: regression coverage for these two indirect access forms and a same-trace qualification under the corrected final auditor.
- risks: latent false qualification for a different future trace; no evidence that the actual retained replacement session used these access forms. The current task's direct inspect calls and complete document evidence remain retained and must be re-audited after repair.
- required_next_step: Repair this existing auditor in CD+Tests with explicit direct tool-call admission and bounded member access, add adversarial regressions, rerun deterministic checks and re-audit the same retained trace without a model invocation.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-AUDIT-001 | implementation_gap | CD+Tests | open | The two concrete snippets above are incorrectly admitted by pureInspectWrapper; the approved TP prohibits shell/process/eval detours | Correct the existing auditor, test the adversarial forms and re-audit the retained replacement trace. |

No new product semantics, upstream requirement, design, extra native session, test removal or raised timeout is proposed. QA remains the sole final quality decision owner. Other code and plan/clean review work remains in progress, not passed by this report.
