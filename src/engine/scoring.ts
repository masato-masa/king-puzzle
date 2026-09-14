/** ★の条件（§10）。条件を満たした中で最上位の★を返す。 */
export function computeStars(tStar: number, s: number, actionsTaken: number): 1 | 2 | 3 {
  if (actionsTaken <= tStar) return 3;
  if (actionsTaken <= tStar + Math.floor(s / 2)) return 2;
  return 1;
}
