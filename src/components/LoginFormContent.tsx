"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

const POPUP_NAME = 'oauth';

export function LoginFormContent() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Login error:', error.message);
      return;
    }
    if (data?.url) {
      window.open(data.url, POPUP_NAME, 'width=500,height=600,scrollbars=yes,resizable=yes');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="PUZZL THINK Logo"
          width={160}
          height={40}
          className="h-9 w-auto"
        />
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            <span className="block text-blue-500 text-sm font-semibold mb-1">Welcome back to PUZZL THINK!</span>
            Sign in to continue
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 256 262">
            <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
            <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
            <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
            <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        Google account only.
      </p>
    </>
  );
}
