# UX Intent: document state and one truthful reading action

- decision: ready
- blocking_reason: none
- primary_user_intent: Scan the undertaking's documents, identify approval/check state and read the relevant document with one action.
- success_signal: Two comparable columns; status icon plus plain text; no expanding document entries or separate approval action; large document view explains relevant findings and available original approval.
- primary_decision_or_action: Read a document. Approval stays in the deliberate existing human control flow.
- working_modes: Document overview at wide/narrow widths; document reading; deliberate current draft check; unavailable or stale source/check.
- effective_state_by_mode: Overview reflects current bounded canonical document/check observations; reading reflects the selected registered source; checking is explicitly initiated and pending; unavailable/stale views retain limits and existing recovery.
- visible_state_types: Freigegeben; Entwurf; Entwurf geprüft; Überarbeitung nötig; Prüfung nicht verfügbar; Freigabe dieser Fassung nicht bestätigt; transient Prüfung läuft when the deliberate check is active.
- effective_state_authority_by_mode: Canonical Core approval/source proof and authoring validators, current target/Run/source/revision plus snapshot/freshness authority. Neither user-visible original prose nor a icon/color decides state.
- primary_state_presentation_owner_by_mode: Document row for scan state; large document reading context for matching original approval/check findings; existing deliberate draft-check area for check action, progress and retry; existing reading feedback for source/session failures.
- activation_paths: Select undertaking; scan rows; activate contextual document action to read/expand; close/back to initiating row. Explicitly activate supported current Entwurf prüfen; no list-triggered or bulk checks. No separate proof-navigation mode.
- blockers: Missing/blocked source, unsupported check, invalid proof, unavailable service, expired session, stale source or mismatched check identity. These do not become invented document defects or approval.
- recovery_paths: Read existing available current source with truthful current-version label when approval identity is unconfirmed. Explicit retry for busy/transient check; reload for changed source; reopen expired session through existing host path. Missing source has unavailable feedback instead of a working link. Revised drafts use a fresh deliberate applicable check.
- relevant_state_transitions: Unchecked draft -> checking -> passed draft pending approval / concrete corrections / unavailable. Source/revision change invalidates checked/defective claims. Valid human approval plus exact current version proof -> Freigegeben. Earlier approval plus uncertain or changed version -> unconfirmed current version with historical approval preserved. Width changes rearrange only; closing reading restores focus, and reload never automatically checks.
- proposed_prd_acceptance_criteria: Equivalent two-column narrow/wide rows for actual documents; explicit evidenced state matrix; exact version/action agreement; one large reading destination with supported original approval and current findings; meaningful keyboard/focus/scroll and stale/missing/retry cases; additive reader compatibility and no-control-mutation evidence.
- open_product_questions: none. Technical descriptive shape, proof reuse and diagnostic association remain SD decisions, not competing product choices.
- affected_outputs: Existing undertaking document list, document reading context, shared Core descriptive read result and consumer interpretation, existing explicit current draft-check feedback.
- evidence: Approved revised UR sha256:db2ce267f9330751e0eb6c27027fba09b0be3e19889dff206423025b7e1a6495; current BROWNFIELD_REVIEW.md; original screenshots and subsequent answered intent; current reader/check ownership inspection.
- missing_evidence: Actual new presentation/interaction/compatibility and native observations remain later TP evidence; no product claim of implementation.
- required_next_step: Incorporate the resolved state semantics and observable acceptance into the current PRD through its existing authoring owner.

## State meaning and priority for PRD

Freigegeben requires positive canonical approval correspondence for the exact readable current version. A matching passed authoring check on an unapproved draft means Entwurf geprüft, never approved or QA passed. Concrete applicable authoring findings mean Überarbeitung nötig. Unchecked unapproved draft means Entwurf. An unsupported, technical, stale or otherwise inconclusive check cannot create a defect label; show uncertainty with a next action where supported. A previous approval whose current version cannot be confirmed needs its own explanatory limit, not Entwurf as a guessed replacement.

The document name and state form one semantic group; icons are supplementary. Ansehen has an accessible contextual name identifying the document and whether draft/approved/current bytes are opened. Missing data cannot be replaced with green/positive state. Action disablement does not obscure existing evidence and historical approval remains distinguished from current permission.

## Reading context and return

The user reads the registered document in the existing large view and can inspect applicable check findings and the original recorded approval there. User-facing copy explains the result before technical provenance. Unavailable time/identity/version is stated explicitly; there is no invented signer or recovered approved history. Close/back returns to the initiating document action or an existing sensible fallback if the resource disappeared. Compact expansion, keyboard operation, long text and narrow widths preserve equivalent meaning.

## Authority and limits

This is analytical input under the approved UR, not a new gate, design, independent status source or approval. Proposed acceptance becomes authoritative only in the approved PRD. No storage/components/endpoints are prescribed here. No historical QA or native observation is transferred.
