import { Brain } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';

const TEXT = {
  ko: [
    ['바둑알을 시간으로 사요', '모두 같은 시간(빠른 경매 2분, 방송 규칙 10분)을 받아요. 경매마다 PUZZLTHINK 아이콘 바둑알 하나가 올라와요(기본 바둑알 1점, 세 번째마다 중급 아이콘 2점, 마지막에 최상급 아이콘 3점). 경매에 나오는 바둑알은 게임 속 점수예요. 실제 아이콘은 지급되지 않아요. 버튼을 누르고 있는 동안 내 시간이 0.1초 단위로 줄어요.'],
    ['누르고, 5초 카운트다운', '모두 버튼을 누르면 5초 카운트다운이 시작돼요. 이번 경매가 싫으면 카운트다운 안에 손을 떼세요. 시간이 전혀 들지 않아요.'],
    ['마지막까지 버티면 낙찰', '가장 오래 버틴 1명이 그 바둑알(승리 표식)을 가져가요. 진 사람도 버틴 만큼 시간을 잃고, 두 명 이상 입찰했다면 가장 먼저 손을 뗀 사람은 헬모드 마이너스 바둑알(−1점)을 받아요.'],
    ['남은 시간은 기억으로', '내 남은 시간도 화면에 나오지 않아요. AI 캐릭터 10명 중 5명이 매 판 다른 성향으로 앉고, 성향은 끝나면 공개돼요. 점수(바둑알 점수 − 마이너스)가 가장 낮으면 탈락, 같으면 남은 시간이 적은 쪽이 탈락해요.'],
  ],
  en: [
    ['Buy stones with time', 'Everyone gets the same time (2:00 in Quick, 10:00 in Broadcast). Each auction puts up one of PUZZLTHINK\'s icon pieces (a starter piece 1 point, every third a mid-tier icon 2, the last a top icon 3; the pieces on auction are points in this game only; no real profile icon is granted); while you hold the button, your time drains in tenths of a second.'],
    ['Press, then a 5-second countdown', 'When everyone is pressing, a 5-second countdown starts. Let go during it to skip the auction: it costs nothing.'],
    ['Last one holding wins', 'Whoever holds longest takes the stone — the victory token. Losers lose what they held too, and if two or more bid, whoever let go first takes the hell-mode minus stone (−1).'],
    ['Remember your time', 'Your remaining time is never shown, not even to you. Five of ten AI characters sit each match, each in its own style, revealed at the end. Lowest score (points − minus) is eliminated; on a tie, less time left goes out.'],
  ],
} as const;

/** The entry screen's four tutorial cards. */
export function TimeAuctionTutorialSteps({ locale }: { locale: string }) {
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const led = 'rounded-md bg-black px-2.5 py-1 font-mono text-2xl font-black text-[#ff3b30] [text-shadow:0_0_12px_#ff3b30]';
  const visuals = [
    <div key="bank" className="flex items-center gap-3"><span className={led}>2:00.0</span><span className="font-mono text-xs text-white/50">× 6</span></div>,
    <div key="cd" className="flex items-center gap-3"><span className="h-14 w-14 rounded-full border-4 border-[#ffd166] bg-[#ffd166]/80" /><span className="font-mono text-4xl font-black text-[#ffd166]">5</span></div>,
    <div key="win" className="flex flex-col items-center gap-1.5 font-mono text-sm font-black"><span className="rounded-md bg-[#ff3b30] px-2 py-0.5 text-white">0:41.3 · WIN</span><span className="rounded-md border border-white/15 px-2 py-0.5 text-white/60">0:38.9</span><span className="rounded-md border border-white/15 px-2 py-0.5 text-white/35">0:00.0</span></div>,
    <div key="mem" className="flex items-center gap-3"><span className={`${led} opacity-30`}>?:??.?</span><Brain size={30} className="text-white/60" /></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
