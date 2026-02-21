"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
    const t = useTranslations('Tutorial');
    const [step, setStep] = useState(0);

    const totalSteps = 5;

    const nextStep = () => {
        if (step < totalSteps - 1) setStep(s => s + 1);
        else onComplete();
    };

    const skip = () => onComplete();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-md p-4"
            >
                <motion.div
                    key={step}
                    initial={{ scale: 0.95, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: -10, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-10 max-w-sm w-full shadow-2xl relative overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col min-h-[400px]"
                >
                    {/* Step Content */}
                    <div className="text-center mb-8 relative z-10 flex-grow flex flex-col justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-blue-500/20">
                            <span className="material-symbols-outlined text-4xl">
                                {step === 0 && "psychology"}
                                {step === 1 && "open_with"}
                                {step === 2 && "dialpad"}
                                {step === 3 && "keyboard"}
                                {step === 4 && "sports_esports"}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`step${step}Title` as any)}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-base">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`step${step}Desc` as any)}
                        </p>
                    </div>

                    {/* Pagination & Controls */}
                    <div className="flex items-center justify-between mt-auto relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={skip}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold px-2 py-2 transition-colors active:scale-95"
                        >
                            {t('skip')}
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-500 shadow-md shadow-blue-500/40 scale-125' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            ))}
                        </div>

                        <button
                            onClick={nextStep}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                            {step === totalSteps - 1 ? t('finish') : t('next')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
