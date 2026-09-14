import type { FacilityType } from './types';

export const FACILITY_MAX_LEVEL = 5;
export const COIN_MAX = 30;
export const PIECE_GENERATION_COST = 2;

const UPGRADE_COST: Record<FacilityType, Record<number, number>> = {
  mine: { 2: 4, 3: 5, 4: 7, 5: 9 },
  training: { 2: 5, 3: 6, 4: 8, 5: 10 },
};

/** currentLevel から +1 する費用。上限に達していれば undefined。 */
export function upgradeCost(type: FacilityType, currentLevel: number): number | undefined {
  return UPGRADE_COST[type][currentLevel + 1];
}

export function facilityMaxLevel(_type: FacilityType): number {
  return FACILITY_MAX_LEVEL;
}

export function mineIncome(level: number): number {
  return 2 * level;
}
