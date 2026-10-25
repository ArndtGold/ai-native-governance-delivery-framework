# F-002: Owner decision on the exact Copilot payload baseline

Run: mcp-contract-completeness-20261025-01
Date: 2026-10-25
Owner: Arndt Gold
Evidence class: caller-forwarded deliberate user instruction; cooperative local, no independent human-origin proof

## Exact user decision

"Ja, erneuere den TP und passe die Copilot-Baseline auf 3.509.461 Byte an. Die MCP-Limits bleiben unverändert. Danach weiter mit den Codex-Durchläufen mit Reasoning low."

This directly accepts the concrete previously presented COPILOT_PAYLOAD_GROWTH_PROPOSAL.md and COPILOT_PAYLOAD_BASELINE_PROPOSED.json direction: 397 files, max_bytes 3495133 -> 3509461, measured delta 14328 bytes, zero headroom. The owner requests renewal of the TP and continued Codex trials with gpt-6.1-sol/low. This is substantive source-revision intent and explicit authority for that bounded baseline change. It does not approve unrelated threshold growth, additional API spending, host/plugin installation, copied credentials, publication or VCS actions.

## Exact approved sources and statement affected

- UR.md @ sha256:90da41de9d341e20349f682f49b7f23511d869351e71aac699aa8d530860c47a
- PRD.md @ sha256:2a0c4a464e97c0df1a0e72544c9c98073f98273d7e24d7ad67e3e6b85d089dfa
- SD.md @ sha256:04adc7913d3889900fb3594167e0e800c7cce4a9481286119c12faf88b14788f
- TP.md @ sha256:586f4228a3cf5e178889798659e8d0bc73f53363910f26c2a3c024d7d4c1c272

The earliest changed approved statement is TP: "No lockfile/dependency/version/threshold change is authorized by this TP." The Out Of Scope phrase "changed dependencies/SDK/limits" also needs the same specific baseline exception. The revised plan must retain every MCP criterion, task/scenario mapping and SDK/authority boundary and explicitly distinguish the one source/digest-reviewed Copilot distribution baseline reconciliation from the unchanged interface/result/performance limits.

MCP definition limit 8192 bytes/tool, combined command/decision 24576, input 65536, result 1048576, cold p95 1500ms and warm p95 1000ms all remain unchanged. Preserve SDK/dependency versions, metadata source mapping and validation, profile exclusions, zero headroom, historical/native baselines, and the existing two fresh Codex repetitions, existing ChatGPT account and reasoning low.

## Scope and downstream handling

UR intent, PRD acceptance and SD architecture are unchanged; this is a planning exception for the exact observed distribution size. Use the existing versioned TP source-revision owner with exact source and quality facts; preserve its archives, old evidence, original approvals and application receipt. Retain implementation bytes, but renew the TP and reassess preparation/tests against the changed source rather than relabel old evidence current. F-002 is resolved in substance by this answer; its machine resolution still requires source-linked evidence and valid renewed plan state. This user instruction is not the exact Approval: TP formula for a future newly presented TP.
