import { useSyncExternalStore } from 'react';

/**
 * ハッシュルーティング。GitHub Pages のサブパス配信では、通常のパスルーティングだと
 * 直リンクのたびに 404.html のフォールバックが必要になるため、ハッシュで済ませる。
 */
export type Route = { name: 'home' } | { name: 'level'; levelId: string };

export const parseRoute = (hash: string): Route => {
  const path = hash.replace(/^#/, '').split('?')[0];
  const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (seg[0] === 'level' && seg[1]) return { name: 'level', levelId: seg[1] };
  return { name: 'home' };
};

export const hashFor = (route: Route): string => {
  switch (route.name) {
    case 'level':
      return `#/level/${encodeURIComponent(route.levelId)}`;
    default:
      return '#/';
  }
};

export const navigate = (route: Route): void => {
  window.location.hash = hashFor(route);
};

export const goBack = (): void => {
  window.history.back();
};

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

export const useRoute = (): Route =>
  parseRoute(
    useSyncExternalStore(
      subscribe,
      () => window.location.hash,
      () => ''
    )
  );
