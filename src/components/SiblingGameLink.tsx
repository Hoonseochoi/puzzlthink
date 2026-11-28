import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

/**
 * A one-line link from a game's entry screen to a game people often mix it up with (컬러 잇기 ↔ 컬러 링크,
 * 히든 워드 → 라이어), so a visitor who landed on the wrong one is one tap away and search engines see the pair.
 * Dark entry screens only (GameGate's hero slot).
 */
export default function SiblingGameLink({ href, name, note, accent }: { href: string; name: string; note: string; accent: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70 transition hover:border-white/30 hover:text-white">
      <span className="min-w-0 break-keep"><b className="font-black" style={{ color: accent }}>{name}</b> · {note}</span>
      <ArrowRight size={16} className="shrink-0 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
