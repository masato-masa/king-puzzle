import { describe, expect, it } from 'vitest';

import { hashFor, parseRoute } from '@/core/router';

describe('router', () => {
  it('空ハッシュは home', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
  });

  it('#/level/xxx は level ルート', () => {
    expect(parseRoute('#/level/ch2-1')).toEqual({ name: 'level', levelId: 'ch2-1' });
  });

  it('未知のパスは home にフォールバックする', () => {
    expect(parseRoute('#/unknown')).toEqual({ name: 'home' });
  });

  it('hashFor は parseRoute の逆変換になる', () => {
    const route = { name: 'level' as const, levelId: 'ch3-1' };
    expect(parseRoute(hashFor(route))).toEqual(route);
  });

  it('レベルIDのURLエンコードを扱う', () => {
    const route = { name: 'level' as const, levelId: 'ch 1' };
    expect(parseRoute(hashFor(route))).toEqual(route);
  });
});
