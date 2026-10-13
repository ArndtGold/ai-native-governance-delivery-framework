import { canonicalJson, digest, exactObject } from './approval-command-contract.js';
import { inspectQaReports } from '../control-evaluation/qa-follow-up.js';
import { interactionLocales } from '../resources/context.js';

const fields = ['schema_version', 'reviewer', 'usage_scope', 'deviations'];
const itemFields = ['finding_id', 'severity', 'risk', 'consequence', 'follow_up', 'owner'];
const concrete = (value, limit = 600) => typeof value === 'string' && value.trim().length > 0
  && value.length <= limit && !/^(?:tbd|todo|none|<)/iu.test(value.trim());
const outcome = text => [...text.matchAll(/^- decision:[ \t]*(pass|passed|revise|block)[ \t]*$/gmu)].map(row => row[1]);

// The existing QA report owns the proposal. It is never a second approval ledger,
// a caller override flag, a passing test result or proof of native qualification.
export function inspectQaDeviationAcceptance(root, state, readArtefact) {
  const unavailable = reason => ({ eligible: false, accepted: false, reason });
  const qa = state.artefacts.get('QA');
  if (qa?.status !== 'revise' || !qa.path) return unavailable('qa_deviation_proposal_not_applicable');
  const text = readArtefact(qa.path);
  if (typeof text !== 'string' || !text.includes('## QA Deviation Acceptance')) return unavailable('qa_deviation_proposal_missing');
  try {
    if (!['UR', 'PRD', 'SD', 'TP'].every(gate => state.approvals.get(gate)?.status === 'approved')
      || !['Brownfield Analysis', 'CD+Tests', 'CR', 'Clean Implementation Review', 'TP Review'].every(step => {
        const row = state.artefacts.get(step) ?? state.artefacts.get({ CR: 'Code Review', 'Clean Implementation Review': 'Clean Review' }[step]);
        return row?.path && ['done', ...(step === 'TP Review' ? ['revise'] : [])].includes(row.status);
      })) return unavailable('qa_deviation_prerequisites_incomplete');
    if (!['QA', 'CR', 'Clean Implementation Review', 'TP Review'].every(step =>
      state.evidence_applicability?.by_step.get(step)?.applicability === 'current')) return unavailable('qa_deviation_evidence_not_current');
    for (const step of ['CR', 'Clean Implementation Review']) {
      const row = state.artefacts.get(step) ?? state.artefacts.get({ CR: 'Code Review', 'Clean Implementation Review': 'Clean Review' }[step]);
      const decisions = outcome(readArtefact(row.path) ?? '');
      if (decisions.length !== 1 || !['pass', 'passed'].includes(decisions[0])) return unavailable('qa_deviation_protected_review_not_pass');
    }
    if ([...(state.missing_evidence ?? []), ...(state.risks ?? [])].some(row => row.impact === 'block')) return unavailable('qa_deviation_hard_blocker');
    const sections = text.split(/^## QA Deviation Acceptance\s*$/mu);
    if (sections.length !== 2) return unavailable('qa_deviation_proposal_invalid');
    const section = sections[1].split(/^## /mu)[0].trim();
    const match = section.match(/^```json\s*\n([\s\S]*?)\n```$/u);
    if (!match || Buffer.byteLength(match[1]) > 16000) return unavailable('qa_deviation_proposal_invalid');
    const proposal = JSON.parse(match[1]);
    if (!exactObject(proposal, fields) || proposal.schema_version !== '1' || !concrete(proposal.reviewer, 200)
      || !concrete(proposal.usage_scope) || !Array.isArray(proposal.deviations) || !proposal.deviations.length || proposal.deviations.length > 16
      || !proposal.deviations.every(row => exactObject(row, itemFields) && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(row.finding_id ?? '')
        && ['low', 'medium'].includes(row.severity) && ['risk', 'consequence', 'follow_up', 'owner'].every(field => concrete(row[field])))) return unavailable('qa_deviation_proposal_invalid');
    const ids = proposal.deviations.map(row => row.finding_id);
    if (new Set(ids).size !== ids.length) return unavailable('qa_deviation_proposal_invalid');
    const observations = inspectQaReports(root, state, state.run_id, 'revise', 64, true, { readArtefact });
    if (observations.kind !== 'evidence' || observations.findings.some(row => row.target !== 'evidence_obligation')) return unavailable('qa_deviation_hard_blocker');
    const described = new Map();
    for (const row of observations.findings) {
      const statement = canonicalJson({ target: row.target, evidence: row.evidence, action: row.action });
      if (described.has(row.id) && described.get(row.id) !== statement) return unavailable('qa_deviation_scope_ambiguous');
      described.set(row.id, statement);
    }
    const open = new Set(observations.findings.map(row => row.id));
    if (open.size !== ids.length || ids.some(id => !open.has(id))) return unavailable('qa_deviation_scope_incomplete');
    const acceptanceDigest = digest(`agdf-qa-deviation-acceptance/1\0${canonicalJson({ proposal, sources: observations.sources })}`);
    const decided = state.presentation_decisions?.get('QA');
    const acceptance = decided?.receipt?.effect?.qa_acceptance;
    const accepted = state.approvals.get('QA')?.status === 'approved' && decided?.decided === true
      && decided.action === 'approve' && acceptance?.kind === 'accepted_with_deviations' && acceptance.digest === acceptanceDigest
      && canonicalJson(acceptance.deviation_ids) === canonicalJson(ids);
    return { eligible: true, accepted, digest: acceptanceDigest, proposal, sources: observations.sources, qa_outcome: 'revise' };
  } catch { return unavailable('qa_deviation_proposal_invalid'); }
}

export function qaDeviationPresentation(acceptance, language) {
  if (!acceptance?.eligible) return null;
  const german = String(language).toLowerCase().startsWith('de');
  const labels = (german ? interactionLocales.locales.de : interactionLocales.locales.en).decisionCard;
  const { proposal } = acceptance;
  const summary = [acceptance.accepted ? labels.confirmedWithDeviations : labels.deviationAcceptanceIntro,
    `${german ? 'Geltungsbereich' : 'Usage scope'}: ${proposal.usage_scope}`,
    ...proposal.deviations.map(row => `- ${row.finding_id} (${german ? { low: 'gering', medium: 'mittel' }[row.severity] : row.severity}): ${row.risk}\n  ${german ? 'Folge' : 'Consequence'}: ${row.consequence}\n  ${german ? 'Nacharbeit' : 'Follow-up'}: ${row.follow_up}\n  ${german ? 'Verantwortlich' : 'Owner'}: ${row.owner}`),
    acceptance.accepted ? (german
      ? 'Diese Abweichungen wurden für die vorgelegte Fassung ausdrücklich akzeptiert. Der QA-Befund bleibt „Nachbessern“; fehlende Prüfungen und native Produktionsqualifikation sind nicht bestanden.'
      : 'These deviations were explicitly accepted for the presented version. The QA result remains revise; missing tests and native production qualification are not marked passed.')
      : (german ? 'Der QA-Befund bleibt „Nachbessern“. Mit deiner Freigabe akzeptierst du diese Abweichungen und deren Folgen; anschließend folgt UAT. Fehlende Prüfungen und native Produktionsqualifikation sind damit nicht bestanden.'
        : 'The QA result remains revise. Your approval accepts these deviations and their consequences; UAT follows. Missing tests and native production qualification are not marked passed.')].join('\n\n');
  return { kind: 'accepted_with_deviations', digest: acceptance.digest, summary,
    approve_label: labels.approveWithDeviations, confirmed_label: labels.confirmedWithDeviations,
    effect: german ? 'Du akzeptierst die aufgeführten Abweichungen. Als Nächstes folgt UAT.'
      : 'You accept the listed deviations. UAT follows.' };
}
