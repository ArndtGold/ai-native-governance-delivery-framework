export const site = {
    name: "AGDF",
    fullName: "AI Governance & Delivery Framework",
    tagline: "Stop agents before they code past the evidence.",
    description: "A focused governance plugin for teams that let AI agents touch real code: AGDF turns delivery into approved steps, visible evidence, QA decisions and auditable closeout, with machine-readable validators when proof is needed.",
    domain: "agdf.tools",
    repo: "https://github.com/arndtgold/ai-native-governance-delivery-framework",
    license: "Apache-2.0",
    version: "0.3.4",
    author: {
        name: "Arndt Gold",
        role: "Software engineer · 30+ years enterprise experience",
        image: "/assets/author-placeholder.svg",
    },
}

export const highlights = [
    {
        title: "Stop Before Scope Drifts",
        icon: "gate",
        description: "No approval, no next gate. AGDF stops assumption-driven continuation before it becomes delivery drift.",
        command: "/gate-check",
    },
    {
        title: "Protect Existing Systems",
        icon: "brownfield",
        description: "Brownfield is the default. AGDF forces owners, tests and existing behaviour into view before code changes.",
        command: "/brownfield-analysis",
    },
    {
        title: "Verify The Plan, Not The Vibe",
        icon: "review",
        description: "A green build is not completion. AGDF checks delivered work against the approved plan and evidence.",
        command: "/task-plan-review",
    },
    {
        title: "Make QA A Decision",
        icon: "audit",
        description: "QA is not a feeling. AGDF turns it into `pass | revise | block` from coverage, fit, integrity and evidence.",
        command: "/qa-gate",
    },
    {
        title: "Expose Workarounds",
        icon: "integrity",
        description: "Temporary fixes need owners and exits. AGDF stops fallback logic from becoming hidden architecture.",
        command: "/clean-implementation-review",
    },
    {
        title: "Close Runs With Evidence",
        icon: "handoff",
        description: "A run ends with delivered scope, open gaps, remaining risks and the next allowed move.",
        command: "/release-or",
    },
]

export const workflowSteps = [
    {
        step: "01",
        title: "Gate Check + Scope",
        command: "/gate-check",
        desc: "Capture the need, identify the active scope and show the current checkpoint before product work starts."
    },
    {
        step: "02",
        title: "Source + Brownfield Review",
        command: "/brownfield-analysis",
        desc: "Check source authority, existing ownership, protected behavior, boundaries, tests and risk."
    },
    {
        step: "03",
        title: "Right-Sized Path",
        command: "control state",
        desc: "Decide whether the work is quick, bug-lightweight, bounded, structured or blocked."
    },
    {
        step: "04",
        title: "PRD / SD / TP",
        command: "as needed",
        desc: "Create only the artefact depth the reviewed change size justifies. Do not ritualize."
    },
    {
        step: "05",
        title: "Implementation Prep",
        command: "/brownfield-analysis",
        desc: "Before non-trivial code, map reuse strategy, contracts, regressions and test evidence per task."
    },
    {
        step: "06",
        title: "CD + Reviews",
        command: "CD+Tests",
        desc: "Implement narrowly, run checks, then verify TP coverage, code quality and clean implementation."
    },
    {
        step: "07",
        title: "QA Decision",
        command: "/qa-gate",
        desc: "Decide pass, revise or block from TP coverage, Brownfield fit, integrity and evidence."
    },
    {
        step: "08",
        title: "OR + Closeout",
        command: "/release-or",
        desc: "Record audit status, open gaps, risks, persistence target and the next allowed delivery action."
    },
]

export const requirementPaths = [
    {
        label: "Quick Task",
        trigger: "Small local fix, review, debugging step or refactor without new product semantics.",
        path: "Understand context -> change narrowly -> run relevant checks -> close with evidence",
        outcome: "Fast, narrow, evidenced."
    },
    {
        label: "Bug Lightweight",
        trigger: "Narrow defect with clear symptom, reproduction, expected behavior and fix boundary.",
        path: "Record bug facts -> verify boundary -> fix narrowly -> test symptom -> close with evidence",
        outcome: "Fast defect control without pretending it is full product delivery."
    },
    {
        label: "Controlled Delivery",
        trigger: "New capability, architecture impact, policy or persistence change, visible UX decision or release-critical work.",
        path: "Clarify need -> check impact -> plan only what risk justifies -> implement -> verify -> close with evidence",
        outcome: "More control when the work can affect real systems."
    },
]

export const approvalGates = [
    { gate: "UR", approval: "Approval: UR", meaning: "The need is clear enough to become product work." },
    { gate: "PRD", approval: "Approval: PRD", meaning: "Scope, acceptance criteria and non-goals are contractual." },
    { gate: "SD", approval: "Approval: SD", meaning: "The solution direction and ownership model are accepted." },
    { gate: "TP", approval: "Approval: TP", meaning: "Tasks, tests and review evidence are planned before implementation." },
]

export const visualProofs = {
    product: {
        eyebrow: "Product proof",
        title: "From unchecked agent output to governed delivery state.",
        desc: "The Agent Builder workflow was created with ChatGPT Plus and Codex. AGDF kept requirements, design, approvals, evidence and QA connected, so humans and agents could work from the same delivery state.",
        built: "AGDF did not replace tools, judgment or delivery responsibility. It made AI output governable, turning agent speed into a delivery advantage.",
        src: "/assets/example-greenfield-to-brownfield-gates.png",
        alt: "Agent Builder workflow canvas with Start, Agent and End nodes plus configuration panels.",
        width: 4662,
        height: 2794,
    },
    intake: {
        eyebrow: "Requirement intake",
        title: "A board shows progress. AGDF shows whether the next step is allowed.",
        desc: "Before work moves forward, AGDF shows what is ready, what is missing and what must stop.",
    },
    qa: {
        eyebrow: "Task-plan evidence",
        title: "Looks done is not the same as done.",
        desc: "AGDF checks the approved plan against code, tests and missing evidence before QA decides: pass, revise or block.",
    },
    architecture: {
        eyebrow: "Delivery map",
        title: "From scattered artifacts to delivery decisions.",
        desc: "The Context Graph shows what proves readiness, what blocks, what changed and what can safely happen next.",
    },
}

export const prevention = [
    {
        title: "Silent Scope Drift",
        desc: "Prompt, design and code describe different products, so teams review output that no longer matches the approved intent."
    },
    {
        title: "Greenfield In Brownfield",
        desc: "When ownership, rules and integration points are unclear, the coding agent creates a second path instead of extending the owner."
    },
    {
        title: "Green Build, Unfinished Task",
        desc: "Tests pass while the approved Task Plan remains open, so a green build is mistaken for completed delivery."
    },
    {
        title: "QA Without Evidence",
        desc: "Done is claimed before evidence supports it, leaving reviewers with confidence instead of proof."
    },
    {
        title: "Permanent Fallbacks",
        desc: "Temporary guards become architecture because no gate forces cleanup, removal or an explicit design decision."
    },
    {
        title: "Premature Handoff",
        desc: "Commit or PR work starts before gate status and risks are clear, shifting unresolved decisions into review."
    },
    {
        title: "Branch-As-Scope Assumption",
        desc: "A branch name or workspace diff is treated as proof of scope even when durable artefacts or approvals say something else."
    },
    {
        title: "Hidden Active Workline",
        desc: "Multiple plausible scopes exist, but the agent silently picks one and produces artefacts for the wrong delivery line."
    },
]

export const notFor = [
    "It is not a ticket system or project-management board.",
    "It is not autonomous shipping without human approval.",
    "It is not a replacement for product responsibility.",
    "It is not an EU AI Act compliance certification or legal assessment.",
    "It is not a large skill catalogue; the plugin is intentionally core-workflow only.",
]

export const aiActFit = [
    {
        title: "Risk stays visible",
        desc: "No approval, no evidence, no next step.",
        mapsTo: "Before work moves",
    },
    {
        title: "The run leaves a trail",
        desc: "Gate state leaves chat history and becomes repository state.",
        mapsTo: "During delivery",
    },
    {
        title: "People keep the decision",
        desc: "The agent prepares evidence. People approve, decide QA and own the release.",
        mapsTo: "At decision points",
    },
    {
        title: "Compliance is not automated",
        desc: "AGDF supports the delivery trail. It does not certify compliance.",
        mapsTo: "Clear boundary",
    },
]

export const principles = [
    {
        title: "No Implementation Without an Approved Product Contract",
        desc: "Agents can turn vague intent into plausible code. Approved scope, acceptance criteria and non-goals define what may be built.",
    },
    {
        title: "One Source of Product Intent",
        desc: "Prompt, design, tasks, code and tests can silently drift apart. The product contract keeps the intended product stable.",
    },
    {
        title: "Fail Closed",
        desc: "Missing approval, input or evidence must stop the run. Otherwise best effort hides risk behind apparent progress.",
    },
    {
        title: "Design Is Not Code",
        desc: "Agents can make architecture while coding. Design stays separate until the right gate allows implementation.",
    },
    {
        title: "Tasks Need Business Justification",
        desc: "Activity alone is not value. Each task must show which requirement, risk or delivery decision it supports.",
    },
    {
        title: "Quality Needs Evidence",
        desc: "Confident summaries can look like proof. What was not checked must not be presented as checked.",
    },
    {
        title: "Changes Must Be Visible",
        desc: "AI conversations can hide product changes inside implementation work. Scope changes must be documented and reviewed.",
    },
    {
        title: "Traceability Is Not Bureaucracy",
        desc: "Teams must explain why work was allowed, what it proves and what still blocks delivery. That is traceability.",
    },
    {
        title: "Branch Names Are Not Authority",
        desc: "Workspace clues can support a decision, but durable artefacts, approvals and source-of-truth ownership decide the active scope.",
    },
];

export const buildingBlocks = [
    {
        name: "Artifacts",
        desc: "Persist the work state so output can be checked against need, product contract, design, plan, tests and evidence.",
        icon: "archive-box",
    },
    {
        name: "Gates",
        desc: "Decide whether work may start, must revise or must stop before missing input becomes hidden risk.",
        icon: "shield-check",
    },
    {
        name: "Delivery Map",
        desc: "Connect status, artifacts, decisions, risks, tests, evidence, ambiguity and gates so progress and blockers stay visible.",
        icon: "map",
    },
    {
        name: "Quality Contracts",
        desc: "Turn repeated review questions into reusable block, revise and warn signals instead of relying on confident summaries.",
        icon: "clipboard-document-check",
    },
];

export const operatingGuards = [
    {
        title: "Normative source precedence",
        desc: "The repository declares which instructions and control files are authoritative. Generated copies, branch names and chat summaries cannot silently override them.",
    },
    {
        title: "Multi-scope fail-closed",
        desc: "When several active work lines are plausible, AGDF lists the candidates and blocks later-gate work until the scope is clear.",
    },
    {
        title: "Branch is supporting evidence",
        desc: "A branch or uncommitted diff may support a scope, but never proves it alone when durable artefacts or approvals are missing.",
    },
    {
        title: "Knowledge persistence routing",
        desc: "Each relevant run decides whether durable findings belong in the Context Graph, SoT registry, scope artefact, open questions or nowhere.",
    },
    {
        title: "Bug Lightweight Track",
        desc: "Narrow defects can stay lightweight when reproduction, expected behavior, fix boundary and evidence plan are explicit.",
    },
    {
        title: "Domain guardrail packs",
        desc: "Projects can add reusable checks for risky domains without replacing AGDF gates or approvals.",
    },
]

export const gateFlow = [
    { gate: "UR", name: "User Requirement", desc: "Problem, goal, affected users, constraints" },
    { gate: "BR", name: "Brownfield Review", desc: "Existing logic, ownership, system boundaries" },
    { gate: "PATH", name: "Right-Sized Path", desc: "small / bounded / structured / blocked" },
    { gate: "PRD", name: "Product Requirements", desc: "Scope, acceptance criteria, non-goals" },
    { gate: "SD", name: "Solution Design", desc: "Architecture, components, interfaces" },
    { gate: "TP", name: "Task & Test Plan", desc: "Work packages, test matrix, dependencies" },
    { gate: "BA", name: "Brownfield Analysis", desc: "Reuse strategy per task, regressions" },
    { gate: "CD", name: "Code / Implementation", desc: "Code, tests, quality evidence" },
    { gate: "REV", name: "Reviews", desc: "Task-plan coverage, code quality, clean implementation" },
    { gate: "QA", name: "QA Gate", desc: "pass / revise / block" },
    { gate: "OR", name: "Orchestration Report", desc: "Auditable closeout" },
]

export const gateMapPaths = {
    sharedStart: [
        { gate: "UR", name: "User Requirement" },
        { gate: "BR", name: "Brownfield Review" },
        { gate: "PATH", name: "Right-Sized Path" },
    ],
    quick: {
        label: "Quick path",
        note: "Only when the impact check shows narrow scope, clear ownership and enough evidence.",
        steps: [
            { gate: "CD", name: "Small change + checks" },
            { gate: "OR-lite", name: "Evidence closeout" },
        ],
    },
    structured: {
        label: "Structured path",
        note: "Used when the change needs explicit product, solution or task contracts.",
        steps: [
            { gate: "PRD", name: "Product Requirements" },
            { gate: "SD", name: "Solution Design" },
            { gate: "TP", name: "Task & Test Plan" },
            { gate: "BA", name: "Brownfield Analysis" },
            { gate: "CD", name: "CD + Tests" },
            { gate: "REV", name: "Reviews" },
            { gate: "QA", name: "QA Gate" },
            { gate: "OR", name: "OR + Closeout" },
        ],
    },
}

export const gateModeMatrix = [
    {
        mode: "Quick task",
        use: "User need, impact check, right-sized path, small change, relevant checks, evidence closeout",
        skip: "Product, solution, task and QA gates unless risk or evidence gaps require escalation",
        decision: "Use only for narrow approved scope without new product semantics.",
    },
    {
        mode: "Bug lightweight",
        use: "Bug facts, reproduction, actual and expected behavior, fix boundary, targeted checks, evidence closeout",
        skip: "Full PRD/SD/TP chain when the defect does not introduce new product semantics",
        decision: "Use only while the bug stays inside the recorded boundary; escalate if scope grows.",
    },
    {
        mode: "Bounded slice",
        use: "User need, impact check, right-sized path, minimal product/solution/task plan, implementation, reviews, QA, closeout",
        skip: "Full-depth artifacts when a small slice contract is enough",
        decision: "Use when the change needs explicit contracts, but only for a bounded slice.",
    },
    {
        mode: "Structured delivery",
        use: "User need, impact check, right-sized path, product/solution/task plan, implementation, reviews, QA, closeout",
        skip: "Nothing material; depth is justified by impact, risk or release relevance",
        decision: "Use for new capability, architecture, persistence, policy, UX or release-critical work.",
    },
    {
        mode: "Blocked",
        use: "Current gate, missing evidence, next allowed action",
        skip: "All later gates and implementation",
        decision: "Use when approval, artefact, evidence, ownership or source of truth is missing.",
    },
]

export const compatibility = [
    { tool: "OpenCode", integration: "instructions + agents + permissions + npm plugin", support: "Reference", goal: "runtime", setupAnchor: "#setup-opencode" },
    { tool: "OpenAI Codex CLI / app", integration: "Plugin + control scaffold", support: "Leading", goal: "primary", setupAnchor: "#setup-codex-project" },
    { tool: "Anthropic Claude Code CLI", integration: "Plugin + control scaffold", support: "First-class", goal: "plugin", setupAnchor: "#setup-claude" },
    { tool: "GitHub Copilot CLI / Coding Agent", integration: "AGENTS.md + .github/skills + .agdf/control", support: "First-class", goal: "repo files", setupAnchor: "#setup-copilot" },
]
