# User Requirement: Host Adapter Boundaries and Evidence-based Compatibility

- revision: 1
- status: approved
- approval: Exact `Approval: UR` accepted on 2026-09-05 after revalidating run `agdf-host-adapter-compatibility`, gate `UR` and revision identity `03fc3c7b-9776-48b9-bf2c-55c238a63b1e` against the installed version-matched validator.
- owner: Arndt Gold
- date: 2026-09-05

## Problem

AGDF increasingly maintains host-specific installation, discovery, invocation, update, permission
and recovery behavior. The current source contains a content-derived Codex installation identity,
Claude uninstall/install refresh behavior, Copilot Git marketplace transport and explicit skill
discovery verification. Hooks, runtime locations and activation conditions add further differences.
Every supported host, version and operating-system combination increases the verification burden.

Shared foundations already exist. Skill dispatch consumes canonical target resolution, gate
evaluation and presentation. Lifecycle results, runtime provenance, automatic-check consent and
host conformance work also have existing owners. The required improvement is to make their
boundaries consistent and their compatibility evidence comparable across the supported surfaces.

## Required Outcome

Keep AGDF decisions, target resolution and validation centrally owned. Encapsulate host-specific
installation, invocation, permission integration, activation, update and recovery in the respective
host adapters. Demonstrate common compatibility outcomes and describe support only at the level
that current evidence establishes for the exact environment and execution path.

## Scope

- Apply the boundary consistently to the existing Codex, Claude Code, GitHub Copilot and OpenCode
  integrations. A host name alone does not identify an app/CLI variant, version or operating system.
- Reuse canonical target, gate, approval, validation, presentation, lifecycle and provenance owners.
  Host adapters translate technical host behavior without becoming additional governance decision
  owners. Shared permission intent and approval semantics remain central, while actual host
  permissions remain controlled by the host.
- Require the same observable compatibility outcomes for each claimed supported combination:
  installed, discovered, callable, correctly updated and recoverable after defined failures.
- Preserve content identity through update and recovery. A visible plugin, matching version number
  or successful installation command alone must not imply discovery or effective invocation.
- Reuse and extend existing tests and host observations into comparable evidence. Keep deterministic
  core/adapter evidence, installed payload inspection, fresh-host execution and human UAT distinct.
- Describe skill availability, automatic validation, observed governance behavior and technical
  enforcement separately. A passing observation is not proof that every model or execution path is
  technically constrained. Name the specific enforced boundary and its limitations.
- Bind support claims to AGDF content/version, host variant/version, operating system, execution
  path, relevant permission/activation state, evidence reference and observation date. Make absent,
  failed, unsupported or no-longer-applicable evidence visible instead of inheriting stronger claims.

## Acceptance Signals

1. The same normalized target and control input produces the same governance result across host
   adapters, including unresolved targets, missing approvals and invalid inputs.
2. A host-specific lifecycle change has a clear adapter owner and does not require duplicating or
   changing governance decisions merely to accommodate transport, paths, discovery or permissions.
3. Every supported combination can report each of the five compatibility outcomes separately with
   its evidence and limits. Missing execution evidence cannot be reported as a pass.
4. Correct updates demonstrate the intended content in the effective host environment, including
   changed content under an unchanged canonical AGDF version where that lifecycle is supported.
5. Defined interruption and failure cases demonstrate either verified recovery or a clear remaining
   partial state and bounded recovery action. Recovery must preserve existing ownership protections.
6. Support information distinguishes available skills, automatic checks and demonstrated governance
   behavior. Any technical enforcement claim names its mechanism and covered execution path.
7. Shared compatibility scenarios and reporting reuse existing owners and evidence. Host fixtures
   cannot silently substitute for direct native-OS or fresh-host evidence.
8. A change to a relevant host, payload, adapter, permission or execution-path assumption requires
   re-evaluation of the affected claim. Passing results for one combination do not automatically
   transfer to other versions, systems, host variants or subagent paths.

## Existing Work and Scope Boundaries

- `agdf-product-maturity-roadmap` already owns the broader direction for honest enforcement classes
  and live-host maturity. This proposal concerns the bounded host-adapter and lifecycle compatibility
  outcome, rather than reopening the roadmap's UX and proportionality work.
- `cross-surface-executable-skill-dispatcher` owns executable skill preflight and its remaining host
  evidence. Its approvals and open findings remain attached to that run.
- `agdf-cross-host-runtime-integrity`, `installation-consent-runtime-checks` and
  `agdf-copilot-plugin-integration` retain their installation, provenance, consent and host-specific
  obligations. Their results are evidence inputs, not blanket approval for this scope.
- `agdf-live-host-conformance-matrix` and `claude-loaded-host-conformance-observation` provide
  existing conformance work to assess for reuse. No historical result is upgraded by this UR.
- `opencode-native-dispatch-tool` remains a separate proposed native capability.

## Non-goals

- A new governance engine, approval authority, state store or generic host abstraction framework.
- Identical host commands, native UI, permission APIs or universal support for every version/OS.
- Blanket shell permissions, bypassing host trust or treating installation consent as gate approval.
- Automatically accepting, closing or expanding related runs and their outstanding evidence.
- Performing host installation, restart, release, publication or VCS delivery as part of this UR.

## Evidence and Open Questions

Source inspected on 2026-09-05:

- `create-agdf/lib/installers/plugin-installers.js`: separate host installation paths, Claude refresh,
  Copilot discovery and recovery behavior.
- `create-agdf/lib/installers/local-marketplace.js`: Codex content identity and marketplace staging.
- `create-agdf/lib/skill-dispatch/service.js`: existing shared target/evaluation/presentation flow.
- `create-agdf/lib/lifecycle/result.js`: shared lifecycle result and non-authorizing operation status.
- `plugin/meta/agdf-plugin.definition.json`: declared host surfaces and automatic-check adapters.
- Related canonical URs and the live `MASTER_BACKLOG.md`: existing scope ownership and evidence gaps.

Brownfield Review must determine the smallest coherent change, the exact adapter and evidence
owners to reuse, the initial supported environment set, and which current claims need revalidation.
The adapter API, evidence representation and implementation/test plan remain undecided.

## Gate Boundary

UR Revision 1 is approved. The approval permits Brownfield Review and its evidence-based Mode/Slice
Decision. It does not approve an implementation design or host changes.
