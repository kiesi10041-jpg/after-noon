import test from 'node:test';
import assert from 'node:assert/strict';
import {planWork,workArt,advanceWork,progressView} from '../v2/work-progress.js';
const execute=(s)=>{s.time+=50;return true;};
test('legacy fast preference never shortens the next action',()=>{
 const s={day:1,time:720,ap:8,fastWork:true};
 const first=planWork(s,'learn:mechanics',execute,{fast:true});
 assert.ok(first.duration===2800);assert.equal(first.fastRequested,undefined);
 first.fastRequested=true;assert.equal(advanceWork(first,100),false);assert.equal(first.elapsed,100);
 const next=planWork(s,'careful',execute);assert.equal(next.fastRequested,undefined);assert.ok(next.duration===2000);
});
test('progress pauses while hidden, clamps stale timer jumps, and never exceeds completion',()=>{
 const j={duration:4000,elapsed:0};advanceWork(j,100,false);assert.equal(j.elapsed,0);
 advanceWork(j,50000);assert.equal(j.elapsed,100);
 j.elapsed=3990;assert.equal(advanceWork(j,100),true);assert.equal(j.elapsed,4000);
});
test('reading, searching and consuming show action illustrations instead of stick figure overlays',()=>{
 for(const kind of ['read','shelf','eat','drink']){
  const job={kind,title:'진행 중',elapsed:0,duration:4000,minutes:30,startedTime:720};
  assert.match(workArt(job),/actor-/);const html=progressView(job);assert.match(html,/<img class="work-action-art"/);assert.doesNotMatch(html,/<svg/);
 }
 assert.notEqual(workArt({kind:'eat'}),workArt({kind:'drink'}));
});
