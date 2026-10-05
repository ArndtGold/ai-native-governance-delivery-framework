# CI Portability Correction Review

- decision: pass (bounded correction and complete required actual platform proof)
- reviewer: Codex (cooperative review)
- candidate: CANDIDATE_CI_PORTABILITY.json
- actual delta: one line in scripts/test-package-consumers.mjs
- evidence: native Windows before-fix archives failure in run 37307012984 / job 111753028255; CI_PORTABILITY_FIX_PROPOSAL.json; logs/CI_PORTABILITY_PACK.log; logs/CI_PORTABILITY_ARCHIVE_CONSUMERS_AFTER_PACK.log (exit 0); logs/CI_PORTABILITY_COMPATIBILITY.log (exit 0)

The existing comment and Core generator explicitly allow only resources/binding.js to differ
between source and packaged Core. Windows constructs resources\binding.js, so the original
string comparison mistakenly applied byte equality to this descriptor. Normalize separators
for that existing comparison only. Use the original native relative path for filesystem reads.
All other Core modules retain exact unchanged deepStrictEqual byte checks. No extra exception,
skip, weakened threshold, Windows-only bypass or generated product change is introduced.

The first local consumer invocation correctly rejected stale workspace tarballs; its failed log
is retained. Normal npm pack regenerated the current three archives before the successful check.
All manifests, canonical Core bytes, CLI/bootstrap, exports, blocked-network profiles, actual
stdio MCP protocols/provenance and CLI parity checks passed after repacking. Compatibility
check also passed without any evidence refresh or changed protected file.

Scope: T-008 actual archive consumers and platform evidence; no requirement/design change and
no second acceptance owner. Native Windows after-fix behavior and full exact new candidate
matrix now pass in CI_MATRIX_FINAL.json. Parent Linux successes remain historical and were
not transferred to the new commit.

Required next step: consume all three complete exact new CI lanes in the existing QA reassessment.
