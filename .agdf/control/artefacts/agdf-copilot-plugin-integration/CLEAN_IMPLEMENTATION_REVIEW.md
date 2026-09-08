# Clean Implementation Review: Copilot Task-Target Binding

Status: done
Decision: pass
Revision: 14
Date: 2026-09-07

## Clean Implementation Review

- decision: pass
- primary_solution: the model-facing `agdf_dispatch` function description owns current-conversation language selection; the existing locale resolver normalizes supported regional variants and selects the complete English pack for unsupported languages; the dispatcher carries that resolved value through target rendering, gate evaluation and skill continuation
- evidence: canonical/generated/installed `qa-gate` skill and runtime, missing/unsupported/regional language matrix, German context-only installed validator result, strengthened German adversarial `qa-gate` eval, projection-integrity test, English and German selected-run checks with empty presentation diagnostics, Runtime Integrity, 83/83 evals and one uninterrupted complete aggregate
- fallbacks_retained: an unsupported language uses the complete English locale pack so the host remains productive; this bounded fallback exits for a language only after its complete locale pack is added and registry validation passes. Git absence, invalid hook input and non-repository cwd fail closed to `repo_less`; no path-name heuristic, parent scan, neighbor search or cwd promotion is retained
- workaround_or_shim_risk: low; no Copilot-path detector, runtime locale guesser, project-target guess or second target state was added; the function parameter consumes existing conversation evidence
- parallel_structure_risk: none; one function description owns language semantics, the existing locale registry owns translatable operational text, the renderer remains presentation-only and no second locale registry or host-specific presentation owner was added
- brownfield_fit: pass against Brownfield Analysis Revision 4; existing CLI composition, runtime generation, locale and profile owners are reused
- missing_evidence: the corrected common instruction has not yet been observed after a full Copilot restart; this is an evidence obligation, not a remaining clean-implementation defect
- required_next_step: route this pass result and Code Review Revision 14 into QA while retaining the fresh-session Copilot evidence obligation

No normalized implementation finding remains open.

## 2026-09-05 Installer correction review

- decision: pass for the installer architecture
- primary_solution: one managed Copilot marketplace at marketplaces/agdf-copilot uses Copilot's native Git source contract, declarative registration and native plugin installation; Git metadata belongs to the existing atomic staging owner and stays outside the plugin payload
- evidence: both actual CLI versions pass first install, repeat, same-version content update and rollback; current desktop SDK reports ten global and ten fresh-session skills
- fallbacks_retained: existing pinned official CLI bootstrap only when the normal launcher is unavailable; it executes the same installation and verification path; exit condition is a functional normal CLI
- workaround_or_shim_risk: the temporary recovery snapshot is not part of the product and is being replaced by the canonical registration; no direct-install fallback, host-cache patch, duplicate skill projection or recovery-path allowlist was added
- parallel_structure_risk: none introduced; the existing generated profile, installation provenance, marketplace transaction and settings writer retain ownership
- brownfield_fit: pass against the 2026-09-05 analysis; this corrects CPI3-T06/T07 discovery without changing plugin identity, approved governance behavior or other hosts
- missing_evidence: visual desktop discovery after restart remains a host observation; fixing the host application's directory-source implementation itself is outside this repository
- required_next_step: retain the desktop evidence boundary in QA
