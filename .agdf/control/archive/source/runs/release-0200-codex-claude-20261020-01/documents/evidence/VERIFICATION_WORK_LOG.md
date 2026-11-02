# Operational verification log

This is execution evidence, not gate authority. Canonical Run revision was 12 at preparation; the actual
CD+Tests report is recorded separately through the existing owner. QA/native qualification are not claimed.

- Canonical version preparation, full build, 49-surface coherence, nine history snapshots,
  113/113 deterministic skill evaluations and 56 deterministic adapter scenarios passed.
- The all-in-one shared plan was invoked twice. It stopped first at a missing new-document fixture
  copy, then at a current-version inspection mock fixed to 0.14.5. Both were repaired and the
  corresponding checks passed. These invocations are not reported as successful whole-command runs.
- Remaining execution uses the unmodified `verificationPlan`, `executeVerificationPlan` and
  `testInventory` owners. The CLI inventory has 159 entries, including 18 isolated source/phase cells.
- The current-version migration/repair, MCP-lifecycle and OpenCode mocks now use canonical version
  data. The historical request-activation host schema remains bound to its original 0.14.5 run.
- Request-activation corpus fingerprint was recomputed through its existing calculator after
  reviewing changed version/host-policy metadata; all 39 deterministic cases pass.
- Source/phase matrix: all 18 cases passed. Two serial cases were retained; the interrupted serial
  UR/TP case was rerun in the canonical isolated partition set. The remaining 16 ran with concurrency
  three and the existing CI execution budget. Snapshot unchanged throughout the parallel portion.
- Matrix reports/logs: `/private/tmp/agdf-0200-matrix-results.json`,
  `/private/tmp/agdf-0200-parallel-matrix.log`, `/private/tmp/agdf-0200-cli-diagnostic-tail.log`.
- After the matrix, two demonstrated byte-integrity defects were fixed: invalid non-UTF8 inputs
  collapsing during text decoding, and imported Windows CRLF logs changing bytes in Git. The
  candidate hash now preserves non-UTF8 bytes; native evidence has a scoped `-text` attribute.
  The eleven qualification tests include actual Git blob/checkout and post-checkout validation.
- Byte demonstrations before/after: `/private/tmp/agdf-0200-byte-diagnostics.json` and
  `/private/tmp/agdf-0200-byte-diagnostics-after.json`; after-fix collisions are absent and raw/Git
  Windows-log hashes match. These use dummy bytes only, never native observations.
- Session 46780 completed with exit 0: canonical CLI entries after the isolated matrix, then the
  remaining wrapper/pages stages. Retained log: `logs/CLI_AFTER_MATRIX.log`.
- Current qualification log (11/11): `/private/tmp/agdf-0200-qualification.log`.

Final maintenance, migration fixture, compatibility, build and source/installed integrity completed
with exit 0. CLI_COVERAGE.json audits 159/159 canonical CLI entries. LOG_INDEX.json retains 34
text logs with checked stored digests. A fresh dirty diagnostic manifest was created; the actual
handoff rejected it with candidate_source_dirty and created no destination. RELEASE_READINESS.md
is finalized; CD+Tests is reported as revise for missing clean source/native evidence. No native release observations are available (Codex 0/10, Claude CLI 0/5,
Desktop Code 0/3). Clean shared ref, actual native results and mandatory reviews/QA remain open.

Approved TP explicitly excludes autonomous commit/push/tag. Obtain the separate scoped VCS handoff
authorization after the prepared files/results are concrete. Preserve the unrelated core-model
handoff artefacts and existing index. Do not publish or create a release tag.

2026-10-20 follow-up: actual macOS Codex CLI diagnostics executed, including 13 attempts / 10 model sessions. No release qualification accepted. Narrow parser, lifecycle-cwd and repair-capture corrections pass 12 qualification tests, native evidence regression and compatibility checks. See CODEX_CLI_LOCAL_20261020/INDEX.json and the updated readiness report; all earlier failures are retained.
