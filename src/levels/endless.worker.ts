// むげんの面を画面の外で作る。生成は 1 面 数 ms〜200ms（node で実測）だが、遅い端末で画面を止めないため。
import { generateEndless } from './endless';

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<number>) => void) | null;
  postMessage: (message: unknown) => void;
};

scope.onmessage = (event) => {
  const n = event.data;
  scope.postMessage({ n, level: generateEndless(n).level });
};
