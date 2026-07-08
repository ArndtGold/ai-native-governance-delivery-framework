# AGDF Context Graph

## Active Context Nodes

### CG-RUN-STATUS-CARD

- situation: AGDF has machine-readable gate and delivery-map outputs, but needs a compact human/agent status projection that includes the next permissible step and the next meaningful quality outlook.
- refs: plugin/meta/agdf-runtime-contract.md; create-agdf/bin/create-agdf.js; plugin/control/templates/AGDF_RUN.md; plugin/control/templates/artefacts/OR.md
- evidence: Existing fields include `next_allowed_action` and `quality_outlook`; the approved UR narrows this run to making the projection explicit and machine-readable.
- exit_criteria: Runtime contract, CLI JSON/text output, templates and smoke tests consistently expose the Run Status Card without creating a second gate model.

## Retired Context Nodes

| Node | Reason | Replacement |
|---|---|---|
