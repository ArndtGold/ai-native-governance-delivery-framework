# T-001 Host Probe: Turn Texts and Body Reserve

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- date: 2026-10-28
- host: Claude desktop app on Windows (Code tab), engine 2.1.308, this session in its own pop-out window
- vehicle: a probe mod `chat-probe` in this session's dev-mods folder (outside the repository), removed after the probe

## Turn texts (SCN-003)

| Hook | Observation | Screenshot |
|---|---|---|
| main-loop `turn.start` | `e.text` is a string, 486 and later 494 characters, the turn's prompt (here a task notification) | `live/05-t001-prompt-text.png` |
| main-loop `turn.complete` | `next(e)` resolves to `{ text }` with a string of 328 characters: the turn's final assistant message, which began with the name of this run | `live/06-t001-answer-text.png` |

Consequence: SDD-02 works as designed. Recognition sees the prompt and the final message of a main-loop turn; text between tool calls of the same turn is not part of the answer text, so a run named only there counts when the final message or the next prompt names it.

## Body reserve (SCN-014)

The probe drew a root Box with `minHeight` = `bodyRows` less the reserve and a framed footer, and cycled the reserve through 0, 0.25, 0.5 and 1 row.

| Pane | bodyRows / bodyColumns | Result | Screenshot |
|---|---|---|---|
| narrow, window 1143 × 884 | 27 / 31 | Fractional reserves move the footer in small steps; no reserve shows a scrollbar | `live/07-t001-reserves-narrow.png` |
| widened through the pane's own control | 27 / 101 | Reserve 0 and 0.25: no scrollbar | `live/08-t001-reserves-wide.png` |
| narrow, window 1143 × 1208 | 39 / 31 | No reserve shows a scrollbar | `live/09-t001-reserves-tall.png` |

Choice per SDD-08: the smallest reserve without a scrollbar is 0. The scrollbar seen on 2026-10-28 with the companion at `minHeight: bodyRows` therefore came from content taller than the body, which the run list's spare row in `listCapacity` keeps in check; T-009 confirms the companion without a scrollbar.

## Cleanup

The window was resized to 1143 × 1208 for the third row and back to 1143 × 884; the pane was widened and narrowed again through its own control. The probe mod was removed.
