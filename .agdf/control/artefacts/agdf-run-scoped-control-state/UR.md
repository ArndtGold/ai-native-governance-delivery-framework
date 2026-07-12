# UR: Make AGDF Control State Safe For Concurrent Multi-User Work

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-11
Date: 2026-07-11
Owner: agent

## 1. Problem

AGDF currently uses `.agdf/control/AGDF_RUN.md` as one global, frequently rewritten dashboard and
runtime input. When several users, machines or agent sessions work in the same repository, unrelated
runs compete for this single mutable file. Normal Git merges can block; `merge=union` can avoid some
blocking conflicts but may preserve duplicate or contradictory fields. It reduces a symptom without
removing the shared-write failure mode.

The previously drafted `agdf-scaffold-gitattributes-default` scope would have propagated that
workaround to consumer repositories. It is superseded by this requirement because the desired outcome
is a sustainable multi-user control-state model rather than wider distribution of a fragile merge
strategy.

## 2. Goal

Make AGDF control state safe for concurrent work by isolating mutable state per delivery run and
treating repository-level dashboards as derived projections or compact indexes rather than a single
authoritative write slot.

The model must preserve deterministic gate decisions, auditability, existing artefact relationships
and compatibility for repositories that still contain `AGDF_RUN.md` during migration.

## 3. User Outcomes

- Different users or agents can progress different delivery runs in the same repository without
  rewriting the same authoritative run-state file.
- `doctor`, `gate-check` and `delivery-map` identify the intended run explicitly and fail closed when
  scope selection is missing or ambiguous.
- Concurrent edits to the same run remain visible as a coordination problem; they are not silently
  merged into an apparently valid state.
- Existing repositories can migrate without losing approvals, evidence, artefact links or current
  gate state.
- CI and agent surfaces receive one portable control-state contract rather than surface-specific
  variants.

## 4. Required Product Boundaries

- Introduce a canonical run-scoped state owner under `.agdf/control/`, with one isolated state record
  per stable `run_id`.
- Define a small repository-level active-run index or equivalent deterministic discovery mechanism.
- Make any retained `AGDF_RUN.md` a compatibility projection, generated view or explicitly deprecated
  legacy input; it must not remain a second authoritative state owner.
- Require explicit run selection whenever more than one active scope is plausible. Branch names,
  worktree changes and chat history remain insufficient selection evidence.
- Preserve exact approval semantics and the canonical gate transition model.
- Detect duplicate run identifiers, conflicting active-run claims, stale projections and malformed or
  partially migrated state.
- Keep the core model portable across Codex, Claude Code, Copilot, OpenCode and generic CLI/CI use.
- Provide an idempotent migration path for existing `.agdf/control/AGDF_RUN.md` repositories.

## 5. Non-Goals

- No distributed lock service, hosted coordination backend or mandatory network dependency.
- No automatic semantic merge of two writers changing the same run concurrently.
- No replacement of Git as the repository transport or audit history.
- No change to the meaning or order of AGDF approval gates.
- No implementation decision yet on Markdown versus JSON state, index schema, CLI flags, migration
  staging or final removal timing for `AGDF_RUN.md`; those require Brownfield Review and later design.
- No propagation of `.agdf/control/AGDF_RUN.md merge=union` as the long-term architecture.

## 6. Acceptance Signals

- Two independent runs can be created and advanced in parallel without editing the same authoritative
  run-state file.
- Gate evaluation for a selected run produces the same legal decision before and after migration.
- A repository with multiple active runs and no explicit selection fails closed with actionable scope
  evidence instead of silently choosing one.
- A same-run concurrent-write scenario is detected or remains an explicit conflict; no validator
  reports a contradictory union-merged state as clean.
- Migration from a valid legacy `AGDF_RUN.md` is idempotent and preserves approvals, artefacts,
  evidence, risks, Context Graph references and the next permissible step.
- Legacy and migrated fixtures are covered by focused CLI tests; package smoke tests and runtime
  integrity checks pass.
- Generated package assets, bootstrap output, runtime instructions and directly affected docs remain
  coherent across supported surfaces.

## 7. Existing Sources Of Truth And Brownfield Touchpoints

- `plugin/meta/agdf-runtime-contract.md`: canonical control-state and gate semantics.
- `plugin/control/templates/AGDF_RUN.md`: current global run-state template.
- `create-agdf/bin/create-agdf.js`: `init`, `doctor`, `gate-check`, `delivery-map` and bootstrap writes.
- `create-agdf/lib/delivery-path-search/state-adapter.js`: current direct `AGDF_RUN.md` dependency.
- `create-agdf/scripts/smoke-test.js`: scaffold, gate and delivery-map fixtures.
- `create-agdf/scripts/sync-package-assets.js`: generated package propagation.
- `plugin/scripts/check-runtime-integrity.mjs`: canonical/runtime/generated consistency checks.
- `.github/workflows/agdf-guardrails.yml`: CI consumption of durable control state.

## 8. Risks And Open Questions

- A second run-state representation could create split authority unless migration and precedence are
  explicit and mechanically validated.
- A repository-level index can itself become a contention point if it contains mutable run details
  rather than compact append-oriented pointers.
- Generated compatibility projections can become stale; validators must detect drift rather than trust
  them silently.
- CLI run selection must remain convenient for a single-run repository while failing closed for real
  ambiguity.
- The migration sequence must account for released consumers and CI using older package versions.
- Brownfield Review must determine whether an append-oriented event record, current-state snapshot, or
  hybrid is the smallest reliable model before PRD depth is chosen.

## 9. Supersession Decision

- supersedes: `agdf-scaffold-gitattributes-default`
- reason: distributing `merge=union` would preserve the single mutable authority and can still produce
  contradictory state; run-scoped ownership removes cross-run contention by construction.
- compatibility note: the existing repository-local `.gitattributes` rule may remain during migration
  as a temporary safety net, but it is not the target architecture.

## 10. Next Step

Review this UR and approve only with:

`Approval: UR`
