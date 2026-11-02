# Clean Implementation Review: Bound PRD preview review

- decision: pass
- run_id: prd-preview-review-integration-20261018-01
- source_revision: df82c79d-c01e-47c1-b44b-e1e54c32ef68
- reviewed_at: 2026-10-19
- reviewer: Codex, agent structural review
- based_on: approved SD/TP, Brownfield Analysis, actual source/diff, Code Review and current evidence

## Clean Implementation Review

- primary_solution: The approved PRD descriptor remains the sole applicable preview association. One shared inspector validates declared source facts. The existing immutable presentation owner binds exact snapshots in envelope version 5, existing read owners expose them, and the existing approval transaction revalidates them. DecisionCard owns only local presentation and delegates the actual effect to that transaction.
- evidence: Source owner inspection below; evidence/quality-review/source-evidence-integrity.json confirms the unchanged 163-file review snapshot and 102 retained evidence hashes; current actual command matrix, strict graph, package/clean source and browser evidence.
- fallbacks_retained: Older unmarked UR/no-preview behavior and envelope versions 1–4 retain their original meanings. The safe standalone copy and exact stateless Inspect provide capability-dependent read access to the same immutable material. Missing framing/port is explicitly unavailable; no permissive sandbox or parser fallback is present.
- workaround_or_shim_risk: No temporary architecture workaround or test-only production dependency path was introduced. Retry retains the same source binding and known failure; no unknown result is converted to success. The full standalone file is a validated access copy, not historical authority or another authored source.
- parallel_structure_risk: No second approval/receipt family, product register, file selector, preview state store, server, consent checkbox or status-policy model. New helpers are cohesive internals under existing owners. The existing limits/renderer policy and version dispatcher are shared rather than reimplemented per transport.
- brownfield_fit: The actual SD reuse path is implemented. Captured reads use control-read/fs; mutation writers keep the existing locks, journal and exclusive output owner. Public Core facades preserve reference identity after the separately requested prerequisite cycle correction.
- missing_evidence: None required for this bounded structural review; installed-host behavior, independent review and native Windows/Linux are not inferred.
- required_next_step: Evaluate QA through qa-gate using current TP/Clean/Code evidence and preserve the deliberate QA/UAT boundary.

## Ownership and root-cause assessment

| Concern | Actual owner and checked behavior | Assessment |
|---|---|---|
| Requirement and product applicability | preview-review.js consumed by definition-sources/readiness; PRD owns descriptor, UX owns only analytical proposal | Fits SDD-001; no prose inference or silent approved-source annotation |
| Static resources and bounds | preview-render.js parses HTML/CSS with explicit pinned production dependencies; common render ceiling consumed by inspector | Fits SDD-003; CR-001 bounds expansion before allocation and CR-002 avoids double resolution |
| Snapshot, document and envelope | preview-snapshot.js extends run-presentation.js and strict envelope owner; writer-derived file/chunk names, exact raw digests | Fits SDD-002; standalone file is checked derived access, ordered chunks are immutable historical source |
| Approval and proof | Existing run-recording validation hooks and artefact-binding-proof; raw/current preview checked before final write | Fits SDD-005; no alternate effect path, source changes invalidate dependent proof |
| Revision history | Existing revision/archive closure includes raw files, immutable chunks and pending presentations; archive-bound byte readers | Fits SDD-005; old proof is never repaired with live bytes |
| Session and stateless read | Existing decision-session/Inspect selectors; bounded chunk assembly and final generation/expiry checks | Fits SDD-004; cancellation reveals no content and does not strand pending state |
| UI and capability | Existing DecisionCard/Entry/bootstrap and central locales; ready messages report rendering only; approval controls outside opaque sandbox | Fits SDD-006; absent capability remains unavailable, no human viewing receipt |
| Packaging | Existing Core projection copies exact locked parser closure and license/runtime resources; isolated final tarball loads actual copies | Fits SDD-003; no runtime import from control-UI development dependencies |
| Cycle prerequisite | Lower-level run text/document, decision-material shape, seal computation, policy and envelope owners; original facades reexport shared values/functions | Root cause repaired; unchanged strict 142-module guard has no cycle exception, 42 moved declarations and 31 identities evidenced |

No new catch-all branch grants readiness or approval. Exact denial of unsupported static syntax is
the approved grammar, not a fallback implementation. Core adds no listener/server; localhost exists
only in browser verification. Presentation resource availability and actual native permission remain
separate from deliberate approval.

## Retained compatibility and access paths

| Path | Reason and target state | Exit/eligibility condition |
|---|---|---|
| Unmarked historical UR / envelope 1–4 | Preserve previously supported semantics, without inventing new historical preview evidence | Permanent versioned compatibility; only existing explicit source adoption/revision activates new required material |
| Exact safe standalone copy / Inspect | Same bounded isolated wrapper when a host actually provides that access; no raw HTML host privilege | Offer only matching validated material via a supported route; otherwise retain explicit unavailability |
| Same-version read retry | Transport/frame availability may fail without a product/source change | Clear failure only after the exact current iframe signals readiness; source/lifetime changes require current-owner recovery, never rebinding |
| Existing public Core facade reexports | Preserve callers while moving pure ownership beneath orchestration to remove the import cycle | Permanent public compatibility, one implementation identity; no duplicated algorithms or planned workaround deletion |

None is a temporary workaround that needs a speculative debt ticket. Historical predicates stay
protected. There is no branch that answers the example product's missing-proof policy.

## Scope, documentation and evidence

Actual changed authoring contracts, templates, UX/UR/PRD guidance and handbook explain retention in
the Run, product-source precedence and one existing PRD decision. The German handbook remains
canonical and English source-reference parity passes the Community checker. Deterministic skill
and adapter observations are classified as fixture evidence; they do not upgrade native observations.

The existing Source-of-Truth Registry already identifies Runtime contracts, source drafting, Core
evaluation, physical package projection and read/UI adapters. The new implementation extends those
owners and the approved SD describes its internal helpers. No current ownership contradiction was
found. The existing Context Graph interaction-authority node remains linked rather than rewriting
unrelated historical evidence or claiming completion of other Runs' open host qualifications.

The five resolved Code Review findings were checked in their actual corrected owners: bounded CSS
expansion, imported-image resolution, retry/readiness guard, visible unanswered question projection,
and abort/expiry validation. Their original reproductions and final regressions remain preserved.
The additional approval matrix demonstrates invalid files/material cannot produce a receipt and the
unchanged valid case still records the existing effect. Protected PRD mutation correctly yields
seal_invalid recovery without state mutation; no resealing bypass is used.

This is an agent structural review, not independent human review, QA approval, installation or release.

## Findings and reconciliation

- normalized_findings: No applicable open, malformed or contradictory implementation-integrity finding remains.
- memory_target: scope_artifact
- memory_reason: The review and owner links are scoped evidence; no personal-memory change requested.
- memory_refs: This report; SD.md; evidence/quality-review/source-evidence-integrity.json
- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-NATIVE-INTERACTION-AUTHORITY; .agdf/control/SOT_REGISTRY.md; SD.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing authority/physical-package ownership remains intact; links and actual owner assessment above reconcile this Run without upgrading historical native qualification.

