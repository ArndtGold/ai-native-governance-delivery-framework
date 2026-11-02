# Clean Implementation Review: Single-Install OpenCode Activation

Decision: pass
Date: 2026-07-17

- primary_solution: One pure durable-control activation helper is consumed by plugin and status; the scaffold writes only the durable activation/configuration files.
- evidence: `create-agdf/lib/installers/opencode-activation.js`, `opencode-plugin.js`, `opencode.js`, `scaffold/plan.js`, approved SD and `CD_TESTS.md`.
- fallbacks_retained: Legacy local `.opencode/` assets are retained only as a documented compatibility path; no duplicate runtime is newly generated.
- workaround_or_shim_risk: low; the legacy projection remains additive and does not decide activation on its own.
- parallel_structure_risk: none; shared global skills and instructions retain their installer owner, durable state retains the control owner, and the helper owns activation classification.
- brownfield_fit: pass; existing installer, scaffold, generated-asset and hook seams are reused.
- missing_evidence: live OpenCode host rendering is not claimed.
- required_next_step: Code Review, then QA gate.
