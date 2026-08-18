# Pre-Implementation Brownfield Analysis: Public AGDF Plugin Distribution

Status: done  
Mode: `pre_implementation_analysis`  
Decision: `pass`  
Revision: 4
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`  
Source: approved `TP.md` Revision 3 and QA finding `PPD-QA-03`

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- scope: Change only canonical `description`, constrained public `shortDescription`, their generated
  Codex/Claude/public projections and exact regression assertions. Shared `longDescription`, display
  names, prompts, capability metadata and every external boundary remain unchanged.
- missing_evidence: Live ChatGPT/Codex, public deployment, publisher, portal and post-publication
  evidence remains intentionally unavailable and must stay in its separate evidence class.
- required_next_step: Update the two canonical values, adjust exact fixtures, regenerate through the
  existing projector and run focused plus full regressions. Stop on any projection drift, changed
  OpenAI limit, new product semantics, owner conflict or unrelated worktree overlap.

## Revision 3 Revalidation

| Area | Current coverage | Existing owner or evidence | Reuse strategy |
|---|---|---|---|
| Canonical local/package short copy | not_done for Revision 3 | `plugin/meta/agdf-plugin.definition.json` top-level `description` | change the existing owner only |
| Constrained public short copy | not_done for Revision 3 | `plugin/meta/agdf-plugin.definition.json` `publicDistribution.shortDescription` | change the existing constrained variant only |
| Codex, Claude and public projection | fully_done structurally | `create-agdf/lib/public-plugin/manifest.js`; `sync-package-assets.js` | reuse unchanged projector and regenerate |
| Exact copy and limit tests | partially_done | `create-agdf/scripts/public-plugin-test.js`; Runtime Integrity | update exact fixtures and assert public length 29 |
| Strategic detailed copy | fully_done and unchanged | canonical top-level `longDescription` | preserve exactly; no new owner |

The approved correction fits the existing two-level short-copy projection. No schema, module,
fallback, migration or parallel metadata structure is needed. The 29-code-point public value remains
inside the enforced 30-code-point limit. The local/package value is not subject to that constrained
public limit. The prior candidate digest is baseline evidence only and must change after regeneration.

## English Public-Policy Revalidation

- current_coverage: `PRIVACY.md` and `TERMS.md` are English, but their canonical security/support
  targets are German; the public `/support` route links directly to root `SUPPORT.md`.
- reuse_strategy: translate the two existing root owners in place; keep all URLs, routing,
  confidentiality, supported-version, best-effort and no-SLA semantics unchanged.
- affected_consumers: `PRIVACY.md`, `TERMS.md`, the Pages support redirect, README community links,
  `scripts/check-community-health.mjs` and its negative fixtures.
- parallel_structure_risk: no German policy copies will be added; English remains canonical while
  both English and German reports/questions remain welcome.
- required_next_step: translate in place, update exact language-sensitive assertions and rerun
  public-document, community-health, Runtime Integrity and full package regressions.

## English Community-Contract Revalidation

- current_coverage: contribution, governance and conduct semantics are complete but their canonical
  root documents are German, creating a language break from English `SUPPORT.md`.
- reuse_strategy: translate the three existing root owners in place; preserve CLA/DCO, AI disclosure,
  canonical/derived paths, sole-maintainer authority, CODEOWNERS boundary, succession, confidential
  conduct reporting, enforcement and reconsideration semantics.
- affected_consumers: README community links, support routing, conduct/governance cross-links,
  `scripts/check-community-health.mjs` and negative fixtures.
- parallel_structure_risk: no translated copies will be added; explicit English/German participation
  remains part of each canonical owner.
- required_next_step: translate in place, update exact semantic guardrails and negative fixtures,
  then rerun community-health, Runtime Integrity and full package regressions.

## Revalidated Existing Owners And Coverage

| Area | Coverage before implementation | Existing owner or evidence | Reuse strategy |
|---|---|---|---|
| Canonical identity, descriptions, prompts, capabilities and surface metadata | partially_done | `plugin/meta/agdf-plugin.definition.json` | extend with one bounded public-distribution object; keep it the sole metadata authority |
| Source Codex plugin manifest | partially_done | `plugin/.codex-plugin/plugin.json`; parity assertions in `plugin/scripts/check-runtime-integrity.mjs` | add a focused deterministic projection from the canonical definition; do not add an independently edited listing owner |
| Release-built plugin composition | fully_done for existing distribution paths | `create-agdf/scripts/sync-package-assets.js` copies the complete source plugin into the generated package | extend this composition with a sibling OpenAI candidate; preserve current npm/local-marketplace outputs |
| Runtime payload | partially_done | `create-agdf/scripts/sync-plugin-runtime.js` has version/root safety and a fixed runtime inventory but copies the broad package manifest | retain the runtime entrypoint and replace only its isolated copied package metadata with the approved minimal generated manifest |
| Source/package integrity | partially_done | Runtime Integrity, package build and `create-agdf/scripts/package-contents-test.js` | extend from selected-file assertions to all-declaration and exact-candidate proof |
| Public policies | partially_done | `LICENSE`, `NOTICE`, `TRADEMARKS.md`, `SUPPORT.md`, `SECURITY.md` exist; `PRIVACY.md` and `TERMS.md` do not | create the two approved canonical documents and link existing owners without duplicating their policy text |
| Public website | partially_done | Astro static site; `pages/src/data/site.ts` and `pages/src/pages/index.astro`; canonical Astro site URL already uses `agdf.iself.eu` | extend existing data/composition and add three static routes through one canonical-document adapter |
| Website domain metadata | partially_done | `pages/astro.config.mjs` uses `https://agdf.iself.eu`; `pages/src/data/site.ts` still declares `agdf.tools` | correct the existing data owner under PPD-T06 and assert parity |
| Submission listing, cases, capability matrix and readiness reports | not_done | no active repository owner exists | add only the approved `plugin/submission/openai/` sources and focused builder/report modules |
| Publisher, portal and public listing state | not_done and external | OpenAI organization and portal | no repository implementation; record only later non-sensitive observations after explicit authority |

## Owner And Implementation Boundaries

The current source Codex manifest is not generated from the canonical definition. Runtime Integrity
compares its interface fields with that definition, while package synchronization copies the entire
source plugin into `create-agdf/generated/plugins/agdf/`. The minimal clean path is therefore to add
one focused source-manifest projection owned by the existing package composition, call it before the
source plugin is staged, and retain Runtime Integrity as an independent parity check. Editing both
JSON files by hand would create the parallel owner prohibited by the approved SD.

The OpenAI public candidate must be a sibling generated output under
`create-agdf/generated/submissions/openai/agdf/`; it must not replace
`create-agdf/generated/plugins/agdf/`. The existing complete-plugin copy, local marketplace and npm
package tests remain regression owners.

The Pages site has one route and no content adapter today. The new privacy, terms and support routes
may add a small shared canonical-document loader plus route files, but must not copy policy prose into
`pages/src/data/site.ts`. Root documents remain authoritative. A local Astro build proves only local
renderability, not public deployment.

## Task-Group Reuse Path

1. Update the two approved values in the canonical definition.
2. Update only exact copy/length fixtures in the focused public-plugin test.
3. Regenerate Codex, Claude, package and public candidate outputs through existing owners.
4. Run focused public-plugin and Runtime Integrity checks, then the complete create-agdf regression.
5. Refresh CD+Tests, candidate inspection, Task Plan Review, Clean Review, Code Review and QA while
   keeping PPD-L02 through PPD-L08 pending.

## Regression And Test Impact

- Source integrity: `node plugin/scripts/check-runtime-integrity.mjs` and its negative/layout tests.
- Package composition: source-manifest parity, package build, package contents, local marketplace,
  lifecycle, routing, skill evaluations and the aggregate smoke suite.
- Candidate safety: schema, Unicode boundaries, path containment, exact case, symlink escape,
  loadability, all declarations, inventory/digests, reproducibility and sensitive-key rejection.
- Pages: `npm --prefix pages run check`, static build, route/content-origin/link assertions and later
  visual inspection; deployment remains separate evidence.
- Current clean baseline evidence: Runtime Integrity passes with 10 skills and 16 control files;
  Astro check reports 0 errors, 0 warnings and 0 hints.

## Risks And Stop Conditions

- **Parallel metadata owner:** stop if portal/listing copy or the source manifest must be maintained
  independently of the canonical definition.
- **Existing distribution regression:** stop if the new candidate replaces or changes the current
  generated plugin, local marketplace or npm surface rather than extending it.
- **Policy duplication:** stop if Pages requires copied privacy, terms or support prose.
- **Package-shape drift:** stop and route to SD/TP if current official OpenAI constraints no longer
  accept the approved Skills-only tree or constrained interface fields.
- **Evidence collapse:** stop if repository or bundle checks are used to mark host, deployment,
  publisher, portal or publication state successful.
- **Sensitive identity data:** reject Persona inquiry/session URLs, identity documents/images,
  tokens, cookies or raw credentials from source, generated output, evidence and logs.
- **Worktree isolation:** `docs/präesentation/` is unrelated untracked user work and must remain
  untouched. The only other current tracked changes are this run's control-state updates.

## Parallel-Structure And Drift Review

- parallel-structure risk: controlled by one canonical distribution object, one deterministic
  manifest projection and one sibling generated candidate;
- SoT/runtime/product-semantics drift: no unresolved product decision is visible; approved PRD/SD/TP
  Revision 3 owns the exact local/public short-copy projections and the unchanged Skills-only boundary;
- visible-state ownership: Pages owns public presentation; readiness reports own repository/bundle
  state; OpenAI owns publisher/portal/effective listing state;
- UI monolith risk: low if policy routes use a shared adapter and the existing index composition is
  extended without embedding submission/build state;
- migration impact: additive generated output only; no data migration and no installed-cache edit.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`, `CG-CREATE-AGDF-CLI-COMPOSITION`,
  `CG-NATIVE-INTERACTION-AUTHORITY`, `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_required_action: none before implementation
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- evidence: The existing public-distribution node already records the desired/effective-state and
  authority split; implementation must update it only if a durable invariant changes.

## Minimal Clean Implementation Path

Proceed to CD+Tests through the existing canonical definition, existing projector and exact tests.
Do not add fields, aliases or parallel copy owners. Regenerate the sibling public candidate and all
source/package manifests, then rerun reviews and QA. Do not automate or perform deployment, identity
verification, portal mutation, submission, publication, release or VCS delivery.
