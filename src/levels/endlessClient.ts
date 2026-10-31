/**
 * むげんの面を取り出す窓口。Web Worker で作り、作った面は覚えておく。
 * Worker が使えない環境（テスト・古いブラウザ）では同じ関数をその場で呼ぶ。
 * 同じ番号からは必ず同じ面が出るので、覚えておくのも先読みも安全。
 */
import { generateEndless } from './endless';
import type { LevelDef } from './types';

const ready = new Map<number, LevelDef>();
const pending = new Map<number, Promise<LevelDef>>();
const waiters = new Map<number, (level: LevelDef) => void>();
let worker: Worker | null | undefined;

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = typeof Worker === 'undefined' ? null : new Worker(new URL('./endless.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    worker = null;
  }
  if (worker) {
    worker.onmessage = (event: MessageEvent<{ n: number; level: LevelDef }>) => {
      const { n, level } = event.data;
      waiters.get(n)?.(level);
      waiters.delete(n);
    };
    worker.onerror = () => {
      // Worker が落ちたら、待っている番号をその場で作り直す
      worker?.terminate();
      worker = null;
      for (const [n, resolve] of waiters) resolve(generateEndless(n).level);
      waiters.clear();
    };
  }
  return worker;
}

/** 作り終えていればすぐ返す。 */
export function peekEndless(n: number): LevelDef | undefined {
  return ready.get(n);
}

export function loadEndless(n: number): Promise<LevelDef> {
  const done = ready.get(n);
  if (done) return Promise.resolve(done);
  const inflight = pending.get(n);
  if (inflight) return inflight;
  const promise = new Promise<LevelDef>((resolve) => {
    const w = getWorker();
    if (w) {
      waiters.set(n, resolve);
      w.postMessage(n);
    } else {
      // ローディングを先に描かせてから作る
      setTimeout(() => resolve(generateEndless(n).level), 0);
    }
  }).then((level) => {
    ready.set(n, level);
    pending.delete(n);
    return level;
  });
  pending.set(n, promise);
  return promise;
}
