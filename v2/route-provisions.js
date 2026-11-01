import {roll} from './growth.js?v=0.37.9-r1';
export function provisionStop(s){
 const t=s.railTrip;
 if(t){if(t.stage!=='platform')return null;const name=t.stops[t.index];return {key:'rail:'+name,name:(name.endsWith('역')?name:name+'역')+' 자판기·매점',note:'자판기 배출구와 매점의 밀봉 식품을 확인한다. 전기가 끊긴 기계는 작동하지 않는다.'};}
 const r=s.roadTrip;if(!r||r.crossing||r.stage==='obstacle')return null;
 return {key:'road:'+r.edge+':'+r.index,name:r.index%2?'길가 편의점':'도로변 작은 식당',note:'진열대의 밀봉 식품과 생수만 살핀다. 냉장 음식과 조리된 음식은 남겨 둔다.'};
}
export function provisionView(s,button){
 const stop=provisionStop(s);if(!stop)return '';
 const cache=s.routeProvisions?.[stop.key];
 if(!cache)return `<section class="travel-provisions"><h3>${stop.name}</h3><p>${stop.note}</p>${button('provision-search','먹을 것과 물 찾아보기','10분 · 기력 소모 없음 · 이곳의 물자는 한정됨')}</section>`;
 return `<section class="travel-provisions"><h3>${stop.name} · 확인한 물자</h3><p>생수 ${cache.water}병 · 밀봉 크래커 ${cache.crackers}개</p><div class="sheet-actions">${cache.water?button('provision-drink','여기서 물 마시기','생수 1병 · 수분 +40 · 2분')+button('provision-pack:water','생수 가방에 담기','1병 · 1칸'):''}${cache.crackers?button('provision-eat','여기서 크래커 먹기','1개 · 포만 +20 · 5분')+button('provision-pack:crackers','크래커 가방에 담기','1개 · 1칸'):''}</div>${!cache.water&&!cache.crackers?'<p>챙길 물자가 남아 있지 않다.</p>':''}</section>`;
}
export function provisionAction(s,a,c){
 if(!a.startsWith('provision-'))return null;
 const stop=provisionStop(s);if(!stop)return false;
 s.routeProvisions??={};let cache=s.routeProvisions[stop.key];
 if(a==='provision-search'){
  if(cache){s.text='이미 확인한 물자다. 남은 물건만 챙길 수 있다.';return false;}
  if(!c.requireSight(s)||!c.pay(s,{ap:0,minutes:10}))return false;
  cache=s.routeProvisions[stop.key]={water:1+Math.floor(roll(s.seed,stop.key+':water')*2),crackers:1+Math.floor(roll(s.seed,stop.key+':food')*2),expires:s.day+14};
  s.text=stop.name+'에서 생수 '+cache.water+'병과 밀봉 크래커 '+cache.crackers+'개를 찾았다. 여기서 먹거나 가방에 챙길 수 있다.';return true;
 }
 if(!cache)return false;
 const id=a==='provision-drink'?'water':a==='provision-eat'?'crackers':a.slice(15);
 if(!['water','crackers'].includes(id)||!cache[id])return false;
 if(id==='crackers'&&cache.expires<=s.day){s.text='포장 안의 식품이 상했다. 먹거나 챙길 수 없다.';return false;}
 if(a.startsWith('provision-pack:')){
  if(c.load(s)+1>c.capacity(s)||c.mass(s)+c.items[id][2]>c.carryLimit(s)){s.text='가방 공간이나 운반 여유가 부족하다. 이곳에서 먹거나 마실 수도 있다.';return false;}
  cache[id]--;s.carry[id]=(s.carry[id]||0)+1;
  if(id==='crackers'){s.carryDates??={};(s.carryDates.crackers??=[]).push(cache.expires);}
  s.text=(id==='water'?'생수':'크래커')+' 하나를 가방에 넣었다.';return true;
 }
 cache[id]--;if(id==='water')s.thirst=Math.min(100,s.thirst+40);else s.hunger=Math.min(100,s.hunger+20);
 c.advance(s,id==='water'?2:5);
 s.text=id==='water'?'생수 한 병을 마셨다.':'밀봉된 크래커를 먹었다.';return c.finish(s);
}
