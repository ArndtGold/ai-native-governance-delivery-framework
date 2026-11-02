# OpenCode host observation

Date: 2026-09-28
Status: `instruction_loaded`; full Brownfield route acceptance open
Host: OpenCode CLI `1.18.3`, fresh session after final installation at 07:59 UTC
Installed AGDF: package `create-agdf` version `0.14.5`; `opencode-status` reports healthy global installation and 10 native skills.
Loaded skill: `agdf-global-brownfield-analysis` from `/Users/arndtgold/.config/opencode/skills/agdf-global-brownfield-analysis`.

Prompt: use the native skill tool to load the installed Brownfield skill without bash; report
whether retained debt missing its accountable owner or exit condition may receive Brownfield
Review `pass`; do not modify files.

Observed: The native `skill` tool loaded the installed skill from the path above. The host
reported that incomplete debt is at least `revise`, or `block` when safe routing is prevented;
`pass` is forbidden while acceptance is open. A prior fresh session also read the owner-boundary
and not-applicable instructions. The read-only requests did not produce a Brownfield artefact.
An earlier session attempted bash reads that OpenCode auto-rejected; native skill load succeeded
without bash. The skill has no separate version field; package status supplies the version.

Limitation: No relevant or low-impact governed Brownfield case was executed through the
installed plugin, so AC-ARCH-06 host acceptance remains open.
