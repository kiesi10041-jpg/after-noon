import {initGrowth} from './growth.js?v=0.30.0';
export const carryLimit=s=>4+initGrowth(s).stats.endurance*2;
export const comfortLoad=s=>2+initGrowth(s).stats.endurance;
export const minuteNow=s=>(s.day-1)*1440+s.time;
export function stressFloor(s){const shelter=s.expedition?.shelters?.[s.location],trip=Boolean(s.roadTrip||s.railTrip),night=s.time<360||s.time>=1140,unlit=night&&!(s.lightOn&&s.battery>0)&&!(s.phoneLight&&s.phoneBattery>0),noise=!s.away&&s.day<=s.hornUntil&&!s.earplugs;return Math.min(75,(trip?45:!s.away?10:shelter?20:35)+(unlit&&s.away?10:0)+(noise?10:0)+(s.thirst<20||s.hunger<20||s.cold>=60?15:0));}
export function calmPlan(s){const floor=stressFloor(s),minutes=20,now=minuteNow(s),remaining=Math.max(0,120-(now-(s.lastCalmMinute??-10000))),blocked=['incident','wildlife','rat-choice','pet-event'].includes(s.scene)||s.roadTrip?.stage==='obstacle';let reason=blocked?'위험에서 먼저 벗어나야 호흡을 가다듬을 수 있습니다.':remaining?`${remaining}분 뒤 다시 시도할 수 있습니다.`:s.stress<=floor?'현재 환경에서는 더 진정하기 어렵습니다. 안전한 거처와 식사·물·보온을 챙기세요.':'';return {floor,minutes,remaining,amount:Math.max(0,Math.min(s.stress-floor,4+initGrowth(s).stats.composure)),reason};}
export function easeStress(s,amount){s.stress=Math.max(Math.min(s.stress,stressFloor(s)),s.stress-amount);}

