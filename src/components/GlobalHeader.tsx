"use client";

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Grid2X2, Menu } from 'lucide-react';

const HIDE_ON = ['/play', '/wallgo', '/login'];

export default function GlobalHeader() {
  const pathname = usePathname();
  if (HIDE_ON.some((segment) => pathname?.includes(segment))) return null;
  return <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-[#f3f0e8]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
    <Link href="/" className="flex items-center gap-2.5"><span className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-[10px] bg-[#17201e] p-2"><i className="rounded-sm bg-[#ff6b4a]" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-[#f2c14e]" /></span><span className="text-sm font-black tracking-[-0.03em]">PUZZL THINK</span></Link>
    <nav className="hidden items-center gap-1 sm:flex"><Link href="/" className="rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black">게임</Link><Link href="/wallgo" className="rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black">벽바둑</Link><Link href="/play" className="rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black">스도쿠</Link></nav>
    <Link href="/wallgo" className="hidden items-center gap-2 rounded-full bg-[#17201e] px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 sm:flex"><Grid2X2 size={14} /> 바로 플레이</Link><Menu className="sm:hidden" size={20} />
  </div></header>;
}
