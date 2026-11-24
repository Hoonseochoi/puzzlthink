"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Wrench } from 'lucide-react';

/** Planned server work window (KST). The band shows only until it ends, so it can stay in the code without lying afterwards. */
const UNTIL = Date.parse('2026-11-24T10:40:00+09:00');

/** Black strip under the logo bar with a scrolling maintenance notice. */
export default function MaintenanceBand() {
  const t = useTranslations('Common');
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => setShow(Date.now() < UNTIL);
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!show) return null;
  const text = t('maintenanceNotice');
  return (
    <div role="status" aria-label={text} className="overflow-hidden bg-[#111] py-1.5 text-[12px] font-bold text-[#ffd76a]">
      <div aria-hidden className="flex w-max animate-[maintScroll_22s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((k) => (
          <span key={k} className="flex shrink-0 items-center gap-2 whitespace-nowrap pr-16"><Wrench size={13} className="shrink-0" />{text}</span>
        ))}
      </div>
    </div>
  );
}
