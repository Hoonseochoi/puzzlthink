import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | PUZZL THINK',
    description: 'Terms of Service for PUZZL THINK — the rules for using our Sudoku puzzle platform.',
};

export default function TermsPage() {
    const lastUpdated = 'February 22, 2025';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922]">
            <main className="max-w-3xl mx-auto px-6 py-14">
                <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Terms of Service</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
                </div>

                <div className="space-y-8 text-slate-700 dark:text-slate-300">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using <strong>PUZZL THINK</strong> at puzzlthink.com ("Service"), you agree to be bound by these
                            Terms of Service. If you do not agree, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Use of Service</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li>The Service is provided for personal, non-commercial use only.</li>
                            <li>You must be 13 years of age or older to create an account.</li>
                            <li>You agree not to abuse, hack, or attempt to manipulate the ranking system.</li>
                            <li>You are responsible for maintaining the security of your account credentials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. User Accounts</h2>
                        <p className="leading-relaxed">
                            When you create an account, you must provide accurate information. You are responsible for all activities
                            under your account. We reserve the right to suspend or terminate accounts that violate these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Ranking & Leaderboard</h2>
                        <p className="leading-relaxed">
                            Rankings are based on puzzle completion times. We reserve the right to remove any scores determined
                            to be achieved through automated tools, cheating, or exploitation of bugs.
                            Fair play is the foundation of our community.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Intellectual Property</h2>
                        <p className="leading-relaxed">
                            All content on PUZZL THINK — including the logo, design, and game engine — is the property of PUZZL THINK.
                            You may not reproduce, modify, or distribute any part of the Service without our prior written consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Advertising</h2>
                        <p className="leading-relaxed">
                            The Service may display advertisements served by Google AdSense and other third-party providers.
                            We are not responsible for the content of these advertisements.
                            Ad content is governed by the respective advertiser's policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Disclaimer of Warranties</h2>
                        <p className="leading-relaxed">
                            The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service
                            will be uninterrupted, error-free, or free of viruses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            To the maximum extent permitted by law, PUZZL THINK shall not be liable for any indirect, incidental,
                            special, or consequential damages arising from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Changes to Terms</h2>
                        <p className="leading-relaxed">
                            We reserve the right to modify these Terms at any time. Continued use of the Service after changes
                            constitutes your acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Contact</h2>
                        <p className="leading-relaxed">
                            Questions about these Terms? Contact us at{' '}
                            <a href="mailto:chlgnstj1@gmail.com" className="text-blue-500 hover:underline">chlgnstj1@gmail.com</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
