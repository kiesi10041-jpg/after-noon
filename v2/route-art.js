// Schematic ground journey; coordinates also anchor the illustrated route sheet.
export const regionalDots={home:[23,83],station:[23,83],road1:[23,61],road2:[23,39],road3:[23,17],family:[75,17],nowon:[75,39],clinic:[75,61],relay:[75,83]};
export function regionalPoints(s){return [['station','영종역','rail'],['road1','검암권 쉼터','moon'],['road2','서울역 쉼터','moon'],['road3','창동역 쉼터','moon'],['family','가족 집','door'],...(s.questStage>=3?[['nowon','노원역 기록실','rail'],['clinic','의료 거점','heart'],['relay','도봉권 중계실','radio']]:[])].map(([id,name,icon])=>[id,name,...regionalDots[id],icon]);}
