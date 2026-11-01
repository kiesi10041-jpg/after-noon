export function clothingControls(s,button){
 const kit=s.away?s.carry:s.stock;
 return `<h3>착용 장비</h3><p class="sheet-note">${s.outfit.item==='jacket'?'겨울 외투 착용 중':'얇은 겉옷 착용 중'} · ${s.maskOn?'마스크 착용 중':'마스크 미착용'}</p><div class="sheet-actions">${s.outfit.item==='jacket'||kit.jacket?button('wear-jacket',s.outfit.item==='jacket'?'외투 벗어 보관하기':'겨울 외투 입기',s.away?'가방의 장비 사용':'집에 보관한 장비 사용'):''}${s.maskOn||kit.mask?button('mask',s.maskOn?'마스크 벗어 보관하기':'방진 마스크 착용','황사에 대비'):''}</div>`;
}
export function homeMaintenanceView(s,button){
 if(s.away)return '<p class="sheet-note">집에 돌아와 정비할 수 있습니다.</p>';
 const repair=[];
 if(s.outfit.condition<100||s.outfit.wet>0)repair.push(button('repair-outfit','겉옷 수선·건조','30분 · 기력 1 · 천과 실 1',!s.stock.cloth||s.ap<1));
 if(s.bag.durability<100)repair.push(button('repair','가방 수선','40분 · 기력 2 · 천과 실 1',!s.stock.cloth||s.ap<2));
 if(s.bag.slots<10)repair.push(button('expand','가방 확장','1시간 · 기력 3 · 천과 실 1 + 공구',!s.stock.cloth||!s.stock.tool||s.ap<3));
 const noise=s.day<=s.hornUntil;
 return `<h3>수선·제작</h3><div class="sheet-actions">${repair.join('')||'<p>지금 수선할 장비가 없습니다.</p>'}</div><h3>집 안 보강</h3><div class="sheet-actions">${button('insulate','잠자리 단열 보강',`현재 ${s.insulation||0}단계 · 45분 · 기력 2 · 이불 1`,!s.stock.blanket||s.ap<2)}${noise&&!s.earplugs?button('earplugs','천으로 귀마개 만들기','천과 실 1 · 경적 수면 방해 완화',!s.stock.cloth):''}${noise?button('silence-car','경적 울리는 차 손보기','공구 · 40분 · 기력 1',!s.stock.tool||s.ap<1):''}</div>`;
}
