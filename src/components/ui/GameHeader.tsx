import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HEADER, STEEL_TEXT, SUBTITLE } from './gameUi';

/** Game-page top bar in the 벽바둑 style: back link · steel title · accent subtitle, actions on the right. */
export default function GameHeader({ backHref, backLabel, title, titleClass = 'font-black', subtitle, children }: {
  backHref: string; backLabel: string; title: ReactNode; titleClass?: string; subtitle?: ReactNode; children?: ReactNode;
}) {
  return (
    <header className={HEADER}>
      <div className="flex min-w-0 items-center gap-3">
        <Link href={backHref} className="flex shrink-0 items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">{backLabel}</span></Link>
        <span className="h-5 w-px shrink-0 bg-white/15" />
        <div className="min-w-0 truncate">
          <strong className={`${titleClass} ${STEEL_TEXT} text-xl tracking-[0.12em]`}>{title}</strong>
          {subtitle && <span className={`ml-2 ${SUBTITLE}`}>{subtitle}</span>}
        </div>
      </div>
      {children && <div className="flex shrink-0 items-center gap-1.5">{children}</div>}
    </header>
  );
}
