// A four-digit code groups tester runs. It is not account authentication.
export const normalizePlayerName=value=>String(value??'').normalize('NFC').trim().replace(/\s+/g,' ').slice(0,14);
export function identityError(name,pin){if(!normalizePlayerName(name))return '이름을 입력해 주세요.';if(!/^[0-9]{4}$/.test(String(pin??'')))return '구분 번호는 숫자 4자리로 입력해 주세요.';return '';}
export async function identifyPlayer(name,pin,cryptoApi=globalThis.crypto){const error=identityError(name,pin);if(error)throw new Error(error);const playerName=normalizePlayerName(name);const material=new TextEncoder().encode(`12:00/tester/v1\u0000${playerName}\u0000${pin}`);const digest=await cryptoApi.subtle.digest('SHA-256',material);return {name:playerName,profileId:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),version:1};}
export function newRunId(cryptoApi=globalThis.crypto){return cryptoApi.randomUUID();}
export function attachIdentity(s,identity,{resume=false,cryptoApi=globalThis.crypto}={}){s.playerName=identity.name;s.playerIdentity={...identity};if(!resume||!s.runRecord?.id)s.runRecord={id:newRunId(cryptoApi),startedAt:new Date().toISOString(),activeMs:0,sequence:0,legacy:resume};return s;}
// Remember only the derived tester identity; the four-digit code never leaves identifyPlayer.
const rememberedKey='noon-player-identity-v1';
export function validIdentity(value){return Boolean(value&&normalizePlayerName(value.name)&&/^[a-f0-9]{64}$/.test(value.profileId||'')&&value.version===1);}
export function rememberIdentity(identity,storage=globalThis.localStorage){if(!validIdentity(identity))return false;try{storage.setItem(rememberedKey,JSON.stringify({name:identity.name,profileId:identity.profileId,version:1}));return true;}catch{return false;}}
export function rememberedIdentity(storage=globalThis.localStorage){try{const value=JSON.parse(storage.getItem(rememberedKey));return validIdentity(value)?value:null;}catch{return null;}}
export function restoreIdentity(s,storage=globalThis.localStorage){if(validIdentity(s.playerIdentity)){rememberIdentity(s.playerIdentity,storage);return true;}const identity=rememberedIdentity(storage);if(!identity||normalizePlayerName(s.playerName)&&normalizePlayerName(s.playerName)!==identity.name)return false;attachIdentity(s,identity,{resume:true});return true;}
