import {create as baseCreate,items,pantryFoods,eatPantry,rand,season,capacity} from './rules.js';
export {items,pantryFoods,season,capacity};
items.flashlight=['손전등',1,.2];items.battery=['건전지 한 쌍',1,.1];
export const places={neighbor:{name:'이웃집',minutes:5,cost:1},store:{name:'편의점',minutes:20,cost:2},hardware:{name:'생활용품점',minutes:30,cost:2}};
export const MAX_AP=12;
export function create(seed){const s=baseCreate(seed);Object.assign(s,{rulesVersion:5,ap:12,time:720,carry:{},carryFood:[],away:false,lightOn:false,battery:80,packLimit:null});s.stock.flashlight=1;s.stock.battery=1;return s;}
export function migrate(s){if(s.rulesVersion!==5){s.ap=Math.min(12,Math.max(0,s.ap*4));s.time=750;s.rulesVersion=5;s.carry={};s.carryFood=[];s.away=['store','hardware','neighbor','loot'].includes(s.scene);s.location=s.scene==='loot'?s.source:s.scene;s.stock.flashlight??=1;s.stock.battery??=1;s.battery=80;s.lightOn=false;s.packLimit=null;}s.carry??={};s.carryFood??=[];return s;}
export function clock(s){return `${String(Math.floor(s.time/60)).padStart(2,'0')}:${String(s.time%60).padStart(2,'0')}`;}
export const sunset=s=>({봄:1140,여름:1200,가을:1080,겨울:1020})[season(s)];
export const isNight=s=>s.time<360||s.time>=sunset(s);
export const phase=s=>isNight(s)?'밤':s.time>=sunset(s)-60?'해질녘':s.time<660?'아침':'낮';
export const powered=s=>s.day<s.power;
export function load(s){return Object.entries(s.carry).reduce((n,[id,q])=>n+(items[id]?.[1]||0)*q,s.carryFood.length);}
export function mass(s){return Object.entries(s.carry).reduce((n,[id,q])=>n+(items[id]?.[2]||0)*q,s.carryFood.length*.3);}
export const lit=s=>s.lightOn&&s.carry.flashlight>0&&s.battery>0;
export const dark=s=>isNight(s)&&!lit(s)&&(!powered(s)||s.location==='neighbor');
export function returnCost(s){if(!s.away)return {ap:0,minutes:0};const p=places[s.location]||places.neighbor;return {ap:p.cost+(mass(s)>4?1:0)+(dark(s)?1:0),minutes:p.minutes+(mass(s)>4?10:0)+(dark(s)?15:0)};}
export function searchCost(s,mode='careful'){return {ap:(mode==='careful'?1:2)+(dark(s)?1:0),minutes:(mode==='careful'?30:50)+(dark(s)?20:0)};}
function finish(s){s.health=Math.max(0,Math.min(100,s.health));s.stress=Math.max(0,Math.min(100,s.stress));s.ended=s.health<=0;return true;}
function advance(s,minutes){for(let n=0;n<minutes;n++){s.time++;if(s.lightOn&&s.away&&n%10===0){s.battery=Math.max(0,s.battery-1);if(!s.battery)s.lightOn=false;}if(s.time%60===0){s.hunger=Math.max(0,s.hunger-1);s.thirst=Math.max(0,s.thirst-(season(s)==='여름'?2:1.5));if(s.hunger===0)s.health-=2;if(s.thirst===0)s.health-=3;}if(s.time>=1440){s.time=0;s.day++;if(s.day===s.power)s.food.forEach(f=>f.expires=Math.min(f.expires,s.day+1));if(s.garden){if(s.stock.water)s.stock.water--;else s.garden++;if(s.day>=s.garden){s.food.push({expires:s.day+3},{expires:s.day+3});s.garden=0;}}if(season(s)==='겨울'&&s.insulation<2){if(s.stock.fuel)s.stock.fuel--;else s.health-=8;}}}finish(s);}
function pay(s,cost){if(s.ap<cost.ap){s.text=`기력이 부족하다. 필요한 기력 ${cost.ap}, 남은 기력 ${s.ap}. 잠시 쉬거나 돌아갈 방법을 정해야 한다.`;return false;}s.ap-=cost.ap;advance(s,cost.minutes);return !s.ended;}
export function pack(s,id,delta){if(s.away||!items[id])return false;if(delta>0){if(!s.stock[id]||load(s)+items[id][1]>capacity(s)||mass(s)+items[id][2]>8)return false;s.stock[id]--;s.carry[id]=(s.carry[id]||0)+1;}else{if(!s.carry[id])return false;s.carry[id]--;s.stock[id]=(s.stock[id]||0)+1;}return true;}
export function consumeCarry(s,id){if(id==='water'&&s.carry.water){s.carry.water--;s.thirst=Math.min(100,s.thirst+40);return true;}if(id==='fresh'){const i=s.carryFood.findIndex(f=>f.expires>s.day);if(i<0)return false;s.carryFood.splice(i,1);s.hunger=Math.min(100,s.hunger+35);return true;}if(!pantryFoods[id]||!s.carry[id])return false;s.carry[id]--;return consumeApplied(s,id);}
function consumeApplied(s,id){s.hunger=Math.min(100,s.hunger+pantryFoods[id].gain);s.thirst=Math.max(0,s.thirst+(pantryFoods[id].thirst||0));return true;}
function unload(s){for(const [id,q] of Object.entries(s.carry))s.stock[id]=(s.stock[id]||0)+q;s.food.push(...s.carryFood);s.carry={};s.carryFood=[];s.lightOn=false;s.packLimit=null;}
function supplies(s,location){s.worldLoot??={};if(!s.worldLoot[location]){const q=location==='hardware'?{cloth:2,tool:1,battery:2,blanket:1,fuel:1,seed:1}:{water:2,cloth:1};if(location!=='hardware'){for(let i=0;i<5;i++){const id=Object.keys(pantryFoods)[Math.floor(rand(s)*5)];q[id]=(q[id]||0)+1;}if(s.day<s.power+1)q.fresh=location==='neighbor'?1:2;}s.worldLoot[location]=q;}if(s.day>=s.power+1)delete s.worldLoot[location].fresh;return s.worldLoot[location];}
export function take(s,id){if(!s.away||s.scene!=='loot'||!s.loot?.[id])return false;const cap=Math.min(capacity(s),s.packLimit??capacity(s));if(load(s)+items[id][1]>cap||mass(s)+items[id][2]>8){s.text='가방에 넣을 자리가 없다. 가방을 열어 짐을 확인하자.';return false;}s.loot[id]--;s.worldLoot[s.location][id]--;if(id==='fresh')s.carryFood.push({expires:s.day+(season(s)==='여름'?1:2)});else s.carry[id]=(s.carry[id]||0)+1;return true;}
export function drop(s,id){if(!s.away)return false;if(id==='fresh'){if(!s.carryFood.length)return false;s.carryFood.pop();}else{if(!s.carry[id])return false;s.carry[id]--;}const q=supplies(s,s.location);q[id]=(q[id]||0)+1;if(s.scene==='loot')s.loot={...q};return true;}
export function action(s,a){if(s.ended)return false;
const intro={look:['threshold',5,'복도에 옷과 슬리퍼가 흩어져 있다. 열린 문 안으로 불러 봐도 대답이 없다. 아래층에서는 경적이 이어진다.'],outside:['street',10,'차 두 대가 부딪힌 채 멈춰 있다. 횡단보도에는 옷과 가방만 남았다. 가족이 있는 집에 전화를 걸어 본다.'],phone:['phone',5,'신호음은 간다. 아무도 받지 않는다. 다시 걸어도 마찬가지다.'],begin:['home',10,'현관을 잠갔다. 수도와 전기는 아직 들어온다. 주방에서 먹을 것을 확인하고, 밖에 가져갈 가방을 챙겨야겠다.']};
if(intro[a]){const [scene,t,text]=intro[a];s.scene=scene;s.text=text;advance(s,t);return true;}
if(a==='out'&&!s.away){s.scene='door';s.text='이웃집 문이 열려 있다. 계단 아래로 내려가면 동네 상점들이 있다.';return true;}
if(a==='back'&&!s.away){s.scene='home';s.text='익숙한 방 안에 발소리만 울린다.';return true;}
if(places[a]&&!s.away&&s.scene==='door'){const p=places[a];if(!pay(s,{ap:p.cost,minutes:p.minutes}))return false;s.away=true;s.location=a;s.source=a;s.scene=a;s.packLimit=null;s.visits[a]=(s.visits[a]||0)+1;s.text=a==='neighbor'?'현관 장바구니가 쓰러져 있다. 안쪽 주방은 조용하다.':a==='store'?'입구에 유리 조각이 흩어져 있다. 뒤쪽 진열대는 쓰러진 선반에 가려져 있다.':'상자 사이로 좁은 통로가 남아 있다. 안쪽에는 공구와 생활용품이 보인다.';return true;}
if(['careful','tool','force'].includes(a)&&s.away&&places[s.scene]){if(a==='tool'&&!s.carry.tool){s.text='공구를 집에 두고 왔다. 다른 곳을 살펴야 한다.';return false;}if(!pay(s,searchCost(s,a)))return false;if(a==='force'){s.bag.durability=Math.max(0,s.bag.durability-20);if(rand(s)<(dark(s)?.55:.3))s.health-=12;s.stress+=10;}s.packLimit=a==='careful'?Math.max(load(s),capacity(s)-1):capacity(s);s.loot={...supplies(s,s.location)};s.scene='loot';s.text=Object.values(s.loot).some(q=>q>0)?'꺼낸 물건들을 살펴본다. 가져갈 물건을 눌러 가방에 넣는다.':'전에 챙긴 자리만 비어 있다. 쓸 만한 물건이 남지 않았다.';return finish(s);}
if(a==='return'){if(!s.away){s.scene='home';s.text='문을 닫고 방으로 돌아왔다.';return true;}const c=returnCost(s);if(s.ap<c.ap){s.scene='return-choice';s.text=`집까지 기력 ${c.ap}이 필요하지만 ${s.ap}만 남았다. 무리해서 돌아가면 건강이 ${Math.min(30,(c.ap-s.ap)*5)} 줄어든다.`;return true;}pay(s,c);unload(s);s.away=false;s.location=null;s.scene='home';s.loot=null;s.text='현관을 잠그고 가방을 내려놓았다. 가져온 물자를 집 안에 정리했다.';return finish(s);}
if(a==='force-return'&&s.away&&s.scene==='return-choice'){const c=returnCost(s);s.health-=Math.min(30,Math.max(0,c.ap-s.ap)*5);s.ap=0;s.stress+=12;advance(s,c.minutes*2);unload(s);s.away=false;s.location=null;s.scene='home';s.loot=null;s.text='벽을 짚어 가며 겨우 돌아왔다. 짐을 내려놓자 다리가 풀렸다.';return finish(s);}
if(a==='camp'&&s.away&&s.scene==='return-choice'){advance(s,360);s.ap=Math.min(12,s.ap+5);s.health-=8;s.stress+=15;s.scene=s.location;s.text='문을 막고 구석에서 여섯 시간을 보냈다. 몸이 뻐근하지만 돌아갈 기력은 조금 생겼다.';return finish(s);}
if(a==='light'){if(!s.carry.flashlight){s.text='가방에 손전등이 없다.';return false;}if(!s.battery){s.text='건전지가 다 됐다. 가방에서 교체해야 한다.';return false;}s.lightOn=!s.lightOn;return true;}
if(a==='battery'){if(!s.carry.battery||!s.carry.flashlight)return false;s.carry.battery--;s.battery=100;return true;}
if(s.away)return false;
if(a==='rest'){advance(s,60);s.ap=Math.min(12,s.ap+3);s.stress=Math.max(0,s.stress-12);s.text='한 시간 동안 등을 기대고 쉬었다. 바깥 소리에 귀를 기울였다.';return true;}
if(a==='wait'){advance(s,120);s.text='창가에 앉아 두 시간을 보냈다. 거리의 빛이 조금 달라졌다.';return true;}
if(a==='sleep'){advance(s,480);s.ap=s.hunger>10&&s.thirst>10?12:8;s.stress=Math.max(0,s.stress-20);s.scene='home';s.text='여덟 시간 뒤 눈을 떴다. '+(powered(s)?'냉장고의 낮은 소리가 들린다.':'집 안의 전기 소리가 모두 멎어 있다.');return finish(s);}
const costs={fill:{ap:1,minutes:20},repair:{ap:2,minutes:40},expand:{ap:3,minutes:60},insulate:{ap:2,minutes:45},plant:{ap:2,minutes:40}};
if(!costs[a])return false;
if(a==='fill'&&s.day>=s.water){s.text='수도꼭지를 돌렸지만 물이 나오지 않는다.';return false;}
if(a==='repair'&&!s.stock.cloth||a==='expand'&&(!s.stock.cloth||!s.stock.tool||s.bag.slots>=10)||a==='insulate'&&!s.stock.blanket||a==='plant'&&(!s.stock.seed||season(s)==='겨울')){s.text='필요한 재료나 작업 조건을 확인해야 한다.';return false;}
if(!pay(s,costs[a]))return false;
if(a==='fill'){s.stock.water=(s.stock.water||0)+3;s.text='물을 세 병 받아 두었다.';}
if(a==='repair'){s.stock.cloth--;s.bag.durability=Math.min(100,s.bag.durability+45);s.text='헤진 어깨끈을 꿰맸다.';}
if(a==='expand'){s.stock.cloth--;s.bag.slots+=2;s.text='가방에 주머니 두 칸을 덧댔다.';}
if(a==='insulate'){s.stock.blanket--;s.insulation++;s.text='창가 틈과 잠자리를 보강했다.';}
if(a==='plant'){s.stock.seed--;s.garden=s.day+8;s.text='화분에 씨앗을 심었다. 하루에 물 한 병이 필요하다.';}
return finish(s);}
