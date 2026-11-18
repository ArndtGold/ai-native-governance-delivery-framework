// Synthetic SDK host only; never native Desktop qualification.
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
const iframe = document.querySelector('iframe')!;
const reviewJourney = new URLSearchParams(location.search).get('closeMode') === 'accepted';
const bridge = new AppBridge(null, { name: 'Synthetic trace host', version: '1' }, { serverTools: {}, logging: {}, updateModelContext: {} }, {
  hostContext: { displayMode: reviewJourney ? 'inline' : 'fullscreen',
    availableDisplayModes: reviewJourney ? ['inline', 'pip', 'fullscreen'] : ['fullscreen'], locale: 'de' },
});
const logs: unknown[] = [];
bridge.onrequestdisplaymode = async ({ mode }) => {
  logs.push({ kind: 'mode', mode });
  await bridge.sendHostContextChange({ displayMode: mode });
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
(window as unknown as { sdkTraceHarness: unknown }).sdkTraceHarness = {
  logs, teardown: () => bridge.teardownResource({}),
  setTheme: (theme: 'light' | 'dark') => bridge.sendHostContextChange({ theme }),
};
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
iframe.src = '/cockpit.html';
