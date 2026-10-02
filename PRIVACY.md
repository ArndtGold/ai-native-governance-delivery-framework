# Privacy

Last updated: 2026-09-29

AI Governance & Delivery Framework (AGDF) is an independent open-source project. Its distribution
includes plugins, a CLI and a locally run MCP server. AGDF does not operate a hosted backend, user
account, telemetry service or analytics service. The project does not receive your prompts,
conversations, repository contents or plugin usage through an AGDF-operated service.

## Processing by OpenAI and other platforms

When you discover, install or use AGDF through ChatGPT, Codex or another host, that host may process
account data, prompts, conversations, files, repository content and technical information under its
own terms and privacy policy. AGDF does not control that processing. Review the policy and settings
of the host you choose before providing personal, confidential or regulated information.

## Local and repository access

AGDF skills may guide an authorized coding agent to read or change files, run commands and create
delivery artefacts in the repository or workspace you make available. Local hooks may inspect
installation and repository control state at session start. The local MCP server can read repository
control files and return dispatch or inspection results to the connected host; its tools are
read-only and non-authorizing. Explicit CLI lifecycle and installer commands can create or change
local control files, plugin registrations and AGDF-owned installation files. The host, its tools and
permissions, and your explicit approvals determine what the agent can access. AGDF does not
independently transmit that material to an AGDF-operated service.

Running an `npx` command such as `npx --yes @agdf/cli@latest` asks npm to obtain packages from its
registry. The Claude Code and Codex plugins also contact the npm registry once: the installer, or the
first start of the plugin's MCP server, installs the `@modelcontextprotocol/server` SDK from a lockfile
shipped with the plugin into a local data directory (for Claude Code `${CLAUDE_PLUGIN_DATA}`) and
rejects packages that differ from the shipped versions, unless you set `AGDF_MCP_ALLOW_UNVERIFIED_SDK=1`.
The registered MCP server for other hosts (`mcp enable`) is installed from npm without such a lockfile.
npm and the selected host may process
technical request information under their own policies. Once a runtime is prepared, later starts of
the same version do not repeat that package acquisition step.

Repository artefacts can contain requirements, decisions and evidence. Do not place secrets,
credentials, identity documents, sensitive personal data or Persona verification material in those
artefacts. Review generated files before committing or sharing them.

## Public project services

GitHub Discussions, issues, pull requests and other public repository interactions are processed by
GitHub and may be publicly visible. Do not publish confidential information or security reports
there. Follow [SECURITY.md](SECURITY.md) for suspected vulnerabilities and [SUPPORT.md](SUPPORT.md)
for the appropriate support channel.

The public project website is a static site. AGDF does not intentionally add project-operated
tracking, advertising or analytics to it. Infrastructure providers may still process ordinary
request data needed to deliver the site under their own policies.

## Changes and contact

This notice may change when AGDF's distribution or data flows change. Material changes must be
reflected here before the project makes a broader privacy claim. For privacy questions about the
independent AGDF project, contact [agdf@iself.eu](mailto:agdf@iself.eu). Questions about processing
by OpenAI, GitHub or another host should be directed to that provider.
