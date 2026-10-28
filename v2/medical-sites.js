// Fictional, local facilities. Each has its own remaining cold-chain deadline.
export const medicalSites={station_medical:{name:'영종 보건지소',hub:'station'},road1_medical:{name:'검암 지역의원',hub:'road1'},road2_medical:{name:'서울역 인근 응급진료실',hub:'road2'},road3_medical:{name:'창동 보건지소',hub:'road3'},nowon_medical:{name:'노원 지역의원',hub:'nowon'},clinic:{name:'노원권 응급의료 거점',hub:'nowon'}};
export const isMedicalSite=id=>Boolean(medicalSites[id]);
export function medicalState(s,id=s.location){if(!isMedicalSite(id))return null;const e=s.expedition;e.medicalSites??={};return e.medicalSites[id]??={until:id==='clinic'?e.clinicUntil:12+(s.seed%4),extensions:0};}
export function nearestMedical(s,distance){const origin=s.away?s.location:'home';if(s.roadTrip||s.railTrip)return null;return Object.entries(medicalSites).map(([id,p])=>({...p,id,km:distance(origin,id)})).sort((a,b)=>a.km-b.km)[0];}
