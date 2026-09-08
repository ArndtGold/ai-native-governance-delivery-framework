# Task Plan Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass
Decision: fully_done
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
TP: Revision 2, approved
Review revision: 5

## Plan result

All eight pending Revision 2 tasks are implemented and tested. The historical 22 tasks remain
fulfilled. CHMCP-TP-29 is complete under its approved evidence boundary: both production protocols
pass the shared matrix, loaded-host observations are recorded separately, and unavailable or
variable clients remain explicit rather than being inferred as supported.

| Task scope | Result | Evidence |
|---|---|---|
| CHMCP-TP-01 through CHMCP-TP-22 | fully_done | Historical Task Plan Review Revision 4 and CD+Tests Revision 5; Revision 2 did not reopen lifecycle, adapter, packaging or beginner-architecture delivery. |
| CHMCP-TP-23 | fully_done | TP approval/run revision revalidation and Brownfield Analysis Revision 2 `pass`. |
| CHMCP-TP-24 | fully_done | One shared fixture covers valid, invalid and registry-mutation rows and preserves the pre-change reproduction. |
| CHMCP-TP-25 | fully_done | Canonical function definition owns exact language meaning, pattern and generated projection. |
| CHMCP-TP-26 | fully_done | Strict public validation plus zero-call spies prove the pre-governance failure boundary. |
| CHMCP-TP-27 | fully_done | English baseline, canonical uniqueness, exact pack parity and whole-pack fallback are enforced and mutation-tested. |
| CHMCP-TP-28 | fully_done | Trusted detected locale adaptation is isolated; explicit paths stay strict. |
| CHMCP-TP-29 | fully_done | Direct service/renderer tests and separate protocol `2025-11-25`/`2026-07-28` reports pass. Codex passes five direct cases; OpenCode passes after controlled retry with retained variance; Claude Code and Copilot gaps are explicit. |
| CHMCP-TP-30 | fully_done | Contracts, beginner documentation, Context Graph, implementation evidence and all mandatory reviews are current. |

## Acceptance trace

| Criterion | Result | Visible evidence |
|---|---|---|
| CHMCP-C21 | pass | Exact and regional supported tags produce a complete exact or primary-language pack on service and both protocol paths. |
| CHMCP-C22 | pass | Valid unsupported `fr-FR` produces the complete English pack; non-English fallback mutation fails. |
| CHMCP-C23 | pass | Missing and every invalid fixture row stops before activation, target and gate work. |
| CHMCP-C24 | pass with bounded host gaps | Exact function projection plus direct Codex and retried OpenCode selection evidence. Claude Code and Copilot remain unverified. |
| CHMCP-C25 | pass | Only detected system locale accepts POSIX normalization. |
| CHMCP-C26 | pass | Registry mutations fail closed and successful cards contain one pack only. |

## Deviations

No implementation deviation from approved PRD, SD or TP was introduced. The direct OpenCode lane
produced observable host variance that the plan explicitly required the evidence to retain:

- two first-attempt sessions did not expose a natively connected MCP tool;
- one attempt confused the OpenCode Skill name with canonical `skill_id` and failed closed;
- the first mixed-language attempt chose `de-DE` instead of `en`;
- the successful mixed-language retry selected `en` but omitted the requested run and used
  `current_repository`.

The retry establishes the language-selection observation. It does not erase the first attempts or
qualify complete OpenCode argument fidelity. No server-side conversation detector or host-specific
language list was added to hide that boundary.

## Test result

The final serial `npm --prefix create-agdf run smoke-test` passed after the last registry and shared-
fixture corrections. It includes the full dual-protocol server suite, interaction presentation,
Skill projections, generated profiles, runtime integrity, package build and 83/83 deterministic
Skill eval cases. Direct registration cleanup is separately proven by lifecycle status, native client
read-back, project-file absence and removal of the isolated runtime root.

## Review decision

The approved Task Plan is fulfilled. No missing task, acceptance criterion or unreported deviation
blocks QA. Remaining host observations are qualification limits already allowed by CHMCP-TP-29 and
must remain visible in QA and future release evidence.
