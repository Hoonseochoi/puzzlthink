// What players see of each AI personality: a one-line blurb at the table, the style revealed on the result screen,
// and a few lines of table talk. The talk is chosen from the move's sequence number, so every browser in a room shows
// the same line.
import type { ShStyle } from '@/lib/sniperHoldemAi';

export type TalkEvent = 'raise' | 'allin' | 'fold' | 'snipe' | 'hit' | 'sniped' | 'win' | 'safe';
type Lines = Partial<Record<TalkEvent, string[]>>;
type PersonaCopy = { blurb: string; style: string; talk: Lines };

const KO: Record<ShStyle, PersonaCopy> = {
  ace: { blurb: '숫자만 믿는 계산기', style: '계산형 · 확률과 판돈 비율로만 움직이고, 저격도 기댓값대로 해요',
    talk: { raise: ['계산 끝났어요.'], snipe: ['확률상 이거예요.'], hit: ['예상대로네요.'], sniped: ['오차 범위였어요.'], win: ['수학은 거짓말을 안 해요.'] } },
  viper: { blurb: '조용히 기다리다 한 번에 문다', style: '독사 · 강한 패도 콜로 숨기고(슬로플레이), 큰 판에서만 저격해요',
    talk: { raise: ['이제 시작이에요.'], snipe: ['기다렸어요.'], hit: ['물었다.'], win: ['천천히, 확실하게.'], fold: ['아직은 아니에요.'] } },
  owl: { blurb: '좋은 패가 올 때까지 미동도 없다', style: '바위 · 타이트하게 접고, 저격은 거의 하지 않아요',
    talk: { fold: ['패스.'], raise: ['…이번엔 가요.'], win: ['기다린 보람이 있네요.'], sniped: ['이럴 줄 알았어요.'] } },
  jinx: { blurb: '거짓말이 진심보다 많다', style: '사기꾼 · 패 없이 레이즈하고, 보드가 무서우면 그 족보인 척, 자기 족보를 저격해 덮기도 해요',
    talk: { raise: ['오, 이번 패 좋은데요?', '받을 자신 있어요?'], snipe: ['이건 그냥 장난이에요.', '진짜일까요?'], hit: ['어머, 맞았네.'], sniped: ['들켰다!'], win: ['연기 어땠어요?'] } },
  mono: { blurb: '일단 따라가고 본다', style: '콜링 스테이션 · 웬만하면 콜하고, 보드에 보이는 족보를 저격해요',
    talk: { raise: ['저도 좀 걸어볼게요.'], snipe: ['보드에 다 보이던데요?'], hit: ['그쵸?'], sniped: ['아 그걸 맞히네.'], win: ['끝까지 따라간 보람!'] } },
  rex: { blurb: '칩이 많으면 테이블을 민다', style: '불도저 · 칩이 가장 많으면 크게 밀어붙이고, 큰 금액을 좋아해요',
    talk: { raise: ['따라올 수 있으면 와요.'], allin: ['전부 걸어요.'], snipe: ['그 족보, 지워요.'], win: ['힘이 곧 정답.'], sniped: ['한 번 봐준 거예요.'] } },
  luna: { blurb: '저격은 많이 쏠수록 맞는다', style: '난사꾼 · 루즈하게 많이 참여하고, 기회만 되면 저격해요',
    talk: { snipe: ['탕!', '이것도 맞을걸요?'], hit: ['거봐요!'], sniped: ['억울해요!'], raise: ['재밌겠다!'], win: ['운도 실력!'] } },
  echo: { blurb: '당신이 한 대로 돌려준다', style: '거울 · 상대가 지난 판에 보여준 베팅·저격 버릇을 가장 잘 읽고 맞춰가요',
    talk: { raise: ['지난번에도 그랬죠?'], snipe: ['그 버릇, 봤어요.'], hit: ['패턴이 보였어요.'], fold: ['이번엔 읽혔네요.'], win: ['배운 대로.'] } },
  mint: { blurb: '겁은 많지만 눈은 밝다', style: '겁쟁이 저격수 · 베팅은 소심하게, 저격은 보드의 족보를 정확히 노려요',
    talk: { fold: ['무서워서 접을래요.'], snipe: ['보드가 말해주고 있어요.'], hit: ['헉, 진짜였어요?'], win: ['소심한 게 이겼다!'], sniped: ['역시 무서웠어…'] } },
  bolt: { blurb: '올인이 아니면 재미없다', style: '올인러 · 걸 때는 크게(자주 올인), 아니면 접어요',
    talk: { allin: ['올인!', '다 걸어요!'], raise: ['크게 가죠.'], fold: ['다음 판에 올인할게요.'], win: ['이 맛에 올인!'], sniped: ['펑…'] } },
};

const EN: Record<ShStyle, PersonaCopy> = {
  ace: { blurb: 'A calculator that trusts numbers', style: 'Calculator · moves by odds and pot price; snipes by expected value',
    talk: { raise: ['Numbers say yes.'], snipe: ['Probability says this.'], hit: ['As expected.'], sniped: ['Within the margin.'], win: ['Math does not lie.'] } },
  viper: { blurb: 'Waits quietly, then strikes once', style: 'Viper · slow-plays strong hands with calls; snipes only in big pots',
    talk: { raise: ['Now it starts.'], snipe: ['I waited for this.'], hit: ['Got you.'], win: ['Slow and sure.'], fold: ['Not yet.'] } },
  owl: { blurb: 'Does not move until the hand is good', style: 'Rock · folds tight and almost never snipes',
    talk: { fold: ['Pass.'], raise: ['…This time, yes.'], win: ['Worth the wait.'], sniped: ['Knew it.'] } },
  jinx: { blurb: 'More lies than truths', style: 'Trickster · raises without the hand, plays the scary board hand, covers with feints and self-snipes',
    talk: { raise: ['Ooh, nice hand this time?', 'Brave enough to call?'], snipe: ['Just for fun.', 'Is it real?'], hit: ['Oh, it hit.'], sniped: ['Busted!'], win: ['How was my acting?'] } },
  mono: { blurb: 'Calls first, asks later', style: 'Calling station · calls almost anything; snipes the hand on the board',
    talk: { raise: ['I will put some in too.'], snipe: ['It was right there on the board.'], hit: ['Right?'], sniped: ['You got that?'], win: ['Following paid off!'] } },
  rex: { blurb: 'With chips, it pushes the table', style: 'Bulldozer · pushes hard with the biggest stack; loves big amounts',
    talk: { raise: ['Follow if you can.'], allin: ['Everything in.'], snipe: ['Erase that hand.'], win: ['Might is right.'], sniped: ['I let you have that.'] } },
  luna: { blurb: 'Shoot often, hit often', style: 'Trigger-happy · plays loose and snipes at every chance',
    talk: { snipe: ['Bang!', 'This one hits too.'], hit: ['Told you!'], sniped: ['Not fair!'], raise: ['This will be fun!'], win: ['Luck is a skill!'] } },
  echo: { blurb: 'Gives back what you showed', style: 'Mirror · reads best what each opponent showed in earlier rounds',
    talk: { raise: ['You did that last time too.'], snipe: ['I saw that habit.'], hit: ['The pattern showed.'], fold: ['Read me this time.'], win: ['As learned.'] } },
  mint: { blurb: 'Scared, but sharp-eyed', style: 'Nervous sniper · timid bets, precise snipes of the board hand',
    talk: { fold: ['Too scary, fold.'], snipe: ['The board is telling me.'], hit: ['Wait, really?'], win: ['Timid wins!'], sniped: ['I knew it was scary…'] } },
  bolt: { blurb: 'All in or bored', style: 'All-in lover · bets big (often all in) or folds',
    talk: { allin: ['All in!', 'Everything!'], raise: ['Going big.'], fold: ['All in next hand.'], win: ['This is why I shove!'], sniped: ['Boom…'] } },
};

export const personaCopy = (style: ShStyle, locale: string): PersonaCopy => (locale === 'en' ? EN : KO)[style] ?? KO.ace;

/** A line for this event, or null (not every move talks: about half of them, picked by the move's number). */
export function talkLine(style: ShStyle, locale: string, event: TalkEvent, seq: number): string | null {
  const lines = personaCopy(style, locale).talk[event] ?? (event === 'allin' ? personaCopy(style, locale).talk.raise : undefined);
  if (!lines?.length) return null;
  const always = event === 'snipe' || event === 'hit' || event === 'sniped' || event === 'allin';
  if (!always && (seq * 2654435761 >>> 0) % 100 >= 45) return null;
  return lines[seq % lines.length];
}
