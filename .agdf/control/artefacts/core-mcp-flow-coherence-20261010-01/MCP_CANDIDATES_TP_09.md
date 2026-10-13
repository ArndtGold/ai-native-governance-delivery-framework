# MCP candidate observation — TP authoring 09

Date: 2026-10-11
Run: core-mcp-flow-coherence-20261010-01
Scope: additional assignment; observation only, no extra delivery endpoint or implementation authority.

Existing capability: agdf_inspect operation-contract module agdf_record/artefact.record at TP returns the exact source relationship, payload/review schemas and authoring table columns. artifact-readiness provides actionable missing-association and duplicate-mapping diagnostics. Both capabilities were used successfully; no direct Core invocation or parser-source search was needed.

Observed gap: the TP authoring descriptor lists a design_decision_id column and scenario pattern but omits that each cell holds one decision ID and criterion/scenario pairs must be unique; invalid multi-ID cells and duplicate pairs are only learned from readiness. Candidate: sharpen the existing authoring_format metadata/contract examples at its current authoring/traceability owner. Reuse the executing validator's grammar rather than add a new search tool, parser or policy. Bind the example to current gate/source revision and show valid versus invalid forms in bounded metadata. This supports the already approved T-003 / AC-003 / SDD-009; it is not new acceptance.

Authoring mistakes separately attributed: blank lines broke extended Markdown tables and some SD associations were initially missing. Those are agent mistakes, not evidence of a missing MCP endpoint. Readiness identified them; the final draft passes after corrections. No claim of zero failed authoring attempts or stronger model benefit follows.


## Implementation observations after TP approval

- Shared Core authoring descriptor now describes the one-SDD-per-cell rule, unique
  criterion/scenario pairs and contiguous TP table. This closes a diagnosed discovery
  omission in `operation-contract`; no additional authoring tool or validator was added.
- `native-qualification` and `runtime-generations` are read-only projections of the
  existing qualification validator and actual serving owner. A standalone read explicitly
  reports missing connection ownership. Source lookups during their implementation are
  engineering work, not model-facing process or PID discovery.
- `presentation-document` supplies exact contained UTF-8 snapshot chunks with original
  language, digest, completeness and current/historical/unknown applicability. Chat and
  native reads now share the presentation snapshot owner. Reading current filesystem paths
  directly is no longer the intended ordinary remote review route.
- `presentation_decision.record` exposes the existing nonapproval writer to a new actual
  human Chat request. The app-only action facade remains separate and qualified. Neither
  comments containing Approval formulas nor remembered tool permission supply authority.
- `runtime_generation.replace` stays in the existing record group and delegates solely to
  the facade-owned handle, with a contained publisher manifest, current binding and concrete
  candidate confirmation. Its results/UUID observations are ephemeral connection records,
  separate from business receipts. No free Core helper, shell or foreign process selector.
- Packaging inspection revealed that a publisher helper cannot live inside the minimal
  command-dispatch closure while importing unshipped lifecycle modules. The publisher
  therefore remains with the existing package owner and passes its actual narrow handle
  into the stable server. This is an ownership/composition correction, not a new MCP tool.
- Current verification is source/package/process/protocol evidence. It does not yet prove
  the fresh candidate's actual native/iPad behavior or permission-denial qualification.


## Renewed implementation fault attribution

- The public-request/trusted-Core-context IPC mismatch and original-presentation routing error were adapter ownership defects. They are repaired in the existing facade; adding another MCP tool would not address them.
- Missing v3 snapshot inclusion in revision archives was an existing owner integration omission. The revision closure now retains exact paired document bytes; current and historical approval proof uses their digest.
- Native preflight used public MCP discovery, preparation and presentation-document reading. No direct path reader substitutes for the ordinary remote review route. SDK/provenance helper reads during candidate assembly remain ordinary engineering work.
- The exact test candidate is prepared and the already authorized isolated registration is updated; it is not loaded in the current Host connection and has no production/native qualification. Fresh iPad/native and whole-flow measurements remain open; no weaker-model benefit is established.

TP-09 native retry: the source search in the existing UI build/assembly reader diagnosed a stale generated HTML resource; it is a missing build freshness invariant, not a missing model-callable MCP endpoint. The shared build owner now binds current UI source inputs. The initially invalid Inspect call used an extra command_kind field; the existing documented module=agdf_prepare/presentation.prepare contract was sufficient, so that caller correction is not a new endpoint candidate. No new product writer or qualification authority is introduced.

Native checkpoint 49: the misleading approval consequence after rejection was a view-state/locale-owner defect, not a missing MCP function. Source lookups located the existing effect rendering and statusCard.allowedAfter owner. A build dependency on the generated dispatcher imported policy machinery merely for a pure UI URI; it now uses the existing pure resource contract and the shared source-digest closure covers imported Core inputs. An asynchronous native change had already completed before the caller asked for a repeat; operation-status and same-UUID historical replay were sufficient. This is a caller observation/order correction, not a new writer. The Copilot payload guard prevented an extra locale-key expansion; reusing the existing label preserved the budget. No new endpoint, independent policy or model-performance claim follows.
