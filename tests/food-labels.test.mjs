import test from 'node:test';import assert from 'node:assert/strict';
import {expiryText,foodLabel} from '../v2/food-labels.js';
import {create,pack} from '../v2/journey.js';
import {storageView} from '../v2/storage.js';
test('expiry dates remain visible and switch to spoiled on the expiry day',()=>{assert.equal(expiryText(3,5),'유통기한 5일째 · 2일 남음');assert.match(expiryText(5,5),/부패/);assert.equal(expiryText(5,undefined),'기한 미확인');});
test('labels respect storage location and mixed fresh/spoiled batches',()=>{const s={day:5,foodDates:{rice:[9]},carryDates:{rice:[4,7,10]},carryFood:[{expires:6}],food:[]};assert.match(foodLabel(s,'rice'),/부패 1개.*7일째/);assert.match(foodLabel(s,'rice','home'),/9일째/);assert.match(foodLabel(s,'rice','shelter',{dates:{rice:[12]}}),/12일째/);assert.equal(foodLabel(s,'can'),'장기 보관 식품');assert.equal(foodLabel(s,'water'),'');});
test('selected fridge and pantry foods render their saved expiry dates',()=>{const s=create(42);s.food=[{expires:s.day+2}];s.stock.water=0;assert.match(storageView(s,'fridge',0,0),/유통기한.*2일 남음/);s.stock={rice:1};s.foodDates={rice:[s.day+4]};assert.match(storageView(s,'pantry',0,0),/4일 남음/);s.scene='home';assert.equal(pack(s,'rice',1),true);assert.match(foodLabel(s,'rice'),/4일 남음/);});
