# Host evidence boundary

Date: 2026-10-03
Run: agdf-intermediate-status-card-reduction-20261002-01
Status: incomplete
Finding: HOST-001 evidence_gap / evidence_obligation / open

| Lane | Observation | Limit |
|---|---|---|
| Frozen source before | Required single dispatch emits one redundant card / 754 characters in permitted unchanged W-01 | Deterministic source only |
| Candidate source after | Same goal/control/checkpoints; nonterminal continuation; zero cards / zero framework characters | Deterministic source only |
| Generated candidate | Canonical sync, idempotence, conformance and runtime-integrity checks pass; digest in implementation-manifest.json | No fresh native model session |
| Installed plugin | Original 0.14.5+codex.local-ba2230d3a7db runtime remains unchanged; digest in manifest | Does not contain this candidate change |
| Current Codex conversation | Implementation/checks/reviews performed here with loaded installed skills plus explicitly inspected source contracts | No matched visible before/after pair; exact fresh-session tuple absent |
| Additional native session | Not executed | TP section 3.4 requires explicit authorization |

Do not fabricate evidence/transcripts/Codex-before.md or Codex-after.md from CLI stdout. The protected initial Brownfield-to-CD+Tests transition is not a redundant card baseline. Current commentary/tool blocks are not reclassified as framework cards. Without matched actual model output, human-visible reduction and corresponding host tool-block totals remain unverified; QA pass is forbidden.

## Concrete next verification

Authorize one bounded Codex comparison consisting of two fresh executions, before and after, against the same frozen synthetic non-authorizing fixture, user goal and obligations. Capture actual model-visible sequence, tool observations, loaded instruction/runtime digest, host/session/model identity, framework card/text counts, host tool-block counts and control/evidence parity. Use configured model settings; do not change the user's installation, copy credentials or mutate live governance data. Preserve failed initial attempts. A result is acceptable only if it demonstrates reduction without suppressing required events or checkpoints.

The existing codex-host-e2e harness is a reference only: it requires a model override and can copy local auth, and therefore cannot be run unchanged for this approved scope. A bounded verifier must honor the above constraints. Permission to implement this TP is not permission to start that separate model run.
