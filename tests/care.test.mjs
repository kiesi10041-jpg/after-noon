import test from 'node:test';
import assert from 'node:assert/strict';
import {useMedicine,medicineSource} from '../v2/care.js';
import {create,action,consumeCarry} from '../v2/journey.js';
test('home medicine works without packing or stamina',()=>{const s=create(1);s.scene='home';s.away=false;s.health=20;s.cold=40;s.stock.medicine=1;s.carry.medicine=0;s.ap=0;assert.equal(action(s,'medicine'),true);assert.equal(s.health,38);assert.equal(s.cold,22);assert.equal(s.stock.medicine,0);assert.equal(s.ap,0);});
test('remote home stock unavailable; current shelter medicine usable',()=>{const s=create(1);s.away=true;s.location='road2';s.health=30;s.stock.medicine=3;s.carry.medicine=0;assert.equal(useMedicine(s),false);s.expedition.shelters.road2={stock:{medicine:1}};assert.equal(medicineSource(s).label,'현재 거처 보관함');assert.equal(useMedicine(s),true);assert.equal(s.stock.medicine,3);assert.equal(s.health,48);});
test('bag treatment caps recovery, cannot revive or waste healthy supplies',()=>{const s=create(1);s.carry.medicine=2;s.health=100;s.cold=0;assert.equal(consumeCarry(s,'medicine'),false);s.health=90;assert.equal(consumeCarry(s,'medicine'),true);assert.equal(s.health,100);assert.equal(s.carry.medicine,1);s.ended=true;assert.equal(useMedicine(s),false);});
