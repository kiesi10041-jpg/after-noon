import test from 'node:test';
import assert from 'node:assert/strict';
import {create,action,take} from '../v2/journey.js';
import {placeActions,placeMenuView} from '../v2/fieldwork-ui.js';
function site(condition='open') {const s=create(13);s.away=true;s.scene=s.location='park';s.ap=8;s.time=900;s.ratsChecked.park=true;s.worldLoot.park={bookGarden:1,cloth:1};s.worldSites.park.condition=condition;return s;}
test('ordinary search reveals collectible books without a separate action',()=>{const s=site();assert.equal(action(s,'careful'),true);assert.equal(s.loot.bookGarden,1);assert.match(s.text,/능력 메뉴에서 읽을 수 있다/);assert.equal(s.worldSites.park.documents,true);assert.equal(take(s,'bookGarden'),true);assert.equal(s.carry.bookGarden,1);assert.equal(action(s,'learn:bookGarden'),true);assert.equal(s.growth.reading.bookGarden,1);});
test('sealed books remain inaccessible until the compartment is opened',()=>{const s=site('sealed');action(s,'careful');assert.equal(s.loot.bookGarden,undefined);assert.equal(s.worldSites.park.documents,false);s.carry.tool=1;assert.equal(action(s,'tool'),true);assert.equal(s.loot.bookGarden,1);assert.equal(s.worldSites.park.documents,true);});
test('repeat searches do not replenish books or repeat document understanding',()=>{const s=site();action(s,'careful');take(s,'bookGarden');const xp=s.growth.statXP.intelligence;action(s,'site-back');action(s,'careful');assert.equal(s.loot.bookGarden,0);assert.equal(s.growth.statXP.intelligence,xp);assert.doesNotMatch(s.text,/책도 보인다/);});
test('place controls omit separate document search',()=>{const s=site(),button=(a,n)=>`<button data-a="${a}">${n}</button>`;assert.doesNotMatch(placeActions(s,button)+placeMenuView(s,button,''),/inspect-documents|자료 살피기/);});
