export interface Skill {
    name: string
    family: string
    short: string
    description: string
    when: string
}

export const skills: Skill[] = [
    {
        name: "gate-check",
        family: "Governance",
        short: "Find the earliest blocking gate",
        description: "Determines the earliest blocking user-approval gate and derives which artefacts are allowed or forbidden, whether an exact approval is missing and which next step is permissible.",
        when: "The user says go, but approvals, artefacts or allowed outputs are unclear."
    },
    {
        name: "brownfield-analysis",
        family: "Analysis",
        short: "Inspect existing ownership before code",
        description: "Ensures that implementation in an existing system is not greenfield-style, but inventory-oriented. Analyses existing artefacts, assesses partial coverage, determines reuse strategy and recommends the minimal-invasive implementation path.",
        when: "A change touches existing code, behaviour, APIs, persistence, policies or UI ownership."
    },
    {
        name: "task-plan-review",
        family: "Review",
        short: "Check implementation against the TP",
        description: "Reviews after code changes and before QA whether the tasks from the approved Task Plan were fully, partially or not completed. Delivers reliable TP-coverage as input for the QA gate decision.",
        when: "Code and tests exist, but task completion still needs evidence."
    },
    {
        name: "clean-implementation-review",
        family: "Review",
        short: "Detect workaround-heavy solutions",
        description: "Reviews whether an implementation is a clean primary solution or has been unnecessarily complicated by fallbacks, workarounds, guards, defaults, shims or parallel structures.",
        when: "The implementation works, but may hide fallbacks, shims or duplicate ownership."
    },
    {
        name: "qa-gate",
        family: "Governance",
        short: "Formal QA gate decision",
        description: "Makes the formal QA gate decision (pass | revise | block) based on TP-coverage, brownfield fit, solution integrity, evidence quality and open blockers.",
        when: "Reviews and evidence exist and the run needs a formal pass, revise or block."
    },
    {
        name: "release-or",
        family: "Delivery",
        short: "Close the run with an audit report",
        description: "Produces the orchestration report (OR) as a mandatory closeout of a run. Summarises gate status, delivered artefacts, TP-coverage, brownfield fit, solution integrity and open items.",
        when: "A relevant run ends, whether it passed, needs revision, or is blocked."
    },
    {
        name: "delivery-closeout",
        family: "Delivery",
        short: "Prepare the commit or PR handoff",
        description: "Standardises the operative delivery closeout with commit-ready Git summary, UAT-gated commit offer and next delivery step.",
        when: "QA/OR/UAT is clear and the next delivery action should be offered, not executed silently."
    }
]

export const skillFamilies = ["Governance", "Analysis", "Review", "Delivery"]
