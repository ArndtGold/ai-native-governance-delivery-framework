# CD+Tests: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: done
Decision: pass with bounded loaded-host gaps
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
Revision: 6
Baseline: `d9d7be70945d4ead16de6fb12830afb7e2c3325d`
Runtime: Node.js `v22.22.3`, npm `11.12.1`, Darwin `x64`

## Delivered correction

Revision 2 of the presentation-language contract reuses the existing semantic and locale owners.
`create-agdf/lib/skill-dispatch/contract.js` owns the model-facing meaning, required schema and lexical
pattern. `create-agdf/lib/interaction-presentation.js` owns strict public tag validation, registry
validation and whole-pack resolution. `runtime-context.js` adapts only trusted detected operating-
system locale strings. The dispatch service passes the resolved language through target, gate and
continuation paths.

Public values are never trimmed, coerced, split, repaired from underscores or stripped of POSIX
suffixes. Missing and invalid values stop before activation, target or gate work. A valid supported
tag uses its exact or primary-language pack. A valid unsupported tag uses the immutable complete
English pack. Registry validation requires `schemaVersion: 1`, exact `fallbackLocale: en`, a complete
English pack, canonical unique keys and identical pack-key sets.

The canonical function description states the host precedence without duplicating installed locale
facts: explicit response language, otherwise dominant request language, otherwise literal `en` for
mixed or ambiguous input. All generated Skill projections and MCP `tools/list` consume this exact
description. The MCP server still exposes one read-only `agdf_dispatch` tool and preserves separate
`2025-11-25` and `2026-07-28` protocol reports.

## Revision 2 task coverage

| task_id | Status | Evidence |
|---|---|---|
| CHMCP-TP-23 | done | Exact TP Revision 2 approval and run revision `A1667D1E-1C90-487D-A439-90572F52625D` were revalidated; Brownfield Analysis Revision 2 passed before implementation. |
| CHMCP-TP-24 | done | `create-agdf/scripts/fixtures/skill-dispatch-language.js` owns missing, invalid, supported, regional, valid unsupported and registry-mutation rows. Pre-change controls reproduced dotted-suffix acceptance and mutable fallback. |
| CHMCP-TP-25 | done | `contract.js` owns the pattern and semantic text; contract, binding and generated-profile tests prove exact projection equality without a supported-pack list. |
| CHMCP-TP-26 | done | Strict validation in `interaction-presentation.js` and `service.js` rejects every invalid row before activation, target and gate callbacks. Stable recovery is fixed English because invalid input has no valid presentation locale. |
| CHMCP-TP-27 | done | Registry validation enforces the English baseline, canonical uniqueness and whole-pack parity; exact, primary and English resolution are table-tested. |
| CHMCP-TP-28 | done | `canonicalizeDetectedSystemLocale` accepts POSIX-style detected values only on the system-locale path; the same value fails through CLI, service and MCP explicit input. The lifecycle presenter now receives the selected chat-language string instead of the language object. CLI gate evaluation propagates `presentationLanguage` only for an explicit `--language`, so an omitted parameter preserves the project-configured chat language. |
| CHMCP-TP-29 | done with bounded host evidence | Direct service, registry, renderer and both production MCP protocols share the matrix. Codex passed all five fresh-host cases. OpenCode passed after controlled retry with retained discovery and argument-fidelity variance. Claude Code and Copilot remain explicit unverified host gaps. |
| CHMCP-TP-30 | done | Interaction contract, beginner architecture, Context Graph, CD+Tests, Task Plan Review, Clean Implementation Review, Code Review and QA were refreshed against the final source and host evidence. |

Historical CHMCP-TP-01 through CHMCP-TP-22 remain fulfilled by Revision 5 evidence. Revision 2 did not
reopen their lifecycle, packaging, adapter or architecture implementation.

## Acceptance coverage

| test_id | Status | Decisive evidence |
|---|---|---|
| CHMCP-C21 | pass | Shared supported and regional rows pass contract, service, renderer and both production protocol lanes with one complete exact or primary pack. |
| CHMCP-C22 | pass | `fr-FR` resolves to one complete English pack; a non-English fallback registry is rejected; Codex and OpenCode both submitted `fr-FR` and received English. |
| CHMCP-C23 | pass | Missing, null, wrong-type, empty, padded, underscore, POSIX-suffixed, list and malformed inputs fail before governance callbacks. Both protocol reports distinguish SDK/schema rejection from successful results. |
| CHMCP-C24 | pass with bounded host gaps | Exact semantic text is projected everywhere. Codex directly passed explicit German, explicit English, dominant German and mixed→`en`. OpenCode passed the same language selections after controlled retries. Claude Code and Copilot remain unverified because no callable authenticated language lane was available. |
| CHMCP-C25 | pass | `de_DE.UTF-8` succeeds only through detected system locale adaptation and fails through every explicit public path. |
| CHMCP-C26 | pass | Missing English, non-English fallback, alias/canonical duplicates and incomplete packs fail closed; successful presentations have exact pack parity and no mixed fields. |

Historical CHMCP-C01 through CHMCP-C20 remain passing. Their direct-host support classifications stay
bounded: positive configuration or invocation does not become release qualification.

## Direct host evidence

`DIRECT_HOST_EVIDENCE.md` and `evidence/language-host/language-host-results.json` keep loaded-host
observations separate from deterministic protocol evidence. The 25-file language evidence set is
SHA-256 bound by `evidence/language-host/manifest.json`.

- Codex CLI `0.145.0`: five fresh ephemeral `gpt-5.6-sol` sessions passed language selection,
  complete-pack rendering, exact target/run fidelity and `authorizes: false`.
- OpenCode CLI `1.18.3`: the final five language observations passed. Initial attempts retained two
  missing-tool sessions, one wrong `skill_id` that failed closed and one mixed-language `de-DE`
  choice. Native connected preflight plus one controlled retry produced the intended language
  result. The mixed retry omitted the requested run and used `current_repository`, so its language
  observation passes while full request-argument fidelity remains a host warning.
- Claude Code CLI `2.1.193`: registration verification failed and left no project or native entry;
  prior fresh-session evidence is also blocked by missing authentication.
- GitHub Copilot Desktop `1.1.15`: no callable local MCP client was available; no follow-up
  registration was created.

Codex and OpenCode were disabled through the lifecycle service. Native post-removal checks report no
AGDF MCP server, project `.codex/config.toml` and `opencode.json` are absent, and the isolated runtime
root was removed after the last reference.

## Verification results

| Command | Result |
|---|---|
| `npm --prefix create-agdf run release:prepare` | pass: generated assets, profile history, release transaction, version coherence and public plugin |
| `npm --prefix create-agdf run test:interaction-presentation` | pass: strict tag, registry mutation and complete-pack matrices |
| `npm --prefix create-agdf run test:skill-dispatch` | pass: semantic contract, zero-call invalid boundary, resolved-language propagation and 40 binding cases |
| `npm --prefix create-agdf run test:mcp-server` | pass: semantic contract, separate dual-protocol language matrix, safety, provenance, performance and package boundary |
| `npm --prefix create-agdf run test:copilot-profile` | pass at 755595 bytes and 95 files under the reviewed growth baseline |
| `npm --prefix create-agdf run test:skill-evals` | pass |
| `npm --prefix create-agdf run smoke-test` | final serial pass, including 83/83 deterministic Skill eval cases, 467-file package and plugin-only Copilot routing |
| `git diff --check` | pass |

The final uninterrupted MCP performance report measured cold `tools/list` p95 `529.683 ms` and warm
dispatch p95 `295.288 ms`. These measurements describe this exact local Darwin x64 run and do not
qualify other systems.

## Corrected observations

The first German direct call exposed two free-form English run-status values outside the closed
registry. Replacing them with existing canonical operational values restored a complete German card;
the refusal to render mixed text was the intended fail-closed behavior. The first Codex invocation
also used a locally configured model that CLI `0.145.0` cannot run; the approved matrix used the
previously evidenced compatible `gpt-5.6-sol` model.

The first full smoke after explicit CLI language propagation exposed that an automatically detected
system language overrode the project configuration. The handler now sets `presentationLanguage`
only when `--language` was explicitly supplied. Focused regression tests prove both the explicit
override and the implicit project-language path; the final serial smoke passed both.

An initial Codex disable ran inside the filesystem sandbox and returned `rollback_incomplete` because
the native CLI could not update its local state database. Repeating the same lifecycle operation with
the required host access succeeded, and independent native and filesystem checks prove cleanup.

## Remaining limits

The source and protocol implementation is ready for QA. Claude Code and Copilot language-selection
behavior remains unverified, OpenCode fresh-session discovery is variable, and no claim extends to
Windows, Linux, OpenCode 2.x, another client version or public package acquisition. These gaps limit
host qualification; they do not weaken strict server validation or the complete-pack contract.
