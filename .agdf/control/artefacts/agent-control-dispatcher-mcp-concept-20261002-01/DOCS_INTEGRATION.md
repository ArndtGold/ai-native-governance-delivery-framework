# Documentation Integration

Date: 2026-10-02
Run: agent-control-dispatcher-mcp-concept-20261002-01
Authority: The user explicitly accepted the proposed docs/architecture/agent-control-concept.md location and architecture-index link with “leg los” after asking whether the concept was part of docs.

## Change And Scope

The complete canonical concept now resides at `docs/architecture/agent-control-concept.md`. The architecture README links it and identifies it as a proposed architecture, not installed controls. The run's CONCEPT.md is a short relative-link reference, not a duplicate document. Current concept references in run evidence resolve through that pointer.

This is a same-outcome documentation-location refinement expressly requested by the user. It extends the previously planned output paths to the canonical docs file and architecture index, without changing product acceptance, technical design decisions, gate semantics, runtime implementation scope or other runs. Approved UR/PRD/SD/TP remain byte-for-byte unchanged; no approval transfers. The pending QA presentation is refreshed for the new exact state/report.

## Verification And Reviews

- The complete 17-check document/source suite passes, including local link resolution from the canonical concept, architecture README and run reference; source existence, criterion/decision/scenario coverage, approved-source hashes and bounded changed paths remain valid.
- Single canonical content is checked: the run reference is under 1000 characters and contains no copy of the full concept sections.
- Reversing only the added location metadata and adjusted links reproduces the original concept SHA-256 `0ca4f0b21385ba408afc90cb85592aadd1759291bd6ea863fa7285f07c0b0d70`. This verifies unchanged substantive content.
- Current canonical concept SHA-256: `0a0dfd1b444023d19209c769e68a1aacf449e035391e0cdca4525c593ac35349`.
- Reviewed the actual docs README addition, canonical concept, run-reference replacement and updated check/report bindings. No runtime or unrelated run change.
- Plan fulfilment remains complete with the explicitly authorized location refinement. Structural integrity passes: one content owner, no maintained mirror. Document/change review passes; executable-code review remains not applicable.
- QA re-evaluation: pass for the same concept deliverable after location/link checks and refreshed digest. Producer is the same authoring agent; no independent assurance claim.

## Next Step

Review the canonical concept in docs and the refreshed QA report. New deliberate `Approval: QA` is still required for the current report/revision; the prior prepared presentation is no longer current.
