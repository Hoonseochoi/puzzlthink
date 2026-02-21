import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | PUZZL THINK',
    description: 'Get in touch with the PUZZL THINK team. We welcome feedback, bug reports, and partnership inquiries.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922]">
            <main className="max-w-2xl mx-auto px-6 py-14">
                <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold mb-4">
                        Contact
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        We'd love to hear from you. Whether it's a bug report, feature request, or partnership inquiry,
                        drop us a message.
                    </p>
                </div>

                <div className="space-y-5 mb-12">
                    {[
                        {
                            icon: '✉️',
                            title: 'General Inquiries',
                            desc: 'Questions, feedback, and everything else.',
                            email: 'chlgnstj1@gmail.com',
                            color: 'border-blue-100 dark:border-blue-900',
                        },
                        {
                            icon: '🔒',
                            title: 'Privacy & Data',
                            desc: 'Data deletion requests, GDPR rights, privacy concerns.',
                            email: 'chlgnstj1@gmail.com',
                            color: 'border-emerald-100 dark:border-emerald-900',
                        },
                        {
                            icon: '🤝',
                            title: 'Business & Partnerships',
                            desc: 'Advertising, sponsorship, or collaboration opportunities.',
                            email: 'chlgnstj1@gmail.com',
                            color: 'border-amber-100 dark:border-amber-900',
                        },
                    ].map(item => (
                        <div key={item.title}
                            className={`bg-white dark:bg-[#15202b] rounded-2xl p-6 border ${item.color} shadow-sm flex items-start gap-4`}>
                            <span className="text-3xl shrink-0">{item.icon}</span>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.desc}</p>
                                <a
                                    href={`mailto:${item.email}`}
                                    className="text-sm font-semibold text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                                >
                                    {item.email}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        ⏱ We typically respond within <strong className="text-slate-700 dark:text-slate-300">1–3 business days</strong>.
                    </p>
                </div>
            </main>
        </div>
    );
}
