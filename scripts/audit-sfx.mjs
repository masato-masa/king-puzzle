// 効果音の音量を数値で点検（常設）。各 wav のピーク・RMS（dBFS）を出し、RMS の最大と最小の差を見る。
// 使い方: node scripts/audit-sfx.mjs [wav のあるフォルダ]   目安: クリップ 0、RMS の幅 6dB 以内（効果音どうしの聞こえの差）
import { readFileSync, readdirSync } from 'node:fs';
const dir = process.argv[2] ?? 'src/assets/sfx';
const rows = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.wav'))) {
  const b = readFileSync(`${dir}/${f}`);
  let pos = 12, fmt = null, data = null;
  while (pos < b.length - 8) {
    const id = b.toString('ascii', pos, pos + 4), size = b.readUInt32LE(pos + 4);
    if (id === 'fmt ') fmt = { tag: b.readUInt16LE(pos + 8), ch: b.readUInt16LE(pos + 10), rate: b.readUInt32LE(pos + 12), bits: b.readUInt16LE(pos + 22) };
    if (id === 'data') data = b.subarray(pos + 8, pos + 8 + size);
    pos += 8 + size + (size % 2);
  }
  const bytes = fmt.bits / 8, n = Math.floor(data.length / bytes);
  let peak = 0, sum = 0, loud = 0, loudN = 0;
  const read = (i) => (fmt.bits === 16 ? data.readInt16LE(i * 2) / 32768 : fmt.bits === 24 ? data.readIntLE(i * 3, 3) / 8388608 : fmt.bits === 32 && fmt.tag === 3 ? data.readFloatLE(i * 4) : data.readInt32LE(i * 4) / 2147483648);
  const vals = [];
  for (let i = 0; i < n; i += fmt.ch) { const v = read(i); vals.push(v); const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; }
  // 無音部を除いた RMS（音の鳴っている部分: 振幅が -50dB を超える区間）
  const thr = Math.pow(10, -50 / 20);
  for (const v of vals) if (Math.abs(v) > thr) { loud += v * v; loudN++; }
  const db = (x) => (20 * Math.log10(x || 1e-9)).toFixed(1);
  rows.push({ name: f, sec: (vals.length / fmt.rate).toFixed(2), peak: db(peak), rms: db(Math.sqrt(sum / vals.length)), rmsLoud: db(Math.sqrt(loud / (loudN || 1))), clip: peak >= 0.999 });
}
console.table(rows);
const rl = rows.map((r) => Number(r.rmsLoud));
console.log('鳴っている部分の RMS: 最大', Math.max(...rl), 'dB / 最小', Math.min(...rl), 'dB / 幅', (Math.max(...rl) - Math.min(...rl)).toFixed(1), 'dB。クリップ', rows.filter((r) => r.clip).length, '本');
