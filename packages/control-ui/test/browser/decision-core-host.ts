// Actual SDK bridge to a disposable assembled MCP server. This remains a
// synthetic browser host, never native host or human-decision qualification.
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
const iframe = document.querySelector('iframe')!;
const bridge = new AppBridge(null, { name: 'Disposable Core browser host', version: '1' }, { serverTools: {}, message: { text: {} }, updateModelContext: {} }, {
  hostContext: { theme: 'light', displayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen'], locale: 'en' }
});
const handoffs: unknown[] = [];
bridge.onupdatemodelcontext = async value => { handoffs.push({ context: value }); return {}; };
bridge.onmessage = async value => { handoffs.push({ message: value }); return {}; };
(window as unknown as { coreHandoffs: unknown[] }).coreHandoffs = handoffs;
bridge.onrequestdisplaymode = async ({ mode }) => {
  bridge.setHostContext({ theme: 'light', displayMode: mode, availableDisplayModes: ['inline', 'fullscreen'], locale: 'en' });
  return { mode };
};
bridge.oncalltool = async params => {
  const response = await fetch('/tool', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) });
  if (!response.ok) throw Error('disposable_tool_failed');
  return response.json();
};
bridge.oninitialized = async () => {
  const prepared = await (await fetch('/prepared')).json();
  await bridge.sendToolResult(prepared);
};
await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
iframe.src = '/decision.html';
