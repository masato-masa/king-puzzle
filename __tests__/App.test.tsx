import { describe, expect, it, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { App } from '@/App';

afterEach(() => {
  window.location.hash = '';
  document.body.innerHTML = '';
});

describe('App routing smoke test', () => {
  it('home ルートで king-puzzle というタイトルが出る', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });
    expect(container.textContent).toContain('king-puzzle');
  });

  it('存在しないレベルIDでは案内文が出る', () => {
    window.location.hash = '#/level/does-not-exist';
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });
    expect(container.textContent).toContain('見つかりませんでした');
  });
});
