# Brownfield Analysis: Central quality policy implementation

Decision: pass
Mode: pre_implementation_analysis
Owner: Codex (cooperative source review)
Date: 2026-10-27

## Approved Scope and Baseline

Run: risk-based-test-strategy-20261027-01. Implement the exact approved TP using existing policy, metadata, template, review, context and generator owners. No approved source or installed host is changed by this analysis.

Baseline commit: `e50f6b02afaef3f2dbd778eb6a15718e8c0b0f5c`. The initial working tree contains only this Run's untracked artefacts/control and its MASTER_BACKLOG update. No production-source changes precede implementation.

| Protected source or boundary | Baseline raw SHA-256 |
|---|---|
| .agdf/control/artefacts/risk-based-test-strategy-20261027-01/UR.md | sha256:680afdfada2f352cb010db4d0305629c8faa26846e5c5729aa6693b0907c6f0d |
| .agdf/control/artefacts/risk-based-test-strategy-20261027-01/PRD.md | sha256:c679089a7bf6320bffe6f3a0d843ace0c7d9997528121287b866796fd48cc1ab |
| .agdf/control/artefacts/risk-based-test-strategy-20261027-01/SD.md | sha256:14957409b7da639c29c59a31645c3e96028298b03d34b6f8fa968ff24af80115 |
| .agdf/control/artefacts/risk-based-test-strategy-20261027-01/TP.md | sha256:b271bf87befc40eb5d849325214da6c345a8e61436fc09f125107fc43f3b13d4 |
| .github/workflows/agdf-guardrails.yml | sha256:66ce08eb48c115082961e32d4323c290d444360519a49040466d9481618ca342 |
| .github/workflows/verify-agdf.yml | sha256:fbdaf6e5e2836659f7f54900b2b7f2dc505acfb106f9ba42406fb701b948c32f |
| scripts/ci-plan.mjs | sha256:9860be19332b64082d882da3f8714e9a2ac5cc3ad9350db02633ad084c9796df |
| packages/core/lib/resources/contracts.js | sha256:3415f51f3568591b5b4a1eaf667630e3e95c21dfbd2734994bcc975f1591b859 |
| packages/core/lib/control-evaluation/gate-check.js | sha256:cfdad6a3b8b03982eb39635f8a8ce5b034b8d1cef1dd01a1d6eb4db2c276500e |
| packages/core/lib/control-state/approval-command.js | sha256:757524a213b5ba69123391dd88d6c1b78b832c152381686b0e89d44c68e0a5d9 |

## Reuse and Implementation Path

- quality.md already owns shared evidence meaning, normalized routes and QA. Extend it once; no new registry or evaluator.
- SD/TP module arrays and their current definition tests expect two contracts. Extend canonical metadata, actual content/digest assertions and isolated missing-resource tests together.
- Existing phase templates and TP/Code/Clean/QA skills provide application points; preserve their roles and table shapes.
- Existing graph has no general quality node. Curate the approved general node and source navigation; do not copy normative policy into it.
- Existing generator, payload report/accept command and build:prepare provide normal source propagation. The exact 397-file ceiling and attributed byte-growth method are approved in SD/TP; other footprint or profile limits remain unchanged.
- Explicit quality status/detail and approval interfaces remain intact; automatic output instructions are reconciled in their existing owners.

## Risks and Test Impact

Use the TP's focused command groups and nineteen mapped observations, sharing results. Source/generated resources must be refreshed by normal preparation before checkout runtime imports/tests; do not repair or replace the installed runtime. Test missing contracts in disposable fixtures only. Preserve CI inventory, protected sources and approval/receipt semantics. Keep semantic self-assessment, structural checks, package parity and native evidence distinct.

## Context Graph and Knowledge

- context_graph_impact: new_node_required
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-quality-contract; .agdf/control/CONTEXT_GRAPH.md#cg-ux-intent-before-prd; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: create
- context_graph_gate_effect: warning
- context_graph_evidence: Approved SD/TP require general quality navigation; the node and links are implementation tasks, not yet completed.
- memory_target: context_graph
- memory_reason: Persist reusable quality ownership at its project owner; Run-specific baseline/results stay in this Run.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md

## Next Step

Record this passing Brownfield Analysis, then execute CD+Tests under the approved TP. No material ownership/scope fact blocks the scoped implementation. This review does not assert tests passed, independent assurance or native-host behavior.
