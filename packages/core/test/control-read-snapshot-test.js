import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { captureControl } from '../lib/control-read/snapshot.js';
const setup = () => { const root = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'control-capture-'))); fs.mkdirSync(join(root, '.agdf/control'), { recursive: true }); fs.writeFileSync(join(root, '.agdf/control/a.txt'), 'before'); return root; };
test('SCN-013: private immutable bytes, edits and membership invalidate revalidation', () => {
  const root = setup(); try {
    const path = join(root, '.agdf/control/a.txt'), view = captureControl(root);
    const bytes = view.readFileSync(path); bytes.fill(0); assert.equal(view.readFileSync(path, 'utf8'), 'before');
    fs.writeFileSync(path, 'after!'); assert.equal(view.readFileSync(path, 'utf8'), 'before'); assert.throws(() => view.revalidate(), /source_changed/);
    const fresh = captureControl(root); fs.writeFileSync(join(root, '.agdf/control/new.txt'), 'new'); assert.throws(() => fresh.revalidate(), /source_changed/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('SCN-013: deterministic mutations during capture retry once, then fail', () => {
  for (const operation of ['edit', 'rename', 'restore', 'ancestor']) {
    const root = setup(); let captures = 0;
    try { assert.throws(() => captureControl(root, { checkpoint(phase) {
      if (phase !== 'captured') return; captures++;
      const path = join(root, '.agdf/control/a.txt');
      if (operation === 'edit') fs.writeFileSync(path, String(captures));
      if (operation === 'restore') { fs.writeFileSync(path, 'temp'); fs.writeFileSync(path, 'before'); }
      if (operation === 'rename') { fs.renameSync(path, path + '.old'); fs.writeFileSync(path, 'before'); }
      if (operation === 'ancestor') { fs.renameSync(join(root, '.agdf/control'), join(root, '.agdf/control-old-' + captures)); fs.mkdirSync(join(root, '.agdf/control')); fs.writeFileSync(path, 'before'); }
    } }), /source_changed/); assert.equal(captures, 2); }
    finally { fs.rmSync(root, { recursive: true, force: true }); }
  }
});
test('SCN-023: file and ancestor symlinks and out-of-control reads are denied', () => {
  const root = setup(); try {
    const view = captureControl(root);
    assert.throws(() => view.readFileSync(join(root, 'secret')), /resource_denied/);
    fs.symlinkSync(join(root, '.agdf/control/a.txt'), join(root, '.agdf/control/link'));
    assert.throws(() => captureControl(root), /resource_denied/);
    fs.unlinkSync(join(root, '.agdf/control/link')); fs.renameSync(join(root, '.agdf/control'), join(root, '.agdf/elsewhere'));
    fs.symlinkSync(join(root, '.agdf/elsewhere'), join(root, '.agdf/control')); assert.throws(() => view.revalidate(), /resource_denied/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('SCN-026: inclusive file-count/per-file/aggregate boundaries and time limit', () => {
  const root = setup(); try {
    assert.equal(captureControl(root, { limits: { files: 1, file: 6, total: 6 } }).byte_count, 6);
    for (const limits of [{ files: 0 }, { file: 5 }, { total: 5 }]) assert.throws(() => captureControl(root, { limits }), /resource_limit/);
    assert.throws(() => captureControl(root, { limits: { timeout: -1 } }), /timeout/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
