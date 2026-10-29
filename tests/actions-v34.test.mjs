import test from 'node:test';
import assert from 'node:assert/strict';
import {create,action} from '../v2/journey.js';
import {beginAnimal,chooseAnimal,wildlifeView} from '../v2/wildlife.js';
import {searchContext,planWork,workArt,workDuration,progressView,refreshWork} from '../v2/work-progress.js';
const make=()=>{const s=create(18);s.scene='market';s.location='market';s.away=true;s.time=720;s.incidents=[];return s;};
test('search art follows actual place and task rather than a shared box',()=>{
 for(const [location,profile,expected] of [['market','supply','retail'],['neighbor','home','drawer'],['road1_workshop','workshop','tools'],['road1_lodging','lodging','drawer'],['pharmacy','medical','medical']]){
  const s=make();s.location=location;s.worldSites??={};s.worldSites[location]={profile};
  assert.equal(searchContext(s,'careful','shelf'),expected);
 }
 assert.equal(searchContext(make(),'route-map','observe'),'observe');
 assert.equal(searchContext(make(),'force','rubble'),'rubble');
 assert.equal(searchContext({...make(),location:'park_car'},'tool','drawer'),'vehicle');
});
test('presentation is brief without changing simulated time or committing early',()=>{
 const s=make(),time=s.time;
 const j=planWork(s,'careful',after=>{after.time+=30;return true;});
 assert.equal(j.duration,2000);assert.equal(j.minutes,30);assert.equal(j.after.time,time+30);assert.equal(s.time,time);
 assert.equal(workDuration('sleep'),1500);assert.equal(workDuration('drink'),1500);assert.equal(workDuration('read'),2800);assert.equal(workDuration('repair'),2600);
 assert.match(workArt(j),/actor-retail-v34/);assert.doesNotMatch(progressView(j),/aria-modal="true"|work-fast/);
});
test('cat and birds can be passed safely and looting remains available',()=>{
 for(const kind of ['cat','crow','pigeon']){
  const s=make(),hp=s.health,bag=s.bag.durability;beginAnimal(s,kind);
  assert.doesNotMatch(wildlifeView(s,a=>a),/wildlife-defend/);
  assert.equal(action(s,'wildlife-pass'),true);assert.equal(s.scene,'market');assert.equal(s.health,hp);assert.equal(s.bag.durability,bag);
  assert.equal(action(s,'careful'),true);
 }
});
test('all animals have a non-combat continuation to the actual destination',()=>{
 for(const kind of ['cat','crow','pigeon','deer','dog','boar','snake','raccoon']){
  const s=make();beginAnimal(s,kind);assert.equal(action(s,'wildlife-pass'),true);assert.equal(s.scene,'market');assert.equal(s.location,'market');assert.equal(s.wildlifeActive,'');
 }
});
test('encounter cooldown persists on save and cannot repeat at every location',()=>{
 const s=make();beginAnimal(s,'cat');const saved=JSON.parse(JSON.stringify(s));saved.location='park';
 assert.equal(chooseAnimal(saved,()=>.1),'');saved.time+=400;beginAnimal(saved,'crow');
 saved.time+=400;saved.location='hardware';assert.equal(chooseAnimal(saved,()=>.1),'');
 saved.day++;saved.location='market';assert.equal(chooseAnimal(saved,()=>.1),'');
});
test('leaving a pet encounter preserves it for optional revisit without spending supplies',()=>{
 const s=make();s.scene='pet-event';s.petEncounter={kind:'cat',trust:1,day:s.day,location:'market'};
 assert.equal(action(s,'pet-leave'),true);assert.equal(s.scene,'market');assert.ok(s.petTrails.market);
 assert.equal(action(s,'pet-revisit'),true);assert.equal(s.scene,'pet-event');assert.equal(s.petEncounter.trust,1);
});

test('saved long work adopts shorter presentation without losing progress or granting rewards',()=>{const job={version:1,kind:'read',duration:7000,elapsed:3500,after:{value:1}};refreshWork(job);assert.equal(job.duration,2800);assert.equal(job.elapsed,1400);assert.deepEqual(job.after,{value:1});refreshWork(job);assert.equal(job.elapsed,1400);});

test('stationary actions freeze their illustration while travel retains its animation',()=>{for(const kind of ['eat','drink','sleep','sew','repair','read','shelf','wait']){const html=progressView({kind,title:'작업',elapsed:0,duration:2000,minutes:20,startedTime:720});assert.match(html,/<canvas/);assert.match(html,/hidden style="display:none!important"/);}for(const kind of ['walk','bike','stairs']){assert.doesNotMatch(progressView({kind,title:'이동',elapsed:0,duration:2000,minutes:20,startedTime:720}),/<canvas/);}});
