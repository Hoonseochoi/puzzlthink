"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ListChecks, MessageCircle, Plus, Trash2, Vote, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import AuthButton from './AuthButton';
import { useAuth } from './AuthProvider';

type Option = { id: number; label: string; votes: number };
type Poll = { id: number; title: string; multi: boolean; created_at: string; voters: number; comments: number; options: Option[]; mine: number[] };
type Comment = { id: number; name: string; body: string; created_at: string; mine: boolean };
type Result = { ok: boolean; reason?: string; poll?: Poll };

const ACCENT = '#18a999';
const pct = (poll: Poll, votes: number) => (poll.voters ? Math.round((votes / poll.voters) * 100) : 0);
const ranked = (poll: Poll) => [...poll.options].sort((a, b) => b.votes - a.votes);

async function fetchPolls(): Promise<{ polls: Poll[]; canCreate: boolean; failed: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { polls: [], canCreate: false, failed: false };
  const { data, error } = await supabase.rpc('poll_list', { p_limit: 20 });
  if (error) return { polls: [], canCreate: false, failed: true };
  return { polls: (data?.polls ?? []) as Poll[], canCreate: !!data?.can_create, failed: false };
}

async function fetchComments(pollId: number): Promise<Comment[]> {
  const { data } = (await getSupabase()?.rpc('poll_comments_list', { p_poll: pollId })) ?? {};
  return (data ?? []) as Comment[];
}

/** 설문하기: the newest poll up top with its two leading answers, then every poll with votes and comments. */
export default function PollBoard() {
  const t = useTranslations('Survey');
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPolls().then((r) => {
      if (!alive) return;
      setPolls(r.polls);
      setCanCreate(r.canCreate);
      setError(r.failed ? t('loadError') : null);
    });
    return () => { alive = false; };
  }, [t, user]);

  const replace = (poll: Poll) => setPolls((list) => (list ?? []).map((p) => (p.id === poll.id ? poll : p)));
  const latest = polls?.[0];

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-black"><Vote size={20} style={{ color: ACCENT }} />{t('title')}</h2>
      <p className="mt-1 text-xs text-black/45">{t('desc')}</p>

      {!polls ? <p className="mt-4 text-sm text-black/35">…</p> : latest ? (
        <button
          type="button"
          onClick={() => { setFocus(latest.id); document.getElementById(`poll-${latest.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
          className="mt-4 block w-full rounded-[28px] p-5 text-left text-white shadow-[0_10px_30px_-12px_rgba(24,169,153,.6)] transition hover:brightness-105 sm:p-6"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #0f7f8f)` }}
        >
          <p className="text-[10px] font-black tracking-[0.18em] text-white/70">{t('latest')}</p>
          <h3 className="mt-1.5 break-keep text-xl font-black leading-snug sm:text-2xl">{latest.title}</h3>
          <ol className="mt-4 space-y-2.5">
            {ranked(latest).slice(0, 2).map((o, i) => (
              <li key={o.id}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-black text-white/70">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate text-base font-extrabold">{o.label}</span>
                  <span className="font-mono text-2xl font-black tabular-nums">{pct(latest, o.votes)}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${pct(latest, o.votes)}%`, opacity: i === 0 ? 1 : 0.6 }} />
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-3 text-[11px] font-bold text-white/75">
            <span>{t('voters', { n: latest.voters })}</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} />{latest.comments}</span>
            <span className="ml-auto rounded-full bg-white/20 px-3 py-1 font-black text-white">{latest.mine.length ? t('seeResult') : t('goVote')}</span>
          </p>
        </button>
      ) : !error ? (
        <p className="mt-4 rounded-[24px] border border-dashed border-black/15 bg-[#f9f7f1] p-6 text-center text-sm text-black/45">{t('empty')}</p>
      ) : null}

      {error && <p className="mt-3 text-xs font-bold text-[#e5484d]">{error}</p>}
      {canCreate && <CreatePoll onCreated={(poll) => { setPolls((list) => [poll, ...(list ?? [])]); setFocus(poll.id); }} />}

      {polls && polls.length > 0 && (
        <div className="mt-6 space-y-3">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} open={focus === poll.id} onToggle={() => setFocus((f) => (f === poll.id ? null : poll.id))}
              signedIn={!!user} canManage={canCreate} onChange={replace} onDeleted={() => setPolls((list) => (list ?? []).filter((p) => p.id !== poll.id))} />
          ))}
        </div>
      )}
    </section>
  );
}

function useReason() {
  const t = useTranslations('Survey');
  return (reason?: string) => {
    const known = ['login', 'forbidden', 'title', 'options', 'single', 'missing', 'empty', 'long', 'fast', 'phone', 'rrn', 'email', 'contact', 'link', 'profanity', 'sexual'];
    return t(`reason.${known.includes(reason ?? '') ? reason : 'unknown'}`);
  };
}

/** Creators only: title, checkbox items (add as many as needed), single or multiple choice. */
function CreatePoll({ onCreated }: { onCreated: (poll: Poll) => void }) {
  const t = useTranslations('Survey');
  const reasonText = useReason();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multi, setMulti] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('poll_create', { p_title: title, p_options: options, p_multi: multi });
    setBusy(false);
    const r = data as Result | null;
    if (error || !r?.ok || !r.poll) { setMsg(reasonText(r?.reason)); return; }
    onCreated(r.poll);
    setTitle(''); setOptions(['', '']); setMulti(false); setOpen(false);
  }

  return (
    <div className="mt-4 rounded-[24px] border border-black/10 bg-[#f9f7f1]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-5 py-4 text-sm font-black">
        <Plus size={16} style={{ color: ACCENT }} />{t('create')}
        <ChevronDown size={16} className={`ml-auto text-black/40 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-black/[0.07] px-5 pb-5 pt-4">
          <label className="block">
            <span className="text-[11px] font-black text-black/50">{t('formTitle')}</span>
            <input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder={t('formTitlePlaceholder')}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-black/30" />
          </label>
          <div>
            <span className="text-[11px] font-black text-black/50">{t('formOptions')}</span>
            <ul className="mt-1 space-y-1.5">
              {options.map((o, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-black/15 bg-white" aria-hidden />
                  <input value={o} maxLength={40} onChange={(e) => setOptions((list) => list.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={t('formOptionPlaceholder', { n: i + 1 })}
                    className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-black/30" />
                  {options.length > 2 && (
                    <button type="button" onClick={() => setOptions((list) => list.filter((_, j) => j !== i))} aria-label={t('removeOption')} className="rounded-lg p-1.5 text-black/35 hover:bg-black/5"><X size={15} /></button>
                  )}
                </li>
              ))}
            </ul>
            {options.length < 20 && (
              <button type="button" onClick={() => setOptions((list) => [...list, ''])} className="mt-2 flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-black hover:bg-black/5" style={{ color: ACCENT }}>
                <Plus size={14} />{t('addOption')}
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-black/60">
            <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="h-4 w-4" style={{ accentColor: ACCENT }} />{t('multi')}
          </label>
          {msg && <p className="text-xs font-bold text-[#e5484d]">{msg}</p>}
          <button type="button" disabled={busy} onClick={submit} className="w-full rounded-2xl py-3 text-sm font-black text-white disabled:opacity-50" style={{ background: ACCENT }}>{t('createSubmit')}</button>
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, open, onToggle, signedIn, canManage, onChange, onDeleted }: {
  poll: Poll; open: boolean; onToggle: () => void; signedIn: boolean; canManage: boolean; onChange: (p: Poll) => void; onDeleted: () => void;
}) {
  const t = useTranslations('Survey');
  const reasonText = useReason();
  const [picked, setPicked] = useState<number[]>(poll.mine);
  const [seenMine, setSeenMine] = useState(poll.mine);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');

  if (seenMine !== poll.mine) { setSeenMine(poll.mine); setPicked(poll.mine); }

  const voted = poll.mine.length > 0;
  const changed = picked.length !== poll.mine.length || picked.some((id) => !poll.mine.includes(id));
  const top = ranked(poll)[0];

  const toggle = (id: number) => setPicked((list) => (poll.multi ? (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]) : list.includes(id) ? [] : [id]));

  async function call(fn: string, args: Record<string, unknown>) {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc(fn, args);
    setBusy(false);
    const r = data as Result | null;
    if (error || !r?.ok || !r.poll) { setMsg(reasonText(r?.reason)); return false; }
    onChange(r.poll);
    return true;
  }

  async function remove() {
    if (!confirm(t('deleteConfirm'))) return;
    const { data } = (await getSupabase()?.rpc('poll_delete', { p_poll: poll.id })) ?? {};
    if (data) onDeleted();
  }

  return (
    <article id={`poll-${poll.id}`} className="scroll-mt-24 rounded-[24px] border border-black/10 bg-[#f9f7f1]">
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 px-5 py-4 text-left">
        <ListChecks size={18} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
        <span className="min-w-0 flex-1">
          <span className="block break-keep text-sm font-black">{poll.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold text-black/45">
            {top && poll.voters > 0 && <span className="text-black/70">{t('leading', { label: top.label, pct: pct(poll, top.votes) })}</span>}
            <span>{t('voters', { n: poll.voters })}</span>
            <span className="flex items-center gap-0.5"><MessageCircle size={11} />{poll.comments}</span>
            {poll.multi && <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-black">{t('multiBadge')}</span>}
            {voted && <span className="flex items-center gap-0.5 font-black" style={{ color: ACCENT }}><Check size={11} />{t('votedBadge')}</span>}
          </span>
        </span>
        <ChevronDown size={16} className={`mt-0.5 shrink-0 text-black/40 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-black/[0.07] px-5 pb-5 pt-4">
          <ul className="space-y-2">
            {poll.options.map((o) => {
              const on = picked.includes(o.id);
              const p = pct(poll, o.votes);
              return (
                <li key={o.id}>
                  <button type="button" disabled={!signedIn || busy} onClick={() => toggle(o.id)}
                    className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white px-3 py-2.5 text-left transition ${on ? 'border-transparent ring-2' : 'border-black/10'} ${signedIn ? 'hover:border-black/25' : 'cursor-default'}`}
                    style={on ? { ['--tw-ring-color' as string]: ACCENT } : undefined}>
                    <span className="absolute inset-y-0 left-0 transition-[width] duration-500" style={{ width: `${p}%`, background: `${ACCENT}1f` }} aria-hidden />
                    <span className={`relative grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${on ? 'border-transparent text-white' : 'border-black/20'}`} style={on ? { background: ACCENT } : undefined}>
                      {on && <Check size={13} strokeWidth={3.5} />}
                    </span>
                    <span className="relative min-w-0 flex-1 truncate text-sm font-extrabold">{o.label}</span>
                    <span className="relative shrink-0 font-mono text-xs font-black text-black/60 tabular-nums">{p}%</span>
                    <span className="relative w-10 shrink-0 text-right font-mono text-[10px] font-bold text-black/35">{t('votes', { n: o.votes })}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {signedIn ? (
            <div className="mt-3 flex items-center gap-2">
              <button type="button" disabled={busy || !changed || (!picked.length && !voted)} onClick={() => call('poll_vote', { p_poll: poll.id, p_options: picked })}
                className="rounded-2xl px-5 py-2.5 text-sm font-black text-white disabled:opacity-40" style={{ background: ACCENT }}>
                {!picked.length && voted ? t('unvote') : voted ? t('revote') : t('vote')}
              </button>
              <span className="text-[11px] text-black/40">{poll.multi ? t('multiHint') : t('singleHint')}</span>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <span className="text-xs font-bold text-black/55">{t('loginToVote')}</span>
              <AuthButton source="records" />
            </div>
          )}
          {msg && <p className="mt-2 text-xs font-bold text-[#e5484d]">{msg}</p>}

          {canManage && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-black/15 px-3 py-2.5">
              <input value={newOption} maxLength={40} onChange={(e) => setNewOption(e.target.value)} placeholder={t('addOptionPlaceholder')}
                className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold outline-none" />
              <button type="button" disabled={busy || !newOption.trim()} onClick={async () => { if (await call('poll_add_option', { p_poll: poll.id, p_label: newOption })) setNewOption(''); }}
                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black text-white disabled:opacity-40" style={{ background: ACCENT }}><Plus size={13} />{t('addOption')}</button>
              <button type="button" onClick={remove} className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black text-[#e5484d] hover:bg-[#e5484d]/10"><Trash2 size={13} />{t('deletePoll')}</button>
            </div>
          )}

          <Comments pollId={poll.id} signedIn={signedIn} canManage={canManage} onCount={(n) => n !== poll.comments && onChange({ ...poll, comments: n })} />
        </div>
      )}
    </article>
  );
}

function Comments({ pollId, signedIn, canManage, onCount }: { pollId: number; signedIn: boolean; canManage: boolean; onCount: (n: number) => void }) {
  const t = useTranslations('Survey');
  const reasonText = useReason();
  const [list, setList] = useState<Comment[] | null>(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const show = (rows: Comment[]) => { setList(rows); onCount(rows.length); };
  const load = () => fetchComments(pollId).then(show);

  useEffect(() => {
    let alive = true;
    fetchComments(pollId).then((rows) => { if (alive) { setList(rows); onCount(rows.length); } });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onCount is a fresh closure each render; reload only per poll / sign-in
  }, [pollId, signedIn]);

  async function send() {
    const supabase = getSupabase();
    if (!supabase || !body.trim()) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('poll_comment', { p_poll: pollId, p_body: body });
    setBusy(false);
    const r = data as Result | null;
    if (error || !r?.ok) { setMsg(reasonText(r?.reason)); return; }
    setBody('');
    load();
  }

  async function remove(id: number) {
    await getSupabase()?.rpc('poll_comment_delete', { p_id: id });
    load();
  }

  return (
    <div className="mt-5 border-t border-black/[0.07] pt-4">
      <p className="flex items-center gap-1.5 text-xs font-black text-black/55"><MessageCircle size={13} />{t('comments', { n: list?.length ?? 0 })}</p>
      {signedIn ? (
        <div className="mt-2 flex gap-2">
          <input value={body} maxLength={200} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(); }}
            placeholder={t('commentPlaceholder')} className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30" />
          <button type="button" disabled={busy || !body.trim()} onClick={send} className="shrink-0 rounded-xl px-4 text-xs font-black text-white disabled:opacity-40" style={{ background: ACCENT }}>{t('commentSend')}</button>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-black/45">{t('loginToComment')}</p>
      )}
      {msg && <p className="mt-1.5 text-xs font-bold text-[#e5484d]">{msg}</p>}
      <ul className="mt-3 space-y-2">
        {!list ? <li className="text-xs text-black/35">…</li> : list.length === 0 ? <li className="text-[11px] text-black/35">{t('noComments')}</li> : list.map((c) => (
          <li key={c.id} className="group flex gap-2 rounded-xl bg-white px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="text-[11px] font-black text-black/60">{c.name}</span>
              <span className="ml-1.5 text-[10px] text-black/30">{new Date(c.created_at).toLocaleDateString()}</span>
              <span className="mt-0.5 block break-words text-sm">{c.body}</span>
            </span>
            {(c.mine || canManage) && (
              <button type="button" onClick={() => remove(c.id)} aria-label={t('deleteComment')} className="self-start rounded-lg p-1 text-black/25 hover:bg-black/5 hover:text-[#e5484d]"><Trash2 size={13} /></button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
