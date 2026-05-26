import ReportCard from '@/components/ui/ReportCard';
import type { InsightsResult, NextStepCategory } from '@/lib/types/insights-result';

type Props = { insightsResult: InsightsResult };

const CATEGORY_LABEL: Record<NextStepCategory, string> = {
  legal_structure:   'Estruturação jurídica',
  tax_optimization:  'Otimização tributária',
  beneficiary_review:'Revisão de beneficiários',
  documentation:     'Documentação',
};

const CATEGORY_COLOR: Record<NextStepCategory, string> = {
  legal_structure:   'border-blue-500/30 text-blue-400',
  tax_optimization:  'border-arbor-gain/30 text-arbor-gain',
  beneficiary_review:'border-purple-500/30 text-purple-400',
  documentation:     'border-arbor-subtle/30 text-arbor-subtle',
};

export default function Block4NextSteps({ insightsResult }: Props): JSX.Element {
  const { topicsToDiscuss } = insightsResult;
  return (
    <ReportCard number="04" title="Tópicos para Discussão">
      <div className="space-y-3">
        {topicsToDiscuss.map((item, i) => (
          <div key={item.title} className="rounded-xl border border-arbor-border bg-arbor-surface2 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-arbor-muted w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm font-medium text-arbor-text">{item.title}</span>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs ${CATEGORY_COLOR[item.category]}`}>
                {CATEGORY_LABEL[item.category]}
              </span>
            </div>
            <p className="ml-7 text-xs text-arbor-subtle leading-relaxed">{item.description}</p>
            {item.estimatedImpact && (
              <p className="ml-7 mt-2 text-xs text-arbor-gain font-medium">{item.estimatedImpact}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-arbor-muted italic">{insightsResult.llmDisclaimer}</p>
    </ReportCard>
  );
}
