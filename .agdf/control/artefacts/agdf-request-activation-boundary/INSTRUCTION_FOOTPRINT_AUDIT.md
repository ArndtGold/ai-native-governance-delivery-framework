# Instruction Footprint Audit: Request Activation Boundary

Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Scope: source, generated profile and temporary installation fixture
Revision: 3
Decision: pass for deterministic footprint and integrity; loaded-host evidence pending

## 1. Outcome

The two-stage instruction model is implemented without a second hook. One canonical Activation
Kernel is projected into eager host bootstrap and selected skills. Operational routing, gate,
quality and closeout detail remains on demand. Dynamic host context contains only the current
binding and compact facts. OpenCode emits no inactive context and adds only the kernel during
compaction.

All eleven approved normalized byte budgets pass. Runtime Integrity and focused negative tests use
the same pure measurement helper and fail on identity, marker, ordering, duplicate, conflict,
budget and forbidden-content violations. The normal `gate-check` path transfers terminal dispatcher
output and does not repeat the gate handbook.

This is not loaded-host evidence. No installed Codex, Claude Code, GitHub Copilot or OpenCode
profile was changed or observed for this audit.

This audit covers instruction footprint and projection integrity only. Its `pass` decision does not
evaluate the separate canonical-init path; final Code Review records `RAB-CR-01` as resolved.

## 2. Historical Baseline Before Revision 3

These measurements describe the superseded implementation inspected before SD Revision 5 and TP
Revision 3. They are retained as historical comparison and are not current-checkout values.

| Instruction plane | Historical bytes | Historical issue |
|---|---:|---|
| Canonical Request Activation Guard | 1,995 | Too large for the eager activation decision. |
| Ten canonical skill descriptions | 5,262 | Repeated policy dominated discovery metadata. |
| Repeated discovery suffix | 324 each, 3,240 total | Same exclusion taxonomy repeated ten times. |
| Repository OpenCode `AGDF.md` | 14,307 | Full router loaded eagerly. |
| Reconstructed global OpenCode `AGDF.md` | 16,387 | Full router plus global surface prose loaded eagerly. |
| OpenCode dynamic active guidance | 1,949 | Immutable policy repeated with variable facts. |
| OpenCode dynamic inactive guidance | 778 | Inactive repositories still received AGDF guidance. |
| OpenCode compaction addition | 1,949 active or 778 inactive | Full dynamic guidance repeated during compaction. |
| Common SessionStart output | 1,675 | Binding plus repeated activation prose. |
| Selected canonical `gate-check` skill | 22,257 | Normal dispatch path carried a second gate handbook. |

## 3. Current Deterministic Measurements

Measurements use UTF-8 bytes after LF normalization. Raw bytes are also reported. Dynamic path
normalization replaces only executable, validator and working-directory fields that were actually
parsed from the measured binding or facts.

| Surface | Instance | Raw | Normalized | Maximum | Result |
|---|---|---:|---:|---:|---|
| Activation Kernel | canonical | 1,092 | 1,092 | 1,100 | pass |
| Discovery description | delivery-path-search | 269 | 269 | 420 | pass |
| Discovery description | brownfield-analysis | 349 | 349 | 420 | pass |
| Discovery description | ux-intent-definition | 364 | 364 | 420 | pass |
| Discovery description | clean-implementation-review | 219 | 219 | 420 | pass |
| Discovery description | code-review | 231 | 231 | 420 | pass |
| Discovery description | delivery-closeout | 174 | 174 | 420 | pass |
| Discovery description | gate-check | 361 | 361 | 420 | pass |
| Discovery description | qa-gate | 174 | 174 | 420 | pass |
| Discovery description | release-or | 156 | 156 | 420 | pass |
| Discovery description | task-plan-review | 215 | 215 | 420 | pass |
| All discovery descriptions | definition order | 2,512 | 2,512 | 3,000 | pass |
| SessionStart base | Codex | 1,716 | 1,585 | 1,900 | pass |
| SessionStart base | Claude Code | 1,717 | 1,586 | 1,900 | pass |
| SessionStart base | GitHub Copilot | 1,718 | 1,587 | 1,900 | pass |
| Runtime-check supplement | consented Codex fixture | 278 | 224 | 320 | pass |
| OpenCode eager | repository | 1,501 | 1,501 | 4,000 | pass |
| OpenCode eager | global installed fixture | 1,577 | 1,577 | 4,000 | pass |
| OpenCode active dynamic | active fixture | 505 | 430 | 1,000 | pass |
| OpenCode inactive dynamic | inactive fixture | 0 | 0 | 0 | pass |
| OpenCode composed | repository | 2,007 | 1,932 | 5,000 | pass |
| OpenCode composed | global installed fixture | 2,083 | 2,008 | 5,000 | pass |
| OpenCode compaction addition | active fixture | 1,092 | 1,092 | 1,100 | pass |
| Selected `gate-check` | canonical generated | 4,669 | 4,669 | 6,500 | pass |
| Selected `gate-check` | global installed fixture | 5,989 | 5,989 | 6,500 | pass |

Discovery values contain the serialized frontmatter scalar. The total is the ten values in
definition order without an added separator.

## 4. Identity And Stability

- Activation Kernel fingerprint:
  `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`
- Current generated-tree digest after the final full smoke sync:
  `b1261620b26c4b6a40d39ef3d5a64df775181db7fc4f8df1e4883f53691eee6c`
- Public plugin candidate: 46 inventoried files, digest
  `f0f08a9af5dbc6e3ec8f05332447705da2ba8be945bd6ba14be3b314e3c21c54`
- Two projection passes are byte-stable. A projector `--check` reports zero changes.
- Package build reports all generated profiles byte-identical across complete builds and leaves
  canonical source unchanged.

The generated-tree digest is repository-build identity, not an installed-host digest.

## 5. Integrity Coverage

Focused and Runtime Integrity fixtures independently reject:

- every normalized budget exceeded by at least one byte;
- missing, duplicate, partial, reordered or fingerprint-corrupt kernel markers;
- a second kernel or dispatcher binding;
- conflicting activation language;
- a full router in eager OpenCode instructions;
- immutable activation policy in dynamic facts;
- any inactive OpenCode output;
- compaction bindings or active/inactive guidance;
- missing or unknown budget IDs, schema versions and surfaces;
- a changed canonical or global eager content pin;
- a changed canonical or global selected-skill terminal dispatch pin.

Definition hashing is key-order stable. Repository and global OpenCode composed profiles are split
and validated as exact eager plus active components. Reports identify
`evidence_plane: source_composed` and `loaded_host_evidence: false`.

## 6. Finding Resolution

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| `RAB-CIR-02` | `emergent_risk` | `SD` | `resolved` | Full eager routing and repeated policy channels were replaced by the approved two-stage model with deterministic budgets and duplicate checks. | Preserve current owners and validate fresh hosts separately. |

The implementation reuses the existing Request Activation contract, router, ten skills,
SessionStart generator, OpenCode plugin/installer, package generator and Runtime Integrity path. It
does not introduce a second classifier, hook, dispatcher version or policy owner.

For Codex, Claude Code and GitHub Copilot, SessionStart now carries a version-bound
`route_source_after_activation` path. Deterministic source, generated and packaged checks resolve
that path to the canonical operation catalog after positive activation while keeping the catalog
out of eager instructions. This proves packaged reachability, not that a restarted host loads or
follows the route.

## 7. Evidence Boundary

The deterministic four-surface composed-profile tests pass with closed fixtures and stub evaluators.
They prove composition, profile and evaluator identities, oracle absence and reporting, not model
interpretation. The four TP-required external model-backed commands were attempted in the restricted
environment but did not run: local Codex state was read-only, and an unsandboxed retry was not
authorized because it would transmit the full source-composed project instruction profile to an
external model service. No workaround was used and no behavioral report was persisted. These runs
are required supporting behavioral evidence and remain unavailable.

Fresh installation, readback, restart, direct versus automatic selection, and real OpenCode
compaction remain unobserved for all four hosts. Those gaps do not invalidate source, generated,
package or temporary-fixture evidence, but they prevent QA pass, UAT and release claims.
