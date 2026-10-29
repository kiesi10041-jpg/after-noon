import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {create,action} from '../v2/journey.js';
import {siteLife,settlementView} from '../v2/settlement.js';
import {workArt,progressView} from '../v2/work-progress.js';
const game=readFileSync(new URL('../v2/game.js',import.meta.url),'utf8');
test('actual garden-select click handler keeps life popup and changes selected pot at no cost',async()=>{
 const s=create(21);s.scene='home';const life=siteLife(s);life.pots=[{crop:'lettuce',progress:0,moisture:45,health:100},{crop:'tomato',progress:0,moisture:45,health:100}];const before=[s.day,s.time,s.ap];let saved=0,rendered=0;
 const context={s,action,panel:'life',beamDragged:false,URLSearchParams,location:{search:''},save:()=>saved++,render:()=>rendered++};
 const source=game.slice(game.indexOf('async function handleClick(e)'),game.indexOf('\nlet workTimer='));
 const handler=vm.runInNewContext(source+';handleClick',context);
 await handler({target:{closest:()=>({dataset:{a:'garden-select'},disabled:false})}});
 assert.equal(context.panel,'life');assert.equal(s.lifeTab,'garden');assert.equal(life.selected,1);assert.equal(saved,1);assert.equal(rendered,1);assert.deepEqual([s.day,s.time,s.ap],before);assert.match(settlementView(s,()=>''),/방울토마토 성장 모습/);
 await handler({target:{closest:()=>({dataset:{a:'garden-select'},disabled:false})}});assert.equal(life.selected,0);assert.equal(context.panel,'life');
});
test('every supported action references a multi-frame asset and keeps it visible',()=>{
 for(const kind of ['wait','walk','run','stairs','bike','observe','drawer','shelf','rubble','read','repair','sew','unlock','fill','eat','drink','cook','meal','treat','sleep','plant','water','harvest','feed','hide','retreat','defend','fall']){
  const job={kind,title:'진행 중',elapsed:0,duration:2000,minutes:20,startedTime:720};const asset=readFileSync(new URL(workArt(job),new URL('../v2/',import.meta.url)));assert.ok(asset.includes(Buffer.from('ANIM')),kind+' animation missing');const html=progressView(job);assert.doesNotMatch(html,/work-still|hidden/);assert.match(html,/class="work-action-art(?: work-motion)?"/);
 }
});
