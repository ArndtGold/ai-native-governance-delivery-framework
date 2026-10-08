import { useLayoutEffect, useRef, useState } from 'react';
import { App } from './App';
import type { ReadTransport } from './api';

// Both browser formats keep the same App instance and its captured reading state.
export function BrowserEntry({ secret = '', transport, initialCompact = false, initialRunId }: {
  secret?: string; transport?: ReadTransport; initialCompact?: boolean; initialRunId?: string;
}) {
  const [compact, setCompact] = useState(initialCompact);
  const root = useRef<HTMLDivElement>(null), mounted = useRef(false);
  useLayoutEffect(() => {
    if (mounted.current) root.current?.querySelector<HTMLHeadingElement>('h1')?.focus();
    mounted.current = true;
  }, [compact]);
  return <div ref={root} className={compact ? 'browser-card-layout' : 'browser-full-layout'}>
    <div className={initialCompact ? 'mcp-entry' : undefined}>
      <App secret={secret} transport={transport} initialRunId={initialRunId} compact={compact} onExpand={() => setCompact(false)}/>
    </div>
  </div>;
}
