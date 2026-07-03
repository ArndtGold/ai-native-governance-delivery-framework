export const site = {
    name: "AGDF",
    fullName: "AI Governance & Delivery Framework",
    tagline: "Keep AI-assisted delivery gated, auditable and Brownfield-safe.",
    description: "A focused governance plugin for Agentic AI Coding Tools: seven core workflow skills for approvals, Brownfield analysis, TP verification, QA decisions and auditable delivery closeout.",
    domain: "agdf.tools",
    repo: "https://github.com/arndtgold/ai-native-governance-delivery-framework",
    license: "Apache-2.0",
    version: "0.1.0",
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
        description: "When a run lacks a valid approval, AGDF makes the block visible instead of letting the agent continue on assumptions.",
        command: "/agdf-gate-check",
    },
    {
        title: "Protect Existing Systems",
        icon: "brownfield",
        description: "Before code changes, inspect existing owners, tests and behaviour so the agent does not create a second path that looks clean only locally.",
        command: "/agdf-brownfield-analysis",
    },
    {
        title: "Verify The Plan, Not The Vibe",
        icon: "review",
        description: "After implementation, check each planned task against real code, tests and evidence. A green build alone is not completion.",
        command: "/agdf-task-plan-review",
    },
    {
        title: "Make QA A Decision",
        icon: "audit",
        description: "QA becomes an explicit `pass | revise | block` decision based on TP coverage, Brownfield fit, solution integrity and evidence.",
        command: "/agdf-qa-gate",
    },
    {
        title: "Expose Workarounds",
        icon: "integrity",
        description: "Fallbacks, shims and guards are not allowed to masquerade as architecture. AGDF forces exit criteria and cleanup paths.",
        command: "/agdf-clean-implementation-review",
    },
    {
        title: "Close Runs With Evidence",
        icon: "handoff",
        description: "Every relevant run ends with what was delivered, what was not delivered, what remains risky and what may happen next.",
        command: "/agdf-release-or",
    },
]

export const workflowSteps = [
    {
        step: "01",
        title: "Gate Check",
        command: "/agdf-gate-check",
        desc: "Is the next step allowed?"
    },
    {
        step: "02",
        title: "Brownfield Read",
        command: "/agdf-brownfield-analysis",
        desc: "What existing behavior, owners and risks must be known?"
    },
    {
        step: "03",
        title: "Implement + Test",
        command: "CD+Tests",
        desc: "Deliver the change and keep evidence separate from QA judgment."
    },
    {
        step: "04",
        title: "Task Plan Coverage",
        command: "/agdf-task-plan-review",
        desc: "Are all planned tasks and acceptance criteria covered?"
    },
    {
        step: "05",
        title: "Solution Integrity",
        command: "/agdf-clean-implementation-review",
        desc: "Are there workarounds, parallel structures or missing exit criteria?"
    },
    {
        step: "06",
        title: "QA Decision",
        command: "/agdf-qa-gate",
        desc: "Pass, revise or block based on evidence — not confidence."
    },
    {
        step: "07",
        title: "Delivery Closeout",
        command: "/agdf-release-or",
        desc: "Produce the auditable outcome and hand off cleanly."
    },
]

export const requirementPaths = [
    {
        label: "Quick Task",
        trigger: "Small local fix, review, debugging step or refactor without new product semantics.",
        path: "Understand context -> change narrowly -> run relevant checks -> close with evidence",
        outcome: "Fast, minimal and still evidenced."
    },
    {
        label: "Structured Delivery",
        trigger: "New capability, architecture impact, runtime/policy/persistence change, visible UX decision or release-critical work.",
        path: "UR -> PRD -> SD -> TP -> CD+Tests -> Reviews -> QA -> OR -> Delivery Closeout",
        outcome: "Gated, auditable and approval-driven."
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
        desc: "This application was built with ChatGPT Plus + Codex using AGDF as the delivery framework: requirements, workflow design, approvals, run evidence and QA decisions stayed connected.",
        built: "AGDF did not replace the tools. It structured the delivery through artifacts, gates and delivery context.",
        src: "/assets/example-greenfield-to-brownfield-gates.png",
        alt: "Agent Builder workflow canvas with Start, Agent and End nodes plus configuration panels.",
        width: 4662,
        height: 2794,
    },
    intake: {
        eyebrow: "Requirement intake",
        title: "A board shows progress. AGDF shows whether the next step is allowed.",
        desc: "Before work moves forward, AGDF makes the current artifact, approval and evidence state visible: what is ready, what is missing and what must be clarified first.",
    },
    qa: {
        eyebrow: "Task-plan evidence",
        title: "Looks done is not the same as done.",
        desc: "AGDF compares the delivered change with the approved plan, acceptance criteria and required evidence before QA can decide: pass, revise or block.",
    },
    architecture: {
        eyebrow: "Delivery map",
        title: "From scattered artifacts to delivery decisions.",
        desc: "The Context Graph connects requirements, risks, tests, evidence and gates so teams can see what blocks, what proves readiness, what changed and what can safely happen next.",
    },
}

export const prevention = [
    {
        title: "Silent Scope Drift",
        desc: "Prompt, design and code no longer describe the same product intent."
    },
    {
        title: "Greenfield In Brownfield",
        desc: "The agent creates a parallel path instead of extending the existing owner or behavior."
    },
    {
        title: "Green Build, Unfinished Task",
        desc: "Tests pass, but the approved Task Plan is only partially fulfilled."
    },
    {
        title: "QA Without Evidence",
        desc: "A run is called done without task coverage, Brownfield fit or review evidence."
    },
    {
        title: "Permanent Fallbacks",
        desc: "Temporary guards, shims or defaults become hidden target architecture."
    },
    {
        title: "Premature Handoff",
        desc: "A commit or PR is prepared before gate status and remaining risks are clear."
    },
]

export const notFor = [
    "It is not a ticket system or project-management board.",
    "It is not autonomous shipping without human approval.",
    "It is not a replacement for product responsibility.",
    "It is not a large skill catalogue; the plugin is intentionally core-workflow only.",
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
        desc: "Persistent work states such as requirements, product contracts, designs, task plans, tests and evidence.",
        icon: "archive-box",
    },
    {
        name: "Gates",
        desc: "Deliberate checkpoints that decide whether work may continue, revise or must stop.",
        icon: "shield-check",
    },
    {
        name: "Delivery Map",
        desc: "A project-near view that connects artifacts, decisions, risks, tests, evidence and gates.",
        icon: "map",
    },
    {
        name: "Quality Contracts",
        desc: "Verifiable rules for agent runs, reviews, gate checks and evidence requirements.",
        icon: "clipboard-document-check",
    },
];

export const gateFlow = [
    { gate: "UR", name: "User Requirement", desc: "Problem, goal, affected users, constraints" },
    { gate: "BF", name: "Brownfield Review", desc: "Existing logic, ownership, system boundaries" },
    { gate: "PRD", name: "Product Requirements", desc: "Scope, acceptance criteria, non-goals, approval" },
    { gate: "SD", name: "Solution Design", desc: "Architecture, components, interfaces" },
    { gate: "TP", name: "Task & Test Plan", desc: "Work packages, test matrix, dependencies" },
    { gate: "BA", name: "Brownfield Analysis", desc: "Reuse strategy per task, regressions" },
    { gate: "CD", name: "Code / Implementation", desc: "Code, tests, quality evidence" },
    { gate: "TPR", name: "Task Plan Review", desc: "TP-coverage: fully_done / partially_done" },
    { gate: "QA", name: "QA Gate", desc: "pass / revise / block" },
    { gate: "OR", name: "Orchestration Report", desc: "Auditable closeout" },
]

export const compatibility = [
    { tool: "Anthropic Claude Code CLI", integration: "Plugin", support: "First-class", goal: "primary", setupAnchor: "#setup-claude" },
    { tool: "GitHub Copilot CLI / Coding Agent", integration: "AGENTS.md + .github/skills", support: "First-class", goal: "primary", setupAnchor: "#setup-copilot" },
    { tool: "OpenAI Codex CLI", integration: "AGENTS.md", support: "Best-effort", goal: "secondary" },
]
