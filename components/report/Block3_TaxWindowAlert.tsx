import ReportCard from '@/components/ui/ReportCard';
import type { InsightsResult } from '@/lib/types/insights-result';
import { AlertTriangle } from '@/components/ui/Icons';

type Props = { insightsResult: InsightsResult };

const URGENCY_STYLE = {
  high:   'border-arbor-loss/40 bg-arbor-loss/10',
  medium: 'border-arbor-warn/40 bg-arbor-warn/10',
  low:    'border-arbor-border bg-arbor-surface2',
};

const URGENCY_ICON_STYLE = {
  high:   'text-arbor-loss',
  medium: 'text-arbor-warn',
  low:    'text-arbor-subtle',
};

const URGENCY_LABEL: Record<string, string> = {
  high: 'Alta urgência', medium: 'Urgência moderada', low: 'Baixa urgência',
};

export default function Block3TaxWindowAlert({ insightsResult }: Props): JSX.Element {
  const { taxWindow } = insightsResult;
  return (
    <ReportCard number="03" title="Janela Tributária">
      <div className={`rounded-xl border p-5 ${URGENCY_STYLE[taxWindow.urgencyLevel]}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${URGENCY_ICON_STYLE[taxWindow.urgencyLevel]}`} />
          <span className="text-sm font-medium text-arbor-text">{taxWindow.alertTitle}</span>
          <span className="ml-auto text-xs text-arbor-subtle">{URGENCY_LABEL[taxWindow.urgencyLevel]}</span>
        </div>
        <p className="text-sm text-arbor-subtle leading-relaxed whitespace-pre-line">{taxWindow.alertBody}</p>
      </div>
      <p className="mt-4 text-xs text-arbor-muted italic">{insightsResult.llmDisclaimer}</p>
    </ReportCard>
  );
}
