import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fail, READ_LIMITS } from '../control-read/snapshot.js';

export const CONTEXT_LIMIT = 64 * 1024;
const GRAPH = '.agdf/control/CONTEXT_GRAPH.md';
const nodeId = /^CG-[A-Za-z0-9_-]+$/;
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const digest = value => createHash('sha256').update(value).digest('hex');

// Source offsets preserve original text, including line endings. Fenced examples
// never register headings; only exact level-three IDs own a node.
function nodes(content) {
  const headings = []; let offset = 0, fence = null;
  for (const line of content.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)/);
    if (marker) {
      if (!fence) fence = { char: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
    } else if (!fence) {
      const heading = line.match(/^ {0,3}(#{1,3})\s+(.+?)\s*(?:\r?\n)?$/);
      if (heading) headings.push({ level: heading[1].length, id: heading[2], offset });
    }
    offset += line.length;
  }
  const result = new Map();
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    if (heading.level !== 3 || !nodeId.test(heading.id)) continue;
    const text = content.slice(heading.offset, headings[i + 1]?.offset ?? content.length);
    const entries = result.get(heading.id) ?? []; entries.push(text); result.set(heading.id, entries);
  }
  return result;
}

export function projectCockpitContext(view, root, runId, rawRefs) {
  const refs = String(rawRefs ?? '').trim();
  if (!refs || refs === 'none') return { run_id: runId, references: [] };
  const origins = refs.split(';').map(value => value.trim());
  if (origins.length > 64) fail('resource_limit');
  let graphBytes = null, graphDigest = null, graphNodes = null, graphFailure = null;
  const load = () => {
    if (graphNodes || graphFailure) return;
    try {
      if (!view.existsSync(join(root, GRAPH))) { graphFailure = ['missing', 'graph_missing']; return; }
      graphBytes = view.readFileSync(join(root, GRAPH)); graphDigest = digest(graphBytes);
      const text = decoder.decode(graphBytes);
      if (text.includes('\0')) throw Error('invalid_utf8');
      graphNodes = nodes(text);
    } catch (error) { graphFailure = error.code === 'resource_denied' ? ['blocked', 'resource_denied'] : ['unsupported', 'graph_unsupported']; }
  };
  const resolveReference = origin => {
    const ref = /^`[^`]*`$/.test(origin) ? origin.slice(1, -1) : origin;
    const id = nodeId.test(ref) ? ref : ref.startsWith(`${GRAPH}#`) && nodeId.test(ref.slice(GRAPH.length + 1)) ? ref.slice(GRAPH.length + 1) : null;
    const registration = { resource_id: randomUUID(), run_id: runId, origin, path: GRAPH, node_id: id,
      graph_digest: null, content_digest: null, content: null, state: 'unsupported', code: 'reference_unsupported' };
    if (ref === GRAPH) return { ...registration, code: 'graph_file_reference' };
    if (!id) return { ...registration, state: 'unresolved', code: 'reference_unresolved' };
    load(); registration.graph_digest = graphDigest;
    if (graphFailure) return { ...registration, state: graphFailure[0], code: graphFailure[1] };
    const candidates = graphNodes.get(id) ?? [];
    if (!candidates.length) return { ...registration, state: 'missing', code: 'node_missing' };
    if (candidates.length !== 1) return { ...registration, state: 'blocked', code: 'node_ambiguous' };
    const content = candidates[0];
    if (Buffer.byteLength(content, 'utf8') > READ_LIMITS.preview) return { ...registration, code: 'resource_limit' };
    return { ...registration, state: 'available', code: null, content, content_digest: digest(content) };
  };
  const references = []; let serializedBytes = 0;
  for (const origin of origins) {
    const reference = resolveReference(origin);
    serializedBytes += Buffer.byteLength(JSON.stringify(reference), 'utf8') + 1;
    if (serializedBytes > READ_LIMITS.response - 4096) fail('resource_limit');
    references.push(reference);
  }
  const data = { run_id: runId, references };
  if (Buffer.byteLength(JSON.stringify(data), 'utf8') > READ_LIMITS.response - 4096) fail('resource_limit');
  return data;
}

export function composeCockpitPacket(metadata, document, context, input) {
  if (input.graph_ids.length > 16 || input.excluded_ids.length > 64
    || new Set([...input.graph_ids, ...input.excluded_ids]).size !== input.graph_ids.length + input.excluded_ids.length) fail('resource_denied');
  const registrations = new Map(context.references.map(ref => [ref.resource_id, ref]));
  for (const id of [...input.graph_ids, ...input.excluded_ids]) if (!registrations.has(id)) fail('resource_denied');
  const selected = input.graph_ids.map(id => registrations.get(id));
  if (selected.some(ref => ref.state !== 'available')) fail('resource_denied');
  if (context.references.some(ref => ref.state !== 'available' && !input.excluded_ids.includes(ref.resource_id))) fail('context_exclusion_required');
  const packet = { ...metadata, context_id: randomUUID(), generation: input.generation,
    prepared_at: new Date().toISOString(), artefact: document,
    graph_nodes: selected,
    included: [{ resource_id: document.resource.resource_id, path: document.resource.path }, ...selected.map(ref => ({ resource_id: ref.resource_id, node_id: ref.node_id, origin: ref.origin }))],
    excluded: context.references.filter(ref => !input.graph_ids.includes(ref.resource_id)).map(ref => ({ resource_id: ref.resource_id, node_id: ref.node_id, origin: ref.origin,
      state: ref.state, code: ref.code, reason: input.excluded_ids.includes(ref.resource_id) ? 'deliberate_exclusion' : 'not_selected' })),
    authorizes: false };
  const byteCount = Buffer.byteLength(JSON.stringify(packet), 'utf8');
  return byteCount > CONTEXT_LIMIT ? { packet: null, byte_count: byteCount, limit: CONTEXT_LIMIT } : { packet, byte_count: byteCount, limit: CONTEXT_LIMIT };
}
