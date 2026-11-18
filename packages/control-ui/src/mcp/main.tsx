import { createRoot } from 'react-dom/client';
import { EmbeddedEntry } from './EmbeddedEntry';
import { CockpitBridge } from './transport';
import '../style.css';
import '../theme.css';
import './style.css';

const bridge = new CockpitBridge('AGDF Cockpit', { autoResize: false });
const diagnostics = window.location.hostname === '127.0.0.1'
  && new URLSearchParams(window.location.search).get('diagnostics') === '1';
createRoot(document.getElementById('root')!).render(<EmbeddedEntry bridge={bridge} diagnostics={diagnostics}/>);
