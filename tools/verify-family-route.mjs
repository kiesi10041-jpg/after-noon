// Scenario begins at Yeongjong station at 08:00, after local preparation.
// Two waters and two random foods are packed from the actual starting stock.
// Walking only, no roadside loot granted, cautious animal/obstacle choices.
import {create,migrate,action,pack,consumeCarry,isNight,pantryFoods} from '../v2/journey.js';
import {backbone} from '../v2/overland.js';
import {initExpedition} from '../v2/expedition.js';
export function verifyFamilyRoute(seed,{depleted=false,reload=false}={}){let s=create(seed);s.scene='home';s.hunger=75;s.thirst=75;for(let n=0;n<2;n++)pack(s,'water',1);for(let n=0;n<2;n++){const id=Object.keys(pantryFoods).find(id=>s.stock[id]>0);if(id)pack(s,id,1);}pack(s,'battery',1);pack(s,'cloth',1);s.away=true;s.scene=s.location='station';s.questStage=2;s.time=480;s.equipment.flashlight=true;if(depleted){s.hunger=15;s.thirst=15;s.carry={};s.carryDates={};}let steps=0,rests=0,sleeps=0,panics=0,blocked='',actions={};
const act=a=>{actions[a]=(actions[a]||0)+1;const ok=action(s,a);if(!ok)blocked=s.text;return ok;};
while(!s.ended&&s.location!=='family'&&steps++<400){
 if(reload)s=migrate(JSON.parse(JSON.stringify(s)));
 if(s.panicActive){panics++;act('panic-ground');continue;}
 if(s.thirst<45&&((s.carry.water||0)>0||s.settlement?.water?.bag>=500)){consumeCarry(s,'water');continue;}
 if(s.hunger<45){const id=Object.keys(pantryFoods).find(id=>s.carry[id]>0);if(id){consumeCarry(s,id);continue;}}
 if(s.stress>60&&!s.panicActive&&act('calm'))continue;
 if(isNight(s)){s.lightOn=true;if(s.battery<12&&s.carry.battery){act('battery');continue;}}else s.lightOn=false;
 if(s.roadTrip){const t=s.roadTrip;if(t.stage==='obstacle'){act('road-detour');continue;}const needed=t.effort[t.index];if(s.ap<needed){rests++;act('road-rest');continue;}if(!act('road-step'))break;continue;}
 if(s.scene==='wildlife'){if(!act('wildlife-pass'))break;continue;}if(s.scene==='pet-event'){act('pet-leave');continue;}if(s.scene==='incident'){if(!act(s.incidentActive?.kind==='fire'?'incident-retreat':'incident-detour'))break;continue;}if(s.scene==='rat-choice'){blocked='rat decision';break;}
 initExpedition(s);if(s.expedition.shelters[s.location]&&(s.time>=1140||s.time<360)){sleeps++;if(!act('shelter-sleep-morning'))break;continue;}
 const target=backbone[backbone.indexOf(s.location)+1];if(!target){blocked='no next hub';break;}s.tripPlan={target,vehicle:'walk',departure:'now'};
 if(!s.discovery.maps[s.location]){if(!act('route-map'))break;continue;}
 const key=[s.location,target].sort().join('|');if(!s.discovery.surveyed[key]){if(s.ap<1){rests++;act('field-rest');continue;}if(!act('route-survey'))break;continue;}
 if(s.ap<1){s.scene=s.location;rests++;if(!act('field-rest'))break;continue;}s.scene='door';if(!act('depart'))break;
}
return {seed,arrived:s.location==='family',ended:s.ended,day:s.day,time:s.time,health:Math.round(s.health),hunger:s.hunger,thirst:s.thirst,stress:s.stress,cold:s.cold,steps,rests,sleeps,panics,location:s.location,blocked,actions};}

if(process.argv[1]?.endsWith('verify-family-route.mjs')){const groups={};for(const [name,options]of Object.entries({prepared:{},reload:{reload:true},depleted:{depleted:true}})){const rows=Array.from({length:60},(_,i)=>verifyFamilyRoute(i+1,options));groups[name]={count:rows.length,arrivals:rows.filter(r=>r.arrived).length,deaths:rows.filter(r=>r.ended).length,failed:rows.filter(r=>!r.arrived),dayRange:[Math.min(...rows.map(r=>r.day)),Math.max(...rows.map(r=>r.day))],healthRange:[Math.min(...rows.map(r=>r.health)),Math.max(...rows.map(r=>r.health))]};}console.log(JSON.stringify(groups,null,2));}
