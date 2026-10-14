import { readFileSync, statSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { artefactFileDigest } from '../control-state/run-seal.js';
import { readAuthoredContent, readReportDecision } from './report-decision.js';

const prompts = new Set(['describe the trustworthy outcome.', 'what outcome should become possible?',
  'which tp tasks are fully done, partially done or not done?', 'what remains unverified?', 'which risks remain and what is their impact?']);
export function isDecisionContentPlaceholder(value) {
  if (typeof value !== 'string') return true;
  const text = value.trim().replace(/^`([^`]+)`$/u, '$1').replace(/\s+/gu, ' ').toLowerCase();
  return !text || prompts.has(text) || /^(?:todo|tbd|<[^>]+>|(?:draft|done|ready|blocked|pass|revise|block)(?:\s*\|\s*(?:draft|done|ready|blocked|pass|revise|block))+)$/.test(text);
}
export function concreteDecisionContent(value, { allowNone = false } = {}) {
  return typeof value === 'string' && value.length <= 1200 && !isDecisionContentPlaceholder(value)
    && !/^(?:pass|passed|revise|block|done|ready|draft)$/iu.test(value.trim())
    && (allowNone || !/^(?:none|keine|n\/a|not_applicable)$/iu.test(value.trim()));
}
export function authoredGoal(text) {
  const value = readAuthoredContent(text, 'goal');
  return concreteDecisionContent(value) ? value : null;
}

function deliveredContent(value, title, path) {
  if (!concreteDecisionContent(value)) return false;
  if ([title, title?.replace(/^QA(?: Report)?:\s*/iu, ''), path?.split('/').at(-1)].some(name => name?.toLowerCase() === value.toLowerCase())) return false;
  if (/^(?:\d+(?:\/\d+)?(?: tasks?)?(?: (?:done|complete|completed))?|all (?:tasks|criteria|checks) (?:are )?(?:done|complete|completed|fulfilled)|alle (?:aufgaben|kriterien) (?:sind )?(?:erledigt|erfüllt))\.?$/iu.test(value)) return false;
  // Closed whole-value identifier/reference lists are association evidence only.
  // Prose containing these references remains valid; no intent inference.
  return !/^(?:(?:UR|PRD|SD|TP|QA(?:_REPORT)?|T-\d+|(?:[a-z0-9_.-]+\/)*[a-z0-9_.-]+\.(?:md|json|js|mjs|log)|\[[^\]\n]+\]\([^\)\n]+\))(?:[\s,;·|`]+|\s+(?:and|und)\s+|$))+$/iu.test(value.replace(/`/gu, ''));
}

// Reads only captured contained sources. This pure observation neither decides
// QA nor repairs, persists or approves any content. Historical proof stays owned
// by the stored document/receipt readers, outside current preparation.
export function observeDecisionContent(root, state, { gate, locale = 'en', sourceLanguage = 'en', readArtefact, objectiveOnly = false } = {}) {
  const groups = {}, sources = [], gaps = [];
  const gap = (field, path, owner, reason = 'missing_or_placeholder') => gaps.push({ field, path, owner, reason });
  const result = () => ({ ready: gaps.length === 0, groups, sources, gaps });
  if (state.meta?.lifecycle !== 'active') return result();
  const ur = state.artefacts.get('UR');
  if (!ur?.path) return result(); // Initial intake remains authorable.
  const runPath = state.path || `.agdf/control/runs/${state.run_id}/RUN_STATE.md`;
  if (!concreteDecisionContent(readAuthoredContent(state.content, 'objective'))) gap('Objective', runPath, 'gate-check');
  if (objectiveOnly || !['QA', 'UAT'].includes(gate) || !['structured_slice', 'structured_delivery'].includes(state.mode_slice_decision?.decision)) return result();
  const source = type => {
    const row = state.artefacts.get(type), path = row?.path?.replace(/^`|`$/gu, '');
    try {
      if (!path || hasSymlinkComponent(root, path)) throw Error('unavailable');
      const file = containedRegularFile(root, path);
      if (file.status !== 'valid' || statSync(file.path).size > 131072) throw Error('unavailable');
      const text = readArtefact ? readArtefact(path) : readFileSync(file.path, 'utf8');
      if (typeof text !== 'string' || Buffer.byteLength(text) > 131072) throw Error('unavailable');
      sources.push({ type, path, digest: artefactFileDigest(root, path) });
      return { text, path };
    } catch { gap(type, path || type, type === 'UR' ? 'ur-definition' : 'qa-gate', 'source_unavailable'); return {}; }
  };
  const qa = source('QA');
  if (qa.text) {
    for (const [profile, field, key] of [['result', 'delivered_result', 'result'], ['limits', 'qualification_limits', 'limits'], ['risks', 'delivery_risks', 'risks']]) {
      const value = readAuthoredContent(qa.text, profile)?.[field];
      const heading = readAuthoredContent(qa.text, 'title');
      if (!(key === 'result' ? deliveredContent(value, heading, qa.path) : concreteDecisionContent(value, { allowNone: true }))) gap(field, qa.path, 'qa-gate');
      else groups[key] = value;
    }
    groups.qa = readReportDecision(qa.text);
    if (!groups.qa) gap('QA Decision', qa.path, 'qa-gate', 'technical_result_unconfirmed');
    if (locale !== sourceLanguage) {
      const summary = readAuthoredContent(qa.text, 'localized', { locale, sourceLanguage });
      const translatedFields = locale === 'de' ? [['ergebnis', 'result'], ['grenzen', 'limits'], ['risiken', 'risks']]
        : [['delivered result', 'result'], ['qualification limits', 'limits'], ['risks', 'risks']];
      for (const [field, key] of translatedFields) {
        const value = summary?.[field];
        if (!(key === 'result' ? deliveredContent(value, readAuthoredContent(qa.text, 'title'), qa.path) : concreteDecisionContent(value, { allowNone: true }))) gap(field, qa.path, 'qa-gate', 'localized_content_missing');
        else groups[key] = value;
      }
    }
  }
  if (gate === 'UAT') {
    const intent = source('UR');
    if (intent.text) {
      const goal = authoredGoal(intent.text);
      if (!goal) gap('Goal', intent.path, 'ur-definition');
      else groups.goal = goal;
      if (locale !== sourceLanguage) {
        const key = locale === 'de' ? 'ziel' : 'goal';
        const value = readAuthoredContent(intent.text, 'localized', { locale, sourceLanguage })?.[key];
        if (!concreteDecisionContent(value)) gap(key, intent.path, 'ur-definition', 'localized_content_missing');
        else groups.goal = value;
      }
    }
  }
  return result();
}

export function decisionContentRecovery(observation, { locale = 'en', state } = {}) {
  const de = locale === 'de';
  return [(de ? 'Entscheidungsinhalt vervollständigen' : 'Complete decision content'), ...observation.gaps.map(g => {
    const approved = state?.approvals?.get(g.owner === 'qa-gate' ? 'QA' : g.owner === 'ur-definition' ? 'UR' : '')?.status === 'approved';
    return `${g.field}: ${g.reason} · ${g.path} · ${de ? 'Zuständig' : 'Owner'}: ${g.owner}. `
      + (approved ? de ? 'Genehmigte Quelle bleibt geschützt; den bestehenden Erneuerungsweg prüfen, nicht still ändern.' : 'Approved source stays protected; assess its existing renewal route, do not silently edit.'
        : de ? 'Nur erlaubte unfreigegebene Angaben kanonisch ergänzen und dieselbe aktuelle Fassung erneut prüfen.' : 'Complete only permitted unapproved content canonically and recheck this same current version.');
  })].join('\n\n');
}
