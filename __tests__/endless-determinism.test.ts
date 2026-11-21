import { describe, expect, it, vi } from 'vitest';

/** むげんの面は、どこまで先を決めてあるか（遊ぶ順・先読み・再開）に関わらず、番号だけで同じになる。 */
describe('むげんの決定性', () => {
  it('先の面を先に決めてあっても、同じ番号は同じ面になる', async () => {
    vi.resetModules();
    const a = await import('@/levels/endless');
    const alone = JSON.stringify(a.generateEndless(60, 40).level);
    vi.resetModules();
    const b = await import('@/levels/endless');
    b.plannedBase(400);
    const after = JSON.stringify(b.generateEndless(60, 40).level);
    expect(after).toBe(alone);
  }, 60000);
});
