// Explicit current-ready synthetic report authoring, never production readiness
// or a correction of a live/approved report. Negative/historical cases opt out.
export function withSyntheticQaContent(text, { result = 'The isolated fixture implements its declared scoped behavior and retains actual check evidence.',
  limits = 'Only disposable synthetic execution is observed; native host qualification is unobserved.', risks = 'none' } = {}) {
  for (const [heading, key, value] of [['TP Coverage', 'delivered_result', result], ['Missing Evidence', 'qualification_limits', limits], ['Risks', 'delivery_risks', risks]]) {
    if (new RegExp('^- '+key+':', 'mu').test(text)) throw Error('synthetic_content_already_authored');
    const pattern = new RegExp('^## (?:\\d+\\.[\\t ]+)?'+heading+'[\\t ]*$', 'mu');
    if (pattern.test(text)) text = text.replace(pattern, line => line+'\n\n- '+key+': '+value);
    else {
      const section = '\n## '+heading+'\n\n- '+key+': '+value+'\n';
      const at=text.indexOf('\n## AGDF Approval Summary');
      text=at<0?text+section:text.slice(0,at)+section+text.slice(at);
    }
  }
  const marker='## AGDF Approval Summary (de; source=en)';
  if (!text.includes(marker)) text+='\n'+marker+'\n';
  text=text.replace(marker,marker+'\n- Ergebnis: Die isolierte Implementierung erfüllt das erklärte synthetische Verhalten; Prüfnachweise liegen vor.\n- Grenzen: Nur isolierte synthetische Ausführung; native Hostqualifikation nicht beobachtet.');
  if (!/^[-*] Risiken:/mu.test(text.slice(text.indexOf(marker)))) text+='\n- Risiken: '+(risks==='none'?'keine':'Offene Risiken des synthetischen Ergebnisses bleiben ausdrücklich erhalten.')+'\n';
  return text;
}
