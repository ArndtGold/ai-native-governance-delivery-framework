# UAT Evidence: Release-Built Plugin Runtime Distribution

Status: accepted
Date: 2026-07-19
Gate approval: `Approval: UAT` accepted on 2026-07-19 after selected-run, same-gate,
revision and evidence-boundary revalidation.

## User-Visible Acceptance Scope

- Git source keeps `plugin/runtime/` absent; runtime bytes have one editable owner under
  `create-agdf/` and are generated only into the ignored package workspace.
- Package build and dry-run publication produce one complete runtime-bearing AGDF plugin with the
  expected Codex and Claude manifests.
- `Publish AGDF packages` builds and validates that package before npm publication, so a Git tag
  cannot publish a stale source-plugin runtime copy.
- Codex and Claude installers stage the exact installed package version into an AGDF-owned durable
  local marketplace and migrate only recognized legacy GitHub registrations.
- Unknown or conflicting host state fails closed; staged replacement and host-config changes roll
  back on failure.

## Repository Evidence

- QA passed and was accepted through exact `Approval: QA` on 2026-07-18.
- Task Plan Review records 13/13 tasks and AC-01 through AC-05 as done.
- Full `create-agdf` and `@agdf/cli` smoke suites, 27/27 deterministic skill evaluations,
  source/installed Runtime Integrity and whitespace checks pass.
- Two package builds are byte-identical without changing the source tree; the dry-run tarball
  contains the complete expected 218-file plugin.
- Isolated local-marketplace fixtures cover five-state classification, exact legacy migration,
  conflicts, interruption recovery and rollback without mutating real host configuration.
- Workflow assertions prove that validation and publication jobs build and verify the plugin before
  npm publication.

## Explicit Evidence Limits

This run did not mutate or restart an authenticated Codex or Claude installation, execute an exact
legacy migration against a real host, interrupt the transaction on native Windows, trigger the live
tag-based publish workflow, publish a package, create a release, commit, push or open a pull request.
Repository and isolated-fixture evidence therefore proves conformance of the implementation and
release path, not that those external executions have already occurred successfully.

## Acceptance Checklist

1. Accept that the Git source plugin is runtime-free and generated package output is complete.
2. Accept that the publish action automatically builds and validates the runtime-bearing package.
3. Accept that local-marketplace migration and rollback are deterministic fixture evidence, not a
   claim of an observed authenticated host migration.
4. Accept that native Windows interruption and live tag publication remain unobserved.
5. Confirm that release, publication and VCS actions remain forbidden by this UAT decision alone.

## Decision Requested

The delivered repository behavior and all disclosed external-evidence limits were accepted through
exact UAT approval. This acceptance does not authorize publication, release or VCS actions.
