export const site = {
    name: "AGDF",
    fullName: "AI Governance & Delivery Framework",
    tagline: "Agent speed needs a control system.",
    description: "For engineering teams using coding agents on real repositories: AGDF keeps scope approved, evidence visible and delivery decisions under human control.",
    domain: "agdf.iself.eu",
    url: "https://agdf.iself.eu/",
    repo: "https://github.com/arndtgold/ai-native-governance-delivery-framework",
    contactEmail: "agdf@iself.eu",
    license: "Apache-2.0",
    version: "0.14.5",
    author: {
        name: "Arndt Gold",
        role: "Software engineer · 20+ years enterprise experience",
    },
} as const

const repoDocument = (path: string) => `${site.repo}/blob/main/${path}`

export const landingPage = {
    navigation: [
        { label: "How it works", href: "#how-it-works" },
        { label: "Evidence", href: "#proof" },
        { label: "Install", href: "#setup" },
        { label: "Handbook", href: `${site.repo}/tree/main/docs/handbook` },
    ],
    hero: {
        audience: "For engineering teams using coding agents on real repositories",
        title: "Agent speed needs a control system.",
        lead: "AGDF controls when agent output may count as delivery progress.",
        formulaOne: "In Formula 1, the engine creates speed. Rules, evidence, strategy and human decisions determine what happens next. AI-assisted delivery has the same challenge: agent output is fast, but teams still need approved scope, visible evidence and controlled transitions.",
        roles: [
            { label: "Agent", value: "speed" },
            { label: "AGDF", value: "delivery control" },
            { label: "People", value: "decisions" },
        ],
        primaryAction: { label: "Install AGDF", href: "#setup" },
        secondaryAction: { label: "View on GitHub", href: site.repo },
    },
    problem: {
        eyebrow: "Speed needs control",
        title: "Agent activity is not delivery progress.",
        description: "Specification methods, coding workflows and orchestration frameworks help agents plan, build and collaborate. AGDF controls whether that agent output may count as governed delivery progress. That transition requires approved scope, explicit human authority and evidence that supports the claim. Because the control state is recorded in the repository, later agents and reviewers can see what was approved, what was proven and what may happen next.",
        context: [
            "Risk appears when useful agent output starts to look like a finished decision. A patch can look complete even when the request is unclear. The team may not have checked the existing owner, and a test may prove less than the summary suggests. These gaps are easy to miss in a short chat. In a real delivery, they lead to scope drift, rework and unclear responsibility.",
            "AGDF records the delivery state in the repository. It shows the intended result, the available evidence, the approved decision and the next action allowed for the agent. If a fact or approval is missing, AGDF stops visibly and explains what is needed next.",
        ],
        transition: {
            title: "From agent output to governed delivery",
            description: "AGDF does not turn activity into progress automatically. It makes the required decision and evidence boundary explicit.",
            output: {
                eyebrow: "Agent activity",
                title: "Useful work is produced",
                items: ["Plans", "Code", "Tests"],
            },
            control: {
                eyebrow: "AGDF control point",
                question: "May this count as delivery progress?",
                checks: [
                    "Scope is explicitly approved",
                    "Human authority is recorded",
                    "Evidence supports the claim",
                    "Control state is recorded in the repository",
                ],
                visibility: [
                    { title: "Shown in the AGDF interaction", detail: "Current gate, blocker and next allowed action" },
                    { title: "Recorded in .agdf/control/", detail: "Scope, approvals, evidence references and run state" },
                ],
            },
            outcomes: [
                { state: "Requirement missing", result: "AGDF reports the blocker and stops the governed workflow", tone: "risk" },
                { state: "Requirements satisfied", result: "The transition may count as governed delivery progress", tone: "control" },
            ],
        },
        without: {
            title: "Coding agent without AGDF",
            state: "state unclear",
            points: [
                "The prompt is treated as approved scope, even when users and maintainers expect different outcomes.",
                "A green build is treated as completion without checking coverage, fit with the repository or visible behavior.",
                "Confident output hides missing evidence, so the next person cannot see what remains uncertain.",
            ],
        },
        with: {
            title: "Coding agent governed by AGDF",
            state: "safely blocked",
            points: [
                "Approved scope defines the intended outcome and keeps later decisions tied to it.",
                "Evidence supports each important decision and stays separate from assumptions or expectations.",
                "Missing approval stops the work visibly and records both the blocker and the next allowed action.",
            ],
        },
    },
    controlLoop: {
        eyebrow: "One control loop",
        title: "Approved scope → evidence → gate → transition",
        description: "AGDF uses one clear sequence. The amount of process changes with the risk, but the sequence stays the same.",
        steps: [
            { step: "01", title: "Approved scope", description: "Define the intended outcome, boundaries, affected users and responsible people before important work begins. Approval covers that specific result, not every implementation the agent could produce." },
            { step: "02", title: "Evidence", description: "Inspect existing owners, tests, risks and results instead of trusting a confident summary. Record repository facts, test output and visible checks without overstating what they prove." },
            { step: "03", title: "Gate", description: "A person deliberately accepts, revises or stops the next step. The gate makes decision authority clear and prevents work from continuing on implied consent." },
            { step: "04", title: "Transition", description: "Move only to the next allowed state and keep unproven claims visible. The recorded run state tells the next agent or reviewer where the work stands and why." },
        ],
        practice: [
            { title: "Process follows risk", description: "A small documentation change should not require the same process as a security-sensitive product change. AGDF chooses a proportionate path while keeping the same control sequence." },
            { title: "Use the original source", description: "A generated summary does not replace the repository, an approved product decision or observed user behavior. AGDF keeps facts, decisions, evidence and assumptions separate." },
            { title: "Stops explain what comes next", description: "A safe stop should not end with a vague refusal. The run records the missing evidence or approval and names the next action that is allowed." },
        ],
        detailLink: { label: "Read the workflow handbook", href: `${site.repo}/tree/main/docs/handbook` },
    },
    outcomes: {
        eyebrow: "Practical outcomes",
        title: "Keep agent work fast without losing delivery control.",
        items: [
            { title: "Controlled scope", description: "Teams can see which outcome is approved, which source is authoritative and when the agent must stop. Requirements and boundaries stay connected to design, implementation and acceptance. This reduces the risk that a plausible local improvement becomes an unauthorized product change." },
            { title: "Evidence-backed decisions", description: "Tests, fit with the existing system, completion of the approved plan and visible proof replace assumption-driven confidence. AGDF shows what each result proves and what it does not. A passing repository test is useful, but it is not automatically proof of host behavior or user acceptance." },
            { title: "Auditable closeout", description: "Delivered work, remaining gaps, risks and the next allowed action stay recorded after the chat ends. A reviewer can understand how the work progressed without relying on chat history. A later agent can continue from explicit state instead of inventing a new interpretation." },
        ],
    },
    proof: {
        eyebrow: "Evidence and compatibility",
        title: "Repository evidence is not proof of a live host or public listing.",
        description: "AGDF publishes evidence from versioned files in its repository. A screenshot or local build can show what a candidate contains. It cannot prove which version a visitor has installed, whether OpenAI has approved the publisher or whether the plugin is publicly available. Each claim therefore names its source, checked version and limit.",
        selfHosting: "AGDF is developed with its own workflow. Its changes move through approved scope, design, plans, evidence, QA decisions and deliberate closeout. This makes the repository a working example, but each claim still needs independent review.",
        evidenceMeaning: [
            { title: "Repository evidence", description: "Versioned definitions, evaluation cases, validation tools and build results show what the checked source contains and which automated rules pass." },
            { title: "Host evidence", description: "An observed installation or recorded interaction proves behavior only for that version, account, permission set and situation. It does not prove the same behavior for every user." },
            { title: "Publication evidence", description: "Only the platform owner can confirm a public listing, verified publisher identity and actual availability. A ready repository cannot replace that external decision." },
        ],
        surfaces: [
            { name: "OpenAI Codex", state: "Plugin and repository controls", detail: "A reference surface that can run AGDF workflows. Behavior still depends on the installed version, enabled features, permissions and repository state. This website cannot prove those conditions for a visitor." },
            { name: "Anthropic Claude Code", state: "Plugin and repository controls", detail: "A reference surface with its own discovery, features and permission limits. Similar workflow goals do not mean that every host enforces them in the same way." },
            { name: "OpenCode", state: "Available globally, activated per repository", detail: "A global installation makes AGDF available. Governed work still requires valid AGDF control files in the repository being changed." },
            { name: "GitHub Copilot", state: "Installable AGDF plugin", detail: "The Copilot command installs the AGDF plugin with prefixed skills and a consent-bound session hook. Installation still requires restart and direct host verification before loaded behavior is claimed." },
        ],
        publicPlugin: {
            title: "AGDF for ChatGPT and Codex",
            summary: "The Skills-only public candidate shares AGDF workflow skills with repository-verified core-format and plugin-scoped resource checks, without adding an AGDF-operated MCP server, account, telemetry or hosted service. Individual standalone skills and identical cross-host behavior are not claimed.",
            advisory: "Status: Advisory until verified. ChatGPT behavior must be checked for the exact release and host setup.",
            enforcement: "Installation alone does not prove enforcement. Repository files, local checks and hooks still depend on host features, permissions, trust and active AGDF control files.",
            authority: "OpenAI owns verified publisher identity, review, effective availability and listing state. Only OpenAI can confirm those platform states. AGDF is an independent project and not an OpenAI product.",
        },
        screenshot: {
            src: "/assets/codex-agdf-plugin-ui.png",
            alt: "Codex plugin detail page showing the AGDF plugin, its skills, hooks and metadata as an interface example.",
            caption: "Interface example only. Package metadata describes the intended release. Check the installed version and host before treating this as observed behavior.",
            width: 3284,
            height: 2354,
        },
        links: [
            { label: "Inspect the source", href: site.repo },
            { label: "Read the technical contracts", href: `${site.repo}/tree/main/plugin/meta/contracts` },
            { label: "See current releases", href: `${site.repo}/releases` },
        ],
    },
    installation: {
        eyebrow: "Install for your coding agent",
        title: "Install AGDF, then check that your agent can see it.",
        description: "Codex and GitHub Copilot each have one supported plugin command. Installing the package, loading it in the host and receiving permission to continue delivery are separate steps.",
        beforeYouStart: [
            "Run the appropriate command in a terminal with Node.js and npm available. It installs the current published AGDF package. Installing the package does not change a repository.",
            "Restart the coding agent so it can find the plugin. Then check the visible plugin and version instead of assuming that a completed command proves activation.",
            "When you start work in a repository, ask AGDF to inspect existing control files or create the required setup. AGDF will show the current approval point and what may happen next.",
        ],
        command: "npx --yes @agdf/cli@latest codex\nnpx --yes @agdf/cli@latest copilot",
        nextStep: "Then ask AGDF to check the current gate for a real repository request.",
        alternatives: { label: "See every installation path", href: repoDocument("INSTALL.md") },
    },
    responsibility: {
        eyebrow: "Responsibility stays human",
        title: "Governance helps. It does not replace engineering judgment.",
        description: "AGDF structures delivery decisions and evidence. People still decide product intent, architecture, security, privacy, regulatory needs, test quality, acceptance and release.",
        limits: [
            "Not autonomous shipping without human approval. AGDF structures each step but does not give release authority to an agent.",
            "Not a compliance certificate or legal assessment. Teams must identify their own obligations and seek qualified advice when needed.",
            "Not an AGDF-operated service, account or telemetry platform. The public candidate is distributed as a checked plugin-scoped skills bundle and repository controls; individual standalone skills and identical cross-host behavior are not claimed.",
            "Not a substitute for experienced developers and reviewers. Clear documentation cannot repair weak requirements, tests or decisions.",
        ],
        decisionOwners: [
            { title: "Product and scope", description: "People decide which problem matters, which users and systems are included, which trade-offs are acceptable and whether a requirement is ready for approval." },
            { title: "Engineering and assurance", description: "Experienced owners decide whether the design fits the system, whether security and privacy concerns are addressed and whether the evidence supports the quality claim." },
            { title: "Acceptance and release", description: "Authorized reviewers decide whether visible behavior is accepted and whether a candidate may be released. AGDF records the decision but cannot make it for them." },
        ],
        project: `AGDF was created by ${site.author.name}, ${site.author.role.toLowerCase()}. It is an independent Apache-2.0 open-source project.`,
        links: [
            { label: "GitHub", href: site.repo },
            { label: "Handbook", href: `${site.repo}/tree/main/docs/handbook` },
            { label: "Support", href: "/support" },
            { label: "Contact", href: `mailto:${site.contactEmail}` },
        ],
    },
} as const
