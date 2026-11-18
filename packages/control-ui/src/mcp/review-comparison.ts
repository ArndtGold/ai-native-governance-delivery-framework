import type { DecisionBootstrap } from './decision-bootstrap';

const limit = 131072;
const encoder = new TextEncoder();
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return 'sha256:' + [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function readCurrentComparisonSource(view: DecisionBootstrap,
  read: (args: Record<string, unknown>) => Promise<unknown>, active: () => boolean) {
  const { binding, target, comparison } = view;
  const source = binding.material_sources.find(row => row.type === binding.gate);
  if (!source || !view.source_digest || comparison.state !== 'available' || comparison.current_digest !== view.source_digest)
    throw Error('comparison_unavailable');
  const request = { operation: 'authoring-inputs', presentation_language: binding.presentation_language,
    working_directory: target.display_path, primary_target: target.display_path, target_source: 'explicit_target',
    target_id: target.target_id, run_id: binding.run_id, expected_revision_id: binding.expected_revision_id, bundle: true };
  let cursor: string | undefined, manifest: string | undefined, total: number | undefined, text = '', bytes = 0;
  const seen = new Set<string>();
  for (let page = 0; page < 32 && active(); page++) {
    const result = await read({ ...request, ...(cursor ? { cursor } : {}) });
    if (!active() || !object(result) || result.outcome !== 'inspect_result' || !object(result.target)
      || result.target.governance_target !== target.display_path || !object(result.report)) throw Error('comparison_unavailable');
    const report = result.report;
    if (report.available !== true || report.authorizes !== false || report.format !== 'document_bundle_v2'
      || report.run_id !== binding.run_id || report.revision_id !== binding.expected_revision_id
      || typeof report.manifest_digest !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(report.manifest_digest) || (manifest && report.manifest_digest !== manifest)
      || !Array.isArray(report.documents) || !Array.isArray(report.fragments)) throw Error('comparison_unavailable');
    manifest = report.manifest_digest;
    const parts = [...report.documents, ...report.fragments].filter(row =>
      object(row) && row.role === 'source' && row.type === source.type && row.path === source.path);
    if (parts.length > 1) throw Error('comparison_unavailable');
    const part = parts[0];
    if (part) {
      if (part.digest !== source.digest || typeof part.content !== 'string' || part.byte_start !== bytes
        || typeof part.total_bytes !== 'number' || !Number.isInteger(part.total_bytes) || part.total_bytes < 1 || part.total_bytes > limit
        || (total !== undefined && total !== part.total_bytes)) throw Error('comparison_unavailable');
      total = part.total_bytes;
      bytes += encoder.encode(part.content).byteLength;
      if (part.byte_end !== bytes || bytes > part.total_bytes) throw Error('comparison_unavailable');
      text += part.content;
      if (bytes === part.total_bytes) {
        const canonical = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/u, '');
        if (await sha256(canonical) !== source.digest || await sha256(text) !== comparison.current_digest || !active())
          throw Error('comparison_unavailable');
        return text;
      }
    }
    if (report.complete || typeof report.next_cursor !== 'string' || !report.next_cursor.startsWith(manifest.slice(7) + ':')
      || seen.has(report.next_cursor)) break;
    cursor = report.next_cursor;
    seen.add(cursor);
  }
  throw Error('comparison_unavailable');
}
