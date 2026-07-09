# AGDF Master Backlog

## Lifecycle Rules

- Keep an item in **Active Backlog** while work, required evidence, a required approval, or delivery closeout remains open.
- Move an item to **Completed / Superseded Pointers** only when its scoped work is delivered, required validation and QA have passed, required user approvals including UAT are recorded, and the OR states the final outcome.
- A commit alone is not completion evidence. The artefact chain and required approvals decide completion.
- Quick Tasks without a formal QA or UAT gate may move to Completed after their relevant checks and compact closeout are recorded.
- Use **superseded** instead of **completed** when another artefact or scope replaces the item; retain the historical link and name the replacement.

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
| `fresh-request-control-state-docs` | Clarify fresh request vs durable control state documentation | Completed | [Brownfield Review](artefacts/fresh-request-control-state-docs/BROWNFIELD_REVIEW.md) | Quick task completed; user docs clarified and review returned no findings on 2026-07-09 |
| `master-backlog-human-readable` | Make the Master Backlog human-readable with compact status labels and Markdown links | Completed | [OR](artefacts/master-backlog-human-readable/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09 |
| `agdf-operating-model-sharpening` | Sharpen the AGDF operating model and public explanation | Completed | [OR](artefacts/agdf-operating-model-sharpening/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09 |
| `run-status-card-quality-outlook` | Add Run Status Card and quality outlook | Completed | [OR](artefacts/run-status-card-quality-outlook/OR.md) | UAT approved; implementation committed in `bf3f9ec`; readability refinement committed in `c4c9d64` |
