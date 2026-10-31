import { existsSync, readdirSync, readFileSync, statSync } from '../control-read/fs.js';
import { join, posix } from 'node:path';
import { captureControlScope, readContainedControlText, READ_LIMITS } from '../control-read/snapshot.js';
import { canonicalJson, digest, resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { LEGACY_LAYOUT, readControlLayout } from '../control-state/control-layout.js';
import { parseRunState } from '../control-state/run-state-parser.js';
import { listedArtefactPaths, runSealState } from '../control-state/run-seal.js';
import { RUN_ID_PATTERN } from '../control-state/run-identity.js';
import { isSafeControlRelativePath, hasSymlinkComponent } from '../control-state/contained-file.js';
import { preparePlannedUr } from '../control-state/planned-entry.js';
import { resolveArtefactTemplatePath } from '../resources/artefact-templates.js';
import { backlogTableLayout } from '../control-state/run-backlog.js';

export const LAYOUT_PENDING = '.agdf/control/maintenance/PLANNED_LAYOUT_TRANSACTION.json';
export const LAYOUT_RECEIPTS = '.agdf/control/maintenance/planned-layout-operations';
export const layoutJson = value => canonicalJson(value) + '\n';
const CONTROL = '.agdf/control/';
const fail = code => { throw Error(code); };

// Read-only: the source manifest has no operation UUID, timestamp or future Run
// bytes. Its exact hash can therefore name its own immutable snapshot directory.
export function collectPlannedLayoutPreview(root) {
  // Version-matched plugin resources are outside the project's captured scope.
  // Read them through their existing contained resource owner, as authoring does.
  const templatePath = resolveArtefactTemplatePath('UR');
  if (statSync(templatePath).size > 131072) fail('AGDF_LAYOUT_TEMPLATE_LIMIT');
  const template = readFileSync(templatePath, 'utf8');
  const captured = captureControlScope(root, () => {
    const layout = readControlLayout(root, { live: true });
    if (layout.layout !== LEGACY_LAYOUT) fail('AGDF_CONTROL_LAYOUT_ALREADY_CURRENT');
    const sources = new Map(), runs = [], blockers = [], findings = [];
    const take = (path, maximum = READ_LIMITS.file) => {
      if (!sources.has(path)) sources.set(path, readContainedControlText(root, path, maximum));
      return sources.get(path);
    };
    const config = take(CONTROL + 'config.json', 65536), backlog = take(CONTROL + 'MASTER_BACKLOG.md', READ_LIMITS.preview);
    if (existsSync(join(root, CONTROL, 'planned')) && readdirSync(join(root, CONTROL, 'planned')).length)
      blockers.push({ code: 'AGDF_LAYOUT_PLANNED_STORE_NOT_EMPTY' });
    if (existsSync(join(root, LAYOUT_PENDING))) blockers.push({ code: 'AGDF_LAYOUT_RECOVERY_REQUIRED' });
    const store = CONTROL + 'runs';
    if (existsSync(join(root, store))) {
      if (hasSymlinkComponent(root, store) || !statSync(join(root, store)).isDirectory()) fail('AGDF_RUN_PATH_INVALID');
      const names = readdirSync(join(root, store)).sort();
      if (names.length > 20000) fail('AGDF_LAYOUT_SOURCE_LIMIT');
      // The synchronous transaction acquires a bounded set of nested Run locks.
      // Preserve the complete proposal, but refuse an unsafe execution depth.
      if (names.length > 256) blockers.push({ code: 'AGDF_LAYOUT_RUN_LOCK_LIMIT', maximum: 256, observed: names.length });
      for (const id of names) {
        if (!RUN_ID_PATTERN.test(id)) { blockers.push({ code: 'AGDF_LAYOUT_UNRESOLVED_CREATION', path: `${store}/${id}` }); continue; }
        const path = `${store}/${id}/RUN_STATE.md`;
        try {
          if (readdirSync(join(root, store, id)).some(name => /(?:PENDING|\.lock$)/u.test(name)))
            blockers.push({ code: 'AGDF_LAYOUT_PENDING_RUN', run_id: id });
          const content = take(path), state = parseRunState(content), seal = runSealState(root, content).status;
          const historicalUnsealed = state.valid && state.meta.lifecycle !== 'active' && seal === 'unsealed';
          if (!state.valid || state.meta.run_id !== id || state.meta.control_state_version !== '2' || seal !== 'valid' && !historicalUnsealed)
            fail('AGDF_LAYOUT_RUN_UNTRUSTED');
          if (historicalUnsealed) findings.push({ code: 'legacy_unsealed_history_retained', run_id: id, path, approval_provenance: 'unverified' });
          const artefacts = listedArtefactPaths(content);
          // Ended v2 history is preserved byte-exact, not resealed or promoted to
          // an approval claim. Its unmodified artefact tree is outside cutover's
          // write set. Active upgrade sources are fully captured/revalidated.
          for (const source of state.meta.lifecycle === 'active' ? artefacts : []) {
            if (source === path) continue;
            if (!source.startsWith(CONTROL) || !isSafeControlRelativePath(source)) fail('AGDF_LAYOUT_SOURCE_UNSAFE');
            if (existsSync(join(root, source))) take(source);
          }
          runs.push({ run_id: id, path, digest: digest(content), revision_id: state.meta.revision_id,
            action: state.meta.lifecycle === 'active' ? 'upgrade_v3' : 'retain_v2', trust: historicalUnsealed ? 'unverified_history' : 'verified', artefacts });
        } catch (error) { blockers.push({ code: error.code ?? error.message, path, run_id: id }); }
      }
    }
    sources.set('@plugin/control/templates/artefacts/UR.md', template);
    // Row accounting deliberately keeps raw unknown rows. Keys/titles never bind a
    // Run: only an explicit canonical Run or uniquely registered artefact link can.
    const lines = backlog.split('\n'), rows = [], rowLines = new Set();
    let section = '', headers = null, table = false, separated = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i], heading = line.trimEnd().match(/^#{1,6}\s+(.+)$/u);
      if (heading) { section = heading[1].trim(); table = false; headers = null; separated = false; }
      if (!/^\s*\|/u.test(line)) { table = false; separated = false; continue; }
      const cells = line.trim().split('|').slice(1, -1).map(cell => cell.trim());
      if (/^\s*\|[\s:|\-]+\|\s*$/u.test(line)) { separated = table; continue; }
      if (!table) { headers = cells; table = true; separated = false; continue; }
      rowLines.add(i);
      const links = [...line.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/gu)].map(match => match[1]);
      const normalized = links.filter(link => !/[%?#]/u.test(link)).map(link => link.startsWith(CONTROL) ? link : CONTROL + link);
      const safe = normalized.filter(path => path.startsWith(CONTROL) && isSafeControlRelativePath(path));
      const matches = runs.filter(run => safe.includes(run.path) || run.artefacts.some(path => safe.includes(path)));
      const explicit = safe.filter(path => /^\.agdf\/control\/runs\/[^/]+\/RUN_STATE\.md$/u.test(path));
      const association = matches.length === 1 && explicit.every(path => path === matches[0].path) ? matches[0] : null;
      const header = name => headers?.findIndex(value => value.toLowerCase() === name) ?? -1;
      const known = separated && headers && backlogTableLayout(headers) !== null && cells.length === headers.length;
      const titleIndex = Math.max(header('work item'), header('title')), priorityIndex = Math.max(header('priority'), header('prio'));
      const originalPriority = priorityIndex < 0 ? null : cells[priorityIndex];
      const normalizedPriority = originalPriority?.replaceAll('`', '').trim();
      const mappedPriority = ({ '1': 'high', '2': 'normal', '3': 'low', P1: 'high', P2: 'normal', P3: 'low', high: 'high', normal: 'normal', low: 'low' })[normalizedPriority];
      const priority = mappedPriority ?? 'normal';
      const title = known && titleIndex >= 0 && cells[titleIndex] ? cells[titleIndex] : `Legacy backlog row ${i + 1}`;
      // Completed/unknown tables remain evidence; they do not silently become new work.
      const active = /^Active Backlog$/iu.test(section), planned = /^Planned(?: Backlog| Work| \/ Parking Lot)?$/iu.test(section);
      const action = association ? 'retain_run_reference' : (active || planned) && known ? 'create_draft' : 'retain_unresolved';
      const row = { line: i + 1, section, raw: line, headers, links, title, original_priority: originalPriority, priority,
        priority_mapping: mappedPriority === undefined ? 'unresolved_normal_placeholder' : 'explicit',
        action, run_id: association?.run_id ?? null, candidates: matches.map(run => run.run_id), plan_id: null, ur_source: null };
      if (action === 'create_draft') {
        const candidates = [...new Set(safe.filter(path => /\/UR\.md$/u.test(path)))];
        if (candidates.length === 1 && existsSync(join(root, candidates[0]))) {
          try {
            const content = take(candidates[0], 131072);
            if (!/^# UR: [^\r\n]+/u.test(content.replace(/^\uFEFF/u, '')) || /^Planning (?:schema|id|priority):/mu.test(content)) throw Error('legacy_ur_unsupported');
            row.ur_source = { path: candidates[0], digest: digest(content) };
          } catch (error) { findings.push({ code: 'legacy_ur_unavailable', line: i + 1, path: candidates[0], reason: error.code ?? error.message }); }
        }
      }
      if (!association && links.length) findings.push({ code: 'legacy_association_unresolved', line: i + 1, links });
      rows.push(row);
    }
    const sourceRows = [...sources.entries()].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([path, content], i) => ({ path, digest: digest(content),
      snapshot_name: path.startsWith('@plugin/') ? 'UR.template.md' : `OLD-${i}.bin` }));
    if (sourceRows.length > 20000) fail('AGDF_LAYOUT_SOURCE_LIMIT');
    const source_manifest = { schema_version: 1, policy_version: 1, sources: sourceRows };
    const source_manifest_text = layoutJson(source_manifest), source_snapshot_digest = digest(source_manifest_text);
    const snapshot_root = `${CONTROL}maintenance/planned-layout/${source_snapshot_digest.slice(7)}`;
    const entries = [];
    for (const row of rows.filter(row => row.action === 'create_draft')) {
      const plan_id = `plan-legacy-${source_snapshot_digest.slice(7, 23)}-${row.line}`;
      row.plan_id = plan_id;
      // Legacy prose, approvals and statuses remain in the immutable snapshot.
      // A migrated need is explicitly incomplete; no historical statement is
      // promoted to a new approval or completed requirements clarification.
      const title = row.title.replace(/[\r\n\u0000-\u001f\u007f]/gu, ' ').slice(0, 900);
      let draft = template.replace('# UR: <Title>', `# UR: ${title}`);
      if (row.ur_source) {
        const imported = sources.get(row.ur_source.path).replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n'), end = imported.search(/^## /mu);
        const head = (end < 0 ? imported : imported.slice(0, end)).replace(/^(?:Status|Gate|Gate approval|Requirements clarification):[^\n]*\n?/gmu, '');
        const first = head.indexOf('\n');
        draft = head.slice(0, first + 1) + '\nStatus: draft\nGate: UR\nGate approval: open\nRequirements clarification: open\n' + head.slice(first + 1) + (end < 0 ? '' : imported.slice(end));
      }
      const content = preparePlannedUr(draft
        + `\n## Legacy Source\n\nSnapshot: ${snapshot_root}/SOURCE_MANIFEST.json\nBacklog row: ${row.line}\nOriginal priority: ${row.original_priority ?? 'absent'}\n\nClarify this legacy need before handoff. Original row, links, prose and history are preserved in the snapshot and ROW_DISPOSITIONS.json.\n`, plan_id, row.priority);
      entries.push({ plan_id, path: `${CONTROL}planned/${plan_id}/UR.md`, digest: digest(content), content });
    }
    const unparsed_spans = [];
    let start = null;
    for (let i = 0; i <= lines.length; i++) {
      if (i < lines.length && !rowLines.has(i)) { start ??= i; continue; }
      if (start !== null) { unparsed_spans.push({ first_line: start + 1, last_line: i, raw: lines.slice(start, i).join('\n') }); start = null; }
    }
    const target_id = resolveControlCommandTarget(root).target_id;
    const plan = { schema_version: 'planned-layout-preview/1', target_id, source_snapshot_digest, snapshot_root,
      config_digest: digest(config), config_next: layoutJson({ ...JSON.parse(config.replace(/^\uFEFF/u, '')), control_layout: 'planned-urs-v1' }),
      runs, rows, unparsed_spans, entries: entries.map(({ content, ...entry }) => entry), findings, blockers,
      authorizes: false, confirmation: null };
    const preview_digest = digest(canonicalJson(plan));
    const report = { ...plan, preview_digest, confirmation: `Migrate planned layout: ${preview_digest}` };
    // Refuse an incomplete preview instead of truncating dispositions or sources.
    if (Buffer.byteLength(layoutJson(report)) > READ_LIMITS.response) fail('AGDF_LAYOUT_PREVIEW_LIMIT');
    return { report, sources, source_manifest_text, entries };
  }).data;
  if (readFileSync(resolveArtefactTemplatePath('UR'), 'utf8') !== template) fail('AGDF_LAYOUT_TEMPLATE_CHANGED');
  return captured;
}

export function previewPlannedLayout(root) { return collectPlannedLayoutPreview(root).report; }

// Page the complete immutable proposal; never silently drop legacy rows to fit an
// MCP response. The digest-prefixed cursor rejects any source change between pages.
export function pagePlannedLayoutPreview(root, { cursor } = {}) {
  const report = previewPlannedLayout(root), bytes = Buffer.from(layoutJson(report)), prefix = report.preview_digest.slice(7) + ':';
  const total = Math.ceil(bytes.length / 16384);
  if (cursor !== undefined && (typeof cursor !== 'string' || !cursor.startsWith(prefix) || !/^(0|[1-9][0-9]*)$/u.test(cursor.slice(prefix.length)))) fail('AGDF_LAYOUT_CURSOR_STALE');
  const index = cursor === undefined ? 0 : Number(cursor.slice(prefix.length));
  if (!Number.isSafeInteger(index) || index < 0 || index >= total) fail('AGDF_LAYOUT_CURSOR_STALE');
  return { schema_version: 'planned-layout-preview-page/1', preview_digest: report.preview_digest, source_snapshot_digest: report.source_snapshot_digest,
    document_digest: digest(bytes), document_bytes: bytes.length, pages: total, rows: report.rows.length, runs: report.runs.length,
    planned_drafts: report.entries.length, blockers: report.blockers.length, findings: report.findings.length,
    chunk: { index, offset: index * 16384, encoding: 'base64', data: bytes.subarray(index * 16384, (index + 1) * 16384).toString('base64') },
    complete: index + 1 === total, next_cursor: index + 1 < total ? `${prefix}${index + 1}` : null,
    confirmation: report.confirmation, next_action: 'Read every page, decode and verify the complete document before confirming. Blockers forbid apply.', authorizes: false };
}
