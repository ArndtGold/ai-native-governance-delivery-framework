# Native undecided close and English approval continuation
Evidence class: actual bounded native action, same-producer Core observations and human-reported visibility; not production qualification.

Candidate: native-en-sd-approve, SD revision 599b9767-8c08-4c16-a64e-ff43831cebd5, presentation d27c320b-0ebf-4a1b-b7bb-b2c3a8118baf. Producer PID 13248 started 2026-10-12T13:42:06.456Z; target vR2jT8/governance-target. Exact served UI digest b923b7e85b98fb87242cd268a091ee9c2444ab3c266a7ba786908b39d64c4edf remains the registered candidate.

## Undecided closing
Fresh preparation at 15:58:32Z; session expires_at 1791849511687 (2026-10-12T23:58:31.687Z). Snapshot at 16:02:41.700Z was available and SD unapproved. Human explicitly reported closing sidebar and collapsing the same Chat card. Immediate snapshot at 16:03:34.067Z remained available, same revision, same producer. No Core Close request arrived between preparation and this observation. No assistant Close was issued. Graceful undecided Host teardown is not confirmed; natural expiry is a different path. Host version observed 26.1007.30912. This remains the external TP24-HOST gap, not a successful close test.

## Native English approval and automatic retirement
Human reopened the same test card and reported “Decision saved.” Native app-only approve request arrived at 16:07:10.188Z and was accepted at 16:07:11.429Z. Original approval operation 1c1259eb-153a-440c-a451-ab2898fed7f3; resulting revision 9f69a3a6-cc55-41d5-8975-ae4ee9bd81ee. Fresh Core next_operation is agent prepare_gate_artifact TP. Automatic app Close request at 16:07:11.963Z returned data.closed:true at 16:07:11.974Z. A subsequent assistant snapshot received session_expired. No assistant Close or second approval was issued. Retirement preceded the TTL and left the shared server running.

The App's human-readable message “Solution design approved. Continue with Task and test plan.” arrived in Chat with untrusted structured context. Binding/receipt and Core state were independently checked; the message was not used as approval authority. The initial assistant dispatch incorrectly used continued_target; the private probe explicitly allows only explicit_target, and rejected it before execution as dispatch_worker_failed. One corrected explicitly bound dispatch succeeded; no runtime installation changed or business approval repeated.

## Automatic permitted work
Read exact approved PRD/SD, authored TP with AC-001 / SDD-001 and two tasks/scenarios; authoring readiness ready. Canonical artefact recording accepted; resulting revision e20cfaf8-7e94-4916-ae42-d9cc35223eb3, operation recorded in /private/tmp/agdf-native-tp-record-41.json. Fresh dispatch reached presentation_required and human TP decision boundary. No further human test decision or implementation was inferred. This concludes the bounded native English SD-to-TP continuation sequence.

## Limits
The “Decision saved” reply alone does not confirm all requested English document-return, keyboard, resize/scroll or technical-permission observations. No actual technical denial is observed. The broader all-gate/locale/replacement/cross-view matrix remains open. Older db750408 card had an actual expired approval attempt rejected without a saved effect; it is expiry-negative evidence only.

Original observations: private native-observations.jsonl in the registered vR2jT8 probe root; exact presentation archive and approval receipt in this disposable Run. Private bootstrap tokens are not published. Existing main approvals/sources remain unchanged. No production native qualification is published.
