# AGDF Host Compatibility

Generated dated evidence snapshot. Inspect existing AGDF local status for your own installation.

AGDF canonical version: **0.14.5**.
Observation dates: 2026-09-05T13:42:54.748Z to 2026-09-05T13:43:19.510Z.
Source fingerprint: `aa8766489bfe22b032456d8be86c9bc8f9bfc1e03d28c5b67132733e570b084c`.
Report consistency: **valid**. Deterministic scenarios: **56 evaluated, 0 unexpected failures**.

These scenario results describe isolated production fixtures. Expected negative cases can pass the test while the observed capability is failed. They provide no fresh-host or human-UAT proof.

[Recorded facts](evidence/facts.json) · [Exact observations and source identities](evidence/snapshot.json)

## Five deterministic outcomes

| Host | Installed | Discovered | Callable | Updated | Recoverable |
|---|---|---|---|---|---|
| Codex | demonstrated | demonstrated | demonstrated | demonstrated | demonstrated |
| Claude Code | demonstrated | demonstrated | demonstrated | demonstrated | demonstrated |
| GitHub Copilot | demonstrated | demonstrated | demonstrated | demonstrated | demonstrated |
| OpenCode | demonstrated | demonstrated | demonstrated | demonstrated | demonstrated |

Each outcome is independent. Legacy installation `healthy` does not establish discovery, invocation, effective update, recovery or automatic execution.

## Native coverage

Inventory of required evidence, not twelve supported combinations. Unknown host versions are gaps, never wildcard matches.

| Host | OS | Variant / version | Fresh installation, discovery, invocation, update and recovery | Next action |
|---|---|---|---|---|
| Codex | macOS | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| Codex | Linux | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| Codex | native Windows | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| Claude Code | macOS | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| Claude Code | Linux | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| Claude Code | native Windows | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| GitHub Copilot | macOS | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| GitHub Copilot | Linux | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| GitHub Copilot | native Windows | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| OpenCode | macOS | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| OpenCode | Linux | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |
| OpenCode | native Windows | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |

## Capability evidence

Available skills, automatic checks, observed governance and technical enforcement are separate promises. Enforcement needs its exact mechanism, action and primary/subagent path. Trust or a consent receipt is not evidence that a check ran.

| Host | Available skills | Automatic checks | Observed governance | Technical enforcement |
|---|---|---|---|---|
| Codex | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple |
| Claude Code | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple |
| GitHub Copilot | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple |
| OpenCode | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple | unverified in a current native tuple |

Native observation import is explicit. Inventory gaps do not invent executable native tuples. The snapshot identifies each supplied observation's lane and scope.

## Scoped observations

All rows below use the deterministic_adapter lane, a simulated host, the recorded actual execution OS and fixture version. Target platform strings do not establish native execution. The linked facts retain expected and observed payload digests, runtime identity, permission/activation conditions and scenario outcomes.

| Observation | OS / path | Outcome | Observed state | Scenario conformance | Evidence | Limitation / next action |
|---|---|---|---|---|---|---|
| codex.installed | macOS / primary/fixture | installed | demonstrated | pass | [codex.installed](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.discovered | macOS / primary/fixture | discovered | demonstrated | pass | [codex.discovered](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.discovery-missing | macOS / primary/fixture | discovered | failed | pass | [codex.discovery-missing](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| codex.discovery-wrong-payload | macOS / primary/fixture | discovered | failed | pass | [codex.discovery-wrong-payload](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| codex.callable | macOS / primary/fixture | callable | demonstrated | pass | [codex.callable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.target-unresolved | macOS / primary/fixture | callable | demonstrated | pass | [codex.target-unresolved](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.missing-approval | macOS / primary/fixture | callable | demonstrated | pass | [codex.missing-approval](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.invalid-input | macOS / primary/fixture | callable | demonstrated | pass | [codex.invalid-input](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.updated | macOS / primary/fixture | updated | demonstrated | pass | [codex.updated](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.update-stale | macOS / primary/fixture | updated | failed | pass | [codex.update-stale](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| codex.recoverable | macOS / primary/fixture | recoverable | demonstrated | pass | [codex.recoverable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| codex.recovery-partial | macOS / primary/fixture | recoverable | failed | pass | [codex.recovery-partial](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| codex.manual-checks | macOS / primary/fixture | automatic_checks | failed | pass | [codex.manual-checks](evidence/facts.json) | Simulated host only. Use the existing manual verification path; automatic checks remain declined. |
| codex.trusted-unexecuted | macOS / primary/fixture | automatic_checks | failed | pass | [codex.trusted-unexecuted](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| claude.installed | macOS / primary/fixture | installed | demonstrated | pass | [claude.installed](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.discovered | macOS / primary/fixture | discovered | demonstrated | pass | [claude.discovered](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.discovery-missing | macOS / primary/fixture | discovered | failed | pass | [claude.discovery-missing](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| claude.discovery-wrong-payload | macOS / primary/fixture | discovered | failed | pass | [claude.discovery-wrong-payload](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| claude.callable | macOS / primary/fixture | callable | demonstrated | pass | [claude.callable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.target-unresolved | macOS / primary/fixture | callable | demonstrated | pass | [claude.target-unresolved](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.missing-approval | macOS / primary/fixture | callable | demonstrated | pass | [claude.missing-approval](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.invalid-input | macOS / primary/fixture | callable | demonstrated | pass | [claude.invalid-input](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.updated | macOS / primary/fixture | updated | demonstrated | pass | [claude.updated](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.update-stale | macOS / primary/fixture | updated | failed | pass | [claude.update-stale](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| claude.recoverable | macOS / primary/fixture | recoverable | demonstrated | pass | [claude.recoverable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| claude.recovery-partial | macOS / primary/fixture | recoverable | failed | pass | [claude.recovery-partial](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| claude.manual-checks | macOS / primary/fixture | automatic_checks | failed | pass | [claude.manual-checks](evidence/facts.json) | Simulated host only. Use the existing manual verification path; automatic checks remain declined. |
| claude.trusted-unexecuted | macOS / primary/fixture | automatic_checks | failed | pass | [claude.trusted-unexecuted](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| copilot.installed | macOS / primary/fixture | installed | demonstrated | pass | [copilot.installed](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.discovered | macOS / primary/fixture | discovered | demonstrated | pass | [copilot.discovered](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.discovery-missing | macOS / primary/fixture | discovered | failed | pass | [copilot.discovery-missing](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| copilot.discovery-wrong-payload | macOS / primary/fixture | discovered | failed | pass | [copilot.discovery-wrong-payload](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| copilot.callable | macOS / primary/fixture | callable | demonstrated | pass | [copilot.callable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.target-unresolved | macOS / primary/fixture | callable | demonstrated | pass | [copilot.target-unresolved](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.missing-approval | macOS / primary/fixture | callable | demonstrated | pass | [copilot.missing-approval](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.invalid-input | macOS / primary/fixture | callable | demonstrated | pass | [copilot.invalid-input](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.updated | macOS / primary/fixture | updated | demonstrated | pass | [copilot.updated](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.update-stale | macOS / primary/fixture | updated | failed | pass | [copilot.update-stale](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| copilot.recoverable | macOS / primary/fixture | recoverable | demonstrated | pass | [copilot.recoverable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| copilot.recovery-partial | macOS / primary/fixture | recoverable | failed | pass | [copilot.recovery-partial](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| copilot.manual-checks | macOS / primary/fixture | automatic_checks | failed | pass | [copilot.manual-checks](evidence/facts.json) | Simulated host only. Use the existing manual verification path; automatic checks remain declined. |
| copilot.trusted-unexecuted | macOS / primary/fixture | automatic_checks | failed | pass | [copilot.trusted-unexecuted](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| opencode.installed | macOS / primary/fixture | installed | demonstrated | pass | [opencode.installed](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.discovered | macOS / primary/fixture | discovered | demonstrated | pass | [opencode.discovered](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.discovery-missing | macOS / primary/fixture | discovered | failed | pass | [opencode.discovery-missing](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| opencode.discovery-wrong-payload | macOS / primary/fixture | discovered | failed | pass | [opencode.discovery-wrong-payload](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| opencode.callable | macOS / primary/fixture | callable | demonstrated | pass | [opencode.callable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.target-unresolved | macOS / primary/fixture | callable | demonstrated | pass | [opencode.target-unresolved](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.missing-approval | macOS / primary/fixture | callable | demonstrated | pass | [opencode.missing-approval](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.invalid-input | macOS / primary/fixture | callable | demonstrated | pass | [opencode.invalid-input](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.updated | macOS / primary/fixture | updated | demonstrated | pass | [opencode.updated](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.update-stale | macOS / primary/fixture | updated | failed | pass | [opencode.update-stale](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| opencode.recoverable | macOS / primary/fixture | recoverable | demonstrated | pass | [opencode.recoverable](evidence/facts.json) | Simulated host only. Use only this dated environment and evidence scope; inspect local status for your machine. |
| opencode.recovery-partial | macOS / primary/fixture | recoverable | failed | pass | [opencode.recovery-partial](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |
| opencode.manual-checks | macOS / primary/fixture | automatic_checks | failed | pass | [opencode.manual-checks](evidence/facts.json) | Simulated host only. Use the existing manual verification path; automatic checks remain declined. |
| opencode.trusted-unexecuted | macOS / primary/fixture | automatic_checks | failed | pass | [opencode.trusted-unexecuted](evidence/facts.json) | Simulated host only. Use the existing bounded retry/restart/repair path when authorized, then record matching evidence. |

## Historical evidence

Original result and enforcement vocabulary are preserved. Missing OS, payload digest or path identity prevents current support claims. Historical records do not transfer approvals or establish support for the current payload.

| Observation | Original host version / AGDF | Original evidence class | Original result | Original enforcement | Applicability |
|---|---|---|---|---|---|
| OBS-CODEX-HC-01 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-02 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-03 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-04 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-05 | 0.145.0 / 0.11.4 | authenticated_host_observed | limitation | not_observed | historical / incomplete identity |
| OBS-CODEX-HC-06 | 0.145.0 / 0.11.4 | authenticated_host_observed | limitation | not_observed | historical / incomplete identity |
| OBS-CODEX-HC-07 | 0.145.0 / 0.11.4 | authenticated_host_observed | limitation | not_observed | historical / incomplete identity |
| OBS-CODEX-HC-08 | 0.145.0 / 0.11.4 | authenticated_host_observed | limitation | not_observed | historical / incomplete identity |
| OBS-CODEX-HC-09 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-10 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-11 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CODEX-HC-12 | 0.145.0 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-CLAUDE-HC-01 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-02 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-03 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-04 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-05 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-06 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-07 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-08 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-09 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-10 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-11 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-CLAUDE-HC-12 | 2.1.193 / 0.11.4 | host_preflight_observed | host_unavailable | not_observed | historical / incomplete identity |
| OBS-OPENCODE-HC-01 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-02 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-03 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-04 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-05 | 1.18.3 / 0.11.4 | authenticated_host_observed | limitation | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-06 | 1.18.3 / 0.11.4 | authenticated_host_observed | limitation | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-07 | 1.18.3 / 0.11.4 | authenticated_host_observed | limitation | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-08 | 1.18.3 / 0.11.4 | authenticated_host_observed | limitation | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-09 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-10 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-11 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |
| OBS-OPENCODE-HC-12 | 1.18.3 / 0.11.4 | authenticated_host_observed | pass | instruction_only | historical / incomplete identity |

Historical source and individual reference hashes are retained in the snapshot. Original transcripts are not copied into this public comparison.

## Verification and recovery

Use the existing local status and bounded verification/retry paths. A failed or pending retry remains unresolved until a matching new observation is recorded. Denied automatic checks leave manual verification available. Generating or checking this report never installs a host, changes permission, restarts a session or grants a governance approval.
