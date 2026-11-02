# Automatic continuation after confirmed approval

User correction: a saved approval resumes the existing permitted delivery flow without a second “Nächster Schritt” action. This fixes the redundant post-approval interaction under the existing contextual-action flow and the gate-check rule to redispatch immediately after approval. The approved source artefacts and gate decisions are unchanged; this note is execution evidence, not a parallel requirement authority.

## Implementation

- DecisionCard resumes exactly once after a locally submitted approval has a matched canonical receipt and available current routing. Mounting, reading, discussion, denied submissions and uncertainty do not start work.
- DecisionEntry revalidates exact target, Run, resulting revision and typed Core operation before forwarding continuation through the advertised host message facility. It requests fresh gate-check routing and explicitly prohibits executing a human next_operation or approving another gate.
- A following human gate, including QA to UAT, is presented for a new deliberate decision. The old card does not decide it. The saved approval confirmation stays visible independently of continuation feedback.
- No second button, automatic approval replay or uncertain-message retry. Unsupported host messaging retains the honest named-step/Chat fallback; host failure or stale state remains visible.

## Verification and limitations

Evidence: evidence/renewed-tp-15/automatic-continuation-17/VERIFICATION.json. All automated checks pass. The built SDK browser cases cover German/English, agent work, next human gate, stale binding and unknown host acknowledgement. These are synthetic host observations.

The exact assembled candidate and initial canonical human-gate parity passed an owned STDIO preflight. Only the already authorized disposable test registration was updated. A Codex restart is required to load its changed resource. Production installation was not updated. Previous actual human observations remain bound to their old candidate. Native automatic continuation, remote iPad qualification, the remaining corpus/reviews and final QA remain open.

All 5808 protected foreign control files and the staged index remain unchanged. No Git action or gate approval was performed.
