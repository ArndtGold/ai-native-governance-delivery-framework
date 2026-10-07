import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { backlogUrHeading, backlogUrSource } from '../lib/control-inspect/cockpit-backlog.js';
import { parseCockpitArguments } from '../lib/control-inspect/cockpit-contract.js';

const source = '.agdf/control/MASTER_BACKLOG.md', ur = '.agdf/control/artefacts/fixture-a/UR.md';
const row = (key, link) => `| 1 | ${key} | Backlog ${key} | In progress | ${link} | stored | next |`;
function setup(f, rows = [row('fixture-a', '[UR](artefacts/fixture-a/UR.md)'), row('other', '[UR](artefacts/other/UR.md)')]) {
  fs.writeFileSync(join(f.root, source), `# Backlog\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n`);
}
const enrichment = (reader, snapshot, indices = [0]) => reader.backlogTitles(indices.map(index => snapshot.data.entries[index].row_id), snapshot.snapshot_id);

test('SCN-085/090/100: initial backlog only; title batch reads complete requested UR only, reissues selectors and never writes', () => {
  const f = fixture(); try {
    setup(f); fs.writeFileSync(join(f.root, ur), '# UR: Benutzer verstehen\n\nStatus: completed\nNext step: release immediately\nBody not in DTO\n');
    const before = treeBytes(f.root), reads = [], reader = createCockpitReader(f.root, { checkpoint(stage, path) { if (stage === 'file_read') reads.push(path); } });
    const first = reader.snapshot(); assert.equal(first.data.file_count, 1); assert.deepEqual(reads, [join(f.root, source)]);
    reads.length = 0; const titles = enrichment(reader, first);
    assert.equal(titles.state, 'available'); assert.equal(titles.data.file_count, 2);
    assert.deepEqual(new Set(reads), new Set([join(f.root, source), join(f.root, ur)]));
    const title = titles.data.entries[0].title_observation;
    assert.equal(title.title, 'Benutzer verstehen'); assert.equal(title.heading, 'UR: Benutzer verstehen'); assert.equal(title.path, ur);
    assert.equal(title.content_digest, createHash('sha256').update(fs.readFileSync(join(f.root, ur))).digest('hex'));
    assert.equal(title.backlog_digest, first.data.content_digest); assert.equal(titles.data.entries[1].title_observation, undefined);
    assert.equal(titles.data.entries[0].stored_status, 'In progress');
    assert.equal(titles.data.entries[0].stored_next_step, 'next');
    assert.notEqual(first.snapshot_id, titles.snapshot_id); assert.notEqual(first.data.entries[0].row_id, titles.data.entries[0].row_id);
    assert.throws(() => enrichment(reader, first), /resource_denied/);
    assert.equal(reader.freshness(titles.snapshot_id).data.unchanged, true);
    assert.deepEqual(treeBytes(f.root), before); assert.doesNotMatch(JSON.stringify(titles.data), /Body not in DTO/);
  } finally { f.close(); }
});

test('SCN-086/087: explicit UR links deduplicate; ambiguous, absent and unsafe links never derive or follow sources', () => {
  const select = (link, current = '') => backlogUrSource({ source_links: link, current_spec: current });
  assert.equal(select('[UR](artefacts/a/UR.md)', '[UR](artefacts/a/./UR.md)').path, '.agdf/control/artefacts/a/UR.md');
  assert.equal(select('[UR](artefacts/a/UR.md) [UR](artefacts/b/UR.md)').code, 'ur_link_ambiguous');
  assert.equal(select('[OR](artefacts/a/OR.md)').code, 'ur_link_missing');
  for (const path of ['/tmp/UR.md','https://example.com/UR.md','../UR.md','artefacts/a%2fUR.md','artefacts/a/UR.md#x','artefacts/a/UR.md?q=1','artefacts\\a\\UR.md','runs/a/UR.md','artefacts/a/UR.json']) assert.equal(select(`[UR](${path})`).code, 'resource_denied', path);
});

test('SCN-088: real H1 parsing ignores frontmatter, fences, comments and indented code, preserves passive heading text', () => {
  assert.equal(backlogUrHeading('---\ntitle: wrong\n---\n<!--\n# wrong\n-->\n```md\n# wrong\n```\n~~~\n# wrong\n~~~\n    # wrong\n# UR: C# ###\n'), 'UR: C#');
  assert.equal(backlogUrHeading('## Wrong\n\nUR: Verständliche Überschrift\n=====\n'), 'UR: Verständliche Überschrift');
  assert.equal(backlogUrHeading('# <img onerror="evil()"> **Title**\n'), '<img onerror="evil()"> **Title**');
  assert.equal(backlogUrHeading('# UR: C#\n'), 'UR: C#');
  assert.equal(backlogUrHeading('No heading\n---\n'), '');
  assert.equal(backlogUrHeading('First line\nSecond line\n====\n'), 'First line\nSecond line');
  assert.equal(backlogUrHeading('+ list item\n====\n\n# Valid\n'), 'Valid');
  assert.equal(backlogUrHeading('Old paragraph\n<!-- comment\nend -->\n====\n\n# Valid\n'), 'Valid');
});

test('SCN-089: missing, unsupported, huge and heading-limit URs are local fallbacks without hiding other rows', () => {
  const f = fixture(); try {
    for (const [content, code] of [[null,'document_missing'], [Buffer.from([255]),'document_unsupported'], ['# '+ 'a'.repeat(513),'resource_limit'], ['# '+ '😀'.repeat(513),'resource_limit'], ['No heading','ur_heading_missing'], ['# UR: ','ur_heading_missing'], [Buffer.alloc(2 * 1024 ** 2 + 1),'resource_limit']]) {
      setup(f); if (content === null) fs.rmSync(join(f.root, ur)); else fs.writeFileSync(join(f.root, ur), content);
      const reader = createCockpitReader(f.root), first = reader.snapshot(), titles = enrichment(reader, first);
      assert.equal(titles.state, 'available'); assert.equal(titles.data.entries.length, 2);
      assert.equal(titles.data.entries[0].title_observation.code, code); assert.equal(titles.data.entries[0].title, 'Backlog fixture-a');
      assert.equal(reader.freshness(titles.snapshot_id).data.unchanged, true);
    }
  } finally { f.close(); }
});

test('SCN-087/090: optional symlink and denied ancestor are captured without following them; later replacement invalidates', () => {
  const f = fixture(); try {
    setup(f); fs.rmSync(join(f.root, ur)); fs.symlinkSync('/etc/passwd', join(f.root, ur));
    const reads = [], reader = createCockpitReader(f.root, { checkpoint(stage, path) { if (stage === 'file_read') reads.push(path); } });
    let first = reader.snapshot(), result = enrichment(reader, first);
    assert.equal(result.data.entries[0].title_observation.code, 'resource_denied'); assert.deepEqual(new Set(reads), new Set([join(f.root, source)]));
    assert.equal(reader.freshness(result.snapshot_id).data.unchanged, true);
    fs.rmSync(join(f.root, ur)); fs.writeFileSync(join(f.root, ur), '# Title'); assert.throws(() => reader.freshness(result.snapshot_id), /source_changed/);
    fs.rmSync(join(f.root, '.agdf/control/artefacts/fixture-a'), { recursive: true }); fs.symlinkSync('/etc', join(f.root, '.agdf/control/artefacts/fixture-a'));
    first = reader.snapshot(); result = enrichment(reader, first); assert.equal(result.data.entries[0].title_observation.code, 'resource_denied');
    assert.equal(reader.freshness(result.snapshot_id).data.unchanged, true);
  } finally { f.close(); }
});

test('SCN-090: backlog or requested UR race rejects candidate; unrelated source edits do not invalidate', () => {
  const f = fixture(); try {
    setup(f); const reader = createCockpitReader(f.root), first = reader.snapshot();
    fs.appendFileSync(join(f.root, ur), '\nchanged'); assert.equal(reader.freshness(first.snapshot_id).data.unchanged, true);
    let result = enrichment(reader, first); assert.equal(result.state, 'available');
    fs.appendFileSync(join(f.root, ur), '\nchanged again'); assert.throws(() => reader.freshness(result.snapshot_id), /source_changed/);
    let armed = false;
    const raced = createCockpitReader(f.root, { checkpoint(stage) { if (armed && stage === 'replay') { armed = false; fs.appendFileSync(join(f.root, source), '\nchanged backlog'); } } });
    const opening = raced.snapshot(); armed = true; result = enrichment(raced, opening);
    assert.equal(result.code, 'source_changed'); assert.equal(result.snapshot_id, null); assert.equal(result.data, null);
  } finally { f.close(); }
});

test('SCN-096/098: strict batch schema and foreign/stale row selectors preserve independently valid sessions', async () => {
  const f = fixture(); setup(f); const service = createCockpitSessionService(f.root);
  try {
    const a = (await service.render())._meta.agdf_cockpit.session_id, b = (await service.render())._meta.agdf_cockpit.session_id;
    const read = (session_id, input) => service.read({ session_id, ...input });
    const first = await read(a, { operation: 'snapshot' }), other = await read(b, { operation: 'snapshot' });
    const input = { operation: 'backlog_titles', session_id: a, snapshot_id: first.snapshot_id, row_ids: [first.data.entries[0].row_id] };
    for (const bad of [{ ...input, row_ids: [] },{ ...input, row_ids: Array.from({ length: 13 }, () => randomUUID()) },{ ...input, row_ids: [input.row_ids[0],input.row_ids[0]] },{ ...input, path: ur },{ ...input, content: 'forged' },{ ...input, run_id: 'fixture-a' }]) assert.throws(() => parseCockpitArguments(bad), /resource_denied/);
    assert.equal((await service.read({ ...input, row_ids: [other.data.entries[0].row_id] })).code, 'resource_denied');
    assert.equal((await read(a, { operation: 'freshness', snapshot_id: first.snapshot_id })).data.unchanged, true);
    const enriched = await service.read(input); assert.equal(enriched.data.entries[0].title_observation.state, 'available');
    assert.equal(enriched.authorizes, false); assert.equal((await service.read(input)).code, 'resource_denied');
    assert.equal((await read(b, { operation: 'freshness', snapshot_id: other.snapshot_id })).data.unchanged, true);
    assert.equal((await read(a, { operation: 'freshness', snapshot_id: enriched.snapshot_id })).data.unchanged, true);
  } finally { await service.close(); f.close(); }
});
