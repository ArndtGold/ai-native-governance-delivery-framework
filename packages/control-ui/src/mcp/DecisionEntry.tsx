import { useEffect, useMemo, useRef, useState } from 'react';
import { applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { CockpitBridge } from './transport';
import { readDecisionBootstrap, type DecisionBootstrap, type DecisionSubmission } from './decision-bootstrap';
import { DecisionCard, readDecisionNext, type DecisionPort } from './DecisionCard';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json';

export function DecisionEntry({ bridge }: { bridge: CockpitBridge }) {
  const [view, setView] = useState<DecisionBootstrap | null>(null), [connected, setConnected] = useState(false);
  const current = useRef<DecisionBootstrap | null>(null);
  const completed = useRef<DecisionBootstrap | null>(null);
  const complete = useRef<(view: DecisionBootstrap) => Promise<void>>(async () => {});
  const [closeWarning, setCloseWarning] = useState(false);
  const continuation = useRef<AbortController | null>(null);
  useEffect(() => {
    let alive = true;
    const closes = new Map<string, Promise<void>>();
    const close = (old: DecisionBootstrap) => {
      const previous = closes.get(old.session_id);
      if (previous) return previous;
      const pending = bridge.operation({ operation: 'close' }, undefined, old.read_session_id).then(value => {
        const reply = value as { state?: string; data?: { closed?: boolean }; reason?: string };
        if (!(reply.state === 'available' && reply.data?.closed === true) && reply.reason !== 'session_expired') throw Error('close_unconfirmed');
      });
      closes.set(old.session_id, pending);
      return pending;
    };
    complete.current = async old => {
      if (!alive || current.current !== old) return;
      // The receipt and host handoff are confirmed. Retain the passive card,
      // but invalidate its live session before starting bounded Core retirement.
      completed.current = old; current.current = null; bridge.session = '';
      try { await close(old); }
      catch { if (alive && completed.current === old) setCloseWarning(true); }
    };
    let retirement: Promise<void> | undefined;
    const retire = (render = true) => {
      if (retirement) return retirement;
      alive = false;
      continuation.current?.abort();
      const old = current.current ?? completed.current;
      current.current = null; bridge.session = '';
      if (render) setView(null);
      // Invalidate locally before sending the bounded close. A late read or
      // tool result must not restore a view while the host removes its frame.
      retirement = old ? close(old) : Promise.resolve();
      return retirement;
    };
    const pagehide = () => { void retire().catch(() => {}); };
    window.addEventListener('pagehide', pagehide);
    const theme = () => {
      const host = bridge.app.getHostContext();
      if (host?.theme) applyDocumentTheme(host.theme);
      if (host?.styles?.variables) applyHostStyleVariables(host.styles.variables);
    };
    bridge.app.ontoolresult = result => {
      if (!alive) return;
      const next = readDecisionBootstrap(result), previous = current.current ?? completed.current;
      if (!next || previous && next.target.target_id !== previous.target.target_id) return;
      if (previous && previous.owner_epoch === next.owner_epoch && next.generation <= previous.generation) {
        if (next.session_id !== previous.session_id) void close(next).catch(() => {}); return;
      }
      if (previous) { continuation.current?.abort(); void close(previous).catch(() => {}); }
      completed.current = null; setCloseWarning(false);
      current.current = next; bridge.session = next.read_session_id; setView(next); theme();
      document.documentElement.lang = next.binding.presentation_language;
    };
    bridge.app.onhostcontextchanged = theme;
    bridge.app.onteardown = async () => {
      await retire();
      return {};
    };
    void bridge.app.connect(undefined, { timeout: 10_000 }).then(() => { if (alive) { setConnected(true); theme(); } }).catch(() => {});
    return () => { window.removeEventListener('pagehide', pagehide); void retire(false).catch(() => {}); };
  }, [bridge]);
  const port = useMemo<DecisionPort | null>(() => {
    if (!view) return null;
    const call = async (name: string, argumentsValue: Record<string, unknown>) => {
      if (current.current !== view || !bridge.app.getHostCapabilities()?.serverTools) throw Error('session_invalid');
      const result = await bridge.request(() => bridge.app.callServerTool({ name, arguments: argumentsValue }, { timeout: 10_000 }));
      if (current.current !== view) throw Error('session_invalid');
      if (result.isError || !result.structuredContent) throw Error('result_unconfirmed');
      return result.structuredContent as Record<string, unknown>;
    };
    return {
      submit: (input: DecisionSubmission) => call('agdf_decision_action', { ...input }),
      preview: async () => {
        if (!view.preview) throw Error('preview_unavailable');
        if (completed.current === view) {
          let cursor: string | undefined, content = '', offset = 0;
          const seen = new Set<string>();
          do {
            const result = await bridge.request(() => bridge.app.callServerTool({ name: 'agdf_inspect', arguments: {
              operation: 'presentation-preview', presentation_language: view.binding.presentation_language,
              working_directory: view.target.display_path, primary_target: view.target.display_path, target_source: 'explicit_target',
              target_id: view.target.target_id, run_id: view.binding.run_id, gate: view.binding.gate,
              expected_revision_id: view.binding.expected_revision_id, presentation_id: view.binding.presentation_id, ...(cursor ? { cursor } : {})
            } }, { timeout: 10_000 }));
            const report = (result.structuredContent as Record<string, unknown> | undefined)?.report as Record<string, unknown> | undefined;
            if (completed.current !== view || result.isError || report?.available !== true || report.target_id !== view.target.target_id
              || report.run_id !== view.binding.run_id || report.gate !== view.binding.gate || report.revision_id !== view.binding.expected_revision_id
              || report.presentation_id !== view.binding.presentation_id || report.content_digest !== view.preview.content_digest
              || report.format !== 'isolated_html' || report.byte_start !== offset || typeof report.content !== 'string') throw Error('preview_unavailable');
            content += report.content; offset += new TextEncoder().encode(report.content).length;
            if (offset > 2097152 || report.byte_end !== offset) throw Error('preview_unavailable');
            if (report.complete === true && report.next_cursor === null && report.total_bytes === offset) return content;
            if (typeof report.next_cursor !== 'string' || seen.has(report.next_cursor) || seen.size >= 64) throw Error('preview_unavailable');
            cursor = report.next_cursor; seen.add(cursor);
          } while (cursor);
          throw Error('preview_unavailable');
        }
        if (current.current !== view) throw Error('session_invalid');
        const result = await bridge.operation({ operation: 'preview', snapshot_id: view.snapshot_id, run_id: view.binding.run_id,
          resource_id: view.preview.resource_id }, undefined, view.read_session_id) as { state?: string; reason?: string;
            data?: { preview?: { content?: string; content_digest?: string; version?: string } } };
        const preview = result.data?.preview;
        if (current.current !== view || result.state !== 'available' || typeof preview?.content !== 'string'
          || preview.content_digest !== view.preview.content_digest || preview.version !== view.preview.version
          || new TextEncoder().encode(preview.content).length > 2097152) throw Error(result.reason ?? 'preview_unavailable');
        return preview.content;
      },
      document: async () => {
        if (completed.current === view) {
          // Immutable presentation reads are stateless. Never reopen the old
          // decision session or substitute the mutable current gate document.
          let cursor: string | undefined, text = '';
          const seen = new Set<string>();
          do {
            const result = await bridge.request(() => bridge.app.callServerTool({ name: 'agdf_inspect', arguments: {
              operation: 'presentation-document', presentation_language: view.binding.presentation_language,
              working_directory: view.target.display_path, primary_target: view.target.display_path, target_source: 'explicit_target',
              target_id: view.target.target_id, run_id: view.binding.run_id, gate: view.binding.gate,
              expected_revision_id: view.binding.expected_revision_id, presentation_id: view.binding.presentation_id,
              ...(cursor ? { cursor } : {})
            } }, { timeout: 10_000 }));
            const report = (result.structuredContent as Record<string, unknown> | undefined)?.report as { available?: boolean; target_id?: string; run_id?: string; gate?: string;
              revision_id?: string; presentation_id?: string; content_digest?: string; content?: string; complete?: boolean; next_cursor?: string | null } | undefined;
            if (completed.current !== view || result.isError || !report?.available || report.target_id !== view.target.target_id
              || report.run_id !== view.binding.run_id || report.gate !== view.binding.gate || report.revision_id !== view.binding.expected_revision_id
              || report.presentation_id !== view.binding.presentation_id || report.content_digest !== view.document_digest
              || typeof report.content !== 'string') throw Error('presented_document_unavailable');
            text += report.content;
            if (text.length > 4 * 1024 * 1024) throw Error('resource_limit');
            if (report.complete === true && report.next_cursor === null) break;
            if (typeof report.next_cursor !== 'string' || !report.next_cursor || seen.has(report.next_cursor) || seen.size >= 128) throw Error('presented_document_unavailable');
            cursor = report.next_cursor; seen.add(cursor);
          } while (cursor);
          return text;
        }
        if (current.current !== view) throw Error('session_invalid');
        const result = await bridge.operation({ operation: 'document', snapshot_id: view.snapshot_id, run_id: view.binding.run_id,
          resource_id: view.resource_id }, undefined, view.read_session_id) as { state?: string; data?: { document?: { content?: string; content_digest?: string } } };
        const document = result.data?.document;
        if (current.current !== view || result.state !== 'available' || typeof document?.content !== 'string'
          || 'sha256:' + document.content_digest !== view.document_digest) throw Error('presented_document_unavailable');
        return document.content;
      },
      inspect: async operation => {
        const result = await call('agdf_inspect', { operation: 'operation-status', module: operation, presentation_language: view.binding.presentation_language,
          working_directory: view.target.display_path, target_source: 'explicit_target', primary_target: view.target.display_path,
          run_id: view.binding.run_id, expected_revision_id: view.binding.expected_revision_id });
        if (result.outcome !== 'inspect_result' || typeof result.report !== 'object' || !result.report) throw Error('result_unconfirmed');
        return result.report as Record<string, unknown>;
      },
      expand: async () => {
        const modes = bridge.app.getHostContext()?.availableDisplayModes ?? [];
        const mode = modes.includes('fullscreen') ? 'fullscreen' : modes.includes('pip') ? 'pip' : null;
        if (!mode) throw Error('display_mode_unavailable');
        const result = await bridge.request(() => bridge.app.requestDisplayMode({ mode }, { timeout: 10_000 }));
        if (result.mode !== mode) throw Error('display_mode_unavailable');
      },
      ...(bridge.app.getHostCapabilities()?.message?.text && bridge.app.getHostCapabilities()?.updateModelContext
        ? { next: async (expected: Parameters<NonNullable<DecisionPort['next']>>[0], approval: DecisionSubmission) => {
        const result = await call('agdf_inspect', { operation: 'operation-contract', module: 'agdf_record/step.record',
          presentation_language: view.binding.presentation_language, working_directory: view.target.display_path,
          target_source: 'explicit_target', primary_target: view.target.display_path, run_id: view.binding.run_id,
          expected_revision_id: expected.revision_id });
        const report = result.report as { binding?: Record<string, unknown>; current?: Record<string, unknown> } | undefined;
        const bound = result.outcome === 'inspect_result' && report?.binding?.target_id === view.target.target_id
          && report.binding.run_id === view.binding.run_id && report.binding.expected_revision_id === expected.revision_id;
        const fresh = readDecisionNext({ ...report?.current, available: bound, revision_id: expected.revision_id });
        const keys = ['type', 'operation_key', 'actor', 'effect', 'gate'] as const;
        if (!fresh || keys.some(key => fresh.next_operation[key] !== expected.next_operation[key]) || current.current !== view) throw Error('continuation_stale');
        const remaining = view.expires_at - Date.now();
        if (remaining <= 0) throw Error('session_invalid');
        const controller = new AbortController(); continuation.current = controller;
        try {
          // Context is a locator for fresh Core verification, never approval
          // authority. Keep technical identity out of the visible Chat message.
          await bridge.request(() => bridge.app.updateModelContext({ structuredContent: {
            agdf_continuation: { schema_version: '1', authorizes: false,
              target: { ...view.target }, run_id: view.binding.run_id, expected_revision_id: expected.revision_id,
              approved_decision: { operation_id: approval.operation_id, gate: view.binding.gate,
                presentation_id: view.binding.presentation_id, previous_revision_id: view.binding.expected_revision_id,
                material_version: view.binding.material_version },
              next_operation: fresh.next_operation,
              instruction: 'Verify the original receipt and fresh Core state. Redispatch gate-check for this exact target and Run, follow only already permitted work, and present the next human gate or blocker. This context grants no approval; never execute a human next_operation automatically.' }
          } }, { timeout: 10_000, signal: controller.signal }));
          if (current.current !== view || Date.now() >= view.expires_at) throw Error('continuation_unavailable');
          const titles = (registry.locales as Record<string, { gateTitles: Record<string, string> }>)[view.binding.presentation_language]?.gateTitles;
          const text = view.labels.continuationMessage.replace('{gate}', titles?.[view.binding.gate] ?? view.binding.gate)
            .replace('{step}', titles?.[fresh.next_operation.gate] ?? fresh.next_operation.gate);
          // Host admission can wait for this assistant turn to end. Its wait
          // remains bound to the view; server-tool deadlines stay unchanged.
          const sent = await bridge.app.sendMessage({ role: 'user', content: [{ type: 'text', text }] },
            { timeout: Math.max(1, view.expires_at - Date.now()), signal: controller.signal });
          if (sent.isError) throw Error('continuation_unavailable');
          await complete.current(view);
        } finally { if (continuation.current === controller) continuation.current = null; }
      } } : {}),
    };
  }, [bridge, view]);
  const effectiveView = useMemo(() => view && !bridge.app.getHostCapabilities()?.serverTools ? { ...view, capability: 'not_qualified' as const, enabled_actions: [] } : view, [view, connected, bridge]);
  return connected && effectiveView && port ? <DecisionCard key={effectiveView.session_id} view={effectiveView} port={port} closeWarning={closeWarning}/>
    : <section className="decision-card"><h1>AGDF</h1><p role="status">{view?.labels.connecting ?? 'AGDF · …'}</p></section>;
}
