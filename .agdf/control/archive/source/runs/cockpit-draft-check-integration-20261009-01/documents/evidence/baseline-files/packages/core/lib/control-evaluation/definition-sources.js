import { readFileSync } from '../control-read/fs.js';
import { hasSymlinkComponent, containedRegularFile } from '../control-state/contained-file.js';
import { artefactFileDigest } from '../control-state/run-seal.js';
import { extractField } from './verified-change.js';

// Read-only facts shared by authoring consumers. Facts never grant correction permission.
export function inspectDefinitionSources(root, state, runId, gate, sourceTypes) {
  const sources = [];
  const issue = (code, path, expected, observed, repairable = false) => ({ sources, issue: { code, path, expected, observed, repairable } });
  const output = `.agdf/control/artefacts/${runId}/${gate}.md`;
  if (!state || hasSymlinkComponent(root, output)) return issue('unsafe_destination', output, 'contained non-symlink output', 'unsafe');
  for (const type of sourceTypes) {
    const path = String(state.artefacts.get(type)?.path ?? '').replace(/^`|`$/gu, '');
    const file = containedRegularFile(root, path);
    if (hasSymlinkComponent(root, path) || file.status !== 'valid') return issue('source_unavailable', path, type, file.status);
    sources.push({ type, path, digest: artefactFileDigest(root, path) });
  }
  const review = readFileSync(containedRegularFile(root, sources[1].path).path, 'utf8');
  if (extractField(review, 'ux_intent_definition_required') === 'yes') {
    const canonical = `.agdf/control/artefacts/${runId}/UX_INTENT_DEFINITION.md`;
    const analysis = state.artefacts.get('UX Intent Definition');
    const path = String(analysis?.path || canonical).replace(/^`|`$/gu, '');
    if (path !== canonical || hasSymlinkComponent(root, path)) return issue('unsafe_ux_source', path, canonical, 'foreign or unsafe source');
    const file = containedRegularFile(root, path);
    if (file.status !== 'valid') return issue('ux_source_missing', path, '- decision: ready', file.status, file.status === 'missing');
    const content = readFileSync(file.path, 'utf8');
    const decisions = [...content.matchAll(/^- decision:[ \t]*(.*)$/gmu)];
    const decision = extractField(content, 'decision');
    if (decisions.length !== 1 || !decision) return issue('ux_decision_malformed', path, '- decision: ready', decisions.length ? 'ambiguous decision field' : 'exact field absent', true);
    if (decision !== 'ready') return issue('ux_not_ready', path, '- decision: ready', decision);
    if (analysis?.status !== 'done' || String(analysis.path).replace(/^`|`$/gu, '') !== canonical) return issue('ux_source_unrecorded', path, 'UX Intent Definition: done at this path', analysis?.status || 'unrecorded', true);
    sources.push({ type: 'UX Intent Definition', path, digest: artefactFileDigest(root, path) });
  }
  return { sources, issue: null };
}
