# UR: Prepare AGDF 0.20.0 for Codex and Claude Code

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-20
Owner: AGDF maintainer

## 1. Problem

The repository still declares AGDF 0.14.5 despite substantial changes to the Core, package boundaries, MCP interface and control UI. Public installation guidance presents Codex, Claude Code, GitHub Copilot and OpenCode together. The current compatibility report records deterministic adapter scenarios but does not establish current native host qualification. The publication workflow requires Codex native evidence without an equivalent Claude Code release requirement.

## 2. Goal

Prepare one coherent AGDF 0.20.0 release candidate with Codex and Claude Code as its intended qualified hosts, close the missing native host evidence for the release scope, and explicitly retain GitHub Copilot and OpenCode as experimental integrations. Qualification must follow observed results for the exact candidate and host environment.

## Affected Users

AGDF users installing or upgrading on Codex and Claude Code, maintainers assessing release readiness, and existing Copilot and OpenCode users who need an accurate experimental-support statement.

## 3. Scope

- Prepare version 0.20.0 through the canonical version and release preparation owners, keeping dependent packages, plugin metadata, generated distributions and release history coherent.
- Align installation guidance, release notes and compatibility reporting with Codex and Claude Code as the intended qualified hosts and Copilot/OpenCode as experimental. Preserve existing experimental adapters and their regression coverage.
- Define the exact release qualification matrix during PRD/SD: host variant, client version, operating system, architecture, model, Node version, candidate identity and claimed capabilities. Do not infer Desktop or embedded MCP App qualification from CLI observations.
- Obtain fresh native evidence for installation, discovery, invocation, controlled failure, effective upgrade and recovery, and clean removal on the declared Codex and Claude Code release combinations. Include supported skills/MCP paths and automatic checks according to their actual capability claims; keep hook trust and execution evidence distinct from successful MCP calls.
- Claude Code testing runs on another computer, as clarified by the user. Prepare a reproducible test handoff for the same release candidate and validate the returned evidence before accepting it. Do not require local Claude execution or transferable Claude credentials on this computer. A remote test in progress is not yet a completed qualification.
- Reuse and extend existing native probes, evidence validation and release workflow owners so both intended qualified hosts have mandatory candidate-bound evidence before publication. Preserve existing Codex Linux/Windows requirements unless an explicit support-scope decision changes them.
- Retain durable, redacted observations identifying the exact tested candidate, host environment, expected and actual results, limitations and cleanup. Refresh compatibility evidence without converting fixture results or historical observations into fresh native proof.
- Produce a reviewable release candidate and readiness report. Record inaccessible native platforms, authentication or rendering prerequisites as concrete open blockers rather than successful qualification.

## 4. Non-Goals

- Publish packages, create or push release tags, submit a marketplace listing, or claim release approval under this preparation request.
- Remove Copilot/OpenCode, qualify their native hosts, or create separate AGDF version lines per host.
- Add unrelated product features, alter governance approval authority, weaken evidence checks, or mark unexecuted tests as passed.
- Change the user's active host installation or credentials merely to make an isolated test pass. Prefer isolated profiles and preserve unrelated worktree changes.

## 5. Acceptance Signals

- The prepared candidate consistently declares 0.20.0 and passes the canonical release preparation, packaging and affected regression checks.
- User-facing documentation and release metadata consistently distinguish the two intended qualified hosts from the two experimental integrations.
- Each declared qualified combination has fresh native observations bound to the exact candidate, including installation, discovery, invocation, controlled failure, upgrade, recovery and removal. Missing observations remain visible blockers; green deterministic tests cannot close them.
- Mandatory release validation checks Codex and Claude Code evidence and rejects failed, incomplete, stale, mismatched or duplicate observations.
- Claude evidence from the other computer identifies its actual host/OS/model tuple and the exact tested release candidate. Accept it only after candidate identity, required cases, outcomes and cleanup have been checked; keep the Claude qualification open until the matching results arrive.
- Capability claims distinguish CLI, Desktop, MCP App rendering, available skills, automatic checks and technical enforcement wherever applicable. Qualification is limited to the combinations and capabilities actually demonstrated.
- A release readiness report exposes completed checks, unresolved prerequisites and required human decisions without claiming publication or human acceptance.

## 6. Existing Source Of Truth

Canonical plugin metadata is owned by `plugins/agdf/meta/agdf-plugin.definition.json` and `plugins/agdf/plugin.json`. Package versions and dependencies live in the package manifests. Version changes and preparation use `scripts/release-bump.js`, `scripts/release/version-bump.js`, `scripts/release/version-coherence.js` and `packages/cli/package.json`'s `release:prepare`. Host installation behavior remains in `packages/cli`; governance remains in `packages/core`.

Native probe and evidence owners are `scripts/native-probes/`, `.github/workflows/codex-release-e2e.yml` and `.github/workflows/publish-agdf.yml`. Compatibility reporting is owned by `scripts/host-compatibility/` and `docs/compatibility/`. Public guidance includes `README.md`, `INSTALL.md` and `docs/maintenance/README.md`. Existing runs are dependencies or historical evidence, not substitutes for this release's qualification.

## 7. Risks And Unknowns

Read-only preflight found Codex CLI 0.163.0 and Claude Code 2.1.193 on this macOS environment. This is client availability, not successful authentication, installation or qualification. The existing Codex release policy pins another client version and requires native Linux and Windows; availability of remote runners and credentials must be established before executing that matrix. The user clarified that Claude testing runs on another computer. Its actual client/OS/model tuple, tested candidate and returned results must be established from that computer's evidence; the locally installed Claude version does not describe that test. Local Claude authentication is not a prerequisite for this release preparation. Existing Claude probes still need to supply or be complemented by candidate-bound upgrade/recovery evidence and an appropriate test handoff. Remote access and remote results are not assumed available.

The working tree contains unrelated modifications; preserve them and qualify a clean, reviewable candidate. Existing active runs and historical approvals may not cover the final candidate. Exact operating-system and host-variant coverage, supported upgrade baselines, model selection and bounded test execution are downstream PRD/SD decisions; they must be settled before qualification and reported transparently if prerequisites remain unavailable.

## 8. Next Step

Review and approve this UR with `Approval: UR`. Continue through canonical Brownfield Review and Mode/Slice routing to PRD, SD and TP as required. Implement version preparation and execute native qualification only after the applicable approvals. No UI preview was requested.

## AGDF Approval Summary (de; source=en)

AGDF 0.20.0 soll für Anwender und Maintainer mit konsistenten Versionen, Dokumentation und nativen Nachweisen für Codex und Claude Code vorbereitet werden. Copilot und OpenCode bleiben experimentell; ihre Adapter und Tests bleiben erhalten. Der bisherige Stand 0.14.5 und die vorhandenen Tests belegen diese neue Host-Qualifikation noch nicht.

Der Claude-Test läuft auf einem anderen Rechner. Dafür werden derselbe Release-Kandidat und prüfbare Ergebnisse zu Host, Betriebssystem, Modell, Installation, Erkennung, Aufruf, Fehlerfall, Upgrade, Wiederherstellung und Entfernung benötigt. Die Nachweise werden nach Rücklieferung geprüft; bis dahin bleibt Claude offen. Lokale Claude-Ausführung oder lokale Claude-Zugangsdaten sind dafür keine Voraussetzung. Die genaue Testmatrix und Upgrade-Baselines werden vor Umsetzung festgelegt; bestehende Codex-Linux-/Windows-Anforderungen bleiben erhalten. CLI-Nachweise qualifizieren keine Desktop- oder MCP-App-Oberfläche; Hook-Vertrauen und Ausführung bleiben gesondert nachzuweisen.

Erfolg sind bestandene Release-Prüfungen und passende native Belege am exakten Kandidaten. Fehlende oder abweichende Ergebnisse bleiben Blocker. Versionspflege, Installation, Core, Probes und Release-Workflow behalten ihre vorhandenen Eigentümer; fremde Arbeitsänderungen bleiben erhalten. Veröffentlichung, Tags und Marketplace-Einreichung sind ausgeschlossen. Nach UR-Freigabe folgen die erforderlichen Analyse- und Planungsstufen, anschließend Umsetzung und Host-Qualifikation.
