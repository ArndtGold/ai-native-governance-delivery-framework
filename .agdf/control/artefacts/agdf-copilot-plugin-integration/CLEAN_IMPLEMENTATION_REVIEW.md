# Clean Implementation Review: Copilot-Specific AGDF Payload

- decision: pass
- revision: 3
- date: 2026-08-30
- primary_solution: Generate one Copilot-only artifact from the canonical plugin sources, bind every payload file to a semantic inventory, and stage it under an independent atomic Marketplace owner.
- evidence: One editable source under `plugin/`; one generated Copilot profile; exact inventory baseline; profile-aware validator and provenance; independent marketplace transaction; complete smoke and direct installed-root evidence.
- fallbacks_retained: The pinned official Copilot CLI fallback remains when `copilot` is absent from `PATH`. A legacy shared-marketplace registration is migrated only when its AGDF ownership marker, version, manifests and plugin digest all match. Its exit condition is the successful registration of `marketplaces/agdf-copilot`; failed migration restores the prior registration and plugin.
- workaround_or_shim_risk: low; compatibility logic is limited to one evidenced predecessor state and has deterministic success and rollback tests.
- parallel_structure_risk: none; the Copilot artifact is generated, not editable, and the semantic inventory rejects an additional skill tree or host surface.
- brownfield_fit: pass; existing atomic swap, provenance, runtime and installer owners are extended without replacing the shared Codex/Claude root.
- missing_evidence: Fresh loaded-session behavior remains a host/UAT observation and is not treated as implementation-integrity evidence.
- required_next_step: run Code Review and then QA Gate.
