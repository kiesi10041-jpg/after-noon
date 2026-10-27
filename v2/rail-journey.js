import {roll} from './growth.js?v=0.28.0';
export const line4Stops=['서울역','회현','명동','충무로','동대문역사문화공원','동대문','혜화','한성대입구','성신여대입구','길음','미아사거리','미아','수유','쌍문','창동','노원'];
const anchors={road2:0,road3:14,family:15,nowon:15};
export function railStops(from,to){const a=anchors[from],b=anchors[to];if(a===undefined||b===undefined||a===b)return null;const out=[];for(let i=a;;i+=a<b?1:-1){out.push(line4Stops[i]);if(i===b)break;}return out;}
export function railEstimate(from,to){const route=railStops(from,to);return route?{minutes:(route.length-1)*25,ap:Math.ceil((route.length-1)/2)}:null;}
export function railAction(s,a,c){const t=s.railTrip;
 if(a==='rail-start'){const route=railStops(s.location,s.tripPlan?.target);if(!s.away||s.scene!=='door'||!route){s.text='이 구간에는 연결된 내부 통로가 없다. 지상 경로를 골라야 한다.';return false;}s.railTrip={origin:s.location,target:s.tripPlan.target,stops:route,index:0,stage:'platform',spent:0,obstacles:{},trainCondition:roll(s.seed,route.join('|')+':train')<.5?'collision':'stopped',aboveGround:route[0]==='창동'||route[0]==='노원'};s.location='rail-transit';s.scene='rail-journey';s.tripPlan.vehicle='walk';s.text='운행이 멈춘 승강장이다. 열차를 타는 대신 점검 통로를 따라 다음 역으로 이동한다. 불빛과 돌아올 여력을 남겨야 한다.';return true;}
 if(!t)return a.startsWith('rail-walk')||a==='rail-step'||a==='rail-rest'||a==='rail-back'?false:null;
 if(!['rail-step','rail-rest','rail-back','rail-detour','rail-clear','light','phone-light','battery','medicine','calm'].includes(a)){s.text='역 사이를 이동 중이다. 통로를 진행하거나 출발한 역으로 되돌아가야 한다.';return false;}
 if(['light','phone-light','battery','medicine','calm'].includes(a))return null;
 if(a==='rail-back'){const minutes=t.spent;if(minutes){c.advance(s,minutes);if(s.ended)return false;if(s.ap>0)s.ap--;else s.health=Math.max(0,s.health-8);}const origin=t.origin;delete s.railTrip;s.location=s.scene=origin;s.tripPlan.target='';s.text='왔던 통로를 되짚어 출발한 역으로 돌아왔다.';return c.finish(s);}
 if(a==='rail-rest'){if(t.stage!=='platform'){s.text='좁은 통로에서는 쉴 수 없다. 승강장에 닿거나 출발한 역으로 돌아가야 한다.';return false;}c.advance(s,30);if(s.ended)return false;s.ap=Math.min(8,s.ap+2);s.stress=Math.min(100,s.stress+2);s.text='승강장 벽에 기대어 삼십 분 쉬었다. 기력은 돌아왔지만 지하의 소음이 신경을 곤두세운다.';return true;}
 const source=c.lightSource(s);const need=a==='rail-step'?(t.stage==='platform'?12:13):a==='rail-clear'?20:35;
 if(!source){s.text='지하 통로는 낮에도 빛이 없다. 손전등이나 휴대폰 조명을 켜야 이동할 수 있다.';return false;}
 if(source==='flashlight'&&s.battery<Math.ceil(need/10)||source==='phone'&&s.phoneBattery<Math.ceil(need/5)*2+1){s.text='다음 구간을 비출 배터리가 부족하다. 건전지를 교체하거나 다른 조명을 켜야 한다.';return false;}
 if(t.stage==='blocked'){
  if(!['rail-detour','rail-clear'].includes(a))return false;if(a==='rail-clear'&&!s.carry.tool){s.text='막힌 점검문을 열 공구가 필요하다.';return false;}
  if(!c.pay(s,{ap:a==='rail-clear'?1:0,minutes:need}))return false;t.spent+=need;t.obstacles[t.index]=true;t.stage='platform';s.text=a==='rail-clear'?'공구로 점검문을 열어 통로를 확보했다.':'계단을 올라 막힌 통로를 우회했다. 시간은 더 들었지만 다시 승강장에 닿았다.';return true;
 }
 if(a!=='rail-step')return false;
 if(t.stage==='platform'&&t.index>0&&(t.index+(s.seed%3))%3===0&&!t.obstacles[t.index]){t.stage='blocked';s.text=t.trainCondition==='collision'?'충돌로 손상된 객차 연결부가 통로를 막았다. 공구로 통행할 틈을 확보하거나 다른 출입구로 우회해야 한다.':'멈춘 열차 옆 점검문이 잠겨 있다. 문을 손보거나 다른 출입구로 우회해야 한다.';return true;}
 const ap=t.stage==='platform'&&t.index%2===0?1:0;if(!c.pay(s,{ap,minutes:need}))return false;t.spent+=need;
 if(t.stage==='platform'){t.stage='tunnel';s.stress=Math.min(100,s.stress+3);s.text=`${t.stops[t.index]} 승강장을 뒤로하고 ${t.aboveGround?'지상 구간의 연결 동선으로 나왔다.':'점검 통로로 내려왔다.'} 발소리와 물 떨어지는 소리만 이어진다. 앞은 ${t.stops[t.index+1]} 방향이다.`;return true;}
 t.index++;t.stage='platform';if(t.index===t.stops.length-1){const target=t.target;delete s.railTrip;s.tripPlan.vehicle='walk';return c.arrive(s,target);}
 s.text=`${t.stops[t.index]} 승강장에 닿았다. 아직 ${t.stops.length-1-t.index}개 구간이 남았다. 여기서 조명을 정비하고 쉬어 갈 수 있다.`;return true;
}
export function railView(s,button){const t=s.railTrip;if(!t)return '';const cost=t.stage==='platform'&&t.index%2===0?1:0;return `<section class="rail-progress"><strong>${t.stops[t.index]} → ${t.stops[t.index+1]||t.stops[t.index]}</strong><span>${t.index}/${t.stops.length-1} 구간 통과 · 누적 이동 ${t.spent}분</span><progress max="${t.stops.length-1}" value="${t.index}"></progress><p>열차 운행 중단 · 내부 도보 탐색<br>공항철도 철교·단절 구간은 지상 경로를 이용합니다.</p></section><div class="sheet-actions">${t.stage==='blocked'?button('rail-clear','점검문 손보기','공구 · 20분 · 기력 1',!s.carry.tool)+button('rail-detour','비상계단으로 우회','35분 · 기력 소모 없음'):button('rail-step',t.stage==='platform'?'다음 역 방향 통로로':'앞쪽 승강장까지 이동',`${t.stage==='platform'?12:13}분 · 기력 ${cost} · 조명 배터리 소모`)}${t.stage==='platform'?button('rail-rest','승강장에서 잠시 쉬기','30분 · 기력 +2 · 긴장 +2'):''}${button('rail-turnback','출발한 역으로 되돌아가기','되짚는 시간과 기력 필요')}</div>`;}
