# AGDF Source-of-Truth Registry

## Primary Sources of Truth

| Domain | SoT Document | Status | Owner | Last Verified |
|---|---|---|---|---|
| Portable plugin identity/profile projection, repository source root and build-only schema validation | plugins/agdf/meta/agdf-plugin.definition.json; scripts/public-plugin/source-root.js; scripts/public-plugin/manifest.js; scripts/public-plugin/validator.js; scripts/support/portable-schema.js; plugins/agdf/meta/schemas/agent-plugins/1.0.0/ | active | AGDF; Arndt Gold accountable | 2026-10-01 |
| Shared hook source templates | plugins/agdf/host-templates/shared/hooks/; scripts/sync-package-assets.js | active | AGDF | 2026-10-01 |
| Runtime contracts | plugins/agdf/meta/contracts/ | active | AGDF | 2026-07-18 |
| Shared quality, proportionate tests/evidence and normalized finding rules | [quality.md](../../plugins/agdf/meta/contracts/quality.md); [context](CONTEXT_GRAPH.md#cg-quality-contract) | active | AGDF quality contract; SD/TP and reviews apply it; qa-gate owns technical QA, human approvals remain separate | 2026-10-27 |
| Core rule evaluation and CLI composition | packages/core/lib/control-evaluation/; packages/cli/lib/cli/validation-handlers.js | active | AGDF | 2026-07-18 |
| Surface-local validator resolution and generation | packages/cli/lib/runtime/; scripts/sync-plugin-runtime.js | active | AGDF | 2026-07-18 |
| Release-built plugin composition and durable marketplace staging | scripts/sync-package-assets.js; packages/cli/lib/installers/local-marketplace.js; packages/cli/lib/installers/plugin-installers.js; packages/cli/lib/host-adapters/ (native mechanisms) | active | AGDF | 2026-09-05 |
| Control templates | plugins/agdf/control/templates/ | active | AGDF | 2026-07-08 |
| Unapproved UR drafting and material clarification | plugins/agdf/skills/ur-definition/SKILL.md; plugins/agdf/meta/contracts/ur-definition.md | active | AGDF; gate-check retains readiness and approval control | 2026-10-04 |
| Unapproved PRD product drafting, clarification and explicit revision | plugins/agdf/skills/prd-definition/SKILL.md; plugins/agdf/meta/contracts/prd-definition.md | active | AGDF; gate-check retains readiness, existing control writers and deliberate approval authority | 2026-10-04 |
| Skill routing | plugins/agdf/meta/agdf-plugin.definition.json | active | AGDF | 2026-07-18 |
| Agent Skills conformance baseline and plugin-scoped portability policy | plugins/agdf/meta/agent-skills-conformance.json | active | AGDF | 2026-08-19 |
| Public conduct, contribution, security, support and maintainer governance | CODE_OF_CONDUCT.md; CONTRIBUTING.md; SECURITY.md; SUPPORT.md; GOVERNANCE.md | active | Arndt Gold | 2026-07-23 |
| GitHub community interaction adapters | .github/ISSUE_TEMPLATE/; .github/pull_request_template.md; .github/CODEOWNERS | active | Arndt Gold | 2026-07-23 |
| GitHub repository metadata desired state | .github/repository-metadata.json; assets/github-social-preview.png | active | Arndt Gold | 2026-07-23 |
| Local plugin identity plus public listing and submission projections | plugins/agdf/meta/agdf-plugin.definition.json; plugins/agdf/submission/openai/ | active | Arndt Gold | 2026-08-18 |
| Public privacy, terms and support contract | PRIVACY.md; TERMS.md; SUPPORT.md; SECURITY.md; LICENSE; NOTICE; TRADEMARKS.md | active | Arndt Gold | 2026-08-17 |
| OpenAI candidate build, local/public manifest projection and exact-bundle validation | scripts/public-plugin/; scripts/build-public-plugin.js; packages/cli/scripts/public-plugin-test.js | active | AGDF | 2026-08-18 |
| User handbook semantics and translations | docs/handbook/de/ (canonical German); docs/handbook/en/ (derived English); scripts/check-community-health.mjs (parity validation) | active | Arndt Gold | 2026-08-18 |

## Physical Package Ownership

| Responsibility | Canonical owner | Derived consumer |
|---|---|---|
| Control state, validators, dispatch/inspect and pure evaluation | packages/core/lib/ | Embedded Core in npm/profile outputs; private source workspace only |
| Immutable control read capture and cockpit DTO/resource projection | packages/core/lib/control-read/; packages/core/lib/control-inspect/cockpit.js | Private local read service; existing Core evaluators retain rule authority |
| Local read-only cockpit service, browser interface and reproduction | packages/control-ui/; packages/control-ui/README.md | Private source package only; no public CLI/plugin UI payload or gate authority |
| Immutable resource context and allowed contract reader | packages/core/lib/resources/; plugins/agdf/meta/ | Generated package resources with explicit binding descriptor |
| Git, process/runtime probes, locale and host composition | packages/cli/lib/ | create-agdf and focused offline runtime |
| MCP SDK, worker and stdio adapter | packages/mcp-server/ | @agdf/mcp-server |
| Build, profile, assembly and release orchestration | scripts/ | dist/npm/; dist/local/<host>/npm/ |
| Evaluation tooling and corpora | evals/ | Deterministic reports with explicit source fingerprints |

Verified 2026-10-01; authority remains with the existing AGDF contracts. See
`docs/architecture/05-paketstruktur.md` and the physical package-boundaries run.

## Secondary References

| Reference | Purpose | Limit |
|---|---|---|
| docs/compatibility/HOST_COMPATIBILITY.md; evals/host-compatibility/ | Dated repository compatibility evidence derived by scripts/host-compatibility/ | No live installation, capability, approval or runtime authority; exact environment and lane only |
| README.md; INSTALL.md; packages/cli/README.md | User-facing explanation | Must follow runtime and CLI source files |
| plugins/agdf/meta/agdf-runtime-contract.md | Compatibility manifest for runtime-contract modules | Must not duplicate module content |
| packages/cli/generated/plugins/agdf/runtime/ | Package-built exact-version validator payload for full plugin surfaces | Derived at sync/prepack/publish; never edited or committed as source runtime |
| AGDF-owned user-data `marketplaces/agdf/` | Durable installed Codex/Claude marketplace | Derived from the released package; exact ownership marker and rollback rules are mandatory |
| GitHub repository settings and Community Profile | Effective public host state | Must be checked against `.github/repository-metadata.json` and delivered default-branch files; local repository state is not host proof |
| packages/cli/generated/submissions/openai/agdf/ | Deterministic public plugin candidate, inventory and readiness projection | Derived from canonical owners; repository/bundle evidence only, never portal or publication proof |
| docs/handbook/README.md; docs/agenten-handbuch/ | Language selection and legacy compatibility navigation | Navigation only; must not own or duplicate handbook semantics |

## Conflict Rule

When a secondary document, generated output, old snapshot or chat summary conflicts with the primary SoT, the primary SoT wins until a new approved artefact changes it.

Run-only delivery ownership: `.agdf/control/runs/<run_id>/RUN_STATE.md` and registered artefacts own current control. `packages/core/lib/control-state/run-inventory.js` and its existing reader own stored inventory; Cockpit v2 adapts it without a second evaluator/index. MASTER_BACKLOG.md is optional retained legacy information. New operations have no backlog output/lock; explicit recovery retains old journal responsibility. Worktree placement is normative only in `plugins/agdf/meta/contracts/task-target-resolution.md`. Candidate local evidence: `.agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/CD_TESTS.md` and its hashed `evidence/manifest.json`; context packets keep v1 independently of the v2 reader. Independent baseline CI completion and isolated reconciliation at c79972c2f3fc3d8bd21d45d10e90a1dd79c5d763 are verified; compatibility record/check passes 56 scenarios with current source fingerprint 0103db4de2473a79bc9eebb989a28eb26c02960a4ab54c6a0f080bdbf9a9e618. The required TP/Clean/Code reviews are recorded; technical QA passes and deliberate QA/UAT approvals are recorded. The feature exact-head platform matrix, including its unchanged dedicated performance check, remains mandatory before integration/merge; baseline success is not feature qualification. No installed-host qualification or release authority is claimed.
