# Pre-Implementation Brownfield Analysis: Public AGDF Plugin Distribution

Status: done  
Mode: `pre_implementation_analysis`  
Decision: `pass`  
Revision: 6
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`  
Source: approved `TP.md` Revision 4

## Revision 6 Revalidation — Version Contract

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- scope: Close the approved PPD-T18/PPD-29 regression blocker by aligning the four OpenAI
  submission version declarations with canonical AGDF `0.13.0`, extending the existing
  `scripts/set-version.mjs` owner and rerunning both full smoke suites.
- evidence: `plugin/meta/agdf-plugin.definition.json`, both package manifests and both plugin
  manifests are `0.13.0`; capability matrix, reviewer cases, release notes and availability record
  are `0.12.0`; `scripts/set-version.mjs` updates the former owners but omits all four submission
  sources; the public-plugin contract already rejects two of those mismatches.
- transparency: Reuse and extend the sole release-version writer. Do not add a second synchronization
  script and do not publish, tag, submit or mutate a portal.
- missing_evidence: Post-fix public-plugin, create-agdf, AGDF CLI, Runtime Integrity and Community
  Health results.
- current_coverage: `partially_done`; mismatch detection exists, but the canonical version writer
  does not update the complete declared release surface.
- reuse_strategy: `extend` `scripts/set-version.mjs`; add focused current-state assertions and update
  only the four stale submission values.
- risks: silently labeling repository `0.13.0` material as `0.12.0`, future recurrence through the
  incomplete version writer, or confusing repository readiness with publication.
- context_graph_impact: `none`; this repairs the already-declared release/version ownership and adds
  no new architectural or product relationship.
- required_next_step: Extend the existing writer, align the four submission sources to `0.13.0`,
  then run focused validation and both full smoke suites. Stop if any mismatch reveals a different
  canonical owner or requires product/release semantics beyond the approved TP.

## Revision 5 Handbook Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- scope: Implement only PPD-T21 through PPD-T24: bilingual handbook structure, English derived
  translation, link-only compatibility, deterministic parity validation and SoT/Context Graph links.
- evidence: Seven current German handbook files; inbound links in `README.md` and `SUPPORT.md`;
  existing handbook checks in `scripts/check-community-health.mjs` and
  `scripts/community-health-test.mjs`; approved PRD/SD/TP Revision 4; current worktree inventory.
- transparency: Existing German prose and the existing validator are reused. New language roots and
  English files are required by the approved contract; no second workflow or validation owner is
  introduced.
- missing_evidence: Human semantic review and post-change regression evidence do not exist yet and
  must be produced during CD+Tests and reviews. The unrelated public-plugin version gap remains
  outside this handbook delta.
- current_coverage: German semantics are complete under the legacy path; English translation,
  neutral discovery, source-revision metadata and bilingual parity validation are not done.
- reuse_strategy: Move the reviewed German files intact, extend the existing community-health
  validator and fixture harness, rewrite bounded consumers and use navigation-only legacy files.
- risks: stale translation, literal or authority-strengthening wording, broken deep links, duplicate
  German prose, brittle protected-token matching and overlap with current documentation changes.
- context_graph_impact: `update_existing_node`; reconcile `CG-PUBLIC-PLUGIN-DISTRIBUTION` during
  implementation and record the handbook authority in the Source of Truth Registry.
- required_next_step: Implement T21–T24, run V19–V25 plus existing regressions, perform L09 human
  semantic review and stop on any owner conflict, semantic drift or unrelated worktree overlap.

## Existing Owners And Coverage

| Area | Current coverage | Existing owner or evidence | Reuse strategy |
|---|---|---|---|
| German handbook meaning | fully_done for the current seven roles | `docs/agenten-handbuch/*.md` | move intact to `docs/handbook/de/`; do not rewrite semantics during migration |
| English handbook | not_done | none | create one derived translation per German role under `docs/handbook/en/` |
| Handbook discovery | partially_done | legacy German README and root links | add neutral selector; route root English support to English and root German README to the selector/German edition |
| Legacy compatibility | partially_done | seven currently referenced paths | replace all seven with link-only projections; preserve known deep paths without duplicate prose |
| Semantic validation | partially_done | `scripts/check-community-health.mjs` | extend in place for inventory, metadata, digest, protected content, meanings and links |
| Negative fixtures | partially_done | `scripts/community-health-test.mjs` | extend the existing isolated fixture pattern; do not add another test runner |
| Durable ownership | partially_done | `SOT_REGISTRY.md`, `CG-PUBLIC-PLUGIN-DISTRIBUTION` | update existing owners/nodes after paths exist |

## Impact And Compatibility

- files/modules: handbook Markdown, two existing validation scripts, root documentation links,
  Source of Truth Registry, Context Graph and run-scoped evidence only;
- interfaces: repository documentation URLs and validator diagnostics; no runtime, CLI, plugin
  manifest, gate or host interface changes;
- data/migration: file-path migration only; no persistent data or installed-cache change;
- backwards compatibility: every former handbook file path remains present as a navigation-only
  compatibility projection;
- regression tests: community-health baseline and negatives, handbook link checks, Runtime
  Integrity and applicable documentation/package smoke checks;
- external effects: none; no deployment, portal, submission, publication, release or VCS action.

## Parallel-Structure And Drift Review

- parallel_structure_risk: controlled; German prose exists only under `docs/handbook/de/`, English
  is explicitly derived and legacy files contain links only;
- source_of_truth_drift: controlled through one German owner plus exact SHA-256 source revisions;
- product_semantics_drift: no open decision; PPD-41 through PPD-44 and SD Revision 4 define authority,
  translation and review boundaries;
- runtime_drift: not applicable; Runtime Contract files and machine values are not translated;
- visible_state_ownership: neutral selector owns language discovery, language READMEs own local
  navigation, legacy paths own compatibility navigation only;
- UI_monolith_risk: not applicable to static Markdown navigation.

## Stop Conditions

- a former handbook path cannot be preserved without keeping duplicate semantic prose;
- an English chapter cannot preserve an exact approval value, command, Mode/Slice value, path,
  normative identifier or fenced code block;
- validator changes require a second semantic owner or silently normalize stale metadata;
- translation strengthens host enforcement, submission, publication, release or authority claims;
- a current inbound link resolves to deleted content;
- implementation overlaps an unrelated user change outside the approved documentation/control paths.

## Context Graph And Knowledge Persistence

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`, `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_required_action: update
- context_graph_reconciliation: `open_gap` until implementation updates the existing node
- context_graph_gate_effect: none during CD+Tests; closeout remains blocked until resolved
- memory_target: `sot_registry`
- memory_reason: The German-canonical/English-derived owner relationship is a durable repository
  authority boundary rather than run-only evidence.
- memory_refs: `.agdf/control/SOT_REGISTRY.md`, `.agdf/control/CONTEXT_GRAPH.md`, `docs/handbook/`
