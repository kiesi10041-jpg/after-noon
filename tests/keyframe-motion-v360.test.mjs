import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {motionKinds,motionFrames,motionLoops,motionFrameAt} from '../v2/work-motion.js';
import {workMotionKind,workDuration} from '../v2/work-progress.js';
test('every authored motion has sixteen source poses and a complete 96-frame atlas',()=>{
 for(const kind of motionKinds){const meta=JSON.parse(readFileSync(new URL('../motion-sources/v036/'+kind+'.json',import.meta.url)));assert.equal(meta.keyframes,16);assert.equal(meta.frames,motionFrames(kind));assert.equal(meta.loop,motionLoops(kind));for(const path of [meta.source,meta.atlas])assert.ok(readFileSync(new URL('../'+path,import.meta.url)).length>10000);}
});
test('different physical tasks select their own animation',()=>{
 for(const [kind,expected]of Object.entries({fill:'fill',water:'garden',plant:'plant',harvest:'harvest',cook:'cook'}))assert.equal(workMotionKind({kind}),expected);
 assert.equal(workMotionKind({kind:'repair',action:'bike-repair'}),'bike-repair');assert.equal(workMotionKind({kind:'repair',action:'shelter-build'}),'build');assert.equal(workMotionKind({kind:'feed',action:'pet-care'}),'rest');
});
test('one-shot tasks finish a full pose sequence before logical completion',()=>{for(const kind of ['drawer','fill','plant','cook','repair']){assert.ok(workDuration(kind)>=3840);assert.equal(motionFrameAt(workDuration(kind),kind),95);}});
