# Clean Implementation Review: Copilot Task-Target Binding

Status: done
Decision: pass
Revision: 11
Date: 2026-09-05

## Clean Implementation Review

- decision: pass
- primary_solution: the same resolver's native no-target input is used directly; the skill no longer fabricates `current_repository` and now binds the user's German conversation to literal `--language de` before invoking the canonical renderer
- evidence: canonical/generated/installed gate-check skill, German context-only validator result, German adversarial GeneralChat eval, Runtime Integrity, 70/70 evals and final complete smoke
- fallbacks_retained: Git absence, invalid hook input and non-repository cwd fail closed to `repo_less`; no path-name heuristic, parent scan, neighbor search or cwd promotion is retained
- workaround_or_shim_risk: low; no Copilot-path detector, runtime locale guesser or second target state was added; the instruction consumes existing user-language evidence
- parallel_structure_risk: none; the renderer remains presentation-only, the skill remains instruction-only and no persistent target store or second governance owner was added
- brownfield_fit: pass against Brownfield Analysis Revision 4; existing CLI composition, runtime generation, locale and profile owners are reused
- missing_evidence: the locale-corrected instruction has not yet been observed after a fourth Copilot restart; this is an evidence obligation, not a remaining clean-implementation defect
- required_next_step: route the fourth fresh-session observation through Code Review Revision 10 into QA

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
