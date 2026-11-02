# TP: Dual-Layout Runtime-Integrity Validation

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided in session on 2026-07-16
Date: 2026-07-16
Owner: agent
Derived from: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/SD.md`

## 1. Implementation Boundary

Permitted production and test paths:

- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/runtime-integrity-layout-test.js` (new)
- `create-agdf/package.json`
- `INSTALL.md` only if needed to document `AGDF_RUNTIME_INTEGRITY_ROOT` semantics

Generated plugin surfaces, gate contracts, manifests, control templates, CLI schemas and workflow
files are outside the implementation boundary unless a failing approved task proves a necessary
escalation.

## 2. Tasks And Tests

### AIRH-01 — Add deterministic layout resolution

- Implement a small resolver in `check-runtime-integrity.mjs` that classifies `source` or
  `installed` from stable markers.
- Resolve the default from the script plugin root and its direct parent only.
- Normalize explicit override paths and reject zero or multiple valid classifications.

Acceptance evidence:

- source checkout resolves `source`;
- staged plugin resolves `installed`;
- partial layout returns `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID`.

### AIRH-02 — Separate common and source-only path ownership

- Derive plugin paths from `pluginRoot` in both modes.
- Derive marketplace, npm package, Pages, sync, CLI, root license and active-run paths only in
  source mode.
- Retain the existing canonical plugin definition as the common skill and manifest authority.

Acceptance evidence:

- installed mode does not report repository-only files missing;
- source mode still fails when a source-only required owner is missing or inconsistent.

### AIRH-03 — Preserve fail-closed traversal and diagnostics

- Ensure skill/control directory traversal occurs only after layout validation and required-directory
  assertions.
- Preserve existing `[agdf-runtime-integrity] FAIL` invariant reporting.
- Emit the stable layout diagnostic instead of an uncaught `ENOENT` stack trace.

Acceptance evidence:

- incomplete installed tree fails with the stable diagnostic;
- missing common invariant fails with its canonical missing-file message.

### AIRH-04 — Add installed-layout regression tests

- Add `runtime-integrity-layout-test.js` using fresh temporary directories and the canonical
  `plugin/` tree.
- Cover default installed detection, installed override, source override, missing common invariant,
  and partial-layout rejection.
- Clean every fixture in `finally`; do not add a persisted fixture copy.

Acceptance evidence:

- focused layout test passes on Node.js 20/22-compatible APIs;
- deliberately broken fixtures fail for the expected reason.

### AIRH-05 — Wire the regression into delivery validation

- Add a focused package script and place it in the aggregate `create-agdf` smoke chain before the
  existing negative integrity suite.
- Do not add a second direct workflow invocation because both guardrail and publish workflows already
  execute the aggregate smoke chain.

Acceptance evidence:

- `npm --prefix create-agdf run test:runtime-integrity-layout` passes;
- aggregate smoke output proves the focused test executed.

### AIRH-06 — Document the explicit override boundary

- If no existing documentation defines `AGDF_RUNTIME_INTEGRITY_ROOT`, add one concise maintainer note
  explaining accepted source-root/plugin-root values and fail-closed classification.
- Avoid exposing the variable as a general end-user setup requirement.

Acceptance evidence:

- documentation matches implemented resolution and does not promise unsupported ancestor search.

### AIRH-07 — Run complete regression validation

Run and record:

1. `node plugin/scripts/check-runtime-integrity.mjs`
2. `npm --prefix create-agdf run test:runtime-integrity-layout`
3. `npm --prefix create-agdf run test:runtime-integrity-negative`
4. `npm --prefix create-agdf run smoke-test`
5. `npm --prefix agdf run smoke-test`
6. `npm pack --dry-run` in both `create-agdf/` and `agdf/`
7. selected-run `doctor --json` and `gate-check --json`
8. `git diff --check`

Acceptance evidence:

- all commands pass, except expected selected-run gate status after implementation;
- the changed-path set remains within the approved boundary plus this run's control artefacts.

## 3. Requirement Coverage

| Requirement | Tasks | Evidence |
|---|---|---|
| PR-01 deterministic layout | AIRH-01, AIRH-03, AIRH-04 | focused layout tests |
| PR-02 override compatibility | AIRH-01, AIRH-04, AIRH-06 | source/plugin override cases and documentation |
| PR-03 invariant ownership | AIRH-02, AIRH-03 | installed pass plus retained source negative checks |
| PR-04 installed regression | AIRH-04 | temporary staged-plugin fixtures |
| PR-05 delivery integration | AIRH-05, AIRH-07 | aggregate smoke and package evidence |

## 4. Review And Escalation Rules

- Escalate before implementation if layout classification requires a new public CLI flag or output
  schema.
- Escalate if installed mode cannot retain canonical definition-to-manifest validation without
  shipping repository-only owners.
- Escalate if implementation needs generated surface, workflow, gate-contract or control-template
  changes outside the declared paths.
- After implementation, run Task Plan Review, Clean Implementation Review and mandatory Code Review
  before QA.

## 5. Next Step

Run the pre-implementation Brownfield Analysis and proceed to AIRH-01 through AIRH-07 only if it
passes.
