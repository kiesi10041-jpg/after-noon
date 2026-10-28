// Only supplies physically available at the current location can be used.
export function medicineSource(s){
 if((s.carry?.medicine||0)>0)return {stock:s.carry,label:'가방'};
 if(!s.away&&(s.stock?.medicine||0)>0)return {stock:s.stock,label:'집 보관함'};
 const sh=s.away?s.expedition?.shelters?.[s.location]:null;
 if((sh?.stock?.medicine||0)>0)return {stock:sh.stock,label:'현재 거처 보관함'};
 return null;
}
export function useMedicine(s){
 if(s.ended||s.health<=0)return false;
 const source=medicineSource(s);
 if(!source){s.text='현재 사용할 구급약이 없다. 집이나 다른 거처에 둔 약은 해당 장소에서 사용해야 한다.';return false;}
 if(s.health>=100&&!(s.cold>0)){s.text='지금은 구급약을 사용할 필요가 없다.';return false;}
 const before=s.health;source.stock.medicine--;
 s.health=Math.min(100,s.health+18);s.cold=Math.max(0,(s.cold||0)-18);
 s.illnessStage=s.cold>=68?2:s.cold>=35?1:0;
 s.text=`${source.label}의 구급약 1개를 사용했다. 건강 ${Math.round(before)} → ${Math.round(s.health)} · 오한 ${Math.round(s.cold)}. 허기와 갈증은 식량과 물로 해결해야 한다.`;
 return true;
}

