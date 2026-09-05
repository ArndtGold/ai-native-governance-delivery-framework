# Request Activation Loaded-host Evidence

Revision: 1
Date: 2026-09-04
Status: unavailable

## Evidence Boundary

No exact staged AGDF profile from this run has been installed, read back and loaded in a fresh
Codex, Claude Code, GitHub Copilot or OpenCode session. The accompanying matrix therefore records
every loaded-host result as `unavailable`. It does not convert source inspection, deterministic
tests, generated output, a fixture installation or evidence from another run into host evidence.

The current source binding identifies Request Activation with policy version 1 and canonical guard
fingerprint `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`.
That identity is source evidence only until an exact generated profile is installed and read back.

## Current Host Matrix

| Host | Exact install readback | Fresh loaded session | Trusted invocation signal | Callback trace | Result |
|---|---|---|---|---|---|
| Codex | unavailable | unavailable | unavailable | unavailable | no host claim |
| Claude Code | unavailable | unavailable | unavailable | unavailable | no host claim |
| GitHub Copilot | unavailable | unavailable | unavailable | unavailable | no host claim |
| OpenCode | unavailable | unavailable | unavailable | unavailable | unavailable; user-versus-model skill origin and subagent-hook propagation also unproven |

## Required Completion Chain

For each host independently:

1. Complete deterministic and package evidence for the same source fingerprint.
2. Obtain the host's existing lifecycle consent, record the exact staged profile version, root,
   digest and identity, and install that profile.
3. Read back the installed version, root, digest and identity and prove that version, digest and
   identity exactly match the staged profile. A fixture or stage path does not count.
4. Restart the host, prove that the loaded profile version, digest and identity exactly match the
   installed readback, and record host/model/version, SessionStart consent and the complete
   post-SessionStart callback baseline.
5. Execute the matrix families in repositoryless, missing-control and one-active-run contexts.
6. Record visible transcript, invocation provenance, selection origin, callback delta when actually
   observable, filesystem/control delta and covered `RAB-*` criteria.

A missing callback facility remains `unavailable`; it is never recorded as zero or a pass. OpenCode
also requires separate probes for user-versus-model skill origin, subagent-hook propagation,
system-transform reapplication after compaction and availability of the current dispatcher binding
after compaction. The two compaction probes must use the same installed version and digest. No host
may inherit a result from another surface.
