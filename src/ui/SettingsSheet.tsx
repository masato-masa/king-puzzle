import { useState } from 'react';

import { isBgmOn, isSfxOn, setBgmOn, setSfxOn } from '@/core/sound';

/** 設定。効果音と BGM の入切。ほかのゲームと同じシートの形（shared の .overlay / .sheet）。 */
export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const [sfx, setSfx] = useState(isSfxOn);
  const [bgm, setBgm] = useState(isBgmOn);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="sheet-title">設定</h2>
        <div className="sheet-row static">
          <span>効果音</span>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={sfx}
            aria-label={sfx ? '効果音を消す' : '効果音を出す'}
            onClick={() => {
              setSfxOn(!sfx);
              setSfx(!sfx);
            }}
          />
        </div>
        <div className="sheet-row static">
          <span>BGM</span>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={bgm}
            aria-label={bgm ? 'BGM を消す' : 'BGM を流す'}
            onClick={() => {
              setBgmOn(!bgm);
              setBgm(!bgm);
            }}
          />
        </div>
        <button type="button" className="sheet-btn" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
