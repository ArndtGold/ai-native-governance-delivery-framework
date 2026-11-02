# Shared-owner coordination

The exact related run metadata and state hashes captured on 2026-10-01 are in
[OWNER_COORDINATION.json](OWNER_COORDINATION.json). All three canonical metadata
projections currently say UR after recovery. Backlog and embedded older status cards
still describe later stages; those are historical/conflicting projections, not usable
current approvals. This task neither repairs those runs nor inherits their approvals.

| Related scope | Current revision | Shared owner reused | Boundary for this run |
|---|---|---|---|
| agdf-public-plugin-distribution | 37 / 468e7977-6268-4466-91ef-13913d675a4f | public-plugin manifest/builder/validator and canonical definition | Format/profile projection and existing public candidate builder; no submission or publication |
| agdf-npm-package-payload-cleanup | 3 / 03ee638e-095a-4dd0-ab8f-27d7bd49a4ac | package inclusion and generated payload owner | Verify actual tarballs and tooling/template exclusion; no unrelated cleanup |
| agdf-host-adapter-compatibility | 12 / 8ab37cfd-11a9-4578-b12c-89d4cacc09f3 | host-adapters, compatibility fixtures and report generator | Update canonical-source references and rerun affected deterministic paths; no transferred native-host evidence |

Arndt Gold remains accountable; Codex executes this approved run's changes through
the existing code owners. The baseline has no competing edits in shared executable
builders. Recheck task-touched hashes immediately before each stage; unexpected
concurrent changes require a bounded merge/owner reconciliation before overwriting.
No additional package, policy owner, acceptance register or source tree is introduced.
