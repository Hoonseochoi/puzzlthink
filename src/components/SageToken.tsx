"use client";

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { Piece } from './CompetitionBoard';
import { payWith, periodPieces } from '@/lib/pieceWallet';

/**
 * 현자의 징표 (Sage's Token): what a finished 피스 경쟁전 week's unspent pieces become, 1:1, kept for good.
 * An isometric cube cut like a jewel: three amethyst faces (light top, mid left, deep right), a gold rim on every
 * edge, and from 28 px up an inner facet on each face, the 피스 meander engraved on the top and a glint.
 * Below 28 px only the faces, the rim and a dark outline, so it still reads as a cube at 14 px. Pure SVG, no blur.
 */
export function SageToken({ size = 18, className = '', title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/:/g, '');
  const rich = size >= 28;
  // Cube corners in a 100×100 box: top, right, right-bottom, bottom, left-bottom, left, and the near corner C.
  const T = [50, 7], R = [88, 28.5], RB = [88, 71.5], B = [50, 93], LB = [12, 71.5], L = [12, 28.5], C = [50, 50];
  const pts = (...p: number[][]) => p.map((q) => q.join(',')).join(' ');
  /** A face shrunk toward its own centre (the inner facet). */
  const inset = (k: number, ...p: number[][]) => {
    const cx = p.reduce((a, q) => a + q[0], 0) / p.length, cy = p.reduce((a, q) => a + q[1], 0) / p.length;
    return pts(...p.map(([x, y]) => [Math.round((cx + (x - cx) * k) * 10) / 10, Math.round((cy + (y - cy) * k) * 10) / 10]));
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`inline-block shrink-0 ${className}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}t`} x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#fbf6ff" /><stop offset="0.55" stopColor="#d9c4ff" /><stop offset="1" stopColor="#a985ff" /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a37bff" /><stop offset="0.6" stopColor="#6c3fe0" /><stop offset="1" stopColor="#4520a8" /></linearGradient>
        <linearGradient id={`${id}r`} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a2fc9" /><stop offset="0.6" stopColor="#331386" /><stop offset="1" stopColor="#1d0a55" /></linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6c8" /><stop offset="0.5" stopColor="#ffd35c" /><stop offset="1" stopColor="#c9901a" /></linearGradient>
      </defs>
      {/* ground shadow, then the dark outline that keeps it legible small */}
      {rich && <ellipse cx="50" cy="95" rx="30" ry="4" fill="#1a0a4a" opacity=".22" />}
      <polygon points={pts(T, R, RB, B, LB, L)} fill="#1a0a4a" stroke="#1a0a4a" strokeWidth={rich ? 5 : 9} strokeLinejoin="round" />
      <polygon points={pts(T, R, C, L)} fill={`url(#${id}t)`} />
      <polygon points={pts(L, C, B, LB)} fill={`url(#${id}l)`} />
      <polygon points={pts(C, R, RB, B)} fill={`url(#${id}r)`} />
      {rich && (
        <>
          {/* inner facets: each face cut once more, lighter toward the light (top-left) */}
          <polygon points={inset(0.56, T, R, C, L)} fill="#ffffff" opacity=".42" />
          <polygon points={inset(0.56, L, C, B, LB)} fill="#c7b0ff" opacity=".28" />
          <polygon points={inset(0.56, C, R, RB, B)} fill="#7b55e6" opacity=".35" />
          {/* the 피스 meander engraved on the top face (drawn flat, then laid into the iso plane) */}
          <g transform="translate(50 28.6) scale(1 0.565) rotate(45) scale(0.42) translate(-22 -14)">
            <path d="M4 25 V4 H16 V24 H28 V4 H40 V25" fill="none" stroke={`url(#${id}g)`} strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" />
          </g>
        </>
      )}
      {/* gold rim on the outer and the three near edges */}
      <polygon points={pts(T, R, RB, B, LB, L)} fill="none" stroke={`url(#${id}g)`} strokeWidth={rich ? 2.6 : 5} strokeLinejoin="round" />
      <polyline points={pts(L, C, R)} fill="none" stroke={`url(#${id}g)`} strokeWidth={rich ? 2.2 : 4.2} strokeLinejoin="round" />
      <line x1={C[0]} y1={C[1]} x2={B[0]} y2={B[1]} stroke={`url(#${id}g)`} strokeWidth={rich ? 2.2 : 4.2} />
      {rich && (
        <>
          {/* glint on the near corner and a sparkle off the top */}
          <path d="M50 44 L51.6 48.4 L56 50 L51.6 51.6 L50 56 L48.4 51.6 L44 50 L48.4 48.4 Z" fill="#ffffff" />
          <path d="M80 9 L81.1 12.4 L84.5 13.5 L81.1 14.6 L80 18 L78.9 14.6 L75.5 13.5 L78.9 12.4 Z" fill="#fff6c8" />
          <path d="M18 33 L44 18" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** "[cube] ×12", small. */
export function TokenCount({ n, size = 14, className = '' }: { n: number; size?: number; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1 font-mono font-black ${className}`}><SageToken size={size} /><span className="opacity-40">×</span>{n}</span>;
}

/**
 * The cost of a 피스 spend as it will be paid: "징표 1" with the cube while the member has tokens (they go first),
 * otherwise "피스 1". `wallet.pieces` is spendable (tokens + this week's pieces), as every RPC reports it.
 */
export function PieceCost({ wallet, n = 1, size = 11, className = '' }: { wallet: { pieces?: number | null; tokens?: number | null }; n?: number; size?: number; className?: string }) {
  const t = useTranslations('Tokens');
  return payWith(wallet) === 'token'
    ? <span className={`inline-flex items-center gap-1 ${className}`}><SageToken size={size + 2} />{t('costToken', { n })}</span>
    : <span className={`inline-flex items-center gap-1 ${className}`}><Piece size={size} />{t('costPiece', { n })}</span>;
}

/** "징표 3 · 피스 2" — what the member holds, tokens first. */
export function WalletHeld({ wallet, size = 11, className = '' }: { wallet: { pieces?: number | null; tokens?: number | null }; size?: number; className?: string }) {
  const t = useTranslations('Tokens');
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5"><SageToken size={size + 2} />{t('heldToken', { n: wallet.tokens ?? 0 })}</span>
      <span className="opacity-40">·</span>
      <span className="inline-flex items-center gap-0.5"><Piece size={size} />{t('heldPiece', { n: periodPieces(wallet) })}</span>
    </span>
  );
}

/**
 * The exchange: three pieces slide into the cube, the cube pulses and shows the count. Pure CSS; with reduced motion
 * it simply shows the end state.
 */
export function TokenExchange({ n, size = 96 }: { n: number; size?: number }) {
  return (
    <div className="token-ex relative mx-auto flex items-center justify-center" style={{ height: size + 24, width: size * 2.4 }} aria-hidden>
      <style>{`
        @keyframes tokenExFly { 0% { transform: translateX(0) scale(1); opacity: 0 } 15% { opacity: 1 } 70% { opacity: 1 } 100% { transform: translateX(var(--to)) scale(.35); opacity: 0 } }
        @keyframes tokenExPulse { 0%, 55% { transform: scale(.86) } 70% { transform: scale(1.12) } 85% { transform: scale(.97) } 100% { transform: scale(1) } }
        @keyframes tokenExRing { 0%, 60% { transform: scale(.6); opacity: 0 } 70% { opacity: .9 } 100% { transform: scale(1.6); opacity: 0 } }
        @keyframes tokenExCount { 0%, 72% { transform: translateY(6px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
        .token-ex .fly { animation: tokenExFly 1.5s cubic-bezier(.5,0,.6,1) both }
        .token-ex .cube { animation: tokenExPulse 1.6s ease-out both }
        .token-ex .ring { animation: tokenExRing 1.6s ease-out both }
        .token-ex .count { animation: tokenExCount 1.7s ease-out both }
        @media (prefers-reduced-motion: reduce) { .token-ex .fly { display: none } .token-ex .cube, .token-ex .ring, .token-ex .count { animation: none } .token-ex .ring { opacity: 0 } }
      `}</style>
      {[0, 1, 2].map((i) => (
        <span key={i} className="fly absolute" style={{ left: 0, top: size / 2 + 2 + (i - 1) * 18, animationDelay: `${i * 0.12}s`, ['--to' as string]: `${size * 1.2}px` }}><Piece size={16} /></span>
      ))}
      <span className="ring absolute rounded-full border-2 border-[#ffd35c]" style={{ width: size, height: size, left: size * 1.2 - size / 2 + 8, top: 12 }} />
      <span className="cube absolute" style={{ left: size * 1.2 - size / 2 + 8, top: 12 }}><SageToken size={size} /></span>
      <span className="count absolute bottom-0 right-0 rounded-full bg-[#ffd35c] px-2 py-0.5 font-mono text-sm font-black text-[#2a1460]">×{n}</span>
    </div>
  );
}
