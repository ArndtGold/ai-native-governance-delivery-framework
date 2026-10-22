# Brownfield Analysis: Desktop matrix implementation preparation

Decision: pass
Mode: pre_implementation_analysis
Status: done
Owner: Codex
Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01

## Scope and current sources

Apply renewed TP T-001 through T-011 from approved PRD/SD/TP. Exact source digests: UR 2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248; PRD 1d6bf911c1d9229d6c54ddfc0fc74bb3402d0e1a8efff775ad5903d81b657a9e; SD 0a1f8de1bb71b1ffbb317af7f5977dc9c0b617d3080fc62d7d998528fe7f11f1; TP 0a00d7cd0c13858e038b38a8b18e6419cc4dc21375c4702db4c0d3e6b01a23ff. TP approval operation bf02b79a-b441-4fa8-bb05-a20ae350e144 established revision eb96217a-1db2-45bd-8a91-ffa54f5a3325.

## Baseline and ownership

evidence/DESKTOP_MATRIX_IMPLEMENTATION_20261022/BASELINE.json captures HEAD 7ce6e8385632c001f6cdcd94fdb242e07f2ee748, tracked/untracked state, 161 ordinary canonical commands, 117 planned jobs and all existing workflow timeout declarations before implementation. Job counts alone are not coverage proof; compare normalized per-lane command multisets. Existing changed files belong to the release source revision/control; preserve the unrelated core-model-handoff-simplification-20261015-01 artefacts. No automatic staging, commits, tags or publication.

## Existing coverage and reuse

| Owner / paths | Coverage | Reuse and required extension |
|---|---|---|
| plugins/agdf/meta/agdf-plugin.definition.json; release-policy.mjs; sync-package-assets.js | partially_done | Current schema 1 still hardcodes mandatory CLI matrix. Extend same source/validator to schema 2, keeping optional CLI pins and derived compatibility view |
| release-candidate.mjs and Core provenance | partially_done | Reuse source/payload inventories, normalized hashes and containment; normalize only reported_sources evidence output alongside existing fixed outputs |
| release-observation.mjs | partially_done | Preserve schema-2 CLI checks and historical semantics. Add explicit human_report and strict Desktop schema-3 path, exact reviewed tuple and primary proof. Current Desktop booleans alone and Codex CLI pin branch are insufficient for new scope |
| release-handoff.mjs | partially_done | Existing immutable staged Claude import, tuple/review and references reusable; generalize host/surface scopes and full Desktop validation with no partial-default bypass |
| release-lifecycle.mjs; CLI runtime/ownership lifecycle | fully_done for existing protected mechanisms; applicability reassessed by tests | Existing integrity-checked baseline, owned-stale repair and preservation remain. Extend evidence checks rather than rewrite production guards |
| publish-agdf.yml; codex-release-e2e.yml; CI plan and test chains | partially_done | Replace mandatory CLI dependency with all-Desktop gate; retain standalone optional probes and full ordinary CI inventory/timeouts |
| host-compatibility contract/run/render/native-release and manifest | partially_done | Current qualified projection is Claude-specific; extend same owner with scoped paths and separately attributed reports that never feed qualified claims |
| Desktop human/CLI evidence | partially_done | Human invocation/upgrade/recovery reports exist, unknown identity remains. Original Windows CLI bundle is historical candidate-specific evidence, not new Desktop qualification |

## Interfaces, risks and minimal implementation

Version policy and Desktop observation formats explicitly. Keep legacy parsing under original predicates; do not relabel archived/native records. One candidate owner, one policy owner, one release evaluator. Imported files remain non-executable inputs with containment, bounded sizes/hashes, recheck, owned transaction rollback and separate review. No new runtime authority, host service or persistent approval store.

Implement policy/identity first, observation/report parsing next, host-scoped exchange and strict capability/transition checks, then workflow and compatibility/public projections. Extend existing fixture suites and canonical test chains before refreshing generated assets. Verify negative cases and full per-lane test multiset/timeouts. A final clean prepared source is a later execution prerequisite; never delete ignored host configuration or foreign files to create it.

Scope permits related regression tests and generated public/package outputs only. No Core gate, runtime security guard, ownership postcondition, consent rule, payload/history limit or existing timeout is relaxed. If testing reveals an implementation defect with unchanged approved intent, repair it through its existing owner; upstream changes use their revision route.

## Missing evidence and next step

Exact Desktop app/model/session/candidate and primary captures are unknown. Record actual human reports without qualification credit, recover only explicitly relevant original references first, then identify specific justified missing-fact verification. Unknown access or unsafe isolation blocks the affected native case; independent implementation and fixture checks can proceed. The other Windows machine remains its executor; no credentials or remote access are inferred.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: Run-specific implementation baseline and exact evidence limits; reassess reusable knowledge at closeout.
- required_next_step: Record this preparation through the existing internal-step owner, then implement CD+Tests under the approved TP and current bound continuation.
