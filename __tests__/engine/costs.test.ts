import { describe, expect, it } from 'vitest';

import { facilityMaxLevel, mineIncome, upgradeCost } from '@/engine/costs';

describe('costs', () => {
  it('mine の Lv2 へのアップグレード費用は 4', () => {
    expect(upgradeCost('mine', 1)).toBe(4);
  });

  it('training の Lv5 へのアップグレード費用は 10', () => {
    expect(upgradeCost('training', 4)).toBe(10);
  });

  it('最大レベルを超える費用は undefined', () => {
    expect(upgradeCost('mine', 5)).toBeUndefined();
  });

  it('施設の最大レベルは 5', () => {
    expect(facilityMaxLevel('mine')).toBe(5);
    expect(facilityMaxLevel('training')).toBe(5);
  });

  it('採掘場の収入は 2 × レベル', () => {
    expect(mineIncome(3)).toBe(6);
  });
});
