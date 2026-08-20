# Brownfield Analysis: Agent Skills Conformance And Portability Baseline

Status: passed
Mode: pre_implementation_analysis
Decision: pass
Mode/Slice Decision: structured_slice
Required next gate: none
Based on: approved TP
Date: 2026-08-19
Owner: Arndt Gold

## Scope

Revalidate the existing owners and clean reuse path for ASP-01 through ASP-07 before changing the
canonical plugin, Runtime Integrity, generated-surface verification and bounded public compatibility
wording.

## Evidence

- `plugin/meta/agdf-plugin.definition.json` already owns the canonical ten-skill inventory and all
  surface prefixes; the proposed conformance policy does not need or permit another skill list.
- `plugin/scripts/check-runtime-integrity.mjs` is the existing source/installed aggregate check and is
  already called by both guardrail and publish workflows.
- `create-agdf/scripts/sync-package-assets.js` is the existing source-to-plugin/Copilot/OpenCode
  generator and copies the complete source plugin while rewriting repository-surface names and paths.
- `create-agdf/scripts/runtime-integrity-negative-test.js` already owns copied-plugin aggregate failure
  fixtures; runtime-layout, package-build, package-contents and public-plugin tests already cover the
  relevant generated boundaries.
- `create-agdf/lib/public-plugin/builder.js` copies canonical `skills`, `meta` and `assets` into the
  public candidate; repository tests can run the source validator against that candidate without
  adding scripts to the public bundle.
- `plugin/submission/openai/capability-matrix.json` and `pages/src/data/site.ts` already own the
  affected public compatibility/evidence claims.
- `.agdf/control/SOT_REGISTRY.md` confirms routing, package composition, public candidate and website
  ownership; `CG-PUBLIC-PLUGIN-DISTRIBUTION` already owns the reusable cross-surface evidence boundary.
- Current worktree changes are confined to this run's control artefacts and its backlog row; no
  candidate implementation path is already dirty.

## Transparency

The approved structured slice remains required because executable validation, normative local policy,
generated projections and public compatibility wording must move together. No broader architecture,
runtime, persistence, migration, security, permission, deployment or release boundary was discovered.
Implementation may therefore proceed without revising PRD, SD or TP.

## Current Coverage

| Area | Coverage | Brownfield finding |
|---|---|---|
| Canonical inventory | fully_done | Existing plugin definition provides the required single inventory owner. |
| Core frontmatter checks | partially_done | Runtime Integrity checks delimiter, exact name text and description conventions, but not the approved complete classified baseline. |
| Resource portability | partially_done | Current checks require a contract-path marker but do not resolve or classify declared resources. |
| Source/installed aggregation | fully_done | Existing Runtime Integrity owns the entry point and layout split; it should be extended. |
| Generated surfaces | partially_done | Synchronization and package tests exist; conformance descriptors and generated-only negative proof are missing. |
| Public evidence wording | partially_done | Evidence limits exist, but broad portable-skills wording needs the approved qualification. |
| Focused conformance tests | not_done | No focused validator test owner exists yet; one bounded test script is justified. |

## Reuse Strategy

- `extend`: add the policy beneath existing plugin metadata ownership without copying `skillSet`.
- `new`: add one focused, dependency-free validator module because no reusable conformance module
  exists; keep it subordinate to Runtime Integrity rather than a new public command.
- `extend`: compose findings into `check-runtime-integrity.mjs` and extend its existing negative fixture.
- `extend`: reuse synchronization and package/public tests for all generated projections.
- `extend`: qualify existing capability-matrix and website evidence copy at their current owners.
- `replace`: none.

## Parallel-Structure And Drift Assessment

- A policy-carried skill inventory, second generator, second aggregate command or copied Runtime
  Contract corpus would be blocking and is not part of the approved implementation path.
- The validator must return data; Runtime Integrity remains responsible for process exit and public
  aggregate output.
- Generated files remain derivative. Any generated-only edits are evidence of drift and must be
  corrected at the source or synchronizer.
- The bounded YAML profile must remain visibly AGDF-owned. Reclassifying unsupported YAML syntax as a
  public-standard violation would be product-semantics drift.
- No UI, visible-state, persistence or recovery owner is affected.

## Regression And Side-Effect Assessment

- Primary regression risks are false conformance failures, false standalone-portability claims,
  incorrect surface prefix/path handling, symlink escape and non-idempotent generated assets.
- Existing Runtime Integrity success text and exit behavior, plugin discovery, skill names, gate
  semantics and package composition must remain compatible.
- The public candidate intentionally omits runtime scripts; it is validated from repository test code
  and must not gain an unapproved executable surface.
- The exact installed 0.13.2 gate validator remains unavailable. This limits machine gate evidence but
  does not block the agent-native approved implementation path or source/package test evidence.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The existing node already owns the distinction between repository, bundle,
  installed-host, portal and post-publication evidence; this run applies that invariant to Agent Skills
  conformance and plugin-scoped portability.
- memory_target: scope_artifact
- memory_reason: Implementation-specific ownership and risk evidence belongs to this run; no new graph
  node or SoT owner is required.
- memory_refs: `.agdf/control/artefacts/agent-skills-conformance-portability/BROWNFIELD_ANALYSIS.md`

## Missing Evidence

None for implementation readiness. Test, review, QA and live-host evidence remain future obligations
and must not be treated as already satisfied.

## Risks

- A deliberately bounded frontmatter decoder can overstate conformance unless every unsupported
  construct is classified as AGDF policy.
- Conservative path-token extraction can create false positives unless declarations and inline
  dependency-shaped tokens share one explicit rule.
- Public wording changes can overlap the active public-distribution workstream; preserve its owner and
  evidence boundaries and keep changes narrowly additive.

## Required Next Step

Implement the approved ASP-01 through ASP-07 tasks through the existing owners, beginning with the
policy and focused validator, then collect the planned evidence before mandatory reviews and QA.
