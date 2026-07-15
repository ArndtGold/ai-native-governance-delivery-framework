import pluginDefinition from '../../../plugin/meta/agdf-plugin.definition.json'

export type SkillDiscovery = 'start_here' | 'automatic' | 'optional'

const discoveryBySlug = Object.fromEntries(
    pluginDefinition.skillSet.map(skill => [skill.slug, skill.discovery])
) as Record<string, SkillDiscovery>

export interface Skill {
    name: string
    family: string
    short: string
    description: string
    when: string
    discovery: SkillDiscovery
}

export const skills: Skill[] = [
    {
        name: "gate-check",
        family: "Governance",
        short: "Find the earliest blocking gate",
        description: "Determines the earliest blocking user-approval gate and derives which artefacts are allowed or forbidden, whether an exact approval is missing and which next step is permissible.",
        when: "The user says go, but approvals, artefacts or allowed outputs are unclear.",
        discovery: discoveryBySlug["gate-check"]
    },
    {
        name: "delivery-path-search",
        family: "Planning",
        short: "Compare high-impact delivery paths",
        description: "Explores a bounded set of legal next delivery steps, scores them against scope, risk, evidence, tests and cost, and returns one advisory recommendation without granting implementation permission.",
        when: "Several materially different next steps are plausible and choosing badly would create expensive rework.",
        discovery: discoveryBySlug["delivery-path-search"]
    },
    {
        name: "brownfield-analysis",
        family: "Analysis",
        short: "Inspect existing ownership before code",
        description: "Ensures that implementation in an existing system is not greenfield-style, but inventory-oriented. Analyses existing artefacts, assesses partial coverage, determines reuse strategy and recommends the minimal-invasive implementation path.",
        when: "A change touches existing code, behaviour, APIs, persistence, policies or UI ownership.",
        discovery: discoveryBySlug["brownfield-analysis"]
    },
    {
        name: "task-plan-review",
        family: "Review",
        short: "Plan coverage evidence",
        description: "Answers one Quality Readiness question: was the approved Task Plan fully, partially or not completed? It supplies plan-coverage evidence for the QA decision.",
        when: "Code and tests exist, but task completion still needs evidence.",
        discovery: discoveryBySlug["task-plan-review"]
    },
    {
        name: "clean-implementation-review",
        family: "Review",
        short: "Solution integrity evidence",
        description: "Answers one Quality Readiness question: is the implementation a clean primary solution, free of unnecessary fallbacks, workarounds or parallel structures?",
        when: "The implementation works, but may hide fallbacks, shims or duplicate ownership.",
        discovery: discoveryBySlug["clean-implementation-review"]
    },
    {
        name: "code-review",
        family: "Review",
        short: "Code quality evidence",
        description: "Answers one Quality Readiness question: does the actual diff have correctness, regression, security or maintainability findings that must be addressed?",
        when: "Code changes and tests exist and the actual implementation needs mandatory review evidence.",
        discovery: discoveryBySlug["code-review"]
    },
    {
        name: "qa-gate",
        family: "Governance",
        short: "Final Quality Readiness decision",
        description: "Makes the only final Quality Readiness decision (pass | revise | block) from plan coverage, brownfield fit, solution integrity, evidence quality and open blockers.",
        when: "Reviews and evidence exist and the run needs a formal pass, revise or block.",
        discovery: discoveryBySlug["qa-gate"]
    },
    {
        name: "release-or",
        family: "Delivery",
        short: "Close the run with an audit report",
        description: "Produces the orchestration report (OR) as a mandatory closeout of a run. Summarises gate status, delivered artefacts, TP-coverage, brownfield fit, solution integrity and open items.",
        when: "A relevant run ends, whether it passed, needs revision, or is blocked.",
        discovery: discoveryBySlug["release-or"]
    },
    {
        name: "delivery-closeout",
        family: "Delivery",
        short: "Prepare the commit or PR handoff",
        description: "Standardises the operative delivery closeout with commit-ready Git summary, UAT-gated commit offer and next delivery step.",
        when: "QA/OR/UAT is clear and the next delivery action should be offered, not executed silently.",
        discovery: discoveryBySlug["delivery-closeout"]
    }
]

export const skillFamilies = ["Planning", "Governance", "Analysis", "Review", "Delivery"]
