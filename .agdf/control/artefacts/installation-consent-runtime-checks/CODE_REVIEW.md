# Code Review: Installation Consent for Automatic Runtime Checks

## Code Review

- decision: `pass`
- findings: none open in the reviewed diff
- resolved_finding: `CR-01` manual receipt alone could leave a previously trusted Codex hook
  executable; fixed by consent gating in the shared generated entrypoint and execution regression
- resolved_finding: `CR-02` OpenCode loaded a stale Bun-cache package and lacked automatic execution;
  fixed by the verified config-local entrypoint, explicit Node and real enabled/manual sessions
- resolved_finding: `QA-UX-01` matching receipts bypassed the interactive update choice; fixed in the
  shared decision composition without changing native trust ownership or non-interactive policy
- resolved_finding: `QA-UX-02` successful release-test noise and an unstructured disclosure obscured
  the decision; fixed with quiet-success preparation and one tested structured renderer while
  preserving complete disclosure and captured failure output; cancelled installation and uninstall
  preview titles are now truthful and separately tested
- resolved_finding: `QA-UX-03` full-word plus Enter input remained unnecessarily cumbersome; the TTY
  owner now accepts 1/E, 2/M and immediate Esc, restores raw mode, pauses stdin and has direct
  non-mutating pseudoterminal evidence
- resolved_finding: `QA-UX-04` the complete technical disclosure and diagnostic lifecycle card still
  overwhelmed first-time users; fixed with a plain-language summary that preserves every material
  consent fact, `D` for implementation details, and a compact effective-state result while verbose
  and JSON output retain diagnostics
- resolved_finding: `QA-UX-05` the compact CLI omitted AGDF version identity, overstated retained
  intent as an active setting and gave no help for manual mode or invalid keys; fixed in the existing
  CLI/lifecycle owners with target and verified/update versions, explicit post-install permission
  verification, manual-mode explanation, quiet progress and deterministic invalid-input recovery
- evidence: first-install plus enabled/manual update regressions, three outcomes, zero-mutation
  cancellation, compact-default and explicit-verbose smoke assertions, final complete smoke, Runtime
  Integrity, public candidate tests and `git diff --check`
- missing_evidence: revised live installer rendering, Codex trust completion, Windows and rendered public candidate
- risks: host contracts can drift; each claim still requires native observation
- required_next_step: rerun QA with TPR-01 narrowed to remaining evidence cells

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QA-UX-02 | implementation_gap | CD+Tests | resolved | User-provided terminal output; structured section, quiet-success, cancel-title and uninstall-preview regressions; final complete smoke pass | Retain as resolved traceability evidence and obtain revised live-host rendering. |
| QA-UX-03 | implementation_gap | CD+Tests | resolved | Raw-key unit cases, terminal cleanup assertion, real pseudoterminal Esc exit 0 with mutation adapters forbidden, final full smoke | Retain as resolved evidence; installed-host rendering remains under TPR-01. |
| QA-UX-04 | implementation_gap | CD+Tests | resolved | User-provided rendered output; beginner summary, D details loop, compact lifecycle and Codex-permission next-action regressions; real non-mutating TTY D/Esc | Retain as resolved evidence; installed-host rendering remains under TPR-01. |
| QA-UX-05 | implementation_gap | CD+Tests | resolved | User follow-up identified missing version and remaining beginner gaps; CLI/lifecycle tests cover target, installed and transitioned versions, previous intent, permission verification timing, manual explanation, progress and invalid input; final smoke passes | Retain as resolved evidence; installed-host rendering remains under TPR-01. |
