export const site = {
    name: "AGDF",
    fullName: "AI Governance & Delivery Framework",
    tagline: "Stop agents before they code past the evidence.",
    description: "A focused governance plugin for teams that let AI agents touch real code: AGDF turns delivery into approved steps, visible evidence, QA decisions and auditable closeout, with machine-readable validators when proof is needed.",
    domain: "agdf.tools",
    repo: "https://github.com/arndtgold/ai-native-governance-delivery-framework",
    license: "Apache-2.0",
    version: "0.3.0",
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
        title: "Gate Check + UR",
        command: "/gate-check",
        desc: "Capture the need, show the current checkpoint and require approval before product work starts."
    },
    {
        step: "02",
        title: "Brownfield Review",
        command: "/brownfield-analysis",
        desc: "Check existing ownership, protected behavior, boundaries, tests and risk."
    },
    {
        step: "03",
        title: "Right-Sized Path",
        command: "control state",
        desc: "Decide whether the work can stay small, needs a bounded plan or must stop."
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
        desc: "Record audit status, open gaps, risks and the next allowed delivery action."
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
        title: "A real application delivered with AGDF",
        desc: "This application was delivered with ChatGPT Plus + Codex using AGDF as the control layer: requirements, approvals, design, evidence and QA stayed connected.",
        built: "AGDF did not replace the tools. It kept the delivery governable.",
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
        desc: "Prompt, design and code describe different products."
    },
    {
        title: "Greenfield In Brownfield",
        desc: "The agent creates a second path instead of extending the owner."
    },
    {
        title: "Green Build, Unfinished Task",
        desc: "Tests pass while the approved Task Plan remains open."
    },
    {
        title: "QA Without Evidence",
        desc: "Done is claimed before evidence supports it."
    },
    {
        title: "Permanent Fallbacks",
        desc: "Temporary guards become architecture."
    },
    {
        title: "Premature Handoff",
        desc: "Commit or PR work starts before gate status and risks are clear."
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
        desc: "Implementation must not start from vague intent. It needs a stable product contract with scope, acceptance criteria and non-goals.",
    },
    {
        title: "Fail Closed",
        desc: "When required approval, input or quality evidence is missing, the process stops. The default is never best effort.",
    },
    {
        title: "One Source of Product Intent",
        desc: "The product contract is the anchor. Design, tasks and implementation must not silently reinterpret it.",
    },
    {
        title: "Design Is Not Code",
        desc: "Conceptual design and implementation details must stay separated until the right gate allows implementation.",
    },
    {
        title: "Tasks Need Business Justification",
        desc: "A task is not just a board card. It must show which requirement, risk or decision it addresses.",
    },
    {
        title: "Traceability Is Not Bureaucracy",
        desc: "Traceability means answering fundamental delivery questions, not producing as many documents as possible.",
    },
    {
        title: "Quality Needs Evidence",
        desc: "A quality claim is not enough. What was not checked must not be presented as checked.",
    },
    {
        title: "Changes Must Be Visible",
        desc: "Changes to scope, acceptance criteria or non-goals must be documented and reviewed. AI conversations must not hide product changes.",
    },
];

export const buildingBlocks = [
    {
        name: "Artifacts",
        desc: "Persist the work state: need, product contract, design, plan, tests and evidence.",
        icon: "archive-box",
    },
    {
        name: "Gates",
        desc: "Decide whether work may start, must revise or must stop.",
        icon: "shield-check",
    },
    {
        name: "Delivery Map",
        desc: "Connect run status, artifacts, decisions, risks, tests, evidence and gates.",
        icon: "map",
    },
    {
        name: "Quality Contracts",
        desc: "Turn repeated review questions into reusable block, revise and warn signals.",
        icon: "clipboard-document-check",
    },
];

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
