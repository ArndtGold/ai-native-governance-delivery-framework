# Brownfield Analysis: Implement the approved report-field correction

- decision: pass
- mode: pre_implementation_analysis
- run_id: report-decision-field-hardening-20261014-01
- source_revision: 816cd9d2-b184-47ff-986a-7fbf34c9a4ab

## Scope and existing-system fit

Approved PRD/SD/TP retain the existing report observer, result domains and canonical writers. Current source has one shared reader used by QA registration, QA inspection and closeout. run-steps.js additionally has two whole-text regexes in its operation-bound Quick review and non-UX internal-result branches. Replace these with the same hardened observer; keep eligibility, source binding, transaction and required not_applicable reason checks unchanged. UX's distinct ready/blocked domain and OR binding/template fields retain their current validators.

## Evidence and reproduction

evidence/baseline.json records the pre-existing worktree, affected file hashes and protected current/prior approved sources. evidence/before-* files retain exact starting candidate bytes. evidence/installed-reproduction.json is a direct installed 0.14.5+codex.local-628d4e5b67b2 observation: a fenced-example-only report yields pass instead of null. It is a reader defect observation, not proof of a complete QA bypass or native model execution.

Canonical QA Decision lives in section 1; existing authored reviews place their result in initial metadata. The approved design preserves both contexts, excludes arbitrary prose/containers and keeps optional dash/case/backticks, passed alias, duplicates and CRLF. Core has no Markdown dependency and current shared helpers do not identify the needed contexts. Reuse report-decision.js with small module-local scanner helpers rather than introduce another owner or general parser.

## Implementation and regression boundaries

Implement the positive field grammar, fence exclusion and conservative HTML/context handling as specified by SD. Add the context matrix to the existing reader regression. Extend actual Quick/internal registration and QA/structured closeout tests, retaining protected-source, refusal-state, revision, replay and transaction checks. Use the canonical suite, serial generation/assembly, measured payload, supported installer and exact installed CLI/STDIO fixture qualification from TP. Fixture approvals remain synthetic.

## Risks and remaining evidence

Container termination and heading reentry require negative nested/malformed cases; these are implementation/test obligations. No unresolved owner, product or architecture choice remains. Do not claim completion from source-only tests, a prior immutable MCP generation or a native model/other-platform observation that was not made. Preserve previous compact-fix changes and every protected source byte.

## Context and next step

Context Graph impact is none; retain this bounded analysis in this Run. Minimal next step: record this actual preparation result through the existing internal-result owner, redispatch the same Run, implement only the approved TP and gather its evidence. No VCS or publication action is authorized.
