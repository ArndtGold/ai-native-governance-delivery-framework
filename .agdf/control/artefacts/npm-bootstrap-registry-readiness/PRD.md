# Product Requirements: Reliable npm Bootstrap Readiness

## Status

- status: pending_approval
- approval: Approval: PRD was provided before durable artefact creation; post-artefact confirmation required
- delivery_mode: structured_slice
- derived_from: `.agdf/control/artefacts/npm-bootstrap-registry-readiness/UR.md`
- brownfield_review: `.agdf/control/artefacts/npm-bootstrap-registry-readiness/BROWNFIELD_REVIEW.md`
- owner: agent

## Product Outcome

AGDF releases report readiness only after a fresh client can resolve the exact published
packages and the `latest` dist-tag, while all existing public bootstrap commands remain
unchanged.

## Non-Negotiable Public Interface

These command shapes remain exactly unchanged:

```text
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest copilot
npx --yes @agdf/cli@latest claude
```

No additional flags, parameters, alternate syntax, cache-clearing instructions, or user-side
retry steps are part of the solution.

## Functional Requirements

### Release Readiness

1. The release workflow must publish `create-agdf` before `@agdf/cli`.
2. The workflow must verify exact-version availability for both packages through the real npm registry.
3. The workflow must explicitly verify that `latest` resolves to the release version for `@agdf/cli`.
4. Readiness polling must be bounded and report the package, expected version, observed result, and final failure reason.
5. Release readiness must not be reported when exact-version or `latest` verification fails.

### Clean Bootstrap Evidence

6. CI must execute a bootstrap smoke test from an isolated temporary directory and isolated npm cache.
7. The smoke test must use the unchanged documented command shape for the tested target.
8. The smoke test must verify expected AGDF output/files without modifying a real user configuration.
9. The test must cover the shared public command contract across the supported bootstrap targets where the repository can safely provide deterministic fixtures.

### Command Contract Integrity

10. The canonical existing command owner remains `create-agdf/bin/create-agdf.js` and its synchronized package assets.
11. Existing help, README, installation, and website examples must remain consistent with the unchanged command contract.
12. Focused tests must fail if a public bootstrap command gains an additional parameter or diverges across surfaces.

## Acceptance Criteria

1. A release workflow run proves `create-agdf@<version>` and `@agdf/cli@<version>` are resolvable before completion.
2. The same run proves `npm view @agdf/cli@latest version` returns `<version>`.
3. A clean-client smoke test executes an unchanged `npx --yes @agdf/cli@latest <target>` command and verifies deterministic output in a disposable fixture.
4. The smoke test cannot write to the maintainer's home directory or real Codex, Claude, Copilot, or OpenCode configuration.
5. Existing public command examples remain byte-for-byte compatible for `codex`, `copilot`, `claude`, and equivalent documented targets.
6. Existing package smoke tests, runtime integrity, package dry-runs, and diff checks pass.
7. Failure output identifies whether the problem is exact package visibility, `latest` tag visibility, or bootstrap execution.

## Non-Goals

- Changing npm or registry propagation behavior.
- Adding flags such as `--prefer-online` to user-facing commands.
- Adding a second bootstrap wrapper or package.
- Requiring users to clear caches, retry manually, or use alternate syntax.
- Changing package names, release versioning, AGDF gate semantics, or repository-owned control state.
- Claiming that arbitrary already-stale local npm caches can be controlled by AGDF.

## Constraints And Risks

- npm and CDN propagation are externally eventually consistent; bounded readiness evidence can reduce release-side races but cannot control every stale client cache.
- The existing release workflow and `create-agdf` smoke-test surface are the authoritative owners; no parallel command registry may be introduced.
- Clean-client tests must remain deterministic and must not depend on interactive agent installations.
- All generated package assets must continue to derive from their existing authoritative sources.

## Evidence Requirements

- workflow-level exact-version and `latest` registry checks;
- isolated clean-client bootstrap evidence;
- command-contract consistency assertions across generated and documented surfaces;
- existing package/runtime checks and `git diff --check`;
- explicit failure-path evidence for a missing package/tag or unsuccessful bootstrap.

## Required Next Step

Review this PRD and provide exact post-artefact approval:

`Approval: PRD`
