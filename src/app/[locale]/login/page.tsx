"use client";

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
    const t = useTranslations('Landing');
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error('Login error:', error.message);
    };

    return (
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex min-h-screen items-center justify-center px-4 py-12 md:py-20">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                <div className="p-8">
                    {/* Logo / Home Link */}
                    <div className="flex flex-col items-center">
                        <Link
                            href="/"
                            aria-label="Go home"
                            className="inline-block hover:scale-105 transition-transform"
                        >
                            <Image
                                src="/logo.png"
                                alt="PUZZL THINK Logo"
                                width={180}
                                height={45}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <div className="mt-8 text-center">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                <span className="block text-blue-500 text-base font-bold mb-1">Welcome back to PUZZL THINK!</span>
                                Sign in to continue
                            </h1>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="mt-8 space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleGoogleLogin}
                            className="w-full h-14 rounded-2xl border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 256 262"
                            >
                                <path
                                    fill="#4285f4"
                                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                />
                                <path
                                    fill="#34a853"
                                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                />
                                <path
                                    fill="#fbbc05"
                                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                                />
                                <path
                                    fill="#eb4335"
                                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <span className="px-4 text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>

                    {/* Email Login */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="ml-1">
                                Email Address
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                placeholder="name@example.com"
                                className="shadow-sm focus:shadow-blue-500/10"
                            />
                        </div>

                        <Button className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-blue-500/30" size="lg">
                            <span className="mr-2">Continue</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Don’t have an account?{' '}
                        <Link href="#" className="text-blue-500 font-bold hover:underline transition-all">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
