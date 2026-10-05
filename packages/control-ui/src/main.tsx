import { createRoot } from 'react-dom/client';
import { App } from './App';
import { consumeSession } from './api';
import './style.css';
const secret = consumeSession();
createRoot(document.getElementById('root')!).render(<App secret={secret}/>);
