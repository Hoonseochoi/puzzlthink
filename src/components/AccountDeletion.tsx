"use client";

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, UserX } from 'lucide-react';
import { useAuth } from './AuthProvider';
import AuthButton from './AuthButton';
import { getSupabase } from '@/lib/supabase';

const COPY = {
  ko: {
    signedOut: '로그인하면 이 화면에서 바로 탈퇴할 수 있어요. 로그인할 수 없다면 아래 메일로 요청해 주세요.',
    lead: '탈퇴하면 계정과 아래 정보가 바로 삭제되고 되돌릴 수 없어요.',
    type: '확인을 위해 아래 칸에 탈퇴라고 입력해 주세요.', word: '탈퇴', button: '회원탈퇴',
    done: '탈퇴가 끝났어요. 그동안 PUZZLTHINK를 즐겨 주셔서 고마워요.',
    failed: '탈퇴를 처리하지 못했어요. 잠시 뒤 다시 시도하거나 메일로 요청해 주세요.',
  },
  en: {
    signedOut: 'Sign in to delete your account right here. If you cannot sign in, ask by email below.',
    lead: 'Deleting removes your account and the data below at once. It cannot be undone.',
    type: 'To confirm, type DELETE below.', word: 'DELETE', button: 'Delete my account',
    done: 'Your account has been deleted. Thank you for playing PUZZLTHINK.',
    failed: 'We could not delete the account. Try again later, or ask by email.',
  },
} as const;

/**
 * Self-service 회원탈퇴 on /account-deletion (website and Google Play app). Calls delete_my_account
 * (supabase/migrations/20271128000000_account_deletion.sql), then signs out.
 */
export default function AccountDeletion() {
  const c = COPY[useLocale() === 'en' ? 'en' : 'ko'];
  const { user, ready, configured, signOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed'>('idle');

  if (state === 'done') return <p className="mt-8 rounded-2xl bg-white p-5 text-sm font-bold leading-6">{c.done}</p>;
  if (!ready || !configured) return null;
  if (!user) {
    return (
      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5">
        <p className="break-keep text-sm leading-6 text-black/60">{c.signedOut}</p>
        <div className="mt-3"><AuthButton source="other" /></div>
      </div>
    );
  }

  const remove = async () => {
    setState('busy');
    const { error } = await getSupabase()!.rpc('delete_my_account', { p_confirm: 'DELETE' });
    if (error) { setState('failed'); return; }
    await signOut();
    setState('done');
  };

  return (
    <div className="mt-8 rounded-2xl border border-[#e5484d]/30 bg-white p-5">
      <p className="break-keep text-sm font-bold leading-6">{c.lead}</p>
      <label className="mt-4 block text-xs font-bold text-black/55">{c.type}
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={c.word} autoComplete="off"
          className="mt-1.5 w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-[#e5484d]" />
      </label>
      <button type="button" disabled={typed.trim() !== c.word || state === 'busy'} onClick={remove}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e5484d] px-5 py-2.5 text-sm font-black text-white disabled:opacity-35">
        {state === 'busy' ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}{c.button}
      </button>
      {state === 'failed' && <p className="mt-3 text-xs font-bold text-[#e5484d]">{c.failed}</p>}
    </div>
  );
}
