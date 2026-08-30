# Clean Implementation Review: Plugin-Only AGDF Integration for GitHub Copilot

- decision: pass
- revision: 2
- date: 2026-08-30
- primary_solution: Make `copilot` delegate to the existing plugin lifecycle, remove the obsolete repository projection at its registry, scaffold and generator owners, and retain the existing plugin manifest, prefixed skills, hook, runtime, consent and Marketplace owners.
- evidence: CLI registry and handler tests; package absence and plugin-presence assertions; byte-identical package build; dedicated repository-retention test; full smoke; direct local install and Copilot list evidence.
- fallbacks_retained: The pre-existing pinned official `@github/copilot@1.0.80` fallback remains when `copilot` is absent from `PATH`. It uses the same public Copilot commands and does not create a second lifecycle owner.
- workaround_or_shim_risk: low; no compatibility alias, renamed repository target or user-repository cleanup path was added.
- parallel_structure_risk: none observed; the removed `.github/skills` projection no longer duplicates the plugin skill surface.
- brownfield_fit: pass; Codex, Claude Code, OpenCode, generic control and local contributor installation remain in their existing owners.
- missing_evidence: Fresh post-update Copilot app loading remains a host observation, not an implementation-integrity gap.
- required_next_step: run Code Review and then prepare QA evidence.
