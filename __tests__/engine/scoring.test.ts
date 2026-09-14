import { describe, expect, it } from 'vitest';

import { computeStars } from '@/engine/scoring';

describe('computeStars', () => {
  it('T* ちょうどなら★3', () => {
    expect(computeStars(10, 4, 10)).toBe(3);
  });

  it('T*+floor(S/2) 以内なら★2', () => {
    expect(computeStars(10, 4, 12)).toBe(2); // floor(4/2)=2 -> 12
  });

  it('T*+S 以内なら★1', () => {
    expect(computeStars(10, 4, 14)).toBe(1);
  });

  it('最上位の条件を優先する', () => {
    expect(computeStars(10, 0, 10)).toBe(3);
  });
});
