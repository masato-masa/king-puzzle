/**
 * 効果音と BGM。
 *
 * 効果音は riale-cardbatlle の録音（ElevenLabs で生成し、役割ごとの音量にそろえ済み）を
 * src/assets/sfx/<名前>.wav に置いて鳴らす。BGM は Suno で作った曲（src/assets/bgm/main.mp3）。
 * 入切は設定シートから「効果音」「BGM」を別々に切り替え、次に開いたときも残す。
 * ?mute を付けて開いたときは両方鳴らさない（確認用）。
 */

export type SfxName = 'tap' | 'select' | 'summon' | 'hit' | 'death' | 'coin' | 'win' | 'lose';

const SFX_KEY = 'king-puzzle:sfx';
const BGM_KEY = 'king-puzzle:bgm';
const forceMute = typeof location !== 'undefined' && new URLSearchParams(location.search).has('mute');

function readFlag(key: string): boolean {
  if (forceMute) return false;
  try {
    return localStorage.getItem(key) !== '0';
  } catch {
    return true;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* 保存できなくても、その場の入切は効いている */
  }
}

let sfxOn = readFlag(SFX_KEY);
let bgmOn = readFlag(BGM_KEY);

export const isSfxOn = (): boolean => sfxOn;
export const isBgmOn = (): boolean => bgmOn;

export function setSfxOn(value: boolean): void {
  sfxOn = value;
  writeFlag(SFX_KEY, value);
  // 音を戻した合図として 1 音鳴らす。無音のまま戻ると効いたか分からない。
  if (value) playSfx('tap');
}

export function setBgmOn(value: boolean): void {
  bgmOn = value;
  writeFlag(BGM_KEY, value);
  if (value) startBgm();
  else bgmEl?.pause();
}

// ---- 効果音 ----

const sampleUrls = import.meta.glob('../assets/sfx/*.wav', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const buffers = new Map<SfxName, AudioBuffer>();

let ctx: AudioContext | null = null;
let bgmBus: GainNode | null = null;
/** 効果音の出口。連打して重なっても割れないよう、コンプレッサーを通す。 */
let sfxBus: AudioNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
    bgmBus = ctx.createGain();
    bgmBus.gain.value = BGM_GAIN;
    bgmBus.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    comp.connect(ctx.destination);
    sfxBus = comp;
    for (const [path, url] of Object.entries(sampleUrls)) {
      const m = /\/(\w+)\.wav$/.exec(path);
      if (!m) continue;
      const ac = ctx;
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((d) => ac.decodeAudioData(d))
        .then((buf) => buffers.set(m[1] as SfxName, buf))
        .catch(() => {
          /* 読めなければ鳴らさない */
        });
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** 同じ音を鳴らしてよい最短の間隔（秒）と、同時に鳴る数の上限。連打で音が団子にならないように。 */
const MIN_GAP: Partial<Record<SfxName, number>> = { tap: 0.06, select: 0.05, summon: 0.08, coin: 0.1, hit: 0.08, death: 0.12 };
const MAX_VOICES = 3;
const lastAt = new Map<SfxName, number>();
const live = new Map<SfxName, number>();

/** delayS 秒あとに鳴らす。勝敗以外は音程 ±4% ずらして、続けて鳴っても機械的にしない。 */
export function playSfx(name: SfxName, delayS = 0): void {
  if (!sfxOn) return;
  const ac = audio();
  const buf = buffers.get(name);
  if (!ac || !buf) return;
  const at = ac.currentTime + delayS;
  const gap = MIN_GAP[name] ?? 0;
  if (at - (lastAt.get(name) ?? -9) < gap) return;
  if ((live.get(name) ?? 0) >= MAX_VOICES) return;
  lastAt.set(name, at);
  live.set(name, (live.get(name) ?? 0) + 1);
  const src = ac.createBufferSource();
  src.buffer = buf;
  if (name !== 'win' && name !== 'lose') src.playbackRate.value = 1 + (Math.random() * 2 - 1) * 0.04;
  const g = ac.createGain();
  g.gain.value = 0.9;
  src.connect(g).connect(sfxBus ?? ac.destination);
  src.onended = () => live.set(name, Math.max(0, (live.get(name) ?? 1) - 1));
  src.start(at);
}

/**
 * ★の音（合成）。i 個目（0 から）ほど高く、きらりと鳴る。三角波の基音に 2 倍音を重ね、
 * 音の頭は 5ms で立ち上げ、0.5 秒で消す。★1→3 で ド・ミ・ソ の上がり方。
 */
export function playStar(i: number, delayS = 0): void {
  if (!sfxOn) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delayS;
  const f = 659.25 * [1, 1.2599, 1.4983][Math.min(2, Math.max(0, i))];
  for (const [mul, vol] of [[1, 0.22], [2, 0.09]] as const) {
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f * mul;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    osc.connect(g).connect(sfxBus ?? ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.55);
  }
}

/** 触覚。対応していない環境では何も起きない。 */
export function buzz(pattern: number | number[]): void {
  if (!sfxOn) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* 環境によっては例外が飛ぶ */
  }
}

// ---- BGM ----

/** BGM の音量。効果音の下で、考えるのを邪魔しない小ささ（約 −20dB）。 */
const BGM_GAIN = 0.1;
const bgmUrl = Object.values(
  import.meta.glob('../assets/bgm/main.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
)[0];
let bgmEl: HTMLAudioElement | null = null;
let bgmNode: MediaElementAudioSourceNode | null = null;
let retryArmed = false;

function bgmElement(): HTMLAudioElement | null {
  if (!bgmUrl || typeof Audio === 'undefined') return null;
  if (!bgmEl) {
    bgmEl = new Audio(bgmUrl);
    bgmEl.preload = 'auto';
    bgmEl.loop = true;
  }
  return bgmEl;
}

function startBgm(): void {
  if (!bgmOn) return;
  const el = bgmElement();
  const ac = audio();
  if (!el || !ac || !bgmBus) return;
  if (!bgmNode) {
    bgmNode = ac.createMediaElementSource(el);
    bgmNode.connect(bgmBus);
  }
  bgmBus.gain.cancelScheduledValues(ac.currentTime);
  bgmBus.gain.setValueAtTime(0.0001, ac.currentTime);
  bgmBus.gain.exponentialRampToValueAtTime(BGM_GAIN, ac.currentTime + 1.2);
  if (el.paused) void el.play().catch(() => armRetry());
}

/** 自動再生は止められるので、最初の操作のあとに始める。 */
function armRetry(): void {
  if (retryArmed || typeof window === 'undefined') return;
  retryArmed = true;
  const events = ['pointerdown', 'keydown'];
  const go = (): void => {
    for (const ev of events) window.removeEventListener(ev, go, true);
    retryArmed = false;
    window.setTimeout(startBgm, 0);
  };
  for (const ev of events) window.addEventListener(ev, go, true);
}

if (typeof document !== 'undefined') {
  if (bgmOn) {
    bgmElement();
    armRetry();
  }
  // 別のタブやアプリに移ったら止め、戻ったら続きから流す。
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) bgmEl?.pause();
    else if (bgmOn && bgmNode) void bgmEl?.play().catch(() => armRetry());
  });
}
