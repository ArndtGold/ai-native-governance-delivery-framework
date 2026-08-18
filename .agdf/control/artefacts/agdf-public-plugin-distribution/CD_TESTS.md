# CD+Tests: Public AGDF Plugin Distribution

Status: done
Revision: 18
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

## Bilingual Handbook Delta

Revision 12 applies a plain-English reading-flow pass to all seven English candidates. Dense literal
phrases were shortened, transitions were made more direct, and every German example or workflow
block now has a concise English explanation outside the protected fence. Protected blocks, exact
approval values, CLI commands, Mode/Slice values, paths, source revisions and authority boundaries
remain unchanged. Current validation still reports only the seven truthful unreviewed-state
findings; the reviewed-state snapshot still passes all 25 negative contracts.

Revision 13 adds a beginner-first “AGDF in five minutes” section to the canonical German index and
then to the derived English index. It introduces request, run, gate, evidence and delivery before the
detailed workflow, includes one short user/agent conversation and states that a run is not Git
isolation. The English source digest matches the updated German bytes. The reviewed-state snapshot
passes baseline plus 26 negative contracts; current repository validation still reports only the
seven truthful unreviewed-state findings.

Revision 14 rewrites the canonical German and derived English run-selection sections around the
actual beginner question: when selection is needed, where the run ID comes from, how one command
differs from repeated commands, selector precedence, fail-closed ambiguity and the explicit
non-effect on Git branches/worktrees. Both editions use the same concrete selector examples, the
English source digest matches the German source, and the reviewed-state snapshot passes 27 negative
contracts.

Revision 15 replaces every handbook CLI fragment with a complete executable command. Run selection,
one-command environment selection, all-active diagnosis, surface status, selected-run diagnosis and
explicit migration now name the `agdf` executable and concrete example values in both languages.
The handbook explains the global-installation and target-repository prerequisites and clears a
shell-wide `AGDF_RUN_ID` after repeated commands. The validator now requires the complete command
forms, the CLI parser accepts all eight documented forms, and the reviewed-state snapshot passes 28
negative contracts. Production validation continues to fail only on the seven truthful L09
unreviewed findings.

Revision 16 makes the real CLI availability boundary explicit. Installing an AGDF host plugin does
not by itself add `agdf` to the shell. Both handbook editions now show how to detect a global CLI,
install `@agdf/cli` globally, or use the complete `npx --yes @agdf/cli@latest ...` fallback. They
also warn that registry `latest` can differ from a local repository checkout and provide separate
checks for published, globally installed and repository versions. The validator rejects automatic-
plugin-install claims, and the reviewed-state snapshot passes 29 negative contracts.

Revision 17 records PPD-L09 as completed from Arndt Gold's explicit 2026-08-18 human statement,
“Handbook translation reviewed.” All seven English chapters now declare
`translation_status: reviewed`. The production community-health check passes with 39 required
files and four issue forms; the reviewed baseline plus 29 negative contracts, Runtime Integrity and
`git diff --check` also pass. This review evidence is repository-only and does not prove any host,
portal, publication or release state.

Revision 18 closes the independent version/smoke blocker. The canonical repository version remains
`0.13.0`; capability matrix, reviewer cases, release notes and availability now match it. The root
cause was the existing `scripts/set-version.mjs` writer omitting those four submission sources, so
the writer now updates them together with package, plugin and site versions. Availability receives
an exact-version assertion. Focused public-plugin validation passes with digest
`e09bc6abf23fa5ee6abee513ab77bf605e57b1a381a09139e32227101326f425`; the complete
`create-agdf` and `@agdf/cli` smoke suites both pass at `0.13.0`.

| Task | Status | Implementation | Evidence |
|---|---|---|---|
| PPD-T21 | done | Added neutral language selection, moved the seven reviewed German roles to `docs/handbook/de/` and replaced every former path with a bounded navigation-only compatibility file. | Exact inventory and all local links pass in the reviewed-snapshot validation; compatibility prose guard passes. |
| PPD-T22 | done | Added seven natural reviewed English translations with one-to-one chapter roles, exact German SHA-256 revisions, unchanged approval/CLI/Mode/paths/identifiers and byte-equal fenced blocks. | Arndt Gold explicitly confirmed human review on 2026-08-18; all seven metadata records now say `reviewed`, and production validation passes. |
| PPD-T23 | done | Extended the existing community-health owner for exact inventory, YAML metadata, source digests, review state, protected inline values, fenced blocks, complete CLI forms and installation boundaries, language-specific semantic boundaries, legacy no-prose rules and all handbook links. | A temporary reviewed-state snapshot passes baseline plus 29 isolated negative contracts. Source files remain unchanged by that proof. |
| PPD-T24 | done | Updated root README/support routing, Source of Truth Registry and `CG-PUBLIC-PLUGIN-DISTRIBUTION` with the German-canonical/English-derived authority boundary. | Repository link validation passes; Context Graph and SoT refs are concrete and current. |

### Revision 17 Checks

| Check | Result |
|---|---|
| Current `node scripts/check-community-health.mjs` | pass: 39 required files and four issue forms |
| Reviewed-state temporary snapshot | pass: baseline plus 29 negative contracts |
| Handbook CLI parser check | pass: all eight documented command forms accepted by the canonical parser and option validator |
| `node --check` for both community-health scripts | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass: 10 skills and 16 control files |
| `git diff --check` | pass |
| Human semantic review PPD-L09 | pass: Arndt Gold explicitly stated “Handbook translation reviewed” on 2026-08-18 |
| Full create-agdf/AGDF CLI smoke | pass: both complete suites at `0.13.0`; package, lifecycle, runtime, 53 skill-eval, Delivery Path Search, OpenCode and routing checks included |

Revision 18 performs no deployment, host mutation, identity action, portal operation, submission,
publication, release, installed-cache change or VCS delivery.

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
| PPD-T17–T18 | done | Revised the English root documents and bilingual handbook in place, then completed version coherence across canonical `0.13.0` owners and all OpenAI submission sources. The sole version writer now owns the full declared release surface. | Community Health and 29 negatives, Runtime Integrity, public-plugin tests, exact availability assertion and both full smoke suites pass. |
| PPD-T17 handbook revision | done | Revised the seven-file Coding Agent Handbook as one semantic user journey. It now covers exact gate authority, all current Mode/Slice outcomes, post-TP Brownfield Analysis, mandatory Code Review, QA/UAT routing, honest Run-versus-worktree isolation, safe legacy migration and repository/bundle/host evidence boundaries. | All handbook links resolve; semantic handbook contract passes ten required and four forbidden meanings; community-health baseline plus 18 negatives, 24 required files, Runtime Integrity and `git diff --check` pass. |

## Implemented Files

- `PRIVACY.md`
- `TERMS.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `GOVERNANCE.md`
- `INSTALL.md`
- `RELEASE.md`
- `SECURITY.md`
- `SUPPORT.md`
- `TRADEMARKS.md`
- `scripts/check-community-health.mjs`
- `scripts/community-health-test.mjs`
- `docs/agenten-handbuch/README.md`
- `docs/agenten-handbuch/01-schnellstart.md`
- `docs/agenten-handbuch/02-gates-und-freigaben.md`
- `docs/agenten-handbuch/03-typische-arbeitsablaeufe.md`
- `docs/agenten-handbuch/04-mehrere-runs.md`
- `docs/agenten-handbuch/05-abschluss-und-auslieferung.md`
- `docs/agenten-handbuch/06-fehlerbehebung.md`
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
| `npm --prefix create-agdf run smoke-test` | pass at `0.13.0`; complete aggregate suite including public plugin, package, lifecycle, control-state, runtime, 53 skill evals, Delivery Path Search, OpenCode and routing |
| `npm run test:community-health && npm run check:community-health` | pass; reviewed baseline plus 29 negative contracts, 39 required files and 4 issue forms |
| Handbook semantic and local-link checks | pass; complete German/English meaning, protected-command, source-digest, compatibility and local-link contracts |
| Ten-root-document local Markdown link scan | pass; all local targets resolve |
| `npm --prefix agdf run smoke-test` | pass at `0.13.0` |
| AGDF Doctor for selected run | pass; 0 findings |
| `git diff --check` | pass |

## Review And External Evidence

- PPD-T19 Task Plan Review, Clean Implementation Review and Code Review were repeated for the
  plain-English revision; implementation integrity and code review pass, while TP evidence remains
  partial only because the full smoke suite cannot start on the incoherent version baseline;
- PPD-L01 bundle inspection was refreshed with the current candidate digest;
- PPD-L02 through PPD-L08 live host, deployment, publisher, portal, submission and publication
  evidence remain unperformed and subject to their stated authority boundaries.

## Next Step

Refresh TP, Clean and Code Reviews against Revision 18, then run QA. External host, deployment,
publisher, portal, submission and publication evidence remains separately pending and unauthorized.
