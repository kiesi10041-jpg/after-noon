export const VERSION='0.1.0';
export const ITEMS={
 water:{name:'생수',weight:.5,icon:0,desc:'밀봉된 식수 500 mL. 수분 +38.',use:'water'},
 food:{name:'통조림',weight:.3,icon:1,desc:'바로 먹을 수 있는 식량. 포만 +38.',use:'food'},
 snack:{name:'크래커',weight:.15,icon:2,desc:'가벼운 비상식량. 포만 +22.',use:'snack'},
 pot:{name:'냄비',weight:.8,icon:3,desc:'거점에서 처리할 물을 끓이는 데 사용.'},
 light:{name:'손전등',weight:.3,icon:4,desc:'배터리와 함께 챙기면 어두운 탐색의 부담을 줄인다.'},
 battery:{name:'건전지',weight:.08,icon:5,desc:'어두운 장소 조사와 야간 이동에 소모된다.'},
 power:{name:'보조배터리',weight:.25,icon:6,desc:'휴대전화 충전 1회. 통신망이 끊겨도 저장 자료는 남는다.',use:'power'},
 radio:{name:'라디오',weight:.4,icon:7,desc:'신호를 확인할 수 있는 기기. 사람이 답할 것을 보장하지 않는다.'},
 bandage:{name:'붕대',weight:.1,icon:8,desc:'경미한 부상 처치. 건강 +16, 부상 완화.',use:'bandage'},
 gloves:{name:'작업장갑',weight:.15,icon:9,desc:'파손된 선반을 정리할 때 작은 부상의 위험을 줄인다.'},
 tape:{name:'보수 테이프',weight:.2,icon:10,desc:'창문 보수와 물통 설치에 사용하는 자재.'},
 hammer:{name:'망치',weight:.6,icon:11,desc:'거점 보수에 필요한 공구.'},
 rope:{name:'로프',weight:.4,icon:12,desc:'물통 고정과 침구 보강에 사용하는 자재.'},
 blanket:{name:'담요',weight:.8,icon:13,desc:'거점에 두면 밤의 추위와 수면 부담을 줄인다.'},
 container:{name:'물통',weight:1,icon:14,desc:'빗물 수집 장치의 재료. 물의 안전성과는 별개다.'},
 pack:{name:'큰 배낭',weight:.7,icon:15,desc:'거점에서 배낭을 교체하면 운반 한도가 12 kg이 된다.'},
 raw:{name:'처리할 물',weight:.5,icon:0,desc:'게임 속 빗물 자원. 그대로 마실 수 없다. 거점에서 처리해야 한다.'},
 fuel:{name:'고체연료',weight:.1,icon:null,desc:'물 처리 1회에 1개 소모. 실제 연료 취급 안내가 아닌 게임 자원이다.'}
};
export const SITES={
 home:{name:'나의 집',sub:'해원동 302호',art:0,x:47,y:67,minutes:0},
 store:{name:'동네 편의점',sub:'식량 · 생활용품',art:1,x:24,y:48,minutes:35},
 hardware:{name:'해원 철물',sub:'공구 · 보수 자재',art:2,x:73,y:39,minutes:55},
 flats:{name:'은하아파트',sub:'생활 물자 · 계단',art:3,x:30,y:20,minutes:65},
 family:{name:'가족의 집',sub:'강 건너 오래된 집',art:0,x:78,y:13,minutes:110}
};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export function random(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;}
const pick=(s,arr)=>arr[Math.floor(random(s)*arr.length)];
const number=(s,a,b)=>a+Math.floor(random(s)*(b-a+1));
export const count=(inv,id)=>inv[id]||0;
function add(inv,id,n=1){inv[id]=(inv[id]||0)+n;if(inv[id]<=0)delete inv[id];}
export const weight=inv=>Object.entries(inv).reduce((n,[id,q])=>n+ITEMS[id].weight*q,0);
export const capacity=s=>s.upgrades.pack?12:8;
export const day=s=>Math.floor(s.clock/1440)+1;
export const hour=s=>Math.floor(s.clock%1440/60);
export const time=s=>`${String(hour(s)).padStart(2,'0')}:${String(Math.floor(s.clock%60)).padStart(2,'0')}`;
export const weather=s=>s.weather[(day(s)-1)%s.weather.length];
export const dark=s=>hour(s)>=18||hour(s)<6;
export const utility=(s,key)=>day(s)<s.outage[key];
export const atHome=s=>s.location==='home';
export const has=(s,id)=>count(s.bag,id)+(atHome(s)?count(s.stash,id):0)>0;
function consume(s,id,n=1){for(const inv of atHome(s)?[s.stash,s.bag]:[s.bag]){const v=Math.min(n,count(inv,id));add(inv,id,-v);n-=v;}return n===0;}
export function note(s,title,text){s.log.unshift({day:day(s),time:time(s),title,text});s.log=s.log.slice(0,100);s.last={title,text};}
const labels={store:['식품 진열대','음료 상자','계산대 아래','생활용품 선반','창고 앞 상자','안쪽 보관함','벽면 진열대','입구 바구니'],hardware:['작업대','수리용품 선반','안쪽 상자','공구 보관함','바닥 적재함','물통 진열대'],flats:['2층 현관','3층 주방','복도 보관함','4층 작은 방','5층 거실','옥상 창고','6층 현관','7층 주방'],family:['현관','주방','작은 방','안방','베란다','서랍장']};
const pools={store:['water','water','food','food','snack','battery','power','bandage'],hardware:['tape','rope','fuel','hammer','gloves','container','pot','battery','light','pack'],flats:['water','food','snack','bandage','blanket','power','battery','light','fuel'],family:['water','food','blanket','radio','bandage','snack']};
export function createGame(seed=Date.now()>>>0){
 const s={schema:1,version:VERSION,seed:seed>>>0,rng:seed>>>0,clock:12*60,location:'home',stats:{health:100,food:78,water:76,energy:86,tension:16},injury:0,bag:{water:1,snack:1},stash:{water:3,food:3,bandage:1,blanket:1},upgrades:{window:false,tank:false,bed:false,pack:false},sites:{},outage:{},weather:[],log:[],last:null,loot:null,hazard:null,panic:false,panicDay:0,phone:78,downloaded:false,family:false,ended:null,milestones:[],sleepCount:0};
 s.outage={power:number(s,3,5),water:number(s,4,7),net:number(s,2,5)};
 s.weather=Array.from({length:35},()=>pick(s,['맑음','맑음','흐림','비']));
 for(const [id,names] of Object.entries(labels)){
  const spots=names.map((name,i)=>{const loot={};for(let k=0;k<3;k++){const item=pick(s,pools[id]);add(loot,item,['water','food','snack','fuel','battery'].includes(item)?number(s,2,4):1);}const hazard=pick(s,['none','none','glass','noise','locked']);return {name,loot,hazard,observed:false,done:false};});
  // Every generated city contains several reachable basic supplies and repair tools.
  if(id==='store'){spots[0].loot={food:4,snack:3};spots[0].hazard='none';spots[1].loot={water:6};spots[1].hazard='none';}
  if(id==='hardware'){spots[0].loot={hammer:1,tape:3,gloves:1};spots[0].hazard='none';spots[1].loot={container:1,rope:2,pot:1,fuel:5};}
  s.sites[id]={distance:SITES[id].minutes+number(s,0,3)*5,route:pick(s,['잔해가 남은 큰길','조용한 주택가','차량이 멈춘 골목']),spots,visited:false};
 }
 note(s,'12:00','사람이 사라졌다. 집으로 돌아와 문을 잠갔다. 우선 물과 먹을 것, 그리고 돌아올 힘을 남겨야 한다.');return s;
}
function finish(s,reason){if(s.ended)return;s.ended={reason,day:day(s),time:time(s),family:s.family};note(s,reason==='survived'?'첫 달의 기록':'마지막 기록',reason==='survived'?'서른 번의 밤을 넘겼다. 내일 필요한 물과 식량을 다시 센다.':reason==='water'?'마실 물을 확보하지 못했다.':reason==='food'?'먹을 것을 구하지 못한 채 몸이 버티지 못했다.':'몸의 경고를 넘겨짚었다. 더는 움직일 수 없었다.');}
function advance(s,minutes,{rest=false,sleep=false}={}){
 const oldDay=day(s);const h=minutes/60;
 s.stats.food-=h*(sleep?1.05:1.6);s.stats.water-=h*(sleep?1.2:2.0);
 if(!rest)s.stats.energy-=h*(s.injury?5:3.8);
 if(s.stats.food<0)s.stats.health+=s.stats.food*.6;
 if(s.stats.water<0)s.stats.health+=s.stats.water*1.1;
 if(s.stats.energy<0)s.stats.health+=s.stats.energy*.35;
 if(s.injury&&!rest)s.stats.health-=h*.8;
 for(const k of Object.keys(s.stats))s.stats[k]=clamp(s.stats[k]);
 s.clock+=minutes;s.phone=clamp(s.phone-h*.16);
 if(day(s)!==oldDay){
  for(const [k,name] of [['power','전기'],['water','수도'],['net','통신']])if(oldDay<s.outage[k]&&day(s)>=s.outage[k])note(s,`${name} 중단`,k==='power'?'냉장고 소리가 멈췄다. 이제 충전과 조명을 따로 마련해야 한다.':k==='water'?'수도꼭지에서 더는 물이 나오지 않는다. 남은 식수와 대체 수원을 확인해야 한다.':'새로 고침이 끝나지 않는다. 저장해 둔 자료만 남았다.');
  if(s.upgrades.tank&&weather(s)==='비'){add(s.stash,'raw',4);note(s,'빗물 수집','처리할 물 4개가 모였다. 안전한 식수로 처리하는 과정이 필요하다.');}
 }
 if(s.stats.health<=0)finish(s,s.stats.water===0?'water':s.stats.food===0?'food':'health');
 if(day(s)>30&&!s.ended)finish(s,'survived');
}
function active(s){return !s.ended&&!s.loot&&!s.hazard&&!s.panic;}
function maybePanic(s){if(s.stats.tension>=80&&s.stats.energy<45&&s.panicDay!==day(s)&&random(s)<.45){s.panic=true;s.panicDay=day(s);note(s,'잠시 멈춰야 한다','심장이 빠르게 뛴다. 손을 움직이는 일이 어렵다. 지금은 탐색보다 안전한 위치와 귀환 경로부터 확인하자.');}}
export const returnMinutes=s=>s.location==='home'?0:s.sites[s.location].distance;
export const recipes={window:{name:'창문 보수',desc:'비 오는 밤의 수면 부담을 줄인다.',materials:{tape:2},tool:'hammer',minutes:70},tank:{name:'빗물 수집',desc:'비가 오는 날 처리할 물 4개 확보.',materials:{container:1,rope:1,tape:1},minutes:90},bed:{name:'침구 보강',desc:'수면 후 기력 회복 +12.',materials:{blanket:1,rope:1},minutes:60},pack:{name:'배낭 교체',desc:'운반 한도 8 → 12 kg.',materials:{pack:1},minutes:15}};
export function act(s,type,p={}){
 if(s.ended)return {ok:false,message:'이번 기록은 끝났습니다.'};
 const fail=message=>({ok:false,message});
 if(type==='loot'){
  if(!s.loot||!ITEMS[p.id]||!count(s.loot.items,p.id))return fail('남아 있는 물건이 없습니다.');
  if(weight(s.bag)+ITEMS[p.id].weight>capacity(s)+.001)return fail('배낭이 무겁습니다. 일부 물건을 내려놓으세요.');
  add(s.loot.items,p.id,-1);add(s.bag,p.id);return {ok:true};
 }
 if(type==='closeLoot'){if(!s.loot)return fail('정리할 물자가 없습니다.');const z=s.sites[s.location].spots[s.loot.index];z.loot={...s.loot.items};s.loot=null;note(s,'배낭을 닫았다','남긴 물건은 이 장소에 보관된다. 다시 방문해 챙길 수 있다.');return {ok:true};}
 if(type==='hazard'){
  if(!s.hazard)return fail('진행 중인 사건이 없습니다.');const {index,kind}=s.hazard;const z=s.sites[s.location].spots[index];
  if(p.choice==='leave'){s.hazard=null;note(s,'뒤로 물러섰다','위험을 감수하지 않았다. 이 장소는 나중에 다시 조사할 수 있다.');return {ok:true};}
  if(kind==='locked'&&!has(s,'hammer'))return fail('망치가 필요합니다. 우회하거나 다른 곳을 먼저 살펴보세요.');
  if(p.choice==='safe'){
   advance(s,kind==='noise'?40:30);s.stats.tension=clamp(s.stats.tension+4);
   note(s,'천천히 확인했다',kind==='noise'?'바람에 포장지가 끌리고 있었다. 주변을 확인하고 진입했다.':'길을 정리하고 접근했다. 서두르는 것보다 시간이 걸렸다.');
  }else if(p.choice==='force'){
   advance(s,15);s.stats.tension=clamp(s.stats.tension+18);
   if(random(s)<(has(s,'gloves')?.18:.55)){s.stats.health=clamp(s.stats.health-18);s.injury=Math.min(3,s.injury+1);note(s,'성급한 진입','잔해를 피하지 못해 다쳤다. 다음 탐색 전에 상태를 돌봐야 한다.');}else note(s,'진입','위험한 구간을 통과했다. 다음에도 괜찮을 거라는 보장은 없다.');
  }else return fail('선택을 확인해 주세요.');
  s.hazard=null;z.hazard='none';if(s.stats.health===0)finish(s,'health');if(!s.ended){z.done=true;s.loot={index,items:{...z.loot}};}return {ok:true};
 }
 if(type==='calm'){
  if(!s.panic)return fail('현재 잠시 멈출 필요는 없습니다.');
  s.panic=false;advance(s,25,{rest:true});s.stats.tension=clamp(s.stats.tension-24);note(s,'호흡을 고르며','안전한 자리에 머물며 주변을 다시 확인했다. 오늘의 목표를 줄여도 괜찮다.');return {ok:true};
 }
 if(type==='use'){
  if(!ITEMS[p.id]?.use||!has(s,p.id))return fail('사용할 수 있는 물건이 없습니다.');
  if(p.id==='power'&&s.phone>=95)return fail('휴대전화가 충분히 충전되어 있습니다.');
  if(p.id==='bandage'&&s.injury===0&&s.stats.health>=100)return fail('처치할 부상이 없습니다.');
  consume(s,p.id);if(p.id==='water')s.stats.water=clamp(s.stats.water+38);if(p.id==='food')s.stats.food=clamp(s.stats.food+38);if(p.id==='snack')s.stats.food=clamp(s.stats.food+22);if(p.id==='bandage'){s.stats.health=clamp(s.stats.health+16);s.injury=Math.max(0,s.injury-1);}if(p.id==='power')s.phone=clamp(s.phone+65);
  advance(s,5,{rest:true});note(s,`${ITEMS[p.id].name} 사용`,'상태를 확인하고 다음 행동을 준비했다.');return {ok:true};
 }
 if(type==='transfer'){
  if(!atHome(s)||!ITEMS[p.id])return fail('거점에서만 정리할 수 있습니다.');
  const from=p.direction==='out'?s.stash:s.bag,to=p.direction==='out'?s.bag:s.stash;
  if(!count(from,p.id))return fail('물건이 없습니다.');
  if(to===s.bag&&weight(s.bag)+ITEMS[p.id].weight>capacity(s)+.001)return fail('가방 용량이 부족합니다.');
  add(from,p.id,-1);add(to,p.id);return {ok:true};
 }
 if(type==='drop'){
  if(!ITEMS[p.id]||!count(s.bag,p.id))return fail('물건이 없습니다.');
  if(atHome(s)){add(s.bag,p.id,-1);add(s.stash,p.id);}else{const site=s.sites[s.location];let z=site.spots.find(z=>z.name==='내려놓은 물건');if(!z){z={name:'내려놓은 물건',loot:{},hazard:'none',observed:true,done:true};site.spots.push(z);}add(z.loot,p.id);add(s.bag,p.id,-1);}return {ok:true};
 }
 if(!active(s))return fail('먼저 진행 중인 사건이나 물자 정리를 마쳐 주세요.');
 if(type==='travel'){
  if(!SITES[p.id]||p.id===s.location)return fail('이동할 장소를 선택해 주세요.');
  const mins=(s.location==='home'?0:returnMinutes(s))+(p.id==='home'?0:s.sites[p.id].distance);
  if(dark(s)){if(has(s,'light')&&has(s,'battery'))consume(s,'battery');else{s.stats.tension=clamp(s.stats.tension+12);advance(s,20);}}
  advance(s,mins);if(s.ended)return {ok:true};s.location=p.id;
  if(p.id!=='home'){s.sites[p.id].visited=true;s.stats.tension=clamp(s.stats.tension+(s.downloaded?3:6));note(s,SITES[p.id].name,`${s.sites[p.id].route}을 지나 도착했다. 돌아갈 시간과 몸 상태를 확인하자.`);
   if(p.id==='family'&&!s.family){s.family=true;s.stats.tension=clamp(s.stats.tension+15);note(s,'가족의 집','현관에는 익숙한 신발이 있었다. 식탁 옆에는 옷만 남았다. 냉장고에 붙은 장보기 메모를 접어 주머니에 넣었다. 이제 어디로 가야 할지 모르겠지만, 오늘 밤을 보낼 곳은 정해야 한다.');}
  }else{note(s,'귀환','문을 닫았다. 가져온 물건은 가방에 있다. 보관함에 옮기고 몸을 돌보자.');s.stats.tension=clamp(s.stats.tension-12);}maybePanic(s);return {ok:true};
 }
 if(type==='observe'||type==='search'){
  if(atHome(s))return fail('먼저 탐색 장소로 이동하세요.');const z=s.sites[s.location].spots[p.index];if(!z)return fail('조사할 위치를 확인해 주세요.');
  if(type==='observe'){if(z.observed)return fail('이미 주변을 확인했습니다.');advance(s,10);z.observed=true;note(s,z.name,z.hazard==='glass'?'깨진 유리와 기울어진 선반이 보인다. 정리할 시간이 필요하다.':z.hazard==='noise'?'일정한 간격으로 포장지가 끌린다. 문틈으로 바람이 드나든다.':z.hazard==='locked'?'걸쇠가 찌그러져 있다. 망치가 있으면 시간을 들여 열 수 있다.':'입구와 바닥에서 특별한 위험은 보이지 않는다.');return {ok:true};}
  if(z.done){if(!Object.values(z.loot).some(n=>n>0))return fail('남아 있는 물건이 없습니다.');s.loot={index:p.index,items:{...z.loot}};return {ok:true};}
  if((s.location==='flats'||dark(s))&&!utility(s,'power')){if(has(s,'light')&&has(s,'battery'))consume(s,'battery');else{s.stats.tension=clamp(s.stats.tension+12);advance(s,15);}}
  advance(s,30);if(s.ended)return {ok:true};
  if(z.hazard!=='none'){s.hazard={index:p.index,kind:z.hazard};note(s,'진입 전 판단',z.hazard==='locked'?'문이 열리지 않는다. 장비를 쓰거나 돌아설 수 있다.':z.hazard==='noise'?'문 안쪽에서 소리가 들린다. 확인하며 들어갈지, 서두를지 결정해야 한다.':'깨진 물건이 길을 막고 있다. 정리하거나 위험을 감수할 수 있다.');return {ok:true};}
  z.done=true;s.loot={index:p.index,items:{...z.loot}};note(s,z.name,'물건을 찾았다. 필요한 만큼만 챙기자.');return {ok:true};
 }
 if(!atHome(s))return fail('거점으로 돌아와야 할 수 있는 일입니다.');
 if(type==='unload'){for(const [id,q]of Object.entries(s.bag))add(s.stash,id,q);s.bag={};note(s,'물자 보관','가방의 물건을 보관함으로 옮겼다. 외출 전에 도구와 식수를 다시 챙기자.');return {ok:true};}
 if(type==='fill'){if(!utility(s,'water'))return fail('수도 공급이 중단되었습니다.');advance(s,20);add(s.stash,'water',3);note(s,'물 비축','식수 3개를 보관했다. 급수 중단 이후에는 비축과 대체 수원이 필요하다.');return {ok:true};}
 if(type==='boil'){
  if(!has(s,'pot')||!has(s,'raw')||!has(s,'fuel'))return fail('냄비, 처리할 물, 고체연료가 필요합니다.');
  const n=Math.min(3,count(s.bag,'raw')+count(s.stash,'raw'));consume(s,'raw',n);consume(s,'fuel');advance(s,45);add(s.stash,'water',n);note(s,'식수 준비',`게임 내 처리 가능한 빗물 ${n}개를 식수로 준비했다. 실제 오염수의 안전성을 뜻하는 규칙은 아니다.`);return {ok:true};
 }
 if(type==='craft'){
  const r=recipes[p.id];if(!r||s.upgrades[p.id])return fail('이미 갖추었거나 만들 수 없는 시설입니다.');
  if(r.tool&&!has(s,r.tool)||Object.entries(r.materials).some(([id,n])=>count(s.bag,id)+count(s.stash,id)<n))return fail('필요한 공구나 자재가 부족합니다.');
  for(const[id,n]of Object.entries(r.materials))consume(s,id,n);advance(s,r.minutes);s.upgrades[p.id]=true;note(s,r.name,'조금 더 오래 머물 수 있는 집이 되었다.');return {ok:true};
 }
 if(type==='download'){if(s.downloaded)return fail('이미 자료를 저장했습니다.');if(!utility(s,'net')||s.phone<10)return fail('통신 연결이나 휴대전화 전원이 부족합니다.');advance(s,20);s.phone-=5;s.downloaded=true;note(s,'오프라인 자료','동네 지도와 준비 목록을 저장했다. 이후 새로운 장소에서 긴장 부담을 조금 줄일 수 있다.');s.stats.tension=clamp(s.stats.tension-8);return {ok:true};}
 if(type==='charge'){if(!utility(s,'power'))return fail('전기가 끊겼습니다. 보조배터리를 확인하세요.');advance(s,45,{rest:true});s.phone=100;note(s,'휴대전화 충전','화면은 켜진다. 답장은 없다.');return {ok:true};}
 if(type==='rest'){advance(s,60,{rest:true});s.stats.energy=clamp(s.stats.energy+16);s.stats.tension=clamp(s.stats.tension-15);note(s,'잠깐의 휴식','창가에 앉아 오늘 할 일을 줄였다. 모든 곳에 오늘 갈 필요는 없다.');return {ok:true};}
 if(type==='journal'){advance(s,30,{rest:true});s.stats.tension=clamp(s.stats.tension-18);note(s,'오늘의 기록',pick(s,['누군가 읽어주지 않아도 오늘 있었던 일을 적었다.','잘한 일을 하나 적었다. 무리하지 않고 돌아온 것.','휴대전화에 내 목소리를 남겼다. 오늘도 살아 있다는 기록.']));return {ok:true};}
 if(type==='sleep'){
  if(hour(s)<18&&hour(s)>=6)return fail('긴 잠은 18시 이후에 잘 수 있습니다. 지금은 짧게 쉬어보세요.');
  let mins=(1440+8*60-s.clock%1440)%1440;if(mins===0)mins=1440;
  const comfort=(s.upgrades.bed?12:0)+(has(s,'blanket')?6:0)-(weather(s)==='비'&&!s.upgrades.window?16:0)-(s.stats.tension>65?12:0);
  advance(s,mins,{rest:true,sleep:true});s.stats.energy=clamp(s.stats.energy+48+comfort);s.stats.tension=clamp(s.stats.tension-14);if(s.stats.food>20&&s.stats.water>20)s.stats.health=clamp(s.stats.health+7);s.sleepCount++;
  if(!s.ended)note(s,'새로운 아침',`${weather(s)}. ${weather(s)==='비'&&!s.upgrades.window?'창문 틈의 빗소리에 잠을 설쳤다.':'문은 잠겨 있고, 나는 아직 여기 있다.'}`);return {ok:true};
 }
 return fail('아직 할 수 없는 행동입니다.');
}
export function validateSave(s){
 if(!s||s.schema!==1||!Number.isInteger(s.seed)||!Number.isInteger(s.rng)||!Number.isFinite(s.clock)||s.clock<0||s.clock>50000||!SITES[s.location])throw Error('호환되지 않는 저장 파일입니다.');
 for(const k of ['health','food','water','energy','tension'])if(!Number.isFinite(s.stats?.[k])||s.stats[k]<0||s.stats[k]>100)throw Error('상태 데이터가 올바르지 않습니다.');
 const inv=i=>{if(!i||typeof i!=='object'||Array.isArray(i))throw Error('물자 데이터 오류');for(const[k,v]of Object.entries(i))if(!ITEMS[k]||!Number.isInteger(v)||v<0||v>10000)throw Error('물자 데이터 오류');};inv(s.bag);inv(s.stash);
 for(const id of Object.keys(labels)){const site=s.sites?.[id];if(!site||!Array.isArray(site.spots)||site.spots.length>30||!Number.isFinite(site.distance)||site.distance<1||site.distance>300)throw Error('장소 데이터 오류');for(const z of site.spots){if(typeof z.name!=='string'||!['none','glass','noise','locked'].includes(z.hazard))throw Error('장소 상태 오류');inv(z.loot);}}
 if(!Array.isArray(s.log)||s.log.length>100||!Array.isArray(s.weather)||s.weather.length<31||s.weather.some(w=>!['맑음','흐림','비'].includes(w)))throw Error('기록 데이터 오류');
 if(!s.upgrades||Object.keys(recipes).some(k=>typeof s.upgrades[k]!=='boolean')||!s.outage||['power','water','net'].some(k=>!Number.isFinite(s.outage[k])||s.outage[k]<1||s.outage[k]>30))throw Error('시설 데이터 오류');
 if(!Number.isFinite(s.phone)||!Number.isFinite(s.injury)||typeof s.panic!=='boolean')throw Error('상태 데이터 오류');
 if(s.loot){if(s.location==='home'||!Number.isInteger(s.loot.index)||!s.sites[s.location].spots[s.loot.index])throw Error('탐색 데이터 오류');inv(s.loot.items);}
 if(s.hazard&&(s.location==='home'||!s.sites[s.location].spots[s.hazard.index]||!['glass','noise','locked'].includes(s.hazard.kind)))throw Error('사건 데이터 오류');
 return s;
}
