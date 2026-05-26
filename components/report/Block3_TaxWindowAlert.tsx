import type { InsightsResult, UrgencyLevel } from '@/lib/types/insights-result';
import ReportCard from '@/components/ui/ReportCard';
import { AlertIcon } from '@/components/ui/Icons';

type Props = {
  insightsResult: InsightsResult;
};

const URGENCY_STYLES: Record<UrgencyLevel, { label: string; cls: string }> = {
  low: {
    label: 'Atenção baixa',
    cls: 'border-ink-subtle/30 text-ink-muted bg-white',
  },
  medium: {
    label: 'Atenção média',
    cls: 'border-amber-600/30 text-amber-800 bg-amber-50',
  },
  high: {
    label: 'Atenção alta',
    cls: 'border-loss/30 text-loss bg-red-50',
  },
};

export default function Block3TaxWindowAlert({ insightsResult }: Props): JSX.Element {
  const { taxWindow, llmDisclaimer } = insightsResult;
  const urgency = URGENCY_STYLES[taxWindow.urgencyLevel];
  const paragraphs = taxWindow.alertBody.split('\n\n').filter(Boolean);

  return (
    <ReportCard number="03" title="Janela tributária">
      <div className="rounded-md border border-amber-300/60 bg-amber-50/40 p-5">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-800 ring-1 ring-amber-300/60">
            <AlertIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-serif-display text-lg font-semibold text-ink">
                {taxWindow.alertTitle}
              </h3>
              <span
                className={`shrink-0 rounded-sm border px-2 py-0.5 text-xs font-medium ${urgency.cls}`}
              >
                {urgency.label}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
              {paragraphs.map((p, i) => (
                <p key={i} className="tabular">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">{llmDisclaimer}</p>
    </ReportCard>
  );
}
