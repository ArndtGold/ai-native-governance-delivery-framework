# PRD: Modularize the create-agdf CLI Entry Point

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided in session on 2026-07-16 after same-run, same-gate and revision revalidation
Based on: approved UR revision 1 and Brownfield Review
Date: 2026-07-16
Owner: agent

## 1. Product Scope

Deliver a behaviour-preserving internal architecture for the published `create-agdf`
CLI in which `create-agdf/bin/create-agdf.js` is only the stable executable composition
root and each major responsibility has one focused owner under `create-agdf/lib/`.

The delivery must establish these ownership boundaries without prescribing premature
file names:

1. command definitions and command-specific option validity;
2. argument parsing and validation;
3. runtime/generated metadata and locale context;
4. Codex, Claude Code and OpenCode installation/status operations;
5. repository scaffold planning, overwrite policy and next-step output;
6. doctor and Verified Change evaluation;
7. gate transition policy and gate-check evaluation;
8. delivery-map evaluation;
9. top-level orchestration, output routing and exit-state mapping.

Existing `control-state`, `delivery-path-search` and `interaction-presentation` modules
remain canonical owners and are consumed directly. The work must extract existing
behaviour, not wrap those libraries in a second abstraction hierarchy.

## 2. Functional Requirements

### FR-01 — Stable executable boundary

`create-agdf/bin/create-agdf.js` must retain its path, shebang, package export and bin
mapping. It may compose and invoke the CLI application and map an uncaught failure to
stderr/exit state, but it must not own command policy, installers, scaffolding, doctor,
gate or delivery-map domain logic.

### FR-02 — One command registry

One registry must be the canonical declaration of every supported command. Command
recognition, usage/help command listings, unsupported-command guidance and dispatch
must derive from it. It must distinguish global options from command-specific options
without becoming a second owner of domain evaluation.

### FR-03 — Pure argument result

Argument parsing must return a validated options object or a typed/structured parse
failure. Parsing must not call `console.*`, `process.exit()` or mutate the filesystem.
Help must be represented as a normal parse/dispatch outcome so tests do not terminate.

### FR-04 — Explicit side-effect boundaries

Filesystem access, environment/platform lookup and subprocess execution used by
installers and scaffolding must be explicit module dependencies or narrow adapters.
Production behaviour remains synchronous where it is synchronous today; this refactor
must not introduce concurrency or retry semantics.

### FR-05 — Cohesive extracted owners

Installer, scaffold, doctor, gate-policy and delivery-map implementations must live in
cohesive modules with explicit exported entry points. No generic catch-all module may
simply receive the current monolith, and no gate/control/presentation rule may be
duplicated across extracted modules.

### FR-06 — Acyclic orchestration

Dependency direction must flow from executable composition root to CLI orchestration,
from orchestration to responsibility modules, and from those modules to existing domain
libraries. Domain modules must not import the executable or invoke `main()`.

### FR-07 — Behavioural compatibility

The refactored CLI must preserve the compatibility matrix in section 3. Any deliberate
observable correction discovered during the refactor requires a separately approved
scope; it must not be smuggled into mechanical extraction.

### FR-08 — Testable seams

The command registry, parser and each newly extracted policy/evaluation boundary must
support direct deterministic tests. Existing subprocess regression tests remain the
authority for public CLI compatibility.

### FR-09 — Publish completeness

Every new runtime module must be included by the existing package `files` boundary and
must load successfully from a packed clean-client fixture. The public export surface
must not expand unless required for the existing `./cli` export to resolve.

### FR-10 — Scoped overlap handling

The refactor may move current installer and presentation code but must not change the
separate `installer-output-parity` scope or reopen completed/active interaction semantics.
Current HEAD behaviour is the compatibility baseline.

## 3. Public Compatibility Matrix

| Surface | Must remain compatible |
|---|---|
| Package | Package name, executable path, `bin` mapping, `./cli` export and generated asset availability |
| Commands | All current commands including run lifecycle, install, repository, doctor, gate-check, delivery-map and Delivery Path Search commands |
| Options | Current names, aliases, defaults, bounds, command restrictions and path-resolution behaviour |
| Parsing | Help success, missing-value failures, unknown-argument failures and unsupported-command failures |
| stdout/stderr | Output channel, ordering and stable user/machine-readable wording relied upon by tests |
| Exit state | Existing success, configured/unconfigured, open/blocked and evaluation-result exit semantics |
| Installers | Subprocess command, argument order, stdio mode, version verification and failure classification currently observable |
| Scaffolding | Planned file set, content, overwrite/refusal behaviour, ownership preservation, cleanup and next-step output |
| Config/locales | System-locale detection, explicit language precedence, runtime language and fallback behaviour |
| Doctor | Finding codes, severities, paths, summaries, JSON shape and multi-run aggregation |
| Gate check | Earliest-gate decisions, allowed/forbidden actions, approval formulas, status-card fields and JSON/human output |
| Delivery map | Relationship findings, run selection, aggregation, backlog pointers and JSON/human output |
| Delivery Path Search | Surface selection, fixtures, generation/evaluation boundaries, persistence and result/exit behaviour |
| Platforms | Existing macOS/Linux/Windows branches remain unchanged; no new cross-platform support claim is introduced |

## 4. Acceptance Criteria

1. The executable entry point contains only composition/invocation and terminal error
   mapping; no extracted domain function remains defined there.
2. Adding or renaming a command for a future change would require editing one command
   definition rather than synchronized target/help/error/dispatch lists.
3. Parser tests cover help, every option value class, aliases, defaults, invalid bounds,
   missing values, unknown arguments, unsupported commands and command-specific option
   restrictions without spawning or exiting a process.
4. Direct tests cover installer command planning/version parsing, scaffold write planning,
   doctor evaluation, gate transition decisions and delivery-map evaluation at their new
   public module boundaries.
5. Existing CLI subprocess fixtures observe compatible stdout, stderr and exit status for
   success and representative failure paths.
6. The generated file sets and contents for every repository target are unchanged in
   isolated before/after fixtures, excluding volatile absolute paths where already
   normalized by tests.
7. `doctor --json`, focused `gate-check --run ... --json`, `delivery-map --all-active`
   and deterministic Delivery Path Search fixtures retain their schema and decisions.
8. Full `create-agdf` smoke, control-state, interaction-presentation, Verified Change,
   runtime-integrity, skill-evaluation, routing and Delivery Path Search suites pass.
9. Plugin runtime-integrity verification and `git diff --check` pass.
10. A packed clean-client bootstrap/load test proves all new runtime modules are shipped.
11. No new runtime dependency, compatibility shim, fallback command path, duplicated gate
    table or parallel control-state/presentation owner is introduced.
12. The delivered design records one curated Context Graph node for the CLI composition
    boundary only at OR, after implementation evidence confirms the boundary.

## 5. Non-Goals

- New commands, options or public JavaScript API exports.
- New AGDF gate, approval, interaction, status-card or delivery-path semantics.
- Installer error-classification, output-parity or Windows command-resolution fixes.
- Async conversion, performance optimization or replacement of synchronous filesystem
  operations.
- Rewriting existing control-state, interaction-presentation or Delivery Path Search
  libraries.
- General formatting or wording cleanup unrelated to required registry derivation.
- Release, npm publish, VCS commit, push or pull request.

## 6. Users And Roles

- CLI users require unchanged commands, diagnostics and generated repository state.
- AGDF agents and CI consumers require stable JSON, exit codes and gate decisions.
- Maintainers require cohesive owners and direct unit-test seams.
- The user approves PRD, SD, TP, QA and UAT gates; the agent performs internal Brownfield,
  implementation and review steps only when the selected run permits them.

## 7. Constraints

- Runtime and durable artefacts remain English; chat remains German.
- Public command strings documented across the repository remain unchanged.
- Current dirty-worktree scope is limited to this run's control artefacts and backlog row;
  later implementation must continue isolating unrelated active runs.
- Generated plugin metadata is read during CLI startup today; SD must preserve or explicitly
  prove compatible initialization and failure timing.
- Installer subprocess calls must remain behaviourally identical; no unapproved Windows
  capability claim may result from moving them.
- Module names and directory layout are SD decisions, but each PRD ownership group must have
  exactly one clearly named owner or an explicit justified consolidation.

## 8. Evidence Requirements

- Before/after responsibility map and dependency graph.
- Command/option registry coverage report.
- Focused direct tests for new seams.
- Existing subprocess regression suite results.
- Generated-file parity evidence for each target.
- JSON/exit-code compatibility fixtures for doctor, gate-check, delivery-map and Delivery
  Path Search.
- Packed-package clean-client load/bootstrap evidence.
- TP Review, Clean Implementation Review, Code Review and QA evidence.
- Explicit disclosure that native Windows installer execution was not newly proven unless
  separate evidence becomes available outside this scope.

## 9. Risks And Open Questions

- SD must choose exact module names and an acyclic dependency graph.
- SD must decide whether runtime/generated metadata is passed as a context object or owned
  by a narrow configuration module without creating a service-locator pattern.
- SD must define a typed parser/application result that preserves existing output and exit
  timing.
- TP must stage extraction so the full regression suite can run after each responsibility
  group rather than only after one large move.
- QA must distinguish behaviour preserved by deterministic evidence from platform behaviour
  that remains unverified.

## 10. Next Step

Draft the Solution Design for the approved responsibility boundaries, compatibility
matrix and evidence requirements. Implementation remains forbidden until SD and TP are
approved and pre-implementation Brownfield Analysis passes.
