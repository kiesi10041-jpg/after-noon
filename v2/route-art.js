import {neighbors,edgeKey} from './overland.js?v=0.37.1';
import {chapterPoints,chapterDots} from './chapter2.js?v=0.37.1';
// Schematic ground journey; coordinates also anchor the illustrated route sheet.
export const regionalDots={station:[18,84],home:[18,84],bridge:[45,72],road1:[21,56],road2:[67,47],road3:[39,27],family:[79,13],nowon:[81,35],clinic:[83,60],relay:[69,82],farm:[62,18]};
export function regionalPoints(s){if(s.chapterMap&&s.chapter2?.stage)return [...chapterPoints(),...(s.farm?.hint?[['farm','엄마의 농원',90,12,'sprout']]:[])];return [['station','영종역','rail'],['bridge','연결로 진입부','walk'],['road1','검암권 쉼터','moon'],['road2','서울역 쉼터','moon'],['road3','창동역 쉼터','moon'],['family','가족 집','door'],...(s.questStage>=3?[['nowon','노원역 기록실','rail'],['clinic','의료 거점','heart'],['relay','도봉권 중계실','radio']]:[]),...(s.farm?.hint?[['farm','엄마의 농원','sprout']]:[])].map(([id,name,icon])=>[id,name,...regionalDots[id],icon]);}

export function discoveredPaths(s){const d=s.discovery;if(!d)return '';const lines=[],seen=new Set();for(const a of ['station','bridge','road1','road2','road3','family',...(s.questStage>=3?['nowon','clinic','relay','farm']:[])])for(const b of neighbors(a)){const key=edgeKey(a,b);if(seen.has(key)||!regionalDots[a]||!regionalDots[b])continue;seen.add(key);const [x,y]=regionalDots[a],[xx,yy]=regionalDots[b];lines.push(`<path d="M${x} ${y}L${xx} ${yy}" stroke="${d.travelled[key]?'#526a50':'#a1936b'}" opacity="${d.known.includes(a)&&d.known.includes(b)?1:.25}" stroke-width=".9" ${d.travelled[key]?'':'stroke-dasharray="2 1.5"'}/>`);}return `<svg class="discovered-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines.join('')}</svg>`;}


export function sceneProfile(s,places){return ['door','wildlife','road-journey','rail-journey','pet-event','incident'].includes(s.scene)?'':places[s.location]?.profile||'';}
