# Native evaluation prerequisites observed during TP authoring

Date: 2026-10-25
Run: mcp-contract-completeness-20261025-01
Evidence class: read-only local availability inspection; no native session or authorization proof.

- command -v claude: /usr/local/bin/claude.
- claude --version: 2.1.193 (Claude Code).
- uname -sm: Darwin x86_64.
- Node process inspection: v22.22.3, darwin, x64.
- Boolean presence check only: CLAUDE_CODE_OAUTH_TOKEN is not available in this tool process environment. No value was read into output, and no credential file was opened/copied.
- Existing evals/scripts/run-mcp-ergonomics-native.js installs the current candidate into an isolated Claude home and starts paid sessions. It stops without the token unless the separate --credentials-copy fallback is passed; that fallback is outside this plan's authority.
- Current runner takes model/task/repetition selectors but always both canonical variants and the task-set USD 25 cap. A focused mcp_only/USD 5 route requires the scoped selector extension planned by T-008, not silently invoking defaults.
- Canonical task set names claude-sonnet-5-5; actual service/model authentication/availability was not tested. No API or paid probe occurred.
- No approval for paid use or candidate installation is established by tool availability, historical task-set limits or the user's SD approval. Proposed N is pending substantive user decision, external token availability and TP approval.
