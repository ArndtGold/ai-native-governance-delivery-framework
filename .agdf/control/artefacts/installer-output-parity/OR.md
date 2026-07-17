# Orchestration Report: Coherent AGDF Installation Lifecycle

Date: 2026-07-17
Gate: OR
Report mode: OR-full

## OR

- gate: OR; all user approvals through UAT are recorded.
- artefact: `.agdf/control/artefacts/installer-output-parity/OR.md`
- status: pass
- delivered: English shared lifecycle cards; additive installation, activation and repository-delivery
  projections; canonical surface labels; quiet default with `--verbose` host diagnostics; shared
  Codex/Claude/OpenCode global and Codex/OpenCode/Copilot repository presentation; updated package
  documentation and synchronized assets.
- intentionally_not_delivered: no real global host plugin mutation, real repository activation,
  host restart/reload proof, or native approval-button pass.
- TP coverage: 8/8 revision-4 MSC tasks fully done in `TP_REVIEW.md`.
- Brownfield fit: pass; existing lifecycle, CLI, installer and scaffold owners were extended in
  place.
- solution integrity: pass; no second renderer, locale registry, surface registry or delivery
  evaluator was introduced.
- evidence: focused lifecycle and CLI tests, create-agdf aggregate smoke, public bootstrap smoke,
  runtime integrity, package smoke and Doctor all pass.
- missing_evidence: live host activation and restart behavior remain intentionally unverified; exact
  `Approval: UAT` accepted the delivered behavior within the disclosed non-mutating boundary and does
  not convert that limitation into host proof.
- risks: host command wording may change; it is diagnostic-only. Exact textual approval remains the
  portable authority path while native approval controls are unavailable.
- retained_fallbacks: exact textual approval for unavailable native controls; exit criterion is a
  host that can transport canonical values deliberately without decorated-label ambiguity.
- documentation_impact: `create-agdf/README.md` documents fixed English lifecycle cards and
  `--verbose` while project chat/artefact language remains independent.
- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- required_next_step: no further delivery step; retain the disclosed host-evidence limitation in any
  later handoff, and perform separate live-host verification only if explicitly requested.
- quality_outlook: preserve the truthful distinction between verified installation, pending host
  activation and repository delivery authority.

## CI Regression Follow-up

- The aggregate source smoke retained the former localized `AGDF version:` assertion and therefore
  failed after the approved English card change. Its Codex, Claude and OpenCode assertions now use
  the stable `Version:` field and also require the separate `Installation:` and `Verification:`
  health fields where applicable.
- Verification: `node create-agdf/scripts/smoke-test.js`,
  `npm --prefix create-agdf run smoke-test` and `npm --prefix agdf run smoke-test` pass.
