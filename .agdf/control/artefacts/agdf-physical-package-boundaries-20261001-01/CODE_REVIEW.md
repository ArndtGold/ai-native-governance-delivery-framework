# Code Review: Physische Paketgrenzen

Binding: Dispatcher skill_continuation; revision 15 / e83f627d-371e-4242-b824-2d3732e6ce58; FINAL_SOURCE_BINDING.json

## Code Review

- decision: pass
- findings: No meaningful unresolved code defect remains evident in the reviewed migration scope. Corrected implementation defects and affected reruns are listed below.
- missing_evidence: No required code verification is missing for the reviewed source, actual archive/protocol and isolated lifecycle scope. Native host/model sessions, Windows and Node24 native are outside this migration claim. Original checkpoint/index obligations remain TPR-E001/E002 and cannot be closed by Code Review.
- risks: Large physical move affects generated/packaged sources; clean-current-source rebuild, explicit aliases, actual three-archive consumers, repeat build identity, strict private/public version checks and current source fingerprint binding reduce that exposure. Real installation/publication/VCS actions remain unperformed.
- required_next_step: Record CR through run-step review, then run qa-gate over this review set and the open TP evidence obligations.

## Actual Diff and Neighbour Review

Review base is the saved actual C00 source, including the earlier MCP discovery repair and dirty shared owners. CORE_DIFF_REVIEW.patch records the mapped Core-owner diff; FINAL_DIFF_INVENTORY.json records final moved/added/modified sources and unchanged historical artefacts. Inspection covered resource/contract validation, observer/provider composition, Core Git-candidate validation, repair rescans under canonical locks, explicit runtime bindings, source/installed provenance closures and historical normalization, MCP worker/stdin/stdio/SDK boundary, normal/scoped assembly, package exports/bins, root/delegating scripts, source-fixture dependencies, version/lock/CI/release paths and canonical source ownership documentation.

The contract allowlist binds declared basename modules and version; missing/invalid resources do not fall through to client env or checkout. createCoreServices supplies package-bound contract readers after observers, so callers cannot replace them through observer spread. Git providers only supply bounded raw observations; Core still selects exact path/commit/content and approval/seal evidence. Valid Git history alone cannot authorize approvals. CLI process/runtime providers retain fixed argv, target/deadline/result validation and non-authorizing semantics, now tested directly.

## Corrected Defects and Verification

| Issue | Correction | Current evidence |
|---|---|---|
| Importing sync-package-assets performed destructive Core copies before prerequisite validation and raced generated output | Move projections inside the explicit build invocation after preflight | tests/clean-checkout.log; FINAL_CORRECTIONS.json (six affected sequential reruns) |
| macOS /var and /private/var alias prevented direct main entry execution in clean fixtures | Shared realpath main-entry check and equivalent assembly guard | tests/clean-checkout.log; tests/cli-local-development-install-test.log |
| Local host prep assembled unrelated public/Copilot profiles and could fail before scoped installation fixture | Scoped dist/local/<surface>/npm assembly; full dist/npm retains complete prerequisites | tests/cli-local-development-install-test.log; tests/cli-local-marketplace-test.log |
| Source fixtures lost internal SDK test-client transitive dependencies or dereferenced executable links incorrectly | Copy exact bundled dependency files with bounded workspace links and preserved .bin links; SDK client remains test-only | tests/clean-checkout.log; tests/mcp-server-*.log; tests/archive-consumers.log |
| Private Core and development lock version could drift from public assembly | Strict Core private/version assertion; version-coherence includes Core and workspace lock versions | tests/cli-release-bump-test.log; tests/cli-release-version-coherence-test.log; tests/pack-closure.log |
| Physical source roots could leak into skills-only public candidate | Explicit new packages/core/cli/mcp-server exclusions | tests/cli-public-plugin-test.log; tests/cli-portable-plugin-test.log |
| Broad path editing touched an old-run fixture generator | Restore exact C00 bytes and verify immutable historical artefacts | FINAL_DIFF_INVENTORY.json |

The test harness comparison initially used an unselected run and a noncanonical macOS path; existing adapter recovery text differs for that distinct selection. Final actual archive parity uses the identical explicit target/run and excludes only checked_at, without masking result findings or status. Test assertion expectations for doctor warn exit0 and fixed startup validator argv were corrected to their existing contract. These harness corrections are not represented as production regressions.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md; docs/architecture/package-structure.md
- memory_target: scope_artifact
- memory_reason: Findings and test observations are bound to this run; architecture owners are already curated in existing registry/nodes.


## CI repair follow-up — 2026-10-02

- decision: pass
- reviewed_scope: Actual CI repair diff across metadata, community checks/fixtures, restored startup suite and compatibility navigation, handbook source hash, npm entrypoint contract, routing root and Pages logo URLs.
- evidence: CI_REPAIR.md; evidence/ci-repair-20261002/RESULTS.json and logs. CI-001..005 are resolved implementation_gap findings; no concrete defect remains in reviewed diff.
- risks: repaired remote platforms remain unverified; original TP evidence obligations are unchanged.
- required_next_step: Consume unchanged TPR-E001/E002 in qa-gate.

## CI prerequisites diff review — 2026-10-02

- decision: pass
- binding: baseline 31602aa; dispatcher revision 23 / 6b7e8c86-5608-495e-afc2-28d0b84a7eaf
- reviewed_scope: Both workflow dependency steps, actual negative contract matrices, contributor prerequisites and the real legacy process preload argv.
- evidence: CI_REPAIR.md; evidence/ci-prerequisites-20261002/RESULTS.json; actual five-file source diff. CI-006/007 are resolved implementation_gap findings routed to CD+Tests.
- missing_evidence: Corrected remote Windows execution remains unverified; original TPR-E001/E002 unchanged.
- risks: Platform confirmation awaits next pushed commit; the live staged duplicates stay excluded.
- required_next_step: Record current CR and consume the same open TP evidence obligations in qa-gate.

## Local dependency ordering diff review — 2026-10-02

- decision: pass
- binding: dispatcher revision 26 / 2f7a1a4b-19f9-4d87-9150-6f09b86a580e; baseline a95779e
- reviewed_scope: Actual four-file workflow/contract/contributor diff; local file dependency consumption and existing source-fixture masking boundary.
- evidence: CI_REPAIR.md and real installation positive/negative witnesses, complete smoke exit 0, source hashes in evidence/ci-local-dependency-20261002/RESULTS.json.
- findings: CI-008 resolved implementation_gap routed to CD+Tests. The initial SDK-before-fixtures correction was incomplete because it packed an unprepared CLI.
- missing_evidence: Fresh remote matrix, live host behavior and original TPR-E001/E002 remain unverified/open; existing ignored workspace payload drift is separately documented.
- risks: npm installs a local directory snapshot rather than a build-aware link; the positive and negative ordering contract now guards both sides of this boundary.
- required_next_step: Record CR, rerun qa-gate without waiving original obligations, and verify new CI.
