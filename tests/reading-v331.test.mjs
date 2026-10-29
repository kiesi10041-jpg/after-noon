import test from 'node:test';
import assert from 'node:assert/strict';
import {create,action,advance} from '../v2/journey.js';
import {planWork,cancelWorkState,completeWorkState} from '../v2/work-progress.js';
import {growthView} from '../v2/growth.js';
const home=()=>{const s=create(42);s.scene='home';s.away=false;s.stock.bookMechanics=1;s.time=720;return s;};
test('book completion commits only at the end, cancellation never grants knowledge',()=>{
 const s=home();s.pendingWork=planWork(s,'learn:bookMechanics',action);
 assert.ok(s.pendingWork);assert.equal(s.growth.reading.bookMechanics,undefined);assert.equal(s.growth.skills.mechanics.theory,false);
 s.pendingWork.elapsed=s.pendingWork.duration*.7;cancelWorkState(s,advance);
 assert.equal(s.growth.reading.bookMechanics,undefined);assert.equal(s.growth.skills.mechanics.theory,false);
 s.pendingWork=planWork(s,'learn:bookMechanics',action);const done=completeWorkState(s);
 assert.equal(done.growth.reading.bookMechanics,1);assert.equal(done.growth.skills.mechanics.theory,true);
 const time=done.time,xp=done.growth.statXP.intelligence;
 for(let i=0;i<3;i++){assert.equal(planWork(done,'learn:bookMechanics',action),null);assert.equal(planWork(done,'reference:bookMechanics',action),null);}
 assert.equal(done.time,time);assert.equal(done.growth.statXP.intelligence,xp);
});
test('completed books have no active re-reading control',()=>{
 const s=home();action(s,'learn:bookMechanics');
 const html=growthView(s,(a,n,h,d)=>`<button data-a="${a}" ${d?'disabled':''}>${n} ${h}</button>`,'skills');
 assert.match(html,/data-a="reference:bookMechanics" disabled/);assert.doesNotMatch(html,/참고 가능/);
});
