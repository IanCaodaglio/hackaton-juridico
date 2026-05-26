type Props = {
  number: string;
  title:  string;
  children: React.ReactNode;
  className?: string;
};

export default function ReportCard({ number, title, children, className = '' }: Props): JSX.Element {
  return (
    <div className={`rounded-xl border border-arbor-border bg-arbor-surface overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-arbor-border px-6 py-4">
        <span className="font-mono text-xs font-medium text-arbor-accent">{number}</span>
        <h2 className="font-serif text-base font-semibold text-arbor-text">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
