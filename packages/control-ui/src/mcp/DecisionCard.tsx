import { useEffect, useRef, useState } from 'react';
import { PassiveMarkdown } from '../DocumentView';
import type { DecisionBootstrap, DecisionSubmission } from './decision-bootstrap';
import { matchedDecisionReceipt } from './decision-bootstrap';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json';
type Reply = Record<string, unknown>;
export interface DecisionNext { revision_id: string; next_operation: { type: string; operation_key: string; actor: 'agent' | 'human'; effect: string; gate: string } }
export function readDecisionNext(value: unknown): DecisionNext | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>, op = row.next_operation as Record<string, unknown> | undefined;
  return row.available === true && row.status === 'open' && typeof row.revision_id === 'string'
    && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(row.revision_id)
    && (op?.actor === 'agent' && ['preparation', 'implementation', 'closeout'].includes(String(op.effect))
      || op?.actor === 'human' && op.effect === 'decision' && op.operation_key === 'approval.record')
    && typeof op.type === 'string' && /^[a-z_]+$/.test(op.type)
    && typeof op.operation_key === 'string' && /^[a-z_]+\.[a-z_]+$/.test(op.operation_key)
    && typeof op.gate === 'string' && op.gate.length > 0 && op.gate.length < 128 ? row as unknown as DecisionNext : null;
}
export interface DecisionPort {
  submit: (input: DecisionSubmission) => Promise<Reply>;
  document: () => Promise<string>;
  inspect: (operation: string) => Promise<Reply>;
  expand: () => Promise<void>;
  next?: (current: DecisionNext, approval: DecisionSubmission) => Promise<void>;
}
export function DecisionCard({ view, port, closeWarning = false }: { view: DecisionBootstrap; port: DecisionPort; closeWarning?: boolean }) {
  const l = view.labels, [status, setStatus] = useState('undecided'), [message, setMessage] = useState('');
  const [document, setDocument] = useState<string | null>(null), [reading, setReading] = useState(false), [checking, setChecking] = useState(false);
  const [next, setNext] = useState<DecisionNext | null>(null), [continuationMessage, setContinuationMessage] = useState('');
  const continuationStarted = useRef(false);
  const alive = useRef(true), pending = useRef<DecisionSubmission | null>(null), inflight = useRef(false), openButton = useRef<HTMLButtonElement>(null);
  const documentHeading = useRef<HTMLHeadingElement>(null), restoreFocus = useRef(false);
  const current = () => alive.current && Date.now() < view.expires_at;
  useEffect(() => {
    if (document !== null) documentHeading.current?.focus();
    else if (restoreFocus.current) { restoreFocus.current = false; openButton.current?.focus(); }
  }, [document]);
  useEffect(() => {
    alive.current = true;
    if (status === 'saved') return () => { alive.current = false; };
    const timer = setTimeout(() => { if (alive.current) { setStatus('expired'); setMessage(l.expired); } }, Math.max(0, view.expires_at - Date.now()));
    return () => { alive.current = false; clearTimeout(timer); };
  }, [view, l.expired, status]);
  const receive = (reply: Reply, input: DecisionSubmission) => {
    if (!current()) { setStatus('expired'); setMessage(l.expired); return; }
    if (reply.view_state === 'closed') { setStatus('expired'); setMessage(l.expired); return; }
    if (['accepted', 'already_applied'].includes(String(reply.outcome)) && matchedDecisionReceipt(reply.receipt, view, input)) {
      setStatus('saved');
      setNext(readDecisionNext(reply.current));
      const current = reply.current as { available?: boolean } | undefined;
      setMessage(l.confirmed + (current?.available === false ? ' ' + l.unknownCurrent : '')); return;
    }
    if (reply.outcome === 'rejected') {
      const reason = String(reply.reason);
      const unavailable = ['stale_revision', 'decision_binding_changed', 'presentation_state_changed', 'decision_binding_invalid', 'presentation_version_decided'].includes(reason);
      const expired = reason === 'session_expired';
      setStatus(expired ? 'expired' : unavailable ? 'stale' : 'undecided');
      setMessage(expired ? l.expired : reason === 'presentation_version_decided' ? l.alreadyDecided : unavailable ? l.sourceChanged : l.denied);
      pending.current = null; return;
    }
    setStatus('uncertain'); setMessage(l.uncertain);
  };
  const send = async (input: DecisionSubmission) => {
    if (inflight.current || !current()) return;
    inflight.current = true; pending.current = input; setStatus('pending'); setMessage(l.pending);
    try { const reply = await port.submit(input); if (alive.current) receive(reply, input); }
    catch { if (alive.current) { setStatus('uncertain'); setMessage(l.uncertain); } }
    finally { inflight.current = false; }
  };
  const decide = () => {
    const action = 'approve';
    if (!current() || status !== 'undecided' || view.capability !== 'available' || !view.enabled_actions.includes(action)) return;
    void send({ session_id: view.session_id, operation_id: crypto.randomUUID(), presentation_id: view.binding.presentation_id,
      expected_revision_id: view.binding.expected_revision_id, action });
  };
  const inspect = async () => {
    const input = pending.current;
    if (!input || !current() || inflight.current || checking) return;
    setChecking(true);
    try {
      const result = await port.inspect(input.operation_id);
      if (!alive.current) return;
      if (!current()) { setStatus('expired'); setMessage(l.expired); return; }
      if (result.status === 'recorded' && matchedDecisionReceipt(result.receipt, view, input)) {
        setStatus('saved'); setNext(readDecisionNext(result.current)); setMessage(l.confirmed);
      } else setMessage(l.uncertain); // Even absence cannot establish non-execution.
    } catch { if (alive.current) setMessage(l.uncertain); }
    finally { if (alive.current) setChecking(false); }
  };
  const open = async () => {
    if (reading || !view.resource_id) return;
    setReading(true);
    try {
      const text = await port.document();
      if (!alive.current) return;
      await port.expand();
      if (alive.current) setDocument(text);
    } catch { if (alive.current) setMessage(l.docUnavailable); }
    finally { if (alive.current) setReading(false); }
  };
  const nativeApprovalAvailable = view.capability === 'available' && view.enabled_actions.includes('approve');
  const disabled = status !== 'undecided';
  const gateTitles = (registry.locales as Record<string, { gateTitles: Record<string, string> }>)[view.binding.presentation_language]?.gateTitles;
  useEffect(() => {
    // Only a locally submitted, receipt-confirmed approval can resume work.
    // Reading/mounting never starts it. The agent redispatches and presents the
    // next human gate without executing its decision.
    if (status !== 'saved' || !pending.current || !next || !port.next || continuationStarted.current || !current()) return;
    continuationStarted.current = true; setContinuationMessage(l.nextWaiting);
    void port.next(next, pending.current).then(() => { if (alive.current) setContinuationMessage(l.nextRequested); })
      .catch(() => { if (alive.current) setContinuationMessage(l.nextUnavailable); });
    // Do not resend on a lost host acknowledgement or an ordinary rerender.
  }, [status, next, port, l.nextWaiting, l.nextRequested, l.nextUnavailable]);
  if (document !== null) return <section className="decision-card agdf-surface mcp-entry">
    <button type="button" onClick={() => { restoreFocus.current = true; setDocument(null); }}>{l.back}</button>
    <h1 ref={documentHeading} tabIndex={-1}>{l.documentTitle} · {view.gate_title ?? view.binding.gate}</h1><p>{view.title}</p>
    <article className="document"><PassiveMarkdown content={document} links={{}} onOpen={() => {}}/></article>
  </section>;
  return <section className="decision-card agdf-surface mcp-entry" aria-label={l.title}>
    <h1>{view.decision_heading ?? l.title}</h1><p>{view.title}</p>
    {!nativeApprovalAvailable && <p role="status">{l.notQualified}</p>}
    <article className="decision-summary document"><PassiveMarkdown content={view.decision_brief || view.summary} links={{}} onOpen={() => {}}/></article>
    {view.comparison.state === 'unavailable' ? <p>{l.comparisonUnavailable}</p> : <>
      <p>{l.machineComparison}</p><p>{view.comparison.unchanged ? l.documentUnchanged : l.documentChanged}</p>
    </>}
    {status === 'undecided' && <p>{view.approval_effect && view.approval_effect_label
      ? <><strong>{view.approval_effect_label} </strong>{view.approval_effect}</> : l.consequence}</p>}
    <p>{l.sourceLanguage}</p>
    <button type="button" ref={openButton} disabled={!view.resource_id || reading} onClick={() => void open()}>{l.openDocument}</button>
    {!view.resource_id && <p>{l.docUnavailable}</p>}
    <details><summary>{l.sources}</summary>
      {view.decision_brief && <article className="document"><PassiveMarkdown content={view.summary} links={{}} onOpen={() => {}}/></article>}<dl>
      <dt>{l.run}</dt><dd>{view.binding.run_id}</dd><dt>{l.revision}</dt><dd><code>{view.binding.expected_revision_id}</code></dd>
      {view.binding.material_sources.map(source => <div key={source.type}><dt>{source.type}</dt><dd><code>{source.path}</code><br/><code>{source.digest}</code></dd></div>)}
    </dl>{view.comparison.state === 'available' && <>
      <p>{l.revision}: <code>{view.comparison.previous_revision_id}</code><br/><code>{view.comparison.previous_digest}</code></p>
      <details><summary>{l.previousDocument}</summary><article className="document"><PassiveMarkdown content={view.comparison.previous_text} links={{}} onOpen={() => {}}/></article></details>
    </>}</details>
    {status === 'undecided' && <p>{(nativeApprovalAvailable ? l.discussionHint : l.chatApprovalHint).replace('{gate}', view.binding.gate)}</p>}
    {nativeApprovalAvailable && status !== 'saved' && <div className="decision-actions"><button type="button" disabled={disabled} onClick={decide}>{l.approve}</button></div>}
    {status === 'saved' && next && <p>{l.nextInformation.replace('{step}', gateTitles?.[next.next_operation.gate] ?? next.next_operation.gate)}</p>}
    {status === 'saved' && next && !port.next && <p>{l.nextChat}</p>}
    {continuationMessage && <p role="status">{continuationMessage}</p>}
    {closeWarning && <p role="status">{l.closeUnavailable}</p>}
    {nativeApprovalAvailable && <p>{l.permission}</p>}<p role="status">{message || l.notSaved}</p>
    {status === 'uncertain' && <div className="decision-actions">
      <button type="button" disabled={checking} onClick={() => void inspect()}>{l.checkOperation}</button>
      <button type="button" disabled={checking} onClick={() => { if (pending.current) void send(pending.current); }}>{l.retryOriginal}</button>
    </div>}
  </section>;
}
