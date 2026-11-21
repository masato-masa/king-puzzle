import { L, A, report } from './draft-level';
import { countOptimal } from './count-optimal';
import type { LevelDef } from '../src/levels/types';
const show=(l:LevelDef)=>{report(l);const c=countOptimal(l);console.log('   最短の本数',c?.ways);};
// a 足踏みで訓練場を育てる
show(L('x','a1','k t:t1 a e','k-t k-a a-e','K1@k E3@e',4,3,[]));
show(L('x','a2','k t:t1 a b e','k-t k-a a-b b-e','K1@k E2@e',3,3,[]));
show(L('x','a3','k t:t1 m:m1 a e','k-t k-m k-a a-e','K1@k E3@e',0,3,[]));
// c 馬を足踏みで育てて 3 歩とび
show(L('x','c1','k s:s1 a b c e','k-s k-a a-b b-c c-e','K2@k E1@e',4,3,[A('s1','snare','a',1),A('s2','snare','b',1)]));
show(L('x','c2','k s:s1 a b c e','k-s k-a a-b b-c c-e','K2@k E1@e',4,3,[A('s1','snare','a',1),A('s2','snare','b',1),A('s3','snare','c',1)]));
// d 採掘場を育てる
show(L('x','d1','k m:m1 h:h w:w1 e','k-m k-h h-w w-e','K2@k E1@e',0,3,[]));
show(L('x','d2','k m:m2 h:h w:w2 e','k-m k-h h-w w-e','K2@k E1@e',0,3,[]));
