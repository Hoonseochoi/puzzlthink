import HomeClient from '@/components/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PUZZL THINK — 생각이 머무는 작은 게임들',
  description: '벽바둑과 스도쿠를 바로 즐겨보세요. 기다림 없이 시작하는 깔끔한 온라인 보드게임 컬렉션입니다.',
};

export default function HomePage() {
  return <HomeClient />;
}
