import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { GENERATION_LIMITS as L, OWNER_LIMITS, ownerFrame, encodeOwnerFrame, decodeOwnerFrame,
  validGenerationMessage, generationMessage, publicationSelector } from '../mcp-owner-protocol.js';

// Logical connections only. The remote owner holds the genuine Worker objects.
export function createOwnerClient(port, binding) {
  const rows = new Map(), pending = new Map(), lifecycle = new EventEmitter();
  let bytes = 0, disconnected = false;
  function send(kind, payload, requestId, row) {
    if (disconnected) throw Error('generation_connection_lost');
    const frame = ownerFrame(binding, kind, payload, requestId, row);
    const wire = encodeOwnerFrame(frame, binding);
    if (pending.size >= OWNER_LIMITS.frames || bytes + Buffer.byteLength(wire) > OWNER_LIMITS.bytes) throw Error('generation_request_capacity');
    return wire;
  }
  const generationFailure = (frame, p) => generationMessage(p.row.epoch, p.row.generation, 'failure', { reason: frame.payload.reason }, {}, p.original, frame.request_id);
  function release(id) { const p = pending.get(id); if (p) { pending.delete(id); bytes -= p.bytes; clearTimeout(p.timer); } return p; }
  port.on('message', wire => {
    let frame; try { frame = decodeOwnerFrame(wire, binding, { reply: true }); } catch { return; }
    if (frame.kind === 'stop' && frame.generation_id === null && frame.publication_id === binding.publication_id) {
      lifecycle.emit('message', { kind: 'facade_stop', token: binding.token }); return;
    }
    const row = rows.get(frame.generation_id);
    if (!row || row.epoch !== frame.generation_epoch || row.publication_id !== frame.publication_id) return;
    const p = pending.get(frame.request_id);
    if (frame.kind === 'exit' && Object.keys(frame.payload).sort().join() === 'code' && Number.isInteger(frame.payload.code)) {
      row.connected = false; if (frame.payload.code === 0) rows.delete(row.generation); row.emit('exit', frame.payload.code, null); return;
    }
    if (!p || p.row !== row) return;
    if (frame.kind === 'failure' && typeof frame.payload?.reason === 'string') {
      release(frame.request_id); p.reject?.(Error(frame.payload.reason)); if (p.kind === 'send') row.emit('message', generationFailure(frame, p));
    } else if (frame.kind === 'opened' && p.kind === 'open' && frame.payload?.opened === true) {
      release(frame.request_id); p.resolve(row);
    } else if (frame.kind === 'message' && p.kind === 'send'
      && validGenerationMessage(frame.payload, { epoch: row.epoch, generation: row.generation, reply: true })
      && frame.payload.request_id === frame.request_id && frame.payload.original_operation_id === p.original) {
      release(frame.request_id); row.emit('message', frame.payload);
    }
  });
  port.on('close', () => {
    disconnected = true;
    for (const [id] of pending) { const p = release(id); p.reject?.(Error('generation_connection_lost')); }
    for (const row of rows.values()) if (row.connected) { row.connected = false; row.emit('disconnect'); }
    lifecycle.emit('disconnect');
  });
  return Object.freeze({
    lifecycle: {
      on: (...args) => lifecycle.on(...args),
      send(value, callback) {
        if (value?.kind !== 'facade_closed' || value.token !== binding.token || typeof value.confirmed !== 'boolean') throw Error('generation_input_limit');
        port.postMessage(encodeOwnerFrame(ownerFrame(binding, 'closed', { confirmed: value.confirmed }, randomUUID()), binding)); callback?.();
      },
      close: () => port.close(),
    },
    async open({ packageInfo, epoch, generation }) {
      if (rows.size >= L.slots || rows.has(generation)) throw Error('generation_capacity_protected');
      const row = new EventEmitter(); Object.assign(row, { epoch, generation, publication_id: packageInfo.publication_id, connected: true });
      rows.set(generation, row);
      row.send = (message, callback) => {
        try {
          if (!row.connected || !validGenerationMessage(message, { epoch, generation }) || pending.has(message.request_id)) throw Error('generation_input_limit');
          const wire = send('send', message, message.request_id, row);
          const entry = { kind: 'send', row, original: message.original_operation_id, bytes: Buffer.byteLength(wire) };
          // Expiry retains the row; uncertainty is handled by the generation router.
          entry.timer = setTimeout(() => { release(message.request_id); row.emit('message', generationFailure({ payload: { reason: 'generation_response_unknown' }, request_id: message.request_id }, entry)); }, L.qualify);
          pending.set(message.request_id, entry); bytes += entry.bytes; port.postMessage(wire); callback?.();
        } catch (error) { callback?.(error); }
      };
      const id = randomUUID(), wire = send('open', publicationSelector(packageInfo), id, row);
      return new Promise((resolve, reject) => {
        const entry = { kind: 'open', row, resolve, reject, bytes: Buffer.byteLength(wire) };
        entry.timer = setTimeout(() => { release(id); row.connected = false; reject(Error('generation_response_unknown')); }, L.qualify);
        pending.set(id, entry); bytes += entry.bytes;
        try { port.postMessage(wire); } catch (error) { release(id); reject(error); }
      });
    },
  });
}
