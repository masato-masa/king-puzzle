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

/** delayS 秒あとに鳴らす。勝敗以外は音程 ±4% ずらして、続けて鳴っても機械的にしない。 */
export function playSfx(name: SfxName, delayS = 0): void {
  if (!sfxOn) return;
  const ac = audio();
  const buf = buffers.get(name);
  if (!ac || !buf) return;
  const src = ac.createBufferSource();
  src.buffer = buf;
  if (name !== 'win' && name !== 'lose') src.playbackRate.value = 1 + (Math.random() * 2 - 1) * 0.04;
  const g = ac.createGain();
  g.gain.value = 0.9;
  src.connect(g).connect(ac.destination);
  src.start(ac.currentTime + delayS);
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
