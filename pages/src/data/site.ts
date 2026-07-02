export const site = {
    name: "AGDF",
    fullName: "Agentic Governance & Delivery Framework",
    tagline: "Keep AI coding runs gated, auditable and Brownfield-safe.",
    description: "A focused governance plugin for Agentic AI Coding Tools: seven core workflow skills for approvals, Brownfield analysis, TP verification, QA decisions and auditable delivery closeout.",
    domain: "agdf.tools",
    repo: "https://github.com/arndtgold/ai-native-governance-delivery-framework",
    license: "Apache-2.0",
    version: "0.1.0",
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
        title: "Check the Gate",
        command: "/agdf-gate-check",
        desc: "Determine whether the requested next step is allowed, blocked, or missing an exact approval."
    },
    {
        step: "02",
        title: "Read the Brownfield",
        command: "/agdf-brownfield-analysis",
        desc: "Find existing owners, behaviour, tests, and reuse paths before implementation starts."
    },
    {
        step: "03",
        title: "Implement and Test",
        command: "CD+Tests",
        desc: "Deliver the change and evidence, while keeping CD+Tests separate from QA completion."
    },
    {
        step: "04",
        title: "Verify TP Coverage",
        command: "/agdf-task-plan-review",
        desc: "Check whether each planned task and acceptance criterion is actually covered."
    },
    {
        step: "05",
        title: "Inspect Solution Integrity",
        command: "/agdf-clean-implementation-review",
        desc: "Identify workarounds, fallbacks, parallel structures, and missing exit criteria."
    },
    {
        step: "06",
        title: "Decide QA",
        command: "/agdf-qa-gate",
        desc: "Make the formal `pass | revise | block` decision from evidence, not confidence."
    },
    {
        step: "07",
        title: "Close the Run",
        command: "/agdf-release-or",
        desc: "Produce the auditable OR, then hand off delivery with `/agdf-delivery-closeout` when appropriate."
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
        title: "The framework is built for real agent workflows.",
        desc: "AGDF fits where requirements, workflow builders, approvals, runs and evidence meet. The plugin keeps those surfaces from drifting apart.",
        src: "/assets/example-greenfield-to-brownfield-gates.png",
        alt: "Agent Builder workflow canvas with Start, Agent and End nodes plus configuration panels.",
        width: 4662,
        height: 2794,
    },
    intake: {
        eyebrow: "Requirement intake",
        title: "A board shows progress. AGDF decides whether progress is allowed.",
        desc: "The first decision is not which task to execute. It is whether the current artefact, approval and evidence state allows the next step.",
    },
    qa: {
        eyebrow: "Task-plan evidence",
        title: "Looks done is not the same as done.",
        desc: "After implementation, AGDF checks the delivered change against the approved plan, acceptance criteria and missing evidence before QA decides.",
    },
    architecture: {
        eyebrow: "Delivery Lagebild",
        title: "Traceability turns scattered artefacts into a delivery decision.",
        desc: "The Context Graph is useful when it supports decisions: what blocks, what proves, what changed and what can safely happen next.",
    },
}

export const prevention = [
    {
        title: "Silent Scope Drift",
        desc: "Prompt, design and code no longer describe the same product intent."
    },
    {
        title: "Greenfield In Brownfield",
        desc: "The agent creates a second path instead of extending the existing owner."
    },
    {
        title: "Green Build, Unfinished Task",
        desc: "Tests pass, but the approved Task Plan was only partially fulfilled."
    },
    {
        title: "QA Without Evidence",
        desc: "A run is called done without TP coverage, Brownfield fit or review evidence."
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
    { title: "No Implementation Without Approved Product Contract", desc: "Implementation is not based on vague intent, but on a stable contract with scope, acceptance criteria and non-goals." },
    { title: "Fail Closed", desc: "When a necessary approval, input or quality statement is missing, the process stops. The standard is never 'best effort'." },
    { title: "One Authoritative Source for Product Intent", desc: "The product contract is the anchor. Design, tasks and implementation must not silently reinterpret it." },
    { title: "Keep Design and Code Separated", desc: "Conceptual design and implementation details must not be mixed prematurely." },
    { title: "Tasks Need Business Justification", desc: "A task is not just a card on a board. It must make traceable which requirement it addresses." },
    { title: "Traceability Is Not Bureaucracy", desc: "Traceability means being able to answer fundamental delivery questions — not producing as many documents as possible." },
    { title: "Quality Needs Evidence", desc: "A quality claim is not sufficient. What was not checked must not be presented as checked." },
    { title: "Changes Must Be Visible", desc: "Scope, AC or non-goal changes are documented and reviewed. Work with AI agents must not hide changes behind conversation." },
]

export const buildingBlocks = [
    { name: "Gates", desc: "Deliberate checkpoints where it is decided whether work may continue.", icon: "G" },
    { name: "Artefacts", desc: "Saved work states such as requirements, product contract, design, tasks, tests and evidence.", icon: "A" },
    { name: "Project Knowledge", desc: "A project-near memory that does not live solely in chat logs or tool memory.", icon: "W" },
    { name: "Quality Contracts", desc: "Verifiable rules for agent runs, reviews and evidence.", icon: "Q" },
]

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
    { tool: "Anthropic Claude Code CLI", version: "2.1.x", compat: "100%", goal: "primary" },
    { tool: "GitHub Copilot CLI", version: "1.0.x", compat: "95%", goal: "secondary" },
    { tool: "OpenAI Codex CLI", version: "0.x.x", compat: "90%", goal: "secondary" },
]
