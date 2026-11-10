import type { CockpitProvenance } from './mcp/bootstrap';
import { useState } from 'react';
import { compareCockpitCandidate } from '../../core/lib/control-inspect/cockpit-provenance.js';

export function CockpitInfo({ provenance }: { provenance?: CockpitProvenance }) {
  const [candidate, setCandidate] = useState('');
  const comparison = compareCockpitCandidate(provenance?.resource_digest, candidate.trim());
  return <details className="cockpit-info"><summary>Info</summary>
    {provenance ? <div>
      <p>AGDF Cockpit {provenance.version}</p>
      <p>Oberfläche beim Serverstart geprüft</p>
      <p>Anzeige durch den Host nicht unabhängig bestätigt.</p>
      <p>UI-SHA-256: <code>{provenance.resource_digest}</code></p>
      <div>
        <label htmlFor="cockpit-candidate">Prüfsumme des Kandidaten</label>{' '}
        <input id="cockpit-candidate" value={candidate} onChange={event => setCandidate(event.target.value)} placeholder="sha256:…" autoComplete="off"/>
      </div>
      <p role="status">{comparison === 'match' ? 'Server-Ressource stimmt mit dem angegebenen Kandidaten überein.'
        : comparison === 'mismatch' ? 'Server-Ressource weicht vom angegebenen Kandidaten ab.'
        : comparison === 'invalid' ? 'Prüfsumme ungültig. Erwartet wird sha256: und 64 Zeichen von 0–9 oder a–f.'
        : 'Kandidatenvergleich nicht überprüft.'}</p>
    </div> : <p>Für diese Ansicht liegt kein MCP-Herkunftsnachweis vor.</p>}
  </details>;
}
