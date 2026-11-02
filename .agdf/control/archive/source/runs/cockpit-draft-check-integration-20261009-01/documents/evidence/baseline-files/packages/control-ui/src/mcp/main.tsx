import { createRoot } from 'react-dom/client';
import { EmbeddedEntry } from './EmbeddedEntry';
import { CockpitBridge } from './transport';
import '../style.css';
import '../theme.css';
import './style.css';

const bridge = new CockpitBridge();
createRoot(document.getElementById('root')!).render(<EmbeddedEntry bridge={bridge}/>);
