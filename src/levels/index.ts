import { ch1_1, ch1_2 } from './chapter1';
import { ch2_1, ch2_2 } from './chapter2';
import { ch3_1, ch3_2 } from './chapter3';
import { ch4_1, ch4_2, ch4_3 } from './chapter4';
import { ch5_1, ch5_2, ch5_3 } from './chapter5';
import { ch6_1, ch6_2 } from './chapter6';
import { ch7_1, ch7_2 } from './chapter7';
import { ch8_1, ch8_2, ch8_3 } from './chapter8';
import { ch9_1, ch9_2 } from './chapter9';
import { ch10_1 } from './chapter10';
import { ch11_1, ch11_2 } from './chapter11';
import { ch12_1, ch12_2, ch12_3 } from './chapter12';
import { ch13_1, ch13_2, ch13_3 } from './chapter13';
import { ch14_1, ch14_2, ch14_3, ch14_4 } from './chapter14';
import { ch15_1, ch15_2, ch15_3, ch15_4 } from './chapter15';
import { ch16_1, ch16_2, ch16_3, ch16_4 } from './chapter16';
import { ch17_1, ch17_2, ch17_3, ch17_4 } from './chapter17';
import { ch18_1, ch18_2, ch18_3, ch18_4 } from './chapter18';
import { ch19_1, ch19_2, ch19_3, ch19_4 } from './chapter19';
import { ch20_1, ch20_2, ch20_3, ch20_4 } from './chapter20';
import { ch21_1, ch21_2, ch21_3, ch21_4 } from './chapter21';
import { ch22_1, ch22_2, ch22_3, ch22_4 } from './chapter22';
import type { LevelDef } from './types';

export type { LevelDef } from './types';
export { turnLimitOf } from './types';

export const LEVELS: LevelDef[] = [
  ch1_1, ch1_2, ch2_1, ch2_2, ch3_1, ch3_2, ch4_1, ch4_2, ch4_3, ch5_1, ch5_2,
  ch5_3, ch6_1, ch6_2, ch7_1, ch7_2, ch8_1, ch8_2, ch8_3, ch9_1, ch9_2, ch10_1,
  ch11_1, ch11_2, ch12_1, ch12_2, ch12_3, ch13_1, ch13_2, ch13_3,
  ch14_1, ch14_2, ch14_3, ch14_4, ch15_1, ch15_2, ch15_3, ch15_4,
  ch16_1, ch16_2, ch16_3, ch16_4,
  ch17_1, ch17_2, ch17_3, ch17_4,
  ch18_1, ch18_2, ch18_3, ch18_4,
  ch19_1, ch19_2, ch19_3, ch19_4,
  ch20_1, ch20_2, ch20_3, ch20_4,
  ch21_1, ch21_2, ch21_3, ch21_4,
  ch22_1, ch22_2, ch22_3, ch22_4,
];

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
