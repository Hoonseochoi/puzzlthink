import type { Metadata } from 'next';
import WallGoGame from '@/components/WallGoGame';

export const metadata: Metadata = {
  title: '벽바둑 — AI와 즐기는 영역 전략 게임',
  description: '말을 이동하고 벽을 세워 가장 넓은 영역을 확보하세요. 7×7 보드에서 두 명의 AI와 겨루는 3인 전략 게임입니다.',
};

export default function WallGoPage() {
  return <WallGoGame />;
}
