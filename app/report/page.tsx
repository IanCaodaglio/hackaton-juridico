'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Block1PatrimonialThermometer from '@/components/report/Block1_PatrimonialThermometer';
import Block2ScenarioComparison from '@/components/report/Block2_ScenarioComparison';
import Block3TaxWindowAlert from '@/components/report/Block3_TaxWindowAlert';
import Block4NextSteps from '@/components/report/Block4_NextSteps';
import { getStateName } from '@/lib/mocks/tax-window-alerts';
import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

const STORAGE_KEY = 'patrimonialReportData';

type ReportData = {
  profile: ClientProfile;
  calculationResult: CalculationResult;
  insightsResult: InsightsResult;
};

export default function ReportPage(): JSX.Element {
  const [data, setData] = useState<ReportData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      // TODO(etapa 3): type guard completo antes de confiar no shape.
      const parsed = JSON.parse(raw) as ReportData;
      setData(parsed);
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-sm text-ink-muted">
          Nenhum relatório carregado.{' '}
          <Link href="/" className="text-accent underline">Voltar ao formulário</Link>.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-sm text-ink-muted">Carregando relatório…</p>
      </main>
    );
  }

  const generatedAt = new Date(data.insightsResult.generatedAt);
  const generatedLabel = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(generatedAt);

  return (
    <div className="min-h-screen">
      {/* Header sticky institucional */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif-display text-lg font-semibold tracking-tight">
              Sucessio
            </span>
            <span className="text-xs text-ink-muted">
              Análise patrimonial · {getStateName(data.profile.state)} ·{' '}
              <span className="tabular">{generatedLabel}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-ink-subtle"
            >
              Exportar PDF
            </button>
            <Link
              href="/"
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:opacity-90"
            >
              Nova análise
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Banner jurídico obrigatório */}
        <div
          role="note"
          className="mb-8 flex items-start gap-3 rounded-md border border-line bg-white p-4 shadow-card"
          style={{ borderLeft: '3px solid var(--color-accent)' }}
        >
          <div className="text-sm leading-relaxed text-ink">
            <strong className="block text-xs font-semibold uppercase tracking-wide text-accent">
              Aviso jurídico
            </strong>
            <p className="mt-1 text-ink-muted">
              Esta análise é uma ferramenta de apoio ao planejamento, baseada em
              alíquotas referenciais da legislação estadual. Não constitui
              consultoria jurídica ou tributária. Os cenários apresentados devem
              ser validados com advogado e contador habilitados.
            </p>
          </div>
        </div>

        {/* Blocos */}
        <div className="space-y-8">
          <Block1PatrimonialThermometer
            calculationResult={data.calculationResult}
            profile={data.profile}
          />
          <Block2ScenarioComparison calculationResult={data.calculationResult} />
          <Block3TaxWindowAlert insightsResult={data.insightsResult} />
          <Block4NextSteps insightsResult={data.insightsResult} />
        </div>

        <footer className="mt-12 border-t border-line pt-6 text-xs text-ink-subtle">
          Sucessio · Plataforma de apoio ao planejamento patrimonial. As
          análises não são persistidas em nossos servidores.
        </footer>
      </main>
    </div>
  );
}
