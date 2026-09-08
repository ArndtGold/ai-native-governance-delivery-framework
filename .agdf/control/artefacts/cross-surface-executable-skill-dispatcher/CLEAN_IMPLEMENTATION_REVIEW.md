# Clean Implementation Review: Cross-surface Executable Skill Dispatcher

Revision: 15
Date: 2026-09-08


## Host-native Plugin-root Integrity

- decision: pass.
- primary_solution: the existing host command owner now defines root priority once, and the shared
  local-validator resolver applies the same surface rule to both generated runtime entrypoints.
- evidence: installed failure reproduction before the correction, focused tests, full serial smoke,
  exact source/marketplace/cache hook equality, installed Runtime Integrity and corrected installed
  Codex replay with a deliberately stale Claude root.
- fallbacks_retained: one bounded compatibility fallback per Codex or Claude surface. It is used only
  when the native variable is absent; Copilot and OpenCode do not gain that fallback.
- workaround_or_shim_risk: low. The fallback reflects existing cross-host payload compatibility and
  no longer overrides a present native root.
- parallel_structure_risk: none. Host command rendering owns hook syntax; the validator owns runtime
  environment interpretation; Runtime Integrity compares the projection to the command owner.
- brownfield_fit: pass under approved SD2/TP2. No new hook, environment variable, permission,
  installer or MCP lifecycle path was introduced.
- missing_evidence: static Windows command proof is not native Windows execution. The current task
  also cannot reload the newly installed skill profile.
- required_next_step: retain those direct-host obligations in QA.

## QA Candidate And Terminal-response Integrity

- decision: pass.
- primary_solution: the existing gate evaluator remains the sole run-inventory owner. The existing
  dispatcher continuation transports one immutable bounded projection to `qa-gate`; no second
  scanner, run selector or policy owner was added.
- semantic_owner: the existing `agdf_dispatch` function contract owns both whole-response terminal
  transfer and complete QA-candidate use. Skill text is an integrity-checked projection.
- evidence: actual source diff, 23-candidate source and installed replays, exactly 13 normalized QA
  candidates, both previously omitted IDs, exact German terminal replay, complete serial smoke and
  final affected regression suites.
- fallbacks_retained: none for candidate reconstruction or terminal prose. Missing target remains
  terminal; ambiguous run remains a bounded continuation that asks for one canonical run selection.
- workaround_or_shim_risk: low. No host-specific list, prompt parser, filename heuristic, permissive
  fallback or duplicate renderer was introduced.
- parallel_structure_risk: none. Evaluation owns candidates, interaction presentation owns bounded
  labels, the dispatcher owns transport, and `qa-gate` owns final quality judgement.
- brownfield_fit: pass under approved SD2/TP2. Target precedence, gate authority, locale registry,
  binding schema, dispatcher protocol, hooks and permissions remain unchanged.
- missing_evidence: the refreshed installed runtime is proven, but a fresh Codex model turn and the
  wider host/native-OS matrix remain under `CSED-QA-01`.
- required_next_step: retain the loaded-host evidence obligation in QA.


## Semantic Function-owner Integrity

- decision: pass.
- primary_solution: the existing dispatcher contract is the semantic function owner. It exports
  the model-facing schema and renders the CLI grammar and one compact skill projection.
- evidence: direct diff review, semantic contract test, ten exact skill projections, source and
  installed Runtime Integrity, 40 adapter cases, unchanged footprint ceilings and 83/83 replays.
- fallbacks_retained: none for semantic interpretation. If no target-source meaning applies, both
  target fields are omitted and the existing target resolver returns its terminal orientation.
- workaround_or_shim_risk: low. No alias such as `user`, host-specific meaning, prompt parser or
  second description table was introduced.
- parallel_structure_risk: none. `TASK_TARGET_SOURCES` still owns the value set; the dispatcher
  contract owns what those values mean at the function boundary; skills contain checked projections.
- brownfield_fit: pass under approved SD2/TP2. Binding schema 2, dispatcher protocol 1, target
  precedence, locale ownership, hooks and permissions are unchanged.
- missing_evidence: fresh installed-host model behavior remains under CSED-QA-01.
- required_next_step: retain the existing host evidence obligation in QA.


## Typed Failure Integrity

- decision: pass.
- primary_solution: one target-source validator serves target-check and skill-dispatch. The existing
  dispatcher service marks the failing stage with stable codes, and the existing interaction locale
  owner renders all visible actions.
- evidence: direct source diff, exact invalid CLI replays, failure-injection tests, 40 adapter cases,
  affected package and Runtime Integrity suites, 83/83 reviewed deterministic replays and source smoke.
- fallbacks_retained: one bounded locale-registry repair sentence remains only for the state in which
  the authoritative registry cannot render the typed recovery. Its exit condition is repair of the
  installed registry followed by one retry. It neither guesses the failed stage nor grants authority.
- workaround_or_shim_risk: low. Invalid `user` remains rejected. There is no alias, exception-message
  parser, host-specific branch or second renderer.
- parallel_structure_risk: none. Runtime failure codes classify the existing sequence; they do not
  create another evaluator, target resolver or locale store.
- brownfield_fit: pass under approved SD2/TP2 and Brownfield Analysis Revision 5.
- missing_evidence: fresh installed-host behavior remains separate from repository integrity.
- required_next_step: QA retains the existing external evidence obligation.


## Target-source Recovery Integrity

- decision: pass.
- primary_solution: the existing target resolver exports its canonical values; contract validation,
  public CLI grammar and binding projection consume that owner. The existing interaction renderer
  and locale registry own the visible recovery.
- evidence: actual eight-file source diff, exact failing CLI replay, focused tests, 40 adapter cases,
  complete serial regression and both Runtime Integrity modes.
- fallbacks_retained: one bounded English registry-repair sentence is used only when the canonical
  locale registry cannot render a non-empty terminal recovery. Its exit condition is a valid
  installed registry followed by one retry. It contains no target-source values and creates no
  competing locale or target owner.
- workaround_or_shim_risk: low. The unsupported alias `user` remains invalid instead of becoming a
  permissive compatibility shim.
- parallel_structure_risk: none. The prior three independent value literals are replaced by one
  exported list and derived Set/grammar/diagnostic projections.
- brownfield_fit: pass under approved SD2/TP2 and Brownfield Analysis Revision 5.
- missing_evidence: fresh installed-host behavior remains separate from repository integrity.
- required_next_step: retain the fresh-host evidence obligation in QA.


## Codex Follow-up Integrity

- decision: pass.
- primary_solution: missing reviewed text belongs in the existing locale registry; native host
  precedence belongs in the existing SessionStart generator. No duplicate semantic owner exists.
- evidence: direct diff review and focused/end-to-end regression tests.
- fallbacks_retained: existing unknown-translation rejection and existing surface defaults only.
  No unconditional English fallback or alternate hook path was added.
- brownfield_fit: pass under Revision 5 and the approved TP.
- missing_evidence: source-generated output remains distinct from a corrected installed session.
- required_next_step: retain the fresh-host evidence obligation in QA.

## Review

- decision: pass
- primary_solution: one shared binding/probe owner fixes the incomplete executable/environment tuple
  at both producers. CLI argument names come from command-registry. The existing wrapper carries
  the child environment, while target, gates, approval, QA and presentation stay with their owners.
- evidence: actual source diff from 4d38db394d05bf2afb5280dc3af92dfee042a2bb, 40 adapter scenarios,
  negative runtime/identity tests, code/provenance regressions and CSED-RUNTIME-01.
- fallbacks_retained: none added. Failed capability emits unavailable, not a second launch attempt.
  Existing direct-CLI and instruction-only boundaries are retained.
- workaround_or_shim_risk: Electron environment is an explicit verified launch property, not a
  model-created shell repair. No PATH search, global environment write, runtime replacement or
  persistent cache exists. Unsupported bootstrap module configuration is rejected before probing.
- parallel_structure_risk: none introduced. A draft production argv serializer with no real host
  consumer was removed; it exists only as a clearly labelled host-emulation test helper.
  Footprint checks validate envelope/budget structure, not a private per-host argument inventory.
- brownfield_fit: conforms to approved SD2/TP2 and Brownfield Analysis Revision 4.
- missing_evidence: fresh model/host behavior and unobserved native platforms, tracked by
  CSED-TP-EVIDENCE-01. This code-structure review is not that evidence and is not independent review.
- required_next_step: carry the open evidence obligation into QA.

The existing dispatch-time resolver remains the version/digest/provenance authority. The new
binding probe checks executable capability and entrypoint presence, not arbitrary wrapper content
or a new provenance scheme. No extra architectural owner or approval is implied.
