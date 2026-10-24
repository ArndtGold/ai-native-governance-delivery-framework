# Claude Code CLI on Windows: release qualification

Candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692
Version: 0.20.0
Clean source commit: 460027fabc58fe0da041bbabe117519dd1f696b7

Mandatory cases on native Windows: dispatch, failure_case, skill_continuation, upgrade, recovery. Each case installs, discovers, invokes and removes AGDF in an isolated scope.

1. Use a clean checkout of that commit with complete history and lockfile dependencies. Run npm run build:prepare, then npm --prefix packages/mcp-server ci --ignore-scripts. Recompute and validate the candidate content before execution.
2. Start every command from a terminal outside the Claude Desktop app package, for example one opened through explorer.exe. Keep the existing Claude authentication on this computer.
3. Freeze the actual tuple: node scripts/native-probes/release-evidence.mjs preflight --candidate candidate.json --host claude --surface cli --model MODEL --output tuple.json, where MODEL is the model actually available.
4. For each case run npm run native:claude-e2e -- --candidate candidate.json --tuple tuple.json --model MODEL --scenario CASE. The harness refuses a changed tuple; never edit a completed record.
5. Return only the probe-results directories with release-records.json and their referenced captures, plus tuple.json and candidate.json. Credentials, profiles and unrelated transcripts stay on this computer.
6. A reviewer runs review-template, checks the primary captures, marks the review and imports with --host claude --surface cli. Missing or failed cases stay open; this handoff grants no gate approval or publication.
