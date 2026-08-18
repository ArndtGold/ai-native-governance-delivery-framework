# CD+Tests: Public AGDF Plugin Distribution

Status: done
Revision: 8
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

## Evidence Boundary

This record covers repository implementation and local static-bundle evidence only. No Pages
deployment, OpenAI/Persona identity action, portal mutation, submission, publication, release,
installed-host UAT or VCS action has been performed.

## Completed Task Evidence

| Task | Status | Implementation | Evidence |
|---|---|---|---|
| PPD-T04 | done | Added canonical English root `PRIVACY.md` for the Skills-only/no-AGDF-service boundary, host-owned processing, authorized local/repository access, public-project services and sensitive-data exclusions. | Public-document contract test passes. |
| PPD-T05 | done | Canonical English `TERMS.md` remains aligned with newly translated English root `SECURITY.md` and `SUPPORT.md`. The translations preserve private vulnerability routing, supported-version scope, best-effort/no-SLA support, deterministic issue routing and acceptance of reports/questions in English or German. | Public-document routes/build pass; community-health baseline and 15 negative contracts verify private fallback, numeric-SLA rejection, routing and bilingual participation. |
| PPD-T06 | done for repository implementation | Added one shared `pages/src/data/publicDocuments.ts` adapter, one generated static route owner for `/privacy`, `/terms` and `/support`, canonical `agdf.iself.eu` data parity and visible footer links. Routes resolve to canonical GitHub documents without policy-prose duplication. | Astro check 0 errors/warnings/hints; static build creates all three routes; route/link/domain assertions pass. Public deployment evidence PPD-L04 remains pending. |
| PPD-T01–T03 | done | The canonical local/package `description` is now `Control layer for governed AI-assisted delivery.` and the constrained public short copy is `Governed AI delivery controls` (29 code points). Existing projection owners regenerate Codex, Claude and public manifests; shared strategic `longDescription`, display names, prompts, hooks and capability metadata remain unchanged. Redundant description owners remain absent and rejected. | Exact local/public copy fixtures, 29-code-point assertion, Codex/Claude/public long-copy equality, removed-key assertions, generated parity, Unicode 30/30/80/3/128 boundaries and full package/marketplace regressions pass. |
| PPD-T07 | done | Added public Skills-only/no-MCP positioning with shared, Codex-specific and ChatGPT-advisory states plus authority, recovery and independent-project boundaries. | Pages source assertions, Astro check and static build pass. |
| PPD-T08–T10 | done | Added release-specific capability matrix, five positive and five negative synthetic reviewer cases, release notes and a deliberately pending availability record. | Schema, version, count, theme, evidence-state and sensitive-content checks pass. |
| PPD-T11–T12 | done | Added focused offline contract, manifest, builder, validator and report modules plus a thin build script. The builder atomically stages the Skills-only candidate as a sibling of existing generated plugin output. | Two builds are content-equivalent; 42 source candidate files are inventoried before readiness outputs; no MCP/app/control/cache/secret/local-path content. |
| PPD-T13–T14 | done | Replaced copied runtime package metadata with a minimal generated ESM manifest. Candidate validation covers active manifest paths, exact case, containment, symlinks, version, skill resources and submission-source declarations. Packed `bin` and export targets are checked against the final npm inventory. | Missing, case, traversal and escaping-symlink fixtures fail; local validator, installed Runtime Integrity, package-build and package-contents tests pass. |
| PPD-T15–T16 | done | Added machine/readable readiness reports and run-scoped host, portal and post-publication templates. Repository/bundle pass is separated from unverified host, publisher, portal and publication state. | Report snapshots and sensitive-key exclusions pass; `submissionReady` remains `false`. |
| PPD-T17–T18 | done | Root security, support, contribution, governance and conduct policies are now canonical English documents; README exposes their English titles. English/German participation and German-primary governance remain explicit. Semantic guardrails preserve contribution ownership, no CLA/DCO, AI disclosure, sole-maintainer/CODEOWNERS/succession authority and confidential conduct reporting/enforcement/reconsideration. | Community-health baseline plus 17 negative contracts, public-document route/build, Runtime Integrity, complete create-agdf smoke, AGDF CLI smoke and workflow assertions pass. |

## Implemented Files

- `PRIVACY.md`
- `TERMS.md`
- `pages/src/data/publicDocuments.ts`
- `pages/src/pages/[document].astro`
- `pages/src/data/site.ts`
- `pages/src/pages/index.astro`
- `pages/scripts/public-documents-test.mjs`
- `pages/package.json`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/.codex-plugin/plugin.json`
- `plugin/submission/openai/`
- `create-agdf/lib/public-plugin/`
- `create-agdf/scripts/build-public-plugin.js`
- `create-agdf/scripts/public-plugin-test.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/sync-plugin-runtime.js`
- `.agdf/control/SOT_REGISTRY.md`
- `.github/workflows/agdf-guardrails.yml`
- run-scoped host, external-state and post-publication evidence templates

Generated `pages/dist/` output was rebuilt only as local bundle evidence. It is not deployment proof.

## Checks

| Check | Result |
|---|---|
| `npm --prefix pages run check` | pass; 0 errors, 0 warnings, 0 hints across 13 files |
| `npm --prefix pages run test:public-documents` | pass; build plus canonical document, policy-boundary, route, footer-link and domain assertions |
| Local responsive browser inspection | pass; desktop 1440×1000 shows three aligned capability cards and complete authority/recovery copy; mobile 390×844 stacks cards and boundary panels without horizontal overflow; footer exposes Privacy, Terms and Support links |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; source mode, 10 skills and 16 control files |
| Installed/generated Runtime Integrity | pass; 10 skills and 16 control files |
| `npm --prefix create-agdf run test:public-plugin` | pass; exact local `Control layer for governed AI-assisted delivery.` and public `Governed AI delivery controls`, public length 29, one shared long description across Codex/Claude/public, removed-field rejection, contract limits, two-build reproducibility, 42-file candidate inventory, path/symlink negatives, evidence separation and CI safety; digest `a2aca3a964ecb7899ffa705879f9d6ac7cc484516455b98bcdd58823e3160a04` |
| `npm --prefix create-agdf run test:package-build` | pass; byte-identical complete builds; source untouched |
| `npm --prefix create-agdf run test:package-contents` | pass; 294 packed files plus declared bin/export targets |
| `npm --prefix create-agdf run smoke-test` | pass; complete existing distribution, runtime, lifecycle, routing, eval and package regression suite; 53/53 deterministic skill evals |
| `npm run test:community-health && npm run check:community-health` | pass; baseline plus 17 negative contracts, 17 required files and 4 issue forms |
| `npm --prefix agdf run smoke-test` | pass |
| AGDF Doctor for selected run | pass; 0 findings |
| `git diff --check` | pass |

## Review And External Evidence

- PPD-T19 Task Plan Review, Clean Implementation Review and Code Review were repeated after the
  Revision 3 description correction and pass;
- PPD-L01 bundle inspection was refreshed with the current candidate digest;
- PPD-L02 through PPD-L08 live host, deployment, publisher, portal, submission and publication
  evidence remain unperformed and subject to their stated authority boundaries.

## Next Step

Run QA again from the refreshed implementation and review evidence. Do not begin any external action.
