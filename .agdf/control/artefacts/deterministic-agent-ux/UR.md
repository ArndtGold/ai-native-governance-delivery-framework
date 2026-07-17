# UR: Deterministic Agent UX

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted for revision 2 on 2026-07-17
Revision: 2
Date: 2026-07-17
Owner: agent

## 1. Problem

AGDF's intended operating model is agent-native, with durable repository control state as the
source of truth and the CLI as a deterministic validator. The current first-contact experience
does not make that relationship prominent enough: chat skills and repeated
`npx --yes @agdf/cli@latest ...` examples can appear to be parallel user interfaces or competing
authorities, and routine validation can appear network-dependent.

At ready approval gates, AGDF also relies on a long procedural instruction set for the model to
compose the visible Run Status Card, Gate Transition Card and native interaction correctly. Code
already validates an internal presentation snapshot, but the user-visible message can still drift
because the final rendering remains model-composed rather than a directly consumable deterministic
projection.

## 2. Goal

Make AGDF's primary interaction path immediately understandable and reduce model-dependent
presentation drift by:

- exposing one visible mental model: skill/chat is the interaction surface, `.agdf/control/` is the
  durable source of truth, and the CLI is an optional deterministic validator;
- avoiding the impression that a network-resolved `npx ...@latest` call is required for routine
  agent work; and
- providing a canonical, validated, render-ready approval projection that supported agent surfaces
  can consume without reconstructing the complete presentation format from prose rules.

## 3. Scope

This initiative will determine and, after later approvals, deliver the smallest coherent slice that:

1. makes the operating-model boundary visible in first-contact documentation and relevant command
   help or agent guidance;
2. defines when an installed `agdf` command, direct control-state inspection, or an `npx` bootstrap
   fallback is appropriate;
3. extends the existing presentation owner rather than creating a second renderer or gate model;
4. exposes deterministic approval content and structure in a form usable by Codex, Claude Code,
   OpenCode, GitHub Copilot and exact-text fallback paths; and
5. defines deterministic and live-host evidence that distinguishes repository conformance from
   actually visible host rendering.

Brownfield Review must identify the existing owners, reusable seams, generated surfaces and host
capability limits before the delivery path and artefact depth are selected.

## 4. Non-Goals

- adding a new Minimal Mode;
- adding a configurable bias that can select Quick Task contrary to scope or risk evidence;
- changing gate order, approval authority, exact approval values or durable state ownership;
- making the CLI a second primary interaction surface;
- redesigning the complete CLI or installation lifecycle;
- claiming that repository tests alone prove host-visible rendering; or
- implementing any product or runtime change before the required later gates permit it.

## 5. Acceptance Signals

The need is clear enough to proceed when:

1. the three operating roles are stated consistently and prominently on first-contact paths;
2. normal agent work is explicitly possible without a fresh `npx ...@latest` resolution for every
   state check;
3. one canonical presentation owner can produce a complete render-ready approval projection while
   preserving the existing gate evaluator and exact approval validation;
4. the model's required presentation responsibility is materially smaller and testable;
5. machine, generated-surface and negative-drift checks cover the deterministic contract; and
6. Codex, Claude Code, OpenCode and GitHub Copilot consume the same canonical projection and fallback
   semantics, while surface-specific live evidence is treated separately from repository-side
   conformance and only claimed where the host capability is observable.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/gate-transition.md` for gate authority and transitions;
- `plugin/meta/contracts/interaction.md` for approval orientation and host adapters;
- `plugin/meta/contracts/control-scaffold.md` for agent-native and CLI-verifiable ownership;
- `plugin/skills/gate-check/SKILL.md` for the current agent interaction procedure;
- `create-agdf/lib/interaction-presentation.js` for presentation snapshots and validation;
- `create-agdf/lib/control-evaluation/gate-check.js` for gate evaluation and projections;
- `plugin/meta/agdf-interaction-locales.json` for deterministic localized copy;
- `INSTALL.md`, `README.md` and `agdf/README.md` for public first-contact and CLI guidance;
- completed runs `approval-orientation-completeness`, `agdf-human-decision-surface`,
  `agdf-ux-next-round` and `installer-output-parity` for prior decisions and evidence.

## 7. Risks And Unknowns

- Supported hosts, including GitHub Copilot, may not provide a response-interception,
  deterministic-rendering or native-question extension point; exact text must remain a conforming
  transport without weakening shared projection semantics.
- Exposing a new projection could accidentally fork the existing status-card or gate evaluator.
- Public JSON compatibility and generated-surface synchronization may constrain the projection shape.
- Preferring an installed command must not obscure version skew or reproducibility evidence.
- Reducing model instructions must not weaken fail-closed approval behavior or accessibility rules.
- Brownfield Review must determine whether one structured slice is sufficient or whether host-specific
  delivery slices are necessary.

## 8. Next Step

Refresh Brownfield Review for GitHub Copilot's repository instruction, generated-skill and host
capability boundaries, then confirm the proportional delivery path and align the PRD draft.
