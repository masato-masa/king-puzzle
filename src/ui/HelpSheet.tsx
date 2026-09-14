interface HelpSheetProps {
  onClose: () => void;
}

export function HelpSheet({ onClose }: HelpSheetProps) {
  return (
    <div className="kp-sheet-overlay" onClick={onClose}>
      <div className="kp-sheet" onClick={(e) => e.stopPropagation()}>
        <h2>あそびかた</h2>
        <section>
          <h3>1. うごかす</h3>
          <p>自分の駒をえらんで、となりのマスへ。もといた場所をえらぶと足踏み。</p>
        </section>
        <section>
          <h3>2. たたかう</h3>
          <p>敵の駒がいるマスへ進むと戦闘。レベルが高いほうが勝ち、負けたほうは消える。同じレベルなら相討ち。</p>
        </section>
        <section>
          <h3>3. しせつ</h3>
          <p>自分のターンの終わりにその駒が乗っていると効果を受ける。訓練場は駒のレベルが上がる。</p>
        </section>
        <section>
          <h3>4. あしぶみ</h3>
          <p>足踏みすると、その施設のレベルが上がる（コインを払う）。</p>
        </section>
        <section>
          <h3>5. かちまけ</h3>
          <p>相手の王を倒せば勝ち。自分の王を失えば負け。決められたターン数で勝てなくても負け。</p>
        </section>
        <button type="button" className="text-btn" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
