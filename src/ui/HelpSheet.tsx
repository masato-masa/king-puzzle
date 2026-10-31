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
          <p>
            敵の駒がいるマスへ進むと戦闘。レベルが高いほうが勝ち、負けたほうは消える。勝ったほうも相手のレベルぶん下がる。同じレベルなら相討ち（兵の相討ちで相手の王を倒しても勝ち）。王は自分よりレベルの低い相手にしか挑めない。
          </p>
        </section>
        <section>
          <h3>3. しせつ</h3>
          <p>
            自分のターンの終わりに駒が乗っていると効果を受ける。訓練場は駒のレベルが施設のレベルまで 1 ずつ上がる。採掘場はコインが増える。小屋をえらぶとコイン 2 枚で兵を呼べる。
          </p>
        </section>
        <section>
          <h3>4. あしぶみ</h3>
          <p>足踏みすると、その施設のレベルが上がる（コインを払う）。</p>
        </section>
        <section>
          <h3>5. かべ</h3>
          <p>壁のレベル以上の兵が入ると壊れて道になる。入った兵は消える。王は壁を壊せない。</p>
        </section>
        <section>
          <h3>6. てきのこうげき</h3>
          <p>
            マスの上の「弓2」は、あと 2 ターンで弓が飛んでくる印。弓はレベルを 1 下げ、大砲は駒を消す。罠は駒を止め、封鎖（×）のマスには入れない。赤く脈打つ印は、このターンの終わりに飛んでくる。印が駒について動く攻撃は、いちばん敵に近い駒や、いちばん強い駒を狙う。
          </p>
        </section>
        <section>
          <h3>7. かちまけ</h3>
          <p>相手の王を倒せば勝ち。自分の王を失えば負け。決められたターン数で勝てなくても負け。</p>
        </section>
        <button type="button" className="sheet-link" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
