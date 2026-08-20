export function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-padding py-16 max-w-2xl mx-auto">
      <p className="eyebrow mb-2">Policies</p>
      <h1 className="text-3xl md:text-4xl mb-6">{title}</h1>
      <div className="bg-sand/60 border border-clay/30 text-sm text-ink/70 px-4 py-3 mb-10">
        This page contains professional placeholder content. Please have the business owner review and
        customise this wording — ideally with a lawyer — before publishing it live.
      </div>
      <div className="prose-sm space-y-5 text-ink/75 leading-relaxed text-sm">{children}</div>
    </div>
  );
}
