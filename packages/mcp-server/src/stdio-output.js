import { OWNER_LIMITS } from './generation-protocol.js';

// One entry-owned SDK wire, one active write. Concurrent SDK responses must not
// attach one drain/error listener per result to a blocked native Worker stream.
// Capture exact JSON at admission. Existing result/resource owners bound the
// one active message; the additional queue has its own strict byte/frame cap.
// A legal large UI response must still work without lowering its resource cap.
export function boundStdioOutput(transport) {
  const originalSend = transport.send.bind(transport), originalClose = transport.close.bind(transport);
  const queue = [];
  let active, queuedBytes = 0, closed = false, closing;
  const capacityError = () => Error('AGDF_MCP_STDIO_CAPACITY');
  function pump() {
    if (active || closed || !queue.length) return;
    const entry = active = queue.shift(); queuedBytes -= entry.bytes;
    Promise.resolve().then(() => originalSend(entry.message)).then(entry.resolve, entry.reject).finally(() => {
      active = undefined; pump();
    });
  }
  transport.send = message => {
    if (closed) return Promise.reject(Error('AGDF_MCP_STDIO_CLOSED'));
    let snapshot, size;
    try {
      const json = JSON.stringify(message); size = Buffer.byteLength(json) + 1;
      if (queue.length + (active ? 1 : 0) >= OWNER_LIMITS.frames || active && queuedBytes + size > OWNER_LIMITS.bytes) return Promise.reject(capacityError());
      snapshot = JSON.parse(json); // Preserve SDK JSON semantics and call-time bytes.
    } catch (error) { return Promise.reject(error); }
    return new Promise((resolve, reject) => {
      queuedBytes += size; queue.push({ message: snapshot, bytes: size, resolve, reject }); pump();
    });
  };
  transport.close = () => {
    if (closing) return closing;
    closed = true;
    for (const entry of queue.splice(0)) { queuedBytes -= entry.bytes; entry.reject(Error('AGDF_MCP_STDIO_CLOSED')); }
    // Close does not prove that an active write drained. Its SDK promise stays
    // observed; genuine Worker exit is still required by the lifecycle owner.
    active?.reject(Error('AGDF_MCP_STDIO_CLOSED'));
    closing = Promise.resolve().then(originalClose); return closing;
  };
  return transport;
}
