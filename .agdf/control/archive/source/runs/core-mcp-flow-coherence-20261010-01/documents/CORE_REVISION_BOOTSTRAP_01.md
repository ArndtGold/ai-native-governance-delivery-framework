# Bounded Core revision bootstrap

Date: 2026-10-10
Run affected by the subsequent canonical revision: core-mcp-flow-coherence-20261010-01
Authority: explicit user exception outside AGDF; this is not a QA report, TP completion or product gate approval.

## Exact authorization

User: "Ja, begrenzten Core-Fix ohne AGDF durchführen" in response to the concrete scope: extend the existing Core revision owner, test it, retain history, invalidate affected decisions and then integrate the proposal into the same Run's UR.

## Implemented scope and owners

The existing previewSourceRevision/applySourceRevision/inspectSourceRevision/recoverSourceRevision services now additionally admit UR at active structured SD with approved exact UR/PRD and linked reviewed draft SD, before SD approval, linked TP, implementation, reviews or closeout. The same shared boundary validates archived proof, requiring UR/PRD approvals and UR/PRD/SD source/binding closure for this case, while the existing CD+Tests boundary still requires all four approved sources. The existing request/preview/receipt schemas, locks, journaling, replay and recovery remain in use. All retained decision presentations, including pending SD cards, are archived. No alternate policy, raw production Run edit, manual reseal, inferred gate approval or new MCP write tool was added. The no-mode early PRD path is unchanged.

## Verification

All commands passed with Node 22.22.3:

- packages/core/test/early-ur-revision-test.js: Core/CLI application, exact history including pending SD presentation and UX, both structured modes, fresh synthetic UR approval, old reply rejection, portable clone validation, corrupt archive/proof rejection, stale/foreign/unresolved input, unsupported boundaries, interrupted real processes and competing writes.
- packages/core/test/run-source-revisions-test.js: existing four-source late revisions, 20 reported scenario IDs, renewals, exact upstream retention, history, path/binding protection and recovery.
- packages/core/test/run-revision-test.js: unchanged early PRD revision.
- packages/cli/scripts/late-source-revision-test.js: 51 candidate CLI/localization cases.
- packages/mcp-server/test/late-source-revision.test.js: actual STDIO MCP server, new early UR state/authoring parity and prior four-source/pending-state parity; isolated synthetic approvals only.
- packages/cli/scripts/late-source-revision-performance-test.js: ten retained-history cycles, no unrelated history reads, at most one concurrent commit; final preview about 405 ms and apply about 2387 ms on this local test run, not a general performance guarantee.
- scripts/sync-package-assets.js and scripts/assemble-npm.mjs: generated and assembled local candidate.
- packages/cli/scripts/build-contract-test.js and copilot-profile-test.js: contracts, inventory, exclusions, drift and exact growth cap.
- git diff --check.

## Candidate identity

Local assembled candidate: dist/npm/create-agdf, version 0.14.5, with this working-tree change. Version equality alone does not make it equivalent to an installed 0.14.5 runtime.

- packages/core/lib/control-state/run-revision-boundary.js: sha256:f29da8e1e53aee758c2b351f93c991cf0365df9bdb94c4c2ac3a380612f9fe19
- packages/core/lib/control-state/run-revision.js: sha256:04d5274d9e7e1fe8569a3e2d96eee2973a10fb954479fca98909d63e0790bf03
- packages/core/lib/control-state/run-revision-history.js: sha256:f4dfdd21ed81d649a41d6235eedf10fe1a70996cd65be40dca2234b89c21cd9d
- plugins/agdf/meta/contracts/gate-transition.md: sha256:2005cd11c629e447c940e7dc4ec5ab31d9f77d765400bb656cd56ca080b11a58

The exact Copilot payload is 217 files / 1820386 bytes (+1 file / +3344 bytes); CORE_REVISION_PACKAGING_01.json records the reviewed delta. Budget enforcement remains exact with no speculative headroom.

## Limits and production application

Tests distinguish source/Core/CLI/candidate STDIO from the installed MCP and native Codex UI. No global runtime installation, restart, native-host qualification, commit, push or release was performed. The old installed runtime does not implement or validate this new early history boundary and must be updated before using it for this Run. The bounded bootstrap does not implement the decision-card product scope or approve the renewed UR.

Production revision request: UR_SOURCE_REVISION_01.json, operation cbc55917-ee06-4fc3-b46f-ff8dcca3c30a, expected revision eeda271d-cf03-4430-9701-5ec61410062d. Application and renewed UR registration results are recorded separately below after the canonical owners finish.

## Completed canonical application

- Existing revision owner applied operation cbc55917-ee06-4fc3-b46f-ff8dcca3c30a and returned UR, revision 10 / aed55a47-8153-45e2-b251-842c6d6c5811.
- Original UR bytes were compared with the verified archive before canonical draft replacement.
- Existing run-step ur recorded the integrated canonical UR, revision 11 / 113078be-e9be-49b8-9235-bd400d2effa2, and updated Backlog.
- The summary check rejected an illustrative Approval ellipsis as a truncation marker. The complete summary was retained and the placeholder replaced with explicit wording; run-update recorded revision 12 / f20105c0-a12d-4635-9f08-d81d1d254a33. No summary validation was weakened.
- Fresh run-present prepared UR presentation 1ed85fac-9c28-4e40-9864-836e3b4e8413 at revision 12. Current UR digest: sha256:b937eb29e750758c842d8abf42325cf3ada6869198b197247e31a7eefd9b2a1b.
- Final qualified Core: valid seals, verified history, doctor pass, UR requirements ready, gate open and missing Approval: UR. No approval was recorded. PRD/SD file bytes are retained as history and their active bindings/decisions are invalidated.
- Installed MCP files were rechecked: their old CD+Tests-only preparation and all-four-approved history verifier remain unchanged. That installation needs this candidate before it can validate the new early-revision history.
