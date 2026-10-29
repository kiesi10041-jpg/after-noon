// Short journeys accumulate effort; previews never change state.
export function fatiguePlan(s,km,mode='walk'){
 const fraction=Math.max(0,Number(s.travelFatigue)||0),increment=mode==='car'?0:Math.max(0,km)/(mode==='bike'?6:2),total=fraction+increment;
 return {ap:mode==='car'?1:Math.floor(total+1e-8),fraction:mode==='car'?fraction:Math.round((total-Math.floor(total+1e-8))*10000)/10000,increment};
}
export function spendTravel(s,km,mode='walk'){s.travelFatigue=fatiguePlan(s,km,mode).fraction;}
