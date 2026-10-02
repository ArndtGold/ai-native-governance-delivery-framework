# PRD: Pinned and verified plugin MCP SDK acquisition

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-02
Owner: Repository owner
Traceability contract: criteria-chain-v1

## 1. Product Scope

For the Claude Code and Codex runtime plugins, the plugin MCP runtime acquires its MCP SDK only as the
exact, reviewed dependency tree shipped with the plugin version:

- The SDK is installed from a lockfile that ships in the plugin payload, with npm integrity
  verification of every package.
- The plugin ships an expected SDK digest. Before a prepared stage becomes the active runtime, the
  installed SDK tree must match the locked package set exactly and its digest must equal the expected
  value.
- Existing prepared runtimes are re-verified on the next start and re-prepared on mismatch.
- A deliberate, explicit override allows an unverified SDK; its use is visible and recorded.
- Lockfile and expected digest are produced by the build from the repository source of truth.
- Architecture documentation (§6.1) and `PRIVACY.md` describe the new behaviour.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics (Brownfield Review: new fail-closed
  diagnostic, unchanged activation and recovery)
- primary_user_intent: Use the AGDF MCP tools in Claude Code or Codex with confidence that the runtime
  code is exactly what the plugin version shipped.
- success_signal: The MCP server starts as before on a faithful registry; on any deviation it does not
  start and names the reason and the recovery.
- primary_decision_or_action: none in the normal path; on deviation the user retries, fixes the
  registry source, or deliberately sets the override.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Installer prepares plugin MCP (`--prepare`) | `prepared` / `deferred_to_first_start` / `sdk_verification_failed` | installer result diagnostics | plugin MCP runtime verification | installer output |
| First or later server start | runtime `verified` and server running / start refused with error code | host MCP server status, launcher stderr | plugin MCP runtime verification | host MCP status plus launcher error text |
| Override active | runtime `unverified_override`, server running | warning diagnostic on prepare and start | explicit user override | installer output and launcher stderr |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Unchanged. Installing the plugin activates the plugin MCP; uninstalling
  removes it as today.
- blockers_and_visible_next_actions: A tree that does not match the lock or the expected digest blocks
  the runtime with a stable `AGDF_MCP_SDK_*` error code; the message names the retry action, the
  registry/mirror cause and the override.
- recovery_paths: Retry after fixing network or registry source (transient failures leave no committed
  runtime, so a retry starts clean); reinstall the plugin; or set the explicit override.
- relevant_state_transitions:
  - absent → stage installed from lock → verified → committed runtime (server starts).
  - absent → stage installed → verification fails → stage removed, nothing committed, error shown.
  - existing runtime → digest matches expected → kept.
  - existing runtime → digest differs → discarded → re-prepared from lock (as first install).
  - any state with override set → install without verification → committed as `unverified_override`
    with warning; removing the override and restarting re-verifies.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - criterion: A fresh plugin MCP preparation for Claude Code and Codex installs only the packages listed in the shipped lockfile at their locked versions and integrity hashes; no other package is resolved.
- criterion_id: AC-002
  - criterion: A stage whose installed SDK tree contains a package outside the locked set, misses a locked package, or has a digest different from the shipped expected value is rejected with a stable `AGDF_MCP_SDK_*` error code, and no runtime is committed.
- criterion_id: AC-003
  - criterion: A tampered package tarball or a registry returning content with a different integrity hash fails the preparation, and no runtime is committed.
- criterion_id: AC-004
  - criterion: On start, an existing runtime of the same version whose SDK digest differs from the shipped expected value is discarded and re-prepared from the lockfile; a matching runtime is reused without network access.
- criterion_id: AC-005
  - criterion: With the explicit override set, preparation succeeds without verification; prepare and start emit a visible warning, and the runtime marker records the unverified state. Without the override, a runtime recorded as unverified is re-verified on the next start.
- criterion_id: AC-006
  - criterion: The shipped lockfile and expected digest are generated by the build from the repository source of truth; the runtime integrity check fails when either drifts from what the build would produce.
- criterion_id: AC-007
  - criterion: Error and warning texts name the cause and one recovery action; skills and hooks of the plugin remain usable when the plugin MCP is refused.
- criterion_id: AC-008
  - criterion: `docs/architecture/README.md` §6.1 and `PRIVACY.md` describe the locked, verified acquisition, the override and the remaining gap of the registered MCP path.
- criterion_id: AC-009
  - criterion: Existing MCP lifecycle, plugin runtime, Claude and Codex plugin MCP, package and integrity tests pass.

## 6. Non-Goals

- Vendoring the SDK into the plugin (no network at all) — separate decision.
- The registered MCP path (`mcp enable` for OpenCode and GitHub Copilot) — follow-up run (see
  Approval Decisions).
- Changes to MCP protocol behaviour, tools, dispatch semantics, host registration or uninstall.
- Releasing or publishing a new version.

## 7. Users And Roles

- Users of AGDF in Claude Code and Codex: receive the verified runtime or a clear refusal.
- Operators of proxy/mirror environments: may need the override or a faithful mirror.
- Repository owner: maintains the locked tree and decides SDK upgrades through the build.

## 8. Constraints

- Node.js 22+, npm as today; no new runtime dependency.
- `--ignore-scripts` stays; no install scripts run.
- The verification must be deterministic across Windows, macOS and Linux.
- The override must be explicit (no implicit fallback) and cannot be set by the plugin itself.

## 9. Evidence Requirements

- Automated tests per AC-001 to AC-005 using offline fixtures (manipulated tree, extra package,
  wrong digest, override, stale existing runtime).
- Integrity check result for AC-006.
- Diff of the two docs for AC-008; full affected test suites for AC-009.
- Optional: one real npm-backed preparation on Windows as host evidence (not a QA prerequisite).

## 10. Risks And Open Questions

- Digest basis (installed files vs. lockfile integrity) and cross-platform stability — SD.
- Whether a runtime-only lockfile plus manifest is generated or the existing
  `packages/mcp-server/package-lock.json` pair is reused — SD.
- Override name and marker field — SD.
- Plugin provenance digests change; release and integrity checks must follow — TP.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Treatment of runtimes prepared before this change | before_prd | resolved | Re-verify on next start; keep on match, discard and re-prepare from the lockfile on mismatch (AC-004). | Repository owner |
| Behaviour on SDK tree or digest deviation | before_prd | resolved | Fail closed with stable error code; an explicit override may deliberately skip verification, with visible warning and recorded unverified state (AC-002, AC-005). | Repository owner |
| Registered MCP path for OpenCode and GitHub Copilot | before_prd | resolved | Excluded from this run; tracked as a separate follow-up run, gap named in the docs (AC-008). Exit condition: follow-up run created after this run's OR. | Repository owner |
| Digest basis, lockfile shape, override name | later_sd | open | Decided in Solution Design. | Repository owner |

## 11. Next Step

Review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)
- Problem: Die Plugin-MCP-Laufzeit für Claude Code und Codex übernimmt das SDK ohne Lockfile und ohne Abgleich mit einem ausgelieferten Sollwert.
- Ziel: Nur der geprüfte, mitgelieferte SDK-Baum wird übernommen; Abweichungen brechen mit klarem Fehler ab, ein ausdrücklicher Override ist sichtbar und protokolliert.
- Umfang: Lockfile und Soll-Digest im Plugin, exakter Paketsatz, Neuprüfung bestehender Laufzeiten, Override, Erzeugung im Build, Tests, Doku und PRIVACY.md; OpenCode/Copilot als Folge-Run, kein Vendoring, kein Release.
- AC-001: Eine frische Vorbereitung installiert nur die im mitgelieferten Lockfile genannten Pakete mit gesperrter Version und Integritäts-Hash; nichts wird zusätzlich aufgelöst.
- AC-002: Ein Stage mit fremdem oder fehlendem Paket oder abweichendem Digest wird mit stabilem AGDF_MCP_SDK_*-Fehlercode abgelehnt; keine Laufzeit wird übernommen.
- AC-003: Ein manipulierter Tarball oder abweichender Integritäts-Hash der Registry lässt die Vorbereitung scheitern; keine Laufzeit wird übernommen.
- AC-004: Eine bestehende Laufzeit derselben Version mit abweichendem Digest wird beim Start verworfen und aus dem Lockfile neu vorbereitet; eine passende bleibt ohne Netzzugriff erhalten.
- AC-005: Mit gesetztem Override gelingt die Vorbereitung ohne Prüfung, mit sichtbarer Warnung und vermerktem ungeprüftem Zustand; ohne Override wird eine solche Laufzeit beim nächsten Start neu geprüft.
- AC-006: Lockfile und Soll-Digest erzeugt der Build aus der Repository-Quelle; die Integritätsprüfung schlägt bei Abweichung fehl.
- AC-007: Fehler- und Warntexte nennen Ursache und eine Recovery-Aktion; Skills und Hooks bleiben nutzbar, wenn der Plugin-MCP abgelehnt wird.
- AC-008: Architektur-Doku §6.1 und PRIVACY.md beschreiben Lockfile-Bezug, Prüfung, Override und die verbleibende Lücke des registrierten MCP-Wegs.
- AC-009: Bestehende Tests für MCP-Lifecycle, Plugin-Laufzeit, Claude/Codex-Plugin-MCP, Paket und Integrität laufen durch.
- Entscheidungen: Bestand prüfen und bei Abweichung ersetzen; bei Abweichung hart abbrechen mit ausdrücklichem Override; OpenCode/Copilot als eigener Folge-Run; Digest-Basis, Lockfile-Form und Override-Name entscheidet das SD.
