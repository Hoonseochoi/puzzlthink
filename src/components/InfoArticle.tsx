type Section = { title: string; body: string };

export default function InfoArticle({ eyebrow, title, subtitle, sections, accent = '#ff6b4a', children }: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  sections: Section[];
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f3f0e8] px-5 py-16">
      <article className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-[#f9f7f1] p-7 shadow-sm sm:p-12">
        <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: accent }}>{eyebrow}</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">{title}</h1>
        {subtitle && <p className="mt-2 text-xs text-black/40">{subtitle}</p>}
        {children}
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-extrabold">{section.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-black/60">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
