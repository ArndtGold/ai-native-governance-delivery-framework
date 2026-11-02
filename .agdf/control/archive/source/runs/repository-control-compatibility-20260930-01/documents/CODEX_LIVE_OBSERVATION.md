# Codex installed-runtime live observation

Date: 2026-09-30
Status: installed behavior and native multi-repository SessionStart observation passed
Run: repository-control-compatibility-20260930-01
Thread: 01a0f12b-b674-70c2-a860-5b1a2cd30932
Trigger: User reported plugin reinstallation and requested a live test. No installation, restart or permission mutation was performed by this test.

## Identity and actual loaded context

Installed plugin: `0.14.5+codex.local-417614078066`
Root: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-417614078066`
Runtime digest: `acd594ce75a4fb117ebaba1f9fc583fd310c32e913520afa2a6c6fbc14635eb5`
Normalized source digest: `4176140780668f64208d517f9dec5f345e380b54168bd713d93cee7ad2588348`
These match the previously verified candidate exactly. The new dispatcher binding and repository-control facts were supplied to the model in this existing Codex thread at the start of the live-test turn. Current actual repository state is current / migration 0 / repair 0 / historical 61; Doctor separately reports block / 64 findings. This demonstrates refreshed installed plugin context, not a newly created thread, native app restart or another host.

The existing real Codex consent receipt was used unchanged. Installed startup emitted expected facts; its before/after receipt digest stayed identical. The read-only `runtime-checks status` CLI returned decision_required / host_permission_unverified: that command has no native `/hooks` inventory. We do not reinterpret it as an observed permission grant. The current model-visible host facts and explicit installed-hook execution are recorded as separate evidence.

## Executed observations

All application targets are disposable local repositories under `/private/tmp/agdf-installed-live-20260930-PXiuyz`. Local Git history contains only a synthetic fixture original; no remote acquisition occurred. Commands invoked the cache runtime directly, from root B, with explicit absolute targets. No installer or MCP configuration service was used.

| Case | Observed result | Evidence |
|---|---|---|
| Legacy A / installed startup | migration_required, count 1, German fixed installed-runtime hint; read-only. | live-evidence/a-startup.txt |
| Current B / installed startup | current, no maintenance notice; read-only. | live-evidence/b-startup.txt |
| Absent C / installed startup | absent, no maintenance notice; read-only. | live-evidence/absent-startup.txt |
| Missing original E / installed startup | repair_required, exact selected root and direct hint; read-only. | live-evidence/missing-startup.txt |
| A / Details and Later | Actual PTY choices 3 then 2; byte-identical root, exit 0. | live-evidence/defer-tty.txt |
| A / Migration | Actual PTY entry 1 shows separate reviewed batch; apply 1 migrates one run, valid seal, one committed original journal, exit 0. | live-evidence/migration-tty.txt; application-results.json |
| D / Proven repair | Entry 1 searches; details 3 show exact Git source and approval-reset consequence; apply 1 restores original, resets synthetic unproven approval, seals run and writes one committed backup, exit 0. | live-evidence/repair-tty.txt; application-results.json |
| E / No original | Search shows missing UR.md and no apply choice; 2 leaves every byte unchanged, needs_input / repair_required, exit 2. | live-evidence/missing-original-tty.txt |
| Repeat and reinspection | A/D return current; repeat changes no byte/revision; guided current A offers no menu; subsequent installed hook emits no maintenance notice. | live-evidence/repeat-tty.txt; a/repair-after.json; a/repair-startup-after.txt |
| Isolation / permission data | B/C/E unchanged; real consent receipt unchanged; no missing original synthesized. | live-evidence/readonly-results.json; application-results.json |

Raw command/hook transcripts (PTY carriage returns normalized for readability), SHA-256 references and identity/context facts are in LIVE_EVIDENCE.json. Inputs were agent-entered test choices, not invented human gate approvals or human UAT. One initial missing-original attempt was polled before its slow first menu appeared and was cancelled before any choice; the recorded repeated attempt completed normally and the fixture remained byte-identical. Owned waiting test processes were cleaned up.

## Native session follow-up: resolved

NATIVE_SESSION_OBSERVATION.md and NATIVE_SESSION_EVIDENCE.json record four real fresh native Codex app-server SessionStart events: repair_required E and migration_required F receive correct target-specific German hints; current B and absent C receive no maintenance hint. Hooks/list reports the installed candidate enabled and trusted on each root. Native completed events deliver exact candidate bindings and repository facts in about two seconds without input. Targets and the real receipt remain byte-identical. These observations supersede the previously missing automatic session boundary (TP-E01 / SCN-028/029).

This is actual local Codex host execution via app-server, not a direct child hook invocation or a graphical desktop restart. Turns were interrupted after native context capture; no completed model answer or human QA/UAT is claimed. SCN-030 direct installed PTY operations remain separately evidenced above. No installation, trust change, permission receipt change, real historical maintenance or VCS action was performed.
