// 空きマスの台座（ChatGPT 製の一枚絵）を、透明な余白を切って正方形にし、256px で src/assets/sprites/node.png へ。
// 使い方: node scripts/slice-node.mjs
import sharp from 'sharp';

const src = 'assets-src/node-disc.png';
const { data, info } = await sharp(src).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
await sharp(data)
  .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/sprites/node.png');
console.log('trim', info.width, info.height, '→ 256x256');
