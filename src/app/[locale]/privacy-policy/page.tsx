import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | PUZZL THINK',
    description: 'Privacy Policy for PUZZL THINK — how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'February 22, 2025';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922]">
            <main className="max-w-3xl mx-auto px-6 py-14">
                <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to <strong>PUZZL THINK</strong> ("we", "us", or "our"). We are committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                            <strong> puzzlthink.com</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Account Information:</strong> When you sign up, we collect your email address and display name.</li>
                            <li><strong>Game Data:</strong> Your game records (difficulty, completion time, board state) stored locally in your browser and optionally in our database.</li>
                            <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, and device information collected through anonymized analytics.</li>
                            <li><strong>Cookies:</strong> We use cookies to maintain session state and improve your experience. See Section 5 for details.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li>To provide, operate, and maintain the PUZZL THINK service.</li>
                            <li>To display global rankings and leaderboards.</li>
                            <li>To improve our website and user experience.</li>
                            <li>To send service-related emails (e.g., account confirmation).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Google AdSense & Third-Party Advertising</h2>
                        <p className="leading-relaxed mb-3">
                            We use <strong>Google AdSense</strong> to display advertisements. Google and its partners may use cookies
                            (including the DoubleClick cookie) to serve ads based on your prior visits to our website or other websites.
                        </p>
                        <p className="leading-relaxed mb-3">
                            You may opt out of personalized advertising by visiting{' '}
                            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:underline">
                                Google Ads Settings
                            </a>{' '}
                            or{' '}
                            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:underline">
                                www.aboutads.info
                            </a>.
                        </p>
                        <p className="leading-relaxed">
                            Google's use of advertising cookies is governed by{' '}
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:underline">
                                Google's Privacy Policy
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Cookies</h2>
                        <p className="leading-relaxed mb-3">
                            We use the following types of cookies:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Essential Cookies:</strong> Required for authentication and session management (Supabase).</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand traffic patterns (anonymized).</li>
                            <li><strong>Advertising Cookies:</strong> Set by Google AdSense to display relevant ads.</li>
                        </ul>
                        <p className="leading-relaxed mt-3">
                            You can control cookies through your browser settings. Disabling cookies may affect some functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Data Retention & Security</h2>
                        <p className="leading-relaxed">
                            We retain your personal data only for as long as necessary to provide our services. We implement
                            industry-standard security measures including SSL encryption and Supabase's Row Level Security to protect your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Children's Privacy</h2>
                        <p className="leading-relaxed">
                            PUZZL THINK is not directed at children under 13. We do not knowingly collect personal information
                            from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Your Rights</h2>
                        <p className="leading-relaxed">
                            Depending on your location, you may have rights to access, correct, or delete your personal data.
                            To exercise these rights, contact us at <a href="mailto:chlgnstj1@gmail.com" className="text-blue-500 hover:underline">chlgnstj1@gmail.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Changes to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page
                            with an updated revision date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Contact</h2>
                        <p className="leading-relaxed">
                            For privacy-related inquiries, contact us at:{' '}
                            <a href="mailto:chlgnstj1@gmail.com" className="text-blue-500 hover:underline">chlgnstj1@gmail.com</a>
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
