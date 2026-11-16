"use client";

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';

const HIDE_ON = ['/play', '/wallgo', '/login'];

export default function GlobalFooter() {
  const pathname = usePathname();
  if (HIDE_ON.some((segment) => pathname?.includes(segment))) return null;
  return <footer className="border-t border-black/[0.07] bg-[#f3f0e8]"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:text-left"><div><p className="text-sm font-black tracking-[-0.03em]">PUZZL THINK</p><p className="mt-1 text-[11px] text-black/40">작게 시작해서, 오래 생각하는 게임들.</p></div><div className="flex items-center gap-5 text-[11px] font-bold text-black/45"><Link href="/wallgo" className="hover:text-black">벽바둑</Link><Link href="/play" className="hover:text-black">스도쿠</Link><span>© {new Date().getFullYear()}</span></div></div></footer>;
}
