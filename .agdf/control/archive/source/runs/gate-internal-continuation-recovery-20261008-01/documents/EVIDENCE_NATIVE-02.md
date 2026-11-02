# Authorized candidate installation and actual desktop observations

This is a follow-up to EVIDENCE_NATIVE-01.md and QUALIFICATION_PLAN-01.md. Earlier files describe their historical observation time; their statements that installation and native connection were absent are superseded only to the extent proved below. No approved requirement, design, plan or historical review was rewritten.

## Identity and access

- Candidate: `0.14.5+codex.local-0ad3b168da8e`.
- Source digest: `0ad3b168da8ecbe80df5280a28a9affc6156769ac512332e4b3d89916198d9ee`.
- Bundled CLI runtime digest: `28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278`.
- Selected MCP dispatcher package digest: `2b1319f6d057d62a5dc341dd28e2596f5ab773ef194cc165b8a60affffbf9bf0`.
- These are two different canonical digest planes, not mismatching hashes of one object. The dispatcher digest derives from the selected MCP package entries and minimal manifest; bundled CLI runtime hashes cover their own bundle.
- Installation: existing canonical installer, exact candidate guarded before switch, `verificationStatus: healthy`; INSTALLATION-01.json. Separate cockpit configuration unchanged.
- Fresh stdio connection: protocol 2025-11-25, dispatcher provenance matched; FRESH_CONNECTION-01.json.
- Actual tool in this desktop conversation: same matching installed MCP dispatcher; DESKTOP_CONNECTION-01.json, NATIVE_UX_DISPATCH-01.json and NATIVE_EVIDENCE_DISPATCH-01.json. Another manual reconnection is not an outstanding prerequisite.
- Actual session metadata: originator Codex Desktop, harness `0.162.0-alpha.2`, turn model `gpt-6.1-sol`, effort `high`; read from this conversation's local session metadata, not inferred from configuration. Installed app bundle version separately observed as `26.1002.52244`; it is not asserted as a fresh running-process build check.
- Optional CLI path: Codex 0.157.1 returned HTTP 400 before AGDF: configured `gpt-6.1-sol` unsupported through that CLI/account path. No silent model change or retry. This failed CLI probe does not invalidate the successful desktop tool observation and does not prove an AGDF failure. native-observations/missing-ux.jsonl and its process record retain the actual failure.

## Actual event ledger

| Event | Actual owner and result | Canonical mutation | User event / limit |
|---|---|---|---|
| Installation and connection | Existing installer healthy; fresh stdio and actual desktop dispatcher match | Installed exact authorized candidate; cockpit config retained | Current deliberate `Ja` authorized the prepared switch and sequence |
| Missing-UX continuation | Actual gate-check routed nonterminal to ux-intent-definition with exact expected field and observed missing file | No dispatch write | No additional continuation prompt |
| UX analysis | Actual owner read approved synthetic UR and Brownfield data; result blocked because material state/activation/recovery facts and observable existing behavior are absent | Own UX file linked and run-update succeeded: revision 5 to 6, `7d4aebed-63c9-4778-8754-316d9ab516e4`; NATIVE_UX_RECORDING-01.json | No invented intent, PRD or human approval; positive N-002 is not fulfilled |
| QA internal-evidence continuation | Actual gate-check routed nonterminal to qa-gate, evidence only, `missing_approval: none`, new dispatcher matched | No dispatch write | No additional continuation prompt |
| Local evidence acquisition | Actual Node 22 restore assertion passes; exact command, source hashes, stdout/stderr and exit in NATIVE_LOCAL_TEST-01.json | Test evidence and narrow QA observation linked; run-update revision 14 to 15, `062416e0-1b0a-4436-8bee-63649d94937b`; NATIVE_LOCAL_RECORDING-01.json | Restore assertion observed; persistent saving and real full-product reviews absent; no QA approval |

Original QA fixture pass reviews are synthetic setup placeholders, not actual reviews. The fixture has a restore function but does not implement the full approved synthetic save-and-restore TP. A green test alone cannot justify QA pass. These are native-test preparation deficiencies, not newly discovered production product requirements. The user must not be asked to decide the synthetic filter semantics. Test preparation must supply a sufficiently specified, reviewable isolated scenario through the existing fixture owners before positive chain claims.

## Qualification coverage

| Obligation | Current evidence and limit |
|---|---|
| N-001 | Installed identity, fresh transport and actual desktop model/MCP identity observed; no visual running-build/render qualification claim |
| N-002 | Actual prerequisite handoff, analysis and recording observed; the prepared positive fixture correctly blocked on insufficient material facts, so continuation through a genuine PRD decision remains missing |
| N-003 | Native malformed correction and unchanged-failure stop not observed; the unchanged fixture currently lacks an actual persistent-fault injection and must be prepared correctly |
| N-004 | Actual internal local-evidence handoff/acquisition/recording observed; complete save/restore review transitions and QA implementation chain missing |
| N-005 | Deterministic protocol routes retained; actual native external/upstream/invalid stops not observed |
| N-006 | Deterministic renderer and full control byte/path tests retained; actual terminal turn compliance, native readable rendering and native read-only inventory comparison missing |
| N-007 | Deterministic canonical resume checks retained; actual model interruption and changed-revision replay missing |
| N-008 | This actual-event ledger consolidates current observations; complete successful sequence and comparable historical host timing remain missing |

Native terminal cases must end their actual agent response verbatim with no later tool. They cannot be counted as native agent compliance by wrapping the tool, filtering its result or continuing this same response. The optional CLI entrypoint failed before reaching any case. No stronger model compliance, timing or whole-session prompt-reduction claim follows from source fixtures or these partial observations.

## Evidence applicability and next step

Implementation and generated candidate source did not change during this authorized installation/observation. C001-C019, source/chain/protection/localized rendering and package evidence remain applicable within their named boundaries; no blanket retesting or package replacement is justified. Historical same-agent reviews and baseline timing limits remain explicit.

Existing QA revise remains applicable: positive complete native obligations are not satisfied. The sole QA owner does not request Approval: QA. Next permitted work is to repair the isolated native-test preparation (complete scenario, real fixture implementation/review evidence, persistent failure injection), then collect the still missing observations using the already verified desktop candidate and separate terminal turns. Do not request installation/reconnection again for this unchanged verified binding, switch the model silently, alter approved sources, or infer release readiness.
