export type CockpitHost = 'codex' | 'claude-code' | 'preview' | 'unknown';

// Host identification is the name reported in the MCP Apps initialization handshake,
// not proof of host identity or independent confirmation of rendered bytes.
export function cockpitHostFromName(name: unknown, integrationSurface?: 'codex' | 'claude'): CockpitHost {
  if (typeof name !== 'string') return 'unknown';
  switch (name.trim().toLowerCase()) {
    case 'chatgpt': return integrationSurface === 'codex' ? 'codex' : 'unknown';
    case 'codex':
    case 'codex desktop': return 'codex';
    case 'claude code':
    case 'claude-code': return 'claude-code';
    default: return 'unknown';
  }
}
export function cockpitTitle(host: CockpitHost): string {
  switch (host) {
    case 'codex': return 'AGDF Cockpit für Codex';
    case 'claude-code': return 'AGDF Cockpit für Claude Code';
    case 'preview': return 'AGDF Cockpit · lokale Vorschau';
    default: return 'AGDF Cockpit';
  }
}
