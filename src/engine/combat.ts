export type CombatResult =
  | { winner: 'attacker'; survivorLevel: number }
  | { winner: 'defender'; survivorLevel: number }
  | { winner: 'mutual' };

/** レベルの高いほうが勝ち、敗者は消える。勝者は敗者のレベルぶんレベルが下がる（§5）。 */
export function resolveCombat(attackerLevel: number, defenderLevel: number): CombatResult {
  if (attackerLevel === defenderLevel) return { winner: 'mutual' };
  if (attackerLevel > defenderLevel) {
    return { winner: 'attacker', survivorLevel: attackerLevel - defenderLevel };
  }
  return { winner: 'defender', survivorLevel: defenderLevel - attackerLevel };
}
