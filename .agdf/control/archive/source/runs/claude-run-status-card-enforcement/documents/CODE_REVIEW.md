# Code Review: Enforce Run Status Card in Claude Code

- decision: pass
- findings: none
- reviewed_scope: `plugin/skills/gate-check/SKILL.md`; `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/hooks/session-start.sh`; `plugin/scripts/check-runtime-integrity.mjs`; related control artefacts and backlog pointer.
- evidence: The gate-check output now names every mandatory compact human-facing card field and conditionally requires the two post-approval fields; the hook adds only a canonical source pointer; Claude's own validator accepts the corrected plugin; runtime integrity checks the new pointer, labels and the concrete unsafe YAML pattern; the full create-agdf smoke chain passed.
- missing_evidence: No authenticated Claude model response was available; `claude --plugin-dir ... -p` stops at login before model execution.
- risks: Claude model compliance cannot be proven solely from structural validation, but omission can no longer be attributed to an incomplete immediate skill output contract or invalid plugin metadata.
- required_next_step: Produce the relevant-run closeout without claiming authenticated end-to-end Claude execution.
