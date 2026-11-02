# CD+Tests: Delivery Path Search Control Input Integrity

- status: done
- decision: pass
- date: 2026-08-30
- approved_scope: DPSI-T01 through DPSI-T13
- implementation_claim: repository source, generated package projections and deterministic tests only;
  installed-host behavior is not claimed.

## Delivered Behavior

- `state-adapter.js` consumes canonical `evaluateGateCheck()` output and verifies run, revision and
  gate against a second canonical run read. It no longer parses Run Status Card policy fields.
- Search input and output expose selected scope revision and objective.
- Terminal results are phase-owned: input, candidate, evaluation or search.
- Zero valid evaluations cannot be `recommendation` or `no_safe_recommendation` and cannot persist.
- Candidate and evaluation provenance is validated, including consistent attempt/valid/invalid
  counts and generated rejection counts.
- OpenCode preflight resolves canonical scope first, reports selected identity on failure and does
  not claim an evaluator attempt when only preflight ran.
- CLI/JSON, persistence, runtime contract, skill, README and release notes share the same semantics.
- A deterministic cross-scope skill eval rejects applying an unrelated run result.

## Task Completion

| task_id | status | implementation evidence | test evidence |
|---|---|---|---|
| DPSI-T01 | fully_done | `state-adapter.js` imports canonical gate evaluation and removes status-card action parsing | canonical-run fixture without Run Status Card |
| DPSI-T02 | fully_done | `scope_revision` and same-run/revision/gate guard with `stale_control_snapshot` | fresh/stale snapshot assertions |
| DPSI-T03 | fully_done | `validateSearchResult()` owns status/phase/recommendation/provenance invariants | contract-valid and contradictory-result unit cases |
| DPSI-T04 | fully_done | pure terminal classifier plus candidate provenance | empty input, all-illegal and phase tests |
| DPSI-T05 | fully_done | attempted/valid/invalid evaluation evidence and typed failures | invalid, unavailable, mutation and budget regressions |
| DPSI-T06 | fully_done | CLI prints scope, revision, objective, phase, status, provenance and recovery | fixture JSON plus CLI/OpenCode suites |
| DPSI-T07 | fully_done | persistence validates before directory creation | direct non-persistable result test |
| DPSI-T08 | fully_done | canonical contract and skill define phase, scope-fit and authority boundaries | 67/67 deterministic skill evals including cross-scope adversarial case |
| DPSI-T09 | fully_done | legacy false-status assertions replaced; contract matrix expanded | focused and unit suites pass |
| DPSI-T10 | fully_done | temporary canonical control scaffold without Run Status Card | real gate-check action parity and stale revision test |
| DPSI-T11 | fully_done | OpenCode, generator, CLI modularization and control-state paths aligned | focused regression suites pass |
| DPSI-T12 | fully_done | canonical projections, README/release notes and reviewed Copilot payload baseline updated | release prepare, package build/contents and full smoke pass |
| DPSI-T13 | fully_done | control evidence and `CG-DELIVERY-PATH-SEARCH` invariant reconciled; unrelated run isolated | doctor, gate-check, diff and review evidence |

## Verification Evidence

| check | result |
|---|---|
| `test:delivery-path-search-unit` | pass |
| `test:delivery-path-search` | pass |
| `test:delivery-path-search-generator` | pass |
| `test:opencode-hardening` | pass |
| `test:cli-modularization` | pass |
| `test:control-state` | pass |
| `test:skill-evals` and `eval:skills` | pass; 67/67 deterministic cases, not live-host evidence |
| `release:prepare` | pass after intentional reviewed payload baseline update |
| `test:package-build` | pass; byte-identical complete builds |
| `test:package-contents` | pass with isolated writable npm cache; 373 files |
| `smoke-test` | pass, including Runtime Integrity, package, lifecycle, skill, search and routing suites |
| JavaScript syntax checks and `git diff --check` | pass |

## Deviations And Boundaries

- The default npm cache is root-owned and caused `EPERM` in the first package-contents run. The
  approved writable temporary-cache path passed; no ownership or system-directory mutation occurred.
- Copilot runtime payload grew from the reviewed 539,607-byte baseline to 550,979 bytes because the
  runtime now carries input-integrity validation and provenance. The baseline rationale records this
  reviewed addition; the separate `agdf-npm-package-payload-cleanup` run remains untouched.
- No installed plugin, authenticated evaluator host, native Windows host, VCS or release operation
  was changed or claimed.

## Required Next Step

Consume TP Review, Clean Implementation Review and Code Review before QA.
