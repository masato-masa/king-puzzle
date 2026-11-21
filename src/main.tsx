import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './ui/styles.css';
import './ui/theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* 横向きのスマホでは「縦向きに」を全面に出す（盤が縦向き前提のため）。表示は CSS の向きと高さで切り替える */}
    <div className="rotate-hint" role="alert">
      <span className="rotate-phone" aria-hidden="true" />
      <b>スマホを縦向きにしてください</b>
    </div>
  </StrictMode>
);
