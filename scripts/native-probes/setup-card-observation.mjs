// Read-only recognition of actual native-host setup-card observations.
// No execution, approval, setup authority or MCP-availability conclusion follows.
// A caller owns any separate user-authorized response or native qualification.
import { createHash } from 'node:crypto';
import { resolve, join, isAbsolute } from 'node:path';

const object = value => value && typeof value === 'object' && !Array.isArray(value);
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const toolTypes = new Set(['mcp_tool_call', 'command_execution', 'file_change', 'web_search', 'collab_tool_call']);

// Lex only the simple direct command used by the installed CLI. Expansions,
// operators, redirects and compound commands are deliberately unsupported.
export function splitSimpleCommand(text) {
  if (typeof text !== 'string' || text.length > 32768 || /[\r\n\0]/u.test(text)) return null;
  const out = []; let word = '', quote = null, active = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote === "'") { if (c === "'") quote = null; else word += c; continue; }
    if (quote === '"') {
      if (c === '"') quote = null;
      else if (c === '$' || c === '`') return null;
      else if (c === '\\') { const next = text[++i]; if (next === undefined) return null; word += next; }
      else word += c;
      continue;
    }
    if (/\s/u.test(c)) { if (active) { out.push(word); word = ''; active = false; } continue; }
    if (c === "'" || c === '"') { quote = c; active = true; continue; }
    if (';&|<>`$(){}'.includes(c)) return null;
    if (c === '\\') { const next = text[++i]; if (next === undefined) return null; word += next; active = true; continue; }
    word += c; active = true;
  }
  if (quote) return null;
  if (active) out.push(word);
  return out;
}

export function parseDirectLocalGateCheck(command, expected) {
  if (!object(expected) || typeof expected.candidateRoot !== 'string' || typeof expected.nodeExecutable !== 'string') return null;
  let words = splitSimpleCommand(command);
  if (!words) return null;
  if (['/bin/bash', '/bin/sh', '/bin/zsh', 'bash', 'sh', 'zsh'].includes(words[0])) {
    if (words.length !== 3 || !['-lc', '-c'].includes(words[1])) return null;
    words = splitSimpleCommand(words[2]);
  }
  if (!words || words.length < 4 || !['node', expected.nodeExecutable].includes(words[0])) return null;
  if (words[1] !== join(expected.candidateRoot, 'runtime/agdf-local.js') || words[2] !== 'skill-dispatch') return null;
  const values = {}; let json = false;
  const allowed = new Set(['--surface', '--skill', '--language', '--working-directory', '--target-source', '--primary-target']);
  for (let i = 3; i < words.length; i++) {
    const key = words[i];
    if (key === '--json') { if (json) return null; json = true; continue; }
    if (!allowed.has(key) || Object.hasOwn(values, key) || words[i + 1] === undefined) return null;
    values[key] = words[++i];
  }
  if (!json || values['--surface'] !== 'codex' || values['--skill'] !== 'gate-check'
      || values['--language'] !== 'de' || values['--target-source'] !== 'current_repository'
      || values['--working-directory'] !== expected.project || values['--primary-target'] !== expected.project) return null;
  return { route: 'local_cli', entry: words[1], skill: values['--skill'], target_source: values['--target-source'] };
}

export function readObservedAgdfResult(event, expected) {
  const item = event?.item;
  if (event?.type !== 'item.completed') return null;
  if (item?.type === 'mcp_tool_call' && ['agdf_dispatch', 'agdf_inspect'].includes(item.tool)
      && item.status !== 'failed' && !item.error && !item.result?.isError && object(item.result?.structured_content))
    return { route: 'mcp', item, result: item.result.structured_content };
  if (item?.type !== 'command_execution' || item.exit_code !== 0 || item.status !== 'completed') return null;
  const call = parseDirectLocalGateCheck(item.command, expected);
  if (!call || typeof item.aggregated_output !== 'string' || item.aggregated_output.length > 2 * 1024 * 1024) return null;
  try {
    const result = JSON.parse(item.aggregated_output.trim());
    return object(result) ? { ...call, item, result } : null;
  } catch { return null; }
}

export function observeTerminalResults(events, expected) {
  if (!Array.isArray(events)) return [];
  return events.flatMap((event, index) => {
    const observed = readObservedAgdfResult(event, expected);
    if (observed?.result?.terminal !== true) return [];
    const later = events.slice(index + 1).filter(value => ['item.started', 'item.completed'].includes(value.type) && toolTypes.has(value.item?.type));
    const displayIndex = events.findLastIndex(value => value.type === 'item.completed' && value.item?.type === 'agent_message');
    const displayedAfterResult = displayIndex > index;
    const final = displayedAfterResult ? events[displayIndex].item.text : undefined;
    return [{ ...observed, index, later_tool_count: later.length,
      display_after_result: displayedAfterResult,
      verbatim: observed.result.host_action?.allow_surrounding_text === false
        ? displayedAfterResult && typeof observed.result.host_action.text === 'string' && final === observed.result.host_action.text : null }];
  });
}

export function observeSetupCard(events, expected) {
  if (!Array.isArray(events) || !object(expected) || typeof expected.project !== 'string' || !isAbsolute(expected.project) || resolve(expected.project) !== expected.project
      || typeof expected.candidateRoot !== 'string' || !isAbsolute(expected.candidateRoot) || typeof expected.nodeExecutable !== 'string') return null;
  const observed = observeTerminalResults(events, expected).at(-1);
  if (!observed || observed.later_tool_count !== 0 || observed.verbatim !== true) return null;
  const r = observed.result, runtime = r.runtime, target = r.target, card = r.presentation;
  if (!object(card) || typeof card.markdown !== 'string' || !Array.isArray(card.excluded_authority)
      || typeof r.host_action?.text !== 'string') return null;
  if (observed.route === 'mcp' && (observed.item.tool !== 'agdf_dispatch'
      || observed.item.arguments?.skill_id !== 'gate-check'
      || observed.item.arguments?.working_directory !== expected.project
      || observed.item.arguments?.primary_target !== expected.project
      || observed.item.arguments?.target_source !== 'current_repository')) return null;
  if (r.outcome !== 'control_result' || r.authorizes !== false
      || r.skill?.skill_id !== 'gate-check' || r.control?.blocking_reason !== 'AGDF_CONTROL_FILE_MISSING'
      || r.control?.status !== 'blocked' || r.control?.current_gate !== 'UR'
      || !object(runtime) || runtime.provenance_status !== 'matched' || runtime.expected_version !== expected.version
      || !/^[0-9a-f]{64}$/u.test(runtime.runtime_digest ?? '')
      || runtime.machine_validation !== (observed.route === 'local_cli' ? 'owned_version_matched' : 'local_exact_version_digest')
      || observed.route === 'local_cli' && runtime.plugin_root !== expected.candidateRoot
      || target?.resolution_state !== 'resolved' || target.primary_target !== expected.project
      || target.working_directory !== expected.project || target.governance_target !== expected.project
      || target.target_source !== 'current_repository' || target.target_changed !== false || target.authorizes !== false
      || card?.semantic_block !== 'control_setup' || card.target !== expected.project || card.authorizes !== false
      || card.durable_scope !== '.agdf/control' || card.planned_effect !== 'create_canonical_control_scaffold'
      || card.next_action !== 'authorize_or_cancel' || card.presentation_language !== 'de'
      || !['automatic_run_creation', 'automatic_ur_persistence', 'gate_approval'].every(value => card.excluded_authority?.includes(value))
      || r.host_action?.mode !== 'transmit_presentation_verbatim_and_stop'
      || r.host_action?.source !== 'presentation.markdown' || r.host_action?.text !== card.markdown
      || !r.host_action.text.includes(expected.project) || !r.host_action.text.includes('Einrichtung autorisieren')) return null;
  return { route: observed.route, item_id: observed.item.id, result_sha256: sha(r),
    runtime_digest: runtime.runtime_digest, presentation_sha256: sha(card.markdown),
    effect: card.planned_effect, target: expected.project, authorizes: false,
    authority: 'Observation only; a caller must obtain or already hold separate authority for any response or effect.' };
}

export function setupCardRouteDiagnostics(events, expected) {
  events = Array.isArray(events) ? events : [];
  const mcp = events.filter(event => event.type === 'item.completed' && event.item?.type === 'mcp_tool_call');
  const local = events.map(event => readObservedAgdfResult(event, expected)).filter(row => row?.route === 'local_cli');
  const recognized = new Set(local.map(row => row.item.id));
  return { schema_version: 1, observed_mcp_calls: mcp.length,
    observed_mcp_tools: [...new Set(mcp.map(row => row.item.tool))],
    observed_mcp_servers: [...new Set(mcp.map(row => row.item.server).filter(Boolean))],
    observed_bound_local_cli_calls: local.map(row => ({ item_id: row.item.id, route: row.route,
      outcome: row.result.outcome ?? null, terminal: row.result.terminal === true,
      runtime_validation: row.result.runtime?.machine_validation ?? null,
      runtime_digest: row.result.runtime?.runtime_digest ?? null, result_sha256: sha(row.result) })),
    unrecognized_local_entry_mentions: events.filter(event => event.type === 'item.completed' && event.item?.type === 'command_execution'
      && typeof event.item.command === 'string' && event.item.command.includes('agdf-local.js') && !recognized.has(event.item.id))
      .map(event => ({ item_id: event.item.id, exit_code: event.item.exit_code, command_sha256: sha(event.item.command),
        reason: 'Not a supported successful direct bound gate-check CLI result; no setup reply inferred.' })),
    setup_card_observation: observeSetupCard(events, expected),
    inventory: { complete_tools_list_snapshot_observed: false, availability: 'not_established_by_this_observer',
      boundary: 'Actual calls/routes only. Zero MCP use, tool-name context, icon or credential-fallback warnings do not establish MCP unavailability. No extra CLI/model/tool discovery is injected.' } };
}
