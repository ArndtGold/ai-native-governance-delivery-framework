# CD+Tests: Agent Skills Conformance And Portability Baseline

Status: done
Based on: approved TP and passed pre-implementation Brownfield Analysis
Date: 2026-08-19
Owner: Arndt Gold

## Delivered Tasks

| task_id | Status | Implementation | Evidence |
|---|---|---|---|
| ASP-01 | done | Added `plugin/meta/agent-skills-conformance.json` and registered it in the live SoT Registry without adding `skillSet`. | Policy fixtures reject missing and unsupported schema; focused test asserts the canonical inventory is not duplicated. |
| ASP-02 | done | Added the dependency-free structured validator with bounded frontmatter decoding, strict metadata rules, advisory classification and stable findings. | Focused tests cover missing/malformed metadata, duplicate fields, scalar styles, exact/over limits, name forms, deterministic replay and finding field order. |
| ASP-03 | done | Added Runtime Contract declaration extraction, undeclared-token detection, lexical/physical boundary checks and `skill_local`/`plugin_scoped` classification. | Focused tests cover current shared resources, skill-local resources, unresolved/absolute/URL/traversal/undeclared paths, fenced examples and symlink escape. |
| ASP-04 | done | Composed the validator into existing Runtime Integrity, removed its overlapping metadata/resource checks and preserved the existing aggregate command and success output. | Source Runtime Integrity, copied installed-layout tests and extended aggregate negative tests pass; missing validator/policy and invalid standard metadata fail non-zero. |
| ASP-05 | done | Reused the existing synchronizer and validated complete plugin, Copilot, OpenCode and public-candidate projections with the same algorithm. Packaged policy/validator presence is asserted. | Four-surface focused checks, generated-only drift fixture, byte-identical package build, 301-file package contents, runtime-layout and public-plugin tests pass. |
| ASP-06 | done | Qualified the existing capability matrix and website copy to core-format/profile and plugin-scoped evidence with explicit standalone and cross-host non-claims. | Public-plugin assertions, landing-page protected-copy test and public-document routes pass; seven-section site structure remains unchanged. |
| ASP-07 | done | Ran focused, package, website and aggregate regression evidence and inspected the actual diff. | Full `create-agdf` smoke passes; 66/66 deterministic skill evals pass; Pages landing/public-document tests pass; `git diff --check` and Node syntax checks pass. |

## Evidence Summary

- `npm --prefix create-agdf run test:agent-skills-conformance`: pass; ten canonical skills, policy,
  metadata, resources, symlinks and four generated surfaces.
- `npm --prefix create-agdf run test:runtime-integrity-negative`: pass.
- `npm --prefix create-agdf run test:runtime-integrity-layout`: pass.
- `node plugin/scripts/check-runtime-integrity.mjs`: pass; source mode, ten skills and sixteen control
  files.
- `npm --prefix create-agdf run smoke-test`: pass, including release preparation, byte-identical
  builds, package contents, public candidate, routing and 66/66 deterministic skill evaluations.
- `npm --prefix pages run test:landing`: pass; seven sections, 1,571 visible words, protected boundary
  copy, metadata, no-JS and payload checks.
- `npm --prefix pages run test:public-documents`: pass.
- `node --check` for the validator and focused test plus `git diff --check`: pass.

## Evidence Boundary

This is repository and generated-bundle evidence. It does not prove standalone skill installation,
authenticated host execution, identical behavior across hosts, publisher verification, portal state,
public availability or UAT. The exact installed AGDF 0.13.2 gate validator remains unavailable and is
not replaced by source Runtime Integrity evidence.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none

## Next Step

Consume this evidence through Task Plan Review, Clean Implementation Review and mandatory Code Review,
then run the QA gate.
