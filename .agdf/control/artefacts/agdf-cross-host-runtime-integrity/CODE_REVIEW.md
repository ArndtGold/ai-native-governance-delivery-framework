# Code Review: Cross-Host Plugin Runtime Integrity

Status: pass  
Decision: pass  
Date: 2026-08-25

## Code Review

- decision: pass
- findings: no open correctness, security, compatibility or maintainability finding remains in the reviewed final diff.
- missing_evidence: none required for QA.
- risks: provenance proves coherence of AGDF-owned content, not protection against an actor able to replace the complete installation and every ownership marker. Claude's model response remains unavailable until that separate CLI is authenticated; plugin loading itself is directly observed.
- required_next_step: run QA Gate with all resolved findings and direct host evidence.

## Resolved Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CRI-CR-01 | implementation_gap | CD+Tests | resolved | Wrong Claude manifest version is rejected by staging, generated-repository inspection and resolver tests | none |
| CRI-CR-02 | implementation_gap | CD+Tests | resolved | A real prior 0.13.5 marketplace without the new profile block now migrates only after exact legacy marker and digest validation; focused regression and real install pass | none |
| CRI-CR-03 | implementation_gap | CD+Tests | resolved | OpenCode local npm installation uses the validated absolute tarball path, including a space-containing regression fixture; real 0.13.5 install and fresh session pass | none |
| CRI-CR-04 | implementation_gap | CD+Tests | resolved | Local Codex prompts now enforce at most three entries and 128 characters; final fresh Codex session emits no AGDF manifest warning | none |
| CRI-CR-05 | implementation_gap | CD+Tests | resolved | Migration rejects a profile-valid installation with both provenance markers absent; arbitrary and tampered legacy markers also fail | none |
