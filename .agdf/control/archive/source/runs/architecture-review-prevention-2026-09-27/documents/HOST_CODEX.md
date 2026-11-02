# Codex host observation

Date: 2026-09-28
Status: `instruction_loaded`; full Brownfield route acceptance open
Host: Codex CLI `0.157.1`, fresh ephemeral read-only session after final installation at 07:59 UTC
Installed AGDF: `0.14.5+codex.local-7fc37bf6022e`
Installed source: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-7fc37bf6022e/skills/brownfield-analysis/SKILL.md`

## Direct installed-skill check

Prompt: Read the installed AGDF Brownfield skill and manifest in a fresh session, report the
installed version, and state whether retained debt without an accountable owner or exit
condition can receive Brownfield Review `pass`; do not use repository source or mutate.

Observed: SessionStart hook completed. The host read the installed skill and plugin manifest,
reported the exact installed version and the new rule: an incomplete retained-debt finding is
at least `revise`, or `block` when it prevents safe routing. A prior fresh session on the same
day also read the owner-boundary and not-applicable instructions from the then-current install.
These were installed-skill reads, not a live governed Brownfield run. No run artefact was created.
The Codex installation status is healthy; automatic checks remain `decision_required` with
`host_permission_unverified`, so hook completion is not claimed as full runtime-check verification.

## Fresh model scenario observations

The existing live skill-evaluation runner supplied the canonical skill source directly to fresh
Codex CLI calls. These are model-behavior observations, not installed-plugin invocation proof:

- Seven current cases under `evals/observations/live/codex/brownfield-architecture-*.json` have source fingerprint `99ab401f2f755b34fb7a3e5f5a65775899f901e611092e4d8a4f9dbd0afbcf77` and grade `pass`: relevant ownership, complete and incomplete retained trade-offs, missing decisive evidence, local not-applicable, and focused diagram.
- The local case uses a concrete `src/messages.js`, owner record and proposed diff; it records `architecture-not-applicable` without a diagram. The incomplete debt case blocks acceptance; the fully evidenced case accepts only the same-finding trade-off with a named owner and dated removal.
- A raw earlier Trade-off evaluation at `TRADEOFF_LIVE_ATTEMPT.json` graded `block` because the model used `pass` to grade its own answer while saying the fixture required `revise`. The live evaluator now asks for the fixture's actual review outcome. Keep this failed attempt as counterevidence; one later passing sample does not prove deterministic behavior.

Limitation: No valid post-UR run was executed with the installed plugin. This record does not
establish an actual persisted Brownfield Review or full Codex acceptance for AC-ARCH-06.
