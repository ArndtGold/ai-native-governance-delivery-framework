# Ownership review

Date: 2026-10-03
Decision: pass for structural ownership

| Concern | Canonical owner | Derived consumers |
|---|---|---|
| Routine visibility / protected events | plugins/agdf/meta/contracts/interaction.md | quality contract and gate-check skill reference it |
| Relationship triples / applicability | Core delivery-relationships.js | delivery-map, receipt validation and recording; pure registry accepts supplied policy facts |
| Permission / gate advancement | Existing gate-policy and gate-check | dispatcher snapshot; no new gate or approval outcome |
| Strict mapping evidence | Core artefact-bindings.js and artefact-binding-proof.js | existing run-step recording and correction orchestration |
| Atomic revision / approvals / recovery | Existing run-state-writer, locks, seal and run-step-transaction | appended binding protected; existing journal handles recording |
| One correction attempt before output | Existing skill-dispatch service calling Core run-relationship-correction.js | same service composition for CLI and MCP |
| Operational cards / localization | Existing interaction-presentation and canonical locale registry | generated projections through existing sync |

The registry is dependency-free with respect to the policy/parser/seal/writer graph; package/cycle checks pass across 78 modules. No persistent last-card cache, second interaction policy, duplicated gate registry, new transport endpoint or approval decision owner is introduced. Exact copied proof is an explicit local cooperative attestation; it is never presented as human approval, cryptographic authorization or semantic source derivation.

Recording uses both existing locks and the existing transaction journal even when the shared backlog is already unchanged. Correction writes only the selected Run with its current revision, exact seal and proof rechecks; a confirmation failure identifies the committed revision and stops dispatch. Current protected approvals and approved artefact hashes remain equal. Existing valid legacy chain rows remain operative without invented receipt migration.

Documentation / Context Graph impact is link_only. References: .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority and .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority. These existing owners cover this extension; the reports link them without creating a competing node. Reconciliation: resolved; required_action: link; gate_effect: none. Run-specific evidence stays in this scope artefact directory, not global memory.

The pre-existing hook-file deletions are an unrelated installation-repair baseline delta. Candidate generation is local build output; the user's installed plugin, config and registration remain unchanged.
