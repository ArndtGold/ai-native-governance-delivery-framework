# UR: Modularize the create-agdf CLI Entry Point

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-16 after same-run, same-gate and revision revalidation
Date: 2026-07-16
Owner: agent

## 1. Problem

`create-agdf/bin/create-agdf.js` has grown into a 3,342-line entry point that owns
command discovery, argument parsing, installation, repository scaffolding, doctor
evaluation, gate policy, delivery-map evaluation, presentation and process exit
handling. The implementation is well tested, but the concentration of independent
responsibilities makes changes harder to review, unit test and keep internally
consistent.

The duplication of command metadata across the target allow-list, usage output,
validation error text and dispatcher already permits small observable drift. Large
policy functions and direct `process.exit()` calls further couple domain evaluation
to the executable process.

## 2. Goal

Modularize the CLI into focused, testable owners while preserving its complete public
behaviour and keeping `bin/create-agdf.js` as the stable executable entry point.

## 3. Scope

- Establish one command registry as the source for command recognition, help routing
  and dispatch metadata.
- Separate argument parsing and validation from console output and process termination.
- Extract the global installer, generated-file/scaffolding, doctor, gate-policy and
  delivery-map responsibilities into focused modules.
- Keep existing control-state, interaction-presentation and Delivery Path Search
  modules as canonical owners; reuse them instead of creating parallel abstractions.
- Preserve all public commands, options, output schemas, exit-code semantics, generated
  file behaviour and AGDF gate decisions.
- Add focused unit tests where extraction creates testable seams and retain the existing
  end-to-end regression suite.

## 4. Non-Goals

- No new CLI command, option or installation surface.
- No change to AGDF gate semantics, approval authority or delivery-path behaviour.
- No redesign of JSON or human-readable output.
- No Windows installer compatibility fix in this scope; the existing risk remains a
  separately evidenced concern.
- No rewrite of the existing `create-agdf/lib/control-state/`,
  `create-agdf/lib/delivery-path-search/` or interaction-presentation cores.
- No release, publish, commit, push or pull request.

## 5. Acceptance Signals

1. `create-agdf/bin/create-agdf.js` is a thin executable composition root rather than
   the owner of domain policy and installation/scaffolding implementation.
2. Command names and command-specific validation are declared once and drive parsing,
   help/usage and dispatch without duplicated command lists.
3. Argument parsing can be tested without terminating the test process.
4. Extracted modules have explicit inputs and outputs and do not introduce a second
   control-state, gate-policy or presentation model.
5. Existing public command forms, stdout/stderr contracts, JSON structures and exit
   codes remain compatible.
6. The package includes every newly extracted runtime module.
7. Focused tests, the full `create-agdf` smoke suite, runtime-integrity checks and
   whitespace validation pass.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js` owns the current public CLI behaviour.
- `create-agdf/package.json` owns the executable and published package boundary.
- `create-agdf/lib/control-state/` owns canonical run-state parsing, resolution and
  persistence.
- `create-agdf/lib/interaction-presentation.js` owns shared human presentation.
- `create-agdf/lib/delivery-path-search/` owns Delivery Path Search.
- `plugin/meta/agdf-runtime-contract.md` and its focused contract modules own AGDF
  runtime and gate semantics.
- `create-agdf/scripts/` owns package-level behavioural regression evidence.

## 7. Risks And Unknowns

- Large mechanical movement can accidentally change initialization order, output order,
  error wording or exit codes even when domain logic is unchanged.
- Hidden dependencies on module-level generated metadata and environment variables must
  be mapped before extraction.
- Installer subprocess behaviour and synchronous filesystem mutation need injectable
  seams without changing observable execution.
- Brownfield Review must decide whether the work is one structured slice or should be
  split into separately approved slices.

## 8. Next Step

Run Brownfield Review and record the smallest justified Mode/Slice Decision before
drafting later-gate artefacts.
