# UAT Report: Cross-Host AGDF Dispatch Through MCP

Status: accepted
Decision: accepted
Revision: 1
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Based on: approved QA Report Revision 2 and exact `Approval: QA` accepted after same-target,
same-run, same-gate and run revision 26 (`66315C86-EA37-4571-A93E-4B64D8A95391`) revalidation
Accepted on: 2026-09-06 through exact `Approval: UAT` after same-target, same-run, same-gate,
persisted UAT Report Revision 1 and run revision 27 (`998853BA-48D0-49C2-BA0B-8F2133582536`)
revalidation

## Acceptance Target

Accept the first-release outcome that exposes one bounded AGDF dispatcher through one local SDK v2
MCP server and qualifies only the directly observed OpenCode and Codex host tuples. Acceptance keeps
protocol, host, operating-system and loaded-model evidence separate and does not extend support to
unobserved hosts.

## Observable Outcomes

1. OpenCode 1.18.3 discovered the project-scoped `agdf_agdf_dispatch` tool and completed a valid
   terminal call, controlled semantic failure and bounded continuation through the exact local
   server. Removal restored the originally absent configuration and runtime state.
2. Codex CLI 0.145.0 with `gpt-5.6-sol` discovered `agdf/agdf_dispatch` and completed the same three
   calls through the exact local server. Removal restored the originally absent `.codex` state.
3. Independent controlled clients negotiated MCP `2026-07-28` and `2025-11-25` against the same
   production server definition. Neither host is claimed to expose its selected protocol generation.
4. Terminal calls transferred canonical `host_action.text` exactly. Continuations remained bound to
   the selected repository, run and gate and did not execute a skill inside the MCP server.
5. Contract, protocol, safety, provenance, lifecycle, package and complete regression suites pass.
   The exact TP Revision 2 aggregate run includes 83/83 passing skill evaluations.
6. Measured cold p95 is 791.930 ms and warm p95 is 324.108 ms, within the approved 1500 ms and
   1000 ms budgets.
7. Final lifecycle read-back reports Codex, Claude Code and OpenCode `not_configured`; temporary
   registrations and versioned test runtimes are absent.
8. GitHub Copilot remains outside the delivered MCP adapter set. Two direct Skills-only observations
   show that `mai-code-1.1-flash` ignored a valid dispatcher binding. The second observation safely
   avoided a QA decision in a repo-less General Chat but still synthesized a non-canonical response.

## Acceptance Boundary

- Accepted support is limited to the exact OpenCode 1.18.3 and Codex CLI 0.145.0 with
  `gpt-5.6-sol` observations on macOS x64, Node.js 22.22.3 and AGDF 0.14.5.
- Claude Code 2.1.193 has registration and discovery evidence only because authentication stopped
  the model lane before a tool call.
- OpenCode 2.x, GitHub Copilot MCP, Linux, Windows, remote transport, HTTP, authentication and public
  Skills-candidate MCP content are not accepted or implied.
- MCP registration, permission and execution grant no AGDF gate approval.
- The local MCP process inherits the launching user's operating-system permissions; this UAT makes
  no sandbox claim.

## Current Evidence

- QA Report Revision 2: `pass`, exactly approved after current run and revision revalidation.
- Task Plan Review Revision 2: 18/18 tasks `fully_done`.
- Brownfield Analysis, Clean Implementation Review and Code Review Revision 2: `pass`.
- Direct host records: `DIRECT_HOST_EVIDENCE.md` and retained OpenCode, Codex and Claude NDJSON.
- Copilot boundary record: `COPILOT_HOST_OBSERVATION.md`.
- Complete exact-snapshot regression, package and performance evidence: `CD_TESTS.md`.
- Context Graph reconciliation: `resolved`.

## Acceptance Record

The user accepted the observable outcomes and disclosed limits with exact `Approval: UAT` on
2026-09-06. The approval was persisted only after the selected target, run, UAT gate, report revision
and run revision were revalidated. UAT approval does not itself authorize publication, release,
commit, push or a pull request.

## Next Step

Use the final OR and delivery-closeout handoff. Any commit, push, pull request, publication or release
still requires a separate explicit instruction.
