# UR: Claude Loaded-Host Conformance Observation

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-08-26
Owner: Arndt Gold

## 1. Problem

The host-conformance matrix (`agdf-live-host-conformance-matrix`) carries 12 Claude Code rows as `host_unavailable`, and several completed runs disclose "authenticated Claude Code live observation" as a standing limitation. Until 2026-08-26 no reliable local Claude host with a current AGDF build existed; now one does (local install `0.13.5`, content-fresh, restart pending).

## 2. Goal

The 12 predefined Claude cases (HC-01 through HC-12) are observed on a real, freshly restarted Claude Code host running the locally installed build, producing durable loaded-host evidence that replaces the standing evidence gap.

## 3. Scope

- Execute HC-01–HC-12 exactly as defined in the historical matrix (target resolution, activation, approval precision, enforcement honesty) in a fresh post-restart session.
- Record one `claude_code` preflight and 12 observation rows field-aligned with the historical `OBSERVATION_SCHEMA.json` observation rows, under this run's own id (the historical schema is run-id-pinned; this run derives, it does not validate against it).
- Capture loaded-host identity: SessionStart runtime-profile line, host version, plugin list version, installed-copy digest/provenance.
- New durable artefacts only; the historical matrix JSON and report remain untouched.

## 4. Non-Goals

- Rewriting or amending historical matrix evidence.
- Fixing findings inside this run (each finding becomes its own follow-up).
- Codex or OpenCode rows, release or publication claims.
- Claiming subagent or host enforcement beyond what is directly observed (HC-12).

## 5. Acceptance Signals

- 12 observation records with per-case `result: pass | limitation | fail | not_observable` and honest `enforcement_class`.
- One preflight row proving the loaded host identity (restarted host, current build).
- A compact observation report naming which standing limitations are now evidenced and which remain.

## 6. Existing Source Of Truth

- `.agdf/control/artefacts/agdf-live-host-conformance-matrix/HOST_CONFORMANCE_MATRIX.json` owns the case definitions and expected behaviors.
- `.agdf/control/artefacts/agdf-live-host-conformance-matrix/OBSERVATION_SCHEMA.json` owns the observation field vocabulary.
- Run `claude-local-install-content-refresh` proves the installed copy is content-fresh.

## 7. Risks And Unknowns

- The observing session is itself the observed host; probes must be designed so the observation does not mutate gate authority (read-only probes, controlled approval phrasing).
- HC-12 (subagent enforcement coverage) may only be classifiable as a limitation, not a pass.

## 8. Next Step

Brownfield Review and Mode/Slice Decision; then restart Claude Code and execute `OBSERVATION_PROTOCOL.md` in a fresh session.
