# Brownfield Analysis: Community Health Implementation Preparation

Status: pass
Mode: pre_implementation_analysis
Based on: `.agdf/control/artefacts/github-community-health-governance/TP.md`
Date: 2026-07-23
Owner: agent

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- scope: Implement the approved root policies, GitHub adapters, metadata desired state, social-preview asset, deterministic validator/tests, CI integration and durable ownership records. Keep GitHub settings and default-branch recognition as separately evidenced operations.
- transparency: Full Structured Delivery remains required because the change introduces public security and governance policy, multiple GitHub interactions, a validator dependency and external host state. No later artefact is shortened or skipped.
- required_next_step: Begin CD+Tests with repository-owned tasks T02–T16; perform T17 only after exact authenticated target/capability preflight.

## Existing-System Evidence

| Area | Coverage | Evidence | Reuse decision |
|---|---|---|---|
| Public entry documentation | partially_done | `README.md`, `INSTALL.md`, `RELEASE.md` already own overview, runtime/setup and release behavior | extend README navigation; link to existing owners |
| Legal and brand | fully_done | `LICENSE`, `NOTICE`, `TRADEMARKS.md` | reuse by reference; no policy reinterpretation |
| Community policies | not_done | No root or `.github/` Conduct, Contributing, Security, Support or Governance file exists | new project-specific root policies |
| GitHub interaction adapters | not_done | `.github/` currently contains only `agdf-guardrails.yml` and `publish-agdf.yml` | new Issue Forms, chooser, PR template and CODEOWNERS |
| Public identity/contact | partially_done | `pages/src/data/site.ts`, `agdf/package.json`, repository URL and `agdf@iself.eu` already exist | reuse exact identity and contact |
| Repository metadata | not_done | Public observation records null description/homepage and empty topics; Community Profile is 28 percent | add desired-state manifest; later apply/read back host settings |
| Security host capability | partially_done | Authenticated GitHub connector proves admin/maintain/push permission on exact public repository; it does not expose PVR status | keep email fallback complete; defer PVR claim until authenticated settings observation |
| Social-preview source | partially_done | `assets/intro.png` is brand-consistent, 2172×724 PNG; GitHub target is 1280×640 | adapt to a dedicated asset; do not stretch or crop blindly |
| YAML capability | partially_done | `pages/package-lock.json` contains YAML transitively but root package declares no dependency | add root declared dependency and lockfile |
| Validation/CI | partially_done | Root has only `set-version`; guardrail workflow already owns repository verification | extend existing root scripts and guardrail job; no second CI workflow |
| Durable governance memory | partially_done | SOT Registry and Context Graph exist without community-policy ownership | extend existing files and create one curated node |

## Scope And Worktree Isolation

- exact repository: `ArndtGold/ai-native-governance-delivery-framework`
- default branch: `main`
- connector permission evidence: authenticated `admin`, `maintain`, `push`, `triage` and `pull`
- local changed paths at analysis time: only the Community Health run's backlog, artefacts and run state
- existing `.github/` paths: two workflows only
- unrelated OpenCode run paths are not present in the current changed-path output and remain out of scope
- no generated runtime, installed cache or product source path is an approved implementation owner

## Reuse Strategy

- `extend`: README, root package scripts, AGDF Guardrails workflow, SOT Registry and Context Graph
- `new`: five root policies, GitHub adapters, metadata desired-state manifest, social-preview asset and focused community-health checker/tests
- `reuse`: runtime/install/release/legal/brand documents and existing public contact identity
- `replace`: none
- `refactor`: none

The focused checker is a repository validation tool only. It must not become another AGDF CLI, gate evaluator, host-settings synchronizer or YAML implementation.

## Compatibility And Regression Impact

- no AGDF runtime, gate, approval or interaction schema changes;
- no generated package assets should change;
- root dependency installation is new and must not alter Pages dependency ownership;
- CI keeps all existing guardrail steps and adds focused checks;
- filenames and CODEOWNERS paths are case-sensitive;
- GitHub Issue Forms are host-parsed and require post-delivery observation in addition to local YAML validation;
- public security behavior must remain safe when PVR is absent or unverified;
- default-branch recognition is not locally reproducible and stays an explicit post-delivery obligation.

## Parallel-Structure And Drift Check

- parallel policy tree: prevented by one root owner per policy and thin `.github/` adapters;
- metadata drift: mitigated by `.github/repository-metadata.json` as desired state plus separate host read-back;
- runtime/release duplication: prevented by links to current owners;
- duplicate CI: forbidden; extend `agdf-guardrails.yml`;
- duplicate CLI: forbidden; the checker validates only this repository contract;
- SoT drift: none currently observed; missing domains are additive and approved.

## Risks

| Risk | Status | Control |
|---|---|---|
| PVR state cannot yet be read through the available connector | warn | complete email fallback; browser/settings verification before claiming primary PVR route |
| Root dependency expands supply-chain surface | warn | one declared parser dependency, lockfile and clean-install evidence |
| Host metadata and repository files have different mutation paths | warn | desired/effective state separation and before/after read-back |
| Policy copy could duplicate runtime/release rules | controlled | canonical-owner links and deterministic assertions |
| Existing broad repository tests may expose unrelated active-run findings | controlled | classify and preserve unrelated state; exact changed-path boundary |

## Context Graph

- context_graph_impact: `new_node_required`
- context_graph_refs: proposed `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `create`
- context_graph_gate_effect: `warning`
- context_graph_evidence: The approved design introduces durable public-policy ownership, a desired/effective host-state split and a fail-safe confidential security invariant that remain relevant beyond this run.

## Missing Evidence

- authenticated PVR settings state;
- host-applied description, homepage, topics and social preview;
- default-branch Community Profile, Issue Form, PR template and CODEOWNERS recognition.

These gaps do not block repository implementation because the approved fail-safe behavior and post-delivery evidence boundaries are explicit. They do block the corresponding live claims.
