# Desktop plugin update — 2026-10-17

Run: `agdf-cockpit-plugin-integration-20261016-01`.
Delivery binding: revision 15, `7f1c99af-c944-4e17-a7d1-dc1de43dcce7`, CD+Tests, approved TP.
User instruction: inspect the installed version, update AGDF to the integrated Cockpit candidate, then continue the manual Desktop proof.

This supplementary execution record preserves the existing sealed reports. It is not native UI qualification, a completed migration, QA or acceptance.

## Installed change and verification

- Before: enabled `agdf@agdf`, `0.14.5+codex.local-fb1def114314`, only the `agdf` plugin MCP declaration. User-provided pre-update screenshots are retained as baseline observations.
- After: enabled `agdf@agdf`, `0.14.5+codex.local-3753a404b41f`, with exactly `agdf` and `agdf-cockpit` in the plugin declaration.
- Marketplace and native Codex cache both validate matching installation provenance and the reviewed source digest `3753a404b41f4d3a60ed17454511bf7410ba438a389dbd53f944e8870cbe1653`.
- Both copies and the prepared immutable runtime match server digest `34d86a933d4270465786d3729b1e25e39890105220415c61f4e61360239ee245`, dispatcher digest `41c93fd4a43388e873187c6f5364e7b570503b03921b4cd30352e82e5c090edc`, and SDK digest `b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb`.
- UI digest in both plugin copies: `sha256:19f6546a5401d9f89a0e78b5500f131b650de4e89b278883e2ee64101368a979`.
- Prepared generation: `65df822bdb20cdd0c1efc4dab06042d131767e63b55c77081a45a33c7c9acde4/0.14.5` under the normal Codex plugin data directory.
- A fresh model-free native Codex App Server inventory observed `server_id: agdf-cockpit`, `plugin_id: agdf@agdf`. This is connection-attribution evidence only. It does not prove visible Desktop rendering or interaction. The first sandboxed probe was unavailable; the host-permitted probe returned the observation.
- All 56 source/evidence files in the repaired final-source manifest still match. No implementation change or repeated canonical test run was necessary.

## Existing installer and result

The normal repository-owned installer ran from the already tested, matching isolated source copy, with explicit original project target and invocation directory:

```sh
INIT_CWD=/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework npm --prefix /private/tmp/agdf-cockpit-cli-source/packages/cli run install:codex -- --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework --accept-plugin-capabilities --json
```

Global installation writes used the permitted elevated execution path. No cache was patched manually and no new standalone server was registered.

The installer exited **1** with structured `result: partial`, `failure: null`, installed version verified, `configured_pending_restart`, and `mcp_ready_hook_verification_pending`. The update succeeded; fresh Desktop session activation and trusted SessionStart hook execution are still unverified. Do not interpret the overall partial status as either a fully qualified installation or a failed publication. Repository control inspection reported `current`; no control repair was performed.

## Preservation and pending transition

Project config is byte-identical to the pre-update copy: `sha256:20b1eec99e1540fdf118b046c6a132507f9ab5c4cfa6dafc2e0851a8149b89a8`.
User config is byte-identical to the freshly captured pre-update copy: `sha256:0155a9c155fecdba26b1c9a5e595832c3ee0175fdfbb7aed569182d5c5d52b17`. This current baseline differs from the earlier preflight; the update did not make that intervening change.

The active distinct-key `agdf-cockpit-local` section remains intact. The previous owned marketplace is retained at `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf.backup`, and its installation marker exactly matches the pre-update marker. The normal publication journal is `cockpit_qualification_pending`, bound to the original target, previous digest and candidate digest. Do not remove the backup/journal or repeat installation to clear this pending state; complete or guardedly roll back through the existing lifecycle owner.

An additional private pre-update archive and config copies exist at `/private/tmp/agdf-cockpit-desktop-update-20261017`. Config contents and authentication material are not copied into this Run's evidence.

## Manual continuation and limits

The user must fully quit the Desktop app with Cmd+Q and reopen it. Inspect the AGDF plugin detail page: both `agdf` and `agdf-cockpit` should be offered. Retain a screenshot of that post-reload observation. Then use a fresh project chat/session to verify the new loaded provider and trusted hook, and open the plugin Cockpit for the exact original target and this Run.

Continue the approved native render/read/context/teardown procedure with user-operated Desktop steps and actual host events. Computer Use cannot automate the ChatGPT Desktop app itself; direct screenshot/interaction observations must come from the user. The current legacy-bearing installation is the distinct-key migration path, not a clean-install or isolated same-key proof. N-CLEAN's separate clean-context scenario, N-SAMEKEY and disposable native lifecycle scenarios remain outstanding.

Retire the actual legacy section only after matching native qualification and lifecycle evidence validation. No legacy retirement, publication settlement, native UI pass, final CD+Tests completion, review/QA/UAT/OR decision, commit, push or release occurred.

Evidence: `evidence/desktop-update-20261017/`, with 13 indexed files in `SHA256SUMS.json`: installer raw log and structured result, pre-update identities, version/config readback, source recheck, installed tuple, provider probes, retained publication journal/backup identity, and two user-supplied pre-update screenshots.
