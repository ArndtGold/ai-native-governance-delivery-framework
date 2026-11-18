import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { fixture } from '../../core/test/control-cockpit-fixtures.js';

const plugin = new URL('../generated/plugins/agdf/', import.meta.url);
const entrypoint = new URL('runtime/agdf-local.js', plugin);
const pluginRoot = fileURLToPath(plugin);

test('the packaged observer emits scoped hints, observes journal creation and retires on SIGTERM', async () => {
  const active = fixture(), foreign = fixture();
  const config = mkdtempSync(join(tmpdir(), 'agdf-observer-journal-'));
  const data = join(config, 'plugins', 'data', 'agdf-agdf'), journal = join(data, 'companion');
  const child = spawn(process.execPath, [fileURLToPath(entrypoint), 'companion-observe', active.root, data], {
    env: { ...process.env, AGDF_SURFACE: 'claude', CLAUDE_PLUGIN_ROOT: pluginRoot },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const closed = once(child, 'close');
  const lines = [], errors = [];
  createInterface({ input: child.stdout }).on('line', line => lines.push(line));
  child.stderr.on('data', chunk => errors.push(String(chunk)));
  const until = async kind => {
    for (let tick = 0; tick < 200 && !lines.includes(kind) && child.exitCode === null; tick++) await delay(25);
    assert.ok(lines.includes(kind), JSON.stringify({ kind, lines, errors, exitCode: child.exitCode }));
  };
  try {
    await until('ready');
    appendFileSync(foreign.runPath, '\n');
    writeFileSync(join(active.root, 'outside-agdf.txt'), 'unrelated');
    await delay(300);
    assert.deepEqual(lines, ['ready']);
    appendFileSync(active.runPath, '\n');
    await until('run');
    lines.splice(0);
    const planned = join(active.root, '.agdf', 'control', 'planned', 'plan-observer');
    mkdirSync(planned, { recursive: true });
    writeFileSync(join(planned, 'UR.md'), '# Planned requirements');
    await until('run');
    mkdirSync(journal, { recursive: true });
    appendFileSync(join(journal, 'events.jsonl'), '{}\n');
    await until('journal');
    assert.equal(child.kill('SIGTERM'), true);
    // Windows terminates a child immediately; POSIX lets the observer retire its watchers.
    assert.deepEqual(await closed, process.platform === 'win32' ? [null, 'SIGTERM'] : [0, null]);
    const count = lines.length;
    appendFileSync(active.runPath, '\n');
    await delay(200);
    assert.equal(lines.length, count);
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await closed.catch(() => {});
    active.close();
    foreign.close();
    rmSync(config, { recursive: true, force: true });
  }
});
