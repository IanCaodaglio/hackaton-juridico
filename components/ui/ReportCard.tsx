type Props = {
  number: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
};

export default function ReportCard({
  number,
  title,
  eyebrow,
  children,
  className = '',
}: Props): JSX.Element {
  return (
    <section
      className={`rounded-lg border border-line bg-white p-6 shadow-card sm:p-8 ${className}`}
    >
      <header className="mb-6 flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-baseline gap-3">
          <span className="tabular text-xs font-medium uppercase tracking-widest text-ink-subtle">
            {number}
          </span>
          <h2 className="font-serif-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        {eyebrow && (
          <span className="text-xs uppercase tracking-wide text-ink-subtle">{eyebrow}</span>
        )}
      </header>
      {children}
    </section>
  );
}
