// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { readCurrentComparisonSource } from '../src/mcp/review-comparison';
import { decisionView } from './decision-fixtures';

function fixture() {
  const view = decisionView(), { binding, target } = view;
  const source = binding.material_sources[0], first = '# Current source\n', second = '\nRevised text.\n';
  source.digest = view.source_digest = 'sha256:1ab50b6f9484669c402a22d5d1ab92d9b7a70cabb2c0a24232fc99e883c57b4f';
  const archive = '# Older source\n';
  view.comparison = { state: 'available', previous_revision_id: '00000000-0000-4000-8000-000000000001',
    previous_digest: 'sha256:d5e6f911bf746956f0d14f9ad436f404b2d7d11c66207ab4598d5f9b533c7aee', previous_text: archive, current_digest: source.digest, unchanged: false };
  const manifest = 'sha256:72fe0d961c89cdc8cf6a0c8663484fa8d2259521a0ecbdf00ad49be1a3a07b78';
  const cursor = manifest.slice(7) + ':1';
  const part = (content: string, start: number) => ({ role: 'source', ...source, content,
    byte_start: start, byte_end: start + content.length, total_bytes: first.length + second.length });
  const page = (content: string, start: number, complete: boolean) => ({
    outcome: 'inspect_result', target: { governance_target: target.display_path },
    report: { available: true, authorizes: false, format: 'document_bundle_v2', run_id: binding.run_id,
      revision_id: binding.expected_revision_id, manifest_digest: manifest, complete, next_cursor: complete ? null : cursor,
      documents: [], fragments: [part(content, start)] },
  });
  return { view, first, second, cursor, page };
}

it('reads only the bound source across pages and never uses the displayed summary as that source', async () => {
  const f = fixture();
  const read = vi.fn().mockResolvedValueOnce(f.page(f.first, 0, false))
    .mockResolvedValueOnce(f.page(f.second, f.first.length, true));
  await expect(readCurrentComparisonSource(f.view, read, () => true)).resolves.toBe(f.first + f.second);
  expect(read.mock.calls.map(([args]) => [args.operation, args.run_id, args.expected_revision_id, args.cursor])).toEqual([
    ['authoring-inputs', f.view.binding.run_id, f.view.binding.expected_revision_id, undefined],
    ['authoring-inputs', f.view.binding.run_id, f.view.binding.expected_revision_id, f.cursor],
  ]);
});

it.each(['wrong bytes', 'out of order', 'old session', 'different revision'])('withholds comparison for %s', async failure => {
  const f = fixture(), page = f.page(failure === 'wrong bytes' ? f.first.replace('Current', 'Another') : f.first,
    failure === 'out of order' ? 1 : 0, false);
  if (failure === 'different revision') page.report.revision_id = 'other';
  let active = true;
  const read = vi.fn().mockImplementationOnce(async () => { if (failure === 'old session') active = false; return page; })
    .mockResolvedValueOnce(f.page(f.second, f.first.length, true));
  await expect(readCurrentComparisonSource(f.view, read, () => active)).rejects.toThrow('comparison_unavailable');
});
