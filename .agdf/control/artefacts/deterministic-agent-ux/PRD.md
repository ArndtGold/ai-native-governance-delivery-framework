# PRD: Deterministic Agent UX

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted for revision 3 on 2026-07-17
Revision: 3
Based on: approved `UR: Deterministic Agent UX` revision 2 and refreshed Brownfield Review revision 2
Date: 2026-07-17
Owner: agent

## 1. Product Scope

Deliver one coherent interaction model for AGDF's normal user journey and one deterministic source
for ready-gate presentation.

### 1.1 Visible operating model

The first-contact experience must state, before a long command catalog, that:

1. **Skill/chat is the normal interaction surface.** The user asks the coding agent for the next AGDF
   action and receives compact decisions and approval interactions there.
2. **`.agdf/control/` is the durable source of truth.** Approved artefacts and selected run state own
   scope, approvals, evidence and next permissible actions.
3. **The CLI is a deterministic validator and automation interface.** It supports setup, diagnostics,
   CI and audit evidence without becoming a second gate system or a required ritual for normal work.

Public command guidance must distinguish:

- bootstrap, installation and explicit version refresh, where a registry-resolved
  `npx --yes @agdf/cli@latest ...` command is appropriate;
- repeated local use, where an already installed `agdf ...` command is preferred; and
- agent-native work, where direct inspection of live control state is primary and a CLI check is used
  only when deterministic proof, ambiguity resolution or automation is useful.

### 1.2 Deterministic ready-gate presentation

The existing canonical gate evaluation and interaction-presentation owner must produce one additive,
versioned and validated render-ready Approval Orientation Envelope for every ready user gate.

The projection must contain:

- the complete localized approval-time Run Status Card;
- the complete localized Gate Transition Card;
- their fixed ordering and accessible neutral decision heading;
- resolved artefact references;
- a human-readable required decision, the exact canonical approval value and ordered non-authorizing
  outcomes;
- selected run, current revision identity and presentation locale; and
- a validation result that fails closed when the projection is incomplete or inconsistent.

The payload must be usable without asking the model to reconstruct headings, field order, prose,
locale mappings or Markdown restrictions from the current procedural catalog. SD will choose the
smallest representation and transport, but it must preserve one canonical renderer and must not
require a fresh npm-registry resolution during normal agent work.

### 1.3 Supported surfaces

Codex, Claude Code, OpenCode, GitHub Copilot and exact-text fallback guidance must consume the same
semantic and render-ready projection. Surface adapters may control only transport and host invocation.
They may not select a run, decide a gate, rewrite approval authority or create a second renderer.

GitHub Copilot is a full target surface through its generated repository instructions, prefixed
repository skills, runtime contract and locale registry. Under the currently evidenced capability
boundary it uses the canonical rendered envelope with exact-text approval transport. This inclusion
does not claim a Copilot-native executable question adapter; such an adapter may be used only after
future explicit capability evidence and canonical interaction-definition support.

## 2. Acceptance Criteria

1. `README.md`, the guided first-contact portion of `INSTALL.md`, `agdf/README.md` and primary CLI
   help present the same three-role operating model before or alongside routine command guidance.
2. Bootstrap/install examples remain reproducible, while repeated status and gate examples visibly
   prefer `agdf ...` after installation and explain when direct agent inspection needs no CLI call.
3. A ready `UR`, `PRD`, `SD`, `TP`, `QA` or `UAT` evaluation produces one versioned render-ready
   envelope from the existing presentation owner.
4. The envelope deterministically resolves one locale, a neutral decision heading, a five-field compact
   status card, separate transition card, exact approval value, option order, artefact references and
   revision identity. The five status fields are selected run, readiness, current gate, localized
   human-readable required decision and a neutral instruction to choose approve, request revision or
   decline. Quality outlook is not part of this approval-time card.
5. Across the two cards, the exact approval value appears exactly once in the Gate Transition Card.
   A native prompt or exact-text request may repeat it only as the required input. The decision heading
   and next-action instruction must not recommend approval or make revision and decline less clear.
6. Invalid sequence, missing block, generic or approval-biased heading, wrong field set, duplicated or
   decorated approval value, mixed/incomplete locale, stale revision or inconsistent run/gate identity
   fails closed before a native attempt. After fresh evaluation, exact text is requested only when the
   gate remains ready and the canonical approval value was validated independently; otherwise the
   current non-ready reason is reported and no decision is requested.
7. Existing gate authority, exact approval persistence, same-run/same-gate revalidation and
   `status_card` semantics remain unchanged.
8. Any machine-readable extension is additive and versioned; existing consumers and JSON fields keep
   their current meaning.
9. Generated Codex, Claude Code, OpenCode and Copilot surfaces remain synchronized from canonical
   owners and contain no independently maintained renderer or gate table.
10. Copilot's generated `AGENTS.md`, instructions, `agdf-gate-check` skill, runtime contract and locale
   registry carry the same render-ready projection and exact-text fallback semantics without claiming
   a native interaction adapter.
11. Repository tests prove deterministic projection and drift rejection. Live Codex and Claude Code
    observations, plus any callable OpenCode or Copilot observation, separately report what was
    actually visible and never upgrade repository conformance into host-rendering proof.
12. The normal-path guidance does not require a network-resolved `npx ...@latest` invocation for every
    state check or approval interaction.

## 3. Non-Goals

- changing user gates, internal steps, approval syntax or durable authority;
- adding Minimal Mode or a repository bias that overrides evidence-based mode selection;
- removing `npx`, `npm create`, compatibility commands or supported installation paths;
- replacing the existing CLI, status card, gate evaluator or locale registry;
- guaranteeing host-native buttons where the host cannot transport exact values safely;
- claiming a Copilot-native executable question adapter without independently verified host support;
- making repository tests claim pixel-level, accessibility or interaction proof for a live host;
- introducing a new persisted presentation state; or
- redesigning installation lifecycle, release delivery or unrelated AGDF cards.

## 4. Users And Roles

- **Repository user:** interacts primarily through the coding-agent chat and must understand what is
  authoritative without learning AGDF internals.
- **Coding agent:** evaluates live control state, presents the deterministic projection and invokes a
  safe host adapter or exact-text fallback without inventing gate semantics.
- **GitHub Copilot:** consumes generated repository instructions and skills as a full semantic and
  rendering target; exact text is the current conforming approval transport.
- **Repository maintainer:** uses the CLI for setup, repeatable diagnostics, CI and audit evidence.
- **AGDF maintainer:** owns canonical contracts, renderer, generated surfaces and compatibility.
- **User approver:** remains the only source of deliberate exact gate approval.

## 5. Constraints

- Durable artefacts remain English and user-facing chat follows the configured locale.
- Exact `Approval: <GateName>` values remain untranslated and undecorated.
- `.agdf/control/runs/<run_id>/RUN_STATE.md` remains the mutable run authority.
- `interaction-presentation.js` remains the canonical presentation-payload owner.
- `gate-check.js` remains the gate-evaluation composition owner.
- Public output changes must be additive and preserve exit-code compatibility.
- Generated assets must flow through the existing synchronization path.
- Host tools may be unavailable, decorated-only or unsafe to wait on; exact text remains universal.
- Copilot has no currently declared native interaction adapter and must remain truthful about this
  instruction-only host boundary.
- Normal agent work must not depend on a fresh npm-registry lookup.

## 6. Evidence Requirements

QA must receive:

1. focused unit tests for every ready user gate and complete English/German locale packs;
2. negative tests for sequence, block, neutral heading, five-field shape, duplicate or decorated
   approval values, locale, run, gate and revision drift;
3. selected-run control-state tests showing unchanged authority and revalidation behavior;
4. public human/JSON output fixtures proving additive compatibility;
5. CLI help and documentation assertions for bootstrap versus repeated-use guidance;
6. generated-surface synchronization and Runtime Integrity checks;
7. aggregate package smoke tests and `git diff --check`;
8. a generated Copilot fixture proving the canonical skill, runtime contract, locale and render-ready
   fallback semantics are synchronized without a speculative native adapter;
9. a live Codex observation and a live Claude Code observation when callable, each recording presented,
   unavailable or attempted-not-applied behavior without overstating enforcement;
10. optional OpenCode and Copilot live observations when callable, classified as supplementary; and
11. explicit disclosure of any host behavior that remains unverified.

## 7. Risks And Open Questions

SD must resolve:

- whether the render-ready contract exposes structured blocks, canonical Markdown lines, or both;
- how the projection is made available locally to installed plugin surfaces without a routine registry
  lookup or a duplicated renderer;
- whether the public `gate-check --json` surface should expose the projection directly or through a
  focused opt-in presentation flag while retaining additive compatibility;
- which current procedural steps remain irreducible host-orchestration instructions after rendering is
  deterministic;
- how a surface proves it transmitted the projection without mutation when the host offers no response
  interception hook; and
- how live evidence is recorded without making authentication or host availability a deterministic CI
  dependency.
- how Copilot receives the local render-ready projection through generated repository assets while
  retaining exact text as its truthful current transport.

## 8. Next Step

Draft the compact Solution Design for the canonical renderer, additive projection, local invocation
policy, generated surfaces and evidence boundaries. Implementation remains gated.
