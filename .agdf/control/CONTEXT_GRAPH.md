# AGDF Context Graph

## Active Context Nodes

### CG-RUN-STATUS-CARD

- situation: AGDF has machine-readable gate and delivery-map outputs, but needs a compact human/agent status projection that includes the next permissible step and the next meaningful quality outlook.
- refs: plugin/meta/agdf-runtime-contract.md; create-agdf/bin/create-agdf.js; plugin/control/templates/AGDF_RUN.md; plugin/control/templates/artefacts/OR.md
- evidence: Existing fields include `next_allowed_action` and `quality_outlook`; the approved UR narrows this run to making the projection explicit and machine-readable.
- exit_criteria: Runtime contract, CLI JSON/text output, templates and smoke tests consistently expose the Run Status Card without creating a second gate model.

### CG-DELIVERY-PATH-SEARCH

- situation: High-impact AGDF delivery decisions can have several plausible next paths, so agents need a read-only way to compare delivery paths before implementation without turning search output into gate authority.
- refs: plugin/meta/agdf-runtime-contract.md; plugin/meta/agdf-plugin.definition.json; plugin/meta/agdf-agent-router.md; plugin/skills/delivery-path-search/SKILL.md; create-agdf/lib/delivery-path-search/; create-agdf/bin/create-agdf.js; .agdf/control/artefacts/agdf-delivery-path-search/OR.md
- evidence: UAT-approved `agdf-delivery-path-search` delivered a bounded best-first advisory search, deterministic gate-legality rejection, redacted persistence, a Codex read-only executable reference evaluator and explicit cross-surface capability boundaries.
- decision: Delivery Path Search is advisory evidence only. Canonical AGDF gates remain the sole execution authority, and every result must route back to gate-check before implementation.
- invariants: first release is bounded best-first search, not MCTS; Codex is the executable reference evaluator; Claude Code, GitHub Copilot and OpenCode are contract-ready until a conforming native or external evaluator is supplied; unsupported evaluator transports fail explicitly rather than being simulated.
- risks: model scores are judgements, not measurements; evaluator cost units are rubric units rather than provider-currency measurements; instruction-only surfaces cannot technically prove write prevention; AI-native candidate generation is intentionally deferred to a separate UR.
- exit_criteria: Runtime contract, CLI behavior, canonical skill routing, Pages/docs and package smoke tests consistently preserve the advisory-only gate boundary, explicit evaluator support matrix and non-MCTS method claim.

## Retired Context Nodes

| Node | Reason | Replacement |
|---|---|---|
