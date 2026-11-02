# Task Plan Review

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| OC-01 | `fully_done` | OpenCode `1.17.13` runtime and native plugin/skill/agent/debug surfaces verified; Brownfield Analysis records the native installer and discovery behavior. Evidence confidence: high. | none | Confirm the supported-runtime assumption is acceptable; no cross-version matrix was required by the TP. |
| OC-02 | `fully_done` | Repository-wide audit identified every agent-only owner; focused migration test removes an owned legacy AGDF agent and preserves an unrelated user-owned agent. Evidence confidence: high. | none | Migration ownership matching should remain part of regression review. |
| OC-03 | `fully_done` | Canonical definition and synchronizer generate all nine `.opencode/skills/agdf-*/SKILL.md` files; aggregate smoke test validates names, frontmatter and paths; native `opencode debug skill` discovers all nine. Evidence confidence: high. | none | none |
| OC-04 | `fully_done` | Generated `.opencode/AGDF.md` uses prefixed native skills, routes `agdf-gate-check` first and retains `.agdf/control/` authority; smoke assertions reject unprefixed and legacy subagent routing. Evidence confidence: high. | none | none |
| OC-05 | `fully_done` | Generator removes the legacy generated agent tree; explicit repository regeneration removes only owned legacy agents; INSTALL, package READMEs, CLI guidance and Pages compatibility copy now describe native skills. Package exports remain valid and no metadata owner required a new OpenCode-specific description. Evidence confidence: high. | none | Verify no release notes are required outside this TP before release. |
| OC-06 | `fully_done` | Canonical OpenCode permissions now keep `edit`/`bash` at `ask` and allow `agdf-*` skills explicitly; existing-config fragment protection and generated config behavior pass smoke tests and the installed runtime accepts the config. Evidence confidence: high. | none | none |
| OC-07 | `fully_done` | Local plugin probe directly verifies repository-surface detection, structured session log, environment signal and compaction reminder against `.opencode/skills/`; source scan confirms no `tool.execute.before` gate calculation. Status separation and the schema-v1 `gate_check_agent` compatibility alias remain covered by smoke tests. Evidence confidence: high. | none | none |
| OC-08 | `fully_done` | `create-agdf` aggregate smoke test passes with native path/frontmatter, permission, migration, status, schema-v1 alias and config-preservation assertions; runtime-integrity guard now requires native skill generation and canonical router transformation. Evidence confidence: high. | none | none |
| OC-09 | `fully_done` | Bounded installed-runtime probe proves discovery of nine skills and zero AGDF agents. `capabilities.js` remains `instruction_only`; direct source inspection confirms no model-independent enforcement hook was added. This satisfies the TP's fail-closed branch. Evidence confidence: high. | No tool-enforcement evidence, intentionally; therefore no capability upgrade. | QA must preserve the distinction between native packaging parity and enforcement parity. |
| OC-10 | `fully_done` | Runtime integrity, `create-agdf` aggregate and focused smoke tests, `@agdf/cli` smoke tests, Astro checks, native OpenCode probes, local plugin probe, schema-v1 compatibility regression test, `doctor --json` and `git diff --check` all pass and are mapped in `IMPLEMENTATION_EVIDENCE.md`. Evidence confidence: high. | none | none |

## Acceptance coverage

- AC basis: complete enough for review; every TP task has an explicit evidence/acceptance statement, but the TP defines no task priorities.
- native discovery: done
- canonical source propagation: done
- no parallel AGDF routing structure: done
- permission boundary: done
- global/repository status separation: done
- safe legacy-agent migration: done
- capability evidence honesty: done through the `instruction_only` fail-closed branch
- documentation and generated-surface alignment: done

## Summary

- fully_done: 10 (`OC-01` through `OC-10`)
- partially_done: 0
- not_done: 0
- out_of_scope_changes: none observed; AGDF control artefacts and backlog updates are governance evidence for this approved slice
- risks: TP priorities are absent, so QA must not infer severity labels; OpenCode evidence is from installed runtime `1.17.13`; native package/skill parity does not provide tool-enforced AGDF gates; the newer native `opencode plugin` installer remains an intentionally documented non-adopted path because the existing deterministic package-loadability/status contract was retained
- context_graph_impact: `link_only`; final capability classification must be reconciled at QA/OR, with no new node unless reusable enforcement evidence emerges
- required_next_step: run Clean Implementation Review, then Code Review, before QA Gate

## Review boundary

This report verifies TP fulfilment only. It does not decide QA.
