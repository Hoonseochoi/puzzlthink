"use client";

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const AUTH_SUCCESS_MESSAGE = 'SUPABASE_AUTH_SUCCESS';

function AuthCompleteContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.opener) {
      window.opener.postMessage({ type: AUTH_SUCCESS_MESSAGE }, window.location.origin);
      window.close();
    } else {
      window.location.href = next;
    }
  }, [next]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <p className="text-slate-600 dark:text-slate-400">
        로그인 완료. 이 창을 닫아주세요.
      </p>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
      </div>
    }>
      <AuthCompleteContent />
    </Suspense>
  );
}
