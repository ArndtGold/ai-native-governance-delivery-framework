// Entry point for the isolated native transport probe. The host supplies the SDK bridge.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { CockpitBridge } from '../../src/mcp/transport';
import { createCompanionContinuation } from '../../src/mcp/companion-continuation';
import { CompanionContinuationAction } from '../../src/mcp/CompanionContinuationAction';

const bridge = new CockpitBridge('AGDF Übergabetest');
const root = createRoot(document.getElementById('action')!);
bridge.app.ontoolresult = result => {
  const scope = result._meta?.fixture as Record<string, string> | undefined;
  if (!scope?.session_id || !scope.target_id || !scope.snapshot_id || !scope.run_id || !scope.revision_id) return;
  bridge.session = scope.session_id;
  const caps = bridge.app.getHostCapabilities();
  if (!caps?.serverTools || !caps?.message?.text || !caps?.updateModelContext) {
    root.render('Dieser Host bietet die benötigten Funktionen für die Chat-Übergabe nicht an.');
    return;
  }
  root.render(createElement(CompanionContinuationAction, {
    key: scope.session_id, port: createCompanionContinuation(bridge, scope.session_id, scope.target_id),
    selection: { run_id: scope.run_id, revision_id: scope.revision_id, snapshot_id: scope.snapshot_id },
    approval: false, stepId: 'step',
  }));
};
void bridge.app.connect().catch(() => root.render('Die Verbindung zum Testchat ist fehlgeschlagen.'));
