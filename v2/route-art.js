// Schematic ground journey; coordinates also anchor the illustrated route sheet.
export const regionalDots={home:[23,77],station:[23,77],road1:[23,56],road2:[23,35],road3:[23,14],family:[75,14],nowon:[75,35],clinic:[75,56],relay:[75,77]};
export function regionalPoints(s){return [['station','영종역','rail'],['road1','검암권 쉼터','moon'],['road2','서울역 쉼터','moon'],['road3','창동역 쉼터','moon'],['family','가족 집','door'],...(s.questStage>=3?[['nowon','노원역 기록실','rail'],['clinic','의료 거점','heart'],['relay','도봉권 중계실','radio']]:[])].map(([id,name,icon])=>[id,name,...regionalDots[id],icon]);}
