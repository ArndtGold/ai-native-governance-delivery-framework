import { useEffect, useRef } from 'react';
import { figureSvg } from '../../../plugins/agdf/host-templates/claude/companion/figure.mjs';
import { useReducedFigureMotion } from './RunFigure';
import type { CockpitProvenance } from './mcp/bootstrap';
import { cockpitTitle, type CockpitHost } from './host-label';

export function AboutCockpit({ onClose, provenance, host = 'unknown' }: { onClose: () => void; provenance?: CockpitProvenance; host?: CockpitHost }) {
  const dialog = useRef<HTMLElement>(null);
  const still = useReducedFigureMotion();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return <div className="about-backdrop" onClick={onClose}>
    <section ref={dialog} tabIndex={-1} className="about-cockpit" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={event => event.stopPropagation()}>
      <div className="about-hero"><button type="button" className="about-close" onClick={onClose} aria-label="Info schließen">×</button>
        <div><span>{cockpitTitle(host)}</span><h2 id="about-title">Dein Projekt im Blick</h2><p>Orientierung für die Arbeit am Projekt – inspiriert von der Boxengasse.</p></div>
      </div>
      <div className="about-body"><div className="about-intro"><div><h3>Über das Cockpit</h3><p>Das Cockpit zeigt den beobachteten Arbeitsstand, offene Entscheidungen und den nächsten Schritt. Es liest die vorhandenen Projektdaten und verändert keine Kontrolldateien.</p></div>
        <img alt="" width="160" height="112" src={`data:image/svg+xml,${encodeURIComponent(figureSvg('laeuft', { workGate: 'TP', still, showcase: true }))}`}/></div>
        <h3>Dein Begleiter</h3><p>Wie eine Boxencrew macht er den Arbeitsstand sichtbar: Er arbeitet mit, weist auf eine ausstehende Freigabe oder Klärung hin und feiert einen bestätigten Abschluss. Mimik und Gesten ergänzen die Statusanzeige.</p>
        <p className="about-read-only"><strong>Nur Lesen</strong> · Entscheidungen triffst du im vorgesehenen Arbeitsablauf.</p>
        <div className="about-version">AGDF Cockpit {provenance?.version ?? 'Version nicht verfügbar'} · {provenance
          ? <details><summary>Build {provenance.resource_digest.slice(7, 15)}…</summary><p>Server-Ressource (SHA-256): <code>{provenance.resource_digest}</code></p><p>Die Anzeige durch den Host ist nicht unabhängig bestätigt.</p></details>
          : <span>Build nicht verfügbar</span>}</div>
      </div>
    </section>
  </div>;
}
