import { createRoot } from 'react-dom/client';
import { CockpitBridge } from './transport';
import { DecisionEntry } from './DecisionEntry';
import '../style.css';
import '../theme.css';
import './style.css';
createRoot(document.getElementById('root')!).render(<DecisionEntry bridge={new CockpitBridge('AGDF Gate Decision')}/>);
