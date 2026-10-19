// Synthetic SDK host only; never native Desktop qualification.
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
const iframe = document.querySelector('iframe')!;
const bridge = new AppBridge(null, { name: 'Synthetic trace host', version: '1' }, { serverTools: {}, logging: {}, updateModelContext: {} }, {
  hostContext: { displayMode: 'fullscreen', availableDisplayModes: ['fullscreen'], locale: 'de' },
});
const logs: unknown[] = [];
bridge.onupdatemodelcontext = async params => { logs.push({ kind: 'context-ack', params }); return {}; };
bridge.addEventListener('loggingmessage', value => { logs.push(value); });
bridge.oncalltool = async params => (await fetch('/tool', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) })).json();
bridge.oninitialized = async () => { await bridge.sendToolResult(await (await fetch('/prepared')).json()); };
bridge.onrequestteardown = async () => { await bridge.teardownResource({}); };
(window as unknown as { sdkTraceHarness: unknown }).sdkTraceHarness = { logs, teardown: () => bridge.teardownResource({}) };
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
iframe.src = '/cockpit.html';
