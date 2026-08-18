# AGDF Source-of-Truth Registry

## Primary Sources of Truth

| Domain | SoT Document | Status | Owner | Last Verified |
|---|---|---|---|---|
| Runtime contracts | plugin/meta/contracts/ | active | AGDF | 2026-07-18 |
| CLI control checks | create-agdf/lib/control-evaluation/; create-agdf/lib/cli/validation-handlers.js | active | AGDF | 2026-07-18 |
| Surface-local validator resolution and generation | create-agdf/lib/runtime/; create-agdf/scripts/sync-plugin-runtime.js | active | AGDF | 2026-07-18 |
| Release-built plugin composition and durable marketplace staging | create-agdf/scripts/sync-package-assets.js; create-agdf/lib/installers/local-marketplace.js; create-agdf/lib/installers/plugin-installers.js | active | AGDF | 2026-07-18 |
| Control templates | plugin/control/templates/ | active | AGDF | 2026-07-08 |
| Skill routing | plugin/meta/agdf-plugin.definition.json | active | AGDF | 2026-07-18 |
| Public conduct, contribution, security, support and maintainer governance | CODE_OF_CONDUCT.md; CONTRIBUTING.md; SECURITY.md; SUPPORT.md; GOVERNANCE.md | active | Arndt Gold | 2026-07-23 |
| GitHub community interaction adapters | .github/ISSUE_TEMPLATE/; .github/pull_request_template.md; .github/CODEOWNERS | active | Arndt Gold | 2026-07-23 |
| GitHub repository metadata desired state | .github/repository-metadata.json; assets/github-social-preview.png | active | Arndt Gold | 2026-07-23 |
| Local plugin identity plus public listing and submission projections | plugin/meta/agdf-plugin.definition.json; plugin/submission/openai/ | active | Arndt Gold | 2026-08-18 |
| Public privacy, terms and support contract | PRIVACY.md; TERMS.md; SUPPORT.md; SECURITY.md; LICENSE; NOTICE; TRADEMARKS.md | active | Arndt Gold | 2026-08-17 |
| OpenAI candidate build, local/public manifest projection and exact-bundle validation | create-agdf/lib/public-plugin/; create-agdf/scripts/build-public-plugin.js; create-agdf/scripts/public-plugin-test.js | active | AGDF | 2026-08-18 |

## Secondary References

| Reference | Purpose | Limit |
|---|---|---|
| README.md; INSTALL.md; create-agdf/README.md | User-facing explanation | Must follow runtime and CLI source files |
| plugin/meta/agdf-runtime-contract.md | Compatibility manifest for runtime-contract modules | Must not duplicate module content |
| create-agdf/generated/plugins/agdf/runtime/ | Package-built exact-version validator payload for full plugin surfaces | Derived at sync/prepack/publish; never edited or committed as source runtime |
| AGDF-owned user-data `marketplaces/agdf/` | Durable installed Codex/Claude marketplace | Derived from the released package; exact ownership marker and rollback rules are mandatory |
| GitHub repository settings and Community Profile | Effective public host state | Must be checked against `.github/repository-metadata.json` and delivered default-branch files; local repository state is not host proof |
| create-agdf/generated/submissions/openai/agdf/ | Deterministic public plugin candidate, inventory and readiness projection | Derived from canonical owners; repository/bundle evidence only, never portal or publication proof |

## Conflict Rule

When a secondary document, generated output, old snapshot or chat summary conflicts with the primary SoT, the primary SoT wins until a new approved artefact changes it.
