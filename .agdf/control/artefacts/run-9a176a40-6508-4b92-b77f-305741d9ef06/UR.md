# UR: Rebuild missing or stale MCP UI resources during local installation

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-30
Owner: Arndt Gold

## 1. Problem

The local Codex installation stops with AGDF_DECISION_UI_INVALID when ignored MCP UI output is missing or its source digest no longer matches the checkout. The shared local preparation currently calls syncPackageAssets before ensuring valid UI resources. Rebuilding the UI manually resolved the reported failure; source digest and package preparation were then validated.

## 2. Goal

Running the existing local install command automatically obtains current, valid UI resources when needed, without requiring a separate manual UI build.

## Affected Users

Contributors installing an unpublished checkout through npm run install:codex and the sibling local install commands, including the user who reported the Codex installation failure.

## 3. Scope

- Update the shared local preparation used by Codex, Claude, Copilot and OpenCode.
- Validate the resources required by the selected surface using the existing canonical validation owner.
- Reuse valid builds. For missing, stale or otherwise invalid required resources, invoke the existing canonical MCP UI build, then validate again before packaging or host installation.
- Handle required local UI build prerequisites through existing dependency/build mechanisms or provide an actionable failure; do not hide build errors.
- Extend existing preparation tests for missing output, stale source binding, valid-build reuse, failed build and rejection of invalid rebuilt output. Preserve surface-specific packaging and installation isolation.
- Document the automatic preparation behavior in the existing contributor installation guidance where needed.

## 4. Non-Goals

No UI feature or appearance changes, integrity-check relaxation, general release-build rewrite, automatic compatibility-evidence refresh, host installation, MCP registration, publication or VCS handoff.

## 5. Acceptance Signals

1. A local Codex preparation succeeds with missing UI resources and after a source change invalidates the UI source digest; it packages validated current resources.
2. Valid required UI resources are reused without invoking the UI build.
3. Build failure or invalid rebuilt resources stops preparation before host installation and exposes an actionable cause.
4. Each existing surface retains its required UI payload and unrelated profile generation remains excluded.
5. Regression checks detect the reported missing/stale-build failure on the original implementation and pass after the correction. Repository checks and package preparation are reported separately from native-host loading or human UAT.

## 6. Existing Source Of Truth

- packages/cli/scripts/prepare-local-plugin.js: shared local preparation.
- packages/cli/scripts/install-local-plugin.js: preparation before assembly and host installation.
- scripts/cockpit-ui-build.mjs: canonical UI validation and source digest.
- packages/control-ui/scripts/build-mcp.mjs and packages/control-ui/package-lock.json: canonical UI build and dependency lock.
- packages/cli/lib/npm-invocation.js: platform-specific npm invocation.
- scripts/sync-package-assets.js: selected-surface packaging.
- packages/cli/scripts/local-preparation-test.js and plugin-mcp-cockpit-variant-test.js: existing preparation and integrity coverage.
- CONTRIBUTING.md, GOVERNANCE.md and docs/development/verification.md: contribution and evidence boundaries.

## 7. Risks And Unknowns

Dependency availability on a clean checkout, platform-specific npm invocation and source changes during a rebuild need assessment through existing owners. Failed rebuilding must not allow stale resources into installation. Native-host qualification remains outside this bounded preparation fix.

## 8. Next Step

Review this UR with Approval: UR. Then perform Brownfield Review and select the smallest justified delivery path before implementation.

## AGDF Approval Summary (de; source=en)

- Problem: Der lokale Installer bricht bei fehlenden oder veralteten MCP-UI-Builds ab; der manuelle Neubau hat den gemeldeten Fehler behoben.
- Ziel: Lokale Installationen aus dem Checkout sollen die erforderlichen aktuellen UI-Ressourcen automatisch erhalten. Betroffen sind Entwickler, die Codex oder eine andere bestehende lokale Oberfläche installieren.
- Umfang: Gemeinsame Vorbereitung, bestehende Validierung und Build-Owner nutzen; gültige Builds wiederverwenden, fehlende oder ungültige Builds neu bauen und anschließend validieren; Voraussetzungen und Fehler verständlich behandeln; vorhandene Tests und bei Bedarf Installationshinweise ergänzen.
- Abgrenzung: Keine UI-Funktionen, Lockerung der Integritätsprüfung, Release-Aktionen, Hostinstallation oder MCP-Registrierung.
- Abnahme: Fehlende und veraltete Ressourcen werden repariert; aktuelle Builds werden wiederverwendet; Buildfehler oder ungültige Ergebnisse stoppen vor der Hostinstallation; oberflächenspezifische Pakete bleiben korrekt. Regressionstests müssen den ursprünglichen Fehler erkennen.
- Verantwortung: prepare-local-plugin.js, cockpit-ui-build.mjs und build-mcp.mjs bleiben die bestehenden Owner; CONTRIBUTING.md und GOVERNANCE.md gelten weiter.
- Offen: Abhängigkeiten im sauberen Checkout, npm-Aufrufe je Plattform und Quelländerungen während des Builds sind durch die bestehenden Owner zu prüfen. Repositorytests beweisen keine native Hostfreigabe.
- Nächster Schritt: Approval: UR; danach Brownfield Review und proportionale Pfadwahl vor der Umsetzung.
