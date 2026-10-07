import { validateEnvelope, graphReferences, validateData } from '../api';
import type { ContextPacket } from '../types';
import type { HandoffPort } from './handoff';
import type { CockpitBridge } from './transport';

export function createHandoffPort(bridge: CockpitBridge, session = bridge.session): HandoffPort {
  const checked = async (input: Record<string, unknown>) => {
    const value = await bridge.operation(input, undefined, session); validateEnvelope(value);
    if (value.state !== 'available' || !value.data) {
      const size = value.data as { byte_count?: number; limit?: number } | null;
      throw Error(value.code === 'context_limit' ? `context_limit:${size?.byte_count}/${size?.limit}` : value.code ?? 'handoff_failed');
    }
    return value;
  };
  return {
    support: () => ({ context: !!bridge.app.getHostCapabilities()?.serverTools && !!bridge.app.getHostCapabilities()?.updateModelContext,
      question: !!bridge.app.getHostCapabilities()?.message?.text }),
    async prepare(selection, generation) {
      const { target: _target, ...selectors } = selection;
      const value = await checked({ operation: 'prepare_context', ...selectors, generation });
      const packet = (value.data as { packet?: ContextPacket }).packet;
      if (!packet || packet.schema_version !== '1' || packet.authorizes !== false || !packet.context_id || !packet.prepared_at
        || !packet.source_digest || !packet.observed_as_of || !Array.isArray(packet.included) || !Array.isArray(packet.excluded)
        || !graphReferences(packet.graph_nodes) || packet.graph_nodes.length > 16) throw Error('dto_invalid');
      if (packet.artefact?.resource?.run_id !== selection.run_id
        || packet.graph_nodes.some(ref => ref.run_id !== selection.run_id || ref.state !== 'available')
        || JSON.stringify(packet.graph_nodes.map(ref => ref.resource_id)) !== JSON.stringify(selection.graph_ids)
        || packet.included.length !== packet.graph_nodes.length + 1
        || JSON.stringify(packet.included.map(ref => ref?.resource_id)) !== JSON.stringify([selection.resource_id, ...selection.graph_ids])
        || packet.excluded.length > 64 || new Set(packet.excluded.map(ref => ref?.resource_id)).size !== packet.excluded.length
        || packet.excluded.some(ref => !ref || typeof ref.resource_id !== 'string' || typeof ref.origin !== 'string'
          || selection.graph_ids.includes(ref.resource_id) || !['not_selected', 'deliberate_exclusion'].includes(ref.reason)
          || (ref.reason === 'deliberate_exclusion') !== selection.excluded_ids.includes(ref.resource_id))
        || selection.excluded_ids.some(id => !packet.excluded.some(ref => ref.resource_id === id && ref.reason === 'deliberate_exclusion'))) throw Error('dto_invalid');
      validateEnvelope(packetEnvelope(value, packet));
      validateData('/api/documents/registered', packetEnvelope(value, packet));
      if (new TextEncoder().encode(JSON.stringify(packet)).byteLength > 64 * 1024) throw Error('context_limit');
      return packet;
    },
    async validate(packet) {
      const value = await checked({ operation: 'validate_context', context_id: packet.context_id, generation: packet.generation });
      const data = value.data as { context_id?: string; generation?: number; current?: boolean };
      if (data.current !== true || data.context_id !== packet.context_id || data.generation !== packet.generation
        || value.target.target_id !== packet.target.target_id || value.snapshot_id !== packet.snapshot_id
        || value.source_digest !== packet.source_digest) throw Error('dto_invalid');
    },
    async invalidate() {
      const value = await checked({ operation: 'invalidate_context' });
      const data = value.data as { invalidated?: boolean; host_publication_required?: boolean; invalidation_id?: string };
      if (data.invalidated !== true || typeof data.host_publication_required !== 'boolean'
        || (data.host_publication_required ? !isUuid(data.invalidation_id) : data.invalidation_id !== undefined)) throw Error('dto_invalid');
      return { host_publication_required: data.host_publication_required, invalidation_id: data.invalidation_id };
    },
    async completeInvalidation(invalidationId) {
      if (!isUuid(invalidationId)) throw Error('dto_invalid');
      const value = await checked({ operation: 'complete_context_invalidation', invalidation_id: invalidationId });
      const data = value.data as { completed?: boolean; invalidation_id?: string };
      if (data.completed !== true || data.invalidation_id !== invalidationId) throw Error('dto_invalid');
    },
    async publish(structuredContent) {
      if (!bridge.app.getHostCapabilities()?.updateModelContext) throw Error('context_unavailable');
      await bridge.request(() => bridge.app.updateModelContext({ structuredContent }, { timeout: 10_000 }));
    },
    async question(text) {
      if (!bridge.app.getHostCapabilities()?.message?.text) throw Error('message_unavailable');
      const result = await bridge.request(() => bridge.app.sendMessage({ role: 'user', content: [{ type: 'text', text }] }, { timeout: 10_000 }));
      if (result.isError) throw Error('message_rejected');
    },
  };
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value); }
function packetEnvelope(value: import('../types').Envelope<unknown>, packet: ContextPacket) {
  return { ...value, target: packet.target, snapshot_id: packet.snapshot_id, observed_as_of: packet.observed_as_of,
    source_digest: packet.source_digest, data: packet.artefact };
}
