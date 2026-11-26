import type { GTArticle } from '../types';

/** The four-move centipede game: A and B alternate; "take" ends the game, "pass" doubles the pile. */
function CentipedeTree({ take, pass, labels }: { take: string; pass: string; labels: [string, string] }) {
  const nodes = [
    { x: 40, who: labels[0], payoff: '4, 1' },
    { x: 150, who: labels[1], payoff: '2, 8' },
    { x: 260, who: labels[0], payoff: '16, 4' },
    { x: 370, who: labels[1], payoff: '8, 32' },
  ];
  return (
    <svg viewBox="0 0 515 150" className="w-full" role="img" aria-label="centipede game tree">
      {nodes.map((n, i) => (
        <g key={i}>
          <line x1={n.x} y1={40} x2={i < 3 ? nodes[i + 1].x : 440} y2={40} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
          <line x1={n.x} y1={40} x2={n.x} y2={105} stroke="#ffcc4d" strokeWidth={2.5} />
          <circle cx={n.x} cy={40} r={15} fill="#16171f" stroke="#ffcc4d" strokeWidth={2} />
          <text x={n.x} y={45} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ffcc4d">{n.who}</text>
          <text x={n.x + 8} y={78} fontSize={10} fill="currentColor" fillOpacity={0.5}>{take}</text>
          <text x={n.x} y={126} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">({n.payoff})</text>
          <text x={(n.x + (i < 3 ? nodes[i + 1].x : 440)) / 2} y={30} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.45}>{pass}</text>
        </g>
      ))}
      <text x={448} y={45} fontSize={13} fontWeight={700} fill="currentColor">(64, 16)</text>
    </svg>
  );
}

const article: GTArticle = {
  slug: 'backward-induction',
  category: 'sequence',
  updated: '2026-11-26',
  games: ['janggi', 'wallgo', 'blackWhite'],
  related: ['tit-for-tat', 'commitment-threats', 'ultimatum-game', 'prisoners-dilemma'],
  ko: {
    meta: {
      title: '역진 귀납과 지네 게임 — 끝에서부터 거꾸로 읽는 법과 그 한계 | PUZZLTHINK 게임 이론',
      description: '순서대로 두는 게임은 마지막 수부터 거꾸로 풀 수 있어요. 역진 귀납의 원리, 체르멜로의 정리, 부분 게임 완전 균형, 그리고 이론과 실험이 크게 엇갈리는 지네 게임과 연쇄점 역설까지 정리했어요.',
      keywords: ['역진 귀납', '지네 게임', '부분 게임 완전 균형', '체르멜로 정리', '게임 트리', '수읽기'],
    },
    title: '역진 귀납과 지네 게임',
    lead: '끝에서부터 거꾸로 읽으면 풀리는 게임, 그리고 그렇게 읽으면 오히려 손해인 게임.',
    intro: [
      '장기나 바둑의 끝내기에서 고수들은 "여기서 이렇게 두면, 상대는 이렇게 받을 수밖에 없고, 그러면…" 하고 몇 수 앞을 읽어요. 이 수읽기를 끝까지 밀고 가면 게임 이론의 **역진 귀납(backward induction)**이 돼요. 마지막 수에서 최선이 무엇인지 먼저 정하고, 그걸 바탕으로 그 앞의 수를 정하는 거예요.',
      '역진 귀납은 아주 강력하지만, 이상한 결론을 내기도 해요. 이 글에서는 역진 귀납이 어떻게 작동하는지, 그리고 그 결론이 실제 사람들의 행동과 가장 크게 어긋나는 **지네 게임**을 살펴봐요.',
    ],
    summary: '마지막 수부터 거꾸로 푸는 법. 그리고 그렇게 풀면 둘 다 손해인 지네 게임.',
    sections: [
      {
        id: 'method',
        title: '역진 귀납: 마지막 수부터',
        blocks: [
          { type: 'p', text: '순서대로 두고, 앞에서 일어난 일을 모두 볼 수 있는 게임을 **완전 정보 게임**이라고 해요. 이런 게임은 게임 트리(나무 그림)로 그릴 수 있고, 맨 끝 가지부터 거꾸로 풀 수 있어요.' },
          { type: 'list', ordered: true, items: [
            '마지막에 결정하는 사람의 자리로 가요. 그 사람은 남은 선택지 중 자기에게 가장 좋은 걸 고를 거예요. 그 선택을 표시해요.',
            '그 결정을 "이미 정해진 결과"로 바꿔 놓고, 한 단계 앞의 결정자 자리로 가요. 그 사람도 자기에게 가장 좋은 걸 고르게 해요.',
            '맨 처음 결정까지 반복해요. 남은 길이 이 게임의 예측이에요.',
          ] },
          { type: 'p', text: '수학자 에른스트 체르멜로는 1913년 체스에 관한 논문에서 이 생각의 뿌리가 되는 결과를 냈어요. 체스처럼 유한한 완전 정보 게임은 **"백이 반드시 이기는 방법이 있다", "흑이 반드시 이기는 방법이 있다", "양쪽 다 지지 않는 방법이 있다"** 중 하나가 성립한다는 거예요. 다만 체스는 트리가 너무 커서 그게 셋 중 무엇인지는 아직 아무도 몰라요.' },
          { type: 'h3', text: '믿을 수 없는 위협을 걸러 내기' },
          { type: 'p', text: '역진 귀납으로 얻은 해를 **부분 게임 완전 균형**이라고 해요. 라인하르트 젤텐이 1960년대에 정리한 개념이에요. 핵심은 "게임의 어느 지점에 도달하든, 거기서부터는 최선을 둔다"는 조건이에요. 그래서 "네가 그렇게 하면 나는 둘 다 망하는 수를 두겠다" 같은, 막상 그 자리에 가면 실행하지 않을 위협을 걸러 내요. 「[최후통첩 게임](/game-theory/ultimatum-game)」에서 응답자의 거절 위협이 걸러지는 것도 이 때문이에요. 젤텐은 1994년 내시, 하사니와 함께 노벨 경제학상을 받았어요.' },
        ],
      },
      {
        id: 'centipede',
        title: '지네 게임: 거꾸로 읽으면 둘 다 손해',
        blocks: [
          { type: 'p', text: '두 사람 A와 B 앞에 상금 더미가 있어요. 자기 차례가 오면 **가져가기**(더 큰 몫을 갖고 게임 끝)나 **넘기기**(더미가 두 배로 커지고 상대 차례)를 골라요. 넷째 차례까지 아무도 안 가져가면 더미가 한 번 더 커져서 끝나요.' },
          { type: 'figure', node: <CentipedeTree take="가져가기" pass="넘기기" labels={['A', 'B']} />, caption: '괄호는 (A의 몫, B의 몫). 오른쪽으로 갈수록 두 사람의 몫 합계가 커져요. 마지막까지 가면 (64, 16).' },
          { type: 'p', text: '역진 귀납으로 풀어 볼게요. 넷째 차례의 B는 가져가면 32, 넘기면 16이니 **가져가요.** 그걸 아는 셋째 차례의 A는 가져가면 16, 넘기면 (B가 가져갈 테니) 8이니 **가져가요.** 둘째 차례의 B는 가져가면 8, 넘기면 4니 **가져가요.** 그러면 첫째 차례의 A도 가져가면 4, 넘기면 2니 **가져가요.** 결론은 **A가 첫 차례에 바로 가져가고 (4, 1)로 끝난다**예요. 둘이 끝까지 넘기면 (64, 16)이 될 수 있는데도요.' },
          { type: 'p', text: '이 게임은 로버트 로젠탈이 1981년 논문에서 처음 소개했고, 원래 100번까지 이어지는 모양이 다리 많은 벌레를 닮아 나중에 **지네 게임**이라는 이름이 붙었어요.' },
          { type: 'h3', text: '실제 사람들은 넘겨요' },
          { type: 'p', text: '1992년 리처드 매켈비와 토머스 팰프리는 이 게임을 실험실에서 시험했어요. 이론대로라면 첫 차례에서 바로 가져가야 하는데, 넷째 차례까지 있는 게임에서 첫 차례에 가져간 경우는 아주 드물었어요(10%도 안 됐어요). 대부분 몇 번은 넘기다가 중간에 가져갔어요.' },
          { type: 'callout', tone: 'note', title: '사람들이 비합리적인 걸까', text: '꼭 그렇지는 않아요. 매켈비와 팰프리는 "상대가 조금이라도 끝까지 넘기는 사람일 가능성"을 넣으면 실험 결과를 상당 부분 설명할 수 있다고 봤어요. 상대가 그런 사람일 확률이 작더라도, 몇 번 넘겨서 더미를 키우는 것이 기대값으로 이득일 수 있거든요. 역진 귀납은 **모두가 끝까지 합리적이고, 모두가 그걸 서로 안다**는 아주 강한 가정 위에 서 있어요. 그 가정이 조금만 흔들려도 결론이 달라져요.' },
        ],
      },
      {
        id: 'chain-store',
        title: '연쇄점 역설과 평판',
        blocks: [
          { type: 'p', text: '젤텐은 1978년 비슷한 문제를 **연쇄점 역설**로 제시했어요. 여러 도시에 가게를 가진 대기업이 있고, 도시마다 차례로 경쟁자가 들어올지 고민해요. 대기업은 가격 전쟁으로 맞서거나(둘 다 손해) 받아들일 수 있어요. 마지막 도시에서는 더 지켜야 할 평판이 없으니 받아들이는 게 낫고, 그걸 알면 그 앞 도시에서도… 역진 귀납은 "모든 도시에서 받아들인다"고 결론 내요. 하지만 직관적으로는 초반에 몇 번 강하게 맞서서 "건드리면 싸운다"는 평판을 만드는 게 그럴듯해 보여요.' },
          { type: 'p', text: '이후 데이비드 크렙스, 로버트 윌슨, 폴 밀그럼, 존 로버츠 등은 "상대가 진짜로 싸움을 좋아하는 유형일지도 모른다"는 작은 불확실성만 넣어도, 초반에 맞서는 평판 전략이 합리적이 된다는 것을 보였어요. 지네 게임의 설명과 같은 원리예요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**끝내기는 거꾸로 읽으세요.** [십이장기](/janggi)나 [벽바둑](/wallgo) 1:1처럼 모든 정보가 공개된 게임에서, 남은 수가 적어지면 역진 귀납이 그대로 통해요. "마지막 수에서 상대는 무엇을 할 수밖에 없나"부터 정하고 거꾸로 올라오세요.',
            '**숨은 정보가 있는 게임도 마지막엔 계산이 돼요.** [흑과 백](/black-white)에서 숫자는 공개되지 않지만, 색과 승패를 기록하면 마지막 몇 라운드의 남은 타일을 거의 정확히 좁힐 수 있어요. 그러면 남은 라운드를 거꾸로 계산할 수 있어요.',
            '**상대가 끝까지 합리적이라고 가정하지 마세요.** 지네 게임처럼 협력하면 둘 다 이득인 구조에서, 상대가 "한 번 더 넘겨 볼까"라고 생각할 가능성이 있다면 바로 가져가는 게 최선이 아닐 수 있어요.',
            '**마지막 라운드가 언제인지 아는 게 힘이에요.** 끝이 정해진 반복 게임에서는 끝에서부터 협력이 무너지기 쉬워요(「[팃포탯](/game-theory/tit-for-tat)」 참고). 끝을 먼저 계산한 사람이 한 수 먼저 배신할 수 있어요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Ernst Zermelo, "Über eine Anwendung der Mengenlehre auf die Theorie des Schachspiels", Proceedings of the Fifth International Congress of Mathematicians, 1913' },
      { title: 'Robert W. Rosenthal, "Games of Perfect Information, Predatory Pricing and the Chain-Store Paradox", Journal of Economic Theory 25(1), 1981' },
      { title: 'Richard D. McKelvey, Thomas R. Palfrey, "An Experimental Study of the Centipede Game", Econometrica 60(4), 1992', url: 'https://authors.library.caltech.edu/65145' },
      { title: 'Reinhard Selten, "The Chain Store Paradox", Theory and Decision 9, 1978' },
      { title: 'David M. Kreps, Robert Wilson, "Reputation and Imperfect Information", Journal of Economic Theory 27(2), 1982' },
      { title: 'The Nobel Prize in Economic Sciences 1994 (Harsanyi, Nash, Selten)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1994/summary/' },
    ],
  },
  en: {
    meta: {
      title: 'Backward induction and the centipede game — reading a game from the end, and its limits | PUZZLTHINK',
      description: 'Sequential games can be solved backwards from the last move. How backward induction works, Zermelo’s theorem, subgame-perfect equilibrium, and the centipede game and chain-store paradox, where theory and experiments part ways most sharply.',
      keywords: ['backward induction', 'centipede game', 'subgame perfect equilibrium', "Zermelo's theorem", 'game tree', 'chain store paradox'],
    },
    title: 'Backward induction and the centipede game',
    lead: 'Games that are solved by reading backwards from the end, and a game where reading that way costs you.',
    intro: [
      'In the endgames of janggi or go, strong players read ahead: "if I play here, they have to answer there, and then…" Push that reading all the way and you get game theory’s **backward induction**: decide the best last move first, then use it to decide the move before, and so on.',
      'Backward induction is powerful, but it can reach strange conclusions. This article shows how it works and then looks at the **centipede game**, where its conclusion clashes most sharply with how people actually play.',
    ],
    summary: 'Solving a game from its last move backwards, and the centipede game where doing so leaves both worse off.',
    sections: [
      {
        id: 'method',
        title: 'Backward induction: start from the last move',
        blocks: [
          { type: 'p', text: 'A game where players move in turn and can see everything that happened before is a game of **perfect information**. It can be drawn as a game tree and solved from the last branches back.' },
          { type: 'list', ordered: true, items: [
            'Go to the last player to decide. They will pick whatever is best for them among the options left. Mark that choice.',
            'Replace that decision with its outcome, and move one step back to the previous decision-maker, who also picks what is best for them.',
            'Repeat up to the first decision. The path that remains is the game’s prediction.',
          ] },
          { type: 'p', text: 'In a 1913 paper on chess the mathematician Ernst Zermelo produced the result at the root of this idea: in a finite game of perfect information such as chess, exactly one holds — **White can force a win, Black can force a win, or both can avoid losing**. Chess’s tree is so vast that nobody yet knows which.' },
          { type: 'h3', text: 'Filtering out incredible threats' },
          { type: 'p', text: 'The solution found by backward induction is a **subgame-perfect equilibrium**, a concept Reinhard Selten developed in the 1960s. The condition is that wherever the game gets to, play from there on is optimal. It filters out threats such as "if you do that, I will make a move that ruins us both", which nobody would carry out once there. This is why the responder’s threat to reject is filtered out in [the ultimatum game](/game-theory/ultimatum-game). Selten shared the 1994 Nobel Memorial Prize in Economic Sciences with Nash and Harsanyi.' },
        ],
      },
      {
        id: 'centipede',
        title: 'The centipede game: reading backwards hurts both',
        blocks: [
          { type: 'p', text: 'Two players, A and B, face a pile of prize money. On their turn they either **take** (keep the larger share and end the game) or **pass** (the pile doubles and it is the other’s turn). If nobody takes by the fourth turn, the pile grows once more and the game ends.' },
          { type: 'figure', node: <CentipedeTree take="take" pass="pass" labels={['A', 'B']} />, caption: 'In brackets, (A’s share, B’s share). The total grows to the right; passing to the end gives (64, 16).' },
          { type: 'p', text: 'Solve it backwards. At the fourth turn B gets 32 by taking and 16 by passing, so **takes**. Knowing this, A at the third turn gets 16 by taking and 8 by passing (B would then take), so **takes**. B at the second turn gets 8 by taking and 4 by passing, so **takes**. So A at the first turn gets 4 by taking and 2 by passing, and **takes**. The conclusion: **A takes immediately and the game ends at (4, 1)**, although passing to the end could give (64, 16).' },
          { type: 'p', text: 'Robert Rosenthal introduced the game in a 1981 paper. The original ran to a hundred moves, and its tree’s resemblance to a many-legged creature later gave it the name **centipede**.' },
          { type: 'h3', text: 'Real people pass' },
          { type: 'p', text: 'In 1992 Richard McKelvey and Thomas Palfrey tested the game in the laboratory. Theory says take at once, but in the four-move version taking at the very first turn was rare (under 10% of games). Most players passed a few times and took somewhere in the middle.' },
          { type: 'callout', tone: 'note', title: 'Are people irrational?', text: 'Not necessarily. McKelvey and Palfrey argued that allowing a small chance that the other player is someone who passes to the end explains much of the data: even if that chance is small, passing a few times to grow the pile can pay in expectation. Backward induction rests on a very strong assumption — **everyone is rational to the end, and everyone knows everyone is** — and when it wobbles even slightly, the conclusion changes.' },
        ],
      },
      {
        id: 'chain-store',
        title: 'The chain-store paradox and reputation',
        blocks: [
          { type: 'p', text: 'In 1978 Selten posed a similar puzzle, the **chain-store paradox**. A big firm has shops in many towns, and in each town in turn a rival considers entering. The firm can fight with a price war (costly for both) or accommodate. In the last town there is no reputation left to protect, so it accommodates; knowing that, in the town before… Backward induction concludes "accommodate everywhere". Intuitively, though, fighting a few early entrants to build a reputation for fighting looks sensible.' },
          { type: 'p', text: 'David Kreps, Robert Wilson, Paul Milgrom and John Roberts later showed that a little uncertainty — the chance that the firm is a type that genuinely likes to fight — is enough to make the reputation-building strategy rational. It is the same principle as the explanation of the centipede results.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Read endgames backwards.** In games where everything is public, such as [12 Janggi](/janggi) or one-on-one [Wallgo](/wallgo), backward induction works directly once few moves remain. Start from "what must the opponent do on the last move" and work back.',
            '**Hidden-information games become computable at the end.** In [Black & White](/black-white) numbers stay hidden, but tracking colours and results narrows the remaining tiles almost exactly in the last few rounds, and then you can compute those rounds backwards.',
            '**Do not assume your opponent is rational to the end.** In structures like the centipede, where cooperating helps both, if the other might think "let’s pass once more", taking straight away may not be best.',
            '**Knowing when the last round comes is power.** In repeated games with a known end, cooperation tends to unravel from the end (see [tit-for-tat](/game-theory/tit-for-tat)). Whoever works out the end first can defect one move earlier.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Ernst Zermelo, "Über eine Anwendung der Mengenlehre auf die Theorie des Schachspiels", Proceedings of the Fifth International Congress of Mathematicians, 1913' },
      { title: 'Robert W. Rosenthal, "Games of Perfect Information, Predatory Pricing and the Chain-Store Paradox", Journal of Economic Theory 25(1), 1981' },
      { title: 'Richard D. McKelvey, Thomas R. Palfrey, "An Experimental Study of the Centipede Game", Econometrica 60(4), 1992', url: 'https://authors.library.caltech.edu/65145' },
      { title: 'Reinhard Selten, "The Chain Store Paradox", Theory and Decision 9, 1978' },
      { title: 'David M. Kreps, Robert Wilson, "Reputation and Imperfect Information", Journal of Economic Theory 27(2), 1982' },
      { title: 'The Nobel Prize in Economic Sciences 1994 (Harsanyi, Nash, Selten)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1994/summary/' },
    ],
  },
};

export default article;
