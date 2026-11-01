const scenes={
 wake:{art:'wake-v2.webp',text:'경적이 왜 계속 울리지?\n…밖이 너무 조용한데.',action:'look',next:'현관 밖을 살핀다',position:'55% center'},
 threshold:{art:'corridor-v3.webp',text:'누구 없어요?\n…뭔가 잘못됐어.',action:'outside',next:'건물 밖으로 내려간다',position:'center'},
 street:{art:'cover.webp',text:'사람이… 한 명도 없어.\n나 혼자 남은 것 같아…',action:'phone',next:'집에 전화를 건다',position:'center'},
 phone:{art:'phone-v2.webp',text:'받아 줘. 제발…\n신호는 가는데, 왜 아무도 받지 않지?',action:'begin',next:'내 방으로 돌아간다',position:'center'}
};
export const isIntro=scene=>Object.hasOwn(scenes,scene);
export function introView(scene){const s=scenes[scene];if(!s)return '';return `<section class="intro-screen" aria-label="이야기 시작"><img class="intro-illustration" src="../assets/${s.art}" alt="${{wake:'정오의 방',threshold:'아무도 없는 복도',street:'사람이 사라진 거리',phone:'대답 없는 전화'}[scene]}" style="object-position:${s.position}" decoding="async"><div class="intro-shade" aria-hidden="true"></div><div class="intro-dialogue"><p>${s.text.replaceAll('\n','<br>')}</p><button data-a="${s.action}">${s.next}<span aria-hidden="true">›</span></button></div></section>`;}
