import type { InsightsResult, NextStep, NextStepCategory } from '@/lib/types/insights-result';
import ReportCard from '@/components/ui/ReportCard';
import {
  ScalesIcon,
  ChartDownIcon,
  UsersIcon,
  DocumentIcon,
} from '@/components/ui/Icons';

type Props = {
  insightsResult: InsightsResult;
};

const CATEGORY_META: Record<
  NextStepCategory,
  { label: string; Icon: (p: { className?: string }) => JSX.Element }
> = {
  legal_structure: { label: 'Estrutura jurídica', Icon: ScalesIcon },
  tax_optimization: { label: 'Otimização tributária', Icon: ChartDownIcon },
  beneficiary_review: { label: 'Revisão de beneficiários', Icon: UsersIcon },
  documentation: { label: 'Documentação', Icon: DocumentIcon },
};

export default function Block4NextSteps({ insightsResult }: Props): JSX.Element {
  const { topicsToDiscuss, llmDisclaimer } = insightsResult;

  return (
    <ReportCard number="04" title="Tópicos para discutir com assessoria jurídica e tributária">
      <p className="text-sm text-ink-muted">
        Itens para análise profissional, derivados do perfil patrimonial informado.
        Não constituem aconselhamento individualizado.
      </p>

      <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {topicsToDiscuss.map((step: NextStep, i) => {
          const meta = CATEGORY_META[step.category];
          const Icon = meta.Icon;
          return (
            <li
              key={i}
              className="flex gap-4 rounded-md border border-line bg-white p-4 transition hover:border-ink-subtle/50"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-canvas text-ink ring-1 ring-line">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                  <span className="rounded-sm border border-line bg-canvas px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-xs text-ink-muted">{llmDisclaimer}</p>
    </ReportCard>
  );
}
