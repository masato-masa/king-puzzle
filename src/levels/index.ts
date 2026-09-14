import { ch1_1 } from './chapter1';
import { ch2_1 } from './chapter2';
import { ch3_1 } from './chapter3';
import type { LevelDef } from './types';

export type { LevelDef } from './types';
export { turnLimitOf } from './types';

export const LEVELS: LevelDef[] = [ch1_1, ch2_1, ch3_1];

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getNextLevel(id: string): LevelDef | undefined {
  const index = LEVELS.findIndex((l) => l.id === id);
  if (index === -1 || index + 1 >= LEVELS.length) return undefined;
  return LEVELS[index + 1];
}

export function chapters(): { chapter: number; levels: LevelDef[] }[] {
  const map = new Map<number, LevelDef[]>();
  for (const level of LEVELS) {
    const list = map.get(level.chapter) ?? [];
    list.push(level);
    map.set(level.chapter, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chapter, levels]) => ({ chapter, levels: levels.sort((x, y) => x.order - y.order) }));
}
