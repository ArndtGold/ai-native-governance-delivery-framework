# Reviews: AGDF Delivery Path Search

Date: 2026-07-09

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| DPS-01 | fully_done | Real read-only Codex probe; strict schema correction; transport decision in implementation evidence | none | none |
| DPS-02 | fully_done | `contracts.js`; positive and negative focused fixtures | none | none |
| DPS-03 | fully_done | `state-adapter.js`; canonical live control state remains the input owner | none | none |
| DPS-04 | fully_done | exact legality, hard rejection, versioned scoring, uncertainty/enforcement penalties | none | none |
| DPS-05 | fully_done | bounded best-first engine; depth, evaluation, duration, cost and stability limits; no-safe outcome | none | none |
| DPS-06 | fully_done | strict Codex adapter with read-only sandbox, ephemeral context, schema output, runtime metadata and mutation check | none | none |
| DPS-07 | fully_done | three enforcement levels and evidence validation | none | none |
| DPS-08 | fully_done | redacted JSON/Markdown persistence and failure-safe path validation | none | none |
| DPS-09 | fully_done | existing CLI command dispatch extended; result always points back to gate-check | none | none |
| DPS-10 | fully_done | one canonical skill and one canonical routing row | none | none |
| DPS-11 | fully_done | shared plugin skill plus generated Copilot/OpenCode mappings; Claude reuses plugin source | none | none |
| DPS-12 | fully_done | shared fixture contract, routing render test, runtime integrity and explicit unsupported-adapter failure | native evaluator transports beyond Codex are intentionally unsupported | documented product limitation |
| DPS-13 | fully_done | README, INSTALL, package docs, runtime contract, skill guidance and Pages updated; Pages check/build passed | none | none |
| DPS-14 | fully_done | focused, create-agdf, routing, integrity, package and wrapper checks passed | QA decision pending | none |

### TP Summary

- fully_done: DPS-01 through DPS-14
- partially_done: none
- not_done: none
- out_of_scope_changes: none observed
- risks: native executable evaluation is currently Codex-only; weaker surfaces remain explicit
- required_next_step: Perform QA gate evaluation.

## Clean Implementation Review

- decision: `pass`
- primary_solution: One dependency-light ESM runtime in the existing `create-agdf` package, one CLI command and one canonical skill routed through existing generators.
- evidence: No second CLI, gate model, skill tree, scoring policy or generated-output authority was introduced.
- fallbacks_retained: No automatic provider fallback. Unsupported evaluators fail explicitly.
- workaround_or_shim_risk: low; non-Codex surfaces expose contract mappings without pretending to provide native executable adapters.
- parallel_structure_risk: controlled; gate-check remains authoritative and surface output is generated.
- brownfield_fit: pass; existing CLI dispatch, package wrapper, sync, routing and smoke owners were extended.
- missing_evidence: none before QA.
- required_next_step: Perform mandatory Code Review.

## Code Review

- decision: `pass`
- findings: none remaining
- resolved findings:
  - unsafe scope keys could escape the artefact directory; restricted to safe path segments
  - substring legality could admit compound forbidden actions; changed to exact normalized action matching
  - cost budget was specified but not enforced; added cost-unit stopping and tests
  - packed wrapper did not exercise the new command; wrapper smoke now runs the packaged command
  - Pages still claimed 7 skills and omitted code-review and Delivery Path Search; changed to a dynamic 9-skill view with Planning and precise evaluator support language
  - Pages skill data remained a manual drift risk; Runtime Integrity now checks exact equality with canonical plugin metadata
  - CLI wording implied an available external-evaluator configuration; corrected to the actual Codex-only executable boundary
- reviewed areas:
  - contracts and untrusted evaluator data
  - candidate legality and scoring
  - budget/stopping behavior
  - Codex child-process isolation and mutation detection
  - persistence/redaction and path safety
  - CLI compatibility and package contents
  - generated skill routing and documentation claims
- missing_evidence: final QA decision only
- risks: Git-status mutation detection covers repository-visible changes, while non-Git external side effects remain prevented primarily by Codex read-only sandbox and tool restriction.
- required_next_step: Run `qa-gate`.
