import { expect } from '@playwright/test';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { counts, test } from './companion-continuation-fixture.mjs';

const start = frame => frame.getByRole('button', { name: 'Run fortsetzen' });
const pending = frame => frame.getByRole('button', { name: 'Übergabe prüfen' });
const running = frame => frame.getByText('Codex arbeitet bereits an diesem Run.');
async function publish(lab, frame, keyboard = false) {
  const button = start(frame);
  await expect(button).toBeVisible();
  if (keyboard) {
    await button.focus();
    await button.press('Enter');
  } else await button.click();
  await expect.poll(() => lab.tally().message).toBe(1);
  await expect(pending(frame)).toBeVisible();
}
function attachTurn(lab, result) {
  lab.hook('UserPromptSubmit');
  lab.hook('PostToolUse', { tool_name: 'mcp__agdf__agdf_dispatch', tool_use_id: 'fixture-tool',
    tool_input: { continue_delivery: true, run_id: lab.fixture.runId }, tool_response: { structuredContent: result } });
}

for (const invalid of ['foreign', 'stale']) test('SCN-001 rejects ' + invalid + ' Run binding', async ({ page, context, lab }) => {
  if (invalid === 'foreign') {
    const unrelated = await context.newPage();
    await lab.open(unrelated, 'unrelated');
    await expect(unrelated.getByRole('status')).toHaveText('Dieser Run gehört nicht zu diesem Testfall.');
    await expect(unrelated.locator('iframe')).toHaveCount(0);
  }
  const frame = await lab.open(page);
  await expect(page.getByRole('banner')).toHaveText('Test-Run ' + lab.fixture.runId);
  lab.faults[invalid] = true;
  await start(frame).click();
  await expect(frame.getByRole('button', { name: 'Run neu laden' })).toBeVisible();
  expect(lab.events).toContainEqual(expect.objectContaining({ kind: 'service-reserve', state: 'stale' }));
  expect(lab.tally()).toMatchObject({ gesture: 1, permit: 0, message: 0, grant: 0 });
});

test('SCN-002 identifies the current fixture and restores the focused action after stale recovery at 360 px', async ({ page, lab }) => {
  const frame = await lab.open(page);
  await expect(page.getByRole('banner')).toContainText(lab.fixture.runId);
  const button = start(frame);
  await expect(frame.locator('.companion-turn').getByRole('button', { name: 'Run fortsetzen' })).toHaveCount(1);
  await expect(button).toHaveAccessibleDescription(await frame.locator('.companion-turn > p[id]').innerText());
  await button.focus(); await expect(button).toBeFocused();
  lab.faults.stale = true;
  await button.press('Enter');
  const reload = frame.getByRole('button', { name: 'Run neu laden' });
  await expect(reload).toBeVisible();
  lab.faults.stale = false;
  await reload.click();
  await expect(button).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(lab.fixture.runId);
  expect(lab.tally().message).toBe(0);
});

for (const input of ['pointer', 'keyboard']) test('SCN-003 one request from ' + input, async ({ page, lab }) => {
  const frame = await lab.open(page);
  await publish(lab, frame, input === 'keyboard');
  expect(lab.tally()).toMatchObject({ gesture: 1, permit: 1, message: 1, grant: 0 });
  expect(lab.events).toContainEqual(expect.objectContaining({ kind: 'gesture', name: input }));
  expect(lab.messages[0].call.arguments.continuation_attempt_id).toBe(lab.events.find(e => e.kind === 'permit').attempt);
});

test('SCN-004 the receiving dispatch reads the original fixture and replies once on replay', async ({ page, lab }) => {
  await publish(lab, await lab.open(page));
  lab.receive(); lab.receive();
  expect(lab.tally()).toMatchObject({ grant: 1, read: 1, reply: 1, message: 1 });
  const attempt = lab.messages[0].call.arguments.continuation_attempt_id;
  expect(lab.events).toContainEqual(expect.objectContaining({ kind: 'read', attempt, run_id: lab.fixture.runId, gate: lab.current().evaluation.current_gate }));
  expect(lab.events).toContainEqual(expect.objectContaining({ kind: 'reply', attempt, marker: lab.marker }));
});

test('SCN-005 two ready cards share one handoff', async ({ context, page, lab }) => {
  const first = await lab.open(page), other = await lab.open(await context.newPage());
  await Promise.all([first, other].map(frame => expect(start(frame)).toBeVisible()));
  lab.synchronizeStarts();
  await Promise.all([first, other].map(frame => start(frame).click()));
  await Promise.all([first, other].map(frame => expect(pending(frame)).toBeVisible()));
  await expect.poll(() => lab.tally().message).toBe(1);
  lab.receive();
  await Promise.all([first, other].map(frame => expect(running(frame)).toBeVisible({ timeout: 10000 })));
  expect(lab.tally()).toMatchObject({ gesture: 2, permit: 1, message: 1, grant: 1 });
  expect(new Set(lab.events.filter(e => e.kind === 'gesture').map(e => e.view)).size).toBe(2);
});

for (const first of ['companion', 'ordinary']) test('SCN-006 mixed continuation race, first ' + first, async ({ page, lab }) => {
  const frame = await lab.open(page);
  await expect(start(frame)).toBeVisible();
  if (first === 'ordinary') {
    lab.receive('ordinary');
    await start(frame).click();
  } else {
    await publish(lab, frame);
    lab.receive('ordinary'); lab.receive();
  }
  await expect(running(frame)).toBeVisible({ timeout: 10000 });
  expect(lab.tally()).toMatchObject({ gesture: 1, permit: first === 'companion' ? 1 : 0,
    message: first === 'companion' ? 1 : 0, grant: 1, reply: 1 });
  expect(lab.events.find(e => e.kind === 'grant').route).toBe(first);
});

test('SCN-007 reopening and checking pending cannot resend the original request', async ({ page, lab }) => {
  const frame = await lab.open(page);
  await publish(lab, frame);
  const original = lab.messages[0].call.arguments.continuation_attempt_id;
  await page.reload(); await expect(pending(frame)).toBeVisible();
  await expect(start(frame)).toHaveCount(0);
  await pending(frame).click();
  await expect(frame.getByText('Der Begleiter hat den Status geprüft.', { exact: false })).toBeVisible();
  expect(lab.tally()).toMatchObject({ permit: 1, message: 1, grant: 0 });
  expect(lab.receive().continuation.work_admission.attempt_id).toBe(original);
});

for (const variant of ['cancel', 'lost-publication', 'stale']) test('SCN-008 recovery after ' + variant, async ({ page, lab }) => {
  const frame = await lab.open(page);
  if (variant === 'cancel') {
    lab.faults.rejectContext = true;
    await start(frame).click();
    const retry = frame.getByRole('button', { name: 'Erneut versuchen' });
    await expect(retry).toBeVisible({ timeout: 10000 });
    expect(lab.events).toContainEqual(expect.objectContaining({ kind: 'service-cancel', state: 'ready' }));
    expect(lab.tally().message).toBe(0);
    lab.faults.rejectContext = false;
    await retry.click(); await expect.poll(() => lab.tally().message).toBe(1);
    const reservations = lab.events.filter(e => e.kind === 'service-reserve').map(e => e.attempt);
    expect(new Set(reservations).size).toBe(2);
  } else if (variant === 'lost-publication') {
    lab.faults.losePublishReply = true;
    await start(frame).click(); await expect(pending(frame)).toBeVisible();
    await page.reload(); await pending(frame).click();
    await expect(frame.getByText('Der Begleiter hat den Status geprüft.', { exact: false })).toBeVisible();
    await expect(frame.getByRole('button', { name: /Erneut versuchen|Run fortsetzen/ })).toHaveCount(0);
    expect(lab.tally()).toMatchObject({ permit: 1, message: 0, grant: 0 });
  } else {
    lab.faults.stale = true;
    await start(frame).click();
    await expect(frame.getByRole('button', { name: 'Run neu laden' })).toBeVisible();
    lab.faults.stale = false;
    await frame.getByRole('button', { name: 'Run neu laden' }).click(); await expect(start(frame)).toBeVisible();
    expect(lab.tally()).toMatchObject({ permit: 0, message: 0, grant: 0 });
  }
});

for (const event of ['Stop', 'Interrupt']) test('SCN-009 keeps the attempt locked until its end is confirmed, ' + event, async ({ page, lab }) => {
  const frame = await lab.open(page);
  await publish(lab, frame);
  attachTurn(lab, lab.receive());
  await expect(running(frame)).toBeVisible({ timeout: 10000 });
  lab.hook(event, { session_id: 'unrelated-chat' });
  await page.reload(); await expect(running(frame)).toBeVisible();
  await expect(start(frame)).toHaveCount(0);
  lab.hook(event);
  if (event === 'Interrupt') {
    const stopping = frame.getByText(/Der Abbruch wurde angefordert/);
    await expect(stopping).toBeVisible({ timeout: 10000 });
    await expect(start(frame)).toHaveCount(0);
    expect(lab.receive('ordinary').continuation).toBeNull();
    lab.hook('Stop', { turn_id: 'another-turn' });
    await page.reload();
    await expect(stopping).toBeVisible();
    await expect(start(frame)).toHaveCount(0);
    lab.hook('Stop');
  }
  await expect(start(frame)).toBeVisible({ timeout: 10000 });
  expect(lab.tally()).toMatchObject({ gesture: 1, permit: 1, message: 1, grant: 1 });
});

for (const predecessor of ['pending', 'settled', 'unreadable']) test('SCN-010 simulated candidate change with ' + predecessor + ' predecessor', async ({ page, context, lab }) => {
  const frame = await lab.open(page);
  await publish(lab, frame);
  if (predecessor === 'settled') {
    attachTurn(lab, lab.receive()); lab.hook('Stop');
    await expect(start(frame)).toBeVisible({ timeout: 10000 });
  } else if (predecessor === 'unreadable') {
    const directory = join(lab.root, 'codex-continuation');
    const files = readdirSync(directory).filter(f => f.endsWith('.json'));
    expect(files).toHaveLength(1);
    writeFileSync(join(directory, files[0]), 'unreadable disposable predecessor');
  }
  // Freeze the old selection before restarting the simulated service.
  await lab.rollover();
  if (predecessor === 'settled') {
    await start(frame).click();
    await expect(frame.getByText(/Fortsetzung ist gerade nicht verfügbar/)).toBeVisible();
  }
  await expect(start(frame)).toHaveCount(0);
  const fresh = await lab.open(await context.newPage());
  if (predecessor === 'settled') {
    await publish(lab, fresh);
    expect(lab.messages[0].call.arguments.continuation_attempt_id).not.toBe(lab.messages[1].call.arguments.continuation_attempt_id);
  } else {
    if (predecessor === 'pending') await expect(pending(fresh)).toBeVisible();
    else await expect(fresh.getByText(/Fortsetzung ist gerade nicht verfügbar/)).toBeVisible();
    await expect(start(fresh)).toHaveCount(0);
    expect(lab.tally()).toMatchObject({ message: 0, grant: 0 });
  }
});

test('SCN-011 evidence distinguishes a measured zero, a duplicate send and a missing source', async ({ page, lab }) => {
  await publish(lab, await lab.open(page));
  const sent = lab.events.find(e => e.kind === 'message');
  const injected = [...lab.events, { ...sent, seq: 999 }, { ...sent, candidate: 'unrelated-candidate' }];
  const sources = new Set(lab.observed);
  expect(counts(injected, sources, lab.candidate())).toMatchObject({ message: 2, grant: 0 });
  sources.delete('grant');
  expect(counts(injected, sources, lab.candidate())).toMatchObject({ message: 2, grant: 'unknown' });
});

for (const complete of [true, false]) test('SCN-012 evidence reconstructs a ' + (complete ? 'complete' : 'partial') + ' fixture handoff', async ({ page, lab }) => {
  await publish(lab, await lab.open(page));
  if (complete) lab.receive(); else lab.observed.delete('grant');
  const attempt = lab.messages[0].call.arguments.continuation_attempt_id;
  const chain = lab.events.filter(e => e.attempt === attempt);
  const kinds = chain.map(e => e.kind);
  expect(kinds.filter(kind => ['permit','message','grant','read','reply'].includes(kind)))
    .toEqual(complete ? ['permit','message','grant','read','reply'] : ['permit','message']);
  expect(lab.tally().grant).toBe(complete ? 1 : 'unknown');
  expect(chain.every(e => e.candidate === lab.candidate())).toBe(true);
});
