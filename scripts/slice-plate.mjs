// 章の札（ChatGPT 製の一枚絵）の透明な余白を切り、幅 240px で src/assets/sprites/chapter-plate.png へ。
// 使い方: node scripts/slice-plate.mjs
import sharp from 'sharp';

const { data, info } = await sharp('assets-src/chapter-plate.png').trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
const out = await sharp(data).resize({ width: 240 }).png({ compressionLevel: 9 }).toFile('src/assets/sprites/chapter-plate.png');
console.log('trim', info.width, info.height, '→', out.width, out.height);
