"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { EscapeStory, EscapeProgress } from '@/types/escape';
import type { User } from '@supabase/supabase-js';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import CaseRoomBox from './CaseRoomBox';
import ClueBox from './ClueBox';
import CharacterBox from './CharacterBox';
import CriminalSelectButton from './CriminalSelectButton';
import HintButton from './HintButton';
import ClearTimeDisplay from './ClearTimeDisplay';
import StorySummary from './StorySummary';
import ProgressBar from './ProgressBar';
import ClearResultScreen from './ClearResultScreen';
import AudioToggle from './AudioToggle';
import EscapePanelTabs, { type TabId } from './EscapePanelTabs';
import DialogueBox from './DialogueBox';
import FloorPlanView from './FloorPlanView';
import RoomView from './RoomView';
import LivingRoomPanel from './LivingRoomPanel';
import { cn } from '@/lib/utils';

const SAVE_KEY = 'puzzlthink_escape_progress';
/** 평면도 화면 재생 테마 BGM */
const FLOOR_PLAN_THEME_URL = '/story/theme.mp3';

function loadProgress(storyId: string): Partial<EscapeProgress> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as EscapeProgress;
    if (data.storyId !== storyId) return null;
    return data;
  } catch {
    return null;
  }
}

function saveProgress(progress: EscapeProgress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...progress, savedAt: Date.now() }));
  } catch {}
}

function clearProgress(storyId: string) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as EscapeProgress;
    if (data.storyId === storyId) localStorage.removeItem(SAVE_KEY);
  } catch {}
}

type Props = { story: EscapeStory };

export default function EscapeRoomClient({ story }: Props) {
  const t = useTranslations('Escape');
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [revealedCharacterIds, setRevealedCharacterIds] = useState<string[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [clearTime, setClearTime] = useState<number | null>(null);
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [entrySummaryShown, setEntrySummaryShown] = useState(false);
  const [wrongCriminal, setWrongCriminal] = useState(false);
  const [mobileTab, setMobileTab] = useState<TabId>('clues');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showChapter0Modal, setShowChapter0Modal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [hasEnteredLivingRoom, setHasEnteredLivingRoom] = useState(false);
  const [hasReturnedFromBath, setHasReturnedFromBath] = useState(false);
  const [selectedLivingCharacterId, setSelectedLivingCharacterId] = useState<string | null>(null);
  const [answeredLivingFollowUps, setAnsweredLivingFollowUps] = useState<{ characterId: string; questionIndex: number }[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

  // 타이틀 화면 BGM: 반복 재생, 사건 해결하기 진입 시 자동 정지
  useEffect(() => {
    if (!showStartScreen || !story.startScreenBgm) return;
    const audio = new Audio(story.startScreenBgm);
    audio.loop = true;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showStartScreen, story.startScreenBgm]);

  // 평면도 화면 테마 BGM: 평면도가 보일 때만 재생, 방 입장 시 정지
  const hasRooms = (story.rooms?.length ?? 0) > 0;
  useEffect(() => {
    if (showStartScreen || !hasRooms || currentRoomId != null) return;
    const audio = new Audio(FLOOR_PLAN_THEME_URL);
    audio.loop = true;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showStartScreen, hasRooms, currentRoomId]);

  const isCleared = clearTime != null;
  const hasStarted = startTime != null;

  const startGame = useCallback(() => {
    if (startTime != null) return;
    setStartTime(Date.now());
  }, [startTime]);

  const addClue = useCallback(
    (clueId: string) => {
      if (foundClueIds.includes(clueId)) return;
      setFoundClueIds((prev) => [...prev, clueId]);
      startGame();
    },
    [foundClueIds, startGame]
  );

  const handleAnswerCorrect = useCallback((questionId: string, revealCharacterId?: string) => {
    setAnsweredQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
    if (revealCharacterId) {
      setRevealedCharacterIds((prev) => (prev.includes(revealCharacterId) ? prev : [...prev, revealCharacterId]));
    }
  }, []);

  const handleCriminalSelect = useCallback(
    (characterId: string) => {
      if (story.correctCriminalId === characterId) {
        setClearTime(Date.now());
      } else {
        setWrongCriminal(true);
        setTimeout(() => setWrongCriminal(false), 2000);
      }
    },
    [story.correctCriminalId]
  );

  const selectedClue = story.clues.find((c) => c.id === selectedClueId) ?? null;
  const rooms = story.rooms ?? [];
  const currentRoom = currentRoomId ? rooms.find((r) => r.id === currentRoomId) ?? null : null;
  const cluesInCurrentRoom = currentRoomId ? story.clues.filter((c) => c.roomId === currentRoomId) : [];

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load saved progress only when logged in (이어하기)
  useEffect(() => {
    if (!user) return;
    const saved = loadProgress(story.id);
    if (!saved) return;
    if (saved.foundClueIds?.length) setFoundClueIds(saved.foundClueIds);
    if (saved.revealedCharacterIds?.length) setRevealedCharacterIds(saved.revealedCharacterIds);
    if (saved.answeredQuestionIds?.length) setAnsweredQuestionIds(saved.answeredQuestionIds);
    if (saved.hintIndex != null) setHintIndex(saved.hintIndex);
    if (saved.startTime != null && saved.startTime > 0) setStartTime(saved.startTime);
    if (saved.clearTime != null) setClearTime(saved.clearTime);
  }, [story.id, user]);

  const resetState = useCallback(() => {
    setFoundClueIds([]);
    setRevealedCharacterIds([]);
    setAnsweredQuestionIds([]);
    setHintIndex(0);
    setStartTime(null);
    setClearTime(null);
    setSelectedClueId(null);
    setCurrentRoomId(null);
    setEntrySummaryShown(false);
  }, []);

  const applySaved = useCallback((saved: Partial<EscapeProgress>) => {
    if (saved.foundClueIds?.length) setFoundClueIds(saved.foundClueIds);
    if (saved.revealedCharacterIds?.length) setRevealedCharacterIds(saved.revealedCharacterIds);
    if (saved.answeredQuestionIds?.length) setAnsweredQuestionIds(saved.answeredQuestionIds);
    if (saved.hintIndex != null) setHintIndex(saved.hintIndex);
    if (saved.startTime != null && saved.startTime > 0) setStartTime(saved.startTime);
    if (saved.clearTime != null) setClearTime(saved.clearTime);
  }, []);

  // Persist progress
  useEffect(() => {
    const progress: EscapeProgress = {
      storyId: story.id,
      foundClueIds,
      revealedCharacterIds,
      answeredQuestionIds,
      hintIndex,
      startTime: startTime ?? 0,
      clearTime: clearTime ?? undefined,
      savedAt: Date.now(),
    };
    if (progress.startTime === 0 && progress.foundClueIds.length === 0) return;
    saveProgress(progress);
  }, [story.id, foundClueIds, revealedCharacterIds, answeredQuestionIds, hintIndex, startTime, clearTime]);

  const retry = useCallback(() => {
    clearProgress(story.id);
    resetState();
    setShowStartScreen(true);
  }, [story.id, resetState]);

  const handleNewGame = useCallback(() => {
    clearProgress(story.id);
    resetState();
    setUserMenuOpen(false);
    setShowStartScreen(true);
  }, [story.id, resetState]);

  const handleShare = useCallback(() => {
    setUserMenuOpen(false);
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: story.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {});
    }
  }, [story.title]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // 시작 화면: 뒤로가기 + 대저택 이미지 + 타이틀(흔들림) + 사건 해결하기 + 하단 면책 문구
  if (showStartScreen && story.startScreenImage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
        <style>{`
          @keyframes titleShake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            15% { transform: translateX(-4px) rotate(-1deg); }
            30% { transform: translateX(3px) rotate(0.5deg); }
            45% { transform: translateX(-2px) rotate(-0.5deg); }
            60% { transform: translateX(2px) rotate(0.5deg); }
            75% { transform: translateX(-2px) rotate(-0.3deg); }
            90% { transform: translateX(1px) rotate(0.2deg); }
          }
        `}</style>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${story.startScreenImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* 상단: 뒤로가기 */}
        <div className="relative z-10 flex justify-start p-4">
          <Link
            href="/escape"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors"
            aria-label={t('backToList')}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            {t('backToList')}
          </Link>
        </div>

        {/* 중앙: 타이틀 + 버튼 */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-4 py-8 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ animation: 'titleShake 3s ease-in-out infinite' }}
          >
            {story.title}
          </h1>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                clearProgress(story.id);
                resetState();
                setShowStartScreen(false);
                setShowChapter0Modal(true);
                return;
              }
              const saved = loadProgress(story.id);
              const hasProgress = saved && ((saved.foundClueIds?.length ?? 0) > 0 || (saved.startTime ?? 0) > 0);
              if (hasProgress) {
                setShowContinueModal(true);
              } else {
                clearProgress(story.id);
                resetState();
                setShowStartScreen(false);
                setShowChapter0Modal(true);
              }
            }}
            className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg shadow-lg hover:scale-105 active:scale-100 transition-transform"
          >
            {t('startCase')}
          </button>
        </div>

        {/* 하단: 면책 문구 */}
        <p className="relative z-10 text-center text-xs text-white/80 pb-6 px-4">
          {t('startDisclaimer')}
        </p>

        {/* 이어하기 모달 (로그인 시 저장된 진행 있으면) */}
        <AnimatePresence>
          {showContinueModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50"
                onClick={() => setShowContinueModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5"
              >
                <p className="text-slate-800 dark:text-slate-100 font-semibold mb-4 text-center">
                  {t('continuePrompt')}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const saved = loadProgress(story.id);
                      if (saved) applySaved(saved);
                      setShowContinueModal(false);
                      setShowStartScreen(false);
                      setShowChapter0Modal(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold"
                  >
                    {t('continueYes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearProgress(story.id);
                      resetState();
                      setShowContinueModal(false);
                      setShowStartScreen(false);
                      setShowChapter0Modal(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    {t('continueNo')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* CHAPTER 0: 사건 진입 시 상황 설명 모달 (밝은 배경, 파란 버튼) */}
      <AnimatePresence>
        {showChapter0Modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ scale: 0.15, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: '50% 100%' }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-2xl max-h-[85vh] mx-4 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 px-5 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">
                  {t('chapter0Title')}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{t('chapter0Subtitle')}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm text-slate-600 leading-relaxed">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">[{t('chapter0OverviewTitle')}]</h3>
                  <p>{t('chapter0Overview')}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{t('chapter0VictimTitle')}</h3>
                  <p>{t('chapter0Victim')}</p>
                  <p className="mt-1">{t('chapter0Victim2')}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">[{t('chapter0SuspectsTitle')}]</h3>
                  <p className="mb-2">{t('chapter0SuspectsIntro')}</p>
                  <ul className="space-y-2 list-none pl-0">
                    <li className="pl-0">{t('chapter0Suspect1')}</li>
                    <li className="pl-0">{t('chapter0Suspect2')}</li>
                    <li className="pl-0">{t('chapter0Suspect3')}</li>
                    <li className="pl-0">{t('chapter0Suspect4')}</li>
                    <li className="pl-0">{t('chapter0Suspect5')}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">[{t('chapter0MissionTitle')}]</h3>
                  <p className="italic text-slate-700 mb-2">&quot;{t('chapter0MissionQuote')}&quot;</p>
                  <p className="mb-2">{t('chapter0MissionIntro')}</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>{t('chapter0Mission1')}</li>
                    <li>{t('chapter0Mission2')}</li>
                    <li>{t('chapter0Mission3')}</li>
                  </ul>
                </div>
                <p className="font-semibold text-slate-800 pt-2">{t('chapter0Closing')}</p>
                <div className="pt-3 mt-3 border-t border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-1 text-xs uppercase tracking-wide">[{t('chapter0SystemTitle')}]</h3>
                  <p className="text-slate-600">{t('chapter0SystemMessage')}</p>
                </div>
              </div>
              <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 bg-slate-50/80">
                <button
                  type="button"
                  onClick={() => {
                    setShowChapter0Modal(false);
                    setEntrySummaryShown(true);
                    if (startTime == null) setStartTime(Date.now());
                  }}
                  className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-base shadow-md transition-colors"
                >
                  {t('start')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top bar: back, title, story summary, progress, timer, audio */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/escape"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t('backToList')}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-sm font-bold truncate">{story.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StorySummary
            title={story.title}
            summary={story.summary}
            showOnEntry={false}
            onCloseEntry={() => {
              setEntrySummaryShown(true);
              if (startTime == null) setStartTime(Date.now());
            }}
          />
          <ProgressBar current={foundClueIds.length} total={story.clues.length} className="hidden sm:block" />
          <ClearTimeDisplay startTime={startTime} clearTime={clearTime} isCleared={isCleared} />
          <AudioToggle />
          <div className="relative flex items-center" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {(user.email ?? 'U')[0].toUpperCase()}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-slate-500 text-[18px]">expand_more</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-48 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          supabase.auth.signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        {t('signOut')}
                      </button>
                      <button
                        type="button"
                        onClick={handleNewGame}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        {t('newGame')}
                      </button>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        {t('share')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Floor plan or room interior */}
          <div className="lg:col-span-2">
            {rooms.length > 0 ? (
              currentRoomId == null ? (
                <FloorPlanView
                  rooms={rooms}
                  floorPlanImage={story.floorPlanImage}
                  onSelectRoom={(roomId) => {
                    if (roomId === 'living') setHasEnteredLivingRoom(true);
                    setCurrentRoomId(roomId);
                  }}
                  enabledRoomIds={
                    entrySummaryShown
                      ? hasReturnedFromBath
                        ? rooms.map((r) => r.id)
                        : hasEnteredLivingRoom
                          ? ['living', 'chairman_bath']
                          : ['living']
                      : []
                  }
                  className="w-full"
                />
              ) : currentRoom ? (
                <RoomView
                  room={currentRoom}
                  cluesInRoom={cluesInCurrentRoom}
                  foundClueIds={foundClueIds}
                  onClueFound={addClue}
                  onBack={() => {
                    if (currentRoomId === 'chairman_bath') setHasReturnedFromBath(true);
                    setCurrentRoomId(null);
                  }}
                  gatheringContent={
                    currentRoom.isGathering && story.livingRoomStatements?.length ? (
                      <LivingRoomPanel
                        characters={story.characters}
                        statements={story.livingRoomStatements}
                        selectedId={selectedLivingCharacterId}
                        onSelectCharacter={setSelectedLivingCharacterId}
                        followUpAnswers={
                          selectedLivingCharacterId && story.livingRoomFollowUps
                            ? (() => {
                                const followUps = story.livingRoomFollowUps!.find((f) => f.characterId === selectedLivingCharacterId);
                                if (!followUps) return [];
                                return answeredLivingFollowUps
                                  .filter((a) => a.characterId === selectedLivingCharacterId)
                                  .sort((a, b) => a.questionIndex - b.questionIndex)
                                  .map((a) => followUps.questions[a.questionIndex]);
                              })()
                            : []
                        }
                      />
                    ) : undefined
                  }
                  className="w-full"
                />
              ) : (
                <FloorPlanView
                  rooms={rooms}
                  floorPlanImage={story.floorPlanImage}
                  onSelectRoom={(roomId) => {
                    if (roomId === 'living') setHasEnteredLivingRoom(true);
                    setCurrentRoomId(roomId);
                  }}
                  enabledRoomIds={
                    entrySummaryShown
                      ? hasReturnedFromBath
                        ? rooms.map((r) => r.id)
                        : hasEnteredLivingRoom
                          ? ['living', 'chairman_bath']
                          : ['living']
                      : []
                  }
                  className="w-full"
                />
              )
            ) : (
              <CaseRoomBox
                story={story}
                foundClueIds={foundClueIds}
                onHotspotClick={addClue}
                className="w-full"
              />
            )}
          </div>

          {/* Right: Panels - tabs on mobile, stacked on desktop */}
          <div className="flex flex-col gap-3">
            {/* 탐정 메시지: 단서/등장인물과 동일 섹션 UI */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">psychology</span>
                  {t('detectiveMessageTitle')}
                </h3>
              </div>
              <div className="p-3">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currentRoomId === 'chairman_bath'
                    ? t('detectiveMessageBath')
                    : currentRoomId === 'son'
                      ? t('detectiveMessageSon')
                      : currentRoomId === 'living'
                        ? t('detectiveMessageLiving')
                        : currentRoomId == null && hasReturnedFromBath
                          ? t('detectiveMessageAfterBath')
                          : currentRoomId == null && hasEnteredLivingRoom
                            ? t('detectiveMessageAfterLiving')
                            : t('detectiveMessage1')}
                </p>
              </div>
            </section>
            <div className="lg:hidden">
              <EscapePanelTabs active={mobileTab} onSelect={setMobileTab} />
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              <ClueBox
                clues={story.clues}
                foundClueIds={foundClueIds}
                selectedClueId={selectedClueId}
                onSelectClue={setSelectedClueId}
              />
              <DialogueBox clue={selectedClue} characters={story.characters} />
              <CharacterBox
                characters={story.characters}
                revealedIds={revealedCharacterIds}
                clues={story.clues}
                foundClueIds={foundClueIds}
              />
              {/* 거실에서 용의자 알리바이 선택 시 → 탐정의 질문 (상호작용) */}
              {currentRoomId === 'living' && selectedLivingCharacterId && (() => {
                const followUps = story.livingRoomFollowUps?.find((f) => f.characterId === selectedLivingCharacterId);
                if (!followUps?.questions.length) return null;
                const answeredSet = new Set(
                  answeredLivingFollowUps
                    .filter((a) => a.characterId === selectedLivingCharacterId)
                    .map((a) => a.questionIndex)
                );
                return (
                  <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sky-500 text-[18px]">forum</span>
                        {t('interaction')}
                      </h3>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {followUps.questions.map((qa, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (answeredSet.has(i)) return;
                            setAnsweredLivingFollowUps((prev) => [...prev, { characterId: selectedLivingCharacterId, questionIndex: i }]);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            answeredSet.has(i)
                              ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800'
                          )}
                        >
                          {qa.question}
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })()}
            </div>
            <div className="lg:hidden">
              {mobileTab === 'clues' && (
                <>
                  <ClueBox
                    clues={story.clues}
                    foundClueIds={foundClueIds}
                    selectedClueId={selectedClueId}
                    onSelectClue={setSelectedClueId}
                  />
                  <DialogueBox clue={selectedClue} characters={story.characters} />
                </>
              )}
              {mobileTab === 'characters' && (
                <CharacterBox
                characters={story.characters}
                revealedIds={revealedCharacterIds}
                clues={story.clues}
                foundClueIds={foundClueIds}
              />
              )}
              {mobileTab === 'interaction' && (
                <>
                  {currentRoomId === 'living' && selectedLivingCharacterId && (() => {
                    const followUps = story.livingRoomFollowUps?.find((f) => f.characterId === selectedLivingCharacterId);
                    if (!followUps?.questions.length) return null;
                    const answeredSet = new Set(
                      answeredLivingFollowUps
                        .filter((a) => a.characterId === selectedLivingCharacterId)
                        .map((a) => a.questionIndex)
                    );
                    return (
                      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden mb-3">
                        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sky-500 text-[18px]">forum</span>
                            {t('interaction')}
                          </h3>
                        </div>
                        <div className="p-2 space-y-1.5">
                          {followUps.questions.map((qa, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                if (answeredSet.has(i)) return;
                                setAnsweredLivingFollowUps((prev) => [...prev, { characterId: selectedLivingCharacterId, questionIndex: i }]);
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                answeredSet.has(i)
                                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800'
                              )}
                            >
                              {qa.question}
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: progress bar */}
        <div className="mt-4 sm:hidden">
          <ProgressBar current={foundClueIds.length} total={story.clues.length} />
        </div>

        {/* Bottom actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CriminalSelectButton
            characters={story.characters}
            revealedIds={revealedCharacterIds}
            correctCriminalId={story.correctCriminalId}
            onSelect={handleCriminalSelect}
            disabled={isCleared}
          />
          <HintButton hints={story.hints} usedCount={hintIndex} onUse={() => setHintIndex((i) => i + 1)} />
          <button
            type="button"
            onClick={() => setShowChapter0Modal(true)}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-xl px-8 text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            {t('chapter0Replay')}
          </button>
          {wrongCriminal && (
            <span className="text-rose-600 dark:text-rose-400 text-sm font-medium animate-pulse">{t('wrong')}</span>
          )}
        </div>
      </main>

      {isCleared && startTime != null && clearTime != null && (
        <ClearResultScreen
          storyTitle={story.title}
          clearTimeMs={clearTime - startTime}
          onRetry={retry}
        />
      )}
    </div>
  );
}
