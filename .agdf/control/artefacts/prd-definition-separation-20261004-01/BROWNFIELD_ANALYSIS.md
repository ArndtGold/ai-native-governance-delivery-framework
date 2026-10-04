# Brownfield Analysis: Dedicated PRD authoring

Mode: pre_implementation_analysis
Decision: pass
Date: 2026-10-04
Run: prd-definition-separation-20261004-01
Reviewer: Codex; cooperative source review

## Approved Tasks And Existing Owners

T-000 is complete against commit 9f6f8aeb1e5684275efb306aad57f05db0954c02; evidence/BASELINE.json captures actual index/worktree, approved sources and foreign run/artifact digests. Current sources match the approved SD and TP. No AGENTS.md exists at the repository root or in the affected package/plugin trees. No unresolved implementation-path decision or accepted retained debt.

## Coverage And Reuse

Existing UR semantic routing is implemented in delivery-intake.js and service.js, not a separate ur-definition.js; add the approved pure PRD helper alongside it. Shared contract normalization, generated schema, CLI parser/validation handlers and definition-owned runtime module catalog already supply the required seams. Extend them, retaining current UR behavior. Existing gate evaluation owns PRD readiness and prerequisite/source/UX blockers; the helper consumes its structured result rather than introducing another parser.

The existing typed artifact writer, source relationship registry, seals and run-step transaction/recovery own initial PRD registration and update_draft replacement. No control writer changes are needed for semantic ownership. Existing current-gate prepare_gate_artifact facts identify missing PRD; incomplete material decisions use the existing AGDF_PRD_DECISIONS_OPEN state. Built integration tests must verify these routes before generic judgement fallback.

Catalog, canonical skill sources, runtime modules, host generators, package fixtures, payload/instruction checks and existing evaluations are reusable. New public skill and optional input require consumer parity and measured changes. SD/TP preparation and implementation continuation remain separate unchanged responsibilities.

## Risks And Test Impact

Check every relevant source/UX/integrity blocker, direct unbound inventory without environment selection, forbidden-stage fallthrough, revision combinations, typed source proof/replacement, stale presentation, foreign-state preservation and existing recovery. Extend actual CLI/MCP package consumers, not registry-old code. Canonical source fixtures may expose seal/transaction issues independently of dispatcher denial. Preserve all existing assertions and budget thresholds. Shared generated writes run sequentially.

Semantic derivation, clarification, explicit editing intent and approved-UR conflict need actual cooperative observations and stored inputs/outputs; deterministic tests alone do not demonstrate model behavior. No independent/native evidence is claimed.

## Context And Minimal Next Step

Update the existing CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY and SOT_REGISTRY only after verified implementation. No parallel graph/store. Reconciliation stays open_gap until curated. No schema migration, new writer, approval transfer, installation or VCS action. Next: T-001 focused authoring contract, T-002 routing, T-003 shared revision input, then the approved tests/observations and reviews.
