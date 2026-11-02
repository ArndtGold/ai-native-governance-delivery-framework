# Code Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass
Decision: no open correctness, regression, security or maintainability finding
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
Revision: 6

## Reviewed change

Reviewed the actual uncommitted diff for strict language input, locale registry invariants, dispatch
propagation, CLI system-locale handling, MCP protocol tests, generated Skill projections, runtime
integrity, documentation and durable host evidence. Generated assets were rebuilt before the final
review. The serial full smoke and `git diff --check` passed on the reviewed tree.

## Correctness

- `canonicalizeLanguageTag` accepts only one unmodified string that passes the shared lexical pattern
  and `Intl.getCanonicalLocales`. It no longer coerces, trims, repairs underscores or strips suffixes.
- `normalizeSkillDispatchInput` validates required text, applies strict canonicalization and resolves
  exactly one complete pack before target or gate evaluation.
- Invalid language recovery is fixed English and terminal. Zero-call spies prove that activation,
  target and gate callbacks are untouched.
- Registry validation requires exact English fallback, a complete English pack, canonical unique
  locale keys and equal flattened key sets. Alias and canonical duplicate rows are explicitly tested.
- Exact-pack, primary-pack and complete-English resolution is deterministic. Stable result codes and
  `authorizes: false` are preserved.
- The resolved presentation language reaches target rendering, gate evaluation and continuation.
- CLI lifecycle rendering now receives the language string rather than the enclosing language
  preference object.
- CLI gate evaluation maps an explicit `--language` to `presentationLanguage` and leaves the field
  unset when the parameter is omitted, preserving the project-configured chat language.

## Regression and compatibility

The detected system locale adapter preserves expected `LANG`/`LC_*` forms such as `de_DE.UTF-8`
without weakening explicit public inputs. Both MCP protocol versions run the same valid and invalid
matrix. The tool name, tool count, schema version, protocol versions, governance target rules and
approval authority remain unchanged.

Generated Codex, Claude, Copilot and OpenCode projections contain the exact semantic description.
Copilot payload growth is reviewed at 755595 bytes and 95 files. Release preparation, package build,
467-file contents, runtime-integrity checks and 83/83 deterministic Skill evals passed.

## Security and authority

The change narrows accepted input and removes implicit repair. It does not add command execution,
network behavior, writable MCP operations, host permission changes or authorization paths. Direct
host results remain non-authorizing. Temporary registrations and runtime packages were removed and
verified independently.

## Prior findings

| finding_id | Status | Resolution evidence |
|---|---|---|
| CHMCP-CR-07 | resolved | `de-DE.!!!`, padded, underscore, POSIX, list, missing and wrong-type inputs fail before governance work. |
| CHMCP-CR-08 | resolved | Missing/invalid transport failure and valid-unsupported English rendering are distinct in approved PRD/SD and implementation. |
| CHMCP-CR-09 | resolved | Non-English fallback, missing English and incomplete packs fail registry validation. |
| CHMCP-CR-10 | resolved | Semantic text contains behavior only; installed locale facts remain registry-owned. |
| CHMCP-CR-11 | resolved | Production `2025-11-25` and `2026-07-28` suites execute the shared language matrix separately. |
| CHMCP-CR-12 | resolved | Approved PRD, SD and TP Revision 2 define and implement explicit, dominant, mixed and ambiguous precedence. |
| CHMCP-CR-13 | resolved | A full-smoke regression showed that detected system language overrode project configuration. Gate handling now propagates only an explicitly supplied `--language`; focused and full regression tests cover both paths. |

## Host observation

Codex passed all five fresh-session cases. OpenCode passed the language matrix after controlled
retry, while first attempts exposed missing tool discovery, wrong `skill_id` and a wrong mixed-
language choice. The successful mixed retry still omitted the requested run. These are retained
client/model argument-fidelity warnings. The server correctly rejects invalid values and cannot
verify intent that the host never transmits. No code change can make that inference deterministic
without violating the approved boundary that conversation text does not enter the MCP server.

Claude Code and Copilot remain unverified loaded-host lanes. No code or test labels them supported.

## Decision

No open review finding blocks QA. The remaining host gaps constrain qualification claims and must be
carried into QA, UAT and release evidence.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Final strict boundary, registry invariant, dual-protocol matrix and loaded-
  host variance are recorded in the node and direct evidence.
