# Clean Implementation Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass
Decision: clean primary solution
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
Revision: 6

## Review scope

Reviewed the complete uncommitted language-contract diff against approved PRD Revision 2, SD
Revision 2, TP Revision 2 and Brownfield Analysis Revision 2. The review included canonical source,
generated bindings, locale registry, production MCP protocols, beginner documentation and separate
loaded-host evidence.

## Primary-solution assessment

| Concern | Result | Evidence |
|---|---|---|
| Semantic owner | pass | `skill-dispatch/contract.js` owns the single description, pattern and projection. Generated Skills and MCP schemas consume it byte-for-byte. |
| Validation owner | pass | `interaction-presentation.js` contains one strict public parser and registry validator. Service and MCP call that path instead of reimplementing it. |
| Locale ownership | pass | The validated registry alone owns installed packs. The function text describes behavior and contains no independent supported-locale list. |
| Fallback | pass | Exact fallback to complete English for a valid unsupported tag is an approved product behavior and enforced invariant, not a recovery workaround. Missing or invalid input never uses it. |
| System locale | pass | POSIX cleanup exists only in `canonicalizeDetectedSystemLocale`; explicit CLI, service and MCP inputs cannot reach it. |
| Pack consistency | pass | Key-parity validation and whole-pack lookup prevent per-field fallback and mixed-language cards. |
| Protocols | pass | One shared fixture drives both supported production protocol versions. No legacy-only or modern-only language branch exists. |
| Host differences | pass | Direct evidence records OpenCode variance and unavailable Claude/Copilot lanes. No host-specific detector, silent retry or fabricated support flag was added. |

## Complexity and fallback review

The change removes permissive repair behavior instead of surrounding it with guards. It adds one
small trusted-input adapter for operating-system locales because that source has a different contract.
This dependency direction is explicit and does not create a second public validator.

`matchPresentationLocale` separates pack lookup from the public fallback decision. It returns an
exact or primary match and has no mutable fallback. `resolvePresentationLocale` validates the
registry and then applies the sole constant English fallback. This split keeps the policy visible and
allows tests to distinguish support lookup from product fallback without duplicating policy.

The fixed English invalid-input recovery is necessary because a missing or malformed tag provides no
trusted locale for localized recovery. It is stable transport recovery and never authorizes or
executes governance work.

## Rejected parallel structures

No second locale registry, host-specific supported-language list, server-side conversation-language
detector, per-field fallback, compatibility shim or alternate MCP tool was introduced. The shared
fixture is test-only and imports production-owned constants rather than becoming a policy owner.

## Findings

| Finding | Status | Resolution |
|---|---|---|
| Permissive POSIX cleanup on external input | resolved | External parser is strict; detected system locale has a separate adapter. |
| Mutable registry fallback | resolved | Exact `fallbackLocale: en` and complete English pack are required. |
| Split supported-locale facts | resolved | Registry owns installed facts; function text owns selection semantics. |
| Separate protocol matrices | resolved | Both protocol versions consume the same table. |
| Hidden loaded-host assumptions | resolved | Direct records keep successful, failed and unavailable lanes distinct. |

## Decision

The implementation is the smallest coherent correction that satisfies the approved contract. No
fallback, guard or parallel owner remains that should be removed before QA. OpenCode session variance
is a retained host observation and does not justify moving conversation inference into the server.
