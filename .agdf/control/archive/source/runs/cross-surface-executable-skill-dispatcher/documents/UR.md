# User Requirement: Cross-surface Executable Skill Dispatcher

- revision: 1
- status: `approved`
- owner: Arndt Gold
- date: 2026-09-04

## Problem

Direct AGDF skill invocations are currently instruction-driven. Even though the installed runtime
already provides deterministic target, gate and presentation functions, the host model may search
for files, read several contracts and assemble validator commands before it produces the first AGDF
result. A fresh repo-less `/agdf-gate-check` invocation in GitHub Copilot with GPT-5.6 Sol eventually
rendered the correct Task Target card, but only after approximately three minutes. Earlier direct
`/agdf-qa-gate` observations showed the same model-driven discovery pattern.

Correct late output is insufficient for a preflight whose purpose is to stop invalid work early.
The behavior is also model-dependent and therefore especially fragile with weaker models.

## Required Outcome

Provide one version-matched executable AGDF skill-dispatch entry that every supported installed
surface can invoke as its first operational action. It must perform the deterministic common
preflight, return a canonical machine result and presentation payload, and either stop terminally or
hand the model one bounded next action without requiring repository searches or contract
reconstruction.

The solution applies to GitHub Copilot, Codex, Claude Code and OpenCode while respecting each host's
actual plugin and command capabilities. Host adapters may differ only in transport and activation;
target, gate, locale, approval and presentation semantics remain shared.

## Scope

- Define one executable dispatcher contract for canonical AGDF skills, beginning with direct
  `gate-check` and `qa-gate` invocations and extensible to the remaining shipped skills.
- Accept explicit normalized invocation context: skill identifier, conversation language, working
  directory, target source, optional primary target and optional run identifier.
- Reuse the existing version-matched local runtime, target resolver, control evaluators and canonical
  interaction renderer. Do not create parallel target, gate, approval or card logic.
- Return one typed terminal outcome for unresolved targets and one typed bounded continuation for
  resolved targets.
- Generate and package the dispatcher consistently for Copilot, Codex, Claude Code and OpenCode.
- Make skill entry instructions short and deterministic: invoke the dispatcher first, consume its
  output verbatim where required, then stop or perform only the returned next action.
- Add observable timing and failure diagnostics so dispatcher execution can be separated from model
  latency and host tool latency.

## Acceptance Criteria

1. A repo-less direct `gate-check` or `qa-gate` invocation performs one dispatcher call and returns
   the canonical localized Task Target orientation with a terminal clarification outcome. It does
   not inspect repository control state or search for runtime files afterward.
2. A resolved-target invocation binds all downstream work to the returned `governance_target` and
   exposes only the next action permitted for that skill and current control state.
3. The dispatcher invokes existing target resolution, gate evaluation and presentation owners. No
   second gate table, locale pack, approval validator, target resolver or Markdown card template is
   introduced.
4. Missing, stale, version-mismatched or malformed dispatcher inputs fail closed with one typed,
   localized recovery action. They never fall back silently to model-invented target or gate state.
5. Exact approvals remain deliberate user input and are revalidated against the same target, run,
   gate and revision. Dispatcher execution itself grants no approval or mutation authority.
6. The executable preflight completes within 2 seconds in deterministic local tests on supported
   operating-system fixtures. Fresh-host observations record time to first AGDF output separately;
   a three-minute silent wait is not accepted as conforming behavior.
7. Copilot, Codex, Claude Code and OpenCode distribution profiles contain the version-matched
   dispatcher and instructions that reference only their owned installed-runtime location or an
   equally deterministic host-provided binding.
8. Tests cover unresolved and resolved targets, German and English presentation, wrong versions,
   missing runtimes, malformed input, ambiguous runs, terminal early return and prohibition of
   post-terminal repository inspection.
9. Native or loaded-host evidence is recorded separately per surface. Passing source and package
   tests must not be presented as proof of host invocation latency or host command support.
10. Existing direct-skill behavior, validator commands, status cards, gate authority and control
    artefacts remain compatible unless an approved later design explicitly versions a public
    contract change.

## Non-goals

- Replacing AGDF skills with a general autonomous workflow engine.
- Letting the dispatcher make product decisions, approve gates or mutate repositories without the
  existing gate authority.
- Claiming identical host UI or native command APIs where host capabilities differ.
- Folding the completed Windows symlink-fixture fix into this run.
- Reopening or rewriting the awaiting-UAT `cross-surface-skill-target-preflight` run.

## Evidence

- GitHub Copilot, GPT-5.6 Sol, fresh repo-less `/agdf-gate-check`, 2026-09-04: correct AGDF Task
  Target card appeared only after approximately three minutes.
- Earlier Copilot `/agdf-qa-gate`: the model manually located contracts and CLI entrypoints before
  returning target clarification.
- `plugin/skills/gate-check/SKILL.md` currently instructs the model to execute target preflight,
  inspect durable control state and select validator commands.
- `plugin/meta/contracts/task-target-resolution.md` already defines the shared target result and
  terminal unresolved boundary.
- `create-agdf/generated/plugins/*/runtime/agdf-local.js` proves that a version-matched executable
  runtime is already distributed; the missing layer is bounded skill dispatch and host binding.

## Open Questions For Brownfield Review

- Which existing runtime module should own dispatch without turning `agdf-local.js` into a second
  workflow engine?
- Which hosts can bind a slash command directly to an executable, and which still require a minimal
  first-tool-call skill adapter?
- What portable timing evidence can distinguish dispatcher duration, model delay and host tool
  startup on Windows, macOS and Linux?
- Should the first delivery slice cover `gate-check` and `qa-gate` only or all shipped canonical
  skills behind one registry from the outset?
