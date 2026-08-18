# Product Requirements Document: Public AGDF Plugin Distribution

Status: approved
Revision: 4
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

Revision 4 was approved with exact `Approval: PRD` on 2026-08-18 after revalidation of the selected
run, current gate, revision and durable artefact.

Revision 4 retains every approved Revision 3 identity, capability and distribution requirement and
adds one bounded bilingual-handbook decision. The German Coding Agent Handbook remains the canonical
user explanation. A complete English edition becomes a controlled derived translation under a
neutral language selector. Runtime Contract and live run state remain higher authority than either
handbook language. Translation parity, stable legacy routing and source-revision validation prevent
the English edition from becoming an independent process owner.

## 1. Product Decision

AGDF will prepare one public, skills-first plugin offering for OpenAI's shared ChatGPT and Codex
plugin directory. The public plugin is an independent AGDF distribution, not an official or endorsed
OpenAI product. It reuses the existing canonical AGDF skills and metadata and adds no AGDF-operated
MCP server in the first release.

Codex-specific hooks may remain part of the supported Codex package where the public packaging and
review path accepts them. They are a surface-specific, host-trusted enhancement, not a prerequisite
for the portable skills core or a claim of ChatGPT parity. If the submission surface accepts only a
skills bundle, the submission projection must be generated from the same canonical sources and must
not become a second policy owner.

The public product promise is governed AI-assisted delivery through proportional workflow skills,
explicit human approvals, durable evidence where the host and repository support it, and honest
degradation to advisory behavior where they do not. AGDF is not a security sandbox, compliance
certification, autonomous release system or substitute for human product and engineering authority.

## 2. Users And Jobs

### Primary adopter

A developer, technical lead, maintainer or product owner using ChatGPT or Codex wants to determine
whether AGDF is proportionate, install it from a trusted public directory and enter the lightest
supported governance mode without having to understand AGDF packaging first.

### Publisher and maintainer

The AGDF publisher wants one versioned candidate, complete review material, reproducible package and
host evidence, a visible portal lifecycle and deliberate publish/withdraw actions without confusing
repository readiness with effective external state.

### Reviewer

An OpenAI reviewer must be able to understand the product promise, reproduce supported workflows,
observe safe negative behavior and verify that listing, skills, support, privacy, terms and test
materials describe the same product.

## 3. Product Outcomes

1. AGDF is discoverable and understandable before installation.
2. Installation leads to a truthful supported working mode rather than an implicit claim of full
   repository governance.
3. ChatGPT and Codex share the portable workflow core while surface-specific behavior is explicit.
4. A final public candidate is proven from its shipped bundle and live host behavior, not only from
   source tests.
5. Submission, review, approval, publication and post-publication verification remain distinct,
   deliberate states.
6. German- and English-speaking adopters can follow the same complete handbook journey without
   creating competing AGDF semantics.

## 4. Working Modes And User-Visible State

The PRD adopts the modes defined in `UX_INTENT_DEFINITION.md`:

- `directory_discovery`
- `installed_fit_assessment`
- `governed_repository_delivery`
- `advisory_non_repository`
- `degraded_or_unavailable`
- `publisher_readiness`
- `submitted_review`
- `published_operation`

Every applicable interaction must expose a governance effectiveness state of `governed`,
`advisory`, `blocked`, `not_applicable` or `unverified`, plus one permitted next action. Host-owned
installation, directory, portal and publication state must not be rendered as AGDF-owned authority.

## 5. Product Requirements

### Identity, listing and fit

- **PPD-01 — Stable identity:** The public plugin uses the existing `agdf` technical identity and the
  final directory display name **AGDF**. Long-form listing copy and the website identify the product
  as **AI Governance & Delivery Framework (AGDF)**. Canonical metadata and public listing must change
  together; neither name may be silently truncated or independently maintained.
- **PPD-02 — Accurate short promise:** The canonical local/package description is **Control layer for
  governed AI-assisted delivery.** The final directory short description is **Governed AI delivery
  controls**. Long-form public copy describes governed AI-assisted delivery with explicit approvals
  and evidence. The phrase “operating system” is excluded from plugin manifests and directory copy;
  it may appear on the website only as an explicitly contextualized marketing metaphor that cannot
  be read as a runtime, execution environment, security boundary or agent platform.
- **PPD-03 — Independent publisher:** The listing identifies Arndt Gold or a later explicitly
  approved verified publisher and states that AGDF is independent and not affiliated with, endorsed
  by or sponsored by OpenAI.
- **PPD-04 — Fit before ceremony:** A first-use or starter-prompt path lets users assess whether AGDF
  is proportionate and may recommend advisory use or no AGDF when governance cost exceeds delivery
  risk.
- **PPD-05 — Product boundary:** Listing and first-use copy state that AGDF is not a security sandbox,
  legal assessment, compliance certification, autonomous shipping system or replacement for human
  responsibility.

### Portable core and surface truth

- **PPD-06 — Skills-first core:** The first public release uses the canonical AGDF skill set without
  an AGDF-operated MCP server, external AGDF account or AGDF service authentication.
- **PPD-07 — One policy source:** Submitted skills, manifests and listing material derive from
  canonical repository owners. No ChatGPT-only or portal-only copy of gate rules, approvals or skill
  behavior may become independently maintained.
- **PPD-08 — Surface capability matrix:** The candidate records which workflows are common,
  Codex-specific, ChatGPT-specific, advisory, unavailable or unverified for the exact release.
- **PPD-09 — Codex hooks:** Hook behavior is described as Codex-specific and host-trust-dependent.
  Installation or enablement does not prove that a hook ran, and core user safety must fail closed
  when hook evidence is absent.
- **PPD-10 — ChatGPT boundary:** ChatGPT may provide fit assessment, explanation, planning and review
  through the portable skills core. Full repository-governance claims require direct evidence of the
  applicable host's file/repository, durable-control and validation capabilities for the exact
  workflow; otherwise the result is visibly advisory or unverified.
- **PPD-11 — Durable authority:** Where governed repository delivery is supported, exact approvals
  plus the selected canonical `.agdf/control/runs/<run_id>/RUN_STATE.md` remain authority. Host
  permissions, buttons, installation or plan approval never substitute for AGDF approval.

### Activation, failure and recovery

- **PPD-12 — No implicit activation:** Directory discovery and plugin installation do not create
  repository control state, select a run, approve a gate or authorize repository mutation.
- **PPD-13 — Target and run safety:** Missing, unavailable or ambiguous work targets and runs fail
  closed with the smallest clarification or recovery action.
- **PPD-14 — Explicit degradation:** Missing skills, hooks, trust, files, matching version, validator
  or host capability yield `degraded`, `unavailable` or `unverified`; AGDF must not silently claim the
  stronger mode.
- **PPD-15 — Actionable recovery:** Every recoverable failure provides one visible retry, update,
  enable, trust-review, target-selection, control-creation or supported-surface action consistent
  with current authority.
- **PPD-16 — Safe removal:** Disable and uninstall use existing lifecycle behavior and preserve
  user-owned durable control by default while reporting retained state.

### Public contract, support and data handling

- **PPD-17 — Public URLs:** The release provides stable website, support, privacy-policy and
  terms-of-service URLs that match the verified publisher and are suitable for the OpenAI listing.
- **PPD-18 — Support model:** Public support remains best effort with no guaranteed response time.
  GitHub Discussions handles general questions; structured issues handle reproducible defects;
  security reports follow `SECURITY.md` and its confidential fallback.
- **PPD-19 — Data statement:** For the skills-first/no-MCP release, public privacy material states
  accurately that AGDF operates no external service receiving user conversation or repository data.
  It distinguishes AGDF behavior from OpenAI-hosted processing and from user-authorized local or
  repository operations. Secrets and unnecessary personal data must never be requested in review
  fixtures or public support.
- **PPD-20 — Terms and marks:** Terms cover the independent open-source project, Apache-2.0 software
  license, trademark boundary, no warranty and no certification or service-level promise without
  contradicting `LICENSE`, `NOTICE`, `TRADEMARKS.md`, `SUPPORT.md` or `SECURITY.md`.
- **PPD-21 — Localization:** Public listing and critical support/recovery meaning are available in
  clear English for review and broad distribution. Existing German-first repository support remains
  visible; exact approval values and runtime identifiers are never translated. The complete Coding
  Agent Handbook is available in German and English under the authority and parity requirements
  PPD-41 through PPD-44.

### Submission material and review evidence

- **PPD-22 — Complete submission set:** Before repository readiness can pass, the candidate includes
  name, descriptions, production-ready logo, category, website, support, privacy, terms, verified
  publisher target, starter prompts, availability decision and release notes.
- **PPD-23 — Reviewer cases:** The submission material includes at least five positive and three
  negative cases with prompts, prerequisites, expected workflow and expected result or safe refusal.
  Cases require no private network and no unavailable internal context.
- **PPD-24 — Negative safety coverage:** Negative cases include missing approval, disproportionate
  AGDF fit, unavailable repository authority, unsupported host capability and an attempted
  submission/publication action without authority.
- **PPD-25 — Skill scan readiness:** Final skills contain only required scoped instructions and
  resources, request no unnecessary access and expose intentional exclusions and safe next steps.
- **PPD-26 — Public availability decision:** Countries, regions and workspace contexts are selected
  deliberately before submission based on actual publisher, terms and support readiness. The
  repository records the chosen set; this PRD does not silently assume global availability.

### Package and version proof

- **PPD-27 — Final-bundle inventory:** Candidate validation inspects the exact submitted or shipped
  bundle and proves that every manifest path, declared entrypoint, referenced script, skill,
  contract, hook and asset required at runtime exists exactly as declared.
- **PPD-28 — Metadata behavior proof:** Package validation goes beyond a selected required-file list
  and rejects declared `bin`, export, hook, skill or script targets that are absent or unloadable.
- **PPD-29 — Version coherence:** Canonical definition, generated manifest, submission material,
  website release copy, packaged bundle and later effective directory listing identify the same
  intended AGDF version or explicitly explain an approved directory revision model.
- **PPD-30 — Existing distribution compatibility:** The new public path preserves current npm/local
  marketplace, Claude Code, OpenCode and GitHub Copilot behavior unless a separately approved
  compatibility requirement changes it.
- **PPD-31 — Reproducibility:** Two clean candidate builds from the same source and inputs produce
  equivalent submitted content after excluding documented non-semantic package metadata.

### Evidence and external lifecycle

- **PPD-32 — Evidence classes:** Readiness and closeout keep repository, built bundle, installed
  plugin, authenticated host, portal and post-publication evidence separate.
- **PPD-33 — Live-host UAT:** Codex and applicable ChatGPT test evidence records exact product,
  plugin version, account/workspace context, operating context, workflow, visible result,
  enforcement class and unavailable/unverified boundaries.
- **PPD-34 — Publisher authority:** Portal submission requires observed verified identity and Apps
  Management authority in the selected OpenAI organization. Repository documents cannot assert
  either without read-back.
- **PPD-35 — Lifecycle separation:** `repository_ready`, `draft`, `submitted`, `revise`, `approved`,
  `published` and `withdrawn` are distinct states. A passing repository candidate never advances an
  external state automatically.
- **PPD-36 — Deliberate external actions:** Creating a portal draft, submitting, publishing,
  changing availability, updating, withdrawing or rolling back each requires explicit user
  authorization appropriate to that action and a post-action read-back.
- **PPD-37 — Review remediation:** Portal findings route to the canonical metadata, skill, package,
  policy or evidence owner; editing portal copy alone must not conceal repository drift.
- **PPD-38 — Publication verification:** A published version is not accepted until the listing is
  discoverable where expected and bounded positive/negative host checks confirm or honestly limit
  the approved capability claims.
- **PPD-39 — Rollback and withdrawal:** Design and test evidence define how to stop new exposure,
  withdraw/delist where supported, publish a corrected version and communicate retained installed
  state without assuming repository rollback changes external state.
- **PPD-40 — No release implication:** PRD, SD, TP, QA or UAT approval does not itself authorize Git
  delivery, OpenAI submission, publication, npm release, deployment or mutation of installed caches.

### Bilingual handbook authority and parity

- **PPD-41 — Canonical German handbook:** The German handbook is the canonical user-facing handbook
  source. Runtime Contract, selected live run state and approved gate artefacts remain higher
  authority. The English handbook is labeled as a derived translation and may not become an
  independent owner of AGDF workflow, gate, mode, recovery or evidence semantics.
- **PPD-42 — Neutral language structure:** A neutral `docs/handbook/README.md` provides language
  selection. Canonical German chapters live under `docs/handbook/de/`; derived English chapters live
  under `docs/handbook/en/`. Both editions contain the same seven chapter roles. The existing
  `docs/agenten-handbuch/README.md` remains a stable compatibility pointer and contains no duplicate
  handbook prose.
- **PPD-43 — Translation parity contract:** Every English chapter identifies its German canonical
  source and matching source revision. Approval values, CLI commands, Mode/Slice values, file paths,
  code blocks and normative identifiers remain exact. German semantic changes and their English
  translation are delivered in the same change; validation fails closed on missing chapters, stale
  source revisions, missing protected meanings or prohibited legacy wording.
- **PPD-44 — Natural reviewed English:** The English edition uses clear, natural English rather than
  literal word-for-word translation. Automated or AI-assisted translation may prepare a candidate,
  but publication requires human semantic review. Translation must preserve scope, authority,
  safety, recovery and evidence boundaries and must not claim stronger host, submission or release
  behavior than the German source.

## 6. Starter Workflow Requirements

The final public directory listing uses exactly these three adaptable starter prompts:

1. **Assess whether AGDF fits this work and recommend the lightest safe delivery path.**
2. **Start this request under AGDF governance.**
3. **Review the active AGDF run and explain the next allowed step.**

Each prompt is one line and remains within the current 128-character final-submission limit. The
first combines proportional fit and path selection. The second starts governed intake without
implying approval or automatic control creation. The third is read-only unless the current durable
state and a later exact approval permit progression. Closeout and durable-control creation remain
supported workflows described in long copy and skills, but are not separate default prompts because
the final directory accepts at most three.

Prompts must not imply that installation automatically creates control state or that ChatGPT and
Codex have identical filesystem, hook or validator behavior.

## 7. Reviewer Test Themes

Positive cases must cover proportional fit, approved governed progression, read-only status,
Brownfield reuse and evidence-aware closeout. Negative cases must demonstrate exact-approval
protection, no repository authority, disproportionate fit, missing host capability and forbidden
external publication. Detailed fixtures and expected results belong to TP and submission evidence.

## 8. Quality And Non-Functional Requirements

- **Truthfulness:** No capability, enforcement, certification, publication or host-state claim
  without matching evidence provenance.
- **Accessibility:** Listing assets, descriptions, starter prompts and recovery actions remain
  understandable without relying on color, decorative screenshots or hidden host chrome.
- **Maintainability:** Canonical metadata and skill owners generate projections; duplication checks
  fail the build where practical. German handbook source revision and English translation revision
  remain machine-checkable without maintaining a second workflow model.
- **Security:** Skills request the least authority needed, never expose secrets in fixtures and
  retain exact AGDF approval boundaries.
- **Privacy:** The first release adds no AGDF-operated data service. Any later MCP or telemetry is a
  new product, privacy and architecture scope.
- **Compatibility:** Existing supported distributions and exact approval semantics remain stable.
- **Auditability:** Candidate version, evidence class, external action and effective-state read-back
  are retained in durable run artefacts.

## 9. Explicit Non-Goals

- adding an AGDF MCP server, hosted account, telemetry backend or custom UI in the first release;
- guaranteeing OpenAI review approval, publication date, regional access or uninterrupted listing;
- claiming feature parity between ChatGPT and Codex without direct evidence;
- changing normative AGDF gate order or approval semantics for directory acceptance;
- bundling broad AGDF product-maturity work unrelated to public distribution;
- changing Claude Code, OpenCode or Copilot semantics merely to simplify the public listing;
- translating the Runtime Contract, exact approval values, CLI identifiers or machine-readable
  state values;
- allowing German and English handbook editions to evolve independently;
- submitting, publishing, releasing, committing, pushing or deploying as an implicit consequence of
  this PRD.

## 10. Product Decisions Carried To Design And Release

The following are constrained but intentionally finalized only with later evidence:

- SD decides the clean generated package/submission projection and whether the reviewed public
  package can carry Codex hooks directly without a second maintained bundle.
- The constrained directory values are `AGDF`, `Governed AI delivery controls` and the three exact prompts in
  Section 6; full-name and long-copy owners remain canonical and must not be replaced by these short
  projections outside constrained listing surfaces.
- TP defines exact reviewer fixtures, final-bundle assertions and live-host/portal evidence steps.
- SD defines the bilingual handbook source/translation metadata, stable link and compatibility
  projection, and the smallest clean parity-validation owner. TP defines file, link, protected-token,
  source-revision, semantic-boundary and stale-translation negative tests.
- Before submission, the publisher deliberately records countries/regions, selected verified
  identity, support capacity and public URL readiness.
- Portal review may require PRD revision if it changes the public promise; purely technical packaging
  findings route to SD/TP or implementation as appropriate.

## 11. Acceptance Boundary

The product scope may reach repository readiness when PPD-01 through PPD-44 are either fulfilled by
versioned evidence or explicitly assigned to a later separately authorized external action whose
absence remains visible. Public delivery is complete only after applicable QA/UAT, explicit
submission and publication authority, effective portal read-back and post-publication verification.

Approval of this PRD permits Solution Design only. It does not permit implementation, VCS actions,
portal mutation, submission, publication, release or deployment.
