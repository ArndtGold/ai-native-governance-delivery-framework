# Clean Implementation Review: Cross-Host Plugin Runtime Integrity

Status: pass  
Decision: pass  
Date: 2026-08-25

## Clean Implementation Review

- decision: pass
- primary_solution: remove runtime-free source marketplaces and extend the existing generated-runtime, installer and local-validator owners with one shared distribution-profile and provenance contract.
- evidence: `plugin-provenance.js` is the sole profile/digest/provenance helper; the final full smoke suite passes; direct Codex, Claude Code and OpenCode installations and fresh sessions consume the expected final surfaces.
- fallbacks_retained: only an exact digest-matched `.agdf-local-install.json` marker may migrate during an explicit owned reinstall; configured absolute validator fallback remains the pre-existing explicit path.
- workaround_or_shim_risk: low. The real old 0.13.5 installation migrates through the canonical installer, while missing, arbitrary and tampered provenance fail closed. The OpenCode absolute tarball argument fixes npm path semantics at the existing subprocess boundary.
- parallel_structure_risk: none. No per-skill runtime, host-specific validator, second marketplace owner, second installer or second status engine was introduced.
- brownfield_fit: pass. Existing generation, durable marketplace, validator, lifecycle, SessionStart, Runtime Integrity and package owners were extended in place.
- missing_evidence: none required for QA.
- required_next_step: consume this pass result in QA Gate.
