# Code Review: Installation Consent for Automatic Runtime Checks

## Code Review

- decision: `pass`
- findings: none open in the reviewed diff
- resolved_finding: `CR-01` manual receipt alone could leave a previously trusted Codex hook
  executable; fixed by consent gating in the shared generated entrypoint and execution regression
- resolved_finding: `CR-02` OpenCode loaded a stale Bun-cache package and lacked automatic execution;
  fixed by the verified config-local entrypoint, explicit Node and real enabled/manual sessions
- evidence: focused suites, complete smoke, Runtime Integrity, package/public tests, real Claude and
  OpenCode observations and `git diff --check`
- missing_evidence: Codex trust completion, Windows and rendered public candidate
- risks: host contracts can drift; each claim still requires native observation
- required_next_step: rerun QA with TPR-01 narrowed to remaining evidence cells
