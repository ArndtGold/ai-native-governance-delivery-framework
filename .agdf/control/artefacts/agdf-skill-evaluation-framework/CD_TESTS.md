# Code Deliverables and Tests

- status: pass
- implemented: versioned 27-case corpus for all 9 canonical skills; realistic disposable repository/control fixtures; canonical routing and source fingerprints; deterministic routing, gate, approval, action, mutation and artefact-content graders; Codex/Claude bounded live recorder; stable reports; CI/publish wiring; maintainer documentation.
- deterministic_evidence: `test:skill-evals` pass; `eval:skills` pass twice with identical semantic JSON; 27/27 cases; 9/9 skills; all thresholds 100%; negative coverage for traversal, absolute paths, symlink escape, stale source, routing, gate, action, mutation, quality, malformed adapter output, timeout and rejected persistence.
- live_evidence: Codex CLI 0.142.4 executed `gate-check-normal` against a materialized repository; `live_codex` pass; selected `gate-check`; gate `PRD`; missing `Approval: PRD`; action `draft PRD`; zero changed paths; not persisted.
- regression_evidence: Runtime Integrity pass; full `create-agdf` smoke pass; `@agdf/cli` smoke pass; Pages check/build pass; selected-run doctor pass; delivery-map findings 0; both package dry-runs pass; `git diff --check` pass.
- evidence_boundary: deterministic replay remains the credential-free required CI lane; live host results are explicit supporting evidence and cannot override deterministic failure.
- decision: pass
