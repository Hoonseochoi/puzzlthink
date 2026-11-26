// Fixed labels of the 두뇌 서바이벌 게임 정리 pages.
export const SHOW_UI = {
  ko: {
    section: '두뇌 서바이벌 게임 정리', toc: '목차', spoilerTitle: '스포일러 안내',
    spoiler: '이 페이지는 방송에 나온 게임의 규칙을 다뤄요. 누가 이기거나 탈락했는지는 적지 않았지만, 어떤 게임이 언제 나오는지는 알 수 있어요.',
    setup: '인원·준비물', flow: '진행 순서', win: '승리 조건', exceptions: '예외 규칙', analysis: '승부를 가르는 지점',
    siteDiff: 'PUZZLTHINK 버전과 방송 규칙의 차이', similar: '비슷한 보드게임', similarSite: 'PUZZLTHINK에서 비슷한 게임', sources: '참고 자료',
    play: '지금 플레이', guide: '공략 보기', playBoxTitle: '이 게임은 PUZZLTHINK에서 바로 해 볼 수 있어요',
    playBoxBody: '가입 없이 브라우저에서 AI나 친구와 둘 수 있어요. 규칙을 읽고 한 판 두어 보면 훨씬 빨리 감이 와요.',
    players: '인원', alike: '닮은 점', differs: '다른 점', updated: '마지막 수정', prev: '이전 게임', next: '다음 게임',
    format: '방송 형식', games: '등장 게임 (방송 순서)', allShows: '모든 방송 보기', backShow: '방송 페이지로',
    playable: '플레이 가능', episodes: (n: number) => `${n}부작`, gameCount: (n: number) => `게임 ${n}개`, playableCount: (n: number) => `플레이 가능 ${n}개`,
    planned: '다음으로 정리할 방송', plannedNote: '공개일은 보도 자료와 공개 당시 기사로 확인했어요. 정리가 끝나는 대로 이 목록에서 위로 올라가요.',
    playableAll: 'PUZZLTHINK에서 할 수 있는 방송 게임', aired: '공개',
  },
  en: {
    section: 'Brain-survival show games', toc: 'Contents', spoilerTitle: 'Spoiler note',
    spoiler: 'This page covers the rules of games from the show. It never says who won or was eliminated, but it does show which games come up and when.',
    setup: 'Players and components', flow: 'How a round goes', win: 'How to win', exceptions: 'Edge cases', analysis: 'What decides the game',
    siteDiff: 'How the PUZZLTHINK version differs', similar: 'Similar board games', similarSite: 'Similar games on PUZZLTHINK', sources: 'References',
    play: 'Play now', guide: 'Read the guide', playBoxTitle: 'You can play this game on PUZZLTHINK',
    playBoxBody: 'No sign-up: play the AI or friends in your browser. Read the rules, then play a game — it sticks much faster.',
    players: 'Players', alike: 'Alike', differs: 'Different', updated: 'Last updated', prev: 'Previous game', next: 'Next game',
    format: 'Format', games: 'Games, in broadcast order', allShows: 'All shows', backShow: 'Back to the show',
    playable: 'Playable', episodes: (n: number) => `${n} episodes`, gameCount: (n: number) => `${n} games`, playableCount: (n: number) => `${n} playable`,
    planned: 'Shows coming next', plannedNote: 'Release dates were checked against press releases and news reports from the time. Shows move up this list as their pages are written.',
    playableAll: 'Show games you can play on PUZZLTHINK', aired: 'Released',
  },
} as const;
