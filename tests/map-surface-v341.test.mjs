import test from 'node:test';import assert from 'node:assert/strict';
import {create,action,places} from '../v2/journey.js';
import {sceneProfile} from '../v2/route-art.js';
import {mapSource,initDiscovery} from '../v2/overland.js';
import {travelConfirm,mapControls} from '../v2/travel-ui.js';
const button=(a,n,h,d)=>`<button data-a="${a}" ${d?'disabled':''}>${n} ${h||''}</button>`;
const state=()=>{const s=create(30);s.away=true;s.location='road2_medical';s.scene='door';s.time=720;s.questStage=2;s.carry={};s.tripPlan={target:'road3',vehicle:'walk',departure:'now'};return s;};
test('map, animal and transit views cannot inherit a previous shop interior',()=>{
 for(const profile of ['medical','supply','workshop','home','books']){
  const p={x:{profile}},s={location:'x'};
  for(const scene of ['door','wildlife','road-journey','rail-journey','pet-event','incident'])assert.equal(sceneProfile({...s,scene},p),'');
  assert.equal(sceneProfile({...s,scene:'x'},p),profile);assert.equal(sceneProfile({...s,scene:'loot'},p),profile);
 }
});
test('regional investigation controls from a shop lead back to the real station without teleporting',()=>{
 const s=state();assert.ok(places[s.location]);assert.equal(mapSource(s,places).available,false);s.mapScope='regional';
 assert.match(travelConfirm(s,button),/data-a="target:road2"/);assert.doesNotMatch(travelConfirm(s,button),/data-a="route-map"/);
 assert.match(mapControls(s,button),/data-a="target:road2"/);
 const time=s.time;assert.equal(action(s,'route-map'),false);assert.equal(s.time,time);assert.match(s.text,/서울역/);
 s.location=s.scene='road2';assert.equal(mapSource(s,places).available,true);assert.equal(action(s,'route-map'),true);
 assert.ok(initDiscovery(s).known.includes('road3'));s.scene='door';assert.equal(action(s,'route-survey'),true);assert.equal(action(s,'depart'),true);assert.ok(s.roadTrip);
});
