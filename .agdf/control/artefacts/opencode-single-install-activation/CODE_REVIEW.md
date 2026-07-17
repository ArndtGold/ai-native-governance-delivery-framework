# Code Review: Single-Install OpenCode Activation

Decision: pass
Date: 2026-07-17

- findings: none remaining in the reviewed activation, hook, status, scaffold, generated-asset, documentation and regression-test diff.
- missing_evidence: Repository tests cannot prove authenticated OpenCode host rendering or skill precedence; this is documented as UAT-only evidence rather than inferred.
- risks: Existing legacy local skills may coexist with global skills. The retained `agdf-global-*` namespace avoids an unverified precedence change and status makes legacy compatibility visible.
- required_next_step: QA gate decision.
