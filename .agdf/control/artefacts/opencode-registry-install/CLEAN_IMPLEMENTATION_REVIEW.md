# Clean Implementation Review: OpenCode Registry Installation and Runtime Integrity

Status: pass
Based on: approved TP, CD+Tests and refreshed Task Plan Review
Date: 2026-07-13

## Clean Implementation Review

- decision: `pass`
- primary_solution: The implementation removes the two root causes at their existing owners. OpenCode installs the exact registry package from the target configuration directory, so npm produces a relocatable dependency/lock state without a production fallback. The shared parser retains and normalizes the canonical control data, and the single shared transition function now derives every late gate from durable evidence instead of trusting a manually advanced `current_gate`.
- evidence:
  - `installOpenCodeGlobalPlugin()` uses one production path: `npm install --save-exact create-agdf@<expected-version>` with `cwd: configDir`.
  - Isolated real npm clean/migration probes and permanent smoke fixtures prove the old npx-cache source can disappear without breaking config-local loadability.
  - `parseControlState()` remains the only Markdown normalization boundary; it separately owns approval and artefact vocabulary.
  - `transitionDecisionForRunState()` remains the only gate-decision owner; obsolete override/progress helpers were removed rather than retained beside the corrected logic.
  - Runtime Contract and RUN_STATE source templates remain canonical and generated copies are synchronized through the existing generator.
  - TP Review is `pass` with 10/10 tasks fully covered; package smoke, runtime integrity, release bootstrap, doctor and diff checks pass.
- fallbacks_retained:
  - The parser accepts legacy `Mode / Slice Decision` only when canonical `Mode/Slice Decision` is absent. This is a bounded read-compatibility fallback for existing legacy run records, not an emitted second canonical form.
  - rationale: Existing legacy `AGDF_RUN.md` projections and historical fixtures can still contain the spaced heading.
  - target_state: All source and generated canonical RUN_STATE templates emit `Mode/Slice Decision`; canonical content wins when both sections exist.
  - exit_condition: Remove the fallback only when legacy run/projection compatibility is formally retired or migrated and repository evidence shows no supported records require it.
- workaround_or_shim_risk: `low`. The fake npm executable is a test double on the existing subprocess boundary, not production behavior. It rejects the former `--prefix` and local-source shapes, models only files observed by the CLI, and is backed by real isolated npm probes.
- parallel_structure_risk: `none`. No OpenCode-specific parser, transition table, gate model, package-source switch or duplicate Runtime Contract was introduced.
- brownfield_fit: `pass`. Changes extend the existing installer, parser, transition function, smoke suite, Runtime Contract, template and generator. Existing config merge, ownership protection, status/version reporting, Windows npm command abstraction and publish-readiness workflow remain intact.
- review_fix_integrity: The post-review fix keeps one transition owner, evaluates approved-TP prerequisites before QA/UAT, applies `not_applicable` only to Brownfield review/analysis steps, and injects the fake npm as `node <test-cli>` before platform selection. No production package-source fallback or surface-specific gate path was added.
- root_cause_assessment:
  - fragile package wiring: fixed by exact registry installation in the destination directory, not by cache detection or retry.
  - discarded internal steps: fixed at the parser allowlist and consumed by the central transition owner.
  - wrong late-gate state: fixed by explicit evidence-driven branches and removal of the manual gate override.
  - heading drift: canonicalized at source with bounded legacy read compatibility.
  - QA vocabulary drift: normalized at the parser boundary while preserving separate report evidence.
  - stale/dead structures: obsolete helpers removed; namespace drift prevented by installed-output tests.
- missing_evidence: none for clean-implementation integrity after the Code Review fixes. Real modification of the user's global OpenCode installation remains intentionally deferred to UAT or separate explicit instruction.
- context_graph_impact: `link_only`; no new node or reconciliation action required.
- required_next_step: Run mandatory Code Review against the final diff before QA.
