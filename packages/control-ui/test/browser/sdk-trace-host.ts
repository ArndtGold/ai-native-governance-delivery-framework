// Synthetic SDK host only; never native Desktop qualification.
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
const iframe = document.querySelector('iframe')!;
const companion = new URLSearchParams(location.search).get('companion');
const displayModes = companion === 'panel' || !companion ? ['fullscreen'] as const : ['inline', 'fullscreen'] as const;
const bridge = new AppBridge(null, { name: companion === 'panel' ? 'chatgpt' : companion ? 'Codex' : 'Synthetic trace host', version: '1' }, { serverTools: {}, logging: {}, updateModelContext: {} }, {
  hostContext: { displayMode: displayModes[0], availableDisplayModes: [...displayModes], locale: 'de' },
});
const logs: unknown[] = [];
if (companion) bridge.onrequestdisplaymode = async ({ mode }) => {
  logs.push({ kind: 'display-mode-request', mode });
  if (!displayModes.some(available => available === mode)) return { mode: displayModes[0] };
  bridge.setHostContext({ displayMode: mode, availableDisplayModes: [...displayModes], locale: 'de' });
  return { mode };
};
bridge.onupdatemodelcontext = async params => {
  if (new URLSearchParams(location.search).get('closeMode') === 'deny-release'
    && (params.structuredContent as { kind?: string } | undefined)?.kind === 'agdf_cockpit_invalid_selection') throw Error('release_rejected');
  logs.push({ kind: 'context-ack', params }); return {};
};
bridge.addEventListener('loggingmessage', value => { logs.push(value); });
bridge.oncalltool = async params => (await fetch('/tool', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) })).json();
bridge.oninitialized = async () => { await bridge.sendToolResult(await (await fetch('/prepared')).json()); };
bridge.onrequestteardown = async () => { if (new URLSearchParams(location.search).get('closeMode') === 'accepted') await bridge.teardownResource({}); };
(window as unknown as { sdkTraceHarness: unknown }).sdkTraceHarness = { logs, teardown: () => bridge.teardownResource({}) };
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
iframe.src = new URLSearchParams(location.search).has('closeMode') ? '/cockpit.html?diagnostics=1' : '/cockpit.html';
