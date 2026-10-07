import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { captureControl, captureControlScope } from '../lib/control-read/snapshot.js';
import { readFileSync, existsSync, readdirSync } from '../lib/control-read/fs.js';

function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'agdf-scoped-capture-')));
  const control = join(root, '.agdf/control');
  fs.mkdirSync(join(control, 'history'), { recursive: true });
  const backlog = join(control, 'MASTER_BACKLOG.md');
  fs.writeFileSync(backlog, '# Master Backlog\n');
  return { root, control, backlog, close: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test('SCN-061/063: scoped recording and replay ignore over 64 MiB of unrelated history', () => {
  const f = fixture();
  try {
    const bytes = Buffer.alloc(24 * 1024 ** 2, 1);
    for (let i = 0; i < 3; i++) fs.writeFileSync(join(f.control, 'history', `${i}.bin`), bytes);
    assert.throws(() => captureControl(f.root, { limits: { total: 64 * 1024 ** 2 } }), /resource_limit/);
    const reads = [];
    const result = captureControlScope(f.root, () => readFileSync(f.backlog, 'utf8'), {
      limits: { total: 64 * 1024 ** 2 }, checkpoint(stage, path) { if (stage === 'file_read') reads.push(path); },
    });
    assert.equal(result.data, '# Master Backlog\n');
    assert.equal(result.view.file_count, 1);
    assert.equal(result.view.byte_count, fs.statSync(f.backlog).size);
    assert.deepEqual(reads, [f.backlog]);
    assert.equal(result.view.revalidate(), true);
    fs.writeFileSync(join(f.control, 'history', '0.bin'), 'unrelated history changed');
    assert.equal(result.view.revalidate(), true);
    fs.writeFileSync(f.backlog, '# New pointer\n');
    assert.throws(() => result.view.revalidate(), /source_changed/);
  } finally { f.close(); }
});

test('SCN-065: observed absence and directory entries are revalidation dependencies', () => {
  const f = fixture();
  try {
    const missing = join(f.control, 'missing.md');
    const absent = captureControlScope(f.root, () => existsSync(missing));
    assert.equal(absent.data, false);
    fs.writeFileSync(missing, 'new');
    assert.throws(() => absent.view.revalidate(), /source_changed/);
    const listing = captureControlScope(f.root, () => readdirSync(join(f.control, 'history')));
    assert.deepEqual(listing.data, []);
    fs.writeFileSync(join(f.control, 'history', 'new.md'), 'new');
    assert.throws(() => listing.view.revalidate(), /source_changed/);
  } finally { f.close(); }
});

test('SCN-066: replay cannot introduce an unrecorded path, byte read or fabricated absence', () => {
  const f = fixture();
  try {
    for (const replayRead of [() => existsSync(join(f.control, 'unexpected.md')), () => readFileSync(f.backlog)]) {
      let call = 0;
      assert.throws(() => captureControlScope(f.root, () => {
        if (call++ === 0) return existsSync(f.backlog);
        try { return replayRead(); } catch { return 'swallowed'; }
      }), /source_changed/);
    }
  } finally { f.close(); }
});

test('SCN-066/082: capture mutation and symlink/ancestor swaps fail before publication', () => {
  const f = fixture();
  try {
    assert.throws(() => captureControlScope(f.root, () => readFileSync(f.backlog), {
      checkpoint(stage) { if (stage === 'captured') fs.writeFileSync(f.backlog, 'changed'); },
    }), /source_changed/);
    assert.throws(() => captureControlScope(f.root, () => readFileSync(f.backlog), {
      checkpoint(stage) { if (stage === 'file_read') {
        fs.renameSync(f.control, f.control + '-previous');
        fs.symlinkSync(f.control + '-previous', f.control);
      } },
    }), /source_changed|resource_denied/);
  } finally { f.close(); }
});

test('SCN-066/077: contained denial and byte limits survive consumer catch blocks', () => {
  const f = fixture();
  try {
    for (const [read, options, code] of [
      [() => readFileSync(join(f.root, 'outside.md')), {}, 'resource_denied'],
      [() => readFileSync(f.backlog), { limits: { total: 1 } }, 'resource_limit'],
    ]) assert.throws(() => captureControlScope(f.root, () => {
      try { return read(); } catch { return 'swallowed'; }
    }, options), new RegExp(code));
  } finally { f.close(); }
});

test('SCN-077: inclusive actual file bytes, unique file counts, path depth and capture deadline remain bounded', () => {
  const f=fixture();
  try {
    const large=join(f.control,'boundary.txt');fs.writeFileSync(large,Buffer.alloc(32*1024**2,97));
    const exact=captureControlScope(f.root,()=>readFileSync(large).length);
    assert.equal(exact.data,32*1024**2);assert.equal(exact.view.byte_count,32*1024**2);assert.equal(exact.view.file_count,1);
    fs.appendFileSync(large,'x');assert.throws(()=>captureControlScope(f.root,()=>readFileSync(large)),/resource_limit/);
    const other=join(f.control,'other.md');fs.writeFileSync(other,'other');
    assert.throws(()=>captureControlScope(f.root,()=>[readFileSync(f.backlog),readFileSync(other)],{limits:{files:1}}),/resource_limit/);
    assert.throws(()=>captureControlScope(f.root,()=>existsSync(join(f.control,...Array(129).fill('nested'),'source.md'))),/resource_limit/);
    const now=Date.now,base=now();
    try {
      Date.now=()=>base;
      assert.throws(()=>captureControlScope(f.root,()=>readFileSync(f.backlog),{checkpoint(stage){if(stage==='dependency')Date.now=()=>base+10_001;}}),/timeout/);
    } finally {Date.now=now;}
  } finally {f.close();}
});

test('SCN-082: atomic replacement during recording, freeze, replay and final publication cannot yield a current observation',()=>{
  for(const boundary of ['file_read','captured','replay','published']){
    const f=fixture();let changed=false;
    try {
      assert.throws(()=>captureControlScope(f.root,()=>readFileSync(f.backlog,'utf8'),{checkpoint(stage){
        if(stage===boundary&&!changed){changed=true;const next=f.backlog+'.next';fs.writeFileSync(next,'replacement bytes');fs.renameSync(next,f.backlog);}
      }}),/source_changed/);
      assert.equal(changed,true);
    } finally {f.close();}
  }
});
